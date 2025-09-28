import { defineNuxtPlugin } from '#app'
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
export default defineNuxtPlugin(() => {
   const firebaseConfig = {
   apiKey: "AIzaSyAi6xTXieeklm2ehtWU7MxEqtL4FP5pzno",
   authDomain: "fantacalcio-rigori.firebaseapp.com",
   projectId: "fantacalcio-rigori",
   storageBucket: "fantacalcio-rigori.firebasestorage.app",
   messagingSenderId: "973078329874",
   appId: "1:973078329874:web:d4b317809d74c44b6b76cb"
   }

   const app = initializeApp(firebaseConfig)

   return {
      provide: {
         firebaseApp: app
      }
   }
})
