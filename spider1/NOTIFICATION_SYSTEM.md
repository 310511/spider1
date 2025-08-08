# Notification System

## Overview

The notification system provides real-time, interactive notifications with a pop-out panel accessible from the main navigation bar. It includes comprehensive filtering, categorization, and priority management.

## Features

### 🎯 Real-time Notifications
- Live updates with simulated real-time data
- Automatic notification generation every 30 seconds
- Priority-based notification display

### 📱 Interactive Panel
- Pop-out notification panel with smooth animations
- Click outside to close functionality
- Responsive design for all screen sizes

### 🔍 Advanced Filtering
- **Filter by Status**: All, Unread, High Priority
- **Filter by Category**: Inventory, Marketplace, ML, AI, System
- **Real-time Counters**: Unread count and high priority count

### 🎨 Visual Design
- **Color-coded notifications**: Success (green), Error (red), Warning (yellow), Info (blue)
- **Priority indicators**: High (red), Medium (yellow), Low (green)
- **Category icons**: Different icons for each notification category
- **Timestamp display**: Relative time (e.g., "5m ago", "2h ago")

### ⚡ Functionality
- **Mark as read**: Click any notification to mark it as read
- **Delete notifications**: Individual delete with X button
- **Bulk actions**: Mark all as read, Clear all notifications
- **Auto-cleanup**: Keeps only last 50 notifications

## Components

### NotificationPanel
The main pop-out panel component with:
- Filter controls
- Category filters
- Action buttons
- Scrollable notification list
- Empty state display

### NotificationService
Singleton service managing:
- Real-time notification simulation
- Notification CRUD operations
- Event listeners and subscribers
- Mock data generation

### NotificationContext
React context providing:
- Global notification state
- Panel open/close management
- Notification actions (mark as read, delete, etc.)
- Real-time updates

## Usage

### Basic Usage
```tsx
import { useNotifications } from '@/contexts/NotificationContext';

const MyComponent = () => {
  const { 
    notifications, 
    unreadCount, 
    openPanel, 
    addNotification 
  } = useNotifications();

  // Add a notification
  addNotification({
    title: "Custom Alert",
    message: "This is a custom notification",
    type: "info",
    category: "system",
    priority: "medium"
  });

  return (
    <button onClick={openPanel}>
      Notifications ({unreadCount})
    </button>
  );
};
```

### Service Methods
```tsx
import { NotificationService } from '@/services/notificationService';

const service = NotificationService.getInstance();

// Simulate specific events
service.simulateInventoryAlert("Paracetamol", 5);
service.simulateMarketplaceOrder("12345", "Aspirin", 100);
service.simulateMLPrediction(95);
service.simulateAIRecommendation("Amoxicillin");
```

## Notification Types

### Categories
- **Inventory**: Stock alerts, updates, low stock warnings
- **Marketplace**: Orders, transactions, supplier updates
- **ML**: Predictions, model training, analysis results
- **AI**: Recommendations, analysis, AI insights
- **System**: General system updates, blockchain sync

### Priorities
- **High**: Critical alerts, low stock, errors
- **Medium**: Important updates, successful operations
- **Low**: General information, routine updates

### Types
- **Success**: Green, positive outcomes
- **Error**: Red, critical issues
- **Warning**: Yellow, caution alerts
- **Info**: Blue, general information

## Real-time Features

### Automatic Generation
- Random notifications every 30 seconds
- 30% chance of new notification per cycle
- Maintains realistic notification flow

### Live Updates
- Real-time badge updates
- Instant panel refresh
- Smooth animations and transitions

### Smart Filtering
- Dynamic filter counts
- Real-time category filtering
- Priority-based sorting

## Testing

Use the NotificationTest component on the main dashboard to:
- Trigger inventory alerts
- Simulate marketplace orders
- Generate ML predictions
- Create AI recommendations
- Add custom notifications

## Integration

The notification system is integrated with:
- Main navigation header
- Global app state
- Real-time data simulation
- Responsive design system

## Future Enhancements

- WebSocket integration for real-time updates
- Push notifications
- Email notifications
- Custom notification sounds
- Advanced filtering options
- Notification preferences
- Export functionality
