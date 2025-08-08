import React, { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Shield,
  Settings,
  Bell,
  Package,
  TrendingUp,
  Brain,
  Pill,
  Edit,
  Save,
  Camera
} from "lucide-react";

const Profile = () => {
  const [userRole] = useState<"admin" | "manager" | "staff" | "supplier">("admin");
  const [isEditing, setIsEditing] = useState(false);

  const getUserInfo = () => {
    switch (userRole) {
      case "admin":
        return {
          name: "Admin User",
          email: "admin@medchain.com",
          phone: "+1 (555) 123-4567",
          location: "System Headquarters",
          avatar: "A",
          role: "System Administrator",
          color: "bg-red-500",
          department: "IT Administration",
          joinDate: "2023-01-15",
          permissions: ["Full System Access", "User Management", "Security Settings", "Analytics"]
        };
      case "manager":
        return {
          name: "Manager User",
          email: "manager@medchain.com",
          phone: "+1 (555) 234-5678",
          location: "Inventory Department",
          avatar: "M",
          role: "Inventory Manager",
          color: "bg-blue-500",
          department: "Inventory Management",
          joinDate: "2023-03-20",
          permissions: ["Inventory Management", "Staff Supervision", "Reports Access", "Settings Control"]
        };
      case "staff":
        return {
          name: "Staff User",
          email: "staff@medchain.com",
          phone: "+1 (555) 345-6789",
          location: "Medical Ward A",
          avatar: "S",
          role: "Medical Staff",
          color: "bg-green-500",
          department: "Medical Services",
          joinDate: "2023-06-10",
          permissions: ["Patient Care", "Inventory Access", "Schedule Management", "Notifications"]
        };
      case "supplier":
        return {
          name: "Supplier User",
          email: "supplier@medchain.com",
          phone: "+1 (555) 456-7890",
          location: "Pharmaceutical Corp",
          avatar: "S",
          role: "Medicine Supplier",
          color: "bg-purple-500",
          department: "Supply Chain",
          joinDate: "2023-02-05",
          permissions: ["Product Management", "Order Processing", "Analytics Access", "Communication"]
        };
      default:
        return {
          name: "User",
          email: "user@medchain.com",
          phone: "+1 (555) 000-0000",
          location: "General",
          avatar: "U",
          role: "User",
          color: "bg-gray-500",
          department: "General",
          joinDate: "2023-01-01",
          permissions: ["Basic Access", "Profile Management"]
        };
    }
  };

  const userInfo = getUserInfo();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Profile Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Profile</h1>
              <p className="text-muted-foreground mt-2">Manage your account settings and preferences</p>
            </div>
            <Button onClick={() => setIsEditing(!isEditing)}>
              <Edit className="h-4 w-4 mr-2" />
              {isEditing ? "Cancel" : "Edit Profile"}
            </Button>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                {/* Profile Card */}
                <Card className="md:col-span-1">
                  <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                      <div className="relative">
                        <Avatar className="h-24 w-24">
                          <AvatarImage src="" />
                          <AvatarFallback className={`${userInfo.color} text-white text-2xl font-bold`}>
                            {userInfo.avatar}
                          </AvatarFallback>
                        </Avatar>
                        {isEditing && (
                          <Button size="sm" className="absolute -bottom-2 -right-2 rounded-full p-1">
                            <Camera className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <CardTitle className="text-xl">{userInfo.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{userInfo.role}</p>
                    <Badge variant="outline" className="mt-2">
                      {userInfo.department}
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{userInfo.email}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{userInfo.phone}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{userInfo.location}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Joined {userInfo.joinDate}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Permissions & Role Info */}
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Role & Permissions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Current Role</h4>
                        <Badge className={`${userInfo.color} text-white`}>
                          {userInfo.role}
                        </Badge>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Permissions</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {userInfo.permissions.map((permission, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {permission}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Role-specific Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {userRole === "admin" && <Shield className="h-5 w-5" />}
                    {userRole === "manager" && <Package className="h-5 w-5" />}
                    {userRole === "staff" && <User className="h-5 w-5" />}
                    {userRole === "supplier" && <TrendingUp className="h-5 w-5" />}
                    {userRole.charAt(0).toUpperCase() + userRole.slice(1)} Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {userRole === "admin" && (
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">System Access</h4>
                        <p className="text-sm text-muted-foreground">
                          Full administrative access to all system features including user management, 
                          security settings, and system analytics.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Recent Activities</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>User Management</span>
                            <span className="text-muted-foreground">2 hours ago</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Security Audit</span>
                            <span className="text-muted-foreground">1 day ago</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {userRole === "manager" && (
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Inventory Management</h4>
                        <p className="text-sm text-muted-foreground">
                          Oversee inventory operations, manage staff, and generate reports 
                          for the medical facility.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Team Overview</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Staff Members</span>
                            <span className="text-muted-foreground">12</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Active Orders</span>
                            <span className="text-muted-foreground">8</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {userRole === "staff" && (
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Medical Access</h4>
                        <p className="text-sm text-muted-foreground">
                          Access to patient care systems, inventory for medical supplies, 
                          and work schedule management.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Work Schedule</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Current Shift</span>
                            <span className="text-muted-foreground">Day Shift</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Next Break</span>
                            <span className="text-muted-foreground">2:30 PM</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {userRole === "supplier" && (
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Supply Chain</h4>
                        <p className="text-sm text-muted-foreground">
                          Manage product catalog, process orders, and track delivery 
                          status for medical supplies.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Order Status</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Pending Orders</span>
                            <span className="text-muted-foreground">5</span>
                          </div>
                          <div className="flex justify-between">
                            <span>This Month Revenue</span>
                            <span className="text-muted-foreground">$45,230</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" defaultValue={userInfo.name} disabled={!isEditing} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" defaultValue={userInfo.email} disabled={!isEditing} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" defaultValue={userInfo.phone} disabled={!isEditing} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input id="location" defaultValue={userInfo.location} disabled={!isEditing} />
                    </div>
                  </div>
                  {isEditing && (
                    <div className="flex gap-2">
                      <Button>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                      <Button variant="outline">Cancel</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Password</h4>
                      <Button variant="outline">Change Password</Button>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Two-Factor Authentication</h4>
                      <Button variant="outline">Enable 2FA</Button>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Login Sessions</h4>
                      <Button variant="outline">View Active Sessions</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Settings className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">Profile Updated</p>
                          <p className="text-sm text-muted-foreground">2 hours ago</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Shield className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">Password Changed</p>
                          <p className="text-sm text-muted-foreground">1 day ago</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Bell className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium">Notification Settings Updated</p>
                          <p className="text-sm text-muted-foreground">3 days ago</p>
                        </div>
                      </div>
                    </div>
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

export default Profile;
