import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#3b82f6", "#6366f1", "#d4a853", "#22c55e", "#ef4444", "#f59e0b", "#ec4899"];

export default function TrafficTab() {
  const { data: events } = useQuery({
    queryKey: ["traffic-pixel"],
    queryFn: async () => {
      const { data } = await supabase.from("pixel_events").select("utm_source, utm_medium, utm_campaign, event_name, created_at");
      return data || [];
    },
  });

  // UTM Source breakdown
  const sourceMap = new Map<string, number>();
  events?.forEach(e => {
    const src = e.utm_source || "(direto)";
    sourceMap.set(src, (sourceMap.get(src) || 0) + 1);
  });
  const sourceData = Array.from(sourceMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  // Events per day
  const dayMap = new Map<string, number>();
  events?.forEach(e => {
    const day = e.created_at.substring(0, 10);
    dayMap.set(day, (dayMap.get(day) || 0) + 1);
  });
  const dailyData = Array.from(dayMap.entries())
    .map(([day, count]) => ({ day, count }))
    .sort((a, b) => a.day.localeCompare(b.day));

  // Campaign breakdown
  const campMap = new Map<string, { views: number; checkouts: number }>();
  events?.forEach(e => {
    const camp = e.utm_campaign || "(sem campanha)";
    const entry = campMap.get(camp) || { views: 0, checkouts: 0 };
    if (e.event_name === "PageView") entry.views++;
    if (e.event_name === "InitiateCheckout") entry.checkouts++;
    campMap.set(camp, entry);
  });
  const campData = Array.from(campMap.entries())
    .map(([name, { views, checkouts }]) => ({
      name,
      views,
      checkouts,
      conversion: views > 0 ? ((checkouts / views) * 100).toFixed(1) + "%" : "0%",
    }))
    .sort((a, b) => b.views - a.views);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#0f1d32] border border-[#1a2d4a] rounded-xl p-6">
          <h3 className="text-white font-semibold mb-4">Fontes de Tráfego</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={sourceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, value }) => `${name}: ${value}`}>
                {sourceData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#0f1d32", border: "1px solid #1a2d4a", color: "#fff" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#0f1d32] border border-[#1a2d4a] rounded-xl p-6">
          <h3 className="text-white font-semibold mb-4">Eventos por Dia</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyData}>
              <XAxis dataKey="day" stroke="#ffffff30" tick={{ fill: "#ffffff60", fontSize: 11 }} />
              <YAxis stroke="#ffffff30" />
              <Tooltip contentStyle={{ background: "#0f1d32", border: "1px solid #1a2d4a", color: "#fff" }} />
              <Bar dataKey="count" fill="#d4a853" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-[#0f1d32] border border-[#1a2d4a] rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4">Campanhas</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-white/50 border-b border-[#1a2d4a]">
                <th className="py-2 pr-4">Campanha</th>
                <th className="py-2 pr-4">Views</th>
                <th className="py-2 pr-4">Checkouts</th>
                <th className="py-2">Conversão</th>
              </tr>
            </thead>
            <tbody>
              {campData.map(c => (
                <tr key={c.name} className="border-b border-[#1a2d4a]/50 text-white/80">
                  <td className="py-2 pr-4">{c.name}</td>
                  <td className="py-2 pr-4">{c.views}</td>
                  <td className="py-2 pr-4">{c.checkouts}</td>
                  <td className="py-2">{c.conversion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
