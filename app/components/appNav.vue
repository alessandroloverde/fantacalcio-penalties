<template>
   <header class="w-full">
      <div class="layout-Wrapper min-h-(--headerHeight) sm:min-h-0">
         <div class="logoflex flex items-center w-full md:w-auto">
            <h1 class="main-title">Fantacalcio <span class="md:flex">25/26</span></h1>
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
               class="appNav--menuBtn sm:hidden withIcon--mobileMenu withIcon--color-cream"
               aria-label="Menu"
               :aria-expanded="menuOpen"
               @click="menuOpen = !menuOpen"
            ></button>
         </div>
      </div>

      <transition name="appNav-mobile">
         <nav
            v-show="menuOpen"
            class="appNav mobile"
         >
            <NuxtLink 
                  to="/"
                  class="appNav--link withIcon--home-duo"
                  :class="{active: route.path === '/' }"
                  @click="menuOpen = false"
            >Home</NuxtLink>

            <NuxtLink 
               to="/settings"
               class="appNav--link withIcon--settings-duo"
               :class="{active: route.path === '/settings' }"
               @click="menuOpen = false"
            >Settings</NuxtLink>

            <NuxtLink 
               to="/calendar"
               class="appNav--link withIcon--calendar-duo"
               :class="{active: route.path === '/calendar' }"
               @click="menuOpen = false"
            >Calendar</NuxtLink>
         </nav >
      </transition>
   </header>
</template>

<script setup lang="ts">
   const route = useRoute()
   const menuOpen = ref<boolean>(false)

   watch(() => route.path, () => {
      menuOpen.value = false
   })
</script>

<style lang="scss" scoped>
   @use '@/assets/scss/main' as *;

   header { background-color: $navyBlue }

   .main-title { 
      width: 100%;
      font-family: $font-family-momo;
      font-size: clamp(1.8rem, 5vw + 0.5rem, $font-size-4xl);
      color: $cream;
      text-transform: uppercase;
      text-align: center;
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

      &.mobile {
         height: calc(100vh - var(--headerHeight));

         & .appNav--link { font-size: $font-size-2xl }
      }
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
         padding: 0.5rem;
         background: transparent;
         border: none;
         cursor: pointer;
         border-radius: $radius-md;
         transition: background-color $transition-fast ease;

         &:hover { background-color: rgba($cream, 0.15) }
         &::before { margin-right: 0 }    
      }
   }

   .appNav-mobile-enter-active,
   .appNav-mobile-leave-active { transition: opacity 0.2s ease, transform 0.2s ease }

   .appNav-mobile-enter-from,
   .appNav-mobile-leave-to {
      opacity: 0;
      transform: translateY(-0.5rem);
   }
</style>