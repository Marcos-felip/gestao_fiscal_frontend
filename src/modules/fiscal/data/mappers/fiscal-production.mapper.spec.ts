import { describe, expect, it } from 'vitest'
import { toProductionChecklist } from '@/modules/fiscal/data/mappers/fiscal-production.mapper'
import { ContractError } from '@/core/errors/contract-error'
import { FiscalDocumentModel } from '@/core/enums/fiscal-document-model.enum'

/**
 * O checklist passou a dizer a que modelo cada item pertence. É por esse campo
 * que a tela agrupa — e um valor fora da tabela não pode virar um grupo mudo.
 */

const checklist = (itens: unknown[]) => ({
  liberada: false,
  liberadaEm: null,
  itens,
})

describe('toProductionChecklist', () => {
  it('preserva o modelo de cada item', () => {
    const result = toProductionChecklist(
      checklist([
        { item: 'Certificado digital A1 enviado', ok: true },
        { item: 'Série da NF-e entre 1 e 999', ok: true, modelo: 'NFE' },
      ]),
    )

    expect(result.isRight).toBe(true)
    expect(result.right.itens[0].modelo).toBeUndefined()
    expect(result.right.itens[1].modelo).toBe(FiscalDocumentModel.NFE)
  })

  it('preserva o não bloqueante, que é o que libera o botão', () => {
    const result = toProductionChecklist(
      checklist([
        {
          item: 'Produtos com quadro tributário completo',
          ok: false,
          bloqueante: false,
          detalhe: '4 produtos não emitem',
        },
      ]),
    )

    expect(result.right.itens[0].bloqueante).toBe(false)
    expect(result.right.itens[0].detalhe).toContain('4 produtos')
  })

  it('preserva o código, que é como a tela reconhece o item', () => {
    const result = toProductionChecklist(
      checklist([
        {
          codigo: 'produtos_fiscais',
          item: 'Produtos com quadro tributário completo',
          ok: false,
          bloqueante: false,
        },
      ]),
    )

    expect(result.right.itens[0].codigo).toBe('produtos_fiscais')
  })

  it('código desconhecido vira item sem ação, não checklist recusado', () => {
    const result = toProductionChecklist(
      checklist([{ codigo: 'item_do_futuro', item: 'Algo novo', ok: true }]),
    )

    expect(result.isRight).toBe(true)
    expect(result.right.itens[0].codigo).toBeUndefined()
    expect(result.right.itens[0].item).toBe('Algo novo')
  })

  it('item sem código continua válido — backend anterior ao campo', () => {
    const result = toProductionChecklist(
      checklist([{ item: 'Certificado digital A1 enviado', ok: true }]),
    )

    expect(result.isRight).toBe(true)
    expect(result.right.itens[0].codigo).toBeUndefined()
  })

  it('recusa modelo fora da tabela', () => {
    const result = toProductionChecklist(
      checklist([{ item: 'Série', ok: true, modelo: 'NF3E' }]),
    )

    expect(result.isLeft).toBe(true)
    expect(result.left).toBeInstanceOf(ContractError)
  })

  it('recusa item sem o campo ok', () => {
    const result = toProductionChecklist(checklist([{ item: 'Série' }]))

    expect(result.isLeft).toBe(true)
    expect(JSON.stringify(result.left)).toContain('ok')
  })

  it('aceita checklist vazio', () => {
    expect(toProductionChecklist(checklist([])).right.itens).toEqual([])
  })
})
