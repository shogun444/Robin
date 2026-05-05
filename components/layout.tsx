"use client";

import Image from "next/image";
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
           <Image className="rounded-full h-10 w-20" src={"/Robin.png"} alt="Robin.png" height={1000} width={1000}></Image>
            
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

