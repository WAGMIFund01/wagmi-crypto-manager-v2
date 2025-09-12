# 🚀 Live Pricing Setup Guide (Direct Google Sheets API)

This guide will help you set up automatic price updates for your WAGMI Investment Manager database using CoinGecko API and Google Sheets API directly.

## 📋 Overview

The live pricing system will:
- ✅ Update **Column H (Current price)** from CoinGecko every 30 minutes
- ✅ Update **Column J (Last Price Update)** with current timestamp
- ✅ Let Google Sheets formulas handle **Column I (Total Value)** recalculation
- ✅ Support 30+ cryptocurrency symbols
- ✅ Run automatically via Vercel cron jobs
- ✅ Use Google Sheets API directly (no Google Apps Script needed)

## 🔧 Setup Steps

### Step 1: Enable Google Sheets API

1. **Go to Google Cloud Console**: [console.cloud.google.com](https://console.cloud.google.com)
2. **Select or Create Project**: Choose your project or create a new one
3. **Enable Google Sheets API**:
   - Go to "APIs & Services" → "Library"
   - Search for "Google Sheets API"
   - Click "Enable"

### Step 2: Create Service Account

1. **Go to Credentials**: "APIs & Services" → "Credentials"
2. **Create Credentials**: Click "Create Credentials" → "Service Account"
3. **Fill Details**:
   - Service account name: `wagmi-pricing-updater`
   - Description: `Service account for updating portfolio prices`
   - Click "Create and Continue"
4. **Skip Role Assignment**: Click "Continue" (we'll handle permissions manually)
5. **Click "Done"**

### Step 3: Generate Service Account Key

1. **Find Your Service Account**: In the credentials list, click on your service account
2. **Go to Keys Tab**: Click "Keys" tab
3. **Add Key**: Click "Add Key" → "Create new key"
4. **Choose JSON**: Select "JSON" format and click "Create"
5. **Download Key**: Save the JSON file securely

### Step 4: Share Google Sheet with Service Account

1. **Open Your Google Sheet**: The WAGMI Investment Manager Database
2. **Click Share**: Click the "Share" button (top right)
3. **Add Service Account**: 
   - Add the service account email (from the JSON file: `client_email`)
   - Set permission to "Editor"
   - Click "Send"

### Step 5: Configure Environment Variables

1. **Copy the template**: `cp .env.example .env.local`
2. **Update the values**:
   ```bash
   # Google Sheets API Configuration
   GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
   
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

3. **Extract from JSON**: From your downloaded service account JSON:
   - `client_email` → `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `private_key` → `GOOGLE_PRIVATE_KEY` (keep the quotes and \n characters)

### Step 6: Test the System

1. **Test the price update API**:
   ```bash
   curl -X POST http://localhost:3000/api/update-portfolio-prices
   ```

2. **Test the cron endpoint**:
   ```bash
   curl http://localhost:3000/api/cron/update-prices
   ```

3. **Check your Google Sheet**: Verify that prices and timestamps are updated

### Step 7: Deploy to Vercel

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

### 4. **Google Sheets API Update**
- Uses Google Sheets API to batch update prices
- Updates only Current price (H) and Last Price Update (J)
- Google Sheets formulas automatically recalculate Total Value (I)

## 🛠️ Troubleshooting

### Common Issues:

1. **"Credentials not configured" error**:
   - Check that `GOOGLE_SERVICE_ACCOUNT_EMAIL` and `GOOGLE_PRIVATE_KEY` are set
   - Verify the private key includes the full key with \n characters

2. **"Permission denied" error**:
   - Ensure the service account email has Editor access to your Google Sheet
   - Check that the Google Sheets API is enabled in your project

3. **"Symbol not found" error**:
   - Check if the symbol exists in `SYMBOL_TO_COINGECKO_ID` mapping
   - Verify the symbol case matches exactly

4. **CoinGecko API errors**:
   - Check if you're hitting rate limits (30 calls/minute for free tier)
   - Verify the CoinGecko API is accessible

5. **Google Sheets API errors**:
   - Check Google Cloud Console for API quotas
   - Verify the service account has proper permissions
   - Ensure the sheet name is exactly "Portfolio Overview"

### Monitoring:

1. **Check Vercel Function Logs**: Monitor for errors
2. **Google Cloud Console**: Check API usage and quotas
3. **Google Sheet**: Verify timestamps are updating
4. **API Response**: Check the JSON response for success/failure details

## 📈 Performance

- **Update Frequency**: Every 30 minutes
- **API Calls**: ~2-3 calls per update (1 CoinGecko + 1 Google Sheets batch update)
- **Rate Limits**: Well within both CoinGecko and Google Sheets API limits
- **Update Speed**: Typically completes in 3-8 seconds

## 🔒 Security

- **Service Account**: Limited permissions (only to your specific sheet)
- **Environment Variables**: All sensitive data stored securely
- **API Keys**: Stored in Vercel environment variables
- **Cron Security**: Optional `CRON_SECRET` for additional security

## 🎯 Advantages of Direct API Approach

- ✅ **Full Control**: All logic in your Next.js app
- ✅ **Better Logging**: Full visibility into what's happening
- ✅ **Easier Debugging**: Use your existing debugging tools
- ✅ **Version Control**: Changes tracked with your code
- ✅ **No External Dependencies**: No Google Apps Script to maintain
- ✅ **Better Error Handling**: Sophisticated retry logic possible
- ✅ **Integrated**: Part of your main application

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review Vercel function logs
3. Check Google Cloud Console for API usage
4. Verify all environment variables are set correctly
5. Ensure the service account has proper permissions

The system is designed to be robust and self-healing, but monitoring the first few runs is recommended to ensure everything works smoothly!
