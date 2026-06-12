// Fonte única de copy da LP Dunas. Compartilhada pelas 4 versões de teste (A/B/C/D).
// Nenhum texto da landing deve ser hardcoded nas seções: tudo vem daqui.

import {
  Landmark,
  LayoutGrid,
  TrendingUp,
  Scale,
  ScanSearch,
  type LucideIcon,
} from "lucide-react";

export interface DunasHero {
  eyebrow: string;
  h1: string;
  h1Highlight: string;
  h1After: string;
  sub: string;
  cta: string;
}

export interface DunasMetric {
  value: string;
  label: string;
  small?: boolean;
}

export interface DunasBullet {
  num: string;
  icon: LucideIcon;
  title: string;
  body: string;
}

export interface DunasPasso {
  n: string;
  title: string;
  body: string;
}

export interface DunasDepoimento {
  handle: string;
  segmento: string;
  valor: string;
  urlVideo: string;
}

export interface DunasFaq {
  q: string;
  a: string;
}

export interface DunasContent {
  hero: DunasHero;
  credibilidade: {
    metrics: DunasMetric[];
    legal: string;
  };
  problema: {
    titulo: string;
    paragrafos: string[];
    enfase: string;
    paragrafoApos: string;
    fechamento: string;
  };
  solucao: {
    titulo: string;
    tituloHighlight: string;
    paragrafos: string[];
    decretoBadge: string;
    orgaos: string[];
    orgaosLegenda: string;
    especialistasTitulo: string;
    especialistasBody: string;
  };
  bullets: DunasBullet[];
  comoFunciona: {
    titulo: string;
    passos: DunasPasso[];
    rodape: string;
  };
  prova: {
    titulo: string;
    tituloHighlight: string;
    depoimentos: DunasDepoimento[];
  };
  oferta: {
    titulo: string;
    body: string;
    cta: string;
    rodape: string;
  };
  faq: {
    titulo: string;
    perguntas: DunasFaq[];
  };
  ctaFinal: {
    titulo: string;
    tituloHighlight: string;
    body: string;
    cta: string;
    rodape: string;
  };
}

export const dunasContent: DunasContent = {
  hero: {
    eyebrow: "Dunas Capital · Programas de Incentivo Federais",
    h1: "Sua empresa pode ter direito a ",
    h1Highlight: "capital federal",
    h1After: " sem juros, sem análise de crédito e sem devolver um centavo.",
    sub: "Desde 1969 o governo destina recursos para fomentar negócios brasileiros via Programas de Incentivo Federais. A Dunas Capital já captou mais de R$ 50 milhões para empresas como a sua. Descubra em três minutos se você está apto.",
    cta: "Fazer o Diagnóstico Gratuito",
  },
  credibilidade: {
    metrics: [
      { value: "R$ 50 mi", label: "captados para clientes" },
      { value: "2.000+", label: "empresários diagnosticados" },
      { value: "40+", label: "programas ativos agora" },
      { value: "R$ 39 mil a R$ 400 mil", label: "faixa de captação por empresa", small: true },
      { value: "5 anos", label: "de atuação no mercado de fomento" },
    ],
    legal:
      "Recursos amparados pelo Decreto-Lei nº 719, de 31 de Julho de 1969. Fundo Nacional de Desenvolvimento Científico e Tecnológico.",
  },
  problema: {
    titulo:
      "Construir uma empresa no Brasil exige capital. E obter capital, no Brasil, costuma ter um preço alto.",
    paragrafos: [
      "Juros que corroem a margem antes mesmo de o projeto gerar retorno. Análises de crédito que levam semanas e voltam negadas. Sócios diluídos antes do negócio decolar. Projetos que ficam no papel porque o caixa não permite executar.",
      "A maioria dos empresários brasileiros aceita essa equação como se fosse uma lei da natureza.",
    ],
    enfase: "Não é.",
    paragrafoApos:
      "Existe um caminho paralelo, legal, estruturado e ativo há mais de 50 anos, que foi desenhado exatamente para financiar negócios como o seu. Um caminho onde o capital não cobra juros, não exige devolução e não depende do seu histórico bancário.",
    fechamento:
      "O problema não é a falta de recursos. O problema é que ninguém apresentou você ao mecanismo certo.",
  },
  solucao: {
    titulo: "O mecanismo existe. ",
    tituloHighlight: "Está garantido por lei.",
    paragrafos: [
      "Desde 1969, o Governo Federal destina recursos, via Programas de Incentivo Federais, para fomentar negócios e ideias no Brasil. São mais de 40 programas ativos gerenciados por órgãos como FINEP, CNPq, BNDES, SEBRAE e outros.",
      "Esses programas não são empréstimos. Não cobram juros. Não exigem devolução. E não exigem faturamento alto ou histórico de crédito impecável para que você acesse.",
      "O que eles exigem é que você saiba que existem, entenda em quais se enquadra e saiba apresentar seu negócio da maneira correta. É exatamente isso que a Dunas Capital faz.",
    ],
    decretoBadge: "Decreto-Lei nº 719 / 1969",
    orgaos: ["FINEP", "CNPq", "BNDES", "SEBRAE", "EMBRAPII", "CAPES", "FAPESP", "FAPERJ"],
    orgaosLegenda:
      "Órgãos federais que operam os programas de fomento, todos convergindo para o trabalho de estruturação da Dunas Capital.",
    especialistasTitulo:
      "Pedro Diniz e Igor Abreu são sócios fundadores da Dunas Capital.",
    especialistasBody:
      "Especialistas em Programas de Incentivo Federais com mais de cinco anos de atuação. Orientaram mais de 2.000 empresários e já captaram mais de R$ 50 milhões para clientes, em projetos de R$ 39 mil a mais de R$ 700 mil por empresa.",
  },
  bullets: [
    {
      num: "01",
      icon: Landmark,
      title: "O capital não é empréstimo.",
      body: "Não há juros, não há parcelas e não há devolução. Os Programas de Incentivo Federais liberam recursos a fundo perdido ou com condições muito superiores às de qualquer linha de crédito bancária.",
    },
    {
      num: "02",
      icon: LayoutGrid,
      title: "Mais de 40 programas ativos agora.",
      body: "De hamburguerias a startups de tecnologia, de clínicas ao agronegócio. Há programas para empresas com CNPJ antigo, recém-abertas e até para ideias que ainda não viraram negócio formal. O diagnóstico mostra em quais você se encaixa.",
    },
    {
      num: "03",
      icon: TrendingUp,
      title: "Empresas como a sua já captaram.",
      body: "Um restaurante captou R$ 420 mil. Uma empresa de energia, R$ 480 mil. Uma de gestão, R$ 39 mil. Uma de tecnologia, R$ 734 mil. Todos sem análise de crédito, sem juros e sem devolver o principal.",
    },
    {
      num: "04",
      icon: Scale,
      title: "Existe amparo legal desde 1969.",
      body: "O Decreto-Lei nº 719, de 31 de Julho de 1969, criou o Fundo Nacional de Desenvolvimento Científico e Tecnológico. É um direito estrutural do empresário brasileiro, não um favor de ocasião.",
    },
    {
      num: "05",
      icon: ScanSearch,
      title: "O diagnóstico revela o número real da sua empresa.",
      body: "Não uma estimativa genérica. Um mapeamento de qual programa, em qual faixa de valor e com quais requisitos se aplica ao seu perfil. Em menos de três minutos.",
    },
  ],
  comoFunciona: {
    titulo: "Como funciona o processo de captação",
    passos: [
      {
        n: "1",
        title: "Diagnóstico",
        body: "Você responde um questionário gratuito de três minutos. A Dunas Capital analisa seu perfil e identifica quais Programas de Incentivo Federais estão disponíveis para você agora e qual é seu potencial real de captação.",
      },
      {
        n: "2",
        title: "Estratégia de Aplicação",
        body: "Com base no diagnóstico, a equipe define o programa mais adequado, prepara a documentação e orienta a apresentação do seu projeto conforme os critérios de aprovação de cada edital.",
      },
      {
        n: "3",
        title: "Captação",
        body: "Sua empresa submete o projeto ao programa correto, com a estrutura validada pela Dunas Capital. Quando aprovado, o recurso é depositado direto na conta da empresa, sem intermediários, sem juros e sem devolução.",
      },
    ],
    rodape: "O primeiro passo não custa nada e leva menos de três minutos.",
  },
  prova: {
    titulo: "Empresas reais. Recursos reais. ",
    tituloHighlight: "Sem devolver nada.",
    depoimentos: [
      { handle: "@bulldogburguer", segmento: "Alimentação", valor: "R$ 420.000", urlVideo: "https://dunas.b-cdn.net/videos_LP_nova/0C7535c4-Fc79-44B7-9257-1C6e1b48d0d3.mp4" },
      { handle: "@energiaquasis · José Roberto", segmento: "Energia", valor: "R$ 480.000", urlVideo: "https://dunas.b-cdn.net/videos_LP_nova/90C9c3b6-5Cf7-4E23-Ba5c-Bbf4ab07c4c8.mp4" },
      { handle: "@girotec · Kleber e Milton", segmento: "Tecnologia", valor: "R$ 400.000", urlVideo: "https://dunas.b-cdn.net/videos_LP_nova/Edits%20Girotec%20-%20Depoimento%20Curto%2020250519%20132550.mp4" },
      { handle: "@instabovreal · Fernando", segmento: "Agronegócio", valor: "R$ 734.000", urlVideo: "https://dunas.b-cdn.net/videos_LP_nova/C9cf30e2-1Bc7-4Fd3-Be82-71C4c74c3769.mp4" },
      { handle: "@impar.gestao · Richardson", segmento: "Gestão", valor: "R$ 39.000", urlVideo: "https://dunas.b-cdn.net/videos_LP_nova/Depoimento%20Impar.mp4" },
      { handle: "@globalteceducacional · Maria", segmento: "Educação", valor: "R$ 80.000 + R$ 420.000", urlVideo: "https://dunas.b-cdn.net/videos_LP_nova/Ee35e4db-76A3-4274-A3ff-777398B32196.mp4" },
    ],
  },
  oferta: {
    titulo: "O primeiro passo é entender o seu potencial",
    body: "Antes de qualquer conversa sobre valores ou serviços, a Dunas Capital precisa entender o seu negócio. O diagnóstico gratuito leva menos de três minutos e entrega uma leitura clara: se o seu perfil é elegível, em quais programas você melhor se encaixa e qual é a faixa de captação estimada para o seu caso. Não há obrigação de contratação.",
    cta: "Fazer o diagnóstico gratuito agora",
    rodape:
      "Leva menos de três minutos. Sem cadastro complexo. Sem compromisso de contratação. Resultado na hora.",
  },
  faq: {
    titulo: "Perguntas de quem ainda não está convencido",
    perguntas: [
      {
        q: "Isso é empréstimo? Vou ter que devolver?",
        a: "Não. Os Programas de Incentivo Federais não são empréstimos. Dependendo do programa, os recursos são liberados a fundo perdido, sem exigência de devolução e sem juros. É fundamentalmente diferente de qualquer linha de crédito bancária.",
      },
      {
        q: "Tenho perfil? Minha empresa é pequena.",
        a: "Existem mais de 40 programas ativos para perfis distintos: microempresas, médio porte, negócios recém-abertos e até ideias sem CNPJ. O diagnóstico identifica qual programa se encaixa no seu caso.",
      },
      {
        q: "Isso é seguro? Tem respaldo legal?",
        a: "Sim. Os programas são gerenciados por órgãos federais como FINEP, CNPq, BNDES e SEBRAE, amparados pelo Decreto-Lei nº 719 de 1969, que criou o Fundo Nacional de Desenvolvimento Científico e Tecnológico. São estruturas públicas com décadas de funcionamento.",
      },
      {
        q: "Quanto tempo leva para o dinheiro cair na conta?",
        a: "O diagnóstico inicial leva menos de três minutos. A preparação e submissão do projeto dependem do edital específico ao qual você for elegível. A equipe da Dunas Capital orienta o cronograma real após o diagnóstico.",
      },
      {
        q: "Precisa ter CNPJ há muito tempo ou faturamento alto?",
        a: "Não. Existem programas para empresas em estágios variados. Faturamento alto não é requisito universal. O diagnóstico mapeia os programas adequados ao seu estágio atual.",
      },
      {
        // TODO cliente: confirmar modelo de honorários comunicável.
        q: "Qual é o custo do serviço da Dunas Capital?",
        a: "O diagnóstico é gratuito e sem compromisso. A estrutura de honorários é apresentada apenas após o diagnóstico e apenas para empresários com perfil elegível confirmado.",
      },
      {
        q: "Já tentei programas de incentivo antes e não consegui. O que muda?",
        a: "A maioria das tentativas frustradas acontece por desalinhamento entre o perfil da empresa e o programa, ou por apresentação inadequada do projeto. O trabalho da Dunas Capital começa exatamente aí: identificar o programa certo e estruturar a apresentação correta antes de qualquer submissão.",
      },
    ],
  },
  ctaFinal: {
    titulo: "Os editais abertos agora não ficam ",
    tituloHighlight: "abertos para sempre",
    body: "Mais de 40 programas de incentivo estão ativos neste momento, com janelas de submissão que abrem e fecham conforme políticas de governo e orçamento. A empresa que faz o diagnóstico hoje tem acesso à leitura de quais programas estão disponíveis agora. O diagnóstico gratuito é o passo zero. Leva três minutos. Não exige compromisso.",
    cta: "Fazer o diagnóstico gratuito agora",
    rodape:
      "Gratuito. Sem cadastro complicado. Resultado imediato. Mais de 2.000 empresários já fizeram.",
  },
};
