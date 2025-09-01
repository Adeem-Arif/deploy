"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import LoadingScreen from "@/components/LoadingScreen";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Trigger loader on route change
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 800); // smooth delay
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <Header />
      {loading && <LoadingScreen />}
      <div className="p-6">{children}</div>
    </main>
  );
}
