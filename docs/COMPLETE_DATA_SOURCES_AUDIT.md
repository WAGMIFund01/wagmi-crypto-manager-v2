# Complete Data Sources Audit

**Date**: October 5, 2025  
**Branch**: `feature/data-architecture-unification`  
**Purpose**: Comprehensive audit of ALL Google Sheets data sources in the application

---

## 📊 Complete Data Source Inventory

### ✅ **Covered by New SheetsAdapter Methods**

| # | Data Source | Sheet Name | Operation | Current Implementation | New Method | Status |
|---|-------------|------------|-----------|----------------------|------------|--------|
| 1 | WAGMI Portfolio Data | `'Portfolio Overview'` | Read | `sheetsAdapter.getPortfolioData()` | ✅ Already exists | ✅ |
| 2 | Personal Portfolio Data | `'Personal portfolio'` | Read | `sheetsAdapter.getPersonalPortfolioData()` | ✅ Already exists | ✅ |
| 3 | WAGMI Price Updates | `'Portfolio Overview'` | Write | Direct googleapis | `updateAssetPrice()`, `batchUpdatePrices()` | ✅ NEW |
| 4 | Personal Portfolio Price Updates | `'Personal portfolio'` | Write | Direct googleapis | `updateAssetPrice()`, `batchUpdatePrices()` | ✅ NEW |
| 5 | WAGMI KPI Timestamp | `'KPIs'` B2 | Write | Direct googleapis | `updateKpiTimestamp(false)` | ✅ NEW |
| 6 | Personal Portfolio KPI Timestamp | `'KPIs'` B9 | Write | Direct googleapis | `updateKpiTimestamp(true)` | ✅ NEW |
| 7 | WAGMI Historical Performance | `'MoM performance'` | Read | Public gviz API | `getWagmiHistoricalPerformance()` | ✅ NEW |
| 8 | Personal Portfolio Historical Performance | `'Personal portfolio historical'` | Read | Public gviz API | `getPersonalPortfolioHistoricalPerformance()` | ✅ NEW |
| 9 | 24h Price Changes (WAGMI) | `'Portfolio Overview'` L | Read | Direct googleapis | `get24HourChanges(false)` | ✅ NEW |
| 10 | 24h Price Changes (Personal) | `'Personal portfolio'` L | Read | Direct googleapis | `get24HourChanges(true)` | ✅ NEW |
| 11 | Transactions | `'Transactions'` | Read | Google Apps Script | `getTransactions()` | ✅ NEW |

---

### ✅ **Already Covered by Existing SheetsAdapter Methods**

| # | Data Source | Sheet Name | Operation | Method | Status |
|---|-------------|------------|-----------|--------|--------|
| 12 | WAGMI KPI Data | `'KPIs'` B1-B6 | Read | `sheetsAdapter.getKpiData()` | ✅ Exists |
| 13 | Personal Portfolio KPI Data | `'KPIs'` B8-B9 | Read | `sheetsAdapter.getPersonalPortfolioKpiFromKpisTab()` | ✅ Exists |
| 14 | Investor Data (Single) | `'Investors'` | Read | `sheetsAdapter.getInvestorPortfolio()` | ✅ Exists |
| 15 | All Investors Data | `'Investors'` | Read | `sheetsAdapter.getAllInvestors()` | ✅ Exists |
| 16 | Investor Validation | `'Investors'` | Read | `sheetsAdapter.validateInvestor()` | ✅ Exists |
| 17 | Add Asset (WAGMI) | `'Portfolio Overview'` | Write | `sheetsAdapter.addPortfolioAsset()` | ✅ Exists |
| 18 | Add Asset (Personal) | `'Personal portfolio'` | Write | `sheetsAdapter.addPersonalAsset()` | ✅ Exists |
| 19 | Edit Asset (WAGMI) | `'Portfolio Overview'` | Write | `sheetsAdapter.editPortfolioAsset()` | ✅ Exists |
| 20 | Edit Asset (Personal) | `'Personal portfolio'` | Write | `sheetsAdapter.editPersonalAsset()` | ✅ Exists |
| 21 | Remove Asset (WAGMI) | `'Portfolio Overview'` | Write | `sheetsAdapter.removePortfolioAsset()` | ✅ Exists |
| 22 | Remove Asset (Personal) | `'Personal portfolio'` | Write | `sheetsAdapter.removePersonalAsset()` | ✅ Exists |
| 23 | Portfolio Field Options | `'Portfolio Overview'` | Read | `sheetsAdapter.getPortfolioData()` (derived) | ✅ Exists |

---

## 🔍 API Endpoints Analysis

### **Endpoints Using Google Apps Script** (Need Migration)

| Endpoint | Sheet | Current Method | Target Method | Risk | Week |
|----------|-------|----------------|---------------|------|------|
| `/api/get-investor-data` | `'Investors'` | Google Apps Script | `sheetsAdapter.getInvestorPortfolio()` | Low | Week 3 |
| `/api/get-transactions` | `'Transactions'` | Google Apps Script | `sheetsAdapter.getTransactions()` | Low | Week 3 |

---

### **Endpoints Using Public gviz API** (Need Migration)

| Endpoint | Sheet | Current Method | Target Method | Risk | Week |
|----------|-------|----------------|---------------|------|------|
| `/api/get-performance-data` | `'MoM performance'` | Public gviz API | `getWagmiHistoricalPerformance()` | Low | Week 3 |
| `/api/get-personal-portfolio-performance-data` | `'Personal portfolio historical'` | Public gviz API | `getPersonalPortfolioHistoricalPerformance()` | Low | Week 3 |
| `/api/debug-kpi-sheet` | `'KPIs'` | Public gviz API | `sheetsAdapter.getKpiData()` | Zero | Week 2 |

---

### **Endpoints Using Direct googleapis** (Need Migration)

| Endpoint | Sheet | Current Method | Target Method | Risk | Week |
|----------|-------|----------------|---------------|------|------|
| `/api/update-single-price` | `'Portfolio Overview'` | Direct googleapis | `updateAssetPrice()` | Medium | Week 4 |
| `/api/update-all-prices` | Both portfolios | Direct googleapis | `batchUpdatePrices()` | High | Week 5 |
| `/api/update-price-changes` | Both portfolios | Direct googleapis | Redundant - delete | Zero | Week 2 |
| `/api/debug-price-update` | Both portfolios | Direct googleapis | Test methods | Zero | Week 2 |

---

### **Endpoints Already Using SheetsAdapter** ✅

| Endpoint | Sheet | Method | Status |
|----------|-------|--------|--------|
| `/api/get-kpi-data` | `'KPIs'` | `sheetsAdapter.getKpiData()` | ✅ Good |
| `/api/get-portfolio-data` | `'Portfolio Overview'` | `sheetsAdapter.getPortfolioData()` | ✅ Good |
| `/api/get-personal-portfolio-data` | `'Personal portfolio'` | `sheetsAdapter.getPersonalPortfolioData()` | ✅ Good |
| `/api/get-portfolio-field-options` | `'Portfolio Overview'` | `sheetsAdapter.getPortfolioData()` | ✅ Good |
| `/api/add-asset` | Both portfolios | `sheetsAdapter.addPortfolioAsset()` / `addPersonalAsset()` | ✅ Good |
| `/api/edit-asset` | Both portfolios | `sheetsAdapter.editPortfolioAsset()` / `editPersonalAsset()` | ✅ Good |
| `/api/remove-asset` | Both portfolios | `sheetsAdapter.removePortfolioAsset()` / `removePersonalAsset()` | ✅ Good |
| `/api/validate-investor` | `'Investors'` | `sheetsAdapter.validateInvestor()` | ✅ Good |

---

## 📋 Google Sheets Structure

### **Sheets in the Workbook**

| Sheet Name | Purpose | Read/Write | Covered |
|------------|---------|------------|---------|
| `'Portfolio Overview'` | WAGMI Fund portfolio assets | Both | ✅ Yes |
| `'Personal portfolio'` | Personal portfolio assets | Both | ✅ Yes |
| `'KPIs'` | Key performance indicators for both portfolios | Both | ✅ Yes |
| `'MoM performance'` | WAGMI Fund monthly historical performance | Read | ✅ Yes |
| `'Personal portfolio historical'` | Personal Portfolio monthly historical performance | Read | ✅ Yes |
| `'Investors'` | Investor information and allocations | Read | ✅ Yes |
| `'Transactions'` | Investor transaction history | Read | ✅ Yes |

---

## ✅ Coverage Summary

### **Total Data Sources**: 23
- ✅ **Covered by New Methods**: 11
- ✅ **Already Covered**: 12
- ❌ **Missing**: 0

### **Total API Endpoints**: 36
- ✅ **Already Using SheetsAdapter**: 8
- 🔄 **Need Migration**: 8
- ℹ️ **Non-Sheets Endpoints**: 20 (auth, AI copilot, search, etc.)

---

## 🎯 Migration Status

### **Week 1: Add Methods** ✅ COMPLETE
- [x] Price update methods (3)
- [x] Historical performance methods (2)
- [x] Transaction methods (1)
- [x] 24h changes methods (1)
- [x] KPI timestamp methods (1)

### **Week 2: Debug Endpoints** (Zero Risk)
- [ ] `/api/debug-kpi-sheet` → `sheetsAdapter.getKpiData()`
- [ ] `/api/debug-price-update` → Test new methods
- [ ] `/api/update-price-changes` → Delete (redundant)

### **Week 3: Read-Only Endpoints** (Low Risk)
- [ ] `/api/get-performance-data` → `getWagmiHistoricalPerformance()`
- [ ] `/api/get-personal-portfolio-performance-data` → `getPersonalPortfolioHistoricalPerformance()`
- [ ] `/api/get-investor-data` → `sheetsAdapter.getInvestorPortfolio()`
- [ ] `/api/get-transactions` → `sheetsAdapter.getTransactions()`

### **Week 4: Single Price Update** (Medium Risk)
- [ ] `/api/update-single-price` → `updateAssetPrice()`

### **Week 5: Batch Price Update** (High Risk)
- [ ] `/api/update-all-prices` → `batchUpdatePrices()`

---

## 🚨 Critical Observations

### **No Missing Data Sources! 🎉**

After comprehensive audit:
1. ✅ All portfolio data (read/write) covered
2. ✅ All price updates (single/batch) covered
3. ✅ All historical performance data covered
4. ✅ All KPI data (read/write) covered
5. ✅ All investor data covered
6. ✅ All transaction data covered
7. ✅ All asset management (add/edit/remove) covered

### **Key Findings**

1. **Asset Management Already Unified**: Add, edit, and remove operations already use SheetsAdapter methods
2. **Most Read Operations Unified**: Portfolio data, KPI data, and investor data already use SheetsAdapter
3. **Price Updates Need Migration**: Currently using direct googleapis, need to migrate to new methods
4. **Historical Performance Needs Migration**: Currently using public gviz API, need to migrate to new methods
5. **Google Apps Script Endpoints**: Only 2 endpoints still use Apps Script (investor data, transactions)

---

## 📝 Recommendations

### **Priority 1: Complete Week 1**
- [x] All methods added ✅
- [ ] Create test endpoint
- [ ] Write comprehensive tests

### **Priority 2: Week 2 (Zero Risk)**
- Migrate debug endpoints
- Delete redundant endpoints
- Validate all new methods work correctly

### **Priority 3: Week 3 (Low Risk)**
- Migrate read-only endpoints
- These are safe because they don't modify data
- Easy rollback if issues arise

### **Priority 4: Week 4-5 (Medium-High Risk)**
- Migrate price update endpoints
- Use feature flags for gradual rollout
- Monitor closely for any issues

---

## 🎉 Conclusion

**We have COMPLETE coverage of all Google Sheets data sources!**

- ✅ 23/23 data sources covered
- ✅ 8 new methods added in Week 1
- ✅ 12 existing methods already in place
- ✅ Zero missing data sources
- ✅ Ready to proceed with testing and migration

**Next Step**: Create test endpoint to validate all new methods before migration.
