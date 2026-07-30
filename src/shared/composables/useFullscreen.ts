import { onBeforeUnmount, onMounted, readonly, ref } from 'vue'

/**
 * Controla o modo tela cheia (Fullscreen API). Por padrão usa o documento
 * inteiro; passe um alvo para colocar só um elemento em tela cheia.
 *
 * Mantém `isFullscreen` sincronizado mesmo quando o usuário sai pela tecla
 * Esc/F11 do navegador (evento nativo `fullscreenchange`).
 */
export function useFullscreen(target?: () => Element | null) {
  const isFullscreen = ref(false)
  const isSupported =
    typeof document !== 'undefined' &&
    Boolean(document.documentElement.requestFullscreen)

  function sync(): void {
    isFullscreen.value = document.fullscreenElement !== null
  }

  async function enter(): Promise<void> {
    const el = target?.() ?? document.documentElement
    if (el && document.fullscreenElement === null) {
      await el.requestFullscreen?.().catch(() => undefined)
    }
  }

  async function exit(): Promise<void> {
    if (document.fullscreenElement !== null) {
      await document.exitFullscreen?.().catch(() => undefined)
    }
  }

  async function toggle(): Promise<void> {
    if (document.fullscreenElement === null) await enter()
    else await exit()
  }

  onMounted(() => {
    sync()
    document.addEventListener('fullscreenchange', sync)
  })
  onBeforeUnmount(() =>
    document.removeEventListener('fullscreenchange', sync),
  )

  return { isFullscreen: readonly(isFullscreen), isSupported, enter, exit, toggle }
}
