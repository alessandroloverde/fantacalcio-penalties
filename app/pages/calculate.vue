<template>
      <AppNav />

      <div class="container boxed h-full max-w-7xl mx-auto my-12 px-4 sm:px-6 lg:px-8 py-8">
         <h1 class="withIcon--calculate-duo withIcon--color-blush mb-8">Calcola Rigori</h1>

         <section class="card grid grid-cols-2 gap-x-20 gap-y-4 px-8 py-6">
                        <div class="divider-text col-span-2 my-2">{{ currentTimeWindow?.name}}</div>

            <header class="match col-span-2">
               <h2 class="match--title col-span-2 withIcon--shirt-duo withIcon--color-blush">
                  {{ teamAData?.teamData.name }} – {{ teamBData?.teamData.name }} 
               </h2>
               <div class="penaltiesTrack mx-auto">
                  <div class="penaltiesTrack--teamA mx-auto">
                     <div 
                        v-for="(result, index) in teamAPenaltyTrack" 
                        :key="index" 
                        class="penaltiesTrack--penalty"
                        :class="{'disabled' : !secondBatchUnlocked && index > 4}"
                     >
                        <legend>{{ index +1 }}</legend>
                        <span v-if="result === 'scored'">⚽️</span>
                        <span v-else-if="result === 'saved'">❌</span>
                        <span v-else>🕙</span>
                     </div>
                  </div>
                  <div class="penaltiesTrack--teamB mx-auto">
                     <div 
                        v-for="(result, index) in teamBPenaltyTrack" 
                        :key="index" 
                        class="penaltiesTrack--penalty"
                        :class="{'disabled' : !secondBatchUnlocked && index > 4}"
                     >
                        <span v-if="result === 'scored'">⚽️</span>
                        <span v-else-if="result === 'saved'">❌</span>
                        <span v-else>🕙</span>
                     </div>
                  </div>
               </div>
               <h2 class="match--result">{{ teamAScore }} <span class="match--result--separator">–</span> {{ teamBScore }}</h2>
            </header>
            <div class="divider-text col-span-2 my-2">◎</div>
            <PlayersScoreTable
               :teamName="teamAData?.teamData.name || ''"
               :goalkeeper="teamAGoalkeeper.goalkeeper"
               :goalkeeperScore="teamAGoalkeeperScore"
               :penaltyTakersWithScores="teamAPenaltyTakersWithScores"
               :penaltyTaken="penaltyTaken"
               :penaltyResults="penaltyResults"
               :teamScore="teamAScore"
               :opponentScore="teamBScore"
               :teamPenaltiesTaken="teamAPenaltiesTakenCount"
               :opponentPenaltiesTaken="teamBPenaltiesTakenCount"
               :secondBatchUnlocked="secondBatchUnlocked"
               @penalty-kick="(player) => handlePenaltyKick(player, 'A')"
            />
            <PlayersScoreTable
               :teamName="teamBData?.teamData.name || ''"
               :goalkeeper="teamBGoalkeeper.goalkeeper"
               :goalkeeperScore="teamBGoalkeeperScore"
               :penaltyTakersWithScores="teamBPenaltyTakersWithScores"
               :penaltyTaken="penaltyTaken"
               :penaltyResults="penaltyResults"
               :teamScore="teamBScore"
               :opponentScore="teamAScore"
               :teamPenaltiesTaken="teamBPenaltiesTakenCount"
               :opponentPenaltiesTaken="teamAPenaltiesTakenCount"
               :secondBatchUnlocked="secondBatchUnlocked"
               @penalty-kick="(player) => handlePenaltyKick(player, 'B')"
            />
         
         <!-- Penalty Modal -->
         <PenaltyModal
            :isVisible="showPenaltyModal"
            :player="currentPenalty?.player"
            :goalkeeper="currentPenalty?.goalkeeper"
            :playerScore="currentPenalty?.player?.score?.playerScore"
            :goalkeeperScore="currentPenalty?.playerTeam === 'A' ? teamBGoalkeeperScore?.playerScore : teamAGoalkeeperScore?.playerScore"
            :goalkeeperSaves="currentPenalty?.playerTeam === 'A' ? teamBGoalkeeperScore?.penaltiesSaved : teamAGoalkeeperScore?.penaltiesSaved"
            :result="currentPenalty?.result"
            @close="closeModal"
         />

         <!-- Winner modal when shootout is over -->
         <Teleport to="body">
            <div
               v-if="shootoutWinner && showWinnerModal"
               class="winner-modal-overlay"
               @click="closeWinnerModal"
            >
               <div class="winner-modal" @click.stop>
                  <div class="winner-modal--trophy">🏆</div>
                  <p class="winner-modal--label">Vincitore ai rigori</p>
                  <p class="winner-modal--name">{{ shootoutWinnerName }}</p>
                  <button type="button" class="winner-modal--close btn btn--secondary" @click="closeWinnerModal">
                     Chiudi
                  </button>
               </div>
            </div>
         </Teleport>
        </section>
      </div>
</template>

<script setup lang="ts">
   import { useTeamsStore } from '../stores/teams'
   import { usePenaltiesStore } from '../stores/penalties'
   import { useSessionsStore } from '../stores/sessions'
   import type { TimeWindow } from '../stores/sessions'
   import PenaltyModal from '../components/PenaltyModal.vue'

   const route = useRoute()
   const teamsStore = useTeamsStore()
   const penaltiesStore = usePenaltiesStore()
   const sessionsStore = useSessionsStore()

   const loading = ref(true)
   const error = ref<string | null>(null)
   const currentTimeWindow = ref<TimeWindow | undefined>(undefined)

   // Reactive match scores
   const teamAScore = ref(0)
   const teamBScore = ref(0)
   const teamAPenaltiesScored = ref<number>(0)
   const teamBPenaltiesScored = ref<number>(0)
   
   // Track if second batch (players after 5th position) is unlocked
   const secondBatchUnlocked = ref(false)

   // Modal state
   const showPenaltyModal = ref(false)
   const showWinnerModal = ref(false)
   const currentPenalty = ref<{
      player: any
      goalkeeper: any
      playerTeam: 'A' | 'B'
      result: 'scored' | 'saved' | null
   } | null>(null)

   // Track which players have taken penalties and their results
   const penaltyTaken = ref<Set<string>>(new Set())
   const penaltyResults = ref<Map<string, 'scored' | 'saved'>>(new Map())

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

   // Helper function to find the first goalkeeper with a valid score (single source of truth)
   const getGoalkeeperWithScore = (teamId: string) => {
      const goalkeepers = penaltiesStore.penalties[teamId]?.goalkeepers || []
      
      // Find first goalkeeper with a valid score
      for (const gk of goalkeepers) {
         const score = getPlayerScore(gk.playerID)
         
         if (score && typeof score.playerScore === 'number' && score.playerScore > 0) {
            return { goalkeeper: gk, score }
         }
      }
      
      // Fallback to first goalkeeper if none have valid scores
      const firstGK = goalkeepers[0] || penaltiesStore.penalties[teamId]?.goalkeeper
      if (!firstGK) return { goalkeeper: null, score: undefined }
      return { goalkeeper: firstGK, score: getPlayerScore(firstGK.playerID) }
   }

   // Team A goalkeeper with score (single source of truth)
   const teamAGoalkeeper = computed(() => getGoalkeeperWithScore(teamA.value))

   // Team B goalkeeper with score (single source of truth)
   const teamBGoalkeeper = computed(() => getGoalkeeperWithScore(teamB.value))

   // Keep score properties for backward compatibility (extracted from above)
   const teamAGoalkeeperScore = computed(() => teamAGoalkeeper.value.score)

   // OPTIMIZATION: Pre-compute scores for Team A penalty takers
   const teamAPenaltyTakersWithScores = computed(() => {
      return teamAPenaltyTakers.value.map(player => ({
         ...player,
         score: getPlayerScore(player.playerID),
      }))
   })

   // Keep score properties for backward compatibility (extracted from above)
   const teamBGoalkeeperScore = computed(() => teamBGoalkeeper.value.score)

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

   // Clamp goalkeeper score between 5 and 7 (without rounding)
   const clampGoalkeeperScore = (score: number): number => {
      return Math.max(5, Math.min(7, score))
   }

   // Calculate penalty outcome
   const calculatePenalty = (
      playerScore: number,
      playerGoalsScored: number,
      goalkeeperScore: number,
      goalkeeperSaves: number
   ): { scored: boolean; newGoalkeeperSaves: number } => {
      
      // Rule 4: Clamp goalkeeper score between 5 and 7
      const clampedGKScore = clampGoalkeeperScore(goalkeeperScore)
      
      // Rule 2: If player has goalsScored > 0, it's a goal
      // UNLESS goalkeeper has savedPenalties >= playerGoalsScored
      // If denied, decrease savedPenalties by playerGoalsScored
      if (playerGoalsScored > 0) {
         if (goalkeeperSaves >= playerGoalsScored) {
            // Goalkeeper has enough savedPenalties to deny the goal
            // Decrease savedPenalties by playerGoalsScored
            return {
               scored: false,
               newGoalkeeperSaves: goalkeeperSaves - playerGoalsScored
            }
         } else {
            // Goalkeeper doesn't have enough to deny it - goal scored
            return {
               scored: true,
               newGoalkeeperSaves: goalkeeperSaves
            }
         }
      }
      
      // Rule 1: Check if penalty would be scored by score comparison (player score >= goalkeeper score)
      const wouldScoreByScore = playerScore >= clampedGKScore
      
      if (wouldScoreByScore) {
         // If penalty would score by score comparison AND goalkeeper has savedPenalties > 0
         // Then penalty is denied and savedPenalties decreases by 1
         if (goalkeeperSaves > 0) {
            return {
               scored: false,
               newGoalkeeperSaves: goalkeeperSaves - 1
            }
         }
         // Otherwise, penalty is scored
         return {
            scored: true,
            newGoalkeeperSaves: goalkeeperSaves
         }
      }
      
      // Penalty wouldn't score, so it's saved
      return {
         scored: false,
         newGoalkeeperSaves: goalkeeperSaves
      }
   }

   const teamAPenaltyTrack = computed(() => {
      const track: Array<'scored' | 'saved' | null> = new Array(10).fill(null)

      teamAPenaltyTakersWithScores.value.filter(pl => pl.score).forEach((player, index) => {
         if (penaltyTaken.value.has(player.playerID)) {
            const result = penaltyResults.value.get(player.playerID)

            if (result) {
               track[index] = result
            }
         } 
      })

      return track
   })

   const teamBPenaltyTrack = computed(() => {
      const track: Array<'scored' | 'saved' | null> = new Array(10).fill(null)

      teamBPenaltyTakersWithScores.value.filter(pl => pl.score).forEach((player, index) => {
         if (penaltyTaken.value.has(player.playerID)) {
            const result = penaltyResults.value.get(player.playerID)

            if (result) {
               track[index] = result
            }
         }
      })

      return track
   })

   const teamAPenaltiesTakenCount = computed(() => {
      return teamAPenaltyTakersWithScores.value.filter(player => 
         penaltyTaken.value.has(player.playerID)
      ).length
   })

   const teamBPenaltiesTakenCount = computed(() => {
      return teamBPenaltyTakersWithScores.value.filter(player => 
         penaltyTaken.value.has(player.playerID)
      ).length
   })

   // Shootout is over when both teams have taken the same number of penalties (end of a round)
   // and the scores are not equal (someone has won)
   const shootoutWinner = computed(() => {
      const takenA = teamAPenaltiesTakenCount.value
      const takenB = teamBPenaltiesTakenCount.value
      if (takenA < 5 || takenB < 5) return null
      if (takenA !== takenB) return null // mid-round, wait for other team
      if (teamAScore.value === teamBScore.value) return null
      return teamAScore.value > teamBScore.value ? 'A' : 'B'
   })

   const shootoutWinnerName = computed(() => {
      if (!shootoutWinner.value) return ''
      return shootoutWinner.value === 'A'
         ? (teamAData.value?.teamData.name ?? 'Squadra A')
         : (teamBData.value?.teamData.name ?? 'Squadra B')
   })

   // Show winner modal when shootout ends
   watch(shootoutWinner, (winner) => {
      if (winner) showWinnerModal.value = true
   })

   const closeWinnerModal = () => {
      showWinnerModal.value = false
   }

   // Watch for unlock condition and set flag once
   watch([teamAPenaltiesTakenCount, teamBPenaltiesTakenCount, teamAScore, teamBScore], () => {
      const bothTeamsHaveTakenFive = teamAPenaltiesTakenCount.value >= 5 && teamBPenaltiesTakenCount.value >= 5
      const scoresAreEven = teamAScore.value === teamBScore.value
      
      if (bothTeamsHaveTakenFive && scoresAreEven && !secondBatchUnlocked.value) {
         secondBatchUnlocked.value = true
      }
   }, { immediate: true })

   // Handle penalty kick button click
   const handlePenaltyKick = (player: any, playerTeam: 'A' | 'B') => {
      if (penaltyTaken.value.has(player.playerID)) {
         alert('Questo giocatore ha già tirato!')
         return
      }
      
      // Get actual team IDs, not 'A' or 'B'
      const playerTeamId = playerTeam === 'A' ? teamA.value : teamB.value
      const opponentGoalkeeperData = playerTeam === 'A' ? teamBGoalkeeper.value : teamAGoalkeeper.value
      const goalkeeper = opponentGoalkeeperData.goalkeeper
      const goalkeeperScoreData = opponentGoalkeeperData.score
      
      // Check if we have the essential data
      if (!goalkeeper) {
         alert('Portiere mancante per il calcolo del rigore')
         return
      }
      
      if (!goalkeeperScoreData) {
         alert('Dati del portiere mancanti. Assicurati che i voti siano stati caricati per questa giornata.')
         return
      }
      
      if (!player.score) {
         alert(`Dati mancanti per ${player.name}. Assicurati che i voti siano stati caricati per questa giornata.`)
         return
      }
      
      // Get score values - use 0 as default if not present
      const playerScore = typeof player.score.playerScore === 'number' ? player.score.playerScore : 0
      const playerGoalsScored = getTotalGoals(player.score)
      const goalkeeperScore = typeof goalkeeperScoreData.playerScore === 'number' ? goalkeeperScoreData.playerScore : 0
      const goalkeeperSaves = typeof goalkeeperScoreData.penaltiesSaved === 'number' ? goalkeeperScoreData.penaltiesSaved : 0
      
      // Validate that we have at least a player score or goals
      if (playerScore === 0 && playerGoalsScored === 0) {
         alert(`Il giocatore ${player.name} non ha voti. Assicurati che i voti siano stati caricati.`)
         return
      }
      
      if (goalkeeperScore === 0) {
         alert(`Il portiere ${goalkeeper.name} non ha un voto. Assicurati che i voti siano stati caricati.`)
         return
      }
      
      // Calculate penalty outcome
      const { scored, newGoalkeeperSaves } = calculatePenalty(
         playerScore,
         playerGoalsScored,
         goalkeeperScore,
         goalkeeperSaves
      )
      
      // Update modal state
      currentPenalty.value = {
         player,
         goalkeeper,
         playerTeam,
         result: scored ? 'scored' : 'saved'
      }
      
      showPenaltyModal.value = true
      
      // After animation (3 seconds), update scores
      setTimeout(() => {
         if (scored) {
            // Goal scored - increment team score
            if (playerTeam === 'A') {
               teamAScore.value++
               teamAPenaltiesScored.value++
            } else {
               teamBScore.value++
               teamBPenaltiesScored.value++
            }
         } else {
            // Penalty was saved - update goalkeeper's savedPenalties if it was decremented
            if (newGoalkeeperSaves !== goalkeeperSaves) {
               // Update goalkeeper saves in the source data
               if (currentTimeWindow.value?.playersScores) {
                  const gkPlayerID = goalkeeper.playerID
                  const gkScoreIndex = currentTimeWindow.value.playersScores.findIndex(
                     (score: any) => score.playerID === gkPlayerID
                  )
                  if (gkScoreIndex !== -1) {
                     currentTimeWindow.value.playersScores[gkScoreIndex].penaltiesSaved = newGoalkeeperSaves
                  }
               }
            }
         }
         
         // Mark player as having taken penalty and store result
         penaltyTaken.value.add(player.playerID)
         penaltyResults.value.set(player.playerID, scored ? 'scored' : 'saved')
         
         // Close modal
         showPenaltyModal.value = false
      }, 3000)
   }

   const closeModal = () => {
      showPenaltyModal.value = false
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
      align-items: center;
      flex-wrap: wrap;

      &--result {
         background-color: $darkOlive;
         border-radius: $radius-lg;
         padding: 0.25em 0.5em;
         color: white;
         white-space: nowrap;

         &--separator { color: $cream }
      }
   }

   .penaltiesTrack {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-end;
      flex-direction: column;
      background-color: rgb(71, 70, 70);
      border-radius: 12px;
      padding: 1em 2em;
      border: 2px solid $cream;

      &--penalty {
         width: 1rem;
         height: 1rem;
         display: inline-block;
         margin: auto 0.25em;
         color: $cream;

         &.disabled { opacity: 0.5; }
      }
   }

   .winner-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeIn 0.3s ease;
   }

   .winner-modal {
      background: $cream;
      border-radius: $radius-lg;
      padding: 2rem 3rem;
      max-width: 420px;
      width: 90%;
      text-align: center;
      animation: slideUp 0.4s ease;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);

      &--trophy {
         font-size: 3rem;
         margin-bottom: 0.5rem;
         animation: trophyPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both;
      }
      &--label {
         color: $eerieBlack;
         font-size: 1rem;
         margin-bottom: 0.25rem;
      }
      &--name {
         font-size: 1.5rem;
         font-weight: $font-weight-bold;
         color: $darkOlive;
         margin-bottom: 1.5rem;
         animation: nameReveal 0.5s ease 0.5s both;
      }
      &--close { margin-top: 0.5rem; }
   }

   @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
   }

   @keyframes slideUp {
      from { transform: translateY(40px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
   }

   @keyframes trophyPop {
      from {
         transform: scale(0);
         opacity: 0;
      }
      70% {
         transform: scale(1.15);
      }
      to {
         transform: scale(1);
         opacity: 1;
      }
   }

   @keyframes nameReveal {
      from {
         opacity: 0;
         transform: translateY(8px) scale(0.96);
      }
      to {
         opacity: 1;
         transform: translateY(0) scale(1);
      }
   }
</style>