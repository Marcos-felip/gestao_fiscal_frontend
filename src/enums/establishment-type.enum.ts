export const EstablishmentType = {
  MATRIZ: 'MATRIZ',
  FILIAL: 'FILIAL',
} as const

export type EstablishmentType =
  (typeof EstablishmentType)[keyof typeof EstablishmentType]

export const establishmentTypeOptions: {
  value: EstablishmentType
  label: string
}[] = [
  { value: EstablishmentType.MATRIZ, label: 'Matriz' },
  { value: EstablishmentType.FILIAL, label: 'Filial' },
]
