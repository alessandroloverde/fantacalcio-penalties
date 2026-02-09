// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  app: {
    head: {
      htmlAttrs: {
        lang: 'it'
      },
      link: [
        // Preconnect to Google Fonts for faster DNS/TLS
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        // Load fonts with only the weights you actually use (300-800)
        { 
          rel: 'stylesheet', 
          href: 'https://fonts.googleapis.com/css2?family=Momo+Trust+Display&display=swap' 
        },
        { 
          rel: 'stylesheet', 
          href: 'https://fonts.googleapis.com/css2?family=SUSE:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400;1,500;1,600;1,700;1,800&display=swap' 
        }
      ]
    }
  },
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@pinia/nuxt',/* '@nuxtjs/tailwindcss' */],
  css: [
    '@/assets/css/main.css',  // Tailwind CSS
    '@/assets/scss/main.scss' // Custom SCSS
  ],
  runtimeConfig: {
    public: {
      firebaseApiKey: process.env.NUXT_PUBLIC_FIREBASE_API_KEY ?? '',
      firebaseAuthDomain: process.env.NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
      firebaseProjectId: process.env.NUXT_PUBLIC_FIREBASE_PROJECT_ID ?? '',
      firebaseStorageBucket: process.env.NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
      firebaseMessagingSenderId: process.env.NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
      firebaseAppId: process.env.NUXT_PUBLIC_FIREBASE_APP_ID ?? '',
    },
  },
  postcss: {
    plugins: {
      '@tailwindcss/postcss': {},
    },
  },
})