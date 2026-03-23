import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";

    if (ip === "unknown" || ip === "127.0.0.1") {
      return new Response(
        JSON.stringify({ country: "BR", state: "", city: "", zip_code: "", ip }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resp = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,region,regionName,city,zip`);
    const data = await resp.json();

    if (data.status === "success") {
      return new Response(
        JSON.stringify({
          country: data.countryCode || "BR",
          state: data.region || "",
          city: data.city || "",
          zip_code: data.zip || "",
          ip,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ country: "BR", state: "", city: "", zip_code: "", ip }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("Location error:", e);
    return new Response(
      JSON.stringify({ country: "BR", state: "", city: "", zip_code: "", ip: "unknown" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
