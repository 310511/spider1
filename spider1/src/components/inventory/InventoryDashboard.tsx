import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  Package, 
  AlertTriangle, 
  ShoppingCart, 
  Plus, 
  RefreshCw, 
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  Users,
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  Shield,
  Target,
  BarChart3,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Eye,
  Edit,
  Trash2,
  Filter,
  Search,
  Download,
  Upload
} from "lucide-react";

interface MedicalSupply {
  id: string;
  name: string;
  current_stock: number;
  threshold_quantity: number;
  expiry_date: string | null;
  supplier_id: string;
  supplier_name: string;
  unit: string;
  status: "low_stock" | "normal";
}

interface Alert {
  alert_id: string;
  item_id: string;
  item_name: string;
  type: "low_stock" | "expiry";
  message: string;
  created_at: string;
  status: "active" | "dismissed";
  severity: "low" | "medium" | "high" | "critical";
}

interface PurchaseOrder {
  order_id: string;
  item_id: string;
  item_name: string;
  quantity: number;
  supplier_id: string;
  supplier_name: string;
  supplier_email: string | null;
  status: "pending" | "sent" | "confirmed" | "received" | "cancelled";
  created_at: string;
  sent_at: string | null;
  confirmed_at: string | null;
  received_at: string | null;
  notes: string | null;
  unit_price: number | null;
  total_amount: number | null;
}

interface Supplier {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  default_order_quantity: number;
  minimum_order_quantity: number;
  lead_time_days: number;
}

const InventoryDashboard: React.FC = () => {
  const [supplies, setSupplies] = useState<MedicalSupply[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [suppliesRes, alertsRes, ordersRes, suppliersRes] = await Promise.all([
        fetch("http://localhost:8000/inventory/supplies"),
        fetch("http://localhost:8000/inventory/alerts"),
        fetch("http://localhost:8000/inventory/purchase-orders"),
        fetch("http://localhost:8000/inventory/suppliers")
      ]);

      if (suppliesRes.ok) {
        const suppliesData = await suppliesRes.json();
        setSupplies(suppliesData);
      }

      if (alertsRes.ok) {
        const alertsData = await alertsRes.json();
        setAlerts(alertsData);
      }

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setPurchaseOrders(ordersData);
      }

      if (suppliersRes.ok) {
        const suppliersData = await suppliersRes.json();
        setSuppliers(suppliersData);
      }
    } catch (error) {
      console.error("Error fetching inventory data:", error);
    } finally {
      setLoading(false);
    }
  };

  const runAlertCheck = async () => {
    try {
      const response = await fetch("http://localhost:8000/inventory/alerts/check", {
        method: "POST"
      });
      
      if (response.ok) {
        await fetchInventoryData(); // Refresh data
      }
    } catch (error) {
      console.error("Error running alert check:", error);
    }
  };

  const autoGenerateOrders = async () => {
    try {
      const response = await fetch("http://localhost:8000/inventory/purchase-orders/auto-generate", {
        method: "POST"
      });
      
      if (response.ok) {
        await fetchInventoryData(); // Refresh data
      }
    } catch (error) {
      console.error("Error auto-generating orders:", error);
    }
  };

  const dismissAlert = async (alertId: string) => {
    try {
      const response = await fetch("http://localhost:8000/inventory/alerts/dismiss", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ alert_id: alertId })
      });
      
      if (response.ok) {
        await fetchInventoryData(); // Refresh data
      }
    } catch (error) {
      console.error("Error dismissing alert:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: Clock },
      sent: { color: "bg-blue-100 text-blue-800 border-blue-200", icon: Truck },
      confirmed: { color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle },
      received: { color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle },
      cancelled: { color: "bg-red-100 text-red-800 border-red-200", icon: XCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} border`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getSeverityBadge = (severity: string) => {
    const severityConfig = {
      low: "bg-gray-100 text-gray-800 border-gray-200",
      medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
      high: "bg-orange-100 text-orange-800 border-orange-200",
      critical: "bg-red-100 text-red-800 border-red-200"
    };

    return (
      <Badge className={`${severityConfig[severity as keyof typeof severityConfig] || severityConfig.medium} border`}>
        {severity.charAt(0).toUpperCase() + severity.slice(1)}
      </Badge>
    );
  };

  const getStockPercentage = (current: number, threshold: number) => {
    return Math.min((current / threshold) * 100, 100);
  };

  const getStockColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  const filteredSupplies = supplies.filter(supply =>
    supply.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supply.supplier_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/40 rounded-full blur-xl animate-pulse"></div>
            <RefreshCw className="w-16 h-16 animate-spin text-blue-600 relative z-10" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Loading Inventory Data
            </h3>
            <p className="text-muted-foreground">Please wait while we fetch the latest information...</p>
            <div className="flex space-x-1 justify-center mt-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl opacity-10"></div>
          <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-xl">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl">
                    <Package className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Inventory Management
                    </h1>
                    <p className="text-lg text-muted-foreground">
                      Comprehensive medical supply tracking and automation
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button 
                  onClick={runAlertCheck} 
                  variant="outline" 
                  className="bg-white/50 backdrop-blur-sm border-blue-200 hover:bg-blue-50"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Check Alerts
                </Button>
                <Button 
                  onClick={autoGenerateOrders} 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Auto-Generate Orders
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200 rounded-full -translate-y-16 translate-x-16 opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <CardHeader className="relative">
              <div className="flex items-center justify-between">
                <CardTitle className="text-blue-700 group-hover:text-blue-800 transition-colors">Total Supplies</CardTitle>
                <div className="p-3 bg-blue-500 rounded-xl group-hover:bg-blue-600 transition-colors">
                  <Package className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold text-blue-800 group-hover:text-blue-900 transition-colors">{supplies.length}</div>
              <div className="flex items-center space-x-2 mt-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm text-blue-600 group-hover:text-blue-700 transition-colors">
                  {supplies.filter(s => s.status === "low_stock").length} need restocking
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-200 rounded-full -translate-y-16 translate-x-16 opacity-20"></div>
            <CardHeader className="relative">
              <div className="flex items-center justify-between">
                <CardTitle className="text-orange-700">Active Alerts</CardTitle>
                <div className="p-3 bg-orange-500 rounded-xl">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold text-orange-800">{alerts.length}</div>
              <div className="flex items-center space-x-2 mt-2">
                <Activity className="w-4 h-4 text-red-600" />
                <span className="text-sm text-orange-600">
                  {alerts.filter(a => a.severity === "critical").length} critical
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-200 rounded-full -translate-y-16 translate-x-16 opacity-20"></div>
            <CardHeader className="relative">
              <div className="flex items-center justify-between">
                <CardTitle className="text-green-700">Purchase Orders</CardTitle>
                <div className="p-3 bg-green-500 rounded-xl">
                  <ShoppingCart className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold text-green-800">{purchaseOrders.length}</div>
              <div className="flex items-center space-x-2 mt-2">
                <Clock className="w-4 h-4 text-yellow-600" />
                <span className="text-sm text-green-600">
                  {purchaseOrders.filter(o => o.status === "pending").length} pending
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200 rounded-full -translate-y-16 translate-x-16 opacity-20"></div>
            <CardHeader className="relative">
              <div className="flex items-center justify-between">
                <CardTitle className="text-purple-700">Suppliers</CardTitle>
                <div className="p-3 bg-purple-500 rounded-xl">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold text-purple-800">{suppliers.length}</div>
              <div className="flex items-center space-x-2 mt-2">
                <Shield className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-purple-600">Active partners</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
              <div className="px-6 py-4">
                <TabsList className="grid w-full grid-cols-5 bg-white/50 backdrop-blur-sm">
                  <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="supplies" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
                    Supplies
                  </TabsTrigger>
                  <TabsTrigger value="alerts" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
                    Alerts
                  </TabsTrigger>
                  <TabsTrigger value="orders" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
                    Orders
                  </TabsTrigger>
                  <TabsTrigger value="suppliers" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
                    Suppliers
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>

            <TabsContent value="overview" className="p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Low Stock Items */}
                <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-red-700">
                      <AlertTriangle className="w-5 h-5" />
                      <span>Low Stock Items</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {supplies.filter(s => s.status === "low_stock").slice(0, 5).map((supply) => (
                        <div key={supply.id} className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <span className="font-medium">{supply.name}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold text-red-600">
                              {supply.current_stock} / {supply.threshold_quantity} {supply.unit}
                            </div>
                            <Progress 
                              value={getStockPercentage(supply.current_stock, supply.threshold_quantity)} 
                              className="w-20 h-2"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Alerts */}
                <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-orange-700">
                      <Activity className="w-5 h-5" />
                      <span>Recent Alerts</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {alerts.slice(0, 5).map((alert) => (
                        <div key={alert.alert_id} className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${
                              alert.severity === 'critical' ? 'bg-red-500' : 
                              alert.severity === 'high' ? 'bg-orange-500' : 
                              alert.severity === 'medium' ? 'bg-yellow-500' : 'bg-gray-500'
                            }`}></div>
                            <div>
                              <div className="font-medium">{alert.item_name}</div>
                              <div className="text-sm text-muted-foreground">{alert.type}</div>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {alert.severity}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-700">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Supply
                    </Button>
                    <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                      <Download className="w-4 h-4 mr-2" />
                      Export Report
                    </Button>
                    <Button variant="outline" className="border-green-300 text-green-700 hover:bg-green-50">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      View Analytics
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="supplies" className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search supplies..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <Button variant="outline" className="flex items-center space-x-2">
                    <Filter className="w-4 h-4" />
                    <span>Filter</span>
                  </Button>
                </div>
                <Button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Supply
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSupplies.map((supply) => (
                  <Card key={supply.id} className="hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{supply.name}</CardTitle>
                        <Badge variant={supply.status === "low_stock" ? "destructive" : "default"}>
                          {supply.status === "low_stock" ? "Low Stock" : "Normal"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Current Stock</span>
                          <span className="font-semibold">{supply.current_stock} {supply.unit}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Threshold</span>
                          <span className="font-semibold">{supply.threshold_quantity} {supply.unit}</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Stock Level</span>
                            <span>{Math.round(getStockPercentage(supply.current_stock, supply.threshold_quantity))}%</span>
                          </div>
                          <Progress 
                            value={getStockPercentage(supply.current_stock, supply.threshold_quantity)} 
                            className="h-2"
                          />
                        </div>
                      </div>
                      
                      <div className="pt-3 border-t border-gray-100">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Supplier</span>
                          <span className="font-medium">{supply.supplier_name}</span>
                        </div>
                        {supply.expiry_date && (
                          <div className="flex items-center justify-between text-sm mt-1">
                            <span className="text-muted-foreground">Expires</span>
                            <span className="font-medium">{new Date(supply.expiry_date).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex space-x-2 pt-3">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="alerts" className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Active Alerts</h3>
                  <p className="text-muted-foreground">Monitor and manage inventory alerts</p>
                </div>
                <Button onClick={runAlertCheck} variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Alerts
                </Button>
              </div>

              {alerts.length === 0 ? (
                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                  <CardContent className="p-8 text-center">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-green-700 mb-2">No Active Alerts</h3>
                    <p className="text-green-600">All inventory levels are within acceptable ranges.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <Card key={alert.alert_id} className="border-l-4 border-l-red-500 bg-gradient-to-r from-red-50 to-red-100">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <div className="p-2 bg-red-100 rounded-lg">
                              <AlertTriangle className="w-6 h-6 text-red-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h4 className="text-lg font-semibold text-red-700">{alert.item_name}</h4>
                                {getSeverityBadge(alert.severity)}
                              </div>
                              <p className="text-red-600 mb-3">{alert.message}</p>
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                <span>Type: {alert.type}</span>
                                <span>Created: {new Date(alert.created_at).toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => dismissAlert(alert.alert_id)}
                            className="border-red-300 text-red-700 hover:bg-red-50"
                          >
                            Dismiss
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="orders" className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Purchase Orders</h3>
                  <p className="text-muted-foreground">Track order status and supplier communications</p>
                </div>
                <Button onClick={autoGenerateOrders} className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Auto-Generate Orders
                </Button>
              </div>

              {purchaseOrders.length === 0 ? (
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                  <CardContent className="p-8 text-center">
                    <ShoppingCart className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-blue-700 mb-2">No Purchase Orders</h3>
                    <p className="text-blue-600">No purchase orders have been created yet.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {purchaseOrders.map((order) => (
                    <Card key={order.order_id} className="hover:shadow-lg transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <ShoppingCart className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold">{order.item_name}</h4>
                              <p className="text-sm text-muted-foreground">Order #{order.order_id}</p>
                            </div>
                          </div>
                          {getStatusBadge(order.status)}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <span className="text-sm text-muted-foreground">Quantity</span>
                            <p className="font-semibold">{order.quantity}</p>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">Supplier</span>
                            <p className="font-semibold">{order.supplier_name}</p>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">Created</span>
                            <p className="font-semibold">{new Date(order.created_at).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">Total Amount</span>
                            <p className="font-semibold">
                              {order.total_amount ? `$${order.total_amount.toFixed(2)}` : "N/A"}
                            </p>
                          </div>
                        </div>

                        <div className="flex space-x-2 pt-4 border-t border-gray-100">
                          <Button size="sm" variant="outline" className="flex-1">
                            <Eye className="w-4 h-4 mr-1" />
                            View Details
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1">
                            <Mail className="w-4 h-4 mr-1" />
                            Contact Supplier
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="suppliers" className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Suppliers</h3>
                  <p className="text-muted-foreground">Manage supplier information and contact details</p>
                </div>
                <Button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Supplier
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {suppliers.map((supplier) => (
                  <Card key={supplier.id} className="hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{supplier.name}</CardTitle>
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Users className="w-5 h-5 text-blue-600" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        {supplier.email && (
                          <div className="flex items-center space-x-3">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{supplier.email}</span>
                          </div>
                        )}
                        {supplier.phone && (
                          <div className="flex items-center space-x-3">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{supplier.phone}</span>
                          </div>
                        )}
                        {supplier.address && (
                          <div className="flex items-center space-x-3">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{supplier.address}</span>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                        <div>
                          <span className="text-xs text-muted-foreground">Default Order Qty</span>
                          <p className="font-semibold">{supplier.default_order_quantity}</p>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground">Lead Time</span>
                          <p className="font-semibold">{supplier.lead_time_days} days</p>
                        </div>
                      </div>

                      <div className="flex space-x-2 pt-4">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <Button 
          size="lg"
          className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110"
          onClick={() => setActiveTab("supplies")}
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
};

export default InventoryDashboard; 