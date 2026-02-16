export interface Notification {
    id: string;
    type: "info" | "success" | "warning" | "milestone";
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
    icon?: string;
}

export interface AppNotificationState {
    notifications: Notification[];
    unreadCount: number;
}

// Add notification to app data
export const addNotification = (
    appData: any,
    type: Notification["type"],
    title: string,
    message: string,
    icon?: string
): void => {
    if (!appData.notifications) {
        appData.notifications = [];
    }

    const notification: Notification = {
        id: `${Date.now()}-${Math.random()}`,
        type,
        title,
        message,
        timestamp: new Date().toISOString(),
        read: false,
        icon,
    };

    appData.notifications.unshift(notification);

    // Keep only last 50 notifications
    if (appData.notifications.length > 50) {
        appData.notifications = appData.notifications.slice(0, 50);
    }
};

export const markNotificationRead = (appData: any, notificationId: string): void => {
    const notification = appData.notifications?.find((n: Notification) => n.id === notificationId);
    if (notification) {
        notification.read = true;
    }
};

export const markAllNotificationsRead = (appData: any): void => {
    appData.notifications?.forEach((n: Notification) => {
        n.read = true;
    });
};

export const getUnreadCount = (appData: any): number => {
    return appData.notifications?.filter((n: Notification) => !n.read).length || 0;
};

export const getNotifications = (appData: any, limit?: number): Notification[] => {
    const notifications = appData.notifications || [];
    return limit ? notifications.slice(0, limit) : notifications;
};
