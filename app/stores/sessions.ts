import { defineStore } from 'pinia'
import { getCollectionRest, getDocRest } from '../utils/firestoreRest'

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
   matchDay?: string
   playersScores?: any[]
}

export const useSessionsStore = defineStore('sessions', () => {
   const sessions = ref<Record<string, TimeWindow>>({}) // Keyed by session name for fast lookup
   const sessionsById = ref<Record<string, TimeWindow>>({}) // Keyed by ID for lookup by ID
   const loading = ref<boolean>(false)
   const error = ref<string | null>(null)

   // Fetch all sessions (useful for calendar/settings pages)
   const fetchAllSessions = async () => {
      if (!process.client) return

      try {
         loading.value = true
         error.value = null

         const sessionsResult = await getCollectionRest("session")

         const newSessions: Record<string, TimeWindow> = {}
         const newSessionsById: Record<string, TimeWindow> = {}

         sessionsResult.forEach(doc => {
            const session: TimeWindow = {
               id: doc.id,
               ...doc.data
            } as TimeWindow

            if (session.name) {
               newSessions[session.name] = session
            }
            if (session.id) {
               newSessionsById[session.id] = session
            }
         })

         sessions.value = { ...sessions.value, ...newSessions }
         sessionsById.value = { ...sessionsById.value, ...newSessionsById }

      } catch (err: any) {
         error.value = err.message || 'Unknown error'
         console.error('Error fetching sessions:', err)
      } finally {
         loading.value = false
      }
   }

   // Fetch a single session by name (with caching)
   const fetchSessionByName = async (sessionName: string): Promise<TimeWindow | undefined> => {
      if (!process.client || !sessionName) return undefined

      // Return cached if available
      if (sessions.value[sessionName]) {
         return sessions.value[sessionName]
      }

      try {
         loading.value = true
         error.value = null

         // Fetch all sessions and cache them (alternative: could query by name if you have an index)
         await fetchAllSessions()

         return sessions.value[sessionName]

      } catch (err: any) {
         error.value = err.message || 'Unknown error'
         console.error('Error fetching session:', err)
         return undefined
      } finally {
         loading.value = false
      }
   }

   // Fetch a single session by ID (with caching)
   const fetchSessionById = async (sessionId: string): Promise<TimeWindow | undefined> => {
      if (!process.client || !sessionId) return undefined

      // Return cached if available
      if (sessionsById.value[sessionId]) {
         return sessionsById.value[sessionId]
      }

      try {
         loading.value = true
         error.value = null

         const doc = await getDocRest("session", sessionId)
         
         if (!doc) {
            return undefined
         }

         const session: TimeWindow = {
            id: doc.id,
            ...doc.data
         } as TimeWindow

         // Cache it
         if (session.name) {
            sessions.value[session.name] = session
         }
         sessionsById.value[sessionId] = session

         return session

      } catch (err: any) {
         error.value = err.message || 'Unknown error'
         console.error('Error fetching session by ID:', err)
         return undefined
      } finally {
         loading.value = false
      }
   }

   // Get cached session by name (no fetch)
   const getSessionByName = (sessionName: string): TimeWindow | undefined => {
      return sessions.value[sessionName]
   }

   // Get cached session by ID (no fetch)
   const getSessionById = (sessionId: string): TimeWindow | undefined => {
      return sessionsById.value[sessionId]
   }

   // Clear cache (useful for refresh)
   const clearCache = () => {
      sessions.value = {}
      sessionsById.value = {}
   }

   return {
      sessions: readonly(sessions),
      sessionsById: readonly(sessionsById),
      loading: readonly(loading),
      error: readonly(error),
      fetchAllSessions,
      fetchSessionByName,
      fetchSessionById,
      getSessionByName,
      getSessionById,
      clearCache
   }
})

