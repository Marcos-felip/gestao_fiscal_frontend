import type { FiscalDocumentModel } from '@/core/enums/fiscal-document-model.enum'
import type { FiscalEnvironment } from '@/core/enums/fiscal-environment.enum'

/**
 * Faixa de numeração inutilizada.
 *
 * Não tem documento fiscal: age sobre números que **nunca viraram nota**. Por
 * isso guarda série, modelo e faixa, e não uma chave de acesso.
 */
export class FiscalInutilization {
  readonly id: string
  readonly establishmentId: string
  readonly modelo: FiscalDocumentModel
  readonly ambiente: FiscalEnvironment
  readonly serie: number
  readonly numeroInicial: number
  readonly numeroFinal: number
  readonly ano: number
  readonly justificativa: string
  readonly protocolo: string | null
  readonly createdAt: Date

  constructor(fields: {
    id: string
    establishmentId: string
    modelo: FiscalDocumentModel
    ambiente: FiscalEnvironment
    serie: number
    numeroInicial: number
    numeroFinal: number
    ano: number
    justificativa: string
    protocolo: string | null
    createdAt: Date
  }) {
    this.id = fields.id
    this.establishmentId = fields.establishmentId
    this.modelo = fields.modelo
    this.ambiente = fields.ambiente
    this.serie = fields.serie
    this.numeroInicial = fields.numeroInicial
    this.numeroFinal = fields.numeroFinal
    this.ano = fields.ano
    this.justificativa = fields.justificativa
    this.protocolo = fields.protocolo
    this.createdAt = fields.createdAt
  }

  /** "nº 4" para número único, "nº 4 a 9" para faixa. */
  get faixaLabel(): string {
    return this.numeroInicial === this.numeroFinal
      ? `nº ${this.numeroInicial}`
      : `nº ${this.numeroInicial} a ${this.numeroFinal}`
  }
}
