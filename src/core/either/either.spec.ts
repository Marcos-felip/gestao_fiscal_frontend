import { describe, expect, it } from 'vitest'
import { Either } from '@/core/either/either'

describe('Either', () => {
  it('identifica corretamente left e right', () => {
    const right = Either.right<string, number>(1)
    const left = Either.left<string, number>('erro')

    expect(right.isRight).toBe(true)
    expect(right.isLeft).toBe(false)
    expect(left.isLeft).toBe(true)
    expect(left.isRight).toBe(false)
  })

  it('lança ao acessar o lado errado', () => {
    expect(() => Either.left<string, number>('erro').right).toThrow()
    expect(() => Either.right<string, number>(1).left).toThrow()
  })

  describe('map', () => {
    it('transforma o valor quando é right', () => {
      const result = Either.right<string, number>(2).map((n) => n * 5)
      expect(result.right).toBe(10)
    })

    it('não executa a função quando é left', () => {
      let executou = false
      const result = Either.left<string, number>('erro').map(() => {
        executou = true
        return 0
      })

      expect(executou).toBe(false)
      expect(result.left).toBe('erro')
    })
  })

  describe('flatMap', () => {
    it('encadeia sem aninhar quando é right', () => {
      const result = Either.right<string, number>(2).flatMap((n) =>
        Either.right<string, number>(n + 1),
      )
      expect(result.right).toBe(3)
    })

    it('propaga o left produzido pela função', () => {
      const result = Either.right<string, number>(2).flatMap(() =>
        Either.left<string, number>('falhou no meio'),
      )
      expect(result.left).toBe('falhou no meio')
    })

    it('curto-circuita quando já é left', () => {
      let executou = false
      const result = Either.left<string, number>('erro').flatMap(() => {
        executou = true
        return Either.right<string, number>(1)
      })

      expect(executou).toBe(false)
      expect(result.left).toBe('erro')
    })
  })

  describe('mapLeft', () => {
    it('transforma apenas o lado esquerdo', () => {
      expect(
        Either.left<string, number>('x').mapLeft((e) => `${e}!`).left,
      ).toBe('x!')
      expect(Either.right<string, number>(9).mapLeft(() => 'nunca').right).toBe(
        9,
      )
    })
  })

  describe('fold', () => {
    it('escolhe o ramo conforme o lado', () => {
      const right = Either.right<string, number>(4).fold(
        () => 'left',
        (n) => `right:${n}`,
      )
      const left = Either.left<string, number>('ops').fold(
        (e) => `left:${e}`,
        () => 'right',
      )

      expect(right).toBe('right:4')
      expect(left).toBe('left:ops')
    })
  })
})
