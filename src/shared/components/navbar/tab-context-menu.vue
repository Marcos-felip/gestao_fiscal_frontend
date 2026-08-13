<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Icon } from '@/shared/ui'

/**
 * Menu de contexto da aba, aberto no botão direito.
 *
 * Fica posicionado no cursor, e não ancorado num gatilho, porque a aba já é
 * pequena e um botão de menu em cada uma encheria o trilho. O botão direito é
 * o gesto que as pessoas já usam em aba de navegador — e o teclado chega nele
 * pela tecla de menu de contexto, que dispara o mesmo evento.
 */

export interface TabMenuAction {
  id: string
  label: string
  icon: string
  /** Abre um grupo novo acima deste item. */
  separado?: boolean
  disabled?: boolean
}

const props = defineProps<{
  x: number
  y: number
  actions: TabMenuAction[]
}>()

const emit = defineEmits<{ select: [id: string]; close: [] }>()

const menu = ref<HTMLElement | null>(null)
const largura = ref(220)
const altura = ref(0)

/**
 * Mantém o menu dentro da janela: aberto perto da borda direita ou de baixo,
 * ele nasceria cortado e o último item ficaria inalcançável.
 */
const estilo = computed(() => {
  const margem = 8
  const maxX = window.innerWidth - largura.value - margem
  const maxY = window.innerHeight - altura.value - margem

  return {
    left: `${Math.max(margem, Math.min(props.x, maxX))}px`,
    top: `${Math.max(margem, Math.min(props.y, maxY))}px`,
  }
})

function medir(): void {
  const el = menu.value
  if (!el) return
  largura.value = el.offsetWidth
  altura.value = el.offsetHeight
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') emit('close')
}

onMounted(() => {
  medir()
  window.addEventListener('keydown', onKeydown)
  // `capture` para fechar antes que o clique vire ação em outro lugar.
  window.addEventListener('scroll', () => emit('close'), true)
})

onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))

watch(() => [props.x, props.y], medir)
</script>

<template>
  <!-- Camada que fecha ao clicar fora, inclusive com o botão direito -->
  <div
    class="fixed inset-0 z-[60]"
    @click="emit('close')"
    @contextmenu.prevent="emit('close')"
  >
    <div
      ref="menu"
      role="menu"
      class="ui-shadow-float fixed z-[61] min-w-52 rounded-lg border border-line-2 bg-background py-1"
      :style="estilo"
      @click.stop
      @contextmenu.stop.prevent
    >
      <template v-for="acao in props.actions" :key="acao.id">
        <div
          v-if="acao.separado"
          class="my-1 border-t border-line-2"
          role="separator"
        />

        <button
          type="button"
          role="menuitem"
          :disabled="acao.disabled"
          class="flex w-full cursor-pointer items-center gap-2.5 px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
          @click="emit('select', acao.id)"
        >
          <Icon :name="acao.icon" size="sm" class="shrink-0" />
          <span class="truncate">{{ acao.label }}</span>
        </button>
      </template>
    </div>
  </div>
</template>
