import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { MarketplaceDashboard } from "@/components/marketplace/MarketplaceDashboard";
import { SupplierDashboard } from "@/components/marketplace/SupplierDashboard";
import { InfiniteMemoryProvider } from "@/contexts/InfiniteMemoryContext";
import { BlockchainProvider } from "@/contexts/BlockchainContext";
import { InventoryProvider } from "@/contexts/InventoryContext";
import { InfiniteMemoryDashboard } from "@/components/infinite-memory/InfiniteMemoryDashboard";
import { InfiniteMemoryDemo } from "@/components/infinite-memory/InfiniteMemoryDemo";
import { MLPredictionsDashboard } from "@/components/ml-predictions/MLPredictionsDashboard";
import { MedicineRecommendationDashboard } from "@/components/medicine-recommendation/MedicineRecommendationDashboard";
import InventoryDashboard from "@/components/inventory/InventoryDashboard";
import { Notifications } from "@/components/ui/notifications";
import { useBlockchain } from "@/contexts/BlockchainContext";

const queryClient = new QueryClient();

const AppContent = () => {
  const { appNotifications, addAppNotification } = useBlockchain();

  const handleRemoveNotification = (id: string) => {
    // The notification will be automatically removed by the context
    // This is just for manual removal if needed
  };

  return (
    <>
      <Notifications 
        notifications={appNotifications} 
        onRemove={handleRemoveNotification} 
      />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/marketplace" element={<MarketplaceDashboard />} />
        <Route path="/supplier" element={<SupplierDashboard />} />
        <Route path="/infinite-memory" element={<InfiniteMemoryDashboard />} />
        <Route path="/infinite-memory-demo" element={<InfiniteMemoryDemo />} />
        <Route path="/ml-predictions" element={<MLPredictionsDashboard />} />
        <Route path="/medicine-recommendation" element={<MedicineRecommendationDashboard />} />
        <Route path="/inventory" element={<InventoryDashboard />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BlockchainProvider>
      <InventoryProvider>
        <InfiniteMemoryProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppContent />
            </BrowserRouter>
          </TooltipProvider>
        </InfiniteMemoryProvider>
      </InventoryProvider>
    </BlockchainProvider>
  </QueryClientProvider>
);

export default App;
