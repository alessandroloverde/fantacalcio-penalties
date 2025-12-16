<template>
   <AppNav />

   <div class="container boxed h-full max-w-7xl mx-auto my-12 px-4 sm:px-6 lg:px-8 py-8">
      <h1 class="withIcon--calendar-duo withIcon--color-blush mb-8">Calendario incontri</h1>
      
      <section v-for="session in timeWindows" class="card grid grid-cols-4 gap-x-8 gap-y-4 mb-8 px-8 py-6">
         <h2 class="withIcon--ball-duo withIcon--color-blush col-span-4 mb-4">{{ session.name }}</h2>
         <div class="col-span-2 mb-2 pill--beige dateWindow">
            <p class="withIcon--calendar withIcon--color-blush"><span>inizio: </span>{{ formatToITDate(session.startDateTime) }}</p>
         </div>
         <div class="col-span-2 mb-2 pill--beige dateWindow">
            <p class="withIcon--calendar withIcon--color-blush"><span>fine: </span>{{ formatToITDate(session.endDateTime) }}</p>
         </div>
         <div class="col-span-4 grid grid-cols-subgrid gap-y-4">
            <div 
            v-for="(match, index) in session.matches" 
            :key="index" 
            class="col-span-2 pill--white flex items-center gap-4"
            >
               <h4 class="w-3/4">{{ teamsMap[match.teamA] }} – {{ teamsMap[match.teamB] }}</h4>
               <button 
                  class="btn btn--primary withIcon--calculate-duo btn--icon-left"
                  @click="goToCalculate(match.teamA, match.teamB, session.name)"
                  :disabled="!session.playersScores"
               >calcola</button>
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

   // *** Retireve team's name from ID ***
   const teamsMap = computed(() => {
      return teamsStore.teamsWithPlayers.reduce((map, team) => {
         map[team.teamId] = team.teamData?.name || team.teamId
         return map
      }, {} as Record<string, string>)
   })
   
   // *** Format date and time in italian locale ***
   const formatToITDate = (dateString: string) => {
      const date = new Date(dateString)

      return date.toLocaleDateString('it-IT', {
         weekday: 'long',
         day: '2-digit',
         month: 'long',
         year: 'numeric',
         hour: '2-digit',
         minute: '2-digit'
      })
   }

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

   const goToCalculate = (teamA: string, teamB: string, session: string) => {
      navigateTo({
         path: `/calculate`,
         query: {
            teamA,
            teamB,
            session
         }
      })
   }

   onMounted(async () => {
      await fetchTimeWindows()
   })


</script>


<style lang="scss" scoped>
   @use '@/assets/scss/main' as *;

   .dateWindow {
      padding: 0.5em 1.5em;

      p {
         padding-left: 2.5em; 

         & > span { 
            font-weight: $font-weight-semibold;
            color: $color-text-accent;
         }
      } 
   }

</style>