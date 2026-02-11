# SVGs Editables

Este directorio contiene componentes Vue para manejar SVGs de manera editable e interactiva.

## Componentes

### EditableSvg

Componente base para cargar y manipular SVGs con props configurables.

```vue
<script setup>
import { ref } from 'vue'
import { EditableSvg } from '@/components/svgs'

const highlightedRoom = ref(null)

const handleRoomClick = ({ value }) => {
  console.log('Sala clicked:', value)
}
</script>

<template>
  <EditableSvg
    src="/images/Edificio-Principal-Piso(0).svg"
    :highlighted-room="highlightedRoom"
    theme="dark"
    :interactive="true"
    :show-labels="true"
    :opacity="1"
    :scale="1"
    @room-click="handleRoomClick"
  />
</template>
```

#### Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `src` | String | Requerido | Ruta al archivo SVG |
| `highlightedRoom` | String | null | Nombre de sala a resaltar |
| `theme` | String | 'dark' | Tema visual ('dark', 'light', 'custom') |
| `interactive` | Boolean | true | Habilita interacciones de click/hover |
| `showLabels` | Boolean | true | Muestra/oculta etiquetas de texto |
| `opacity` | Number | 1 | Opacidad del SVG (0-1) |
| `scale` | Number | 1 | Escala del SVG |
| `pan` | Object | {x:0, y:0} | Desplazamiento en X e Y |

#### Events

| Event | Payload | Descripción |
|-------|---------|-------------|
| `room-click` | `{ element, value, originalEvent }` | Se emite cuando se hace click en una sala |
| `room-hover` | `{ element, value }` | Se emite cuando el mouse entra/sale de una sala |
| `load` | - | Se emite cuando el SVG termina de cargar |
| `error` | Error | Se emite si hay un error al cargar |

### EdificioPrincipal

Componente específico para el Edificio Principal.

```vue
<script setup>
import { ref } from 'vue'
import { EdificioPrincipal } from '@/components/svgs'

const floor = ref('0')
const highlightedRoom = ref(null)
</script>

<template>
  <EdificioPrincipal
    :floor="floor"
    :highlighted-room="highlightedRoom"
    theme="dark"
    @room-click="({ value }) => highlightedRoom = value"
  />
</template>
```

#### Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `floor` | String | Requerido | Piso del edificio (-2 al 7) |
| `highlightedRoom` | String | null | Sala a resaltar |
| `theme` | String | 'dark' | Tema visual |
| `interactive` | Boolean | true | Habilita interacciones |

### Aulario

Componente específico para el Aulario.

```vue
<script setup>
import { ref } from 'vue'
import { Aulario } from '@/components/svgs'

const floor = ref('0')
const highlightedRoom = ref(null)
</script>

<template>
  <Aulario
    :floor="floor"
    :highlighted-room="highlightedRoom"
    theme="dark"
    @room-click="({ value }) => highlightedRoom = value"
  />
</template>
```

#### Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `floor` | String | Requerido | Piso del aulario (0, 1, 2) |
| `highlightedRoom` | String | null | Sala a resaltar |
| `theme` | String | 'dark' | Tema visual |
| `interactive` | Boolean | true | Habilita interacciones |

## useEditableSvg Composable

Hook para gestionar el estado de SVGs editables.

```javascript
import { useEditableSvg } from '@/composables/useEditableSvg'

const {
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
} = useEditableSvg()

// Resaltar una sala
setHighlightedRoom('Aula 101')

// Cambiar tema
setTheme('light')

// Toggle labels
toggleLabels()

// Cambiar opacidad
setOpacity(0.8)

// Cambiar escala
setScale(1.5)
```

## Temas Disponibles

- **dark**: Fondo oscuro, ideal para uso general
- **light**: Fondo claro, para ambientes luminosos
- **highContrast**: Alto contraste para accesibilidad

## Personalización de Colores

Para temas custom, pasa un objeto con la estructura:

```vue
<EditableSvg
  src="/images/mapa.svg"
  :highlightedRoom="room"
  theme="custom"
  :custom-theme="{
    background: '#1a1a2e',
    fill: '#16213e',
    stroke: '#0f3460',
    text: '#e94560',
    highlight: '#00ff00',
    hover: '#00ffff'
  }"
/>
```

## Slots

Los componentes soportan slots para personalización:

```vue
<EditableSvg src="/images/mapa.svg">
  <template #loading>
    <div class="custom-loader">Cargando...</div>
  </template>
  
  <template #error>
    <div class="custom-error">Error al cargar</div>
  </template>
  
  <template #overlay>
    <div class="custom-overlay">Overlay personalizado</div>
  </template>
</EditableSvg>
```
