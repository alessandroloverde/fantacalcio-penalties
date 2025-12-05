<template>
   <div class="container boxed h-full max-w-7xl mx-auto my-12 px-4 sm:px-6 lg:px-8 py-8">
      <!-- <LoggedUser></LoggedUser> -->
      <h1 class="withIcon--settings-duo">Settings</h1>
      <hr class="divider my-4" />
      
      <div class="card grid grid-cols-4 gap-x-8 gap-y-4 mb-8 px-8 py-6">
         <h2 class="withIcon--clock-duo col-span-4 mb-4">Time Windows</h2>
         
         <form id="timeWindow" @submit.prevent="saveTimeWindow" class="col-span-4 grid grid-cols-subgrid gap-y-4">
            <!-- *** Name Input *** -->
            <section id="edit--windowName" class="col-span-2">
               <label for="windowName" class="block text-sm font-medium text-gray-700 mb-1">Window Name</label>
               <input
                  v-model="formData.name"
                  type="text"
                  id="windowName"
                  placeholder="e.g., Week 1, Championship Round"
                  required
                  class="w-full"
               />
            </section>

            <!-- *** Date and Time Inputs *** -->
            <section id="edit--dateAndTime" class="col-span-2 grid grid-cols-subgrid">
               <div class="col-span-2">
                  <p v-if="dateError" class="text-red-600 text-sm mt-2 font-medium">{{ dateError }}</p>
               </div>

               <div>
                  <label for="startDateTime" class="block text-sm font-medium text-gray-700 mb-1">Start Date & Time</label>
                  <input
                     v-model="formData.startDateTime"
                     type="datetime-local"
                     id="startDateTime"
                     :min="timeWindows?.[timeWindows.length -1]?.endDateTime || new Date().toISOString().slice(0, 16)"
                     required
                     class=""
                  />
               </div>

               <div class="w-full">
                  <label for="endDateTime" class="">End Date & Time</label>
                  <input
                     v-model="formData.endDateTime"
                     type="datetime-local"
                     id="endDateTime"
                     :min="formData.startDateTime || new Date().toISOString().slice(0, 16)"
                     required
                     class=""
                  />
               </div>
            </section>

            <section id="edit--selectTeams" class="col-span-4 grid grid-cols-subgrid">
               <label class="col-span-4">Select Matches</label>
               
               <div 
                  v-for="(match, matchIndex) in formData.matches" 
                  :key="matchIndex"
                  class="col-span-3 flex items-center gap-3"
               >
                  <select
                     v-model="match.teamA"
                     class="w-[45%] my-2"
                  >
                     <option value="">Select team A</option>
                     <option 
                        v-for="team in teamStore.teamsWithPlayers" 
                        :key="team.teamId" 
                        :value="team.teamId"
                        :disabled="formData.matches.some(match => match.teamA === team.teamId || match.teamB === team.teamId)"
                     >{{ team.teamData.name }}</option>
                  </select>
                  <select
                     v-model="match.teamB"
                     class="w-[45%] my-2"
                  >
                     <option value="">Select team B</option>
                     <option 
                        v-for="team in teamStore.teamsWithPlayers" 
                        :key="team.teamId" 
                        :value="team.teamId" 
                        :disabled="formData.matches.some(match => match.teamA === team.teamId || match.teamB === team.teamId)"
                     >{{ team.teamData.name }}</option>
                  </select>
                  <aside class="w-[10%]">
                     <button
                        v-if="matchIndex > 0"
                        @click="removeMatch(matchIndex)"
                        type="button"
                        class="px-3 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg shadow transition"
                        title="Remove match"
                     > ✕ </button>
                  </aside>
               </div>

               <button
                  v-if="formData.matches.length < 4"
                  @click="addMatch"
                  type="button"
                  class="col-span-1 px-4 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg shadow transition"
               > + Add Another Match</button>
            </section>

            <!-- *** Submit Button *** -->
            <button
               type="submit"
               class="w-full md:w-auto px-6 py-3 
                    bg-blue-600 hover:bg-blue-700 
                    text-white font-semibold 
                    rounded-lg shadow-md 
                    transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >{{ editingIndex !== null ? 'Update Time Window' : 'Add New Time Window' }}</button>
            
            <button
               v-if="editingIndex !== null"
               @click="cancelEdit"
               type="button"
               class="w-full md:w-auto ml-0 md:ml-3 mt-2 md:mt-0 px-6 py-3 
                    bg-gray-300 hover:bg-gray-400 
                    text-gray-800 font-semibold 
                    rounded-lg shadow-md 
                    transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            >Cancel</button>
         </form>

         <!-- *** Display Time Windows *** -->
         <div v-if="timeWindows.length > 0" class="col-span-4 grid grid-cols-subgrid gap-y-4">
            <h3 class="col-span-4 mb-2">Existing Time Windows</h3>
            
            <div
               v-for="(window, index) in timeWindows"
               :key="index"
               class="col-span-4 pill--white"
            >
               <div class="">
                  <h4 class="">{{ window.name }}</h4>
                  <div class="">
                     <p>
                        <span class="font-medium">Start:</span>
                        {{ formatDateTime(window.startDateTime) }}
                     </p>
                     <p>
                        <span class="font-medium">End:</span>
                        {{ formatDateTime(window.endDateTime) }}
                     </p>
                     <div class="mt-2">
                        <span class="font-medium">Matches:</span>
                        <ul class="ml-4 mt-1 space-y-1">
                           <li v-for="(match, matchIdx) in window.matches" :key="matchIdx">
                              {{ getTeamName(match.teamA) }} vs {{ getTeamName(match.teamB) }}
                           </li>
                        </ul>
                     </div>
                  </div>
               </div>

               <div class="flex gap-2 mt-3 md:mt-0">
                  <button
                     @click="editTimeWindow(index)"
                     class="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg shadow transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  >Edit</button>
                  <button
                     @click="deleteTimeWindow(index)"
                     class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg shadow transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-400"
                  >Delete</button>
               </div>
            </div>
         </div>

         <div v-else class="text-center py-8 text-gray-500">
            <p>No time windows created yet. Add your first time window above.</p>
         </div>
      </div>
   </div>
</template>

<script setup lang="ts">
   import { useTeamsStore } from '../stores/teams'
   import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore'
   import { useNuxtApp } from '#app'

   export interface Match {
      teamA: string
      teamB: string
   }

   export interface TimeWindow {
      id?: string
      name: string
      startDateTime: string
      endDateTime: string
      matches: Match[]
   }

   const { $firebaseApp } = useNuxtApp()
   const teamStore = useTeamsStore()
   const timeWindows = ref<TimeWindow[]>([])
   const editingIndex = ref<number | null>(null)

   const formData = ref({
      name: '',
      startDateTime: '',
      endDateTime: '',
      matches: [{ teamA: '', teamB: '' }] as Match[]
   })

   const saveTimeWindow = async () => {
      // Validate dates
      if (dateError.value) {
         alert('Please fix the date/time errors before saving.')
         return
      }

      const newWindow: TimeWindow = {
         name: formData.value.name,
         startDateTime: formData.value.startDateTime,
         endDateTime: formData.value.endDateTime,
         matches: [...formData.value.matches]
      }
      
      try {
         const db = getFirestore($firebaseApp)

         if (editingIndex.value !== null) {
            // Update existing time window in Firestore
            const windowToUpdate = timeWindows.value[editingIndex.value]

            if (windowToUpdate && windowToUpdate.id) {
               const docRef = doc(db, "session", windowToUpdate.id)
               
               await updateDoc(docRef, {
                  name: newWindow.name,
                  startDateTime: newWindow.startDateTime,
                  endDateTime: newWindow.endDateTime,
                  matches: newWindow.matches
               })
               
               // Update local array
               timeWindows.value[editingIndex.value] = { ...newWindow, id: windowToUpdate.id }
            }
            editingIndex.value = null
         } else {
            // Add new time window to Firestore (auto-generate ID)
            const docRef = await addDoc(collection(db, "session"), {
               name: newWindow.name,
               startDateTime: newWindow.startDateTime,
               endDateTime: newWindow.endDateTime,
               matches: newWindow.matches
            })
            
            // Add to local array with the generated ID
            timeWindows.value.push({ ...newWindow, id: docRef.id })
         }

         // Sort time windows by start date
         timeWindows.value.sort((a, b) => 
            new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime()
         )

         alert('Time window saved successfully!')

      } catch(error) {
         console.error('Error saving time window:', error)
         alert(`Error saving time window. Please try again. ${error}`)
         return
      }
      
      // Reset form
      formData.value = {
         name: '',
         startDateTime: '',
         endDateTime: '',
         matches: [{ teamA: '', teamB: '' }]
      }
   }

   const editTimeWindow = (index: number) => {
      const window = timeWindows.value[index]
      if (!window) return
      
      editingIndex.value = index
      formData.value = {
         name: window.name,
         startDateTime: window.startDateTime,
         endDateTime: window.endDateTime,
         matches: [...window.matches]
      }
   }

   const cancelEdit = () => {
      editingIndex.value = null
      formData.value = {
         name: '',
         startDateTime: '',
         endDateTime: '',
         matches: [{ teamA: '', teamB: '' }]
      }
   }

   const addMatch = () => {
      if (formData.value.matches.length < 4) {
         formData.value.matches.push({ teamA: '', teamB: '' })
      }
   }

   const removeMatch = (index: number) => {
      if (formData.value.matches.length > 1) {
         formData.value.matches.splice(index, 1)
      }
   }

   const deleteTimeWindow = async (index: number) => {
      if (!confirm('Are you sure you want to delete this time window?')) {
         return
      }
      
      const windowToDelete = timeWindows.value[index]
      
      if (!windowToDelete) return
      
      try {
         if (windowToDelete.id) {
            const db = getFirestore($firebaseApp)
            await deleteDoc(doc(db, "session", windowToDelete.id))
         }
         
         // Remove from local array
         timeWindows.value.splice(index, 1)
         
         if (editingIndex.value === index) {
            cancelEdit()
         }
         
         alert('Time window deleted successfully!')
      } catch (error) {
         console.error('Error deleting time window:', error)
         alert('Error deleting time window. Please try again.')
      }
   }

   const formatDateTime = (dateTimeString: string) => {
      const date = new Date(dateTimeString)
      return date.toLocaleString('it-IT', {
         year: 'numeric',
         month: 'short',
         day: 'numeric',
         hour: '2-digit',
         minute: '2-digit'
      })
   }

   const dateError = computed(() => {
      if (!formData.value.startDateTime || !formData.value.endDateTime) {
         return ''
      }
      
      const startDate = new Date(formData.value.startDateTime)
      const endDate = new Date(formData.value.endDateTime)
      
      if (endDate <= startDate) {
         return '⚠️ End date/time must be after start date/time'
      }
      
      return ''
   })

   const getTeamName = (teamId: string) => {
      const team = teamStore.teamsWithPlayers.find(t => t.teamId === teamId)
      return team ? team.teamData.name : 'Unknown Team'
   }

   const fetchTimeWindows = async () => {
      try {
         const db = getFirestore($firebaseApp)
         const sessionsSnapshot = await getDocs(collection(db, "session"))
         
         timeWindows.value = sessionsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
         } as TimeWindow))
         
         // Sort by start date
         timeWindows.value.sort((a, b) => 
            new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime()
         )
      } catch (error) {
         console.error('Error fetching time windows:', error)
      }
   }

   onMounted(async () => {
      await teamStore.fetchTeams()
      await fetchTimeWindows()
   })
</script>

<style lang="scss" scoped>
   form { color: black; }
</style>