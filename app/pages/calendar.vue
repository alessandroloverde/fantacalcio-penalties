<template>
   <div class="container h-full max-w-7xl mx-auto my-12 px-4 sm:px-6 lg:px-8 py-8 boxed">
      <h1 class="withIcon--calendar-duo">Calendario incontri</h1>
      <hr class="divider my-4" />
      <section v-for="session in timeWindows" class="grid grid-cols-4 mb-8">
         <h2 class="withIcon--ball-duo col-span-4 mb-4">{{ session.name }}</h2>
         <div class="col-span-2 mb-2">
            <p class="withIcon--calendar">Inizio: {{ session.startDateTime }}</p>
         </div>
         <div class="col-span-2 mb-2">
            <p class="withIcon--calendar">Fine: {{ session.endDateTime }}</p>
         </div>
         <div class="col-span-4 grid grid-cols-4">
            <div v-for="(match, index) in session.matches" :key="index" class="col-span-2">
               <h4>{{ teamsMap[match.teamA] }} – {{ teamsMap[match.teamB] }}</h4>
            </div>
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