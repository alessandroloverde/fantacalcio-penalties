import { defineStore } from 'pinia'
import { getCollectionRest } from '../utils/firestoreRest'

export const usePenaltiesStore = defineStore('penalties', () => {
   const penalties = ref<Record<string, { penaltyTakers: any[], goalkeepers: any[], goalkeeper: any | null }>>({})
   const loading = ref<boolean>(false)
   const error = ref<string | null>(null)

   const fetchPenalties = async () => {
      if (!process.client) return

      try {
         loading.value = true
         error.value = null
         
         const penaltiesResult = await getCollectionRest("penalties")

         penalties.value = Object.fromEntries(
            penaltiesResult.map(doc => {
               const goalkeepers = doc.data.goalkeepers || []
               // Use goalkeepers array if available, otherwise fall back to single goalkeeper
               const goalkeeper = goalkeepers.length > 0 ? goalkeepers[0] : (doc.data.goalkeeper || null)
               
               return [doc.id, {
                  penaltyTakers: doc.data.penaltyTakers || [],
                  goalkeepers: goalkeepers,
                  goalkeeper: goalkeeper // First goalkeeper for backward compatibility
               }]
            })
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