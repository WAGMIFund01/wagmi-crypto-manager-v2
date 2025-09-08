export const config = {
  // Google Sheets
  googleSheetsEndpoint: process.env.GOOGLE_SHEETS_ENDPOINT || '',
  coinGeckoApiKey: process.env.COINGECKO_API_KEY || '',
  
  // Authentication
  nextAuthSecret: process.env.NEXTAUTH_SECRET || '',
  nextAuthUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  
  // Monitoring
  sentryDsn: process.env.SENTRY_DSN || '',
  
  // App Configuration
  appName: 'WAGMI Crypto Investment Manager',
  appDescription: 'Professional cryptocurrency portfolio tracking platform',
  
  // Performance Requirements
  performance: {
    maxPageLoadTime: 3000, // 3 seconds
    maxApiResponseTime: 2000, // 2 seconds
  },
} as const;
