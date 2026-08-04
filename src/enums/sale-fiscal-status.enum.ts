import type { FiscalStatusTone } from '@/enums/fiscal-document-status.enum'

/**
 * Status fiscal resumido de uma venda (`FiscalStatus` da venda). É diferente do
 * `FiscalDocumentStatus`: aqui há apenas 5 estágios visíveis no fluxo de venda.
 */
export const SaleFiscalStatus = {
  NAO_EMITIDO: 'NAO_EMITIDO',
  PROCESSANDO: 'PROCESSANDO',
  AUTORIZADO: 'AUTORIZADO',
  REJEITADO: 'REJEITADO',
  CANCELADO: 'CANCELADO',
} as const

export type SaleFiscalStatus =
  (typeof SaleFiscalStatus)[keyof typeof SaleFiscalStatus]

export const saleFiscalStatusLabels: Record<SaleFiscalStatus, string> = {
  NAO_EMITIDO: 'Não emitido',
  PROCESSANDO: 'Processando',
  AUTORIZADO: 'Autorizado',
  REJEITADO: 'Rejeitado',
  CANCELADO: 'Cancelado',
}

export const saleFiscalStatusTones: Record<SaleFiscalStatus, FiscalStatusTone> =
  {
    NAO_EMITIDO: 'muted',
    PROCESSANDO: 'warning',
    AUTORIZADO: 'success',
    REJEITADO: 'error',
    CANCELADO: 'muted',
  }

export const saleFiscalStatusOptions: {
  value: SaleFiscalStatus
  label: string
}[] = [
  {
    value: SaleFiscalStatus.NAO_EMITIDO,
    label: saleFiscalStatusLabels.NAO_EMITIDO,
  },
  {
    value: SaleFiscalStatus.PROCESSANDO,
    label: saleFiscalStatusLabels.PROCESSANDO,
  },
  {
    value: SaleFiscalStatus.AUTORIZADO,
    label: saleFiscalStatusLabels.AUTORIZADO,
  },
  {
    value: SaleFiscalStatus.REJEITADO,
    label: saleFiscalStatusLabels.REJEITADO,
  },
  {
    value: SaleFiscalStatus.CANCELADO,
    label: saleFiscalStatusLabels.CANCELADO,
  },
]
