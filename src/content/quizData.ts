// Dados do quiz de diagnóstico (fiéis à página diagnostico-fomento.com.br).
// Perguntas no front, respostas/leads vão para o back end.
import noticiaNegocios from "@/assets/noticia-negocios.webp";

export interface QuizOption {
  label: string;
  value: string;
  score: number;
}

export interface QuizQuestion {
  id: number;
  question: string;
  subtitle?: string;
  image?: string;
  options: QuizOption[];
}

export interface QuizResult {
  level: number;
  title: string;
  emoji: string;
  headline: string;
  description: string;
  insights: string[];
}

export const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "Em qual setor sua empresa atua?",
    subtitle: "Cada setor tem incentivos específicos. Alguns chegam a R$ 419.736,17 por projeto",
    options: [
      { label: "Comércio", value: "comercio", score: 2 },
      { label: "Serviços", value: "servicos", score: 2 },
      { label: "Agronegócio", value: "agro", score: 3 },
      { label: "Saúde", value: "saude", score: 3 },
      { label: "Alimentação", value: "alimentacao", score: 3 },
      { label: "Start Up, Tecnologia ou IA", value: "startup_tech", score: 3 },
      { label: "Outros...", value: "outro", score: 1 },
    ],
  },
  {
    id: 2,
    question: "Qual o faturamento mensal da sua empresa?",
    options: [
      { label: "Até R$ 30 mil/mês", value: "micro", score: 1 },
      { label: "R$ 30 mil até 100 mil/mês", value: "pequena", score: 2 },
      { label: "R$ 100 mil até 300 mil/mês", value: "media", score: 3 },
      { label: "Acima de R$ 300 mil por mês", value: "grande", score: 3 },
    ],
  },
  {
    id: 3,
    question: "Quantas pessoas trabalham na sua empresa?",
    options: [
      { label: "1 a 9", value: "1-9", score: 1 },
      { label: "10 a 49", value: "10-49", score: 2 },
      { label: "50 a 249", value: "50-249", score: 3 },
      { label: "250 ou mais", value: "250+", score: 3 },
    ],
  },
  {
    id: 4,
    question: "Você sabia que o Governo Federal disponibiliza bilhões por ano em incentivos para empresas?",
    subtitle: "94,3% dos brasileiros que empreendem não sabem que podem acessar esse dinheiro",
    image: noticiaNegocios,
    options: [
      { label: "Nunca ouvi falar disso", value: "nunca", score: 0 },
      { label: "Já ouvi, mas não sei como funciona", value: "ouviu", score: 1 },
      { label: "Conheço alguns programas, mas nunca usei", value: "conhece", score: 2 },
      { label: "Sim, conheço bem e quero captar mais", value: "conhece_bem", score: 3 },
    ],
  },
  {
    id: 5,
    question: "Sua empresa já recebeu dinheiro do governo sem precisar devolver?",
    subtitle: "A Natália captou R$ 130 mil em 30 dias. O Richardson, R$ 39 mil na primeira tentativa",
    options: [
      { label: "Nunca, nem sabia que era possível", value: "nunca", score: 0 },
      { label: "Tentei, mas não consegui", value: "tentou", score: 1 },
      { label: "Sim, uma vez", value: "uma_vez", score: 2 },
      { label: "Sim, mais de uma vez", value: "varias", score: 3 },
    ],
  },
  {
    id: 6,
    question: "O que mais trava o crescimento da sua empresa hoje?",
    subtitle: "O que você faria com R$ 419.736,17 investidos no seu negócio?",
    options: [
      { label: "Falta de capital para investir", value: "capital", score: 2 },
      { label: "Carga tributária sufocante", value: "tributos", score: 3 },
      { label: "Dificuldade em acessar crédito", value: "credito", score: 2 },
      { label: "Não conheço as oportunidades disponíveis", value: "conhecimento", score: 1 },
    ],
  },
  {
    id: 7,
    question: "Você sabia que o governo disponibiliza dinheiro a fundo perdido para empresas investirem no próprio negócio?",
    subtitle: "É a chamada subvenção econômica. Dinheiro que entra no caixa e não precisa ser devolvido",
    options: [
      { label: "Não fazia ideia!", value: "nao", score: 0 },
      { label: "Já ouvi falar, mas não entendo como funciona", value: "ouviu", score: 1 },
      { label: "Entendo o conceito básico", value: "basico", score: 2 },
      { label: "Sim, sei como funciona e quero usar", value: "sim", score: 3 },
    ],
  },
  {
    id: 8,
    question: "Com um investimento de até R$ 419.736,17, sua empresa conseguiria crescer até quantas vezes o seu faturamento?",
    options: [
      { label: "Cresceria 2x mais", value: "2x", score: 1 },
      { label: "Pelo menos 5x mais", value: "5x", score: 2 },
      { label: "Meu faturamento seria 10x mais", value: "10x", score: 3 },
      { label: "Não faria diferença no meu resultado", value: "nenhuma", score: 0 },
    ],
  },
  {
    id: 9,
    question: "Se eu te mostrasse o caminho para captar de R$ 39 mil a R$ 419.736,17 sem juros e sem precisar devolver, você dedicaria 1 hora para aprender?",
    subtitle: "Quero te ensinar exatamente o passo a passo em uma aula ao vivo de 1 hora",
    options: [
      { label: "Não tenho interesse", value: "nao", score: 0 },
      { label: "Talvez, se fosse simples", value: "talvez", score: 1 },
      { label: "Sim, com certeza!", value: "sim", score: 3 },
      { label: "Já estou buscando isso!", value: "buscando", score: 3 },
    ],
  },
];

export const quizResults: QuizResult[] = [
  {
    level: 1,
    title: "Oportunidade Invisível",
    emoji: "🔍",
    headline: "Você está deixando dinheiro na mesa.",
    description:
      "Sua empresa tem potencial de captação, mas você ainda não conhece os caminhos disponíveis. Existem dezenas de programas que poderiam injetar de R$ 39 mil a R$ 419.736,17 no seu negócio, sem juros, sem comprometer rendimentos, e em muitos casos sem precisar devolver.",
    insights: [
      "O Governo Federal destina bilhões por ano em incentivos que empresas como a sua podem captar",
      "Você pode estar pagando impostos que poderiam voltar como investimento para o seu negócio",
      "A Maria captou R$ 420 mil, o Felipe quase R$ 400 mil, a Natália R$ 130 mil em 30 dias e o Richardson R$ 39 mil na primeira tentativa. Você também pode",
      "No Workshop você aprende o passo a passo para sair do zero e captar seus primeiros recursos",
    ],
  },
  {
    level: 2,
    title: "Quase Lá",
    emoji: "🎯",
    headline: "Você sabe que existem oportunidades, mas precisa do caminho certo.",
    description:
      "Você já tem noção de que existem incentivos e oportunidades de captação. O que falta é a estratégia prática para transformar isso em R$ 39 mil a R$ 419.736,17 no caixa da sua empresa, sem juros e sem devolver o dinheiro.",
    insights: [
      "Você está à frente de 94,3% dos empresários brasileiros em conhecimento sobre incentivos",
      "O que te separa da captação é um método estruturado, e é exatamente isso que o Workshop ensina",
      "Empresas do seu porte já captaram centenas de milhares usando essas estratégias",
      "O Workshop mostra os mais de 100 sites do governo onde os editais ficam disponíveis o ano todo",
    ],
  },
  {
    level: 3,
    title: "Pronto para Captar",
    emoji: "🚀",
    headline: "Você já tem a base, hora de acelerar e captar.",
    description:
      "Parabéns! Você já tem um bom nível de preparo. Agora é hora de aprender as estratégias avançadas para captar de R$ 39 mil a R$ 419.736,17 em incentivos do Governo Federal. Sem juros, sem comprovar grandes rendimentos e, em muitos casos, sem precisar devolver o dinheiro!",
    insights: [
      "Você vai aprender o passo a passo de como captar de R$ 39 mil a R$ 419.736,17 em incentivos federais",
      "Existem editais e programas que você ainda não explorou, o Workshop revela quais",
      "A rede de contatos do Workshop abre portas estratégicas para novas captações",
      "É hora de ir do conhecimento à ação com resultados mensuráveis no seu caixa",
    ],
  },
];

// Faixa de resultado pela soma de pontos (fiel ao getResult original).
export function getResult(score: number): QuizResult {
  if (score <= 9) return quizResults[0];
  if (score <= 18) return quizResults[1];
  return quizResults[2];
}

export const maxQuizScore = quizQuestions.reduce(
  (acc, q) => acc + Math.max(...q.options.map((o) => o.score)),
  0
);
