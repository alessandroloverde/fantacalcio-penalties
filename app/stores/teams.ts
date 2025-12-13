import { defineStore } from 'pinia'
import { getCollectionRest } from '../utils/firestoreRest'

export interface TeamData {
   teamId: string
   teamData: any
}

export const useTeamsStore = defineStore('teams', () => {
   const teams = ref<TeamData[]>([])
   const loading = ref<boolean>(false)
   const error = ref<string | null>(null)

   const fetchTeams = async () => {
      if (!process.client) return
      
      // Don't refetch if already loaded
      if (teams.value.length > 0) return

      try {
         loading.value = true
         error.value = null
         
         // Use REST API instead of SDK (no WebSocket overhead)
         const teamsResult = await getCollectionRest("teams")

         teams.value = teamsResult.map(doc => ({
            teamId: doc.id,
            teamData: doc.data
         }))

      } catch (err: any) {
         error.value = err.message || 'Unknown error'
      } finally {
         loading.value = false
      }
   }

   // Backward compatibility alias
   const teamsWithPlayers = computed(() => teams.value)

   return {
      teams: readonly(teams),
      teamsWithPlayers,  // Alias for backward compatibility
      loading: readonly(loading),
      error: readonly(error),
      fetchTeams
   }
})