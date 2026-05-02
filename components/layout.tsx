"use client";

import Link from "next/link";
import type { ReactNode } from "react";

type LayoutProps = {
  children: ReactNode;
  headerCenter?: ReactNode;
  headerRight?: ReactNode;
};

export function Layout({ children, headerCenter, headerRight }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.24em] text-foreground"
            href="/"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-base font-bold text-foreground shadow-(--shadow)">
              R
            </span>
            <span className="hidden text-[0.8rem] sm:inline">Robin</span>
          </Link>
          <div className="flex min-w-0 flex-1 items-center justify-center">
            {headerCenter}
          </div>
          <div className="flex items-center gap-2">{headerRight}</div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}

