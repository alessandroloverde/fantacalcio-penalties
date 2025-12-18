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
   import { useTeamsStore } from '../stores/teams'
   import { useSessionsStore } from '../stores/sessions'
   import type { TimeWindow } from '../stores/sessions'

   const teamsStore = useTeamsStore()
   const sessionsStore = useSessionsStore()

   // Convert sessions store (Record) to sorted array for display
   const timeWindows = computed<TimeWindow[]>(() => {
      const sessionsArray = Object.values(sessionsStore.sessions).map(session => ({
         ...session,
         matches: [...(session.matches || [])],
         playersScores: session.playersScores ? [...session.playersScores] : undefined
      })) as TimeWindow[]
      return sessionsArray.sort((a, b) => 
         new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime()
      )
   })

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
      // Fetch all sessions (calendar needs all of them)
      await sessionsStore.fetchAllSessions()
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