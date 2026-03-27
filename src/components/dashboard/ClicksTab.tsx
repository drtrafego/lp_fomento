import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { type DateRange, getDateFrom } from "./DateFilter";
import { useMemo } from "react";
import { filterRealCheckouts } from "./filterTestData";

interface Props {
  dateRange: DateRange;
}

const CTA_PATTERNS = [
  "button:", "a:GARANTIR", "a:QUERO", "a:COMPRAR", "a:INGRESSO",
  "button:GARANTIR", "button:QUERO", "button:COMPRAR", "button:INGRESSO",
  "a:Garantir", "a:Quero", "a:Comprar",
];

const VIDEO_PATTERNS = ["video", "play", "depoimento", "prova", "assistir"];

function isCta(target: string | null): boolean {
  if (!target) return false;
  const t = target.toLowerCase();
  if (t.startsWith("button:") || t.startsWith("a:")) return true;
  return CTA_PATTERNS.some(p => t.includes(p.toLowerCase()));
}

function isVideoRelated(target: string | null): boolean {
  if (!target) return false;
  const t = target.toLowerCase();
  return VIDEO_PATTERNS.some(p => t.includes(p));
}

function extractLabel(target: string): string {
  const parts = target.split(":");
  return parts.length > 1 ? parts.slice(1).join(":").trim().slice(0, 40) : target.slice(0, 40);
}

// Hero button was removed ~2025-03-20 (approximate)
const HERO_REMOVAL_DATE = "2025-03-20T00:00:00Z";

const SECTION_COLORS = ["#3b82f6", "#6366f1", "#d4a853", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

export default function ClicksTab({ dateRange }: Props) {
  const dateFrom = getDateFrom(dateRange);

  const { data: clicks, isLoading: loadingClicks } = useQuery({
    queryKey: ["clicks-all", dateRange],
    queryFn: async () => {
      let q = supabase.from("page_analytics").select("click_target, section_name, created_at, session_id").eq("event_type", "click");
      if (dateFrom) q = q.gte("created_at", dateFrom);
      const { data } = await q.order("created_at", { ascending: false }).limit(1000);
      return data || [];
    },
  });

  const { data: checkouts } = useQuery({
    queryKey: ["clicks-checkouts", dateRange],
    queryFn: async () => {
      let q = supabase.from("checkout_events").select("event_type, amount, created_at");
      if (dateFrom) q = q.gte("created_at", dateFrom);
      const { data } = await q;
      return data || [];
    },
  });

  const { data: scrollData } = useQuery({
    queryKey: ["clicks-scroll", dateRange],
    queryFn: async () => {
      let q = supabase.from("page_analytics").select("scroll_percent, created_at, session_id").eq("event_type", "scroll");
      if (dateFrom) q = q.gte("created_at", dateFrom);
      const { data } = await q.limit(1000);
      return data || [];
    },
  });

  const analysis = useMemo(() => {
    if (!clicks) return null;

    const ctaClicks = clicks.filter(c => isCta(c.click_target));
    const totalCtaClicks = ctaClicks.length;

    const totalCheckouts = checkouts?.filter(e => ["checkout", "pix_generated"].includes(e.event_type)).length || 0;
    const totalPurchases = checkouts?.filter(e => e.event_type === "purchase").length || 0;

    const clickToCheckoutRate = totalCtaClicks > 0 ? ((totalCheckouts / totalCtaClicks) * 100).toFixed(1) : "0";
    const clickToPurchaseRate = totalCtaClicks > 0 ? ((totalPurchases / totalCtaClicks) * 100).toFixed(1) : "0";

    // Button ranking
    const buttonMap = new Map<string, { count: number; section: string | null }>();
    ctaClicks.forEach(c => {
      const key = c.click_target || "unknown";
      const existing = buttonMap.get(key);
      if (existing) {
        existing.count++;
      } else {
        buttonMap.set(key, { count: 1, section: c.section_name });
      }
    });

    const buttonRanking = Array.from(buttonMap.entries())
      .map(([target, info]) => ({
        target,
        label: extractLabel(target),
        section: info.section || "—",
        count: info.count,
        pct: totalCtaClicks > 0 ? ((info.count / totalCtaClicks) * 100).toFixed(1) : "0",
      }))
      .sort((a, b) => b.count - a.count);

    const topButton = buttonRanking[0] || null;

    // Clicks per section
    const sectionMap = new Map<string, number>();
    clicks.forEach(c => {
      const section = c.section_name || "Sem seção";
      sectionMap.set(section, (sectionMap.get(section) || 0) + 1);
    });
    const sectionData = Array.from(sectionMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // Video / social proof
    const videoClicks = clicks.filter(c => isVideoRelated(c.click_target));
    const videoTotal = videoClicks.length;
    const videoBySection = new Map<string, number>();
    videoClicks.forEach(c => {
      const s = c.section_name || "Sem seção";
      videoBySection.set(s, (videoBySection.get(s) || 0) + 1);
    });
    const videoData = Array.from(videoBySection.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // Hero analysis (before/after removal)
    const clicksBefore = clicks.filter(c => c.created_at < HERO_REMOVAL_DATE);
    const clicksAfter = clicks.filter(c => c.created_at >= HERO_REMOVAL_DATE);
    const checkoutsBefore = checkouts?.filter(e => e.created_at < HERO_REMOVAL_DATE) || [];
    const checkoutsAfter = checkouts?.filter(e => e.created_at >= HERO_REMOVAL_DATE) || [];
    const scrollBefore = scrollData?.filter(s => s.created_at < HERO_REMOVAL_DATE) || [];
    const scrollAfter = scrollData?.filter(s => s.created_at >= HERO_REMOVAL_DATE) || [];

    const sessionsBefore = new Set(clicksBefore.map(c => c.session_id)).size || 1;
    const sessionsAfter = new Set(clicksAfter.map(c => c.session_id)).size || 1;

    const purchasesBefore = checkoutsBefore.filter(e => e.event_type === "purchase").length;
    const purchasesAfter = checkoutsAfter.filter(e => e.event_type === "purchase").length;

    const convBefore = ((purchasesBefore / sessionsBefore) * 100).toFixed(1);
    const convAfter = ((purchasesAfter / sessionsAfter) * 100).toFixed(1);

    const avgScrollBefore = scrollBefore.length > 0
      ? Math.round(scrollBefore.reduce((s, e) => s + (e.scroll_percent || 0), 0) / scrollBefore.length)
      : 0;
    const avgScrollAfter = scrollAfter.length > 0
      ? Math.round(scrollAfter.reduce((s, e) => s + (e.scroll_percent || 0), 0) / scrollAfter.length)
      : 0;

    const heroAnalysis = {
      before: { sessions: sessionsBefore, purchases: purchasesBefore, convRate: convBefore, avgScroll: avgScrollBefore },
      after: { sessions: sessionsAfter, purchases: purchasesAfter, convRate: convAfter, avgScroll: avgScrollAfter },
      improved: parseFloat(convAfter) >= parseFloat(convBefore),
    };

    // Funnel per top buttons
    const topButtons = buttonRanking.slice(0, 5);

    return {
      totalCtaClicks,
      clickToCheckoutRate,
      clickToPurchaseRate,
      topButton,
      buttonRanking,
      sectionData,
      videoTotal,
      videoData,
      heroAnalysis,
      topButtons,
      totalCheckouts,
      totalPurchases,
    };
  }, [clicks, checkouts, scrollData]);

  if (loadingClicks) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-6 h-6 border-2 border-[#d4a853] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total Cliques CTAs" value={analysis.totalCtaClicks} color="text-blue-400" />
        <MetricCard label="Clique → Checkout" value={`${analysis.clickToCheckoutRate}%`} color="text-[#d4a853]" />
        <MetricCard label="Clique → Compra" value={`${analysis.clickToPurchaseRate}%`} color="text-green-400" />
        <MetricCard
          label="Botão Top"
          value={analysis.topButton ? analysis.topButton.label.slice(0, 20) : "—"}
          subtitle={analysis.topButton ? `${analysis.topButton.count} cliques` : undefined}
          color="text-purple-400"
        />
      </div>

      {/* Button Ranking */}
      <div className="bg-[#0f1d32] border border-[#1a2d4a] rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-4">🏆 Ranking de Botões</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-white/40 border-b border-[#1a2d4a]">
                <th className="text-left py-2 pr-4">#</th>
                <th className="text-left py-2 pr-4">Botão</th>
                <th className="text-left py-2 pr-4">Seção</th>
                <th className="text-right py-2 pr-4">Cliques</th>
                <th className="text-right py-2">% Total</th>
              </tr>
            </thead>
            <tbody>
              {analysis.buttonRanking.slice(0, 10).map((btn, i) => (
                <tr key={btn.target} className="border-b border-[#1a2d4a]/50">
                  <td className="py-2 pr-4 text-white/30">{i + 1}</td>
                  <td className="py-2 pr-4 text-white/90 font-medium max-w-[200px] truncate">{btn.label}</td>
                  <td className="py-2 pr-4 text-white/50">{btn.section}</td>
                  <td className="py-2 pr-4 text-right text-[#d4a853] font-mono">{btn.count}</td>
                  <td className="py-2 text-right text-white/50">{btn.pct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hero Before/After Analysis */}
      <div className="bg-[#0f1d32] border border-[#1a2d4a] rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-4">🔬 Hero: Com Botão vs Sem Botão</h3>
        <p className="text-white/40 text-xs mb-4">
          Comparação antes e depois da remoção do botão na primeira dobra (~20/03/2025)
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[#0a1628] rounded-xl p-4 border border-[#1a2d4a]">
            <div className="text-white/50 text-xs mb-2">COM botão (antes)</div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-white/60 text-sm">Sessões</span>
                <span className="text-white font-mono">{analysis.heroAnalysis.before.sessions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60 text-sm">Compras</span>
                <span className="text-white font-mono">{analysis.heroAnalysis.before.purchases}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60 text-sm">Taxa Conversão</span>
                <span className="text-[#d4a853] font-mono">{analysis.heroAnalysis.before.convRate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60 text-sm">Scroll Médio</span>
                <span className="text-white font-mono">{analysis.heroAnalysis.before.avgScroll}%</span>
              </div>
            </div>
          </div>
          <div className="bg-[#0a1628] rounded-xl p-4 border border-[#1a2d4a]">
            <div className="text-white/50 text-xs mb-2">SEM botão (depois)</div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-white/60 text-sm">Sessões</span>
                <span className="text-white font-mono">{analysis.heroAnalysis.after.sessions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60 text-sm">Compras</span>
                <span className="text-white font-mono">{analysis.heroAnalysis.after.purchases}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60 text-sm">Taxa Conversão</span>
                <span className="text-[#d4a853] font-mono">{analysis.heroAnalysis.after.convRate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60 text-sm">Scroll Médio</span>
                <span className="text-white font-mono">{analysis.heroAnalysis.after.avgScroll}%</span>
              </div>
            </div>
          </div>
        </div>
        <div className={`mt-4 text-center py-2 rounded-lg text-sm font-medium ${
          analysis.heroAnalysis.improved
            ? "bg-green-500/10 text-green-400 border border-green-500/20"
            : "bg-red-500/10 text-red-400 border border-red-500/20"
        }`}>
          {analysis.heroAnalysis.improved
            ? "✅ Remover o botão da hero parece ter melhorado (ou mantido) a conversão"
            : "⚠️ A conversão caiu após remover o botão da hero"}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Clicks per Section */}
        <div className="bg-[#0f1d32] border border-[#1a2d4a] rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-4">📍 Cliques por Seção</h3>
          {analysis.sectionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={Math.max(200, analysis.sectionData.length * 36)}>
              <BarChart data={analysis.sectionData} layout="vertical" margin={{ left: 10, right: 20 }}>
                <XAxis type="number" tick={{ fill: "#ffffff60", fontSize: 11 }} />
                <YAxis type="category" dataKey="name" width={120} tick={{ fill: "#ffffff80", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: "#0f1d32", border: "1px solid #1a2d4a", borderRadius: 8, color: "#fff" }}
                />
                <Bar dataKey="value" name="Cliques" radius={[0, 6, 6, 0]}>
                  {analysis.sectionData.map((_, i) => (
                    <Cell key={i} fill={SECTION_COLORS[i % SECTION_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-white/30 text-sm">Sem dados</p>
          )}
        </div>

        {/* Video / Social Proof */}
        <div className="bg-[#0f1d32] border border-[#1a2d4a] rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-2">🎥 Prova Social / Vídeos</h3>
          <p className="text-white/40 text-xs mb-4">Cliques em elementos de vídeo e depoimentos</p>
          <div className="text-3xl font-bold text-[#d4a853] mb-4">{analysis.videoTotal} <span className="text-sm font-normal text-white/50">cliques</span></div>
          {analysis.videoData.length > 0 ? (
            <ResponsiveContainer width="100%" height={Math.max(120, analysis.videoData.length * 36)}>
              <BarChart data={analysis.videoData} layout="vertical" margin={{ left: 10, right: 20 }}>
                <XAxis type="number" tick={{ fill: "#ffffff60", fontSize: 11 }} />
                <YAxis type="category" dataKey="name" width={120} tick={{ fill: "#ffffff80", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: "#0f1d32", border: "1px solid #1a2d4a", borderRadius: 8, color: "#fff" }}
                />
                <Bar dataKey="value" name="Cliques" fill="#8b5cf6" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-white/30 text-sm">Nenhum clique em vídeo/prova social detectado</p>
          )}
        </div>
      </div>

      {/* Funnel per Button */}
      <div className="bg-[#0f1d32] border border-[#1a2d4a] rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-4">🔄 Funil Geral: Cliques → Checkout → Compra</h3>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-4">
          <FunnelStep label="Cliques CTA" value={analysis.totalCtaClicks} color="bg-blue-500" />
          <FunnelArrow rate={analysis.clickToCheckoutRate} />
          <FunnelStep label="Checkouts" value={analysis.totalCheckouts} color="bg-[#d4a853]" />
          <FunnelArrow rate={analysis.totalCheckouts > 0 ? ((analysis.totalPurchases / analysis.totalCheckouts) * 100).toFixed(1) : "0"} />
          <FunnelStep label="Compras" value={analysis.totalPurchases} color="bg-green-500" />
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, color, subtitle }: { label: string; value: string | number; color: string; subtitle?: string }) {
  return (
    <div className="bg-[#0f1d32] border border-[#1a2d4a] rounded-2xl p-5">
      <div className="text-white/40 text-xs mb-1">{label}</div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      {subtitle && <div className="text-white/30 text-xs mt-1">{subtitle}</div>}
    </div>
  );
}

function FunnelStep({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`w-20 h-20 rounded-full ${color} bg-opacity-20 flex items-center justify-center`}>
        <span className="text-white font-bold text-lg">{value}</span>
      </div>
      <span className="text-white/60 text-xs">{label}</span>
    </div>
  );
}

function FunnelArrow({ rate }: { rate: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-[#d4a853] text-xs font-mono">{rate}%</span>
      <span className="text-white/30">→</span>
    </div>
  );
}
