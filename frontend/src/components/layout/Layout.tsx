import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { AIChatPanel } from "../AIChatPanel";
import { CommandPalette } from "../CommandPalette";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
      <AIChatPanel />
      <CommandPalette />
    </div>
  );
}
