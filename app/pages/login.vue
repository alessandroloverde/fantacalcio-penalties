<template>
   <div class="login-container">
      <h1>Login</h1>
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
   .login-container {
      max-width: 400px;
      margin: 50px auto;
      padding: 2rem;
      background: rgb(95, 118, 163);
      border-radius: 8px;
   }

   h1 {
      color: #faebd7;
      text-align: center;
      margin-bottom: 2rem;
   }

   .form-group {
      margin-bottom: 1.5rem;
   }

   label {
      display: block;
      color: #faebd7;
      margin-bottom: 0.5rem;
      font-weight: bold;
   }

   input {
      width: 100%;
      padding: 0.75rem;
      font-size: 1rem;
      border: 1px solid #ccc;
      border-radius: 4px;
      box-sizing: border-box;
   }

   .password-input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
   }

   .password-input-wrapper input {
      padding-right: 3rem;
   }

   .toggle-password {
      position: absolute;
      right: 0.5rem;
      background: transparent;
      border: none;
      cursor: pointer;
      font-size: 1.2rem;
      padding: 0.25rem 0.5rem;
      width: auto;
      display: flex;
      align-items: center;
      justify-content: center;
   }

   .toggle-password:hover {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
   }

   .forgot-password {
      margin-top: 0.5rem;
      margin-bottom: 1rem;
      text-align: right;
   }

   .forgot-password a {
      color: #faebd7;
      text-decoration: underline;
      font-size: 0.9rem;
      cursor: pointer;
   }

   .forgot-password a:hover {
      color: #fff;
   }

   button {
      width: 100%;
      padding: 0.75rem;
      font-size: 1rem;
      background-color: #4CAF50;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
   }

   button:disabled {
      background-color: #ccc;
      cursor: not-allowed;
   }

   button:hover:not(:disabled) {
      background-color: #45a049;
   }

   .error {
      background-color: #f44336;
      color: white;
      padding: 1rem;
      border-radius: 4px;
      margin-bottom: 1rem;
      text-align: center;
   }

   .success {
      background-color: #4CAF50;
      color: white;
      padding: 1rem;
      border-radius: 4px;
      margin-bottom: 1rem;
      text-align: center;
   }

   .loading {
      color: #faebd7;
      text-align: center;
      margin-bottom: 1rem;
   }

   ::placeholder { color: darkgrey; }
</style>