# Robin - Crypto Market Dashboard

A modern, frontend-only cryptocurrency trading dashboard built with Next.js, featuring real-time price data, interactive charts, and a clean trading UI.

## Features

- **Live Market Data** - Real-time crypto prices from CoinGecko API
- **Interactive Price Charts** - TradingView Lightweight Charts with multiple time ranges
- **Price Calculator** - Convert USD/INR to any supported cryptocurrency
- **Dynamic Routing** - Individual coin detail pages (`/btc`, `/eth`, `/sol`, etc.)
- **Dark Mode** - Built-in theme toggle with system preference detection
- **Responsive Design** - Mobile-first approach with Tailwind CSS v4
- **Performance Optimized** - SWR caching, debounced requests, and efficient re-renders

## Tech Stack

- **Framework**: Next.js 16.2.4 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Charts**: TradingView Lightweight Charts
- **Data Fetching**: SWR for caching and revalidation
- **API**: CoinGecko (free tier, no API key required)
- **Fonts**: Manrope & Inter (via next/font)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

```bash
# Clone the repository
git clone https://github.com/shogun444/Robin.git
cd Robin

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Available Scripts

```bash
npm run dev    # Start development server
npm run build  # Build for production
npm run start  # Start production server
npm run lint   # Run ESLint
```

## Project Structure

```
├── app/                      # Next.js App Router
│   ├── [coin]/              # Dynamic coin detail pages
│   ├── xlm/                 # XLM-specific page
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page
│   └── globals.css          # Global styles
├── components/              # React components
│   ├── price-chart.tsx      # TradingView chart component
│   ├── price-calculator.tsx # Currency converter
│   ├── market-dashboard.tsx # Main dashboard
│   ├── coin-detail-page.tsx # Individual coin details
│   └── ...
├── hooks/                   # Custom React hooks
│   ├── use-chart-data.ts    # Chart data fetching
│   └── use-theme.ts         # Theme management
├── lib/                     # Utility functions
│   ├── coingecko.ts         # CoinGecko API client
│   ├── format.ts            # Number/currency formatting
│   └── markets.ts           # Market data & types
└── public/                  # Static assets
```

## Features Breakdown

### Price Charts

- **Multiple Time Ranges**: 1D, 1W, 1M, 1Y, 5Y
- **Color-Coded Lines**: Green for uptrends, red for downtrends
- **Interactive Crosshair**: Hover to see exact price points
- **Responsive**: Adapts to screen size
- **Cached Data**: SWR prevents unnecessary API calls

### Price Calculator

- **Multi-Currency**: USD and INR support
- **Real-Time Rates**: Live exchange rates from CoinGecko
- **Coin-Specific**: Calculator adapts to selected cryptocurrency
- **Instant Conversion**: No page reloads needed

### Market Dashboard

- **Tabs**: Futures and Spot markets
- **Search**: Filter by coin name, symbol, or pair
- **Live Updates**: Auto-refreshing prices
- **Sorted Data**: Volume and 24h change metrics

## Supported Cryptocurrencies

- Bitcoin (BTC)
- Ethereum (ETH)
- Solana (SOL)
- XRP (XRP)
- Stellar Lumens (XLM)
- Dogecoin (DOGE)
- Cardano (ADA)
- Avalanche (AVAX)
- Toncoin (TON)
- Chainlink (LINK)
- TRON (TRX)

## API Usage

This project uses the CoinGecko public API:

- **No API key required** for basic usage
- **Rate limits**: 10-30 calls/minute (free tier)
- **Data cached** via SWR to minimize API calls

For production use, consider:
- Getting a CoinGecko Pro API key for higher limits
- Implementing a backend proxy to hide API calls
- Adding rate limiting on your server

## Customization

### Add New Coins

Edit `lib/markets.ts`:

```typescript
{
  slug: "newcoin",
  name: "New Coin",
  symbol: "NEW",
  pair: "NEW/USD",
  geckoId: "new-coin-gecko-id",  // Use CoinGecko ID
  tab: "spot" | "futures",
  volume: 1000000,
  change24h: 2.5,
}
```

### Customize Colors

Edit `app/globals.css` to modify the color scheme:

```css
:root {
  --background: #ffffff;
  --foreground: #171717;
  /* ... other variables */
}

.dark {
  --background: #0a0a0a;
  --foreground: #ededed;
  /* ... other variables */
}
```

## Performance Optimizations

- **SWR Caching**: Reduces API calls and improves load times
- **Code Splitting**: Automatic with Next.js App Router
- **Image Optimization**: Next.js Image component (if needed)
- **Debounced Search**: Prevents excessive filtering operations
- **Lazy Loading**: Charts only load when in view

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Other Platforms

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Known Limitations

- **Rate Limits**: CoinGecko free tier has rate limits
- **No Backend**: Fully frontend-only (no user authentication)
- **Market Data**: Uses seed data for market list, live data for prices
- **Timezones**: All times shown in UTC or user's local time

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).

## Credits

- **Next.js** - React framework
- **TradingView** - Lightweight Charts library
- **CoinGecko** - Cryptocurrency data API
- **Tailwind CSS** - Utility-first CSS framework
- **SWR** - Data fetching library

## Support

For issues, questions, or suggestions, please open an issue on [GitHub](https://github.com/shogun444/Robin/issues).
