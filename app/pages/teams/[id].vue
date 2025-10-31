<template>
   <div>
      <nuxtLink to="/">Back to Home</nuxtLink>
      <h1>{{ teamData?.name }}</h1>
      <div v-if="loading">Loading...</div>
      <ol id="players-list">
         <li v-for="player in players" :key="player.name">
            <span>Nome: </span>{{ player.name }}<br>
            <span>Ruolo: </span>{{ player.role }}<br>
            <span>Squadra: </span>{{ player.squadra }}
         </li>
      </ol>
   </div>
</template>

<script setup lang="ts">
   import { getFirestore, doc, getDoc, collection, getDocs } from 'firebase/firestore';
   import { useRoute } from 'vue-router';

   const route = useRoute()
   const { $firebaseApp } = useNuxtApp()

   const teamId = route.params.id as string

   const teamData = ref<any>(null)
   const players = ref<{name: string, role: string, squadra: string, team: any}[]>([])
   let loading = ref<boolean>(true)

   onMounted(async () => {
      if (process.client && $firebaseApp) {
         const db = getFirestore($firebaseApp)

         const teamRef = doc(db, "teams", teamId)
         const teamSnap = await getDoc(teamRef)

         if(teamSnap.exists()) {
            teamData.value = teamSnap.data()

            loading.value = false

            const playersReference = teamData.value.players

            for (const playerKey in playersReference) {
               const singlePlayerReference = playersReference[playerKey]
               const singlePlayerDoc = await getDoc(singlePlayerReference)
               const singlePlayerData = singlePlayerDoc.data() as {name: string, role: string, squadra: string, team: any}

               players.value.push(singlePlayerData)
            }

            
         }
      }
   })

</script>

<style lang="scss">
   h1 {
      color:aquamarine
   }

   a:link {
      color: yellow;
   }
   a:visited {
      color: yellowgreen;
   }
   #players-list {
      color: rgb(248, 212, 212);

      li {
         margin-bottom: 1rem;
      }
   }
</style>