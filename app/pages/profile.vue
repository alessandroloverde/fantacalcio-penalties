<template>
  <AppNav />

  <div class="container boxed h-full max-w-7xl mx-auto my-12 px-4 sm:px-6 lg:px-8 py-8">
    <div v-if="loading">Loading...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="loggedUser" class="profile">
      <h1 class="withIcon--userCircle-duo withIcon--color-blush mb-8">Profile</h1>

      <section class="card p-8">
        <div class="profile-info">
          <div class="profile-field">
            <label class="profile-label">Name:</label>
            <span class="profile-value">{{ loggedUser.name }}</span>
          </div>

          <div class="profile-field">
            <label class="profile-label">User ID:</label>
            <span class="profile-value profile-value--id">{{ loggedUser.id }}</span>
          </div>

          <div class="profile-field">
            <label class="profile-label">Team:</label>
            <span class="profile-value">{{ loggedUser.teamName }}</span>
          </div>

          <div class="profile-field">
            <label class="profile-label">TeamID:</label>
            <span class="profile-value profile-value--id">{{ loggedUser.teamId }}</span>
          </div>
        </div>
      </section>
      <button 
        class="btn btn--danger withIcon--logout btn--icon-left my-4 ml-8" 
        @click="handleLogout"
      >Logout</button>
    </div>
    <div v-else>
      <p>Please log in to view your profile.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useAuthStore } from '../stores/auth'

  const authStore = useAuthStore()
  const router = useRouter()
  const loggedUser = computed(() => authStore.participant)
  const loading = computed(() => authStore.loading)
  const error = computed(() => authStore.error)

  const handleLogout = async () => {
    await authStore.logout()
    router.push('/login')
  }

  onMounted(() => {
    authStore.fetchParticipant(loggedUser.value?.id ?? '')
  })
</script>

<style scoped lang="scss">
  @use '@/assets/scss//main' as *;

  .profile-info {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .profile-field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .profile-label {
    font-weight: $font-weight-semibold;
    color: $navyBlue;
    text-transform: uppercase;
    font-size: 0.875rem;
    letter-spacing: 0.05em;
  }

  .profile-value {
    font-size: 1.125rem;
    color: #000;

    &--id {
      font-family: monospace;
      font-size: 0.875rem;
      color: $navyBlue;
      background-color: rgba($navyBlue, 0.1);
      padding: 0.5rem;
      border-radius: $radius-sm;
    }
  }

  .error {
    color: $blush;
    font-weight: $font-weight-semibold;
  }
</style>