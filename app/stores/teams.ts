import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore'
import { useNuxtApp } from '#app'
import { defineStore } from 'pinia'

export interface TeamWithPlayers {
   teamId: string
   teamData: any
   players: any[]
}

export const useTeamsStore = defineStore('teams', () => {
   const teamsWithPlayers = ref<TeamWithPlayers[]>([])
   const loading = ref<boolean>(false)
   const error = ref<string | null>(null)

   const fetchTeams = async () => {
      if (!process.client) return

      const { $firebaseApp } = useNuxtApp()
      if (!$firebaseApp) {
         error.value = 'Firebase app not initialized'
         return
      }

      try {
         loading.value = true
         error.value = null
         
         const db = getFirestore($firebaseApp)
         const teamsSnapshot = await getDocs(collection(db, "teams"))

         // Process all teams in parallel
         const teamPromises = teamsSnapshot.docs.map(async (teamDoc) => {
            const teamData = teamDoc.data()
            
            if (teamData.players) {
               // Collect all player references first
               const playerRefs = Object.values(teamData.players) as any[]
               
               // Fetch all players in parallel using Promise.all
               const playerPromises = playerRefs.map(playerRef => 
                  getDoc(playerRef).then(playerDoc => {
                     if (playerDoc.exists()) {
                        return { 
                           id: playerDoc.id, 
                           ...(playerDoc.data() || {})
                        }
                     }
                     return null
                  })
               )
               
               const players = (await Promise.all(playerPromises)).filter(p => p !== null)
               
               return {
                  teamId: teamDoc.id,
                  teamData: teamData,
                  players: players,
               }
            }
            return null
         })
         
         const results = await Promise.all(teamPromises)
         teamsWithPlayers.value = results.filter(t => t !== null) as TeamWithPlayers[]

      } catch (err: any) {
         error.value = err.message || 'Unknown error'
      } finally {
         loading.value = false
      }
   }

   return {
      teamsWithPlayers: readonly(teamsWithPlayers),
      loading: readonly(loading),
      error: readonly(error),
      fetchTeams
   }
})