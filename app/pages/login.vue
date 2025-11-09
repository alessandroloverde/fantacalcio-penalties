<template>
   <h1 class="main-title">Fantacalcio <span>25/26</span></h1>
   <div class="m-auto" id="loginForm">
      <h1 class="withIcon--password">Login</h1>
      <hr></hr>
      <h2>Email & password</h2>
      <form @submit.prevent="handleLogin">
         <label for="loginEmail">Email: </label>
         <input 
            type="email" 
            id="loginEmail"
            v-model="email"
            placeholder="mannaggia alla mail"
            required
         ></input>
         <label for="loginPassword">Password: </label>
         <div class="password-input-wrapper">
            <input 
               :type="showPassword ? 'text' : 'password'"
               id="loginPassword"
               v-model="password"
               placeholder="mannaggia alla password"
               required
            ></input>
            <button 
               type="button" 
               class="toggle-password"
               @click="showPassword = !showPassword"
               :aria-label="showPassword ? 'Hide password' : 'Show password'"
            >
               {{ showPassword ? '🙈' : '👁️' }}
            </button>
         </div>
         
         <div class="forgot-password">
            <a href="#" @click.prevent="handleForgotPassword">Password dimenticata?</a>
         </div>

         <div v-if="loading" class="loading">Loading…</div>
         <div v-if="error" class="error">Mannaggia: c'è stato un errore {{ error }}</div>
         <div v-if="successMessage" class="success">{{ successMessage }}</div>

         <hr></hr>

         <button type="submit" :disabled="loading">Login</button>
      </form>

   </div>
</template>

<script setup lang="ts">
   import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth'
   import { getFirestore, doc, getDoc } from 'firebase/firestore'

   const { $firebaseApp } = useNuxtApp()

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

         // Get participant document using user's UID as document ID
         const db = getFirestore($firebaseApp)
         const participantRef = doc(db, "participants", user.uid)
         const participantSnap = await getDoc(participantRef)
         
         if (participantSnap.exists()) {
            const participantData = participantSnap.data()
            
            // Extract team reference from participant document
            const teamRef = participantData.team
            
            if (teamRef) {
               // Get team ID from the reference
               const teamId = teamRef.id
               
               // Redirect to user's team page
               router.push(`/teams/${teamId}`)
            } else {
               error.value = "Nessun team associato a questo utente."
            }
         } else {
            error.value = "Documento partecipante non trovato per questo utente."
         }
         
      } catch(err: any) {
         error.value = err.message
      } finally {
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

<style lang="scss">
   @use '@/assets/scss/abstracts/colors' as *;
   @use '@/assets/scss/abstracts/variables' as *;
   @use '@/assets/scss/abstracts/typography' as *;
   @use '@/assets/scss/abstracts/mixins' as *;

   body { background-color: $color-bg-light }

   .main-title { 
      font-family: $font-family-momo;
      font-size: 100px;
      color: $darkOlive;
      text-transform: uppercase;
      text-align: center;
      margin-top: 3vh;

      span { color: $blush }
   }

   h1.withIcon--password {
      &::before { @include getIcon}
   }
   h2 { @include typography('h2') }

   #loginForm {
      background-color: $color-bg-dark;
      width: max(40vw, 400px);
      height: 50vh;
      position: absolute;
      top: 25%;
      bottom: 25%;
      left: 25%;
      right: 25%;
      border-radius: $radius-2xl;
      padding: $spacing-lg;
   }
</style>