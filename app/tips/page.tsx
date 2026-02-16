"use client";

import { Card } from "@/components/retroui/Card";
import { Text } from "@/components/retroui/Text";
import { TIPS } from "@/types";

export default function TipsPage() {
    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="space-y-2">
                    <Text as="h1" className="text-4xl md:text-5xl font-black">
                        Productivity Tips 💡
                    </Text>
                    <Text as="p" className="text-muted-foreground text-lg">
                        Guidelines to help you stay consistent and productive
                    </Text>
                </div>

                <div className="space-y-4">
                    {TIPS.map((tip, index) => (
                        <Card key={index} className="p-6">
                            <div className="flex gap-4">
                                <div className="flex-shrink-0">
                                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                                        <Text as="p" className="text-primary-foreground font-bold">
                                            {index + 1}
                                        </Text>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <Text as="p" className="text-lg">
                                        {tip}
                                    </Text>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Additional Tips Section */}
                <Card className="p-6 bg-primary/10 border-primary">
                    <Text as="h2" className="text-2xl font-bold mb-4">
                        Remember
                    </Text>
                    <div className="space-y-3">
                        <Text as="p">
                            🎯 Consistency beats intensity. Small daily progress compounds over time.
                        </Text>
                        <Text as="p">
                            📊 Track everything. What gets measured gets managed.
                        </Text>
                        <Text as="p">
                            🔥 Protect your streak. Use savers wisely when emergencies arise.
                        </Text>
                        <Text as="p">
                            💪 Progress, not perfection. Some days will be harder than others.
                        </Text>
                    </div>
                </Card>
            </div>
        </div>
    );
}
