#!/bin/bash

# Week 4 Comprehensive Testing Script
# Tests all migrated write endpoints

set -e

echo "🧪 Week 4 Comprehensive Testing Suite"
echo "====================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0
TOTAL_TESTS=0

# Function to run a test
run_test() {
    local test_name="$1"
    local endpoint="$2"
    local method="$3"
    local expected_status="$4"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    echo -n "Testing $test_name... "
    
    if [ "$method" = "POST" ]; then
        response=$(curl -s -w "\n%{http_code}" -X POST "http://localhost:3000$endpoint" 2>/dev/null)
    else
        response=$(curl -s -w "\n%{http_code}" "http://localhost:3000$endpoint" 2>/dev/null)
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" = "$expected_status" ]; then
        echo -e "${GREEN}✅ PASS${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        
        # Show response for successful tests
        echo "   Response: $(echo "$body" | jq -r '.message // .error // "Success"' 2>/dev/null || echo "Success")"
    else
        echo -e "${RED}❌ FAIL${NC}"
        echo "   Expected: $expected_status, Got: $http_code"
        echo "   Response: $body"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    echo ""
}

# Function to test JSON response
test_json_response() {
    local test_name="$1"
    local endpoint="$2"
    local method="$3"
    local expected_field="$4"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    echo -n "Testing $test_name (JSON response)... "
    
    if [ "$method" = "POST" ]; then
        response=$(curl -s -X POST "http://localhost:3000$endpoint" 2>/dev/null)
    else
        response=$(curl -s "http://localhost:3000$endpoint" 2>/dev/null)
    fi
    
    if echo "$response" | jq -e ".$expected_field" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ PASS${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${RED}❌ FAIL${NC}"
        echo "   Expected field '$expected_field' not found in response"
        echo "   Response: $response"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    echo ""
}

echo "🚀 Starting comprehensive testing..."
echo ""

# Test 1: Single Price Update Endpoint
echo "📊 Testing Single Price Update Endpoint"
echo "---------------------------------------"
run_test "Single Price Update (POST)" "/api/update-single-price" "POST" "200"
test_json_response "Single Price Update (JSON)" "/api/update-single-price" "POST" "success"
test_json_response "Single Price Update (Asset)" "/api/update-single-price" "POST" "asset"
test_json_response "Single Price Update (New Price)" "/api/update-single-price" "POST" "newPrice"

# Test 2: WAGMI Timestamp Update Endpoint
echo "⏰ Testing WAGMI Timestamp Update Endpoint"
echo "------------------------------------------"
run_test "WAGMI Timestamp Update (POST)" "/api/update-kpi-timestamp" "POST" "200"
test_json_response "WAGMI Timestamp Update (JSON)" "/api/update-kpi-timestamp" "POST" "success"
test_json_response "WAGMI Timestamp Update (Timestamp)" "/api/update-kpi-timestamp" "POST" "timestamp"

# Test 3: Personal Portfolio Timestamp Update Endpoint
echo "👤 Testing Personal Portfolio Timestamp Update Endpoint"
echo "-------------------------------------------------------"
run_test "Personal Portfolio Timestamp Update (POST)" "/api/update-personal-portfolio-timestamp" "POST" "200"
test_json_response "Personal Portfolio Timestamp Update (JSON)" "/api/update-personal-portfolio-timestamp" "POST" "success"
test_json_response "Personal Portfolio Timestamp Update (Timestamp)" "/api/update-personal-portfolio-timestamp" "POST" "timestamp"

# Test 4: GET endpoints (if they exist)
echo "📖 Testing GET Endpoints"
echo "------------------------"
run_test "Single Price Update (GET)" "/api/update-single-price" "GET" "200"
run_test "WAGMI Timestamp Update (GET)" "/api/update-kpi-timestamp" "GET" "200"

# Test 5: Error handling
echo "🚨 Testing Error Handling"
echo "-------------------------"
echo -n "Testing invalid endpoint... "
invalid_response=$(curl -s -w "\n%{http_code}" "http://localhost:3000/api/invalid-endpoint" 2>/dev/null)
invalid_http_code=$(echo "$invalid_response" | tail -n1)
if [ "$invalid_http_code" = "404" ]; then
    echo -e "${GREEN}✅ PASS${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}❌ FAIL${NC}"
    echo "   Expected: 404, Got: $invalid_http_code"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))
echo ""

# Test 6: Performance test (multiple rapid requests)
echo "⚡ Testing Performance (Rapid Requests)"
echo "--------------------------------------"
echo -n "Testing rapid timestamp updates... "
start_time=$(date +%s)
for i in {1..3}; do
    curl -s -X POST "http://localhost:3000/api/update-kpi-timestamp" >/dev/null 2>&1
done
end_time=$(date +%s)
duration=$((end_time - start_time))

if [ $duration -le 5 ]; then
    echo -e "${GREEN}✅ PASS${NC} (${duration}s)"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}❌ FAIL${NC} (${duration}s - too slow)"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))
echo ""

# Test 7: Data integrity test
echo "🔍 Testing Data Integrity"
echo "-------------------------"
echo -n "Testing timestamp format... "
timestamp_response=$(curl -s -X POST "http://localhost:3000/api/update-kpi-timestamp")
timestamp_value=$(echo "$timestamp_response" | jq -r '.timestamp' 2>/dev/null)

if [[ "$timestamp_value" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}Z$ ]]; then
    echo -e "${GREEN}✅ PASS${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}❌ FAIL${NC}"
    echo "   Invalid timestamp format: $timestamp_value"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))
echo ""

# Test 8: Source tracking test
echo "📝 Testing Source Tracking"
echo "-------------------------"
test_json_response "Source Tracking (Single Price)" "/api/update-single-price" "POST" "source"
test_json_response "Source Tracking (WAGMI Timestamp)" "/api/update-kpi-timestamp" "POST" "source"
test_json_response "Source Tracking (Personal Timestamp)" "/api/update-personal-portfolio-timestamp" "POST" "source"

echo "📊 Test Results Summary"
echo "======================="
echo -e "Total Tests: ${BLUE}$TOTAL_TESTS${NC}"
echo -e "Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Failed: ${RED}$TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n🎉 ${GREEN}ALL TESTS PASSED!${NC}"
    echo -e "✅ Week 4 endpoints are working perfectly!"
    exit 0
else
    echo -e "\n❌ ${RED}SOME TESTS FAILED${NC}"
    echo -e "Please review the failed tests above."
    exit 1
fi
