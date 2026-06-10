import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface CountUpProps {
  end: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
  // separa milhares com ponto (padrão pt-BR)
  thousands?: boolean;
}

function format(n: number, thousands: boolean) {
  const rounded = Math.round(n);
  if (!thousands) return String(rounded);
  return rounded.toLocaleString("pt-BR");
}

// Conta de 0 até `end` quando o elemento entra na viewport.
// Refaz a contagem toda vez que reentra (re-engajamento no scroll).
export function CountUp({
  end,
  prefix = "",
  suffix = "",
  duration = 1.8,
  className = "",
  thousands = true,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setDisplay(format(end, thousands));
      return;
    }

    const obj = { v: 0 };
    let tween: gsap.core.Tween | null = null;

    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 85%",
      onEnter: () => {
        tween?.kill();
        obj.v = 0;
        tween = gsap.to(obj, {
          v: end,
          duration,
          ease: "power2.out",
          onUpdate: () => setDisplay(format(obj.v, thousands)),
        });
      },
      onLeaveBack: () => {
        tween?.kill();
        obj.v = 0;
        setDisplay("0");
      },
    });

    return () => {
      tween?.kill();
      st.kill();
    };
  }, [end, duration, thousands]);

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}
