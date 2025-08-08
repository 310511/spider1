import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { NotificationItem } from '@/components/ui/notification-panel';
import { NotificationService } from '@/services/notificationService';

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  highPriorityCount: number;
  isPanelOpen: boolean;
  openPanel: () => void;
  closePanel: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
  addNotification: (notification: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [highPriorityCount, setHighPriorityCount] = useState(0);

  const notificationService = NotificationService.getInstance();

  useEffect(() => {
    // Subscribe to notification updates
    const unsubscribe = notificationService.subscribe((updatedNotifications) => {
      setNotifications(updatedNotifications);
      setUnreadCount(notificationService.getUnreadCount());
      setHighPriorityCount(notificationService.getHighPriorityCount());
    });

    return unsubscribe;
  }, []);

  const openPanel = () => setIsPanelOpen(true);
  const closePanel = () => setIsPanelOpen(false);

  const markAsRead = (id: string) => {
    notificationService.markAsRead(id);
  };

  const markAllAsRead = () => {
    notificationService.markAllAsRead();
  };

  const deleteNotification = (id: string) => {
    notificationService.deleteNotification(id);
  };

  const clearAll = () => {
    notificationService.clearAll();
  };

  const addNotification = (notification: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => {
    notificationService.addNotification(notification);
  };

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    highPriorityCount,
    isPanelOpen,
    openPanel,
    closePanel,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    addNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
