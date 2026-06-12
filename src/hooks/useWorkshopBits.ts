import { useEffect, useState } from "react";

// Data do workshop (mantida em sincronia com a página principal)
export function getWorkshopDate() {
  return new Date(2026, 5, 18, 20, 0, 0); // 18/06/2026 às 20h
}

// Detecta o estado/UF do visitante (geo IP) sem bloquear o LCP.
export function useUserState() {
  const [estado, setEstado] = useState<string | null>(null);
  const [uf, setUf] = useState<string | null>(null);
  useEffect(() => {
    const doFetch = () => {
      fetch("https://ipapi.co/json/")
        .then((r) => r.json())
        .then((data) => {
          if (data.country_code === "BR" && data.region) {
            setEstado(data.region);
            setUf(data.region_code || null);
          }
        })
        .catch(() => {});
    };
    if ("requestIdleCallback" in window) {
      (window as unknown as { requestIdleCallback: (cb: () => void, o?: object) => void }).requestIdleCallback(doFetch, { timeout: 3000 });
    } else {
      setTimeout(doFetch, 3000);
    }
  }, []);
  return { estado, uf };
}

// Contagem regressiva até a data do workshop.
export function useCountdown() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    const target = getWorkshopDate();
    const tick = () => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) return setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    let rafId: number;
    let lastSecond = -1;
    const loop = () => {
      const sec = Math.floor(Date.now() / 1000);
      if (sec !== lastSecond) {
        lastSecond = sec;
        tick();
      }
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, []);
  return timeLeft;
}
