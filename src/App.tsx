import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import { lazy, Suspense } from "react";

const Dashboard = lazy(() => import("./pages/Dashboard.tsx"));
const WorkshopMovimento = lazy(() => import("./pages/WorkshopMovimento.tsx"));
const WorkshopClassico = lazy(() => import("./pages/WorkshopClassico.tsx"));
const DiagnosticoMovimento = lazy(() => import("./pages/DiagnosticoMovimento.tsx"));
const DiagnosticoClassico = lazy(() => import("./pages/DiagnosticoClassico.tsx"));
const Quiz = lazy(() => import("./pages/Quiz.tsx"));
const DunasA = lazy(() => import("./pages/DunasA.tsx"));
const DunasB = lazy(() => import("./pages/DunasB.tsx"));
const DunasC = lazy(() => import("./pages/DunasC.tsx"));
const DunasD = lazy(() => import("./pages/DunasD.tsx"));

const pageFallback = <div className="min-h-screen bg-[#0a1628]" />;

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/27" element={<Index />} />
          <Route path="/workshop-movimento" element={<Suspense fallback={pageFallback}><WorkshopMovimento /></Suspense>} />
          <Route path="/workshop-classico" element={<Suspense fallback={pageFallback}><WorkshopClassico /></Suspense>} />
          <Route path="/diagnostico-movimento" element={<Suspense fallback={pageFallback}><DiagnosticoMovimento /></Suspense>} />
          <Route path="/diagnostico-classico" element={<Suspense fallback={pageFallback}><DiagnosticoClassico /></Suspense>} />
          <Route path="/quiz" element={<Suspense fallback={pageFallback}><Quiz /></Suspense>} />
          <Route path="/dunas" element={<Navigate to="/dunas-a" replace />} />
          <Route path="/dunas-a" element={<Suspense fallback={pageFallback}><DunasA /></Suspense>} />
          <Route path="/dunas-b" element={<Suspense fallback={pageFallback}><DunasB /></Suspense>} />
          <Route path="/dunas-c" element={<Suspense fallback={pageFallback}><DunasC /></Suspense>} />
          <Route path="/dunas-d" element={<Suspense fallback={pageFallback}><DunasD /></Suspense>} />
          <Route path="/dashboard" element={<Suspense fallback={pageFallback}><Dashboard /></Suspense>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
