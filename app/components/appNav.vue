<template>
   <header class="w-full">
      <div class="layout-Wrapper">
         <div class="logoflex flex items-center">
            <h1 class="main-title">Fantacalcio <span>25/26</span></h1>
         </div>
         <nav class="appNav hidden sm:flex">
            <NuxtLink 
               to="/"
               class="appNav--link withIcon--home-duo"
               :class="{active: route.path === '/' }"
            >Home</NuxtLink>

            <NuxtLink 
               to="/settings"
               class="appNav--link withIcon--settings-duo"
               :class="{active: route.path === '/settings' }"
            >Settings</NuxtLink>

            <NuxtLink 
               to="/calendar"
               class="appNav--link withIcon--calendar-duo"
               :class="{active: route.path === '/calendar' }"
            >Calendar</NuxtLink>
         </nav>
         <div class="flex items-center justify-between gap-2 shrink-0 w-full sm:w-auto">
            <LoggedUser class="hidden xs:block sm:block" />
            <button
               type="button"
               class="appNav--menuBtn sm:hidden withIcon--settings-duo withIcon--color-cream"
               aria-label="Menu"

            ></button>
         </div>
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
      margin: 2vh 0;
      line-height: 1;

      span { color: $blush }
   }

   .appNav {
      //display: flex;
      justify-content: center;
      gap: 2rem;
      padding: 1rem 2rem;
      margin: auto;
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
      &--menuBtn {
         font-size: 40px;
         padding: 0.75rem;
         background: transparent;
         border: none;
         cursor: pointer;
         border-radius: $radius-md;
         transition: background-color $transition-fast ease;

         &:hover {
            background-color: rgba($cream, 0.15);
         }

         &::before {
            margin-right: 0;
         }    
      }
   }
</style>