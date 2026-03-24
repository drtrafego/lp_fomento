import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRef, useEffect, useState } from "react";

export default function HeatmapTab() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions] = useState({ width: 400, height: 800 });

  const { data: clicks } = useQuery({
    queryKey: ["heatmap-clicks"],
    queryFn: async () => {
      const { data } = await supabase
        .from("page_analytics")
        .select("viewport_x, viewport_y, viewport_width, viewport_height")
        .eq("event_type", "click");
      return data || [];
    },
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !clicks?.length) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, dimensions.width, dimensions.height);

    // Draw page outline
    ctx.fillStyle = "#0a1628";
    ctx.fillRect(0, 0, dimensions.width, dimensions.height);

    // Normalize clicks to canvas dimensions
    clicks.forEach(click => {
      if (!click.viewport_x || !click.viewport_y || !click.viewport_width || !click.viewport_height) return;

      const nx = (click.viewport_x / click.viewport_width) * dimensions.width;
      const ny = (click.viewport_y / click.viewport_height) * dimensions.height;

      const gradient = ctx.createRadialGradient(nx, ny, 0, nx, ny, 20);
      gradient.addColorStop(0, "rgba(212, 168, 83, 0.4)");
      gradient.addColorStop(0.5, "rgba(212, 168, 83, 0.1)");
      gradient.addColorStop(1, "rgba(212, 168, 83, 0)");

      ctx.beginPath();
      ctx.fillStyle = gradient;
      ctx.arc(nx, ny, 20, 0, Math.PI * 2);
      ctx.fill();
    });
  }, [clicks, dimensions]);

  return (
    <div className="space-y-6">
      <div className="bg-[#0f1d32] border border-[#1a2d4a] rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Mapa de Calor de Cliques</h3>
          <span className="text-white/40 text-xs">{clicks?.length || 0} cliques registrados</span>
        </div>
        <div className="flex justify-center">
          <div className="border border-[#1a2d4a] rounded-lg overflow-hidden">
            <canvas
              ref={canvasRef}
              width={dimensions.width}
              height={dimensions.height}
              className="block"
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
