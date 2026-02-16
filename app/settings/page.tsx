"use client";

import { useState, useEffect } from "react";
import { loadAppData, downloadBackup, clearAllData, loadTheme, saveTheme } from "@/lib/storage";
import type { AppData } from "@/types";
import { Card } from "@/components/retroui/Card";
import { Text } from "@/components/retroui/Text";
import { Button } from "@/components/retroui/Button";
import { Input } from "@/components/retroui/Input";
import { Switch } from "@/components/retroui/Switch";
import { Dialog } from "@/components/retroui/Dialog";
import { PWAInstallSection } from "@/components/PWAInstaller";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
    const router = useRouter();
    const [appData, setAppData] = useState<AppData | null>(null);
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');
    const [showResetDialog, setShowResetDialog] = useState(false);

    useEffect(() => {
        const data = loadAppData();
        setAppData(data);

        const currentTheme = loadTheme();
        setTheme(currentTheme);
    }, []);

    const handleExportBackup = () => {
        try {
            downloadBackup();
        } catch (error) {
            console.error("Export failed:", error);
            alert("Failed to export backup");
        }
    };

    const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const text = await file.text();
            const backupData = JSON.parse(text);

            // Restore data
            const { restoreBackup } = await import("@/lib/storage");
            restoreBackup(backupData);

            alert("Backup restored successfully!");
            router.push("/");
            router.refresh();
        } catch (error) {
            console.error("Import failed:", error);
            alert("Failed to import backup. Please check the file.");
        }
    };

    const handleResetApp = () => {
        clearAllData();
        setShowResetDialog(false);
        router.push("/onboarding");
        router.refresh();
    };

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        saveTheme(newTheme);
    };

    if (!appData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Text as="h2">Loading...</Text>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="space-y-2">
                    <Text as="h1" className="text-4xl md:text-5xl font-black">
                        Settings ⚙️
                    </Text>
                </div>

                {/* Profile Card */}
                <Card className="p-6">
                    <Text as="h2" className="text-2xl font-bold mb-4">
                        Profile
                    </Text>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <Text as="p" className="text-muted-foreground">Name</Text>
                            <Text as="p" className="font-medium">{appData.profile.name}</Text>
                        </div>
                        <div className="flex justify-between">
                            <Text as="p" className="text-muted-foreground">Role</Text>
                            <Text as="p" className="font-medium">{appData.profile.role}</Text>
                        </div>
                        <div className="flex justify-between">
                            <Text as="p" className="text-muted-foreground">Daily Commitment</Text>
                            <Text as="p" className="font-medium">
                                {(appData.profile.dailyCommitmentMinutes / 60).toFixed(1)} hours
                            </Text>
                        </div>
                        <div>
                            <Text as="p" className="text-muted-foreground mb-1">Long-term Goal</Text>
                            <Text as="p" className="font-medium">{appData.profile.longTermGoal}</Text>
                        </div>
                    </div>
                </Card>

                {/* Appearance */}
                <Card className="p-6">
                    <Text as="h2" className="text-2xl font-bold mb-4">
                        Appearance
                    </Text>
                    <div className="flex items-center justify-between">
                        <div>
                            <Text as="p" className="font-medium">Dark Mode</Text>
                            <Text as="p" className="text-sm text-muted-foreground">
                                Toggle between light and dark theme
                            </Text>
                        </div>
                        <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
                    </div>
                </Card>

                {/* Install App */}
                <PWAInstallSection />

                {/* Data Management */}
                <Card className="p-6">
                    <Text as="h2" className="text-2xl font-bold mb-4">
                        Data Management
                    </Text>
                    <div className="space-y-4">
                        <div>
                            <Text as="p" className="font-medium mb-2">Export Backup</Text>
                            <Text as="p" className="text-sm text-muted-foreground mb-3">
                                Download all your data as a JSON file
                            </Text>
                            <Button variant="outline" onClick={handleExportBackup}>
                                📥 Download Backup
                            </Button>
                        </div>

                        <div>
                            <Text as="p" className="font-medium mb-2">Import Backup</Text>
                            <Text as="p" className="text-sm text-muted-foreground mb-3">
                                Restore data from a previously exported backup file
                            </Text>
                            <Input
                                type="file"
                                accept=".json"
                                onChange={handleImportBackup}
                                className="cursor-pointer"
                            />
                        </div>
                    </div>
                </Card>

                {/* Danger Zone */}
                <Card className="p-6 border-destructive">
                    <Text as="h2" className="text-2xl font-bold mb-4 text-destructive">
                        Danger Zone
                    </Text>
                    <div>
                        <Text as="p" className="font-medium mb-2">Reset App</Text>
                        <Text as="p" className="text-sm text-muted-foreground mb-3">
                            This will delete all your data and start fresh. This action cannot be undone.
                        </Text>
                        <Button variant="outline" onClick={() => setShowResetDialog(true)}>
                            🗑️ Reset All Data
                        </Button>
                    </div>
                </Card>

                {/* Reset Confirmation Dialog */}
                <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
                    <Dialog.Content className="max-w-md">
                        <Dialog.Header>Confirm Reset</Dialog.Header>
                        <div className="p-6">
                            <Text as="p" className="mb-4">
                                Are you absolutely sure? This will permanently delete all your:
                            </Text>
                            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground mb-4">
                                <li>Daily logs and productive hours</li>
                                <li>Streak data and milestones</li>
                                <li>Savers and rewards</li>
                                <li>Profile information</li>
                            </ul>
                            <Text as="p" className="text-destructive font-medium">
                                This action cannot be undone!
                            </Text>
                        </div>
                        <Dialog.Footer>
                            <Button variant="outline" onClick={() => setShowResetDialog(false)}>
                                Cancel
                            </Button>
                            <Button variant="default" onClick={handleResetApp}>
                                Yes, Reset Everything
                            </Button>
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog>
            </div>
        </div>
    );
}
