import { defineStore } from 'pinia'
import { getFirestore, collection, getDocs } from 'firebase/firestore'
import { useNuxtApp } from '#app'

export const usePenaltiesStore = defineStore('penalties', () => {
   const penalties = ref<Record<string, { penaltyTakers: any[], goalkeeper: any | null }>>({})
   const loading = ref<boolean>(false)
   const error = ref<string | null>(null)

   const fetchPenalties = async () => {
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
         const penaltiesSnapshot = await getDocs(collection(db, "penalties"))

         penalties.value = Object.fromEntries(
            penaltiesSnapshot.docs.map(penaltyDoc => {
               const penaltyData = penaltyDoc.data()
               return [penaltyDoc.id, {
                  penaltyTakers: penaltyData.penaltyTakers || [],
                  goalkeeper: penaltyData.goalkeeper || null
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