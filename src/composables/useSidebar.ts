import { ref, computed, onMounted, onUnmounted } from 'vue'

/**
 * useSidebar - Gerencia estado da sidebar
 *
 * Estado:
 * - isOpen: drawer aberto em mobile
 * - expandedItems: items do accordion expandidos
 */

const isOpen = ref(false)
const expandedItems = ref<string[]>([])

const toggle = () => {
  isOpen.value = !isOpen.value
}

const open = () => {
  isOpen.value = true
}

const close = () => {
  isOpen.value = false
}

const toggleItem = (id: string) => {
  const index = expandedItems.value.indexOf(id)
  if (index > -1) {
    expandedItems.value.splice(index, 1)
  } else {
    expandedItems.value.push(id)
  }
}

const isItemExpanded = (id: string) => computed(() => {
  return expandedItems.value.includes(id)
})

const collapseAll = () => {
  expandedItems.value = []
}

const isMobile = computed(() => {
  // Simular breakpoint lg: 1024px
  return typeof window !== 'undefined' && window.innerWidth < 1024
})

export const useSidebar = () => {
  onMounted(() => {
    // Fechar drawer ao apertar ESC
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen.value) {
        isOpen.value = false
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    onUnmounted(() => {
      document.removeEventListener('keydown', handleKeyDown)
    })
  })

  return {
    // State
    isOpen,
    expandedItems,
    isMobile,

    // Methods
    toggle,
    open,
    close,
    toggleItem,
    isItemExpanded,
    collapseAll,
  }
}
