import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Filter, 
  ShoppingCart, 
  Package, 
  Users, 
  TrendingUp,
  Wallet,
  Shield,
  AlertCircle
} from "lucide-react";

// Mock data for demonstration
const mockProducts = [
  {
    id: "1",
    name: "Amoxicillin 500mg",
    description: "Broad-spectrum antibiotic for bacterial infections",
    price: 45.99,
    supplier: "PharmaCorp",
    category: "Antibiotics",
    imageUrl: "https://via.placeholder.com/150",
    blockchainVerified: true,
    inventoryLevel: 150,
    rating: 4.5
  },
  {
    id: "2",
    name: "Surgical Gloves (Box of 100)",
    description: "Latex-free surgical gloves for medical procedures",
    price: 23.50,
    supplier: "MedSupply Co",
    category: "Consumables",
    imageUrl: "https://via.placeholder.com/150",
    blockchainVerified: true,
    inventoryLevel: 75,
    rating: 4.8
  },
  {
    id: "3",
    name: "Blood Pressure Monitor",
    description: "Digital automatic blood pressure monitor",
    price: 129.99,
    supplier: "TechMed Solutions",
    category: "Equipment",
    imageUrl: "https://via.placeholder.com/150",
    blockchainVerified: true,
    inventoryLevel: 12,
    rating: 4.6
  },
  {
    id: "4",
    name: "Insulin Pens",
    description: "Disposable insulin delivery pens",
    price: 89.99,
    supplier: "DiabetesCare Ltd",
    category: "Diabetes Care",
    imageUrl: "https://via.placeholder.com/150",
    blockchainVerified: false,
    inventoryLevel: 8,
    rating: 4.3
  }
];

const mockStats = {
  totalProducts: 1247,
  activeSuppliers: 89,
  totalTransactions: 15420,
  blockchainVerified: 1189
};

interface MarketplaceDashboardProps {
  userRole?: 'provider' | 'supplier' | 'admin';
  walletAddress?: string;
}

export const MarketplaceDashboard: React.FC<MarketplaceDashboardProps> = ({
  userRole = 'provider',
  walletAddress
}) => {
  const [products, setProducts] = useState(mockProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [walletConnected, setWalletConnected] = useState(false);

  const categories = ["all", "Antibiotics", "Consumables", "Equipment", "Diabetes Care"];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleWalletConnect = () => {
    // TODO: Implement actual wallet connection
    setWalletConnected(true);
  };

  const handlePurchase = (productId: string) => {
    // TODO: Implement blockchain purchase
    console.log(`Purchasing product ${productId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="border-b bg-card shadow-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Shield className="h-8 w-8 text-primary" />
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Medical Supply Marketplace</h1>
                  <p className="text-sm text-muted-foreground">Blockchain-powered procurement</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {walletConnected ? (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <Wallet className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {walletAddress?.substring(0, 6)}...{walletAddress?.substring(-4)}
                  </span>
                </div>
              ) : (
                <Button onClick={handleWalletConnect} variant="outline">
                  <Wallet className="h-4 w-4 mr-2" />
                  Connect Wallet
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Products</p>
                  <p className="text-2xl font-bold">{mockStats.totalProducts}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Active Suppliers</p>
                  <p className="text-2xl font-bold">{mockStats.activeSuppliers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Transactions</p>
                  <p className="text-2xl font-bold">{mockStats.totalTransactions}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Verified</p>
                  <p className="text-2xl font-bold">{mockStats.blockchainVerified}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search medical supplies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-background"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === "all" ? "All Categories" : category}
                </option>
              ))}
            </select>
            
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="aspect-square bg-muted rounded-lg mb-4 flex items-center justify-center">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-sm line-clamp-2">{product.name}</h3>
                    {product.blockchainVerified && (
                      <Badge variant="secondary" className="text-xs">
                        <Shield className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {product.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-lg">${product.price}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground">★</span>
                      <span className="text-xs">{product.rating}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{product.supplier}</span>
                    <span>{product.inventoryLevel} in stock</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handlePurchase(product.id)}
                      disabled={!walletConnected}
                    >
                      <ShoppingCart className="h-4 w-4 mr-1" />
                      Buy Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>

      {/* Blockchain Status Alert */}
      {!walletConnected && (
        <div className="fixed bottom-4 right-4">
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-yellow-800">
                  Connect your wallet to make purchases
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}; 