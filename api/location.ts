import type { VercelRequest, VercelResponse } from "@vercel/node";

// Geo IP do visitante a partir dos headers do Vercel.
// Substitui a edge function get-user-location do Supabase.
function firstHeader(v: string | string[] | undefined): string {
  if (Array.isArray(v)) return v[0] || "";
  return v || "";
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  const xff = firstHeader(req.headers["x-forwarded-for"]);
  const ip = xff ? xff.split(",")[0].trim() : firstHeader(req.headers["x-real-ip"]);

  res.setHeader("Cache-Control", "no-store");
  return res.status(200).json({
    country: firstHeader(req.headers["x-vercel-ip-country"]) || "BR",
    state: firstHeader(req.headers["x-vercel-ip-country-region"]),
    city: decodeURIComponent(firstHeader(req.headers["x-vercel-ip-city"])),
    zip_code: firstHeader(req.headers["x-vercel-ip-postal-code"]),
    ip,
  });
}
