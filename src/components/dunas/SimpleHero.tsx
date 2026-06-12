import { dunasContent } from "@/content/dunas";
import { CtaButton } from "./sections";

// Hero estático provisório das versões B/C/D. Renderiza H1/sub/CTA da copy sobre
// o gradiente do tema, sem 3D. Cada versão vai especializar o próprio hero depois.
export function SimpleHero({ onCta }: { onCta: (local: string) => void }) {
  const { hero } = dunasContent;
  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center px-5 py-24 overflow-hidden">
      <div className="absolute inset-0" style={{ background: "var(--gradient-hero-bg)" }} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: "var(--gradient-glow-h)" }} />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
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
          <CtaButton onClick={() => onCta("Hero")} size="lg">
            {hero.cta}
          </CtaButton>
        </div>
      </div>
    </section>
  );
}
