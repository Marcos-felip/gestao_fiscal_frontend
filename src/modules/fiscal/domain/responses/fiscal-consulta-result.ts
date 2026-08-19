import type { FiscalDocumentStatus } from '@/core/enums/fiscal-document-status.enum'

/**
 * Resultado da consulta de situação de um documento fiscal na SEFAZ.
 * `atualizado` indica se o status local mudou por causa da consulta — nesse
 * caso a tela deve recarregar o documento.
 */
export interface FiscalConsultaResult {
  situacao: string | null
  protocolo: string | null
  status: FiscalDocumentStatus
  atualizado: boolean
  mensagem: string | null
}
