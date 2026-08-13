<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { AnimatePresence, motion, useReducedMotion } from 'motion-v'
import { Icon } from '@/shared/ui'

/**
 * Menu de contexto da aba, aberto no botão direito.
 *
 * **Direção visual: instrumento de precisão.** É um ERP fiscal, não um site —
 * o que faz o menu parecer moderno aqui não é enfeite, é resposta física:
 *
 * - **nasce do cursor**, não do centro. A origem da escala segue o canto para
 *   onde o menu coube, então ele parece sair de onde a pessoa clicou;
 * - **um realce só**, que desliza entre os itens em vez de acender e apagar.
 *   É `layoutId`: o mesmo elemento se move, dando continuidade ao movimento do
 *   ponteiro e do teclado;
 * - **cascata curta** na abertura, 22 ms por item — o suficiente para dar ordem
 *   de leitura sem atrasar quem já sabe onde vai clicar;
 * - **o grupo destrutivo tem cor própria**, para "Fechar todas" nunca ser lido
 *   com o mesmo peso de "Fixar".
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
  /** Grupo destrutivo: recebe o tom de erro no realce. */
  destrutivo?: boolean
}

const props = defineProps<{
  /**
   * Visibilidade por prop, e não `v-if` no pai: desmontar o componente levaria
   * junto o `AnimatePresence`, e a animação de saída nunca rodaria.
   */
  aberto: boolean
  x: number
  y: number
  actions: TabMenuAction[]
  /** Nome da aba sobre a qual o menu abriu — vira o cabeçalho. */
  contexto?: string
}>()

const emit = defineEmits<{ select: [id: string]; close: [] }>()

const reduzido = useReducedMotion()

const menu = ref<HTMLElement | null>(null)
const largura = ref(224)
const altura = ref(0)
const medido = ref(false)

/** Item sob o ponteiro ou sob o teclado — é um só realce, compartilhado. */
const ativo = ref(-1)

const habilitados = computed(() =>
  props.actions
    .map((acao, indice) => ({ acao, indice }))
    .filter(({ acao }) => !acao.disabled),
)

// ──────────────────────────────────────────────
// Posição
// ──────────────────────────────────────────────

const MARGEM = 8

/**
 * Menu contido na janela.
 *
 * Perto da borda ele **vira de lado** em vez de ser cortado — e a origem da
 * animação vira junto, senão a escala pareceria vir do lado errado.
 */
const posicao = computed(() => {
  const cabeDireita = props.x + largura.value + MARGEM <= window.innerWidth
  const cabeAbaixo = props.y + altura.value + MARGEM <= window.innerHeight

  const left = cabeDireita
    ? props.x
    : Math.max(MARGEM, props.x - largura.value)
  const top = cabeAbaixo ? props.y : Math.max(MARGEM, props.y - altura.value)

  return {
    left,
    top,
    origem: `${cabeAbaixo ? 'top' : 'bottom'} ${cabeDireita ? 'left' : 'right'}`,
  }
})

function medir(): void {
  const el = menu.value
  if (!el) return

  largura.value = el.offsetWidth
  altura.value = el.offsetHeight
  medido.value = true
}

// ──────────────────────────────────────────────
// Teclado
// ──────────────────────────────────────────────

function mover(passo: 1 | -1): void {
  const lista = habilitados.value
  if (lista.length === 0) return

  const atual = lista.findIndex(({ indice }) => indice === ativo.value)
  const proximo = (atual + passo + lista.length) % lista.length

  ativo.value = lista[atual === -1 && passo === -1 ? lista.length - 1 : proximo]
    .indice
}

function onKeydown(event: KeyboardEvent): void {
  switch (event.key) {
    case 'Escape':
      emit('close')
      return

    case 'ArrowDown':
      event.preventDefault()
      mover(1)
      return

    case 'ArrowUp':
      event.preventDefault()
      mover(-1)
      return

    case 'Home':
      event.preventDefault()
      ativo.value = habilitados.value[0]?.indice ?? -1
      return

    case 'End':
      event.preventDefault()
      ativo.value = habilitados.value.at(-1)?.indice ?? -1
      return

    case 'Enter':
    case ' ': {
      const acao = props.actions[ativo.value]
      if (!acao || acao.disabled) return
      event.preventDefault()
      emit('select', acao.id)
    }
  }
}

function fecharNoScroll(): void {
  emit('close')
}

/**
 * Os ouvintes seguem a abertura, não a montagem: o componente fica montado o
 * tempo todo para o `AnimatePresence` poder animar a saída, e um `keydown`
 * global escutando com o menu fechado sequestraria as setas da página.
 */
watch(
  () => props.aberto,
  (aberto) => {
    if (aberto) {
      ativo.value = -1
      medido.value = false
      void nextTick(medir)
      window.addEventListener('keydown', onKeydown)
      // `capture` para fechar antes que o gesto vire ação em outro lugar.
      window.addEventListener('scroll', fecharNoScroll, true)
      window.addEventListener('resize', medir)
      return
    }

    window.removeEventListener('keydown', onKeydown)
    window.removeEventListener('scroll', fecharNoScroll, true)
    window.removeEventListener('resize', medir)
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('scroll', fecharNoScroll, true)
  window.removeEventListener('resize', medir)
})

watch(() => [props.x, props.y, props.actions.length], medir)

// ──────────────────────────────────────────────
// Movimento
// ──────────────────────────────────────────────

const painel = computed(() =>
  reduzido.value
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.12 },
      }
    : {
        initial: { opacity: 0, scale: 0.94, y: -4 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.97, y: -2 },
        transition: { type: 'spring' as const, stiffness: 520, damping: 34 },
      },
)

/** Cascata curta: dá ordem de leitura sem atrasar quem já sabe onde clicar. */
function atrasoDoItem(indice: number): number {
  return reduzido.value ? 0 : 0.03 + indice * 0.022
}
</script>

<template>
  <AnimatePresence>
    <!-- Camada que fecha ao clicar fora, inclusive com o botão direito -->
    <motion.div
      v-if="props.aberto"
      key="tab-menu-fundo"
      class="fixed inset-0 z-[60]"
      :initial="{ opacity: 0 }"
      :animate="{ opacity: 1 }"
      :exit="{ opacity: 0 }"
      :transition="{ duration: 0.1 }"
      @click="emit('close')"
      @contextmenu.prevent="emit('close')"
    />

    <motion.div
      v-if="props.aberto"
      ref="menu"
      key="tab-menu"
      role="menu"
        :aria-label="props.contexto ? `Ações de ${props.contexto}` : 'Ações da aba'"
        class="fixed z-[61] min-w-56 overflow-hidden rounded-xl border border-line-2 bg-background/95 py-1.5 ring-1 ring-black/[0.03] backdrop-blur-xl"
        :style="{
          left: `${posicao.left}px`,
          top: `${posicao.top}px`,
          transformOrigin: posicao.origem,
          // Sombra em camadas: a rasa desenha a borda, a profunda tira o menu
          // da superfície. Uma sombra só achata o painel contra o conteúdo.
          boxShadow:
            '0 1px 2px rgba(15, 23, 42, 0.06), 0 12px 32px -8px rgba(15, 23, 42, 0.18)',
          // Enquanto não mediu, o menu existe mas não pisca no lugar errado.
          visibility: medido ? 'visible' : 'hidden',
        }"
        :initial="painel.initial"
        :animate="painel.animate"
        :exit="painel.exit"
        :transition="painel.transition"
        @click.stop
        @contextmenu.stop.prevent
        @mouseleave="ativo = -1"
      >
        <!-- Cabeçalho: qual aba está sendo alterada. Com várias abas de nome
             parecido, agir na errada é o erro fácil de cometer. -->
        <p
          v-if="props.contexto"
          class="mb-1 truncate border-b border-line-2/70 px-3 pb-1.5 text-[10px] font-semibold tracking-[0.08em] text-muted-foreground uppercase"
        >
          {{ props.contexto }}
        </p>

        <template v-for="(acao, indice) in props.actions" :key="acao.id">
          <div
            v-if="acao.separado"
            class="my-1 border-t border-line-2/70"
            role="separator"
          />

          <motion.button
            type="button"
            role="menuitem"
            :disabled="acao.disabled"
            class="group relative flex w-full cursor-pointer items-center gap-2.5 px-1.5 text-left text-sm disabled:cursor-not-allowed disabled:opacity-35"
            :initial="reduzido ? false : { opacity: 0, x: -6 }"
            :animate="{ opacity: 1, x: 0 }"
            :transition="{
              delay: atrasoDoItem(indice),
              duration: 0.18,
              ease: 'easeOut',
            }"
            :while-press="acao.disabled || reduzido ? {} : { scale: 0.975 }"
            @mouseenter="acao.disabled ? null : (ativo = indice)"
            @focus="acao.disabled ? null : (ativo = indice)"
            @click="emit('select', acao.id)"
          >
            <!-- Realce único que desliza entre os itens: o mesmo elemento se
                 move, em vez de um fundo acender e outro apagar. É o que dá
                 continuidade ao movimento do ponteiro e do teclado. -->
            <motion.span
              v-if="ativo === indice"
              layout-id="tab-menu-realce"
              class="absolute inset-x-1.5 inset-y-0 -z-10 rounded-lg"
              :class="acao.destrutivo ? 'bg-error-500/10' : 'bg-muted'"
              :transition="
                reduzido
                  ? { duration: 0 }
                  : { type: 'spring', stiffness: 620, damping: 40 }
              "
            />

            <span
              class="flex items-center gap-2.5 px-1.5 py-2 transition-colors"
              :class="[
                acao.destrutivo
                  ? ativo === indice
                    ? 'text-error-600'
                    : 'text-muted-foreground'
                  : ativo === indice
                    ? 'text-foreground'
                    : 'text-muted-foreground',
              ]"
            >
              <Icon :name="acao.icon" size="sm" class="shrink-0" />
              <span class="truncate">{{ acao.label }}</span>
            </span>
          </motion.button>
        </template>
      </motion.div>
  </AnimatePresence>
</template>
