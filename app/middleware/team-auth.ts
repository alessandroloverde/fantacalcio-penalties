import { useAuthStore } from "../stores/auth";
import { getDocRest } from '../utils/firestoreRest'

export default defineNuxtRouteMiddleware(async (to) => {
   if (!process.client) return

   const authStore = useAuthStore()
   const loggedUser = authStore.participant

   if (!loggedUser) {
      return navigateTo('/login')
   }

   const teamId = to.params.id as string

   if (!teamId) {
      return navigateTo('/')
   }

   if (loggedUser.teamId !== teamId) {
      alert("You can access your team's page only")
      return navigateTo('/')
   }
})