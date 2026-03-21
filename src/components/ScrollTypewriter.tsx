import { useEffect, useRef, useState } from "react";

interface ScrollTypewriterProps {
  text: string;
  className?: string;
}

export function ScrollTypewriter({ text, className = "" }: ScrollTypewriterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [chars, setChars] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // Start revealing when element enters bottom 80% of viewport
      // Finish when element reaches top 30%
      const start = vh * 0.85;
      const end = vh * 0.25;
      const progress = Math.max(0, Math.min(1, (start - rect.top) / (start - end)));
      setChars(Math.floor(progress * text.length));
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // initial check
    return () => window.removeEventListener("scroll", onScroll);
  }, [text]);

  const visible = text.slice(0, chars);
  const blurChars = text.slice(Math.max(0, chars - 3), chars);
  const hidden = text.slice(chars);

  return (
    <span ref={ref} className={className}>
      <span className="text-white/70">{visible.slice(0, Math.max(0, chars - 3))}</span>
      {blurChars && (
        <span
          className="text-white/50 transition-all duration-150"
          style={{ filter: "blur(1px)" }}
        >
          {blurChars}
        </span>
      )}
      <span
        className="text-white/10 transition-all duration-300"
        style={{ filter: "blur(4px)" }}
      >
        {hidden}
      </span>
      {chars < text.length && chars > 0 && (
        <span className="inline-block w-[2px] h-[1em] bg-[#d4a853] ml-[1px] align-middle animate-pulse" />
      )}
    </span>
  );
}
