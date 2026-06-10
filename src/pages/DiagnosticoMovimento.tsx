import { useCallback, useEffect, useRef } from "react";
import { Clock, Gift, Users, ArrowRight, ShieldCheck, ScrollText, Sparkles } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import { useLenis } from "@/hooks/useLenis";
import { useMetaPixel } from "@/hooks/useMetaPixel";
import { usePageAnalytics } from "@/hooks/usePageAnalytics";
import { ParticleField } from "@/components/cinematic/ParticleField";
import { CountUp } from "@/components/cinematic/CountUp";
import { ScrollStory } from "@/components/cinematic/ScrollStory";
import { diagnostico, buildDiagnosticoUrl } from "@/content/diagnostico";

import pedroIgor from "@/assets/pedro-igor.webp";
import leiDecreto from "@/assets/lei-decreto.webp";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const badgeIcon = { clock: Clock, gift: Gift, users: Users } as const;

export default function DiagnosticoMovimento() {
  useLenis(true);
  const { trackPageView, trackLead } = useMetaPixel();
  usePageAnalytics();
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    trackPageView();
  }, [trackPageView]);

  const handleCta = useCallback(() => {
    trackLead({ content_name: "Diagnostico", content_category: "Diagnostico Movimento" });
    window.open(buildDiagnosticoUrl(), "_blank");
  }, [trackLead]);

  // Animações de entrada do hero e reveals
  useGSAP(
    () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) return;

      gsap.from(".hero-reveal", {
        y: 28,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.12,
        delay: 0.15,
      });

      gsap.from(".hero-photo", {
        scale: 0.9,
        opacity: 0,
        duration: 1.1,
        ease: "power3.out",
        delay: 0.3,
      });

      gsap.utils.toArray<HTMLElement>(".reveal-up").forEach((el) => {
        gsap.from(el, {
          y: 40,
          opacity: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 85%" },
        });
      });
    },
    { scope: root }
  );

  return (
    <div ref={root} className="min-h-screen bg-[#0a1628] text-white overflow-x-hidden">
      {/* ─── HERO ─── */}
      <section className="relative min-h-screen flex items-center px-4 py-16 overflow-hidden">
        <ParticleField className="absolute inset-0 h-full w-full" density={1} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/4 w-[420px] h-[420px] rounded-full bg-[#d4a853]/[0.07] blur-[90px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-[#2D8CFF]/[0.06] blur-[90px]" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          {/* Texto */}
          <div className="order-last lg:order-first text-center lg:text-left space-y-6">
            <span className="hero-reveal inline-flex items-center gap-2 bg-[#d4a853]/10 border border-[#d4a853]/25 text-[#d4a853] text-xs font-semibold px-4 py-2 rounded-full uppercase tracking-wider">
              <Sparkles size={14} /> Diagnóstico gratuito
            </span>

            <h1 className="hero-reveal text-[2rem] sm:text-5xl lg:text-[3.4rem] font-extrabold leading-[1.08]" style={{ textWrap: "balance" as never }}>
              {diagnostico.headline.pre}{" "}
              <span className="text-[#d4a853]">{diagnostico.headline.highlight}</span>{" "}
              {diagnostico.headline.post}
            </h1>

            <p className="hero-reveal text-white/70 text-base sm:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0">
              {diagnostico.subheadline}
            </p>

            <div className="hero-reveal flex flex-wrap justify-center lg:justify-start gap-2.5">
              {diagnostico.badges.map((b) => {
                const Icon = badgeIcon[b.icon as keyof typeof badgeIcon];
                return (
                  <span key={b.label} className="flex items-center gap-1.5 bg-white/[0.04] border border-white/10 text-white/70 text-xs px-3 py-1.5 rounded-full">
                    <Icon size={13} className="text-[#d4a853]" />
                    {b.label}
                  </span>
                );
              })}
            </div>

            <div className="hero-reveal pt-2">
              <button
                onClick={handleCta}
                className="inline-flex items-center gap-2 rounded-xl font-bold text-lg px-8 py-4 bg-[#d4a853] text-[#0a1628] shimmer-btn active:scale-[0.97] transition-transform"
              >
                {diagnostico.cta}
                <ArrowRight size={20} />
              </button>
              <p className="flex items-center justify-center lg:justify-start gap-1.5 text-white/40 text-xs mt-3">
                <ShieldCheck size={13} /> Sem cadastro complicado. Resposta na hora.
              </p>
            </div>
          </div>

          {/* Foto */}
          <div className="hero-photo order-first lg:order-last flex justify-center">
            <div className="relative w-full max-w-md">
              <div className="absolute -inset-4 rounded-[2rem] bg-[#d4a853]/10 blur-2xl" />
              <div className="relative overflow-hidden rounded-[1.75rem] border border-[#d4a853]/25 shadow-[0_0_60px_rgba(212,168,83,0.18)]">
                <img src={pedroIgor} alt="Pedro Diniz e Igor Abreu, especialistas em captação de recursos" className="w-full h-auto object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628] via-transparent to-transparent" />
                <div className="absolute bottom-4 left-0 right-0 text-center">
                  <p className="text-white font-bold tracking-widest uppercase text-sm">Pedro Diniz e Igor Abreu</p>
                  <p className="text-[#d4a853] text-xs font-medium mt-0.5">Dunas Capital · +R$ 50 mi captados</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/30 text-xs flex flex-col items-center gap-1 animate-bounce">
          <span>role para descobrir</span>
          <ArrowRight size={14} className="rotate-90" />
        </div>
      </section>

      {/* ─── STATS COM CONTADOR ─── */}
      <section className="relative py-16 md:py-20 px-4 border-y border-[#d4a853]/10 bg-[#0f1d32]">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {diagnostico.stats.map((s) => (
            <div key={s.label} className="reveal-up space-y-1">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#d4a853] leading-none">
                <CountUp end={s.value} prefix={s.prefix} suffix={s.suffix} />
              </div>
              <p className="text-white/50 text-xs sm:text-sm uppercase tracking-wide">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── SCROLLYTELLING (pin + scrub) ─── */}
      <ScrollStory
        blocks={diagnostico.steps.map((s) => ({
          kicker: s.kicker,
          title: s.title,
          body: s.body,
        }))}
        background={
          <div className="relative h-full w-full">
            <ParticleField className="absolute inset-0 h-full w-full" density={0.8} maxDistance={150} />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628] via-[#0a1628]/85 to-[#0a1628]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] max-w-[90vw] rounded-full bg-[#d4a853]/[0.05] blur-[120px]" />
          </div>
        }
      />

      {/* ─── AMPARO LEGAL ─── */}
      <section className="relative py-20 md:py-28 px-4 bg-[#0f1d32] overflow-hidden">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="reveal-up inline-flex items-center gap-2 text-[#d4a853] font-semibold uppercase tracking-wider text-sm">
            <ScrollText size={18} /> Amparo legal
          </div>
          <h2 className="reveal-up text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">
            Um direito previsto em lei desde <span className="text-[#d4a853]">1969</span>
          </h2>
          <div className="reveal-up rounded-xl overflow-hidden border border-[#d4a853]/20 bg-white">
            <img src={leiDecreto} alt="Decreto-Lei nº 719 de 31 de Julho de 1969" className="w-full object-contain" loading="lazy" decoding="async" />
          </div>
          <p className="reveal-up text-white/50 text-sm italic">{diagnostico.legal}</p>
        </div>
      </section>

      {/* ─── CTA FINAL ─── */}
      <section className="relative py-24 md:py-32 px-4 bg-[#0a1628] overflow-hidden">
        <ParticleField className="absolute inset-0 h-full w-full opacity-60" density={0.7} />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628]/60 via-transparent to-[#0a1628]" />
        <div className="relative z-10 max-w-2xl mx-auto text-center space-y-7">
          <h2 className="reveal-up text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-[1.1]" style={{ textWrap: "balance" as never }}>
            Descubra <span className="text-[#d4a853]">agora</span> quanto a sua empresa pode captar
          </h2>
          <p className="reveal-up text-white/70 text-lg">{diagnostico.apoio}</p>
          <div className="reveal-up">
            <button
              onClick={handleCta}
              className="inline-flex items-center gap-2 rounded-xl font-bold text-xl px-10 py-5 bg-[#d4a853] text-[#0a1628] shimmer-btn active:scale-[0.97] transition-transform"
            >
              {diagnostico.cta}
              <ArrowRight size={22} />
            </button>
            <p className="flex items-center justify-center gap-2 text-white/40 text-xs mt-4">
              <Clock size={13} className="text-[#d4a853]" /> Leva menos de 3 minutos · 100% gratuito
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
