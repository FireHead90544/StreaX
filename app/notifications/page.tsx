"use client";

import { useState, useEffect } from "react";
import { loadAppData, saveAppData } from "@/lib/storage";
import { getNotifications, markNotificationRead, markAllNotificationsRead, getUnreadCount, Notification } from "@/lib/in-app-notifications";
import { Card } from "@/components/retroui/Card";
import { Text } from "@/components/retroui/Text";
import { Button } from "@/components/retroui/Button";
import { Badge } from "@/components/retroui/Badge";
import Link from "next/link";

export default function NotificationsPage() {
    const [appData, setAppData] = useState<any>(null);
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        const data = loadAppData();
        if (data) {
            setAppData(data);
            setNotifications(getNotifications(data));
        }
    }, []);

    const handleMarkRead = (notificationId: string) => {
        if (!appData) return;
        markNotificationRead(appData, notificationId);
        saveAppData(appData);
        setNotifications(getNotifications(appData));
    };

    const handleMarkAllRead = () => {
        if (!appData) return;
        markAllNotificationsRead(appData);
        saveAppData(appData);
        setNotifications(getNotifications(appData));
    };

    const handleClearAll = () => {
        if (!appData) return;
        if (!confirm("Are you sure you want to delete all notifications? This cannot be undone.")) {
            return;
        }
        appData.notifications = [];
        saveAppData(appData);
        setNotifications([]);
    };

    if (!appData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Text as="h2">Loading...</Text>
            </div>
        );
    }

    const unreadCount = getUnreadCount(appData);

    const getTypeStyles = (type: Notification["type"]) => {
        switch (type) {
            case "success":
                return "bg-primary/10 border-primary";
            case "warning":
                return "bg-destructive/10 border-destructive";
            case "milestone":
                return "bg-primary/20 border-primary";
            default:
                return "bg-muted/50 border-border";
        }
    };

    const getTypeIcon = (type: Notification["type"]) => {
        switch (type) {
            case "success":
                return "✅";
            case "warning":
                return "⚠️";
            case "milestone":
                return "🏆";
            default:
                return "ℹ️";
        }
    };

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <Text as="h1" className="text-3xl md:text-5xl font-black">
                            Notifications 🔔
                        </Text>
                        <Text as="p" className="text-muted-foreground text-base md:text-lg mt-1">
                            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
                        </Text>
                    </div>
                    <Link href="/">
                        <Button variant="outline">← Dashboard</Button>
                    </Link>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3 justify-between items-center">
                    {unreadCount > 0 && (
                        <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
                            ✓ Mark All as Read
                        </Button>
                    )}
                    {notifications.length > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleClearAll}
                            className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        >
                            🗑️ Delete All
                        </Button>
                    )}
                </div>

                {/* Notifications List */}
                <div className="space-y-3">
                    {notifications.length === 0 ? (
                        <Card className="p-12 text-center">
                            <Text as="h3" className="text-2xl font-bold mb-2">
                                No notifications yet
                            </Text>
                            <Text as="p" className="text-muted-foreground">
                                We'll notify you about milestones, streaks, and achievements!
                            </Text>
                        </Card>
                    ) : (
                        notifications.map((notification) => (
                            <Card
                                key={notification.id}
                                className={`p-4 ${getTypeStyles(notification.type)} ${!notification.read ? "border-4" : "border-2"
                                    } transition-all cursor-pointer hover:shadow-lg`}
                                onClick={() => !notification.read && handleMarkRead(notification.id)}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="text-3xl flex-shrink-0">{notification.icon || getTypeIcon(notification.type)}</div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between mb-1 gap-2">
                                            <Text as="h3" className="font-bold text-base md:text-lg">
                                                {notification.title}
                                            </Text>
                                            {!notification.read && (
                                                <Badge variant="solid" className="text-xs flex-shrink-0">
                                                    New
                                                </Badge>
                                            )}
                                        </div>
                                        <Text as="p" className="text-sm mb-2">
                                            {notification.message}
                                        </Text>
                                        <Text as="p" className="text-xs text-muted-foreground">
                                            {new Date(notification.timestamp).toLocaleString()}
                                        </Text>
                                    </div>
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
