import admin from 'firebase-admin';

// Initialize production Firestore
const prodApp = admin.initializeApp({
  projectId: 'fantacalcio-rigori',
  // Add your service account key here or use application default credentials
});
const prodDb = prodApp.firestore();

// Initialize emulator Firestore
const emulatorApp = admin.initializeApp({
  projectId: 'fantacalcio-rigori',
}, 'emulator');
const emulatorDb = emulatorApp.firestore();
emulatorDb.settings({
  host: '127.0.0.1:8080',
  ssl: false
});

async function syncCollection(collectionName) {
  console.log(`📦 Syncing collection: ${collectionName}`);
  
  const snapshot = await prodDb.collection(collectionName).get();
  
  for (const doc of snapshot.docs) {
    await emulatorDb.collection(collectionName).doc(doc.id).set(doc.data());
    console.log(`  ✅ Synced document: ${doc.id}`);
  }
}

async function syncAll() {
  try {
    // List all your collections
    const collections = ['players', 'teams', 'gameSettings', 'participants'];
    
    for (const collection of collections) {
      await syncCollection(collection);
    }
    
    console.log('🎉 All data synced to emulator!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error syncing:', error);
    process.exit(1);
  }
}

syncAll();