import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRef, useEffect, useState } from "react";
import { type DateRange, getDateFrom } from "./DateFilter";

const SCREENSHOT_URL = "/page-screenshot.png";
const MOBILE_BREAKPOINT = 768;

type DeviceType = "desktop" | "mobile";

interface Props { dateRange: DateRange; }

export default function HeatmapTab({ dateRange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);
  const [opacity, setOpacity] = useState(0.4);
  const [device, setDevice] = useState<DeviceType>("desktop");

  const canvasWidth = device === "mobile" ? 280 : 400;
  const dateFrom = getDateFrom(dateRange);

  const { data: allClicks } = useQuery({
    queryKey: ["heatmap-clicks", dateRange],
    queryFn: async () => {
      let q = supabase
        .from("page_analytics")
        .select("viewport_x, viewport_y, viewport_width, viewport_height, page_height")
        .eq("event_type", "click");
      if (dateFrom) q = q.gte("created_at", dateFrom);
      const { data } = await q;
      return data || [];
    },
  });

  const clicks = allClicks?.filter(c => {
    if (!c.viewport_width) return device === "desktop";
    return device === "mobile"
      ? c.viewport_width < MOBILE_BREAKPOINT
      : c.viewport_width >= MOBILE_BREAKPOINT;
  }) || [];

  const desktopCount = allClicks?.filter(c => !c.viewport_width || c.viewport_width >= MOBILE_BREAKPOINT).length || 0;
  const mobileCount = allClicks?.filter(c => c.viewport_width && c.viewport_width < MOBILE_BREAKPOINT).length || 0;

  useEffect(() => {
    const img = new Image();
    img.onload = () => setBgImage(img);
    img.src = SCREENSHOT_URL;
  }, []);

  const canvasHeight = bgImage
    ? Math.round(canvasWidth * (bgImage.height / bgImage.width))
    : device === "mobile" ? 1200 : 800;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    if (bgImage) {
      ctx.drawImage(bgImage, 0, 0, canvasWidth, canvasHeight);
      ctx.fillStyle = `rgba(10, 22, 40, ${1 - opacity})`;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    } else {
      ctx.fillStyle = "#0a1628";
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }

    if (!clicks.length) return;

    ctx.globalCompositeOperation = "screen";
    const dotRadius = device === "mobile" ? 18 : 22;

    clicks.forEach(click => {
      if (!click.viewport_x || !click.viewport_y || !click.viewport_width) return;
      const pageH = click.page_height || click.viewport_height || canvasHeight;
      const nx = (click.viewport_x / click.viewport_width) * canvasWidth;
      const ny = (click.viewport_y / pageH) * canvasHeight;

      const gradient = ctx.createRadialGradient(nx, ny, 0, nx, ny, dotRadius);
      gradient.addColorStop(0, "rgba(212, 168, 83, 0.6)");
      gradient.addColorStop(0.4, "rgba(212, 168, 83, 0.25)");
      gradient.addColorStop(1, "rgba(212, 168, 83, 0)");

      ctx.beginPath();
      ctx.fillStyle = gradient;
      ctx.arc(nx, ny, dotRadius, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.globalCompositeOperation = "source-over";
  }, [clicks, bgImage, canvasWidth, canvasHeight, opacity, device]);

  return (
    <div className="space-y-6">
      <div className="bg-[#0f1d32] border border-[#1a2d4a] rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Mapa de Calor de Cliques</h3>
          <span className="text-white/40 text-xs">{clicks.length} cliques registrados</span>
        </div>

        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex rounded-lg border border-[#1a2d4a] overflow-hidden">
            <button
              onClick={() => setDevice("desktop")}
              className={`px-4 py-1.5 text-xs font-medium transition-colors ${
                device === "desktop"
                  ? "bg-[#d4a853] text-[#0a1628]"
                  : "text-white/50 hover:text-white/80"
              }`}
            >
              🖥 Desktop ({desktopCount})
            </button>
            <button
              onClick={() => setDevice("mobile")}
              className={`px-4 py-1.5 text-xs font-medium transition-colors ${
                device === "mobile"
                  ? "bg-[#d4a853] text-[#0a1628]"
                  : "text-white/50 hover:text-white/80"
              }`}
            >
              📱 Mobile ({mobileCount})
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-white/50 text-xs">Fundo:</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={opacity}
              onChange={e => setOpacity(Number(e.target.value))}
              className="w-24 accent-[#d4a853]"
            />
            <span className="text-white/40 text-xs">{Math.round(opacity * 100)}%</span>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="border border-[#1a2d4a] rounded-lg overflow-hidden">
            <canvas
              ref={canvasRef}
              width={canvasWidth}
              height={canvasHeight}
              className="block max-h-[70vh] w-auto"
            />
          </div>
        </div>
        <div className="flex items-center justify-center gap-4 mt-4 text-xs text-white/40">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-[#d4a853]/20" />
            Menor concentração
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-[#d4a853]/60" />
            Maior concentração
          </div>
        </div>
      </div>
    </div>
  );
}
