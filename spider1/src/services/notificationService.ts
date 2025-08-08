import { NotificationItem } from "@/components/ui/notification-panel";

export class NotificationService {
  private static instance: NotificationService;
  private notifications: NotificationItem[] = [];
  private listeners: ((notifications: NotificationItem[]) => void)[] = [];
  private notificationId = 0;

  private constructor() {
    this.initializeMockNotifications();
    this.startRealTimeSimulation();
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private generateId(): string {
    return `notification-${++this.notificationId}-${Date.now()}`;
  }

  private initializeMockNotifications() {
    const mockNotifications: NotificationItem[] = [
      {
        id: this.generateId(),
        title: "Low Stock Alert",
        message: "Paracetamol stock is running low. Current stock: 15 units",
        type: "warning",
        category: "inventory",
        timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
        read: false,
        priority: "high",
        actionUrl: "/inventory"
      },
      {
        id: this.generateId(),
        title: "ML Prediction Complete",
        message: "Medicine demand prediction for next month has been calculated",
        type: "success",
        category: "ml",
        timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
        read: false,
        priority: "medium",
        actionUrl: "/ml-predictions"
      },
      {
        id: this.generateId(),
        title: "New Marketplace Order",
        message: "Order #12345 has been placed for 50 units of Aspirin",
        type: "info",
        category: "marketplace",
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        read: true,
        priority: "medium",
        actionUrl: "/marketplace"
      },
      {
        id: this.generateId(),
        title: "AI Medicine Recommendation",
        message: "New medicine recommendation available for patient consultation",
        type: "info",
        category: "ai",
        timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
        read: true,
        priority: "low",
        actionUrl: "/medicine-recommendation"
      },
      {
        id: this.generateId(),
        title: "System Update",
        message: "Blockchain synchronization completed successfully",
        type: "success",
        category: "system",
        timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
        read: true,
        priority: "low"
      }
    ];

    this.notifications = mockNotifications;
    this.notifyListeners();
  }

  private startRealTimeSimulation() {
    // Simulate real-time notifications
    setInterval(() => {
      const random = Math.random();
      
      if (random < 0.3) { // 30% chance of new notification
        this.addRandomNotification();
      }
    }, 30000); // Check every 30 seconds
  }

  private addRandomNotification() {
    const notificationTypes = [
      {
        title: "Inventory Update",
        message: "Stock levels have been updated for multiple items",
        type: "info" as const,
        category: "inventory" as const,
        priority: "medium" as const
      },
      {
        title: "Marketplace Activity",
        message: "New supplier has joined the marketplace",
        type: "success" as const,
        category: "marketplace" as const,
        priority: "low" as const
      },
      {
        title: "ML Model Training",
        message: "New prediction model training has started",
        type: "info" as const,
        category: "ml" as const,
        priority: "medium" as const
      },
      {
        title: "Critical Stock Alert",
        message: "Emergency medicine stock is critically low",
        type: "error" as const,
        category: "inventory" as const,
        priority: "high" as const
      },
      {
        title: "AI Analysis Complete",
        message: "Medicine interaction analysis completed",
        type: "success" as const,
        category: "ai" as const,
        priority: "low" as const
      }
    ];

    const randomNotification = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
    
    const newNotification: NotificationItem = {
      id: this.generateId(),
      title: randomNotification.title,
      message: randomNotification.message,
      type: randomNotification.type,
      category: randomNotification.category,
      timestamp: new Date(),
      read: false,
      priority: randomNotification.priority
    };

    this.notifications.unshift(newNotification);
    
    // Keep only last 50 notifications
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(0, 50);
    }
    
    this.notifyListeners();
  }

  addNotification(notification: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>): void {
    const newNotification: NotificationItem = {
      ...notification,
      id: this.generateId(),
      timestamp: new Date(),
      read: false
    };

    this.notifications.unshift(newNotification);
    this.notifyListeners();
  }

  markAsRead(id: string): void {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
      this.notifyListeners();
    }
  }

  markAllAsRead(): void {
    this.notifications.forEach(notification => {
      notification.read = true;
    });
    this.notifyListeners();
  }

  deleteNotification(id: string): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notifyListeners();
  }

  clearAll(): void {
    this.notifications = [];
    this.notifyListeners();
  }

  getNotifications(): NotificationItem[] {
    return [...this.notifications];
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  getHighPriorityCount(): number {
    return this.notifications.filter(n => n.priority === "high").length;
  }

  subscribe(listener: (notifications: NotificationItem[]) => void): () => void {
    this.listeners.push(listener);
    listener(this.notifications); // Initial call
    
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      listener([...this.notifications]);
    });
  }

  // Simulate external events
  simulateInventoryAlert(itemName: string, currentStock: number): void {
    this.addNotification({
      title: "Low Stock Alert",
      message: `${itemName} stock is running low. Current stock: ${currentStock} units`,
      type: "warning",
      category: "inventory",
      priority: "high",
      actionUrl: "/inventory"
    });
  }

  simulateMarketplaceOrder(orderId: string, productName: string, quantity: number): void {
    this.addNotification({
      title: "New Marketplace Order",
      message: `Order #${orderId} has been placed for ${quantity} units of ${productName}`,
      type: "info",
      category: "marketplace",
      priority: "medium",
      actionUrl: "/marketplace"
    });
  }

  simulateMLPrediction(accuracy: number): void {
    this.addNotification({
      title: "ML Prediction Complete",
      message: `Medicine demand prediction completed with ${accuracy}% accuracy`,
      type: "success",
      category: "ml",
      priority: "medium",
      actionUrl: "/ml-predictions"
    });
  }

  simulateAIRecommendation(medicineName: string): void {
    this.addNotification({
      title: "AI Medicine Recommendation",
      message: `New recommendation available for ${medicineName}`,
      type: "info",
      category: "ai",
      priority: "low",
      actionUrl: "/medicine-recommendation"
    });
  }
}
