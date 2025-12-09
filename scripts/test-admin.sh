#!/bin/bash

BASE_URL="http://localhost:3000/api"

echo "🧪 Testing Admin Endpoints"
echo "=========================="
echo ""

# Login as admin
echo "1. Logging in as admin..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@freelancematch.com","password":"admin123"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed"
  echo $LOGIN_RESPONSE
  exit 1
fi

echo "✅ Login successful"
echo ""

# Get admin stats
echo "2. Getting admin stats..."
STATS=$(curl -s "$BASE_URL/admin/stats" \
  -H "Cookie: fm_session=$TOKEN")

echo $STATS | jq '.' 2>/dev/null || echo $STATS
echo ""

# Get pending KYC
echo "3. Getting pending KYC requests..."
KYC=$(curl -s "$BASE_URL/admin/kyc/pending" \
  -H "Cookie: fm_session=$TOKEN")

echo $KYC | jq '.' 2>/dev/null || echo $KYC
echo ""

# Get flagged reviews
echo "4. Getting flagged reviews..."
REVIEWS=$(curl -s "$BASE_URL/admin/reviews/flagged" \
  -H "Cookie: fm_session=$TOKEN")

echo $REVIEWS | jq '.' 2>/dev/null || echo $REVIEWS
echo ""

# Create a test course
echo "5. Creating test course..."
COURSE=$(curl -s -X POST "$BASE_URL/admin/courses" \
  -H "Cookie: fm_session=$TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Course",
    "description": "A test course",
    "category": "Web Development",
    "durationHours": 5,
    "modules": [
      {"id": "1", "title": "Module 1", "content": "Content 1", "duration": "1 hour"}
    ]
  }')

echo $COURSE | jq '.' 2>/dev/null || echo $COURSE
echo ""

echo "✅ All tests completed!"
