import { defineNuxtPlugin } from '#app'
import { initializeApp, getApps } from "firebase/app"

export default defineNuxtPlugin(() => {
  if (process.client) {
    const config = useRuntimeConfig()
    
    const firebaseConfig = {
      apiKey: config.public.firebaseApiKey,
      authDomain: config.public.firebaseAuthDomain,
      projectId: config.public.firebaseProjectId,
      storageBucket: config.public.firebaseStorageBucket,
      messagingSenderId: config.public.firebaseMessagingSenderId,
      appId: config.public.firebaseAppId
    }

    console.log('🔥 Firebase Plugin - Config:', firebaseConfig)

    let app
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig)
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