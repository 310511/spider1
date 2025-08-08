import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, AlertTriangle, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";

const InventoryNav: React.FC = () => {
  return (
    <Link to="/inventory">
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Inventory Management</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">CIMS</div>
          <p className="text-xs text-muted-foreground">
            Automated stock alerts & purchase orders
          </p>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <AlertTriangle className="w-3 h-3" />
              <span>Alerts</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <ShoppingCart className="w-3 h-3" />
              <span>Orders</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default InventoryNav; 