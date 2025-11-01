<template>
   <section>
      <h1>Mannagia al Castoro</h1>
      <!-- <h2>{{ settings?.season }}</h2> -->
      <h2 v-if="err">Errore: {{ err }}</h2>
      <h2 v-if="loading">Loading...</h2>
      <hr/>
      <ol>
         <h3>Elenco delle squadre con giocatori</h3>
         <li v-for="item, index in teamsWithPlayers" :key="index">
            <nuxtLink :to="`/teams/${item.teamId}`">{{ item.teamData.name }}</nuxtLink>
            <ol>
               <li v-for="player in item.players" :key="player.id">{{ player.name }}</li>
            </ol>
         </li>

      </ol>
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
const myTeams = ref<any>(null)
const err = ref(false)
const loading = ref(false)
const allCollections = ref<Record<string, any[]>>({})
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
      
      const playerRef = doc(db, "players", "id-Leao");
      const playerSnap = await getDoc(playerRef);
      const playerData = playerSnap.data();
      const teamSnap = await getDoc((playerData as any).team)

      // *** Retrieve all teams ***
      try {
         const teamsSnapshot = await getDocs(collection(db, "teams"))

         for (const teamDoc of teamsSnapshot.docs) {
            const teamData = teamDoc.data()
            
            if (teamData.players) {
               const players = []
               
               // Loop through the players object (player1, player2, etc.)
               for (const playerKey in teamData.players) {
                  const playerRef = teamData.players[playerKey] // This is a document reference
                  const playerDoc = await getDoc(playerRef) // Use the reference directly
                  
                  if (playerDoc.exists()) {
                     players.push({ 
                       id: playerDoc.id, 
                       ...(playerDoc.data() || {})
                     })
                  }
               }
               
               teamsWithPlayers.value.push({
                  teamId: teamDoc.id,
                  teamData: teamData,
                  players: players
               })
            }
         }

      } catch (error: any) {

      } finally {
         loading.value = false
      }


      try {         
         const docRef = doc(db, 'gameSettings', 'wUDv5Wr31ETbShASdx7u') 
         const docSnap = await getDoc(docRef)

         if(docSnap.exists()) {
            settings.value = docSnap.data()
         } else {
            settings.value = 'No game settings found'
         }




/*          const collectionNames = ['gameSettings', 'participants', 'teams', 'players']

         for (const collectionName of collectionNames) {
            try {
               const collectionRef = collection(db, collectionName)
               const snapshot = await getDocs(collectionRef)

               allCollections.value[collectionName] = snapshot.docs.map(doc => ({
                  name: collectionName,
                  id: doc.id,
                  ...doc.data() 
               }))

               console.log(`🔥 Retrieved ${collectionName}:`, allCollections.value[collectionName])
            } catch (error) {
               console.error(`🔥 Error retrieving collection ${collectionName}:`, error)

               allCollections.value[collectionName] = []
            }
         } */


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

