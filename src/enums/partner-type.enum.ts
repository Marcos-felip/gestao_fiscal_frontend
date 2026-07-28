export const PartnerType = {
  CLIENT: 'CLIENT',
  SUPPLIER: 'SUPPLIER',
  BOTH: 'BOTH',
} as const

export type PartnerType = (typeof PartnerType)[keyof typeof PartnerType]

export const partnerTypeLabels: Record<PartnerType, string> = {
  CLIENT: 'Cliente',
  SUPPLIER: 'Fornecedor',
  BOTH: 'Ambos',
}

export const partnerTypeOptions: { value: PartnerType; label: string }[] = [
  { value: PartnerType.CLIENT, label: partnerTypeLabels.CLIENT },
  { value: PartnerType.SUPPLIER, label: partnerTypeLabels.SUPPLIER },
  { value: PartnerType.BOTH, label: partnerTypeLabels.BOTH },
]
