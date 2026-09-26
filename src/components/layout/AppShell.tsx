"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import MobileNav from "./MobileNav";
import AuthGate from "./AuthGate";
import { startOutboxAutoFlush } from "@/lib/outbox";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isOnboarding = pathname === "/onboarding";

  useEffect(() => {
    startOutboxAutoFlush();
  }, []);

  if (isOnboarding) {
    return (
      <div className="min-h-screen bg-base-950">
        <AuthGate>{children}</AuthGate>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-base-950">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <TopBar />
        <main className="flex-1 px-4 py-5 pb-[calc(6rem+env(safe-area-inset-bottom,0px))] lg:px-8 lg:py-7 lg:pb-7 max-w-[1400px] w-full mx-auto">
          <AuthGate>{children}</AuthGate>
        </main>
        <MobileNav />
      </div>
    </div>
  );
}
