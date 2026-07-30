<template>
  <div :class="['navbar-actions', 'flex items-center gap-1']">
    <!-- Empresa ativa / troca de empresa -->
    <CompanySwitcher />
    <span class="mx-1 hidden h-5 w-px bg-white/20 sm:block" aria-hidden="true" />

    <!-- Busca: ícone que abre o modal -->
    <NavbarButton
      tone="light"
      tooltip="Buscar (Ctrl+K)"
      @click="showSearchModal = true"
    >
      <Icon name="Search" size="md" />
    </NavbarButton>

    <div class="relative">
      <NavbarButton tone="light" tooltip="Notificações" @click="showNotifications = !showNotifications">
        <Icon name="Bell" size="md" />
        <Badge v-if="unreadCount > 0" :count="unreadCount" variant="destructive" class="absolute -top-1 -right-1" />
      </NavbarButton>

      <Transition name="dropdown-fade">
        <div v-if="showNotifications" @click="showNotifications = false" class="fixed inset-0 z-30 md:hidden" />
      </Transition>
    </div>

    <NavbarButton tone="light" tooltip="Atividades" @click="showActivity = !showActivity">
      <Icon name="Activity" size="md" />
    </NavbarButton>

    <!-- Seletor de idioma oculto até haver i18n de fato.
    <LanguageSelector tone="light" />
    -->

    <AccountMenu tone="light" />

    <!-- Modal de busca -->
    <SearchModal v-model="showSearchModal" />
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { NavbarButton, Icon, Badge } from '@/shared/ui'
import { useNotifications } from '@/shared/composables'
// import LanguageSelector from './language-selector.vue' // reativar com i18n
import AccountMenu from './account-menu.vue'
import CompanySwitcher from './company-switcher.vue'
import SearchModal from './search-modal.vue'

const { unreadCount } = useNotifications()

const showSearchModal = ref(false)
const showNotifications = ref(false)
const showActivity = ref(false)

// Atalho global para abrir a busca: Ctrl/⌘ + K (ou + /).
function onGlobalKeydown(event: KeyboardEvent): void {
  const combo = event.ctrlKey || event.metaKey
  if (combo && (event.key === 'k' || event.key === '/')) {
    event.preventDefault()
    showSearchModal.value = true
  }
}

onMounted(() => document.addEventListener('keydown', onGlobalKeydown))
onBeforeUnmount(() => document.removeEventListener('keydown', onGlobalKeydown))
</script>

<style scoped lang="css">
.navbar-actions {
  flex-shrink: 0;
}
</style>
