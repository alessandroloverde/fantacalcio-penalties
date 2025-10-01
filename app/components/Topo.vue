<template>
   <section>
      <h1>Mannagia al Castoro</h1>
      <h2>{{ settings }}</h2>
      <h2 v-if="err">Errore: {{ err }}</h2>
      <h2 v-if="loading">Loading...</h2>
   </section>
</template>

<style scoped>
   h1, h2 {
      color: #faebd7;
   }
   section {
      background-color: rgb(95, 118, 163);
   }
</style>

<script setup lang="ts">
import { getApp } from 'firebase/app'
import { getFirestore, doc, getDoc } from 'firebase/firestore'

const { $firebaseApp } = useNuxtApp()

const settings = ref<any>(null)
const err = ref(false)
const loading = ref(false)

onMounted(async () => {
   // Only run Firebase code on client side
   if (process.client && $firebaseApp) {
      loading.value = true
      try {
         console.log('🔥 Starting Firestore query...')
         
         // Initialize Firestore after ensuring Firebase app is available
         const db = getFirestore($firebaseApp)
         console.log('🔥 Firestore DB initialized:', db)
         
         const docRef = doc(db, 'gameSettings', 'wUDv5Wr31ETbShASdx7u')
         console.log('�� Document reference:', docRef)
         
         const docSnap = await getDoc(docRef)
         console.log('🔥 Document snapshot:', docSnap)

         if(docSnap.exists()) {
            settings.value = docSnap.data()
            console.log('🔥 Settings data:', settings.value)
         } else {
            settings.value = 'No game settings found'
            console.log('🔥 Document does not exist')
         }

         // Test Firebase app
         const app = getApp() || $firebaseApp
         console.log('🔥 Firebase App initialized:', app)
      } catch (error) {
         console.error('🔥 Firebase error:', error)
         err.value = error.message || 'Unknown error'
      } finally {
         loading.value = false
      }
   } else {
      console.log('🔥 Not running on client or Firebase app not available')
   }
})
</script>