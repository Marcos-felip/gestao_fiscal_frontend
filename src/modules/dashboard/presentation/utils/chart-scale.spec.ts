import { describe, expect, it } from 'vitest'
import { buildAxisScale, compactValue, niceStep } from './chart-scale'

describe('chart-scale', () => {
  describe('niceStep', () => {
    it('arredonda para 1, 2 ou 5 vezes uma potência de dez', () => {
      expect(niceStep(131.5)).toBe(200)
      expect(niceStep(1.2)).toBe(2)
      expect(niceStep(3)).toBe(5)
      expect(niceStep(7)).toBe(10)
      expect(niceStep(15000)).toBe(20000)
    })

    it('não devolve zero nem passo negativo', () => {
      expect(niceStep(0)).toBe(1)
      expect(niceStep(-5)).toBe(1)
      expect(niceStep(Number.NaN)).toBe(1)
    })
  })

  describe('buildAxisScale', () => {
    it('marca em múltiplos redondos, não dividindo o topo em quatro', () => {
      const scale = buildAxisScale(526)

      expect(scale.max).toBe(600)
      expect(scale.step).toBe(200)
      expect(scale.ticks.map((tick) => tick.value)).toEqual([0, 200, 400, 600])
    })

    it('deixa o pico abaixo do topo da escala', () => {
      const scale = buildAxisScale(1234.56)

      expect(scale.max).toBeGreaterThanOrEqual(1234.56)
      expect(scale.ticks.at(-1)?.value).toBe(scale.max)
    })

    it('põe o zero embaixo e o topo em cima', () => {
      const scale = buildAxisScale(526)

      expect(scale.ticks[0]).toMatchObject({ value: 0, top: 100 })
      expect(scale.ticks.at(-1)).toMatchObject({ value: 600, top: 0 })
    })

    it('não produz escala para período zerado', () => {
      expect(buildAxisScale(0)).toEqual({ max: 0, step: 0, ticks: [] })
      expect(buildAxisScale(-10).ticks).toEqual([])
    })

    it('não repete rótulo quando o pico é pequeno', () => {
      const scale = buildAxisScale(1)
      const labels = scale.ticks.map((tick) => tick.label)

      expect(new Set(labels).size).toBe(labels.length)
      expect(labels).toContain('0,5')
    })
  })

  describe('compactValue', () => {
    it('abrevia milhar e milhão', () => {
      expect(compactValue(0)).toBe('0')
      expect(compactValue(600)).toBe('600')
      expect(compactValue(1200)).toBe('1,2 mil')
      expect(compactValue(80000)).toBe('80 mil')
      expect(compactValue(3_400_000)).toBe('3,4 mi')
    })
  })
})
