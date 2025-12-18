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
               <div class="legend pill--beige">
                  <div class="w-2/20">Ruolo</div>
                  <div class="w-6/20">Nome</div>
                  <div class="w-2/20">Sq.</div>
                  <div class="w-1/20"></div>
                  <div class="w-1/20">Voto</div>
                  <div class="w-3/20">🥅 </div>
                  <div class="w-2/20"></div>
                  <div class="w-3/20"></div>
               </div>
               <div class="penaltyTaker mb-6">
                  <div class="w-2/20 penaltyTaker--role P">{{ penaltiesStore.penalties[teamB]?.goalkeeper?.role }}</div>
                  <div class="w-6/20 penaltyTaker--name">{{ penaltiesStore.penalties[teamB]?.goalkeeper?.name }}</div>
                  <div class="w-2/20 penaltyTaker--squadra">{{ penaltiesStore.penalties[teamB]?.goalkeeper?.squadra }}</div>
                  <div class="w-1/20"></div>
                  <div class="w-1/20">{{ teamBGoalkeeperScore?.playerScore }}</div>
                  <div class="w-3/20">{{ teamBGoalkeeperScore?.penaltiesSaved }}</div>
                  <div class="w-2/20"></div>
                  <div class="w-3/20"></div>
               </div>
               <h4 class="mb-1">Rigoristi</h4>
               <ul>
                  <div class="legend pill--beige">
                     <div class="w-2/20">Ruolo</div>
                     <div class="w-6/20">Nome</div>
                     <div class="w-2/20">Sq.</div>
                     <div class="w-1/20"></div>
                     <div class="w-1/20">Voto</div>
                     <div class="w-3/20">⚽️ ❌</div>
                     <div class="w-1/20">⚽️</div>
                     <div class="w-1/20"></div>
                     <div class="w-3/20"></div>
                  </div>
                  <li v-for="player in teamBPenaltyTakersWithScores" :key="player.playerID" class="penaltyTaker mb-1">
                     <div class="w-2/20 penaltyTaker--role" :class="player.role">{{ player.role }}</div>
                     <div class="w-6/20 penaltyTaker--name">{{ player.name }}</div>
                     <div class="w-2/20 penaltyTaker--squadra">{{ player.squadra }}</div>
                     <div class="w-1/20"></div>
                     <div class="w-1/20">{{ player.score?.playerScore }}</div>
                     <div class="w-3/20" :class="{'penaltyTaker--score': player.score?.penaltiesFailed > 0}">{{ player.score?.penaltiesFailed }}</div>
                     <div class="w-1/20" :class="{'penaltyTaker--score': getTotalGoals(player.score) > 0}">{{ getTotalGoals(player.score) }}</div>
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
   import { useSessionsStore } from '../stores/sessions'
   import type { TimeWindow } from '../stores/sessions'

   const route = useRoute()
   const teamsStore = useTeamsStore()
   const penaltiesStore = usePenaltiesStore()
   const sessionsStore = useSessionsStore()

   const loading = ref(true)
   const error = ref<string | null>(null)
   const currentTimeWindow = ref<TimeWindow | undefined>(undefined)

   const teamA = computed(() => route.query.teamA as string)
   const teamB = computed(() => route.query.teamB as string)
   const sessionName = computed(() => route.query.session as string)

   const teamAData = computed(() => 
      teamsStore.teamsWithPlayers.find(t => t.teamId === teamA.value)
   )
   const teamBData = computed(() => 
      teamsStore.teamsWithPlayers.find(t => t.teamId === teamB.value)
   )

   // Optimized: Cache sorted penalty takers (only sort if needed)
   const teamAPenaltyTakers = computed(() => {
      const takers = penaltiesStore.penalties[teamA.value]?.penaltyTakers || []
      if (takers.length === 0) return []
      return [...takers].sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
   })

   const teamBPenaltyTakers = computed(() => {
      const takers = penaltiesStore.penalties[teamB.value]?.penaltyTakers || []
      if (takers.length === 0) return []
      return [...takers].sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
   })

   // OPTIMIZATION: Create a Map for O(1) player score lookups instead of O(n) finds
   const playersScoresMap = computed(() => {
      if (!currentTimeWindow.value?.playersScores) return new Map()
      
      return new Map(
         currentTimeWindow.value.playersScores.map(score => [
            score.playerID,
            score
         ])
      )
   })

   // Memoized lookup function
   const getPlayerScore = (playerID: string) => {
      return playersScoresMap.value.get(playerID)
   }

   // Memoized goalkeeper score lookup
   const teamBGoalkeeperScore = computed(() => {
      const gkPlayerID = penaltiesStore.penalties[teamB.value]?.goalkeeper?.playerID
      if (!gkPlayerID) return undefined
      return getPlayerScore(gkPlayerID)
   })

   // OPTIMIZATION: Pre-compute scores for penalty takers (only computed once per player)
   const teamBPenaltyTakersWithScores = computed(() => {
      return teamBPenaltyTakers.value.map(player => ({
         ...player,
         score: getPlayerScore(player.playerID),
      }))
   })

   const getTotalGoals = (score: any) => {
      if (!score) return 0
      return (score.goalsScored ?? 0) + (score.penaltiesScored ?? 0)
   }


   onMounted(async () => {
      try {
         // Parallel fetch with error handling
         await Promise.all([
            teamsStore.fetchTeams(),
            penaltiesStore.fetchPenalties(),
            sessionsStore.fetchSessionByName(sessionName.value).then(session => {
               currentTimeWindow.value = session
            })
         ])
      } catch (err: any) {
         error.value = err?.message || 'Failed to load data'
         console.error('Error in onMounted:', err)
      } finally {
         loading.value = false
      }
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
         font-weight: 700;
         color: $cream;
         position: relative;
         z-index: 0;

         &::before {
            content: "";
            width: 1em;
            height: 1em;
            display: block;
            background-color: $navyBlue;
            border-radius: 50%;
            aspect-ratio: 1;
            z-index: -1;
            position: absolute;
            padding: 0.75em;
            top: 0;
            left: 50%;
            right: 0;
            border: 0;
            transform: translateX(-50%);
         }
      }
   }

   .legend {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 1em;
      line-height: 1.15;

      & > div {
         //outline: 1px solid color.change(salmon, $alpha: 0.5);
         text-align: center;

         &:nth-of-type(2),
         &:nth-of-type(3) { text-align: left }
      }
   }
</style>