import { defineStore } from 'pinia'
import { getCollectionRest } from '../utils/firestoreRest'

export const usePenaltiesStore = defineStore('penalties', () => {
   const penalties = ref<Record<string, { penaltyTakers: any[], goalkeeper: any | null }>>({})
   const loading = ref<boolean>(false)
   const error = ref<string | null>(null)

   const fetchPenalties = async () => {
      if (!process.client) return

      try {
         loading.value = true
         error.value = null
         
         // Use REST API instead of SDK (no WebSocket overhead)
         const penaltiesResult = await getCollectionRest("penalties")

         penalties.value = Object.fromEntries(
            penaltiesResult.map(doc => [doc.id, {
               penaltyTakers: doc.data.penaltyTakers || [],
               goalkeeper: doc.data.goalkeeper || null
            }])
         )

      } catch (err: any) {
         error.value = err.message || 'Unknown error'
      } finally {
         loading.value = false
      }
   }

   return {
      penalties: readonly(penalties),
      loading: readonly(loading),
      error: readonly(error),
      fetchPenalties
   }
})