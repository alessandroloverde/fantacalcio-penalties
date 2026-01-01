<template>
   <div class="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 class="main-title">Fantacalcio <span>25/26</span></h1>
      <div class="m-auto p-8 boxed" id="loginForm">
         <header>
            <h1 class="withIcon--login withIcon--color-blush">Login</h1>
         </header>
         
         <div class="divider-text my-4">@</div>

         <main>
            <form 
               class="flex w-full flex-col gap-6 mx-auto"
               @submit.prevent="handleLogin"
            >
               <div class="flex flex-col gap-2">
                  <label for="loginEmail" class="withIcon--email withIcon--color-blush tracking-wide">email: </label>
                  <input 
                     type="email" 
                     id="loginEmail"
                     v-model="email"
                     placeholder="mannaggia alla mail"
                     required
                     class="w-full rounded-lg border 
                        px-4 py-3 placeholder:text-slate-400
                        focus:outline-none focus:border-blue-500"
                  >
               </div>
               <div class="flex flex-col gap-2">
                  <label for="loginPassword" class="withIcon--password withIcon--color-blush tracking-wide">password: </label>
                  <div class="password-input-wrapper">
                     <input 
                        :type="showPassword ? 'text' : 'password'"
                        id="loginPassword"
                        v-model="password"
                        placeholder="mannaggia alla password"
                        required
                        class="w-full rounded-lg border
                           px-4 py-3 placeholder:text-slate-400
                           focus:outline-none focus:border-blue-500"
                     >
                     <button 
                        type="button" 
                        class="toggle-password px-4"
                        @click="showPassword = !showPassword"
                        :aria-label="showPassword ? 'Hide password' : 'Show password'"
                     >{{ showPassword ? '🙈' : '👁️' }}</button>
                  </div>
               </div>
               
               <div class="forgot-password">
                  <a href="#" @click.prevent="handleForgotPassword" class="withIcon--cloudQuestion withIcon--color-blush">Password dimenticata?</a>
               </div>

               <div v-if="loading" class="rounded-lg bg-slate-600 px-4 py-3 text-center font-medium text-slate-200">Loading…</div>
               <div v-if="error" class="rounded-lg bg-red-600/80 px-4 py-3 font-medium text-red-100">{{ error }}</div>
               <div v-if="successMessage" class="rounded-lg bg-emerald-600/80 px-4 py-3 font-medium text-emerald-100">{{ successMessage }}</div>

               <button
                  type="submit"
                  :disabled="loading"
                  class="rounded-lg bg-primary-500 px-5 py-3 font-semibold uppercase tracking-wide text-slate-900 
                  transition hover:bg-primary-400 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-400"
               >Login</button>
            </form>
         </main>

      </div>
   </div>
</template>

<script setup lang="ts">
   import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth'
   import { useAuthStore } from '../stores/auth'

   const { $firebaseApp } = useNuxtApp()
   const authStore = useAuthStore()

   const email = ref<string>('')
   const password = ref<string>('')
   const error = ref<string>()
   const successMessage = ref<string>()
   const loading = ref<boolean>(false)
   const showPassword = ref<boolean>(false)
   const resetPasswordLoading = ref<boolean>(false)
   const router = useRouter()

   const handleLogin = async () => {
      error.value = ""
      successMessage.value = ""
      loading.value = true

      try {
         const auth = getAuth($firebaseApp)   
         const userCredential = await signInWithEmailAndPassword(auth, email.value, password.value)
         const user = userCredential.user

         // Manually fetch participant data after login
         await authStore.fetchParticipant(user.uid)

         // Wait for participant data to be loaded
         await new Promise<void>((resolve) => {
            const maxAttempts = 50 // 50 * 50ms = 2.5 seconds max wait
            let attempts = 0
            
            const checkParticipant = () => {
               if (authStore.participant) {
                  resolve()
               } else if (authStore.error || attempts >= maxAttempts) {
                  resolve() // Resolve even on error to avoid infinite wait
               } else {
                  attempts++
                  setTimeout(checkParticipant, 50)
               }
            }
            checkParticipant()
         })

         const loggedUser = authStore.participant

         if (loggedUser && loggedUser.teamId) {
            router.push(`/teams/${loggedUser.teamId}`)
         } else {
            error.value = loggedUser ? "Nessun team associato a questo utente." : (authStore.error || "Errore nel caricamento dei dati utente.")
            loading.value = false
         }
         
      } catch(err: any) {
         error.value = `Email e/o password errate – ${err.message}`
   
         console.log("Errore: ", error.value)
         loading.value = false
      }
   }

   const handleForgotPassword = async () => {
      if (!email.value) {
         error.value = "Inserisci prima la tua email"
         return
      }

      error.value = ""
      successMessage.value = ""
      resetPasswordLoading.value = true

      try {
         const auth = getAuth($firebaseApp)
         await sendPasswordResetEmail(auth, email.value)
         successMessage.value = "Email di reset password inviata! Controlla la tua casella di posta."
      } catch (err: any) {
         error.value = err.message || "Errore nell'invio dell'email di reset"
      } finally {
         resetPasswordLoading.value = false
      }
   }
</script>

<style lang="scss" scoped>
   @use '@/assets/scss//main' as *;

   .main-title { 
      font-family: $font-family-momo;
      font-size: 100px;
      color: $darkOlive;
      text-transform: uppercase;
      text-align: center;
      margin: 3vh auto;

      span { color: $blush }
   }

   h1 { 
      @include typography('h1');
      color: $navyBlue;
   }


   #loginForm {
      width: max(50vw, 400px);
      min-height: 50vh;

      button[type='submit'] {
         background: $color-primary;
         color: $color-text-secondary;
         font-weight: $font-weight-semibold;
         text-transform: uppercase;
         letter-spacing: 0.08em;
         border-radius: $radius-lg;
         padding: $spacing-sm $spacing-lg;
         transition: background-color $transition-fast ease, transform $transition-fast ease;

         &:hover:not(:disabled) {
            background: $color-primary-light;
            transform: translateY(-1px);
         }

         &:disabled {
            background: $color-button-disabled;
            color: $color-text-muted;
            cursor: not-allowed;
            box-shadow: none;
         }

         &:focus-visible {
            outline: 2px solid $color-primary-light;
            outline-offset: 3px;
         }
      }
      label {
         @include typography('label');
         color: $navyBlue;
      }
      .password-input-wrapper { position: relative }
      button.toggle-password {
         position: absolute;
         right: 0;
         height: 100%;
      }
   }
</style>