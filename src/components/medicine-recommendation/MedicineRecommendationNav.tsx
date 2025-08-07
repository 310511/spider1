import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pill, TrendingUp, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

export function MedicineRecommendationNav() {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Pill className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">Medicine Recommendations</CardTitle>
          </div>
          <Badge variant="secondary" className="text-xs">
            AI-Powered
          </Badge>
        </div>
        <CardDescription>
          Get intelligent medicine recommendations based on symptoms with automatic restocking alerts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span>Smart Recommendations</span>
          </div>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <span>Auto Restocking</span>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button asChild className="flex-1">
            <Link to="/medicine-recommendation">
              Open System
            </Link>
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground">
          Features: Symptom analysis, medicine matching, dosage instructions, stock monitoring, automatic restocking requests
        </div>
      </CardContent>
    </Card>
  );
} 