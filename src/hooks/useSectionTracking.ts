import { useRef, useEffect } from "react";
import { useMetaPixel } from "./useMetaPixel";
import { wasSectionViewed, markSectionViewed } from "@/lib/metaPixelUtils";

interface SectionTrackingOptions {
  sectionName: string;
  contentCategory?: string;
  threshold?: number;
}

export function useSectionTracking({
  sectionName,
  contentCategory = "landing_page_section",
  threshold = 0.2,
}: SectionTrackingOptions) {
  const ref = useRef<HTMLElement>(null);
  const { trackViewContent } = useMetaPixel();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (wasSectionViewed(sectionName)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !wasSectionViewed(sectionName)) {
          markSectionViewed(sectionName);
          trackViewContent(sectionName, contentCategory);
          observer.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -10% 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [sectionName, contentCategory, threshold, trackViewContent]);

  return ref;
}
