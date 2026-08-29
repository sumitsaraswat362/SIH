import { Firestore } from '@google-cloud/firestore';

async function checkFirestore() {
  try {
    const firestore = new Firestore({
      projectId: 'project-a9c284f8-6bca-440a-a0c',
      keyFilename: '/Users/sumitsaraswat/project-a9c284f8-6bca-440a-a0c-5cdec2cf9219.json',
    });
    
    console.log('Testing Firestore connection...');
    const docRef = firestore.collection('_test_conn').doc('ping');
    await docRef.set({ timestamp: Date.now() });
    
    console.log('✅ Firestore is ACTIVE and ready to use!');
    await docRef.delete();
  } catch (error: any) {
    console.error('❌ Firestore check failed:', error.message);
  }
}

checkFirestore();
