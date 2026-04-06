import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const VALID_EVENTS = ["PageView", "ViewContent", "Purchase"];

async function sha256(value: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(value);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hashField(value: string | undefined | null): Promise<string | null> {
  if (!value || !value.trim()) return null;
  return sha256(value.toLowerCase().trim());
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const {
      event_name,
      event_id,
      page_url,
      page_title,
      referrer,
      user_agent,
      external_id,
      fbp,
      fbc,
      country,
      state,
      city,
      zip_code,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      utm_term,
      fbclid,
      custom_data,
      // PII for Advanced Matching
      email,
      phone,
      first_name,
      last_name,
    } = body;

    if (!event_name || !VALID_EVENTS.includes(event_name)) {
      return new Response(
        JSON.stringify({ error: "Invalid event_name" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get client IP
    const forwarded = req.headers.get("x-forwarded-for");
    const clientIp = forwarded ? forwarded.split(",")[0].trim() : "unknown";

    // Hash PII fields
    const hashed_em = await hashField(email);
    const hashed_ph = phone ? await sha256(phone.replace(/\D/g, "")) : null;
    const hashed_fn = await hashField(first_name);
    const hashed_ln = await hashField(last_name);
    const hashed_ct = city ? await sha256(city.toLowerCase().replace(/\s/g, "")) : null;
    const hashed_st = state ? await sha256(state.toLowerCase().substring(0, 2)) : null;
    const hashed_zp = zip_code ? await sha256(zip_code.replace(/\D/g, "")) : null;
    const hashed_country = country ? await sha256(country.toLowerCase().substring(0, 2)) : null;
    const hashed_external_id = external_id ? await sha256(external_id) : null;

    // Build user_data for Meta CAPI
    const user_data: Record<string, any> = {
      client_ip_address: clientIp,
      client_user_agent: user_agent || req.headers.get("user-agent"),
    };
    if (fbp) user_data.fbp = fbp;
    if (fbc) user_data.fbc = fbc;
    if (hashed_external_id) user_data.external_id = hashed_external_id;
    if (hashed_em) user_data.em = [hashed_em];
    if (hashed_ph) user_data.ph = [hashed_ph];
    if (hashed_fn) user_data.fn = [hashed_fn];
    if (hashed_ln) user_data.ln = [hashed_ln];
    if (hashed_ct) user_data.ct = [hashed_ct];
    if (hashed_st) user_data.st = [hashed_st];
    if (hashed_zp) user_data.zp = [hashed_zp];
    if (hashed_country) user_data.country = [hashed_country];

    // Build Meta CAPI payload
    const eventTime = Math.floor(Date.now() / 1000);
    const metaPayload = {
      data: [
        {
          event_name,
          event_time: eventTime,
          event_id,
          event_source_url: page_url,
          action_source: "website",
          user_data,
          custom_data: custom_data || {},
        },
      ],
    };

    // Send to Meta CAPI
    const PIXEL_ID = Deno.env.get("META_PIXEL_ID");
    const ACCESS_TOKEN = Deno.env.get("META_ACCESS_TOKEN");
    let metaResponse: any = null;

    if (PIXEL_ID && ACCESS_TOKEN) {
      try {
        const metaResp = await fetch(
          `https://graph.facebook.com/v21.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(metaPayload),
          }
        );
        metaResponse = await metaResp.json();
        console.log("Meta CAPI response:", JSON.stringify(metaResponse));
      } catch (e) {
        console.error("Meta CAPI error:", e);
        metaResponse = { error: String(e) };
      }
    } else {
      console.warn("META_PIXEL_ID or META_ACCESS_TOKEN not set");
      metaResponse = { error: "Missing credentials" };
    }

    // Save to database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error: dbError } = await supabase.from("pixel_events").insert({
      event_name,
      event_id,
      event_time: new Date(eventTime * 1000).toISOString(),
      page_url,
      page_title,
      referrer,
      client_ip: clientIp,
      user_agent: user_agent || req.headers.get("user-agent"),
      external_id,
      fbp,
      fbc,
      country,
      state,
      city,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      utm_term,
      fbclid,
      custom_data,
      meta_response: metaResponse,
      hashed_em,
      hashed_ph,
      hashed_fn,
      hashed_ln,
      hashed_ct,
      hashed_st,
      hashed_zp,
      hashed_country,
    });

    if (dbError) {
      console.error("DB insert error:", dbError);
    }

    return new Response(
      JSON.stringify({ success: true, meta_response: metaResponse }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("meta-pixel-event error:", e);
    return new Response(
      JSON.stringify({ error: String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
