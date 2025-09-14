# 🤖 WAGMI Crypto Investment Manager - AI Agent Handover

## System Overview

**Project**: WAGMI Crypto Investment Manager  
**Framework**: Next.js 14 (App Router) + TypeScript  
**Deployment**: Vercel (wagmi-crypto-manager-v2 project)  
**Current Branch**: `automatic-pricing-refresh`  
**Last Commit**: `550647c` (Add comprehensive documentation suite)

## Architecture Patterns

### File Structure Conventions
```
/src
├── /app                    # Next.js App Router (pages + API routes)
│   ├── /api               # API routes (15 endpoints)
│   ├── /investor          # Investor-facing pages
│   ├── /wagmi-fund-module # Manager dashboard
│   └── /module-selection  # Post-login landing
├── /components            # Reusable UI components
│   ├── /ui               # Design system components
│   └── /tabs             # Dashboard-specific components
├── /lib                  # Core utilities and configuration
└── /shared              # Shared types and utilities
```

### Component Architecture
- **Design System**: All UI components use WAGMI design system (`WagmiButton`, `WagmiCard`, etc.)
- **Mobile-First**: All components must be responsive with Tailwind CSS
- **Type Safety**: Strict TypeScript, no `any` types allowed
- **Error Handling**: No silent failures, all errors must be visible

## Critical Implementation Patterns

### 1. Authentication Flow
```typescript
// Manager Authentication (NextAuth + Google OAuth)
// File: src/lib/auth.ts
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      return `${baseUrl}/module-selection`;
    }
  }
};

// Investor Authentication (ID-based validation)
// File: src/app/api/validate-investor/route.ts
export async function POST(request: NextRequest) {
  const { investorId } = await request.json();
  // Validates against Google Sheets data
}
```

### 2. Data Flow Pattern
```typescript
// Standard data fetching pattern
const [data, setData] = useState(null);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/endpoint');
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };
  fetchData();
}, []);
```

### 3. Google Sheets Integration
```typescript
// File: src/lib/sheetsAdapter.ts
export class SheetsAdapter {
  private sheets: sheets_v4.Sheets;
  
  async getPortfolioData(): Promise<PortfolioAsset[]> {
    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Portfolio Overview!A2:M',
    });
    // Transform raw data to typed objects
  }
  
  async updateCell(range: string, value: any): Promise<void> {
    await this.sheets.spreadsheets.values.update({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [[value]] }
    });
  }
}
```

### 4. CoinGecko API Integration
```typescript
// File: src/app/api/update-all-prices/route.ts
const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY;
const headers = {
  'x-cg-demo-api-key': COINGECKO_API_KEY,
  'Content-Type': 'application/json'
};

const response = await fetch(
  `https://api.coingecko.com/api/v3/simple/price?ids=${coinGeckoIds.join(',')}&vs_currencies=usd&include_24hr_change=true`,
  { headers }
);
```

## Key Environment Variables

```env
# Google Sheets Integration
GOOGLE_SERVICE_ACCOUNT_EMAIL=service@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=1h04nkcnQmxaFml8RubIGmPgffMiyoEIg350ryjXK0tM
GOOGLE_SHEETS_ENDPOINT=https://script.google.com/macros/s/...

# CoinGecko API
COINGECKO_API_KEY=CG-WED3sJACi9tkAs8LbA1zzEX5

# Authentication
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://wagmi-crypto-manager-v2.vercel.app
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
```

## API Endpoints Reference

### Data Management
- `GET /api/get-portfolio-data` - Portfolio assets from Google Sheets
- `GET /api/get-investor-data?investorId=X` - Investor-specific data
- `GET /api/get-kpi-data` - Fund KPIs and metrics
- `GET /api/get-last-updated-timestamp` - Data freshness timestamp

### Price Updates
- `POST /api/update-all-prices` - Updates all asset prices via CoinGecko
- `POST /api/update-single-price` - Updates individual asset (currently AURA)
- `POST /api/update-price-changes` - Updates 24hr price changes
- `POST /api/update-kpi-timestamp` - Updates KPI timestamp

### Authentication
- `POST /api/validate-investor` - Validates investor ID
- `GET /api/auth/[...nextauth]` - NextAuth endpoints

### Utilities
- `GET /api/test-sheets-connection` - Tests Google Sheets connectivity
- `POST /api/test-sheets-write` - Tests write permissions
- `GET /api/test-env-vars` - Validates environment variables

## Component Usage Patterns

### WAGMI Design System
```typescript
// Standard button usage
<WagmiButton 
  variant="primary" 
  theme="green" 
  onClick={handleClick}
  loading={isLoading}
>
  Click me
</WagmiButton>

// Standard card usage
<WagmiCard variant="kpi" theme="green" glow>
  <WagmiText variant="heading" color="primary">
    $1,000,000
  </WagmiText>
</WagmiCard>

// Standard text usage
<WagmiText variant="body" color="muted">
  Secondary text content
</WagmiText>
```

### Mobile Responsiveness Pattern
```typescript
// Standard responsive layout
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Desktop: 3 columns, Tablet: 2 columns, Mobile: 1 column */}
</div>

// Standard mobile table pattern
<div className="hidden md:block">
  {/* Desktop table */}
</div>
<div className="md:hidden space-y-4">
  {/* Mobile cards */}
</div>
```

## Data Models

### Portfolio Asset
```typescript
interface PortfolioAsset {
  assetName: string;        // Column A
  symbol: string;          // Column B
  chain: string;           // Column C
  riskLevel: string;       // Column D
  location: string;        // Column E
  coinType: string;        // Column F
  quantity: number;        // Column G
  currentPrice: number;    // Column H
  totalValue: number;      // Column I
  lastPriceUpdate: string; // Column J
  coinGeckoId: string;     // Column K
  priceChange24h: number;  // Column L
  thesis: string;          // Column M
}
```

### Investor Data
```typescript
interface Investor {
  id: string;
  name: string;
  email: string;
  portfolioValue: number;
  allocation: number;
  lastUpdated: string;
}
```

### KPI Data
```typescript
interface KPIData {
  activeInvestors: number;
  totalAUM: number;
  cumulativeReturn: number;
  lastUpdated: string;
}
```

## Error Handling Patterns

### API Error Response
```typescript
// Standard API error format
{
  "success": false,
  "error": "Descriptive error message",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Component Error Handling
```typescript
// Standard error display
{error && (
  <WagmiAlert variant="error" theme="red">
    {error}
  </WagmiAlert>
)}
```

## Development Rules

### 1. TypeScript Rules
- **No `any` types** - Use proper interfaces
- **Strict mode enabled** - All files must compile without errors
- **Interface definitions** - All data structures must be typed

### 2. Component Rules
- **Mobile-first** - All components must work on mobile
- **WAGMI components only** - Use design system components
- **Error visibility** - No silent failures
- **Loading states** - Always show loading indicators

### 3. API Rules
- **Consistent responses** - All APIs return `{success, data/error, timestamp}`
- **Error handling** - Proper HTTP status codes
- **Rate limiting** - Respect external API limits
- **Environment variables** - No hardcoded secrets

### 4. Git Rules
- **Incremental commits** - Small, focused changes
- **Descriptive messages** - Clear commit descriptions
- **Branch protection** - No direct pushes to main
- **Testing required** - All changes must be tested

## Common Issues & Solutions

### 1. Build Failures
```bash
# Check TypeScript errors
npm run build

# Common fixes:
# - Fix TypeScript errors
# - Add missing environment variables
# - Resolve dependency conflicts
```

### 2. API Errors
```bash
# Test environment variables
curl https://wagmi-crypto-manager-v2.vercel.app/api/test-env-vars

# Test Google Sheets connection
curl https://wagmi-crypto-manager-v2.vercel.app/api/test-sheets-connection
```

### 3. Authentication Issues
- Check Google OAuth configuration
- Verify redirect URIs in Google Cloud Console
- Ensure NEXTAUTH_URL matches deployment URL

### 4. Mobile Layout Issues
- Test with browser dev tools
- Use Tailwind responsive classes
- Ensure touch targets are 44px minimum

## Deployment Process

### Vercel Deployment
```bash
# Deploy current branch
vercel deploy

# Deploy to production
vercel deploy --prod

# Link to correct project
vercel link --project wagmi-crypto-manager-v2
```

### Environment Variables
- Set in Vercel dashboard under Project Settings → Environment Variables
- Required for all environments (Production, Preview, Development)

## Testing Checklist

### Before Deployment
- [ ] TypeScript compilation passes
- [ ] ESLint warnings resolved
- [ ] Mobile responsiveness verified
- [ ] All user flows tested
- [ ] API endpoints functional
- [ ] Error handling verified

### Post-Deployment
- [ ] Production URL accessible
- [ ] Authentication working
- [ ] Data loading correctly
- [ ] Mobile layout functional
- [ ] Error tracking active

## Performance Targets

- **Page Load**: < 3 seconds
- **API Response**: < 2 seconds
- **Mobile Performance**: 90+ Lighthouse score
- **Core Web Vitals**: All metrics in green

## Security Considerations

- **Environment Variables**: All secrets in env vars
- **Authentication**: Role-based access control
- **Data Validation**: Server-side validation required
- **CORS**: Configured for production domains only
- **Rate Limiting**: Respect external API limits

## Monitoring & Debugging

### Built-in Monitoring
- Vercel Analytics for performance
- Function logs for API debugging
- Error tracking for issues

### Debug Endpoints
- `/api/test-env-vars` - Environment validation
- `/api/test-sheets-connection` - Google Sheets connectivity
- `/api/test-sheets-write` - Write permissions

## Current State

### Working Features
- ✅ Manager authentication (Google OAuth)
- ✅ Investor authentication (ID-based)
- ✅ Portfolio management
- ✅ Real-time price updates
- ✅ 24hr price changes
- ✅ Mobile responsive design
- ✅ Module selection
- ✅ Asset details page
- ✅ Privacy mode
- ✅ KPI tracking

### Recent Changes
- Fixed column header wrapping in asset table
- Added comprehensive documentation suite
- Optimized mobile responsiveness
- Implemented 24hr price change tracking
- Added investor asset details page

### Known Issues
- None currently identified
- All major features working
- Mobile layout optimized
- Performance targets met

## Next Development Priorities

1. **Performance Optimization** - Further improve load times
2. **Feature Enhancements** - Additional portfolio analytics
3. **Security Hardening** - Enhanced authentication
4. **Monitoring Improvements** - Better error tracking
5. **User Experience** - Additional mobile optimizations

## Code Quality Standards

- **ESLint**: Custom configuration with strict rules
- **TypeScript**: Strict mode with no implicit any
- **Tailwind**: Consistent utility class usage
- **Component Design**: Single responsibility principle
- **Error Handling**: Comprehensive error boundaries

---

**System Status**: ✅ Fully Operational  
**Last Updated**: 2024-01-15  
**Ready for AI Agent Handover**: ✅
