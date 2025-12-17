<template>
      <AppNav />

      <div class="container boxed h-full max-w-7xl mx-auto my-12 px-4 sm:px-6 lg:px-8 py-8">
         <h1 class="withIcon--calculate-duo withIcon--color-blush mb-8">Calcola Rigori</h1>

         <section class="card grid grid-cols-2 gap-x-20 gap-y-4 px-8 py-6">
            <header class="match col-span-2">
               <h2 class="match--title col-span-2 withIcon--shirt-duo withIcon--color-blush">
                  {{ teamAData?.teamData.name }} – {{ teamBData?.teamData.name }} ({{ currentTimeWindow?.name}})
               </h2>
               <h2 class="match--result">0 <span class="match--result--separator">–</span> 0</h2>
            </header>
            <div class="divider-text col-span-2 my-2">◎</div>
            <h3 class="col-span-2">{{teamAData?.teamData.name}}</h3>
            <section class="col-span-1">
               <h4 class="mb-1">Portiere</h4>
               <div class="penaltyTaker mb-4">
                  <div class="penaltyTaker--role P">{{ penaltiesStore.penalties[teamA]?.goalkeeper?.role }}</div>
                  <div class="penaltyTaker--name w-2/6">{{ penaltiesStore.penalties[teamA]?.goalkeeper?.name }}</div>
                  <div class="penaltyTaker--squadra">{{ penaltiesStore.penalties[teamA]?.goalkeeper?.squadra }}</div>
               </div>
               <h4 class="mb-1">Rigoristi</h4>
               <ul>
                  <li v-for="player in teamAPenaltyTakers" class="penaltyTaker mb-1">
                     <div class="penaltyTaker--role" :class="player.role">{{ player.role }}</div>
                     <div class="penaltyTaker--name w-2/6">{{ player.name }}</div>
                     <div class="penaltyTaker--squadra">{{ player.squadra }}</div>
                     <button class="btn btn--secondary withIcon--soccerBall-duo btn--icon-left ml-auto">Tira</button>
                  </li>
               </ul>
            </section>
            <section class="col-span-1">
               <h4 class="mb-1">Portiere</h4>
               <div class="penaltyTaker mb-4">
                  <div class="penaltyTaker--role P">{{ penaltiesStore.penalties[teamB]?.goalkeeper?.role }}</div>
                  <div class="penaltyTaker--name w-2/6">{{ penaltiesStore.penalties[teamB]?.goalkeeper?.name }}</div>
                  <div class="penaltyTaker--squadra">{{ penaltiesStore.penalties[teamB]?.goalkeeper?.squadra }}</div>
                  <div>{{ currentTimeWindow?.playersScores?.find(item => item.playerID === penaltiesStore.penalties[teamB]?.goalkeeper?.playerID).playerScore  }}</div>
               </div>
               <h4 class="mb-1">Rigoristi</h4>
               <ul>
                  <div class="legend">
                     <div class="w-2/20">Ruolo</div>
                     <div class="w-6/20">Nome</div>
                     <div class="w-1/20">Sq.</div>
                     <div class="w-1/20"></div>
                     <div class="w-1/20">Voto</div>
                     <div class="w-2/20">Rigori<br/>segnati</div>
                     <div class="w-2/20">Rigori<br/>falliti</div>
                     <div class="w-1/20">Gol</div>
                     <div class="w-1/20"></div>
                     <div class="w-3/20"></div>
                  </div>
                  <li v-for="player in teamBPenaltyTakers" class="penaltyTaker mb-1">
                     <div class="w-2/20 penaltyTaker--role" :class="player.role">{{ player.role }}</div>
                     <div class="w-6/20 penaltyTaker--name">{{ player.name }}</div>
                     <div class="w-1/20 penaltyTaker--squadra">{{ player.squadra }}</div>
                     <div class="w-1/20"></div>
                     <div class="w-1/20">{{ currentTimeWindow?.playersScores?.find(item => item.playerID === player.playerID)?.playerScore }}</div>
                     <div class="w-2/20">{{ currentTimeWindow?.playersScores?.find(item => item.playerID === player.playerID)?.penaltiesFailed }}</div>
                     <div class="w-2/20">{{ currentTimeWindow?.playersScores?.find(item => item.playerID === player.playerID)?.penaltiesScored }}</div>
                     <div class="w-1/20" :class="{'penaltyTaker--score': currentTimeWindow?.playersScores?.find(item => item.playerID === player.playerID)?.goalsScored > 0}">{{ currentTimeWindow?.playersScores?.find(item => item.playerID === player.playerID)?.goalsScored }}</div>
                     <div class="w-1/20"></div>
                     <button class="w-3/20 btn btn--primary withIcon--soccerBall-duo btn--icon-left"></button>
                  </li>
               </ul>
            </section>
         </section>
        
      </div>
</template>

<script setup lang="ts">
   import { useTeamsStore } from '../stores/teams'
   import { usePenaltiesStore } from '../stores/penalties'
   import { getFirestore, collection, getDocs } from 'firebase/firestore'
   import { useNuxtApp } from '#app'
   import type { TimeWindow } from './settings.vue'

   const route = useRoute()
   const { $firebaseApp } = useNuxtApp()
   const teamsStore = useTeamsStore()
   const penaltiesStore = usePenaltiesStore()

   const loading = ref(true)
   const timeWindows = ref<TimeWindow[]>([])
   const currentTimeWindow = computed<TimeWindow | undefined>(() => {
      const sessionName = route.query.session as string

      if (!sessionName) return undefined
      
      return timeWindows.value.find(win => win.name === sessionName)
   })

   const teamA = computed(() => route.query.teamA as string)
   const teamB = computed(() => route.query.teamB as string)

   const teamAData = computed(() => 
      teamsStore.teamsWithPlayers.find(t => t.teamId === teamA.value)
   )
   const teamBData = computed(() => 
      teamsStore.teamsWithPlayers.find(t => t.teamId === teamB.value)
   )

   const teamAPenaltyTakers = computed(() => {
         const takers = penaltiesStore.penalties[teamA.value]?.penaltyTakers || []

         return [...takers].sort((a,b) => a.position - b.position)
      }    
   )
   const teamBPenaltyTakers = computed(() => {
         const takers = penaltiesStore.penalties[teamB.value]?.penaltyTakers || []

         return [...takers].sort((a,b) => a.position - b.position)
      }    
   )

   const fetchTimeWindows = async () => {
      if (!process.client || !$firebaseApp) return

      try {
         const db = getFirestore($firebaseApp)
         const sessionsSnapshot = await getDocs(collection(db, "session"))

         timeWindows.value = sessionsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
         }) as TimeWindow)

         timeWindows.value.sort((a, b) => 
            new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime()
         )

      } catch(error) {
         console.error('Error fetching time windows:', error)
      }


   }

   onMounted(async () => {
      await Promise.all([
      teamsStore.fetchTeams(),
      penaltiesStore.fetchPenalties(),
      fetchTimeWindows()
      ])
      
      loading.value = false
   })

</script>

<style lang="scss" scoped>
   @use '@/assets/scss//main' as *;
   @use 'sass:color';

   .match {
      display: flex;
      justify-content: space-between;

      &--result {
         &--separator { color: $blush }
      }
   }

   .penaltyTaker {
      display: flex;
      align-items: center;
      justify-content: flex-start;

      & > div {
         //outline: 1px solid color.change(salmon, $alpha: 0.5);
         text-align: center;

         &:nth-of-type(2),
         &:nth-of-type(3) { text-align: left }
      }

      &--role {
         border-radius: 100%;
         color: $cream;
         font-weight: 500;
         width: 2em;
         height: 2em;
         display: flex;
         flex-shrink: 0;
         align-items: center;
         justify-content: center;
         margin-right: auto;
      }
      &--name {}
      &--squadra {}
      &--score {
         background-color: $navyBlue;
         font-weight: 700;
         color: $cream;
         border-radius: 50%;
         aspect-ratio: 1;
      }
   }

   .legend {
      display: flex;
      justify-content: flex-start;
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 1em;
      line-height: 1.25;

      & > div {
         //outline: 1px solid color.change(salmon, $alpha: 0.5);
         text-align: center;

         &:nth-of-type(2),
         &:nth-of-type(3) { text-align: left }
      }
   }
</style>