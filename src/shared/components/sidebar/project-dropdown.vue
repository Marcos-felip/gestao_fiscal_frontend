<template>
  <div :class="['project-dropdown', 'relative']">
    <div :class="['trigger', 'flex items-center gap-2 px-4', 'min-w-0']">
      <Avatar :initials="userInitials" size="sm" shape="circle" />
      <div class="text-left min-w-0">
        <Span size="sm" weight="semibold" class="truncate">
          {{ userName }}
        </Span>
        <Span size="xs" variant="muted" class="truncate">
          {{ userEmail }}
        </Span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Span, Avatar } from '@/shared/ui'
import { useAuthStore } from '@/modules/auth/presentation/stores/auth-store'

const authStore = useAuthStore()

const userName = computed(() => authStore.user?.name || '')

const userEmail = computed(() => authStore.user?.email || '')

const userInitials = computed(() => {
  const name = authStore.user?.name
  if (!name) return ''
  const names = name.split(' ')
  return (names[0]?.[0] + (names[1]?.[0] || '')).toUpperCase()
})
</script>

<style scoped lang="css">
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
