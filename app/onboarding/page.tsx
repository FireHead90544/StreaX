"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/retroui/Button";
import { Input } from "@/components/retroui/Input";
import { Card } from "@/components/retroui/Card";
import { Text } from "@/components/retroui/Text";
import { Textarea } from "@/components/retroui/Textarea";
import { getDefaultAppData, saveAppData } from "@/lib/storage";
import type { UserProfile } from "@/types";

export default function OnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: "",
        role: "",
        longTermGoal: "",
        dailyCommitmentHours: 4,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateStep = (currentStep: number): boolean => {
        const newErrors: Record<string, string> = {};

        if (currentStep === 1) {
            if (!formData.name.trim()) {
                newErrors.name = "Name is required";
            }
            if (!formData.role.trim()) {
                newErrors.role = "Role is required";
            }
        }

        if (currentStep === 2) {
            if (!formData.longTermGoal.trim()) {
                newErrors.longTermGoal = "Long-term goal is required";
            }
            if (formData.dailyCommitmentHours <= 0) {
                newErrors.dailyCommitmentHours = "Must be greater than 0";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(step)) {
            setStep(step + 1);
        }
    };

    const handleComplete = () => {
        if (!validateStep(step)) return;

        const profile: UserProfile = {
            name: formData.name.trim(),
            role: formData.role.trim(),
            longTermGoal: formData.longTermGoal.trim(),
            dailyCommitmentMinutes: formData.dailyCommitmentHours * 60,
            createdAt: new Date().toISOString(),
            theme: "dark",
        };

        const appData = getDefaultAppData(profile);
        saveAppData(appData);

        router.push("/");
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <Card className="max-w-2xl w-full p-8">
                <div className="space-y-6">
                    {/* Header */}
                    <div className="text-center space-y-2">
                        <Text as="h1" className="text-5xl font-black">
                            Welcome to StreaX 🔥
                        </Text>
                        <Text as="p" className="text-muted-foreground text-lg">
                            Gamify your productivity and build unstoppable streaks
                        </Text>
                    </div>

                    {/* Progress Indicator */}
                    <div className="flex gap-2 justify-center">
                        <div
                            className={`h-2 w-16 rounded ${step >= 1 ? "bg-primary" : "bg-muted"
                                }`}
                        />
                        <div
                            className={`h-2 w-16 rounded ${step >= 2 ? "bg-primary" : "bg-muted"
                                }`}
                        />
                    </div>

                    {/* Step 1: Personal Info */}
                    {step === 1 && (
                        <div className="space-y-4">
                            <Text as="h2" className="text-2xl font-bold">
                                Tell us about yourself
                            </Text>

                            <div className="space-y-2">
                                <label className="block">
                                    <Text as="p" className="mb-2 font-medium">
                                        What's your name?
                                    </Text>
                                    <Input
                                        placeholder="John Doe"
                                        value={formData.name}
                                        onChange={(e) =>
                                            setFormData({ ...formData, name: e.target.value })
                                        }
                                        className={errors.name ? "border-destructive" : ""}
                                    />
                                    {errors.name && (
                                        <Text as="p" className="text-destructive text-sm">
                                            {errors.name}
                                        </Text>
                                    )}
                                </label>
                            </div>

                            <div className="space-y-2">
                                <label className="block">
                                    <Text as="p" className="mb-2 font-medium">
                                        What's your role?
                                    </Text>
                                    <Input
                                        placeholder="Developer, Student, Designer..."
                                        value={formData.role}
                                        onChange={(e) =>
                                            setFormData({ ...formData, role: e.target.value })
                                        }
                                        className={errors.role ? "border-destructive" : ""}
                                    />
                                    {errors.role && (
                                        <Text as="p" className="text-destructive text-sm">
                                            {errors.role}
                                        </Text>
                                    )}
                                </label>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button onClick={handleNext} size="lg" className="flex-1">
                                    Next →
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Goals */}
                    {step === 2 && (
                        <div className="space-y-4">
                            <Text as="h2" className="text-2xl font-bold">
                                Set your goals
                            </Text>

                            <div className="space-y-2">
                                <label className="block">
                                    <Text as="p" className="mb-2 font-medium">
                                        What's your long-term goal?
                                    </Text>
                                    <Textarea
                                        placeholder="Build a successful startup, master web development, get promoted..."
                                        value={formData.longTermGoal}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                                            setFormData({
                                                ...formData,
                                                longTermGoal: e.target.value,
                                            })
                                        }
                                        rows={3}
                                        className={errors.longTermGoal ? "border-destructive" : ""}
                                    />
                                    {errors.longTermGoal && (
                                        <Text as="p" className="text-destructive text-sm">
                                            {errors.longTermGoal}
                                        </Text>
                                    )}
                                </label>
                            </div>

                            <div className="space-y-2">
                                <label className="block">
                                    <Text as="p" className="mb-2 font-medium">
                                        Daily commitment (hours)
                                    </Text>
                                    <Input
                                        type="number"
                                        min="1"
                                        max="16"
                                        value={formData.dailyCommitmentHours}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                dailyCommitmentHours: parseInt(e.target.value) || 0,
                                            })
                                        }
                                        className={
                                            errors.dailyCommitmentHours ? "border-destructive" : ""
                                        }
                                    />
                                    <Text as="p" className="text-muted-foreground text-sm">
                                        How many hours can you commit to productive work daily?
                                    </Text>
                                    {errors.dailyCommitmentHours && (
                                        <Text as="p" className="text-destructive text-sm">
                                            {errors.dailyCommitmentHours}
                                        </Text>
                                    )}
                                </label>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button
                                    onClick={() => setStep(1)}
                                    variant="outline"
                                    size="lg"
                                    className="flex-1"
                                >
                                    ← Back
                                </Button>
                                <Button onClick={handleComplete} size="lg" className="flex-1">
                                    Let's Go! 🚀
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
}
