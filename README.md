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
- **Audit Logging**: Track all changes with full audit trail

### 👤 Investor Features
- **Read-Only Access**: View own portfolio data only
- **Real-Time Data**: Live crypto prices and portfolio values
- **Performance Metrics**: P&L tracking, returns, and performance history
- **Privacy Controls**: Data masking toggle for sensitive information
- **Secure Access**: Investor ID-based authentication

## 🏗️ Architecture

### Technology Stack
- **Frontend**: Next.js 14 (App Router) + TypeScript
- **UI Framework**: Tailwind CSS + Lucide Icons
- **Authentication**: Auth.js (NextAuth) with Google OAuth
- **Data Source**: Google Sheets (enhanced with new tabs)
- **Deployment**: Vercel with CI/CD
- **Monitoring**: Sentry for error tracking

### Modular Architecture
```
/src
├── /features          # Feature-based modules
│   ├── /auth         # Authentication logic & components
│   ├── /portfolio    # Portfolio management & display
│   ├── /home         # Landing page & login
│   └── /privacy      # Data masking & privacy controls
├── /shared           # Shared components, hooks, types, utils
├── /lib              # Core configuration and utilities
└── /app              # Next.js App Router pages and API routes
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Google OAuth credentials
- Google Sheets API access

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
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
   GOOGLE_SHEETS_ENDPOINT=https://script.google.com/macros/s/...
   COINGECKO_API_KEY=your-coingecko-api-key
   
   # Authentication
   NEXTAUTH_SECRET=your-secret-key
   NEXTAUTH_URL=http://localhost:3000
   GOOGLE_CLIENT_ID=your-google-oauth-client-id
   GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
   
   # Monitoring
   SENTRY_DSN=your-sentry-dsn
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Development

### Project Structure
- **Features**: Self-contained modules with components, hooks, services, and types
- **Shared**: Reusable components, hooks, utilities, and type definitions
- **Lib**: Core configuration, authentication, and utility functions
- **App**: Next.js App Router pages and API routes

### Key Development Rules
- **No Fallback Policy**: Errors must be visible, not hidden by fallback behavior
- **Modular Development**: Build one feature at a time, thoroughly tested
- **Type Safety**: Strict TypeScript throughout, no `any` types
- **Incremental Development**: Small, reviewable changes

### Code Quality
- TypeScript strict mode
- ESLint configuration
- Tailwind CSS for styling
- Modular, composable architecture

## 🚀 Deployment

### Vercel Deployment
1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables
Make sure to set all required environment variables in your deployment platform:
- `GOOGLE_SHEETS_ENDPOINT`
- `COINGECKO_API_KEY`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `SENTRY_DSN`

## 📊 Performance Requirements
- **Page Load**: < 3 seconds
- **API Response**: < 2 seconds
- **Real-Time Updates**: Live price feeds
- **Responsive Design**: Desktop, tablet, mobile

## 🔒 Security
- Role-based access control (manager vs investor)
- Google OAuth authentication
- Secure environment variable management
- Audit logging for all changes

## 📈 Monitoring
- Sentry integration for error tracking
- Performance monitoring
- User analytics
- Audit trail logging

## 🤝 Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License
This project is proprietary software. All rights reserved.

## 📞 Support
For support and questions, please contact the development team.

---

**Built with ❤️ using Next.js 14 and modern web technologies**# Rollback to stable version - Fri Sep 12 00:32:14 EDT 2025
