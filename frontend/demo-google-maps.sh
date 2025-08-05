#!/bin/bash

# Google Maps Integration Demo Script
# This script helps test the Google Maps integration

echo "🗺️  Google Maps Integration Demo"
echo "================================"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found"
    echo "Creating .env file with placeholder..."
    cp .env.example .env
fi

# Check if API key is set
if grep -q "your_google_maps_api_key_here" .env; then
    echo ""
    echo "⚠️  Google Maps API Key Not Set"
    echo "Current status: Using fallback map (simulated)"
    echo ""
    echo "To enable real Google Maps:"
    echo "1. Get API key from: https://console.cloud.google.com"
    echo "2. Enable 'Maps JavaScript API'"
    echo "3. Replace 'your_google_maps_api_key_here' in .env file"
    echo "4. Restart the development server"
    echo ""
    echo "The application will work with fallback map until API key is added."
else
    echo "✅ Google Maps API key is configured"
    echo "Real Google Maps should be available"
fi

echo ""
echo "📍 Testing Steps:"
echo "1. Start the application: npm start"  
echo "2. Navigate to Hospital Dashboard"
echo "3. Go to 'Request Medicines' tab"
echo "4. Click '🗺️ View Map' on any low stock item"
echo "5. Toggle between '🌍 Google Maps' and '🗺️ Basic Map'"
echo "6. Click distributor markers to see info windows"
echo "7. Test 'Request Stock' functionality"

echo ""
echo "📋 Features to Test:"
echo "- Map loading and responsiveness"
echo "- Distributor markers with correct colors"
echo "- Info windows with distributor details"
echo "- Hospital marker (red arrow)"
echo "- Map controls (zoom, pan, street view)"
echo "- Quick stats panel at bottom"
echo "- Direct ordering from info windows"

echo ""
echo "🐛 Troubleshooting:"
echo "- Check browser console for errors"
echo "- Verify internet connection"
echo "- Ensure API key has correct restrictions"
echo "- Try refreshing the page"

echo ""
echo "Starting development server..."
npm start
