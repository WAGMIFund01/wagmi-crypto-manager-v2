# Week 2 Test Suite - SheetsAdapter Methods Validation

**Created**: October 5, 2025  
**Status**: Ready for Testing  
**Endpoint**: `/api/test-sheets-adapter`

---

## 🎯 Test Objectives

1. **Validate all 10 new SheetsAdapter methods work correctly**
2. **Compare results with existing endpoints**
3. **Verify correct cell targeting (especially B7 vs B2!)**
4. **Ensure no formula overwrites**
5. **Build confidence for Week 3 migrations**

---

## 📋 Test Matrix

### **Phase 1: Read-Only Tests** (Zero Risk)

| # | Method | Test Case | Expected Result | Comparison Endpoint | Status |
|---|--------|-----------|----------------|---------------------|--------|
| 1 | `getWagmiTimestamp()` | Read KPIs!B7 | Timestamp string | `/api/get-last-updated-timestamp` | ⏳ Pending |
| 2 | `getPersonalPortfolioTimestamp()` | Read KPIs!B9 | Timestamp string | `/api/get-personal-portfolio-timestamp` | ⏳ Pending |
| 3 | `get24HourChanges(false)` | Read WAGMI 24h changes | Array of changes | Manual verification | ⏳ Pending |
| 4 | `get24HourChanges(true)` | Read Personal 24h changes | Array of changes | Manual verification | ⏳ Pending |
| 5 | `getTransactions('INV001')` | Read investor transactions | Array of transactions | `/api/get-transactions` | ⏳ Pending |
| 6 | `getWagmiHistoricalPerformance()` | Read MoM performance | Array of monthly data | `/api/get-performance-data` | ⏳ Pending |
| 7 | `getPersonalPortfolioHistoricalPerformance()` | Read Personal historical | Array of monthly data | `/api/get-personal-portfolio-performance-data` | ⏳ Pending |

---

### **Phase 2: Write Tests - Dry-Run** (Zero Risk)

| # | Method | Test Case | Expected Result | Verification | Status |
|---|--------|-----------|----------------|--------------|--------|
| 8 | `updateAssetPrice()` | Update test asset (WAGMI) | Success, dry-run response | No actual update | ⏳ Pending |
| 9 | `updateAssetPrice()` | Update test asset (Personal) | Success, dry-run response | No actual update | ⏳ Pending |
| 10 | `batchUpdatePrices()` | Update multiple assets (WAGMI) | Success count, dry-run | No actual updates | ⏳ Pending |
| 11 | `batchUpdatePrices()` | Update multiple assets (Personal) | Success count, dry-run | No actual updates | ⏳ Pending |
| 12 | `updateKpiTimestamp()` | Update WAGMI timestamp | Success, dry-run response | No actual update | ⏳ Pending |
| 13 | `updateKpiTimestamp()` | Update Personal timestamp | Success, dry-run response | No actual update | ⏳ Pending |

---

### **Phase 3: Write Tests - Actual Execution** (Controlled Risk)

⚠️ **Only execute after dry-run validation and manual verification**

| # | Method | Test Case | Expected Result | Verification Method | Status |
|---|--------|-----------|----------------|---------------------|--------|
| 14 | `updateAssetPrice()` | Update test asset (WAGMI) | Success, cells updated | Manual check: H, J, L columns | ⏳ Pending |
| 15 | `updateAssetPrice()` | Update test asset (Personal) | Success, cells updated | Manual check: H, J, L columns | ⏳ Pending |
| 16 | `updateKpiTimestamp(false)` | Update WAGMI timestamp | Success, B7 updated | Manual check: KPIs!B7 | ⏳ Pending |
| 17 | `updateKpiTimestamp(true)` | Update Personal timestamp | Success, B9 updated | Manual check: KPIs!B9 | ⏳ Pending |

---

## 🧪 Test Commands

### **Using cURL**

#### **1. Get Test Documentation**
```bash
curl http://localhost:3000/api/test-sheets-adapter
```

#### **2. Test WAGMI Timestamp Read**
```bash
curl -X POST http://localhost:3000/api/test-sheets-adapter \
  -H "Content-Type: application/json" \
  -d '{"method": "getWagmiTimestamp"}'
```

#### **3. Test Personal Portfolio Timestamp Read**
```bash
curl -X POST http://localhost:3000/api/test-sheets-adapter \
  -H "Content-Type: application/json" \
  -d '{"method": "getPersonalPortfolioTimestamp"}'
```

#### **4. Test 24h Changes (WAGMI)**
```bash
curl -X POST http://localhost:3000/api/test-sheets-adapter \
  -H "Content-Type: application/json" \
  -d '{"method": "get24HourChanges", "params": {"isPersonalPortfolio": false}}'
```

#### **5. Test 24h Changes (Personal)**
```bash
curl -X POST http://localhost:3000/api/test-sheets-adapter \
  -H "Content-Type: application/json" \
  -d '{"method": "get24HourChanges", "params": {"isPersonalPortfolio": true}}'
```

#### **6. Test Transactions**
```bash
curl -X POST http://localhost:3000/api/test-sheets-adapter \
  -H "Content-Type: application/json" \
  -d '{"method": "getTransactions", "params": {"investorId": "INV001"}}'
```

#### **7. Test WAGMI Historical Performance**
```bash
curl -X POST http://localhost:3000/api/test-sheets-adapter \
  -H "Content-Type: application/json" \
  -d '{"method": "getWagmiHistoricalPerformance"}'
```

#### **8. Test Personal Portfolio Historical Performance**
```bash
curl -X POST http://localhost:3000/api/test-sheets-adapter \
  -H "Content-Type: application/json" \
  -d '{"method": "getPersonalPortfolioHistoricalPerformance"}'
```

#### **9. Test Price Update (Dry-Run)**
```bash
curl -X POST http://localhost:3000/api/test-sheets-adapter \
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

#### **10. Test Batch Update (Dry-Run)**
```bash
curl -X POST http://localhost:3000/api/test-sheets-adapter \
  -H "Content-Type: application/json" \
  -d '{
    "method": "batchUpdatePrices",
    "params": {
      "updates": [
        {"symbol": "BTC", "price": 45000, "timestamp": "2024-10-05T10:30:00Z", "priceChange24h": 2.5},
        {"symbol": "ETH", "price": 2500, "timestamp": "2024-10-05T10:30:00Z", "priceChange24h": -1.2}
      ],
      "isPersonalPortfolio": false
    }
  }'
```

#### **11. Test Timestamp Update (Dry-Run)**
```bash
curl -X POST http://localhost:3000/api/test-sheets-adapter \
  -H "Content-Type: application/json" \
  -d '{
    "method": "updateKpiTimestamp",
    "params": {
      "timestamp": "10/05/2024, 14:30:00",
      "isPersonalPortfolio": false
    }
  }'
```

#### **12. Test Price Update (ACTUAL EXECUTION)**
⚠️ **Only run after dry-run validation!**
```bash
curl -X POST http://localhost:3000/api/test-sheets-adapter \
  -H "Content-Type: application/json" \
  -d '{
    "method": "updateAssetPrice",
    "params": {
      "symbol": "BTC",
      "price": 45000,
      "priceTimestamp": "2024-10-05T10:30:00Z",
      "priceChange24h": 2.5,
      "isPersonalPortfolio": false,
      "confirm": true
    }
  }'
```

---

## 📊 Expected Response Format

### **Read Operations**
```json
{
  "success": true,
  "method": "getWagmiTimestamp",
  "result": "10/05/2024, 14:30:00",
  "comparison": {
    "timestamp": "10/05/2024, 14:30:00"
  },
  "match": true,
  "timestamp": "2024-10-05T14:30:00.000Z"
}
```

### **Write Operations (Dry-Run)**
```json
{
  "success": true,
  "method": "updateAssetPrice",
  "params": {
    "symbol": "BTC",
    "price": 45000,
    "priceTimestamp": "2024-10-05T10:30:00Z",
    "priceChange24h": 2.5,
    "isPersonalPortfolio": false
  },
  "result": {
    "dryRun": true,
    "message": "Dry-run mode - no actual update performed",
    "wouldUpdate": {
      "symbol": "BTC",
      "price": 45000,
      "priceTimestamp": "2024-10-05T10:30:00Z",
      "priceChange24h": 2.5,
      "portfolio": "WAGMI Fund",
      "cells": {
        "price": "Portfolio Overview!H[row]",
        "timestamp": "Portfolio Overview!J[row]",
        "change": "Portfolio Overview!L[row]"
      }
    }
  },
  "note": "DRY-RUN MODE - Add confirm:true to execute",
  "timestamp": "2024-10-05T14:30:00.000Z"
}
```

### **Write Operations (Actual Execution)**
```json
{
  "success": true,
  "method": "updateAssetPrice",
  "params": {
    "symbol": "BTC",
    "price": 45000,
    "priceTimestamp": "2024-10-05T10:30:00Z",
    "priceChange24h": 2.5,
    "isPersonalPortfolio": false,
    "confirm": true
  },
  "result": {
    "success": true
  },
  "note": "ACTUAL UPDATE PERFORMED",
  "timestamp": "2024-10-05T14:30:00.000Z"
}
```

---

## ✅ Validation Checklist

### **For Each Read Test**:
- [ ] Method returns data successfully
- [ ] Data format matches expected structure
- [ ] Results match existing endpoint (if applicable)
- [ ] No errors or exceptions
- [ ] Performance is acceptable (< 2 seconds)

### **For Each Write Test (Dry-Run)**:
- [ ] Dry-run response shows correct cells would be updated
- [ ] No actual data changes occur
- [ ] Parameters are validated correctly
- [ ] Error handling works for invalid inputs

### **For Each Write Test (Actual)**:
- [ ] Update succeeds
- [ ] Correct cells are updated (H, J, L for prices; B7/B9 for timestamps)
- [ ] Column I (Total Value) is NOT touched
- [ ] Formulas remain intact
- [ ] Data is accurate
- [ ] No unintended side effects

---

## 🎯 Critical Validations

### **1. Timestamp Cell Targeting**
**CRITICAL**: Verify `updateKpiTimestamp()` writes to correct cells:
- ✅ WAGMI Fund: **B7** (NOT B2!)
- ✅ Personal Portfolio: **B9**

**Test**:
1. Call `updateKpiTimestamp()` with `isPersonalPortfolio: false`
2. Manually check Google Sheets: KPIs!B7 should update
3. Verify KPIs!B2 (Total AUM) is NOT changed
4. Call `updateKpiTimestamp()` with `isPersonalPortfolio: true`
5. Manually check Google Sheets: KPIs!B9 should update

---

### **2. Formula Preservation**
**CRITICAL**: Verify Column I (Total Value) is never touched

**Test**:
1. Note current formula in Column I for a test asset
2. Run `updateAssetPrice()` for that asset
3. Verify Column I formula is unchanged
4. Verify only H, J, L are updated

---

### **3. Dual Portfolio Support**
**CRITICAL**: Verify methods correctly handle both portfolios

**Test**:
1. Test all methods with `isPersonalPortfolio: false` (WAGMI)
2. Test all methods with `isPersonalPortfolio: true` (Personal)
3. Verify correct sheets are accessed:
   - WAGMI: 'Portfolio Overview', 'MoM performance'
   - Personal: 'Personal portfolio', 'Personal portfolio historical'

---

### **4. Data Accuracy**
**CRITICAL**: Verify results match existing endpoints

**Test**:
1. Compare `getWagmiTimestamp()` with `/api/get-last-updated-timestamp`
2. Compare `getPersonalPortfolioTimestamp()` with `/api/get-personal-portfolio-timestamp`
3. Compare `getTransactions()` with `/api/get-transactions`
4. Compare `getWagmiHistoricalPerformance()` with `/api/get-performance-data`
5. Compare `getPersonalPortfolioHistoricalPerformance()` with `/api/get-personal-portfolio-performance-data`

**Success Criteria**: All comparisons should have `match: true`

---

## 📝 Test Results Template

Use this template to document results:

```markdown
### Test: [Method Name]
**Date**: [Date]
**Tester**: [Name]

**Parameters**:
- param1: value1
- param2: value2

**Expected Result**:
[Description]

**Actual Result**:
[Description]

**Comparison with Existing Endpoint**:
- Match: ✅ Yes / ❌ No
- Discrepancies: [If any]

**Performance**:
- Response Time: [ms]

**Status**: ✅ Pass / ❌ Fail

**Notes**:
[Any additional observations]
```

---

## 🚨 What to Do If Tests Fail

### **Read Operations Fail**:
1. Check Google Sheets API credentials
2. Verify sheet names and ranges
3. Check data format in sheets
4. Review error logs
5. Compare with existing endpoint implementation

### **Write Operations Fail**:
1. Verify correct cells are targeted
2. Check for permission issues
3. Ensure data format is correct
4. Review error logs
5. Test with smaller dataset

### **Comparison Mismatches**:
1. Check data transformation logic
2. Verify date/number formatting
3. Review filtering logic (e.g., future months)
4. Compare raw sheet data
5. Document differences for review

---

## 📅 Testing Schedule

### **Day 1** (Today):
- [x] Create test endpoint
- [x] Create test suite documentation
- [ ] Deploy to development environment
- [ ] Run initial smoke tests

### **Day 2**:
- [ ] Execute all read-only tests (Tests 1-7)
- [ ] Document results
- [ ] Fix any issues found
- [ ] Re-test failed cases

### **Day 3**:
- [ ] Execute dry-run write tests (Tests 8-13)
- [ ] Execute actual write tests (Tests 14-17)
- [ ] Verify all cell updates manually
- [ ] Document all results

### **Day 4**:
- [ ] Review all test results
- [ ] Create comprehensive test report
- [ ] Prepare for Week 3 migrations

---

## 🎉 Success Criteria

**Week 2 Testing Complete When**:
- [x] Test endpoint created and deployed
- [ ] All 17 tests executed
- [ ] All read operations pass
- [ ] All write operations validated
- [ ] All comparisons match existing endpoints
- [ ] Critical validations confirmed:
  - [ ] Correct timestamp cells (B7, B9)
  - [ ] Formula preservation (Column I)
  - [ ] Dual portfolio support
  - [ ] Data accuracy
- [ ] Comprehensive test report created
- [ ] High confidence for Week 3

---

**Next**: Deploy and start testing! 🚀
