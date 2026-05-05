import { NextResponse } from "next/server";
import { fetchCoinQuote } from "@/lib/coingecko";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const quote = await fetchCoinQuote(id);
    return NextResponse.json({ quote });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch quote" },
      { status: 500 }
    );
  }
}