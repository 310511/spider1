import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Pill, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  Package, 
  Loader2,
  Stethoscope,
  Activity,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

interface MedicineRecommendation {
  medicine_id: string;
  medicine_name: string;
  category: string;
  description: string;
  dosage: string;
  confidence_score: number;
  reasoning: string;
  dosage_instructions: string;
  warnings: string[];
  stock_quantity: number;
  price: number;
  prescription_required: boolean;
  alternative_medicines: string[];
}

interface RestockingRequest {
  request_id: string;
  medicine_id: string;
  medicine_name: string;
  current_stock: number;
  requested_quantity: number;
  urgency_level: string;
  reason: string;
  created_at: string;
  status: string;
}

interface MedicineRecommendationResponse {
  symptoms_detected: { [key: string]: number };
  recommendations: MedicineRecommendation[];
  restocking_requests: RestockingRequest[];
  total_recommendations: number;
  total_restocking_requests: number;
}

const BACKEND_URL = "http://localhost:8000";

export function MedicineRecommendationDashboard() {
  const [symptoms, setSymptoms] = useState('');
  const [recommendations, setRecommendations] = useState<MedicineRecommendationResponse | null>(null);
  const [restockingRequests, setRestockingRequests] = useState<RestockingRequest[]>([]);
  const [allMedicines, setAllMedicines] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('recommendations');

  useEffect(() => {
    loadRestockingRequests();
    loadAllMedicines();
  }, []);

  const loadRestockingRequests = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/medicine/restocking-requests`);
      if (response.ok) {
        const data = await response.json();
        setRestockingRequests(data);
      }
    } catch (error) {
      console.error('Error loading restocking requests:', error);
    }
  };

  const loadAllMedicines = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/medicine/all`);
      if (response.ok) {
        const data = await response.json();
        setAllMedicines(data);
      }
    } catch (error) {
      console.error('Error loading medicines:', error);
    }
  };

  const handleRecommendMedicines = async () => {
    if (!symptoms.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BACKEND_URL}/medicine/recommend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: 'demo-user-1',
          symptoms: symptoms,
          include_restocking: true
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setRecommendations(data);
        if (data.restocking_requests.length > 0) {
          setRestockingRequests(prev => [...prev, ...data.restocking_requests]);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to get recommendations');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'bg-green-500';
    if (score >= 0.6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  const getStockColor = (quantity: number) => {
    if (quantity === 0) return 'text-red-600';
    if (quantity < 20) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Pill className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">Medicine Recommendation System</h1>
            <p className="text-muted-foreground">AI-powered medicine recommendations with automatic restocking</p>
          </div>
        </div>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recommendations">Medicine Recommendations</TabsTrigger>
          <TabsTrigger value="inventory">Inventory Management</TabsTrigger>
          <TabsTrigger value="restocking">Restocking Requests</TabsTrigger>
        </TabsList>

        {/* Medicine Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Stethoscope className="h-5 w-5" />
                <span>Get Medicine Recommendations</span>
              </CardTitle>
              <CardDescription>
                Describe your symptoms and get AI-powered medicine recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Describe your symptoms:</label>
                <Textarea
                  placeholder="e.g., I have a severe headache and fever, feeling very anxious and can't sleep..."
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  rows={4}
                />
              </div>
              <Button 
                onClick={handleRecommendMedicines} 
                disabled={isLoading || !symptoms.trim()}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing Symptoms...
                  </>
                ) : (
                  <>
                    <Activity className="h-4 w-4 mr-2" />
                    Get Recommendations
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {recommendations && (
            <div className="space-y-4">
              {/* Symptoms Detected */}
              <Card>
                <CardHeader>
                  <CardTitle>Symptoms Detected</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(recommendations.symptoms_detected).map(([symptom, score]) => (
                      <Badge key={symptom} variant="secondary">
                        {symptom.replace('_', ' ')}: {Math.round(score * 100)}%
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle>Recommended Medicines</CardTitle>
                  <CardDescription>
                    {recommendations.total_recommendations} recommendations found
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recommendations.recommendations.map((rec, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-lg">{rec.medicine_name}</h3>
                            <Badge variant="outline">{rec.category.replace('_', ' ')}</Badge>
                            <Badge className={getConfidenceColor(rec.confidence_score)}>
                              {Math.round(rec.confidence_score * 100)}% Match
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-2">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <span className="font-medium">${rec.price}</span>
                            <Package className="h-4 w-4" />
                            <span className={`font-medium ${getStockColor(rec.stock_quantity)}`}>
                              {rec.stock_quantity} in stock
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground">{rec.description}</p>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Dosage:</span> {rec.dosage}
                          </div>
                          <div>
                            <span className="font-medium">Instructions:</span> {rec.dosage_instructions}
                          </div>
                        </div>
                        
                        <div>
                          <span className="font-medium text-sm">Reasoning:</span>
                          <p className="text-sm text-muted-foreground mt-1">{rec.reasoning}</p>
                        </div>
                        
                        {rec.warnings.length > 0 && (
                          <div>
                            <span className="font-medium text-sm text-red-600">Warnings:</span>
                            <ul className="text-sm text-red-600 mt-1 space-y-1">
                              {rec.warnings.map((warning, idx) => (
                                <li key={idx}>• {warning}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {rec.prescription_required && (
                          <Alert className="border-yellow-200 bg-yellow-50">
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                            <AlertDescription className="text-yellow-800">
                              This medicine requires a prescription. Please consult a doctor.
                            </AlertDescription>
                          </Alert>
                        )}
                        
                        {rec.alternative_medicines.length > 0 && (
                          <div>
                            <span className="font-medium text-sm">Alternatives:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {rec.alternative_medicines.map((alt, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {alt}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Inventory Management Tab */}
        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Medicine Inventory</CardTitle>
              <CardDescription>
                View all available medicines and their stock levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {allMedicines.map((medicine) => (
                    <div key={medicine.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{medicine.name}</h3>
                          <p className="text-sm text-muted-foreground">{medicine.description}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="font-medium">${medicine.price}</div>
                            <div className={`text-sm ${getStockColor(medicine.stock_quantity)}`}>
                              {medicine.stock_quantity} in stock
                            </div>
                          </div>
                          <Badge variant={medicine.prescription_required ? "destructive" : "secondary"}>
                            {medicine.prescription_required ? "Prescription" : "OTC"}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>Stock Level</span>
                          <span>{medicine.stock_quantity}</span>
                        </div>
                        <Progress 
                          value={Math.min(100, (medicine.stock_quantity / 100) * 100)} 
                          className="h-2"
                        />
                      </div>
                      
                      <div className="mt-3 flex flex-wrap gap-1">
                        {medicine.symptoms_treated.slice(0, 3).map((symptom, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {symptom}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Restocking Requests Tab */}
        <TabsContent value="restocking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Restocking Requests</CardTitle>
              <CardDescription>
                Automatic restocking requests for low stock medicines
              </CardDescription>
            </CardHeader>
            <CardContent>
              {restockingRequests.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No restocking requests at the moment.
                </p>
              ) : (
                <div className="space-y-4">
                  {restockingRequests.map((request) => (
                    <div key={request.request_id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{request.medicine_name}</h3>
                          <p className="text-sm text-muted-foreground">{request.reason}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getUrgencyColor(request.urgency_level)}>
                            {request.urgency_level} urgency
                          </Badge>
                          <Badge variant="outline">{request.status}</Badge>
                        </div>
                      </div>
                      
                      <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Current Stock:</span>
                          <div className="text-red-600 font-semibold">{request.current_stock}</div>
                        </div>
                        <div>
                          <span className="font-medium">Requested:</span>
                          <div className="text-blue-600 font-semibold">{request.requested_quantity}</div>
                        </div>
                        <div>
                          <span className="font-medium">Created:</span>
                          <div className="text-muted-foreground">
                            {new Date(request.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-3 flex space-x-2">
                        <Button size="sm" variant="outline">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Mark Fulfilled
                        </Button>
                        <Button size="sm" variant="outline">
                          <Clock className="h-4 w-4 mr-1" />
                          Schedule Order
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 