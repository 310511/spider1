import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Package, TrendingUp, DollarSign } from "lucide-react";

const stats = [
  {
    title: "Total Items",
    value: "1,247",
    change: "+12%",
    icon: Package,
    trend: "up"
  },
  {
    title: "Low Stock Alerts",
    value: "23",
    change: "+5 today",
    icon: AlertTriangle,
    trend: "alert",
    variant: "warning"
  },
  {
    title: "Monthly Usage",
    value: "$47,832",
    change: "+8.2%",
    icon: DollarSign,
    trend: "up"
  },
  {
    title: "Inventory Value",
    value: "$284,391",
    change: "-2.1%",
    icon: TrendingUp,
    trend: "down"
  }
];

export const StatsGrid = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="shadow-card hover:shadow-elegant transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${
                stat.variant === 'warning' ? 'text-warning' : 'text-primary'
              }`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className={`text-xs ${
                stat.trend === 'up' ? 'text-success' : 
                stat.trend === 'alert' ? 'text-warning' : 
                'text-destructive'
              }`}>
                {stat.change} from last month
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};