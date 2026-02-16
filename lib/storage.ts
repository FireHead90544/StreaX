// localStorage utilities for StreaX

import type { AppData, BackupData, DailyLog, UserProfile, StreakData } from "@/types";

const STORAGE_KEY = "STREAX_DATA";
const THEME_KEY = "STREAX_THEME";

// Initialize default app data
export function getDefaultAppData(profile: UserProfile): AppData {
    return {
        version: "1.0.0",
        profile,
        dailyLogs: {},
        streakData: {
            currentStreak: 0,
            longestStreak: 0,
            totalDays: 0,
            streakSavers: 0,
            backlogSavers: 0,
        },
        lastUpdated: new Date().toISOString(),
    };
}

// Load data from localStorage
export function loadAppData(): AppData | null {
    if (typeof window === "undefined") return null;

    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) return null;
        return JSON.parse(data) as AppData;
    } catch (error) {
        console.error("Error loading app data:", error);
        return null;
    }
}

// Save data to localStorage
export function saveAppData(data: AppData): void {
    if (typeof window === "undefined") return;

    try {
        data.lastUpdated = new Date().toISOString();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
        console.error("Error saving app data:", error);
    }
}

// Check if user has completed onboarding
export function hasCompletedOnboarding(): boolean {
    const data = loadAppData();
    return data !== null && data.profile !== null;
}

// Export data as JSON file
export function exportBackup(): BackupData {
    const data = loadAppData();
    if (!data) {
        throw new Error("No data to export");
    }

    return {
        version: "1.0.0",
        exportDate: new Date().toISOString(),
        data,
    };
}

// Download backup file
export function downloadBackup(): void {
    const backup = exportBackup();
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
        type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `streax-backup-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Restore from backup
export function restoreBackup(backupData: BackupData): void {
    if (backupData.version !== "1.0.0") {
        throw new Error("Incompatible backup version");
    }

    saveAppData(backupData.data);
}

// Theme management
export function loadTheme(): 'light' | 'dark' {
    if (typeof window === "undefined") return "dark";

    try {
        const theme = localStorage.getItem(THEME_KEY);
        return (theme as 'light' | 'dark') || "dark";
    } catch {
        return "dark";
    }
}

export function saveTheme(theme: 'light' | 'dark'): void {
    if (typeof window === "undefined") return;

    localStorage.setItem(THEME_KEY, theme);

    // Apply theme to document
    if (theme === "dark") {
        document.documentElement.classList.add("dark");
    } else {
        document.documentElement.classList.remove("dark");
    }
}

// Get today's date in YYYY-MM-DD format
export function getTodayDate(): string {
    const today = new Date();
    return today.toISOString().split("T")[0];
}

// Get or create today's log
export function getTodayLog(data: AppData): DailyLog {
    const today = getTodayDate();

    if (!data.dailyLogs[today]) {
        // Calculate today's goal based on yesterday
        const yesterday = getYesterdayDate();
        const yesterdayLog = data.dailyLogs[yesterday];

        let goalMinutes = data.profile.dailyCommitmentMinutes;
        let backlogMinutes = 0;

        if (yesterdayLog) {
            // Goal = max(yesterday's productive, initial commitment) + yesterday's backlog
            goalMinutes = Math.max(
                yesterdayLog.productiveMinutes,
                data.profile.dailyCommitmentMinutes
            );
            backlogMinutes = yesterdayLog.backlogMinutes;

            // If yesterday didn't meet goal, add to backlog
            if (yesterdayLog.productiveMinutes < yesterdayLog.goalMinutes) {
                const missedMinutes = yesterdayLog.goalMinutes - yesterdayLog.productiveMinutes;
                backlogMinutes += missedMinutes;
            }
        }

        data.dailyLogs[today] = {
            date: today,
            productiveMinutes: 0,
            goalMinutes,
            backlogMinutes,
            sessions: [],
            streakSaverUsed: false,
            backlogSaversEarned: 0, // Don't earn on first day
            backlogSaversUsed: 0,
            freeTimeEarned: 0,
            freeTimeUsed: 0,
        };

        // Only add backlog savers if not the first day
        if (yesterdayLog) {
            data.dailyLogs[today].backlogSaversEarned = 15;
            data.streakData.backlogSavers += 15;

            // Cap at 450 minutes (30 days)
            if (data.streakData.backlogSavers > 450) {
                data.streakData.backlogSavers = 450;
            }
        }
    }

    return data.dailyLogs[today];
}

// Helper to get yesterday's date
function getYesterdayDate(): string {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split("T")[0];
}

// Clear all data (reset app)
export function clearAllData(): void {
    if (typeof window === "undefined") return;

    localStorage.removeItem(STORAGE_KEY);
}
