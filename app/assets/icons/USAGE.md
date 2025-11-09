# Using SVG Icons in Your Project

## Simple Method: Direct Import (Recommended)

### 1. Place SVG files in `app/assets/icons/`

Example: `app/assets/icons/eye.svg`

### 2. Import and use in your component:

```vue
<template>
  <div>
    <!-- Import SVG directly -->
    <img src="~/assets/icons/eye.svg" alt="Eye icon" class="w-6 h-6" />
    
    <!-- Or use as inline SVG component -->
    <EyeIcon class="w-6 h-6 text-white" />
  </div>
</template>

<script setup>
// Import SVG as component (Nuxt handles this automatically)
import EyeIcon from '~/assets/icons/eye.svg'
</script>
```

## Method 2: Using the Icon Component

Use the `Icon` component wrapper:

```vue
<template>
  <Icon name="eye" :size="24" color="#ffffff" />
  <Icon name="eye-slash" :size="20" color="currentColor" />
</template>
```

## Method 3: Inline SVG (Best for customization)

Copy the SVG code directly into your template:

```vue
<template>
  <button class="toggle-password">
    <svg 
      v-if="showPassword"
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke-width="1.5" 
      stroke="currentColor"
      class="w-6 h-6"
    >
      <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 01-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
    <svg 
      v-else
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke-width="1.5" 
      stroke="currentColor"
      class="w-6 h-6"
    >
      <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  </button>
</template>
```

## Where to Get SVG Icons

1. **Heroicons** - https://heroicons.com/
   - Click any icon → Copy SVG code
   - Paste into a new file in `app/assets/icons/`

2. **Lucide Icons** - https://lucide.dev/
   - Browse icons → Click → Download SVG

3. **Iconify** - https://icon-sets.iconify.design/
   - Search → Click icon → Download SVG

## Example: Updating Login Page Password Toggle

Replace emoji icons with SVG:

```vue
<template>
  <button 
    type="button" 
    class="toggle-password"
    @click="showPassword = !showPassword"
  >
    <!-- Use inline SVG or import -->
    <EyeIcon v-if="!showPassword" class="w-6 h-6" />
    <EyeSlashIcon v-else class="w-6 h-6" />
  </button>
</template>

<script setup>
import EyeIcon from '~/assets/icons/eye.svg'
import EyeSlashIcon from '~/assets/icons/eye-slash.svg'
</script>
```

## Tips

- Use `stroke="currentColor"` or `fill="currentColor"` in SVGs to make them inherit text color
- Keep SVG files simple and optimized
- Use consistent `viewBox` (e.g., `viewBox="0 0 24 24"`) for easier sizing

