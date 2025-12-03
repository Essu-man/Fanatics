# Delivery Pricing Setup Guide

## Overview
The delivery pricing system automatically calculates shipping costs based on the customer's selected town/area in Ghana.

## Setup Instructions

### 1. Start the Development Server
First, make sure your Next.js development server is running:

```powershell
npm run dev
```

The server should be running on `http://localhost:3000`

### 2. Populate Delivery Prices
Once the server is running, open a **new PowerShell terminal** and run:

```powershell
node scripts/add-delivery-prices.js
```

This will populate the Firebase `delivery_prices` collection with prices for all locations.

### 3. Verify the Setup
You can verify the delivery prices were added by:
1. Going to Firebase Console → Firestore Database
2. Looking for the `delivery_prices` collection
3. You should see entries for locations like:
   - Oyarifa (GH₵ 60)
   - Madina (GH₵ 50)
   - Tema (GH₵ 40)
   - And many more...

## How It Works

### Customer Experience
1. Customer adds items to cart
2. Goes to checkout and fills shipping information
3. Selects **Region** (e.g., Greater Accra)
4. Selects **Town/Area** (e.g., Madina)
5. Delivery fee is automatically calculated and displayed
6. Total price (products + delivery) is shown on payment page

### Delivery Pricing Structure (from your image)
Based on the pricing structure provided:

**Pickup Containment Locations:**
- **Oyarifa Area**: GH₵ 60
  - Oyarifa, Adenta
  
- **Madina Area**: GH₵ 50
  - Madina, Legon, Haatso, Ashongman, UPS
  
- **Dome Area**: GH₵ 60
  - Dome, Cowboys, Taifa, Kwabenya
  
- **Tema Area**: GH₵ 40
  - Tema, Ashaiman, Spintex
  
- **Teshie/Nungua Area**: GH₵ 40
  - Teshie, Nungua, Kenyasi

### Technical Details

#### New Form Fields
The shipping form now includes:
- **Region** (dropdown) - e.g., Greater Accra, Ashanti
- **Town/Area** (dropdown) - Populated based on selected region
- **City** - Main city name
- **Street Address** - House number and street
- **Digital Address** - Ghana Post GPS address (optional)
- **Landmark** - Nearby landmark (optional)

#### API Endpoints Created
1. `GET /api/delivery-prices?location={town}` - Get price for specific location
2. `GET /api/admin/delivery-prices` - Get all delivery prices
3. `POST /api/admin/delivery-prices` - Add new delivery price
4. `POST /api/admin/delivery-prices/bulk` - Bulk add delivery prices

#### Database Structure
Collection: `delivery_prices`
```
{
  location: string,      // e.g., "Madina"
  price: number,         // e.g., 50
  createdAt: timestamp
}
```

## Adding/Updating Prices

### To Add More Locations
Edit `scripts/add-delivery-prices.js` and add new entries:

```javascript
{ location: "New Town", price: 45 },
```

Then run the script again with `clearExisting: true` to update all prices.

### To Update Individual Prices
You can create an admin page to manage delivery prices, or update them directly in Firebase Console.

## Notes
- Delivery price is stored in sessionStorage during checkout
- If a location doesn't have a specific price, it defaults to GH₵ 0
- You can expand the `deliveryPrices` array in the script to cover more locations
- The system is flexible and can be extended to include different pricing for different regions

## Troubleshooting

### Prices not showing up?
1. Make sure the development server is running
2. Check Firebase Console to verify data was added
3. Check browser console for any errors

### Location not in dropdown?
Add it to `lib/ghanaLocations.ts` in the appropriate region's towns array.

### Wrong price showing?
Verify the location name matches exactly (case-sensitive) between:
- `ghanaLocations.ts`
- `add-delivery-prices.js`
