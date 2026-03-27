import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { type DateRange, getDateFrom } from "./DateFilter";
import { filterRealCheckouts } from "./filterTestData";

interface Props { dateRange: DateRange; }

export default function CheckoutTab({ dateRange }: Props) {
  const dateFrom = getDateFrom(dateRange);

  const { data: events } = useQuery({
    queryKey: ["checkout-events", dateRange],
    queryFn: async () => {
      let q = supabase.from("checkout_events").select("*");
      if (dateFrom) q = q.gte("created_at", dateFrom);
      const { data } = await q;
      return data || [];
    },
  });

  const purchases = events?.filter(e => e.event_type === "purchase") || [];
  const pixGenerated = events?.filter(e => e.event_type === "pix_generated") || [];
  const awaitingPayment = events?.filter(e => e.event_type === "awaiting_payment") || [];
  const subscriptions = events?.filter(e => e.event_type?.startsWith("subscription_")) || [];
  const totalRevenue = purchases.reduce((s, e) => s + (e.amount || 0), 0);
  const avgTicket = purchases.length > 0 ? totalRevenue / purchases.length : 0;

  const dayMap = new Map<string, number>();
  purchases.forEach(e => {
    const day = e.created_at.substring(0, 10);
    dayMap.set(day, (dayMap.get(day) || 0) + (e.amount || 0));
  });
  const dailyRevenue = Array.from(dayMap.entries())
    .map(([day, revenue]) => ({ day, revenue }))
    .sort((a, b) => a.day.localeCompare(b.day));

  const typeMap = new Map<string, number>();
  events?.forEach(e => {
    typeMap.set(e.event_type, (typeMap.get(e.event_type) || 0) + 1);
  });
  const typeData = Array.from(typeMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const cards = [
    { label: "PIX Gerados", value: pixGenerated.length, color: "text-amber-400" },
    { label: "Compras", value: purchases.length, color: "text-green-400" },
    { label: "Receita Total", value: `R$ ${totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, color: "text-green-400" },
    { label: "Ticket Médio", value: `R$ ${avgTicket.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, color: "text-blue-400" },
    { label: "Aguardando Pgto", value: awaitingPayment.length, color: "text-yellow-400" },
    { label: "Assinaturas", value: subscriptions.length, color: "text-indigo-400" },
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#0f1d32] border border-[#1a2d4a] rounded-xl p-6">
          <h3 className="text-white font-semibold mb-4">Receita por Dia</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyRevenue}>
              <XAxis dataKey="day" stroke="#ffffff30" tick={{ fill: "#ffffff60", fontSize: 11 }} />
              <YAxis stroke="#ffffff30" />
              <Tooltip contentStyle={{ background: "#0f1d32", border: "1px solid #1a2d4a", color: "#fff" }} formatter={(v: number) => `R$ ${v.toLocaleString("pt-BR")}`} />
              <Bar dataKey="revenue" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#0f1d32] border border-[#1a2d4a] rounded-xl p-6">
          <h3 className="text-white font-semibold mb-4">Tipos de Evento</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={typeData} layout="vertical">
              <XAxis type="number" stroke="#ffffff30" />
              <YAxis dataKey="name" type="category" stroke="#ffffff50" width={140} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#0f1d32", border: "1px solid #1a2d4a", color: "#fff" }} />
              <Bar dataKey="count" fill="#d4a853" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-[#0f1d32] border border-[#1a2d4a] rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4">Últimos Eventos</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-white/50 border-b border-[#1a2d4a]">
                <th className="py-2 pr-4">Data</th>
                <th className="py-2 pr-4">Tipo</th>
                <th className="py-2 pr-4">Cliente</th>
                <th className="py-2 pr-4">Valor</th>
                <th className="py-2">Pagamento</th>
              </tr>
            </thead>
            <tbody>
              {events?.slice(0, 20).map(e => (
                <tr key={e.id} className="border-b border-[#1a2d4a]/50 text-white/80">
                  <td className="py-2 pr-4 text-xs">{new Date(e.created_at).toLocaleString("pt-BR")}</td>
                  <td className="py-2 pr-4">
                    <span className={`px-2 py-0.5 rounded text-xs ${e.event_type === "purchase" ? "bg-green-500/20 text-green-400" : "bg-[#1a2d4a] text-white/60"}`}>
                      {e.event_type}
                    </span>
                  </td>
                  <td className="py-2 pr-4">{e.customer_name || "-"}</td>
                  <td className="py-2 pr-4">{e.amount ? `R$ ${e.amount.toLocaleString("pt-BR")}` : "-"}</td>
                  <td className="py-2">{e.payment_method || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
