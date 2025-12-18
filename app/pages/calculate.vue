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
            <PlayersScoreTable
               :teamName="teamAData?.teamData.name"
               :goalkeeper="penaltiesStore.penalties[teamA]?.goalkeeper"
               :goalkeeperScore="teamAGoalkeeperScore"
               :penaltyTakersWithScores="teamAPenaltyTakersWithScores"
            />
            <PlayersScoreTable
               :teamName="teamBData?.teamData.name"
               :goalkeeper="penaltiesStore.penalties[teamB]?.goalkeeper"
               :goalkeeperScore="teamBGoalkeeperScore"
               :penaltyTakersWithScores="teamBPenaltyTakersWithScores"
            />
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

   // Memoized goalkeeper score lookup for Team A
   const teamAGoalkeeperScore = computed(() => {
      const gkPlayerID = penaltiesStore.penalties[teamA.value]?.goalkeeper?.playerID
      if (!gkPlayerID) return undefined
      return getPlayerScore(gkPlayerID)
   })

   // OPTIMIZATION: Pre-compute scores for Team A penalty takers
   const teamAPenaltyTakersWithScores = computed(() => {
      return teamAPenaltyTakers.value.map(player => ({
         ...player,
         score: getPlayerScore(player.playerID),
      }))
   })

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

   .match {
      display: flex;
      justify-content: space-between;

      &--result {
         &--separator { color: $blush }
      }
   }
</style>