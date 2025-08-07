import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { 
  Search, 
  Filter, 
  ShoppingCart, 
  Package, 
  Users, 
  TrendingUp,
  Wallet,
  Shield,
  AlertCircle,
  Plus,
  Eye,
  Star,
  Truck,
  CheckCircle,
  Clock,
  X,
  Store,
  RefreshCw,
  Bug
} from "lucide-react";
import { useBlockchain } from "@/contexts/BlockchainContext";
import { ProductListing, Order } from "@/contexts/BlockchainContext";
import { MetaMaskGuide } from "@/components/ui/metamask-guide";
import { WalletDebug } from "@/components/ui/wallet-debug";

interface MarketplaceStats {
  totalProducts: number;
  activeSuppliers: number;
  totalTransactions: number;
  blockchainVerified: number;
  totalRevenue: number;
  averageRating: number;
}

export const MarketplaceDashboard: React.FC = () => {
  const { 
    address, 
    connectWallet, 
    disconnectWallet, 
    refreshWalletConnection,
    isLoading,
    purchaseProduct, 
    getProductListings, 
    getUserOrders,
    createProductListing,
    addAppNotification 
  } = useBlockchain();

  const [products, setProducts] = useState<ProductListing[]>([]);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [stats, setStats] = useState<MarketplaceStats>({
    totalProducts: 0,
    activeSuppliers: 0,
    totalTransactions: 0,
    blockchainVerified: 0,
    totalRevenue: 0,
    averageRating: 0
  });
  const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductListing | null>(null);
  const [purchaseQuantity, setPurchaseQuantity] = useState(1);
  const [isPurchaseLoading, setIsPurchaseLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("marketplace");
  const [showMetaMaskGuide, setShowMetaMaskGuide] = useState(false);
  const [showWalletDebug, setShowWalletDebug] = useState(false);

  const categories = ["all", "Antibiotics", "Consumables", "Equipment", "Diabetes Care", "Pain Management", "Cardiovascular", "Respiratory"];

  // Load marketplace data
  useEffect(() => {
    loadMarketplaceData();
  }, []);

  const loadMarketplaceData = async () => {
    try {
      const productListings = await getProductListings();
      setProducts(productListings);
      
      if (address) {
        const orders = await getUserOrders(address);
        setUserOrders(orders);
      }

      // Calculate stats
      const verifiedProducts = productListings.filter(p => p.blockchainVerified).length;
      const totalRevenue = productListings.reduce((sum, p) => sum + p.price * p.inventoryLevel, 0);
      const avgRating = productListings.length > 0 
        ? productListings.reduce((sum, p) => sum + (p.rating || 0), 0) / productListings.length 
        : 0;

      setStats({
        totalProducts: productListings.length,
        activeSuppliers: new Set(productListings.map(p => p.supplier)).size,
        totalTransactions: userOrders.length,
        blockchainVerified: verifiedProducts,
        totalRevenue,
        averageRating: avgRating
      });
    } catch (error) {
      console.error("Error loading marketplace data:", error);
      addAppNotification("Failed to load marketplace data", "error");
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handlePurchase = async (product: ProductListing) => {
    setSelectedProduct(product);
    setPurchaseQuantity(1);
    setIsPurchaseDialogOpen(true);
  };

  const handleConfirmPurchase = async () => {
    if (!selectedProduct || !address) return;

    setIsPurchaseLoading(true);
    try {
      const success = await purchaseProduct(selectedProduct.id, purchaseQuantity);
      if (success) {
        setIsPurchaseDialogOpen(false);
        setSelectedProduct(null);
        loadMarketplaceData(); // Refresh data
        addAppNotification("Purchase completed successfully!", "success");
      }
    } catch (error) {
      console.error("Purchase error:", error);
      addAppNotification("Failed to complete purchase", "error");
    } finally {
      setIsPurchaseLoading(false);
    }
  };

  const getOrderStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'shipped': return <Truck className="h-4 w-4 text-blue-600" />;
      case 'delivered': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleConnectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      setShowMetaMaskGuide(true);
      return;
    }
    await connectWallet();
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
              <Link to="/supplier">
                <Button variant="outline" size="sm">
                  <Store className="h-4 w-4 mr-2" />
                  Supplier Dashboard
                </Button>
              </Link>
              
              {address ? (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <Wallet className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {address.substring(0, 6)}...{address.substring(-4)}
                  </span>
                  <Button variant="outline" size="sm" onClick={disconnectWallet}>
                    Disconnect
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={handleConnectWallet} variant="outline" disabled={isLoading}>
                    <Wallet className="h-4 w-4 mr-2" />
                    {isLoading ? "Connecting..." : "Connect Wallet"}
                  </Button>
                  <Button 
                    onClick={refreshWalletConnection} 
                    variant="ghost" 
                    size="sm"
                    disabled={isLoading}
                    title="Refresh connection"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button 
                    onClick={() => setShowWalletDebug(true)} 
                    variant="ghost" 
                    size="sm"
                    title="Debug wallet connection"
                  >
                    <Bug className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Products</p>
                  <p className="text-2xl font-bold">{stats.totalProducts}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Suppliers</p>
                  <p className="text-2xl font-bold">{stats.activeSuppliers}</p>
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
                  <p className="text-2xl font-bold">{stats.totalTransactions}</p>
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
                  <p className="text-2xl font-bold">{stats.blockchainVerified}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Revenue</p>
                  <p className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Avg Rating</p>
                  <p className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
            <TabsTrigger value="orders">My Orders</TabsTrigger>
          </TabsList>

          <TabsContent value="marketplace" className="space-y-6">
            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4">
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
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category === "all" ? "All Categories" : category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
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
                          <Star className="h-3 w-3 text-yellow-500" />
                          <span className="text-xs">{product.rating || 0}</span>
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
                          onClick={() => handlePurchase(product)}
                          disabled={!address}
                        >
                          <ShoppingCart className="h-4 w-4 mr-1" />
                          Buy Now
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
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
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            {!address ? (
              <div className="text-center py-12">
                <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Connect Wallet</h3>
                <p className="text-muted-foreground mb-4">Connect your wallet to view your orders</p>
                <Button onClick={handleConnectWallet}>
                  <Wallet className="h-4 w-4 mr-2" />
                  Connect Wallet
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {userOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
                    <p className="text-muted-foreground">Start shopping to see your orders here</p>
                  </div>
                ) : (
                  userOrders.map((order) => (
                    <Card key={order.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              {getOrderStatusIcon(order.status)}
                              <div>
                                <h4 className="font-semibold">Order #{order.id}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(order.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="font-semibold">${order.totalPrice}</p>
                              <p className="text-sm text-muted-foreground">
                                Qty: {order.quantity}
                              </p>
                            </div>
                            
                            <Badge className={getOrderStatusColor(order.status)}>
                              {order.status}
                            </Badge>
                          </div>
                        </div>
                        
                        {order.transactionHash && (
                          <div className="mt-2 text-xs text-muted-foreground">
                            TX: {order.transactionHash.substring(0, 10)}...
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Purchase Dialog */}
      <Dialog open={isPurchaseDialogOpen} onOpenChange={setIsPurchaseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Purchase Product</DialogTitle>
          </DialogHeader>
          
          {selectedProduct && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <img
                  src={selectedProduct.imageUrl}
                  alt={selectedProduct.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div>
                  <h3 className="font-semibold">{selectedProduct.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedProduct.supplier}</p>
                  <p className="text-lg font-bold">${selectedProduct.price}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max={selectedProduct.inventoryLevel}
                  value={purchaseQuantity}
                  onChange={(e) => setPurchaseQuantity(parseInt(e.target.value) || 1)}
                />
                <p className="text-sm text-muted-foreground">
                  Available: {selectedProduct.inventoryLevel} units
                </p>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <span className="font-semibold">Total:</span>
                <span className="font-bold text-lg">
                  ${(selectedProduct.price * purchaseQuantity).toFixed(2)}
                </span>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsPurchaseDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleConfirmPurchase}
                  disabled={isPurchaseLoading || !address}
                  className="flex-1"
                >
                  {isPurchaseLoading ? "Processing..." : "Confirm Purchase"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Blockchain Status Alert */}
      {!address && (
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

      {/* MetaMask Guide */}
      {showMetaMaskGuide && (
        <MetaMaskGuide onClose={() => setShowMetaMaskGuide(false)} />
      )}

      {/* Wallet Debug */}
      {showWalletDebug && (
        <WalletDebug onClose={() => setShowWalletDebug(false)} />
      )}
    </div>
  );
}; 