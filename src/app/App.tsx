import { useState, useEffect, useRef, useCallback } from "react";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend,
} from "recharts";
import img2 from "@/imports/image-2.png";
import img3 from "@/imports/image-3.png";
import img4 from "@/imports/image-4.png";
import img5 from "@/imports/image-5.png";
import {
  Search, X, ChevronRight, ChevronLeft, Star, Instagram,
  ExternalLink, Menu, ShoppingBag, Heart, Sparkles, Tag,
  Shield, Package, Plus, Pencil, Trash2,
  LayoutDashboard, LogOut, Eye, EyeOff, Upload,
  Check, AlertCircle, Filter, ArrowUpRight, ArrowRight,
  Users, TrendingUp, Globe, Smartphone, Monitor, Tablet,
  ChevronDown, Activity, RefreshCw, Clock,
  Camera, CheckCircle2, Truck, MapPin, MessageCircle, Send,
} from "lucide-react";
import {
  recordVisit, recordProductView, loadVisitorData,
  getLast7Days, formatDateLabel, VisitorData,
  detectDevice, detectReferrer
} from "@/app/lib/tracker";
import {
  dbFetchProducts, dbSaveProduct, dbDeleteProduct,
  dbFetchChats, dbUpsertChatSession, dbSaveChatMessage,
  dbSubscribeRealtime, dbFetchVisitors, dbSaveVisitors,
  dbDeleteChat
} from "@/lib/supabaseSync";
import { Toaster, toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Variant { name: string; options: string[] }
interface Product {
  id: string; name: string; price: number; originalPrice: number;
  description: string; condition: string; brand: string; category: string;
  stock: number; weight: string; material: string; tags: string[];
  status: "published" | "draft" | "sold-out"; shopeeLink: string; photos: string[];
  variants: Variant[]; createdAt: string;
}
type Page = "catalog" | "detail" | "about" | "admin-login" | "admin-dashboard" | "admin-products" | "admin-add" | "admin-edit" | "admin-visitors" | "admin-chat";

// ─── Chat Types ───────────────────────────────────────────────────────────────
interface ChatMsg { id: string; from: "guest" | "admin"; text: string; ts: number; }
interface ChatSession { sessionId: string; guestLabel: string; messages: ChatMsg[]; lastActivity: number; unreadByAdmin: number; }
const CHAT_KEY = "sherly_chats";
const CHAT_SESSION_KEY = "sherly_chat_session";

function loadChats(): ChatSession[] {
  try {
    const r = localStorage.getItem(CHAT_KEY);
    if (r) {
      const chats = JSON.parse(r) as ChatSession[];
      const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000;
      const cleaned = chats.filter(c => c.lastActivity > threeDaysAgo);
      if (cleaned.length !== chats.length) {
        localStorage.setItem(CHAT_KEY, JSON.stringify(cleaned));
      }
      return cleaned;
    }
  } catch {}
  return [];
}

function saveChats(s: ChatSession[]) {
  const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000;
  const cleaned = s.filter(c => c.lastActivity > threeDaysAgo);
  localStorage.setItem(CHAT_KEY, JSON.stringify(cleaned));
}

function mergeMessages(local: ChatMsg[], remote: ChatMsg[]): ChatMsg[] {
  const map = new Map<string, ChatMsg>();
  (local || []).forEach(m => map.set(m.id, m));
  (remote || []).forEach(m => map.set(m.id, m));
  return Array.from(map.values()).sort((a, b) => a.ts - b.ts);
}

function mergeSessions(local: ChatSession[], remote: ChatSession[]): ChatSession[] {
  const map = new Map<string, ChatSession>();
  (local || []).forEach(s => map.set(s.sessionId, s));
  (remote || []).forEach(s => {
    const loc = map.get(s.sessionId);
    if (loc) {
      map.set(s.sessionId, {
        sessionId: s.sessionId,
        guestLabel: s.guestLabel || loc.guestLabel,
        messages: mergeMessages(loc.messages, s.messages),
        lastActivity: Math.max(s.lastActivity, loc.lastActivity),
        unreadByAdmin: s.lastActivity > loc.lastActivity ? s.unreadByAdmin : loc.unreadByAdmin
      });
    } else {
      map.set(s.sessionId, s);
    }
  });
  return Array.from(map.values());
}

function getOrCreateSession(): ChatSession {
  let sid = sessionStorage.getItem(CHAT_SESSION_KEY);
  const chats = loadChats();
  if (sid) { const ex = chats.find((c) => c.sessionId === sid); if (ex) return ex; }
  const num = Math.floor(1000 + Math.random() * 9000);
  sid = uid();
  sessionStorage.setItem(CHAT_SESSION_KEY, sid);
  const sess: ChatSession = { sessionId: sid, guestLabel: `Guest #${num}`, messages: [], lastActivity: Date.now(), unreadByAdmin: 0 };
  saveChats([...chats, sess]);
  return sess;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORIES = ["Semua", "Fashion Wanita", "Fashion Pria", "Tas", "Sepatu", "Aksesoris", "Elektronik", "Koleksi", "Beauty", "Rumah Tangga", "Lainnya"];
const CONDITIONS = ["Baru", "Bekas"];
const ADMIN_USER = "admin";
const ADMIN_PASS = "sherly2004";
const STORAGE_KEY = "sherly_products";
const PIE_COLORS = ["#ec4899", "#8b5cf6", "#6366f1", "#f59e0b", "#10b981", "#3b82f6"];

// ─── Seed products ────────────────────────────────────────────────────────────
const SEED: Product[] = [
  { id: "1", name: "Sweater Rajut Pink Oversize", price: 85000, originalPrice: 320000, description: "Sweater rajut premium warna pink. Bahan lembut dan nyaman dipakai. Kondisi sangat terawat.", condition: "Sangat Baik", brand: "Unbranded", category: "Fashion Wanita", stock: 1, weight: "300g", material: "Rajut Akrilik", tags: ["sweater", "rajut", "pink"], status: "published", shopeeLink: "https://shopee.co.id/", photos: [img2 as unknown as string], variants: [{ name: "Ukuran", options: ["M", "L"] }], createdAt: "2026-07-20" },
  { id: "2", name: "Crop Top Stripe Monochrome", price: 65000, originalPrice: 220000, description: "Crop top motif stripe hitam-putih trendi. Bahan stretch nyaman.", condition: "Baik", brand: "H&M", category: "Fashion Wanita", stock: 1, weight: "200g", material: "Cotton Stretch", tags: ["crop top", "stripe"], status: "published", shopeeLink: "https://shopee.co.id/", photos: [img3 as unknown as string], variants: [{ name: "Ukuran", options: ["S", "M"] }], createdAt: "2026-07-21" },
  { id: "3", name: "Polo Crop Navy Premium", price: 75000, originalPrice: 280000, description: "Polo shirt crop warna navy elegan. Bahan berkualitas, terasa adem.", condition: "Sangat Baik", brand: "Uniqlo", category: "Fashion Wanita", stock: 1, weight: "250g", material: "Pique Cotton", tags: ["polo", "crop", "navy"], status: "published", shopeeLink: "https://shopee.co.id/", photos: [img4 as unknown as string], variants: [{ name: "Ukuran", options: ["M"] }], createdAt: "2026-07-22" },
  { id: "4", name: "Blouse Ruffle Putih Elegan", price: 110000, originalPrice: 430000, description: "Blouse detail ruffle feminin dan elegan. Warna putih bersih, bahan ringan.", condition: "Sangat Baik", brand: "Zara", category: "Fashion Wanita", stock: 1, weight: "220g", material: "Chiffon", tags: ["blouse", "ruffle", "elegan"], status: "published", shopeeLink: "https://shopee.co.id/", photos: [img5 as unknown as string], variants: [{ name: "Ukuran", options: ["S", "M"] }], createdAt: "2026-07-23" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number) => "Rp " + n.toLocaleString("id-ID");
const disc = (ori: number, cur: number) => ori > cur ? Math.round(((ori - cur) / ori) * 100) : 0;
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2);
const loadProds = (): Product[] => { try { const r = localStorage.getItem(STORAGE_KEY); if (r) return JSON.parse(r); } catch {} localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED)); return SEED; };
const saveProds = (p: Product[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch (e) {
    console.error("Gagal menyimpan produk ke localStorage:", e);
  }
};

// ─── Photo renderer ───────────────────────────────────────────────────────────
function Photo({ src, alt, className }: { src: string; alt: string; className?: string }) {
  if (!src) return <div className={`bg-pink-50 flex items-center justify-center ${className}`}><Package size={24} className="text-pink-200" /></div>;
  if (src.startsWith("data:") || src.startsWith("http")) return <img src={src} alt={alt} className={className} />;
  return <ImageWithFallback src={src as never} alt={alt} className={className} />;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLIC SITE
// ═══════════════════════════════════════════════════════════════════════════════

function Navbar({ onNav, page }: { onNav: (p: Page) => void; page: Page }) {
  const [open, setOpen] = useState(false);
  const clickCount = useRef(0);
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLogoClick = () => {
    clickCount.current += 1;
    if (clickTimer.current) clearTimeout(clickTimer.current);
    if (clickCount.current >= 5) {
      clickCount.current = 0;
      onNav("admin-login");
      return;
    }
    clickTimer.current = setTimeout(() => { clickCount.current = 0; }, 1500);
    if (page !== "catalog") onNav("catalog");
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-pink-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between">
        <button onClick={handleLogoClick} className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center shadow-md shadow-pink-200">
            <Sparkles size={15} className="text-white" />
          </div>
          <span className="font-extrabold text-xl text-[#1a0a2e]" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
            Sherly<span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-600">Preloved</span>
          </span>
        </button>
        <div className="hidden md:flex items-center gap-6">
          {([["Katalog", "catalog"], ["Tentang", "about"]] as [string, Page][]).map(([l, p]) => (
            <button key={p} onClick={() => onNav(p)} className={`text-sm font-semibold transition-colors ${page === p ? "text-pink-600" : "text-gray-500 hover:text-pink-500"}`}>{l}</button>
          ))}
          <a href="https://s.shopee.co.id/gOm3vwsWI?share_channel_code=1" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-gradient-to-r from-orange-400 to-orange-500 text-white text-sm font-bold px-4 py-2 rounded-full hover:shadow-md hover:shadow-orange-200 transition-all">
            <ShoppingBag size={14} /> Shopee Kami
          </a>
        </div>
        <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
          {open ? <X size={20} className="text-pink-600" /> : <Menu size={20} className="text-pink-600" />}
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-pink-100 bg-white px-5 py-4 flex flex-col gap-3">
          {([["Katalog", "catalog"], ["Tentang", "about"]] as [string, Page][]).map(([l, p]) => (
            <button key={p} onClick={() => { onNav(p); setOpen(false); }} className="text-sm font-semibold text-gray-700 text-left">{l}</button>
          ))}
          <a href="https://s.shopee.co.id/gOm3vwsWI?share_channel_code=1" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 bg-orange-400 text-white text-sm font-bold px-4 py-2.5 rounded-full w-fit"><ShoppingBag size={14} /> Shopee Kami</a>
        </div>
      )}
    </nav>
  );
}

function ProductCard({ p, onClick }: { p: Product; onClick: () => void }) {
  const d = disc(p.originalPrice, p.price);
  const soldOut = p.status === "sold-out" || p.stock === 0;
  return (
    <div onClick={onClick} className={`group bg-white rounded-2xl overflow-hidden border transition-all duration-300 cursor-pointer ${soldOut ? "border-gray-200 opacity-80" : "border-pink-100 hover:border-pink-300 hover:shadow-2xl hover:shadow-pink-100"}`}>
      <div className="relative overflow-hidden bg-pink-50 aspect-[3/4]">
        <Photo src={p.photos[0]} alt={p.name} className={`w-full h-full object-cover transition-transform duration-500 ${soldOut ? "grayscale" : "group-hover:scale-105"}`} />
        {/* Sold Out diagonal overlay */}
        {soldOut && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.35)" }}>
            <span
              className="text-white font-extrabold tracking-widest select-none"
              style={{
                fontSize: "clamp(22px, 6vw, 36px)",
                fontStyle: "italic",
                transform: "rotate(-30deg)",
                textShadow: "0 2px 12px rgba(0,0,0,0.6)",
                letterSpacing: "0.12em",
                whiteSpace: "nowrap",
                textTransform: "uppercase",
              }}
            >
              Sold Out
            </span>
          </div>
        )}
        {!soldOut && d > 0 && <div className="absolute top-3 left-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full">-{d}%</div>}
        {!soldOut && (
          <div className="absolute top-3 right-3">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.condition === "Sangat Baik" || p.condition === "Baru" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>{p.condition}</span>
          </div>
        )}
        {!soldOut && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
            <div className="w-full px-4 pb-4">
              <div className="bg-white/95 backdrop-blur-sm text-pink-600 font-bold text-sm py-2.5 rounded-xl text-center flex items-center justify-center gap-2">
                <Eye size={14} /> Lihat Detail
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="p-4 space-y-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-semibold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">{p.category}</span>
          {p.brand && p.brand !== "Unbranded" && <span className="text-[10px] font-semibold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full">{p.brand}</span>}
          {soldOut && <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">Habis</span>}
        </div>
        <h3 className={`font-semibold text-sm leading-snug line-clamp-2 ${soldOut ? "text-gray-400" : "text-[#1a0a2e]"}`}>{p.name}</h3>
        <div>
          <p className={`text-base font-extrabold ${soldOut ? "text-gray-400 line-through" : "text-pink-600"}`}>{fmt(p.price)}</p>
          {!soldOut && p.originalPrice > p.price && <p className="text-xs text-gray-400 line-through">{fmt(p.originalPrice)}</p>}
        </div>
      </div>
    </div>
  );
}

function ProductDetail({ p, onBack }: { p: Product; onBack: () => void }) {
  const [activePhoto, setActivePhoto] = useState(0);
  const [selVariants, setSelVariants] = useState<Record<string, string>>({});
  const d = disc(p.originalPrice, p.price);
  return (
    <div className="max-w-6xl mx-auto px-5 py-10">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-500 hover:text-pink-600 font-semibold mb-8 transition-colors">
        <ChevronLeft size={16} /> Kembali ke Katalog
      </button>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-4">
          <div className="relative rounded-3xl overflow-hidden bg-pink-50 aspect-square">
            <Photo src={p.photos[activePhoto]} alt={p.name} className={`w-full h-full object-cover ${p.stock === 0 ? "grayscale" : ""}`} />
            {p.stock === 0 && (
              <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.38)" }}>
                <span
                  className="text-white font-extrabold tracking-widest select-none"
                  style={{
                    fontSize: "clamp(30px, 5vw, 56px)",
                    fontStyle: "italic",
                    transform: "rotate(-30deg)",
                    textShadow: "0 3px 18px rgba(0,0,0,0.7)",
                    letterSpacing: "0.14em",
                    whiteSpace: "nowrap",
                    textTransform: "uppercase",
                  }}
                >
                  Sold Out
                </span>
              </div>
            )}
            {p.stock > 0 && d > 0 && <div className="absolute top-5 left-5 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold px-3 py-1.5 rounded-full text-sm shadow-lg">HEMAT {d}%</div>}
          </div>
          {p.photos.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {p.photos.map((ph, i) => (
                <button key={i} onClick={() => setActivePhoto(i)} className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${activePhoto === i ? "border-pink-500 shadow-md" : "border-transparent opacity-60 hover:opacity-100"}`}>
                  <Photo src={ph} alt="" className={`w-full h-full object-cover ${p.stock === 0 ? "grayscale" : ""}`} />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="space-y-6">
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="text-xs font-semibold text-violet-600 bg-violet-50 px-3 py-1 rounded-full">{p.category}</span>
              {p.brand && <span className="text-xs font-semibold text-pink-600 bg-pink-50 px-3 py-1 rounded-full">{p.brand}</span>}
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${p.condition === "Sangat Baik" || p.condition === "Baru" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>{p.condition}</span>
            {(p.status === "sold-out" || p.stock === 0) && (
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-gray-800 text-white tracking-wide italic">Barang Habis</span>
              )}
            </div>
            <h1 className="text-2xl font-extrabold text-[#1a0a2e] leading-tight" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{p.name}</h1>
          </div>
          <div>
            <p className={`text-3xl font-extrabold ${(p.status === "sold-out" || p.stock === 0) ? "text-gray-400 line-through" : "text-pink-600"}`}>{fmt(p.price)}</p>
            {!(p.status === "sold-out" || p.stock === 0) && p.originalPrice > p.price && <p className="text-base text-gray-400 line-through mt-0.5">{fmt(p.originalPrice)}</p>}
          </div>
          {p.variants.map((v) => (
            <div key={v.name}>
              <p className="text-sm font-semibold text-[#1a0a2e] mb-2">{v.name}</p>
              <div className="flex flex-wrap gap-2">
                {v.options.map((opt) => (
                  <button key={opt} onClick={() => setSelVariants({ ...selVariants, [v.name]: opt })}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${selVariants[v.name] === opt ? "border-pink-500 bg-pink-50 text-pink-700" : "border-gray-200 text-gray-600 hover:border-pink-300"}`}>{opt}</button>
                ))}
              </div>
            </div>
          ))}
          <div className="grid grid-cols-2 gap-3 py-4 border-y border-pink-100">
            {[["Kondisi", p.condition], ["Stok", p.stock > 0 ? `${p.stock} pcs` : "Habis"], ["Berat", p.weight || "-"], ["Material", p.material || "-"]].map(([l, v]) => (
              <div key={l}><p className="text-xs text-gray-400 font-medium">{l}</p><p className="text-sm font-semibold text-[#1a0a2e]">{v}</p></div>
            ))}
          </div>
          {p.description && <div><p className="text-sm font-semibold text-[#1a0a2e] mb-2">Deskripsi</p><p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{p.description}</p></div>}
          {p.tags.length > 0 && <div className="flex flex-wrap gap-2">{p.tags.map((t) => <span key={t} className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">#{t}</span>)}</div>}
          {(p.status === "sold-out" || p.stock === 0) ? (
            <div className="flex flex-col items-center gap-2 w-full py-4 bg-gray-100 rounded-2xl text-center">
              <span className="text-lg font-extrabold text-gray-500 italic tracking-wide">Sold Out</span>
              <p className="text-xs text-gray-400">Stok sudah habis · Barang tidak tersedia</p>
            </div>
          ) : p.shopeeLink ? (
            <a href={p.shopeeLink} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full py-4 bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white font-extrabold rounded-2xl text-base transition-all hover:shadow-xl hover:shadow-orange-200 active:scale-[0.98]">
              <ShoppingBag size={20} /> Beli di Shopee <ExternalLink size={16} />
            </a>
          ) : (
            <div className="flex items-center gap-2 w-full py-4 bg-gray-100 text-gray-400 font-semibold rounded-2xl justify-center text-sm">
              <AlertCircle size={16} /> Link Shopee belum tersedia
            </div>
          )}
          <div className="flex items-center gap-3 text-xs text-gray-400 justify-center"><Shield size={12} /> Foto asli produk · Kondisi sesuai deskripsi</div>
        </div>
      </div>
    </div>
  );
}

function CatalogPage({ products, onDetail }: { products: Product[]; onDetail: (p: Product) => void }) {
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("Semua");
  const [cond, setCond] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const pub = products.filter((p) => p.status === "published" || p.status === "sold-out");
  const filtered = pub.filter((p) => {
    const q = search.toLowerCase();
    return (!q || p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.tags.some((t) => t.includes(q)))
      && (cat === "Semua" || p.category === cat)
      && (!cond || p.condition === cond)
      && (!maxPrice || p.price <= parseInt(maxPrice));
  });
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#fff7fb] via-white to-[#f5f0ff] py-20">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-pink-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-72 h-72 bg-violet-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-4xl mx-auto px-5 text-center relative">
          <div className="inline-flex items-center gap-2 bg-pink-100 text-pink-600 text-xs font-bold px-4 py-1.5 rounded-full mb-6">
            <Heart size={12} className="fill-pink-500" /> Official Preloved Store Indonesia
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-[#1a0a2e] leading-tight mb-5" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
            Temukan Preloved <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-violet-500 to-indigo-500">Berkualitas</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto mb-8 leading-relaxed">Barang pilihan, kondisi terawat, foto asli, dan langsung bisa dibeli melalui Shopee.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="#katalog" className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-violet-600 text-white font-bold px-7 py-3.5 rounded-full hover:shadow-xl hover:shadow-pink-200 transition-all"><Tag size={16} /> Lihat Koleksi</a>
            <a href="https://s.shopee.co.id/gOm3vwsWI?share_channel_code=1" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-400 to-orange-500 text-white font-bold px-7 py-3.5 rounded-full hover:shadow-xl hover:shadow-orange-200 transition-all"><ShoppingBag size={16} /> Belanja di Shopee</a>
          </div>
        </div>
        <div className="max-w-3xl mx-auto px-5 mt-14 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: <Camera size={15} className="text-pink-500" />, label: "Foto Asli Produk" },
            { icon: <CheckCircle2 size={15} className="text-green-500" />, label: "Kondisi Terawat" },
            { icon: <Shield size={15} className="text-violet-500" />, label: "Terpercaya" },
            { icon: <Truck size={15} className="text-blue-500" />, label: "Kirim via Shopee" },
          ].map(({ icon, label }) => (
            <div key={label} className="flex items-center gap-2.5 bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-sm border border-pink-100 text-sm font-semibold text-[#1a0a2e]">
              <div className="w-7 h-7 rounded-lg bg-pink-50 flex items-center justify-center flex-shrink-0">{icon}</div>
              {label}
            </div>
          ))}
        </div>
      </section>

      {/* Catalog */}
      <section id="katalog" className="max-w-7xl mx-auto px-5 py-14">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 flex items-center gap-2 bg-white border border-pink-200 rounded-2xl px-4 py-3 focus-within:border-pink-400 focus-within:shadow-md focus-within:shadow-pink-50 transition-all">
            <Search size={16} className="text-pink-400 flex-shrink-0" />
            <input type="text" placeholder="Cari nama, brand, atau tag..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 bg-transparent text-sm outline-none placeholder-pink-300" />
            {search && <button onClick={() => setSearch("")}><X size={14} className="text-pink-300" /></button>}
          </div>
          <button onClick={() => setShowFilter(!showFilter)} className={`flex items-center gap-2 px-5 py-3 rounded-2xl border font-semibold text-sm transition-all ${showFilter ? "bg-pink-600 text-white border-pink-600" : "bg-white border-pink-200 text-pink-600 hover:bg-pink-50"}`}>
            <Filter size={15} /> Filter
          </button>
        </div>
        {showFilter && (
          <div className="bg-white border border-pink-100 rounded-2xl p-6 mb-6 shadow-lg shadow-pink-50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">Kondisi</label>
                <div className="flex flex-wrap gap-2">
                  {["", ...CONDITIONS].map((c) => (
                    <button key={c} onClick={() => setCond(c)} className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${cond === c ? "bg-pink-600 text-white border-pink-600" : "border-gray-200 text-gray-600 hover:border-pink-300"}`}>{c || "Semua"}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">Harga Maksimal</label>
                <input type="number" placeholder="Contoh: 200000" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-pink-400 transition-colors" />
              </div>
              <div className="flex items-end">
                <button onClick={() => { setCond(""); setMaxPrice(""); setSearch(""); }} className="text-sm text-pink-600 font-semibold hover:underline">Reset Filter</button>
              </div>
            </div>
          </div>
        )}
        <div className="flex gap-2 flex-wrap mb-8">
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => setCat(c)} className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${cat === c ? "bg-gradient-to-r from-pink-500 to-violet-600 text-white shadow-md shadow-pink-200" : "bg-white text-gray-600 border border-pink-100 hover:border-pink-300 hover:bg-pink-50"}`}>{c}</button>
          ))}
        </div>
        <p className="text-sm text-gray-400 mb-6">{filtered.length} produk ditemukan</p>
        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filtered.map((p) => <ProductCard key={p.id} p={p} onClick={() => onDetail(p)} />)}
          </div>
        ) : (
          <div className="text-center py-24"><Package size={48} className="mx-auto mb-4 text-pink-200" /><p className="text-lg font-semibold text-gray-400">Produk tidak ditemukan</p></div>
        )}
      </section>

      {/* Testimonials */}
      <section className="bg-gradient-to-br from-[#fff7fb] to-[#f5f0ff] py-16">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-[#1a0a2e]" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Kata Mereka</h2>
            <p className="text-gray-500 mt-2">Pembeli yang sudah berbelanja di SherlyPreloved</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Anisa R.", loc: "Jakarta", text: "Barangnya sesuai foto dan deskripsi! Sweater pink masih bagus banget. Langsung checkout di Shopee, cepat!", prod: "Sweater Rajut Pink" },
              { name: "Bela S.", loc: "Bandung", text: "Suka banget sama blouse ruffle-nya, bahan premium banget. Foto asli, kondisi oke, harga terjangkau!", prod: "Blouse Ruffle Putih" },
              { name: "Citra D.", loc: "Surabaya", text: "Udah beli 3x dari SherlyPreloved, selalu puas! Admin responsif, barang dikemas rapi. Sangat recommended!", prod: "Berbagai Produk" },
            ].map((t) => (
              <div key={t.name} className="bg-white rounded-2xl p-6 border border-pink-100 shadow-sm space-y-3">
                <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={14} className="fill-amber-400 text-amber-400" />)}</div>
                <p className="text-sm text-gray-700 leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                <div className="pt-2 border-t border-pink-50">
                  <p className="text-sm font-bold text-[#1a0a2e]">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.loc} · {t.prod}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function AboutPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const faqs = [
    ["Apakah barang original?", "Ya, semua barang adalah preloved original dari berbagai brand lokal dan internasional. Kami menjamin keaslian setiap produk."],
    ["Apakah foto asli produk?", "Tentu! Semua foto di katalog ini adalah foto nyata barang kami. Apa yang kamu lihat adalah kondisi nyata produk."],
    ["Bagaimana cara membeli?", "Temukan produk yang kamu suka, klik 'Beli di Shopee' pada halaman detail, lalu lakukan pembelian langsung di Shopee."],
    ["Mengapa diarahkan ke Shopee?", "Semua transaksi dilakukan di Shopee untuk keamanan berbelanja, termasuk pembayaran, pengiriman, dan perlindungan pembeli."],
    ["Bagaimana pengiriman dilakukan?", "Pengiriman diproses sepenuhnya melalui Shopee dengan berbagai pilihan kurir. Kami mengemas barang dengan sangat hati-hati."],
    ["Bisakah melakukan negosiasi harga?", "Harga sudah sangat kompetitif. Untuk info lebih lanjut, hubungi kami melalui Shopee atau Instagram."],
  ];
  return (
    <div className="max-w-4xl mx-auto px-5 py-14 space-y-14">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 bg-pink-100 text-pink-600 text-xs font-bold px-4 py-1.5 rounded-full"><Heart size={12} className="fill-pink-500" /> Tentang Kami</div>
        <h1 className="text-4xl font-extrabold text-[#1a0a2e]" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>SherlyPreloved</h1>
        <p className="text-gray-500 max-w-xl mx-auto leading-relaxed">Toko preloved terpercaya yang menyediakan koleksi fashion berkualitas dengan harga terjangkau. Setiap produk dipilih dengan teliti untuk kondisi terbaik.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          { icon: <Camera size={24} className="text-pink-500" />, bg: "bg-pink-100", title: "Foto Asli", desc: "Semua foto adalah foto nyata produk, diambil langsung oleh kami." },
          { icon: <CheckCircle2 size={24} className="text-green-600" />, bg: "bg-green-100", title: "Barang Terawat", desc: "Setiap produk diseleksi ketat dan dipastikan dalam kondisi layak pakai." },
          { icon: <Shield size={24} className="text-violet-600" />, bg: "bg-violet-100", title: "Terpercaya", desc: "Transaksi aman melalui Shopee dengan sistem perlindungan pembeli resmi." },
        ].map(({ icon, bg, title, desc }) => (
          <div key={title} className="bg-gradient-to-br from-[#fff7fb] to-white border border-pink-100 rounded-2xl p-6 text-center space-y-3">
            <div className={`w-14 h-14 ${bg} rounded-2xl flex items-center justify-center mx-auto`}>{icon}</div>
            <h3 className="font-bold text-[#1a0a2e]">{title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
      <div>
        <h2 className="text-2xl font-extrabold text-[#1a0a2e] mb-6 text-center" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Pertanyaan Umum</h2>
        <div className="space-y-3">
          {faqs.map(([q, a], i) => (
            <div key={i} className="bg-white border border-pink-100 rounded-2xl overflow-hidden">
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between px-6 py-4 text-left font-semibold text-[#1a0a2e] hover:bg-pink-50 transition-colors">
                {q} <ChevronDown size={16} className={`text-pink-500 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
              </button>
              {openFaq === i && <div className="px-6 pb-4 text-sm text-gray-600 leading-relaxed border-t border-pink-50 pt-3">{a}</div>}
            </div>
          ))}
        </div>
      </div>
      <div className="bg-gradient-to-r from-pink-500 to-violet-600 rounded-3xl p-8 text-center text-white space-y-4">
        <h2 className="text-2xl font-extrabold" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Hubungi Kami</h2>
        <div className="flex flex-wrap justify-center gap-3">
          <a href="https://s.shopee.co.id/gOm3vwsWI?share_channel_code=1" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-semibold px-5 py-2.5 rounded-full text-sm transition-all"><ShoppingBag size={14} /> Shopee</a>
          <a href="https://www.instagram.com/shrlyagg/?utm_source=ig_web_button_share_sheet" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-semibold px-5 py-2.5 rounded-full text-sm transition-all"><Instagram size={14} /> Instagram</a>
        </div>
      </div>
    </div>
  );
}

function Footer({ onNav }: { onNav: (p: Page) => void }) {
  return (
    <footer className="bg-[#1a0a2e] text-white mt-auto">
      <div className="max-w-7xl mx-auto px-5 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center"><Sparkles size={14} className="text-white" /></div>
            <span className="font-extrabold text-lg" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>SherlyPreloved</span>
          </div>
          <p className="text-sm text-white/50 leading-relaxed">Official preloved store dengan koleksi pilihan berkualitas. Beli langsung via Shopee.</p>
          <div className="flex gap-3 pt-1">
            <a href="https://s.shopee.co.id/gOm3vwsWI?share_channel_code=1" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/10 hover:bg-orange-500 flex items-center justify-center transition-colors"><ShoppingBag size={15} /></a>
            <a href="https://www.instagram.com/shrlyagg/?utm_source=ig_web_button_share_sheet" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/10 hover:bg-pink-600 flex items-center justify-center transition-colors"><Instagram size={15} /></a>
          </div>
        </div>
        <div>
          <h4 className="font-bold text-sm mb-4">Navigasi</h4>
          <ul className="space-y-2">
            {([["Katalog Produk", "catalog"], ["Tentang Toko", "about"]] as [string, Page][]).map(([l, p]) => (
              <li key={p}><button onClick={() => onNav(p)} className="text-sm text-white/50 hover:text-white transition-colors">{l}</button></li>
            ))}
            <li><a href="https://s.shopee.co.id/gOm3vwsWI?share_channel_code=1" target="_blank" rel="noopener noreferrer" className="text-sm text-white/50 hover:text-orange-400 transition-colors flex items-center gap-1">Shopee <ExternalLink size={10} /></a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-sm mb-4">Info</h4>
          <ul className="space-y-2">
            <li className="flex items-center gap-2 text-sm text-white/50"><MapPin size={13} className="text-pink-400 flex-shrink-0" /> Sidoarjo, Indonesia</li>
            <li className="flex items-center gap-2 text-sm text-white/50"><MessageCircle size={13} className="text-green-400 flex-shrink-0" /> Respon cepat via Shopee</li>
            <li className="flex items-center gap-2 text-sm text-white/50"><Truck size={13} className="text-blue-400 flex-shrink-0" /> Pengiriman ke seluruh Indonesia</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 px-5 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2 text-xs text-white/30">
          <p>© 2026 SherlyPreloved. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN PANEL
// ═══════════════════════════════════════════════════════════════════════════════

function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setErr("");
    setTimeout(() => {
      if (user === ADMIN_USER && pass === ADMIN_PASS) onLogin();
      else setErr("Username atau password salah.");
      setLoading(false);
    }, 700);
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff7fb] via-white to-[#f5f0ff] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl shadow-pink-100 border border-pink-100 w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-pink-500 to-violet-600 px-8 py-10 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4"><Sparkles size={28} className="text-white" /></div>
          <h1 className="text-2xl font-extrabold text-white" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>SherlyPreloved</h1>
          <p className="text-white/70 text-sm mt-1">Admin Panel · Masuk untuk mengelola produk</p>
        </div>
        <form onSubmit={submit} className="p-8 space-y-5">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">Username</label>
            <input value={user} onChange={(e) => setUser(e.target.value)} required placeholder="admin"
              className="w-full px-4 py-3 bg-[#fdf7fb] border border-pink-200 rounded-xl text-sm outline-none focus:border-pink-400 transition-colors" />
          </div>
          <div className="relative">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">Password</label>
            <input type={show ? "text" : "password"} value={pass} onChange={(e) => setPass(e.target.value)} required placeholder="••••••••••"
              className="w-full px-4 py-3 bg-[#fdf7fb] border border-pink-200 rounded-xl text-sm outline-none focus:border-pink-400 transition-colors pr-12" />
            <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-9 text-pink-400">{show ? <EyeOff size={16} /> : <Eye size={16} />}</button>
          </div>
          {err && <p className="text-sm text-red-500 flex items-center gap-2 bg-red-50 px-3 py-2 rounded-xl"><AlertCircle size={14} /> {err}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-pink-500 to-violet-600 text-white font-bold rounded-xl transition-all hover:shadow-lg hover:shadow-pink-200 disabled:opacity-60 flex items-center justify-center gap-2 text-sm">
            {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><ArrowRight size={16} /> Masuk ke Admin Panel</>}
          </button>
        </form>
      </div>
    </div>
  );
}

function Sidebar({ page, onNav, onLogout, mobileOpen, onMobileClose }: {
  page: Page; onNav: (p: Page) => void; onLogout: () => void;
  mobileOpen?: boolean; onMobileClose?: () => void;
}) {
  const [unread, setUnread] = useState(0);
  useEffect(() => {
    const calc = () => setUnread(loadChats().reduce((s, c) => s + c.unreadByAdmin, 0));
    calc();
    const t = setInterval(calc, 2000);
    return () => clearInterval(t);
  }, []);

  const items: [string, React.ReactNode, Page, number][] = [
    ["Dashboard", <LayoutDashboard size={18} />, "admin-dashboard", 0],
    ["Produk", <Package size={18} />, "admin-products", 0],
    ["Pengunjung", <Users size={18} />, "admin-visitors", 0],
    ["Chat Tamu", <MessageCircle size={18} />, "admin-chat", unread],
  ];
  const isActive = (p: Page) => page === p || (p === "admin-products" && (page === "admin-add" || page === "admin-edit"));

  const handleNav = (p: Page) => { onNav(p); onMobileClose?.(); };

  const sidebarContent = (
    <aside className="w-64 bg-white border-r border-pink-100 flex flex-col h-full">
      <div className="p-5 border-b border-pink-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center"><Sparkles size={14} className="text-white" /></div>
          <span className="font-extrabold text-sm text-[#1a0a2e]" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>SherlyPreloved</span>
        </div>
        {/* Close button (mobile only) */}
        {onMobileClose && (
          <button onClick={onMobileClose} className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-pink-50 transition-colors">
            <X size={18} className="text-gray-500" />
          </button>
        )}
      </div>
      <div className="mt-2 px-5 pb-2">
        <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full uppercase tracking-wide">Admin</span>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {items.map(([label, icon, p, badge]) => (
          <button key={p} onClick={() => handleNav(p)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${isActive(p) ? "bg-gradient-to-r from-pink-500 to-violet-600 text-white shadow-sm" : "text-gray-600 hover:bg-pink-50 hover:text-pink-600"}`}>
            {icon} {label}
            {badge > 0 && <span className="ml-auto bg-pink-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">{badge > 9 ? "9+" : badge}</span>}
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-pink-100 space-y-2">
        <button onClick={() => handleNav("catalog")} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:bg-violet-50 hover:text-violet-600 transition-all">
          <Globe size={18} /> Lihat Website
        </button>
        <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all">
          <LogOut size={18} /> Keluar
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop: always visible */}
      <div className="hidden md:flex md:flex-col md:w-64 flex-shrink-0 min-h-screen">
        {sidebarContent}
      </div>
      {/* Mobile: overlay drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onMobileClose} />
          {/* Drawer */}
          <div className="relative z-10 h-full flex flex-col shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function AdminDashboard({ products, onNav, vd }: { products: Product[]; onNav: (p: Page) => void; vd: VisitorData }) {
  const get7DaysFromState = (vdState: VisitorData): DailyVisit[] => {
    const result: DailyVisit[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const found = (vdState.daily || []).find((x) => x.date === dateStr);
      result.push(found ?? { date: dateStr, visits: 0, pageViews: 0 });
    }
    return result;
  };

  const week = get7DaysFromState(vd);
  const published = products.filter((p) => p.status === "published").length;
  const draft = products.filter((p) => p.status === "draft").length;
  const topViewed = Object.entries(vd.productViews || {})
    .sort((a, b) => b[1] - a[1]).slice(0, 5)
    .map(([id, views]) => ({ id, views, prod: products.find((p) => p.id === id) }))
    .filter((x) => x.prod);

  const chartData = week.map((d) => ({ name: formatDateLabel(d.date), Kunjungan: d.visits, "Page Views": d.pageViews }));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1a0a2e]" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Selamat datang kembali, Admin Sherly!</p>
        </div>
        <button onClick={() => onNav("admin-add")} className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-violet-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:shadow-lg hover:shadow-pink-200 transition-all">
          <Plus size={16} /> Tambah Produk
        </button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Kunjungan", value: vd.totalVisits.toLocaleString("id-ID"), icon: <Users size={20} className="text-pink-600" />, sub: "pengunjung unik", bg: "bg-pink-50", trend: "+12%" },
          { label: "Page Views", value: vd.totalPageViews.toLocaleString("id-ID"), icon: <Eye size={20} className="text-violet-600" />, sub: "total halaman dilihat", bg: "bg-violet-50", trend: "+8%" },
          { label: "Produk Aktif", value: published, icon: <Package size={20} className="text-green-600" />, sub: `dari ${products.length} produk`, bg: "bg-green-50", trend: "" },
          { label: "Stok Habis", value: products.filter((p) => p.stock === 0).length, icon: <AlertCircle size={20} className="text-red-500" />, sub: "perlu restock", bg: "bg-red-50", trend: "" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-5 border border-pink-100 shadow-sm">
            <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>{s.icon}</div>
            <p className="text-2xl font-extrabold text-[#1a0a2e]">{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            {s.trend && <p className="text-xs text-green-600 font-semibold mt-1 flex items-center gap-0.5"><TrendingUp size={10} /> {s.trend} minggu ini</p>}
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl border border-pink-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-bold text-[#1a0a2e]">Grafik Kunjungan</h2>
            <p className="text-xs text-gray-400 mt-0.5">7 hari terakhir</p>
          </div>
          <button onClick={() => onNav("admin-visitors")} className="text-xs text-pink-600 font-semibold hover:underline flex items-center gap-1">Lihat Detail <ArrowUpRight size={12} /></button>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="gPink" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ec4899" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gViolet" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#fce7f3" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #fce7f3", fontSize: 12 }} />
            <Area type="monotone" dataKey="Kunjungan" stroke="#ec4899" strokeWidth={2} fill="url(#gPink)" />
            <Area type="monotone" dataKey="Page Views" stroke="#8b5cf6" strokeWidth={2} fill="url(#gViolet)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent products */}
        <div className="bg-white rounded-2xl border border-pink-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-pink-50">
            <h2 className="font-bold text-[#1a0a2e] text-sm">Produk Terbaru</h2>
            <button onClick={() => onNav("admin-products")} className="text-xs text-pink-600 font-semibold hover:underline flex items-center gap-1">Semua <ArrowUpRight size={12} /></button>
          </div>
          <div className="divide-y divide-pink-50">
            {products.slice(-4).reverse().map((p) => (
              <div key={p.id} className="flex items-center gap-3 px-5 py-3.5">
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-pink-50 flex-shrink-0">
                  <Photo src={p.photos[0]} alt={p.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1a0a2e] truncate">{p.name}</p>
                  <p className="text-xs text-gray-400">{fmt(p.price)}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0 ${p.status === "published" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                  {p.status === "published" ? "Aktif" : "Draft"}
                </span>
              </div>
            ))}
            {products.length === 0 && <p className="px-5 py-8 text-center text-sm text-gray-300">Belum ada produk</p>}
          </div>
        </div>

        {/* Top viewed products */}
        <div className="bg-white rounded-2xl border border-pink-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-pink-50">
            <h2 className="font-bold text-[#1a0a2e] text-sm">Produk Paling Dilihat</h2>
            <TrendingUp size={16} className="text-pink-400" />
          </div>
          <div className="divide-y divide-pink-50">
            {topViewed.length > 0 ? topViewed.map((x, i) => (
              <div key={x.id} className="flex items-center gap-3 px-5 py-3.5">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-pink-100 to-violet-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-extrabold text-violet-600">{i + 1}</span>
                </div>
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-pink-50 flex-shrink-0">
                  <Photo src={x.prod!.photos[0]} alt={x.prod!.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1a0a2e] truncate">{x.prod!.name}</p>
                </div>
                <span className="text-xs font-bold text-violet-600 bg-violet-50 px-2 py-1 rounded-full flex-shrink-0">{x.views}x</span>
              </div>
            )) : <p className="px-5 py-8 text-center text-sm text-gray-300">Belum ada data kunjungan produk</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

const getDeviceColor = (name: string) => {
  if (name === "Desktop") return "#ec4899"; // pink
  if (name === "Mobile") return "#8b5cf6";  // violet / purple
  if (name === "Tablet") return "#3b82f6";  // blue
  return "#9ca3af";                         // fallback gray
};

// ─── Visitor Analytics ────────────────────────────────────────────────────────
function AdminVisitors({ products, vd, setVd }: { products: Product[]; vd: VisitorData; setVd: React.Dispatch<React.SetStateAction<VisitorData>> }) {
  const get7DaysFromState = (vdState: VisitorData): DailyVisit[] => {
    const result: DailyVisit[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const found = (vdState.daily || []).find((x) => x.date === dateStr);
      result.push(found ?? { date: dateStr, visits: 0, pageViews: 0 });
    }
    return result;
  };

  const week = get7DaysFromState(vd);
  const chartData = week.map((d) => ({ name: formatDateLabel(d.date), Kunjungan: d.visits, "Page Views": d.pageViews }));

  const devicesObj: Record<string, number> = { Desktop: 0, Mobile: 0 };
  Object.entries(vd.devices || {}).forEach(([name, value]) => {
    devicesObj[name] = value;
  });
  const deviceData = Object.entries(devicesObj).map(([name, value]) => ({ name, value }));
  const hasDeviceData = Object.values(devicesObj).some((val) => val > 0);

  const refData = Object.entries(vd.referrers || {}).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }));
  const topProds = Object.entries(vd.productViews || {}).sort((a, b) => b[1] - a[1]).slice(0, 5)
    .map(([id, views]) => ({ id, views, prod: products.find((p) => p.id === id) })).filter((x) => x.prod);

  const totalToday = week[week.length - 1]?.visits ?? 0;
  const totalThisWeek = week.reduce((s, d) => s + d.visits, 0);

  const handleReset = async () => {
    if (confirm("Reset semua data pengunjung? Aksi ini tidak dapat dibatalkan.")) {
      const blank: VisitorData = { totalVisits: 0, totalPageViews: 0, daily: [], productViews: {}, referrers: {}, devices: {} };
      await dbSaveVisitors(blank);
      sessionStorage.removeItem("sherly_session_counted_db");
      sessionStorage.removeItem("sherly_session_counted");
      localStorage.setItem("sherly_visitors", JSON.stringify(blank));
      setVd(blank);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1a0a2e]" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Analitik Pengunjung</h1>
          <p className="text-gray-400 text-sm mt-1">Data pengunjung website SherlyPreloved</p>
        </div>
        <button onClick={handleReset} className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-red-500 border border-gray-200 hover:border-red-200 px-4 py-2 rounded-xl transition-all">
          <RefreshCw size={13} /> Reset Data
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Pengunjung", value: vd.totalVisits.toLocaleString("id-ID"), icon: <Users size={20} className="text-pink-600" />, bg: "bg-pink-50" },
          { label: "Total Page Views", value: vd.totalPageViews.toLocaleString("id-ID"), icon: <Eye size={20} className="text-violet-600" />, bg: "bg-violet-50" },
          { label: "Hari Ini", value: totalToday.toLocaleString("id-ID"), icon: <Clock size={20} className="text-blue-600" />, bg: "bg-blue-50" },
          { label: "Minggu Ini", value: totalThisWeek.toLocaleString("id-ID"), icon: <Activity size={20} className="text-green-600" />, bg: "bg-green-50" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-5 border border-pink-100 shadow-sm">
            <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>{s.icon}</div>
            <p className="text-2xl font-extrabold text-[#1a0a2e]">{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Traffic chart */}
      <div className="bg-white rounded-2xl border border-pink-100 shadow-sm p-6">
        <h2 className="font-bold text-[#1a0a2e] mb-1">Grafik Kunjungan 7 Hari Terakhir</h2>
        <p className="text-xs text-gray-400 mb-6">Jumlah pengunjung dan halaman yang dilihat per hari</p>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="gP" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ec4899" stopOpacity={0.2} /><stop offset="95%" stopColor="#ec4899" stopOpacity={0} /></linearGradient>
              <linearGradient id="gV" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} /><stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} /></linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#fce7f3" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #fce7f3", fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Area type="monotone" dataKey="Kunjungan" stroke="#ec4899" strokeWidth={2.5} fill="url(#gP)" dot={{ r: 4, fill: "#ec4899" }} />
            <Area type="monotone" dataKey="Page Views" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#gV)" dot={{ r: 4, fill: "#8b5cf6" }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Device breakdown */}
        <div className="bg-white rounded-2xl border border-pink-100 shadow-sm p-6">
          <h2 className="font-bold text-[#1a0a2e] mb-1 text-sm">Perangkat</h2>
          <p className="text-xs text-gray-400 mb-5">Jenis perangkat pengunjung</p>
          {hasDeviceData ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={deviceData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={4} dataKey="value">
                    {deviceData.map((d, i) => (
                      <Cell key={i} fill={getDeviceColor(d.name)} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [v, "Pengunjung"]} contentStyle={{ borderRadius: "10px", fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {deviceData.map((d) => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: getDeviceColor(d.name) }} />
                      <span className="font-medium text-gray-600">
                        {d.name === "Desktop" ? (
                          <><Monitor size={11} className="inline mr-1" />Desktop</>
                        ) : d.name === "Mobile" ? (
                          <><Smartphone size={11} className="inline mr-1" />Mobile</>
                        ) : d.name === "Tablet" ? (
                          <><Tablet size={11} className="inline mr-1" />Tablet</>
                        ) : (
                          d.name
                        )}
                      </span>
                    </div>
                    <span className="font-bold text-[#1a0a2e]">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : <div className="h-36 flex items-center justify-center text-sm text-gray-300">Belum ada data</div>}
        </div>

        {/* Traffic source */}
        <div className="bg-white rounded-2xl border border-pink-100 shadow-sm p-6">
          <h2 className="font-bold text-[#1a0a2e] mb-1 text-sm">Sumber Trafik</h2>
          <p className="text-xs text-gray-400 mb-5">Dari mana pengunjung datang</p>
          {refData.length > 0 ? (
            <div className="space-y-3 mt-2">
              {refData.map((r, i) => {
                const total = refData.reduce((s, x) => s + x.value, 0);
                const pct = Math.round((r.value / total) * 100);
                return (
                  <div key={r.name}>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-gray-600">{r.name}</span>
                      <span className="text-[#1a0a2e]">{r.value} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-pink-50 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : <div className="h-36 flex items-center justify-center text-sm text-gray-300">Belum ada data</div>}
        </div>

        {/* Top products viewed */}
        <div className="bg-white rounded-2xl border border-pink-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-pink-50">
            <h2 className="font-bold text-[#1a0a2e] text-sm">Produk Terpopuler</h2>
            <p className="text-xs text-gray-400 mt-0.5">Paling banyak dilihat pengunjung</p>
          </div>
          {topProds.length > 0 ? (
            <div className="divide-y divide-pink-50">
              {topProds.map((x, i) => (
                <div key={x.id} className="flex items-center gap-3 px-5 py-3.5">
                  <span className="w-5 text-center text-xs font-extrabold text-violet-400">{i + 1}</span>
                  <div className="w-9 h-9 rounded-xl overflow-hidden bg-pink-50 flex-shrink-0">
                    <Photo src={x.prod!.photos[0]} alt={x.prod!.name} className="w-full h-full object-cover" />
                  </div>
                  <p className="flex-1 text-xs font-semibold text-[#1a0a2e] truncate">{x.prod!.name}</p>
                  <span className="text-xs font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full flex-shrink-0">{x.views}x</span>
                </div>
              ))}
            </div>
          ) : <div className="px-5 py-10 text-center text-sm text-gray-300">Belum ada data kunjungan produk</div>}
        </div>
      </div>

      {/* Daily table */}
      <div className="bg-white rounded-2xl border border-pink-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-pink-50">
          <h2 className="font-bold text-[#1a0a2e]">Riwayat Kunjungan Harian</h2>
          <p className="text-xs text-gray-400 mt-0.5">7 hari terakhir (terbaru di atas)</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-pink-50/50">
              <tr>{["Tanggal", "Pengunjung", "Page Views", "Rata-rata PV/Pengunjung"].map((h) => <th key={h} className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wide">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-pink-50">
              {week.slice().reverse().map((d) => (
                <tr key={d.date} className="hover:bg-pink-50/30 transition-colors">
                  <td className="px-6 py-3.5 font-medium text-[#1a0a2e]">{formatDateLabel(d.date)} <span className="text-xs text-gray-400 ml-1">({d.date})</span></td>
                  <td className="px-6 py-3.5"><span className="font-bold text-pink-600">{d.visits}</span></td>
                  <td className="px-6 py-3.5"><span className="font-bold text-violet-600">{d.pageViews}</span></td>
                  <td className="px-6 py-3.5 text-gray-500">{d.visits > 0 ? (d.pageViews / d.visits).toFixed(1) : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Admin Products List ──────────────────────────────────────────────────────
function AdminProducts({ products, onAdd, onEdit, onDelete, onToggle }: {
  products: Product[]; onAdd: () => void; onEdit: (p: Product) => void;
  onDelete: (id: string) => void; onToggle: (id: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1a0a2e]" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Manajemen Produk</h1>
          <p className="text-gray-400 text-sm mt-1">{products.length} total produk · {products.filter(p => p.status === "published").length} aktif · {products.filter(p => p.status === "draft").length} draft</p>
        </div>
        <button onClick={onAdd} className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-violet-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:shadow-lg hover:shadow-pink-200 transition-all">
          <Plus size={16} /> Tambah Produk
        </button>
      </div>
      <div className="flex items-center gap-2 bg-white border border-pink-200 rounded-xl px-4 py-2.5 focus-within:border-pink-400 transition-all w-full max-w-sm">
        <Search size={15} className="text-pink-400" />
        <input type="text" placeholder="Cari produk atau kategori..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 bg-transparent text-sm outline-none" />
        {search && <button onClick={() => setSearch("")}><X size={13} className="text-gray-300" /></button>}
      </div>
      <div className="bg-white rounded-2xl border border-pink-100 shadow-sm overflow-hidden">
        <div className="hidden md:grid grid-cols-[56px_1fr_120px_100px_80px] gap-4 px-6 py-3 border-b border-pink-50 bg-pink-50/40 text-xs font-bold text-gray-400 uppercase tracking-wide">
          <span>Foto</span><span>Produk</span><span>Harga</span><span>Status</span><span>Aksi</span>
        </div>
        <div className="divide-y divide-pink-50">
          {filtered.map((p) => (
            <div key={p.id} className="flex flex-col md:grid md:grid-cols-[56px_1fr_120px_100px_80px] gap-3 md:gap-4 px-6 py-4 items-start md:items-center hover:bg-pink-50/20 transition-colors">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-pink-50 flex-shrink-0">
                <Photo src={p.photos[0]} alt={p.name} className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#1a0a2e] truncate">{p.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{p.category} · {p.brand} · Kondisi: {p.condition}</p>
                {p.shopeeLink && <p className="text-[10px] text-green-600 mt-0.5 flex items-center gap-0.5"><Check size={9} /> Ada link Shopee</p>}
              </div>
              <div>
                <p className="text-sm font-bold text-pink-600">{fmt(p.price)}</p>
                {p.originalPrice > p.price && <p className="text-xs text-gray-400 line-through">{fmt(p.originalPrice)}</p>}
              </div>
              <button onClick={() => onToggle(p.id)} className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all ${
                (p.status === "sold-out" || p.stock === 0) ? "bg-gray-200 text-gray-600" :
                p.status === "published" ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-amber-100 text-amber-700 hover:bg-amber-200"
              }`}>
                {(p.status === "sold-out" || p.stock === 0) ? "✕ Habis" : p.status === "published" ? "✓ Aktif" : "○ Draft"}
              </button>
              <div className="flex items-center gap-1.5">
                <button onClick={() => onEdit(p)} title="Edit" className="w-8 h-8 rounded-lg bg-violet-50 hover:bg-violet-100 flex items-center justify-center transition-colors"><Pencil size={14} className="text-violet-600" /></button>
                <button onClick={() => setConfirmId(p.id)} title="Hapus" className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors"><Trash2 size={14} className="text-red-500" /></button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="px-6 py-14 text-center">
              <Package size={32} className="mx-auto mb-3 text-pink-200" />
              <p className="text-sm text-gray-300">{products.length === 0 ? "Belum ada produk. Klik 'Tambah Produk' untuk memulai." : "Tidak ada produk yang cocok."}</p>
            </div>
          )}
        </div>
      </div>
      {confirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center space-y-4">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto"><Trash2 size={24} className="text-red-500" /></div>
            <h3 className="text-lg font-bold text-[#1a0a2e]">Hapus Produk?</h3>
            <p className="text-sm text-gray-500">Produk ini akan dihapus secara permanen.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmId(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">Batal</button>
              <button onClick={() => { onDelete(confirmId); setConfirmId(null); }} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition-colors">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── FormField (must be outside ProductForm to prevent keyboard loss on mobile) ─
function FormField({ label, children, req }: { label: string; children: React.ReactNode; req?: boolean }) {
  return (
    <div>
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">
        {label}{req && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

const FORM_INP = "w-full px-4 py-3 bg-[#fdf7fb] border border-pink-200 rounded-xl text-sm outline-none focus:border-pink-400 transition-colors";

// ─── Image Compression Helper ──────────────────────────────────────────────────
function compressImage(file: File, maxWidth = 800, maxHeight = 800, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = (err) => {
        reject(err);
      };
    };
    reader.onerror = (err) => {
      reject(err);
    };
  });
}

// ─── Product Form ─────────────────────────────────────────────────────────────
function ProductForm({ initial, onSave, onCancel }: { initial?: Product; onSave: (p: Product) => void; onCancel: () => void }) {
  const [form, setForm] = useState<Product>(initial ?? {
    id: uid(), name: "", price: 0, originalPrice: 0, description: "", condition: "Baru",
    brand: "", category: "Fashion Wanita", stock: 1, weight: "", material: "", tags: [],
    status: "published", shopeeLink: "", photos: [], variants: [], createdAt: new Date().toISOString().split("T")[0],
  });
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const up = useCallback(<K extends keyof Product>(k: K, v: Product[K]) => setForm((f) => ({ ...f, [k]: v })), []);

  const handlePhotos = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    setCompressing(true);
    const toastId = toast.loading("Memproses dan mengompres foto...");

    try {
      const compressedPhotos: string[] = [];
      for (const file of files) {
        const compressedBase64 = await compressImage(file);
        compressedPhotos.push(compressedBase64);
      }
      setForm((f) => ({ ...f, photos: [...f.photos, ...compressedPhotos] }));
      toast.success("Foto berhasil diproses!", { id: toastId });
    } catch (err) {
      console.error("Gagal memproses foto:", err);
      toast.error("Gagal memproses beberapa foto.", { id: toastId });
    } finally {
      setCompressing(false);
      if (e.target) e.target.value = "";
    }
  }, []);

  const handleName = useCallback((e: React.ChangeEvent<HTMLInputElement>) => up("name", e.target.value), [up]);
  const handlePrice = useCallback((e: React.ChangeEvent<HTMLInputElement>) => up("price", parseInt(e.target.value) || 0), [up]);
  const handleOriginalPrice = useCallback((e: React.ChangeEvent<HTMLInputElement>) => up("originalPrice", parseInt(e.target.value) || 0), [up]);
  const handleCondition = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => up("condition", e.target.value), [up]);
  const handleCategory = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => up("category", e.target.value), [up]);
  const handleBrand = useCallback((e: React.ChangeEvent<HTMLInputElement>) => up("brand", e.target.value), [up]);
  const handleStock = useCallback((e: React.ChangeEvent<HTMLInputElement>) => up("stock", parseInt(e.target.value) || 0), [up]);
  const handleWeight = useCallback((e: React.ChangeEvent<HTMLInputElement>) => up("weight", e.target.value), [up]);
  const handleMaterial = useCallback((e: React.ChangeEvent<HTMLInputElement>) => up("material", e.target.value), [up]);
  const handleDescription = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => up("description", e.target.value), [up]);
  const handleShopeeLink = useCallback((e: React.ChangeEvent<HTMLInputElement>) => up("shopeeLink", e.target.value), [up]);
  const handleTagInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setTagInput(e.target.value), []);

  const addTag = useCallback(() => {
    if (!tagInput.trim()) return;
    setForm((f) => ({ ...f, tags: [...f.tags, tagInput.trim().toLowerCase()] }));
    setTagInput("");
  }, [tagInput]);

  const addVariant = useCallback(() => setForm((f) => ({ ...f, variants: [...f.variants, { name: "", options: [] }] })), []);

  const removeVariant = useCallback((i: number) => setForm((f) => ({ ...f, variants: f.variants.filter((_, idx) => idx !== i) })), []);

  const upVName = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const i = parseInt(e.currentTarget.dataset.idx!);
    const name = e.target.value;
    setForm((f) => { const v = [...f.variants]; v[i] = { ...v[i], name }; return { ...f, variants: v }; });
  }, []);

  const upVOpts = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const i = parseInt(e.currentTarget.dataset.idx!);
    const opts = e.target.value.split(",").map((s) => s.trim()).filter(Boolean);
    setForm((f) => { const v = [...f.variants]; v[i] = { ...v[i], options: opts }; return { ...f, variants: v }; });
  }, []);

  const handleTagKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { e.preventDefault(); addTag(); }
  }, [addTag]);

  const submit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const hasPhotos = form.photos && form.photos.length >= 1;
    const hasName = form.name && form.name.trim() !== "";
    const hasPrice = form.price && form.price > 0;
    const hasCondition = form.condition && form.condition.trim() !== "";
    const hasCategory = form.category && form.category.trim() !== "";
    const hasBrand = form.brand && form.brand.trim() !== "";
    const hasStock = form.stock !== undefined && form.stock >= 0;
    const hasWeight = form.weight && form.weight.trim() !== "";
    const hasMaterial = form.material && form.material.trim() !== "";
    const hasDescription = form.description && form.description.trim() !== "";

    if (!hasPhotos) {
      toast.error("Harap unggah minimal 1 foto produk!");
      return;
    }
    if (!hasName || !hasPrice || !hasCondition || !hasCategory || !hasBrand || !hasStock || !hasWeight || !hasMaterial || !hasDescription) {
      toast.error("Harap lengkapi semua kolom wajib (*) yang bertanda bintang!");
      return;
    }

    setSaving(true);
    try {
      await onSave(form);
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyimpan produk.");
    } finally {
      setSaving(false);
    }
  }, [form, onSave]);

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onCancel} className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"><ChevronLeft size={16} className="text-gray-600" /></button>
        <h1 className="text-2xl font-extrabold text-[#1a0a2e]" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{initial ? "Edit Produk" : "Tambah Produk Baru"}</h1>
      </div>
      <form onSubmit={submit} className="space-y-5">
        {/* Photos */}
        <div className="bg-white rounded-2xl border border-pink-100 p-6 space-y-4">
          <h2 className="font-bold text-[#1a0a2e] flex items-center gap-2"><Camera size={16} className="text-pink-500" /> Foto Produk <span className="text-red-400 ml-1">*</span></h2>
          <div className="flex flex-wrap gap-3">
            {form.photos.map((ph, i) => (
              <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden border border-pink-200 group">
                <Photo src={ph} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => setForm((f) => ({ ...f, photos: f.photos.filter((_, idx) => idx !== i) }))}
                  className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full items-center justify-center hidden group-hover:flex">
                  <X size={10} className="text-white" />
                </button>
                {i === 0 && <span className="absolute bottom-1 left-1 text-[9px] bg-black/60 text-white px-1.5 py-0.5 rounded">Cover</span>}
              </div>
            ))}
            <button type="button" onClick={() => fileRef.current?.click()} disabled={compressing}
              className="w-24 h-24 rounded-xl border-2 border-dashed border-pink-300 flex flex-col items-center justify-center text-pink-400 hover:border-pink-500 hover:bg-pink-50 transition-all gap-1 disabled:opacity-60">
              {compressing ? (
                <div className="w-5 h-5 border-2 border-pink-500/30 border-t-pink-500 rounded-full animate-spin" />
              ) : (
                <>
                  <Upload size={18} />
                  <span className="text-[10px] font-semibold">Upload</span>
                </>
              )}
            </button>
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotos} disabled={compressing} />
          </div>
          <p className="text-xs text-gray-400">Foto pertama = cover. Upload minimal 1 foto. Foto asli sangat disarankan.</p>
        </div>

        {/* Info */}
        <div className="bg-white rounded-2xl border border-pink-100 p-6 space-y-4">
          <h2 className="font-bold text-[#1a0a2e] flex items-center gap-2"><AlertCircle size={16} className="text-violet-500" /> Informasi Produk</h2>
          <FormField label="Nama Produk" req><input value={form.name} onChange={handleName} placeholder="Cth: Sweater Rajut Pink Oversize" className={FORM_INP} /></FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Harga Jual" req><input type="number" min={0} value={form.price || ""} onChange={handlePrice} placeholder="85000" className={FORM_INP} /></FormField>
            <FormField label="Harga Coret (Opsional)"><input type="number" min={0} value={form.originalPrice || ""} onChange={handleOriginalPrice} placeholder="320000" className={FORM_INP} /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Kondisi" req><select value={form.condition} onChange={handleCondition} className={FORM_INP}>{CONDITIONS.map((c) => <option key={c}>{c}</option>)}</select></FormField>
            <FormField label="Kategori" req><select value={form.category} onChange={handleCategory} className={FORM_INP}>{CATEGORIES.filter((c) => c !== "Semua").map((c) => <option key={c}>{c}</option>)}</select></FormField>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <FormField label="Brand" req><input value={form.brand} onChange={handleBrand} placeholder="Zara, H&M..." className={FORM_INP} /></FormField>
            <FormField label="Stok (pcs)" req><input type="number" min={0} value={form.stock} onChange={handleStock} className={FORM_INP} /></FormField>
            <FormField label="Berat" req><input value={form.weight} onChange={handleWeight} placeholder="300g" className={FORM_INP} /></FormField>
          </div>
          <FormField label="Material" req><input value={form.material} onChange={handleMaterial} placeholder="Cotton, Chiffon, Rajut..." className={FORM_INP} /></FormField>
          <FormField label="Deskripsi Produk" req><textarea rows={4} value={form.description} onChange={handleDescription} placeholder="Deskripsikan produk secara lengkap dan jujur..." className={FORM_INP + " resize-none"} /></FormField>
          <FormField label="Link Shopee">
            <input value={form.shopeeLink} onChange={handleShopeeLink} placeholder="https://shopee.co.id/produk-anda-xxxx" className={FORM_INP} />
            <p className="text-xs text-gray-400 mt-1">Tombol "Beli di Shopee" hanya muncul jika link ini diisi</p>
          </FormField>
        </div>

        {/* Variants */}
        <div className="bg-white rounded-2xl border border-pink-100 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-[#1a0a2e] flex items-center gap-2"><Tag size={16} className="text-orange-500" /> Variasi Produk</h2>
            <button type="button" onClick={addVariant} className="flex items-center gap-1.5 text-xs font-semibold text-pink-600 bg-pink-50 hover:bg-pink-100 px-3 py-1.5 rounded-lg transition-colors"><Plus size={12} /> Tambah Variasi</button>
          </div>
          {form.variants.length === 0 && <p className="text-xs text-gray-400 bg-gray-50 rounded-xl p-3">Belum ada variasi. Contoh: Ukuran → S, M, L atau Warna → Pink, Putih, Hitam</p>}
          {form.variants.map((v, i) => (
            <div key={i} className="flex gap-3 items-center">
              <div className="flex-1 grid grid-cols-2 gap-3">
                <input data-idx={i} value={v.name} onChange={upVName} placeholder="Nama variasi (Ukuran)" className="px-3 py-2.5 bg-[#fdf7fb] border border-pink-200 rounded-xl text-sm outline-none focus:border-pink-400" />
                <input data-idx={i} value={v.options.join(", ")} onChange={upVOpts} placeholder="Opsi dipisah koma: S, M, L" className="px-3 py-2.5 bg-[#fdf7fb] border border-pink-200 rounded-xl text-sm outline-none focus:border-pink-400" />
              </div>
              <button type="button" onClick={() => removeVariant(i)} className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors flex-shrink-0"><X size={14} className="text-red-500" /></button>
            </div>
          ))}
        </div>

        {/* Tags */}
        <div className="bg-white rounded-2xl border border-pink-100 p-6 space-y-3">
          <h2 className="font-bold text-[#1a0a2e] flex items-center gap-2"><ChevronRight size={16} className="text-pink-400" /> Tag Produk</h2>
          <div className="flex gap-2">
            <input value={tagInput} onChange={handleTagInput} onKeyDown={handleTagKeyDown} placeholder="Ketik tag lalu Enter atau klik Tambah" className={FORM_INP} />
            <button type="button" onClick={addTag} className="px-4 py-2.5 bg-pink-100 hover:bg-pink-200 text-pink-600 font-semibold rounded-xl text-sm transition-colors whitespace-nowrap">+ Tambah</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {form.tags.map((t) => (
              <span key={t} className="flex items-center gap-1 text-xs bg-violet-100 text-violet-700 px-3 py-1 rounded-full font-semibold">#{t}<button type="button" onClick={() => up("tags", form.tags.filter((x) => x !== t))} className="ml-0.5"><X size={10} /></button></span>
            ))}
          </div>
        </div>

        {/* Status + Actions */}
        <div className="bg-white rounded-2xl border border-pink-100 p-5 flex flex-col md:flex-row flex-wrap items-start md:items-center justify-between gap-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">Status Produk</label>
            <div className="flex flex-wrap gap-2">
              {/* Aktif */}
              <button key="published" type="button" onClick={() => up("status", "published")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${form.status === "published" ? "bg-green-500 text-white shadow-sm" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                ✓ Aktif — Tampil di Katalog
              </button>
              {/* Draft */}
              <button key="draft" type="button" onClick={() => up("status", "draft")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${form.status === "draft" ? "bg-amber-500 text-white shadow-sm" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                ○ Draft — Tersembunyi
              </button>
              {/* Sold Out */}
              <button key="sold-out" type="button" onClick={() => up("status", "sold-out")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${form.status === "sold-out" ? "bg-gray-800 text-white shadow-sm" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                ✕ Habis / Sold Out
              </button>
            </div>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button type="button" onClick={onCancel} className="flex-1 md:flex-none px-4 py-2 border border-gray-200 rounded-full text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors">Batal</button>
            <button type="submit" disabled={saving}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2 bg-gradient-to-r from-pink-500 to-violet-600 text-white font-bold rounded-full hover:shadow-lg hover:shadow-pink-200 transition-all text-xs disabled:opacity-60">
              {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={14} />}
              {initial ? "Simpan Perubahan" : "Simpan Produk"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

async function syncVisitToDb() {
  try {
    const serverData = await dbFetchVisitors();
    
    // We only want to count a new session once per browser session
    const SESSION_KEY = "sherly_session_counted_db";
    const alreadyCountedDb = sessionStorage.getItem(SESSION_KEY);
    
    const data = serverData || {
      totalVisits: 0,
      totalPageViews: 0,
      daily: [],
      productViews: {},
      referrers: {},
      devices: {},
    };
    
    if (!alreadyCountedDb) {
      data.totalVisits = (data.totalVisits || 0) + 1;
      sessionStorage.setItem(SESSION_KEY, "1");
      
      // Device
      const dev = detectDevice();
      data.devices = data.devices || {};
      data.devices[dev] = (data.devices[dev] || 0) + 1;
      
      // Referrer
      const ref = detectReferrer();
      data.referrers = data.referrers || {};
      data.referrers[ref] = (data.referrers[ref] || 0) + 1;
    }
    
    // Always count page view
    data.totalPageViews = (data.totalPageViews || 0) + 1;
    
    // Daily entry
    const td = new Date().toISOString().split("T")[0];
    data.daily = data.daily || [];
    const existing = data.daily.find((d: any) => d.date === td);
    if (existing) {
      if (!alreadyCountedDb) existing.visits = (existing.visits || 0) + 1;
      existing.pageViews = (existing.pageViews || 0) + 1;
    } else {
      data.daily.push({ date: td, visits: alreadyCountedDb ? 0 : 1, pageViews: 1 });
    }
    
    // Keep last 30 days
    data.daily = data.daily.slice(-30);
    
    await dbSaveVisitors(data);
    
    // Also update our local storage to match the server so they are in sync
    localStorage.setItem("sherly_visitors", JSON.stringify(data));
  } catch (err) {
    console.error("Failed to sync visit to database:", err);
  }
}

async function syncProductViewToDb(productId: string) {
  try {
    const serverData = await dbFetchVisitors();
    const data = serverData || {
      totalVisits: 0,
      totalPageViews: 0,
      daily: [],
      productViews: {},
      referrers: {},
      devices: {},
    };
    data.productViews = data.productViews || {};
    data.productViews[productId] = (data.productViews[productId] || 0) + 1;
    await dbSaveVisitors(data);
    
    // Update local storage too
    localStorage.setItem("sherly_visitors", JSON.stringify(data));
  } catch (err) {
    console.error("Failed to sync product view to database:", err);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT APP
// ═══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [adminLoggedIn, setAdminLoggedIn] = useState(() => localStorage.getItem("sherly_admin_logged_in") === "true");
  const [page, setPage] = useState<Page>(() => {
    const saved = sessionStorage.getItem("sherly_current_page") as Page;
    if (saved) {
      if (saved.startsWith("admin") && !adminLoggedIn && saved !== "admin-login") {
        const logged = localStorage.getItem("sherly_admin_logged_in") === "true";
        if (!logged) return "catalog";
      }
      return saved;
    }
    return "catalog";
  });
  const [products, setProducts] = useState<Product[]>(loadProds);
  const [detailProd, setDetailProd] = useState<Product | null>(null);
  const [editProd, setEditProd] = useState<Product | null>(null);
  const [vd, setVd] = useState<VisitorData>(loadVisitorData);

  // Sync page state
  useEffect(() => {
    sessionStorage.setItem("sherly_current_page", page);
  }, [page]);

  // Sync admin login state
  useEffect(() => {
    if (adminLoggedIn) {
      localStorage.setItem("sherly_admin_logged_in", "true");
    } else {
      localStorage.removeItem("sherly_admin_logged_in");
    }
  }, [adminLoggedIn]);

  // Track visit on first load and sync with db
  useEffect(() => {
    recordVisit();
    syncVisitToDb().then(() => {
      dbFetchVisitors().then((latest) => {
        if (latest) {
          setVd(latest);
          localStorage.setItem("sherly_visitors", JSON.stringify(latest));
        }
      });
    });
  }, []);

  // Fetch initial products and visitor data from database on load
  useEffect(() => {
    async function initDb() {
      const dbProds = await dbFetchProducts();
      if (dbProds) {
        setProducts(dbProds);
        saveProds(dbProds);
      }
      const dbVisitors = await dbFetchVisitors();
      if (dbVisitors) {
        setVd(dbVisitors);
        localStorage.setItem("sherly_visitors", JSON.stringify(dbVisitors));
      }
    }
    initDb();
  }, []);

  // Poll visitor data every 15 seconds if admin is logged in
  useEffect(() => {
    if (!adminLoggedIn) return;
    const fetchLatest = () => {
      dbFetchVisitors().then((latest) => {
        if (latest) {
          setVd(latest);
          localStorage.setItem("sherly_visitors", JSON.stringify(latest));
        }
      });
    };
    fetchLatest();
    const interval = setInterval(fetchLatest, 15000);
    return () => clearInterval(interval);
  }, [adminLoggedIn]);

  const nav = (p: Page) => {
    if (p.startsWith("admin") && !adminLoggedIn && p !== "admin-login") { setPage("admin-login"); return; }
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goDetail = (p: Product) => {
    setDetailProd(p);
    recordProductView(p.id);
    setPage("detail");
    window.scrollTo({ top: 0 });
    syncProductViewToDb(p.id).then(() => {
      dbFetchVisitors().then((latest) => {
        if (latest) {
          setVd(latest);
          localStorage.setItem("sherly_visitors", JSON.stringify(latest));
        }
      });
    });
  };

  const handleSave = async (p: Product) => {
    const isEdit = !!editProd;
    const toastId = toast.loading(isEdit ? "Menyimpan perubahan..." : "Menambahkan produk baru...");

    // Optimistic UI update with functional state to avoid closure bugs
    setProducts((prev) => {
      const next = prev.find((x) => x.id === p.id) ? prev.map((x) => x.id === p.id ? p : x) : [...prev, p];
      saveProds(next);
      return next;
    });
    
    try {
      // Save to database
      const success = await dbSaveProduct(p as any);
      if (success) {
        toast.success(isEdit ? "Produk berhasil diperbarui!" : "Produk berhasil ditambahkan!", { id: toastId });
      } else {
        toast.error("Gagal menyimpan ke cloud, disimpan secara lokal.", { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyimpan ke cloud (Timeout/Error).", { id: toastId });
    }

    nav("admin-products"); 
    setEditProd(null);
  };

  const isAdmin = page.startsWith("admin") && page !== "admin-login";

  const [mobileSidebar, setMobileSidebar] = useState(false);

  if (page === "admin-login") {
    return <AdminLogin onLogin={() => { setAdminLoggedIn(true); setPage("admin-dashboard"); }} />;
  }

  // Page label for mobile header
  const pageLabels: Partial<Record<Page, string>> = {
    "admin-dashboard": "Dashboard",
    "admin-products": "Produk",
    "admin-add": "Tambah Produk",
    "admin-edit": "Edit Produk",
    "admin-visitors": "Pengunjung",
    "admin-chat": "Chat Tamu",
  };

  if (isAdmin) {
    return (
      <div className="min-h-screen bg-[#fdf7fb] flex flex-col" style={{ fontFamily: "'Poppins',sans-serif" }}>
        <Toaster position="top-center" richColors />
        <AdminChatWidget />
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-pink-100 sticky top-0 z-40 shadow-sm">
          <button
            onClick={() => setMobileSidebar(true)}
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center shadow-md"
          >
            <Menu size={18} className="text-white" />
          </button>
          <div className="flex items-center gap-2 flex-1">
            <span className="font-extrabold text-sm text-[#1a0a2e]" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
              Sherly<span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-600">Preloved</span>
            </span>
            <span className="text-xs text-gray-400">·</span>
            <span className="text-xs font-semibold text-gray-500">{pageLabels[page] ?? "Admin"}</span>
          </div>
          <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Admin</span>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          <Sidebar
            page={page}
            onNav={nav}
            onLogout={() => { setAdminLoggedIn(false); nav("catalog"); }}
            mobileOpen={mobileSidebar}
            onMobileClose={() => setMobileSidebar(false)}
          />
          <main className="flex-1 p-4 md:p-8 overflow-y-auto">
            {page === "admin-dashboard" && <AdminDashboard products={products} onNav={nav} vd={vd} />}
            {page === "admin-products" && (
              <AdminProducts products={products} onAdd={() => nav("admin-add")}
                onEdit={(p) => { setEditProd(p); nav("admin-edit"); }}
                onDelete={async (id) => {
                  const toastId = toast.loading("Menghapus produk...");
                  setProducts((prev) => {
                    const next = prev.filter((p) => p.id !== id);
                    saveProds(next);
                    return next;
                  });
                  try {
                    const success = await dbDeleteProduct(id);
                    if (success) {
                      toast.success("Produk berhasil dihapus!", { id: toastId });
                    } else {
                      toast.error("Gagal menghapus dari cloud.", { id: toastId });
                    }
                  } catch (e) {
                    toast.error("Gagal menghapus dari cloud.", { id: toastId });
                  }
                }}
                onToggle={async (id) => {
                  const toastId = toast.loading("Mengubah status produk...");
                  setProducts((prev) => {
                    const next = prev.map((p) => p.id === id ? { ...p, status: p.status === "published" ? "draft" : "published" } : p);
                    saveProds(next);
                    const target = next.find((p) => p.id === id);
                    if (target) {
                      dbSaveProduct(target as any).then((success) => {
                        if (success) {
                          toast.success("Status produk berhasil diubah!", { id: toastId });
                        } else {
                          toast.error("Gagal memperbarui status di cloud.", { id: toastId });
                        }
                      }).catch(() => {
                        toast.error("Gagal memperbarui status di cloud.", { id: toastId });
                      });
                    }
                    return next;
                  });
                }} />
            )}
            {page === "admin-add" && <ProductForm onSave={handleSave} onCancel={() => nav("admin-products")} />}
            {page === "admin-edit" && editProd && <ProductForm initial={editProd} onSave={handleSave} onCancel={() => nav("admin-products")} />}
            {page === "admin-visitors" && <AdminVisitors products={products} vd={vd} setVd={setVd} />}
            {page === "admin-chat" && <AdminChat />}
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ fontFamily: "'Poppins',sans-serif" }}>
      <Toaster position="top-center" richColors />
      <Navbar onNav={nav} page={page} />
      <main className="flex-1">
        {page === "catalog" && <CatalogPage products={products} onDetail={goDetail} />}
        {page === "detail" && detailProd && <ProductDetail p={detailProd} onBack={() => { setDetailProd(null); setPage("catalog"); }} />}
        {page === "about" && <AboutPage />}
      </main>
      <Footer onNav={nav} />
      <GuestChatWidget />
    </div>
  );
}

// ─── Guest Chat Widget (public, no login) ─────────────────────────────────────
function GuestChatWidget() {
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState<ChatSession | null>(null);
  const [msgs, setMsgs] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [guestName, setGuestName] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const [hasNewAdmin, setHasNewAdmin] = useState(false);

  // Init session
  useEffect(() => {
    const s = getOrCreateSession();
    setSession(s);
    setMsgs(s.messages);
  }, []);

  // Sync messages with Supabase (real-time + fallback)
  const refresh = useCallback(async () => {
    if (!session) return;
    const dbSessions = await dbFetchChats();
    const chats = loadChats();
    
    if (dbSessions) {
      const mergedChats = mergeSessions(chats, dbSessions);
      saveChats(mergedChats);
      
      const updated = mergedChats.find((c) => c.sessionId === session.sessionId);
      if (updated) {
        const prevLen = msgs.length;
        setMsgs(updated.messages);
        if (updated.messages.length > prevLen && updated.messages[updated.messages.length - 1]?.from === "admin") {
          setHasNewAdmin(true);
        }
      }
    } else {
      // LocalStorage Fallback
      const updated = chats.find((c) => c.sessionId === session.sessionId);
      if (updated) {
        const prevLen = msgs.length;
        setMsgs([...updated.messages]);
        if (updated.messages.length > prevLen && updated.messages[updated.messages.length - 1]?.from === "admin") {
          setHasNewAdmin(true);
        }
      }
    }
  }, [session, msgs.length]);

  useEffect(() => {
    if (!session) return;
    refresh();

    // Subscribe to realtime database chat_messages changes
    const unsub = dbSubscribeRealtime("chat_messages", refresh);
    
    // Slow backup polling
    const t = setInterval(refresh, 4000);
    return () => {
      unsub();
      clearInterval(t);
    };
  }, [session, refresh]);

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  // Clear notification when opened
  useEffect(() => { if (open) setHasNewAdmin(false); }, [open]);

  const send = async () => {
    if (!input.trim() || !session) return;
    const msg: ChatMsg = { id: uid(), from: "guest", text: input.trim(), ts: Date.now() };
    
    // Update locally
    const chats = loadChats();
    const idx = chats.findIndex((c) => c.sessionId === session.sessionId);
    const newMsgs = [...(idx >= 0 ? chats[idx].messages : []), msg];
    const updated: ChatSession = { 
      ...(idx >= 0 ? chats[idx] : session), 
      messages: newMsgs, 
      lastActivity: Date.now(), 
      unreadByAdmin: (idx >= 0 ? chats[idx].unreadByAdmin : 0) + 1 
    };
    if (idx >= 0) chats[idx] = updated; else chats.push(updated);
    saveChats(chats);
    setMsgs(newMsgs);
    setInput("");

    // Sync with database asynchronously (no await to prevent UI latency)
    dbSaveChatMessage(msg, session.sessionId);
    dbUpsertChatSession(updated);
  };

  const submitName = async () => {
    if (!guestName.trim() || !session) return;
    const cleanName = guestName.trim();
    const updated: ChatSession = { ...session, guestLabel: cleanName, lastActivity: Date.now() };
    
    setSession(updated);
    
    const chats = loadChats();
    const idx = chats.findIndex((c) => c.sessionId === session.sessionId);
    if (idx >= 0) chats[idx] = updated; else chats.push(updated);
    saveChats(chats);

    // Sync with database
    await dbUpsertChatSession(updated);
  };

  const timeStr = (ts: number) => new Date(ts).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

  const isGuestDefault = !session || session.guestLabel.startsWith("Guest #");

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[340px] rounded-2xl shadow-2xl border border-pink-100 overflow-hidden flex flex-col bg-white" style={{ maxHeight: "520px" }}>
          {isGuestDefault ? (
            /* Prompt Name Screen */
            <>
              <div className="bg-gradient-to-r from-pink-500 to-violet-600 px-4 py-4 flex items-center gap-3 shrink-0">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                  <Sparkles size={16} className="text-white" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-white font-bold text-sm">Mulai Chat</p>
                  <p className="text-white/80 text-[11px]">Silakan masukkan nama Anda</p>
                </div>
                <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white transition-colors"><X size={18} /></button>
              </div>
              <div className="flex-1 p-6 flex flex-col justify-center gap-4 bg-[#fdf7fb]">
                <div className="space-y-2 text-left">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Cth: Rifqi Fauzi"
                    className="w-full px-4 py-3 bg-white border border-pink-200 rounded-xl text-sm outline-none focus:border-pink-400 transition-colors"
                    onKeyDown={(e) => e.key === "Enter" && submitName()}
                  />
                </div>
                <button
                  onClick={submitName}
                  disabled={!guestName.trim()}
                  className="w-full py-3 bg-gradient-to-r from-pink-500 to-violet-600 text-white font-bold rounded-xl transition-all hover:shadow-lg hover:shadow-pink-200 disabled:opacity-60 text-sm"
                >
                  Mulai Percakapan
                </button>
              </div>
            </>
          ) : (
            /* Chat Interface */
            <>
              {/* Header */}
              <div className="bg-gradient-to-r from-pink-500 to-violet-600 px-4 py-3 flex items-center gap-3 shrink-0">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                  <Sparkles size={16} className="text-white" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-white font-bold text-sm">SherlyPreloved</p>
                  <p className="text-white/70 text-[11px] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-300 inline-block" />
                    Online · siap membantu
                  </p>
                </div>
                <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white transition-colors"><X size={18} /></button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto bg-[#f7f0fb] px-4 py-3 space-y-3" style={{ minHeight: 0 }}>
                {/* Welcome bubble */}
                <div className="flex gap-2 items-end">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-400 to-violet-500 flex items-center justify-center shrink-0">
                    <Sparkles size={10} className="text-white" />
                  </div>
                  <div className="bg-white rounded-2xl rounded-bl-sm px-3 py-2 shadow-sm max-w-[80%] text-left">
                    <p className="text-xs text-[#1a0a2e] leading-relaxed">Halo! Selamat datang di <span className="font-semibold text-pink-500">SherlyPreloved</span>. Ada yang ingin kamu tanyakan tentang produk kami?</p>
                    <p className="text-[10px] text-gray-400 mt-0.5 text-right">Admin</p>
                  </div>
                </div>
                {msgs.map((m) => (
                  <div key={m.id} className={`flex gap-2 items-end ${m.from === "guest" ? "flex-row-reverse" : ""}`}>
                    {m.from === "admin" && (
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-400 to-violet-500 flex items-center justify-center shrink-0">
                        <Sparkles size={10} className="text-white" />
                      </div>
                    )}
                    <div className={`rounded-2xl px-3 py-2 shadow-sm max-w-[78%] text-left ${m.from === "guest" ? "bg-gradient-to-br from-pink-500 to-violet-600 text-white rounded-br-sm" : "bg-white text-[#1a0a2e] rounded-bl-sm"}`}>
                      <p className="text-xs leading-relaxed">{m.text}</p>
                      <p className={`text-[10px] mt-0.5 ${m.from === "guest" ? "text-white/60 text-right" : "text-gray-400 text-right"}`}>{timeStr(m.ts)}</p>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              {/* Identity label */}
              <div className="bg-white/80 border-t border-pink-100 px-4 py-1 text-[10px] text-gray-400 text-center">
                Anda terhubung sebagai <span className="font-semibold text-pink-400">{session.guestLabel}</span>
              </div>

              {/* Input */}
              <div className="bg-white border-t border-pink-100 px-3 py-3 flex gap-2 shrink-0">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
                  placeholder="Tulis pesan..."
                  className="flex-1 text-sm bg-[#fdf7fb] border border-pink-200 rounded-xl px-3 py-2 outline-none focus:border-pink-400 transition-colors"
                />
                <button
                  onClick={send}
                  disabled={!input.trim()}
                  className="w-9 h-9 bg-gradient-to-br from-pink-500 to-violet-600 rounded-xl flex items-center justify-center disabled:opacity-40 hover:shadow-md transition-all shrink-0"
                >
                  <Send size={15} className="text-white" />
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-pink-500 to-violet-600 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center justify-center"
        aria-label="Chat dengan admin"
      >
        {open ? <X size={22} className="text-white" /> : <MessageCircle size={22} className="text-white" />}
        {!open && hasNewAdmin && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse" />
        )}
      </button>
    </>
  );
}

// ─── Admin Chat Session Item Component with Hold-and-Swipe Gesture ──────────
function SessionItem({ 
  session, 
  isActive,
  onSelect, 
  onDelete, 
  relTime 
}: { 
  session: ChatSession; 
  isActive?: boolean;
  onSelect: () => void; 
  onDelete: () => void; 
  relTime: (ts: number) => string;
}) {
  const [dragOffset, setDragOffset] = useState(0);
  const [isHoldActive, setIsHoldActive] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  
  const startXRef = useRef(0);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isLongPressedRef = useRef(false);
  const dragOffsetRef = useRef(0);

  const lastMsg = session.messages[session.messages.length - 1];
  const hasUnread = session.unreadByAdmin > 0;

  const handleStart = (clientX: number) => {
    startXRef.current = clientX;
    isLongPressedRef.current = false;
    dragOffsetRef.current = 0;
    setDragOffset(0);
    setIsHoldActive(false);
    setHoldProgress(0);

    const holdDuration = 1500; // 1.5 seconds hold
    const intervalTime = 50;
    let elapsed = 0;

    progressIntervalRef.current = setInterval(() => {
      elapsed += intervalTime;
      const pct = Math.min((elapsed / holdDuration) * 100, 100);
      setHoldProgress(pct);
    }, intervalTime);

    holdTimerRef.current = setTimeout(() => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      isLongPressedRef.current = true;
      setIsHoldActive(true);
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, holdDuration);
  };

  const handleMove = (clientX: number) => {
    if (!isLongPressedRef.current) {
      if (Math.abs(clientX - startXRef.current) > 10) {
        cancelHold();
      }
      return;
    }
    const diff = clientX - startXRef.current;
    if (diff > 0) {
      dragOffsetRef.current = diff;
      setDragOffset(diff);
    }
  };

  const handleEnd = () => {
    cancelHold();
    if (isLongPressedRef.current) {
      if (dragOffsetRef.current > 130) {
        onDelete();
      } else {
        setDragOffset(0);
      }
    } else {
      onSelect();
    }
  };

  const cancelHold = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    setIsHoldActive(false);
    setHoldProgress(0);
  };

  useEffect(() => {
    return () => cancelHold();
  }, []);

  return (
    <div className="relative overflow-hidden bg-rose-50 min-h-[72px]">
      {/* Background Swipe indicator */}
      <div 
        className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-500 to-rose-600 flex items-center px-4 transition-all"
        style={{ 
          width: `${Math.max(dragOffset, 0)}px`,
          opacity: dragOffset > 20 ? 1 : 0
        }}
      >
        <div className={`flex items-center gap-2 text-white font-bold text-xs whitespace-nowrap transition-transform duration-150 ${dragOffset > 130 ? 'scale-110' : 'scale-100'}`}>
          <Trash2 size={16} className={dragOffset > 130 ? "animate-bounce" : ""} />
          {dragOffset > 130 ? "Lepaskan untuk Hapus" : "Geser ke Kanan"}
        </div>
      </div>

      {/* Foreground Chat Item */}
      <div
        onMouseDown={(e) => handleStart(e.clientX)}
        onMouseMove={(e) => handleMove(e.clientX)}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={(e) => handleStart(e.touches[0].clientX)}
        onTouchMove={(e) => handleMove(e.touches[0].clientX)}
        onTouchEnd={handleEnd}
        style={{
          transform: `translateX(${dragOffset}px)`,
          transition: dragOffset === 0 ? "transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)" : "none"
        }}
        className={`w-full text-left px-4 py-3 flex gap-3 items-center bg-white border-b border-pink-50 select-none cursor-pointer transition-colors relative z-10 ${
          isActive ? "bg-gradient-to-r from-pink-50 to-violet-50 border-l-2 border-l-pink-500 font-semibold" : hasUnread ? "bg-pink-50/10 font-semibold" : "hover:bg-pink-50/30"
        } ${isHoldActive ? "shadow-md bg-amber-50/20" : ""}`}
      >
        {/* Hold progress bar */}
        {holdProgress > 0 && holdProgress < 100 && (
          <div 
            className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-pink-500 to-violet-600 transition-all duration-75"
            style={{ width: `${holdProgress}%` }}
          />
        )}
        
        {/* Held status indicator */}
        {isHoldActive && (
          <div className="absolute top-1 right-1 flex items-center gap-1 bg-amber-100 text-amber-800 text-[8px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wide animate-pulse">
            Geser Kanan untuk Hapus
          </div>
        )}

        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-violet-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
          {session.guestLabel.slice(-2)}
        </div>
        <div className="flex-1 min-w-0 text-left">
          <div className="flex justify-between items-center mb-0.5">
            <span className={`text-xs font-bold text-[#1a0a2e] truncate ${hasUnread ? "text-pink-600 font-extrabold" : ""}`}>{session.guestLabel}</span>
            <span className="text-[9px] text-gray-300 shrink-0">{relTime(session.lastActivity)}</span>
          </div>
          <p className={`text-[11px] truncate ${hasUnread ? "text-gray-800 font-semibold" : "text-gray-400"}`}>
            {lastMsg ? lastMsg.text : "Belum ada pesan"}
          </p>
        </div>
        {hasUnread && (
          <span className="w-4 h-4 bg-pink-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center shrink-0">
            {session.unreadByAdmin}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Admin Chat Panel ──────────────────────────────────────────────────────────
function AdminChat() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const refresh = useCallback(async () => {
    const dbSessions = await dbFetchChats();
    const all = loadChats();
    if (dbSessions) {
      // Find automatic guests and delete them asynchronously from database
      const guestsToDelete = dbSessions.filter(s => s.guestLabel.startsWith("Guest #") || s.guestLabel.startsWith("Guest"));
      if (guestsToDelete.length > 0) {
        guestsToDelete.forEach(g => dbDeleteChat(g.sessionId));
      }
      
      const dbCleaned = dbSessions.filter(s => !s.guestLabel.startsWith("Guest #") && !s.guestLabel.startsWith("Guest"));
      const merged = mergeSessions(all, dbCleaned);
      const cleaned = merged.filter(s => !s.guestLabel.startsWith("Guest #") && !s.guestLabel.startsWith("Guest"));
      saveChats(cleaned);
      setSessions([...cleaned].sort((a, b) => b.lastActivity - a.lastActivity));
    } else {
      const cleaned = all.filter(s => !s.guestLabel.startsWith("Guest #") && !s.guestLabel.startsWith("Guest"));
      setSessions([...cleaned].sort((a, b) => b.lastActivity - a.lastActivity));
    }
  }, []);

  useEffect(() => {
    refresh();

    // Subscribe to realtime database changes for chat_sessions and chat_messages
    const unsubSessions = dbSubscribeRealtime("chat_sessions", refresh);
    const unsubMessages = dbSubscribeRealtime("chat_messages", refresh);

    // Backup polling
    const t = setInterval(refresh, 4000);
    return () => {
      unsubSessions();
      unsubMessages();
      clearInterval(t);
    };
  }, [refresh]);

  const active = sessions.find((s) => s.sessionId === activeId) ?? null;

  // Mark read when opening a session
  useEffect(() => {
    if (!activeId) return;
    async function markRead() {
      const chats = loadChats();
      const idx = chats.findIndex((c) => c.sessionId === activeId);
      if (idx >= 0 && chats[idx].unreadByAdmin > 0) {
        const updated = { ...chats[idx], unreadByAdmin: 0 };
        chats[idx] = updated;
        saveChats(chats);
        refresh();
        await dbUpsertChatSession(updated);
      }
    }
    markRead();
  }, [activeId, refresh]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [active?.messages.length]);

  const send = async () => {
    if (!input.trim() || !activeId) return;
    const msg: ChatMsg = { id: uid(), from: "admin", text: input.trim(), ts: Date.now() };
    
    // Update locally
    const chats = loadChats();
    const idx = chats.findIndex((c) => c.sessionId === activeId);
    if (idx < 0) return;
    const updated = { ...chats[idx], messages: [...chats[idx].messages, msg], lastActivity: Date.now() };
    chats[idx] = updated;
    saveChats(chats);
    setInput("");
    
    // Instantly update state for seamless responsiveness
    setSessions([...chats].sort((a, b) => b.lastActivity - a.lastActivity));

    // Sync with database asynchronously (no await)
    dbSaveChatMessage(msg, activeId);
    dbUpsertChatSession(updated);
  };

  const timeStr = (ts: number) => new Date(ts).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  const relTime = (ts: number) => {
    const diff = Date.now() - ts;
    if (diff < 60000) return "baru saja";
    if (diff < 3600000) return `${Math.floor(diff / 60000)} mnt lalu`;
    return new Date(ts).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  };

  const handleDelete = async (sessionId: string) => {
    const toastId = toast.loading("Menghapus percakapan...");
    const chats = loadChats().filter((c) => c.sessionId !== sessionId);
    saveChats(chats);
    setSessions(chats);
    if (activeId === sessionId) {
      setActiveId(null);
    }
    const success = await dbDeleteChat(sessionId);
    if (success) {
      toast.success("Percakapan berhasil dihapus!", { id: toastId });
    } else {
      toast.error("Gagal menghapus dari cloud.", { id: toastId });
    }
    refresh();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#1a0a2e]" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Chat Tamu</h1>
        <p className="text-gray-400 text-sm mt-1">Pesan masuk dari pengunjung website</p>
      </div>

      <div className="bg-white rounded-2xl border border-pink-100 shadow-sm overflow-hidden flex" style={{ height: "600px" }}>
        {/* Session list */}
        <div className={`w-full md:w-72 border-r border-pink-100 flex flex-col shrink-0 ${activeId ? "hidden md:flex" : "flex"}`}>
          <div className="px-4 py-3 border-b border-pink-100">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{sessions.length} percakapan</p>
          </div>
          <div className="flex-1 overflow-y-auto" style={{ minHeight: 0 }}>
            {sessions.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <div className="w-12 h-12 bg-pink-50 rounded-full flex items-center justify-center mb-3">
                  <MessageCircle size={20} className="text-pink-300" />
                </div>
                <p className="text-sm text-gray-400">Belum ada pesan masuk</p>
                <p className="text-xs text-gray-300 mt-1">Pesan dari tamu akan muncul di sini</p>
              </div>
            )}
            {sessions.map((s) => (
              <SessionItem
                key={s.sessionId}
                session={s}
                isActive={activeId === s.sessionId}
                onSelect={() => setActiveId(s.sessionId)}
                onDelete={() => handleDelete(s.sessionId)}
                relTime={relTime}
              />
            ))}
          </div>
        </div>

        {/* Chat area */}
        {active ? (
          <div className={`flex-1 flex flex-col min-w-0 ${activeId ? "flex" : "hidden md:flex"}`}>
            {/* Chat header */}
            <div className="px-5 py-3 border-b border-pink-100 flex items-center gap-3 bg-[#fdf7fb]">
              <button
                onClick={() => setActiveId(null)}
                className="md:hidden p-1 mr-1 text-gray-500 hover:text-pink-500 hover:bg-pink-50 rounded-lg transition-colors flex items-center justify-center"
                aria-label="Kembali"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
                {active.guestLabel.slice(-2)}
              </div>
              <div>
                <p className="text-sm font-bold text-[#1a0a2e]">{active.guestLabel}</p>
                <p className="text-[11px] text-gray-400">{active.messages.length} pesan</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-[#f9f4fd]" style={{ minHeight: 0 }}>
              {active.messages.length === 0 && (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-gray-400">Belum ada pesan dari tamu ini.</p>
                </div>
              )}
              {active.messages.map((m) => (
                <div key={m.id} className={`flex gap-2 items-end ${m.from === "admin" ? "flex-row-reverse" : ""}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-white text-[9px] font-bold ${m.from === "admin" ? "bg-gradient-to-br from-pink-400 to-violet-500" : "bg-gray-300"}`}>
                    {m.from === "admin" ? "A" : active.guestLabel.slice(-2)}
                  </div>
                  <div className={`rounded-2xl px-3 py-2 max-w-[72%] shadow-sm ${m.from === "admin" ? "bg-gradient-to-br from-pink-500 to-violet-600 text-white rounded-br-sm" : "bg-white text-[#1a0a2e] rounded-bl-sm"}`}>
                    <p className="text-sm leading-relaxed">{m.text}</p>
                    <p className={`text-[10px] mt-0.5 ${m.from === "admin" ? "text-white/60 text-right" : "text-gray-400 text-right"}`}>{timeStr(m.ts)}</p>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Reply input */}
            <div className="px-4 py-3 border-t border-pink-100 bg-white flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
                placeholder={`Balas ke ${active.guestLabel}...`}
                className="flex-1 text-sm bg-[#fdf7fb] border border-pink-200 rounded-xl px-3 py-2.5 outline-none focus:border-pink-400 transition-colors"
              />
              <button
                onClick={send}
                disabled={!input.trim()}
                className="w-10 h-10 bg-gradient-to-br from-pink-500 to-violet-600 rounded-xl flex items-center justify-center disabled:opacity-40 hover:shadow-md transition-all shrink-0"
              >
                <Send size={16} className="text-white" />
              </button>
            </div>
          </div>
        ) : (
          <div className={`flex-1 flex flex-col items-center justify-center text-center p-8 ${activeId ? "flex" : "hidden md:flex"}`}>
            <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-violet-100 rounded-full flex items-center justify-center mb-4">
              <MessageCircle size={28} className="text-pink-400" />
            </div>
            <p className="text-base font-semibold text-gray-500">Pilih percakapan</p>
            <p className="text-sm text-gray-400 mt-1">Klik nama tamu di sebelah kiri untuk membuka chat</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Admin Floating Chat Widget ──────────────────────────────────────────────
function AdminChatWidget() {
  const [open, setOpen] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const refresh = useCallback(async () => {
    const dbSessions = await dbFetchChats();
    const all = loadChats();
    if (dbSessions) {
      // Find automatic guests and delete them asynchronously from database
      const guestsToDelete = dbSessions.filter(s => s.guestLabel.startsWith("Guest #") || s.guestLabel.startsWith("Guest"));
      if (guestsToDelete.length > 0) {
        guestsToDelete.forEach(g => dbDeleteChat(g.sessionId));
      }
      
      const dbCleaned = dbSessions.filter(s => !s.guestLabel.startsWith("Guest #") && !s.guestLabel.startsWith("Guest"));
      const merged = mergeSessions(all, dbCleaned);
      const cleaned = merged.filter(s => !s.guestLabel.startsWith("Guest #") && !s.guestLabel.startsWith("Guest"));
      saveChats(cleaned);
      setSessions([...cleaned].sort((a, b) => b.lastActivity - a.lastActivity));
    } else {
      const cleaned = all.filter(s => !s.guestLabel.startsWith("Guest #") && !s.guestLabel.startsWith("Guest"));
      setSessions([...cleaned].sort((a, b) => b.lastActivity - a.lastActivity));
    }
  }, []);

  useEffect(() => {
    refresh();

    const unsubSessions = dbSubscribeRealtime("chat_sessions", refresh);
    const unsubMessages = dbSubscribeRealtime("chat_messages", refresh);

    const t = setInterval(refresh, 4000);
    return () => {
      unsubSessions();
      unsubMessages();
      clearInterval(t);
    };
  }, [refresh]);

  const active = sessions.find((s) => s.sessionId === activeId) ?? null;

  useEffect(() => {
    if (!activeId) return;
    async function markRead() {
      const chats = loadChats();
      const idx = chats.findIndex((c) => c.sessionId === activeId);
      if (idx >= 0 && chats[idx].unreadByAdmin > 0) {
        const updated = { ...chats[idx], unreadByAdmin: 0 };
        chats[idx] = updated;
        saveChats(chats);
        refresh();
        await dbUpsertChatSession(updated);
      }
    }
    markRead();
  }, [activeId, refresh]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [active?.messages.length]);

  const send = async () => {
    if (!input.trim() || !activeId) return;
    const msg: ChatMsg = { id: uid(), from: "admin", text: input.trim(), ts: Date.now() };
    
    const chats = loadChats();
    const idx = chats.findIndex((c) => c.sessionId === activeId);
    if (idx < 0) return;
    const updated = { ...chats[idx], messages: [...chats[idx].messages, msg], lastActivity: Date.now() };
    chats[idx] = updated;
    saveChats(chats);
    setInput("");
    
    setSessions([...chats].sort((a, b) => b.lastActivity - a.lastActivity));

    dbSaveChatMessage(msg, activeId);
    dbUpsertChatSession(updated);
  };

  const handleDelete = async (sessionId: string) => {
    const toastId = toast.loading("Menghapus percakapan...");
    const chats = loadChats().filter((c) => c.sessionId !== sessionId);
    saveChats(chats);
    setSessions(chats);
    if (activeId === sessionId) {
      setActiveId(null);
    }
    const success = await dbDeleteChat(sessionId);
    if (success) {
      toast.success("Percakapan berhasil dihapus!", { id: toastId });
    } else {
      toast.error("Gagal menghapus dari cloud.", { id: toastId });
    }
    refresh();
  };

  const totalUnread = sessions.reduce((sum, s) => sum + s.unreadByAdmin, 0);

  const timeStr = (ts: number) => new Date(ts).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  
  const relTime = (ts: number) => {
    const diff = Date.now() - ts;
    if (diff < 60000) return "baru saja";
    if (diff < 3600000) return `${Math.floor(diff / 60000)} mnt lalu`;
    return new Date(ts).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  };

  const filteredSessions = sessions.filter(s => 
    s.guestLabel.toLowerCase().includes(search.toLowerCase()) || 
    (s.messages[s.messages.length - 1]?.text || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[350px] h-[520px] rounded-2xl shadow-2xl border border-pink-100 overflow-hidden flex flex-col bg-white transition-all duration-300">
          {active ? (
            /* Active Chat Screen */
            <>
              {/* Header */}
              <div className="bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] px-4 py-3 flex items-center gap-3 shrink-0">
                <button onClick={() => setActiveId(null)} className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded-lg transition-all">
                  <ChevronLeft size={18} />
                </button>
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold">
                  {active.guestLabel.slice(-2)}
                </div>
                <div className="flex-1 text-left">
                  <p className="text-white font-bold text-sm truncate">{active.guestLabel}</p>
                  <p className="text-white/70 text-[10px]">{active.messages.length} pesan</p>
                </div>
                <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white transition-colors"><X size={18} /></button>
              </div>

              {/* Message List */}
              <div className="flex-1 overflow-y-auto bg-[#f9f4fd] px-4 py-3 space-y-3" style={{ minHeight: 0 }}>
                {active.messages.length === 0 && (
                  <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                    Belum ada pesan dari tamu ini.
                  </div>
                )}
                {active.messages.map((m) => (
                  <div key={m.id} className={`flex gap-2 items-end ${m.from === "admin" ? "flex-row-reverse" : ""}`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-white text-[8px] font-bold ${m.from === "admin" ? "bg-gradient-to-br from-pink-400 to-violet-500" : "bg-gray-300"}`}>
                      {m.from === "admin" ? "A" : active.guestLabel.slice(-2)}
                    </div>
                    <div className={`rounded-2xl px-3 py-2 shadow-sm max-w-[78%] text-left ${m.from === "admin" ? "bg-gradient-to-br from-pink-500 to-violet-600 text-white rounded-br-sm" : "bg-white text-[#1a0a2e] rounded-bl-sm"}`}>
                      <p className="text-xs leading-relaxed">{m.text}</p>
                      <p className={`text-[9px] mt-0.5 ${m.from === "admin" ? "text-white/60 text-right" : "text-gray-400 text-right"}`}>{timeStr(m.ts)}</p>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              {/* Reply Input */}
              <div className="bg-white border-t border-pink-100 p-3 flex gap-2 shrink-0">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
                  placeholder={`Balas ke ${active.guestLabel}...`}
                  className="flex-1 text-xs bg-[#fdf7fb] border border-pink-200 rounded-xl px-3 py-2 outline-none focus:border-pink-400 transition-colors"
                />
                <button
                  onClick={send}
                  disabled={!input.trim()}
                  className="w-8 h-8 bg-gradient-to-br from-pink-500 to-violet-600 rounded-xl flex items-center justify-center disabled:opacity-40 hover:shadow-md transition-all shrink-0"
                >
                  <Send size={13} className="text-white" />
                </button>
              </div>
            </>
          ) : (
            /* Session List Screen */
            <>
              {/* Header */}
              <div className="bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] px-4 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                    <MessageCircle size={16} className="text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-white font-bold text-sm">Pesan Masuk</p>
                    <p className="text-white/80 text-[10px] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                      Sync aktif
                    </p>
                  </div>
                </div>
                <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white transition-colors"><X size={18} /></button>
              </div>

              {/* Search Bar */}
              <div className="px-3 py-2 bg-[#fdf7fb] border-b border-pink-50 flex items-center gap-2">
                <Search size={12} className="text-pink-400" />
                <input
                  type="text"
                  placeholder="Cari chat tamu..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-transparent text-xs outline-none"
                />
                {search && <button onClick={() => setSearch("")}><X size={11} className="text-gray-300" /></button>}
              </div>

              {/* Conversation List */}
              <div className="flex-1 overflow-y-auto divide-y divide-pink-50" style={{ minHeight: 0 }}>
                {filteredSessions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-6">
                    <div className="w-10 h-10 bg-pink-50 rounded-full flex items-center justify-center mb-2">
                      <MessageCircle size={18} className="text-pink-300" />
                    </div>
                    <p className="text-xs text-gray-400">Belum ada pesan</p>
                  </div>
                ) : (
                  filteredSessions.map((s) => (
                    <SessionItem
                      key={s.sessionId}
                      session={s}
                      onSelect={() => setActiveId(s.sessionId)}
                      onDelete={() => handleDelete(s.sessionId)}
                      relTime={relTime}
                    />
                  ))
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Floating Button (FAB) */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#ec4899] shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center justify-center"
        aria-label="Tamu Chat"
      >
        {open ? <X size={22} className="text-white" /> : <MessageCircle size={22} className="text-white" />}
        {totalUnread > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[22px] h-[22px] px-1 bg-red-500 rounded-full border-2 border-white text-white text-[10px] font-extrabold flex items-center justify-center animate-bounce">
            {totalUnread}
          </span>
        )}
      </button>
    </>
  );
}
