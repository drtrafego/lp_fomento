import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

import { dunasContent } from "@/content/dunas";
import { CtaButton } from "./sections";
import decretoImg from "@/assets/lei-decreto.webp";

// Hero da versão D (Mecanismo Legal). Respaldo do Estado e autoridade
// institucional. Coluna esquerda: eyebrow legal + H1 + CTA. Coluna direita:
// imagem do Decreto-Lei com tratamento nobre e parallax sutil. Abaixo, os
// órgãos federais conectados por linhas de luz douradas que convergem para um
// nó central "Dunas Capital". Movimento contido. Fallback em mobile/reduced-motion.

const ORGAOS = ["FINEP", "CNPq", "BNDES", "SEBRAE", "EMBRAPII", "CAPES"];

// Coordenadas no viewBox 800x220: nó central + 6 órgãos em arco.
const CENTRO = { x: 400, y: 178 };
const NOS = [
  { x: 70, y: 70 },
  { x: 215, y: 42 },
  { x: 360, y: 30 },
  { x: 440, y: 30 },
  { x: 585, y: 42 },
  { x: 730, y: 70 },
];

export function HeroLei({ onCta }: { onCta: (local: string) => void }) {
  const { hero } = dunasContent;
  const reduce = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  const animate = !reduce && !isMobile;

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const decretoY = useTransform(scrollYProgress, [0, 1], [0, animate ? -40 : 0]);

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative min-h-screen flex items-center px-5 py-24 overflow-hidden"
      style={{ background: "var(--color-void)" }}
    >
      <div className="absolute inset-0" style={{ background: "var(--gradient-hero-bg)" }} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: "var(--gradient-glow-h)" }} />

      <div className="relative z-10 max-w-6xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* coluna esquerda: autoridade legal */}
          <div className="text-center lg:text-left">
            <span
              className="hero-in inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] mb-7"
              style={{ background: "var(--color-gold-halo)", color: "var(--color-gold-light)", border: "1px solid var(--color-line)" }}
            >
              Garantido por lei desde 1969
            </span>
            <h1
              className="hero-in font-serif-dunas leading-[1.04] text-[clamp(34px,5.2vw,64px)]"
              style={{ color: "var(--color-text-primary)" }}
            >
              {hero.h1}
              <span style={{ color: "var(--color-gold-light)" }}>{hero.h1Highlight}</span>
              {hero.h1After}
            </h1>
            <p
              className="hero-in mt-7 max-w-xl mx-auto lg:mx-0 text-base sm:text-lg leading-relaxed"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {hero.sub}
            </p>
            <div className="hero-in mt-9">
              <CtaButton onClick={() => onCta("Hero")} size="lg">
                {hero.cta}
              </CtaButton>
            </div>
          </div>

          {/* coluna direita: decreto com moldura nobre e parallax */}
          <motion.div className="hero-in relative mx-auto max-w-md" style={{ y: decretoY }}>
            <div
              className="absolute -inset-6 rounded-3xl pointer-events-none"
              style={{ background: "var(--gradient-glow-h)" }}
            />
            <div
              className="relative rounded-2xl overflow-hidden"
              style={{
                border: "1px solid var(--color-line)",
                boxShadow: "0 30px 80px -30px var(--color-gold), inset 0 0 0 1px var(--color-gold-halo)",
              }}
            >
              <img
                src={decretoImg}
                alt="Decreto-Lei nº 719, de 31 de Julho de 1969"
                className="w-full h-auto block"
                loading="eager"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none"
                style={{ background: "linear-gradient(160deg, transparent 55%, var(--color-gold-halo) 100%)" }}
              />
            </div>
            <p
              className="mt-4 text-center text-xs uppercase tracking-[0.2em]"
              style={{ color: "var(--color-text-muted)" }}
            >
              Decreto-Lei nº 719 / 1969
            </p>
          </motion.div>
        </div>

        {/* órgãos federais convergindo para o nó central Dunas Capital */}
        <div className="relative mt-14 lg:mt-20">
          <svg
            aria-hidden="true"
            viewBox="0 0 800 220"
            className="w-full h-auto"
            preserveAspectRatio="xMidYMid meet"
          >
            {NOS.map((n, i) => {
              const d = `M ${n.x} ${n.y} Q ${(n.x + CENTRO.x) / 2} ${n.y + 30} ${CENTRO.x} ${CENTRO.y}`;
              return (
                <motion.path
                  key={i}
                  d={d}
                  fill="none"
                  stroke="var(--color-gold)"
                  strokeWidth="1.2"
                  strokeOpacity="0.55"
                  style={{ filter: "drop-shadow(0 0 3px var(--color-gold))" }}
                  initial={animate ? { pathLength: 0, opacity: 0 } : false}
                  animate={{ pathLength: 1, opacity: 0.55 }}
                  transition={{ delay: 0.4 + i * 0.12, duration: 1, ease: "easeInOut" }}
                />
              );
            })}

            {/* nó central */}
            <circle cx={CENTRO.x} cy={CENTRO.y} r="7" fill="var(--color-gold-light)" style={{ filter: "drop-shadow(0 0 8px var(--color-gold))" }} />
            <text
              x={CENTRO.x}
              y={CENTRO.y + 26}
              textAnchor="middle"
              className="font-serif-dunas"
              style={{ fill: "var(--color-gold-light)", fontSize: "15px" }}
            >
              Dunas Capital
            </text>

            {/* nós dos órgãos */}
            {NOS.map((n, i) => (
              <g key={`org-${i}`}>
                <circle cx={n.x} cy={n.y} r="4" fill="var(--color-gold)" />
                <text
                  x={n.x}
                  y={n.y - 12}
                  textAnchor="middle"
                  style={{ fill: "var(--color-text-secondary)", fontSize: "13px", letterSpacing: "0.04em" }}
                >
                  {ORGAOS[i]}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>
    </section>
  );
}
