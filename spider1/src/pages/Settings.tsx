import React, { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Bell, 
  Shield, 
  Palette, 
  Globe,
  Monitor,
  Smartphone,
  Database,
  Users,
  Package,
  TrendingUp,
  Brain,
  Save,
  RotateCcw
} from "lucide-react";

const Settings = () => {
  const [userRole] = useState<"admin" | "manager" | "staff" | "supplier">("admin");
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    inventory: true,
    security: true,
    updates: false
  });
  const [theme, setTheme] = useState("system");
  const [language, setLanguage] = useState("en");
  const [timezone, setTimezone] = useState("UTC");

  const getRoleSettings = () => {
    switch (userRole) {
      case "admin":
        return {
          title: "System Settings",
          description: "Manage system-wide configurations and security",
          icon: Shield,
          color: "text-red-600",
          bgColor: "bg-red-50",
          sections: [
            {
              title: "System Configuration",
              items: [
                { name: "Database Backup", description: "Automated backup schedule", value: "Daily" },
                { name: "Security Level", description: "System security settings", value: "High" },
                { name: "User Sessions", description: "Active user sessions", value: "24" },
                { name: "System Updates", description: "Auto-update settings", value: "Enabled" }
              ]
            },
            {
              title: "User Management",
              items: [
                { name: "User Registration", description: "Allow new user registration", value: "Enabled" },
                { name: "Role Permissions", description: "Role-based access control", value: "Active" },
                { name: "Audit Logs", description: "System activity logging", value: "Enabled" },
                { name: "API Access", description: "External API permissions", value: "Restricted" }
              ]
            }
          ]
        };
      case "manager":
        return {
          title: "Inventory Settings",
          description: "Configure inventory management preferences",
          icon: Package,
          color: "text-blue-600",
          bgColor: "bg-blue-50",
          sections: [
            {
              title: "Inventory Configuration",
              items: [
                { name: "Low Stock Alerts", description: "Stock threshold notifications", value: "Enabled" },
                { name: "Auto Reorder", description: "Automatic reorder system", value: "Enabled" },
                { name: "Supplier Management", description: "Supplier contact settings", value: "Active" },
                { name: "Report Generation", description: "Automated reports", value: "Weekly" }
              ]
            },
            {
              title: "Staff Management",
              items: [
                { name: "Staff Permissions", description: "Staff access levels", value: "Role-based" },
                { name: "Work Schedules", description: "Staff scheduling system", value: "Enabled" },
                { name: "Performance Tracking", description: "Staff performance metrics", value: "Active" },
                { name: "Training Modules", description: "Staff training access", value: "Available" }
              ]
            }
          ]
        };
      case "staff":
        return {
          title: "Personal Settings",
          description: "Manage your personal preferences and access",
          icon: Users,
          color: "text-green-600",
          bgColor: "bg-green-50",
          sections: [
            {
              title: "Work Preferences",
              items: [
                { name: "Shift Preferences", description: "Preferred work shifts", value: "Day Shift" },
                { name: "Break Schedule", description: "Break time settings", value: "30 min" },
                { name: "Inventory Access", description: "Medicine access level", value: "Limited" },
                { name: "Patient Records", description: "Patient data access", value: "Read-only" }
              ]
            },
            {
              title: "Communication",
              items: [
                { name: "Emergency Alerts", description: "Critical situation notifications", value: "Enabled" },
                { name: "Team Messages", description: "Team communication settings", value: "Active" },
                { name: "Patient Updates", description: "Patient status notifications", value: "Enabled" },
                { name: "Schedule Changes", description: "Schedule update notifications", value: "Enabled" }
              ]
            }
          ]
        };
      case "supplier":
        return {
          title: "Supplier Settings",
          description: "Manage your supplier account and preferences",
          icon: TrendingUp,
          color: "text-purple-600",
          bgColor: "bg-purple-50",
          sections: [
            {
              title: "Product Management",
              items: [
                { name: "Product Catalog", description: "Product listing settings", value: "Active" },
                { name: "Pricing Updates", description: "Price change notifications", value: "Enabled" },
                { name: "Inventory Sync", description: "Real-time inventory sync", value: "Enabled" },
                { name: "Order Processing", description: "Order automation", value: "Active" }
              ]
            },
            {
              title: "Communication",
              items: [
                { name: "Order Notifications", description: "New order alerts", value: "Enabled" },
                { name: "Delivery Updates", description: "Delivery status updates", value: "Enabled" },
                { name: "Payment Alerts", description: "Payment notifications", value: "Enabled" },
                { name: "Market Updates", description: "Market trend notifications", value: "Weekly" }
              ]
            }
          ]
        };
      default:
        return {
          title: "General Settings",
          description: "Manage your account preferences",
          icon: Settings,
          color: "text-gray-600",
          bgColor: "bg-gray-50",
          sections: []
        };
    }
  };

  const roleSettings = getRoleSettings();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Settings Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Settings</h1>
              <p className="text-muted-foreground mt-2">{roleSettings.description}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset to Default
              </Button>
              <Button>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>

          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="role">Role Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" defaultValue="user@medchain.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="language">Language</Label>
                      <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                          <SelectItem value="de">German</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select value={timezone} onValueChange={setTimezone}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UTC">UTC</SelectItem>
                          <SelectItem value="EST">Eastern Time</SelectItem>
                          <SelectItem value="PST">Pacific Time</SelectItem>
                          <SelectItem value="GMT">GMT</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Device Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Desktop Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive notifications on desktop</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Mobile Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive notifications on mobile</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Auto-logout</Label>
                        <p className="text-sm text-muted-foreground">Automatically logout after inactivity</p>
                      </div>
                      <Switch />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium">Email Notifications</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label>System Updates</Label>
                          <Switch 
                            checked={notifications.updates} 
                            onCheckedChange={(checked) => setNotifications({...notifications, updates: checked})}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Security Alerts</Label>
                          <Switch 
                            checked={notifications.security} 
                            onCheckedChange={(checked) => setNotifications({...notifications, security: checked})}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Inventory Alerts</Label>
                          <Switch 
                            checked={notifications.inventory} 
                            onCheckedChange={(checked) => setNotifications({...notifications, inventory: checked})}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium">Push Notifications</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label>Real-time Updates</Label>
                          <Switch 
                            checked={notifications.push} 
                            onCheckedChange={(checked) => setNotifications({...notifications, push: checked})}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>SMS Notifications</Label>
                          <Switch 
                            checked={notifications.sms} 
                            onCheckedChange={(checked) => setNotifications({...notifications, sms: checked})}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Email Digest</Label>
                          <Switch 
                            checked={notifications.email} 
                            onCheckedChange={(checked) => setNotifications({...notifications, email: checked})}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appearance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Appearance Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium">Theme</h4>
                      <Select value={theme} onValueChange={setTheme}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium">Display</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label>Compact Mode</Label>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Show Animations</Label>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium">Authentication</h4>
                      <div className="space-y-3">
                        <Button variant="outline" className="w-full justify-start">
                          <Shield className="h-4 w-4 mr-2" />
                          Change Password
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <Shield className="h-4 w-4 mr-2" />
                          Enable Two-Factor Auth
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <Shield className="h-4 w-4 mr-2" />
                          View Login History
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium">Privacy</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label>Data Collection</Label>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Analytics</Label>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Location Services</Label>
                          <Switch />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="role" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <roleSettings.icon className={`h-5 w-5 ${roleSettings.color}`} />
                    {roleSettings.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {roleSettings.sections.map((section, sectionIndex) => (
                      <div key={sectionIndex} className="space-y-4">
                        <h4 className="font-medium text-lg">{section.title}</h4>
                        <div className="grid md:grid-cols-2 gap-4">
                          {section.items.map((item, itemIndex) => (
                            <div key={itemIndex} className="p-4 border rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="font-medium">{item.name}</h5>
                                <Badge variant="outline">{item.value}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{item.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Settings;
