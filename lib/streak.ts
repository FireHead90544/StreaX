// Streak calculation and reward logic

import type { AppData, DailyLog, REWARD_TIERS } from "@/types";
import { REWARD_TIERS as REWARDS } from "@/types";

// Calculate free time rewards based on productive hours
export function calculateFreeTimeRewards(productiveMinutes: number): number {
    let totalFreeTime = 0;
    const hours = productiveMinutes / 60;

    // Stackable rewards
    for (const tier of REWARDS) {
        if (hours >= tier.hours) {
            totalFreeTime = tier.cumulative;
        }
    }

    return totalFreeTime;
}

// Calculate today's goal based on yesterday's performance
export function calculateDailyGoal(
    yesterdayLog: DailyLog | undefined,
    initialCommitment: number
): number {
    if (!yesterdayLog) {
        return initialCommitment;
    }

    // Goal = max(yesterday's hours, initial commitment)
    return Math.max(yesterdayLog.productiveMinutes, initialCommitment);
}

// Check if goal is met
export function isGoalMet(productiveMinutes: number, goalMinutes: number): boolean {
    return productiveMinutes >= goalMinutes;
}

// Calculate backlog for today
export function calculateBacklog(
    productiveMinutes: number,
    goalMinutes: number
): number {
    if (productiveMinutes >= goalMinutes) {
        return 0;
    }
    return goalMinutes - productiveMinutes;
}

// Update streak status based on today's performance
export function updateStreakStatus(
    data: AppData,
    todayLog: DailyLog
): void {
    const goalMet = isGoalMet(todayLog.productiveMinutes, todayLog.goalMinutes);

    if (goalMet || todayLog.streakSaverUsed) {
        // Streak continues
        data.streakData.currentStreak += 1;
        data.streakData.totalDays += 1;

        // Update longest streak
        if (data.streakData.currentStreak > data.streakData.longestStreak) {
            data.streakData.longestStreak = data.streakData.currentStreak;
        }

        // Award weekly streak saver (every 7 days)
        if (data.streakData.currentStreak % 7 === 0) {
            data.streakData.streakSavers += 1;
            data.streakData.lastStreakSaverEarned = todayLog.date;
        }

        // Award monthly bonus (every 30 days)
        if (data.streakData.currentStreak % 30 === 0) {
            data.streakData.backlogSavers += 60; // +60 min bonus
            data.streakData.streakSavers += 2; // +2 additional savers
        }
    } else {
        // Streak breaks
        data.streakData.currentStreak = 0;
    }
}

// Use a streak saver to maintain streak
export function useStreakSaver(data: AppData, todayLog: DailyLog): boolean {
    if (data.streakData.streakSavers <= 0) {
        return false;
    }

    data.streakData.streakSavers -= 1;
    todayLog.streakSaverUsed = true;

    // Update streak as if goal was met
    updateStreakStatus(data, todayLog);

    return true;
}

// Use backlog savers to reduce backlog
export function useBacklogSavers(
    data: AppData,
    todayLog: DailyLog,
    minutesToRedeem: number
): boolean {
    if (data.streakData.backlogSavers < minutesToRedeem) {
        return false;
    }

    data.streakData.backlogSavers -= minutesToRedeem;
    todayLog.backlogSaversUsed += minutesToRedeem;

    // Reduce backlog
    todayLog.backlogMinutes = Math.max(0, todayLog.backlogMinutes - minutesToRedeem);

    return true;
}

// Get next milestone information
export function getNextMilestone(currentStreak: number): {
    type: 'weekly' | 'monthly';
    daysRemaining: number;
    reward: string;
} {
    const daysUntilWeekly = 7 - (currentStreak % 7);
    const daysUntilMonthly = 30 - (currentStreak % 30);

    if (daysUntilWeekly <= daysUntilMonthly) {
        return {
            type: 'weekly',
            daysRemaining: daysUntilWeekly,
            reward: '+1 Streak Saver',
        };
    } else {
        return {
            type: 'monthly',
            daysRemaining: daysUntilMonthly,
            reward: '+60min Backlog Saver + 2 Streak Savers',
        };
    }
}

// Get progress percentage toward goal
export function getGoalProgress(productiveMinutes: number, goalMinutes: number): number {
    if (goalMinutes === 0) return 100;
    return Math.min(100, (productiveMinutes / goalMinutes) * 100);
}
