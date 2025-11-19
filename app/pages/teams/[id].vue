<template>
   <div class="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <LoggedUser></LoggedUser>

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

      <div class="flex flex-col lg:flex-row lg:items-start lg:gap-6">
         <div id="availablePlayers-list" class="w-full md:w-1/2 bg-red-300">
            <h2>Rosa</h2>
            <ol 
               id="players-list" 
               class="w-full md:w-1/2 drop-zone"
               @dragenter.prevent
               @dragover.prevent
               @drop="onDrop($event, 'List-1')" 
            >
               <li v-for="player in players.filter(item => item.list == 'List-1')" 
                  :key="player.name"
                  draggable="true"
                  @dragstart="startDrag($event, player)" 
                  class="player" 
                  :class="'role--' + player.role">
                     <span class="player--name">{{ player.name }}</span>
                     <span class="player--role">{{ player.role }}</span>
                     <span class="player--team">{{ player.squadra }}</span>
               </li>
            </ol>
         </div>

         <div id="penaltyTakers-list" class="w-full md:w-1/2 bg-red-200">
            <h2>Rigoristi</h2>
            <ol 
               id="players-list" 
               class="w-full md:w-1/2 drop-zone"
               @dragenter.prevent
               @dragover.prevent 
               @drop="onDrop($event, 'List-2')"
            >
               <li v-for="player in players.filter(item => item.list == 'List-2')" 
                  :key="player.name"
                  draggable="true"
                  @dragstart="startDrag($event, player)" 
                  class="player" 
                  :class="'role--' + player.role">
                     <span class="player--name">{{ player.name }}</span>
                     <span class="player--role">{{ player.role }}</span>
                     <span class="player--team">{{ player.squadra }}</span>
               </li>
            </ol>
         </div>
      </div>
      <input
         v-if="ownerParticipant && presidents.includes(ownerParticipant.name)"
         class="upload-input"
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

   let loading = ref<boolean>(true)
   const teamId = route.params.id as string
   const { participant: ownerParticipant, loading: participantLoading, error, fetchParticipant } = useLoggedUser()
   const teamData = ref<any>(null)
   const players = ref<{name: string, role: string, squadra: string, team: any, list?: string, internalID?: number}[]>([])
   const presidents = ref<string[]>([])
   const fileInput = ref<HTMLInputElement | null>(null)
   const roleOrder: Record<string, number> = { 'P': 1, 'D': 2, 'C': 3, 'A': 4 }


   function sortPlayersByRole(playersArray: {name: string, role: string, squadra: string, team: any, list?: string, internalID?: number}[] | null | undefined) {
      if (!playersArray) return [];
      return playersArray.sort((a, b) => (roleOrder[a.role] ?? 0) - (roleOrder[b.role] ?? 0));
   }


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
               team: doc(db, "teams", teamId),
               list: "List-1",
               internalID: players.value.length
            }
            
            // Add to players collection
            await setDoc(doc(db, "players", playerId), playerData)
            
            // Add reference to new players object
            const playerRef = doc(db, "players", playerId)
            newPlayers[playerId] = playerRef
            
            // Add to local display
            players.value.push(playerData as {name: string, role: string, squadra: string, team: any})
         }

         players.value = sortPlayersByRole(players.value)
         
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

   const startDrag = (event: DragEvent, item: any) => {
      if(!event.dataTransfer || item.internalID == null) return

      event.dataTransfer.dropEffect = "move"
      event.dataTransfer.effectAllowed = "move"
      event.dataTransfer.setData('itemID', String(item.internalID))
   }

   const onDrop = (event: DragEvent, list: string) => {
      if(!event.dataTransfer) return

      event.dataTransfer.dropEffect = "move"
      event.dataTransfer.effectAllowed = "move"

      const itemID = event.dataTransfer.getData('itemID')
      if(!itemID) return

      const selectedPlayer = players.value.find(item => item.internalID === Number(itemID))

      if(selectedPlayer) {
         selectedPlayer.list = list
      }
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


            let index = 0
            for (const playerKey in playersReference) {
               const singlePlayerReference = playersReference[playerKey]
               const singlePlayerDoc = await getDoc(singlePlayerReference)
               const singlePlayerData = singlePlayerDoc.data() as {name: string, role: string, squadra: string, team: any, list: string, internalID: number}

               singlePlayerData.list = "List-1"
               singlePlayerData.internalID = index
               index++

               players.value.push(singlePlayerData)
            }
            players.value = sortPlayersByRole(players.value) // *** Sorting ***


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
@use 'sass:color';


   h1 { 
      @include typography('h1');
      color: $navyBlue;
   }

   h1 + p { color: $blush }
   h4 { color: $color-text-dark }

   .upload-input {
      width: 100%;
      padding: $spacing-sm $spacing-md;
      border: 2px dashed $navyBlue;
      border-radius: $radius-lg;
      background-color: color.scale($cream, $lightness: 5%);
      color: $color-text-dark;
      transition: border-color $transition-fast ease, background-color $transition-fast ease;

      &:hover {
         border-color: $coral;
         background-color: color.scale($cream, $lightness: 10%);
      }

      &:focus-visible {
         outline: none;
         border-color: $blush;
         box-shadow: 0 0 0 3px color.scale($blush, $alpha: -30%);
      }
   }


   .drop-zone {
      min-height: 100px;
      border: 2px dashed $navyBlue;
      border-radius: $radius-lg;
      background-color: color.scale($cream, $lightness: 5%);
      color: $color-text-dark;
      transition: border-color $transition-fast ease, background-color $transition-fast ease;
   }

   #players-list {
      color:black;
      list-style-type: none;

      .player.role {
         &--P { background: linear-gradient(to right, $cream, color.change($navyBlue, $alpha: 0.4)) }
         &--D { background: linear-gradient(to right, $cream, color.change($blush, $alpha: 0.4)) }
         &--C { background: linear-gradient(to right, $cream, color.change($darkOlive, $alpha: 0.4)) }
         &--A { background: linear-gradient(to right, $cream, color.change($brownSugar, $alpha: 0.4)) }
      }

      .player {
         //width: 40%;
         background-color: $cream;
         border-radius: 1.2em;
         margin-bottom: 1rem;
         counter-increment: step-counter;
         display: flex;
         align-items: center;
         box-shadow: 0 1px 1px rgba(5,5,5, 0.5);
         cursor:move;

         & span { margin-right: 1em }
         &--name { width: 50%; }
         &--role { width: 15%; }
         &--team { width: 35%; }

         &::before {
              content: counter(step-counter);
              display: inline-block;
              background-color: $blush;
              color: white;
              border-radius: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
              width: 1.5em;
              height: 1.5em;
              font-size: 1.25rem;
              font-weight: $font-weight-medium;
              margin-right: 0.5em;
              padding: 1em;
         }
      }
   }

</style>
