import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, FunnelChart, Funnel, LabelList } from "recharts";

export default function OverviewTab() {
  const { data: pixelEvents } = useQuery({
    queryKey: ["overview-pixel"],
    queryFn: async () => {
      const { data } = await supabase.from("pixel_events").select("event_name, event_id, created_at");
      return data || [];
    },
  });

  const { data: checkoutEvents } = useQuery({
    queryKey: ["overview-checkout"],
    queryFn: async () => {
      const { data } = await supabase.from("checkout_events").select("event_type, amount, created_at");
      return data || [];
    },
  });

  const pageViews = pixelEvents?.filter(e => e.event_name === "PageView").length || 0;
  const viewContent = pixelEvents?.filter(e => e.event_name === "ViewContent").length || 0;
  const initiateCheckout = pixelEvents?.filter(e => e.event_name === "InitiateCheckout").length || 0;
  const purchases = checkoutEvents?.filter(e => e.event_type === "purchase").length || 0;
  const totalRevenue = checkoutEvents?.filter(e => e.event_type === "purchase").reduce((s, e) => s + (e.amount || 0), 0) || 0;
  const pixGenerated = checkoutEvents?.filter(e => e.event_type === "pix_generated").length || 0;

  const funnelData = [
    { name: "PageView", value: pageViews, fill: "#3b82f6" },
    { name: "ViewContent", value: viewContent, fill: "#6366f1" },
    { name: "InitiateCheckout", value: initiateCheckout, fill: "#d4a853" },
    { name: "PIX Gerado", value: pixGenerated, fill: "#f59e0b" },
    { name: "Purchase", value: purchases, fill: "#22c55e" },
  ];

  const cards = [
    { label: "PageViews", value: pageViews, color: "text-blue-400" },
    { label: "ViewContent", value: viewContent, color: "text-indigo-400" },
    { label: "InitiateCheckout", value: initiateCheckout, color: "text-[#d4a853]" },
    { label: "PIX Gerado", value: pixGenerated, color: "text-amber-400" },
    { label: "Compras", value: purchases, color: "text-green-400" },
    { label: "Receita Total", value: `R$ ${totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, color: "text-green-400" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {cards.map(c => (
          <div key={c.label} className="bg-[#0f1d32] border border-[#1a2d4a] rounded-xl p-4">
            <p className="text-white/50 text-xs mb-1">{c.label}</p>
            <p className={`text-xl font-bold ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#0f1d32] border border-[#1a2d4a] rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4">Funil de Conversão</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={funnelData} layout="vertical">
            <XAxis type="number" stroke="#ffffff30" />
            <YAxis dataKey="name" type="category" stroke="#ffffff50" width={120} />
            <Tooltip contentStyle={{ background: "#0f1d32", border: "1px solid #1a2d4a", color: "#fff" }} />
            <Bar dataKey="value" radius={[0, 6, 6, 0]}>
              {funnelData.map((entry, i) => (
                <rect key={i} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
