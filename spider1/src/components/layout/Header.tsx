import { Bell, Shield, User, Brain, TrendingUp, Pill, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useNotifications } from "@/contexts/NotificationContext";
import { NotificationPanel } from "@/components/ui/notification-panel";
import { ProfileMenu } from "@/components/ui/profile-menu";
import { useState } from "react";

export const Header = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userRole] = useState<"admin" | "manager" | "staff" | "supplier">("admin");
  
  const { 
    unreadCount, 
    highPriorityCount, 
    isPanelOpen, 
    openPanel, 
    closePanel,
    notifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll
  } = useNotifications();

  return (
    <>
      <header className="border-b bg-card shadow-card h-16 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold text-foreground">MedChain</h1>
              <p className="text-xs text-muted-foreground">Inventory System</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/infinite-memory">
            <Button variant="outline" className="font-semibold">
              <Brain className="h-4 w-4 mr-2" />
              Infinite Memory
            </Button>
          </Link>

          <Link to="/ml-predictions">
            <Button variant="outline" className="font-semibold">
              <TrendingUp className="h-4 w-4 mr-2" />
              ML Predictions
            </Button>
          </Link>

          <Link to="/medicine-recommendation">
            <Button variant="outline" className="font-semibold">
              <Pill className="h-4 w-4 mr-2" />
              Medicine AI
            </Button>
          </Link>

          <Link to="/inventory">
            <Button variant="outline" className="font-semibold">
              <Package className="h-4 w-4 mr-2" />
              Inventory
            </Button>
          </Link>
          
          <Link to="/marketplace">
            <Button variant="default" className="font-semibold">
              Marketplace 
            </Button>
          </Link>

          <Button 
            variant="ghost" 
            size="icon" 
            className="relative hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 rounded-full p-2"
            onClick={openPanel}
          >
            <Bell className="h-5 w-5" />
            {(unreadCount > 0 || highPriorityCount > 0) && (
              <span className="notification-badge absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg">
                {unreadCount > 0 ? unreadCount : highPriorityCount}
              </span>
            )}
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            className="hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 rounded-full p-2"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            <User className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <NotificationPanel
        isOpen={isPanelOpen}
        onClose={closePanel}
        notifications={notifications}
        onMarkAsRead={markAsRead}
        onDelete={deleteNotification}
        onMarkAllAsRead={markAllAsRead}
        onClearAll={clearAll}
      />

      <ProfileMenu
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        userRole={userRole}
      />
    </>
  );
};