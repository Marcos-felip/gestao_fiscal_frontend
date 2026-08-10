import type { FiscalEnvironment } from '@/core/enums/fiscal-environment.enum'

/** Dados do estabelecimento referenciados na resposta de configuração fiscal. */
export interface FiscalSettingsEstablishmentRef {
  id: string
  name: string
  type?: string
}

/**
 * Configuração fiscal por estabelecimento: ambiente, série/numeração da NFC-e,
 * CSC e o certificado digital (guardado por referência, nunca o binário).
 */
export class FiscalSettings {
  readonly id: string
  readonly establishmentId: string
  readonly companyId: string
  readonly ambiente: FiscalEnvironment
  readonly serieNfce: number
  readonly proximoNumeroNfce: number
  readonly codigoCsc: string | null
  readonly idCsc: string | null
  readonly certificadoRef: string | null
  readonly certificadoSenhaRef: string | null
  readonly certificadoValidade: Date | null
  readonly certificadoSubject: string | null
  readonly ativo: boolean
  readonly createdAt: Date
  readonly updatedAt: Date
  readonly establishment: FiscalSettingsEstablishmentRef | null

  constructor(fields: {
    id: string
    establishmentId: string
    companyId: string
    ambiente: FiscalEnvironment
    serieNfce: number
    proximoNumeroNfce: number
    codigoCsc: string | null
    idCsc: string | null
    certificadoRef: string | null
    certificadoSenhaRef: string | null
    certificadoValidade: Date | null
    certificadoSubject: string | null
    ativo: boolean
    createdAt: Date
    updatedAt: Date
    establishment: FiscalSettingsEstablishmentRef | null
  }) {
    this.id = fields.id
    this.establishmentId = fields.establishmentId
    this.companyId = fields.companyId
    this.ambiente = fields.ambiente
    this.serieNfce = fields.serieNfce
    this.proximoNumeroNfce = fields.proximoNumeroNfce
    this.codigoCsc = fields.codigoCsc
    this.idCsc = fields.idCsc
    this.certificadoRef = fields.certificadoRef
    this.certificadoSenhaRef = fields.certificadoSenhaRef
    this.certificadoValidade = fields.certificadoValidade
    this.certificadoSubject = fields.certificadoSubject
    this.ativo = fields.ativo
    this.createdAt = fields.createdAt
    this.updatedAt = fields.updatedAt
    this.establishment = fields.establishment
  }

  /** Há certificado configurado (com validade conhecida). */
  get hasCertificate(): boolean {
    return this.certificadoValidade !== null
  }

  /** Dias restantes até a validade do certificado, ou `null` se não houver. */
  get certificateExpiresInDays(): number | null {
    if (this.certificadoValidade === null) return null
    const msPerDay = 1000 * 60 * 60 * 24
    const diff = this.certificadoValidade.getTime() - Date.now()
    return Math.ceil(diff / msPerDay)
  }

  /** Certificado vence em 30 dias ou menos (e ainda não venceu). */
  get isCertificateExpiring(): boolean {
    const days = this.certificateExpiresInDays
    return days !== null && days <= 30 && days >= 0
  }

  /** Certificado já vencido (validade anterior a agora). */
  get isCertificateExpired(): boolean {
    if (this.certificadoValidade === null) return false
    return this.certificadoValidade.getTime() < Date.now()
  }
}
