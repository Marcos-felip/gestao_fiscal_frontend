export const FiscalDocumentModel = {
  NFE: 'NFE',
  NFCE: 'NFCE',
} as const

export type FiscalDocumentModel =
  (typeof FiscalDocumentModel)[keyof typeof FiscalDocumentModel]

export const fiscalDocumentModelLabels: Record<FiscalDocumentModel, string> = {
  NFE: 'NF-e (55)',
  NFCE: 'NFC-e (65)',
}

export const fiscalDocumentModelOptions: {
  value: FiscalDocumentModel
  label: string
}[] = [
  { value: FiscalDocumentModel.NFE, label: fiscalDocumentModelLabels.NFE },
  { value: FiscalDocumentModel.NFCE, label: fiscalDocumentModelLabels.NFCE },
]
