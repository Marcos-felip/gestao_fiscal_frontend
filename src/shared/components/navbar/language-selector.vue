<template>
  <div :class="['language-selector']">
    <NavbarButton
      tooltip="Idioma"
      @click="showMenu = !showMenu"
    >
      <Icon name="Globe" size="md" />
    </NavbarButton>

    <!-- Dropdown menu -->
    <Transition name="dropdown-scale">
      <div
        v-if="showMenu"
        :class="[
          'menu',
          'absolute top-full right-0 mt-2 w-48 rounded-lg border border-border bg-background shadow-lg z-50',
        ]"
      >
        <div class="py-2">
          <button
            v-for="lang in languages"
            :key="lang.code"
            :class="[
              'language-item',
              'w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors',
              currentLanguage === lang.code
                ? 'text-primary bg-muted font-semibold'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted',
            ]"
            @click="selectLanguage(lang.code)"
          >
            <span class="text-base">{{ lang.flag }}</span>
            <span>{{ lang.name }}</span>
            <Icon v-if="currentLanguage === lang.code" name="Check" size="sm" class="ml-auto" />
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { NavbarButton, Icon } from '@/shared/ui'

interface Language {
  code: string
  name: string
  flag: string
}

const languages: Language[] = [
  { code: 'pt-BR', name: 'Português (BR)', flag: '🇧🇷' },
  { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
  { code: 'es-ES', name: 'Español', flag: '🇪🇸' },
]

const showMenu = ref(false)
const currentLanguage = ref('pt-BR')

const selectLanguage = (code: string) => {
  currentLanguage.value = code
  localStorage.setItem('language', code)
  showMenu.value = false

  // TODO: Implementar mudança de idioma com i18n
  console.log('Language changed to:', code)
}
</script>

<style scoped lang="css">
.language-selector {
  position: relative;
}

.menu {
  background-color: var(--color-background);
}

.dropdown-scale-enter-active,
.dropdown-scale-leave-active {
  transition: transform 150ms ease-in-out, opacity 150ms ease-in-out;
}

.dropdown-scale-enter-from,
.dropdown-scale-leave-to {
  transform: scale(0.95) translateY(-4px);
  opacity: 0;
}
</style>
