<template>
   <section class="col-span-1">
      <h3 class="col-span-2 mb-6">{{props.teamName}}</h3>
      <h4 class="mb-1b mx-4">Portiere</h4>
      <div class="legend pill--beige mb-2">
         <div class="w-2/20">Ruolo</div>
         <div class="w-6/20">Nome</div>
         <div class="w-2/20">Sq.</div>
         <div class="w-1/20"></div>
         <div class="w-1/20">Voto</div>
         <div class="w-3/20">🥅</div>
         <div class="w-2/20"></div>
         <div class="w-3/20"></div>
      </div>
      <div class="penaltyTaker mb-6">
         <div class="w-2/20 penaltyTaker--role P">{{ goalkeeper?.role }}</div>
         <div class="w-6/20 penaltyTaker--name">{{ goalkeeper?.name }}</div>
         <div class="w-2/20 penaltyTaker--squadra">{{ goalkeeper?.squadra }}</div>
         <div class="w-1/20"></div>
         <div class="w-1/20">{{ goalkeeperScore?.playerScore }}</div>
         <div class="w-3/20">{{ goalkeeperScore?.penaltiesSaved }}</div>
         <div class="w-2/20"></div>
         <div class="w-3/20"></div>
      </div>
      <h4 class="mb-1 mx-4">Rigoristi</h4>
      <ul>
         <div class="legend pill--beige mb-2">
            <div class="w-2/20">Ruolo</div>
            <div class="w-6/20">Nome</div>
            <div class="w-2/20">Sq.</div>
            <div class="w-1/20"></div>
            <div class="w-1/20">Voto</div>
            <div class="w-3/20">⚽️ ❌</div>
            <div class="w-1/20">⚽️</div>
            <div class="w-1/20"></div>
            <div class="w-3/20"></div>
         </div>
         <li 
            v-for="player in penaltyTakersWithScores.filter(player => player.score)" 
            :key="player.playerID" 
            class="penaltyTaker"
         >
            <div class="w-2/20 penaltyTaker--role" :class="player.role">{{ player.role }}</div>
            <div class="w-6/20 penaltyTaker--name">{{ player.name }}</div>
            <div class="w-2/20 penaltyTaker--squadra">{{ player.squadra }}</div>
            <div class="w-1/20"></div>
            <div class="w-1/20">{{ player.score?.playerScore }}</div>
            <div class="w-3/20" :class="{'penaltyTaker--score': (player.score?.penaltiesFailed ?? 0) > 0}">{{ player.score?.penaltiesFailed }}</div>
            <div class="w-1/20" :class="{'penaltyTaker--score': getTotalGoals(player.score) > 0}">{{ getTotalGoals(player.score) }}</div>
            <div class="w-1/20"></div>
            <button 
               class="w-3/20 btn"
               :disabled="isButtonDisabled(player)"
               :class="{
                  'btn--secondary': !getPenaltyResult(player.playerID),
                  'btn--success': getPenaltyResult(player.playerID) === 'scored',
                  'btn--danger': getPenaltyResult(player.playerID) === 'saved'
               }"
               @click="handleClick(player)"
            >
               {{ getButtonText(player) }}
            </button>
         </li>

         <li 
            v-for="player in penaltyTakersWithScores.filter(player => !player.score)" 
            :key="player.playerID" 
            class="penaltyTaker disabled"
         >
            <div class="w-2/20 penaltyTaker--role" :class="player.role">{{ player.role }}</div>
            <div class="w-6/20 penaltyTaker--name">{{ player.name }}</div>
            <div class="w-2/20 penaltyTaker--squadra">{{ player.squadra }}</div>
            <div class="w-1/20"></div>
            <div class="w-1/20">{{ player.score?.playerScore }}</div>
            <div class="w-3/20" :class="{'penaltyTaker--score': (player.score?.penaltiesFailed ?? 0) > 0}">{{ player.score?.penaltiesFailed }}</div>
            <div class="w-1/20" :class="{'penaltyTaker--score': getTotalGoals(player.score) > 0}">{{ getTotalGoals(player.score) }}</div>
            <div class="w-1/20"></div>
            <button 
               class="w-3/20 btn"
               :disabled="isButtonDisabled(player)"
               :class="{
                  'btn--secondary': !getPenaltyResult(player.playerID),
                  'btn--success': getPenaltyResult(player.playerID) === 'scored',
                  'btn--danger': getPenaltyResult(player.playerID) === 'saved'
               }"
               @click="handleClick(player)"
            >
               {{ getButtonText(player) }}
            </button>
         </li>
      </ul>
   </section>
</template>

<script setup lang="ts">
   const props = defineProps<{
      teamName: string,
      goalkeeper?: any
      goalkeeperScore?: any
      penaltyTakersWithScores: any[]
      penaltyTaken?: Set<string>
      penaltyResults?: Map<string, 'scored' | 'saved'>
   }>()

   const emit = defineEmits<{
      'penalty-kick': [player: any]
   }>()

   const getTotalGoals = (score: any) => {
      if (!score) return 0
      return (score.goalsScored ?? 0) + (score.penaltiesScored ?? 0)
   }

   const isPenaltyTaken = (playerID: string) => {
      return props.penaltyTaken?.has(playerID) ?? false
   }

   const hasScore = (player: any) => {
      if (!player.score) return false
      const playerScore = typeof player.score.playerScore === 'number' ? player.score.playerScore : null
      return playerScore !== null && playerScore !== undefined
   }

   const isButtonDisabled = (player: any) => {
      return isPenaltyTaken(player.playerID) || !hasScore(player)
   }

   const getPenaltyResult = (playerID: string) => {
      return props.penaltyResults?.get(playerID)
   }

   const getButtonText = (player: any) => {
      if (!hasScore(player)) return 'N/A'
      if (!isPenaltyTaken(player.playerID)) return 'Tira'

      const result = getPenaltyResult(player.playerID)

      return result === 'scored' ? '⚽' : '✗'
   }

   const handleClick = (player: any) => {
      if (!isPenaltyTaken(player.playerID) && hasScore(player)) {
         emit('penalty-kick', player)
      }
   }

</script>

<style lang="scss" scoped>
   @use '@/assets/scss/main' as *;
   @use 'sass:color';
   
   .penaltyTaker {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      padding: 0.5em 1em;
   
      /* & > * { outline: 1px solid color.change(salmon, $alpha: 0.5); } */
      & > div {
         text-align: center;

         &:nth-of-type(2),
         &:nth-of-type(3) { text-align: left }
      }
   
      &--role {
         border-radius: 100%;
         color: $cream;
         font-weight: 500;
         width: 2em;
         height: 2em;
         display: flex;
         flex-shrink: 0;
         align-items: center;
         justify-content: center;
         margin-right: auto;
      }
      &--score {
         font-weight: 700;
         color: $cream;
         position: relative;
         z-index: 0;
   
         &::before {
            content: "";
            width: 1em;
            height: 1em;
            display: block;
            background-color: $navyBlue;
            border-radius: 50%;
            aspect-ratio: 1;
            z-index: -1;
            position: absolute;
            padding: 0.75em;
            top: 0;
            left: 50%;
            transform: translateX(-50%);
         }
      }
      &.disabled {
         color: darkgrey;

         
         & > .penaltyTaker--role { background-color: lightgray }
      }
   }
   
   .legend {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      font-size: 14px;
      font-weight: 600;
      line-height: 1.15;
   
      & > div {
         text-align: center;
         /* outline: 1px solid color.change(salmon, $alpha: 0.5); */

         &:nth-of-type(2),
         &:nth-of-type(3) { text-align: left }
      }
   }
   </style>