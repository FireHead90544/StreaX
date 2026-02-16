"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/retroui/Card";
import { Text } from "@/components/retroui/Text";
import { Button } from "@/components/retroui/Button";

export function PWAInstallSection() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((registration) => {
          console.log("Service Worker registered:", registration);
        })
        .catch((error) => {
          console.log("Service Worker registration failed:", error);
        });
    }

    // Detect iOS and Android
    const userAgent = window.navigator.userAgent.toLowerCase();
    const iOS = /iphone|ipad|ipod/.test(userAgent);
    const android = /android/.test(userAgent);
    setIsIOS(iOS);
    setIsAndroid(android);

    // Check if already installed (standalone mode)
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    
    if (isInStandaloneMode) {
      setIsInstalled(true);
      return;
    }

    // Listen for beforeinstallprompt event (Chrome/Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log("beforeinstallprompt fired");
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Listen for app installed
    window.addEventListener("appinstalled", () => {
      console.log("PWA was installed");
      setIsInstallable(false);
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      console.log("No deferredPrompt available");
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);

    if (outcome === 'accepted') {
      setIsInstalled(true);
    }

    // Clear the saved prompt
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  return (
    <Card className="p-6">
      <Text as="h2" className="text-2xl font-bold mb-4">
        Install App 📱
      </Text>
      
      {isInstalled ? (
        <div className="space-y-2">
          <Text as="p" className="text-muted-foreground">
            ✅ StreaX is already installed on this device!
          </Text>
          <Text as="p" className="text-sm text-muted-foreground">
            You can access it from your home screen or app drawer.
          </Text>
        </div>
      ) : isInstallable && !isIOS ? (
        <div className="space-y-3">
          <Text as="p" className="text-muted-foreground mb-2">
            Install StreaX for a native app experience with offline support.
          </Text>
          <Button onClick={handleInstallClick} className="w-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Install StreaX
          </Button>
        </div>
      ) : isIOS ? (
        <div className="space-y-3">
          <Text as="p" className="text-muted-foreground mb-3">
            Install StreaX on your iPhone/iPad for a native app experience:
          </Text>
          <div className="space-y-2 text-sm bg-muted/30 p-4 rounded border-2">
            <div className="flex items-start gap-2">
              <strong className="font-bold">1.</strong>
              <Text as="p">
                Tap the <strong>Share</strong> button at the bottom of Safari
              </Text>
            </div>
            <div className="flex items-start gap-2">
              <strong className="font-bold">2.</strong>
              <Text as="p">
                Scroll down and tap <strong>"Add to Home Screen"</strong>
              </Text>
            </div>
            <div className="flex items-start gap-2">
              <strong className="font-bold">3.</strong>
              <Text as="p">
                Tap <strong>"Add"</strong> in the top right corner
              </Text>
            </div>
          </div>
        </div>
      ) : isAndroid ? (
        <div className="space-y-2">
          <Text as="p" className="text-muted-foreground">
            To install StreaX on Android:
          </Text>
          <div className="space-y-2 text-sm bg-muted/30 p-4 rounded border-2">
            <div className="flex items-start gap-2">
              <strong className="font-bold">1.</strong>
              <Text as="p">
                Make sure you're using <strong>Chrome</strong> browser
              </Text>
            </div>
            <div className="flex items-start gap-2">
              <strong className="font-bold">2.</strong>
              <Text as="p">
                Look for the install prompt that should appear
              </Text>
            </div>
            <div className="flex items-start gap-2">
              <strong className="font-bold">3.</strong>
              <Text as="p">
                Or tap the menu (⋮) and select <strong>"Install app"</strong>
              </Text>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <Text as="p" className="text-muted-foreground">
            StreaX can be installed as a Progressive Web App for offline access and a native app experience.
          </Text>
          <Text as="p" className="text-sm text-muted-foreground">
            To install, open this page in Chrome, Edge, or Safari and look for the install option in your browser menu.
          </Text>
        </div>
      )}
    </Card>
  );
}
