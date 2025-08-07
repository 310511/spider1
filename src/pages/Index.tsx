import { Header } from "@/components/layout/Header";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { InventoryTable } from "@/components/dashboard/InventoryTable";
import { BlockchainActivity } from "@/components/dashboard/BlockchainActivity";
import { AlertsPanel } from "@/components/dashboard/AlertsPanel";
import heroImage from "@/assets/medical-hero.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/5 via-background to-primary-glow/5 border-b">
        <div className="container mx-auto px-6 py-12">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
                Blockchain-Powered
                <span className="text-primary block">Medical Inventory</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-6">
                Secure, transparent, and automated inventory management for healthcare facilities. 
                Every transaction recorded on the blockchain for complete audit trails.
              </p>
              <div className="flex gap-3">
                <div className="flex items-center gap-2 px-3 py-2 bg-success/10 text-success rounded-lg border border-success/20">
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Blockchain Connected</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 text-primary rounded-lg border border-primary/20">
                  <span className="text-sm font-medium">1,247 Items Tracked</span>
                </div>
              </div>
            </div>
            <div className="lg:justify-self-end">
              <img 
                src={heroImage} 
                alt="Medical inventory management dashboard" 
                className="rounded-2xl shadow-elegant max-w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Dashboard */}
      <main className="container mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Stats Overview */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-6">Dashboard Overview</h2>
            <StatsGrid />
          </section>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Inventory & Alerts */}
            <div className="lg:col-span-2 space-y-8">
              <InventoryTable />
            </div>
            
            {/* Right Column - Activity & Alerts */}
            <div className="space-y-8">
              <AlertsPanel />
              <BlockchainActivity />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;