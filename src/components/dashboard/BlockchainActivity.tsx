import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Check, Clock, Package2 } from "lucide-react";

const blockchainTxs = [
  {
    id: "0x1a2b3c4d",
    type: "Stock Update",
    item: "Amoxicillin 500mg",
    action: "Quantity updated: 50 → 45",
    timestamp: "2 min ago",
    status: "confirmed",
    blockNumber: 12847592
  },
  {
    id: "0x5e6f7g8h",
    type: "Purchase Order",
    item: "Surgical Gloves",
    action: "Order created: 500 units",
    timestamp: "15 min ago",
    status: "confirmed",
    blockNumber: 12847588
  },
  {
    id: "0x9i0j1k2l",
    type: "Item Added",
    item: "Blood Pressure Monitor",
    action: "New item added to inventory",
    timestamp: "1 hour ago",
    status: "pending",
    blockNumber: null
  },
  {
    id: "0xm3n4o5p6",
    type: "Expiry Alert",
    item: "Insulin Pens",
    action: "Expiry notification logged",
    timestamp: "2 hours ago",
    status: "confirmed",
    blockNumber: 12847570
  }
];

export const BlockchainActivity = () => {
  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-blockchain" />
          Recent Blockchain Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {blockchainTxs.map((tx) => (
            <div key={tx.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
              <div className={`p-2 rounded-full ${
                tx.status === 'confirmed' ? 'bg-success/10' : 'bg-warning/10'
              }`}>
                {tx.status === 'confirmed' ? 
                  <Check className="h-4 w-4 text-success" /> :
                  <Clock className="h-4 w-4 text-warning" />
                }
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-xs">
                    {tx.type}
                  </Badge>
                  <span className="text-xs text-muted-foreground font-mono">
                    {tx.id}
                  </span>
                </div>
                
                <p className="text-sm font-medium text-foreground mb-1">
                  {tx.item}
                </p>
                
                <p className="text-xs text-muted-foreground mb-2">
                  {tx.action}
                </p>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{tx.timestamp}</span>
                  {tx.blockNumber && (
                    <span className="font-mono">Block #{tx.blockNumber}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};