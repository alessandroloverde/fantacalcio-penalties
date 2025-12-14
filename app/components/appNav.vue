<template>
   <div>
      <nav class="appNav">
         <NuxtLink 
         to="/"
         class="appNav--link"
         :class="{active: route.path === '/' }"
         >Home</NuxtLink>

         <NuxtLink 
         to="settings"
         class="appNav--link"
         :class="{active: route.path === '/settings' }"
         >Settings</NuxtLink>

         <NuxtLink 
         to="calendar"
         class="appNav--link"
         :class="{active: route.path === '/calendar' }"
         >Calendar</NuxtLink>
      </nav>
   </div>
</template>

<script setup lang="ts">
   const route = useRoute()
</script>

<style lang="scss" scoped>
   @use '@/assets/scss/main' as *;

   .appNav {
      display: flex;
      justify-content: center;
      gap: 2rem;
      padding: 1rem 2rem;
      background-color: $navyBlue;
      border-bottom: 3px solid $blush;

      &--link {
         display: flex;
         align-items: center;
         gap: 0.5rem;
         padding: 0.75rem 1.25rem;
         color: $cream;
         text-decoration: none;
         font-weight: $font-weight-semibold;
         text-transform: uppercase;
         letter-spacing: 0.05em;
         border-radius: $radius-md;
         transition: background-color $transition-fast ease, color $transition-fast ease;

         &:hover { background-color: rgba($cream, 0.15) }

         &.active {
            background-color: $blush;
            color: white;
         }
      }
   }
</style>