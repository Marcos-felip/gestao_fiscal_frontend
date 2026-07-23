import { ref, computed, onMounted, onUnmounted } from 'vue'

/**
 * useNavbar - Gerencia estado do navbar
 *
 * Estado:
 * - isMobileMenuOpen: menu aberto em mobile
 * - isDarkMode: tema escuro ativo
 * - searchQuery: valor atual da busca
 */

const isMobileMenuOpen = ref(false)
const isDarkMode = ref(false)
const searchQuery = ref('')

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

const applyTheme = (dark: boolean) => {
  if (dark) {
    document.documentElement.setAttribute('data-theme', 'dark')
  } else {
    document.documentElement.removeAttribute('data-theme')
  }
}

const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value
  applyTheme(isDarkMode.value)
  localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light')
}

const clearSearch = () => {
  searchQuery.value = ''
}

const isMobile = computed(() => {
  // Simular breakpoint lg: 1024px
  return typeof window !== 'undefined' && window.innerWidth < 1024
})

export const useNavbar = () => {
  onMounted(() => {
    // Carregar preferência de dark mode do localStorage
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark') {
      isDarkMode.value = true
      applyTheme(true)
    }

    // Fechar menu ao apertar ESC
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen.value) {
        isMobileMenuOpen.value = false
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    onUnmounted(() => {
      document.removeEventListener('keydown', handleKeyDown)
    })
  })

  return {
    // State
    isMobileMenuOpen,
    isDarkMode,
    searchQuery,
    isMobile,

    // Methods
    toggleMobileMenu,
    closeMobileMenu,
    toggleDarkMode,
    clearSearch,
  }
}
