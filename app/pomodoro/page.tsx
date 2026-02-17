"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { loadAppData, saveAppData, getTodayLog } from "@/lib/storage";
import { calculateFreeTimeRewards, updateStreakStatus } from "@/lib/streak";
import { formatMinutes } from "@/lib/formatters";
import { addNotification } from "@/lib/in-app-notifications";
import type { AppData, DailyLog, PomodoroSession } from "@/types";
import { Card } from "@/components/retroui/Card";
import { Text } from "@/components/retroui/Text";
import { Button } from "@/components/retroui/Button";
import { Input } from "@/components/retroui/Input";
import { Badge } from "@/components/retroui/Badge";
import { Dialog } from "@/components/retroui/Dialog";
import Link from "next/link";

type SessionPreset = {
    name: string;
    focusMinutes: number;
    breakMinutes: number;
};

const PRESETS: SessionPreset[] = [
    { name: "Test", focusMinutes: 1, breakMinutes: 1 },
    { name: "Classic (25/5)", focusMinutes: 25, breakMinutes: 5 },
    { name: "Extended (50/10)", focusMinutes: 50, breakMinutes: 10 },
    { name: "Long (120/20)", focusMinutes: 120, breakMinutes: 20 },
    { name: "Ultra (180/30)", focusMinutes: 180, breakMinutes: 30 },
];

type TimerPhase = "idle" | "focus" | "break" | "paused";

type PersistedTimerState = {
    phase: TimerPhase;
    timeRemaining: number;
    totalFocusTime: number;
    taskName: string;
    selectedPreset: number;
    sessionStartTime: string | null;
    pausedTime: number;
    lastUpdate: number;
    pausedPhase: TimerPhase | null; // Track which phase was paused
    endTime: number | null; // Target end time for accuracy
};

export default function PomodoroPage() {
    const router = useRouter();
    const [appData, setAppData] = useState<AppData | null>(null);
    const [todayLog, setTodayLog] = useState<DailyLog | null>(null);

    // Timer state
    const [phase, setPhase] = useState<TimerPhase>("idle");
    const [selectedPreset, setSelectedPreset] = useState(0);
    const [taskName, setTaskName] = useState("");
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [totalFocusTime, setTotalFocusTime] = useState(0);
    const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
    const [pausedTime, setPausedTime] = useState(0);
    const [pausedPhase, setPausedPhase] = useState<TimerPhase | null>(null); // Track which phase was paused
    const [endTime, setEndTime] = useState<number | null>(null); // Target end time for accuracy

    // Dialog state
    const [showEndDialog, setShowEndDialog] = useState(false);
    const [partialMinutes, setPartialMinutes] = useState(0);

    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Timer persistence utilities
    const TIMER_STATE_KEY = "streax-pomodoro-state";
    const MAX_STATE_AGE = 24 * 60 * 60 * 1000; // 24 hours

    const saveTimerState = () => {
        if (typeof window === "undefined") return;

        const state: PersistedTimerState = {
            phase,
            timeRemaining,
            totalFocusTime,
            taskName,
            selectedPreset,
            sessionStartTime: sessionStartTime?.toISOString() || null,
            pausedTime,
            lastUpdate: Date.now(),
            pausedPhase: phase === "paused" ? pausedPhase : null,
            endTime: endTime
        };

        try {
            localStorage.setItem(TIMER_STATE_KEY, JSON.stringify(state));
        } catch (error) {
            console.error("Failed to save timer state:", error);
        }
    };

    const loadTimerState = (): PersistedTimerState | null => {
        if (typeof window === "undefined") return null;

        try {
            const saved = localStorage.getItem(TIMER_STATE_KEY);
            if (!saved) return null;

            const state: PersistedTimerState = JSON.parse(saved);

            // Validate state age (don't restore timers older than 24 hours)
            const age = Date.now() - state.lastUpdate;
            if (age > MAX_STATE_AGE) {
                clearTimerState();
                return null;
            }

            // Resuming active timer logic
            if (state.phase === "focus" || state.phase === "break") {
                // If we have an endTime, verify against it for accuracy
                if (state.endTime) {
                    const remaining = Math.ceil((state.endTime - Date.now()) / 1000);
                    state.timeRemaining = Math.max(0, remaining);
                } else {
                    // Fallback to elapsed time if no endTime (legacy support)
                    const elapsedSeconds = Math.floor(age / 1000);
                    state.timeRemaining = Math.max(0, state.timeRemaining - elapsedSeconds);
                }

                // If time expired
                if (state.timeRemaining <= 0) {
                    clearTimerState();
                    return null;
                }
            }

            return state;
        } catch (error) {
            console.error("Failed to load timer state:", error);
            clearTimerState();
            return null;
        }
    };

    const clearTimerState = () => {
        if (typeof window === "undefined") return;
        try {
            localStorage.removeItem(TIMER_STATE_KEY);
        } catch (error) {
            console.error("Failed to clear timer state:", error);
        }
    };

    useEffect(() => {
        const data = loadAppData();
        if (data) {
            const today = getTodayLog(data);
            setAppData(data);
            setTodayLog(today);
        }

        // Create audio element for notifications
        if (typeof window !== "undefined") {
            audioRef.current = new Audio();
        }

        // Restore timer state if available
        const savedState = loadTimerState();
        if (savedState) {
            setPhase(savedState.phase);
            setTimeRemaining(savedState.timeRemaining);
            setTotalFocusTime(savedState.totalFocusTime);
            setTaskName(savedState.taskName);
            setSelectedPreset(savedState.selectedPreset);
            setSessionStartTime(savedState.sessionStartTime ? new Date(savedState.sessionStartTime) : null);
            setPausedTime(savedState.pausedTime);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    // Timer logic
    useEffect(() => {
        if ((phase === "focus" || phase === "break") && !intervalRef.current) {
            intervalRef.current = setInterval(() => {
                if (endTime) {
                    const now = Date.now();
                    const remaining = Math.ceil((endTime - now) / 1000);
                    const newTime = Math.max(0, remaining);

                    setTimeRemaining(newTime);

                    if (newTime <= 0) {
                        handlePhaseComplete();
                    }
                } else {
                    // Fallback if endTime is missing
                    setTimeRemaining((prev) => {
                        if (prev <= 0) {
                            handlePhaseComplete();
                            return 0;
                        }
                        return prev - 1;
                    });
                }
            }, 1000);
        } else if (phase === "idle" || phase === "paused") {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null; // Important: clear ref
            }
        };
    }, [phase, endTime]);

    // Save timer state whenever it changes
    useEffect(() => {
        if (phase === "idle") {
            clearTimerState();
        } else {
            saveTimerState();
        }
    }, [phase, timeRemaining, taskName, selectedPreset, totalFocusTime, sessionStartTime, pausedTime, pausedPhase, endTime]);

    const playNotificationSound = () => {
        // Simple beep using oscillator
        if (typeof window !== "undefined" && audioRef.current) {
            try {
                const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.frequency.value = 800;
                oscillator.type = "sine";

                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.5);
            } catch (error) {
                console.log("Could not play sound:", error);
            }
        }
    };

    const handlePhaseComplete = () => {
        playNotificationSound();

        if (phase === "focus") {
            // Focus completed, move to break
            setPhase("break");
            const breakSeconds = PRESETS[selectedPreset].breakMinutes * 60;
            setTimeRemaining(breakSeconds);
            setEndTime(Date.now() + breakSeconds * 1000);

            // Notify
            if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
                new Notification("Focus Complete! 🎉", {
                    body: "Great work! Time for a break.",
                    icon: "/icon-192.png",
                });
            }
        } else if (phase === "break") {
            // Break completed, session done
            setPhase("idle");
            setPausedPhase(null);
            setEndTime(null);
            completeSession();

            if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
                new Notification("Break Complete! ✅", {
                    body: "Ready for another session?",
                    icon: "/icon-192.png",
                });
            }
        }
    };

    const startSession = () => {
        if (!taskName.trim()) {
            alert("Please enter a task name");
            return;
        }

        const duration = PRESETS[selectedPreset].focusMinutes * 60;
        setPhase("focus");
        setTimeRemaining(duration);
        setSessionStartTime(new Date());
        setTotalFocusTime(PRESETS[selectedPreset].focusMinutes);
        setEndTime(Date.now() + duration * 1000);

        // Request notification permission
        if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
            Notification.requestPermission();
        }
    };

    const pauseSession = () => {
        if (phase === "focus" || phase === "break") {
            setPausedTime(timeRemaining);
            setPausedPhase(phase);
            setPhase("paused");
            setEndTime(null);
        }
    };

    const resumeSession = () => {
        if (phase === "paused") {
            setTimeRemaining(pausedTime);
            const nextPhase = pausedPhase || (totalFocusTime > 0 ? "focus" : "break");
            setPhase(nextPhase);
            setEndTime(Date.now() + pausedTime * 1000);
        }
    };

    const stopSession = () => {
        // If in break phase, just finish the session (mark as complete)
        if (phase === "break") {
            setPhase("idle");
            completeSession(false); // Not partial - fully complete
            return;
        }

        setShowEndDialog(true);
        // In focus or paused phase, calculate actual time spent
        const completedMinutes = Math.floor((PRESETS[selectedPreset].focusMinutes * 60 - timeRemaining) / 60);
        setPartialMinutes(completedMinutes);
    };

    const completeSession = (partial: boolean = false) => {
        if (!appData || !todayLog || !sessionStartTime) return;

        const minutesWorked = partial ? partialMinutes : totalFocusTime;

        if (minutesWorked <= 0) {
            setPhase("idle");
            setShowEndDialog(false);
            return;
        }

        // Create session record
        const session: PomodoroSession = {
            taskName: taskName.trim(),
            startTime: sessionStartTime.toISOString(),
            endTime: new Date().toISOString(),
            durationMinutes: minutesWorked,
            preset: PRESETS[selectedPreset].name,
            completed: !partial,
        };

        // Add to today's log
        todayLog.sessions.push(session);
        todayLog.productiveMinutes += minutesWorked;

        // Calculate rewards
        todayLog.freeTimeEarned = calculateFreeTimeRewards(todayLog.productiveMinutes);

        // Update streak
        updateStreakStatus(appData, todayLog);

        // Add in-app notification
        if (partial) {
            addNotification(
                appData,
                "info",
                "Session Logged",
                `Logged ${minutesWorked} minutes for: ${taskName.trim()}`
            );
        } else {
            addNotification(
                appData,
                "success",
                "Session Complete! 🎉",
                `Completed ${minutesWorked} minutes on: ${taskName.trim()}`
            );
        }

        // Check if goal met
        if (todayLog.productiveMinutes >= todayLog.goalMinutes) {
            addNotification(
                appData,
                "success",
                "Daily Goal Achieved! ✨",
                `You've completed ${formatMinutes(todayLog.productiveMinutes)} today!`
            );
        }

        // Save
        saveAppData(appData);
        setAppData({ ...appData });
        setTodayLog({ ...todayLog });

        // Reset
        setPhase("idle");
        setTaskName("");
        setShowEndDialog(false);
        setTimeRemaining(0);
        setSessionStartTime(null);
        setTotalFocusTime(0);
    };

    if (!appData || !todayLog) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Text as="h2">Loading...</Text>
            </div>
        );
    }

    const preset = PRESETS[selectedPreset];
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    const isRunning = phase === "focus" || phase === "break";
    const isPaused = phase === "paused";

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <Text as="h1" className="text-4xl md:text-5xl font-black">
                            Pomodoro Timer ⏱️
                        </Text>
                        <Text as="p" className="text-muted-foreground text-lg">
                            Focus in structured sessions
                        </Text>
                    </div>
                    <Link href="/">
                        <Button variant="outline">← Dashboard</Button>
                    </Link>
                </div>

                {/* Today's Progress */}
                <Card className="p-6">
                    <div className="flex flex-wrap gap-4 items-stretch">
                        <div className="flex-1 min-w-[120px] flex flex-col justify-center">
                            <Text as="p" className="text-sm text-muted-foreground mb-1">Today's Progress</Text>
                            <Text as="h2" className="text-3xl font-bold">
                                {formatMinutes(todayLog.productiveMinutes)}
                            </Text>
                        </div>
                        <div className="flex-1 min-w-[120px] flex flex-col justify-center">
                            <Text as="p" className="text-sm text-muted-foreground mb-1">Goal</Text>
                            <Text as="h3" className="text-2xl font-bold">
                                {formatMinutes(todayLog.goalMinutes)}
                            </Text>
                        </div>
                        <div className="flex-1 min-w-[120px] flex flex-col justify-center">
                            <Text as="p" className="text-sm text-muted-foreground mb-1">Sessions</Text>
                            <Text as="h3" className="text-2xl font-bold">
                                {todayLog.sessions.length}
                            </Text>
                        </div>
                    </div>
                </Card>

                {/* Timer */}
                <Card className="p-8">
                    {phase === "idle" && (
                        <div className="space-y-6">
                            <Text as="h2" className="text-2xl font-bold text-center">
                                Start a Focus Session
                            </Text>

                            <div className="space-y-4">
                                <div>
                                    <Text as="p" className="mb-2 font-medium">
                                        What will you work on?
                                    </Text>
                                    <Input
                                        placeholder="e.g., Write documentation, Code feature X..."
                                        value={taskName}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTaskName(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && startSession()}
                                    />
                                </div>

                                <div>
                                    <Text as="p" className="mb-2 font-medium">
                                        Session Length
                                    </Text>
                                    <div className="flex flex-wrap gap-3">
                                        {PRESETS.map((p, index) => (
                                            <Button
                                                key={index}
                                                variant={selectedPreset === index ? "default" : "outline"}
                                                onClick={() => setSelectedPreset(index)}
                                                className="flex flex-col h-auto py-4 flex-1 min-w-[130px]"
                                            >
                                                <span className="font-bold">{p.name}</span>
                                                <span className="text-sm opacity-75">
                                                    {p.focusMinutes}m / {p.breakMinutes}m
                                                </span>
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <Button
                                onClick={startSession}
                                size="lg"
                                className="w-full text-xl py-6"
                                disabled={!taskName.trim()}
                            >
                                Start Session 🚀
                            </Button>
                        </div>
                    )}

                    {(isRunning || isPaused) && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <Badge variant={phase === "focus" ? "solid" : "surface"} className="text-lg px-4 py-2">
                                    {phase === "focus" ? "🎯 Focus Time" : phase === "break" ? "☕ Break Time" : "⏸️ Paused"}
                                </Badge>
                                <Text as="h3" className="text-xl font-bold mt-2">
                                    {taskName}
                                </Text>
                            </div>

                            <div className="text-center">
                                <Text as="h1" className="text-8xl md:text-9xl font-black tabular-nums">
                                    {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                                </Text>
                            </div>

                            <div className="flex gap-3">
                                {!isPaused ? (
                                    <>
                                        <Button
                                            variant="outline"
                                            onClick={pauseSession}
                                            className="flex-1"
                                            size="lg"
                                        >
                                            ⏸️ Pause
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={stopSession}
                                            className="flex-1"
                                            size="lg"
                                        >
                                            ⏹️ Stop
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Button
                                            onClick={resumeSession}
                                            className="flex-1"
                                            size="lg"
                                        >
                                            ▶️ Resume
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={stopSession}
                                            className="flex-1"
                                            size="lg"
                                        >
                                            ⏹️ End Session
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </Card>

                {/* Today's Sessions */}
                {todayLog.sessions.length > 0 && (
                    <Card className="p-6">
                        <Text as="h2" className="text-2xl font-bold mb-4">
                            Today's Sessions ({todayLog.sessions.length})
                        </Text>
                        <div className="space-y-3">
                            {todayLog.sessions.slice().reverse().map((session, index) => (
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

                {/* End Session Dialog */}
                <Dialog open={showEndDialog} onOpenChange={setShowEndDialog}>
                    <Dialog.Content className="max-w-md">
                        <Dialog.Header>End Session Early?</Dialog.Header>
                        <div className="p-6 space-y-4">
                            <Text as="p">
                                You completed {partialMinutes} minutes out of {totalFocusTime} minutes.
                            </Text>
                            <Text as="p" className="text-sm text-muted-foreground">
                                This will be logged as a partial session. Continue to keep your progress or discard it.
                            </Text>
                        </div>
                        <Dialog.Footer>
                            <Button
                                variant="outline"
                                onClick={() => setShowEndDialog(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setPhase("idle");
                                    setShowEndDialog(false);
                                    setTaskName("");
                                }}
                            >
                                Discard
                            </Button>
                            <Button onClick={() => completeSession(true)}>
                                Log {partialMinutes}m
                            </Button>
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog>
            </div>
        </div>
    );
}
