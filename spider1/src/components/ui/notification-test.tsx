import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, Package, TrendingUp, Brain, Pill } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { NotificationService } from '@/services/notificationService';

export const NotificationTest: React.FC = () => {
  const { addNotification } = useNotifications();
  const notificationService = NotificationService.getInstance();

  const triggerInventoryAlert = () => {
    notificationService.simulateInventoryAlert("Paracetamol", 5);
  };

  const triggerMarketplaceOrder = () => {
    notificationService.simulateMarketplaceOrder("12345", "Aspirin", 100);
  };

  const triggerMLPrediction = () => {
    notificationService.simulateMLPrediction(95);
  };

  const triggerAIRecommendation = () => {
    notificationService.simulateAIRecommendation("Amoxicillin");
  };

  const addCustomNotification = () => {
    addNotification({
      title: "Custom Notification",
      message: "This is a custom notification triggered manually",
      type: "info",
      category: "system",
      priority: "medium"
    });
  };

  return (
    <Card className="w-full max-w-md border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
      <CardHeader className="pb-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Bell className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold text-gray-900">Test Notifications</CardTitle>
            <p className="text-xs text-gray-500 mt-1">Trigger different notification types</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 p-4">
        <Button 
          onClick={triggerInventoryAlert}
          variant="outline" 
          className="w-full h-10 bg-gradient-to-r from-yellow-50 to-orange-50 hover:from-yellow-100 hover:to-orange-100 border-yellow-200 text-yellow-700 hover:text-yellow-800 transition-all duration-200"
        >
          <Package className="h-4 w-4 mr-2" />
          Trigger Inventory Alert
        </Button>
        
        <Button 
          onClick={triggerMarketplaceOrder}
          variant="outline" 
          className="w-full h-10 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-blue-200 text-blue-700 hover:text-blue-800 transition-all duration-200"
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          Trigger Marketplace Order
        </Button>
        
        <Button 
          onClick={triggerMLPrediction}
          variant="outline" 
          className="w-full h-10 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border-green-200 text-green-700 hover:text-green-800 transition-all duration-200"
        >
          <Brain className="h-4 w-4 mr-2" />
          Trigger ML Prediction
        </Button>
        
        <Button 
          onClick={triggerAIRecommendation}
          variant="outline" 
          className="w-full h-10 bg-gradient-to-r from-pink-50 to-purple-50 hover:from-pink-100 hover:to-purple-100 border-pink-200 text-pink-700 hover:text-pink-800 transition-all duration-200"
        >
          <Pill className="h-4 w-4 mr-2" />
          Trigger AI Recommendation
        </Button>
        
        <Button 
          onClick={addCustomNotification}
          variant="outline" 
          className="w-full h-10 bg-gradient-to-r from-gray-50 to-slate-50 hover:from-gray-100 hover:to-slate-100 border-gray-200 text-gray-700 hover:text-gray-800 transition-all duration-200"
        >
          <Bell className="h-4 w-4 mr-2" />
          Add Custom Notification
        </Button>
      </CardContent>
    </Card>
  );
};
