import { Plus } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { DunasContent } from "@/content/dunas";

export function FaqSection({ faq }: { faq: DunasContent["faq"] }) {
  return (
    <section className="relative py-24 md:py-28 px-5" style={{ background: "var(--color-deep)" }}>
      <div className="max-w-3xl mx-auto">
        <h2 className="reveal font-serif-dunas text-center text-[clamp(28px,4vw,46px)] leading-tight mb-12">
          {faq.titulo}
        </h2>
        <Accordion type="single" collapsible className="reveal-stagger space-y-3">
          {faq.perguntas.map((f, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="rounded-xl border px-5 [&[data-state=open]_.faq-plus]:rotate-45"
              style={{ borderColor: "var(--color-line-soft)", background: "var(--color-surface-1)" }}
            >
              <AccordionTrigger
                className="hover:no-underline py-5 text-left font-serif-dunas text-lg sm:text-xl [&>svg]:hidden"
                style={{ color: "var(--color-text-primary)" }}
              >
                <span className="flex-1 pr-4">{f.q}</span>
                <Plus
                  className="faq-plus h-5 w-5 shrink-0 transition-transform duration-200"
                  style={{ color: "var(--color-gold)" }}
                />
              </AccordionTrigger>
              <AccordionContent className="text-base leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
