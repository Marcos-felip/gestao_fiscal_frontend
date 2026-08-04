export const FiscalDocumentStatus = {
  NAO_EMITIDO: 'NAO_EMITIDO',
  PENDENTE: 'PENDENTE',
  PROCESSANDO: 'PROCESSANDO',
  AUTORIZADO: 'AUTORIZADO',
  REJEITADO: 'REJEITADO',
  ERRO: 'ERRO',
  CONTINGENCIA: 'CONTINGENCIA',
  CANCELAMENTO_PENDENTE: 'CANCELAMENTO_PENDENTE',
  CANCELADO: 'CANCELADO',
  INUTILIZADO: 'INUTILIZADO',
} as const

export type FiscalDocumentStatus =
  (typeof FiscalDocumentStatus)[keyof typeof FiscalDocumentStatus]

/** Tom visual para o badge de status do documento fiscal. */
export type FiscalStatusTone = 'success' | 'error' | 'warning' | 'muted'

export const fiscalDocumentStatusLabels: Record<FiscalDocumentStatus, string> =
  {
    NAO_EMITIDO: 'Não emitido',
    PENDENTE: 'Pendente',
    PROCESSANDO: 'Processando',
    AUTORIZADO: 'Autorizado',
    REJEITADO: 'Rejeitado',
    ERRO: 'Erro',
    CONTINGENCIA: 'Contingência',
    CANCELAMENTO_PENDENTE: 'Cancelamento pendente',
    CANCELADO: 'Cancelado',
    INUTILIZADO: 'Inutilizado',
  }

export const fiscalDocumentStatusTones: Record<
  FiscalDocumentStatus,
  FiscalStatusTone
> = {
  NAO_EMITIDO: 'muted',
  PENDENTE: 'warning',
  PROCESSANDO: 'warning',
  AUTORIZADO: 'success',
  REJEITADO: 'error',
  ERRO: 'error',
  CONTINGENCIA: 'warning',
  CANCELAMENTO_PENDENTE: 'warning',
  CANCELADO: 'muted',
  INUTILIZADO: 'muted',
}

export const fiscalDocumentStatusOptions: {
  value: FiscalDocumentStatus
  label: string
}[] = [
  {
    value: FiscalDocumentStatus.NAO_EMITIDO,
    label: fiscalDocumentStatusLabels.NAO_EMITIDO,
  },
  {
    value: FiscalDocumentStatus.PENDENTE,
    label: fiscalDocumentStatusLabels.PENDENTE,
  },
  {
    value: FiscalDocumentStatus.PROCESSANDO,
    label: fiscalDocumentStatusLabels.PROCESSANDO,
  },
  {
    value: FiscalDocumentStatus.AUTORIZADO,
    label: fiscalDocumentStatusLabels.AUTORIZADO,
  },
  {
    value: FiscalDocumentStatus.REJEITADO,
    label: fiscalDocumentStatusLabels.REJEITADO,
  },
  { value: FiscalDocumentStatus.ERRO, label: fiscalDocumentStatusLabels.ERRO },
  {
    value: FiscalDocumentStatus.CONTINGENCIA,
    label: fiscalDocumentStatusLabels.CONTINGENCIA,
  },
  {
    value: FiscalDocumentStatus.CANCELAMENTO_PENDENTE,
    label: fiscalDocumentStatusLabels.CANCELAMENTO_PENDENTE,
  },
  {
    value: FiscalDocumentStatus.CANCELADO,
    label: fiscalDocumentStatusLabels.CANCELADO,
  },
  {
    value: FiscalDocumentStatus.INUTILIZADO,
    label: fiscalDocumentStatusLabels.INUTILIZADO,
  },
]
