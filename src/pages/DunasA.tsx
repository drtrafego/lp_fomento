import { lazy, Suspense } from "react";

import { dunasContent } from "@/content/dunas";
import { useDunasPage } from "@/components/dunas/useDunasPage";
import { DunasShell } from "@/components/dunas/DunasShell";
import { dunasThemeA } from "@/components/dunas/themes";
import { CtaButton } from "@/components/dunas/sections";

// WebGL (Three.js) sob demanda: em mobile/reduced-motion nem entra no bundle inicial.
const HeroCanvas = lazy(() =>
  import("@/components/dunas/HeroCanvas").then((m) => ({ default: m.HeroCanvas })),
);

// ─── Versão A · Capital em Fluxo (hero R3F de partículas) ───
export default function DunasA() {
  const { root, handleCta } = useDunasPage();
  const { hero } = dunasContent;

  const HeroA = (
    <section id="hero" className="relative min-h-screen flex items-center justify-center px-5 py-24 overflow-hidden">
      <Suspense fallback={<div className="absolute inset-0" style={{ background: "var(--gradient-hero-bg)" }} />}>
        <HeroCanvas />
      </Suspense>
      <div className="absolute inset-0 pointer-events-none" style={{ background: "var(--gradient-glow-h)" }} />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <div
          className="inline-block rounded-2xl px-6 py-8 sm:px-10 sm:py-12"
          style={{ backdropFilter: "blur(2px)", WebkitBackdropFilter: "blur(2px)" }}
        >
          <p
            className="hero-in text-xs sm:text-sm uppercase tracking-[0.28em] font-medium mb-6"
            style={{ color: "var(--color-gold)" }}
          >
            {hero.eyebrow}
          </p>
          <h1 className="hero-in font-serif-dunas leading-[1.05] text-[clamp(34px,6vw,68px)]" style={{ color: "var(--color-text-primary)" }}>
            {hero.h1}
            <span style={{ color: "var(--color-gold-light)" }}>{hero.h1Highlight}</span>
            {hero.h1After}
          </h1>
          <p className="hero-in mx-auto mt-7 max-w-2xl text-base sm:text-lg leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
            {hero.sub}
          </p>
          <div className="hero-in mt-9">
            <CtaButton onClick={() => handleCta("Hero")} size="lg">
              {hero.cta}
            </CtaButton>
          </div>
        </div>
      </div>
    </section>
  );

  return <DunasShell theme={dunasThemeA} hero={HeroA} rootRef={root} onCta={handleCta} />;
}
