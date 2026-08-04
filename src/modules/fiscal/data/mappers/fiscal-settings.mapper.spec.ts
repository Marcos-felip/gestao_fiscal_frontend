import { describe, expect, it } from 'vitest'
import {
  toFiscalSettings,
  toFiscalSettingsList,
  toFiscalSettingsOrNull,
} from '@/modules/fiscal/data/mappers/fiscal-settings.mapper'
import { ContractError } from '@/core/errors/contract-error'

const validRaw = {
  id: 'fs-1',
  establishmentId: 'est-1',
  companyId: 'comp-1',
  ambiente: 'HOMOLOGACAO',
  serieNfce: 1,
  proximoNumeroNfce: 42,
  codigoCsc: 'CSC-123',
  idCsc: '000001',
  certificadoRef: 'vault://cert',
  certificadoSenhaRef: 'vault://senha',
  certificadoValidade: '2030-01-01T00:00:00.000Z',
  certificadoSubject: 'CN=Empresa',
  ativo: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-02-01T00:00:00.000Z',
  establishment: { id: 'est-1', name: 'Loja Centro', type: 'MATRIZ' },
}

describe('toFiscalSettings', () => {
  it('converte datas ISO em Date e preserva os campos', () => {
    const result = toFiscalSettings(validRaw)

    expect(result.isRight).toBe(true)
    const settings = result.right
    expect(settings.id).toBe('fs-1')
    expect(settings.proximoNumeroNfce).toBe(42)
    expect(settings.certificadoValidade).toBeInstanceOf(Date)
    expect(settings.certificadoValidade?.toISOString()).toBe(
      '2030-01-01T00:00:00.000Z',
    )
    expect(settings.createdAt).toBeInstanceOf(Date)
    expect(settings.hasCertificate).toBe(true)
    expect(settings.isCertificateExpired).toBe(false)
    expect(settings.establishment?.name).toBe('Loja Centro')
  })

  it('preserva nulos e aplica defaults quando campos opcionais faltam', () => {
    const result = toFiscalSettings({
      id: 'fs-2',
      establishmentId: 'est-2',
      companyId: 'comp-1',
      ambiente: 'PRODUCAO',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    })

    expect(result.isRight).toBe(true)
    const settings = result.right
    expect(settings.serieNfce).toBe(1)
    expect(settings.proximoNumeroNfce).toBe(1)
    expect(settings.ativo).toBe(true)
    expect(settings.codigoCsc).toBeNull()
    expect(settings.certificadoValidade).toBeNull()
    expect(settings.hasCertificate).toBe(false)
    expect(settings.certificateExpiresInDays).toBeNull()
    expect(settings.establishment).toBeNull()
  })

  it('marca certificado vencido e expirando pelos getters', () => {
    const past = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const expired = toFiscalSettings({ ...validRaw, certificadoValidade: past })
    expect(expired.right.isCertificateExpired).toBe(true)

    const soon = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString()
    const expiring = toFiscalSettings({
      ...validRaw,
      certificadoValidade: soon,
    })
    expect(expiring.right.isCertificateExpiring).toBe(true)
    expect(expiring.right.isCertificateExpired).toBe(false)
  })

  it('devolve ContractError quando um campo tem tipo errado', () => {
    const result = toFiscalSettings({ ...validRaw, serieNfce: 'não-é-número' })
    expect(result.isLeft).toBe(true)
    expect(result.left).toBeInstanceOf(ContractError)
  })

  it('devolve ContractError quando um campo obrigatório falta', () => {
    const result = toFiscalSettings({ id: 'fs-3' })
    expect(result.isLeft).toBe(true)
    expect(result.left).toBeInstanceOf(ContractError)
  })
})

describe('toFiscalSettingsList', () => {
  it('mapeia a lista (array cru) de configurações', () => {
    const result = toFiscalSettingsList([validRaw])
    expect(result.isRight).toBe(true)
    expect(result.right).toHaveLength(1)
    expect(result.right[0].id).toBe('fs-1')
  })

  it('devolve ContractError quando não é um array', () => {
    const result = toFiscalSettingsList({ nope: true })
    expect(result.isLeft).toBe(true)
    expect(result.left).toBeInstanceOf(ContractError)
  })
})

describe('toFiscalSettingsOrNull', () => {
  it('devolve null quando o estabelecimento ainda não foi configurado', () => {
    expect(toFiscalSettingsOrNull(null).right).toBeNull()
    expect(toFiscalSettingsOrNull('').right).toBeNull()
  })

  it('mapeia a configuração quando presente', () => {
    const result = toFiscalSettingsOrNull(validRaw)
    expect(result.isRight).toBe(true)
    expect(result.right?.id).toBe('fs-1')
  })
})
