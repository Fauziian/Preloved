export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  description: string;
  condition: string;
  brand: string;
  category: string;
  stock: number;
  weight: string;
  material: string;
  tags: string[];
  status: "published" | "draft" | "sold-out";
  shopeeLink: string;
  photos: string[];
  variants: { name: string; options: string[] }[];
  createdAt: string;
}

export interface ChatMsg {
  id: string;
  from: "guest" | "admin";
  text: string;
  ts: number;
}

export interface ChatSession {
  sessionId: string;
  guestLabel: string;
  messages: ChatMsg[];
  lastActivity: number;
  unreadByAdmin: number;
}

// Dynamically determine the endpoint. If localhost, call the deployed Vercel API proxy
// to avoid CORS and lack of local serverless runner.
const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'https://sherlypreloved.vercel.app/api/db';
    }
  }
  return '/api/db';
};

export const isSupabaseConfigured = true;

const SEED_PRODUCTS = [
  { id: "1", name: "Sweater Rajut Pink Oversize", price: 85000, originalPrice: 320000, description: "Sweater rajut premium warna pink. Bahan lembut dan nyaman dipakai. Kondisi sangat terawat.", condition: "Sangat Baik", brand: "Unbranded", category: "Fashion Wanita", stock: 1, weight: "300g", material: "Rajut Akrilik", tags: ["sweater", "rajut", "pink"], status: "published", shopeeLink: "https://shopee.co.id/", photos: [], variants: [{ name: "Ukuran", options: ["M", "L"] }], createdAt: "2026-07-20" },
  { id: "2", name: "Crop Top Stripe Monochrome", price: 65000, originalPrice: 220000, description: "Crop top motif stripe hitam-putih trendi. Bahan stretch nyaman.", condition: "Baik", brand: "H&M", category: "Fashion Wanita", stock: 1, weight: "200g", material: "Cotton Stretch", tags: ["crop top", "stripe"], status: "published", shopeeLink: "https://shopee.co.id/", photos: [], variants: [{ name: "Ukuran", options: ["S", "M"] }], createdAt: "2026-07-21" },
  { id: "3", name: "Polo Crop Navy Premium", price: 75000, originalPrice: 280000, description: "Polo shirt crop warna navy elegan. Bahan berkualitas, terasa adem.", condition: "Sangat Baik", brand: "Uniqlo", category: "Fashion Wanita", stock: 1, weight: "250g", material: "Pique Cotton", tags: ["polo", "crop", "navy"], status: "published", shopeeLink: "https://shopee.co.id/", photos: [], variants: [{ name: "Ukuran", options: ["M"] }], createdAt: "2026-07-22" },
  { id: "4", name: "Blouse Ruffle Putih Elegan", price: 110000, originalPrice: 430000, description: "Blouse detail ruffle feminin dan elegan. Warna putih bersih, bahan ringan.", condition: "Sangat Baik", brand: "Zara", category: "Fashion Wanita", stock: 1, weight: "220g", material: "Chiffon", tags: ["blouse", "ruffle", "elegan"], status: "published", shopeeLink: "https://shopee.co.id/", photos: [], variants: [{ name: "Ukuran", options: ["S", "M"] }], createdAt: "2026-07-23" },
];

async function fetchDocument() {
  try {
    const res = await fetch(getApiUrl(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.error("Error reading from database:", err);
  }
  return { products: [], chats: [] };
}

async function saveDocument(doc: { products: any[]; chats: any[] }) {
  try {
    const res = await fetch(getApiUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(doc)
    });
    return res.ok;
  } catch (err) {
    console.error("Error writing to database:", err);
    return false;
  }
}

// Queue writes sequentially to avoid race conditions
let writeQueue = Promise.resolve();
async function queueWrite(operation: (doc: any) => any) {
  writeQueue = writeQueue.then(async () => {
    const doc = await fetchDocument();
    const updatedDoc = operation(doc);
    await saveDocument(updatedDoc);
  });
  return writeQueue;
}

// ─── Products Sync ───────────────────────────────────────────────────────────
export async function dbFetchProducts(): Promise<Product[] | null> {
  const doc = await fetchDocument();
  if (!doc.products || doc.products.length === 0) {
    await queueWrite((d) => {
      d.products = SEED_PRODUCTS;
      return d;
    });
    return SEED_PRODUCTS as Product[];
  }
  return doc.products as Product[];
}

export async function dbSaveProduct(p: Product): Promise<boolean> {
  await queueWrite((doc) => {
    const prods = doc.products || [];
    const idx = prods.findIndex((x: any) => x.id === p.id);
    if (idx >= 0) {
      prods[idx] = p;
    } else {
      prods.push(p);
    }
    doc.products = prods;
    return doc;
  });
  return true;
}

export async function dbDeleteProduct(id: string): Promise<boolean> {
  await queueWrite((doc) => {
    doc.products = (doc.products || []).filter((x: any) => x.id !== id);
    return doc;
  });
  return true;
}

// ─── Chats Sync ──────────────────────────────────────────────────────────────
export async function dbFetchChats(): Promise<ChatSession[] | null> {
  const doc = await fetchDocument();
  return (doc.chats || []) as ChatSession[];
}

export async function dbUpsertChatSession(sess: ChatSession): Promise<boolean> {
  await queueWrite((doc) => {
    const chats = doc.chats || [];
    const idx = chats.findIndex((x: any) => x.sessionId === sess.sessionId);
    if (idx >= 0) {
      chats[idx] = {
        ...chats[idx],
        guestLabel: sess.guestLabel,
        lastActivity: sess.lastActivity,
        unreadByAdmin: sess.unreadByAdmin
      };
    } else {
      chats.push(sess);
    }
    doc.chats = chats;
    return doc;
  });
  return true;
}

export async function dbSaveChatMessage(msg: ChatMsg, sessionId: string): Promise<boolean> {
  await queueWrite((doc) => {
    const chats = doc.chats || [];
    const idx = chats.findIndex((x: any) => x.sessionId === sessionId);
    if (idx >= 0) {
      const messages = chats[idx].messages || [];
      if (!messages.find((m: any) => m.id === msg.id)) {
        messages.push(msg);
      }
      chats[idx].messages = messages;
      chats[idx].lastActivity = Date.now();
    }
    doc.chats = chats;
    return doc;
  });
  return true;
}

// Subscribe to realtime database changes for instant update (polling fallback)
export function dbSubscribeRealtime(table: string, onEvent: () => void) {
  const interval = setInterval(() => {
    onEvent();
  }, 4000);

  return () => {
    clearInterval(interval);
  };
}
