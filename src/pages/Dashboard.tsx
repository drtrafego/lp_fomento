import { useState } from "react";
import { useDashboardAuth } from "@/hooks/useDashboardAuth";
import DashboardLogin from "@/components/dashboard/DashboardLogin";
import DateFilter, { type DateRange } from "@/components/dashboard/DateFilter";
import { lazy, Suspense } from "react";

const OverviewTab = lazy(() => import("@/components/dashboard/OverviewTab"));
const TrafficTab = lazy(() => import("@/components/dashboard/TrafficTab"));
const CheckoutTab = lazy(() => import("@/components/dashboard/CheckoutTab"));
const BehaviorTab = lazy(() => import("@/components/dashboard/BehaviorTab"));
const HeatmapTab = lazy(() => import("@/components/dashboard/HeatmapTab"));
const SeoTab = lazy(() => import("@/components/dashboard/SeoTab"));
const ClicksTab = lazy(() => import("@/components/dashboard/ClicksTab"));

const TABS = [
  { id: "overview", label: "Visão Geral" },
  { id: "traffic", label: "Tráfego" },
  { id: "checkout", label: "Checkout/Vendas" },
  { id: "clicks", label: "Cliques & Botões" },
  { id: "behavior", label: "Comportamento" },
  { id: "heatmap", label: "Mapa de Calor" },
  { id: "seo", label: "SEO & Localização" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function Dashboard() {
  const { user, loading, authorized, signIn, signOut } = useDashboardAuth();
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [dateRange, setDateRange] = useState<DateRange>("all");

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#d4a853] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <DashboardLogin onSignIn={signIn} />;
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center px-4">
        <div className="bg-[#0f1d32] border border-red-500/30 rounded-2xl p-8 max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m2-10V7a4 4 0 00-8 0v4m12 0H4a1 1 0 00-1 1v6a1 1 0 001 1h16a1 1 0 001-1v-6a1 1 0 00-1-1z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white">Acesso Negado</h2>
          <p className="text-white/50 text-sm">O email <span className="text-white/80">{user.email}</span> não está autorizado a acessar o dashboard.</p>
          <button onClick={signOut} className="text-[#d4a853] hover:underline text-sm">Sair e tentar outra conta</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a1628] text-white">
      {/* Header */}
      <header className="border-b border-[#1a2d4a] px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-lg font-bold">📊 Dashboard de Métricas</h1>
          <div className="flex items-center gap-4">
            <span className="text-white/40 text-sm hidden sm:block">{user.email}</span>
            <button onClick={signOut} className="text-white/50 hover:text-white text-sm transition-colors">Sair</button>
          </div>
        </div>
      </header>

      {/* Tabs + Date Filter */}
      <nav className="border-b border-[#1a2d4a] px-4 overflow-x-auto">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex gap-1">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? "border-[#d4a853] text-[#d4a853]"
                    : "border-transparent text-white/50 hover:text-white/80"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex-shrink-0 py-2">
            <DateFilter value={dateRange} onChange={setDateRange} />
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Suspense fallback={<div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-[#d4a853] border-t-transparent rounded-full animate-spin" /></div>}>
          {activeTab === "overview" && <OverviewTab dateRange={dateRange} />}
          {activeTab === "traffic" && <TrafficTab dateRange={dateRange} />}
          {activeTab === "checkout" && <CheckoutTab dateRange={dateRange} />}
          {activeTab === "behavior" && <BehaviorTab dateRange={dateRange} />}
          {activeTab === "heatmap" && <HeatmapTab dateRange={dateRange} />}
          {activeTab === "seo" && <SeoTab dateRange={dateRange} />}
        </Suspense>
      </main>
    </div>
  );
}
