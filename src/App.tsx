import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { MarketplaceDashboard } from "@/components/marketplace/MarketplaceDashboard";
import { InfiniteMemoryProvider } from "@/contexts/InfiniteMemoryContext";
import { InfiniteMemoryDashboard } from "@/components/infinite-memory/InfiniteMemoryDashboard";
import { InfiniteMemoryDemo } from "@/components/infinite-memory/InfiniteMemoryDemo";
import { MLPredictionsDashboard } from "@/components/ml-predictions/MLPredictionsDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <InfiniteMemoryProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/marketplace" element={<MarketplaceDashboard />} />
            <Route path="/infinite-memory" element={<InfiniteMemoryDashboard />} />
            <Route path="/infinite-memory-demo" element={<InfiniteMemoryDemo />} />
            <Route path="/ml-predictions" element={<MLPredictionsDashboard />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </InfiniteMemoryProvider>
  </QueryClientProvider>
);

export default App;
