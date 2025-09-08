# 🚀 Vercel Deployment Guide

## Prerequisites
- GitHub repository created
- Vercel account (free tier is fine)
- Google OAuth credentials

## Step 1: Create GitHub Repository
1. Go to [GitHub.com](https://github.com) and create a new repository
2. Name: `wagmi-crypto-manager-v2`
3. Description: `Professional cryptocurrency portfolio tracking platform`
4. Make it **Public**
5. **Don't** initialize with README (we already have one)

## Step 2: Push Code to GitHub
```bash
# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/wagmi-crypto-manager-v2.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 3: Deploy to Vercel
1. Go to [Vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Import your `wagmi-crypto-manager-v2` repository
5. Vercel will auto-detect Next.js settings

## Step 4: Configure Environment Variables
In Vercel dashboard, go to your project → Settings → Environment Variables:

### Required Variables:
```env
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=your-secret-key-here
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
GOOGLE_SHEETS_ENDPOINT=https://script.google.com/macros/s/...
COINGECKO_API_KEY=your-coingecko-api-key
SENTRY_DSN=your-sentry-dsn (optional)
```

## Step 5: Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `https://your-app-name.vercel.app/api/auth/callback/google`
   - `http://localhost:3000/api/auth/callback/google` (for development)

## Step 6: Deploy
1. Click "Deploy" in Vercel
2. Wait for build to complete
3. Your app will be live at `https://your-app-name.vercel.app`

## Post-Deployment
- Test the login flow
- Verify role-based access works
- Check that all pages load correctly
- Test responsive design on mobile

## Troubleshooting
- **Build fails**: Check environment variables are set
- **Login doesn't work**: Verify Google OAuth redirect URIs
- **Pages not loading**: Check console for errors
- **Styling issues**: Ensure Tailwind CSS is properly configured

## Next Steps
- Set up custom domain (optional)
- Configure monitoring with Sentry
- Set up CI/CD for automatic deployments
- Add Google Sheets integration
