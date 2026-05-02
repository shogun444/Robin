import { NextResponse } from "next/server";
import { fetchCoinQuote, fetchUsdToInrRate } from "@/lib/coingecko";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const [quote, rate] = await Promise.all([
    fetchCoinQuote(params.id),
    fetchUsdToInrRate(),
  ]);

  return NextResponse.json({ quote, rate });
}