import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRef, useEffect, useState } from "react";

const CANVAS_WIDTH = 400;
const SCREENSHOT_URL = "/page-screenshot.png";

export default function HeatmapTab() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);
  const [canvasHeight, setCanvasHeight] = useState(800);
  const [opacity, setOpacity] = useState(0.4);

  const { data: clicks } = useQuery({
    queryKey: ["heatmap-clicks"],
    queryFn: async () => {
      const { data } = await supabase
        .from("page_analytics")
        .select("viewport_x, viewport_y, viewport_width, viewport_height, page_height")
        .eq("event_type", "click");
      return data || [];
    },
  });

  // Load screenshot background
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      const aspect = img.height / img.width;
      setCanvasHeight(Math.round(CANVAS_WIDTH * aspect));
      setBgImage(img);
    };
    img.src = SCREENSHOT_URL;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !bgImage) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw screenshot background
    ctx.clearRect(0, 0, CANVAS_WIDTH, canvasHeight);
    ctx.drawImage(bgImage, 0, 0, CANVAS_WIDTH, canvasHeight);

    // Darken slightly for contrast
    ctx.fillStyle = `rgba(10, 22, 40, ${1 - opacity})`;
    ctx.fillRect(0, 0, CANVAS_WIDTH, canvasHeight);

    if (!clicks?.length) return;

    // Draw heatmap dots
    ctx.globalCompositeOperation = "screen";
    clicks.forEach(click => {
      if (!click.viewport_x || !click.viewport_y || !click.viewport_width) return;

      const pageH = click.page_height || click.viewport_height || canvasHeight;
      const nx = (click.viewport_x / click.viewport_width) * CANVAS_WIDTH;
      const ny = (click.viewport_y / pageH) * canvasHeight;

      const gradient = ctx.createRadialGradient(nx, ny, 0, nx, ny, 22);
      gradient.addColorStop(0, "rgba(212, 168, 83, 0.6)");
      gradient.addColorStop(0.4, "rgba(212, 168, 83, 0.25)");
      gradient.addColorStop(1, "rgba(212, 168, 83, 0)");

      ctx.beginPath();
      ctx.fillStyle = gradient;
      ctx.arc(nx, ny, 22, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.globalCompositeOperation = "source-over";
  }, [clicks, bgImage, canvasHeight, opacity]);

  return (
    <div className="space-y-6">
      <div className="bg-[#0f1d32] border border-[#1a2d4a] rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Mapa de Calor de Cliques</h3>
          <span className="text-white/40 text-xs">{clicks?.length || 0} cliques registrados</span>
        </div>

        {/* Opacity control */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-white/50 text-xs">Imagem de fundo:</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.1}
            value={opacity}
            onChange={e => setOpacity(Number(e.target.value))}
            className="w-32 accent-[#d4a853]"
          />
          <span className="text-white/40 text-xs">{Math.round(opacity * 100)}%</span>
        </div>

        <div className="flex justify-center">
          <div className="border border-[#1a2d4a] rounded-lg overflow-hidden">
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
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
