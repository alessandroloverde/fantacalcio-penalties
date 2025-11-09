<template>
  <span 
    :class="['icon-wrapper', className]"
    :style="{ 
      width: typeof size === 'number' ? `${size}px` : size,
      height: typeof size === 'number' ? `${size}px` : size,
      color: color,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    }"
    v-html="iconSvg"
  />
</template>

<script setup lang="ts">
interface Props {
  name: string
  size?: number | string
  color?: string
  className?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 24,
  color: 'currentColor',
  className: ''
})

const iconSvg = ref<string>('')

// Load SVG file
onMounted(async () => {
  try {
    // Import SVG as text
    const response = await fetch(`/assets/icons/${props.name}.svg`)
    if (response.ok) {
      iconSvg.value = await response.text()
      // Update color in SVG
      if (props.color !== 'currentColor') {
        iconSvg.value = iconSvg.value.replace(/stroke="currentColor"/g, `stroke="${props.color}"`)
        iconSvg.value = iconSvg.value.replace(/fill="currentColor"/g, `fill="${props.color}"`)
      }
    }
  } catch (error) {
    console.warn(`Icon "${props.name}" not found`)
  }
})
</script>

<style scoped>
.icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-wrapper :deep(svg) {
  width: 100%;
  height: 100%;
  display: block;
}
</style>

