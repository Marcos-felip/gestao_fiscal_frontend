<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Icon } from '@/shared/ui'

interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'info'
}

const toasts = ref<Toast[]>([])
let nextId = 0

function addToast(message: string, type: Toast['type'] = 'info'): void {
  const id = nextId++
  toasts.value.push({ id, message, type })
  setTimeout(() => removeToast(id), 4000)
}

function removeToast(id: number): void {
  toasts.value = toasts.value.filter((t) => t.id !== id)
}

function typeClasses(type: Toast['type']): string {
  switch (type) {
    case 'success':
      return 'bg-success text-white'
    case 'error':
      return 'bg-destructive text-destructive-foreground'
    case 'info':
      return 'bg-primary text-primary-foreground'
  }
}

function typeIcon(type: Toast['type']): string {
  switch (type) {
    case 'success':
      return 'CircleCheck'
    case 'error':
      return 'CircleAlert'
    case 'info':
      return 'Info'
  }
}

onMounted(() => {
  window.addEventListener('toast', ((event: CustomEvent) => {
    addToast(event.detail.message, event.detail.type)
  }) as EventListener)
})
</script>

<template>
  <div class="fixed top-4 right-4 z-[100] flex flex-col gap-2">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="[
          typeClasses(toast.type),
          'flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg min-w-[300px] max-w-[400px]',
        ]"
      >
        <Icon :name="typeIcon(toast.type)" size="sm" class="shrink-0" />
        <span class="flex-1 text-sm font-medium">{{ toast.message }}</span>
        <button
          class="shrink-0 opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Fechar"
          @click="removeToast(toast.id)"
        >
          <Icon name="X" size="sm" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-enter-active {
  transition: all 0.3s ease-out;
}
.toast-leave-active {
  transition: all 0.2s ease-in;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
