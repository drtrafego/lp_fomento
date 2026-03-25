import { useState, useEffect, useRef, useCallback, lazy, Suspense } from "react";
import { CheckCircle, Clock, Users, Zap, Gift, Shield, AlertTriangle, ArrowRight, MessageCircle, MapPin } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import seloGarantia from "@/assets/selo-garantia.webp";
import mapaOrgaos from "@/assets/mapa-orgaos.webp";
import reuniaoFomento from "@/assets/reuniao-fomento.webp";
import pedroIgorImg from "@/assets/pedro-igor.webp";
import leiDecreto from "@/assets/lei-decreto.webp";
import zoomLogo from "@/assets/zoom-logo.webp";
import listaTopIcon from "@/assets/lista-top-icon.webp";
import autoridadeImg from "@/assets/pedro-palco.webp";
import { ScrollTypewriter, useSequentialBulletProgress } from "@/components/ScrollTypewriter";
import { throttle } from "@/lib/throttle";

const VideoTestimonials = lazy(() => import("@/components/VideoTestimonials").then(m => ({ default: m.VideoTestimonials })));

// ─── Data ───

const orgaos = [
  "FINEP", "CNPq", "SEBRAE", "FAPESP", "FAPERJ", "FAPEMIG",
  "BNDES", "EMBRAPII", "CAPES", "AEB", "MCTI", "FAPESC", "FAPEMA",
];

const faqItems = [
  { q: "Para quem é o Workshop?", a: "Se você tem um CPF e uma ideia de negócio, você já pode participar dos Programas de Incentivo Federais. Este workshop é para você." },
  { q: "Qual é a Taxa de Juros?", a: "Não é empréstimo, portanto você não pagará nenhum centavo de juros. Os programas de incentivo não cobram juros nem exigem a devolução do valor liberado." },
  { q: "É apenas para empresas grandes?", a: "Não. Existem diversos programas de incentivo para micro e pequenas empresas. Ou até mesmo para ideias que ainda nem se tornaram negócios." },
  { q: "Existe dinheiro de graça para financiar minha empresa ou ideia?", a: "Existem mais de 40 Programas de Incentivo para todo tipo de ideia e negócio. Diversos destes não cobram juros e nem exigem devolução do valor liberado." },
  { q: "Quando será o Workshop?", a: "Quinta-feira às 20h, AO VIVO no ZOOM. Você receberá o acesso assim que se inscrever." },
  { q: "O Workshop ficará gravado?", a: "Sim, você terá a possibilidade de obter a gravação." },
  { q: "E se eu não gostar, posso pedir reembolso?", a: "Sim. Você pode assistir o workshop, baixar os materiais, e se mesmo assim achar que não valeu a pena, tem 30 dias de garantia total para solicitar 100% do valor pago." },
];

const workshopCards = [
  {
    num: "01",
    icon: Zap,
    title: "Estar Apto",
    bullets: [
      "Descubra sua Elegibilidade Real — você NÃO precisa ter CNPJ, faturamento alto ou histórico de crédito impecável.",
      "Seu Negócio se Encaixa — de hamburguerias a startups, de agronegócio a clínicas, qualquer tipo de negócio pode ser elegível.",
      "Desmistifique os Requisitos — aprenda os critérios verdadeiros, desvendando mitos sobre o que importa para aprovação.",
    ],
  },
  {
    num: "02",
    icon: ArrowRight,
    title: "Passo a Passo",
    bullets: [
      "Do Zero ao Dinheiro na Conta — método prático que guia desde a identificação até o recebimento de R$ 39 mil a R$ 400 mil.",
      "Modelos Prontos e Validados — templates para copiar, colar e adaptar, acelerando sua aplicação.",
      "Gestão e Prestação de Contas Simplificada — como gerir o recurso e prestar contas sem dor de cabeça.",
    ],
  },
  {
    num: "03",
    icon: Users,
    title: "Onde Encontrar",
    bullets: [
      "Acesso Rápido aos Editais — encontre programas disponíveis AGORA sem ler centenas de páginas complexas.",
      'O "Radar" que Trabalha por Você — ferramenta que busca, lê e resume programas adequados ao seu perfil 24h por dia.',
      "Pare de Procurar, Comece a Captar — método otimizado que te coloca frente a frente com os recursos disponíveis.",
    ],
  },
];

const testimonials = [
  { handle: "@bulldogburguer", value: "R$ 420 mil", video: "https://dunas.b-cdn.net/videos_LP_nova/0C7535c4-Fc79-44B7-9257-1C6e1b48d0d3.mp4" },
  { handle: "@energiaquasis · José Roberto", value: "R$ 480 mil", video: "https://dunas.b-cdn.net/videos_LP_nova/90C9c3b6-5Cf7-4E23-Ba5c-Bbf4ab07c4c8.mp4" },
  { handle: "@girotec · Kleber Castro e Milton Lira", value: "R$ 400 mil", video: "https://dunas.b-cdn.net/videos_LP_nova/Edits%20Girotec%20-%20Depoimento%20Curto%2020250519%20132550.mp4" },
  { handle: "@instabovreal · Fernando", value: "R$ 734 mil", video: "https://dunas.b-cdn.net/videos_LP_nova/C9cf30e2-1Bc7-4Fd3-Be82-71C4c74c3769.mp4" },
  { handle: "@impar.gestao · Richardson", value: "R$ 39 mil", video: "https://dunas.b-cdn.net/videos_LP_nova/Depoimento%20Impar.mp4" },
  { handle: "@globalteceducacional · Maria", value: "R$ 80 mil + R$ 420 mil", video: "https://dunas.b-cdn.net/videos_LP_nova/Ee35e4db-76A3-4274-A3ff-777398B32196.mp4" },
];

const PIX_NOTIFICATIONS = [
  { bank: "nubank", valor: "R$ 150.000,70", color: "#8B2A8B" },
  { bank: "bb", valor: "R$ 39.000,00", color: "#F9D423" },
  { bank: "santander", valor: "R$ 85.500,00", color: "#EC0000" },
  { bank: "nubank", valor: "R$ 200.350,50", color: "#8B2A8B" },
  { bank: "bb", valor: "R$ 400.000,00", color: "#F9D423" },
];

// ─── Utility hooks / components ───

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

function useAnimatedCounter(end: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
        } else if (!entry.isIntersecting && started.current) {
          started.current = false;
          setCount(0);
          return;
        }
        if (!entry.isIntersecting) return;
        {
          const startTime = performance.now();
          const animate = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            setCount(Math.floor(progress * end));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [end, duration]);
  return { count, ref };
}

const Section = ({ children, className = "", dark = false }: { children: React.ReactNode; className?: string; dark?: boolean }) => {
  const { ref, visible } = useScrollReveal();
  return (
    <section
      ref={ref}
      className={`relative py-16 md:py-24 px-4 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"} ${dark ? "bg-[#0a1628]" : "bg-[#0f1d32]"} ${className}`}
    >
      <div className="max-w-5xl mx-auto">{children}</div>
    </section>
  );
};

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

function SequentialBullets({ bullets, iconSize = 16, gap = "gap-2.5", spacing = "space-y-3" }: { bullets: string[]; iconSize?: number; gap?: string; spacing?: string }) {
  const containerRef = useRef<HTMLUListElement>(null);
  const progresses = useSequentialBulletProgress(containerRef, bullets.length);
  return (
    <ul ref={containerRef} className={spacing}>
      {bullets.map((b, j) => (
        <li key={j} className={`flex items-start ${gap} text-sm leading-relaxed`}>
          <CheckCircle className="text-[#d4a853] shrink-0 mt-0.5" size={iconSize} />
          <ScrollTypewriter text={b} progress={progresses[j]} />
        </li>
      ))}
    </ul>
  );
}

function WorkshopLearningSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visibleCards, setVisibleCards] = useState<boolean[]>([false, false, false]);
  const [arrowsVisible, setArrowsVisible] = useState<boolean[]>([false, false]);
  const desktopCardRefs = useRef<(HTMLDivElement | null)[]>([null, null, null]);
  const mobileCardRefs = useRef<(HTMLDivElement | null)[]>([null, null, null]);
  const [numberZoomed, setNumberZoomed] = useState<boolean[]>([false, false, false]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisibleCards((p) => [true, p[1], p[2]]), 0);
          setTimeout(() => {
            setArrowsVisible((p) => [true, p[1]]);
            setVisibleCards((p) => [p[0], true, p[2]]);
          }, 300);
          setTimeout(() => {
            setArrowsVisible([true, true]);
            setVisibleCards([true, true, true]);
          }, 600);
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    const allRefs = [desktopCardRefs.current, mobileCardRefs.current];
    allRefs.forEach(refs => {
      refs.forEach((el, i) => {
        if (!el) return;
        const obs = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              setNumberZoomed(prev => {
                const next = [...prev];
                next[i] = true;
                return next;
              });
            }
          },
          { threshold: 0.3 }
        );
        obs.observe(el);
        observers.push(obs);
      });
    });
    return () => observers.forEach(o => o.disconnect());
  }, []);

  return (
    <div ref={sectionRef} className="max-w-6xl mx-auto relative z-10">
      <div className="text-center mb-14 space-y-3">
        <p className="text-[#d4a853] font-semibold uppercase tracking-wider text-sm">Em apenas 1 hora ao vivo</p>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
          O que você vai aprender no{" "}
          <span className="text-[#d4a853]">WORKSHOP AO VIVO</span>{" "}
          do Zero à Captação
        </h2>
        <div className="flex items-center justify-center gap-2 mt-3">
          <div className="flex items-center gap-2 bg-[#2D8CFF]/15 border border-[#2D8CFF]/30 rounded-full px-4 py-1.5">
            <img src={zoomLogo} alt="Zoom" className="w-5 h-5 object-contain" />
            <span className="text-[#2D8CFF] text-xs font-semibold uppercase tracking-wider">via Zoom</span>
          </div>
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden md:flex items-stretch gap-0">
        {workshopCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={card.num} className="flex items-stretch">
              <div
                ref={el => { desktopCardRefs.current[i] = el; }}
                className="relative bg-[#0a1628] border border-[#d4a853]/15 rounded-2xl p-8 flex-1 min-w-[280px] card-glow-hover transition-all duration-700"
                style={{
                  opacity: visibleCards[i] ? 1 : 0,
                  transform: visibleCards[i] ? "translateY(0) scale(1)" : "translateY(40px) scale(0.95)",
                }}
              >
                <span
                  className="absolute -top-4 -left-2 text-7xl font-black text-[#d4a853]/10 select-none leading-none transition-all duration-700"
                  style={{
                    transform: numberZoomed[i] ? "scale(1)" : "scale(3)",
                    opacity: numberZoomed[i] ? 1 : 0,
                  }}
                >
                  {card.num}
                </span>
                <div className="relative space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#d4a853]/10 flex items-center justify-center">
                      <Icon className="text-[#d4a853]" size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-[#d4a853]">{card.title}</h3>
                  </div>
                  <SequentialBullets bullets={card.bullets} iconSize={16} gap="gap-2.5" spacing="space-y-3" />
                </div>
              </div>
              {i < 2 && (
                <div className="flex items-center px-3">
                  <svg width="40" height="24" viewBox="0 0 40 24" fill="none" className={arrowsVisible[i] ? "arrow-drawn" : "opacity-0"} style={{ animationDelay: `${i * 200}ms` }}>
                    <path d="M2 12 L30 12 M24 5 L32 12 L24 19" stroke="#d4a853" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile */}
      <div className="md:hidden space-y-0">
        {workshopCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={card.num}>
              <div className="text-center mb-2">
                <span
                  className="inline-block text-8xl font-black text-[#d4a853]/15 select-none leading-none transition-all duration-700 ease-out"
                  style={{
                    transform: numberZoomed[i] ? "scale(1)" : "scale(3)",
                    opacity: numberZoomed[i] ? 1 : 0,
                  }}
                >
                  {card.num}
                </span>
              </div>
              <div
                ref={el => { mobileCardRefs.current[i] = el; }}
                className="relative bg-[#0a1628] border border-[#d4a853]/15 rounded-2xl p-6 card-glow-hover transition-all duration-700"
                style={{
                  opacity: visibleCards[i] ? 1 : 0,
                  transform: visibleCards[i] ? "translateY(0) scale(1)" : "translateY(40px) scale(0.95)",
                }}
              >
                <div className="relative space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-[#d4a853]/10 flex items-center justify-center">
                      <Icon className="text-[#d4a853]" size={22} />
                    </div>
                    <h3 className="text-lg font-bold text-[#d4a853]">{card.title}</h3>
                  </div>
                  <SequentialBullets bullets={card.bullets} iconSize={15} gap="gap-2" spacing="space-y-2.5" />
                </div>
              </div>
              {i < 2 && (
                <div className="flex justify-center py-3">
                  <svg width="24" height="40" viewBox="0 0 24 40" fill="none" className={arrowsVisible[i] ? "arrow-drawn" : "opacity-0"}>
                    <path d="M12 2 L12 30 M5 24 L12 32 L19 24" stroke="#d4a853" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BonusSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const bonuses = [
    {
      customIcon: "lista-top" as const,
      title: "Lista TOP 10",
      desc: "Os programas de incentivo disponíveis AGORA! A lista mais atualizada do mercado com os editais abertos para você aplicar imediatamente.",
      price: "R$ 97,00",
    },
    {
      customIcon: "whatsapp" as const,
      title: "Grupo de Alerta",
      desc: "WhatsApp fechado com oportunidades de programas de incentivo imperdíveis. Receba alertas em primeira mão quando novos editais abrirem.",
      price: "R$ 97,00",
    },
  ];

  return (
    <div ref={ref} className="max-w-5xl mx-auto relative z-10">
      <div className="text-center space-y-3 mb-14">
        <p className="text-[#d4a853] font-semibold uppercase tracking-wider text-sm">E mais — bônus exclusivos</p>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Quem garantir a vaga hoje leva também:</h2>
      </div>

      <div className="flex flex-col gap-4 max-w-2xl mx-auto">
        {bonuses.map((b, i) => (
          <div
            key={b.title}
            className="flex items-center gap-4 bg-[#0f1d32] border border-[#d4a853]/15 rounded-xl px-5 py-4"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(20px)",
              transitionDelay: `${i * 200}ms`,
              transition: "all 0.6s ease",
            }}
          >
            <div className="w-12 h-12 rounded-xl bg-[#d4a853]/10 flex items-center justify-center flex-shrink-0 border border-[#d4a853]/20 overflow-hidden">
              {b.customIcon === "lista-top" ? (
                <img src={listaTopIcon} alt="Lista TOP 10" className="w-8 h-8 object-contain" loading="lazy" decoding="async" />
              ) : (
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="#25D366">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-white">{b.title}</h3>
              <p className="text-white/50 text-xs leading-relaxed line-clamp-2">{b.desc}</p>
            </div>

            <div className="flex-shrink-0 text-right">
              <p className="text-white/40 text-xs line-through">{b.price}</p>
              <p className="text-[#d4a853] font-extrabold text-lg">GRÁTIS</p>
            </div>
          </div>
        ))}
      </div>

      <div
        className="text-center mt-10 transition-all duration-700"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(20px)",
          transitionDelay: "600ms",
        }}
      >
        <div className="inline-flex items-center gap-3 bg-[#d4a853]/10 border border-[#d4a853]/25 rounded-full px-6 py-3">
          <span className="text-white/60 text-sm">Total em bônus:</span>
          <span className="text-white/40 line-through text-sm">R$ 194,00</span>
          <span className="text-[#d4a853] font-extrabold text-lg">GRÁTIS</span>
        </div>
      </div>
    </div>
  );
}

function BankLogo({ bank }: { bank: string }) {
  if (bank === "nubank") return (
    <div className="w-10 h-10 rounded-full bg-[#8B2A8B] flex items-center justify-center flex-shrink-0">
      <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
    </div>
  );
  if (bank === "bb") return (
    <div className="w-10 h-10 rounded-full bg-[#FFCB05] flex items-center justify-center flex-shrink-0">
      <span className="text-[#003882] font-black text-xs">BB</span>
    </div>
  );
  return (
    <div className="w-10 h-10 rounded-full bg-[#EC0000] flex items-center justify-center flex-shrink-0">
      <span className="text-white font-black text-[10px]">SAN</span>
    </div>
  );
}

function PixNotificationsSection({ uf }: { uf: string | null }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = throttle(() => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const start = vh * 0.8;
      const end = vh * 0.15;
      const progress = Math.max(0, Math.min(1, (start - rect.top) / (start - end)));
      const idx = Math.floor(progress * PIX_NOTIFICATIONS.length);
      setActiveIndex(Math.min(idx, PIX_NOTIFICATIONS.length - 1));
    }, 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const govLabel = uf ? `GOV ${uf}` : "GOV FEDERAL";

  return (
    <div ref={containerRef} className="sm:hidden relative bg-[#0a1628]" style={{ minHeight: `${PIX_NOTIFICATIONS.length * 82 + 32}px` }}>
      <div className="px-4 space-y-3 z-40 pt-4 pb-8">
        {PIX_NOTIFICATIONS.map((n, i) => (
          <div
            key={i}
            className="pix-notification-enter"
            style={{
              display: i <= activeIndex ? "block" : "none",
              animationDelay: "0ms",
            }}
          >
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-3 flex items-start gap-3">
              <BankLogo bank={n.bank} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-white font-semibold text-sm">Pix recebido</p>
                  <span className="text-white/50 text-xs">agora</span>
                </div>
                <p className="text-white/70 text-xs mt-0.5">
                  ORDEM DE PAGAMENTO {govLabel}
                </p>
                <p className="text-white font-bold text-sm mt-0.5">
                  {n.valor} creditado na sua conta
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main export ───

interface BelowFoldProps {
  userEstado: string | null;
  userUf: string | null;
  handleCheckoutClick: () => void;
  autoridadeRef: React.RefObject<HTMLElement>;
  ofertaRef: React.RefObject<HTMLElement>;
}

export default function BelowFoldSections({ userEstado, userUf, handleCheckoutClick, autoridadeRef, ofertaRef }: BelowFoldProps) {
  const counter = useAnimatedCounter(42);

  return (
    <>
      {/* ─── 3. NÃO É EMPRÉSTIMO ─── */}
      <section data-section="NaoEmprestimo" className="relative py-16 md:py-32 px-4 bg-[#0f1d32] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-[#d4a853]/5 blur-[60px]" />
          <div className="absolute top-1/4 right-1/4 w-[200px] h-[200px] rounded-full bg-[#d4a853]/[0.08] blur-[60px]" />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="max-w-3xl mx-auto">
            <div className="space-y-5 text-center">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-[1.05] uppercase">
                <span className="text-[#d4a853]">Não é</span>{" "}
                <span className="text-white">empréstimo.</span><br />
                <span className="text-[#d4a853]">Não é</span>{" "}
                <span className="text-white">favor.</span><br />
                <span className="text-white">É seu</span>{" "}
                <span className="text-[#d4a853]">direito por lei.</span>
              </h2>

              <div className="w-16 h-0.5 bg-[#d4a853]/40 mx-auto" />

              <p className="text-white/80 text-base sm:text-lg leading-relaxed">
                Existe um caminho legítimo, disponível, pensado para quem constrói o país de verdade:{" "}
                <strong className="text-white">o pequeno empresário.</strong>
              </p>
              <p className="text-white/70 text-base sm:text-lg leading-relaxed">
                Um caminho onde você não é refém dos juros, da burocracia ou da sorte.
                Um caminho onde a sua empresa ou ideia será{" "}
                <strong className="text-[#d4a853]">reconhecida e financiada como merece.</strong>
              </p>

              <div className="rounded-lg overflow-hidden border border-[#d4a853]/20 bg-white mt-2">
                <img src={leiDecreto} alt="Decreto-Lei nº 719 de 31 de Julho de 1969" className="w-full object-contain" loading="lazy" decoding="async" width={768} height={273} />
              </div>

              <p className="text-white/50 text-sm italic">
                Desde 1969 o Governo Federal libera, através de programas de incentivo, recursos para fomentar o crescimento empresarial no Brasil.
              </p>

              <div className="rounded-lg overflow-hidden border border-[#d4a853]/20 mt-2">
                <img src={reuniaoFomento} alt="Lançamento de editais de fomento à ciência, tecnologia e inovação" className="w-full object-cover" loading="lazy" decoding="async" width={768} height={277} />
              </div>

              <button
                onClick={handleCheckoutClick}
                className="inline-block mt-4 shimmer-btn bg-[#d4a853] hover:bg-[#c4983f] text-[#0a1628] font-extrabold text-lg px-8 py-4 rounded-xl shadow-lg shadow-[#d4a853]/25 transition-all duration-300 hover:scale-105 cursor-pointer"
              >
                QUERO MEU INGRESSO →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 4. 42+ PROGRAMAS / ÓRGÃOS DE FOMENTO ─── */}
      <Section dark>
        <div className="text-center space-y-8">
          <div className="inline-flex items-center gap-2 bg-[#d4a853]/10 text-[#d4a853] font-semibold text-sm px-4 py-2 rounded-full">
            <AlertTriangle size={16} />
            COM AS NOVAS POLÍTICAS, ESTES PROGRAMAS PODEM SE ENCERRAR A QUALQUER MOMENTO!
          </div>
          <div ref={counter.ref} className="flex flex-col items-center gap-2">
            <span className="text-6xl sm:text-7xl font-extrabold text-[#d4a853] tabular-nums">
              {counter.count}+
            </span>
            <p className="text-xl sm:text-2xl font-bold text-white">Programas de Incentivo Liberados Neste Exato Momento</p>
          </div>
          <p className="text-white/70 text-base sm:text-lg max-w-2xl mx-auto">
            Toda e qualquer empresa — <strong className="text-white">micro, pequena ou média</strong> — pode submeter seu projeto a um destes programas.
            Veja os órgãos que disponibilizam esses recursos:
          </p>

          <div className="relative mx-auto max-w-2xl">
            <div className="absolute inset-0 rounded-2xl bg-[#d4a853]/5 blur-2xl" />
            <img src={mapaOrgaos} alt="Mapa dos órgãos de fomento no Brasil" className="relative w-full rounded-2xl border border-[#d4a853]/15 shadow-xl" loading="lazy" decoding="async" width={700} height={478} />
          </div>

          <div className="flex flex-wrap justify-center gap-3 pt-4">
            {orgaos.map((o) => (
              <span key={o} className="bg-[#d4a853]/10 border border-[#d4a853]/25 text-[#d4a853] text-xs sm:text-sm font-semibold px-4 py-2 rounded-full">
                {o}
              </span>
            ))}
          </div>
          <p className="text-[#d4a853] font-bold text-lg sm:text-xl pt-2 transition-opacity duration-700">
            {userEstado
              ? <>Sua empresa <span className="underline decoration-[#d4a853]/60">no {userEstado}</span> pode estar a um passo de captar de R$ 39 mil a R$ 400 mil</>
              : "Sua empresa pode estar a um passo de captar de R$ 39 mil a R$ 400 mil"}
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            {["Sem favores", 'Sem "indicações"', "Seu direito por lei"].map((b) => (
              <span key={b} className="flex items-center gap-2 bg-[#0a1628]/80 border border-[#d4a853]/20 text-[#d4a853] text-sm font-semibold px-5 py-2.5 rounded-lg">
                <span className="text-red-500 font-bold">✕</span> {b}
              </span>
            ))}
          </div>
          <GoldButton onClick={handleCheckoutClick}>QUERO APRENDER A CAPTAR</GoldButton>
        </div>
      </Section>

      {/* ─── 5. O QUE VOCÊ VAI APRENDER ─── */}
      <section data-section="Aprender" ref={autoridadeRef as any} className="relative py-20 md:py-32 px-4 bg-[#0f1d32] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[300px] h-[300px] rounded-full bg-[#d4a853]/[0.03] blur-[60px]" />
          <div className="absolute bottom-0 right-1/4 w-[200px] h-[200px] rounded-full bg-[#d4a853]/[0.05] blur-[60px]" />
        </div>
        <WorkshopLearningSection />
      </section>

      {/* ─── PIX NOTIFICATIONS (mobile only) ─── */}
      <PixNotificationsSection uf={userUf} />

      {/* ─── COPY DE TRANSIÇÃO (mobile only) ─── */}
      <div className="sm:hidden pt-2 pb-4 px-6 bg-[#0a1628] text-center">
        <p className="text-[#d4a853] text-lg sm:text-xl font-bold leading-relaxed">
          Já pensou se essa ordem de pagamento fosse na conta da sua empresa? Isso daria uma alavancada no seu negócio?{" "}
          <span className="text-white">Faça como eles 👇</span>
        </p>
      </div>

      {/* ─── 8. PROVA SOCIAL — 6 VÍDEOS ─── */}
      <Section dark className="!pt-6 sm:!pt-16">
        <div className="text-center space-y-4">
          <p className="text-[#d4a853] font-semibold uppercase tracking-wider text-sm">Resultados reais</p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Assista pessoas reais que captaram recursos</h2>
          <Suspense fallback={<div className="h-96" />}>
            <VideoTestimonials testimonials={testimonials} />
          </Suspense>
          <GoldButton onClick={handleCheckoutClick}>EU TAMBÉM QUERO CAPTAR</GoldButton>
        </div>
      </Section>

      {/* ─── 7. QUEM SÃO PEDRO E IGOR ─── */}
      <Section dark={false}>
        <div className="max-w-2xl mx-auto space-y-5 text-center">
            <p className="text-[#d4a853] font-semibold uppercase tracking-wider text-sm">Seus mentores</p>
            <h2 className="text-2xl sm:text-3xl font-bold">Pedro Diniz e Igor Abreu</h2>
            <p className="text-white/60 text-sm">Empresários e Sócios da Dunas Capital</p>
            <div className="flex justify-center pt-2">
              <img src={pedroIgorImg} alt="Pedro Diniz e Igor Abreu" className="w-72 max-w-full rounded-2xl border-2 border-[#d4a853]/30 shadow-lg" loading="lazy" decoding="async" width={288} height={288} />
            </div>
            <p className="text-white/70 leading-relaxed">
              Especialistas em Programas de Incentivos Federais para projetos de R$ 39 mil a R$ 400 mil.
            </p>
            <p className="text-white/70 leading-relaxed">
              Com mais de <strong className="text-[#d4a853]">5 anos de mercado</strong> e mais de{" "}
              <strong className="text-[#d4a853]">R$ 50 MILHÕES captados</strong> para clientes e alunos,
              a Dunas Capital conta com um time que domina amplamente os Programas de Incentivo.
            </p>
            <p className="text-white/70 leading-relaxed">
              Pedro Diniz e Igor Abreu são os profissionais mais capacitados do Brasil hoje para te mostrar o passo a passo detalhado!
            </p>
        </div>
      </Section>

      {/* ─── 9. OFERTA / PRICING ─── */}
      <Section dark>
        <div ref={ofertaRef as any} className="max-w-4xl mx-auto space-y-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center">
            Workshop Do Zero à Captação
          </h2>
          <div className="bg-[#0f1d32] border-2 border-[#d4a853]/30 rounded-3xl overflow-hidden">
            <div className="flex flex-col md:flex-row">
              <div className="flex-1 p-8 sm:p-10 space-y-5 border-b md:border-b-0 md:border-r border-[#d4a853]/15">
                <p className="text-[#d4a853] font-semibold uppercase tracking-wider text-sm">O que você vai receber</p>
                <ul className="space-y-4">
                  {[
                    "Workshop ao vivo de 1h no Zoom",
                    "Lista TOP 10 programas de incentivo",
                    "Grupo de Alerta WhatsApp",
                    "Garantia incondicional de 30 dias",
                  ].map((t) => (
                    <li key={t} className="flex items-center gap-3 text-white/80 text-sm">
                      <CheckCircle className="text-[#d4a853] shrink-0" size={18} />
                      {t}
                    </li>
                  ))}
                </ul>
                <div className="pt-4 flex items-center gap-4">
                  <img src={seloGarantia} alt="Garantia 30 dias" className="w-20 h-20 object-contain" width={80} height={80} />
                  <div>
                    <p className="text-white/80 text-sm font-semibold">Garantia de 30 dias</p>
                    <p className="text-white/50 text-xs">Risco zero. Não gostou, devolvemos 100%.</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 p-8 sm:p-10 flex flex-col items-center justify-center space-y-6 bg-[#0a1628]/40">
                <span className="bg-red-500/15 text-red-400 font-bold text-xs px-4 py-1.5 rounded-full uppercase tracking-wider animate-pulse">
                  Vagas limitadas
                </span>
                <div className="text-center space-y-1">
                  <p className="text-white/40 text-sm">De <span className="line-through">R$ 97,00</span></p>
                  <p className="text-white/60 text-xs uppercase tracking-widest">por</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-white/50 text-2xl font-bold">R$</span>
                  <span className="text-6xl sm:text-7xl font-extrabold text-[#d4a853]">37</span>
                  <span className="text-white/50 text-2xl font-bold">,00</span>
                </div>
                <p className="text-white/40 text-xs">Pagamento único · Acesso imediato</p>
                <GoldButton className="w-full max-w-xs text-center" showGuarantee={false} onClick={handleCheckoutClick}>
                  GARANTIR MINHA VAGA AGORA
                  <ArrowRight className="inline ml-2" size={18} />
                </GoldButton>
                <div className="flex items-center gap-3 pt-2">
                  <svg viewBox="0 0 48 32" className="h-6 opacity-40"><rect width="48" height="32" rx="4" fill="#fff"/><text x="24" y="20" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#1a1f71">VISA</text></svg>
                  <svg viewBox="0 0 48 32" className="h-6 opacity-40"><rect width="48" height="32" rx="4" fill="#fff"/><circle cx="19" cy="16" r="8" fill="#eb001b" opacity="0.8"/><circle cx="29" cy="16" r="8" fill="#f79e1b" opacity="0.8"/></svg>
                  <svg viewBox="0 0 48 32" className="h-6 opacity-40"><rect width="48" height="32" rx="4" fill="#fff"/><text x="24" y="20" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#000">ELO</text></svg>
                  <svg viewBox="0 0 48 32" className="h-6 opacity-40"><rect width="48" height="32" rx="4" fill="#fff"/><text x="24" y="20" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#2e77bb">AMEX</text></svg>
                  <svg viewBox="0 0 48 32" className="h-6 opacity-40"><rect width="48" height="32" rx="4" fill="#fff"/><text x="24" y="20" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#32bcad">PIX</text></svg>
                </div>
                <p className="text-white/30 text-[10px]">Ambiente seguro · Dados criptografados</p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ─── 10. BÔNUS ─── */}
      <section data-section="Bonus" className="relative py-20 md:py-32 px-4 bg-[#0a1628] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-[#d4a853]/[0.04] blur-[60px]" />
          <div className="absolute top-1/4 left-1/4 w-[150px] h-[150px] rounded-full bg-[#d4a853]/[0.06] blur-[60px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[150px] h-[150px] rounded-full bg-[#d4a853]/[0.06] blur-[60px]" />
        </div>
        <BonusSection />
      </section>

      {/* ─── 11. GARANTIA ─── */}
      <Section dark={false}>
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div className="flex justify-center">
            <img src={seloGarantia} alt="Garantia incondicional de 30 dias" className="w-48 sm:w-56" loading="lazy" decoding="async" width={224} height={224} />
          </div>
          <div className="space-y-5">
            <h2 className="text-2xl sm:text-3xl font-bold">Garantia Incondicional de 30 Dias</h2>
            <p className="text-white/70 leading-relaxed">
              Você pode entrar no grupo, assistir ao workshop, baixar todos os materiais e se, mesmo assim, achar que não valeu a pena...
            </p>
            <p className="text-white/70 leading-relaxed">
              Basta entrar em contato com nossa equipe dentro do prazo de 30 dias após a aprovação da compra e solicitar o reembolso integral.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {["Sem letras miúdas", "Sem burocracia", "Risco zero para você"].map((t) => (
                <div key={t} className="flex items-center gap-2 text-[#d4a853] font-semibold text-sm">
                  <CheckCircle size={16} />
                  {t}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ─── 11. FAQ ─── */}
      <Section dark={false}>
        <div className="max-w-2xl mx-auto space-y-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-center">Perguntas Frequentes</h2>
          <Accordion type="single" collapsible className="space-y-3">
            {faqItems.map((item, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="bg-[#0a1628] border border-[#d4a853]/15 rounded-xl px-6 overflow-hidden"
              >
                <AccordionTrigger className="text-white hover:text-[#d4a853] hover:no-underline py-5 text-left">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-white/60 pb-5">{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Section>

      {/* ─── 12. FOOTER CTA ─── */}
      <section data-section="FooterCTA" className="bg-[#0a1628] border-t border-[#d4a853]/15 py-16 md:py-24 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold" style={{ textWrap: "balance" as any }}>
            Seja você um <span className="text-[#d4a853]">empresário(a)</span> experiente ou alguém com apenas uma ideia na cabeça
          </h2>
          <p className="text-white/70 text-lg">
            Os Programas de Incentivos Federais podem liberar de{" "}
            <strong className="text-[#d4a853]">R$ 39 mil a R$ 400 mil</strong> em poucos dias.
          </p>
          <GoldButton className="text-xl px-10 py-5" onClick={handleCheckoutClick}>
            QUERO MINHA VAGA
            <ArrowRight className="inline ml-2" size={20} />
          </GoldButton>
          <p className="text-white/40 text-xs">Quinta-feira às 20h · AO VIVO no Zoom</p>
        </div>
      </section>
    </>
  );
}
