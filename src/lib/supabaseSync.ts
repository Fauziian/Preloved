import { supabase, isSupabaseConfigured } from './supabase';

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

// Fallback JSON-hosting API endpoint
const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'https://sherlypreloved.vercel.app/api/db';
    }
  }
  return '/api/db';
};

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
  return { products: [], chats: [], visitors: null };
}

async function saveDocument(doc: { products: any[]; chats: any[]; visitors?: any }) {
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
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('products').select('*');
      if (!error && data) return data as Product[];
      console.error("Supabase fetch products error:", error);
    } catch (e) {
      console.error(e);
    }
  }
  const doc = await fetchDocument();
  return (doc.products || []) as Product[];
}

export async function dbSaveProduct(p: Product): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('products').upsert(p);
      if (!error) return true;
      console.error("Supabase save product error:", error);
    } catch (e) {
      console.error(e);
    }
  }
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
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (!error) return true;
      console.error("Supabase delete product error:", error);
    } catch (e) {
      console.error(e);
    }
  }
  await queueWrite((doc) => {
    doc.products = (doc.products || []).filter((x: any) => x.id !== id);
    return doc;
  });
  return true;
}

// ─── Chats Sync ──────────────────────────────────────────────────────────────
export async function dbFetchChats(): Promise<ChatSession[] | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('chats').select('*');
      if (!error && data) return data as ChatSession[];
      console.error("Supabase fetch chats error:", error);
    } catch (e) {
      console.error(e);
    }
  }
  const doc = await fetchDocument();
  return (doc.chats || []) as ChatSession[];
}

export async function dbUpsertChatSession(sess: ChatSession): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      // First, fetch the existing session if it exists to merge messages
      const { data, error: fetchErr } = await supabase.from('chats').select('*').eq('sessionId', sess.sessionId).single();
      let msgs = sess.messages || [];
      if (!fetchErr && data && data.messages) {
        const existingMsgs = data.messages as ChatMsg[];
        msgs = [...existingMsgs];
        (sess.messages || []).forEach((m) => {
          if (!msgs.find((x) => x.id === m.id)) {
            msgs.push(m);
          }
        });
      }
      const { error } = await supabase.from('chats').upsert({
        sessionId: sess.sessionId,
        guestLabel: sess.guestLabel,
        messages: msgs,
        lastActivity: sess.lastActivity,
        unreadByAdmin: sess.unreadByAdmin
      });
      if (!error) return true;
      console.error("Supabase upsert chat session error:", error);
    } catch (e) {
      console.error(e);
    }
  }
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

export async function dbDeleteChat(sessionId: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('chats').delete().eq('sessionId', sessionId);
      if (!error) return true;
      console.error("Supabase delete chat error:", error);
    } catch (e) {
      console.error(e);
    }
  }
  await queueWrite((doc) => {
    doc.chats = (doc.chats || []).filter((x: any) => x.sessionId !== sessionId);
    return doc;
  });
  return true;
}


export async function dbSaveChatMessage(msg: ChatMsg, sessionId: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error: fetchErr } = await supabase.from('chats').select('*').eq('sessionId', sessionId).single();
      let msgs: ChatMsg[] = [];
      let guestLabel = `Guest #${sessionId.slice(-4)}`;
      let unreadByAdmin = 0;
      if (!fetchErr && data) {
        msgs = (data.messages as ChatMsg[]) || [];
        guestLabel = data.guestLabel || guestLabel;
        unreadByAdmin = data.unreadByAdmin || 0;
      }
      if (!msgs.find((m) => m.id === msg.id)) {
        msgs.push(msg);
      }
      if (msg.from === 'guest') {
        unreadByAdmin += 1;
      }
      const { error } = await supabase.from('chats').upsert({
        sessionId,
        guestLabel,
        messages: msgs,
        lastActivity: Date.now(),
        unreadByAdmin
      });
      if (!error) return true;
      console.error("Supabase save chat message error:", error);
    } catch (e) {
      console.error(e);
    }
  }
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

// Subscribe to realtime database changes for instant update
export function dbSubscribeRealtime(table: string, onEvent: () => void) {
  if (isSupabaseConfigured && supabase) {
    try {
      const channel = supabase.channel(`public:${table}`)
        .on('postgres_changes', { event: '*', schema: 'public', table }, () => {
          onEvent();
        })
        .subscribe();
      return () => {
        supabase.removeChannel(channel);
      };
    } catch (e) {
      console.error(e);
    }
  }
  
  const interval = setInterval(() => {
    onEvent();
  }, 4000);

  return () => {
    clearInterval(interval);
  };
}

// ─── Visitors Sync ───────────────────────────────────────────────────────────
export async function dbFetchVisitors(): Promise<any | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('visitors').select('*').single();
      if (!error && data) return data;
      console.error("Supabase fetch visitors error:", error);
    } catch (e) {
      console.error(e);
    }
  }
  const doc = await fetchDocument();
  return doc.visitors || null;
}

export async function dbSaveVisitors(visitors: any): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('visitors').upsert({ id: 'global', data: visitors });
      if (!error) return true;
      console.error("Supabase save visitors error:", error);
    } catch (e) {
      console.error(e);
    }
  }
  await queueWrite((doc) => {
    doc.visitors = visitors;
    return doc;
  });
  return true;
}

