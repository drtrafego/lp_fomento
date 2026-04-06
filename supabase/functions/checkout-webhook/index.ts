import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/**
 * Map Zouti payload to a meaningful event_type.
 * Zouti sends two types of webhooks:
 * - Order: id starts with "ord_", has `status` like AWAITING_PAYMENT, PAID, REFUNDED, etc.
 * - Subscription: id starts with "sub_", has `status` like INCOMPLETE, ACTIVE, CANCELED, etc.
 */
function resolveEventType(body: Record<string, any>): string {
  const status = (body.status || "").toUpperCase();
  const id = body.id || "";
  const paymentMethod = body.payment?.method || body.payment_method || "";

  // Subscription events
  if (id.startsWith("sub_")) {
    switch (status) {
      case "ACTIVE": return "subscription_active";
      case "INCOMPLETE": return "subscription_incomplete";
      case "CANCELED": return "subscription_canceled";
      case "PAST_DUE": return "subscription_past_due";
      default: return `subscription_${status.toLowerCase() || "unknown"}`;
    }
  }

  // Order events
  switch (status) {
    case "AWAITING_PAYMENT":
      if (paymentMethod === "PIX") return "pix_generated";
      if (paymentMethod === "BOLETO") return "boleto_generated";
      return "awaiting_payment";
    case "PAID":
    case "APPROVED":
      return "purchase";
    case "REFUNDED":
      return "refunded";
    case "CANCELED":
    case "CANCELLED":
      return "canceled";
    case "EXPIRED":
      return "expired";
    case "CHARGEBACK":
      return "chargeback";
    case "PROCESSING":
      return "processing";
    default:
      return status ? status.toLowerCase() : "unknown";
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log("Webhook received:", JSON.stringify(body).substring(0, 500));

    const event_type = resolveEventType(body);

    // Order ID: for orders it's body.id (ord_...), for subscriptions use body.order_id
    const order_id = body.order_id || body.id || null;

    // Customer info — Zouti nests it under `customer`
    const customer = body.customer || {};
    const customer_email = customer.email || null;
    const customer_name = customer.name || null;
    const customer_phone = customer.phone || null;

    // Payment info — Zouti nests under `payment`
    const payment = body.payment || {};
    const payment_method = payment.method || body.payment_method || null;
    const payment_status = body.status || null;

    // Amount — use amount_total_in_brl (reais) or convert from centavos
    const amount = body.amount_total_in_brl
      ?? body.amount_in_brl
      ?? (body.amount_total ? body.amount_total / 100 : null);
    const currency = body.currency || "BRL";

    // Products
    const products = body.items || body.line_items || null;
    const order_bumps = body.order_bumps || body.bumps || null;

    // UTMs — Zouti puts them in `utm_data` object and src in `tracking`
    const utmData = body.utm_data || {};
    const tracking = body.tracking || {};
    const utm_source = utmData.utm_source || null;
    const utm_medium = utmData.utm_medium || null;
    const utm_campaign = utmData.utm_campaign || null;
    const utm_content = utmData.utm_content || null;
    const utm_term = utmData.utm_term || null;
    const src = tracking.src || null;

    // Insert into checkout_events
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error: dbError } = await supabase.from("checkout_events").upsert({
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
    }, { onConflict: "order_id,event_type", ignoreDuplicates: true });

    if (dbError) {
      console.error("DB insert error:", dbError);
      return new Response(
        JSON.stringify({ error: "Failed to store event", details: dbError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fire Meta CAPI for purchase events
    if (event_type === "purchase") {
      const PIXEL_ID = Deno.env.get("META_PIXEL_ID");
      const ACCESS_TOKEN = Deno.env.get("META_ACCESS_TOKEN");
      const navigator = body.navigator || {};

      if (PIXEL_ID && ACCESS_TOKEN) {
        try {
          const eventTime = Math.floor(Date.now() / 1000);

          // Extract first_name and last_name from customer.name
          const nameParts = (customer_name || "").trim().split(/\s+/);
          const firstName = nameParts[0] || "";
          const lastName = nameParts.slice(1).join(" ") || "";

          // Get country from customer address if available
          const customerAddress = customer.address || {};
          const customerCountry = customerAddress.country || "";

          // Build user_data with all available matching parameters
          const purchaseUserData: Record<string, any> = {};
          if (customer_email) purchaseUserData.em = [await sha256(customer_email.toLowerCase().trim())];
          if (customer_phone) purchaseUserData.ph = [await sha256(customer_phone.replace(/\D/g, ""))];
          if (firstName) purchaseUserData.fn = [await sha256(firstName.toLowerCase().trim())];
          if (lastName) purchaseUserData.ln = [await sha256(lastName.toLowerCase().trim())];
          if (customerCountry) purchaseUserData.country = [await sha256(customerCountry.toLowerCase().substring(0, 2))];
          if (order_id) purchaseUserData.external_id = [await sha256(order_id)];
          if (navigator.client_ip_address || navigator.ip_address) purchaseUserData.client_ip_address = navigator.client_ip_address || navigator.ip_address;
          if (navigator.client_user_agent || navigator.user_agent) purchaseUserData.client_user_agent = navigator.client_user_agent || navigator.user_agent;
          if (navigator.fbp && typeof navigator.fbp === "string" && navigator.fbp.startsWith("fb.")) purchaseUserData.fbp = navigator.fbp;
          if (navigator.fbc && typeof navigator.fbc === "string" && navigator.fbc.startsWith("fb.")) purchaseUserData.fbc = navigator.fbc;

          const metaPayload = {
            data: [
              {
                event_name: "Purchase",
                event_time: eventTime,
                event_id: `purchase_${order_id}_${eventTime}`,
                action_source: "website",
                user_data: purchaseUserData,
                custom_data: {
                  currency: currency || "BRL",
                  value: amount ? Number(amount) : 0,
                  content_type: "product",
                },
              },
            ],
          };

          const metaResp = await fetch(
            `https://graph.facebook.com/v22.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
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
