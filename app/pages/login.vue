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
         <input 
            type="password" 
            id="loginPassword"
            v-model="password"
            placeholder="mannaggia alla password"
            required
         ></input>

         <div v-if="loading" class="loading">Loading…</div>
         <div v-if="error" class="error">Mannaggia: c'è stato un errore {{ error }}</div>

         <hr></hr>

         <button type="submit" :disabled="loading">Login</button>
      </form>

   </div>
</template>

<script setup lang="ts">
   import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
   import { getFirestore, doc, getDoc } from 'firebase/firestore'

   const { $firebaseApp } = useNuxtApp()

   const email = ref<string>('')
   const password = ref<string>('')
   const error = ref<string>()
   const loading = ref<boolean>(false)
   const router = useRouter()

   const handleLogin = async () => {
      error.value = ""
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

   .loading {
      color: #faebd7;
      text-align: center;
      margin-bottom: 1rem;
   }

   ::placeholder { color: darkgrey; }
</style>