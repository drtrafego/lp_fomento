import { useEffect, useCallback, useRef } from "react";
import {
  getExternalId,
  generateEventId,
  getUrlParams,
  getStoredUtmParams,
  getFbCookies,
  getClientInfo,
  saveLocationData,
  getStoredLocationData,
} from "@/lib/metaPixelUtils";

const PIXEL_ID = "1649493576054636";

// Le o test_event_code da URL (?test_event_code=...) e persiste na sessao.
// Permite validar os eventos no Events Manager > Test Events.
function getTestEventCode(): string | undefined {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get("test_event_code");
    if (fromUrl) {
      sessionStorage.setItem("meta_test_event_code", fromUrl);
      return fromUrl;
    }
    return sessionStorage.getItem("meta_test_event_code") || undefined;
  } catch {
    return undefined;
  }
}

// Envia o evento para o tracking server side no Vercel (/api/track).
async function postTrack(body: Record<string, unknown>): Promise<void> {
  await fetch("/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    keepalive: true,
  });
}

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
  }
}

function initAdvancedMatching(location: any) {
  if (!window.fbq) return;
  const externalId = getExternalId();
  const { fbp, fbc } = getFbCookies();
  
  const advancedMatchingData: Record<string, string> = {
    external_id: externalId,
  };

  // Add location-based data
  if (location?.country) advancedMatchingData.country = location.country.toLowerCase().slice(0, 2);
  if (location?.state) advancedMatchingData.st = location.state.toLowerCase().slice(0, 2);
  if (location?.city) advancedMatchingData.ct = location.city.toLowerCase().replace(/\s/g, "");
  if (location?.zip_code) advancedMatchingData.zp = location.zip_code.replace(/\D/g, "");
  if (fbp) advancedMatchingData.fbp = fbp;
  if (fbc) advancedMatchingData.fbc = fbc;

  // Re-init pixel with Advanced Matching data
  window.fbq("init", PIXEL_ID, advancedMatchingData);
}

export function useMetaPixel() {
  const locationRef = useRef<any>(null);
  const initialized = useRef(false);
  const advancedMatchingReady = useRef(false);
  const pendingPageView = useRef(false);

  const firePageViewIfReady = useCallback(() => {
    if (advancedMatchingReady.current && pendingPageView.current) {
      pendingPageView.current = false;
      const eventId = generateEventId();
      const externalId = getExternalId();
      const { fbp, fbc } = getFbCookies();
      const clientInfo = getClientInfo();
      const utms = getStoredUtmParams();
      const location = locationRef.current || getStoredLocationData() || {};

      if (window.fbq) {
        window.fbq("track", "PageView", {}, { eventID: eventId });
      }

      postTrack({
        event_name: "PageView",
        event_id: eventId,
        page_url: clientInfo.page_url,
        page_title: clientInfo.page_title,
        referrer: clientInfo.referrer,
        user_agent: clientInfo.user_agent,
        external_id: externalId,
        fbp: fbp || undefined,
        fbc: fbc || undefined,
        country: location.country || undefined,
        state: location.state || undefined,
        city: location.city || undefined,
        zip_code: location.zip_code || undefined,
        utm_source: utms.utm_source || undefined,
        utm_medium: utms.utm_medium || undefined,
        utm_campaign: utms.utm_campaign || undefined,
        utm_content: utms.utm_content || undefined,
        utm_term: utms.utm_term || undefined,
        fbclid: utms.fbclid || undefined,
        custom_data: {},
        test_event_code: getTestEventCode(),
      }).catch(console.error);
    }
  }, []);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Capture UTMs from URL
    getUrlParams();

    // Pre-fetch location and enable Advanced Matching
    const cached = getStoredLocationData();
    if (cached) {
      locationRef.current = cached;
      initAdvancedMatching(cached);
      advancedMatchingReady.current = true;
      firePageViewIfReady();
    } else {
      const fetchLocation = () => {
        fetch("/api/location")
          .then((r) => r.json())
          .then((data) => {
            if (data && data.country) {
              locationRef.current = data;
              saveLocationData(data);
              initAdvancedMatching(data);
            }
            advancedMatchingReady.current = true;
            firePageViewIfReady();
          })
          .catch((e) => {
            console.error(e);
            advancedMatchingReady.current = true;
            firePageViewIfReady();
          });
      };
      // Defer location fetch so it doesn't block LCP
      if ("requestIdleCallback" in window) {
        (window as any).requestIdleCallback(fetchLocation, { timeout: 3000 });
      } else {
        setTimeout(fetchLocation, 3000);
      }
    }
  }, [firePageViewIfReady]);

  const sendEvent = useCallback(
    async (
      eventName: string,
      userData: Record<string, any> = {},
      customData: Record<string, any> = {}
    ) => {
      const eventId = generateEventId();
      const externalId = getExternalId();
      const { fbp, fbc } = getFbCookies();
      const clientInfo = getClientInfo();
      const utms = getStoredUtmParams();
      const location = locationRef.current || getStoredLocationData() || {};

      // 1. Fire browser-side fbq with eventID for deduplication
      if (window.fbq) {
        window.fbq("track", eventName, customData, { eventID: eventId });
      }

      // 2. Send to server-side CAPI via Vercel function (/api/track)
      try {
        await postTrack({
          event_name: eventName,
          event_id: eventId,
          page_url: clientInfo.page_url,
          page_title: clientInfo.page_title,
          referrer: clientInfo.referrer,
          user_agent: clientInfo.user_agent,
          external_id: externalId,
          fbp: fbp || undefined,
          fbc: fbc || undefined,
          country: location.country || undefined,
          state: location.state || undefined,
          city: location.city || undefined,
          zip_code: location.zip_code || undefined,
          utm_source: utms.utm_source || undefined,
          utm_medium: utms.utm_medium || undefined,
          utm_campaign: utms.utm_campaign || undefined,
          utm_content: utms.utm_content || undefined,
          utm_term: utms.utm_term || undefined,
          fbclid: utms.fbclid || undefined,
          custom_data: customData,
          // PII (if provided)
          email: userData.email,
          phone: userData.phone,
          first_name: userData.first_name,
          last_name: userData.last_name,
          test_event_code: getTestEventCode(),
        });
      } catch (e) {
        console.error("Meta pixel event error:", e);
      }
    },
    []
  );

  const trackPageView = useCallback(() => {
    pendingPageView.current = true;
    if (advancedMatchingReady.current) {
      firePageViewIfReady();
    }
  }, [firePageViewIfReady]);

  const trackViewContent = useCallback(
    (contentName: string, contentCategory: string) =>
      sendEvent("ViewContent", {}, { content_name: contentName, content_category: contentCategory }),
    [sendEvent]
  );

  const trackLead = useCallback(
    (customData: Record<string, any> = {}, userData: Record<string, any> = {}) =>
      sendEvent("Lead", userData, customData),
    [sendEvent]
  );

  const trackInitiateCheckout = useCallback(
    (customData: Record<string, any> = {}, userData: Record<string, any> = {}) =>
      sendEvent("InitiateCheckout", userData, customData),
    [sendEvent]
  );

  return { trackPageView, trackViewContent, trackLead, trackInitiateCheckout };
}
