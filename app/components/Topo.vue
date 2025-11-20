<template>
   <section>
      <LoggedUser></LoggedUser>

      <h1>Mannagia al Castoro</h1>
      <!-- <h2>{{ settings?.season }}</h2> -->
      <h2 v-if="err">Errore: {{ err }}</h2>
      <h2 v-if="loading">Loading...</h2>
      <hr/>
      <h3>Elenco delle squadre con giocatori</h3>
      <section v-for="item, index in teamsWithPlayers" :key="index">
         <nuxtLink :to="`/teams/${item.teamId}`">{{ item.teamData.name }}</nuxtLink>
         <ol>
            <li v-for="player in item.players ">{{ player.name }}</li>
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
import { getApp } from 'firebase/app'
import { getFirestore, doc, getDoc, collection, getDocs } from 'firebase/firestore'

const { $firebaseApp } = useNuxtApp()

const settings = ref<any>(null)
const err = ref(false)
const loading = ref(false)
const teamsWithPlayers = ref<Array<{
  teamId: string,
  teamData: any,
  players: any[]
}>>([])


onMounted(async () => {
   // Only run Firebase code on client side
   if (process.client && $firebaseApp) {
      loading.value = true
      
      const db = getFirestore($firebaseApp)
      
      // *** Retrieve all teams ***
      try {
         const teamsSnapshot = await getDocs(collection(db, "teams"))

         // Process all teams in parallel
         const teamPromises = teamsSnapshot.docs.map(async (teamDoc) => {
            const teamData = teamDoc.data()
            
            if (teamData.players) {
               // Collect all player references first
               const playerRefs = Object.values(teamData.players) as any[]
               
               // Fetch all players in parallel using Promise.all
               const playerPromises = playerRefs.map(playerRef => 
                  getDoc(playerRef).then(playerDoc => {
                     if (playerDoc.exists()) {
                        return { 
                           id: playerDoc.id, 
                           ...(playerDoc.data() || {})
                        }
                     }
                     return null
                  })
               )
               
               const players = (await Promise.all(playerPromises)).filter(p => p !== null)
               
               return {
                  teamId: teamDoc.id,
                  teamData: teamData,
                  players: players
               }
            }
            return null
         })
         
         const results = await Promise.all(teamPromises)
         teamsWithPlayers.value = results.filter(t => t !== null) as any[]

      } catch (error: any) {
         err.value = error.message || 'Unknown error'
      }

      try {         
         const docRef = doc(db, 'gameSettings', 'wUDv5Wr31ETbShASdx7u') 
         const docSnap = await getDoc(docRef)

         if(docSnap.exists()) {
            settings.value = docSnap.data()
         } else {
            settings.value = 'No game settings found'
         }
      } catch (error: any) {
         err.value = error.message || 'Unknown error'
      } finally {
         loading.value = false
      }
   } else {
      console.log('🔥 Not running on client or Firebase app not available')
   }
})
</script>

