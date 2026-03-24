import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AnalyticsEvent {
  event_type: string;
  session_id: string;
  external_id: string | null;
  section_name?: string | null;
  scroll_percent?: number | null;
  viewport_x?: number | null;
  viewport_y?: number | null;
  viewport_width?: number | null;
  viewport_height?: number | null;
  page_height?: number | null;
  click_target?: string | null;
  time_on_page?: number | null;
  user_agent?: string | null;
  referrer?: string | null;
}

function getSessionId(): string {
  let sid = sessionStorage.getItem("pa_sid");
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem("pa_sid", sid);
  }
  return sid;
}

function getExternalId(): string | null {
  return localStorage.getItem("external_id");
}

function getVisibleSection(): string | null {
  const sections = document.querySelectorAll("section[data-section]");
  let best: string | null = null;
  let bestRatio = 0;
  sections.forEach((el) => {
    const rect = el.getBoundingClientRect();
    const visible = Math.max(0, Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0));
    const ratio = visible / window.innerHeight;
    if (ratio > bestRatio) {
      bestRatio = ratio;
      best = (el as HTMLElement).dataset.section || null;
    }
  });
  return best;
}

export function usePageAnalytics() {
  const bufferRef = useRef<AnalyticsEvent[]>([]);
  const scrollMilestonesRef = useRef<Set<number>>(new Set());
  const startTimeRef = useRef(Date.now());
  const flushingRef = useRef(false);

  const sessionId = useRef(getSessionId()).current;
  const externalId = useRef(getExternalId()).current;

  const enqueue = useCallback((event: Partial<AnalyticsEvent>) => {
    bufferRef.current.push({
      event_type: "unknown",
      session_id: sessionId,
      external_id: externalId,
      user_agent: navigator.userAgent,
      referrer: document.referrer || null,
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight,
      page_height: document.documentElement.scrollHeight,
      ...event,
    });
  }, [sessionId, externalId]);

  const flush = useCallback(async () => {
    if (flushingRef.current || bufferRef.current.length === 0) return;
    flushingRef.current = true;
    const batch = bufferRef.current.splice(0);
    try {
      await supabase.from("page_analytics").insert(batch);
    } catch (e) {
      bufferRef.current.unshift(...batch);
    }
    flushingRef.current = false;
  }, []);

  useEffect(() => {
    enqueue({ event_type: "page_view" });

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      const percent = Math.round((scrollTop / docHeight) * 100);

      for (const milestone of [25, 50, 75, 100]) {
        if (percent >= milestone && !scrollMilestonesRef.current.has(milestone)) {
          scrollMilestonesRef.current.add(milestone);
          enqueue({
            event_type: "scroll",
            scroll_percent: milestone,
            section_name: getVisibleSection(),
          });
        }
      }
    };

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const tag = target.tagName.toLowerCase();
      const text = (target.textContent || "").slice(0, 50).trim();
      const closest = target.closest("section[data-section]");
      const section = closest ? (closest as HTMLElement).dataset.section : null;

      enqueue({
        event_type: "click",
        viewport_x: e.clientX,
        viewport_y: e.clientY + window.scrollY,
        click_target: `${tag}:${text}`,
        section_name: section,
      });
    };

    let scrollTimer: ReturnType<typeof setTimeout> | null = null;
    const throttledScroll = () => {
      if (scrollTimer) return;
      scrollTimer = setTimeout(() => {
        scrollTimer = null;
        handleScroll();
      }, 300);
    };

    window.addEventListener("scroll", throttledScroll, { passive: true });
    document.addEventListener("click", handleClick, { passive: true });

    const intervalId = setInterval(flush, 5000);

    const handleBeforeUnload = () => {
      const timeOnPage = Math.round((Date.now() - startTimeRef.current) / 1000);
      enqueue({
        event_type: "exit",
        section_name: getVisibleSection(),
        time_on_page: timeOnPage,
      });
      
      const batch = bufferRef.current.splice(0);
      if (batch.length > 0) {
        const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/page_analytics`;
        const headers = {
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        };
        try {
          fetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify(batch),
            keepalive: true,
          }).catch(() => {});
        } catch {
          // silent fail
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("scroll", throttledScroll);
      document.removeEventListener("click", handleClick);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      clearInterval(intervalId);
      if (scrollTimer) clearTimeout(scrollTimer);
      flush();
    };
  }, [enqueue, flush]);
}
