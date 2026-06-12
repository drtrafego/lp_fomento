import { useState, type CSSProperties } from "react";
import { Play, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { DunasContent } from "@/content/dunas";

export function ProvaSection({ prova }: { prova: DunasContent["prova"] }) {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  return (
    <section className="relative py-24 md:py-28 overflow-hidden" style={{ background: "var(--color-deep)" }}>
      <div className="px-5 max-w-4xl mx-auto text-center mb-14">
        <h2 className="reveal font-serif-dunas text-[clamp(28px,4vw,46px)] leading-tight">
          {prova.titulo}
          <span style={{ color: "var(--color-gold-light)" }}>{prova.tituloHighlight}</span>
        </h2>
      </div>

      <div
        className="dunas-marquee-wrap relative w-full overflow-hidden"
        style={{ "--dunas-duration": "70s" } as CSSProperties}
      >
        <div className="flex w-max">
          {[0, 1].map((dup) => (
            <div key={dup} className="dunas-marquee-track" aria-hidden={dup === 1}>
              {prova.depoimentos.map((d) => (
                <button
                  key={`${dup}-${d.handle}`}
                  onClick={() => setActiveVideo(d.urlVideo)}
                  className="group relative w-[290px] shrink-0 text-left rounded-2xl p-7 border transition-transform hover:-translate-y-1"
                  style={{ borderColor: "var(--color-line-soft)", background: "var(--color-surface-1)" }}
                >
                  <div className="flex items-center justify-between mb-5">
                    <span
                      className="inline-flex items-center justify-center w-11 h-11 rounded-full"
                      style={{ background: "var(--color-gold-halo)", color: "var(--color-gold)" }}
                    >
                      <Play size={18} fill="currentColor" />
                    </span>
                    <span className="text-xs uppercase tracking-wide" style={{ color: "var(--color-text-muted)" }}>
                      {d.segmento}
                    </span>
                  </div>
                  <p className="dunas-hero-number text-[clamp(30px,4vw,40px)] leading-none mb-3">{d.valor}</p>
                  <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                    {d.handle}
                  </p>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      <Dialog open={!!activeVideo} onOpenChange={(o) => !o && setActiveVideo(null)}>
        <DialogContent className="max-w-md border p-0 overflow-hidden bg-black" style={{ borderColor: "var(--color-line)" }}>
          <button
            onClick={() => setActiveVideo(null)}
            className="absolute right-3 top-3 z-20 rounded-full p-1.5"
            style={{ background: "#000000aa", color: "var(--color-gold)" }}
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
          {activeVideo && (
            <video src={activeVideo} controls autoPlay playsInline className="w-full h-auto max-h-[80vh]" />
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
