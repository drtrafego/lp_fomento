import { useCallback, useEffect, useRef, useState, lazy, Suspense } from "react";
import { CheckCircle, ArrowRight, Shield, Clock } from "lucide-react";

import { useMetaPixel } from "@/hooks/useMetaPixel";
import { useSectionTracking } from "@/hooks/useSectionTracking";
import { usePageAnalytics } from "@/hooks/usePageAnalytics";
import { useUserState, getWorkshopDate } from "@/hooks/useWorkshopBits";
import { buildCheckoutUrl } from "@/lib/metaPixelUtils";
import CheckoutLeadModal from "@/components/CheckoutLeadModal";

import pedroPalcoDesktop from "@/assets/pedro-palco-desktop.webp";
import pedroHeroImg from "@/assets/pedro-hero.webp";
import zoomIcon from "@/assets/zoom-icon.webp";

const BelowFoldSections = lazy(() => import("@/components/BelowFoldSections"));

// Workshop estática premium: sem GSAP, sem canvas, sem Lenis.
// Hero limpo, tipografia e grid editorial. Miolo de copy reaproveitado.
export default function WorkshopClassico() {
  const { estado: userEstado, uf: userUf } = useUserState();
  const { trackPageView } = useMetaPixel();
  usePageAnalytics();

  const heroRef = useRef<HTMLElement>(null);
  const [showBottomBar, setShowBottomBar] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const autoridadeRef = useSectionTracking({ sectionName: "Autoridade" });
  const ofertaRef = useSectionTracking({ sectionName: "Oferta" });

  useEffect(() => {
    trackPageView();
  }, [trackPageView]);

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

  const handleCheckoutClick = useCallback(() => {
    setCheckoutOpen(true);
  }, []);

  const workshop = getWorkshopDate();
  const dateLabel = `${String(workshop.getDate()).padStart(2, "0")}/${String(workshop.getMonth() + 1).padStart(2, "0")}/${String(workshop.getFullYear()).slice(2)}`;

  return (
    <div className="min-h-screen bg-[#0a1628] text-white overflow-x-hidden">
      {/* ─── HERO ESTÁTICO ─── */}
      <section ref={heroRef} data-section="Hero" className="relative px-4 pt-12 pb-16 md:pt-16 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-24 left-1/4 w-[360px] h-[360px] rounded-full bg-[#d4a853]/[0.06] blur-[90px]" />
        </div>
        <div className="relative max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
          <div className="order-last lg:order-first text-center lg:text-left space-y-5">
            <div className="flex items-center justify-center lg:justify-start gap-3 text-sm flex-wrap">
              <span className="bg-red-500/20 text-red-400 font-bold text-xs px-3 py-1.5 rounded-full border border-red-500/30">AO VIVO</span>
              <div className="flex items-center gap-2.5 text-sm text-white/50">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <img src={zoomIcon} alt="Zoom" className="w-5 h-5 rounded-full object-cover" />
                <span>Quinta-feira dia {dateLabel} às 20h</span>
              </div>
            </div>

            <h1 className="text-[2rem] sm:text-5xl lg:text-[3.3rem] font-extrabold leading-[1.08]" style={{ textWrap: "balance" as never }}>
              Crie um plano para captar de{" "}
              <span className="text-[#d4a853]">39 a 400 mil</span> para seu negócio.
            </h1>

            <ul className="space-y-2.5 text-sm sm:text-base text-white/80 text-left max-w-md mx-auto lg:mx-0">
              {["Sem pagar juros", "Sem precisar devolver o dinheiro", "Sem comprovar grande faturamento", "Usando o que é direito seu por lei"].map((t) => (
                <li key={t} className="flex items-center gap-3">
                  <CheckCircle className="text-[#d4a853] shrink-0" size={18} />
                  {t}
                </li>
              ))}
            </ul>
            <p className="text-white/55 text-xs sm:text-sm">Através de Programas de Incentivo Federais</p>

            <div className="pt-2 flex flex-col items-center lg:items-start gap-2">
              <button
                onClick={handleCheckoutClick}
                className="inline-flex items-center gap-2 rounded-xl font-bold text-lg px-8 py-4 bg-[#d4a853] text-[#0a1628] shimmer-btn hover:brightness-105 active:scale-[0.97] transition-all"
              >
                COMECE AGORA POR R$ 37,00
                <ArrowRight size={18} />
              </button>
              <span className="flex items-center gap-1.5 text-white/45 text-xs">
                <Shield size={12} /> Garantia de 30 dias · Compra segura
              </span>
            </div>
          </div>

          <div className="order-first lg:order-last flex justify-center">
            <div className="relative w-full max-w-md">
              <div className="lg:hidden flex flex-col items-center gap-3">
                <div className="relative w-56 h-56 rounded-full overflow-hidden border-[3px] border-[#d4a853] shadow-[0_0_30px_rgba(212,168,83,0.35)]">
                  <img src={pedroHeroImg} alt="Pedro Diniz" className="w-full h-full object-cover object-top" />
                </div>
                <span className="text-white font-bold text-sm tracking-wide">PEDRO DINIZ</span>
                <span className="text-[#d4a853] text-xs font-semibold">+ de 50 milhões captados</span>
              </div>
              <div className="hidden lg:block relative overflow-hidden rounded-[1.75rem] border border-[#d4a853]/25 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]">
                <img src={pedroPalcoDesktop} alt="Pedro Diniz" className="w-full h-auto object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628] via-transparent to-transparent" />
                <div className="absolute bottom-4 left-0 right-0 text-center">
                  <h3 className="text-white font-bold tracking-widest uppercase">PEDRO DINIZ</h3>
                  <p className="text-[#d4a853] text-sm font-medium mt-1">+ de 50 milhões captados</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Suspense fallback={<div className="min-h-screen" />}>
        <BelowFoldSections
          userEstado={userEstado}
          userUf={userUf}
          handleCheckoutClick={handleCheckoutClick}
          autoridadeRef={autoridadeRef}
          ofertaRef={ofertaRef}
          ticketPrice="37"
        />
      </Suspense>

      <div className={`fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#0a1628]/60 border-t border-[#d4a853]/20 py-3 px-4 transition-all duration-300 ${showBottomBar ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"}`}>
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="hidden sm:flex flex-col text-sm">
            <span className="text-white/70 font-semibold flex items-center gap-2">
              <Clock size={14} className="text-[#d4a853]" /> Quinta-feira às 20h · Online ao vivo
            </span>
            <span className="text-white/40 text-xs">100% online e ao vivo no Zoom</span>
          </div>
          <button
            onClick={handleCheckoutClick}
            className="w-full sm:w-auto text-center rounded-xl font-bold text-base sm:text-lg px-8 py-3.5 bg-[#d4a853] text-[#0a1628] shimmer-btn hover:brightness-105 active:scale-[0.97] transition-all"
          >
            QUERO MEU INGRESSO
          </button>
        </div>
      </div>
      <div className="h-16" />

      <CheckoutLeadModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        checkoutUrl={buildCheckoutUrl()}
        contentName="Workshop"
        value={37}
        currency="BRL"
      />
    </div>
  );
}
