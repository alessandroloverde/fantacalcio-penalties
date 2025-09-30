import { defineNuxtPlugin } from '#app'
import { initializeApp, getApps } from "firebase/app"

export default defineNuxtPlugin(() => {
  // Only initialize Firebase on client side
  if (process.client) {
    const config = {
      apiKey: process.env.NUXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NUXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NUXT_PUBLIC_FIREBASE_APP_ID
    }

    // Check if Firebase is already initialized
    let app
    if (getApps().length === 0) {
      app = initializeApp(config)
    } else {
      app = getApps()[0]
    }

    return {
      provide: {
        firebaseApp: app
      }
    }
  }
})