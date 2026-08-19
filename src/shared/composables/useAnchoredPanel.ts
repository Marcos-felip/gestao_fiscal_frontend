import { nextTick, onBeforeUnmount, onMounted, ref, type Ref } from 'vue'

/**
 * Painel flutuante ancorado num gatilho, fora do recorte de qualquer container.
 *
 * Dropdown posicionado com `absolute` vive dentro do próprio campo, e por isso
 * é cortado por qualquer ancestral com `overflow` — modal com corpo rolável,
 * painel lateral, tabela com rolagem horizontal. O sintoma é a lista aparecendo
 * truncada na borda do container, às vezes com uma segunda barra de rolagem.
 *
 * Aqui o painel vai para o `body` (via `Teleport` no componente) e se ancora no
 * gatilho por `position: fixed`. Como `fixed` é relativo à janela, a posição é
 * recalculada ao abrir, ao rolar **qualquer** ancestral e ao redimensionar.
 */

/** Espaço entre o gatilho e o painel. */
const GAP = 8
/** Folga mínima até a borda da janela. */
const VIEWPORT_MARGIN = 8

export interface AnchoredPanelOptions {
  /** Altura máxima desejada, em pixels. */
  maxHeight?: number
  /** Altura mínima antes de preferir abrir para o outro lado. */
  minHeight?: number
  /** Largura do painel: acompanha o gatilho ou fica livre. */
  matchTriggerWidth?: boolean
  /** Largura fixa, quando não acompanha o gatilho. */
  width?: number
  /** Alinhamento horizontal quando a largura é livre. */
  align?: 'start' | 'end'
}

export function useAnchoredPanel(
  isOpen: Ref<boolean>,
  options: AnchoredPanelOptions = {},
) {
  const {
    maxHeight = 240,
    minHeight = 120,
    matchTriggerWidth = true,
    width,
    align = 'start',
  } = options

  const triggerRef = ref<HTMLElement | null>(null)
  const panelRef = ref<HTMLElement | null>(null)
  const panelStyle = ref<Record<string, string>>({})

  function updatePosition(): void {
    const trigger = triggerRef.value
    if (!trigger) return

    const rect = trigger.getBoundingClientRect()
    const below = window.innerHeight - rect.bottom - GAP - VIEWPORT_MARGIN
    const above = rect.top - GAP - VIEWPORT_MARGIN

    // Abre para cima quando não cabe embaixo e sobra mais espaço em cima —
    // senão o painel nasce colado no rodapé, com uma linha e meia visível.
    const openUp = below < Math.min(maxHeight, above) && above > below

    const style: Record<string, string> = {
      maxHeight: `${Math.max(minHeight, Math.min(maxHeight, openUp ? above : below))}px`,
      ...(openUp
        ? { bottom: `${window.innerHeight - rect.top + GAP}px` }
        : { top: `${rect.bottom + GAP}px` }),
    }

    if (matchTriggerWidth) {
      style.left = `${rect.left}px`
      style.width = `${rect.width}px`
    } else {
      const panelWidth = width ?? rect.width
      // Alinhado à direita do gatilho quando pedido, mas nunca saindo da tela.
      const left =
        align === 'end' ? rect.right - panelWidth : rect.left
      style.left = `${Math.max(
        VIEWPORT_MARGIN,
        Math.min(left, window.innerWidth - panelWidth - VIEWPORT_MARGIN),
      )}px`
      if (width) style.width = `${width}px`
    }

    panelStyle.value = style
  }

  /**
   * Guarda o elemento do painel a partir do `ref` do template.
   *
   * O painel é renderizado por `motion.ul`, que é um componente: o `ref`
   * entrega a instância, não o nó. Sem desembrulhar o `$el`, o `contains` do
   * clique externo receberia um objeto sem DOM e fecharia o painel a cada
   * clique numa opção.
   */
  function setPanelRef(value: unknown): void {
    const candidate = value as { $el?: unknown } | Element | null
    const element =
      candidate && '$el' in candidate ? candidate.$el : candidate
    panelRef.value = element instanceof HTMLElement ? element : null
  }

  /** Idem para o gatilho, que pode ser elemento ou componente. */
  function setTriggerRef(value: unknown): void {
    const candidate = value as { $el?: unknown } | Element | null
    const element =
      candidate && '$el' in candidate ? candidate.$el : candidate
    triggerRef.value = element instanceof HTMLElement ? element : null
  }

  /** Chame ao abrir: posiciona antes de pintar e corrige após a montagem. */
  function anchor(): void {
    updatePosition()
    void nextTick(updatePosition)
  }

  /**
   * O clique aconteceu fora do conjunto gatilho + painel?
   *
   * O painel mora no `body`, fora do wrapper: sem checá-lo, clicar numa opção
   * contaria como clique externo e fecharia antes de a escolha ser registrada.
   */
  function isOutside(target: Node): boolean {
    const insideTrigger = triggerRef.value?.contains(target) ?? false
    const insidePanel = panelRef.value?.contains(target) ?? false
    return !insideTrigger && !insidePanel
  }

  function onViewportChange(): void {
    if (isOpen.value) updatePosition()
  }

  onMounted(() => {
    // `capture`: pega a rolagem de qualquer ancestral, não só a da janela.
    window.addEventListener('scroll', onViewportChange, true)
    window.addEventListener('resize', onViewportChange)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('scroll', onViewportChange, true)
    window.removeEventListener('resize', onViewportChange)
  })

  return {
    triggerRef,
    panelRef,
    setTriggerRef,
    setPanelRef,
    panelStyle,
    anchor,
    isOutside,
  }
}
