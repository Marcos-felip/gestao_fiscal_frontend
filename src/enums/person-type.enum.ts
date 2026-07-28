export const PersonType = {
  PF: 'PF',
  PJ: 'PJ',
} as const

export type PersonType = (typeof PersonType)[keyof typeof PersonType]

export const personTypeLabels: Record<PersonType, string> = {
  PF: 'Pessoa Física',
  PJ: 'Pessoa Jurídica',
}

export const personTypeOptions: { value: PersonType; label: string }[] = [
  { value: PersonType.PF, label: personTypeLabels.PF },
  { value: PersonType.PJ, label: personTypeLabels.PJ },
]
