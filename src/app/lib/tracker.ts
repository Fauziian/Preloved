// Visitor tracking stored entirely in localStorage
export interface DailyVisit {
  date: string; // YYYY-MM-DD
  visits: number;
  pageViews: number;
}

export interface VisitorData {
  totalVisits: number;
  totalPageViews: number;
  daily: DailyVisit[];           // last 30 days
  productViews: Record<string, number>; // productId → view count
  referrers: Record<string, number>;    // referrer label → count
  devices: Record<string, number>;      // mobile/desktop/tablet → count
}

const KEY = "sherly_visitors";
const SESSION_KEY = "sherly_session_counted";

function today(): string {
  return new Date().toISOString().split("T")[0];
}

function detectDevice(): string {
  const ua = navigator.userAgent;
  if (/tablet|ipad|playbook|silk/i.test(ua)) return "Tablet";
  if (/mobile|android|iphone|ipod|blackberry|opera mini|iemobile/i.test(ua)) return "Mobile";
  return "Desktop";
}

function detectReferrer(): string {
  const ref = document.referrer;
  if (!ref) return "Langsung";
  if (ref.includes("google")) return "Google";
  if (ref.includes("instagram")) return "Instagram";
  if (ref.includes("shopee")) return "Shopee";
  if (ref.includes("facebook")) return "Facebook";
  if (ref.includes("tiktok")) return "TikTok";
  return "Lainnya";
}

export function loadVisitorData(): VisitorData {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    totalVisits: 0,
    totalPageViews: 0,
    daily: [],
    productViews: {},
    referrers: {},
    devices: {},
  };
}

export function saveVisitorData(data: VisitorData) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function recordVisit() {
  const data = loadVisitorData();
  const td = today();

  // Count as new visit once per browser session
  const alreadyCounted = sessionStorage.getItem(SESSION_KEY);
  if (!alreadyCounted) {
    data.totalVisits += 1;
    sessionStorage.setItem(SESSION_KEY, "1");

    // Device
    const dev = detectDevice();
    data.devices[dev] = (data.devices[dev] || 0) + 1;

    // Referrer
    const ref = detectReferrer();
    data.referrers[ref] = (data.referrers[ref] || 0) + 1;
  }

  // Always count page view
  data.totalPageViews += 1;

  // Daily entry
  const existing = data.daily.find((d) => d.date === td);
  if (existing) {
    if (!alreadyCounted) existing.visits += 1;
    existing.pageViews += 1;
  } else {
    data.daily.push({ date: td, visits: alreadyCounted ? 0 : 1, pageViews: 1 });
  }

  // Keep last 30 days only
  data.daily = data.daily.slice(-30);

  saveVisitorData(data);
}

export function recordProductView(productId: string) {
  const data = loadVisitorData();
  data.productViews[productId] = (data.productViews[productId] || 0) + 1;
  saveVisitorData(data);
}

export function getLast7Days(): DailyVisit[] {
  const data = loadVisitorData();
  const result: DailyVisit[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const found = data.daily.find((x) => x.date === dateStr);
    result.push(found ?? { date: dateStr, visits: 0, pageViews: 0 });
  }
  return result;
}

export function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}
