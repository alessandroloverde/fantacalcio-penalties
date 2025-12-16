<template>
   <div>
     <!--  <LoggedUser /> -->
      <h1 class="withIcon--shirt-duo withIcon--color-blush mb-8">Elenco delle squadre con rigoristi</h1>
      <h2 v-if="err">Errore: {{ err }}</h2>
      <h2 v-if="loading">Loading...</h2>
      <div class="text-divider"></div>
      <div class="grid grid-cols-4 gap-4">
         <section v-for="item, index in teams" :key="index" class="card mb-2 p-4">
            <header>
               <nuxtLink :to="`/teams/${item.teamId}`">{{ item.teamData.name }}</nuxtLink>
            </header>
            <ol class="penaltyTakersList">
               <li class="my-2">
                  <h4>Portiere</h4>
               </li>
               <li v-if="criceto[item.teamId]?.goalkeeper" class="penaltyTaker">
                  <div class="penaltyTaker--role P">P</div>
                  <div class="penaltyTaker--name flex-3">{{ criceto[item.teamId]?.goalkeeper?.name }}</div>
                  <div class="penaltyTaker--squadra flex-1">{{ criceto[item.teamId]?.goalkeeper?.squadra }}</div>        
               </li>
               <li v-else>
                  <span>GK – </span><em>Non assegnato</em>
               </li>
               <div class="divider-text my-2">◎</div>
               <li class="my-2">
                  <h4>Rigoristi</h4>
               </li>
               <li v-for="penaltyTaker in criceto[item.teamId]?.penaltyTakers?.sort((a, b) => a.position - b.position)" class="flex mb-2">
                  <div class="penaltyTaker--role" :class="penaltyTaker.role">{{ penaltyTaker.role }}</div>
                  <div class="penaltyTaker--name flex-3">{{ penaltyTaker.name }}</div>
                  <div class="penaltyTaker--squadra flex-1">{{ penaltyTaker.squadra }}</div>        
               </li>
            </ol>
         </section>
      </div>

   </div>
</template>

<style lang="scss" scoped>
   @use '@/assets/scss/main' as *;

   .card > header {
      background-color: $darkOlive;
      border-top-left-radius: 15px;
      border-top-right-radius: 15px;
      margin: -1em;
      margin-bottom: 1em;
      padding: 0.75em;
      text-align: center;
      transition: background-color 500ms;

      &:hover { background-color: $blush }
      & > a {
         color: $cream;
         font-size: 20px;
         font-weight: 600;
         text-transform: uppercase;
         display: block;
         width: 100%;

         &:hover { opacity: inherit }
      }
   }
</style>

<script setup lang="ts">
import { getCollectionRest, getDocRest } from '../utils/firestoreRest'

const settings = ref<any>(null)
const err = ref(false)
const loading = ref(false)
const teams = ref<Array<{
  teamId: string,
  teamData: any
}>>([])
const criceto = ref<Record<string, { penaltyTakers: any[], goalkeeper: any | null }>>({})

onMounted(async () => {
   if (process.client) {
      loading.value = true
      
      // Use REST API instead of SDK (no WebSocket overhead)
      try {
         const [teamsResult, penaltiesResult] = await Promise.all([
            getCollectionRest("teams"),
            getCollectionRest("penalties")
         ])

         // Process penalties
         criceto.value = Object.fromEntries(
            penaltiesResult.map(doc => [doc.id, {
               penaltyTakers: doc.data.penaltyTakers || [],
               goalkeeper: doc.data.goalkeeper || null                
            }])
         )

         // Process teams
         teams.value = teamsResult.map(doc => ({
            teamId: doc.id,
            teamData: doc.data
         }))

      } catch (error: any) {
         err.value = error.message || 'Unknown error'
      }

      // Retrieve Settings
      try {         
         const settingsResult = await getDocRest('gameSettings', 'wUDv5Wr31ETbShASdx7u')
         settings.value = settingsResult?.data || 'No game settings found'
      } catch (error: any) {
         err.value = error.message || 'Unknown error'
      } finally {
         loading.value = false
      }
   }
})
</script>

