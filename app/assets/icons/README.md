# SVG Icons Directory

This directory contains individual SVG icon files that can be imported and used in your components.

## How to Use

### Method 1: Using the Icon Component

1. Place your SVG file in `app/assets/icons/` (e.g., `eye.svg`)
2. Use the Icon component:

```vue
<template>
  <Icon name="eye" :size="24" color="#ffffff" />
</template>
```

### Method 2: Direct SVG Import

Import SVG directly as a component:

```vue
<template>
  <EyeIcon class="w-6 h-6" />
</template>

<script setup>
import EyeIcon from '~/assets/icons/eye.svg'
</script>
```

### Method 3: Inline SVG

Copy SVG code directly into your component:

```vue
<template>
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
    <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
</template>
```

## Recommended SVG Format

For best results, use SVG files that:
- Have a `viewBox` attribute (e.g., `viewBox="0 0 24 24"`)
- Use `currentColor` for fill/stroke (makes them easily colorable)
- Are optimized (no unnecessary metadata)

## Example: Eye Icon (Heroicons)

```svg
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
  <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
</svg>
```

Save this as `app/assets/icons/eye.svg`

## Example: Eye Slash Icon (Heroicons)

```svg
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
  <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 01-4.243-4.243m4.242 4.242L9.88 9.88" />
</svg>
```

Save this as `app/assets/icons/eye-slash.svg`

## Icon Sources

You can get SVG icons from:
- [Heroicons](https://heroicons.com/) - Clean, minimal icons
- [Lucide Icons](https://lucide.dev/) - Beautiful consistent icons
- [Iconify](https://icon-sets.iconify.design/) - Search and download SVGs
- [Feather Icons](https://feathericons.com/) - Simple, beautiful icons

