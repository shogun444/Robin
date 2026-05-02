"use client";

import type { ReactNode } from "react";
import { SWRConfig } from "swr";
import { ThemeProvider } from "@/hooks/use-theme";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <SWRConfig
        value={{
          dedupingInterval: 15_000,
          errorRetryCount: 2,
          revalidateOnFocus: false,
          shouldRetryOnError: true,
        }}
      >
        {children}
      </SWRConfig>
    </ThemeProvider>
  );
}

