// scripts/patch-order-cities.js
const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

initializeApp({ credential: applicationDefault() });
const db = getFirestore();

async function patchOrderCities() {
  const ordersRef = db.collection('orders');
  const snapshot = await ordersRef.get();
  let updated = 0;

  for (const doc of snapshot.docs) {
    const order = doc.data();
    if (order.shipping && !order.shipping.city) {
      // Use region, town, or any other available field as fallback
      const city = order.shipping.town || order.shipping.region || order.shipping.address || '';
      if (city) {
        await doc.ref.update({ 'shipping.city': city });
        updated++;
        console.log(`Updated order ${doc.id}: set shipping.city = ${city}`);
      }
    }
  }
  console.log(`Done. Updated ${updated} orders.`);
}

patchOrderCities().catch(console.error);