import type { DunasContent } from "@/content/dunas";
import { CtaButton } from "./CtaButton";

export function OfertaSection({
  oferta,
  onCta,
}: {
  oferta: DunasContent["oferta"];
  onCta: (local: string) => void;
}) {
  return (
    <section className="relative py-24 md:py-32 px-5 overflow-hidden" style={{ background: "var(--gradient-surface)" }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: "var(--gradient-glow-h)" }} />
      <div className="relative z-10 mx-auto text-center" style={{ maxWidth: 640 }}>
        <h2 className="reveal font-serif-dunas text-[clamp(28px,4vw,48px)] leading-tight">{oferta.titulo}</h2>
        <p className="reveal mt-6 text-base sm:text-lg leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
          {oferta.body}
        </p>
        <div className="reveal mt-9">
          <CtaButton onClick={() => onCta("Oferta")} size="lg">
            {oferta.cta}
          </CtaButton>
        </div>
        <p className="reveal mt-5 text-xs" style={{ color: "var(--color-text-muted)" }}>
          {oferta.rodape}
        </p>
      </div>
    </section>
  );
}
