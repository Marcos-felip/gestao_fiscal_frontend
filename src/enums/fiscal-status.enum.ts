import type { FiscalStatusTone } from '@/enums/fiscal-document-status.enum'

/**
 * Status fiscal resumido de uma venda. É diferente do `FiscalDocumentStatus`
 * (10 estágios do documento): aqui há apenas 5 estágios visíveis no fluxo da venda.
 */
export const FiscalStatus = {
  NAO_EMITIDO: 'NAO_EMITIDO',
  PROCESSANDO: 'PROCESSANDO',
  AUTORIZADO: 'AUTORIZADO',
  REJEITADO: 'REJEITADO',
  CANCELADO: 'CANCELADO',
} as const

export type FiscalStatus = (typeof FiscalStatus)[keyof typeof FiscalStatus]

export const fiscalStatusLabels: Record<FiscalStatus, string> = {
  NAO_EMITIDO: 'Não emitido',
  PROCESSANDO: 'Processando',
  AUTORIZADO: 'Autorizado',
  REJEITADO: 'Rejeitado',
  CANCELADO: 'Cancelado',
}

export const fiscalStatusTones: Record<FiscalStatus, FiscalStatusTone> = {
  NAO_EMITIDO: 'muted',
  PROCESSANDO: 'warning',
  AUTORIZADO: 'success',
  REJEITADO: 'error',
  CANCELADO: 'muted',
}

export const fiscalStatusOptions: { value: FiscalStatus; label: string }[] = [
  { value: FiscalStatus.NAO_EMITIDO, label: fiscalStatusLabels.NAO_EMITIDO },
  { value: FiscalStatus.PROCESSANDO, label: fiscalStatusLabels.PROCESSANDO },
  { value: FiscalStatus.AUTORIZADO, label: fiscalStatusLabels.AUTORIZADO },
  { value: FiscalStatus.REJEITADO, label: fiscalStatusLabels.REJEITADO },
  { value: FiscalStatus.CANCELADO, label: fiscalStatusLabels.CANCELADO },
]
