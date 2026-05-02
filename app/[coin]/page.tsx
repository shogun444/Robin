import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CoinDetailPage } from "@/components/coin-detail-page";
import { getMarketBySlug } from "@/lib/markets";

type PageProps = {
  params: Promise<{ coin: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { coin } = await params;
  const market = getMarketBySlug(coin);

  if (!market) {
    return {
      title: "Coin detail",
    };
  }

  return {
    title: `${market.name} live price`,
    description: `Live CoinGecko price detail for ${market.name}.`,
  };
}

export default async function CoinPage({ params }: PageProps) {
  const { coin } = await params;
  const market = getMarketBySlug(coin);

  if (!market) {
    notFound();
  }

  return <CoinDetailPage market={market} />;
}
