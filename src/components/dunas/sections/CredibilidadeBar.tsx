import { CountUp } from "@/components/cinematic/CountUp";
import type { DunasMetric } from "@/content/dunas";

// Casos com um único inteiro extraível usam CountUp; faixas textuais ficam estáticas.
const SIMPLE: Record<string, { end: number; prefix?: string; suffix?: string }> = {
  "R$ 50 mi": { end: 50, prefix: "R$ ", suffix: " mi" },
  "2.000+": { end: 2000, suffix: "+" },
  "40+": { end: 40, suffix: "+" },
  "5 anos": { end: 5, suffix: " anos" },
};

function MetricValue({ value, small }: { value: string; small?: boolean }) {
  const cls = `font-serif-dunas italic leading-none ${
    small ? "text-lg sm:text-xl" : "text-2xl sm:text-3xl lg:text-4xl"
  }`;
  const conf = SIMPLE[value];
  return (
    <div className={cls} style={{ color: "var(--color-gold-light)" }}>
      {conf ? <CountUp end={conf.end} prefix={conf.prefix} suffix={conf.suffix} /> : value}
    </div>
  );
}

export function CredibilidadeBar({ metrics, legal }: { metrics: DunasMetric[]; legal: string }) {
  return (
    <section
      className="relative py-12 px-5 overflow-hidden"
      style={{
        background: "var(--color-surface-1)",
        borderTop: "1px solid var(--color-line)",
        borderBottom: "1px solid var(--color-line)",
      }}
    >
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, var(--color-gold-light) 0px, var(--color-gold-light) 1px, transparent 1px, transparent 3px)",
        }}
      />
      <div className="relative max-w-6xl mx-auto">
        <div className="reveal-stagger grid grid-cols-2 md:grid-cols-5 gap-8 text-center">
          {metrics.map((m) => (
            <div key={m.label} className="space-y-2">
              <MetricValue value={m.value} small={m.small} />
              <p className="text-xs leading-tight" style={{ color: "var(--color-text-secondary)" }}>
                {m.label}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-10 text-center text-xs" style={{ color: "var(--color-text-muted)" }}>
          {legal}
        </p>
      </div>
    </section>
  );
}
