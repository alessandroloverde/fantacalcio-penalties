<template>
   <LoggedUser></LoggedUser>
   <div class="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <nuxtLink to="/">Back to Home</nuxtLink>
      <h1>{{ teamData?.name }}</h1>
      <p v-if="presidents.length === 1">
         <span>Presidente: </span> {{ presidents[0] }}
      </p>
      <p v-else>
         <span>Presidenti:</span> {{ presidents.join(' | ') }}
      </p>
      <hr class="divider my-4" />
      <div v-if="loading">Loading...</div>
      <ol id="players-list">
         <li v-for="player in players" :key="player.name">
            <span>Nome: </span>{{ player.name }}
            <span>Ruolo: </span>{{ player.role }}
            <span>Squadra: </span>{{ player.squadra }}
         </li>
      </ol>
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
   import { getFirestore, doc, getDoc, collection, getDocs, setDoc, updateDoc } from 'firebase/firestore';
   import { useRoute } from 'vue-router';
   import Papa from 'papaparse';

   const route = useRoute()
   const { $firebaseApp } = useNuxtApp()

   const teamId = route.params.id as string

   const { participant: ownerParticipant, loading: participantLoading, error, fetchParticipant } = useLoggedUser()

   const teamData = ref<any>(null)
   const players = ref<{name: string, role: string, squadra: string, team: any}[]>([])
   const presidents = ref<string[]>([])
   let loading = ref<boolean>(true)
   const fileInput = ref<HTMLInputElement | null>(null)


   function toPascalCase(string: string): string {
      return string
               .split(' ')
               .map(
                  word => {
                     const cleaned = word.replace(/[^a-zA-Z]/g, '')
                     return cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase()
               })
               .filter(word => word) // Remove empty strings
               .join('')
   }

   async function handleFileUpload(event: Event) {
      const target = event.target as HTMLInputElement
      const file = target.files?.[0]

      if(!file) return

      Papa.parse(file, {
         complete: async (results) => {
         players.value = [] // clear existing players

         // Skip rows 0-2, process rows 3-27 (A3:C27)
         const rows = results.data.slice(2, 27) as string[][]   
         const db = getFirestore($firebaseApp)
         
         // Build new players object to replace existing one
         const newPlayers: Record<string, any> = {}
         
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
            
            // Add reference to new players object
            const playerRef = doc(db, "players", playerId)
            newPlayers[playerId] = playerRef
            
            // Add to local display
            players.value.push(playerData as {name: string, role: string, squadra: string, team: any})
         }
         
         // Replace entire players field
         const teamRef = doc(db, "teams", teamId)
         await updateDoc(teamRef, {
            players: newPlayers
         })
         
         // Update local teamData
         teamData.value.players = newPlayers
         
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
            const presidentReference = teamData.value.president


            for (const playerKey in playersReference) {
               const singlePlayerReference = playersReference[playerKey]
               const singlePlayerDoc = await getDoc(singlePlayerReference)
               const singlePlayerData = singlePlayerDoc.data() as {name: string, role: string, squadra: string, team: any}

               players.value.push(singlePlayerData)
            }

            for (const president in presidentReference) {
               const singlePresidentReference = presidentReference[president]
               const singlePresidentDoc = await getDoc(singlePresidentReference)
               const singlePresidentData = singlePresidentDoc.data() as {name: string}

               presidents.value.push(singlePresidentData.name)
            }
            
         }
      }
   })

</script>

<style lang="scss">
@use '@/assets/scss//main' as *;

   h1 { 
      @include typography('h1');
      color: $navyBlue;
   }

   h1 + p { color: $blush }
   h4 { color: $color-text-dark}

   #players-list {
      color:black;
      list-style-type: none;

      li {
         margin-bottom: 1rem;
         counter-increment: step-counter;
         display: flex;

         & span { margin-right: 1em;}

         &::before {
              content: counter(step-counter);
              display: inline-block;
              background-color: brown;
              color: white;
              border-radius: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
              width: 2em;
              height: 2em;
              font-size: 1.5rem;
         }
      }
   }
</style>