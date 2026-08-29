const { Firestore } = require('@google-cloud/firestore');
const firestore = new Firestore({ projectId: 'project-a9c284f8-6bca-440a-a0c' });

async function clearCollection(collectionPath) {
  const collectionRef = firestore.collection(collectionPath);
  const snapshot = await collectionRef.get();
  
  const batchSize = snapshot.size;
  if (batchSize === 0) {
    console.log(`${collectionPath} is empty.`);
    return;
  }
  
  const batch = firestore.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  
  await batch.commit();
  console.log(`Deleted ${batchSize} documents from ${collectionPath}.`);
}

async function main() {
  await clearCollection('cargos');
  await clearCollection('bids');
}

main().catch(console.error);
