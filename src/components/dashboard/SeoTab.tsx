import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from "recharts";
import { type DateRange, getDateFrom } from "./DateFilter";

const COLORS = ["#3b82f6", "#6366f1", "#d4a853", "#22c55e", "#ef4444", "#f59e0b", "#ec4899"];

interface Props { dateRange: DateRange; }

export default function SeoTab({ dateRange }: Props) {
  const dateFrom = getDateFrom(dateRange);

  const { data: pixelEvents } = useQuery({
    queryKey: ["seo-pixel", dateRange],
    queryFn: async () => {
      let q = supabase.from("pixel_events").select("referrer, user_agent, state, city, country");
      if (dateFrom) q = q.gte("created_at", dateFrom);
      const { data } = await q;
      return data || [];
    },
  });

  const refMap = new Map<string, number>();
  pixelEvents?.forEach(e => {
    let ref = "(direto)";
    if (e.referrer) {
      try { ref = new URL(e.referrer).hostname; } catch { ref = e.referrer.substring(0, 30); }
    }
    refMap.set(ref, (refMap.get(ref) || 0) + 1);
  });
  const refData = Array.from(refMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const deviceMap = { mobile: 0, desktop: 0, tablet: 0 };
  pixelEvents?.forEach(e => {
    const ua = (e.user_agent || "").toLowerCase();
    if (/mobile|android|iphone/.test(ua)) deviceMap.mobile++;
    else if (/ipad|tablet/.test(ua)) deviceMap.tablet++;
    else deviceMap.desktop++;
  });
  const deviceData = [
    { name: "Mobile", value: deviceMap.mobile },
    { name: "Desktop", value: deviceMap.desktop },
    { name: "Tablet", value: deviceMap.tablet },
  ].filter(d => d.value > 0);

  const stateMap = new Map<string, number>();
  pixelEvents?.forEach(e => {
    const st = e.state || "(desconhecido)";
    stateMap.set(st, (stateMap.get(st) || 0) + 1);
  });
  const stateData = Array.from(stateMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const cityMap = new Map<string, number>();
  pixelEvents?.forEach(e => {
    const c = e.city || "(desconhecida)";
    cityMap.set(c, (cityMap.get(c) || 0) + 1);
  });
  const cityData = Array.from(cityMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#0f1d32] border border-[#1a2d4a] rounded-xl p-6">
          <h3 className="text-white font-semibold mb-4">Referrers</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={refData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, value }) => `${name}: ${value}`}>
                {refData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#0f1d32", border: "1px solid #1a2d4a", color: "#fff" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#0f1d32] border border-[#1a2d4a] rounded-xl p-6">
          <h3 className="text-white font-semibold mb-4">Dispositivos</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={deviceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, value }) => `${name}: ${value}`}>
                {deviceData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#0f1d32", border: "1px solid #1a2d4a", color: "#fff" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#0f1d32] border border-[#1a2d4a] rounded-xl p-6">
          <h3 className="text-white font-semibold mb-4">Top Estados</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stateData} layout="vertical">
              <XAxis type="number" stroke="#ffffff30" />
              <YAxis dataKey="name" type="category" stroke="#ffffff50" width={100} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#0f1d32", border: "1px solid #1a2d4a", color: "#fff" }} />
              <Bar dataKey="count" fill="#3b82f6" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#0f1d32] border border-[#1a2d4a] rounded-xl p-6">
          <h3 className="text-white font-semibold mb-4">Top Cidades</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={cityData} layout="vertical">
              <XAxis type="number" stroke="#ffffff30" />
              <YAxis dataKey="name" type="category" stroke="#ffffff50" width={120} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#0f1d32", border: "1px solid #1a2d4a", color: "#fff" }} />
              <Bar dataKey="count" fill="#6366f1" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
