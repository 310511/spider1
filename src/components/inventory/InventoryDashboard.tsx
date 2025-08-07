import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
  Users
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
  const [activeTab, setActiveTab] = useState("supplies");

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
      pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
      sent: { color: "bg-blue-100 text-blue-800", icon: Truck },
      confirmed: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      received: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      cancelled: { color: "bg-red-100 text-red-800", icon: XCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </Badge>
    );
  };

  const getSeverityBadge = (severity: string) => {
    const severityConfig = {
      low: "bg-gray-100 text-gray-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-orange-100 text-orange-800",
      critical: "bg-red-100 text-red-800"
    };

    return (
      <Badge className={severityConfig[severity as keyof typeof severityConfig] || severityConfig.medium}>
        {severity}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading inventory data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground">
            Manage medical supplies, monitor alerts, and track purchase orders
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={runAlertCheck} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Check Alerts
          </Button>
          <Button onClick={autoGenerateOrders} variant="outline">
            <ShoppingCart className="w-4 h-4 mr-2" />
            Auto-Generate Orders
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Supplies</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{supplies.length}</div>
            <p className="text-xs text-muted-foreground">
              {supplies.filter(s => s.status === "low_stock").length} low stock
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alerts.length}</div>
            <p className="text-xs text-muted-foreground">
              {alerts.filter(a => a.severity === "critical").length} critical
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Purchase Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{purchaseOrders.length}</div>
            <p className="text-xs text-muted-foreground">
              {purchaseOrders.filter(o => o.status === "pending").length} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suppliers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{suppliers.length}</div>
            <p className="text-xs text-muted-foreground">Active suppliers</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="supplies">Medical Supplies</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="orders">Purchase Orders</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
        </TabsList>

        <TabsContent value="supplies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Medical Supplies</CardTitle>
              <CardDescription>
                Current inventory levels and stock status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>Threshold</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {supplies.map((supply) => (
                    <TableRow key={supply.id}>
                      <TableCell className="font-medium">{supply.name}</TableCell>
                      <TableCell>{supply.current_stock} {supply.unit}</TableCell>
                      <TableCell>{supply.threshold_quantity} {supply.unit}</TableCell>
                      <TableCell>{supply.supplier_name}</TableCell>
                      <TableCell>
                        {supply.expiry_date ? new Date(supply.expiry_date).toLocaleDateString() : "N/A"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={supply.status === "low_stock" ? "destructive" : "default"}>
                          {supply.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Alerts</CardTitle>
              <CardDescription>
                Low stock and expiry alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {alerts.length === 0 ? (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>No Active Alerts</AlertTitle>
                  <AlertDescription>
                    All inventory levels are within acceptable ranges.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <Alert key={alert.alert_id}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle className="flex items-center justify-between">
                        <span>{alert.item_name}</span>
                        <div className="flex items-center gap-2">
                          {getSeverityBadge(alert.severity)}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => dismissAlert(alert.alert_id)}
                          >
                            Dismiss
                          </Button>
                        </div>
                      </AlertTitle>
                      <AlertDescription>
                        {alert.message}
                        <div className="mt-2 text-xs text-muted-foreground">
                          Created: {new Date(alert.created_at).toLocaleString()}
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Purchase Orders</CardTitle>
              <CardDescription>
                Track order status and supplier communications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {purchaseOrders.length === 0 ? (
                <Alert>
                  <ShoppingCart className="h-4 w-4" />
                  <AlertTitle>No Purchase Orders</AlertTitle>
                  <AlertDescription>
                    No purchase orders have been created yet.
                  </AlertDescription>
                </Alert>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchaseOrders.map((order) => (
                      <TableRow key={order.order_id}>
                        <TableCell className="font-medium">{order.order_id}</TableCell>
                        <TableCell>{order.item_name}</TableCell>
                        <TableCell>{order.quantity}</TableCell>
                        <TableCell>{order.supplier_name}</TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell>
                          {new Date(order.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Suppliers</CardTitle>
              <CardDescription>
                Manage supplier information and contact details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Default Order Qty</TableHead>
                    <TableHead>Lead Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suppliers.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell className="font-medium">{supplier.name}</TableCell>
                      <TableCell>{supplier.email || "N/A"}</TableCell>
                      <TableCell>{supplier.phone || "N/A"}</TableCell>
                      <TableCell>{supplier.default_order_quantity}</TableCell>
                      <TableCell>{supplier.lead_time_days} days</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InventoryDashboard; 