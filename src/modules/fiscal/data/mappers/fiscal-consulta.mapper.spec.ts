import { describe, expect, it } from 'vitest'
import { toFiscalConsultaResult } from '@/modules/fiscal/data/mappers/fiscal-consulta.mapper'
import { ContractError } from '@/core/errors/contract-error'

describe('toFiscalConsultaResult', () => {
  it('mapeia uma resposta válida completa', () => {
    const result = toFiscalConsultaResult({
      situacao: 'Autorizado o uso da NF-e',
      protocolo: '135240000000001',
      status: 'AUTORIZADO',
      atualizado: true,
      mensagem: 'Documento autorizado.',
    })

    expect(result.isRight).toBe(true)
    expect(result.right).toEqual({
      situacao: 'Autorizado o uso da NF-e',
      protocolo: '135240000000001',
      status: 'AUTORIZADO',
      atualizado: true,
      mensagem: 'Documento autorizado.',
    })
  })

  it('aplica defaults para campos opcionais ausentes', () => {
    const result = toFiscalConsultaResult({ status: 'PENDENTE' })

    expect(result.isRight).toBe(true)
    expect(result.right).toEqual({
      situacao: null,
      protocolo: null,
      status: 'PENDENTE',
      atualizado: false,
      mensagem: null,
    })
  })

  it('falha (ContractError) quando um campo tem tipo errado', () => {
    const result = toFiscalConsultaResult({
      status: 'AUTORIZADO',
      atualizado: 'sim',
    })

    expect(result.isLeft).toBe(true)
    expect(result.left).toBeInstanceOf(ContractError)
  })

  it('falha (ContractError) quando o status obrigatório está ausente', () => {
    const result = toFiscalConsultaResult({ atualizado: true })

    expect(result.isLeft).toBe(true)
    expect(result.left).toBeInstanceOf(ContractError)
  })
})
