#!/bin/bash

# WAGMI Crypto Manager - GitHub Setup Script
echo "🚀 Setting up GitHub repository for WAGMI Crypto Manager..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Get repository URL from user
echo ""
echo "📝 Please provide your GitHub repository URL:"
echo "   (e.g., https://github.com/yourusername/wagmi-crypto-manager-v2.git)"
read -p "Repository URL: " REPO_URL

if [ -z "$REPO_URL" ]; then
    echo "❌ Error: Repository URL is required"
    exit 1
fi

# Add remote and push
echo ""
echo "🔗 Adding GitHub remote..."
git remote add origin "$REPO_URL"

echo "📤 Pushing to GitHub..."
git branch -M main
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Success! Your code has been pushed to GitHub"
    echo "🌐 Repository URL: $REPO_URL"
    echo ""
    echo "Next steps:"
    echo "1. Go to https://vercel.com"
    echo "2. Sign in with GitHub"
    echo "3. Import your repository"
    echo "4. Configure environment variables"
    echo "5. Deploy!"
    echo ""
    echo "📖 See DEPLOYMENT-GUIDE.md for detailed instructions"
else
    echo "❌ Error: Failed to push to GitHub"
    echo "Please check your repository URL and try again"
    exit 1
fi
