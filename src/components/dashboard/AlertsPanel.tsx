import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, Package } from "lucide-react";

const alerts = [
  {
    id: 1,
    type: "low_stock",
    title: "Low Stock Alert",
    message: "Amoxicillin 500mg is running low (45 units left)",
    severity: "warning",
    time: "5 min ago"
  },
  {
    id: 2,
    type: "expiry",
    title: "Expiry Warning",
    message: "Insulin Pens expire in 30 days",
    severity: "info",
    time: "1 hour ago"
  },
  {
    id: 3,
    type: "critical_stock",
    title: "Critical Stock Level",
    message: "Insulin Pens below critical threshold (12 units)",
    severity: "error",
    time: "2 hours ago"
  }
];

export const AlertsPanel = () => {
  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-warning" />
          Active Alerts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div key={alert.id} className={`p-3 rounded-lg border-l-4 ${
              alert.severity === 'error' ? 'border-l-destructive bg-destructive/5' :
              alert.severity === 'warning' ? 'border-l-warning bg-warning/5' :
              'border-l-primary bg-primary/5'
            }`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {alert.type === 'low_stock' && <Package className="h-4 w-4" />}
                    {alert.type === 'expiry' && <Clock className="h-4 w-4" />}
                    {alert.type === 'critical_stock' && <AlertTriangle className="h-4 w-4" />}
                    <h4 className="text-sm font-medium">{alert.title}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {alert.message}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {alert.time}
                  </span>
                </div>
                <Button variant="ghost" size="sm" className="text-xs">
                  Resolve
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};