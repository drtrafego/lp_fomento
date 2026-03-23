

## Meta Pixel Advanced Matching + CAPI Implementation

### Overview
Implement full Meta Pixel tracking with browser-side events, server-side Conversions API (CAPI), deduplication, Advanced Matching, UTM forwarding to checkout, and event persistence in the database.

### Prerequisites (User Action Required)
Before implementation, you need to add two secrets in **Settings → Cloud → Secrets**:
- `META_PIXEL_ID` — your 15-digit Pixel ID from Events Manager
- `META_ACCESS_TOKEN` — generated in Events Manager → Conversions API

The project currently has no Supabase/Cloud setup, so Lovable Cloud needs to be enabled first.

---

### Implementation Steps

#### 1. Add Meta Pixel to `index.html`
- Insert `fbq` script in `<head>` with `fbq('init', 'PIXEL_ID')` and `fbq('track', 'PageView')`
- Add `<noscript>` fallback in `<body>`
- Pixel ID will be hardcoded (it's a public/publishable ID)

#### 2. Create Database Table `pixel_events`
- Migration with all fields: `event_name`, `event_id`, `event_time`, `page_url`, `client_ip`, `user_agent`, `external_id`, `fbp`, `fbc`, UTM fields, `custom_data`, `meta_response`, location fields, and **hashed values** (`hashed_em`, `hashed_ph`, `hashed_fn`, `hashed_ln`, `hashed_ct`, `hashed_st`, `hashed_zp`, `hashed_country`)
- RLS: `INSERT` for anon, `SELECT` for authenticated

#### 3. Edge Function: `get-user-location`
- Reads IP from `x-forwarded-for`
- Calls `ip-api.com` for geolocation
- Returns `{ country, state, city, zip_code }`
- CORS headers included

#### 4. Edge Function: `meta-pixel-event`
- Validates event name (PageView, ViewContent, InitiateCheckout, Purchase)
- SHA-256 hashes PII fields per Meta spec (em, ph, fn, ln, ct, st, zp, country)
- Sends to Meta CAPI (`graph.facebook.com/v21.0/{PIXEL_ID}/events`)
- Saves all data + hash values to `pixel_events` table
- Optional webhook forwarding (unhashed data)

#### 5. Create `src/lib/metaPixelUtils.ts`
- `getExternalId()` — persistent UUID in localStorage
- `generateEventId()` — unique ID for deduplication
- `getUrlParams()` / `getStoredUtmParams()` — capture & persist UTMs
- `getFbCookies()` — read `_fbp`/`_fbc`, generate `_fbc` from `fbclid`
- `getClientInfo()` — user agent, page URL, title, referrer
- `getEventTimeDetails()` — unix time, day, time interval
- `saveLocationData()` / `getStoredLocationData()` — 24h cache
- `wasSectionViewed()` / `markSectionViewed()` — session dedup
- `buildCheckoutUrl()` — appends UTMs to CHECKOUT_URL

#### 6. Create `src/hooks/useMetaPixel.ts`
- Main hook: captures UTMs on mount, pre-fetches location
- `sendEvent()`: generates eventId → fires `fbq('track')` with eventID → calls edge function with full payload
- Exports: `trackPageView`, `trackViewContent`, `trackInitiateCheckout`, `trackPurchase`

#### 7. Create `src/hooks/useSectionTracking.ts`
- IntersectionObserver (threshold 0.2) to detect section visibility
- Fires ViewContent once per session per section
- Returns a ref to attach to `<section>`

#### 8. Integrate in `src/pages/Index.tsx`
- Call `trackPageView()` on mount
- Attach `useSectionTracking` refs to key sections (Hero, Autoridade, Oferta, etc.)
- Modify `GoldButton` / checkout links to call `trackInitiateCheckout` with product data (name: "Workshop Do Zero à Captação", value: 97.00, currency: BRL) and redirect to `buildCheckoutUrl()` (which appends UTMs)

### Product Data (auto-detected from page)
- **Product**: Workshop Do Zero à Captação
- **Price**: R$ 97,00
- **Currency**: BRL
- **Checkout**: Greenn (payfast.greenn.com.br)

### Technical Notes
- Deduplication: same `event_id` sent to both browser `fbq` and server CAPI
- Hash values stored in DB for audit/debugging
- Location cached 24h in localStorage to minimize API calls
- The existing `useUserState` hook (ipapi.co) will be replaced by the new location system via edge function

