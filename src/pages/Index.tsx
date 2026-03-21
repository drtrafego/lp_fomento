import { useState, useEffect, useRef, useCallback } from "react";

import { Play, CheckCircle, Clock, Users, Zap, Gift, Shield, ChevronDown, AlertTriangle, ArrowRight, MessageCircle, MapPin } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import headerImg from "@/assets/header-dunas.png";
import seloGarantia from "@/assets/selo-garantia.png";
import autoridadeImg from "@/assets/autoridade-homem.png";
import mapaOrgaos from "@/assets/mapa-orgaos.png";
import reuniaoFomento from "@/assets/reuniao-fomento.webp";
import leiDecreto from "@/assets/lei-decreto.png";
import zoomLogo from "@/assets/zoom-logo.png";
import { ScrollTypewriter, useSequentialBulletProgress } from "@/components/ScrollTypewriter";

import caseBulldog from "@/assets/cases/bulldogburguer.jpeg";
import caseRoys from "@/assets/cases/roysbrasil.jpeg";
import caseBiofluid from "@/assets/cases/biofluid.jpeg";
import caseQuery from "@/assets/cases/querysistemas.jpeg";
import caseInstabov from "@/assets/cases/instabovreal.jpeg";
import logoFapema from "@/assets/logos/fapema.png";

const CHECKOUT_URL =
  "https://payfast.greenn.com.br/124770/offer/HZeJnK?ch_id=23349&b_id_1=130170&b_offer_1=tJv2Nz&b_id_2=149317&b_offer_2=R1ELtR&cart_token=1200637589.1771014523";
function useUserState() {
  const [estado, setEstado] = useState<string | null>(null);
  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then(r => r.json())
      .then(data => {
        if (data.country_code === "BR" && data.region) {
          setEstado(data.region);
        }
      })
      .catch(() => {});
  }, []);
  return estado;
}

function getNextThursday8pm() {
  const now = new Date();
  const day = now.getDay();
  let daysUntilThursday = (4 - day + 7) % 7;
  if (daysUntilThursday === 0) {
    const target = new Date(now);
    target.setHours(20, 0, 0, 0);
    if (now >= target) daysUntilThursday = 7;
  }
  const next = new Date(now);
  next.setDate(now.getDate() + daysUntilThursday);
  next.setHours(20, 0, 0, 0);
  return next;
}

function useCountdown() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    const target = getNextThursday8pm();
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
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return timeLeft;
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
function ScrollRevealBadges() {
  const badges = ["Sem favores", 'Sem "indicações"', "Seu direito por lei"];
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
      {badges.map((t, i) => (
        <div
          key={t}
          className="bg-[#0a1628] border border-[#d4a853]/20 rounded-xl py-4 px-6 transition-all duration-700"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0) scale(1)" : "translateY(30px) scale(0.9)",
            transitionDelay: `${i * 300}ms`,
          }}
        >
          <p className="text-[#d4a853] font-bold">{t}</p>
        </div>
      ))}
    </div>
  );
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

const GoldButton = ({ children, className = "", showGuarantee = true }: { children: React.ReactNode; className?: string; showGuarantee?: boolean }) => (
  <div className="flex flex-col items-center gap-2">
    <a
      href={CHECKOUT_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-block relative overflow-hidden rounded-lg font-bold text-lg md:text-xl px-8 py-4 bg-[#d4a853] text-[#0a1628] shimmer-btn active:scale-[0.97] transition-transform ${className}`}
    >
      {children}
    </a>
    {showGuarantee && (
      <span className="flex items-center gap-1.5 text-white/45 text-xs">
        <Shield size={12} />
        Garantia de 30 dias · Compra segura
      </span>
    )}
  </div>
);

const testimonials = [
  { handle: "@depoimento1", value: "R$ 180.000" },
  { handle: "@depoimento2", value: "R$ 95.000" },
  { handle: "@depoimento3", value: "R$ 250.000" },
  { handle: "@depoimento4", value: "R$ 39.000" },
  { handle: "@depoimento5", value: "R$ 150.000" },
  { handle: "@depoimento6", value: "R$ 400.000" },
];

const marqueeCases: { handle: string; value: string; color: string; image?: string }[] = [
  { handle: "@bulldogburguer", value: "R$ 420.000", color: "#d4a853", image: caseBulldog },
  { handle: "@roysbrasil", value: "R$ 79.000", color: "#5b8fb9", image: caseRoys },
  { handle: "@biofluid_", value: "R$ 194.410", color: "#7cb87c", image: caseBiofluid },
  { handle: "@querysistemas", value: "R$ 70.000", color: "#c97e6c", image: caseQuery },
  { handle: "@instabovreal", value: "R$ 739.000", color: "#6ec9a8", image: caseInstabov },
  { handle: "@padarianova", value: "R$ 95.000", color: "#5b8fb9" },
  { handle: "@techsolucoes", value: "R$ 250.000", color: "#7cb87c" },
  { handle: "@modafitbr", value: "R$ 180.000", color: "#c97e6c" },
  { handle: "@greenfarma", value: "R$ 150.000", color: "#6ec9a8" },
  { handle: "@autoshopbr", value: "R$ 39.000", color: "#b8a55b" },
  { handle: "@cafeorigens", value: "R$ 120.000", color: "#9b7cc4" },
  { handle: "@studioarqbr", value: "R$ 300.000", color: "#c4867c" },
  { handle: "@petvida", value: "R$ 85.000", color: "#6cb8b8" },
  { handle: "@cosmebr", value: "R$ 200.000", color: "#c9a86e" },
  { handle: "@fitboxgym", value: "R$ 78.000", color: "#7c9bc4" },
  { handle: "@organicaeco", value: "R$ 350.000", color: "#8bc47c" },
  { handle: "@construtiva", value: "R$ 400.000", color: "#c4a07c" },
  { handle: "@digitalflowbr", value: "R$ 190.000", color: "#7cc4c4" },
  { handle: "@saboresdobrasil", value: "R$ 55.000", color: "#c47c9b" },
  { handle: "@moveisartbr", value: "R$ 280.000", color: "#a8c47c" },
  { handle: "@clinicaviva", value: "R$ 160.000", color: "#7c7cc4" },
  { handle: "@logibr", value: "R$ 220.000", color: "#c4c47c" },
  { handle: "@edutechbr", value: "R$ 130.000", color: "#7cc48a" },
  { handle: "@solarenergy", value: "R$ 390.000", color: "#c4b87c" },
  { handle: "@fashionhaus", value: "R$ 100.000", color: "#b87cc4" },
  { handle: "@agrobr360", value: "R$ 310.000", color: "#7cb8c4" },
  { handle: "@cervejariabr", value: "R$ 145.000", color: "#c4967c" },
  { handle: "@smartdevbr", value: "R$ 260.000", color: "#7cc4b8" },
  { handle: "@beautyline", value: "R$ 72.000", color: "#c47ca8" },
  { handle: "@reciclamais", value: "R$ 340.000", color: "#8ac47c" },
  { handle: "@hotelpremium", value: "R$ 180.000", color: "#c4a87c" },
  { handle: "@brinquedoskids", value: "R$ 60.000", color: "#7c9ec4" },
  { handle: "@textilbrasil", value: "R$ 275.000", color: "#c4c07c" },
  { handle: "@biofarmbr", value: "R$ 210.000", color: "#7cc4a0" },
];

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

function useDayCountdown() {
  const day = new Date().getDay();
  if (day === 2) return { show: true, label: "Faltam 2 dias", progress: 33 };
  if (day === 3) return { show: true, label: "É amanhã!", progress: 66 };
  if (day === 4) return { show: true, label: "É HOJE!", progress: 100 };
  return { show: false, label: "", progress: 0 };
}

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

  // Individual card observers for zoom-in numbers (observe both desktop and mobile)
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
        {/* Zoom logo badge */}
        <div className="flex items-center justify-center gap-2 mt-3">
          <div className="flex items-center gap-2 bg-[#2D8CFF]/15 border border-[#2D8CFF]/30 rounded-full px-4 py-1.5">
            <img src={zoomLogo} alt="Zoom" className="w-5 h-5 object-contain" />
            <span className="text-[#2D8CFF] text-xs font-semibold uppercase tracking-wider">via Zoom</span>
          </div>
        </div>
      </div>

      {/* Desktop: horizontal cards with arrows */}
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
                  <ul className="space-y-3">
                    {card.bullets.map((b, j) => (
                      <li key={j} className="flex items-start gap-2.5 text-sm leading-relaxed">
                        <CheckCircle className="text-[#d4a853] shrink-0 mt-0.5" size={16} />
                        <ScrollTypewriter text={b} />
                      </li>
                    ))}
                  </ul>
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

      {/* Mobile: vertical cards with down arrows — numbers centered + zoom-in */}
      <div className="md:hidden space-y-0">
        {workshopCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={card.num}>
              {/* Centered large number with zoom-in */}
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
                  <ul className="space-y-2.5">
                    {card.bullets.map((b, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm leading-relaxed">
                        <CheckCircle className="text-[#d4a853] shrink-0 mt-0.5" size={15} />
                        <ScrollTypewriter text={b} />
                      </li>
                    ))}
                  </ul>
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
      icon: Gift,
      title: "Lista TOP 10",
      desc: "Os programas de incentivo disponíveis AGORA! A lista mais atualizada do mercado com os editais abertos para você aplicar imediatamente.",
      price: "R$ 97,00",
    },
    {
      icon: MessageCircle,
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

      <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
        {bonuses.map((b, i) => {
          const Icon = b.icon;
          return (
            <div
              key={b.title}
              className="relative bg-[#0f1d32] border border-[#d4a853]/15 rounded-2xl p-8 card-glow-hover transition-all duration-700 group"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0) scale(1)" : "translateY(40px) scale(0.95)",
                transitionDelay: `${i * 250}ms`,
              }}
            >
              {/* Shine sweep on hover */}
              <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#d4a853]/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </div>

              <div className="relative space-y-4 text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#d4a853]/10 flex items-center justify-center mx-auto border border-[#d4a853]/20">
                  <Icon className="text-[#d4a853]" size={30} />
                </div>
                <h3 className="text-xl font-bold text-white">{b.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{b.desc}</p>

                {/* Price: crossed out → FREE */}
                <div className="pt-3 border-t border-white/10 space-y-1">
                  <p className="text-white/40 text-sm line-through">{b.price}</p>
                  <p className="text-[#d4a853] font-extrabold text-2xl">R$ 0,00</p>
                  <p className="text-[#d4a853]/60 text-xs font-semibold uppercase tracking-wider">Grátis para você</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Total savings */}
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

export default function Index() {
  const countdown = useCountdown();
  const counter = useAnimatedCounter(42);
  const dayCountdown = useDayCountdown();
  const userEstado = useUserState();
  

  return (
    <div className="min-h-screen bg-[#0a1628] text-white overflow-x-hidden">
      {/* ─── 1. STICKY HEADER ─── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a1628]/95 backdrop-blur-md border-b border-[#d4a853]/20 py-3 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-[#d4a853] font-semibold tracking-wide uppercase">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            AO VIVO no ZOOM · Quinta-feira 20h
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-white/60 hidden sm:inline">Começa em:</span>
            {(["days", "hours", "minutes", "seconds"] as const).map((unit, i) => (
              <div key={unit} className="flex items-center gap-1">
                {i > 0 && <span className="text-[#d4a853] font-bold">:</span>}
                <span className="bg-[#d4a853]/15 text-[#d4a853] rounded px-2 py-1 font-mono font-bold text-sm tabular-nums min-w-[2.2rem] text-center">
                  {String(countdown[unit]).padStart(2, "0")}
                </span>
                <span className="text-white/40 text-[10px] uppercase hidden sm:inline">
                  {unit === "days" ? "d" : unit === "hours" ? "h" : unit === "minutes" ? "m" : "s"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </header>


      {/* ─── 2. HERO ─── */}
      <section className="relative bg-[#0a1628] pt-20 pb-10 md:pt-28 md:pb-24 px-4">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6 md:gap-10 items-center">
          <div className="space-y-4 md:space-y-6 animate-fade-in">
            {/* Date/event bar */}
            <div className="flex items-center gap-3 text-sm">
              <span className="bg-red-500/20 text-red-400 font-bold text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-red-500/30">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                AO VIVO
              </span>
              <span className="text-white/50 text-xs sm:text-sm">Quinta-feira às 20h · Zoom</span>
            </div>

            {/* Day countdown bar - only Tue/Wed/Thu */}
            {dayCountdown.show && (
              <div className="bg-[#0f1d32] border border-[#d4a853]/20 rounded-xl p-3 md:p-4 space-y-2">
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
                  <span>Terça</span>
                  <span>Quarta</span>
                  <span>Quinta 20h</span>
                </div>
              </div>
            )}

            <h1 className="text-[1.75rem] sm:text-4xl lg:text-5xl font-extrabold leading-[1.15] sm:leading-[1.1] text-white" style={{ textWrap: "balance" as any }}>
              Em 1h ao vivo, eu vou te mostrar o passo a passo de como você vai captar de{" "}
              <span className="text-[#d4a853]">R$ 39 mil a R$ 400 mil</span>{" "}
              para sua empresa ou ideia de negócio
            </h1>
            <ul className="space-y-2 md:space-y-3 text-sm sm:text-base md:text-lg text-white/80">
              {["Sem pagar juros", "Sem precisar devolver o dinheiro", "Sem comprovar grande faturamento"].map((t) => (
                <li key={t} className="flex items-center gap-2 md:gap-3">
                  <CheckCircle className="text-[#d4a853] shrink-0" size={18} />
                  {t}
                </li>
              ))}
            </ul>
            <p className="text-white/60 text-xs sm:text-sm">Através de Programas de Incentivo Federais</p>
            <GoldButton className="w-full sm:w-auto">
              GARANTIR MINHA VAGA
              <ArrowRight className="inline ml-2" size={18} />
            </GoldButton>
          </div>
          <div className="flex justify-center animate-fade-in" style={{ animationDelay: "200ms" }}>
            <img
              src={headerImg}
              alt="Pedro Diniz e Igor Abreu — Workshop Dunas Capital"
              className="w-full max-w-md rounded-xl shadow-2xl shadow-[#d4a853]/15 border-2 border-[#d4a853]/20 hero-glow"
            />
          </div>
        </div>
      </section>

      {/* ─── MARQUEE CASES ─── */}
      <div className="bg-[#0f1d32] border-y border-[#d4a853]/10 overflow-hidden">
        <p className="text-center text-white/50 text-xs pt-3 pb-1 tracking-widest uppercase">Faça como eles — captaram recursos e não precisaram devolver</p>
        <div className="marquee-track flex items-center gap-8 py-3 whitespace-nowrap">
          {[...marqueeCases, ...marqueeCases].map((c, i) => (
            <div key={i} className="flex items-center gap-2 shrink-0 px-2">
              {c.image ? (
                <img src={c.image} alt={c.handle} className="w-7 h-7 rounded-full object-cover shrink-0" />
              ) : (
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                  style={{ backgroundColor: c.color }}
                >
                  {c.handle.slice(1, 3).toUpperCase()}
                </div>
              )}
              <span className="text-white/60 text-xs">{c.handle}</span>
              <span className="text-[#d4a853] text-xs font-bold">{c.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── 3. NÃO É EMPRÉSTIMO ─── */}
      <section className="relative py-16 md:py-32 px-4 bg-[#0a1628] overflow-hidden">
        {/* Golden glow background effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#d4a853]/5 blur-[120px]" />
          <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-[#d4a853]/[0.08] blur-[80px] animate-pulse" />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Mobile: stacked vertically. Desktop: 2 columns */}
          <div className="flex flex-col md:grid md:grid-cols-2 items-center gap-8 md:gap-16">

            {/* Image with golden rings behind + gradient anchor */}
            <div className="relative flex justify-center w-full">
              {/* Golden rings behind image */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] sm:w-[350px] sm:h-[350px] md:w-[400px] md:h-[400px] rounded-full border border-[#d4a853]/20" style={{ animation: "spin 20s linear infinite" }} />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] sm:w-[420px] sm:h-[420px] md:w-[500px] md:h-[500px] rounded-full border border-[#d4a853]/10" style={{ animation: "spin 30s linear infinite reverse" }} />
              {/* Glow behind image */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[300px] h-[200px] bg-[#d4a853]/15 blur-[80px] rounded-full" />
              <div className="relative">
                <img
                  src={autoridadeImg}
                  alt="Especialista em captação de recursos"
                  className="relative w-56 sm:w-64 md:w-80 drop-shadow-[0_0_40px_rgba(212,168,83,0.3)]"
                />
                {/* Gradient to anchor image to background */}
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0a1628] via-[#0a1628]/80 to-transparent" />
              </div>
            </div>

            {/* Text content */}
            <div className="space-y-5 text-center md:text-left">
              <span className="inline-block bg-red-500/15 text-red-400 font-bold text-sm px-4 py-1.5 rounded-full uppercase tracking-wider border border-red-500/20">
                Não é empréstimo
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-[1.05] uppercase">
                <span className="text-[#d4a853]">Não é</span>{" "}
                <span className="text-white">empréstimo.</span><br />
                <span className="text-[#d4a853]">Não é</span>{" "}
                <span className="text-white">favor.</span><br />
                <span className="text-white">É seu</span>{" "}
                <span className="text-[#d4a853]">direito por lei.</span>
              </h2>

              <div className="w-16 h-0.5 bg-[#d4a853]/40 mx-auto md:mx-0" />

              <p className="text-white/80 text-base sm:text-lg leading-relaxed">
                Existe um caminho legítimo, disponível, pensado para quem constrói o país de verdade:{" "}
                <strong className="text-white">o pequeno empresário.</strong>
              </p>
              <p className="text-white/70 text-base sm:text-lg leading-relaxed">
                Um caminho onde você não é refém dos juros, da burocracia ou da sorte.
                Um caminho onde a sua empresa ou ideia será{" "}
                <strong className="text-[#d4a853]">reconhecida e financiada como merece.</strong>
              </p>

              {/* Lei — entre "merece" e "Desde 1969" */}
              <div className="rounded-lg overflow-hidden border border-[#d4a853]/20 bg-white mt-2">
                <img src={leiDecreto} alt="Decreto-Lei nº 719 de 31 de Julho de 1969" className="w-full object-contain" />
              </div>

              <p className="text-white/50 text-sm italic">
                Desde 1969 o Governo Federal libera, através de programas de incentivo, recursos para fomentar o crescimento empresarial no Brasil.
              </p>

              {/* Reunião de Fomento */}
              <div className="rounded-lg overflow-hidden border border-[#d4a853]/20 mt-2">
                <img src={reuniaoFomento} alt="Lançamento de editais de fomento à ciência, tecnologia e inovação" className="w-full object-cover" />
              </div>

              <a
                href={CHECKOUT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-4 shimmer-btn bg-[#d4a853] hover:bg-[#c4983f] text-[#0a1628] font-extrabold text-lg px-8 py-4 rounded-xl shadow-lg shadow-[#d4a853]/25 transition-all duration-300 hover:scale-105"
              >
                QUERO MEU INGRESSO →
              </a>
            </div>
          </div>

          <div className="mt-12">
            <ScrollRevealBadges />
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

          {/* Map with geolocation pin */}
          <div className="relative mx-auto max-w-2xl">
            <div className="absolute inset-0 rounded-2xl bg-[#d4a853]/5 blur-2xl" />
            <img
              src={mapaOrgaos}
              alt="Mapa dos órgãos de fomento no Brasil"
              className="relative w-full rounded-2xl border border-[#d4a853]/15 shadow-xl"
            />
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
          <GoldButton>QUERO APRENDER A CAPTAR</GoldButton>
        </div>
      </Section>

      {/* ─── 5. O QUE VOCÊ VAI APRENDER ─── */}
      <section className="relative py-20 md:py-32 px-4 bg-[#0f1d32] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[400px] h-[400px] rounded-full bg-[#d4a853]/[0.03] blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] rounded-full bg-[#d4a853]/[0.05] blur-[80px]" />
        </div>
        <WorkshopLearningSection />
      </section>

      {/* ─── 6. BÔNUS ─── */}
      <section className="relative py-20 md:py-32 px-4 bg-[#0a1628] overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#d4a853]/[0.04] blur-[120px]" />
          <div className="absolute top-1/4 left-1/4 w-[200px] h-[200px] rounded-full bg-[#d4a853]/[0.06] blur-[80px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[200px] h-[200px] rounded-full bg-[#d4a853]/[0.06] blur-[80px] animate-pulse" style={{ animationDelay: "1s" }} />
        </div>
        <BonusSection />
      </section>

      {/* ─── 7. QUEM SÃO PEDRO E IGOR ─── */}
      <Section dark={false}>
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div className="flex justify-center">
            <img
              src={headerImg}
              alt="Pedro Diniz e Igor Abreu"
              className="w-full max-w-sm rounded-2xl border border-[#d4a853]/15 shadow-xl"
            />
          </div>
          <div className="space-y-5">
            <p className="text-[#d4a853] font-semibold uppercase tracking-wider text-sm">Seus mentores</p>
            <h2 className="text-2xl sm:text-3xl font-bold">Pedro Diniz e Igor Abreu</h2>
            <p className="text-white/60 text-sm">Empresários e Sócios da Dunas Capital</p>
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
        </div>
      </Section>

      {/* ─── 8. PROVA SOCIAL — 6 VÍDEOS ─── */}
      <Section dark>
        <div className="text-center space-y-10">
          <p className="text-[#d4a853] font-semibold uppercase tracking-wider text-sm">Resultados reais</p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Assista pessoas reais que captaram recursos</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="bg-[#0f1d32] border border-[#d4a853]/15 rounded-2xl overflow-hidden hover:border-[#d4a853]/40 transition-colors group"
              >
                {/* Video placeholder */}
                <div className="relative aspect-[9/16] max-h-[320px] bg-[#0a1628] flex items-center justify-center cursor-pointer">
                  <div className="w-16 h-16 rounded-full bg-[#d4a853]/20 flex items-center justify-center group-hover:bg-[#d4a853]/30 transition-colors">
                    <Play className="text-[#d4a853] ml-1" size={28} fill="currentColor" />
                  </div>
                  <span className="absolute bottom-3 right-3 bg-black/60 text-white/80 text-xs px-2 py-1 rounded">
                    Vídeo em breve
                  </span>
                </div>
                {/* Info */}
                <div className="p-5 space-y-1 text-left">
                  <p className="text-white/50 text-sm">{t.handle}</p>
                  <p className="text-[#d4a853] text-xl font-bold">{t.value}</p>
                  <p className="text-white/40 text-xs">captados com Programas de Incentivo</p>
                </div>
              </div>
            ))}
          </div>
          <GoldButton>EU TAMBÉM QUERO CAPTAR</GoldButton>
        </div>
      </Section>

      {/* ─── 9. GARANTIA ─── */}
      <Section dark={false}>
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div className="flex justify-center">
            <img src={seloGarantia} alt="Garantia incondicional de 30 dias" className="w-48 sm:w-56" />
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

      {/* ─── 10. OFERTA / PRICING ─── */}
      <Section dark>
        <div className="max-w-4xl mx-auto space-y-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center">
            Workshop Do Zero ao Milhão
          </h2>
          <div className="bg-[#0f1d32] border-2 border-[#d4a853]/30 rounded-3xl overflow-hidden">
            <div className="flex flex-col md:flex-row">
              {/* Left — Benefits + Guarantee Seal */}
              <div className="flex-1 p-8 sm:p-10 space-y-5 border-b md:border-b-0 md:border-r border-[#d4a853]/15">
                <p className="text-[#d4a853] font-semibold uppercase tracking-wider text-sm">O que você vai receber</p>
                <ul className="space-y-4">
                  {[
                    "Workshop ao vivo de 1h no Zoom",
                    "Masterclass exclusiva gravada",
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
                  <img src={seloGarantia} alt="Garantia 30 dias" className="w-20 h-20 object-contain" />
                  <div>
                    <p className="text-white/80 text-sm font-semibold">Garantia de 30 dias</p>
                    <p className="text-white/50 text-xs">Risco zero. Não gostou, devolvemos 100%.</p>
                  </div>
                </div>
              </div>

              {/* Right — Price + CTA + Card Icons */}
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
                  <span className="text-6xl sm:text-7xl font-extrabold text-[#d4a853]">47</span>
                  <span className="text-white/50 text-2xl font-bold">,00</span>
                </div>
                <p className="text-white/40 text-xs">Pagamento único · Acesso imediato</p>
                <GoldButton className="w-full max-w-xs text-center" showGuarantee={false}>
                  GARANTIR MINHA VAGA AGORA
                  <ArrowRight className="inline ml-2" size={18} />
                </GoldButton>
                {/* Card brand icons */}
                <div className="flex items-center gap-3 pt-2">
                  {/* Visa */}
                  <svg viewBox="0 0 48 32" className="h-6 opacity-40"><rect width="48" height="32" rx="4" fill="#fff"/><text x="24" y="20" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#1a1f71">VISA</text></svg>
                  {/* Mastercard */}
                  <svg viewBox="0 0 48 32" className="h-6 opacity-40"><rect width="48" height="32" rx="4" fill="#fff"/><circle cx="19" cy="16" r="8" fill="#eb001b" opacity="0.8"/><circle cx="29" cy="16" r="8" fill="#f79e1b" opacity="0.8"/></svg>
                  {/* Elo */}
                  <svg viewBox="0 0 48 32" className="h-6 opacity-40"><rect width="48" height="32" rx="4" fill="#fff"/><text x="24" y="20" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#000">ELO</text></svg>
                  {/* Amex */}
                  <svg viewBox="0 0 48 32" className="h-6 opacity-40"><rect width="48" height="32" rx="4" fill="#fff"/><text x="24" y="20" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#2e77bb">AMEX</text></svg>
                  {/* Pix */}
                  <svg viewBox="0 0 48 32" className="h-6 opacity-40"><rect width="48" height="32" rx="4" fill="#fff"/><text x="24" y="20" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#32bcad">PIX</text></svg>
                </div>
                <p className="text-white/30 text-[10px]">Ambiente seguro · Dados criptografados</p>
              </div>
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
      <section className="bg-[#0a1628] border-t border-[#d4a853]/15 py-16 md:py-24 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold" style={{ textWrap: "balance" as any }}>
            Seja você um empresário experiente ou alguém com apenas uma ideia na cabeça
          </h2>
          <p className="text-white/70 text-lg">
            Os Programas de Incentivos Federais podem liberar de{" "}
            <strong className="text-[#d4a853]">R$ 39 mil a R$ 400 mil</strong> em poucos dias.
          </p>
          <GoldButton className="text-xl px-10 py-5">
            QUERO MINHA VAGA
            <ArrowRight className="inline ml-2" size={20} />
          </GoldButton>
          <p className="text-white/40 text-xs">Quinta-feira às 20h · AO VIVO no Zoom</p>
        </div>
      </section>

      {/* ─── FIXED BOTTOM BAR — GLASSMORPHISM ─── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#0a1628]/60 border-t border-[#d4a853]/20 py-3 px-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="hidden sm:flex flex-col text-sm">
            <span className="text-white/70 font-semibold flex items-center gap-2">
              <Clock size={14} className="text-[#d4a853]" />
              Quinta-feira às 20h · Online ao vivo
            </span>
            <span className="text-white/40 text-xs">100% online e ao vivo no Zoom</span>
          </div>
          <a
            href={CHECKOUT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block w-full sm:w-auto text-center relative overflow-hidden rounded-xl font-bold text-base sm:text-lg px-8 py-3.5 bg-[#d4a853] text-[#0a1628] shimmer-btn active:scale-[0.97] transition-transform"
          >
            QUERO MEU INGRESSO
          </a>
        </div>
      </div>

      {/* Bottom spacer for fixed bar */}
      <div className="h-16" />
    </div>
  );
}
