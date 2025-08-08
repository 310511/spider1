import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Package, Users, TrendingUp } from 'lucide-react';

interface RoleSwitcherProps {
  currentRole: string;
  onRoleChange: (role: "admin" | "manager" | "staff" | "supplier") => void;
}

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({ currentRole, onRoleChange }) => {
  const roles = [
    {
      id: "admin",
      name: "Admin",
      description: "System Administrator",
      icon: Shield,
      color: "bg-red-500",
      textColor: "text-red-600"
    },
    {
      id: "manager",
      name: "Manager",
      description: "Inventory Manager",
      icon: Package,
      color: "bg-blue-500",
      textColor: "text-blue-600"
    },
    {
      id: "staff",
      name: "Staff",
      description: "Medical Staff",
      icon: Users,
      color: "bg-green-500",
      textColor: "text-green-600"
    },
    {
      id: "supplier",
      name: "Supplier",
      description: "Medicine Supplier",
      icon: TrendingUp,
      color: "bg-purple-500",
      textColor: "text-purple-600"
    }
  ];

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Role Switcher</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {roles.map((role) => (
          <Button
            key={role.id}
            variant={currentRole === role.id ? "default" : "outline"}
            className={`w-full justify-start h-auto p-3 ${
              currentRole === role.id ? role.color : ""
            }`}
            onClick={() => onRoleChange(role.id as "admin" | "manager" | "staff" | "supplier")}
          >
            <div className="flex items-center gap-3 w-full">
              <div className={`p-2 rounded-lg ${
                currentRole === role.id ? "bg-white/20" : "bg-gray-100"
              }`}>
                <role.icon className={`h-4 w-4 ${
                  currentRole === role.id ? "text-white" : role.textColor
                }`} />
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium">{role.name}</div>
                <div className={`text-xs ${
                  currentRole === role.id ? "text-white/80" : "text-muted-foreground"
                }`}>
                  {role.description}
                </div>
              </div>
              {currentRole === role.id && (
                <Badge variant="secondary" className="bg-white/20 text-white">
                  Active
                </Badge>
              )}
            </div>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
};
