"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Text } from "@/components/retroui/Text";
import { Button } from "@/components/retroui/Button";
import { Switch } from "@/components/retroui/Switch";
import { loadAppData } from "@/lib/storage";
import { getUnreadCount } from "@/lib/in-app-notifications";

export function Navbar() {
    const pathname = usePathname();
    const [isDark, setIsDark] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        // Load theme
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme) {
            const dark = savedTheme === "dark";
            setIsDark(dark);
            document.documentElement.classList.toggle("dark", dark);
        }

        // Load unread notifications count
        const data = loadAppData();
        if (data) {
            setUnreadCount(getUnreadCount(data));
        }
    }, [pathname]);

    const toggleTheme = () => {
        const newTheme = !isDark;
        setIsDark(newTheme);
        localStorage.setItem("theme", newTheme ? "dark" : "light");
        document.documentElement.classList.toggle("dark", newTheme);
    };

    const navItems = [
        { href: "/", label: "Dashboard" },
        { href: "/pomodoro", label: "Pomodoro" },
        { href: "/insights", label: "Insights" },
        { href: "/notifications", label: "Notifications", badge: unreadCount },
        { href: "/tips", label: "Tips" },
        { href: "/settings", label: "Settings" },
    ];

    const closeMenu = () => setMobileMenuOpen(false);

    return (
        <nav className="border-b-4 border-foreground bg-background sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <Link href="/" onClick={closeMenu}>
                        <Text as="h2" className="text-2xl md:text-3xl font-black cursor-pointer hover:text-primary transition-colors">
                            StreaX 🔥
                        </Text>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-3">
                        {navItems.map((item) => (
                            <Link key={item.href} href={item.href}>
                                <Button
                                    variant={pathname === item.href ? "default" : "outline"}
                                    size="sm"
                                    className="relative"
                                >
                                    {item.label}
                                    {item.badge !== undefined && item.badge > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-background">
                                            {item.badge > 9 ? '9+' : item.badge}
                                        </span>
                                    )}
                                </Button>
                            </Link>
                        ))}

                        <div className="flex items-center gap-2 ml-2">
                            <Text as="p" className="text-sm">
                                {isDark ? "🌙" : "☀️"}
                            </Text>
                            <Switch checked={isDark} onCheckedChange={toggleTheme} />
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex items-center gap-3 lg:hidden">
                        <div className="flex items-center gap-2">
                            <Text as="p" className="text-sm">
                                {isDark ? "🌙" : "☀️"}
                            </Text>
                            <Switch checked={isDark} onCheckedChange={toggleTheme} />
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="relative"
                        >
                            <span className="text-xl">{mobileMenuOpen ? "✕" : "☰"}</span>
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="lg:hidden mt-4 pb-2 space-y-2 border-t-2 border-foreground pt-4">
                        {navItems.map((item) => (
                            <Link key={item.href} href={item.href} onClick={closeMenu}>
                                <Button
                                    variant={pathname === item.href ? "default" : "outline"}
                                    size="sm"
                                    className="w-full relative justify-start"
                                >
                                    {item.label}
                                    {item.badge !== undefined && item.badge > 0 && (
                                        <span className="ml-auto bg-destructive text-destructive-foreground text-xs font-bold rounded-full px-2 py-0.5">
                                            {item.badge}
                                        </span>
                                    )}
                                </Button>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </nav>
    );
}
