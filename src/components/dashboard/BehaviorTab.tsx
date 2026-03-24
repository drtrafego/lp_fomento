import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function BehaviorTab() {
  const { data: analytics } = useQuery({
    queryKey: ["behavior-analytics"],
    queryFn: async () => {
      const { data } = await supabase.from("page_analytics").select("*");
      return data || [];
    },
  });

  const scrollEvents = analytics?.filter(e => e.event_type === "scroll") || [];
  const exitEvents = analytics?.filter(e => e.event_type === "exit") || [];
  const clickEvents = analytics?.filter(e => e.event_type === "click") || [];

  // Scroll depth distribution
  const scrollMap = new Map<number, number>();
  scrollEvents.forEach(e => {
    const p = e.scroll_percent || 0;
    scrollMap.set(p, (scrollMap.get(p) || 0) + 1);
  });
  const scrollData = [25, 50, 75, 100].map(p => ({
    milestone: `${p}%`,
    count: scrollMap.get(p) || 0,
  }));

  // Exit section distribution
  const exitMap = new Map<string, number>();
  exitEvents.forEach(e => {
    const s = e.section_name || "(desconhecida)";
    exitMap.set(s, (exitMap.get(s) || 0) + 1);
  });
  const exitData = Array.from(exitMap.entries())
    .map(([section, count]) => ({ section, count }))
    .sort((a, b) => b.count - a.count);

  // Clicks per section
  const clickMap = new Map<string, number>();
  clickEvents.forEach(e => {
    const s = e.section_name || "(desconhecida)";
    clickMap.set(s, (clickMap.get(s) || 0) + 1);
  });
  const clickData = Array.from(clickMap.entries())
    .map(([section, count]) => ({ section, count }))
    .sort((a, b) => b.count - a.count);

  // Average time on page
  const times = exitEvents.map(e => e.time_on_page || 0).filter(t => t > 0);
  const avgTime = times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
  const totalSessions = new Set(analytics?.map(e => e.session_id)).size;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#0f1d32] border border-[#1a2d4a] rounded-xl p-4">
          <p className="text-white/50 text-xs mb-1">Sessões</p>
          <p className="text-xl font-bold text-blue-400">{totalSessions}</p>
        </div>
        <div className="bg-[#0f1d32] border border-[#1a2d4a] rounded-xl p-4">
          <p className="text-white/50 text-xs mb-1">Tempo Médio</p>
          <p className="text-xl font-bold text-[#d4a853]">{avgTime}s</p>
        </div>
        <div className="bg-[#0f1d32] border border-[#1a2d4a] rounded-xl p-4">
          <p className="text-white/50 text-xs mb-1">Total Cliques</p>
          <p className="text-xl font-bold text-indigo-400">{clickEvents.length}</p>
        </div>
        <div className="bg-[#0f1d32] border border-[#1a2d4a] rounded-xl p-4">
          <p className="text-white/50 text-xs mb-1">Saídas Rastreadas</p>
          <p className="text-xl font-bold text-red-400">{exitEvents.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-[#0f1d32] border border-[#1a2d4a] rounded-xl p-6">
          <h3 className="text-white font-semibold mb-4">Scroll Depth</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={scrollData}>
              <XAxis dataKey="milestone" stroke="#ffffff30" />
              <YAxis stroke="#ffffff30" />
              <Tooltip contentStyle={{ background: "#0f1d32", border: "1px solid #1a2d4a", color: "#fff" }} />
              <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#0f1d32] border border-[#1a2d4a] rounded-xl p-6">
          <h3 className="text-white font-semibold mb-4">Seção de Saída</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={exitData} layout="vertical">
              <XAxis type="number" stroke="#ffffff30" />
              <YAxis dataKey="section" type="category" stroke="#ffffff50" width={100} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#0f1d32", border: "1px solid #1a2d4a", color: "#fff" }} />
              <Bar dataKey="count" fill="#ef4444" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#0f1d32] border border-[#1a2d4a] rounded-xl p-6">
          <h3 className="text-white font-semibold mb-4">Cliques por Seção</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={clickData} layout="vertical">
              <XAxis type="number" stroke="#ffffff30" />
              <YAxis dataKey="section" type="category" stroke="#ffffff50" width={100} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#0f1d32", border: "1px solid #1a2d4a", color: "#fff" }} />
              <Bar dataKey="count" fill="#d4a853" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
