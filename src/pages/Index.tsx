import { useState, useEffect, useRef, useCallback, lazy, Suspense } from "react";
import { useMetaPixel } from "@/hooks/useMetaPixel";
import { useSectionTracking } from "@/hooks/useSectionTracking";
import { usePageAnalytics } from "@/hooks/usePageAnalytics";
import { buildCheckoutUrl } from "@/lib/metaPixelUtils";

import { CheckCircle, Clock, Shield, ArrowRight } from "lucide-react";

import pedroHeroImg from "@/assets/pedro-hero.webp";
import pedroPalcoDesktop from "@/assets/pedro-palco-desktop.webp";
import zoomIcon from "@/assets/zoom-icon.webp";

const BelowFoldSections = lazy(() => import("@/components/BelowFoldSections"));

function useUserState() {
  const [estado, setEstado] = useState<string | null>(null);
  const [uf, setUf] = useState<string | null>(null);
  useEffect(() => {
    const doFetch = () => {
      fetch("https://ipapi.co/json/")
        .then(r => r.json())
        .then(data => {
          if (data.country_code === "BR" && data.region) {
            setEstado(data.region);
            setUf(data.region_code || null);
          }
        })
        .catch(() => {});
    };
    // Defer to after first paint so it doesn't block LCP
    if ("requestIdleCallback" in window) {
      (window as any).requestIdleCallback(doFetch, { timeout: 3000 });
    } else {
      setTimeout(doFetch, 3000);
    }
  }, []);
  return { estado, uf };
}

function getWorkshopDate() {
  return new Date(2026, 2, 31, 20, 0, 0); // 31/03/2026 às 20h
}

function useCountdown() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    const target = getWorkshopDate();
    const tick = () => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) return setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    let rafId: number;
    let lastSecond = -1;
    const loop = () => {
      const sec = Math.floor(Date.now() / 1000);
      if (sec !== lastSecond) { lastSecond = sec; tick(); }
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, []);
  return timeLeft;
}

function useDayCountdown() {
  const now = new Date();
  const workshop = getWorkshopDate();
  const diffMs = workshop.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / 86400000);
  if (diffDays === 2) return { show: true, label: "Faltam 2 dias", progress: 33 };
  if (diffDays === 1) return { show: true, label: "É amanhã!", progress: 66 };
  if (diffDays <= 0 && diffDays > -1) return { show: true, label: "É HOJE!", progress: 100 };
  return { show: false, label: "", progress: 0 };
}

const GoldButton = ({ children, className = "", showGuarantee = true, onClick }: { children: React.ReactNode; className?: string; showGuarantee?: boolean; onClick?: () => void }) => (
  <div className="flex flex-col items-center gap-2">
    <button
      onClick={onClick}
      className={`inline-block relative overflow-hidden rounded-lg font-bold text-lg md:text-xl px-8 py-4 bg-[#d4a853] text-[#0a1628] shimmer-btn active:scale-[0.97] transition-transform cursor-pointer ${className}`}
    >
      {children}
    </button>
    {showGuarantee && (
      <span className="flex items-center gap-1.5 text-white/45 text-xs">
        <Shield size={12} />
        Garantia de 30 dias · Compra segura
      </span>
    )}
  </div>
);

export default function Index() {
  const countdown = useCountdown();
  const dayCountdown = useDayCountdown();
  const { estado: userEstado, uf: userUf } = useUserState();
  const { trackPageView } = useMetaPixel();
  usePageAnalytics();

  const heroRef = useRef<HTMLElement>(null);
  const [showBottomBar, setShowBottomBar] = useState(false);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowBottomBar(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Section tracking refs (2 ViewContent events: mid-page + end)
  const autoridadeRef = useSectionTracking({ sectionName: "Autoridade" });
  const ofertaRef = useSectionTracking({ sectionName: "Oferta" });

  // Track PageView on mount
  useEffect(() => {
    trackPageView();
  }, [trackPageView]);

  // Checkout handler with tracking
  const handleCheckoutClick = useCallback(() => {
    window.open(buildCheckoutUrl(), "_blank");
  }, []);

  return (
    <div className="min-h-screen bg-[#0a1628] text-white overflow-x-hidden">
      {/* ─── 2. HERO ─── */}
      <section ref={heroRef} data-section="Hero" className="relative bg-[#0a1628] pt-8 pb-10 md:pt-12 md:pb-24 px-4">
        <div className="max-w-6xl mx-auto animate-fade-in lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center">
          {/* Coluna direita - Foto (aparece primeiro no mobile) */}
          <div className="order-first lg:order-last flex justify-center mb-6 lg:mb-0">
            {/* Mobile: headline banner */}
            <div className="lg:hidden flex flex-col items-center text-center py-4 space-y-1">
              <span className="bg-white text-[#0a1628] text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-sm">Workshop</span>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-2xl">🖥️</span>
                <h2 className="text-white font-black text-xl sm:text-2xl uppercase leading-tight">
                  Como captar <span className="text-[#d4a853]">$</span> com
                </h2>
                <span className="text-2xl">💰</span>
              </div>
              <p className="text-white font-black text-2xl sm:text-3xl uppercase leading-tight">
                Programas de Incentivo<br />Federais
              </p>
            </div>

            {/* Desktop: foto full com degradê */}
            <div className="hidden lg:block relative w-full max-w-md mx-auto">
              <div className="relative overflow-hidden rounded-2xl">
                <img src={pedroPalcoDesktop} alt="Pedro Diniz" className="w-full h-auto object-cover" loading="lazy" decoding="async" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628] via-transparent to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0a1628]/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-0 right-0 text-center">
                  <h3 className="text-white font-bold text-lg tracking-widest uppercase">PEDRO DINIZ</h3>
                  <p className="text-[#d4a853] text-sm font-medium mt-1">+ de 50 milhões captados</p>
                </div>
              </div>
            </div>
          </div>

          {/* Coluna esquerda - Texto */}
          <div className="order-last lg:order-first space-y-4 md:space-y-6 text-center lg:text-left">
            {/* Date/event bar */}
            <div className="flex items-center justify-center lg:justify-start gap-3 text-sm flex-wrap">
              <span className="bg-red-500/20 text-red-400 font-bold text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-red-500/30">
                AO VIVO
              </span>
              {(() => {
                const now = new Date();
                const workshop = getWorkshopDate();
                const diffMs = workshop.getTime() - now.getTime();
                const diffDays = Math.ceil(diffMs / 86400000);
                const isToday = diffDays <= 0 && diffDays > -1;
                const isTomorrow = diffDays === 1;

                if (isToday) {
                  return (
                    <div className="flex items-center gap-2 text-white font-bold border border-red-500/50 bg-red-500/10 rounded-full px-3 py-1.5 animate-pulse">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                      <img src={zoomIcon} alt="Zoom" className="w-4 h-4 rounded-full object-cover" />
                      <span className="text-xs sm:text-sm">HOJE · Terça-feira às 20h</span>
                    </div>
                  );
                }

                return (
                  <div className="flex items-center gap-2.5 text-sm sm:text-base text-white/50">
                    <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                    <img src={zoomIcon} alt="Zoom" className="w-6 h-6 rounded-full object-cover" />
                    <span>{isTomorrow ? `Amanhã · Terça-feira dia 31/03/26 às 20h` : `Terça-feira dia 31/03/26 às 20h`}</span>
                  </div>
                );
              })()}
            </div>

            {/* Day countdown bar - only Tue/Wed/Thu */}
            {dayCountdown.show && (
              <div className="bg-[#0f1d32] border border-[#d4a853]/20 rounded-xl p-3 md:p-4 space-y-2 max-w-md mx-auto lg:mx-0">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/60 text-xs sm:text-sm">Workshop ao vivo</span>
                  <span className={`font-bold text-xs sm:text-sm ${dayCountdown.progress === 100 ? "text-green-400" : "text-[#d4a853]"}`}>
                    {dayCountdown.label}
                  </span>
                </div>
                <div className="w-full h-2 bg-[#0a1628] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${dayCountdown.progress}%`,
                      background: dayCountdown.progress === 100
                        ? "linear-gradient(90deg, #d4a853, #22c55e)"
                        : "linear-gradient(90deg, #d4a853, #e8c778)",
                    }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-white/30 uppercase">
                  <span>Domingo</span>
                  <span>Segunda</span>
                  <span>Terça 20h</span>
                </div>
              </div>
            )}

            <h1 className="text-[1.75rem] sm:text-4xl lg:text-5xl font-extrabold leading-[1.15] sm:leading-[1.1] text-white" style={{ textWrap: "balance" as any }}>
              Em <span className="text-red-500">1h ao vivo</span>, eu vou te mostrar o passo a passo de como você vai captar de{" "}
              <span className="text-[#d4a853]">R$ 39 mil a R$ 400 mil</span>{" "}
              para sua empresa ou ideia de negócio
            </h1>

            {/* Mobile: CTA + urgency between headline and bullets */}
            <div className="lg:hidden pt-8 mb-8">
              <GoldButton className="w-full" onClick={handleCheckoutClick}>
                GARANTIR MINHA VAGA
                <ArrowRight className="inline ml-2" size={18} />
              </GoldButton>
              <div className="max-w-xs mx-auto space-y-2 mt-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/60">🔥 Ingressos vendidos à R$37</span>
                  <span className="text-[#d4a853] font-bold">96%</span>
                </div>
                <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: "96%", background: "linear-gradient(90deg, #22c55e, #eab308, #ef4444)" }} />
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-white/40">Restam poucas vagas — garanta a sua!</span>
                  <span className="text-white/30">Data da virada de lote: {new Date().toLocaleDateString("pt-BR")}</span>
                </div>
              </div>
            </div>

            <ul className="mt-8 lg:mt-0 space-y-2 md:space-y-3 text-sm sm:text-base md:text-lg text-white/80 text-left max-w-md mx-auto lg:mx-0">
              {["Sem pagar juros", "Sem precisar devolver o dinheiro", "Sem comprovar grande faturamento", "Usando o que é direito seu por lei"].map((t) => (
                <li key={t} className="flex items-center gap-2 md:gap-3">
                  <CheckCircle className="text-[#d4a853] shrink-0" size={18} />
                  {t}
                </li>
              ))}
            </ul>
            <p className="text-white/60 text-xs sm:text-sm">Através de Programas de Incentivo Federais</p>

            {/* Mobile: Pedro Diniz photo + credibility */}
            <div className="lg:hidden flex flex-col items-center mt-10 space-y-3">
              <div className="relative w-72 h-72 rounded-full overflow-hidden border-[3px] border-[#d4a853] shadow-[0_0_30px_rgba(212,168,83,0.35)]">
                <img src={pedroHeroImg} alt="Pedro Diniz" className="w-full h-full object-cover object-top" />
              </div>
              <span className="text-white font-bold text-sm tracking-wide">PEDRO DINIZ</span>
              <span className="text-[#d4a853] text-xs font-semibold">+ de 50 milhões captados</span>
            </div>

            {/* Desktop: CTA + urgency after bullets */}
            <div className="hidden lg:block">
              <GoldButton className="w-full sm:w-auto" onClick={handleCheckoutClick}>
                GARANTIR MINHA VAGA
                <ArrowRight className="inline ml-2" size={18} />
              </GoldButton>
              <div className="max-w-xs lg:mx-0 space-y-2 mt-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/60">🔥 Ingressos vendidos à R$37</span>
                  <span className="text-[#d4a853] font-bold">96%</span>
                </div>
                <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: "96%", background: "linear-gradient(90deg, #22c55e, #eab308, #ef4444)" }} />
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-white/40">Restam poucas vagas — garanta a sua!</span>
                  <span className="text-white/30">Data da virada de lote: {new Date().toLocaleDateString("pt-BR")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Below-fold sections (code-split) ─── */}
      <Suspense fallback={<div className="min-h-screen" />}>
        <BelowFoldSections
          userEstado={userEstado}
          userUf={userUf}
          handleCheckoutClick={handleCheckoutClick}
          autoridadeRef={autoridadeRef}
          ofertaRef={ofertaRef}
        />
      </Suspense>

      {/* ─── FIXED BOTTOM BAR — GLASSMORPHISM ─── */}
      <div className={`fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#0a1628]/60 border-t border-[#d4a853]/20 py-3 px-4 transition-all duration-300 ${showBottomBar ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'}`}>
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="hidden sm:flex flex-col text-sm">
            <span className="text-white/70 font-semibold flex items-center gap-2">
              <Clock size={14} className="text-[#d4a853]" />
              Terça-feira às 20h · Online ao vivo
            </span>
            <span className="text-white/40 text-xs">100% online e ao vivo no Zoom</span>
          </div>
          <button
            onClick={handleCheckoutClick}
            className="inline-block w-full sm:w-auto text-center relative overflow-hidden rounded-xl font-bold text-base sm:text-lg px-8 py-3.5 bg-[#d4a853] text-[#0a1628] shimmer-btn active:scale-[0.97] transition-transform cursor-pointer"
          >
            QUERO MEU INGRESSO
          </button>
        </div>
      </div>

      {/* Bottom spacer for fixed bar */}
      <div className="h-16" />
    </div>
  );
}
