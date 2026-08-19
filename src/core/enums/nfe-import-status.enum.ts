export const NfeImportStatus = {
  /** Lida, com itens ainda por casar. */
  PENDING: 'PENDING',
  /** Todos os itens casados; pronta para virar compra. */
  READY: 'READY',
  /** Já gerou a compra em rascunho. */
  IMPORTED: 'IMPORTED',
  /** Descartada pelo usuário. */
  DISCARDED: 'DISCARDED',
} as const

export type NfeImportStatus =
  (typeof NfeImportStatus)[keyof typeof NfeImportStatus]

export const nfeImportStatusLabels: Record<NfeImportStatus, string> = {
  PENDING: 'Aguardando conferência',
  READY: 'Pronta para gerar a compra',
  IMPORTED: 'Compra gerada',
  DISCARDED: 'Descartada',
}
