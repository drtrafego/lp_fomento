import { useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
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

      supabase.functions.invoke("meta-pixel-event", {
        body: {
          event_name: "PageView",
          event_id: eventId,
          page_url: clientInfo.page_url,
          page_title: clientInfo.page_title,
          referrer: clientInfo.referrer,
          user_agent: clientInfo.user_agent,
          external_id: externalId,
          fbp, fbc,
          country: location.country || "",
          state: location.state || "",
          city: location.city || "",
          zip_code: location.zip_code || "",
          utm_source: utms.utm_source || "",
          utm_medium: utms.utm_medium || "",
          utm_campaign: utms.utm_campaign || "",
          utm_content: utms.utm_content || "",
          utm_term: utms.utm_term || "",
          fbclid: utms.fbclid || "",
          custom_data: {},
        },
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
        supabase.functions
          .invoke("get-user-location")
          .then(({ data }) => {
            if (data) {
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

      // 2. Send to server-side CAPI via edge function
      try {
        await supabase.functions.invoke("meta-pixel-event", {
          body: {
            event_name: eventName,
            event_id: eventId,
            page_url: clientInfo.page_url,
            page_title: clientInfo.page_title,
            referrer: clientInfo.referrer,
            user_agent: clientInfo.user_agent,
            external_id: externalId,
            fbp,
            fbc,
            country: location.country || "",
            state: location.state || "",
            city: location.city || "",
            zip_code: location.zip_code || "",
            utm_source: utms.utm_source || "",
            utm_medium: utms.utm_medium || "",
            utm_campaign: utms.utm_campaign || "",
            utm_content: utms.utm_content || "",
            utm_term: utms.utm_term || "",
            fbclid: utms.fbclid || "",
            custom_data: customData,
            // PII (if provided)
            email: userData.email,
            phone: userData.phone,
            first_name: userData.first_name,
            last_name: userData.last_name,
          },
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

  const trackPurchase = useCallback(
    (userData: Record<string, any> = {}, purchaseData: Record<string, any> = {}) =>
      sendEvent("Purchase", userData, purchaseData),
    [sendEvent]
  );

  return { trackPageView, trackViewContent, trackPurchase };
}
