<template>
  <div v-if="!loggedUser" class="notLogged-user">
    <NuxtLink to="/login">
      <button class="withIcon--userCircle"></button>
    </NuxtLink>
    <p class="logged-user--name">not logged-in</p>
  </div>
  <div v-else class="logged-user">
    <NuxtLink to="/profile" class="logged-user--link">
      <button class="withIcon--userCircle-duo"></button>
    </NuxtLink>
    <p class="logged-user--name">{{ loggedUser.name }}</p>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const loggedUser = computed(() => authStore.participant)

onMounted(()=> {
  authStore.fetchParticipant(loggedUser.value?.id ?? '')
})
</script>

<style scoped lang="scss">
@use '@/assets/scss//main' as *;

.notLogged-user,
.logged-user {
  display: flex;
  justify-content: flex-end;

  & button[class*="withIcon"] {
    height: 100%;
    display: flex;
    align-items: center;
    color: $cream;
    font-size: $font-size-4xl;
  }
  &--name {
    display: flex;
    align-items: center;
    color: $lightSlategrass;
    line-height: 1;
  }
}
.notLogged-user button {
  //color: lime !important;
}
.logged-user button {
  //color: salmon !important
}
</style>

