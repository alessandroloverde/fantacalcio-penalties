// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/fonts'],
  runtimeConfig: {
    public: {
      firebaseApiKey: 'AIzaSyAi6xTXieeklm2ehtWU7MxEqtL4FP5pzno',
      firebaseAuthDomain: 'fantacalcio-rigori.firebaseapp.com',
      firebaseProjectId: 'fantacalcio-rigori',
      firebaseStorageBucket: 'fantacalcio-rigori.appspot.com',
      firebaseMessagingSenderId: '1029812597058',
      firebaseAppId: '1:1029812597058:web:4d9b4e6e6e6e6e6e'
    }
  }
})