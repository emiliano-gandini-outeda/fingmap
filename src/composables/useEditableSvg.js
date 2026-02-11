import { ref, computed } from 'vue'

export function useEditableSvg() {
  const highlightedRoom = ref(null)
  const currentTheme = ref('dark')
  const isInteractive = ref(true)
  const showLabels = ref(true)
  const opacity = ref(1)
  const scale = ref(1)
  
  const themes = {
    dark: {
      background: '#2d2d2d',
      fill: '#3a3a3a',
      stroke: '#4a4a4a',
      text: '#ffffff',
      highlight: '#ff4444',
      hover: '#4a6fa5'
    },
    light: {
      background: '#f5f5f5',
      fill: '#ffffff',
      stroke: '#cccccc',
      text: '#333333',
      highlight: '#ff4444',
      hover: '#6fa5ff'
    },
    highContrast: {
      background: '#000000',
      fill: '#1a1a1a',
      stroke: '#ffffff',
      text: '#ffffff',
      highlight: '#00ff00',
      hover: '#00ffff'
    }
  }
  
  const setHighlightedRoom = (room) => {
    highlightedRoom.value = room
  }
  
  const clearHighlight = () => {
    highlightedRoom.value = null
  }
  
  const setTheme = (theme) => {
    if (themes[theme]) {
      currentTheme.value = theme
    }
  }
  
  const toggleLabels = () => {
    showLabels.value = !showLabels.value
  }
  
  const toggleInteraction = () => {
    isInteractive.value = !isInteractive.value
  }
  
  const setOpacity = (value) => {
    opacity.value = Math.max(0, Math.min(1, value))
  }
  
  const setScale = (value) => {
    scale.value = Math.max(0.25, Math.min(3, value))
  }
  
  const currentThemeConfig = computed(() => themes[currentTheme.value])
  
  return {
    highlightedRoom,
    currentTheme,
    isInteractive,
    showLabels,
    opacity,
    scale,
    themes,
    currentThemeConfig,
    setHighlightedRoom,
    clearHighlight,
    setTheme,
    toggleLabels,
    toggleInteraction,
    setOpacity,
    setScale
  }
}
