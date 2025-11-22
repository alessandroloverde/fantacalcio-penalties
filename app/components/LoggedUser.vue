<template>
  <div class="logged-user">
    <span>Logged in as: </span>{{ loggedUser ? loggedUser?.name : "not logged in" }}
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const loggedUser = computed(() => authStore.participant)
</script>

<style scoped lang="scss">
@use '@/assets/scss//main' as *;


.logged-user {
  font-size: 1.2rem;
  font-weight: bold;
  color: #000;
  background-color: $blush;
  padding: 10px;
  border-radius: 5px;
  display: inline-block;
}
</style>

