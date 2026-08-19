/**
 * Escala vertical do gráfico de faturamento.
 *
 * Vive fora do componente porque é aritmética pura com casos de borda que
 * merecem teste: período zerado, pico exatamente num múltiplo redondo e valores
 * de ordem de grandeza muito diferente.
 */

/** Quantos intervalos a escala tenta ter. */
const INTERVALS = 4

export interface AxisTick {
  value: number
  label: string
  /** Distância do topo, em porcentagem — 0 fica embaixo. */
  top: number
}

export interface AxisScale {
  max: number
  step: number
  ticks: AxisTick[]
}

/**
 * Arredonda o passo para 1, 2 ou 5 vezes uma potência de dez.
 *
 * Sem isso o eixo marcaria 131,50 / 263,00 / 394,50 — números que ninguém lê.
 */
export function niceStep(raw: number): number {
  if (!Number.isFinite(raw) || raw <= 0) return 1

  const magnitude = 10 ** Math.floor(Math.log10(raw))
  const normalized = raw / magnitude
  const factor =
    normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10

  return factor * magnitude
}

/** Abrevia para o rótulo caber na calha: `600`, `1,2 mil`, `3,4 mi`. */
export function compactValue(value: number): string {
  if (value === 0) return '0'

  if (Math.abs(value) >= 1_000_000) {
    return `${(value / 1_000_000).toLocaleString('pt-BR', {
      maximumFractionDigits: 1,
    })} mi`
  }

  if (Math.abs(value) >= 1000) {
    return `${(value / 1000).toLocaleString('pt-BR', {
      maximumFractionDigits: 1,
    })} mil`
  }

  // Marcação fracionária existe quando o pico é pequeno (uma venda de R$ 1,00
  // gera 0 / 0,5 / 1). Arredondar para inteiro faria 0,5 virar "1" e repetir o
  // rótulo do topo.
  return value.toLocaleString('pt-BR', {
    maximumFractionDigits: Number.isInteger(value) ? 0 : 2,
  })
}

/**
 * Escala a partir do maior valor da série.
 *
 * O topo é o primeiro múltiplo do passo acima do pico — é ele que dá a folga
 * entre o pico e a borda, em vez de um recuo em pixels que o eixo não conhece.
 *
 * A quantidade de marcações **varia**: fixá-la em cinco obrigaria a dividir o
 * topo por quatro e devolveria passos como 150, exatamente o que o
 * arredondamento existe para evitar.
 */
export function buildAxisScale(maxValue: number): AxisScale {
  if (!Number.isFinite(maxValue) || maxValue <= 0) {
    return { max: 0, step: 0, ticks: [] }
  }

  const step = niceStep(maxValue / INTERVALS)
  const max = Math.ceil(maxValue / step) * step
  const count = Math.round(max / step)

  const ticks = Array.from({ length: count + 1 }, (_, index) => {
    const value = step * index
    return {
      value,
      label: compactValue(value),
      top: 100 - (value / max) * 100,
    }
  })

  return { max, step, ticks }
}
