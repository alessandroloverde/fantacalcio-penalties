<template>
   <div>
      <nuxtLink to="/">Back to Home</nuxtLink>
      <h1>{{ teamData?.name }}</h1>
      <hr></hr>
      <div v-if="loading">Loading...</div>
      <ol id="players-list">
         <li v-for="player in players" :key="player.name">
            <span>Nome: </span>{{ player.name }}<br>
            <span>Ruolo: </span>{{ player.role }}<br>
            <span>Squadra: </span>{{ player.squadra }}
         </li>
      </ol>
      <hr></hr>
      <input
         type="file"
         accept=".csv"
         ref="fileInput"
         @change="handleFileUpload"
      >
      </input>
   </div>
</template>

<script setup lang="ts">
   import { getFirestore, doc, getDoc, collection, getDocs, setDoc } from 'firebase/firestore';
   import { useRoute } from 'vue-router';
   import Papa from 'papaparse';

   const route = useRoute()
   const { $firebaseApp } = useNuxtApp()

   const teamId = route.params.id as string

   const teamData = ref<any>(null)
   const players = ref<{name: string, role: string, squadra: string, team: any}[]>([])
   let loading = ref<boolean>(true)
   const fileInput = ref<HTMLInputElement | null>(null)


   function toPascalCase(string: string): string {
      string.split(' ').map(word => word.charAt(0).toUpperCase + word.slice(1).toLowerCase()).join('')
      return string
   }

   async function handleFileUpload(event: Event) {
      const target =event.target as HTMLInputElement
      const file = target.files?.[0]

      if(!file) return

      Papa.parse(file, {
         complete: async (results) => {
         // Skip rows 0-2, process rows 3-27 (A3:C27)
         const rows = results.data.slice(2, 26) as string[][]
         
         const db = getFirestore($firebaseApp)
         
         for (const row of rows) {
            const [role, name, squadra] = row
            
            if (!name) continue // Skip empty rows
            
            // Generate player ID
            const playerPascalCase = toPascalCase(name)
            const playerId = `id-${playerPascalCase}`
            
            // Create player document
            const playerData = {
               name,
               role,
               squadra,
               team: doc(db, "teams", teamId)
            }
            
            // Add to players collection
            await setDoc(doc(db, "players", playerId), playerData)
            
            // Add reference to team's players
            const teamRef = doc(db, "teams", teamId)
            const playerRef = doc(db, "players", playerId)
            
            // Update team's players field
            await setDoc(teamRef, {
               players: {
                  ...teamData.value.players,
                  [playerId]: playerRef
               }
            }, { merge: true })
            
            // Add to local display
            players.value.push(playerData as {name: string, role: string, squadra: string, team: any})
         }
         
         alert('Players imported successfully!')
         if (fileInput.value) fileInput.value.value = '' // Reset input
      },
      error: (error) => {
         console.error('Error parsing CSV:', error)
         alert('Error parsing CSV file')
      }  
      })

   }

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