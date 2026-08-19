import type { FiscalDocumentModel } from '@/core/enums/fiscal-document-model.enum'

/** Faixa de numeração a inutilizar, com o motivo que fica registrado na SEFAZ. */
export class InutilizeNumberingDto {
  readonly establishmentId: string
  readonly modelo: FiscalDocumentModel
  readonly serie: number
  readonly numeroInicial: number
  readonly numeroFinal: number
  readonly justificativa: string
  /** Ausente = exercício corrente, que é o caso comum. */
  readonly ano?: number

  constructor(fields: {
    establishmentId: string
    modelo: FiscalDocumentModel
    serie: number
    numeroInicial: number
    numeroFinal: number
    justificativa: string
    ano?: number
  }) {
    this.establishmentId = fields.establishmentId
    this.modelo = fields.modelo
    this.serie = fields.serie
    this.numeroInicial = fields.numeroInicial
    this.numeroFinal = fields.numeroFinal
    this.justificativa = fields.justificativa
    this.ano = fields.ano
  }
}
