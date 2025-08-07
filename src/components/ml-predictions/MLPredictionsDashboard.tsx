import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Brain, TrendingUp, AlertTriangle, Package, Calendar, BarChart3, Loader2 } from 'lucide-react';

interface MedicineData {
  medicine_id: number;
  medicine_name: string;
  category: string;
  current_stock: number;
  daily_consumption: number;
  days_since_last_restock: number;
  supplier_lead_time: number;
  unit_cost: number;
  shelf_life_days: number;
  temperature_sensitive: boolean;
  critical_medicine: boolean;
  seasonal_demand: boolean;
  month: number;
  day_of_week: number;
  is_weekend: boolean;
  days_to_expiry: number;
}

interface PredictionResult {
  medicine_name: string;
  current_stock: number;
  predicted_restock_amount: number;
  predicted_days_until_restock: number;
  urgency_level: 'High' | 'Medium' | 'Low';
}

interface ModelPerformance {
  model_name: string;
  restock_amount_r2: number;
  days_until_restock_r2: number;
  mse: number;
  mae: number;
}

export function MLPredictionsDashboard() {
  const [isLoading, setIsLoading] = useState(false);
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  const [modelPerformance, setModelPerformance] = useState<ModelPerformance[]>([]);
  const [featureImportance, setFeatureImportance] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('predictions');
  const [selectedMedicine, setSelectedMedicine] = useState<MedicineData | null>(null);

  // Mock data for demonstration
  const mockPredictions: PredictionResult[] = [
    {
      medicine_name: 'Paracetamol',
      current_stock: 150,
      predicted_restock_amount: 500,
      predicted_days_until_restock: 5,
      urgency_level: 'High'
    },
    {
      medicine_name: 'Ibuprofen',
      current_stock: 300,
      predicted_restock_amount: 400,
      predicted_days_until_restock: 12,
      urgency_level: 'Medium'
    },
    {
      medicine_name: 'Metformin',
      current_stock: 50,
      predicted_restock_amount: 600,
      predicted_days_until_restock: 3,
      urgency_level: 'High'
    },
    {
      medicine_name: 'Amlodipine',
      current_stock: 200,
      predicted_restock_amount: 300,
      predicted_days_until_restock: 18,
      urgency_level: 'Low'
    },
    {
      medicine_name: 'Albuterol',
      current_stock: 75,
      predicted_restock_amount: 450,
      predicted_days_until_restock: 7,
      urgency_level: 'High'
    }
  ];

  const mockModelPerformance: ModelPerformance[] = [
    { model_name: 'XGBoost', restock_amount_r2: 0.89, days_until_restock_r2: 0.85, mse: 0.12, mae: 0.08 },
    { model_name: 'Random Forest', restock_amount_r2: 0.87, days_until_restock_r2: 0.83, mse: 0.14, mae: 0.09 },
    { model_name: 'LightGBM', restock_amount_r2: 0.88, days_until_restock_r2: 0.84, mse: 0.13, mae: 0.08 },
    { model_name: 'Gradient Boosting', restock_amount_r2: 0.86, days_until_restock_r2: 0.82, mse: 0.15, mae: 0.10 },
    { model_name: 'Linear Regression', restock_amount_r2: 0.75, days_until_restock_r2: 0.70, mse: 0.25, mae: 0.15 }
  ];

  const mockFeatureImportance = [
    { feature: 'current_stock', importance: 0.25 },
    { feature: 'daily_consumption', importance: 0.22 },
    { feature: 'days_since_last_restock', importance: 0.18 },
    { feature: 'supplier_lead_time', importance: 0.15 },
    { feature: 'critical_medicine', importance: 0.12 },
    { feature: 'stock_level_percentage', importance: 0.10 },
    { feature: 'urgency_score', importance: 0.08 }
  ];

  useEffect(() => {
    // Load mock data
    setPredictions(mockPredictions);
    setModelPerformance(mockModelPerformance);
    setFeatureImportance(mockFeatureImportance);
  }, []);

  const handleRunPredictions = async () => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsLoading(false);
  };

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'High': return 'bg-red-500';
      case 'Medium': return 'bg-yellow-500';
      case 'Low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getUrgencyTextColor = (level: string) => {
    switch (level) {
      case 'High': return 'text-red-600';
      case 'Medium': return 'text-yellow-600';
      case 'Low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Brain className="h-8 w-8 text-purple-600" />
          <div>
            <h1 className="text-3xl font-bold">ML Medicine Restocking Predictions</h1>
            <p className="text-muted-foreground">AI-powered inventory management predictions</p>
          </div>
        </div>
        <Button onClick={handleRunPredictions} disabled={isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <TrendingUp className="h-4 w-4 mr-2" />}
          {isLoading ? 'Running Predictions...' : 'Run Predictions'}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="performance">Model Performance</TabsTrigger>
          <TabsTrigger value="features">Feature Analysis</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="predictions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Restocking Predictions</span>
              </CardTitle>
              <CardDescription>
                AI predictions for medicine restocking needs and timing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Medicine</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>Predicted Restock Amount</TableHead>
                    <TableHead>Days Until Restock</TableHead>
                    <TableHead>Urgency Level</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {predictions.map((prediction, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{prediction.medicine_name}</TableCell>
                      <TableCell>{prediction.current_stock}</TableCell>
                      <TableCell>{prediction.predicted_restock_amount}</TableCell>
                      <TableCell>{prediction.predicted_days_until_restock}</TableCell>
                      <TableCell>
                        <Badge className={getUrgencyColor(prediction.urgency_level)}>
                          {prediction.urgency_level}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">High Priority Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {predictions.filter(p => p.urgency_level === 'High').length}
                </div>
                <p className="text-xs text-muted-foreground">Need immediate attention</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Total Restock Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  ${predictions.reduce((sum, p) => sum + p.predicted_restock_amount, 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Predicted restock cost</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Average Days Until Restock</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(predictions.reduce((sum, p) => sum + p.predicted_days_until_restock, 0) / predictions.length)}
                </div>
                <p className="text-xs text-muted-foreground">Days on average</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Model Performance Comparison</span>
              </CardTitle>
              <CardDescription>
                Performance metrics for different ML models
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Model</TableHead>
                    <TableHead>Restock Amount R²</TableHead>
                    <TableHead>Days Until Restock R²</TableHead>
                    <TableHead>MSE</TableHead>
                    <TableHead>MAE</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {modelPerformance.map((model, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{model.model_name}</TableCell>
                      <TableCell>{(model.restock_amount_r2 * 100).toFixed(1)}%</TableCell>
                      <TableCell>{(model.days_until_restock_r2 * 100).toFixed(1)}%</TableCell>
                      <TableCell>{model.mse.toFixed(3)}</TableCell>
                      <TableCell>{model.mae.toFixed(3)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Best Model: XGBoost</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Restock Amount Accuracy</span>
                    <span className="font-bold text-green-600">89%</span>
                  </div>
                  <Progress value={89} className="w-full" />
                  
                  <div className="flex justify-between">
                    <span>Days Until Restock Accuracy</span>
                    <span className="font-bold text-blue-600">85%</span>
                  </div>
                  <Progress value={85} className="w-full" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Model Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>XGBoost performs best for both predictions</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Random Forest is most stable</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span>Linear models struggle with complex patterns</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Feature Importance Analysis</span>
              </CardTitle>
              <CardDescription>
                Most important features for predicting restocking needs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {featureImportance.map((feature, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{feature.feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                      <span className="text-muted-foreground">{(feature.importance * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={feature.importance * 100} className="w-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Key Insights:</strong> Current stock and daily consumption are the most critical factors 
              for predicting restocking needs. Critical medicines and supplier lead times also significantly 
              impact predictions.
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>High Priority Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {predictions.filter(p => p.urgency_level === 'High').map((prediction, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{prediction.medicine_name}</p>
                        <p className="text-sm text-muted-foreground">
                          Restock in {prediction.predicted_days_until_restock} days
                        </p>
                      </div>
                      <Badge variant="destructive">Urgent</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cost Optimization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium">Total Predicted Cost</p>
                    <p className="text-2xl font-bold text-green-600">
                      ${predictions.reduce((sum, p) => sum + p.predicted_restock_amount, 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Potential Savings</p>
                    <p className="text-lg font-bold text-blue-600">$15,000</p>
                    <p className="text-xs text-muted-foreground">Through optimized ordering</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">Immediate Action Required</p>
                    <p className="text-sm text-muted-foreground">
                      Paracetamol and Metformin need immediate restocking within 5 days
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">Monitor Closely</p>
                    <p className="text-sm text-muted-foreground">
                      Ibuprofen and Albuterol should be monitored for the next 2 weeks
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">Optimize Ordering</p>
                    <p className="text-sm text-muted-foreground">
                      Consider bulk ordering for Amlodipine to reduce costs
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 