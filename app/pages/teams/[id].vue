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
         <div id="availablePlayers-list" class="w-full bg-red-300">
            <h2>Rosa</h2>
            <ol 
               id="players-list" 
               class="w-full drop-zone"
               @dragenter.prevent
               @dragover.prevent
               @drop="onDrop($event, 'List-1')" 
            >
               <li v-for="player in players.filter(item => item.list == 'List-1')" 
                  :key="player.name"
                  draggable="true"
                  @dragstart="startDrag($event, player)" 
                  class="player" 
                  :class="'role--' + player.role"
               >
                  <span class="player--name">{{ player.name }}</span>
                  <span class="player--role">{{ player.role }}</span>
                  <span class="player--team">{{ player.squadra }}</span>
               </li>
            </ol>
         </div>

         <div id="penaltyTakers-list" class="w-full">
            <h2>Rigoristi</h2>
            <ol class="drop-zones-list">
               <li 
                  v-for="position in 10" 
                  :key="position"
                  class="drop-slot"
                  @dragenter.prevent
                  @dragover.prevent
                  @drop="onDrop($event, 'List-2', position)"
               >
                  <span class="slot-number">{{ position }}</span>
                  <div 
                     v-if="getPlayerAtPosition(position)"
                     draggable="true"
                     @dragstart="startDrag($event, getPlayerAtPosition(position))" 
                     class="player" 
                     :class="'role--' + getPlayerAtPosition(position)?.role"
                  >
                     <span class="player--name">{{ getPlayerAtPosition(position)?.name }}</span>
                     <span class="player--role">{{ getPlayerAtPosition(position)?.role }}</span>
                     <span class="player--team">{{ getPlayerAtPosition(position)?.squadra }}</span>
                  </div>
                  <div v-else class="empty-slot">Drop here</div>
               </li>
            </ol>
            <button class="
                     mt-4 w-full 
                     rounded-lg 
                     bg-blue-600 
                     hover:bg-blue-500 
                     px-5 py-3 
                     font-semibold uppercase 
                     tracking-wide 
                     text-white 
                     shadow-sm 
                     transition 
                     disabled:cursor-not-allowed 
                     disabled:bg-slate-500"
                     @click="savePenaltyTakers"
            >Save to DB</button>
         </div>
      </div>
      <input
         v-if="loggedUser && presidents.includes(loggedUser.name)"
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
   import { getFirestore, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
   import { useRoute } from 'vue-router';
   import Papa from 'papaparse';
   import { useAuthStore } from '../../stores/auth';
   import { usePenaltiesStore } from '../../stores/penalties'

   const route = useRoute()
   const { $firebaseApp } = useNuxtApp()

   // Use Pinia stores
   const authStore = useAuthStore()
   const loggedUser = computed(() => authStore.participant)
   const penaltiesStore = usePenaltiesStore()

   let loading = ref<boolean>(true)
   const teamId = route.params.id as string
   const teamData = ref<any>(null)
   const players = ref<{name: string, role: string, squadra: string, team: any, list?: string, internalID?: number, position?: number | null}[]>([])
   const presidents = ref<string[]>([])
   const fileInput = ref<HTMLInputElement | null>(null)
   const roleOrder: Record<string, number> = { 'P': 1, 'D': 2, 'C': 3, 'A': 4 }


   function sortPlayersByRole(playersArray: {name: string, role: string, squadra: string, team: any, list?: string, internalID?: number, position?: number | null}[] | null | undefined) {
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
               internalID: players.value.length,
               position: null
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

   async function savePenaltyTakers() {
      const db = getFirestore($firebaseApp)
      const penaltiesColl = doc(db, "penalties", teamId)

      const penaltyTakers = players.value.filter(player => player.list === 'List-2')

      if(penaltyTakers.length <10) {
         alert("completa i rigoristi")
      } else {
         await updateDoc(penaltiesColl, {
            penaltyTakers: penaltyTakers
         })
      }


   }

   const startDrag = (event: DragEvent, item: any) => {
      if(!event.dataTransfer || item.internalID == null) return

      event.dataTransfer.dropEffect = "move"
      event.dataTransfer.effectAllowed = "move"
      event.dataTransfer.setData('itemID', String(item.internalID))
   }

   const getPlayerAtPosition = (position: number) => {
      return players.value.find(player => player.list === 'List-2' && player.position === position)
   }

   const onDrop = (event: DragEvent, list: string, position?: number) => {
      if(!event.dataTransfer) return

      event.preventDefault()
      event.dataTransfer.dropEffect = "move"
      event.dataTransfer.effectAllowed = "move"

      const itemID = event.dataTransfer.getData('itemID')
      if(!itemID) return

      const selectedPlayer = players.value.find(item => item.internalID === Number(itemID))

      if(selectedPlayer) {
         // If dropping in List-2 with a position
         if(list === 'List-2' && position !== undefined) {
            // If there's already a player at this position, swap or move them
            const existingPlayer = getPlayerAtPosition(position)

            if(existingPlayer && existingPlayer.internalID !== selectedPlayer.internalID) {
               // Move existing player back to List-1
               existingPlayer.list = 'List-1'
               existingPlayer.position = null
            }
            // Assign the dropped player to this position
            selectedPlayer.list = 'List-2'
            selectedPlayer.position = position
         } else if(list === 'List-1') {
            // When moving to List-1, clear position
            selectedPlayer.list = 'List-1'
            selectedPlayer.position = null
         }
      }
   }

   onMounted(async () => {
      if (process.client && $firebaseApp) {
         const db = getFirestore($firebaseApp)
         
         // Fetch penalties if not already loaded
         const penaltiesRef = doc(db, "penalties", teamId)
         const penaltiesSnap = await getDoc(penaltiesRef)
         const savedPenaltyTakers = penaltiesSnap.exists() ? penaltiesSnap.data()?.penaltyTakers || [] : []

         const teamRef = doc(db, "teams", teamId)
         const teamSnap = await getDoc(teamRef)

         if(teamSnap.exists()) {
            teamData.value = teamSnap.data()

            loading.value = false

            const playersReference = teamData.value.players
            const presidentReference = teamData.value.president

            // Get saved penalty takers for this team
            //const savedPenaltyTakers = penaltiesStore.penalties[teamId] || []

            // Fetch all players in parallel
            const playerPromises = Object.keys(playersReference).map(playerKey => 
               getDoc(playersReference[playerKey])
            )
            const playerDocs = await Promise.all(playerPromises)

            let index = 0
            for (const singlePlayerDoc of playerDocs) {
               const singlePlayerData = singlePlayerDoc.data() as {name: string, role: string, squadra: string, team: any, list: string, internalID: number, position: number | null}

               // Check if this player is in saved penalty takers
               const savedPenaltyTaker = savedPenaltyTakers.find((pt: any) => pt.name === singlePlayerData.name)
               
               if (savedPenaltyTaker) {
                  singlePlayerData.list = "List-2"
                  singlePlayerData.position = savedPenaltyTaker.position
               } else {
                  singlePlayerData.list = "List-1"
                  singlePlayerData.position = null
               }
               
               singlePlayerData.internalID = index
               index++

               players.value.push(singlePlayerData)
            }
            players.value = sortPlayersByRole(players.value) // *** Sorting ***

            // Fetch all presidents in parallel
            const presidentPromises = Object.keys(presidentReference).map(president =>
               getDoc(presidentReference[president])
            )
            const presidentDocs = await Promise.all(presidentPromises)

            for (const singlePresidentDoc of presidentDocs) {
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

.drop-zones-list {
   list-style-type: none;
   padding: 0;
   margin: 0;
   display: flex;
   flex-direction: column;
   gap: 0.75rem;
}

.drop-slot {
   min-height: 60px;
   border: 2px dashed $navyBlue;
   border-radius: $radius-md;
   background-color: color.scale($cream, $lightness: 3%);
   padding: 0.5rem;
   display: flex;
   align-items: center;
   gap: 0.75rem;
   transition: border-color $transition-fast ease, background-color $transition-fast ease;

   &:hover {
      border-color: $coral;
      background-color: color.scale($cream, $lightness: 8%);
   }

   .slot-number {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 2em;
      height: 2em;
      background-color: $navyBlue;
      color: white;
      border-radius: 50%;
      font-weight: $font-weight-bold;
      font-size: 1rem;
      flex-shrink: 0;
   }

   .empty-slot {
      flex: 1;
      color: $color-text-muted;
      font-style: italic;
      text-align: center;
      padding: 0.5rem;
   }

   .player {
      flex: 1;
      margin-bottom: 0;
   }
}

/*    #players-list {
   color:black;
   list-style-type: none; */

   .player.role {
      &--P { background: linear-gradient(to right, $cream, color.change($navyBlue, $alpha: 0.4)) }
      &--D { background: linear-gradient(to right, $cream, color.change($blush, $alpha: 0.4)) }
      &--C { background: linear-gradient(to right, $cream, color.change($darkOlive, $alpha: 0.4)) }
      &--A { background: linear-gradient(to right, $cream, color.change($brownSugar, $alpha: 0.4)) }
   }

   .player {
      height: 40px;
      color:$eerieBlack;
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
   #penaltyTakers-list .player {
      padding: 1em;
       
      &::before { content: none }
   }
   
</style>
