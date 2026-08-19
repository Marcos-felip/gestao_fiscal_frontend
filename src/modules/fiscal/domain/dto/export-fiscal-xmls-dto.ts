import type { FiscalDocumentModel } from '@/core/enums/fiscal-document-model.enum'
import type { FiscalEnvironment } from '@/core/enums/fiscal-environment.enum'

/**
 * Filtros da exportação em lote dos XMLs
 * (`GET /fiscal/documents/xml/export`).
 *
 * As datas trafegam como `aaaa-MM-dd`, **sem hora**, de propósito: o backend
 * lê data sem hora como o dia inteiro. Convertê-las com `dateInputToIso`
 * mandaria `2026-08-31T03:00:00Z`, que o backend trataria como o instante
 * exato — e as notas do dia 31 ficariam de fora do fechamento sem ninguém
 * perceber.
 */
export class ExportFiscalXmlsDto {
  dataInicio: string
  dataFim: string
  establishmentId?: string
  modelo?: FiscalDocumentModel
  ambiente?: FiscalEnvironment

  constructor(fields: {
    dataInicio: string
    dataFim: string
    establishmentId?: string
    modelo?: FiscalDocumentModel
    ambiente?: FiscalEnvironment
  }) {
    this.dataInicio = fields.dataInicio
    this.dataFim = fields.dataFim
    this.establishmentId = fields.establishmentId
    this.modelo = fields.modelo
    this.ambiente = fields.ambiente
  }
}
