import type { FiscalEnvironment } from '@/enums/fiscal-environment.enum'

export class CreateFiscalSettingsDto {
  establishmentId: string
  ambiente?: FiscalEnvironment
  serieNfce?: number
  codigoCsc?: string
  idCsc?: string
  certificadoRef?: string
  certificadoSenhaRef?: string
  ativo?: boolean

  constructor(fields: {
    establishmentId: string
    ambiente?: FiscalEnvironment
    serieNfce?: number
    codigoCsc?: string
    idCsc?: string
    certificadoRef?: string
    certificadoSenhaRef?: string
    ativo?: boolean
  }) {
    this.establishmentId = fields.establishmentId
    this.ambiente = fields.ambiente
    this.serieNfce = fields.serieNfce
    this.codigoCsc = fields.codigoCsc
    this.idCsc = fields.idCsc
    this.certificadoRef = fields.certificadoRef
    this.certificadoSenhaRef = fields.certificadoSenhaRef
    this.ativo = fields.ativo
  }
}
