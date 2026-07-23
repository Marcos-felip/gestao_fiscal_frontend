<template>
  <div :class="['navbar-actions', 'flex items-center gap-2']">
    <!-- Search mobile toggle -->
    <NavbarButton
      class="md:hidden"
      tooltip="Buscar"
      @click="showSearchModal = true"
    >
      <Icon name="Search" size="md" />
    </NavbarButton>

    <!-- Notifications -->
    <!-- <div class="relative">
      <NavbarButton
        tooltip="Notificações"
        @click="showNotifications = !showNotifications"
      >
        <Icon name="Bell" size="md" />
        <Badge
          v-if="unreadCount > 0"
          :count="unreadCount"
          variant="destructive"
          class="absolute -top-2 -right-2"
        />
      </NavbarButton>

      <Transition name="dropdown-fade">
        <div
          v-if="showNotifications"
          @click="showNotifications = false"
          class="fixed inset-0 z-30 md:hidden"
        />
      </Transition>
    </div> -->

    <!-- Activity -->
    <!-- <NavbarButton
      tooltip="Atividades"
      @click="showActivity = !showActivity"
    >
      <Icon name="Activity" size="md" />
    </NavbarButton> -->

    <!-- Language selector -->
    <!-- <LanguageSelector /> -->

    <!-- Account menu -->
    <AccountMenu />

    <!-- Modal de busca (mobile) -->
    <SearchModal v-model="showSearchModal" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { NavbarButton, Icon } from '@/shared/ui'
// import { useNotifications } from '@/shared/composables'
// import LanguageSelector from './language-selector.vue'
import AccountMenu from './account-menu.vue'
import SearchModal from './search-modal.vue'

// const { unreadCount } = useNotifications()

const showSearchModal = ref(false)
// const showNotifications = ref(false)
// const showActivity = ref(false)
</script>

<style scoped lang="css">
.navbar-actions {
  flex-shrink: 0;
}
</style>
