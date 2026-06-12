import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

import { dunasContent } from "@/content/dunas";
import { CtaButton } from "./sections";

// Hero da versão C (Prova e Números). Painel de fintech / terminal Bloomberg:
// o protagonista é o DADO. "R$ 50 milhões" gigante com CountUp, gráfico de linha
// ascendente animado por SVG e chips de cotação com os valores reais dos
// depoimentos surgindo em stagger. Fallback estático em mobile/reduced-motion.

// Cotações reais extraídas da prova social (não é texto novo: são os mesmos
// valores já presentes na copy de depoimentos/bullets).
const COTACOES = [
  { handle: "@instabovreal", valor: "R$ 734 mil" },
  { handle: "@energiaquasis", valor: "R$ 480 mil" },
  { handle: "@bulldogburguer", valor: "R$ 420 mil" },
  { handle: "@impar.gestao", valor: "R$ 39 mil" },
];

// Polyline ascendente (0 a 100 em x e y invertido). Sugere capital em alta.
const LINHA_PONTOS = "0,86 14,80 28,72 42,66 56,50 70,44 84,28 100,12";

function useCountUp(target: number, durationMs: number, enabled: boolean) {
  const [value, setValue] = useState(enabled ? 0 : target);

  useEffect(() => {
    if (!enabled) {
      setValue(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / durationMs, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(eased * target));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs, enabled]);

  return value;
}

export function HeroDados({ onCta }: { onCta: (local: string) => void }) {
  const { hero } = dunasContent;
  const reduce = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);
  const lineRef = useRef<SVGPolylineElement>(null);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  const animate = !reduce && !isMobile;
  const count = useCountUp(50, 1600, animate);

  useEffect(() => {
    const el = lineRef.current;
    if (!el) return;
    const len = el.getTotalLength();
    el.style.strokeDasharray = `${len}`;
    if (!animate) {
      el.style.strokeDashoffset = "0";
      return;
    }
    el.style.strokeDashoffset = `${len}`;
    el.style.transition = "stroke-dashoffset 1.8s ease-out 0.2s";
    requestAnimationFrame(() => {
      el.style.strokeDashoffset = "0";
    });
  }, [animate]);

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center px-5 py-24 overflow-hidden"
      style={{ background: "var(--color-void)" }}
    >
      <div className="absolute inset-0" style={{ background: "var(--gradient-hero-bg)" }} />

      {/* grade de painel financeiro ao fundo */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-[0.10]"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-line) 1px, transparent 1px), linear-gradient(90deg, var(--color-line) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 40%, #000 0%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 40%, #000 0%, transparent 80%)",
        }}
      />

      {/* gráfico ascendente ao fundo */}
      <svg
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 w-full h-[55vh] pointer-events-none"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="dunasC-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-gold)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="var(--color-gold)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={`${LINHA_PONTOS} 100,100 0,100`} fill="url(#dunasC-fill)" />
        <polyline
          ref={lineRef}
          points={LINHA_PONTOS}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="0.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          style={{ filter: "drop-shadow(0 0 6px var(--color-accent))" }}
        />
      </svg>

      {/* chips de cotação flutuantes (desktop) */}
      {COTACOES.map((c, i) => {
        const pos = [
          "top-[16%] left-[6%]",
          "top-[24%] right-[7%]",
          "bottom-[30%] left-[8%]",
          "bottom-[22%] right-[9%]",
        ][i];
        return (
          <motion.div
            key={c.handle}
            className={`hidden lg:flex absolute ${pos} flex-col rounded-xl px-4 py-2.5 backdrop-blur-sm`}
            style={{
              background: "var(--color-surface-1)",
              border: "1px solid var(--color-line)",
              boxShadow: "0 8px 30px -12px var(--color-accent)",
            }}
            initial={animate ? { opacity: 0, y: 14 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + i * 0.18, duration: 0.6, ease: "easeOut" }}
          >
            <span className="text-[10px] uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
              {c.handle}
            </span>
            <span className="font-serif-dunas italic text-lg leading-tight" style={{ color: "var(--color-gold-light)" }}>
              {c.valor}
            </span>
            <span className="text-[10px] tracking-wider" style={{ color: "var(--color-accent)" }}>
              captado
            </span>
          </motion.div>
        );
      })}

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <p
          className="hero-in text-xs sm:text-sm uppercase tracking-[0.28em] font-medium mb-6"
          style={{ color: "var(--color-gold)" }}
        >
          {hero.eyebrow}
        </p>

        {/* dado protagonista */}
        <div className="hero-in mb-2">
          <span className="dunas-hero-number block text-[clamp(72px,16vw,180px)] leading-none tabular-nums">
            R$ {count} mi
          </span>
          <span
            className="block mt-2 text-sm sm:text-base uppercase tracking-[0.22em]"
            style={{ color: "var(--color-text-secondary)" }}
          >
            captados para empresas como a sua
          </span>
        </div>

        <h1
          className="hero-in font-serif-dunas leading-[1.06] text-[clamp(28px,4.4vw,48px)] mt-8"
          style={{ color: "var(--color-text-primary)" }}
        >
          {hero.h1}
          <span style={{ color: "var(--color-gold-light)" }}>{hero.h1Highlight}</span>
          {hero.h1After}
        </h1>
        <p
          className="hero-in mx-auto mt-6 max-w-2xl text-base sm:text-lg leading-relaxed"
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
    </section>
  );
}
