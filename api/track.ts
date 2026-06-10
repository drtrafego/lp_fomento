import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";

// Tracking server side (Meta CAPI) rodando no Vercel.
// Le META_PIXEL_ID e META_ACCESS_TOKEN das variaveis de ambiente do Vercel.
// Espelha o evento que o Pixel disparou no browser (mesmo event_id = dedupe).

const VALID_EVENTS = [
  "PageView",
  "ViewContent",
  "Lead",
  "InitiateCheckout",
  "Purchase",
  "Contact",
  "CompleteRegistration",
  "AddToCart",
  "Search",
];

function sha256(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function hashField(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  return sha256(value.toLowerCase().trim());
}

function firstHeader(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const {
      event_name,
      event_id,
      page_url,
      user_agent,
      external_id,
      fbp,
      fbc,
      country,
      state,
      city,
      zip_code,
      custom_data,
      email,
      phone,
      first_name,
      last_name,
      test_event_code,
    } = body;

    if (!event_name || !VALID_EVENTS.includes(event_name)) {
      return res.status(400).json({ error: "Invalid event_name" });
    }

    const PIXEL_ID = process.env.META_PIXEL_ID;
    const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;
    if (!PIXEL_ID || !ACCESS_TOKEN) {
      console.warn("META_PIXEL_ID or META_ACCESS_TOKEN not set");
      return res.status(200).json({ success: false, error: "Missing credentials" });
    }

    // IP e geo a partir dos headers do Vercel
    const xff = firstHeader(req.headers["x-forwarded-for"]);
    const clientIp = xff ? xff.split(",")[0].trim() : firstHeader(req.headers["x-real-ip"]) || "";
    const geoCountry = country || firstHeader(req.headers["x-vercel-ip-country"]);
    const geoState = state || firstHeader(req.headers["x-vercel-ip-country-region"]);
    const geoCity = city || firstHeader(req.headers["x-vercel-ip-city"]);
    const geoZip = zip_code || firstHeader(req.headers["x-vercel-ip-postal-code"]);

    const user_data: Record<string, unknown> = {
      client_ip_address: clientIp,
      client_user_agent: user_agent || firstHeader(req.headers["user-agent"]),
    };
    if (typeof fbp === "string" && fbp.startsWith("fb.")) user_data.fbp = fbp;
    if (typeof fbc === "string" && fbc.startsWith("fb.")) user_data.fbc = fbc;
    if (external_id) user_data.external_id = [sha256(String(external_id))];

    const em = hashField(email);
    if (em) user_data.em = [em];
    if (phone) user_data.ph = [sha256(String(phone).replace(/\D/g, ""))];
    const fn = hashField(first_name);
    if (fn) user_data.fn = [fn];
    const ln = hashField(last_name);
    if (ln) user_data.ln = [ln];
    if (geoCity) user_data.ct = [sha256(String(geoCity).toLowerCase().replace(/\s/g, ""))];
    if (geoState) user_data.st = [sha256(String(geoState).toLowerCase().substring(0, 2))];
    if (geoZip) user_data.zp = [sha256(String(geoZip).replace(/\D/g, ""))];
    if (geoCountry) user_data.country = [sha256(String(geoCountry).toLowerCase().substring(0, 2))];

    const payload: Record<string, unknown> = {
      data: [
        {
          event_name,
          event_time: Math.floor(Date.now() / 1000),
          event_id,
          event_source_url: page_url,
          action_source: "website",
          user_data,
          custom_data: custom_data || {},
        },
      ],
    };
    if (test_event_code) payload.test_event_code = test_event_code;

    const metaResp = await fetch(
      `https://graph.facebook.com/v22.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    const metaResponse = await metaResp.json();

    return res.status(200).json({ success: true, meta_response: metaResponse });
  } catch (e) {
    console.error("track error:", e);
    return res.status(500).json({ error: String(e) });
  }
}
