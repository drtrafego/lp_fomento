import type { CSSProperties, ReactNode } from "react";
import { dunasContent } from "@/content/dunas";
import type { DunasTheme } from "./themes";
import {
  CredibilidadeBar,
  ProblemaSection,
  SolucaoSection,
  BulletsSection,
  ComoFuncionaSection,
  ProvaSection,
  OfertaSection,
  FaqSection,
  CtaFinalSection,
  EventoBar,
} from "./sections";

// Estrutura comum a todas as versões da LP Dunas (A/B/C/D).
// Aplica o tema no container raiz e monta EventoBar + todas as seções extraídas
// na ordem definitiva. O hero é injetado via prop por cada versão (R3F na A,
// hero provisório nas demais).
export function DunasShell({
  theme,
  hero,
  rootRef,
  onCta,
}: {
  theme: DunasTheme;
  hero: ReactNode;
  rootRef: React.RefObject<HTMLDivElement>;
  onCta: (local: string) => void;
}) {
  const c = dunasContent;
  return (
    <div
      ref={rootRef}
      className="min-h-screen font-sans-dunas overflow-x-hidden"
      style={{ ...(theme as CSSProperties), background: "var(--color-deep)", color: "var(--color-text-primary)" }}
    >
      {hero}
      <EventoBar />
      <CredibilidadeBar metrics={c.credibilidade.metrics} legal={c.credibilidade.legal} />
      <ProblemaSection problema={c.problema} />
      <SolucaoSection solucao={c.solucao} />
      <BulletsSection bullets={c.bullets} />
      <ComoFuncionaSection comoFunciona={c.comoFunciona} />
      <ProvaSection prova={c.prova} />
      <OfertaSection oferta={c.oferta} onCta={onCta} />
      <FaqSection faq={c.faq} />
      <CtaFinalSection ctaFinal={c.ctaFinal} onCta={onCta} />
    </div>
  );
}
