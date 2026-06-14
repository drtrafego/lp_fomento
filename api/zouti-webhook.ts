import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";

// Webhook de venda aprovada da Zouti, dispara Purchase para a Meta via CAPI (server to server).
// Reutiliza o padrao do api/track.ts (sha256 de PII, validacao de fbp/fbc, Graph API v22.0).
// O Purchase via pixel do browser subreporta em iOS e com bloqueadores. Este webhook reporta
// 100% das vendas aprovadas com match alto, direto do servidor da Zouti.

function sha256(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function hashField(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  return sha256(value.toLowerCase().trim());
}

// Busca o primeiro valor definido percorrendo varios caminhos possiveis no objeto.
// Cada caminho usa notacao por ponto, ex: "customer.email" ou "order.total".
function pick(obj: unknown, paths: string[]): unknown {
  for (const path of paths) {
    let cur: unknown = obj;
    let ok = true;
    for (const key of path.split(".")) {
      if (cur && typeof cur === "object" && key in (cur as Record<string, unknown>)) {
        cur = (cur as Record<string, unknown>)[key];
      } else {
        ok = false;
        break;
      }
    }
    if (ok && cur !== undefined && cur !== null && cur !== "") return cur;
  }
  return undefined;
}

function asString(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return undefined;
}

// Valores que indicam venda aprovada ou paga. Comparacao case insensitive.
const PAID_VALUES = [
  "paid",
  "approved",
  "aprovado",
  "aprovada",
  "pago",
  "paga",
  "payment_confirmed",
  "payment.confirmed",
  "order.paid",
  "order_paid",
  "purchase",
  "completed",
  "complete",
  "succeeded",
  "success",
];

// Caminhos onde pode estar o status ou tipo de evento da Zouti.
const STATUS_PATHS = [
  "event",
  "type",
  "event_type",
  "eventType",
  "status",
  "order.status",
  "order.payment_status",
  "data.status",
  "data.order.status",
  "data.payment.status",
  "payment.status",
  "transaction.status",
  "sale.status",
];

function isApproved(body: Record<string, unknown>): boolean {
  for (const path of STATUS_PATHS) {
    const raw = asString(pick(body, [path]));
    if (!raw) continue;
    const v = raw.toLowerCase().trim();
    if (PAID_VALUES.some((p) => v === p || v.includes(p))) return true;
  }
  return false;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // Seguranca: secret via query string ?key=...
  const secret = process.env.ZOUTI_WEBHOOK_SECRET;
  if (secret) {
    const key = Array.isArray(req.query.key) ? req.query.key[0] : req.query.key;
    if (key !== secret) {
      console.warn("ZOUTI_WEBHOOK_UNAUTHORIZED", { provided: key ? "present" : "missing" });
      return res.status(401).json({ error: "Unauthorized" });
    }
  } else {
    console.warn("ZOUTI_WEBHOOK_SECRET not set, skipping auth (configure later)");
  }

  try {
    const body: Record<string, unknown> =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};

    // Log defensivo: ainda nao temos o formato exato da Zouti, inspecionar via vercel logs.
    console.log("ZOUTI_WEBHOOK_PAYLOAD", JSON.stringify(body));

    // Filtro: so processa venda aprovada ou paga.
    if (!isApproved(body)) {
      console.log("ZOUTI_WEBHOOK_IGNORED", "status nao aprovado");
      return res.status(200).json({ ignored: true });
    }

    const PIXEL_ID = process.env.META_PIXEL_ID;
    const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;
    if (!PIXEL_ID || !ACCESS_TOKEN) {
      console.warn("META_PIXEL_ID or META_ACCESS_TOKEN not set");
      return res.status(200).json({ success: false, error: "Missing credentials" });
    }

    // Extracao defensiva: cada campo busca em varios caminhos possiveis com fallback.
    const email = asString(
      pick(body, [
        "customer.email",
        "buyer.email",
        "client.email",
        "data.customer.email",
        "order.customer.email",
        "user.email",
        "email",
      ])
    );

    const fullName = asString(
      pick(body, [
        "customer.name",
        "buyer.name",
        "client.name",
        "data.customer.name",
        "order.customer.name",
        "user.name",
        "name",
        "customer.full_name",
        "full_name",
      ])
    );

    const phone = asString(
      pick(body, [
        "customer.phone",
        "buyer.phone",
        "client.phone",
        "data.customer.phone",
        "order.customer.phone",
        "customer.whatsapp",
        "phone",
        "whatsapp",
        "telefone",
      ])
    );

    const document = asString(
      pick(body, [
        "customer.document",
        "buyer.document",
        "client.document",
        "data.customer.document",
        "customer.cpf",
        "document",
        "cpf",
      ])
    );

    // Valor: pode vir em reais ou centavos. Heuristica abaixo decide.
    const rawValue = pick(body, [
      "amount",
      "total",
      "order.total",
      "order.amount",
      "data.total",
      "data.amount",
      "value",
      "price",
      "payment.amount",
      "transaction.amount",
    ]);

    const currency =
      asString(
        pick(body, ["currency", "order.currency", "data.currency", "payment.currency"])
      ) || "BRL";

    // order_id ou transaction_id, usado como event_id determinastico (dedup e idempotencia).
    const orderId = asString(
      pick(body, [
        "order.id",
        "id",
        "transaction_id",
        "transactionId",
        "order_id",
        "orderId",
        "data.id",
        "data.order.id",
        "transaction.id",
        "sale.id",
        "code",
        "order.code",
      ])
    );

    // UTMs e origem do trafego, repassados pela Zouti a partir da URL do checkout (appendUtms).
    const utmSource = asString(
      pick(body, ["utm.utm_source", "tracking.utm_source", "utms.utm_source", "utm_source"])
    );
    const utmMedium = asString(
      pick(body, ["utm.utm_medium", "tracking.utm_medium", "utms.utm_medium", "utm_medium"])
    );
    const utmCampaign = asString(
      pick(body, ["utm.utm_campaign", "tracking.utm_campaign", "utms.utm_campaign", "utm_campaign"])
    );
    const utmContent = asString(
      pick(body, ["utm.utm_content", "tracking.utm_content", "utms.utm_content", "utm_content"])
    );
    const utmTerm = asString(
      pick(body, ["utm.utm_term", "tracking.utm_term", "utms.utm_term", "utm_term"])
    );

    const fbclid = asString(
      pick(body, ["utm.fbclid", "tracking.fbclid", "fbclid"])
    );
    const fbc = asString(
      pick(body, ["utm.fbc", "tracking.fbc", "fbc", "_fbc"])
    );
    const fbp = asString(
      pick(body, ["utm.fbp", "tracking.fbp", "fbp", "_fbp"])
    );
    const src = asString(pick(body, ["utm.src", "tracking.src", "src"]));

    const clientIp = asString(
      pick(body, [
        "customer.ip",
        "buyer.ip",
        "data.customer.ip",
        "ip",
        "tracking.ip",
        "browser.ip",
      ])
    );

    const userAgent = asString(
      pick(body, [
        "customer.user_agent",
        "buyer.user_agent",
        "data.customer.user_agent",
        "user_agent",
        "userAgent",
        "tracking.user_agent",
        "browser.user_agent",
      ])
    );

    const eventSourceUrl =
      asString(
        pick(body, [
          "checkout_url",
          "order.checkout_url",
          "data.checkout_url",
          "product.url",
          "url",
          "page_url",
          "tracking.url",
        ])
      ) || "https://dunascapital.vercel.app";

    // event_time: usa timestamp do payload se houver, senao agora.
    const tsRaw = pick(body, [
      "created_at",
      "order.created_at",
      "data.created_at",
      "timestamp",
      "paid_at",
      "approved_at",
    ]);
    let eventTime = Math.floor(Date.now() / 1000);
    if (typeof tsRaw === "number") {
      eventTime = tsRaw > 1e12 ? Math.floor(tsRaw / 1000) : tsRaw;
    } else if (typeof tsRaw === "string") {
      const parsed = Date.parse(tsRaw);
      if (!Number.isNaN(parsed)) eventTime = Math.floor(parsed / 1000);
    }

    // Valor numerico. Detecta centavos: inteiro grande sem casa decimal vira reais.
    let value = 0;
    if (typeof rawValue === "number") {
      value = rawValue;
      if (Number.isInteger(rawValue) && rawValue >= 1000) value = rawValue / 100;
    } else if (typeof rawValue === "string") {
      const normalized = rawValue.replace(/[^\d,.-]/g, "").replace(",", ".");
      const n = parseFloat(normalized);
      if (!Number.isNaN(n)) {
        value = n;
        // Se a string original nao tinha separador decimal e o numero eh grande, eram centavos.
        if (!/[.,]/.test(rawValue) && Number.isInteger(n) && n >= 1000) value = n / 100;
      }
    }

    // Monta user_data com PII hasheada (mesmo padrao do api/track.ts).
    const user_data: Record<string, unknown> = {};
    if (clientIp) user_data.client_ip_address = clientIp;
    if (userAgent) user_data.client_user_agent = userAgent;
    if (typeof fbp === "string" && fbp.startsWith("fb.")) user_data.fbp = fbp;
    if (typeof fbc === "string" && fbc.startsWith("fb.")) user_data.fbc = fbc;

    const em = hashField(email);
    if (em) user_data.em = [em];
    if (phone) user_data.ph = [sha256(String(phone).replace(/\D/g, ""))];

    if (fullName) {
      const parts = fullName.trim().split(/\s+/);
      const fn = hashField(parts[0]);
      if (fn) user_data.fn = [fn];
      if (parts.length > 1) {
        const ln = hashField(parts.slice(1).join(" "));
        if (ln) user_data.ln = [ln];
      }
    }

    // external_id: prioriza documento (CPF) como identificador estavel, senao email.
    const externalSeed = document ? String(document).replace(/\D/g, "") : email;
    if (externalSeed) user_data.external_id = [sha256(externalSeed.toLowerCase().trim())];

    const custom_data: Record<string, unknown> = { value, currency };
    if (orderId) custom_data.order_id = orderId;
    if (utmSource) custom_data.utm_source = utmSource;
    if (utmMedium) custom_data.utm_medium = utmMedium;
    if (utmCampaign) custom_data.utm_campaign = utmCampaign;
    if (utmContent) custom_data.utm_content = utmContent;
    if (utmTerm) custom_data.utm_term = utmTerm;
    if (fbclid) custom_data.fbclid = fbclid;
    if (src) custom_data.src = src;

    // event_id determinastico: usa order_id quando existe, garante dedup com pixel e
    // idempotencia se a Zouti reenviar (ate 6x). Sem order_id cai num id por email e tempo.
    const eventId = orderId
      ? `purchase_${orderId}`
      : `purchase_${sha256((email || "") + eventTime).substring(0, 24)}`;

    const payload: Record<string, unknown> = {
      data: [
        {
          event_name: "Purchase",
          event_time: eventTime,
          event_id: eventId,
          event_source_url: eventSourceUrl,
          action_source: "website",
          user_data,
          custom_data,
        },
      ],
    };

    const testEventCode = process.env.ZOUTI_TEST_EVENT_CODE;
    if (testEventCode) payload.test_event_code = testEventCode;

    const metaResp = await fetch(
      `https://graph.facebook.com/v22.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    const metaResponse = await metaResp.json();
    console.log("ZOUTI_WEBHOOK_META_RESPONSE", JSON.stringify(metaResponse), "event_id", eventId);

    return res.status(200).json({ success: true, event_id: eventId, meta_response: metaResponse });
  } catch (e) {
    // Sempre 200 para a Zouti nao reenviar infinitamente, mas loga o erro.
    console.error("ZOUTI_WEBHOOK_ERROR", e);
    return res.status(200).json({ success: false, error: String(e) });
  }
}
