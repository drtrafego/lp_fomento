import { useEffect, useRef, useState } from "react";
import { throttle } from "@/lib/throttle";

interface ScrollTypewriterProps {
  text: string;
  className?: string;
  /** 0-1 progress externally controlled */
  progress?: number;
}

export function ScrollTypewriter({ text, className = "", progress }: ScrollTypewriterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [selfProgress, setSelfProgress] = useState(0);

  useEffect(() => {
    if (progress !== undefined) return;
    const el = ref.current;
    if (!el) return;

    const onScroll = throttle(() => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const start = vh * 0.85;
      const end = vh * 0.25;
      const p = Math.max(0, Math.min(1, (start - rect.top) / (start - end)));
      setSelfProgress(p);
    }, 16);

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [text, progress]);

  const p = progress !== undefined ? progress : selfProgress;
  const chars = Math.floor(p * text.length);

  return (
    <span ref={ref} className={className}>
      <span className="text-white/70">{text.slice(0, Math.max(0, chars - 3))}</span>
      {chars > 0 && chars < text.length && (
        <span
          className="text-white/50 transition-all duration-150"
          style={{ filter: "blur(1px)" }}
        >
          {text.slice(Math.max(0, chars - 3), chars)}
        </span>
      )}
      {chars >= text.length && (
        <span className="text-white/70">{text.slice(Math.max(0, chars - 3))}</span>
      )}
      <span
        className="text-white/10 transition-all duration-300"
        style={{ filter: "blur(4px)" }}
      >
        {text.slice(chars)}
      </span>
      {chars < text.length && chars > 0 && (
        <span className="inline-block w-[2px] h-[1em] bg-[#d4a853] ml-[1px] align-middle animate-pulse" />
      )}
    </span>
  );
}

/**
 * Hook that tracks scroll progress for a card container,
 * distributing progress sequentially across N bullets.
 */
export function useSequentialBulletProgress(
  containerRef: React.RefObject<HTMLElement | null>,
  bulletCount: number
): number[] {
  const [progresses, setProgresses] = useState<number[]>(
    Array(bulletCount).fill(0)
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onScroll = throttle(() => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const start = vh * 0.9;
      const end = vh * 0.3;
      const totalProgress = Math.max(0, Math.min(1, (start - rect.top) / (start - end)));

      const newProgresses: number[] = [];
      for (let i = 0; i < bulletCount; i++) {
        const bulletStart = i / bulletCount;
        const bulletEnd = (i + 1) / bulletCount;
        const bulletProgress = Math.max(
          0,
          Math.min(1, (totalProgress - bulletStart) / (bulletEnd - bulletStart))
        );
        newProgresses.push(bulletProgress);
      }
      setProgresses(newProgresses);
    }, 16);

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [bulletCount, containerRef]);

  return progresses;
}
