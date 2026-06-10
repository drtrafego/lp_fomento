// Conteúdo fiel da página diagnostico-fomento.com.br
// Centralizado para ser consumido pelas versões cinemática e clássica.

export const diagnostico = {
  headline: {
    pre: "Descubra se você está",
    highlight: "apto a captar",
    post: "recursos do Governo Federal para o seu negócio ou ideia.",
  },
  subheadline:
    "Existem programas de incentivos federais, garantidos por lei, que o governo investe em negócios ou ideias, sem análise de crédito, sem pagar juros, sem precisar devolver o dinheiro e sem comprovar grande faturamento.",
  apoio:
    "Faça o diagnóstico gratuito agora e descubra se você está apto a captar recursos do Governo Federal para o seu negócio.",
  cta: "Fazer Diagnóstico Gratuito",
  badges: [
    { icon: "clock", label: "Leva menos de 3 minutos" },
    { icon: "gift", label: "100% gratuito" },
    { icon: "users", label: "Mais de 2.000 empresários já fizeram o diagnóstico" },
  ],
  legal:
    "Recurso amparado por lei. Decreto-Lei Nº 719, de 31 de Julho de 1969, que cria o Fundo Nacional de Desenvolvimento Científico e Tecnológico.",
  // Blocos do scrollytelling (pin + scrub) na versão cinemática
  steps: [
    {
      kicker: "Garantido por lei",
      title: "Não é empréstimo, é um direito seu",
      body:
        "Desde 1969 o Governo Federal destina recursos, através de programas de incentivo, para fomentar negócios e ideias no Brasil. Sem juros, sem devolução, sem análise de crédito.",
    },
    {
      kicker: "Para o seu perfil",
      title: "De uma ideia na cabeça a uma empresa consolidada",
      body:
        "Não importa se você ainda não tem CNPJ ou se já fatura alto. Existem mais de 40 programas para todo tipo de negócio. O diagnóstico mostra exatamente em quais você se encaixa.",
    },
    {
      kicker: "Em 3 minutos",
      title: "Descubra o seu potencial de captação",
      body:
        "Responda algumas perguntas rápidas e receba um diagnóstico claro do quanto a sua empresa ou ideia pode captar, de R$ 39 mil a R$ 400 mil.",
    },
  ],
  stats: [
    { value: 39, prefix: "R$ ", suffix: " mil", label: "captação mínima" },
    { value: 400, prefix: "R$ ", suffix: " mil", label: "captação máxima" },
    { value: 50, prefix: "R$ ", suffix: " mi", label: "já captados pela Dunas" },
    { value: 2000, prefix: "+", suffix: "", label: "empresários diagnosticados" },
  ],
};

// Destino do CTA do diagnóstico. Trocar quando o cliente confirmar a URL do quiz.
// Mantém UTMs/fbclid via querystring atual.
export function buildDiagnosticoUrl(): string {
  const base =
    (import.meta.env.VITE_DIAGNOSTICO_URL as string | undefined) ||
    "https://diagnostico-fomento.com.br/quiz-vsl";
  const current = new URLSearchParams(window.location.search);
  const url = new URL(base);
  ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid"].forEach((k) => {
    const v = current.get(k);
    if (v) url.searchParams.set(k, v);
  });
  return url.toString();
}
