#!/bin/bash
# Manual API Testing Script
# This script demonstrates the functionality of all API endpoints

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo "Error: jq is not installed. Please install jq to run this script."
    echo "Ubuntu/Debian: sudo apt-get install jq"
    echo "macOS: brew install jq"
    exit 1
fi

BASE_URL="http://localhost:4000"

echo "=========================================="
echo "Shopping Lists API - Manual Test Suite"
echo "=========================================="
echo ""

echo "1. Test GET /lists (empty list)"
curl -s $BASE_URL/lists | jq .
echo ""

echo "2. Test POST /lists - Create first list"
LIST1=$(curl -s -X POST $BASE_URL/lists -H "Content-Type: application/json" -d '{"name": "Groceries", "owner": "John Doe"}')
echo $LIST1 | jq .
LIST1_ID=$(echo $LIST1 | jq -r .id)
echo "Created list with ID: $LIST1_ID"
echo ""

echo "3. Test POST /lists - Create second list"
LIST2=$(curl -s -X POST $BASE_URL/lists -H "Content-Type: application/json" -d '{"name": "Hardware Store", "owner": "Jane Smith"}')
echo $LIST2 | jq .
LIST2_ID=$(echo $LIST2 | jq -r .id)
echo "Created list with ID: $LIST2_ID"
echo ""

echo "4. Test GET /lists (should show 2 lists)"
curl -s $BASE_URL/lists | jq .
echo ""

echo "5. Test GET /lists/:id - Get specific list"
curl -s $BASE_URL/lists/$LIST1_ID | jq .
echo ""

echo "6. Test PATCH /lists/:id - Update list name"
curl -s -X PATCH $BASE_URL/lists/$LIST1_ID -H "Content-Type: application/json" -d '{"name": "Weekly Groceries"}' | jq .
echo ""

echo "7. Test POST /lists/:id/items - Add items to list"
ITEM1=$(curl -s -X POST $BASE_URL/lists/$LIST1_ID/items -H "Content-Type: application/json" -d '{"name": "Milk", "quantity": 2}')
echo $ITEM1 | jq .
ITEM1_ID=$(echo $ITEM1 | jq -r .id)
echo ""

ITEM2=$(curl -s -X POST $BASE_URL/lists/$LIST1_ID/items -H "Content-Type: application/json" -d '{"name": "Bread", "quantity": 1}')
echo $ITEM2 | jq .
ITEM2_ID=$(echo $ITEM2 | jq -r .id)
echo ""

echo "8. Test GET /lists/:id - View list with items"
curl -s $BASE_URL/lists/$LIST1_ID | jq .
echo ""

echo "9. Test PATCH /lists/:id/items/:itemId - Update item (check it off)"
curl -s -X PATCH $BASE_URL/lists/$LIST1_ID/items/$ITEM1_ID -H "Content-Type: application/json" -d '{"checked": true}' | jq .
echo ""

echo "10. Test DELETE /lists/:id/items/:itemId - Delete an item"
curl -s -X DELETE $BASE_URL/lists/$LIST1_ID/items/$ITEM2_ID -v 2>&1 | grep "< HTTP"
echo ""

echo "11. Test GET /lists with filter ?owner=Jane Smith"
curl -s "$BASE_URL/lists?owner=Jane%20Smith" | jq .
echo ""

echo "12. Test DELETE /lists/:id - Delete entire list"
curl -s -X DELETE $BASE_URL/lists/$LIST2_ID -v 2>&1 | grep "< HTTP"
echo ""

echo "13. Test validation error - Create list without name"
curl -s -X POST $BASE_URL/lists -H "Content-Type: application/json" -d '{"owner": "Test"}' | jq .
echo ""

echo "14. Test 404 error - Get non-existent list"
curl -s $BASE_URL/lists/nonexistent | jq .
echo ""

echo "=========================================="
echo "All tests completed!"
echo "=========================================="
