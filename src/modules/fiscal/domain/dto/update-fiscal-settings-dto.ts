import type { FiscalEnvironment } from '@/core/enums/fiscal-environment.enum'

export class UpdateFiscalSettingsDto {
  ambiente?: FiscalEnvironment
  serieNfce?: number
  proximoNumeroNfce?: number
  codigoCsc?: string
  idCsc?: string
  certificadoRef?: string
  certificadoSenhaRef?: string
  certificadoValidade?: string
  certificadoSubject?: string
  ativo?: boolean

  constructor(fields: {
    ambiente?: FiscalEnvironment
    serieNfce?: number
    proximoNumeroNfce?: number
    codigoCsc?: string
    idCsc?: string
    certificadoRef?: string
    certificadoSenhaRef?: string
    certificadoValidade?: string
    certificadoSubject?: string
    ativo?: boolean
  }) {
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
  }
}
