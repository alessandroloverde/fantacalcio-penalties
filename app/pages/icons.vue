<template>
  <div class="icons-reference">
    <div class="container">
      <h1>Icon Reference</h1>
      <p class="description">
        This page shows available icons from popular icon libraries.
        Click on any icon to copy its name/code.
      </p>

      <!-- Icon Libraries Section -->
      <section class="library-section">
        <h2>Popular Icon Libraries</h2>
        <div class="libraries-grid">
          <div class="library-card">
            <h3>Heroicons</h3>
            <p>Clean, minimal icons by Tailwind CSS team</p>
            <span class="badge">~400 icons</span>
          </div>
          <div class="library-card">
            <h3>Lucide Icons</h3>
            <p>Beautiful & consistent icon toolkit</p>
            <span class="badge">~1,000 icons</span>
          </div>
          <div class="library-card">
            <h3>Iconify</h3>
            <p>Unified icon framework (100,000+ icons)</p>
            <span class="badge">100k+ icons</span>
          </div>
          <div class="library-card">
            <h3>Font Awesome</h3>
            <p>Popular icon library with many variants</p>
            <span class="badge">~2,000 icons</span>
          </div>
        </div>
      </section>

      <!-- Common Icons Section -->
      <section class="icons-section">
        <h2>Common Icons (Heroicons)</h2>
        <div class="icons-grid">
          <div 
            v-for="icon in heroicons" 
            :key="icon.name"
            class="icon-item"
            @click="copyIcon(icon)"
          >
            <div class="icon-wrapper">
              <img 
                :src="`https://api.iconify.design/${icon.icon}.svg?color=%23ffffff`" 
                :alt="icon.name"
                class="icon"
              />
            </div>
            <span class="icon-name">{{ icon.name }}</span>
            <code class="icon-code">{{ icon.icon }}</code>
          </div>
        </div>
      </section>

      <!-- UI Icons Section -->
      <section class="icons-section">
        <h2>UI Icons (Heroicons)</h2>
        <div class="icons-grid">
          <div 
            v-for="icon in uiIcons" 
            :key="icon.name"
            class="icon-item"
            @click="copyIcon(icon)"
          >
            <div class="icon-wrapper">
              <img 
                :src="`https://api.iconify.design/${icon.icon}.svg?color=%23ffffff`" 
                :alt="icon.name"
                class="icon"
              />
            </div>
            <span class="icon-name">{{ icon.name }}</span>
            <code class="icon-code">{{ icon.icon }}</code>
          </div>
        </div>
      </section>

      <!-- Login Page Icons (for password toggle) -->
      <section class="icons-section">
        <h2>Login/Form Icons</h2>
        <div class="icons-grid">
          <div 
            v-for="icon in formIcons" 
            :key="icon.name"
            class="icon-item"
            @click="copyIcon(icon)"
          >
            <div class="icon-wrapper">
              <img 
                :src="`https://api.iconify.design/${icon.icon}.svg?color=%23ffffff`" 
                :alt="icon.name"
                class="icon"
              />
            </div>
            <span class="icon-name">{{ icon.name }}</span>
            <code class="icon-code">{{ icon.icon }}</code>
          </div>
        </div>
      </section>

      <!-- Copy Notification -->
      <div v-if="copiedIcon" class="copy-notification">
        Copied: <code>{{ copiedIcon }}</code>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const copiedIcon = ref<string | null>(null)

const heroicons = [
  { name: 'Home', icon: 'heroicons:home' },
  { name: 'User', icon: 'heroicons:user' },
  { name: 'Users', icon: 'heroicons:users' },
  { name: 'Settings', icon: 'heroicons:cog-6-tooth' },
  { name: 'Search', icon: 'heroicons:magnifying-glass' },
  { name: 'Menu', icon: 'heroicons:bars-3' },
  { name: 'Close', icon: 'heroicons:x-mark' },
  { name: 'Check', icon: 'heroicons:check' },
  { name: 'Arrow Right', icon: 'heroicons:arrow-right' },
  { name: 'Arrow Left', icon: 'heroicons:arrow-left' },
  { name: 'Download', icon: 'heroicons:arrow-down-tray' },
  { name: 'Upload', icon: 'heroicons:arrow-up-tray' },
  { name: 'Edit', icon: 'heroicons:pencil' },
  { name: 'Delete', icon: 'heroicons:trash' },
  { name: 'Plus', icon: 'heroicons:plus' },
  { name: 'Minus', icon: 'heroicons:minus' },
]

const uiIcons = [
  { name: 'Eye', icon: 'heroicons:eye' },
  { name: 'Eye Slash', icon: 'heroicons:eye-slash' },
  { name: 'Lock', icon: 'heroicons:lock-closed' },
  { name: 'Unlock', icon: 'heroicons:lock-open' },
  { name: 'Bell', icon: 'heroicons:bell' },
  { name: 'Star', icon: 'heroicons:star' },
  { name: 'Heart', icon: 'heroicons:heart' },
  { name: 'Share', icon: 'heroicons:share' },
  { name: 'Bookmark', icon: 'heroicons:bookmark' },
  { name: 'Calendar', icon: 'heroicons:calendar' },
  { name: 'Clock', icon: 'heroicons:clock' },
  { name: 'Information', icon: 'heroicons:information-circle' },
  { name: 'Exclamation', icon: 'heroicons:exclamation-triangle' },
  { name: 'Check Circle', icon: 'heroicons:check-circle' },
  { name: 'X Circle', icon: 'heroicons:x-circle' },
  { name: 'Filter', icon: 'heroicons:funnel' },
]

const formIcons = [
  { name: 'Eye (Show)', icon: 'heroicons:eye' },
  { name: 'Eye Slash (Hide)', icon: 'heroicons:eye-slash' },
  { name: 'Email', icon: 'heroicons:envelope' },
  { name: 'Password', icon: 'heroicons:key' },
  { name: 'User Circle', icon: 'heroicons:user-circle' },
  { name: 'Lock', icon: 'heroicons:lock-closed' },
  { name: 'Check', icon: 'heroicons:check-circle' },
  { name: 'X Mark', icon: 'heroicons:x-circle' },
]

function copyIcon(icon: { name: string; icon: string }) {
  navigator.clipboard.writeText(icon.icon)
  copiedIcon.value = icon.icon
  setTimeout(() => {
    copiedIcon.value = null
  }, 2000)
}
</script>

<style lang="scss" scoped>
@use '@/assets/scss/abstracts/colors' as *;
@use '@/assets/scss/abstracts/variables' as *;
@use '@/assets/scss/abstracts/typography' as *;
@use '@/assets/scss/abstracts/mixins' as *;

.icons-reference {
  min-height: 100vh;
  background-color: $color-bg-light;
  padding: $spacing-xl 0;
  color: $color-text-primary;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 $spacing-md;
}

h1 {
  @include typography('h1');
  color: $color-text-primary;
  margin-bottom: $spacing-sm;
}

.description {
  @include typography('body');
  color: $color-text-primary;
  opacity: 0.8;
  margin-bottom: $spacing-xl;
}

.library-section,
.icons-section {
  margin-bottom: $spacing-3xl;
}

h2 {
  @include typography('h2');
  color: $color-text-primary;
  margin-bottom: $spacing-lg;
  border-bottom: 2px solid $color-primary;
  padding-bottom: $spacing-sm;
}

.libraries-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: $spacing-lg;
  margin-bottom: $spacing-xl;
}

.library-card {
  background: $color-bg-dark;
  padding: $spacing-lg;
  border-radius: $radius-lg;
  border: 1px solid rgba(255, 255, 255, 0.1);

  h3 {
    @include typography('h3');
    margin-bottom: $spacing-sm;
  }

  p {
    @include typography('body');
    opacity: 0.8;
    margin-bottom: $spacing-md;
  }

  .badge {
    display: inline-block;
    background: $color-primary;
    color: white;
    padding: $spacing-xs $spacing-sm;
    border-radius: $radius-full;
    font-size: $font-size-sm;
    font-weight: $font-weight-semibold;
  }
}

.icons-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: $spacing-md;
}

.icon-item {
  background: $color-bg-dark;
  padding: $spacing-md;
  border-radius: $radius-lg;
  text-align: center;
  cursor: pointer;
  transition: all $transition-fast;
  border: 2px solid transparent;

  &:hover {
    border-color: $color-primary;
    transform: translateY(-2px);
    box-shadow: $shadow-lg;
  }

  .icon-wrapper {
    background: $color-primary;
    width: 48px;
    height: 48px;
    border-radius: $radius-md;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto $spacing-sm;
  }

  .icon {
    width: 24px;
    height: 24px;
  }

  .icon-name {
    display: block;
    @include typography('small');
    color: $color-text-primary;
    margin-bottom: $spacing-xs;
    font-weight: $font-weight-medium;
  }

  .icon-code {
    display: block;
    @include typography('small');
    color: $color-text-muted;
    font-family: $font-family-mono;
    font-size: 0.7rem;
    word-break: break-all;
  }
}

.copy-notification {
  position: fixed;
  bottom: $spacing-xl;
  right: $spacing-xl;
  background: $color-success;
  color: white;
  padding: $spacing-md $spacing-lg;
  border-radius: $radius-lg;
  box-shadow: $shadow-xl;
  z-index: $z-tooltip;
  animation: slideIn 0.3s ease-out;

  code {
    font-family: $font-family-mono;
    background: rgba(0, 0, 0, 0.2);
    padding: $spacing-xs $spacing-sm;
    border-radius: $radius-sm;
    margin-left: $spacing-xs;
  }
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .icons-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: $spacing-sm;
  }

  .libraries-grid {
    grid-template-columns: 1fr;
  }
}
</style>

