<template>
  <div>
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
  import { useTeamsStore } from './stores/teams'

  const teamsStore = useTeamsStore()

  onMounted(async () => {
    if (teamsStore.teamsWithPlayers.length === 0) {
        await teamsStore.fetchTeams()
    }
  })
</script>