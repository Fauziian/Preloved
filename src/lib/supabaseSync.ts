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

// ─── Products Sync ───────────────────────────────────────────────────────────
export async function dbFetchProducts(): Promise<Product[] | null> {
  try {
    const res = await fetch('/api/products');
    if (res.ok) {
      return await res.json() as Product[];
    }
  } catch (e) {
    console.error("Fetch products error:", e);
  }
  return [];
}

export async function dbSaveProduct(p: Product): Promise<boolean> {
  try {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(p)
    });
    return res.ok;
  } catch (e) {
    console.error("Save product error:", e);
    return false;
  }
}

export async function dbDeleteProduct(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/products/${id}`, {
      method: 'DELETE'
    });
    return res.ok;
  } catch (e) {
    console.error("Delete product error:", e);
    return false;
  }
}

// ─── Chats Sync ──────────────────────────────────────────────────────────────
export async function dbFetchChats(): Promise<ChatSession[] | null> {
  try {
    const res = await fetch('/api/chats');
    if (res.ok) {
      return await res.json() as ChatSession[];
    }
  } catch (e) {
    console.error("Fetch chats error:", e);
  }
  return [];
}

export async function dbUpsertChatSession(sess: ChatSession): Promise<boolean> {
  try {
    const res = await fetch('/api/chats', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(sess)
    });
    return res.ok;
  } catch (e) {
    console.error("Upsert chat session error:", e);
    return false;
  }
}

export async function dbDeleteChat(sessionId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/chats/${sessionId}`, {
      method: 'DELETE'
    });
    return res.ok;
  } catch (e) {
    console.error("Delete chat error:", e);
    return false;
  }
}

export async function dbSaveChatMessage(msg: ChatMsg, sessionId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/chats/${sessionId}/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(msg)
    });
    return res.ok;
  } catch (e) {
    console.error("Save chat message error:", e);
    return false;
  }
}

// Subscribe to realtime database changes (polling fallback for SQLite)
export function dbSubscribeRealtime(table: string, onEvent: () => void) {
  const interval = setInterval(() => {
    onEvent();
  }, 4000);

  return () => {
    clearInterval(interval);
  };
}

// ─── Visitors Sync ───────────────────────────────────────────────────────────
export async function dbFetchVisitors(): Promise<any | null> {
  try {
    const res = await fetch('/api/visitors');
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.error("Fetch visitors error:", e);
  }
  return null;
}

export async function dbSaveVisitors(visitors: any): Promise<boolean> {
  try {
    const res = await fetch('/api/visitors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(visitors)
    });
    return res.ok;
  } catch (e) {
    console.error("Save visitors error:", e);
    return false;
  }
}
