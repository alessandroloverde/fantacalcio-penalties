import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import readline from 'readline';

// For production
const serviceAccount = JSON.parse(
  readFileSync('./serviceAccountKey.json', 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// For emulator (comment out the above and use this)
// admin.initializeApp({ projectId: 'fantacalcio-rigori' });
// process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
// process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';

const auth = admin.auth();
const db = admin.firestore();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise(resolve => rl.question(prompt, resolve));
}

async function updateUserEmail() {
  console.log('📧 Firebase Auth - Update User Email\n');

  const currentEmail = await question('Enter current email: ');
  const newEmail = await question('Enter new email: ');

  try {
    // Get user by current email
    console.log('\n🔍 Finding user...');
    const userRecord = await auth.getUserByEmail(currentEmail.trim());
    const uid = userRecord.uid;
    
    console.log(`✅ Found user: ${uid}\n`);

    // Update email in Auth
    console.log('📝 Updating email in Firebase Auth...');
    await auth.updateUser(uid, {
      email: newEmail.trim()
    });
    console.log('✅ Auth email updated\n');

    // Update email in Firestore participant document
    console.log('📝 Updating email in Firestore...');
    const participantRef = db.collection('participants').doc(uid);
    const participantSnap = await participantRef.get();

    if (participantSnap.exists) {
      await participantRef.update({
        email: newEmail.trim(),
        emailUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log('✅ Firestore email updated\n');
    } else {
      console.log('⚠️  No Firestore participant document found\n');
    }

    console.log('🎉 Email successfully updated!');
    console.log(`   Old: ${currentEmail}`);
    console.log(`   New: ${newEmail}`);
    console.log(`   UID: ${uid} (unchanged)`);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }

  rl.close();
  process.exit(0);
}

updateUserEmail();