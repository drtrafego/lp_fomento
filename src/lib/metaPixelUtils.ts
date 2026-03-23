// ─── External ID (persistent visitor ID) ───
export function getExternalId(): string {
  const KEY = "meta_external_id";
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(KEY, id);
  }
  return id;
}

// ─── Event ID (unique per event for deduplication) ───
export function generateEventId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
}

// ─── UTM Parameters ───
export function getUrlParams(): Record<string, string> {
  const params: Record<string, string> = {};
  const sp = new URLSearchParams(window.location.search);
  ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid"].forEach((k) => {
    const v = sp.get(k);
    if (v) params[k] = v;
  });
  // Persist UTMs
  if (Object.keys(params).length > 0) {
    localStorage.setItem("meta_utm_params", JSON.stringify(params));
  }
  return params;
}

export function getStoredUtmParams(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem("meta_utm_params") || "{}");
  } catch {
    return {};
  }
}

// ─── Facebook Cookies ───
function getCookie(name: string): string {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? match[2] : "";
}

export function getFbCookies(): { fbp: string; fbc: string } {
  let fbp = getCookie("_fbp");
  let fbc = getCookie("_fbc");
  const utms = getStoredUtmParams();
  if (!fbc && utms.fbclid) {
    fbc = `fb.1.${Date.now()}.${utms.fbclid}`;
  }
  return { fbp, fbc };
}

// ─── Client Info ───
export function getClientInfo() {
  return {
    user_agent: navigator.userAgent,
    page_url: window.location.href,
    page_title: document.title,
    referrer: document.referrer,
  };
}

// ─── Event Time Details ───
export function getEventTimeDetails() {
  const now = new Date();
  const days = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
  const h = now.getHours();
  const m = now.getMinutes();
  return {
    event_time: Math.floor(now.getTime() / 1000),
    event_day: days[now.getDay()],
    event_time_interval: `${String(h).padStart(2, "0")}:${m < 30 ? "00-29" : "30-59"}`,
  };
}

// ─── Location Cache (24h) ───
interface LocationData {
  country: string;
  state: string;
  city: string;
  zip_code: string;
  ip: string;
}

export function saveLocationData(data: LocationData) {
  localStorage.setItem(
    "meta_location",
    JSON.stringify({ ...data, timestamp: Date.now() })
  );
}

export function getStoredLocationData(): LocationData | null {
  try {
    const raw = localStorage.getItem("meta_location");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // 24h cache
    if (Date.now() - parsed.timestamp > 86400000) {
      localStorage.removeItem("meta_location");
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

// ─── Section Tracking (session dedup) ───
export function wasSectionViewed(sectionName: string): boolean {
  try {
    const viewed = JSON.parse(sessionStorage.getItem("meta_sections_viewed") || "[]");
    return viewed.includes(sectionName);
  } catch {
    return false;
  }
}

export function markSectionViewed(sectionName: string): void {
  try {
    const viewed = JSON.parse(sessionStorage.getItem("meta_sections_viewed") || "[]");
    if (!viewed.includes(sectionName)) {
      viewed.push(sectionName);
      sessionStorage.setItem("meta_sections_viewed", JSON.stringify(viewed));
    }
  } catch {}
}

// ─── Checkout URL Builder ───
const CHECKOUT_BASE =
  "https://pay.zouti.com.br/checkout?product_offer_id=prod_offer_b0i73d4ti6pb7tddgqks1z";

export function buildCheckoutUrl(): string {
  const utms = getStoredUtmParams();
  const url = new URL(CHECKOUT_BASE);

  if (utms.utm_source) url.searchParams.set("utm_source", utms.utm_source);
  if (utms.utm_medium) url.searchParams.set("utm_medium", utms.utm_medium);
  if (utms.utm_campaign) url.searchParams.set("utm_campaign", utms.utm_campaign);
  if (utms.utm_content) url.searchParams.set("utm_content", utms.utm_content);
  if (utms.utm_term) url.searchParams.set("utm_term", utms.utm_term);

  // Greenn src parameter: source_medium_campaign
  const src = [utms.utm_source, utms.utm_medium, utms.utm_campaign]
    .filter(Boolean)
    .join("_");
  if (src) url.searchParams.set("src", src);

  return url.toString();
}
