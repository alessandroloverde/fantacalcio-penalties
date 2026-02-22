<template>
   <Teleport to="body">
      <div v-if="isVisible" class="penalty-modal-overlay" @click="close">
         <div class="penalty-modal" @click.stop>
            <div class="penalty-animation">
               <div class="player-section">
                  <div class="player-name">{{ player?.name }}</div>
                  <div class="player-score">Voto: {{ playerScore }}</div>
                  <div v-if="result" class="result-badge" :class="resultClass">
                     {{ result === 'scored' ? '⚽️ GOL!' : '❌ Parato!' }}
                  </div>
               </div>
               
               <div class="vs-divider">VS</div>
               
               <div class="goalkeeper-section">
                  <div class="goalkeeper-name">{{ goalkeeper?.name }}</div>
                  <div class="goalkeeper-score">Voto: {{ goalkeeperScore }}</div>
                  <div class="goalkeeper-saves">Rigori parati: {{ goalkeeperSaves }}</div>
               </div>
            </div>
         </div>
      </div>
   </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{
   isVisible: boolean
   player?: any
   goalkeeper?: any
   playerScore?: number
   goalkeeperScore?: number
   goalkeeperSaves?: number
   result?: 'scored' | 'saved' | null
}>()

const emit = defineEmits<{
   close: []
}>()

const resultClass = computed(() => {
   if (props.result === 'scored') return 'result-scored'
   if (props.result === 'saved') return 'result-saved'
   return ''
})

const close = () => {
   emit('close')
}
</script>

<style lang="scss" scoped>
@use '@/assets/scss/main' as *;

.penalty-modal-overlay {
   position: fixed;
   top: 0;
   left: 0;
   right: 0;
   bottom: 0;
   background-color: rgba(0, 0, 0, 0.8);
   display: flex;
   align-items: center;
   justify-content: center;
   z-index: 1000;
   animation: fadeIn 0.3s ease;
}

.penalty-modal {
   background: $cream;
   border-radius: $radius-lg;
   padding: 1.5rem;
   max-width: 600px;
   width: 90%;
   max-height: 90vh;
   overflow-y: auto;
   animation: slideUp 0.4s ease;

   @media (min-width: 768px) {
      padding: 3rem;
   }
}

.penalty-animation {
   display: flex;
   flex-direction: column;
   align-items: center;
   justify-content: center;
   gap: 1rem;

   @media (min-width: 768px) {
      flex-direction: row;
      justify-content: space-around;
      gap: 2rem;
   }
}

.player-section,
.goalkeeper-section {
   text-align: center;
   flex: 1;
   min-width: 0;
}

.player-name,
.goalkeeper-name {
   font-size: 1.25rem;
   font-weight: $font-weight-bold;
   margin-bottom: 0.5rem;
   word-break: break-word;

   @media (min-width: 768px) {
      font-size: 1.5rem;
   }
}

.player-score,
.goalkeeper-score {
   font-size: 1rem;
   color: $eerieBlack;
   margin-bottom: 0.5rem;

   @media (min-width: 768px) {
      font-size: 1.2rem;
   }
}

.goalkeeper-saves {
   font-size: 0.9rem;
   color: $navyBlue;

   @media (min-width: 768px) {
      font-size: 1rem;
   }
}

.vs-divider {
   font-size: 1.5rem;
   font-weight: $font-weight-bold;
   color: $blush;
   flex-shrink: 0;

   @media (min-width: 768px) {
      font-size: 2rem;
   }
}

.result-badge {
   margin-top: 0.75rem;
   padding: 0.5rem 0.75rem;
   border-radius: $radius-md;
   font-size: 1.25rem;
   font-weight: $font-weight-bold;
   animation: pulse 0.5s ease;

   @media (min-width: 768px) {
      margin-top: 1rem;
      padding: 0.5rem 1rem;
      font-size: 1.5rem;
   }
}

.result-scored {
   background-color: $darkOlive;
   color: $cream;
}

.result-saved {
   background-color: $blush;
   color: white;
}

@keyframes fadeIn {
   from { opacity: 0; }
   to { opacity: 1; }
}

@keyframes slideUp {
   from {
      transform: translateY(50px);
      opacity: 0;
   }
   to {
      transform: translateY(0);
      opacity: 1;
   }
}

@keyframes pulse {
   0%, 100% { transform: scale(1); }
   50% { transform: scale(1.1); }
}
</style>

