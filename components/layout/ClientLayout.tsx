"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { hasCompletedOnboarding } from "@/lib/storage";
import { Navbar } from "@/components/layout/Navbar";
import Link from "next/link";

export function ClientLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const completed = hasCompletedOnboarding();

        if (!completed && pathname !== "/onboarding") {
            router.push("/onboarding");
        } else if (completed && pathname === "/onboarding") {
            router.push("/");
        }

        setIsLoading(false);
    }, [pathname, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-2xl font-bold">Loading...</div>
            </div>
        );
    }

    const showNav = pathname !== "/onboarding";

    return (
        <>
            {showNav && <Navbar />}
            {children}
            {showNav && (
                <footer className="border-t-2 border-foreground/10 bg-card mt-8">
                    <div className="max-w-6xl mx-auto px-4 py-6 text-center">
                        <p className="text-sm text-muted-foreground">
                            Developed by <Link href="https://github.com/FireHead90544" target="_blank" rel="noopener noreferrer" className="font-bold text-foreground hover:text-primary transition-colors">RudraXD</Link> w/ <span className="font-bold text-primary">Antigravity</span>
                        </p>
                    </div>
                </footer>
            )}
        </>
    );
}
