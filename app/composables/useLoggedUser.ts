import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore'
import { useNuxtApp } from '#app';
import type { Participant } from '../stores/auth'


export const useLoggedUser = () => {
   const participant = ref<Participant | null>(null)
   const loading = ref<boolean>(true)
   const error = ref<string | null>(null)

   const fetchParticipant = async () => {
      if(!process.client) return

      const { $firebaseApp} = useNuxtApp()

      if (!$firebaseApp) {
         error.value = 'Firebase app not initialized'
         loading.value = false
         return
      }

      try {
         const auth = getAuth($firebaseApp)
         const currentUser = auth.currentUser

         if (!currentUser) {
            error.value = 'User not found'
            loading.value = false
            return
         }
         const db = getFirestore($firebaseApp)
         const participantRef = doc(db, "participants", currentUser.uid)
         const participantSnap = await getDoc(participantRef)

         if (participantSnap.exists()) {
            const participantData = participantSnap.data()

            participant.value = {
               id: currentUser.uid,
               name: participantData.name || "participant unknown"
            }
         } else {
            error.value = 'Participant not found'
         }
      } catch (err: any) {
         error.value = err.message
      } finally {
         loading.value = false
      }
   }

   if (process.client) {
      fetchParticipant()
   }

   return {
      participant: readonly(participant),
      loading: readonly(loading),
      error: readonly(error),
      fetchParticipant
   }
}