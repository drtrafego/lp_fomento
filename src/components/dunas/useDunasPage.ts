import { useCallback, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import { useLenis } from "@/hooks/useLenis";
import { useMetaPixel } from "@/hooks/useMetaPixel";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Destino do CTA: rota interna /quiz, preservando UTMs/fbclid.
function buildQuizUrl(): string {
  const search = window.location.search || "";
  return `/quiz${search}`;
}

// Lógica compartilhada pelas 4 versões da LP Dunas: smooth scroll, tracking,
// handler de CTA e animações de reveal/pin comuns a todas as seções extraídas.
// Cada versão só precisa cuidar do seu hero. Retorna a ref de root para o
// container e o handler de CTA.
export function useDunasPage() {
  useLenis(true);
  const { trackPageView, trackLead, trackInitiateCheckout } = useMetaPixel();
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    trackPageView();
  }, [trackPageView]);

  const handleCta = useCallback(
    (local: string) => {
      trackLead({ content_name: "Diagnostico", content_category: "Dunas Capital" });
      trackInitiateCheckout({ content_name: "Diagnostico Dunas", content_category: local });
      window.location.href = buildQuizUrl();
    },
    [trackLead, trackInitiateCheckout],
  );

  useGSAP(
    () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) {
        gsap.set([".hero-in", ".reveal", ".reveal-stagger > *"], { opacity: 1, y: 0, clipPath: "none" });
        return;
      }

      gsap.timeline({ delay: 0.2 }).from(".hero-in", {
        y: 26,
        opacity: 0,
        duration: 0.85,
        ease: "power3.out",
        stagger: 0.14,
      });

      gsap.utils.toArray<HTMLElement>(".reveal").forEach((el) => {
        gsap.from(el, {
          y: 42,
          opacity: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 85%" },
        });
      });

      gsap.utils.toArray<HTMLElement>(".reveal-stagger").forEach((group) => {
        gsap.from(group.children, {
          y: 36,
          opacity: 0,
          duration: 0.7,
          ease: "power2.out",
          stagger: 0.1,
          scrollTrigger: { trigger: group, start: "top 82%" },
        });
      });

      const solucao = root.current?.querySelector(".solucao-pin") as HTMLElement | null;
      if (solucao) {
        const stick = solucao.querySelector(".solucao-stick");
        const img = solucao.querySelector(".solucao-img");
        if (img) {
          gsap.fromTo(
            img,
            { scale: 1.08, opacity: 0.7 },
            {
              scale: 1,
              opacity: 1,
              ease: "none",
              scrollTrigger: { trigger: solucao, start: "top top", end: "+=60%", pin: stick, scrub: true },
            },
          );
        }
      }

      const line = root.current?.querySelector(".steps-line") as SVGPathElement | null;
      if (line) {
        const len = line.getTotalLength();
        gsap.set(line, { strokeDasharray: len, strokeDashoffset: len });
        gsap.to(line, {
          strokeDashoffset: 0,
          ease: "none",
          scrollTrigger: { trigger: ".steps-section", start: "top 70%", end: "bottom 70%", scrub: true },
        });
      }
    },
    { scope: root },
  );

  return { root, handleCta };
}
