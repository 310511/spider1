import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";
import { AppNotification } from "@/contexts/BlockchainContext";

interface NotificationsProps {
  notifications: AppNotification[];
  onRemove: (id: string) => void;
}

export const Notifications: React.FC<NotificationsProps> = ({ notifications, onRemove }) => {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getNotificationTextColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      default:
        return 'text-blue-800';
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <Card 
          key={notification.id} 
          className={`${getNotificationColor(notification.type)} border transition-all duration-300`}
        >
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              {getNotificationIcon(notification.type)}
              <span className={`text-sm font-medium ${getNotificationTextColor(notification.type)}`}>
                {notification.message}
              </span>
              <button
                onClick={() => onRemove(notification.id)}
                className="ml-auto text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}; 