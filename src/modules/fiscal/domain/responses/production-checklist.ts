import type { FiscalDocumentModel } from '@/core/enums/fiscal-document-model.enum'

/**
 * Código estável do item, para a tela agir sobre um item específico sem casar
 * com o texto dele — que existe para ser reescrito. Opcional porque um backend
 * anterior ao campo não deve derrubar o checklist inteiro.
 */
export type ProductionChecklistItemCode =
  | 'certificado_enviado'
  | 'certificado_vigente'
  | 'csc'
  | 'serie'
  | 'proximo_numero'
  | 'consulta_publica'
  | 'produtos_fiscais'

export interface ProductionChecklistItem {
  codigo?: ProductionChecklistItemCode
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
