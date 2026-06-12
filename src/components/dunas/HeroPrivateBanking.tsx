import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

import { dunasContent } from "@/content/dunas";
import { CtaButton } from "./sections";

// Hero da versão B (Private Banking). Sala fechada de gestão de fortunas:
// preto profundo, ouro champagne discreto, muito respiro, tipografia serif
// gigante. Um único feixe de luz champagne cruza a tela bem devagar. Grão
// sutil. Movimento mínimo. Fallback estático em mobile/reduced-motion.
export function HeroPrivateBanking({ onCta }: { onCta: (local: string) => void }) {
  const { hero } = dunasContent;
  const reduce = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  const animate = !reduce && !isMobile;

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center px-5 py-28 overflow-hidden"
      style={{ background: "var(--color-void)" }}
    >
      {/* mármore escuro: gradiente profundo do tema */}
      <div className="absolute inset-0" style={{ background: "var(--gradient-hero-bg)" }} />

      {/* feixe de luz champagne cruzando devagar */}
      {animate ? (
        <motion.div
          aria-hidden="true"
          className="absolute -inset-y-40 left-0 w-[55vw] pointer-events-none"
          style={{
            background:
              "linear-gradient(105deg, transparent 0%, var(--color-gold-halo) 38%, var(--color-gold-muted) 50%, var(--color-gold-halo) 62%, transparent 100%)",
            filter: "blur(40px)",
            opacity: 0.5,
          }}
          initial={{ x: "-30vw", rotate: 12 }}
          animate={{ x: "120vw", rotate: 12 }}
          transition={{ duration: 26, ease: "linear", repeat: Infinity, repeatType: "loop" }}
        />
      ) : (
        <div
          aria-hidden="true"
          className="absolute -inset-y-40 left-[20vw] w-[45vw] pointer-events-none"
          style={{
            background:
              "linear-gradient(105deg, transparent 0%, var(--color-gold-halo) 40%, var(--color-gold-muted) 50%, var(--color-gold-halo) 60%, transparent 100%)",
            filter: "blur(48px)",
            opacity: 0.35,
            transform: "rotate(12deg)",
          }}
        />
      )}

      {/* grão sutil */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-[0.06]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        <p
          className="hero-in text-[11px] sm:text-xs uppercase tracking-[0.42em] font-medium mb-10"
          style={{ color: "var(--color-gold-muted)" }}
        >
          {hero.eyebrow}
        </p>
        <h1
          className="hero-in font-serif-dunas leading-[1.02] text-[clamp(40px,8vw,92px)]"
          style={{ color: "var(--color-text-primary)" }}
        >
          {hero.h1}
          <span style={{ color: "var(--color-gold-light)" }}>{hero.h1Highlight}</span>
          {hero.h1After}
        </h1>
        <p
          className="hero-in mx-auto mt-10 max-w-2xl text-base sm:text-lg leading-relaxed"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {hero.sub}
        </p>
        <div className="hero-in mt-12">
          <CtaButton onClick={() => onCta("Hero")} size="lg">
            {hero.cta}
          </CtaButton>
        </div>
      </div>

      {/* linha fina dourada na base, fecho elegante de "sala fechada" */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-20"
        style={{ background: "linear-gradient(to bottom, transparent, var(--color-gold-muted))" }}
      />
    </section>
  );
}
