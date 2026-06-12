import type { DunasContent } from "@/content/dunas";

import leiDecreto from "@/assets/lei-decreto.webp";
import mapaOrgaos from "@/assets/mapa-orgaos.webp";
import pedroPalco from "@/assets/pedro-palco-desktop.webp";

export function SolucaoSection({ solucao }: { solucao: DunasContent["solucao"] }) {
  return (
    <section className="solucao-pin relative" style={{ background: "var(--gradient-surface)" }}>
      <div className="solucao-stick relative py-24 md:py-32 px-5 overflow-hidden">
        <div className="max-w-5xl mx-auto">
          <div className="reveal text-center max-w-3xl mx-auto mb-14">
            <h2 className="font-serif-dunas text-[clamp(30px,4.5vw,52px)] leading-[1.08]">
              {solucao.titulo}
              <span style={{ color: "var(--color-gold-light)" }}>{solucao.tituloHighlight}</span>
            </h2>
            <div
              className="mt-7 space-y-5 text-base sm:text-lg leading-relaxed"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {solucao.paragrafos.map((p, i) => (
                <p key={i} style={i === solucao.paragrafos.length - 1 ? { color: "var(--color-text-primary)" } : undefined}>
                  {p}
                </p>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center mb-12">
            <div
              className="reveal relative rounded-2xl overflow-hidden border"
              style={{ borderColor: "var(--color-line)", background: "#fff" }}
            >
              <img src={leiDecreto} alt="Decreto-Lei nº 719 de 1969" className="w-full object-contain" loading="lazy" />
              <span
                className="absolute top-4 left-4 rounded-full px-4 py-1.5 text-xs font-semibold"
                style={{ background: "var(--color-gold)", color: "var(--color-text-inverse)" }}
              >
                {solucao.decretoBadge}
              </span>
            </div>
            <div className="reveal">
              <div className="flex flex-wrap gap-2.5 mb-6">
                {solucao.orgaos.map((o) => (
                  <span
                    key={o}
                    className="rounded-full px-4 py-2 text-sm font-medium border"
                    style={{
                      borderColor: "var(--color-line)",
                      color: "var(--color-gold-bright)",
                      background: "var(--color-surface-2)",
                    }}
                  >
                    {o}
                  </span>
                ))}
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                {solucao.orgaosLegenda}
              </p>
            </div>
          </div>

          <div className="reveal relative rounded-2xl overflow-hidden mb-16">
            <img src={mapaOrgaos} alt="Mapa dos órgãos de fomento federais" className="w-full object-cover" loading="lazy" />
            <div className="absolute inset-0" style={{ boxShadow: "inset 0 0 140px 40px var(--color-deep)" }} />
          </div>

          <div className="reveal grid md:grid-cols-2 gap-10 items-center">
            <div className="relative rounded-2xl overflow-hidden border" style={{ borderColor: "var(--color-line)" }}>
              <img src={pedroPalco} alt="Pedro Diniz e Igor Abreu, sócios fundadores da Dunas Capital" className="w-full object-cover" loading="lazy" />
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(to top, var(--color-deep) 0%, transparent 55%)" }}
              />
            </div>
            <div>
              <p className="font-serif-dunas text-2xl sm:text-3xl leading-snug mb-4">
                {solucao.especialistasTitulo}
              </p>
              <p className="text-base leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                {solucao.especialistasBody}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
