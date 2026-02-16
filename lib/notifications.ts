// Notification utilities
export const requestNotificationPermission = async (): Promise<boolean> => {
    if (typeof window === "undefined" || !("Notification" in window)) {
        console.log("Notifications not supported");
        return false;
    }

    if (Notification.permission === "granted") {
        return true;
    }

    if (Notification.permission !== "denied") {
        const permission = await Notification.requestPermission();
        return permission === "granted";
    }

    return false;
};

export const sendNotification = (title: string, body: string, icon?: string) => {
    if (typeof window === "undefined" || !("Notification" in window)) {
        return;
    }

    if (Notification.permission === "granted") {
        new Notification(title, {
            body,
            icon: icon || "/icon-192.png",
            badge: "/icon-192.png",
        });
    }
};

export const scheduleDailyReminder = () => {
    if (typeof window === "undefined") return;

    // Check every hour if it's 9 AM and send reminder
    setInterval(() => {
        const now = new Date();
        const hour = now.getHours();

        if (hour === 9) {
            sendNotification(
                "Good Morning! ☀️",
                "Ready to build your streak today? Start a Pomodoro session!"
            );
        }

        // Evening reminder if goal not met (7 PM)
        if (hour === 19) {
            const appData = loadAppData();
            if (appData) {
                const today = getTodayLog(appData);
                if (today && today.productiveMinutes < today.goalMinutes) {
                    const remaining = today.goalMinutes - today.productiveMinutes;
                    sendNotification(
                        "Evening Check-in 🌙",
                        `You need ${Math.ceil(remaining / 60)} more hours to meet today's goal!`
                    );
                }
            }
        }
    }, 3600000); // Check every hour
};

// Import statements at top
import { loadAppData, getTodayLog } from "./storage";
