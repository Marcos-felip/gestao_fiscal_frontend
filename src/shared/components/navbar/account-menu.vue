<template>
  <div ref="rootEl" :class="['account-menu']">
    <NavbarButton
      class="relative group"
      :aria-expanded="showMenu"
      aria-haspopup="menu"
      @click="toggleMenu"
    >
      <Avatar :initials="userInitials" size="sm" />
    </NavbarButton>

    <Transition name="dropdown-scale">
      <div
        v-if="showMenu"
        role="menu"
        aria-orientation="vertical"
        tabindex="-1"
        :class="[
          'menu',
          'absolute right-0 top-full mt-2 w-72 overflow-hidden rounded-xl border border-border bg-background shadow-lg z-50',
        ]"
      >
        <!-- User summary -->
        <div class="p-2">
          <Button
            variant="ghost"
            size="sm"
            class="h-auto! px-3! justify-start! gap-3! border-0! bg-transparent! hover:bg-muted!"
            @click="closeMenu"
          >
            <Avatar :initials="userInitials" size="sm" aria-hidden="true" />
            <div class="text-left min-w-0">
              <Span size="sm" weight="semibold" class="truncate">
                {{ userName }}
              </Span>
              <Span size="xs" variant="muted" class="truncate">
                {{ userEmail }}
              </Span>
            </div>
          </Button>
        </div>

        <div class="border-t border-border" />

        <!-- Primary actions -->
        <div class="py-2">
          <Button
            variant="ghost"
            size="sm"
            fullWidth
            class="h-auto! px-4! py-2! justify-start! gap-3! border-0! bg-transparent! hover:bg-muted!"
            @click="handlePlaceholder('settings')"
          >
            <template #icon>
              <Icon name="Settings" size="sm" />
            </template>

            <Span size="sm"> Configurações </Span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            fullWidth
            class="h-auto! px-4! py-2! justify-start! gap-3! border-0! bg-transparent! hover:bg-muted!"
            @click="handlePlaceholder('account')"
          >
            <template #icon>
              <Icon name="User" size="sm" />
            </template>

            <Span size="sm"> Minha conta </Span>
          </Button>
        </div>

        <div class="border-t border-border" />

        <!-- Theme switch -->
        <div class="px-4 py-3">
          <div class="flex items-center gap-3">
            <Span size="sm" class="flex-1"> Tema escuro </Span>

            <Switch
              size="md"
              :model-value="isDarkMode"
              aria-label="Alternar tema escuro"
              @update:model-value="onThemeToggle"
            />
          </div>
        </div>

        <div class="border-t border-border" />

        <!-- Secondary actions -->
        <div class="py-2">
          <Button
            variant="ghost"
            size="sm"
            fullWidth
            class="h-auto! px-4! py-2! justify-start! gap-3! border-0! bg-transparent! hover:bg-muted!"
            @click="handlePlaceholder('team')"
          >
            <template #icon>
              <Icon name="Users" size="sm" />
            </template>

            <Span size="sm"> Gerenciar equipe </Span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            fullWidth
            class="h-auto! px-4! py-2! justify-start! gap-3! border-0! bg-transparent! hover:bg-destructive/10! text-destructive!"
            @click="askLogout"
          >
            <template #icon>
              <Icon name="LogOut" size="sm" />
            </template>

            <Span size="sm"> Sair </Span>
          </Button>
        </div>
      </div>
    </Transition>

    <ConfirmDialog
      v-model="showLogoutConfirm"
      title="Sair da conta"
      description="Você precisará entrar novamente para acessar o sistema."
      confirm-label="Sair"
      cancel-label="Cancelar"
      variant="destructive"
      icon="LogOut"
      @confirm="handleLogout"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Button, NavbarButton, Icon, Switch, Span, Avatar } from '@/shared/ui'
import ConfirmDialog from '@/shared/components/dialog/confirm-dialog.vue'
import { useNavbar } from '@/shared/composables'
import { useAuthStore } from '@/modules/auth/presentation/stores/auth-store'
import { routeNames } from '@/router/route-names'

const { isDarkMode, toggleDarkMode } = useNavbar()
const authStore = useAuthStore()
const showLogoutConfirm = ref(false)
const router = useRouter()

const showMenu = ref(false)
const rootEl = ref<HTMLElement | null>(null)

const closeMenu = () => {
  showMenu.value = false
}

const toggleMenu = () => {
  showMenu.value = !showMenu.value
}

const onThemeToggle = (value: boolean) => {
  if (value !== isDarkMode.value) {
    toggleDarkMode()
  }
}

const handlePlaceholder = (_key: string) => {
  // Placeholder para rotas/ações futuras, mantendo o UX do dropdown.
  closeMenu()
}

const onDocumentPointerDown = (e: PointerEvent) => {
  if (!showMenu.value) return
  const target = e.target as Node | null
  if (!target) return
  if (!rootEl.value?.contains(target)) {
    closeMenu()
  }
}

const onDocumentKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    closeMenu()
  }
}

onMounted(() => {
  document.addEventListener('pointerdown', onDocumentPointerDown)
  document.addEventListener('keydown', onDocumentKeyDown)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocumentPointerDown)
  document.removeEventListener('keydown', onDocumentKeyDown)
})

const userName = computed(() => {
  return authStore.user?.name || ''
})

const userEmail = computed(() => {
  return authStore.user?.email || ''
})

const userInitials = computed(() => {
  const name = authStore.user?.name
  if (!name || typeof name !== 'string') return ''

  const normalized = name.trim()
  if (!normalized) return ''

  const parts = normalized.split(/\s+/)
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || ''
})

const askLogout = () => {
  closeMenu()
  showLogoutConfirm.value = true
}

const handleLogout = async () => {
  showLogoutConfirm.value = false
  authStore.clear()

  await router.push({ name: routeNames.LOGIN })
}
</script>

<style scoped lang="css">
.account-menu {
  position: relative;
}

.menu {
  background-color: var(--color-background);
}

.dropdown-scale-enter-active,
.dropdown-scale-leave-active {
  transition:
    transform 150ms ease-in-out,
    opacity 150ms ease-in-out;
}

.dropdown-scale-enter-from,
.dropdown-scale-leave-to {
  transform: scale(0.95) translateY(-4px);
  opacity: 0;
}
</style>
