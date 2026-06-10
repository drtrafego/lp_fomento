import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, ArrowLeft, CheckCircle, Loader2, ShieldCheck } from "lucide-react";

import { useMetaPixel } from "@/hooks/useMetaPixel";
import { usePageAnalytics } from "@/hooks/usePageAnalytics";
import { buildCheckoutUrl } from "@/lib/metaPixelUtils";
import { quizQuestions, getResult, maxQuizScore } from "@/content/quizData";

import heroPedroIgor from "@/assets/hero-pedro-igor.webp";

// Réplica funcional do quiz de diagnostico-fomento.com.br:
// intro -> 9 perguntas (com score) -> análise -> captura de lead -> resultado.
// Cores e fontes extraídas do build original (fundo hsl(222 47% 6%),
// dourado hsl(43 74% 56%), Playfair Display nos títulos, Inter no corpo).
const serif = { fontFamily: "'Playfair Display', serif" };
const sans = { fontFamily: "Inter, sans-serif" };
const GOLD = "hsl(43 74% 56%)";
const BG = "hsl(222 47% 6%)";

type Stage = "intro" | "quiz" | "loading" | "lead" | "result";

export default function Quiz() {
  const { trackPageView, trackLead, trackInitiateCheckout } = useMetaPixel();
  usePageAnalytics();

  const [stage, setStage] = useState<Stage>("intro");
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [score, setScore] = useState(0);
  const [lead, setLead] = useState({ name: "", email: "", whatsapp: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    trackPageView();
  }, [trackPageView]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [stage, current]);

  const startQuiz = useCallback(() => setStage("quiz"), []);

  const answer = useCallback(
    (qIndex: number, optScore: number) => {
      setAnswers((prev) => ({ ...prev, [qIndex]: optScore }));
      if (qIndex < quizQuestions.length - 1) {
        setCurrent(qIndex + 1);
      } else {
        const total = quizQuestions.reduce(
          (acc, _q, i) => acc + (i === qIndex ? optScore : answers[i] ?? 0),
          0
        );
        setScore(total);
        setStage("loading");
      }
    },
    [answers]
  );

  // Tela de análise antes da captura
  useEffect(() => {
    if (stage !== "loading") return;
    const t = setTimeout(() => setStage("lead"), 2200);
    return () => clearTimeout(t);
  }, [stage]);

  const submitLead = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const errs: Record<string, string> = {};
      if (lead.name.trim().length < 2) errs.name = "Informe seu nome";
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(lead.email)) errs.email = "Informe um email válido";
      if (lead.whatsapp.replace(/\D/g, "").length < 10) errs.whatsapp = "Informe um WhatsApp válido";
      setErrors(errs);
      if (Object.keys(errs).length > 0) return;

      // Lead com PII (eleva EMQ no Meta): browser + CAPI
      trackLead(
        { content_name: "Diagnostico", content_category: "Quiz" },
        { first_name: lead.name.trim(), email: lead.email.trim(), phone: lead.whatsapp }
      );
      setStage("result");
    },
    [lead, trackLead]
  );

  const handleResultCta = useCallback(() => {
    trackInitiateCheckout({ content_name: "Workshop", value: 37, currency: "BRL" });
    window.open(buildCheckoutUrl(), "_blank");
  }, [trackInitiateCheckout]);

  const result = useMemo(() => getResult(score), [score]);
  const progress = stage === "quiz" ? ((current + 1) / quizQuestions.length) * 100 : 0;

  return (
    <main
      style={{ backgroundColor: BG, color: "hsl(40 20% 92%)", ...sans }}
      className="min-h-screen flex flex-col items-center px-5 py-10 overflow-x-hidden"
    >
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute top-[18%] left-1/2 -translate-x-1/2 w-[460px] h-[460px] max-w-[90vw] rounded-full blur-[120px]" style={{ background: "hsl(43 74% 56% / 0.10)" }} />
      </div>

      {/* ─── INTRO ─── */}
      {stage === "intro" && (
        <div className="w-full max-w-xl mx-auto flex flex-col items-center gap-7 text-center my-auto">
          <div className="relative w-40 sm:w-48 rounded-2xl overflow-hidden" style={{ border: "1px solid hsl(40 20% 92% / 0.12)", boxShadow: "0 20px 50px -20px rgba(0,0,0,0.7)" }}>
            <img src={heroPedroIgor} alt="Pedro e Igor, especialistas em captação de recursos" className="w-full h-auto object-cover" width={500} height={475} />
          </div>
          <h1 style={serif} className="text-[1.9rem] sm:text-[2.6rem] font-bold leading-[1.12]">
            Descubra se você está apto a captar <span style={{ color: GOLD }}>recursos do Governo Federal</span> para seu negócio ou ideia.
          </h1>
          <p className="text-[0.95rem] sm:text-base leading-relaxed" style={{ color: "hsl(40 20% 92% / 0.7)" }}>
            Existem programas de incentivos federais, garantidos por lei, que o governo investe em negócios ou ideias, sem análise de crédito, sem pagar juros, sem precisar devolver o dinheiro e sem comprovar grande faturamento.
          </p>
          <button onClick={startQuiz} style={{ background: "linear-gradient(135deg, hsl(43 74% 56%), hsl(38 80% 65%))", color: BG }} className="w-full sm:w-auto rounded-xl font-bold text-lg px-10 py-4 shimmer-btn active:scale-[0.97] transition-transform">
            Fazer Diagnóstico Gratuito
          </button>
          <p className="text-sm" style={{ color: "hsl(40 20% 92% / 0.55)" }}>⏱ Leva menos de 3 minutos · 100% gratuito</p>
          <div className="flex items-center gap-2 text-sm px-4 py-2 rounded-full" style={{ background: "hsl(222 40% 12% / 0.7)", border: "1px solid hsl(40 20% 92% / 0.08)" }}>
            <span style={{ color: GOLD }}>★★★★★</span>
            <span style={{ color: "hsl(40 20% 92% / 0.75)" }}>Mais de 2.000 empresários já fizeram o diagnóstico</span>
          </div>
          <p className="text-xs leading-relaxed mt-2" style={{ color: "hsl(40 20% 92% / 0.4)" }}>
            Recurso amparado por lei. Decreto-Lei Nº 719, de 31 de Julho de 1969, que cria o Fundo Nacional de Desenvolvimento Científico e Tecnológico.
          </p>
        </div>
      )}

      {/* ─── QUIZ ─── */}
      {stage === "quiz" && (
        <div className="w-full max-w-xl mx-auto flex flex-col gap-6 my-auto">
          {/* progresso */}
          <div className="flex items-center gap-3">
            {current > 0 && (
              <button onClick={() => setCurrent((c) => Math.max(0, c - 1))} className="shrink-0 opacity-60 hover:opacity-100 transition-opacity" aria-label="Voltar">
                <ArrowLeft size={20} />
              </button>
            )}
            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "hsl(40 20% 92% / 0.1)" }}>
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: "linear-gradient(90deg, hsl(43 74% 56%), hsl(38 80% 65%))" }} />
            </div>
            <span className="shrink-0 text-xs tabular-nums" style={{ color: "hsl(40 20% 92% / 0.5)" }}>
              {current + 1}/{quizQuestions.length}
            </span>
          </div>

          {(() => {
            const q = quizQuestions[current];
            return (
              <div className="flex flex-col gap-5">
                {q.image && (
                  <div className="rounded-xl overflow-hidden border" style={{ borderColor: "hsl(40 20% 92% / 0.12)" }}>
                    <img src={q.image} alt="" className="w-full h-auto object-cover max-h-64" loading="lazy" />
                  </div>
                )}
                <div className="text-center space-y-2">
                  <h2 style={serif} className="text-[1.45rem] sm:text-3xl font-bold leading-tight">{q.question}</h2>
                  {q.subtitle && <p className="text-sm" style={{ color: GOLD }}>{q.subtitle}</p>}
                </div>
                <div className="flex flex-col gap-3">
                  {q.options.map((opt) => {
                    const selected = answers[current] === opt.score && answers[current] !== undefined;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => answer(current, opt.score)}
                        className="group flex items-center justify-between gap-3 rounded-xl px-5 py-4 text-left transition-all active:scale-[0.99]"
                        style={{
                          background: "hsl(222 40% 12% / 0.7)",
                          border: `1px solid ${selected ? GOLD : "hsl(40 20% 92% / 0.1)"}`,
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.borderColor = GOLD)}
                        onMouseLeave={(e) => (e.currentTarget.style.borderColor = selected ? GOLD : "hsl(40 20% 92% / 0.1)")}
                      >
                        <span className="text-[0.95rem] font-medium">{opt.label}</span>
                        <ArrowRight size={18} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: GOLD }} />
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ─── LOADING / ANÁLISE ─── */}
      {stage === "loading" && (
        <div className="w-full max-w-md mx-auto flex flex-col items-center gap-6 text-center my-auto">
          <Loader2 size={48} className="animate-spin" style={{ color: GOLD }} />
          <h2 style={serif} className="text-2xl sm:text-3xl font-bold">Analisando o seu perfil de captação...</h2>
          <p className="text-sm" style={{ color: "hsl(40 20% 92% / 0.6)" }}>
            Estamos cruzando as suas respostas com os programas de incentivo disponíveis.
          </p>
        </div>
      )}

      {/* ─── LEAD CAPTURE ─── */}
      {stage === "lead" && (
        <div className="w-full max-w-md mx-auto flex flex-col gap-6 my-auto">
          <div className="text-center space-y-2">
            <CheckCircle size={40} className="mx-auto" style={{ color: GOLD }} />
            <h2 style={serif} className="text-2xl sm:text-3xl font-bold">Seu diagnóstico está pronto!</h2>
            <p className="text-sm" style={{ color: "hsl(40 20% 92% / 0.65)" }}>
              Preencha abaixo para ver o seu resultado e receber o material no seu email.
            </p>
          </div>
          <form onSubmit={submitLead} className="flex flex-col gap-4">
            {([
              { key: "name", label: "Seu nome", type: "text", placeholder: "Como podemos te chamar?" },
              { key: "email", label: "Seu melhor email", type: "email", placeholder: "voce@email.com" },
              { key: "whatsapp", label: "Seu WhatsApp", type: "tel", placeholder: "(00) 00000-0000" },
            ] as const).map((f) => (
              <div key={f.key} className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold" style={{ color: "hsl(40 20% 92% / 0.7)" }}>{f.label}</label>
                <input
                  type={f.type}
                  value={lead[f.key]}
                  onChange={(e) => setLead((p) => ({ ...p, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  className="rounded-xl px-4 py-3 text-[0.95rem] outline-none transition-colors"
                  style={{ background: "hsl(222 40% 12% / 0.7)", border: `1px solid ${errors[f.key] ? "hsl(0 84% 60%)" : "hsl(40 20% 92% / 0.12)"}`, color: "hsl(40 20% 92%)" }}
                />
                {errors[f.key] && <span className="text-xs" style={{ color: "hsl(0 84% 60%)" }}>{errors[f.key]}</span>}
              </div>
            ))}
            <button type="submit" style={{ background: "linear-gradient(135deg, hsl(43 74% 56%), hsl(38 80% 65%))", color: BG }} className="mt-1 rounded-xl font-bold text-lg px-8 py-4 shimmer-btn active:scale-[0.97] transition-transform">
              Ver meu resultado
            </button>
            <p className="flex items-center justify-center gap-1.5 text-xs" style={{ color: "hsl(40 20% 92% / 0.4)" }}>
              <ShieldCheck size={13} /> Seus dados estão seguros e não serão compartilhados.
            </p>
          </form>
        </div>
      )}

      {/* ─── RESULTADO ─── */}
      {stage === "result" && (
        <div className="w-full max-w-2xl mx-auto flex flex-col gap-7 my-auto py-6">
          <div className="text-center space-y-3">
            <div className="text-5xl">{result.emoji}</div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: GOLD }}>
              Seu perfil: {result.title}
            </p>
            <h2 style={serif} className="text-[1.8rem] sm:text-4xl font-bold leading-tight">{result.headline}</h2>
            <p className="text-sm sm:text-base leading-relaxed" style={{ color: "hsl(40 20% 92% / 0.72)" }}>{result.description}</p>
          </div>

          {/* barra de potencial */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs" style={{ color: "hsl(40 20% 92% / 0.6)" }}>
              <span>Seu potencial de captação</span>
              <span style={{ color: GOLD }} className="font-bold">{Math.round((score / maxQuizScore) * 100)}%</span>
            </div>
            <div className="h-3 rounded-full overflow-hidden" style={{ background: "hsl(40 20% 92% / 0.1)" }}>
              <div className="h-full rounded-full" style={{ width: `${Math.round((score / maxQuizScore) * 100)}%`, background: "linear-gradient(90deg, hsl(43 74% 56%), hsl(38 80% 65%))" }} />
            </div>
          </div>

          <div className="rounded-2xl p-6 space-y-3" style={{ background: "hsl(222 40% 12% / 0.7)", border: "1px solid hsl(40 20% 92% / 0.08)" }}>
            {result.insights.map((ins, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle size={18} className="shrink-0 mt-0.5" style={{ color: GOLD }} />
                <p className="text-sm leading-relaxed" style={{ color: "hsl(40 20% 92% / 0.8)" }}>{ins}</p>
              </div>
            ))}
          </div>

          <div className="text-center space-y-3">
            <button onClick={handleResultCta} style={{ background: "linear-gradient(135deg, hsl(43 74% 56%), hsl(38 80% 65%))", color: BG }} className="w-full sm:w-auto rounded-xl font-bold text-lg px-10 py-4 shimmer-btn active:scale-[0.97] transition-transform">
              Quero Aprender a Captar Recursos 💰
            </button>
            <p className="flex items-center justify-center gap-1.5 text-xs" style={{ color: "hsl(40 20% 92% / 0.45)" }}>
              <ShieldCheck size={13} /> Garantia de 30 dias · Compra segura
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
