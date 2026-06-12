import type { DunasBullet } from "@/content/dunas";

export function BulletsSection({ bullets }: { bullets: DunasBullet[] }) {
  return (
    <section className="relative py-24 md:py-28 px-5" style={{ background: "var(--color-deep)" }}>
      <div className="max-w-4xl mx-auto reveal-stagger space-y-5">
        {bullets.map((b) => {
          const Icon = b.icon;
          return (
            <div
              key={b.num}
              className="group flex gap-5 rounded-2xl p-6 sm:p-7 border-l-2 transition-colors"
              style={{
                borderLeftColor: "var(--color-gold)",
                background: "var(--color-surface-1)",
                borderTop: "1px solid #ffffff08",
              }}
            >
              <div className="shrink-0 flex flex-col items-center gap-3">
                <span className="font-serif-dunas text-2xl" style={{ color: "var(--color-gold-muted)" }}>
                  {b.num}
                </span>
                <Icon size={26} strokeWidth={1.2} style={{ color: "var(--color-gold)" }} />
              </div>
              <div>
                <h3 className="font-serif-dunas text-xl sm:text-2xl mb-2" style={{ color: "var(--color-text-primary)" }}>
                  {b.title}
                </h3>
                <p className="text-sm sm:text-base leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                  {b.body}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
