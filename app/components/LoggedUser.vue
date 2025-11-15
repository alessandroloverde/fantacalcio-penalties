<template>
  <div v-if="loggedUser" class="logged-user"><span>Loggein as: </span>{{ loggedUser.name }}</div>
</template>

<script setup lang="ts">

const { participant: loggedUser } = useLoggedUser()

</script>

<style scoped>

.logged-user {
  font-size: 1.2rem;
  font-weight: bold;
  color: #000;
  background-color: #f0f0f0;
  padding: 10px;
  border-radius: 5px;
}
</style>

