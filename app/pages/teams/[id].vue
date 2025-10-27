<template>
   <div>
      <nuxtLink to="/">Back to Home</nuxtLink>
      <h1>{{ teamData?.name }}</h1>
      <div v-if="loading">Loading...</div>

   </div>
</template>

<script setup lang="ts">
   import { getFirestore, doc, getDoc, collection, getDocs } from 'firebase/firestore';
   import { useRoute } from 'vue-router';

   const route = useRoute()
   const { $firebaseApp } = useNuxtApp()

   const teamId = route.params.id as string

   const teamData = ref<any>(null)
   const players = ref<string[]>([])
   const loading = ref<boolean>(true)

   onMounted(async () => {
      if (process.client && $firebaseApp) {
         const db = getFirestore($firebaseApp)

         const teamRef = doc(db, "teams", teamId)
         const teamSnap = await getDoc(teamRef)

         if(teamSnap.exists()) {
            teamData.value = teamSnap.data()
         }
      }
   })

</script>

<style lang="scss">
   h1 {
      color:aquamarine
   }

   a:link {
      color: yellow;
   }
   a:visited {
      color: yellowgreen;
   }
</style>