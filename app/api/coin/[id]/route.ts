import { NextResponse } from "next/server";
import { fetchCoinQuote, fetchUsdToInrRate } from "@/lib/coingecko";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [quote, rate] = await Promise.all([
    fetchCoinQuote(id),
    fetchUsdToInrRate(),
  ]);

  return NextResponse.json({ quote, rate });
}
