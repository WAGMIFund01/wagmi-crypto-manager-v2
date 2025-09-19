# 🚀 WAGMI Crypto Investment Manager

A professional cryptocurrency portfolio tracking platform built with Next.js 14, TypeScript, and modern architecture principles.

## 🎯 Project Overview

The WAGMI Crypto Investment Manager enables fund managers to manage investor portfolios and provides investors with real-time access to their portfolio performance. Built with a modular, composable architecture for scalability and maintainability.

## ✨ Features

### 👨‍💼 Manager Features
- **Full Portfolio Access**: View and edit all investor portfolios
- **Portfolio Management**: Add/remove assets, adjust allocations
- **Investor Management**: Add new investors, manage access permissions
- **Analytics & Reports**: Generate performance reports and analytics
- **Real-Time Price Updates**: Live cryptocurrency price feeds via CoinGecko API
- **24hr Price Changes**: Track daily price movements with color-coded indicators
- **Module Selection**: Choose between WAGMI Fund Module, Personal Portfolio, or Developer tools
- **Audit Logging**: Track all changes with full audit trail

### 👤 Investor Features
- **Read-Only Access**: View own portfolio data only
- **Real-Time Data**: Live crypto prices and portfolio values
- **Performance Metrics**: P&L tracking, returns, and performance history
- **Privacy Controls**: Data masking toggle for sensitive information
- **Secure Access**: Investor ID-based authentication
- **Asset Details**: Comprehensive view of fund holdings with investment thesis
- **Mobile Responsive**: Optimized experience across all devices

## 🏗️ Architecture

### Technology Stack
- **Frontend**: Next.js 14 (App Router) + TypeScript
- **UI Framework**: Tailwind CSS + Lucide Icons
- **Authentication**: Auth.js (NextAuth) with Google OAuth
- **Data Source**: Google Sheets API with enhanced portfolio tracking
- **Price Data**: CoinGecko API with 24hr change tracking
- **Deployment**: Vercel with CI/CD
- **Monitoring**: Built-in error tracking and performance monitoring

### Project Structure
```
/src
├── /app                    # Next.js App Router
│   ├── /api               # API routes for data management
│   ├── /investor          # Investor dashboard and asset details
│   ├── /wagmi-fund-module # Manager dashboard
│   ├── /module-selection  # Landing page after login
│   └── /login             # Authentication pages
├── /components            # Reusable UI components
│   ├── /ui               # Design system components
│   ├── /tabs             # Dashboard tab components
│   └── UniversalNavbar   # Navigation component
├── /features             # Feature-based modules
│   ├── /auth            # Authentication logic
│   ├── /home            # Landing page components
│   ├── /portfolio       # Portfolio management
│   └── /privacy         # Data masking controls
├── /lib                  # Core utilities and configuration
│   ├── auth.ts          # NextAuth configuration
│   ├── config.ts        # App configuration
│   ├── sheetsAdapter.ts # Google Sheets integration
│   └── timestamp-utils.ts # Time formatting utilities
├── /shared              # Shared components and utilities
│   ├── /components      # Reusable components
│   ├── /types          # TypeScript type definitions
│   └── /utils          # Utility functions
└── /types              # Global type definitions
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Google OAuth credentials
- Google Sheets API access
- CoinGecko API key (optional, for enhanced rate limits)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/WAGMIFund01/wagmi-crypto-manager-v2.git
   cd wagmi-crypto-manager-v2
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   # Google Sheets Integration
   GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   GOOGLE_SHEET_ID=your-google-sheet-id
   GOOGLE_SHEETS_ENDPOINT=https://script.google.com/macros/s/...
   
   # CoinGecko API (optional but recommended)
   COINGECKO_API_KEY=your-coingecko-api-key
   
   # Authentication
   NEXTAUTH_SECRET=your-secret-key
   NEXTAUTH_URL=http://localhost:3000
   GOOGLE_CLIENT_ID=your-google-oauth-client-id
   GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
   
   # Monitoring (optional)
   SENTRY_DSN=your-sentry-dsn
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Development

### Key Development Rules
- **No Fallback Policy**: Errors must be visible, not hidden by fallback behavior
- **Modular Development**: Build one feature at a time, thoroughly tested
- **Type Safety**: Strict TypeScript throughout, no `any` types
- **Incremental Development**: Small, reviewable changes
- **Mobile-First**: All new features must be mobile responsive

### Code Quality Standards
- TypeScript strict mode enabled
- ESLint configuration with custom rules
- Tailwind CSS for consistent styling
- Modular, composable architecture
- Comprehensive error handling

### API Endpoints

#### Data Management
- `GET /api/get-portfolio-data` - Fetch portfolio asset data
- `GET /api/get-investor-data` - Fetch investor information
- `GET /api/get-kpi-data` - Fetch KPI metrics
- `GET /api/get-last-updated-timestamp` - Get last data update time

#### Price Updates
- `POST /api/update-all-prices` - Update all asset prices from CoinGecko
- `POST /api/update-single-price` - Update individual asset price
- `POST /api/update-price-changes` - Update 24hr price changes
- `POST /api/update-kpi-timestamp` - Update KPI timestamp

#### Authentication & Validation
- `POST /api/validate-investor` - Validate investor ID
- `GET /api/auth/[...nextauth]` - NextAuth authentication

#### Utilities
- `GET /api/test-sheets-connection` - Test Google Sheets connectivity
- `POST /api/test-sheets-write` - Test Google Sheets write access
- `GET /api/test-env-vars` - Verify environment variables

## �� Deployment

### Vercel Deployment
1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables
Make sure to set all required environment variables in your deployment platform:
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_PRIVATE_KEY`
- `GOOGLE_SHEET_ID`
- `GOOGLE_SHEETS_ENDPOINT`
- `COINGECKO_API_KEY`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `SENTRY_DSN`

### Branch Strategy
- `main` - Production-ready code
- `automatic-pricing-refresh` - Current development branch
- Feature branches for new development

## 📊 Performance Requirements
- **Page Load**: < 3 seconds
- **API Response**: < 2 seconds
- **Real-Time Updates**: Live price feeds with 1-minute intervals
- **Responsive Design**: Desktop, tablet, mobile optimized

## 🔒 Security
- Role-based access control (manager vs investor)
- Google OAuth authentication for managers
- Investor ID-based authentication for investors
- Secure environment variable management
- Audit logging for all changes
- Data masking for sensitive information

## 📈 Monitoring & Analytics
- Built-in error tracking and logging
- Performance monitoring
- User analytics
- Audit trail logging
- Real-time timestamp tracking

## 🎨 Design System

### WAGMI Components
- `WagmiButton` - Themed buttons with multiple variants
- `WagmiCard` - Consistent card layouts
- `WagmiText` - Typography components
- `WagmiSpinner` - Loading indicators
- `WagmiInput` - Form inputs
- `WagmiAlert` - Alert messages

### Color Scheme
- **Primary Orange**: #FF6600 (WAGMI brand color)
- **Background**: Dark theme (#1A1F1A, #2A1F1A)
- **Text**: White (#FFFFFF) with muted variants
- **Accents**: Orange (#FF6B35), Blue (#3B82F6), Red (#EF4444)

## 🤝 Contributing
1. Fork the repository
2. Create a feature branch from `main`
3. Make your changes with proper testing
4. Ensure mobile responsiveness
5. Submit a pull request

## 📄 License
This project is proprietary software. All rights reserved.

## 📞 Support
For support and questions, please contact the development team.

---

**Built with ❤️ using Next.js 14 and modern web technologies**
