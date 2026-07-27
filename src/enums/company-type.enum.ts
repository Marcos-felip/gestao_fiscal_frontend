export const CompanyType = {
  MEI: 'MEI',
  ME: 'ME',
  EPP: 'EPP',
  LTDA: 'LTDA',
  SA: 'SA',
  EIRELI: 'EIRELI',
  SLU: 'SLU',
} as const

export type CompanyType = (typeof CompanyType)[keyof typeof CompanyType]

export const companyTypeOptions: { value: CompanyType; label: string }[] = [
  { value: CompanyType.MEI, label: 'MEI — Microempreendedor Individual' },
  { value: CompanyType.ME, label: 'ME — Microempresa' },
  { value: CompanyType.EPP, label: 'EPP — Empresa de Pequeno Porte' },
  { value: CompanyType.LTDA, label: 'LTDA — Sociedade Limitada' },
  { value: CompanyType.SA, label: 'SA — Sociedade Anônima' },
  { value: CompanyType.EIRELI, label: 'EIRELI — Empresa Individual (Eireli)' },
  { value: CompanyType.SLU, label: 'SLU — Sociedade Limitada Unipessoal' },
]
