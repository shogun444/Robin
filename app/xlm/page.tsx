import type { Metadata } from "next";
import { XlmPage } from "@/components/xlm-page";

export const metadata: Metadata = {
  title: "XLM price calculator",
  description: "Live Stellar Lumens price calculator with USD and INR support.",
};

export default function Page() {
  return <XlmPage />;
}

