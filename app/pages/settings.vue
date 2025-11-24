<template>
   <div class="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <LoggedUser></LoggedUser>
      <h1 class="text-3xl font-bold text-gray-900 mb-6">Settings</h1>
      
      <div class="bg-white rounded-lg shadow-md p-6">
         <h2 class="text-2xl font-semibold text-gray-800 mb-4">Time Windows</h2>
         
         <form id="timeWindow" @submit.prevent="saveTimeWindow" class="space-y-4 mb-8">
            <!-- Name Input -->
            <section id="edit--windowName">
               <label for="windowName" class="block text-sm font-medium text-gray-700 mb-1">Window Name</label>
               <input
                  v-model="formData.name"
                  type="text"
                  id="windowName"
                  placeholder="e.g., Week 1, Championship Round"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
               />
            </section>

            <!-- Date and Time Inputs -->
            <section id="edit--dateAndTime" class="grid grid-cols-2 gap-4">
               <!-- Start Date/Time -->
               <div class="w-full">
                  <label for="startDateTime" class="block text-sm font-medium text-gray-700 mb-1">Start Date & Time</label>
                  <input
                     v-model="formData.startDateTime"
                     type="datetime-local"
                     id="startDateTime"
                     required
                     class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
               </div>

               <!-- End Date/Time -->
               <div class="w-full">
                  <label for="endDateTime" class="block text-sm font-medium text-gray-700 mb-1">End Date & Time</label>
                  <input
                     v-model="formData.endDateTime"
                     type="datetime-local"
                     id="endDateTime"
                     required
                     class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
               </div>
            </section>

            <section id="edit--selectTeams" class="grid grid-cols-2 gap-4">
               <label for="selectTeams" class="col-span-2">Select teams</label>
               <select
                  v-model="formData.teamA"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
               >
                  <option value="">Select team A</option>
                  <option v-for="team in teamStore.teamsWithPlayers" :key="team.teamId" :value="team.teamId">
                     {{ team.teamData.name }}
                  </option>
               </select>
               <select
                  v-model="formData.teamB"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
               >
                  <option value="">Select team B</option>
                  <option v-for="team in teamStore.teamsWithPlayers" :key="team.teamId" :value="team.teamId">
                     {{ team.teamData.name }}
                  </option>
               </select>
            </section>

            <!-- Submit Button -->
            <button
               type="submit"
               class="w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
               {{ editingIndex !== null ? 'Update Time Window' : 'Add New Time Window' }}
            </button>
            
            <button
               v-if="editingIndex !== null"
               @click="cancelEdit"
               type="button"
               class="w-full md:w-auto ml-0 md:ml-3 mt-2 md:mt-0 px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-lg shadow-md transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            >
               Cancel
            </button>
         </form>

         <!-- Display Time Windows -->
         <div v-if="timeWindows.length > 0" class="space-y-3">
            <h3 class="text-lg font-semibold text-gray-800 mb-3">Existing Time Windows</h3>
            
            <div
               v-for="(window, index) in timeWindows"
               :key="index"
               class="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition"
            >
               <div class="flex-1">
                  <h4 class="text-lg font-semibold text-gray-900">{{ window.name }}</h4>
                  <div class="mt-2 space-y-1 text-sm text-gray-600">
                     <p>
                        <span class="font-medium">Start:</span>
                        {{ formatDateTime(window.startDateTime) }}
                     </p>
                     <p>
                        <span class="font-medium">End:</span>
                        {{ formatDateTime(window.endDateTime) }}
                     </p>
                  </div>
               </div>

               <div class="flex gap-2 mt-3 md:mt-0">
                  <button
                     @click="editTimeWindow(index)"
                     class="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg shadow transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  >
                     Edit
                  </button>
                  <button
                     @click="deleteTimeWindow(index)"
                     class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg shadow transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-400"
                  >
                     Delete
                  </button>
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

   interface TimeWindow {
      name: string
      startDateTime: string
      endDateTime: string,
      teamA: string,
      teamB: string
   }

   const teamStore = useTeamsStore()

   const timeWindows = ref<TimeWindow[]>([])
   const editingIndex = ref<number | null>(null)

   const formData = ref({
      name: '',
      startDateTime: '',
      endDateTime: '',
      teamA: '',
      teamB: ''
   })

   const saveTimeWindow = () => {
      const newWindow: TimeWindow = {
         name: formData.value.name,
         startDateTime: formData.value.startDateTime,
         endDateTime: formData.value.endDateTime,  
         teamA: formData.value.teamA,
         teamB: formData.value.teamB
      }
      
      if (editingIndex.value !== null) {
         // Update existing time window
         timeWindows.value[editingIndex.value] = newWindow
         editingIndex.value = null
      } else {
         // Add new time window
         timeWindows.value.push(newWindow)
      }
      
      // Reset form
      formData.value = {
         name: '',
         startDateTime: '',
         endDateTime: '',
         teamA: '',
         teamB: ''
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
         teamA: window.teamA,
         teamB: window.teamB
      }
   }

   const cancelEdit = () => {
      editingIndex.value = null
      formData.value = {
         name: '',
         startDateTime: '',
         endDateTime: '',
         teamA: '',
         teamB: ''
      }
   }

   const deleteTimeWindow = (index: number) => {
      if (confirm('Are you sure you want to delete this time window?')) {
         timeWindows.value.splice(index, 1)
         if (editingIndex.value === index) {
            cancelEdit()
         }
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


   onMounted(async () => {
      await teamStore.fetchTeams()
   })
</script>

<style lang="scss" scoped>
   form { color: black; }
</style>