import type { FiscalDocumentModel } from '@/core/enums/fiscal-document-model.enum'

export interface ProductionChecklistItem {
  item: string
  ok: boolean
  detalhe?: string
  bloqueante?: boolean
  /** Ausente = vale para todos os modelos, como o certificado. */
  modelo?: FiscalDocumentModel
}

export interface ProductionChecklist {
  liberada: boolean
  liberadaEm: string | null
  itens: ProductionChecklistItem[]
}

export interface ConsultaPublicaResult {
  validada: boolean
  chaveAcesso: string
  situacao: string
}
