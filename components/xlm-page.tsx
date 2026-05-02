"use client";

import Link from "next/link";
import { Layout } from "@/components/layout";
import { PriceCalculator } from "@/components/price-calculator";
import { PriceChart } from "@/components/price-chart";
import { ThemeToggle } from "@/components/theme-toggle";

export function XlmPage() {
  return (
    <Layout
      headerCenter={
        <div className="hidden text-sm text-muted md:block">
          XLM price calculator
        </div>
      }
      headerRight={
        <div className="flex items-center gap-2">
          <Link
            className="inline-flex h-10 items-center rounded-full border border-border bg-surface px-4 text-sm font-medium text-foreground transition hover:border-foreground/40 hover:bg-surface-strong"
            href="/"
          >
            Markets
          </Link>
          <ThemeToggle />
        </div>
      }
    >
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <p className="text-[0.7rem] uppercase tracking-[0.24em] text-muted">
            Calculator
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-foreground sm:text-4xl">
            Stellar Lumens
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Enter an amount in USD or INR and get a live XLM estimate using CoinGecko pricing and a live USD-to-INR conversion rate.
          </p>
        </div>

        <PriceChart 
          coinId="stellar" 
          coinName="Stellar Lumens"
        />

        <PriceCalculator 
          coinName="Stellar Lumens" 
          geckoId="stellar"
          title="Stellar Lumens"
        />
      </div>
    </Layout>
  );
}

