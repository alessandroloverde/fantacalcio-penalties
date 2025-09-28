<template>
   <section>
      <h1>Mannagia al Castoro</h1>
      <h2>{{ castoro }}</h2>
   </section>
</template>


<style scoped>
   h1 {
      color: antiquewhite;
   }
   section {
      background-color: brown;
   }
</style>

<script setup>
import { getApp } from 'firebase/app'

const { $firebaseApp } = useNuxtApp()

const castoro = ref('')

try {
  const app = getApp() || $firebaseApp

  castoro.value = app._isDeleted
  console.log('Firebase App initialized:', app)
} catch (err) {
  console.error('Firebase not initialized:', err)
}
</script>