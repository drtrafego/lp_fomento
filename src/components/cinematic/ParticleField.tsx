import { useEffect, useRef } from "react";

interface ParticleFieldProps {
  className?: string;
  // densidade de partículas por 100k px². Padrão equilibrado para mobile e desktop.
  density?: number;
  color?: string;
  lineColor?: string;
  maxDistance?: number;
}

interface P {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

// Canvas com partículas e linhas em movimento contínuo (constelação dourada).
// Pausa quando fora do viewport e respeita prefers-reduced-motion.
export function ParticleField({
  className = "",
  density = 0.9,
  color = "rgba(212,168,83,0.65)",
  lineColor = "212,168,83",
  maxDistance = 130,
}: ParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const runningRef = useRef(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let particles: P[] = [];
    let w = 0;
    let h = 0;
    const mouse = { x: -9999, y: -9999 };

    const build = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.max(
        24,
        Math.min(120, Math.round((w * h) / 100000 * density * 100))
      );
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        // atração suave ao cursor
        const dxm = mouse.x - p.x;
        const dym = mouse.y - p.y;
        const dm = Math.hypot(dxm, dym);
        if (dm < 120) {
          p.x += dxm * 0.0012;
          p.y += dym * 0.0012;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.4, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const dist = Math.hypot(dx, dy);
          if (dist < maxDistance) {
            const alpha = (1 - dist / maxDistance) * 0.5;
            ctx.strokeStyle = `rgba(${lineColor},${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
      }
    };

    const loop = () => {
      if (runningRef.current) draw();
      rafRef.current = requestAnimationFrame(loop);
    };

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const onLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };

    build();
    if (reduce) {
      // estado estático: desenha um frame e para
      draw();
    } else {
      rafRef.current = requestAnimationFrame(loop);
    }

    const ro = new ResizeObserver(() => build());
    ro.observe(canvas);
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseleave", onLeave);

    const io = new IntersectionObserver(
      ([entry]) => {
        runningRef.current = entry.isIntersecting;
      },
      { threshold: 0 }
    );
    io.observe(canvas);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, [density, color, lineColor, maxDistance]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none ${className}`}
    />
  );
}
