<script setup>
import { ref, computed, watch } from 'vue'
import { EdificioPrincipal, Aulario } from './svgs'

const props = defineProps({
  mapSrc: String,
  highlightedRoom: String,
  building: String,
  floor: String
})

const emit = defineEmits(['room-click'])

const currentScale = ref(1)
const pan = ref({ x: 0, y: 0 })

const ComponentMap = computed(() => {
  return props.building === 'aulario' ? Aulario : EdificioPrincipal
})

const handleZoomIn = () => {
  currentScale.value = Math.min(3, currentScale.value + 0.25)
}

const handleZoomOut = () => {
  currentScale.value = Math.max(0.25, currentScale.value - 0.25)
}

const handleReset = () => {
  currentScale.value = 1
  pan.value = { x: 0, y: 0 }
}

const handleRoomClick = ({ value }) => {
  emit('room-click', value)
}

const handleLoad = () => {
  console.log('Mapa cargado correctamente')
}

const handleError = (error) => {
  console.error('Error al cargar mapa:', error)
}

watch(() => [props.mapSrc, props.highlightedRoom], () => {
  currentScale.value = 1
  pan.value = { x: 0, y: 0 }
})
</script>

<template>
  <div class="map-viewer">
    <div class="map-content">
      <div class="map-controls">
        <div class="zoom-controls">
          <button class="zoom-btn" @click="handleZoomIn" title="Acercar">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
          </button>
          <button class="zoom-btn" @click="handleZoomOut" title="Alejar">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M19 13H5v-2h14v2z"/>
            </svg>
          </button>
          <button class="zoom-btn" @click="handleReset" title="Restablecer">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
            </svg>
          </button>
        </div>
        <div class="scale-display">{{ Math.round(currentScale * 100) }}%</div>
      </div>

      <div class="map-scroll-container">
        <div
          class="map-svg-wrapper"
          :style="{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${currentScale})`,
            transformOrigin: '0 0'
          }"
        >
          <ComponentMap
            v-if="floor"
            :floor="floor"
            :highlighted-room="highlightedRoom"
            theme="dark"
            :interactive="true"
            @room-click="handleRoomClick"
            @load="handleLoad"
            @error="handleError"
          />
        </div>
      </div>

      <div v-if="highlightedRoom" class="highlight-banner">
        <svg viewBox="0 0 24 24" width="18" height="18">
          <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
        <span>Sala encontrada: <strong>{{ highlightedRoom }}</strong></span>
        <button class="clear-highlight" @click="$emit('room-click', null)">✕</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.map-viewer {
  background: #3a3a3a;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: var(--shadow);
  position: relative;
}

.map-content {
  display: flex;
  flex-direction: column;
}

.map-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  border-bottom: 1px solid #4a4a4a;
}

.zoom-controls {
  display: flex;
  gap: 0.5rem;
}

.zoom-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: #3a3a3a;
  border: 1px solid #4a4a4a;
  border-radius: 8px;
  cursor: pointer;
  color: var(--white);
  transition: var(--transition);
}

.zoom-btn:hover {
  background: var(--navy);
  color: var(--white);
  border-color: var(--navy);
}

.scale-display {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-muted);
  background: #3a3a3a;
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  border: 1px solid #4a4a4a;
}

.map-scroll-container {
  width: 100%;
  height: 60vh;
  min-height: 400px;
  overflow: auto;
  background: #2d2d2d;
  cursor: grab;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.map-scroll-container::-webkit-scrollbar {
  width: 12px;
  height: 12px;
}

.map-scroll-container::-webkit-scrollbar-track {
  background: #1a1a1a;
  border-radius: 6px;
}

.map-scroll-container::-webkit-scrollbar-thumb {
  background: #4a4a4a;
  border-radius: 6px;
  border: 2px solid #2d2d2d;
}

.map-scroll-container::-webkit-scrollbar-thumb:hover {
  background: #5a5a5a;
}

.map-svg-wrapper {
  padding: 2rem;
  transition: transform 0.1s ease-out;
  min-width: min-content;
  position: relative;
}

.map-svg-wrapper :deep(.editable-svg) {
  width: auto;
  height: auto;
}

.map-svg-wrapper :deep(.editable-svg .svg-container svg) {
  width: auto;
  height: auto;
  max-width: none;
  display: block;
  background: #2d2d2d !important;
}

.map-svg-wrapper :deep(.editable-svg .svg-container svg text),
.map-svg-wrapper :deep(.editable-svg .svg-container svg tspan) {
  font-family: 'Segoe UI', Arial, sans-serif;
  user-select: none;
}

.highlight-banner {
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.25rem;
  background: linear-gradient(135deg, var(--navy-dark) 0%, var(--navy) 100%);
  color: var(--white);
  box-shadow: 0 -4px 20px rgba(0, 31, 63, 0.2);
}

.highlight-banner svg {
  flex-shrink: 0;
  color: #2ecc71;
}

.highlight-banner span {
  flex: 1;
  font-size: 0.95rem;
}

.highlight-banner strong {
  font-weight: 700;
}

.clear-highlight {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: var(--white);
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  transition: var(--transition);
  flex-shrink: 0;
}

.clear-highlight:hover {
  background: rgba(255, 255, 255, 0.3);
}

@media (min-width: 768px) {
  .map-scroll-container {
    height: 65vh;
  }
}

@media (min-width: 1024px) {
  .map-scroll-container {
    height: 70vh;
  }
}
</style>
