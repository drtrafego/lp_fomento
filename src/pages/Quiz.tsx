import { useCallback, useEffect } from "react";

import { useMetaPixel } from "@/hooks/useMetaPixel";
import { usePageAnalytics } from "@/hooks/usePageAnalytics";
import { buildDiagnosticoUrl } from "@/content/diagnostico";

import heroPedroIgor from "@/assets/hero-pedro-igor.webp";

// Réplica fiel da página diagnostico-fomento.com.br/quiz-vsl.
// Cores e fontes extraídas do build original:
//   fundo hsl(222 47% 6%), dourado hsl(43 74% 56%), bege hsl(40 20% 92%)
//   títulos em Playfair Display, corpo em Inter.
// Layout coluna única centralizada.
const serif = { fontFamily: "'Playfair Display', serif" };
const sans = { fontFamily: "Inter, sans-serif" };

export default function Quiz() {
  const { trackPageView, trackLead } = useMetaPixel();
  usePageAnalytics();

  useEffect(() => {
    trackPageView();
  }, [trackPageView]);

  const handleCta = useCallback(() => {
    trackLead({ content_name: "Diagnostico", content_category: "Quiz VSL" });
    window.open(buildDiagnosticoUrl(), "_blank");
  }, [trackLead]);

  return (
    <main
      style={{ backgroundColor: "hsl(222 47% 6%)", color: "hsl(40 20% 92%)", ...sans }}
      className="min-h-screen flex flex-col items-center justify-center px-5 py-12 text-center overflow-x-hidden"
    >
      {/* brilho dourado de fundo */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div
          className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[460px] h-[460px] max-w-[90vw] rounded-full blur-[120px]"
          style={{ background: "hsl(43 74% 56% / 0.10)" }}
        />
      </div>

      <div className="w-full max-w-xl mx-auto flex flex-col items-center gap-7">
        {/* Foto Pedro e Igor */}
        <div
          className="relative w-44 sm:w-52 rounded-2xl overflow-hidden"
          style={{ border: "1px solid hsl(40 20% 92% / 0.12)", boxShadow: "0 20px 50px -20px rgba(0,0,0,0.7)" }}
        >
          <img
            src={heroPedroIgor}
            alt="Pedro e Igor, especialistas em captação de recursos"
            className="w-full h-auto object-cover"
            width={500}
            height={475}
          />
        </div>

        {/* Headline */}
        <h1 style={serif} className="text-[1.9rem] sm:text-[2.6rem] font-bold leading-[1.12]">
          Descubra se você está apto a captar{" "}
          <span style={{ color: "hsl(43 74% 56%)" }}>recursos do Governo Federal</span>{" "}
          para seu negócio ou ideia.
        </h1>

        {/* Subtexto */}
        <p className="text-[0.95rem] sm:text-base leading-relaxed" style={{ color: "hsl(40 20% 92% / 0.7)" }}>
          Existem programas de incentivos federais, garantidos por lei, que o governo investe em
          negócios ou ideias, sem análise de crédito, sem pagar juros, sem precisar devolver o
          dinheiro e sem comprovar grande faturamento.
        </p>

        {/* CTA */}
        <button
          onClick={handleCta}
          style={{ background: "linear-gradient(135deg, hsl(43 74% 56%), hsl(38 80% 65%))", color: "hsl(222 47% 6%)" }}
          className="w-full sm:w-auto rounded-xl font-bold text-lg px-10 py-4 shimmer-btn active:scale-[0.97] transition-transform"
        >
          Fazer Diagnóstico Gratuito
        </button>

        {/* Badges */}
        <p className="text-sm" style={{ color: "hsl(40 20% 92% / 0.55)" }}>
          ⏱ Leva menos de 3 minutos · 100% gratuito
        </p>

        {/* Prova social */}
        <div
          className="flex items-center gap-2 text-sm px-4 py-2 rounded-full"
          style={{ background: "hsl(222 40% 12% / 0.7)", border: "1px solid hsl(40 20% 92% / 0.08)" }}
        >
          <span style={{ color: "hsl(43 74% 56%)" }}>★★★★★</span>
          <span style={{ color: "hsl(40 20% 92% / 0.75)" }}>Mais de 2.000 empresários já fizeram o diagnóstico</span>
        </div>
      </div>

      {/* Amparo legal */}
      <footer className="mt-14 max-w-xl mx-auto">
        <p className="text-xs leading-relaxed" style={{ color: "hsl(40 20% 92% / 0.4)" }}>
          Recurso amparado por lei. Decreto-Lei Nº 719, de 31 de Julho de 1969, que cria o Fundo
          Nacional de Desenvolvimento Científico e Tecnológico.
        </p>
      </footer>
    </main>
  );
}
