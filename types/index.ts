// StreaX TypeScript Interfaces

export interface UserProfile {
    name: string;
    role: string; // Developer, Student, Designer, etc.
    longTermGoal: string;
    dailyCommitmentMinutes: number; // Offerable hours in minutes
    createdAt: string;
    theme: 'light' | 'dark';
}

export interface PomodoroSession {
    taskName: string;
    durationMinutes: number;
    startTime: string;
    endTime: string;
    preset: string;
    completed: boolean;
    actualFocusTime?: number; // if interrupted
    notes?: string;
}

export interface DailyLog {
    date: string; // YYYY-MM-DD
    productiveMinutes: number;
    goalMinutes: number;
    backlogMinutes: number;
    sessions: PomodoroSession[];
    streakSaverUsed: boolean;
    backlogSaversEarned: number; // +15 per day
    backlogSaversUsed: number;
    freeTimeEarned: number;
    freeTimeUsed: number;
    notes?: string; // Daily reflection/notes
}

export interface StreakData {
    currentStreak: number;
    longestStreak: number;
    totalDays: number;
    streakSavers: number; // Available savers (1 per week)
    backlogSavers: number; // Accumulated minutes (15/day)
    lastStreakSaverEarned?: string; // Date when last saver was earned
}

export interface AppData {
    version: string;
    profile: UserProfile;
    dailyLogs: Record<string, DailyLog>; // keyed by date (YYYY-MM-DD)
    streakData: StreakData;
    lastUpdated: string;
}

export interface BackupData {
    version: string;
    exportDate: string;
    data: AppData;
}

// Helper type for rewards
export interface RewardTier {
    hours: number;
    freeTimeMinutes: number;
    cumulative: number;
}

export const REWARD_TIERS: RewardTier[] = [
    { hours: 2, freeTimeMinutes: 15, cumulative: 15 },
    { hours: 4, freeTimeMinutes: 20, cumulative: 35 },
    { hours: 6, freeTimeMinutes: 30, cumulative: 65 },
    { hours: 8, freeTimeMinutes: 40, cumulative: 105 },
];

export const TIPS = [
    "Do not postpone your task to a later date, start it today, as soon as possible.",
    "If you can't match last day's productivity, the remaining becomes backlog for next day.",
    "Track your daily progress. Write about it.",
    "Revise last day's content before starting something new.",
    "Test yourself on weekends.",
];
