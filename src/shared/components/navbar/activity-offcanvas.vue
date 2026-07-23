<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition name="backdrop-fade">
      <div
        v-if="isOpen"
        :class="[
          'activity-backdrop',
          'fixed inset-0 z-40 bg-black/20',
        ]"
        @click="close"
      />
    </Transition>

    <!-- Offcanvas -->
    <Transition name="slide-left">
      <div
        v-if="isOpen"
        :class="[
          'activity-offcanvas',
          'fixed right-0 top-0 bottom-0 z-50 w-full max-w-md border-l border-border bg-background shadow-lg',
        ]"
      >
        <!-- Header -->
        <div :class="['header', 'flex items-center justify-between border-b border-border px-6 py-4']">
          <h2 class="text-lg font-semibold text-foreground">Atividades Recentes</h2>
          <button
            class="text-muted-foreground hover:text-foreground transition-colors"
            @click="close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="h-5 w-5"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <!-- Content -->
        <div :class="['content', 'flex-1 overflow-y-auto']">
          <div class="space-y-4 p-6">
            <!-- Activity items -->
            <div
              v-for="activity in activities"
              :key="activity.id"
              :class="[
                'activity-item',
                'flex gap-4 pb-4 border-b border-border last:border-b-0',
              ]"
            >
              <!-- Icon -->
              <div
                :class="[
                  'icon',
                  'h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0',
                  getActivityIconClass(activity.type),
                ]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="h-5 w-5"
                >
                  <polyline v-if="activity.type === 'create'" points="12 2 15.09 10.26 24 12.75 15.6 19.16 17.82 28 12 24.29 6.18 28 8.4 19.16 0 12.75 8.91 10.26 12 2" />
                  <polyline v-else-if="activity.type === 'update'" points="16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8Z" />
                  <path v-else-if="activity.type === 'delete'" d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6h16zM10 11v6M14 11v6" />
                  <circle v-else cx="12" cy="12" r="1" />
                </svg>
              </div>

              <!-- Content -->
              <div class="flex-1 min-w-0">
                <h4 class="text-sm font-semibold text-foreground">{{ activity.title }}</h4>
                <p class="text-xs text-muted-foreground mt-1">{{ activity.description }}</p>
                <time class="text-xs text-muted-foreground block mt-2">
                  {{ formatTime(activity.timestamp) }}
                </time>
              </div>
            </div>

            <!-- Empty state -->
            <div v-if="activities.length === 0" class="py-12 text-center">
              <p class="text-sm text-muted-foreground">Nenhuma atividade recente</p>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div :class="['footer', 'border-t border-border px-6 py-4']">
          <button class="w-full text-center text-xs font-medium text-primary hover:text-primary/80 transition-colors">
            Ver histórico completo
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'

type ActivityType = 'create' | 'update' | 'delete' | 'view'

interface Activity {
  id: string
  type: ActivityType
  title: string
  description: string
  timestamp: Date
}

interface Props {
  modelValue?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const isOpen = ref(props.modelValue)

const activities: Activity[] = [
  {
    id: '1',
    type: 'create',
    title: 'Empresa criada',
    description: 'Acme Corporation foi criada',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
  },
  {
    id: '2',
    type: 'update',
    title: 'Documento atualizado',
    description: 'NFe 2024-001 foi modificada',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: '3',
    type: 'delete',
    title: 'Produto removido',
    description: 'Produto XYZ-123 foi deletado',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
]

const getActivityIconClass = (type: ActivityType): string => {
  switch (type) {
    case 'create':
      return 'bg-green-100 text-green-600'
    case 'update':
      return 'bg-blue-100 text-blue-600'
    case 'delete':
      return 'bg-red-100 text-red-600'
    case 'view':
      return 'bg-gray-100 text-gray-600'
    default:
      return 'bg-muted text-muted-foreground'
  }
}

const formatTime = (date: Date): string => {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Agora mesmo'
  if (diffMins < 60) return `${diffMins}m atrás`
  if (diffHours < 24) return `${diffHours}h atrás`
  if (diffDays < 7) return `${diffDays}d atrás`

  return date.toLocaleDateString('pt-BR')
}

const close = () => {
  isOpen.value = false
  emit('update:modelValue', false)
}
</script>

<style scoped lang="css">
.backdrop-fade-enter-active,
.backdrop-fade-leave-active {
  transition: opacity 150ms ease-in-out;
}

.backdrop-fade-enter-from,
.backdrop-fade-leave-to {
  opacity: 0;
}

.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 300ms ease-in-out;
}

.slide-left-enter-from,
.slide-left-leave-to {
  transform: translateX(100%);
}
</style>
