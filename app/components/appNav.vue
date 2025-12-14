<template>
   <header class="w-full">
      <div class="container flex max-w-7xl mx-auto p-0 sm:px-6 lg:px-8">
         <div class="logo w-1/3">
            <h1 class="main-title">Fantacalcio <span>25/26</span></h1>
         </div>
         <nav class="appNav w-2/3">
            <NuxtLink 
            to="/"
            class="appNav--link withIcon--home-duo"
            :class="{active: route.path === '/' }"
            >Home</NuxtLink>

            <NuxtLink 
            to="settings"
            class="appNav--link withIcon--settings-duo"
            :class="{active: route.path === '/settings' }"
            >Settings</NuxtLink>

            <NuxtLink 
            to="calendar"
            class="appNav--link withIcon--calendar-duo"
            :class="{active: route.path === '/calendar' }"
            >Calendar</NuxtLink>
         </nav>
      </div>
   </header>
</template>

<script setup lang="ts">
   const route = useRoute()
</script>

<style lang="scss" scoped>
   @use '@/assets/scss/main' as *;

   header { background-color: $navyBlue }

   .main-title { 
      font-family: $font-family-momo;
      font-size: 36px;
      color: $cream;
      text-transform: uppercase;
      text-align: center;
      margin: 3vh auto;

      span { color: $blush }
   }

   .appNav {
      display: flex;
      justify-content: center;
      gap: 2rem;
      padding: 1rem 2rem;
      background-color: $navyBlue;

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