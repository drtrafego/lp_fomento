import { useState, useEffect, useRef } from "react";
import { Play, CheckCircle, Clock, Users, Zap, Gift, Shield, ChevronDown, AlertTriangle, ArrowRight, MessageCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import headerImg from "@/assets/header-dunas.png";
import seloGarantia from "@/assets/selo-garantia.png";
import mapaOrgaos from "@/assets/mapa-orgaos.png";

const CHECKOUT_URL =
  "https://payfast.greenn.com.br/124770/offer/HZeJnK?ch_id=23349&b_id_1=130170&b_offer_1=tJv2Nz&b_id_2=149317&b_offer_2=R1ELtR&cart_token=1200637589.1771014523";

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

const orgaos = [
  "FINEP", "CNPq", "SEBRAE", "FAPESP", "FAPERJ", "FAPEMIG",
  "BNDES", "EMBRAPII", "CAPES", "AEB", "MCTI", "FAPESC",
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

export default function Index() {
  const countdown = useCountdown();
  const counter = useAnimatedCounter(42);
  const dayCountdown = useDayCountdown();

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
      <section className="relative bg-[#0a1628] pt-24 pb-16 md:pt-28 md:pb-24 px-4">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <div className="space-y-6 animate-fade-in">
            {/* Date/event bar */}
            <div className="flex items-center gap-3 text-sm">
              <span className="bg-red-500/20 text-red-400 font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                AO VIVO
              </span>
              <span className="text-white/50">Quinta-feira às 20h · Zoom</span>
            </div>

            {/* Day countdown bar - only Tue/Wed/Thu */}
            {dayCountdown.show && (
              <div className="bg-[#0f1d32] border border-[#d4a853]/20 rounded-xl p-4 space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/60">Workshop ao vivo</span>
                  <span className={`font-bold ${dayCountdown.progress === 100 ? "text-green-400" : "text-[#d4a853]"}`}>
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

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-[1.1] text-white" style={{ textWrap: "balance" as any }}>
              Em 1h ao vivo, eu vou te mostrar o passo a passo de como você vai captar de{" "}
              <span className="text-[#d4a853]">R$ 39 mil a R$ 400 mil</span>{" "}
              para sua empresa ou ideia de negócio
            </h1>
            <ul className="space-y-3 text-base sm:text-lg text-white/80">
              {["Sem pagar juros", "Sem precisar devolver o dinheiro", "Sem comprovar grande faturamento"].map((t) => (
                <li key={t} className="flex items-center gap-3">
                  <CheckCircle className="text-[#d4a853] shrink-0" size={20} />
                  {t}
                </li>
              ))}
            </ul>
            <p className="text-white/60 text-sm">Através de Programas de Incentivo Federais</p>
            <GoldButton>
              GARANTIR MINHA VAGA
              <ArrowRight className="inline ml-2" size={18} />
            </GoldButton>
          </div>
          <div className="flex justify-center animate-fade-in" style={{ animationDelay: "200ms" }}>
            <img
              src={headerImg}
              alt="Pedro Diniz e Igor Abreu — Workshop Dunas Capital"
              className="w-full max-w-md rounded-2xl shadow-2xl shadow-[#d4a853]/10 border border-[#d4a853]/10"
            />
          </div>
        </div>
      </section>

      {/* ─── 3. NÃO É EMPRÉSTIMO ─── */}
      <Section dark={false}>
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <span className="inline-block bg-red-500/15 text-red-400 font-bold text-sm px-4 py-1.5 rounded-full uppercase tracking-wider">
            Não é empréstimo
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight" style={{ textWrap: "balance" as any }}>
            Você não precisa pedir crédito em banco, convencer familiares ou amigos
          </h2>
          <p className="text-white/70 text-base sm:text-lg leading-relaxed">
            Existe um caminho legítimo, disponível, pensado para quem constrói o país de verdade:{" "}
            <strong className="text-white">o pequeno empresário.</strong>
          </p>
          <p className="text-white/70 text-base sm:text-lg leading-relaxed">
            Um caminho onde você não é refém dos juros, da burocracia ou da sorte.
            Um caminho onde a sua empresa ou ideia será reconhecida e financiada como merece.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            {["Sem favores", 'Sem "indicações"', "Seu direito por lei"].map((t) => (
              <div key={t} className="bg-[#0a1628] border border-[#d4a853]/20 rounded-xl py-4 px-6">
                <p className="text-[#d4a853] font-bold">{t}</p>
              </div>
            ))}
          </div>
          <p className="text-white/50 text-sm italic">
            Desde 1969 o Governo Federal libera, através de programas de incentivo, recursos para fomentar o crescimento empresarial no Brasil.
          </p>
        </div>
      </Section>

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
          <p className="text-[#d4a853] font-bold text-lg sm:text-xl pt-2">
            Sua empresa pode estar a um passo de captar de R$ 39 mil a R$ 400 mil
          </p>
          <GoldButton>QUERO APRENDER A CAPTAR</GoldButton>
        </div>
      </Section>

      {/* ─── 5. O QUE VOCÊ VAI APRENDER ─── */}
      <Section dark={false}>
        <div className="text-center space-y-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">O que você vai aprender neste Workshop</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Zap, title: "Estar Apto", desc: "O que você precisa para estar apto aos programas de incentivo." },
              { icon: ArrowRight, title: "Passo a Passo", desc: "O passo a passo do zero até receber o recurso na sua conta!" },
              { icon: Users, title: "Onde Encontrar", desc: "Onde encontrar os programas de incentivos disponíveis AGORA!" },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-[#0a1628] border border-[#d4a853]/15 rounded-2xl p-8 space-y-4 hover:border-[#d4a853]/40 transition-colors">
                <div className="w-14 h-14 rounded-xl bg-[#d4a853]/10 flex items-center justify-center mx-auto">
                  <Icon className="text-[#d4a853]" size={28} />
                </div>
                <h3 className="text-xl font-bold text-[#d4a853]">{title}</h3>
                <p className="text-white/70">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ─── 6. BÔNUS ─── */}
      <Section dark>
        <div className="text-center space-y-10">
          <p className="text-[#d4a853] font-semibold uppercase tracking-wider text-sm">E mais — bônus exclusivos</p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Quem garantir a vaga hoje leva também:</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Zap, title: "Masterclass", desc: "Encontro secreto no Zoom com as 3 etapas da captação, onde encontrar o programa ideal e prazos de recebimento." },
              { icon: Gift, title: "Lista TOP 10", desc: "Os programas de incentivo disponíveis AGORA! A lista mais atualizada do mercado." },
              { icon: MessageCircle, title: "Grupo de Alerta", desc: "WhatsApp fechado com oportunidades de programas de incentivo imperdíveis." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-[#0f1d32] border border-[#d4a853]/15 rounded-2xl p-8 space-y-4 hover:border-[#d4a853]/40 transition-colors">
                <div className="w-14 h-14 rounded-xl bg-[#d4a853]/10 flex items-center justify-center mx-auto">
                  <Icon className="text-[#d4a853]" size={28} />
                </div>
                <h3 className="text-xl font-bold text-white">{title}</h3>
                <p className="text-white/60 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

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
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
            Tudo isso por apenas
          </h2>
          <div className="bg-[#0f1d32] border-2 border-[#d4a853]/30 rounded-3xl p-8 sm:p-12 space-y-6">
            <p className="text-white/50 text-sm line-through">De R$ 197,00</p>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-white/60 text-lg">R$</span>
              <span className="text-6xl sm:text-7xl font-extrabold text-[#d4a853]">47</span>
              <span className="text-white/60 text-lg">,00</span>
            </div>
            <p className="text-white/50 text-sm">Pagamento único · Acesso imediato</p>
            <ul className="text-left space-y-3 max-w-sm mx-auto">
              {[
                "Workshop ao vivo de 1h no Zoom",
                "Masterclass exclusiva",
                "Lista TOP 10 programas",
                "Grupo de Alerta WhatsApp",
                "Garantia incondicional de 30 dias",
              ].map((t) => (
                <li key={t} className="flex items-center gap-3 text-white/80 text-sm">
                  <CheckCircle className="text-[#d4a853] shrink-0" size={16} />
                  {t}
                </li>
              ))}
            </ul>
            <GoldButton className="w-full text-center block" showGuarantee={false}>
              GARANTIR MINHA VAGA AGORA
              <ArrowRight className="inline ml-2" size={18} />
            </GoldButton>
          </div>
          <span className="flex items-center justify-center gap-2 text-white/40 text-xs">
            <Shield size={14} />
            Compra segura · Garantia de 30 dias · Acesso imediato
          </span>
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

      {/* ─── MOBILE FLOATING CTA ─── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-3 bg-[#0a1628]/95 backdrop-blur-md border-t border-[#d4a853]/20 sm:hidden">
        <a
          href={CHECKOUT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center bg-[#d4a853] text-[#0a1628] font-bold py-4 rounded-xl shimmer-btn active:scale-[0.97] transition-transform"
        >
          GARANTIR MINHA VAGA
        </a>
      </div>
    </div>
  );
}
