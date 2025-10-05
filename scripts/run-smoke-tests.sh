#!/bin/bash

# Week 2 Smoke Test Suite
# Run this script to validate the test endpoint is working correctly

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if URL is provided
if [ -z "$1" ]; then
  echo -e "${RED}❌ Error: No URL provided${NC}"
  echo ""
  echo "Usage: ./scripts/run-smoke-tests.sh <VERCEL_PREVIEW_URL>"
  echo ""
  echo "Example:"
  echo "  ./scripts/run-smoke-tests.sh https://your-app-git-feature-data-architecture-unification.vercel.app"
  echo ""
  exit 1
fi

BASE_URL="$1"
API_URL="${BASE_URL}/api/test-sheets-adapter"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         Week 2 Smoke Test Suite - SheetsAdapter           ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Testing URL: ${API_URL}${NC}"
echo ""

# Track results
PASSED=0
FAILED=0

# Function to run a test
run_test() {
  local test_num=$1
  local test_name=$2
  local method=$3
  local params=$4
  
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${YELLOW}Test ${test_num}: ${test_name}${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  
  # Build request body
  if [ -z "$params" ]; then
    REQUEST_BODY="{\"method\": \"${method}\"}"
  else
    REQUEST_BODY="{\"method\": \"${method}\", \"params\": ${params}}"
  fi
  
  echo -e "Request: ${REQUEST_BODY}"
  echo ""
  
  # Make request and save response
  RESPONSE=$(curl -s -X POST "${API_URL}" \
    -H "Content-Type: application/json" \
    -d "${REQUEST_BODY}")
  
  # Check if response is valid JSON
  if ! echo "${RESPONSE}" | jq . > /dev/null 2>&1; then
    echo -e "${RED}❌ FAILED: Invalid JSON response${NC}"
    echo "Response: ${RESPONSE}"
    echo ""
    FAILED=$((FAILED + 1))
    return 1
  fi
  
  # Extract success status
  SUCCESS=$(echo "${RESPONSE}" | jq -r '.success')
  
  if [ "${SUCCESS}" = "true" ]; then
    # Check for match if comparison exists
    MATCH=$(echo "${RESPONSE}" | jq -r '.match // "N/A"')
    COUNT=$(echo "${RESPONSE}" | jq -r '.count // "N/A"')
    RESULT=$(echo "${RESPONSE}" | jq -r '.result // "N/A"')
    
    echo -e "${GREEN}✅ PASSED${NC}"
    echo ""
    echo "Response Summary:"
    echo "  Success: ${SUCCESS}"
    if [ "${MATCH}" != "N/A" ]; then
      if [ "${MATCH}" = "true" ]; then
        echo -e "  Match: ${GREEN}${MATCH}${NC}"
      else
        echo -e "  Match: ${YELLOW}${MATCH}${NC} (may need review)"
      fi
    fi
    if [ "${COUNT}" != "N/A" ]; then
      echo "  Count: ${COUNT}"
    fi
    if [ "${RESULT}" != "N/A" ] && [ "${RESULT}" != "null" ]; then
      echo "  Result: ${RESULT}" | head -c 100
      if [ ${#RESULT} -gt 100 ]; then
        echo "..."
      else
        echo ""
      fi
    fi
    echo ""
    PASSED=$((PASSED + 1))
  else
    ERROR=$(echo "${RESPONSE}" | jq -r '.error // "Unknown error"')
    echo -e "${RED}❌ FAILED${NC}"
    echo "Error: ${ERROR}"
    echo ""
    echo "Full Response:"
    echo "${RESPONSE}" | jq .
    echo ""
    FAILED=$((FAILED + 1))
  fi
}

# Test 0: Get Documentation (GET request)
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Test 0: Get Documentation (GET)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

DOC_RESPONSE=$(curl -s "${API_URL}")
if echo "${DOC_RESPONSE}" | jq . > /dev/null 2>&1; then
  DOC_NAME=$(echo "${DOC_RESPONSE}" | jq -r '.name')
  echo -e "${GREEN}✅ PASSED${NC}"
  echo "Documentation loaded: ${DOC_NAME}"
  echo ""
  PASSED=$((PASSED + 1))
else
  echo -e "${RED}❌ FAILED: Could not load documentation${NC}"
  echo ""
  FAILED=$((FAILED + 1))
fi

# Test 1: WAGMI Timestamp
run_test "1" "Read WAGMI Timestamp" "getWagmiTimestamp" ""

# Test 2: Personal Portfolio Timestamp
run_test "2" "Read Personal Portfolio Timestamp" "getPersonalPortfolioTimestamp" ""

# Test 3: WAGMI Historical Performance
run_test "3" "Read WAGMI Historical Performance" "getWagmiHistoricalPerformance" ""

# Test 4: Personal Portfolio Historical Performance
run_test "4" "Read Personal Portfolio Historical Performance" "getPersonalPortfolioHistoricalPerformance" ""

# Test 5: Price Update (Dry-Run)
PRICE_PARAMS='{"symbol": "BTC", "price": 45000, "priceTimestamp": "2024-10-05T10:30:00Z", "priceChange24h": 2.5, "isPersonalPortfolio": false}'
run_test "5" "Test Price Update (Dry-Run)" "updateAssetPrice" "${PRICE_PARAMS}"

# Summary
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                      Test Summary                          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "Total Tests: $((PASSED + FAILED))"
echo -e "${GREEN}Passed: ${PASSED}${NC}"
echo -e "${RED}Failed: ${FAILED}${NC}"
echo ""

if [ ${FAILED} -eq 0 ]; then
  echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${GREEN}║  🎉 ALL SMOKE TESTS PASSED! Ready for full test suite!    ║${NC}"
  echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
  echo ""
  echo "Next Steps:"
  echo "  1. Review test results above"
  echo "  2. Proceed to full test suite (see docs/WEEK2_TEST_SUITE.md)"
  echo "  3. Execute all 17 test cases"
  echo ""
  exit 0
else
  echo -e "${RED}╔════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${RED}║  ❌ SOME TESTS FAILED - Review errors above               ║${NC}"
  echo -e "${RED}╚════════════════════════════════════════════════════════════╝${NC}"
  echo ""
  echo "Troubleshooting:"
  echo "  1. Check Vercel deployment logs"
  echo "  2. Verify Google Sheets API credentials"
  echo "  3. Review error messages above"
  echo "  4. See docs/WEEK2_QUICK_START.md for help"
  echo ""
  exit 1
fi
