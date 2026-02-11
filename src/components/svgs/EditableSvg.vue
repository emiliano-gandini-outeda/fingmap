<script setup>
import { ref, computed, watch, onMounted } from 'vue'

const props = defineProps({
  src: {
    type: String,
    required: true
  },
  highlightedRoom: {
    type: String,
    default: null
  },
  theme: {
    type: String,
    default: 'dark'
  },
  interactive: {
    type: Boolean,
    default: true
  },
  showLabels: {
    type: Boolean,
    default: true
  },
  opacity: {
    type: Number,
    default: 1
  },
  scale: {
    type: Number,
    default: 1
  },
  pan: {
    type: Object,
    default: () => ({ x: 0, y: 0 })
  }
})

const emit = defineEmits(['room-click', 'room-hover', 'load', 'error'])

const mapContainer = ref(null)
const svgContent = ref('')
const loading = ref(true)
const error = ref(null)
const parsedSvg = ref(null)

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
  custom: {
    background: props.background || '#2d2d2d',
    fill: props.fill || '#3a3a3a',
    stroke: props.stroke || '#4a4a4a',
    text: props.text || '#ffffff',
    highlight: props.highlight || '#ff4444',
    hover: props.hover || '#4a6fa5'
  }
}

const currentTheme = computed(() => themes[props.theme] || themes.dark)

const loadMap = async () => {
  if (!props.src) return
  
  loading.value = true
  error.value = null
  
  try {
    const response = await fetch(props.src)
    if (!response.ok) {
      throw new Error('Error al cargar el mapa')
    }
    
    const text = await response.text()
    svgContent.value = text
    
    await new Promise(resolve => setTimeout(resolve, 100))
    
    parseAndSetupSvg()

    if (props.highlightedRoom) {
      setTimeout(() => highlightRoom(props.highlightedRoom), 200)
    }

    emit('load')
    loading.value = false
  } catch (err) {
    error.value = err.message
    emit('error', err)
    loading.value = false
  }
}

const parseAndSetupSvg = () => {
  if (!mapContainer.value) return
  
  const svg = mapContainer.value.querySelector('svg')
  if (!svg) return
  
  parsedSvg.value = svg
  
  applyTheme(svg)
  
  if (props.interactive) {
    setupInteractions(svg)
  }
}

const applyTheme = (svg) => {
  const theme = currentTheme.value
  
  svg.style.background = theme.background
  svg.style.backgroundColor = theme.background
  
  svg.querySelectorAll('*').forEach(el => {
    const tagName = el.tagName.toLowerCase()
    
    if (['path', 'rect', 'polygon', 'circle', 'ellipse', 'g'].includes(tagName)) {
      const fill = el.getAttribute('fill') || ''
      const stroke = el.getAttribute('stroke') || ''
      
      if (!fill || fill === 'none' || fill === '#000' || fill === '#000000') {
        el.setAttribute('fill', theme.fill)
        el.style.fill = theme.fill
      }
      
      if (stroke && stroke !== 'none') {
        el.setAttribute('stroke', theme.stroke)
        el.style.stroke = theme.stroke
      }
    }
    
    if (tagName === 'text' || tagName === 'tspan') {
      el.setAttribute('fill', theme.text)
      el.style.fill = theme.text
      el.style.opacity = props.showLabels ? 1 : 0
    }
  })
}

const setupInteractions = (svg) => {
  const roomElements = new Map()
  
  svg.querySelectorAll('*').forEach(el => {
    const tagName = el.tagName.toLowerCase()
    const value = el.getAttribute('value') || el.textContent?.trim() || ''
    
    if (['path', 'rect', 'polygon', 'circle', 'ellipse', 'g'].includes(tagName)) {
      if (value && value.length > 1 && !isCommonElement(value)) {
        el.style.cursor = 'pointer'
        el.style.transition = 'all 0.2s ease'
        
        const originalFill = el.getAttribute('fill') || currentTheme.value.fill
        
        roomElements.set(el, { originalFill, value })
        
        el.addEventListener('click', (e) => {
          e.stopPropagation()
          emit('room-click', { element: el, value, originalEvent: e })
        })
        
        el.addEventListener('mouseenter', () => {
          el.setAttribute('fill', currentTheme.value.hover)
          el.style.fill = currentTheme.value.hover
          emit('room-hover', { element: el, value })
        })
        
        el.addEventListener('mouseleave', () => {
          el.setAttribute('fill', originalFill)
          el.style.fill = originalFill
          emit('room-hover', { element: el, value: null })
        })
      }
    }
  })
  
  svg._roomElements = roomElements
}

const isCommonElement = (value) => {
  const commonValues = [
    'Escaleras', 'Ascensor', 'ENTRADA', 'Entrada', 'Baño', 'Baños',
    'Escalera', 'Ascensores', 'Salida', 'SERVICIO', 'Servicio',
    'Kiosco', 'Cafetería', 'Cafeteria', 'Biblioteca', 'Secretaría',
    'Secretaria', 'Aseo', 'Aseos', 'WC', 'wc', 'WC ', ' wc'
  ]
  return commonValues.some(cv => value.toLowerCase().includes(cv.toLowerCase()))
}

const highlightRoom = (roomName) => {
  if (!parsedSvg.value) {
    console.log('No parsed SVG found')
    return
  }

  const svg = parsedSvg.value
  console.log('Searching for room:', roomName)

  svg.querySelectorAll('.room-highlight').forEach(el => {
    if (el.tagName === 'style') {
      el.remove()
    } else {
      el.remove()
    }
  })

  const searchRoom = roomName.toLowerCase().trim()
  let targetElement = null
  let bestScore = 0

  const allElements = svg.querySelectorAll('*')
  console.log('Total elements:', allElements.length)

  for (const el of allElements) {
    const value = el.getAttribute('value') || el.textContent?.trim() || ''
    if (!value) continue

    const lowerValue = value.toLowerCase()
    let score = 0

    if (lowerValue === searchRoom) {
      score = 100
    } else if (lowerValue.includes(searchRoom)) {
      score = 80
    }

    if (score > bestScore) {
      bestScore = score
      targetElement = el
    }
  }

  console.log('Best match:', targetElement?.getAttribute('value') || targetElement?.textContent?.trim(), 'Score:', bestScore)

  if (targetElement && bestScore > 0) {
    try {
      const bbox = targetElement.getBBox()
      console.log('Found bbox:', bbox)

      const centerX = bbox.x + bbox.width / 2
      const pinY = bbox.y - 5

      const style = document.createElementNS('http://www.w3.org/2000/svg', 'style')
      style.textContent = `
        @keyframes pinDrop {
          0% { transform: translateY(-30px); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes shadowGrow {
          0% { rx: 15; ry: 15; opacity: 0; }
          50% { opacity: 1; }
          100% { rx: 12; ry: 4; opacity: 0.5; }
        }
        .location-pin { animation: pinDrop 0.5s ease-out forwards; }
        .pin-shadow { animation: shadowGrow 0.5s ease-out forwards; }
      `
      svg.appendChild(style)

      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g')
      group.setAttribute('class', 'room-highlight location-pin')
      group.style.animation = 'pinDrop 0.6s ease-out forwards'

      const shadow = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse')
      shadow.setAttribute('cx', String(centerX))
      shadow.setAttribute('cy', String(bbox.y + bbox.height + 2))
      shadow.setAttribute('rx', '12')
      shadow.setAttribute('ry', '4')
      shadow.setAttribute('fill', 'rgba(0,0,0,0.4)')
      shadow.setAttribute('class', 'pin-shadow')
      group.appendChild(shadow)

      const pin = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      pin.setAttribute('d', `M ${centerX} ${bbox.y + bbox.height - 2} C ${centerX - 18} ${bbox.y + bbox.height - 2} ${centerX - 18} ${pinY + 15} ${centerX} ${pinY} C ${centerX + 18} ${pinY + 15} ${centerX + 18} ${bbox.y + bbox.height - 2} ${centerX} ${bbox.y + bbox.height - 2} Z`)
      pin.setAttribute('fill', '#ff4444')
      pin.setAttribute('stroke', '#ffffff')
      pin.setAttribute('stroke-width', '2')
      pin.setAttribute('stroke-linejoin', 'round')
      group.appendChild(pin)

      const innerDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
      innerDot.setAttribute('cx', String(centerX))
      innerDot.setAttribute('cy', String(pinY + 12))
      innerDot.setAttribute('r', '5')
      innerDot.setAttribute('fill', '#ffffff')
      group.appendChild(innerDot)

      svg.appendChild(group)
      console.log('Pin added successfully')

    } catch (e) {
      console.error('Error creating highlight:', e)
    }
  }
}

const clearHighlight = () => {
  if (!parsedSvg.value) return

  const svg = parsedSvg.value
  svg.querySelectorAll('.room-highlight').forEach(el => el.remove())
  svg.querySelectorAll('style').forEach(style => {
    if (style.textContent.includes('pinDrop') || style.textContent.includes('shadowGrow')) {
      style.remove()
    }
  })
}

watch(() => [props.src, props.highlightedRoom], ([newSrc, newHighlightedRoom]) => {
  console.log('Watcher triggered - src:', !!newSrc, 'highlightedRoom:', newHighlightedRoom)
  if (newSrc) {
    loadMap()
  } else if (newHighlightedRoom && parsedSvg.value) {
    console.log('Applying highlight immediately')
    highlightRoom(newHighlightedRoom)
  } else if (newHighlightedRoom && !parsedSvg.value) {
    console.log('SVG not loaded yet, will apply highlight after load')
  }
})

watch(() => props.highlightedRoom, (newVal) => {
  console.log('highlightedRoom changed:', newVal, 'parsedSvg:', !!parsedSvg.value)
  if (newVal) {
    if (parsedSvg.value) {
      highlightRoom(newVal)
    } else {
      console.log('parsedSvg not ready, waiting...')
      const checkInterval = setInterval(() => {
        if (parsedSvg.value) {
          clearInterval(checkInterval)
          console.log('parsedSvg ready, applying highlight')
          highlightRoom(newVal)
        }
      }, 100)
      setTimeout(() => clearInterval(checkInterval), 5000)
    }
  } else {
    clearHighlight()
  }
})

onMounted(() => {
  loadMap()
})
</script>

<template>
  <div 
    class="editable-svg" 
    ref="mapContainer"
    :style="{ 
      opacity,
      transform: `scale(${scale})`,
      transformOrigin: 'center center'
    }"
  >
    <div v-if="loading" class="loading">
      <slot name="loading">
        <div class="spinner"></div>
        <p>Cargando mapa...</p>
      </slot>
    </div>
    
    <div v-else-if="error" class="error">
      <slot name="error">
        <p>{{ error }}</p>
        <button @click="loadMap">Reintentar</button>
      </slot>
    </div>
    
    <div 
      v-else 
      class="svg-container"
      v-html="svgContent"
    ></div>
    
    <slot name="overlay"></slot>
  </div>
</template>

<style scoped>
.editable-svg {
  width: 100%;
  height: 100%;
  position: relative;
  transition: opacity 0.3s ease;
}

.loading,
.error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #4a4a4a;
  border-top-color: var(--navy, #003366);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error button {
  margin-top: 1rem;
  padding: 0.5rem 1.5rem;
  background: var(--navy, #003366);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.svg-container {
  width: 100%;
  height: 100%;
}

:deep(.svg-container svg) {
  width: 100%;
  height: 100%;
  display: block;
}

:deep(.svg-container svg text),
:deep(.svg-container svg tspan) {
  transition: opacity 0.3s ease;
}
</style>
