import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  Package, 
  Users, 
  TrendingUp,
  Wallet,
  Shield,
  Plus,
  Edit,
  Trash2,
  Eye,
  Star,
  Truck,
  CheckCircle,
  Clock,
  DollarSign,
  ShoppingCart
} from "lucide-react";
import { useBlockchain } from "@/contexts/BlockchainContext";
import { ProductListing, Order } from "@/contexts/BlockchainContext";

interface SupplierStats {
  totalProducts: number;
  totalSales: number;
  totalOrders: number;
  averageRating: number;
  revenueThisMonth: number;
  pendingOrders: number;
}

export const SupplierDashboard: React.FC = () => {
  const { 
    address, 
    connectWallet, 
    disconnectWallet, 
    isLoading,
    createProductListing,
    getProductListings,
    getUserOrders,
    addAppNotification 
  } = useBlockchain();

  const [products, setProducts] = useState<ProductListing[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<SupplierStats>({
    totalProducts: 0,
    totalSales: 0,
    totalOrders: 0,
    averageRating: 0,
    revenueThisMonth: 0,
    pendingOrders: 0
  });
  const [isAddProductDialogOpen, setIsAddProductDialogOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    inventoryLevel: "",
    imageUrl: ""
  });
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [activeTab, setActiveTab] = useState("products");

  const categories = [
    "Antibiotics", "Consumables", "Equipment", "Diabetes Care", 
    "Pain Management", "Cardiovascular", "Respiratory", "Other"
  ];

  // Load supplier data
  useEffect(() => {
    if (address) {
      loadSupplierData();
    }
  }, [address]);

  const loadSupplierData = async () => {
    try {
      const allProducts = await getProductListings();
      const supplierProducts = allProducts.filter(p => p.supplier === address);
      setProducts(supplierProducts);

      const allOrders = await getUserOrders(address);
      const supplierOrders = allOrders.filter(o => o.sellerAddress === address);
      setOrders(supplierOrders);

      // Calculate stats
      const totalSales = supplierOrders.reduce((sum, o) => sum + o.totalPrice, 0);
      const pendingOrders = supplierOrders.filter(o => o.status === 'pending').length;
      const avgRating = supplierProducts.length > 0 
        ? supplierProducts.reduce((sum, p) => sum + (p.rating || 0), 0) / supplierProducts.length 
        : 0;

      setStats({
        totalProducts: supplierProducts.length,
        totalSales,
        totalOrders: supplierOrders.length,
        averageRating: avgRating,
        revenueThisMonth: totalSales * 0.3, // Mock calculation
        pendingOrders
      });
    } catch (error) {
      console.error("Error loading supplier data:", error);
      addAppNotification("Failed to load supplier data", "error");
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.description || !newProduct.price || 
        !newProduct.category || !newProduct.inventoryLevel) {
      addAppNotification("Please fill in all required fields.", "error");
      return;
    }

    const price = parseFloat(newProduct.price);
    const inventoryLevel = parseInt(newProduct.inventoryLevel);

    if (isNaN(price) || isNaN(inventoryLevel)) {
      addAppNotification("Please enter valid numbers for price and inventory.", "error");
      return;
    }

    setIsAddingProduct(true);
    try {
      const product: ProductListing = {
        id: Date.now().toString(),
        name: newProduct.name,
        description: newProduct.description,
        price,
        supplier: address!,
        category: newProduct.category,
        imageUrl: newProduct.imageUrl || "https://via.placeholder.com/150",
        blockchainVerified: false,
        inventoryLevel,
        contractAddress: address!
      };

      const success = await createProductListing(product);
      if (success) {
        setIsAddProductDialogOpen(false);
        setNewProduct({
          name: "",
          description: "",
          price: "",
          category: "",
          inventoryLevel: "",
          imageUrl: ""
        });
        loadSupplierData(); // Refresh data
        addAppNotification("Product listed successfully!", "success");
      }
    } catch (error) {
      console.error("Error adding product:", error);
      addAppNotification("Failed to add product", "error");
    } finally {
      setIsAddingProduct(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setNewProduct(prev => ({
      ...prev,
      [field]: value
    }));
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

  if (!address) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Wallet className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Supplier Dashboard</h2>
          <p className="text-muted-foreground mb-4">Connect your wallet to access supplier features</p>
          <Button onClick={connectWallet} disabled={isLoading}>
            <Wallet className="h-4 w-4 mr-2" />
            {isLoading ? "Connecting..." : "Connect Wallet"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card shadow-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Shield className="h-8 w-8 text-primary" />
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Supplier Dashboard</h1>
                  <p className="text-sm text-muted-foreground">Manage your products and orders</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
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
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
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
                <ShoppingCart className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Orders</p>
                  <p className="text-2xl font-bold">{stats.totalOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Sales</p>
                  <p className="text-2xl font-bold">${stats.totalSales.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">This Month</p>
                  <p className="text-2xl font-bold">${stats.revenueThisMonth.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{stats.pendingOrders}</p>
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
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button 
                variant={activeTab === "products" ? "default" : "outline"}
                onClick={() => setActiveTab("products")}
              >
                Products
              </Button>
              <Button 
                variant={activeTab === "orders" ? "default" : "outline"}
                onClick={() => setActiveTab("orders")}
              >
                Orders
              </Button>
            </div>

            {activeTab === "products" && (
              <Dialog open={isAddProductDialogOpen} onOpenChange={setIsAddProductDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Add New Product</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">Name *</Label>
                      <Input
                        id="name"
                        value={newProduct.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        className="col-span-3"
                        placeholder="Product name"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="description" className="text-right">Description *</Label>
                      <Textarea
                        id="description"
                        value={newProduct.description}
                        onChange={(e) => handleInputChange("description", e.target.value)}
                        className="col-span-3"
                        placeholder="Product description"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="category" className="text-right">Category *</Label>
                      <Select value={newProduct.category} onValueChange={(value) => handleInputChange("category", value)}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="price" className="text-right">Price *</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={newProduct.price}
                        onChange={(e) => handleInputChange("price", e.target.value)}
                        className="col-span-3"
                        placeholder="0.00"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="inventory" className="text-right">Inventory *</Label>
                      <Input
                        id="inventory"
                        type="number"
                        value={newProduct.inventoryLevel}
                        onChange={(e) => handleInputChange("inventoryLevel", e.target.value)}
                        className="col-span-3"
                        placeholder="Available quantity"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="image" className="text-right">Image URL</Label>
                      <Input
                        id="image"
                        value={newProduct.imageUrl}
                        onChange={(e) => handleInputChange("imageUrl", e.target.value)}
                        className="col-span-3"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsAddProductDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddProduct} disabled={isAddingProduct}>
                      {isAddingProduct ? "Adding..." : "Add Product"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Products Tab */}
          {activeTab === "products" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
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
                        <span>{product.category}</span>
                        <span>{product.inventoryLevel} in stock</span>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {products.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No products yet</h3>
                  <p className="text-muted-foreground">Add your first product to start selling</p>
                </div>
              )}
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
                  <p className="text-muted-foreground">Orders will appear here when customers make purchases</p>
                </div>
              ) : (
                orders.map((order) => (
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
        </div>
      </div>
    </div>
  );
}; 