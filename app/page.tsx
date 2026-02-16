"use client";

import { useEffect, useState, useCallback } from "react";
import { loadAppData, saveAppData, getTodayLog } from "@/lib/storage";
import { calculateFreeTimeRewards, updateStreakStatus, getNextMilestone } from "@/lib/streak";
import { formatMinutes, pluralize } from "@/lib/formatters";
import { requestNotificationPermission } from "@/lib/notifications";
import { addNotification } from "@/lib/in-app-notifications";
import type { AppData, DailyLog } from "@/types";
import { Button } from "@/components/retroui/Button";
import { Textarea } from "@/components/retroui/Textarea";
import { Dialog } from "@/components/retroui/Dialog";
import { Card } from "@/components/retroui/Card";
import { Text } from "@/components/retroui/Text";
import { Badge } from "@/components/retroui/Badge";
import { Progress } from "@/components/retroui/Progress";
import Link from "next/link";

export default function DashboardPage() {
  const [appData, setAppData] = useState<AppData | null>(null);
  const [todayLog, setTodayLog] = useState<DailyLog | null>(null);
  const [notes, setNotes] = useState("");
  const [showStreakSaverDialog, setShowStreakSaverDialog] = useState(false);
  const [showBacklogSaverDialog, setShowBacklogSaverDialog] = useState(false);
  const [backlogSaverMinutes, setBacklogSaverMinutes] = useState(15);

  useEffect(() => {
    const data = loadAppData();
    if (data) {
      const today = getTodayLog(data);
      setAppData(data);
      setTodayLog(today);
      setNotes(today?.notes || "");
      saveAppData(data);
    }

    // Request notification permission
    requestNotificationPermission();
  }, []);

  const handleSaveNotes = useCallback(() => {
    if (!appData || !todayLog) return;

    todayLog.notes = notes;
    saveAppData(appData);
  }, [appData, todayLog, notes]);

  const handleUseStreakSaver = useCallback(() => {
    if (!appData || !todayLog) return;

    if (appData.streakData.streakSavers <= 0) {
      alert("No streak savers available!");
      return;
    }

    todayLog.streakSaverUsed = true;
    appData.streakData.streakSavers -= 1;

    // Update streak
    updateStreakStatus(appData, todayLog);

    // Add notification
    addNotification(
      appData,
      "success",
      "Streak Saver Used! 🛡️",
      "Your streak is safe! Keep up the great work tomorrow."
    );

    saveAppData(appData);
    setAppData({ ...appData });
    setTodayLog({ ...todayLog });
    setShowStreakSaverDialog(false);
  }, [appData, todayLog]);

  const handleUseBacklogSaver = useCallback(() => {
    if (!appData || !todayLog) return;

    if (appData.streakData.backlogSavers < backlogSaverMinutes) {
      alert("Not enough backlog savers!");
      return;
    }

    // Apply backlog saver to deficit
    const deficit = Math.max(0, todayLog.goalMinutes - todayLog.productiveMinutes);
    const toUse = Math.min(backlogSaverMinutes, deficit, appData.streakData.backlogSavers);

    appData.streakData.backlogSavers -= toUse;
    todayLog.backlogSaversUsed += toUse;
    todayLog.productiveMinutes += toUse;

    // Recalculate rewards
    todayLog.freeTimeEarned = calculateFreeTimeRewards(todayLog.productiveMinutes);
    updateStreakStatus(appData, todayLog);

    // Add notification
    addNotification(
      appData,
      "success",
      "Backlog Redeemed! ⏰",
      `Applied ${formatMinutes(toUse)} to today's progress!`
    );

    saveAppData(appData);
    setAppData({ ...appData });
    setTodayLog({ ...todayLog });
    setShowBacklogSaverDialog(false);
  }, [appData, todayLog, backlogSaverMinutes]);

  if (!appData || !todayLog) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Text as="h2">Loading...</Text>
      </div>
    );
  }

  const progress = Math.min(100, (todayLog.productiveMinutes / todayLog.goalMinutes) * 100);
  const goalMet = todayLog.productiveMinutes >= todayLog.goalMinutes;
  const remaining = Math.max(0, todayLog.goalMinutes - todayLog.productiveMinutes);
  const nextMilestone = getNextMilestone(appData.streakData.currentStreak);
  const canUseStreakSaver = !goalMet && appData.streakData.streakSavers > 0 && !todayLog.streakSaverUsed;
  const canUseBacklogSaver = remaining > 0 && appData.streakData.backlogSavers > 0;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <Text as="h1" className="text-4xl md:text-5xl font-black">
            Hey {appData.profile.name}! 👋
          </Text>
          <Text as="p" className="text-muted-foreground text-lg">
            {appData.profile.longTermGoal}
          </Text>
        </div>

        {/* Streak & Stats Cards */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Streak Card */}
          <Card className="flex-1 p-6 text-center flex flex-col justify-center">
            <Text as="p" className="text-muted-foreground mb-2">
              Current Streak
            </Text>
            <Text as="h2" className="text-5xl font-black mb-2">
              🔥 {appData.streakData.currentStreak}
            </Text>
            <Text as="p" className="text-sm text-muted-foreground">
              Best: {appData.streakData.longestStreak} days
            </Text>
          </Card>

          {/* Savers Card */}
          <Card className="flex-1 p-6 flex flex-col">
            <Text as="h3" className="font-bold mb-4">
              Savers Available
            </Text>
            <div className="flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Text as="p" className="text-sm">Streak Savers</Text>
                  <Badge>{appData.streakData.streakSavers}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <Text as="p" className="text-sm">Backlog Savers</Text>
                  <Badge>{formatMinutes(appData.streakData.backlogSavers)}</Badge>
                </div>
              </div>
              {(canUseStreakSaver || canUseBacklogSaver) && (
                <div className="flex gap-2 mt-4">
                  {canUseStreakSaver && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowStreakSaverDialog(true)}
                      className="flex-1"
                    >
                      Use Streak Saver
                    </Button>
                  )}
                  {canUseBacklogSaver && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowBacklogSaverDialog(true)}
                      className="flex-1"
                    >
                      Use Backlog Saver
                    </Button>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* Next Milestone */}
          <Card className="flex-1 p-6 flex flex-col justify-center">
            <Text as="h3" className="font-bold mb-2">
              Next Milestone
            </Text>
            <Text as="p" className="text-2xl font-bold mb-1">
              {pluralize(nextMilestone.daysRemaining, 'day')}
            </Text>
            <Text as="p" className="text-sm text-muted-foreground">
              {nextMilestone.reward}
            </Text>
          </Card>
        </div>

        {/* Today's Goal */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <Text as="h2" className="text-2xl font-bold mb-2">
                  Today's Progress
                </Text>
                <Text as="p" className="text-muted-foreground">
                  Goal: {formatMinutes(todayLog.goalMinutes)}
                </Text>
              </div>
              <Link href="/pomodoro">
                <Button>
                  ⏱️ Start Pomodoro
                </Button>
              </Link>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <Text as="p">
                  {formatMinutes(todayLog.productiveMinutes)} / {formatMinutes(todayLog.goalMinutes)}
                </Text>
                <Text as="p" className={goalMet ? "text-primary font-bold" : ""}>
                  {Math.round(progress)}%
                </Text>
              </div>
              <Progress value={progress} />
            </div>

            {!goalMet && (
              <Text as="p" className="text-sm text-muted-foreground">
                {formatMinutes(remaining)} remaining to meet today's goal
              </Text>
            )}

            {goalMet && (
              <div className="flex items-center gap-2">
                <Badge variant="default">✨ Goal Met!</Badge>
                {todayLog.freeTimeEarned > 0 && (
                  <Badge variant="surface">
                    +{formatMinutes(todayLog.freeTimeEarned)} free time
                  </Badge>
                )}
              </div>
            )}

            {todayLog.backlogMinutes > 0 && (
              <div className="bg-destructive/10 border-2 border-destructive rounded p-3">
                <Text as="p" className="text-sm font-medium text-destructive">
                  ⚠️ Backlog: {formatMinutes(todayLog.backlogMinutes)}
                </Text>
              </div>
            )}
          </div>
        </Card>

        {/* Use Your Savers */}
        {(canUseStreakSaver || canUseBacklogSaver) && (
          <Card className="p-6 bg-primary/5 border-primary border-2">
            <Text as="h2" className="text-xl md:text-2xl font-bold mb-4">
              💎 Use Your Savers
            </Text>
            <div className="flex flex-col md:flex-row gap-4">
              {canUseStreakSaver && (
                <div className="flex-1 space-y-3">
                  <Text as="h3" className="font-bold">
                    Streak Saver Available
                  </Text>
                  <Text as="p" className="text-sm text-muted-foreground">
                    Save your streak even if you don't meet today's goal
                  </Text>
                  <Button
                    onClick={() => setShowStreakSaverDialog(true)}
                    className="w-full"
                  >
                    Use Streak Saver ({appData.streakData.streakSavers} available)
                  </Button>
                </div>
              )}
              {canUseBacklogSaver && (
                <div className="flex-1 space-y-3">
                  <Text as="h3" className="font-bold">
                    Backlog Savers Available
                  </Text>
                  <Text as="p" className="text-sm text-muted-foreground">
                    Redeem saved minutes to meet today's goal
                  </Text>
                  <Button
                    onClick={() => setShowBacklogSaverDialog(true)}
                    className="w-full"
                  >
                    Use Backlog Saver ({formatMinutes(appData.streakData.backlogSavers)})
                  </Button>
                </div>
              )}
            </div>
          </Card>
        )}
        <Card className="p-6">
          <Text as="h2" className="text-2xl font-bold mb-4">
            Today's Notes 📝
          </Text>
          <Textarea
            placeholder="Reflect on your day, jot down thoughts, track wins..."
            value={notes}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
            onBlur={handleSaveNotes}
            rows={4}
            className="mb-3"
          />
          <Text as="p" className="text-xs text-muted-foreground">
            Notes are saved automatically
          </Text>
        </Card>

        {/* Quick Actions */}
        <div className="flex flex-col md:flex-row gap-4">
          <Link href="/pomodoro" className="flex-1">
            <Card className="p-6 hover:shadow-lg transition-all cursor-pointer h-full">
              <Text as="h3" className="font-bold mb-2">
                ⏱️ Pomodoro Timer
              </Text>
              <Text as="p" className="text-sm text-muted-foreground">
                Start a focused work session
              </Text>
            </Card>
          </Link>

          <Link href="/insights" className="flex-1">
            <Card className="p-6 hover:shadow-lg transition-all cursor-pointer h-full">
              <Text as="h3" className="font-bold mb-2">
                📊 View Insights
              </Text>
              <Text as="p" className="text-sm text-muted-foreground">
                Track your progress over time
              </Text>
            </Card>
          </Link>
        </div>

        {/* Streak Saver Dialog */}
        <Dialog open={showStreakSaverDialog} onOpenChange={setShowStreakSaverDialog}>
          <Dialog.Content className="max-w-md">
            <Dialog.Header>Use Streak Saver?</Dialog.Header>
            <div className="p-6 space-y-4">
              <Text as="p">
                You have {appData.streakData.streakSavers} streak saver(s) available.
              </Text>
              <Text as="p" className="text-sm text-muted-foreground">
                Using a streak saver will preserve your streak even if you don't meet today's goal. Use wisely!
              </Text>
            </div>
            <Dialog.Footer>
              <Button
                variant="outline"
                onClick={() => setShowStreakSaverDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleUseStreakSaver}>
                Use Streak Saver
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog>

        {/* Backlog Saver Dialog */}
        <Dialog open={showBacklogSaverDialog} onOpenChange={setShowBacklogSaverDialog}>
          <Dialog.Content className="max-w-md">
            <Dialog.Header>Use Backlog Savers?</Dialog.Header>
            <div className="p-6 space-y-4">
              <Text as="p">
                You have {formatMinutes(appData.streakData.backlogSavers)} of backlog savers available.
              </Text>
              <Text as="p">
                Remaining to goal: {formatMinutes(remaining)}
              </Text>
              <div className="space-y-2">
                <Text as="p" className="text-sm font-medium">
                  Minutes to use:
                </Text>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBacklogSaverMinutes(15)}
                  >
                    15m
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBacklogSaverMinutes(30)}
                  >
                    30m
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBacklogSaverMinutes(60)}
                  >
                    60m
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBacklogSaverMinutes(Math.min(remaining, appData.streakData.backlogSavers))}
                  >
                    All
                  </Button>
                </div>
                <Text as="p" className="text-xs text-muted-foreground">
                  Selected: {backlogSaverMinutes}m
                </Text>
              </div>
            </div>
            <Dialog.Footer>
              <Button
                variant="outline"
                onClick={() => setShowBacklogSaverDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleUseBacklogSaver}>
                Use {backlogSaverMinutes}m
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog>
      </div>
    </div>
  );
}
