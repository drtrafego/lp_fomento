import type { DunasContent } from "@/content/dunas";

export function ComoFuncionaSection({ comoFunciona }: { comoFunciona: DunasContent["comoFunciona"] }) {
  return (
    <section className="steps-section relative py-24 md:py-32 px-5" style={{ background: "var(--gradient-surface)" }}>
      <div className="max-w-4xl mx-auto">
        <h2 className="reveal font-serif-dunas text-center text-[clamp(28px,4vw,46px)] leading-tight mb-16">
          {comoFunciona.titulo}
        </h2>

        <div className="relative">
          <svg
            className="absolute left-1/2 top-0 -translate-x-1/2 h-full w-2 hidden md:block"
            viewBox="0 0 4 1000"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path className="steps-line" d="M2 0 L2 1000" stroke="var(--color-gold)" strokeWidth="2" fill="none" />
          </svg>

          <div className="space-y-12">
            {comoFunciona.passos.map((p, i) => (
              <div key={p.n} className="reveal md:grid md:grid-cols-2 md:gap-12 md:items-center">
                <div className={i % 2 === 1 ? "md:order-2 md:text-right" : ""}>
                  <div
                    className="inline-flex items-center justify-center w-12 h-12 rounded-full font-serif-dunas text-2xl mb-4"
                    style={{ background: "var(--color-gold)", color: "var(--color-text-inverse)" }}
                  >
                    {p.n}
                  </div>
                  <h3 className="font-serif-dunas text-2xl sm:text-3xl mb-3">{p.title}</h3>
                  <p className="text-base leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                    {p.body}
                  </p>
                </div>
                <div className={`hidden md:block ${i % 2 === 1 ? "md:order-1" : ""}`} aria-hidden="true" />
              </div>
            ))}
          </div>
        </div>

        <p className="reveal text-center mt-14 text-sm" style={{ color: "var(--color-gold-bright)" }}>
          {comoFunciona.rodape}
        </p>
      </div>
    </section>
  );
}
