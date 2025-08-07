import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Package, Calendar, AlertCircle, ShoppingCart, Shield, ExternalLink } from "lucide-react";
import { useBlockchain } from "@/contexts/BlockchainContext";
import { useState } from "react";

const inventoryData = [
  {
    id: 1,
    name: "Amoxicillin 500mg",
    category: "Antibiotics",
    stock: 45,
    threshold: 50,
    expiry: "2024-12-15",
    supplier: "PharmaCorp",
    status: "low",
    price: 45.99,
    blockchainVerified: true
  },
  {
    id: 2,
    name: "Surgical Gloves (Box)",
    category: "Consumables",
    stock: 156,
    threshold: 100,
    expiry: "2025-06-20",
    supplier: "MedSupply Co",
    status: "good",
    price: 23.50,
    blockchainVerified: true
  },
  {
    id: 3,
    name: "Insulin Pens",
    category: "Diabetes Care",
    stock: 12,
    threshold: 25,
    expiry: "2024-09-30",
    supplier: "DiabetesCare Ltd",
    status: "critical",
    price: 89.99,
    blockchainVerified: false
  },
  {
    id: 4,
    name: "Blood Pressure Monitors",
    category: "Equipment",
    stock: 8,
    threshold: 5,
    expiry: "N/A",
    supplier: "TechMed Solutions",
    status: "good",
    price: 129.99,
    blockchainVerified: true
  }
];

export const InventoryTable = () => {
  const { address, syncInventoryToMarketplace, addAppNotification } = useBlockchain();
  const [syncingItems, setSyncingItems] = useState<Set<number>>(new Set());

  const handleListOnMarketplace = async (item: any) => {
    if (!address) {
      addAppNotification("Please connect your wallet to list items on the marketplace.", "error");
      return;
    }

    setSyncingItems(prev => new Set(prev).add(item.id));
    
    try {
      await syncInventoryToMarketplace({
        id: item.id.toString(),
        name: item.name,
        category: item.category,
        stock: item.stock,
        threshold: item.threshold,
        expiry: item.expiry,
        supplier: item.supplier,
        status: item.status,
        price: item.price,
        blockchainVerified: item.blockchainVerified
      });
    } finally {
      setSyncingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(item.id);
        return newSet;
      });
    }
  };

  const handleViewOnMarketplace = (item: any) => {
    // TODO: Navigate to marketplace product page
    console.log("View on marketplace:", item);
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Current Inventory Status
          </div>
          <div className="flex items-center gap-2">
            {address && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <Shield className="h-3 w-3 mr-1" />
                Blockchain Connected
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Item</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Category</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Stock</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Price</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Expiry</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Blockchain</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventoryData.map((item) => (
                <tr key={item.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-2">
                    <div>
                      <div className="font-medium text-foreground">{item.name}</div>
                      <div className="text-sm text-muted-foreground">{item.supplier}</div>
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <Badge variant="secondary" className="text-xs">
                      {item.category}
                    </Badge>
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.stock}</span>
                      {item.stock <= item.threshold && (
                        <AlertCircle className="h-4 w-4 text-warning" />
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <span className="font-medium text-green-600">${item.price}</span>
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{item.expiry}</span>
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <Badge variant={
                      item.status === 'critical' ? 'destructive' :
                      item.status === 'low' ? 'outline' :
                      'default'
                    }>
                      {item.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-1">
                      {item.blockchainVerified ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                          <Shield className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          Pending
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewOnMarketplace(item)}
                        title="View on Marketplace"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      
                      {address && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleListOnMarketplace(item)}
                          disabled={syncingItems.has(item.id)}
                          title="List on Marketplace"
                        >
                          <ShoppingCart className="h-4 w-4" />
                        </Button>
                      )}
                      
                      <Button variant="ghost" size="sm" title="View Details">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Marketplace Integration Notice */}
        {!address && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-600" />
              <div>
                <h4 className="text-sm font-medium text-blue-800">Connect Wallet for Marketplace Features</h4>
                <p className="text-xs text-blue-600 mt-1">
                  Connect your wallet to list inventory items on the blockchain marketplace and track transactions.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};