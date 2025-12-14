<template>
      <AppNav />

      <div class="container boxed h-full max-w-7xl mx-auto my-12 px-4 sm:px-6 lg:px-8 py-8">
         <h1 class="withIcon--calculate-duo withIcon--color-blush mb-8">Calcola Rigori</h1>

         <section class="card grid grid-cols-2 gap-x-20 gap-y-4 px-8 py-6">
            <header class="match col-span-2">
               <h2 class="match--title col-span-2 withIcon--shirt-duo withIcon--color-blush">
                  {{ teamAData?.teamData.name }} – {{ teamBData?.teamData.name }}
               </h2>
               <h2 class="match--result">0 – 0</h2>
            </header>
            <div class="divider-text col-span-2 my-2">◎</div>
            <h3 class="col-span-2">{{teamAData?.teamData.name}}</h3>
            <div class="col-span-1">
               <h4 class="mb-1">Portiere</h4>
               <div class="penaltyTaker mb-4">
                  <div class="penaltyTaker--role P">{{ penaltiesStore.penalties[teamA]?.goalkeeper?.role }}</div>
                  <div class="penaltyTaker--name w-2/5">{{ penaltiesStore.penalties[teamA]?.goalkeeper?.name }}</div>
                  <div class="penaltyTaker--squadra">{{ penaltiesStore.penalties[teamA]?.goalkeeper?.squadra }}</div>
               </div>
               <h4 class="mb-1">Rigoristi</h4>
               <ul>
                  <li v-for="player in teamAPenaltyTakers" class="penaltyTaker mb-1">
                     <div class="penaltyTaker--role" :class="player.role">{{ player.role }}</div>
                     <div class="penaltyTaker--name w-2/5">{{ player.name }}</div>
                     <div class="penaltyTaker--squadra">{{ player.squadra }}</div>
                     <button class="btn btn--secondary withIcon--soccerBall-duo btn--icon-left ml-auto">Tira</button>
                  </li>
               </ul>
            </div>
            <div class="col-span-1">
               <h4 class="mb-1">Portiere</h4>
               <div class="penaltyTaker mb-4">
                  <div class="penaltyTaker--role P">{{ penaltiesStore.penalties[teamB]?.goalkeeper?.role }}</div>
                  <div class="penaltyTaker--name w-2/5">{{ penaltiesStore.penalties[teamB]?.goalkeeper?.name }}</div>
                  <div class="penaltyTaker--squadra">{{ penaltiesStore.penalties[teamB]?.goalkeeper?.squadra }}</div>
               </div>
               <h4 class="mb-1">Rigoristi</h4>
               <ul>
                  <li v-for="player in teamBPenaltyTakers" class="penaltyTaker mb-1">
                     <div class="penaltyTaker--role" :class="player.role">{{ player.role }}</div>
                     <div class="penaltyTaker--name w-2/5">{{ player.name }}</div>
                     <div class="penaltyTaker--squadra">{{ player.squadra }}</div>
                     <button class="btn btn--primary withIcon--soccerBall-duo btn--icon-left ml-auto">Tira</button>
                  </li>
               </ul>
            </div>
         </section>
        
      </div>
</template>

<script setup lang="ts">
   import { useTeamsStore } from '../stores/teams'
   import { usePenaltiesStore } from '../stores/penalties'

   const route = useRoute()
   const teamsStore = useTeamsStore()
   const penaltiesStore = usePenaltiesStore()

   const loading = ref(true)

   const teamA = computed(() => route.query.teamA as string)
   const teamB = computed(() => route.query.teamB as string)
   const teamAData = computed(() => 
      teamsStore.teamsWithPlayers.find(t => t.teamId === teamA.value)
   )
   const teamBData = computed(() => 
      teamsStore.teamsWithPlayers.find(t => t.teamId === teamB.value)
   )
   const teamAPenaltyTakers = computed(() => {
         const takers = penaltiesStore.penalties[teamA.value]?.penaltyTakers || []

         return [...takers].sort((a,b) => a.position - b.position)
      }    
   )
   const teamBPenaltyTakers = computed(() => {
         const takers = penaltiesStore.penalties[teamB.value]?.penaltyTakers || []

         return [...takers].sort((a,b) => a.position - b.position)
      }    
   )

   onMounted(async () => {
      await penaltiesStore.fetchPenalties()
      
      loading.value = false
   })

</script>

<style lang="scss" scoped>
   @use '@/assets/scss//main' as *;
   @use 'sass:color';

   .match {
      display: flex;
      justify-content: space-between;
   }

   .penaltyTaker {
      display: flex;
      align-items: center;

      &--role {
         border-radius: 100%;
         color: $cream;
         font-weight: 500;
         width: 2em;
         height: 2em;
         display: flex;
         align-items: center;
         justify-content: center;
         margin-right: 1em;

         &.P { background-color: color.change($navyBlue, $alpha: 0.6) }
         &.D { background-color: color.change($blush, $alpha: 0.6) }
         &.C { background-color: color.change($darkOlive, $alpha: 0.6); }
         &.A { background-color: color.change($brownSugar, $alpha: 0.6); }
      }
      &--name {}
      &--squadra {}
   }
</style>