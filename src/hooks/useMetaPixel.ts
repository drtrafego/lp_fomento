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

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
  }
}

export function useMetaPixel() {
  const locationRef = useRef<any>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Capture UTMs from URL
    getUrlParams();

    // Pre-fetch location
    const cached = getStoredLocationData();
    if (cached) {
      locationRef.current = cached;
    } else {
      supabase.functions
        .invoke("get-user-location")
        .then(({ data }) => {
          if (data) {
            locationRef.current = data;
            saveLocationData(data);
          }
        })
        .catch(console.error);
    }
  }, []);

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

  const trackPageView = useCallback(() => sendEvent("PageView"), [sendEvent]);

  const trackViewContent = useCallback(
    (contentName: string, contentCategory: string) =>
      sendEvent("ViewContent", {}, { content_name: contentName, content_category: contentCategory }),
    [sendEvent]
  );

  const trackInitiateCheckout = useCallback(
    (userData: Record<string, any> = {}, productData: Record<string, any> = {}) =>
      sendEvent("InitiateCheckout", userData, productData),
    [sendEvent]
  );

  const trackPurchase = useCallback(
    (userData: Record<string, any> = {}, purchaseData: Record<string, any> = {}) =>
      sendEvent("Purchase", userData, purchaseData),
    [sendEvent]
  );

  return { trackPageView, trackViewContent, trackInitiateCheckout, trackPurchase };
}
