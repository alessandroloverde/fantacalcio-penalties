<template>
   <div class="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1>Calendario incontri</h1>
      <br />
      <section v-for="session in timeWindows" class="flex flex-wrap mb-6">
         <h3 class="w-full">{{ session.name }}</h3>
         <div class="flex-1">
            <p>Inizio: {{ session.startDateTime }}</p>
         </div>
         <div class="flex-1">
            <p>Fine: {{ session.endDateTime }}</p>
         </div>
         <div class="w-full">
            <ul>
               <li v-for="(match, index) in session.matches" :key="index">{{ teamsMap[match.teamA] }} – {{ teamsMap[match.teamB] }}</li>
            </ul>
         </div>
      </section>
   </div>
</template>


<script setup lang="ts">
   import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore'
   import { useNuxtApp } from '#app'
   import { useTeamsStore } from '../stores/teams'
   import type { Match, TimeWindow } from './settings.vue'

   const timeWindows = ref<TimeWindow[]>([])
   const teamsStore = useTeamsStore()

   const teamsMap = computed(() => {
      return teamsStore.teamsWithPlayers.reduce((map, team) => {
         map[team.teamId] = team.teamData?.name || team.teamId
         return map
      }, {} as Record<string, string>)
   })

   const fetchTimeWindows = async () => {
      if (!process.client) return

      try {
         const { $firebaseApp } = useNuxtApp()
         if (!$firebaseApp) {
            console.error('Firebase app not initialized')
            return
         }
         const db = getFirestore($firebaseApp)
         const sessionsSnapshot = await getDocs(collection(db, "session"))

        timeWindows.value = sessionsSnapshot.docs.map(doc => {
            return {
               id: doc.id,
               ...doc.data()
            } as TimeWindow
         })
        timeWindows.value.sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime())


      } catch(error) {
         console.error('Error fetching time windows:', error)
      }
   }

   onMounted(async () => {
      await fetchTimeWindows()
   })


</script>


<style lang="scss" scoped></style>