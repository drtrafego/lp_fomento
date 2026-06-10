import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
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
          <Route path="/dashboard" element={<Suspense fallback={pageFallback}><Dashboard /></Suspense>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
