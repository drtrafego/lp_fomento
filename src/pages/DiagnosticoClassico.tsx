import { useCallback, useEffect } from "react";
import { Clock, Gift, Users, ArrowRight, ShieldCheck, ScrollText } from "lucide-react";

import { useMetaPixel } from "@/hooks/useMetaPixel";
import { usePageAnalytics } from "@/hooks/usePageAnalytics";
import { diagnostico, buildDiagnosticoUrl } from "@/content/diagnostico";

import pedroIgor from "@/assets/pedro-igor.webp";
import leiDecreto from "@/assets/lei-decreto.webp";

const badgeIcon = { clock: Clock, gift: Gift, users: Users } as const;

// Versão estática premium: tipografia + grid editorial + hover sutil.
// Sem GSAP, sem canvas, sem Lenis. Carrega instantâneo.
export default function DiagnosticoClassico() {
  const { trackPageView, trackLead } = useMetaPixel();
  usePageAnalytics();

  useEffect(() => {
    trackPageView();
  }, [trackPageView]);

  const handleCta = useCallback(() => {
    trackLead({ content_name: "Diagnostico", content_category: "Diagnostico Classico" });
    window.open(buildDiagnosticoUrl(), "_blank");
  }, [trackLead]);

  return (
    <div className="min-h-screen bg-[#0a1628] text-white overflow-x-hidden">
      {/* ─── HERO ─── */}
      <section className="relative px-4 pt-14 pb-20 md:pt-20 md:pb-28">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-24 left-1/4 w-[360px] h-[360px] rounded-full bg-[#d4a853]/[0.06] blur-[90px]" />
        </div>
        <div className="relative max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div className="order-last lg:order-first text-center lg:text-left space-y-6">
            <span className="inline-flex items-center gap-2 bg-[#d4a853]/10 border border-[#d4a853]/25 text-[#d4a853] text-xs font-semibold px-4 py-2 rounded-full uppercase tracking-wider">
              Diagnóstico gratuito
            </span>
            <h1 className="text-[2rem] sm:text-5xl lg:text-[3.4rem] font-extrabold leading-[1.08]" style={{ textWrap: "balance" as never }}>
              {diagnostico.headline.pre}{" "}
              <span className="text-[#d4a853]">{diagnostico.headline.highlight}</span>{" "}
              {diagnostico.headline.post}
            </h1>
            <p className="text-white/70 text-base sm:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0">
              {diagnostico.subheadline}
            </p>
            <div className="flex flex-wrap justify-center lg:justify-start gap-2.5">
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
            <div className="pt-2">
              <button
                onClick={handleCta}
                className="inline-flex items-center gap-2 rounded-xl font-bold text-lg px-8 py-4 bg-[#d4a853] text-[#0a1628] shimmer-btn hover:brightness-105 active:scale-[0.97] transition-all"
              >
                {diagnostico.cta}
                <ArrowRight size={20} />
              </button>
              <p className="flex items-center justify-center lg:justify-start gap-1.5 text-white/40 text-xs mt-3">
                <ShieldCheck size={13} /> Sem cadastro complicado. Resposta na hora.
              </p>
            </div>
          </div>

          <div className="order-first lg:order-last flex justify-center">
            <div className="relative w-full max-w-md">
              <div className="relative overflow-hidden rounded-[1.75rem] border border-[#d4a853]/25 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]">
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
      </section>

      {/* ─── STATS ─── */}
      <section className="py-14 md:py-16 px-4 border-y border-[#d4a853]/10 bg-[#0f1d32]">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {diagnostico.stats.map((s) => (
            <div key={s.label} className="space-y-1">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#d4a853] leading-none tabular-nums">
                {s.prefix}
                {s.value.toLocaleString("pt-BR")}
                {s.suffix}
              </div>
              <p className="text-white/50 text-xs sm:text-sm uppercase tracking-wide">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── BLOCOS (grid editorial estático) ─── */}
      <section className="py-20 md:py-28 px-4 bg-[#0a1628]">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
          {diagnostico.steps.map((s, i) => (
            <div
              key={s.title}
              className="bg-[#0f1d32] border border-[#d4a853]/15 rounded-2xl p-7 space-y-3 hover:border-[#d4a853]/35 transition-colors"
            >
              <span className="text-5xl font-black text-[#d4a853]/25 leading-none">{String(i + 1).padStart(2, "0")}</span>
              <p className="text-[#d4a853] font-semibold uppercase tracking-wider text-xs">{s.kicker}</p>
              <h3 className="text-xl font-bold text-white leading-snug">{s.title}</h3>
              <p className="text-white/60 text-sm leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── AMPARO LEGAL ─── */}
      <section className="py-20 md:py-24 px-4 bg-[#0f1d32]">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 text-[#d4a853] font-semibold uppercase tracking-wider text-sm">
            <ScrollText size={18} /> Amparo legal
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">
            Um direito previsto em lei desde <span className="text-[#d4a853]">1969</span>
          </h2>
          <div className="rounded-xl overflow-hidden border border-[#d4a853]/20 bg-white">
            <img src={leiDecreto} alt="Decreto-Lei nº 719 de 31 de Julho de 1969" className="w-full object-contain" loading="lazy" decoding="async" />
          </div>
          <p className="text-white/50 text-sm italic">{diagnostico.legal}</p>
        </div>
      </section>

      {/* ─── CTA FINAL ─── */}
      <section className="py-24 md:py-28 px-4 bg-[#0a1628] border-t border-[#d4a853]/15">
        <div className="max-w-2xl mx-auto text-center space-y-7">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-[1.1]" style={{ textWrap: "balance" as never }}>
            Descubra <span className="text-[#d4a853]">agora</span> quanto a sua empresa pode captar
          </h2>
          <p className="text-white/70 text-lg">{diagnostico.apoio}</p>
          <div>
            <button
              onClick={handleCta}
              className="inline-flex items-center gap-2 rounded-xl font-bold text-xl px-10 py-5 bg-[#d4a853] text-[#0a1628] shimmer-btn hover:brightness-105 active:scale-[0.97] transition-all"
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
