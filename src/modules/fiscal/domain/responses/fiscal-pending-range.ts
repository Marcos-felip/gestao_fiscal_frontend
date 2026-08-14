import type { FiscalDocumentModel } from '@/core/enums/fiscal-document-model.enum'

/**
 * Faixas de numeração reservadas que nunca viraram documento, por modelo e
 * série.
 *
 * O backend as calcula do que já existe — não há rastreamento à parte. Servem
 * para **sugerir** a faixa em vez de deixar digitar: errar a faixa aqui
 * inutiliza numeração válida, e isso não se desfaz.
 */
export interface FiscalPendingRange {
  modelo: FiscalDocumentModel
  serie: number
  faixas: { inicio: number; fim: number }[]
}
