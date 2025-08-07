import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, TrendingUp, Package, BarChart3 } from 'lucide-react';

export function MLPredictionsNav() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Brain className="h-6 w-6 text-purple-600" />
          <span>ML Predictions</span>
        </CardTitle>
        <CardDescription>
          AI-powered medicine restocking predictions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center space-x-2 text-sm">
            <Package className="h-4 w-4 text-blue-600" />
            <span>Restocking Predictions</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span>Model Performance</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <BarChart3 className="h-4 w-4 text-orange-600" />
            <span>Feature Analysis</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Brain className="h-4 w-4 text-purple-600" />
            <span>AI Insights</span>
          </div>
        </div>
        
        <Link to="/ml-predictions">
          <Button className="w-full">
            <Brain className="h-4 w-4 mr-2" />
            Open ML Predictions
          </Button>
        </Link>
        
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center">
            <div className="font-bold text-red-600">3</div>
            <div className="text-muted-foreground">High Priority</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-blue-600">$2,250</div>
            <div className="text-muted-foreground">Restock Value</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-green-600">89%</div>
            <div className="text-muted-foreground">Accuracy</div>
          </div>
        </div>
        
        <p className="text-xs text-muted-foreground">
          Predict restocking needs and optimize inventory management with AI
        </p>
      </CardContent>
    </Card>
  );
} 