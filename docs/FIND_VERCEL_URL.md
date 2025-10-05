# How to Find Your Vercel Preview URL

**Branch**: `feature/data-architecture-unification`  
**Purpose**: Get the preview URL to run smoke tests

---

## 🔍 Method 1: Vercel Dashboard (Easiest)

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Log in if needed

2. **Find Your Project**
   - Look for your crypto investment manager project
   - Click on it

3. **Find the Preview Deployment**
   - Look for deployments with branch: `feature/data-architecture-unification`
   - Should be at the top (most recent)
   - Status should be "Ready" (green checkmark)

4. **Copy the URL**
   - Click on the deployment
   - Copy the preview URL (e.g., `https://your-app-git-feature-data-architecture-unification-yourproject.vercel.app`)

---

## 🔍 Method 2: GitHub PR (If PR exists)

1. **Go to GitHub Repository**
   - Visit your repo on GitHub

2. **Find Pull Requests**
   - Click "Pull requests" tab
   - Look for PR from `feature/data-architecture-unification` to `main`

3. **Check Vercel Bot Comment**
   - Vercel bot should have commented with preview URL
   - Look for "✅ Preview" link
   - Click to visit or copy URL

---

## 🔍 Method 3: Vercel CLI (If installed)

```bash
# List recent deployments
vercel ls

# Find the one for feature/data-architecture-unification
# Copy the URL from the output
```

---

## 🔍 Method 4: Check Email

If you have Vercel notifications enabled:
1. Check your email for "Deployment Ready" from Vercel
2. Email should contain the preview URL
3. Copy the URL

---

## ✅ Verify You Have the Right URL

Your URL should look like:
```
https://[project-name]-git-feature-data-architecture-unification-[team-name].vercel.app
```

**Key parts**:
- Contains your project name
- Contains `git-feature-data-architecture-unification`
- Ends with `.vercel.app`

---

## 🧪 Once You Have the URL

### **Option 1: Automated Script (Recommended)**

```bash
# Run the automated smoke test suite
./scripts/run-smoke-tests.sh https://YOUR_VERCEL_URL
```

**Example**:
```bash
./scripts/run-smoke-tests.sh https://crypto-manager-git-feature-data-architecture-unification-wagmi.vercel.app
```

This will:
- ✅ Run all 6 smoke tests automatically
- ✅ Show color-coded results
- ✅ Provide a summary report
- ✅ Tell you if you're ready for full test suite

---

### **Option 2: Manual Testing**

**Test 1: Get Documentation**
```bash
curl https://YOUR_VERCEL_URL/api/test-sheets-adapter
```

**Test 2: Run a Method**
```bash
curl -X POST https://YOUR_VERCEL_URL/api/test-sheets-adapter \
  -H "Content-Type: application/json" \
  -d '{"method": "getWagmiTimestamp"}'
```

---

## 🚨 Troubleshooting

### **Issue: Can't find deployment in Vercel**
- **Cause**: Deployment may still be building
- **Fix**: Wait 2-3 minutes, refresh page

### **Issue: Deployment failed**
- **Cause**: Build error or configuration issue
- **Fix**: 
  1. Click on failed deployment
  2. Check build logs
  3. Look for error messages
  4. Fix issues and push again

### **Issue: Deployment is old (not latest commit)**
- **Cause**: Vercel didn't auto-deploy
- **Fix**: 
  1. Go to Vercel dashboard
  2. Click "Redeploy" on the deployment
  3. Or push a new commit to trigger deployment

---

## 📋 Deployment Checklist

Before running tests, verify:
- [ ] Deployment status is "Ready" (green checkmark)
- [ ] Deployment is for the correct branch (`feature/data-architecture-unification`)
- [ ] Deployment is recent (within last hour)
- [ ] URL is accessible (visit in browser)
- [ ] Environment variables are set (Google Sheets credentials)

---

## 🎯 Next Steps

Once you have the URL:

1. **Run Automated Tests**:
   ```bash
   ./scripts/run-smoke-tests.sh https://YOUR_VERCEL_URL
   ```

2. **Review Results**:
   - All 6 tests should pass
   - Check for any warnings

3. **If All Pass**:
   - ✅ Proceed to full test suite
   - See `docs/WEEK2_TEST_SUITE.md`

4. **If Any Fail**:
   - Review error messages
   - Check Vercel logs
   - See troubleshooting in `docs/WEEK2_QUICK_START.md`

---

## 💡 Pro Tips

1. **Bookmark the URL**: You'll use it for all Week 2 tests
2. **Check Logs**: Vercel logs show real-time API calls
3. **Use Browser**: Visit `/api/test-sheets-adapter` in browser to see documentation
4. **Test Locally First**: Run `npm run dev` and test against `localhost:3000` if deployment issues

---

**Ready to test!** 🚀

Once you have your Vercel URL, run the smoke tests and let me know the results!
