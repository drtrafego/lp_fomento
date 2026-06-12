import type { DunasContent } from "@/content/dunas";
import { CtaButton } from "./CtaButton";

export function CtaFinalSection({
  ctaFinal,
  onCta,
}: {
  ctaFinal: DunasContent["ctaFinal"];
  onCta: (local: string) => void;
}) {
  return (
    <section className="relative py-28 md:py-36 px-5 overflow-hidden" style={{ background: "var(--gradient-surface)" }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: "var(--gradient-glow-h)" }} />
      <div className="relative z-10 max-w-2xl mx-auto text-center">
        <h2 className="reveal font-serif-dunas italic text-[clamp(30px,5vw,56px)] leading-[1.08]">
          {ctaFinal.titulo}
          <span style={{ color: "var(--color-gold-light)" }}>{ctaFinal.tituloHighlight}</span>
        </h2>
        <p className="reveal mt-7 text-base sm:text-lg leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
          {ctaFinal.body}
        </p>
        <div className="reveal mt-9">
          <CtaButton onClick={() => onCta("CTA Final")} size="lg">
            {ctaFinal.cta}
          </CtaButton>
        </div>
        <p className="reveal mt-5 text-xs" style={{ color: "var(--color-text-muted)" }}>
          {ctaFinal.rodape}
        </p>
      </div>
    </section>
  );
}
