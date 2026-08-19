import { describe, expect, it } from 'vitest'
import {
  toCertificateStatus,
  toFiscalCertificateEventList,
  toStatusServicoResult,
  toFiscalEngineHealth,
} from '@/modules/fiscal/data/mappers/fiscal-certificate.mapper'
import { ContractError } from '@/core/errors/contract-error'

describe('toCertificateStatus', () => {
  it('converte a validade ISO em Date e preserva os campos', () => {
    const result = toCertificateStatus({
      configurado: true,
      titular: 'EMPRESA LTDA',
      subject: 'CN=EMPRESA LTDA:12345678000199',
      validoAte: '2030-01-01T00:00:00.000Z',
      diasParaVencer: 400,
      vencido: false,
    })

    expect(result.isRight).toBe(true)
    const status = result.right
    expect(status.configurado).toBe(true)
    expect(status.titular).toBe('EMPRESA LTDA')
    expect(status.validoAte).toBeInstanceOf(Date)
    expect(status.validoAte?.toISOString()).toBe('2030-01-01T00:00:00.000Z')
    expect(status.diasParaVencer).toBe(400)
    expect(status.isExpiring).toBe(false)
  })

  it('aplica default e nulos quando o certificado não está configurado', () => {
    const result = toCertificateStatus({ configurado: false })

    expect(result.isRight).toBe(true)
    const status = result.right
    expect(status.configurado).toBe(false)
    expect(status.vencido).toBe(false)
    expect(status.titular).toBeNull()
    expect(status.subject).toBeNull()
    expect(status.validoAte).toBeNull()
    expect(status.diasParaVencer).toBeNull()
    expect(status.isExpiring).toBe(false)
  })

  it('marca isExpiring quando faltam 30 dias ou menos', () => {
    const soon = toCertificateStatus({
      configurado: true,
      diasParaVencer: 10,
      vencido: false,
    })
    expect(soon.right.isExpiring).toBe(true)

    const expired = toCertificateStatus({
      configurado: true,
      diasParaVencer: -3,
      vencido: true,
    })
    expect(expired.right.isExpiring).toBe(false)
    expect(expired.right.vencido).toBe(true)
  })

  it('devolve ContractError quando um campo tem tipo errado', () => {
    const result = toCertificateStatus({
      configurado: 'sim',
      vencido: false,
    })
    expect(result.isLeft).toBe(true)
    expect(result.left).toBeInstanceOf(ContractError)
  })

  it('devolve ContractError quando falta o campo obrigatório', () => {
    const result = toCertificateStatus({ vencido: false })
    expect(result.isLeft).toBe(true)
    expect(result.left).toBeInstanceOf(ContractError)
  })
})

describe('toFiscalCertificateEventList', () => {
  it('mapeia o histórico convertendo datas', () => {
    const result = toFiscalCertificateEventList([
      {
        tipo: 'UPLOAD',
        subject: 'CN=EMPRESA',
        titular: 'EMPRESA LTDA',
        validoAte: '2030-01-01T00:00:00.000Z',
        subjectAnterior: null,
        usuarioId: 'user-1',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    ])

    expect(result.isRight).toBe(true)
    expect(result.right).toHaveLength(1)
    const event = result.right[0]
    expect(event.tipo).toBe('UPLOAD')
    expect(event.validoAte).toBeInstanceOf(Date)
    expect(event.createdAt).toBeInstanceOf(Date)
    expect(event.subjectAnterior).toBeNull()
  })

  it('aplica nulos quando campos opcionais faltam', () => {
    const result = toFiscalCertificateEventList([
      { tipo: 'SUBSTITUICAO', createdAt: '2026-01-01T00:00:00.000Z' },
    ])

    expect(result.isRight).toBe(true)
    const event = result.right[0]
    expect(event.titular).toBeNull()
    expect(event.validoAte).toBeNull()
    expect(event.usuarioId).toBeNull()
  })

  it('devolve ContractError quando não é um array', () => {
    const result = toFiscalCertificateEventList({ nope: true })
    expect(result.isLeft).toBe(true)
    expect(result.left).toBeInstanceOf(ContractError)
  })

  it('devolve ContractError quando um item tem tipo errado', () => {
    const result = toFiscalCertificateEventList([
      { tipo: 123, createdAt: '2026-01-01T00:00:00.000Z' },
    ])
    expect(result.isLeft).toBe(true)
    expect(result.left).toBeInstanceOf(ContractError)
  })
})

describe('toStatusServicoResult', () => {
  it('mapeia o resultado do teste SEFAZ', () => {
    const result = toStatusServicoResult({
      disponivel: true,
      mensagem: 'Serviço em operação',
      tempoMedioResposta: 120,
    })

    expect(result.isRight).toBe(true)
    expect(result.right.disponivel).toBe(true)
    expect(result.right.mensagem).toBe('Serviço em operação')
    expect(result.right.tempoMedioResposta).toBe(120)
  })

  it('aplica nulos quando campos opcionais faltam', () => {
    const result = toStatusServicoResult({ disponivel: false })
    expect(result.isRight).toBe(true)
    expect(result.right.mensagem).toBeNull()
    expect(result.right.tempoMedioResposta).toBeNull()
  })

  it('devolve ContractError quando disponivel tem tipo errado', () => {
    const result = toStatusServicoResult({ disponivel: 'talvez' })
    expect(result.isLeft).toBe(true)
    expect(result.left).toBeInstanceOf(ContractError)
  })
})

describe('toFiscalEngineHealth', () => {
  it('mapeia a saúde do motor', () => {
    const result = toFiscalEngineHealth({
      disponivel: true,
      status: 'up',
      mensagem: null,
      latenciaMs: 42,
    })

    expect(result.isRight).toBe(true)
    expect(result.right.disponivel).toBe(true)
    expect(result.right.status).toBe('up')
    expect(result.right.latenciaMs).toBe(42)
    expect(result.right.mensagem).toBeNull()
  })

  it('aplica default de latência e nulos quando faltam', () => {
    const result = toFiscalEngineHealth({ disponivel: false })
    expect(result.isRight).toBe(true)
    expect(result.right.latenciaMs).toBe(0)
    expect(result.right.status).toBeNull()
  })

  it('devolve ContractError quando disponivel falta', () => {
    const result = toFiscalEngineHealth({ latenciaMs: 10 })
    expect(result.isLeft).toBe(true)
    expect(result.left).toBeInstanceOf(ContractError)
  })
})
