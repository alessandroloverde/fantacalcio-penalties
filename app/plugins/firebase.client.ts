import { defineNuxtPlugin } from '#app'
import { initializeApp, getApps } from 'firebase/app'
import type { FirebaseApp } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'

export default defineNuxtPlugin(() => {
  if (!process.client) return

  const config = useRuntimeConfig()

  const firebaseConfig = {
    apiKey: config.public.firebaseApiKey,
    authDomain: config.public.firebaseAuthDomain,
    projectId: config.public.firebaseProjectId,
    storageBucket: config.public.firebaseStorageBucket,
    messagingSenderId: config.public.firebaseMessagingSenderId,
    appId: config.public.firebaseAppId,
  }

  console.log('🔥 Firebase Plugin - Config:', firebaseConfig)

  // ✅ Ensure app is always defined and correctly typed
  let app: FirebaseApp
  const existingApps = getApps()
  if (existingApps.length > 0) {
    app = existingApps[0]!
  } else {
    app = initializeApp(firebaseConfig)
  }

  // ✅ Initialize services with guaranteed non-undefined app
  const auth = getAuth(app)
  const db = getFirestore(app)

  // Connect to emulators only in dev mode
  if (process.dev) {
    try {
      connectAuthEmulator(auth, 'http://127.0.0.1:9099')
      connectFirestoreEmulator(db, '127.0.0.1', 8080)
      console.log('⚙️ Connected to Firebase Emulators (Auth + Firestore)')
    } catch (err) {
      console.warn('⚠️ Emulator connection failed:', err)
    }
  }

  // Provide globally
  return {
    provide: {
      firebaseApp: app,
      auth,
      db,
    },
  }
})
