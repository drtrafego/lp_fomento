import type { DunasContent } from "@/content/dunas";

export function ProblemaSection({ problema }: { problema: DunasContent["problema"] }) {
  return (
    <section className="relative py-24 md:py-32 px-5" style={{ background: "var(--color-deep)" }}>
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-x-14 gap-y-6">
        <div className="reveal">
          <h2 className="font-serif-dunas text-[clamp(28px,4vw,44px)] leading-[1.1]">
            {problema.titulo}
          </h2>
        </div>
        <div
          className="reveal space-y-5 text-base sm:text-lg leading-relaxed"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {problema.paragrafos.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          <p className="font-serif-dunas italic text-2xl" style={{ color: "var(--color-gold-light)" }}>
            {problema.enfase}
          </p>
          <p>{problema.paragrafoApos}</p>
          <p style={{ color: "var(--color-text-primary)" }}>{problema.fechamento}</p>
        </div>
      </div>
    </section>
  );
}
