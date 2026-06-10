import { useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export interface StoryBlock {
  kicker?: string;
  title: ReactNode;
  body: ReactNode;
}

interface ScrollStoryProps {
  blocks: StoryBlock[];
  // conteúdo de fundo que fica fixo (pinned) atrás dos blocos
  background?: ReactNode;
}

// Scrollytelling com pinning: o background fica fixo enquanto os blocos
// entram e saem com fade conforme o scroll. A animação acompanha a posição
// do scroll (scrub), não dispara só uma vez.
export function ScrollStory({ blocks, background }: ScrollStoryProps) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const blockEls = gsap.utils.toArray<HTMLElement>(".story-block");

      if (reduce) {
        gsap.set(blockEls, { opacity: 1, y: 0 });
        return;
      }

      const pinWrap = root.current!.querySelector(".story-pin") as HTMLElement;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: () => "+=" + window.innerHeight * blocks.length,
          pin: pinWrap,
          scrub: 1,
        },
      });

      blockEls.forEach((el, i) => {
        tl.fromTo(
          el,
          { opacity: 0, y: 60 },
          { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
          i
        );
        // mantém visível e depois apaga, exceto o último bloco
        if (i < blockEls.length - 1) {
          tl.to(
            el,
            { opacity: 0, y: -60, duration: 0.5, ease: "power2.in" },
            i + 0.5
          );
        }
      });

      // barra de progresso opcional
      const bar = root.current!.querySelector(".story-progress");
      if (bar) {
        gsap.fromTo(
          bar,
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: "none",
            scrollTrigger: {
              trigger: root.current,
              start: "top top",
              end: () => "+=" + window.innerHeight * blocks.length,
              scrub: true,
            },
          }
        );
      }
    },
    { scope: root, dependencies: [blocks.length] }
  );

  return (
    <div ref={root} className="relative">
      <div className="story-pin relative h-screen w-full overflow-hidden">
        {/* Background fixo */}
        <div className="absolute inset-0">{background}</div>

        {/* Barra de progresso do capítulo */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-white/5 z-20">
          <div className="story-progress h-full w-full origin-left bg-[#d4a853]" />
        </div>

        {/* Blocos empilhados no centro, um sobre o outro */}
        <div className="relative z-10 h-full flex items-center justify-center px-6">
          <div className="relative max-w-2xl w-full text-center">
            {blocks.map((b, i) => (
              <div
                key={i}
                className="story-block absolute inset-0 flex flex-col items-center justify-center gap-4"
              >
                {b.kicker && (
                  <span className="text-[#d4a853] font-semibold uppercase tracking-[0.25em] text-xs sm:text-sm">
                    {b.kicker}
                  </span>
                )}
                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-[1.1]">
                  {b.title}
                </h3>
                <p className="text-white/70 text-base sm:text-lg leading-relaxed max-w-xl">
                  {b.body}
                </p>
              </div>
            ))}
            {/* espaçador invisível para dar altura ao bloco absoluto */}
            <div className="invisible flex flex-col gap-4 py-10">
              <span className="text-sm">.</span>
              <h3 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-[1.1]">
                {blocks[0]?.title}
              </h3>
              <p className="text-base sm:text-lg leading-relaxed">{blocks[0]?.body}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
