import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore'
import { useNuxtApp } from '#app';
import { defineStore } from 'pinia';


export interface Participant {
   id: string
   name: string
   teamId?: string
   teamName?: string
   isAdmin?: boolean
}

export const useAuthStore = defineStore('auth', () => {
   const participant = ref<Participant | null>(null)
   const loading = ref<boolean>(true)
   const error = ref<string | null>(null)

   const fetchParticipant = async (userId: string) => {
      if(!process.client) return

      const { $firebaseApp} = useNuxtApp()

      if (!$firebaseApp) {
         error.value = 'Firebase app not initialized'
         loading.value = false
         return
      }

      try {
         loading.value = true
         error.value = null

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
            const teamRef = participantData.team
            let teamId: string | undefined
            let teamName: string | undefined
            let isAdmin: boolean | undefined

            if (teamRef) {
               teamId = teamRef.id
               
               try {
                  if (!teamId) return

                  const teamDocRef = doc(db, "teams", teamId)
                  const teamDocSnap = await getDoc(teamDocRef)

                  if (teamDocSnap.exists()) {
                     teamName = teamDocSnap.data()?.name
                  }

               } catch (teamErr: any) {
                  console.warn('Could not fetch team details:', teamErr)
               }
            }

            participant.value = {
               id: userId,
               name: participantData.name || "participant unknown",
               teamId: teamId,
               teamName: teamName,
               isAdmin: participantData.isAdmin
            }
         } else {
            error.value = 'Participant not found'
            participant.value = null
         }
      } catch (err: any) {
         error.value = err.message
         participant.value = null
      } finally {
         loading.value = false
      }
   }

   const logout = async () => {
      if(!process.client) return

      const { $firebaseApp} = useNuxtApp()

      if (!$firebaseApp) {
         return
      }

      try {
         const auth = getAuth($firebaseApp)
         await signOut(auth)
         // The onAuthStateChanged listener will automatically clear participant data
      } catch (err: any) {
         console.error('Logout error:', err)
         error.value = err.message
      }
   }

   if (process.client) {
      const { $firebaseApp} = useNuxtApp()

      if ($firebaseApp) {
         const auth = getAuth($firebaseApp)

         onAuthStateChanged(auth, (user) => {
            if (user) {
               fetchParticipant(user.uid)
            } else {
               participant.value = null
               loading.value = false
               error.value = null
            }
         })
      }
   }

   return {
      participant: readonly(participant),
      loading: readonly(loading),
      error: readonly(error),
      fetchParticipant,
      logout
   }
})