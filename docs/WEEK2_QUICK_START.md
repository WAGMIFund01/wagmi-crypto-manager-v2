# Week 2 Quick Start Guide

**Created**: October 5, 2025  
**Status**: Ready to Test  
**Branch**: `feature/data-architecture-unification`

---

## 🚀 Getting Started

### **Step 1: Deploy to Vercel**

The test endpoint has been pushed to the `feature/data-architecture-unification` branch. Vercel should automatically create a preview deployment.

**Check deployment status**:
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Find the preview deployment for this branch
3. Copy the preview URL (e.g., `https://your-app-git-feature-data-architecture-unification-yourproject.vercel.app`)

---

### **Step 2: Test the Endpoint**

Once deployed, you can test the endpoint in two ways:

#### **Option 1: Browser (GET request)**
Simply visit:
```
https://your-preview-url.vercel.app/api/test-sheets-adapter
```

This will show you:
- Complete documentation
- All available methods
- Usage examples
- Parameter requirements

#### **Option 2: cURL (POST requests)**

Replace `YOUR_PREVIEW_URL` with your actual Vercel preview URL in all commands below.

---

## 🧪 Quick Smoke Tests (5 minutes)

Run these tests first to verify everything works:

### **Test 1: Get Documentation**
```bash
curl https://YOUR_PREVIEW_URL/api/test-sheets-adapter
```

**Expected**: JSON documentation with all available methods

---

### **Test 2: Read WAGMI Timestamp**
```bash
curl -X POST https://YOUR_PREVIEW_URL/api/test-sheets-adapter \
  -H "Content-Type: application/json" \
  -d '{"method": "getWagmiTimestamp"}'
```

**Expected**: 
```json
{
  "success": true,
  "method": "getWagmiTimestamp",
  "result": "10/05/2024, 14:30:00",
  "comparison": { "timestamp": "10/05/2024, 14:30:00" },
  "match": true
}
```

**✅ Pass if**: `match: true` and `result` is a timestamp string

---

### **Test 3: Read Personal Portfolio Timestamp**
```bash
curl -X POST https://YOUR_PREVIEW_URL/api/test-sheets-adapter \
  -H "Content-Type: application/json" \
  -d '{"method": "getPersonalPortfolioTimestamp"}'
```

**Expected**: Similar to Test 2, with Personal Portfolio timestamp

**✅ Pass if**: `match: true` and `result` is a timestamp string

---

### **Test 4: Read WAGMI Historical Performance**
```bash
curl -X POST https://YOUR_PREVIEW_URL/api/test-sheets-adapter \
  -H "Content-Type: application/json" \
  -d '{"method": "getWagmiHistoricalPerformance"}'
```

**Expected**: Array of monthly performance data

**✅ Pass if**: `match: true` and `count > 0`

---

### **Test 5: Test Price Update (Dry-Run)**
```bash
curl -X POST https://YOUR_PREVIEW_URL/api/test-sheets-adapter \
  -H "Content-Type: application/json" \
  -d '{
    "method": "updateAssetPrice",
    "params": {
      "symbol": "BTC",
      "price": 45000,
      "priceTimestamp": "2024-10-05T10:30:00Z",
      "priceChange24h": 2.5,
      "isPersonalPortfolio": false
    }
  }'
```

**Expected**: 
```json
{
  "success": true,
  "result": {
    "dryRun": true,
    "message": "Dry-run mode - no actual update performed"
  },
  "note": "DRY-RUN MODE - Add confirm:true to execute"
}
```

**✅ Pass if**: `dryRun: true` and no actual data changes

---

## 📊 Smoke Test Results

Use this checklist:

- [ ] Test 1: Documentation loads ✅
- [ ] Test 2: WAGMI timestamp reads correctly ✅
- [ ] Test 3: Personal Portfolio timestamp reads correctly ✅
- [ ] Test 4: Historical performance data loads ✅
- [ ] Test 5: Dry-run mode works (no data changes) ✅

**If all 5 pass**: ✅ Ready for full test suite!

**If any fail**: ❌ Review error logs and fix issues before proceeding

---

## 🎯 Next Steps

### **After Smoke Tests Pass**:

1. **Day 2**: Execute all 7 read-only tests
   - See `WEEK2_TEST_SUITE.md` for complete test matrix
   - Document results in test results template

2. **Day 3**: Execute write tests (dry-run first, then actual)
   - Start with dry-run to verify correct cells
   - Manually verify in Google Sheets before actual execution

3. **Day 4**: Review results and create completion summary

---

## 🔧 Troubleshooting

### **Issue: 404 Not Found**
- **Cause**: Endpoint not deployed yet
- **Fix**: Wait for Vercel deployment to complete, check deployment logs

### **Issue: 500 Internal Server Error**
- **Cause**: Google Sheets API credentials issue
- **Fix**: Verify service account credentials are set in Vercel environment variables

### **Issue: `match: false` in comparison**
- **Cause**: Data format mismatch or transformation difference
- **Fix**: Review both results, document difference, may need to adjust method

### **Issue: Method not found**
- **Cause**: Typo in method name
- **Fix**: Check available methods in GET response

---

## 📝 Local Testing (Optional)

If you want to test locally before deploying:

```bash
# Start dev server
npm run dev

# In another terminal, run tests against localhost:3000
curl -X POST http://localhost:3000/api/test-sheets-adapter \
  -H "Content-Type: application/json" \
  -d '{"method": "getWagmiTimestamp"}'
```

---

## 🎉 Success Criteria

**Smoke tests complete when**:
- [x] Test endpoint deployed to Vercel
- [ ] All 5 smoke tests pass
- [ ] No errors or exceptions
- [ ] Comparisons show `match: true`
- [ ] Ready to proceed to full test suite

---

## 📞 Need Help?

If you encounter issues:
1. Check Vercel deployment logs
2. Review error messages in response
3. Verify Google Sheets API credentials
4. Check `WEEK2_TEST_SUITE.md` for detailed examples
5. Review `WEEK2_IMPLEMENTATION_PLAN.md` for context

---

**Ready to test!** 🚀

Once smoke tests pass, proceed to the full test suite in `WEEK2_TEST_SUITE.md`.
