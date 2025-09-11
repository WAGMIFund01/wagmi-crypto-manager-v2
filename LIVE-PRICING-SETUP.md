# 🚀 Live Pricing Setup Guide

This guide will help you set up automatic price updates for your WAGMI Investment Manager database using CoinGecko API.

## 📋 Overview

The live pricing system will:
- ✅ Update **Column H (Current price)** from CoinGecko every 30 minutes
- ✅ Update **Column J (Last Price Update)** with current timestamp
- ✅ Let Google Sheets formulas handle **Column I (Total Value)** recalculation
- ✅ Support 30+ cryptocurrency symbols
- ✅ Run automatically via Vercel cron jobs

## 🔧 Setup Steps

### Step 1: Deploy Google Apps Script

1. **Open Google Apps Script**: Go to [script.google.com](https://script.google.com)
2. **Create New Project**: Click "New Project"
3. **Copy the Script**: Copy the contents from `google-sheets-price-update.gs`
4. **Paste and Save**: Paste the code and save the project
5. **Deploy as Web App**:
   - Click "Deploy" → "New deployment"
   - Choose "Web app" as type
   - Set execute as "Me"
   - Set access to "Anyone"
   - Click "Deploy"
6. **Copy the Web App URL**: This will be your `GOOGLE_SHEETS_ENDPOINT`

### Step 2: Configure Environment Variables

1. **Copy the template**: `cp .env.example .env.local`
2. **Update the values**:
   ```bash
   # Google Sheets Configuration
   GOOGLE_SHEETS_ENDPOINT=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
   
   # Optional: CoinGecko API key (free tier doesn't require it)
   COINGECKO_API_KEY=your_coinGecko_api_key_here
   
   # Authentication (you should already have these)
   NEXTAUTH_SECRET=your_nextauth_secret_here
   NEXTAUTH_URL=http://localhost:3000
   GOOGLE_CLIENT_ID=your_google_client_id_here
   GOOGLE_CLIENT_SECRET=your_google_client_secret_here
   
   # Optional: Cron job security
   CRON_SECRET=your_random_secret_string_here
   ```

### Step 3: Test the System

1. **Test the price update API**:
   ```bash
   curl -X POST http://localhost:3000/api/update-portfolio-prices
   ```

2. **Test the cron endpoint**:
   ```bash
   curl http://localhost:3000/api/cron/update-prices
   ```

3. **Check your Google Sheet**: Verify that prices and timestamps are updated

### Step 4: Deploy to Vercel

1. **Push to GitHub**: The cron job will automatically start
2. **Check Vercel Dashboard**: Verify the cron job is running
3. **Monitor Logs**: Check function logs for any errors

## 📊 Supported Cryptocurrencies

The system supports these symbols (automatically mapped to CoinGecko IDs):

| Symbol | CoinGecko ID | Symbol | CoinGecko ID |
|--------|--------------|--------|--------------|
| AURA | aura-network | ETH | ethereum |
| JITOSOL | jito-staked-sol | SOL | solana |
| JUP | jupiter-exchange-solana | USDC | usd-coin |
| USDT | tether | BTC | bitcoin |
| MATIC | matic-network | AVAX | avalanche-2 |
| ATOM | cosmos | DOT | polkadot |
| LINK | chainlink | UNI | uniswap |
| AAVE | aave | CRV | curve-dao-token |
| COMP | compound-governance-token | MKR | maker |
| SNX | havven | YFI | yearn-finance |
| SUSHI | sushi | 1INCH | 1inch |
| BAL | balancer | LDO | lido-dao |
| RPL | rocket-pool | FXS | frax-share |
| CVX | convex-finance | FRAX | frax |
| LUSD | liquity-usd | GUSD | gemini-dollar |
| SUSD | nusd | DAI | dai |
| BUSD | binance-usd | TUSD | true-usd |
| USDP | paxos-standard | HUSD | husd |
| USDN | neutrino-usd | USDK | usdk |
| USDS | stableusd | | |

## 🔍 How It Works

### 1. **Cron Job Trigger** (Every 30 minutes)
- Vercel cron calls `/api/cron/update-prices`
- This triggers the price update process

### 2. **Portfolio Data Fetch**
- System fetches current portfolio data from your Google Sheet
- Identifies assets with quantity > 0 that have CoinGecko mappings

### 3. **CoinGecko API Call**
- Fetches current prices for all identified assets
- Uses the `/simple/price` endpoint (free tier: 30 calls/minute)

### 4. **Google Sheets Update**
- Calls your Google Apps Script for each asset
- Updates only Current price (H) and Last Price Update (J)
- Google Sheets formulas automatically recalculate Total Value (I)

## 🛠️ Troubleshooting

### Common Issues:

1. **"Service not configured" error**:
   - Check that `GOOGLE_SHEETS_ENDPOINT` is set correctly
   - Verify the Google Apps Script is deployed and accessible

2. **"Symbol not found" error**:
   - Check if the symbol exists in `SYMBOL_TO_COINGECKO_ID` mapping
   - Verify the symbol case matches exactly

3. **CoinGecko API errors**:
   - Check if you're hitting rate limits (30 calls/minute for free tier)
   - Verify the CoinGecko API is accessible

4. **Google Sheets update failures**:
   - Check Google Apps Script logs
   - Verify the script has proper permissions
   - Ensure the sheet name is exactly "Portfolio Overview"

### Monitoring:

1. **Check Vercel Function Logs**: Monitor for errors
2. **Google Apps Script Logs**: Check execution logs
3. **Google Sheet**: Verify timestamps are updating
4. **API Response**: Check the JSON response for success/failure details

## 📈 Performance

- **Update Frequency**: Every 30 minutes
- **API Calls**: ~1-2 calls per update (depending on portfolio size)
- **Rate Limits**: Well within CoinGecko free tier limits
- **Update Speed**: Typically completes in 2-5 seconds

## 🔒 Security

- **Google Apps Script**: Runs with your Google account permissions
- **Environment Variables**: All sensitive data stored securely
- **Cron Security**: Optional `CRON_SECRET` for additional security
- **API Keys**: CoinGecko API key optional (free tier works without it)

## 🎯 Next Steps

1. **Deploy the system** following the steps above
2. **Monitor the first few runs** to ensure everything works
3. **Add more symbols** to `SYMBOL_TO_COINGECKO_ID` as needed
4. **Set up monitoring** to get notified of any failures
5. **Consider upgrading** to CoinGecko Pro if you need higher rate limits

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review Vercel function logs
3. Check Google Apps Script execution logs
4. Verify all environment variables are set correctly

The system is designed to be robust and self-healing, but monitoring the first few runs is recommended to ensure everything works smoothly!
