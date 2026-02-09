import admin from 'firebase-admin';
import { readFileSync, existsSync } from 'fs';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise(resolve => rl.question(prompt, resolve));
}

function initializeFirebase() {
  // Check if serviceAccountKey.json exists in current directory
  const serviceAccountPath = './serviceAccountKey.json';

  if (!existsSync(serviceAccountPath)) {
    console.error('\n❌ Error: serviceAccountKey.json not found!');
    console.error('\n   To use production Firebase, you need a service account key:');
    console.error('   1. Go to Firebase Console → Project Settings → Service Accounts');
    console.error('   2. Click "Generate new private key"');
    console.error('   3. Save it as serviceAccountKey.json in the scripts directory\n');
    rl.close();
    process.exit(1);
  }

  // Use production Firebase
  console.log('📦 Using production Firebase\n');
  const serviceAccount = JSON.parse(
    readFileSync(serviceAccountPath, 'utf8')
  );
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  return {
    auth: admin.auth(),
    db: admin.firestore()
  };
}

async function fixParticipant() {
  const { auth, db } = initializeFirebase();
  
  console.log('\n🔧 Fix Participant Document for Login\n');

  const email = await question('Enter email: ');

  try {
    // Find user in Firebase Auth
    console.log('\n🔍 Finding user in Firebase Auth...');
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(email.trim());
      console.log(`✅ Found Auth user:`);
      console.log(`   UID: ${userRecord.uid}`);
      console.log(`   Email: ${userRecord.email}`);
      console.log(`   Email Verified: ${userRecord.emailVerified}\n`);
  } catch (error) {
    console.error(`❌ Error finding user in Firebase Auth: ${error.message}`);
    if (error.code) {
      console.error(`   Error code: ${error.code}`);
    }
    rl.close();
    process.exit(1);
  }

    const uid = userRecord.uid;

    // Check if participant document exists
    console.log('🔍 Checking Firestore participant document...');
    const participantRef = db.collection('participants').doc(uid);
    const participantSnap = await participantRef.get();

    if (participantSnap.exists) {
      const participantData = participantSnap.data();
      console.log('✅ Participant document exists:');
      console.log(`   Name: ${participantData.name || 'N/A'}`);
      console.log(`   Email: ${participantData.email || 'N/A'}`);
      console.log(`   Admin: ${participantData.isAdmin ? 'Yes' : 'No'}`);
      console.log(`   Team ID: ${participantData.teamId || 'N/A'}`);
      console.log(`   All fields: ${JSON.stringify(participantData, null, 2)}\n`);

      const update = await question('Do you want to update this participant? (y/n): ');
      if (update.toLowerCase().trim() !== 'y' && update.toLowerCase().trim() !== 'yes') {
        console.log('✅ Participant document exists. No changes made.');
        rl.close();
        process.exit(0);
      }

      // Update existing document
      const name = await question('Enter name (press Enter to keep current): ') || participantData.name;
      const isAdminInput = await question(`Is admin? (y/n, current: ${participantData.isAdmin ? 'y' : 'n'}): `);
      const isAdmin = isAdminInput.toLowerCase().trim() === 'y' || isAdminInput.toLowerCase().trim() === 'yes';

      await participantRef.update({
        name: name.trim(),
        email: email.trim(),
        isAdmin: isAdmin,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      console.log('\n✅ Participant document updated successfully!');
    } else {
      console.log('⚠️  Participant document NOT found. Creating new one...\n');

      const name = await question('Enter name: ');
      const isAdminInput = await question('Is admin? (y/n, default: n): ');
      const isAdmin = isAdminInput.toLowerCase().trim() === 'y' || isAdminInput.toLowerCase().trim() === 'yes';

      // Create participant document
      await participantRef.set({
        name: name.trim(),
        email: email.trim(),
        isAdmin: isAdmin,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      console.log('\n✅ Participant document created successfully!');
      console.log(`   UID: ${uid}`);
      console.log(`   Email: ${email}`);
      console.log(`   Name: ${name}`);
      console.log(`   Admin: ${isAdmin ? 'Yes' : 'No'}`);
    }

    console.log('\n🎉 Done! You should now be able to login.');
    console.log(`   Try logging in with: ${email}`);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.code) {
      console.error(`   Error code: ${error.code}`);
    }
  }

  rl.close();
  process.exit(0);
}

fixParticipant();
