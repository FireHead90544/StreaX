"use client";

import { useState, useEffect, useMemo } from "react";
import { loadAppData } from "@/lib/storage";
import { formatMinutes } from "@/lib/formatters";
import type { AppData, DailyLog } from "@/types";
import { Card } from "@/components/retroui/Card";
import { Text } from "@/components/retroui/Text";
import { Button } from "@/components/retroui/Button";
import { Badge } from "@/components/retroui/Badge";
import { Input } from "@/components/retroui/Input";
import { Textarea } from "@/components/retroui/Textarea";
import { AreaChart } from "@/components/retroui/charts/AreaChart";
import Link from "next/link";

type TimeFrame = "day" | "week" | "month" | "all" | "custom";

export default function InsightsPage() {
    const [appData, setAppData] = useState<AppData | null>(null);
    const [timeframe, setTimeframe] = useState<TimeFrame>("day");
    const [selectedDate, setSelectedDate] = useState<string>("");
    const [customStartDate, setCustomStartDate] = useState("");
    const [customEndDate, setCustomEndDate] = useState("");

    useEffect(() => {
        const data = loadAppData();
        if (data) {
            setAppData(data);

            // Set today as default selected date
            const today = new Date().toISOString().split('T')[0];
            setSelectedDate(today);

            // Set default custom range to last 30 days
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            setCustomEndDate(today);
            setCustomStartDate(thirtyDaysAgo.toISOString().split('T')[0]);
        }
    }, []);

    const navigateDay = (direction: 'prev' | 'next') => {
        const current = new Date(selectedDate);
        current.setDate(current.getDate() + (direction === 'next' ? 1 : -1));
        setSelectedDate(current.toISOString().split('T')[0]);
    };

    const canNavigateNext = () => {
        const today = new Date().toISOString().split('T')[0];
        return selectedDate < today;
    };

    const stats = useMemo(() => {
        if (!appData) return null;

        const logs = Object.values(appData.dailyLogs).sort((a, b) =>
            a.date.localeCompare(b.date)
        );

        // Filter by timeframe
        const now = new Date();
        const filteredLogs = logs.filter(log => {
            const logDate = new Date(log.date);
            const daysDiff = Math.floor((now.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));

            if (timeframe === "day") {
                return log.date === selectedDate;
            }
            if (timeframe === "week") return daysDiff < 7;
            if (timeframe === "month") return daysDiff < 30;
            if (timeframe === "custom") {
                if (!customStartDate || !customEndDate) return true;
                const start = new Date(customStartDate);
                const end = new Date(customEndDate);
                return logDate >= start && logDate <= end;
            }
            return true; // all
        });

        const totalMinutes = filteredLogs.reduce((sum, log) => sum + log.productiveMinutes, 0);
        const totalSessions = filteredLogs.reduce((sum, log) => sum + log.sessions.length, 0);
        const goalsMetCount = filteredLogs.filter(log => log.productiveMinutes >= log.goalMinutes).length;
        const avgMinutes = filteredLogs.length > 0 ? totalMinutes / filteredLogs.length : 0;

        const bestDay = filteredLogs.reduce((best, log) =>
            log.productiveMinutes > (best?.productiveMinutes || 0) ? log : best,
            filteredLogs[0]
        );

        const completionRate = filteredLogs.length > 0
            ? Math.round((goalsMetCount / filteredLogs.length) * 100)
            : 0;

        // Get selected day log
        const selectedDayLog = appData.dailyLogs[selectedDate] || null;

        return {
            totalMinutes,
            totalHours: Math.floor(totalMinutes / 60),
            totalSessions,
            avgMinutes,
            bestDay,
            goalsMetCount,
            totalDays: filteredLogs.length,
            completionRate,
            logs: filteredLogs,
            selectedDayLog,
        };
    }, [appData, timeframe, selectedDate, customStartDate, customEndDate]);

    if (!appData || !stats) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Text as="h2">Loading...</Text>
            </div>
        );
    }

    const maxMinutes = Math.max(...stats.logs.map(l => l.productiveMinutes), 1);

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <Text as="h1" className="text-3xl md:text-5xl font-black">
                            Insights & Analytics 📊
                        </Text>
                        <Text as="p" className="text-muted-foreground text-base md:text-lg mt-1">
                            Track your productivity journey
                        </Text>
                    </div>
                    <Link href="/">
                        <Button variant="outline">← Dashboard</Button>
                    </Link>
                </div>

                {/* Timeframe Selector */}
                <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant={timeframe === "day" ? "default" : "outline"}
                            onClick={() => setTimeframe("day")}
                            size="sm"
                        >
                            This Day
                        </Button>
                        <Button
                            variant={timeframe === "week" ? "default" : "outline"}
                            onClick={() => setTimeframe("week")}
                            size="sm"
                        >
                            This Week
                        </Button>
                        <Button
                            variant={timeframe === "month" ? "default" : "outline"}
                            onClick={() => setTimeframe("month")}
                            size="sm"
                        >
                            This Month
                        </Button>
                        <Button
                            variant={timeframe === "all" ? "default" : "outline"}
                            onClick={() => setTimeframe("all")}
                            size="sm">
                            All Time
                        </Button>
                        <Button
                            variant={timeframe === "custom" ? "default" : "outline"}
                            onClick={() => setTimeframe("custom")}
                            size="sm"
                        >
                            Custom Range
                        </Button>
                    </div>

                    {/* Day Navigation */}
                    {timeframe === "day" && (
                        <Card className="p-4">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => navigateDay('prev')}
                                >
                                    ← Previous Day
                                </Button>
                                <div className="text-center">
                                    <Text as="h3" className="text-lg md:text-xl font-bold">
                                        {new Date(selectedDate).toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            month: 'long',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </Text>
                                    <Text as="p" className="text-sm text-muted-foreground">
                                        {selectedDate === new Date().toISOString().split('T')[0] ? 'Today' : ''}
                                    </Text>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => navigateDay('next')}
                                    disabled={!canNavigateNext()}
                                >
                                    Next Day →
                                </Button>
                            </div>
                        </Card>
                    )}

                    {/* Custom Range */}
                    {timeframe === "custom" && (
                        <Card className="p-4">
                            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
                                <div className="flex-1 w-full sm:w-auto">
                                    <Text as="p" className="text-sm font-medium mb-2">From</Text>
                                    <Input
                                        type="date"
                                        value={customStartDate}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomStartDate(e.target.value)}
                                        max={customEndDate || undefined}
                                    />
                                </div>
                                <div className="flex-1 w-full sm:w-auto">
                                    <Text as="p" className="text-sm font-medium mb-2">To</Text>
                                    <Input
                                        type="date"
                                        value={customEndDate}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomEndDate(e.target.value)}
                                        min={customStartDate || undefined}
                                    />
                                </div>
                                <Text as="p" className="text-sm text-muted-foreground">
                                    {stats.totalDays} days selected
                                </Text>
                            </div>
                        </Card>
                    )}
                </div>

                {/* Day View - Show detailed single day info */}
                {timeframe === "day" && stats.selectedDayLog ? (
                    <div className="space-y-6">
                        {/* Day Stats */}
                        <div className="flex flex-wrap gap-4 items-stretch">
                            <Card className="flex-1 min-w-[140px] p-4 md:p-6 text-center flex flex-col justify-center">
                                <Text as="p" className="text-xs md:text-sm text-muted-foreground mb-1">
                                    Hours Logged
                                </Text>
                                <Text as="h2" className="text-3xl md:text-4xl font-black">
                                    {formatMinutes(stats.selectedDayLog.productiveMinutes)}
                                </Text>
                            </Card>

                            <Card className="flex-1 min-w-[140px] p-4 md:p-6 text-center flex flex-col justify-center">
                                <Text as="p" className="text-xs md:text-sm text-muted-foreground mb-1">
                                    Goal
                                </Text>
                                <Text as="h2" className="text-3xl md:text-4xl font-black">
                                    {formatMinutes(stats.selectedDayLog.goalMinutes)}
                                </Text>
                            </Card>

                            <Card className="flex-1 min-w-[140px] p-4 md:p-6 text-center flex flex-col justify-center">
                                <Text as="p" className="text-xs md:text-sm text-muted-foreground mb-1">
                                    Sessions
                                </Text>
                                <Text as="h2" className="text-3xl md:text-4xl font-black">
                                    {stats.selectedDayLog.sessions.length}
                                </Text>
                            </Card>

                            <Card className="flex-1 min-w-[140px] p-4 md:p-6 text-center flex flex-col justify-center">
                                <Text as="p" className="text-xs md:text-sm text-muted-foreground mb-1">
                                    Status
                                </Text>
                                <Badge
                                    variant={stats.selectedDayLog.productiveMinutes >= stats.selectedDayLog.goalMinutes ? "solid" : "outline"}
                                    className="text-base md:text-lg px-3 py-2 mt-2"
                                >
                                    {stats.selectedDayLog.productiveMinutes >= stats.selectedDayLog.goalMinutes ? "✓ Goal Met" : "In Progress"}
                                </Badge>
                            </Card>
                        </div>

                        {/* Day Notes */}
                        <Card className="p-4 md:p-6">
                            <Text as="h2" className="text-xl md:text-2xl font-bold mb-3">
                                📝 Daily Notes
                            </Text>
                            {stats.selectedDayLog.notes ? (
                                <div className="bg-muted/50 p-4 rounded border-2">
                                    <Text as="p" className="whitespace-pre-wrap">
                                        {stats.selectedDayLog.notes}
                                    </Text>
                                </div>
                            ) : (
                                <Text as="p" className="text-muted-foreground text-sm">
                                    No notes for this day. Add notes from the dashboard!
                                </Text>
                            )}
                        </Card>

                        {/* Sessions */}
                        {stats.selectedDayLog.sessions.length > 0 && (
                            <Card className="p-4 md:p-6">
                                <Text as="h2" className="text-xl md:text-2xl font-bold mb-4">
                                    Sessions ({stats.selectedDayLog.sessions.length})
                                </Text>
                                <div className="space-y-3">
                                    {stats.selectedDayLog.sessions.map((session, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded border-2">
                                            <div className="flex-1">
                                                <Text as="p" className="font-medium">
                                                    {session.taskName}
                                                </Text>
                                                <Text as="p" className="text-sm text-muted-foreground">
                                                    {session.preset} • {new Date(session.startTime).toLocaleTimeString()}
                                                </Text>
                                            </div>
                                            <div className="text-right">
                                                <Text as="p" className="font-bold">
                                                    {session.durationMinutes}m
                                                </Text>
                                                <Badge variant={session.completed ? "solid" : "outline"} className="text-xs">
                                                    {session.completed ? "✓ Complete" : "Partial"}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}
                    </div>
                ) : timeframe === "day" && !stats.selectedDayLog ? (
                    <Card className="p-12 text-center">
                        <Text as="h3" className="text-2xl font-bold mb-2">
                            No data for this day
                        </Text>
                        <Text as="p" className="text-muted-foreground">
                            Start tracking with Pomodoro to see insights!
                        </Text>
                    </Card>
                ) : (
                    /* Multi-Day View */
                    <>
                        {/* Stats Cards */}
                        <div className="flex flex-wrap gap-4 items-stretch">
                            <Card className="flex-1 min-w-[140px] p-4 md:p-6 text-center flex flex-col justify-center">
                                <Text as="p" className="text-xs md:text-sm text-muted-foreground mb-1">
                                    Total Hours
                                </Text>
                                <Text as="h2" className="text-3xl md:text-4xl font-black">
                                    {stats.totalHours}h
                                </Text>
                                <Text as="p" className="text-xs text-muted-foreground">
                                    {stats.totalMinutes % 60}m
                                </Text>
                            </Card>

                            <Card className="flex-1 min-w-[140px] p-4 md:p-6 text-center flex flex-col justify-center">
                                <Text as="p" className="text-xs md:text-sm text-muted-foreground mb-1">
                                    Sessions
                                </Text>
                                <Text as="h2" className="text-3xl md:text-4xl font-black">
                                    {stats.totalSessions}
                                </Text>
                            </Card>

                            <Card className="flex-1 min-w-[140px] p-4 md:p-6 text-center flex flex-col justify-center">
                                <Text as="p" className="text-xs md:text-sm text-muted-foreground mb-1">
                                    Average/Day
                                </Text>
                                <Text as="h2" className="text-3xl md:text-4xl font-black">
                                    {Math.round(stats.avgMinutes / 60)}h
                                </Text>
                                <Text as="p" className="text-xs text-muted-foreground">
                                    {Math.round(stats.avgMinutes % 60)}m
                                </Text>
                            </Card>

                            <Card className="flex-1 min-w-[140px] p-4 md:p-6 text-center flex flex-col justify-center">
                                <Text as="p" className="text-xs md:text-sm text-muted-foreground mb-1">
                                    Completion Rate
                                </Text>
                                <Text as="h2" className="text-3xl md:text-4xl font-black">
                                    {stats.completionRate}%
                                </Text>
                                <Text as="p" className="text-xs text-muted-foreground">
                                    {stats.goalsMetCount}/{stats.totalDays} days
                                </Text>
                            </Card>
                        </div>

                        {/* Best Day */}
                        {stats.bestDay && (
                            <Card className="p-4 md:p-6 bg-primary/10 border-primary">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                    <div>
                                        <Text as="p" className="text-sm font-medium mb-1">
                                            🏆 Best Day
                                        </Text>
                                        <Text as="h3" className="text-xl md:text-2xl font-bold">
                                            {formatMinutes(stats.bestDay.productiveMinutes)}
                                        </Text>
                                        <Text as="p" className="text-sm text-muted-foreground">
                                            {new Date(stats.bestDay.date).toLocaleDateString('en-US', {
                                                weekday: 'long',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </Text>
                                    </div>
                                    <Badge variant="solid" className="text-base md:text-lg px-4 py-2 self-start sm:self-auto">
                                        {stats.bestDay.sessions.length} sessions
                                    </Badge>
                                </div>
                            </Card>
                        )}

                        {/* Line Chart */}
                        <Card className="p-4 md:p-6">
                            <Text as="h2" className="text-xl md:text-2xl font-bold mb-4 md:mb-6">
                                Progress Trend
                            </Text>

                            {stats.logs.length === 0 ? (
                                <div className="text-center py-12">
                                    <Text as="p" className="text-muted-foreground">
                                        No data to display yet. Start tracking with Pomodoro!
                                    </Text>
                                </div>
                            ) : (
                                <AreaChart
                                    data={stats.logs.map(log => ({
                                        name: new Date(log.date).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric'
                                        }),
                                        hours: log.productiveMinutes / 60,
                                    }))}
                                    index="name"
                                    categories={["hours"]}
                                />
                            )}
                        </Card>

                        {/* Bar Chart */}
                        <Card className="p-4 md:p-6">
                            <Text as="h2" className="text-xl md:text-2xl font-bold mb-4 md:mb-6">
                                Daily Progress
                            </Text>

                            {stats.logs.length === 0 ? (
                                <div className="text-center py-12">
                                    <Text as="p" className="text-muted-foreground">
                                        No data to display yet. Start tracking with Pomodoro!
                                    </Text>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {stats.logs.slice().reverse().map((log) => {
                                        const percentage = (log.productiveMinutes / maxMinutes) * 100;
                                        const goalMet = log.productiveMinutes >= log.goalMinutes;

                                        return (
                                            <div key={log.date} className="space-y-1">
                                                <div className="flex justify-between items-center text-xs md:text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <Text as="p" className="font-medium">
                                                            {new Date(log.date).toLocaleDateString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric'
                                                            })}
                                                        </Text>
                                                        {goalMet && <Badge variant="solid" className="text-xs">✓</Badge>}
                                                    </div>
                                                    <Text as="p" className="text-muted-foreground">
                                                        {formatMinutes(log.productiveMinutes)}
                                                    </Text>
                                                </div>
                                                <div className="relative h-8 bg-muted rounded border-2 overflow-hidden">
                                                    <div
                                                        className={`absolute inset-y-0 left-0 ${goalMet ? 'bg-primary' : 'bg-primary/50'
                                                            } transition-all`}
                                                        style={{ width: `${Math.min(percentage, 100)}%` }}
                                                    />
                                                    {log.sessions.length > 0 && (
                                                        <div className="absolute inset-0 flex items-center justify-end pr-2">
                                                            <Text as="p" className="text-xs font-medium">
                                                                {log.sessions.length} session{log.sessions.length !== 1 ? 's' : ''}
                                                            </Text>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </Card>

                        {/* Current Streak */}
                        <Card className="p-4 md:p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div>
                                    <Text as="p" className="text-sm text-muted-foreground mb-1">
                                        Current Streak
                                    </Text>
                                    <Text as="h2" className="text-4xl md:text-5xl font-black">
                                        🔥 {appData.streakData.currentStreak}
                                    </Text>
                                </div>
                                <div className="text-left sm:text-right">
                                    <Text as="p" className="text-sm text-muted-foreground mb-1">
                                        Longest Streak
                                    </Text>
                                    <Text as="h3" className="text-2xl md:text-3xl font-bold">
                                        {appData.streakData.longestStreak}
                                    </Text>
                                </div>
                            </div>
                        </Card>
                    </>
                )}
            </div>
        </div>
    );
}
