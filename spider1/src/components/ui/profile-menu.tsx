import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  Settings, 
  LogOut, 
  ChevronDown,
  Shield,
  Bell,
  Package,
  TrendingUp,
  Brain,
  Pill
} from "lucide-react";
import { Link } from "react-router-dom";

interface ProfileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: "admin" | "manager" | "staff" | "supplier";
}

export const ProfileMenu: React.FC<ProfileMenuProps> = ({
  isOpen,
  onClose,
  userRole = "admin"
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getUserInfo = () => {
    switch (userRole) {
      case "admin":
        return {
          name: "Admin User",
          email: "admin@medchain.com",
          avatar: "A",
          role: "System Administrator",
          color: "bg-red-500"
        };
      case "manager":
        return {
          name: "Manager User",
          email: "manager@medchain.com",
          avatar: "M",
          role: "Inventory Manager",
          color: "bg-blue-500"
        };
      case "staff":
        return {
          name: "Staff User",
          email: "staff@medchain.com",
          avatar: "S",
          role: "Medical Staff",
          color: "bg-green-500"
        };
      case "supplier":
        return {
          name: "Supplier User",
          email: "supplier@medchain.com",
          avatar: "S",
          role: "Medicine Supplier",
          color: "bg-purple-500"
        };
      default:
        return {
          name: "User",
          email: "user@medchain.com",
          avatar: "U",
          role: "User",
          color: "bg-gray-500"
        };
    }
  };

  const getRolePermissions = () => {
    switch (userRole) {
      case "admin":
        return [
          { name: "System Settings", icon: Settings, href: "/admin/settings", color: "text-blue-600" },
          { name: "User Management", icon: User, href: "/admin/users", color: "text-green-600" },
          { name: "System Analytics", icon: TrendingUp, href: "/admin/analytics", color: "text-purple-600" },
          { name: "Security Settings", icon: Shield, href: "/admin/security", color: "text-red-600" }
        ];
      case "manager":
        return [
          { name: "Inventory Settings", icon: Package, href: "/manager/inventory-settings", color: "text-blue-600" },
          { name: "Staff Management", icon: User, href: "/manager/staff", color: "text-green-600" },
          { name: "Reports & Analytics", icon: TrendingUp, href: "/manager/reports", color: "text-purple-600" },
          { name: "Notification Settings", icon: Bell, href: "/manager/notifications", color: "text-orange-600" }
        ];
      case "staff":
        return [
          { name: "Personal Settings", icon: User, href: "/staff/profile", color: "text-blue-600" },
          { name: "Work Schedule", icon: Settings, href: "/staff/schedule", color: "text-green-600" },
          { name: "Inventory Access", icon: Package, href: "/staff/inventory", color: "text-purple-600" },
          { name: "Notifications", icon: Bell, href: "/staff/notifications", color: "text-orange-600" }
        ];
      case "supplier":
        return [
          { name: "Supplier Dashboard", icon: TrendingUp, href: "/supplier/dashboard", color: "text-blue-600" },
          { name: "Product Management", icon: Package, href: "/supplier/products", color: "text-green-600" },
          { name: "Order Management", icon: Settings, href: "/supplier/orders", color: "text-purple-600" },
          { name: "Analytics", icon: Brain, href: "/supplier/analytics", color: "text-orange-600" }
        ];
      default:
        return [
          { name: "Profile Settings", icon: User, href: "/profile", color: "text-blue-600" },
          { name: "Preferences", icon: Settings, href: "/settings", color: "text-green-600" }
        ];
    }
  };

  const userInfo = getUserInfo();
  const permissions = getRolePermissions();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end pt-16">
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <Card className="w-80 shadow-2xl border-0 mr-6 mt-2 bg-white/95 backdrop-blur-md">
        <CardContent className="p-0">
          {/* User Info Section */}
          <div className="p-6 border-b bg-gradient-to-r from-gray-50 to-gray-100">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src="" />
                <AvatarFallback className={`${userInfo.color} text-white font-semibold`}>
                  {userInfo.avatar}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{userInfo.name}</h3>
                <p className="text-sm text-gray-600">{userInfo.email}</p>
                <p className="text-xs text-gray-500 mt-1">{userInfo.role}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 hover:bg-gray-200 rounded-full"
              >
                <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
              </Button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="p-4 border-b">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h4>
            <div className="grid grid-cols-2 gap-2">
              <Link to="/profile">
                <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                  <User className="h-3 w-3 mr-2" />
                  Profile
                </Button>
              </Link>
              <Link to="/settings">
                <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                  <Settings className="h-3 w-3 mr-2" />
                  Settings
                </Button>
              </Link>
            </div>
          </div>

          {/* Role-specific Options */}
          {isExpanded && (
            <div className="p-4 border-b">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Role Options</h4>
              <div className="space-y-2">
                {permissions.map((permission, index) => (
                  <Link key={index} to={permission.href}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-xs hover:bg-gray-50"
                    >
                      <permission.icon className={`h-3 w-3 mr-2 ${permission.color}`} />
                      {permission.name}
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="p-4">
            <div className="space-y-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <LogOut className="h-3 w-3 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
