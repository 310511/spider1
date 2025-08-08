import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  CheckCircle, 
  AlertCircle, 
  Info, 
  X, 
  Clock, 
  Package, 
  TrendingUp, 
  Brain,
  Pill,
  Bell,
  Settings,
  Trash2
} from "lucide-react";
import { useBlockchain } from "@/contexts/BlockchainContext";
import "./notification-panel.css";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
  category: "inventory" | "marketplace" | "ml" | "ai" | "system";
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  priority: "low" | "medium" | "high";
}

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onDelete,
  onMarkAllAsRead,
  onClearAll,
}) => {
  const [filter, setFilter] = useState<"all" | "unread" | "high">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const filteredNotifications = notifications.filter((notification) => {
    const matchesFilter = filter === "all" || 
      (filter === "unread" && !notification.read) ||
      (filter === "high" && notification.priority === "high");
    
    const matchesCategory = categoryFilter === "all" || 
      notification.category === categoryFilter;
    
    return matchesFilter && matchesCategory;
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  const highPriorityCount = notifications.filter(n => n.priority === "high").length;

  const getNotificationIcon = (category: string) => {
    switch (category) {
      case "inventory":
        return <Package className="h-4 w-4" />;
      case "marketplace":
        return <TrendingUp className="h-4 w-4" />;
      case "ml":
        return <Brain className="h-4 w-4" />;
      case "ai":
        return <Pill className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "success":
        return "border-green-200 bg-gradient-to-r from-green-50 to-emerald-50";
      case "error":
        return "border-red-200 bg-gradient-to-r from-red-50 to-pink-50";
      case "warning":
        return "border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50";
      default:
        return "border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      default:
        return "bg-green-500";
    }
  };

  const getNotificationIconBg = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-100 text-green-600";
      case "error":
        return "bg-red-100 text-red-600";
      case "warning":
        return "bg-yellow-100 text-yellow-600";
      default:
        return "bg-blue-100 text-blue-600";
    }
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case "inventory":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "marketplace":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "ml":
        return "bg-green-50 text-green-700 border-green-200";
      case "ai":
        return "bg-pink-50 text-pink-700 border-pink-200";
      case "system":
        return "bg-gray-50 text-gray-700 border-gray-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end pt-16">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <Card className="notification-panel w-[420px] max-h-[700px] shadow-2xl border-0 mr-6 mt-2 glass-effect">
        <CardHeader className="pb-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-gray-900">Notifications</CardTitle>
                <p className="text-xs text-gray-500 mt-1">Stay updated with real-time alerts</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-xs font-semibold px-2 py-1">
                  {unreadCount}
                </Badge>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClose}
                className="hover:bg-gray-100 rounded-full p-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Filter Controls */}
          <div className="flex flex-wrap gap-2 mt-4">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              className={`rounded-full px-4 py-1 text-xs font-medium transition-all ${
                filter === "all" 
                  ? "bg-primary text-white shadow-md" 
                  : "hover:bg-gray-50 border-gray-200"
              }`}
              onClick={() => setFilter("all")}
            >
              All
            </Button>
            <Button
              variant={filter === "unread" ? "default" : "outline"}
              size="sm"
              className={`rounded-full px-4 py-1 text-xs font-medium transition-all ${
                filter === "unread" 
                  ? "bg-primary text-white shadow-md" 
                  : "hover:bg-gray-50 border-gray-200"
              }`}
              onClick={() => setFilter("unread")}
            >
              Unread ({unreadCount})
            </Button>
            <Button
              variant={filter === "high" ? "default" : "outline"}
              size="sm"
              className={`rounded-full px-4 py-1 text-xs font-medium transition-all ${
                filter === "high" 
                  ? "bg-primary text-white shadow-md" 
                  : "hover:bg-gray-50 border-gray-200"
              }`}
              onClick={() => setFilter("high")}
            >
              High Priority ({highPriorityCount})
            </Button>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-1 mt-3">
            {["all", "inventory", "marketplace", "ml", "ai", "system"].map((category) => (
              <Button
                key={category}
                variant={categoryFilter === category ? "default" : "outline"}
                size="sm"
                className={`text-xs rounded-full px-3 py-1 font-medium transition-all ${
                  categoryFilter === category 
                    ? "bg-blue-100 text-blue-700 border-blue-200" 
                    : "hover:bg-gray-50 border-gray-200 text-gray-600"
                }`}
                onClick={() => setCategoryFilter(category)}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onMarkAllAsRead}
              className="rounded-full px-4 py-1 text-xs font-medium hover:bg-green-50 hover:border-green-200 hover:text-green-700"
            >
              Mark All Read
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onClearAll}
              className="rounded-full px-4 py-1 text-xs font-medium hover:bg-red-50 hover:border-red-200 hover:text-red-700"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Clear All
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <div className="p-4 bg-gray-100 rounded-full mb-4">
                  <Bell className="h-8 w-8" />
                </div>
                <p className="text-sm font-medium text-gray-500">No notifications</p>
                <p className="text-xs text-gray-400 mt-1">You're all caught up!</p>
              </div>
            ) : (
              <div className="space-y-3 p-4">
                {filteredNotifications.map((notification, index) => (
                  <Card
                    key={notification.id}
                    className={`notification-item hover-lift ${getNotificationColor(notification.type)} ${
                      !notification.read ? "ring-2 ring-blue-200 shadow-lg" : "shadow-sm"
                    } transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer group border-0 overflow-hidden`}
                    onClick={() => onMarkAsRead(notification.id)}
                    style={{
                      animationDelay: `${index * 50}ms`
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1">
                          <div className={`p-2 rounded-lg ${getNotificationIconBg(notification.type)}`}>
                            {getNotificationIcon(notification.category)}
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="text-sm font-semibold text-gray-900">
                                  {notification.title}
                                </h4>
                                <div className={`w-2 h-2 rounded-full ${getPriorityColor(notification.priority)} animate-pulse`} />
                              </div>
                              <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                                {notification.message}
                              </p>
                              <div className="flex items-center gap-3 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatTimestamp(notification.timestamp)}
                                </div>
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs px-2 py-1 rounded-full ${getCategoryBadgeColor(notification.category)}`}
                                >
                                  {notification.category}
                                </Badge>
                              </div>
                            </div>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-100 hover:text-red-600 rounded-full"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete(notification.id);
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
      

    </div>
  );
};
