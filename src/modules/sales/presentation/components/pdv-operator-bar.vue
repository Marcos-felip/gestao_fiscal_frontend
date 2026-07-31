<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { Icon } from '@/shared/ui'

const props = defineProps<{
  sellerName: string
  sellerRole: string | null
  establishmentName?: string | null
  isFullscreen: boolean
}>()

const emit = defineEmits<{
  'toggle-fullscreen': []
  help: []
  exit: []
}>()

const now = ref(new Date())
let timer: ReturnType<typeof setInterval> | null = null

const clock = computed(() =>
  now.value.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }),
)
const today = computed(() =>
  now.value.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }),
)

const initials = computed(() => {
  const parts = props.sellerName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  const first = parts[0][0] ?? ''
  const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? '') : ''
  return (first + last).toUpperCase()
})

onMounted(() => {
  timer = setInterval(() => {
    now.value = new Date()
  }, 1000)
})
onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <header
    class="flex items-center justify-between gap-4 bg-foreground px-4 py-2.5 text-background sm:px-6"
  >
    <!-- Identidade do caixa -->
    <div class="flex min-w-0 items-center gap-3">
      <img
        src="/apple-touch-icon.png"
        alt="Gestão Fiscal"
        class="size-9 shrink-0 rounded-lg bg-white object-contain"
      />
      <div class="min-w-0 leading-tight">
        <p class="font-display text-sm font-bold tracking-tight">
          Gestão Fiscal
        </p>
        <p class="truncate text-xs text-background/60">
          PDV · {{ props.establishmentName || 'Balcão' }}
        </p>
      </div>
    </div>

    <!-- Relógio (centro) -->
    <div class="hidden flex-col items-center leading-tight md:flex">
      <span class="font-mono text-lg font-semibold tabular-nums">
        {{ clock }}
      </span>
      <span class="text-[11px] text-background/60">{{ today }}</span>
    </div>

    <!-- Vendedor + ações -->
    <div class="flex items-center gap-2 sm:gap-3">
      <div class="flex items-center gap-2 rounded-full bg-background/10 py-1 pr-3 pl-1">
        <span
          class="flex size-7 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white"
        >
          {{ initials }}
        </span>
        <div class="hidden leading-tight sm:block">
          <p class="max-w-[10rem] truncate text-xs font-semibold">
            {{ props.sellerName }}
          </p>
          <p v-if="props.sellerRole" class="text-[10px] text-background/60">
            {{ props.sellerRole }}
          </p>
        </div>
      </div>

      <div class="flex items-center gap-1">
        <button
          type="button"
          class="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-background/80 transition-colors hover:bg-background/10 hover:text-background"
          title="Atalhos (F1)"
          @click="emit('help')"
        >
          <Icon name="Keyboard" size="sm" />
          <kbd class="hidden font-mono text-[11px] lg:inline">F1</kbd>
        </button>
        <button
          type="button"
          class="rounded-lg p-1.5 text-background/80 transition-colors hover:bg-background/10 hover:text-background"
          :title="props.isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'"
          @click="emit('toggle-fullscreen')"
        >
          <Icon :name="props.isFullscreen ? 'Minimize' : 'Maximize'" size="sm" />
        </button>
        <button
          type="button"
          class="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-background/80 transition-colors hover:bg-error-500/20 hover:text-white"
          title="Sair do PDV"
          @click="emit('exit')"
        >
          <Icon name="LogOut" size="sm" />
          <span class="hidden sm:inline">Sair</span>
        </button>
      </div>
    </div>
  </header>
</template>
