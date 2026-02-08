<template>
   <AppNav />

   <div class="container boxed h-full max-w-7xl mx-auto my-12 px-4 sm:px-6 lg:px-8 py-8">
      <!-- <LoggedUser></LoggedUser> -->
      <h1 class="withIcon--gamepad withIcon--color-blush flex items-center mb-8">
         {{ teamData?.name }}
         <span class="presidents" v-if="presidents.length === 1"><span class="presidents--label">Presidente:</span> {{ presidents[0] }} </span>
         <span class="presidents" v-else><span class="presidents--label">Presidenti:</span> {{ presidents.join(' | ') }}</span>
      </h1>
      <div v-if="loading">Loading...</div>
      <section class="card flex justify-between mb-8 p-4">
         <button class="btn btn--secondary withIcon--refresh btn--icon-left cursor-pointer" @click="resetPenaltyTakers">Reset Players</button>
         <label class="btn btn--secondary withIcon--cloudUpload btn--icon-left cursor-pointer">
            <input 
               type="file"
               accept=".csv"
               ref="fileInput"
               class="hidden"
               @change="handleFileUpload"
            />Carica giocatori
         </label>
         <button class="btn btn--primary withIcon--diskette btn--icon-left cursor-pointer" @click="savePenaltyTakers">Save to DB</button>
      </section>

      <div class="flex flex-col lg:flex-row lg:items-start lg:gap-6">
         <div id="availablePlayers-list" class="w-full">
            <h3 class="mb-2">Rosa</h3>
            <ol 
               id="players-list" 
               class="w-full drop-zone"
               @dragenter.prevent
               @dragover.prevent
               @drop="onDrop($event, 'List-1')" 
            >
               <li v-for="player in players.filter(item => item.list == 'List-1')" 
                  :key="player.playerID"
                  draggable="true"
                  @dragstart="startDrag($event, player)"
                  @dragend="onDragEnd"
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
            <h3 class="mb-2">Portiere</h3>
            <ol class="drop-zones-list mb-6">
               <li 
                  v-for="position in getGoalkeeperSlotsCount()" 
                  :key="position"
                  class="drop-slot"
                  @dragenter.prevent
                  @dragover.prevent
                  @drop="onDropGoalkeeper($event, position)"
               >
                  <span class="slot-number">P{{ position }}</span>
                  <div 
                     v-if="getGoalkeeperAtPosition(position)"
                     draggable="true"
                     @dragstart="startDrag($event, getGoalkeeperAtPosition(position))"
                     @dragend="onDragEnd"
                     class="player role--P"
                  >
                     <span class="player--name">{{ getGoalkeeperAtPosition(position)?.name }}</span>
                     <span class="player--role">{{ getGoalkeeperAtPosition(position)?.role }}</span>
                     <span class="player--team">{{ getGoalkeeperAtPosition(position)?.squadra }}</span>
                  </div>
                  <div v-else class="empty-slot">Drop goalkeeper here (role P only)</div>
               </li>
            </ol>

            <h3 class="mb-2 my-6">Rigoristi</h3>
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
                     @dragend="onDragEnd"
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
         </div>
      </div>
   </div>
</template>

<script setup lang="ts">
   import { getFirestore, doc, setDoc, updateDoc } from 'firebase/firestore';
   import { useRoute } from 'vue-router';
   import Papa from 'papaparse';
   import { useAuthStore } from '../../stores/auth';
   import { getDocRest, getDocsRest } from '../../utils/firestoreRest';

   const route = useRoute()
   const { $firebaseApp } = useNuxtApp()

   // Use Pinia stores
   const authStore = useAuthStore()
   const loggedUser = computed(() => authStore.participant)

   let loading = ref<boolean>(true)
   const teamId = route.params.id as string
   const teamData = ref<any>(null)

   const goalkeepers = ref<Array<{
      playerID: string,
      name: string, 
      role: string, 
      squadra: string, 
      team: any, 
      list?: string, 
      position?: number | null
   } | null>>([])
   const players = ref<{
      playerID: string,
      name: string, 
      role: string, 
      squadra: string, 
      team: any, 
      list?: string, 
      position?: number | null
   }[]>([])
   const presidents = ref<string[]>([])
   const fileInput = ref<HTMLInputElement | null>(null)
   const roleOrder: Record<string, number> = { 'P': 1, 'D': 2, 'C': 3, 'A': 4 }

   function sortPlayersByRole(playersArray: {playerID: string, name: string, role: string, squadra: string, team: any, list?: string, position?: number | null}[] | null | undefined) {
      if (!playersArray) return [];
      return playersArray.sort((a, b) => (roleOrder[a.role] ?? 0) - (roleOrder[b.role] ?? 0));
   }

   async function handleFileUpload(event: Event) {
      const target = event.target as HTMLInputElement
      const file = target.files?.[0]

      if(!file) return

      Papa.parse(file, {
         complete: async (results) => {
         players.value = [] // clear existing players

         const db = getFirestore($firebaseApp)

         const csvTeamId = (results.data[0] as string[])[1]?.trim()

         if(csvTeamId !== teamId) {
            alert(`Team ID mismatch: ${csvTeamId} !== ${teamId}`)
            return
         }

         // Skip rows 0-2, process rows 3-27 (A3:C27)
         const rows = results.data.slice(2, 27) as string[][]

         // Build new players object to replace existing one
         const newPlayers: Record<string, any> = {}
         
         for (const row of rows) {
            const [role, name, squadra, , playerID] = row
            
            // Skip empty rows
            if (!name || !playerID || !role || !squadra) continue

            const trimmedPlayerID = playerID.trim()
            
            // Create player document
            const playerData = {
               playerID: trimmedPlayerID,  // Store as field too
               name: name.trim(),
               role: role.trim(),
               squadra: squadra.trim(),
               team: doc(db, "teams", teamId),
            }
            
            // Use playerID from CSV as document ID
            await setDoc(doc(db, "players", trimmedPlayerID), playerData)
            
            // Add reference to new players object
            const playerRef = doc(db, "players", trimmedPlayerID)
            newPlayers[trimmedPlayerID] = playerRef
            
            // Add to local display
            players.value.push({
               ...playerData,
               list: "List-1",
               position: null
            })
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
      const penaltiesDoc = doc(db, "penalties", teamId)

      const penaltyTakers = players.value
         .filter(player => player.list === 'List-2')
         .map(player => ({
            playerID: player.playerID,
            name: player.name,
            role: player.role,
            squadra: player.squadra,
            position: player.position
         }))
      
      // Prepare goalkeepers data (all goalkeepers with positions)
      const goalkeepersData = goalkeepers.value
         .filter(gk => gk !== null)
         .map(gk => ({
            playerID: gk!.playerID,
            name: gk!.name,
            role: gk!.role,
            squadra: gk!.squadra,
            position: gk!.position
         }))

      try {
         if(penaltyTakers.length < 10) {
            alert("Completa i rigoristi (10 giocatori)")
         } else if(goalkeepersData.length === 0) {
            alert("Seleziona almeno un portiere!")
         } else {
            // setDoc creates if doesn't exist, merge: true preserves other fields
            await setDoc(penaltiesDoc, {
               penaltyTakers: penaltyTakers,
               goalkeepers: goalkeepersData,
               goalkeeper: goalkeepersData[0] // Keep for backward compatibility
            }, { merge: true })
            
            alert('Rigoristi e portieri salvati!')
         }
      } catch(error) {
         alert(error)
      }


   }

   async function resetPenaltyTakers() {
      if (!confirm('Sei sicuro di voler resettare tutti i rigoristi e portieri?')) {
         return
      }

      // Reset all penalty takers: move them from List-2 back to List-1
      players.value.forEach(player => {
         if (player.list === 'List-2') {
            player.list = 'List-1'
            player.position = null
         }
      })

      // Reset all goalkeepers: move them back to List-1 and clear goalkeepers array
      goalkeepers.value.forEach(gk => {
         if (gk) {
            gk.list = 'List-1'
            gk.position = null
         }
      })
      goalkeepers.value = []

      // Clear from Firestore
      const db = getFirestore($firebaseApp)
      const penaltiesDoc = doc(db, "penalties", teamId)
      
      try {
         await setDoc(penaltiesDoc, {
            penaltyTakers: [],
            goalkeepers: [],
            goalkeeper: null
         }, { merge: true })
         
         alert('Rigoristi e portieri resettati!')
      } catch(error) {
         alert('Errore durante il reset: ' + error)
      }
   }

   const startDrag = (event: DragEvent, item: any) => {
      if(!event.dataTransfer || !item.playerID) return

      event.dataTransfer.dropEffect = "move"
      event.dataTransfer.effectAllowed = "move"
      event.dataTransfer.setData('playerID', item.playerID)
      document.body.style.cursor = 'move'
   }

   const onDragEnd = () => {
      document.body.style.cursor = ''
   }

   const getPlayerAtPosition = (position: number) => {
      return players.value.find(player => player.list === 'List-2' && player.position === position)
   }

   const getGoalkeeperSlotsCount = () => {
      // Count how many goalkeepers (P role) are available, or use a fixed number
      const availableGKs = players.value.filter(p => p.role === 'P').length
      return availableGKs // At least 3 slots, or more if there are more GKs
   }

   const getGoalkeeperAtPosition = (position: number) => {
      return goalkeepers.value[position - 1] || null
   }

   const onDrop = (event: DragEvent, list: string, position?: number) => {
      if(!event.dataTransfer) return

      event.preventDefault()
      event.dataTransfer.dropEffect = "move"
      event.dataTransfer.effectAllowed = "move"

      const playerID = event.dataTransfer.getData('playerID')
      if(!playerID) return

      const selectedPlayer = players.value.find(item => item.playerID === playerID)

      if(selectedPlayer) {
         // Remove player from goalkeepers if it's a goalkeeper
         if (selectedPlayer.list === 'Goalkeeper') {
            const gkIndex = goalkeepers.value.findIndex(gk => gk?.playerID === selectedPlayer.playerID)
            if (gkIndex !== -1) {
               goalkeepers.value[gkIndex] = null
            }
         }
         
         if(list === 'List-2' && position !== undefined) {
            const existingPlayer = getPlayerAtPosition(position)

            if(existingPlayer && existingPlayer.playerID !== selectedPlayer.playerID) {
               existingPlayer.list = 'List-1'
               existingPlayer.position = null
            }

            selectedPlayer.list = 'List-2'
            selectedPlayer.position = position
         } else if(list === 'List-1') {
            selectedPlayer.list = 'List-1'
            selectedPlayer.position = null
         }
      }
   }


   const onDropGoalkeeper = (event: DragEvent, position: number) => {
      if(!event.dataTransfer) return

      event.preventDefault()
      const playerID = event.dataTransfer.getData('playerID')
      if(!playerID) return

      const selectedPlayer = players.value.find(item => item.playerID === playerID)

      if(!selectedPlayer) return

      if(selectedPlayer.role !== 'P') {
         alert('Solo i portieri (P) possono essere assegnati a questo slot!')
         return
      }

      // Remove player from any other goalkeeper position
      const existingGKIndex = goalkeepers.value.findIndex(gk => gk?.playerID === selectedPlayer.playerID)
      if (existingGKIndex !== -1) {
         const oldGK = goalkeepers.value[existingGKIndex]
         if (oldGK) {
            oldGK.list = 'List-1'
            oldGK.position = null
         }
         goalkeepers.value[existingGKIndex] = null
      }

      // Remove player from penalty takers if it's there
      const penaltyTakerIndex = players.value.findIndex(p => p.playerID === selectedPlayer.playerID && p.list === 'List-2')
      if (penaltyTakerIndex !== -1 && players.value[penaltyTakerIndex]) {
         players.value[penaltyTakerIndex].list = 'List-1'
         players.value[penaltyTakerIndex].position = null
      }

      // Remove player from current position if there's already a goalkeeper there
      const currentIndex = position - 1
      if (goalkeepers.value[currentIndex]) {
         const currentGK = goalkeepers.value[currentIndex]
         if (currentGK) {
            currentGK.list = 'List-1'
            currentGK.position = null
         }
      }

      // Ensure array is large enough
      while (goalkeepers.value.length < position) {
         goalkeepers.value.push(null)
      }

      // Set the player as goalkeeper at this position
      selectedPlayer.list = 'Goalkeeper'
      selectedPlayer.position = position
      goalkeepers.value[currentIndex] = selectedPlayer
   }

   // Middleware
   definePageMeta({
      middleware: 'team-auth'
   })

   onMounted(async () => {
      if (process.client) {
         // Defensive check: only process if we're actually on a /teams/:id route
         if (!route.path.startsWith('/teams/')) {
            loading.value = false
            return
         }
         
         // Use REST API instead of SDK (no WebSocket overhead)
         const [penaltiesResult, teamResult] = await Promise.all([
            getDocRest("penalties", teamId),
            getDocRest("teams", teamId)
         ])
         
         // If team document doesn't exist, this is not a valid team route
         if (!teamResult) {
            loading.value = false
            return
         }
         
         const savedPenaltyTakers = penaltiesResult?.data?.penaltyTakers || []
         const savedGoalkeeper = penaltiesResult?.data?.goalkeeper || null
         const savedGoalkeepers = penaltiesResult?.data?.goalkeepers || []

         // teamResult is guaranteed to exist here due to the check above
         teamData.value = teamResult.data

         // Get player IDs from team document (keys of the players map)
         const playerIds = Object.keys(teamResult.data.players || {})
         const presidentField = teamResult.data.president || {}
         
         // Extract president IDs from values (values contain the actual Firebase document IDs)
         const presidentIds: string[] = []
         const presidentValues = Object.values(presidentField)
         
         for (const value of presidentValues) {
            if (typeof value === 'string') {
               // If it's a reference path like "participants/abc123" or "/participants/abc123", extract the ID
               if (value.includes('/')) {
                  const parts = value.split('/')
                  const id = parts[parts.length - 1] // Get last part as ID
                  if (id && id !== 'participants') {
                     presidentIds.push(id)
                  }
               } else if (value.length > 0) {
                  // Use the value directly as ID (if it's not a path)
                  presidentIds.push(value)
               }
            } else if (value && typeof value === 'object') {
               // If it's an object, try to get id property
               if ('id' in value) {
                  presidentIds.push((value as any).id)
               } else if ('path' in value) {
                  // Extract ID from path
                  const path = (value as any).path
                  const parts = path.split('/')
                  presidentIds.push(parts[parts.length - 1])
               }
            }
         }
         
         // If no IDs found from values, try using keys (fallback)
         if (presidentIds.length === 0) {
            presidentIds.push(...Object.keys(presidentField))
         }

         // Fetch players AND presidents in parallel using REST API
         const [playerDocs, presidentDocs] = await Promise.all([
            getDocsRest("players", playerIds),
            presidentIds.length > 0 ? getDocsRest("participants", presidentIds) : Promise.resolve([])
         ])

         // Process players - build array FIRST, then assign once
         const processedPlayers: typeof players.value = []

         for (const playerDoc of playerDocs) {
            const singlePlayerData = playerDoc.data as {playerID: string, name: string, role: string, squadra: string, team: any, list: string, position: number | null}

            // Check if this player is in saved penalty takers
            const savedPenaltyTaker = savedPenaltyTakers.find((pt: any) => pt.playerID === singlePlayerData.playerID)
            
            if (savedPenaltyTaker) {
               singlePlayerData.list = "List-2"
               singlePlayerData.position = savedPenaltyTaker.position
            } else {
               singlePlayerData.list = "List-1"
               singlePlayerData.position = null
            }

            processedPlayers.push(singlePlayerData)
         }

         // Single reactive assignment
         players.value = sortPlayersByRole(processedPlayers)
         
         // Load goalkeepers - find all saved goalkeepers and set them at their positions
         goalkeepers.value = []
         if (savedGoalkeepers.length > 0) {
            // Use saved goalkeepers array
            for (const savedGK of savedGoalkeepers) {
               const playerIndex = processedPlayers.findIndex(p => p.playerID === savedGK.playerID)

               if (playerIndex !== -1) {
                  const player = processedPlayers[playerIndex]

                  if (player) {
                     player.list = 'Goalkeeper'
                     player.position = savedGK.position || 1
                     
                     // Ensure array is large enough
                     const position = savedGK.position || 1

                     while (goalkeepers.value.length < position) {
                        goalkeepers.value.push(null)
                     }
                     goalkeepers.value[position - 1] = player
                  }
               }
            }
         } else if (savedGoalkeeper) {
            // Fallback to single goalkeeper for backward compatibility
            const playerIndex = processedPlayers.findIndex(p => p.playerID === savedGoalkeeper.playerID)

            if (playerIndex !== -1) {
               const player = processedPlayers[playerIndex]

               if (player) {
                  player.list = 'Goalkeeper'
                  player.position = 1
                  goalkeepers.value[0] = player
               }
            }
         }

         // Process presidents
         if (presidentDocs && presidentDocs.length > 0) {
            presidents.value = presidentDocs.map(doc => {
               const name = doc.data?.name || doc.data?.data?.name
               return name as string
            }).filter(name => name) // Filter out any undefined/null names
         } else {
            presidents.value = []
         }
         
         loading.value = false
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

.presidents {
   @include typography('h4');

   margin-left: auto;
   color: $blush;

   &--label { color: $navyBlue }
}

$dropZoneBorder: 1px dashed grey;
.drop-zone {
   min-height: 100px;
   border: $dropZoneBorder;
   border-radius: $radius-lg;
   background-color: color.scale($cream, $lightness: 5%);
   color: $color-text-dark;
   transition: border-color $transition-fast ease, background-color $transition-fast ease;
   padding: $spacing-md;
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
   border: $dropZoneBorder;
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
      width: 2.5em;
      height: 2.5em;
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


.player.role {
   &--P { 
      background: linear-gradient(to right, $cream, color.change($navyBlue, $alpha: 0.4));
      color: color.adjust($navyBlue, $lightness: -25%);

      &::before { background-color: color.change($navyBlue, $alpha: 0.6) }
   }
   &--D { 
      background: linear-gradient(to right, $cream, color.change($blush, $alpha: 0.4));
      color: color.adjust($blush, $lightness: -25%);
      
      &::before { background-color: color.change($blush, $alpha: 0.6) }
   }
   &--C { 
      background: linear-gradient(to right, $cream, color.change($darkOlive, $alpha: 0.4));
      color: color.adjust($darkOlive, $lightness: -25%);
      
      &::before { background-color: color.change($darkOlive, $alpha: 0.6) }
   }
   &--A { 
      background: linear-gradient(to right, $cream, color.change($brownSugar, $alpha: 0.4));
      color: color.adjust($brownSugar, $lightness: -25%);
      
      &::before { background-color: color.change($brownSugar, $alpha: 0.6) }
   }
}

.player {
   height: 40px;
   font-weight: 500;
   background-color: $cream;
   border-radius: 1.2em;
   margin-bottom: 1rem;
   counter-increment: step-counter;
   display: flex;
   align-items: center;
   box-shadow: 0 1px 1px rgba(5,5,5, 0.5);
   cursor:move;

   & span { margin-right: 1em }
   &--name { width: 75%; }
   &--role { width: 12.5%; }
   &--team { width: 12.5%; }

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
#players-list .player,
#penaltyTakers-list .player {
   cursor: move;
}
   
</style>
