<template>
      <div class="container boxed h-full max-w-7xl mx-auto my-12 px-4 sm:px-6 lg:px-8 py-8">
         <h1>Calcola Rigori</h1>
         <h2>{{  teamAData?.teamData.name }}  - {{ teamBData?.teamData.name }}</h2>
         <div class="divider-text col-span-4 my-4">◎</div>
         <h3>Rigoristi</h3>
         <section>
            <h4>{{teamAData?.teamData.name}}</h4>
            <ul>
               <li v-for="player in teamAPenaltyTakers">{{ player.name }}</li>
            </ul>
         </section>
         <section>
            <h4>{{teamBData?.teamData.name}}</h4>
            <ul>
               <li v-for="player in teamBPenaltyTakers">{{ player.name }}</li>
            </ul>
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
         const takers = penaltiesStore.penalties[teamA.value] || []

         return [...takers].sort((a,b) => a.position - b.position)
      }    
   )
   const teamBPenaltyTakers = computed(() => {
         const takers = penaltiesStore.penalties[teamB.value] || []

         return [...takers].sort((a,b) => a.position - b.position)
      }    
   )

   onMounted(async () => {
      await penaltiesStore.fetchPenalties()
      
      loading.value = false
   })

</script>