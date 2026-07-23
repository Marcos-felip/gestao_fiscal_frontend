import { ref } from 'vue'

/**
 * useProgress — barra de progresso global no topo da tela.
 *
 * Estado compartilhado (singleton de módulo). Chame `start()` ao iniciar uma
 * tarefa assíncrona (request, navegação) e `done()` ao terminar. Suporta
 * tarefas concorrentes via contador: a barra só some quando todas terminam.
 */

const activeCount = ref(0)
const progress = ref(0)
const visible = ref(false)

let trickle: ReturnType<typeof setInterval> | null = null
let hideTimer: ReturnType<typeof setTimeout> | null = null

function clearTrickle(): void {
  if (trickle !== null) {
    clearInterval(trickle)
    trickle = null
  }
}

function start(): void {
  activeCount.value += 1
  if (activeCount.value > 1) return

  if (hideTimer !== null) {
    clearTimeout(hideTimer)
    hideTimer = null
  }

  visible.value = true
  progress.value = 8
  clearTrickle()

  // Avança suavemente em direção a 90% enquanto a tarefa não termina.
  trickle = setInterval(() => {
    const remaining = 90 - progress.value
    if (remaining > 0) {
      progress.value += Math.max(0.4, remaining * 0.06)
    }
  }, 220)
}

function done(): void {
  if (activeCount.value === 0) return
  activeCount.value -= 1
  if (activeCount.value > 0) return

  clearTrickle()
  progress.value = 100

  // Deixa a barra chegar a 100% e então some.
  hideTimer = setTimeout(() => {
    visible.value = false
    progress.value = 0
    hideTimer = null
  }, 320)
}

/**
 * Envolve uma promise com start/done automáticos.
 */
async function track<T>(task: Promise<T>): Promise<T> {
  start()
  try {
    return await task
  } finally {
    done()
  }
}

export function useProgress() {
  return { progress, visible, start, done, track }
}
