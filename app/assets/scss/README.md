# SCSS Architecture

This directory contains the structured SCSS architecture for the project.

## Directory Structure

```
app/assets/scss/
├── abstracts/      # Reusable variables, functions, and mixins
│   ├── _variables.scss    # Spacing, breakpoints, z-index, etc.
│   ├── _colors.scss       # Color palette
│   ├── _typography.scss   # Font families, sizes, weights
│   ├── _mixins.scss       # Reusable mixins
│   └── _functions.scss    # Custom SCSS functions
├── base/           # Base styles and resets
│   ├── _reset.scss        # CSS reset
│   └── _base.scss         # Base element styles
├── components/     # Shared component styles
│   └── _components.scss   # Reusable component patterns
└── main.scss       # Main entry point (imports all)
```

## Usage in Components

### Using SCSS Variables

In your Vue component `<style lang="scss">` blocks:

```scss
<style lang="scss">
@use '@/assets/scss/abstracts/variables' as *;
@use '@/assets/scss/abstracts/colors' as *;

.my-component {
  padding: $spacing-md;
  background-color: $color-primary;
  color: $color-text-primary;
  
  @include respond-to(md) {
    padding: $spacing-lg;
  }
}
</style>
```

### Using Colors

```scss
@use '@/assets/scss/abstracts/colors' as *;

.button {
  background-color: $color-button-primary;
  color: $color-text-secondary;
}
```

### Using Typography

```scss
@use '@/assets/scss/abstracts/typography' as *;

.heading {
  font-family: $font-family-sans;
  font-size: $font-size-2xl;
  font-weight: $font-weight-bold;
}
```

### Using Mixins

```scss
@use '@/assets/scss/abstracts/mixins' as *;

.container {
  @include container($container-xl);
}

.flex-center {
  @include flex-center;
}
```

## Working with Tailwind

You can use both Tailwind classes and SCSS together:

```vue
<template>
  <div class="flex items-center p-4 bg-blue-500">
    <!-- Tailwind classes -->
  </div>
</template>

<style lang="scss">
@use '@/assets/scss/abstracts/colors' as *;

.custom-styling {
  // SCSS with variables
  border-color: $color-primary;
}
</style>
```

## Adding New Variables

1. **Colors**: Add to `abstracts/_colors.scss`
2. **Spacing/Breakpoints**: Add to `abstracts/_variables.scss`
3. **Typography**: Add to `abstracts/_typography.scss`
4. **Mixins**: Add to `abstracts/_mixins.scss`

All changes will be automatically available throughout your components.

