<template>
   <section>
      <LoggedUser></LoggedUser>

      <h1>Mannagia al Castoro</h1>
      <!-- <h2>{{ settings?.season }}</h2> -->
      <h2 v-if="err">Errore: {{ err }}</h2>
      <h2 v-if="loading">Loading...</h2>
      <hr/>
      <h3>Elenco delle squadre con giocatori</h3>
      <section v-for="item, index in teams" :key="index">
         <nuxtLink :to="`/teams/${item.teamId}`">{{ item.teamData.name }}</nuxtLink>
         <ol>
            <li v-if="criceto[item.teamId]?.goalkeeper">
               <span>GK – </span>{{ criceto[item.teamId]?.goalkeeper?.name }}
            </li>
            <li v-else>
               <span>GK – </span><em>Non assegnato</em>
            </li>
            <li v-for="penaltyTaker in criceto[item.teamId]?.penaltyTakers?.sort((a, b) => a.position - b.position)">
               <span>{{ penaltyTaker.position }} – </span>{{ penaltyTaker.name }}
            </li>
         </ol>
      </section>
   </section>
</template>

<style scoped>
   h1, h2 {
      color: #faebd7;
   }
   section {
      background-color: rgb(95, 118, 163);
   }
   ol { list-style:decimal;}
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

