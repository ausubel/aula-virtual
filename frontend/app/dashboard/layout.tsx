"use client";

import { Sidebar } from "@/components/navigation/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen pt-16">
      <div className="hidden md:flex w-64 shrink-0">
        <Sidebar className="w-full" />
      </div>
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
} 