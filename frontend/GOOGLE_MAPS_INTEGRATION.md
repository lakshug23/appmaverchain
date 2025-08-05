# Google Maps Integration - MedChain Hospital Dashboard

## Overview

The MedChain Hospital Dashboard now features **real Google Maps integration** for the distributor location feature. This allows hospital staff to visualize nearby pharmaceutical distributors on an interactive map with real-time data.

## Features

### 🗺️ Interactive Google Maps
- **Real Google Maps**: Satellite, roadmap, and hybrid views
- **Interactive Controls**: Pan, zoom, street view, and fullscreen
- **Responsive Design**: Works on desktop and mobile devices
- **Custom Styling**: Optimized for medical dashboard aesthetics

### 📍 Distributor Markers
- **Color-coded Markers**: Visual identification of distributor types
  - 🟢 **Green**: Optimized distributors (best choice for specific drugs)
  - 🔵 **Blue**: High-rated distributors (4.8+ stars)  
  - 🟡 **Yellow**: Good distributors (4.5+ stars)
  - 🔴 **Red**: Standard distributors
- **Hospital Marker**: Red arrow indicating current hospital location
- **Interactive Info Windows**: Click markers for detailed information

### 📊 Smart Analytics
- **Distance Calculation**: Real-time distance from hospital to distributors
- **Inventory Checking**: Shows available stock for requested medicines
- **Price Comparison**: Displays pricing per unit for each distributor
- **Rating System**: 5-star rating display for distributor reliability
- **Quick Stats**: Summary of closest, cheapest, and highest-rated options

### 🔄 Dual Map System
- **Toggle Feature**: Switch between Google Maps and simulated map
- **Fallback System**: Automatically falls back if no API key provided
- **Consistent Interface**: Same functionality regardless of map type

## How to Use

### 1. Access the Map Feature
1. Navigate to **Hospital Dashboard**
2. Click on **"Request Medicines"** tab  
3. Find any low-stock item
4. Click **"🗺️ View Map"** button

### 2. Using Google Maps
1. **Map Toggle**: Click "🌍 Google Maps" to enable real Google Maps
2. **Marker Interaction**: Click on any distributor marker for details
3. **Info Windows**: View distributor information, stock, and pricing
4. **Direct Ordering**: Click "📞 Request Stock" from info window
5. **Map Controls**: Use standard Google Maps controls (zoom, street view, etc.)

### 3. Understanding the Interface

#### Map Legend:
- 🔴 **Hospital Location**: Your current position (Apollo Hospital)
- 🟢 **Optimized Distributors**: Best choice for the specific medicine
- 🔵 **Premium Distributors**: Highest ratings and reliability
- 🟡 **Good Distributors**: Solid choice with good ratings
- 🔴 **Standard Distributors**: Basic service providers

#### Info Window Details:
- **Name & Specialization**: Distributor identity and expertise
- **Location & Distance**: Address and km from hospital
- **Delivery Time**: Estimated arrival time for orders
- **Rating**: Customer satisfaction score out of 5 stars
- **Inventory**: Available stock for your requested medicine
- **Pricing**: Cost per unit for the specific drug
- **Quick Actions**: Direct request button and close option

### 4. Quick Stats Panel
The bottom panel shows:
- **Can Fulfill Order**: Number of distributors with sufficient stock
- **Closest Distributor**: Distance to nearest supplier
- **Best Price**: Lowest cost per unit available
- **Premium Rated**: Count of 4.8+ star distributors

## Setup Instructions

### Getting Google Maps API Key

1. **Google Cloud Console**:
   - Visit [Google Cloud Console](https://console.cloud.google.com)
   - Create new project or select existing
   - Enable "Maps JavaScript API"

2. **Create API Key**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the generated key

3. **Configure Security** (Important):
   - Click on your API key
   - Under "Application restrictions": select "HTTP referrers"
   - Add your domains: `localhost:3000/*` (development), `yourdomain.com/*` (production)
   - Under "API restrictions": select "Maps JavaScript API"
   - Save changes

4. **Environment Setup**:
   ```bash
   # In frontend/.env file
   REACT_APP_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
   ```

5. **Restart Application**:
   ```bash
   npm start
   ```

### Verification Steps

1. **Check Integration**:
   - Go to Hospital Dashboard → Request Medicines
   - Click "🗺️ View Map" on any item
   - Toggle to "🌍 Google Maps"
   - Verify real Google Maps loads with distributor markers

2. **Test Functionality**:
   - Click distributor markers → Info windows should open
   - Info windows show correct data (name, distance, stock, price)
   - "Request Stock" button works from info window
   - Map controls function (zoom, pan, street view)

## Technical Implementation

### Components Structure
```
src/components/
├── GoogleMapsIntegration.js    # Real Google Maps component
├── GoogleMapsLike.js          # Fallback simulated map
```

### Dependencies
```json
{
  "@vis.gl/react-google-maps": "^1.0.0"
}
```

### Environment Variables
```bash
REACT_APP_GOOGLE_MAPS_API_KEY=your_key_here
REACT_APP_MAP_DEFAULT_ZOOM=12
REACT_APP_MAP_DEFAULT_CENTER_LAT=17.4065
REACT_APP_MAP_DEFAULT_CENTER_LNG=78.4691
```

## API Usage & Costs

### Google Maps Pricing (2024)
- **Free Tier**: $200 credit monthly (~28,000 map loads)
- **Map Loads**: $7 per 1,000 requests after free tier
- **Typical Hospital Usage**: 500-2,000 loads/month (well within free tier)

### Usage Optimization
- **Lazy Loading**: Maps only load when requested
- **Single Instance**: One map per modal, reused for all distributors
- **Efficient Markers**: Minimal marker updates and redraws
- **Smart Caching**: API responses cached where possible

## Troubleshooting

### Common Issues

1. **"For development purposes only" watermark**:
   - **Cause**: API key restrictions too strict
   - **Fix**: Add your domain to HTTP referrer restrictions

2. **Map not loading**:
   - **Check**: API key is correct in .env file
   - **Check**: Maps JavaScript API is enabled in Google Cloud Console
   - **Check**: No console errors related to API key quotas

3. **Markers not appearing**:
   - **Check**: Distributor coordinates are valid
   - **Check**: Console for JavaScript errors
   - **Fix**: Refresh page or toggle between map types

4. **Info windows not opening**:
   - **Check**: Click directly on marker center
   - **Check**: No JavaScript errors in console
   - **Try**: Different zoom levels

### Error Messages

- **"Failed to load Google Maps"**: Check API key and internet connection
- **"Quota exceeded"**: Monitor usage in Google Cloud Console
- **"API key invalid"**: Verify key is correct and has proper restrictions

### Development vs Production

**Development Environment**:
```bash
# .env.local
REACT_APP_GOOGLE_MAPS_API_KEY=AIza...dev_key
```
- Use separate API key for development
- Restrict to `localhost:3000/*`

**Production Environment**:
```bash
# Environment variables in hosting platform
REACT_APP_GOOGLE_MAPS_API_KEY=AIza...prod_key
```
- Use production API key
- Restrict to your production domain
- Set up monitoring and billing alerts

## Benefits for Hospital Staff

### Operational Advantages
1. **Visual Decision Making**: See distributor locations relative to hospital
2. **Distance Optimization**: Choose closest suppliers for urgent needs
3. **Cost Comparison**: Instantly compare prices across distributors
4. **Quality Assurance**: Rating system helps choose reliable suppliers
5. **Delivery Planning**: Estimated delivery times for better scheduling

### Time Savings
- **Instant Location Awareness**: No need to look up addresses
- **One-Click Ordering**: Direct from map interface
- **Quick Comparisons**: All options visible simultaneously
- **Familiar Interface**: Standard Google Maps controls

### Decision Support
- **Optimized Recommendations**: System highlights best choices
- **Inventory Verification**: Real-time stock level display
- **Rating-Based Selection**: Quality indicators for each distributor
- **Comprehensive Data**: All relevant info in one view

## Future Enhancements

### Planned Features
- **Route Planning**: Driving directions to distributors
- **Traffic Integration**: Real-time delivery time estimates
- **Batch Operations**: Select multiple distributors at once
- **Historical Analytics**: Track supplier performance over time
- **Mobile Optimization**: Enhanced touch controls for tablets

### Potential Integrations
- **Pharmacy Locator**: Add nearby pharmacies to map
- **Emergency Suppliers**: Special markers for 24/7 distributors
- **Stock Alerts**: Real-time inventory updates on map
- **Price Tracking**: Historical price trends per distributor

The Google Maps integration transforms the distributor selection process from a text-based list into an intuitive, visual experience that helps hospital staff make better, faster decisions for patient care.
