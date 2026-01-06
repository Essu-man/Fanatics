// Script to populate delivery prices based on Ghana locations
// Run this file with: node scripts/add-delivery-prices.js

const deliveryPrices = [
    // Pickup Containment - 1. Oyarifa Area (GHC 60)
    { location: "Oyarifa", price: 60 },
    { location: "Adenta", price: 60 },

    // 2. Madina, Legon, Haatso, Ashongman, UPS (GHC 50)
    { location: "Madina", price: 50 },
    { location: "Legon", price: 50 },
    { location: "Haatso", price: 50 },
    { location: "Ashongman", price: 50 },

    // 3. Dome, Cowboys, Taifa, Kwabenya (GHC 60)
    { location: "Dome", price: 60 },
    { location: "Taifa", price: 60 },
    { location: "Kwabenya", price: 60 },

    // 4. Tema, Ashaiman, Spintex (GHC 40)
    { location: "Tema", price: 40 },
    { location: "Ashaiman", price: 40 },
    { location: "Spintex", price: 40 },

    // 5. Teshie, Nungua (GHC 40)
    { location: "Teshie", price: 40 },
    { location: "Nungua", price: 40 },

    // Additional Greater Accra locations (estimated prices based on distance)
    { location: "Awoshie", price: 45 },
    { location: "Accra Central", price: 30 },
    { location: "Osu", price: 30 },
    { location: "Labone", price: 30 },
    { location: "Airport Residential Area", price: 35 },
    { location: "Cantonment", price: 40 },
    { location: "East Legon", price: 40 },
    { location: "North Legon", price: 45 },
    { location: "West Legon", price: 45 },
    { location: "Achimota", price: 35 },
    { location: "Lapaz", price: 40 },
    { location: "Tesano", price: 35 },
    { location: "Adabraka", price: 30 },
    { location: "Asylum Down", price: 30 },
    { location: "Kaneshie", price: 35 },
    { location: "North Kaneshie", price: 35 },
    { location: "Darkuman", price: 40 },
    { location: "Dansoman", price: 45 },
    { location: "Mamprobi", price: 40 },
    { location: "Korle Bu", price: 35 },
    { location: "James Town", price: 35 },
    { location: "Tudu", price: 30 },
    { location: "Nima", price: 35 },
    { location: "Labadi", price: 35 },
    { location: "Community 1", price: 40 },
    { location: "Community 18", price: 45 },
    { location: "Community 20", price: 45 },
    { location: "Community 25", price: 50 },
    { location: "Sakumono", price: 45 },
    { location: "Baatsona", price: 45 },
    { location: "Ashaley Botwe", price: 50 },
    { location: "Atomic", price: 50 },
    { location: "Ashiaman", price: 40 },
    { location: "Kasoa", price: 70 },
    { location: "Weija", price: 60 },
    { location: "Gbawe", price: 55 },
    { location: "Mallam", price: 50 },
    { location: "McCarthy Hill", price: 55 },
    { location: "Amasaman", price: 65 },
    { location: "Pokuase", price: 70 },
    { location: "Kpone", price: 50 },
    { location: "Roman Ridge", price: 35 },

    // Other regions (higher prices for long distance)
    { location: "Kumasi", price: 150 },
    { location: "Takoradi", price: 180 },
    { location: "Cape Coast", price: 160 },
    { location: "Tamale", price: 200 },
    { location: "Sunyani", price: 170 },
    { location: "Koforidua", price: 100 },
    { location: "Ho", price: 140 },
    { location: "Bolgatanga", price: 220 },
    { location: "Wa", price: 230 },
];

async function addDeliveryPrices() {
    try {
        const response = await fetch('http://localhost:3000/api/admin/delivery-prices/bulk', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prices: deliveryPrices,
                clearExisting: true, // Set to false if you want to keep existing prices
            }),
        });

        const data = await response.json();

        if (data.success) {
            console.log('✅ Successfully added delivery prices!');
            console.log(`📦 Total locations: ${data.count}`);
        } else {
            console.error('❌ Failed to add delivery prices:', data.error);
        }
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

addDeliveryPrices();
