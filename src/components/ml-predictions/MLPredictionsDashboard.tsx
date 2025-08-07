import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Package, 
  Activity,
  RefreshCw,
  FileText,
  BarChart3,
  Target,
  Zap
} from "lucide-react";
import { useInventory, InventoryItem } from "@/contexts/InventoryContext";

interface PredictionResult {
  category: string;
  predicted_demand: number;
  current_stock: number;
  restocking_threshold: number;
  restocking_needed: boolean;
  days_until_stockout: number;
  threshold: number;
  status: string;
}

interface PredictionSummary {
  total_items: number;
  urgent_restocking: number;
  moderate_restocking: number;
  safe_stock_levels: number;
  timestamp: string;
}

interface MLResults {
  success: boolean;
  summary?: PredictionSummary;
  predictions?: {
    urgent: { item_name: string; prediction: PredictionResult }[];
    moderate: { item_name: string; prediction: PredictionResult }[];
    safe: { item_name: string; prediction: PredictionResult }[];
  };
  report?: string;
  error?: string;
  timestamp: string;
}

export const MLPredictionsDashboard: React.FC = () => {
  const { inventoryItems } = useInventory();
  const [results, setResults] = useState<MLResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const runPredictions = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, this would call a backend API
      // For now, we'll simulate the process
      console.log("Running ML predictions for inventory items...");
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Create predictions based on inventory items
      const predictions: { [key: string]: PredictionResult } = {};
      
      inventoryItems.forEach(item => {
        // Simulate ML predictions based on item characteristics
        const predictedDemand = Math.random() * 20 + 5; // 5-25 units
        const restockingThreshold = item.threshold * 0.7;
        const restockingNeeded = item.stock < restockingThreshold;
        const daysUntilStockout = restockingNeeded ? 
          Math.max(0, Math.floor((item.stock - restockingThreshold) / (predictedDemand / 30))) : 0;
        
        predictions[item.name] = {
          category: item.category,
          predicted_demand: predictedDemand,
          current_stock: item.stock,
          restocking_threshold: restockingThreshold,
          restocking_needed: restockingNeeded,
          days_until_stockout: daysUntilStockout,
          threshold: item.threshold,
          status: item.status
        };
      });
      
      // Categorize predictions
      const urgent: { item_name: string; prediction: PredictionResult }[] = [];
      const moderate: { item_name: string; prediction: PredictionResult }[] = [];
      const safe: { item_name: string; prediction: PredictionResult }[] = [];
      
      Object.entries(predictions).forEach(([itemName, prediction]) => {
        if (prediction.restocking_needed) {
          if (prediction.days_until_stockout <= 7) {
            urgent.push({ item_name: itemName, prediction });
          } else if (prediction.days_until_stockout <= 14) {
            moderate.push({ item_name: itemName, prediction });
          }
        } else {
          safe.push({ item_name: itemName, prediction });
        }
      });
      
      const sampleResults: MLResults = {
        success: true,
        summary: {
          total_items: inventoryItems.length,
          urgent_restocking: urgent.length,
          moderate_restocking: moderate.length,
          safe_stock_levels: safe.length,
          timestamp: new Date().toISOString()
        },
        predictions: {
          urgent,
          moderate,
          safe
        },
        timestamp: new Date().toISOString()
      };
      
      setResults(sampleResults);
      setLastUpdated(new Date().toISOString());
      
    } catch (error) {
      console.error("Error running predictions:", error);
      setResults({
        success: false,
        error: "Failed to run predictions",
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Load initial results if available
    if (inventoryItems.length > 0) {
      runPredictions();
    }
  }, [inventoryItems]);

  const getUrgencyColor = (daysUntilStockout: number) => {
    if (daysUntilStockout <= 7) return "text-red-600";
    if (daysUntilStockout <= 14) return "text-yellow-600";
    return "text-green-600";
  };

  const getUrgencyBadge = (daysUntilStockout: number) => {
    if (daysUntilStockout <= 7) return "destructive";
    if (daysUntilStockout <= 14) return "secondary";
    return "default";
  };

  const getStockLevelPercentage = (current: number, threshold: number) => {
    return Math.min((current / threshold) * 100, 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'text-red-600';
      case 'low': return 'text-yellow-600';
      case 'good': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card shadow-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Brain className="h-8 w-8 text-primary" />
                <div>
                  <h1 className="text-2xl font-bold text-foreground">ML Predictions Dashboard</h1>
                  <p className="text-sm text-muted-foreground">AI-powered medicine restocking predictions</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button 
                onClick={runPredictions} 
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? "Running..." : "Run Predictions"}
              </Button>
              
              {lastUpdated && (
                <span className="text-sm text-muted-foreground">
                  Last updated: {new Date(lastUpdated).toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-6">
        {results?.success ? (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total Items</p>
                      <p className="text-2xl font-bold">{results.summary?.total_items}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Urgent Restocking</p>
                      <p className="text-2xl font-bold text-red-600">{results.summary?.urgent_restocking}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Moderate Restocking</p>
                      <p className="text-2xl font-bold text-yellow-600">{results.summary?.moderate_restocking}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Safe Stock Levels</p>
                      <p className="text-2xl font-bold text-green-600">{results.summary?.safe_stock_levels}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="urgent">Urgent</TabsTrigger>
                <TabsTrigger value="moderate">Moderate</TabsTrigger>
                <TabsTrigger value="safe">Safe</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Urgent Items */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                        Urgent Restocking Needed
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {results.predictions?.urgent.length ? (
                        results.predictions.urgent.map((item, index) => (
                          <div key={index} className="border rounded-lg p-4 bg-red-50">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold">{item.item_name}</h4>
                              <Badge variant="destructive">
                                {item.prediction.days_until_stockout} days left
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{item.prediction.category}</p>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Current Stock:</span>
                                <span className="font-semibold">{item.prediction.current_stock} units</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Predicted Demand:</span>
                                <span className="font-semibold">{item.prediction.predicted_demand.toFixed(1)} units</span>
                              </div>
                              <Progress 
                                value={getStockLevelPercentage(item.prediction.current_stock, item.prediction.threshold)} 
                                className="h-2"
                              />
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground text-center py-4">No urgent restocking needed</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Moderate Items */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-yellow-600" />
                        Moderate Restocking Needed
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {results.predictions?.moderate.length ? (
                        results.predictions.moderate.map((item, index) => (
                          <div key={index} className="border rounded-lg p-4 bg-yellow-50">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold">{item.item_name}</h4>
                              <Badge variant="secondary">
                                {item.prediction.days_until_stockout} days left
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{item.prediction.category}</p>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Current Stock:</span>
                                <span className="font-semibold">{item.prediction.current_stock} units</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Predicted Demand:</span>
                                <span className="font-semibold">{item.prediction.predicted_demand.toFixed(1)} units</span>
                              </div>
                              <Progress 
                                value={getStockLevelPercentage(item.prediction.current_stock, item.prediction.threshold)} 
                                className="h-2"
                              />
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground text-center py-4">No moderate restocking needed</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="urgent" className="space-y-4">
                {results.predictions?.urgent.length ? (
                  results.predictions.urgent.map((item, index) => (
                    <Card key={index}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold">{item.item_name}</h3>
                            <p className="text-sm text-muted-foreground">{item.prediction.category}</p>
                          </div>
                          <Badge variant="destructive" className="text-sm">
                            URGENT - {item.prediction.days_until_stockout} days left
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground">Current Stock</p>
                            <p className="text-2xl font-bold text-red-600">{item.prediction.current_stock}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground">Predicted Demand</p>
                            <p className="text-2xl font-bold">{item.prediction.predicted_demand.toFixed(1)}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground">Restocking Threshold</p>
                            <p className="text-2xl font-bold">{item.prediction.restocking_threshold.toFixed(1)}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Stock Level</span>
                            <span>{getStockLevelPercentage(item.prediction.current_stock, item.prediction.threshold).toFixed(1)}%</span>
                          </div>
                          <Progress 
                            value={getStockLevelPercentage(item.prediction.current_stock, item.prediction.threshold)} 
                            className="h-3"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Urgent Restocking Needed</h3>
                    <p className="text-muted-foreground">All inventory items have adequate stock levels.</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="moderate" className="space-y-4">
                {results.predictions?.moderate.length ? (
                  results.predictions.moderate.map((item, index) => (
                    <Card key={index}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold">{item.item_name}</h3>
                            <p className="text-sm text-muted-foreground">{item.prediction.category}</p>
                          </div>
                          <Badge variant="secondary" className="text-sm">
                            MODERATE - {item.prediction.days_until_stockout} days left
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground">Current Stock</p>
                            <p className="text-2xl font-bold text-yellow-600">{item.prediction.current_stock}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground">Predicted Demand</p>
                            <p className="text-2xl font-bold">{item.prediction.predicted_demand.toFixed(1)}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground">Restocking Threshold</p>
                            <p className="text-2xl font-bold">{item.prediction.restocking_threshold.toFixed(1)}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Stock Level</span>
                            <span>{getStockLevelPercentage(item.prediction.current_stock, item.prediction.threshold).toFixed(1)}%</span>
                          </div>
                          <Progress 
                            value={getStockLevelPercentage(item.prediction.current_stock, item.prediction.threshold)} 
                            className="h-3"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Moderate Restocking Needed</h3>
                    <p className="text-muted-foreground">All inventory items have adequate stock levels.</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="safe" className="space-y-4">
                {results.predictions?.safe.length ? (
                  results.predictions.safe.map((item, index) => (
                    <Card key={index}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold">{item.item_name}</h3>
                            <p className="text-sm text-muted-foreground">{item.prediction.category}</p>
                          </div>
                          <Badge variant="default" className="text-sm">
                            SAFE STOCK LEVELS
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground">Current Stock</p>
                            <p className="text-2xl font-bold text-green-600">{item.prediction.current_stock}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground">Predicted Demand</p>
                            <p className="text-2xl font-bold">{item.prediction.predicted_demand.toFixed(1)}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground">Restocking Threshold</p>
                            <p className="text-2xl font-bold">{item.prediction.restocking_threshold.toFixed(1)}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Stock Level</span>
                            <span>{getStockLevelPercentage(item.prediction.current_stock, item.prediction.threshold).toFixed(1)}%</span>
                          </div>
                          <Progress 
                            value={getStockLevelPercentage(item.prediction.current_stock, item.prediction.threshold)} 
                            className="h-3"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <AlertTriangle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Safe Stock Categories</h3>
                    <p className="text-muted-foreground">All inventory items need restocking attention.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <div className="text-center py-12">
            {isLoading ? (
              <div className="space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <h3 className="text-lg font-semibold">Running ML Predictions...</h3>
                <p className="text-muted-foreground">Analyzing inventory data and generating restocking predictions</p>
              </div>
            ) : results?.error ? (
              <div className="space-y-4">
                <AlertTriangle className="h-12 w-12 text-red-600 mx-auto" />
                <h3 className="text-lg font-semibold">Prediction Error</h3>
                <p className="text-muted-foreground">{results.error}</p>
                <Button onClick={runPredictions}>Try Again</Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Brain className="h-12 w-12 text-muted-foreground mx-auto" />
                <h3 className="text-lg font-semibold">No Predictions Available</h3>
                <p className="text-muted-foreground">Run ML predictions to analyze inventory restocking needs</p>
                <Button onClick={runPredictions}>Run Predictions</Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}; 