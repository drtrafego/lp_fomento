import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate webhook token
    const url = new URL(req.url);
    const token = url.searchParams.get("token");
    const WEBHOOK_SECRET = Deno.env.get("WEBHOOK_SECRET");

    if (!WEBHOOK_SECRET || token !== WEBHOOK_SECRET) {
      console.error("Invalid or missing webhook token");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    console.log("Webhook received:", JSON.stringify(body).substring(0, 500));

    // Extract fields from Zouti payload - adapt to their format
    const event_type = body.event_type || body.event || body.type || "unknown";
    const order_id = body.order_id || body.id || body.transaction_id || null;
    
    // Customer info
    const customer = body.customer || body.buyer || {};
    const customer_email = customer.email || body.email || null;
    const customer_name = customer.name || body.name || null;
    const customer_phone = customer.phone || body.phone || null;

    // Payment info
    const amount = body.amount || body.value || body.total || body.price || null;
    const currency = body.currency || "BRL";
    const payment_method = body.payment_method || body.method || null;
    const payment_status = body.payment_status || body.status || null;

    // Products & order bumps
    const products = body.products || body.items || null;
    const order_bumps = body.order_bumps || body.bumps || null;

    // UTMs
    const utm_source = body.utm_source || body.utms?.utm_source || null;
    const utm_medium = body.utm_medium || body.utms?.utm_medium || null;
    const utm_campaign = body.utm_campaign || body.utms?.utm_campaign || null;
    const utm_content = body.utm_content || body.utms?.utm_content || null;
    const utm_term = body.utm_term || body.utms?.utm_term || null;
    const src = body.src || null;

    // Insert into checkout_events using service_role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error: dbError } = await supabase.from("checkout_events").insert({
      event_type,
      order_id,
      customer_email,
      customer_name,
      customer_phone,
      amount: amount ? Number(amount) : null,
      currency,
      payment_method,
      payment_status,
      products,
      order_bumps,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      utm_term,
      src,
      raw_payload: body,
    });

    if (dbError) {
      console.error("DB insert error:", dbError);
      return new Response(
        JSON.stringify({ error: "Failed to store event", details: dbError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If it's a purchase event, also fire Meta CAPI
    if (event_type === "purchase" || event_type === "approved" || event_type === "paid") {
      const PIXEL_ID = Deno.env.get("META_PIXEL_ID");
      const ACCESS_TOKEN = Deno.env.get("META_ACCESS_TOKEN");

      if (PIXEL_ID && ACCESS_TOKEN) {
        try {
          const eventTime = Math.floor(Date.now() / 1000);
          const metaPayload = {
            data: [
              {
                event_name: "Purchase",
                event_time: eventTime,
                event_id: `purchase_${order_id}_${eventTime}`,
                action_source: "website",
                user_data: {
                  em: customer_email ? [await sha256(customer_email.toLowerCase().trim())] : undefined,
                  ph: customer_phone ? [await sha256(customer_phone.replace(/\D/g, ""))] : undefined,
                },
                custom_data: {
                  currency: currency || "BRL",
                  value: amount ? Number(amount) : 0,
                  content_type: "product",
                },
              },
            ],
          };

          const metaResp = await fetch(
            `https://graph.facebook.com/v21.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(metaPayload),
            }
          );
          const metaResult = await metaResp.json();
          console.log("Meta CAPI Purchase response:", JSON.stringify(metaResult));
        } catch (e) {
          console.error("Meta CAPI error:", e);
        }
      }
    }

    console.log(`Event stored: ${event_type} - order: ${order_id}`);
    return new Response(
      JSON.stringify({ success: true, event_type, order_id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("Webhook error:", e);
    return new Response(
      JSON.stringify({ error: String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function sha256(value: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(value);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
