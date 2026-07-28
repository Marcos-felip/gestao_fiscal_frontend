export const UnitOfMeasure = {
  UN: 'UN',
  KG: 'KG',
  LT: 'LT',
  MT: 'MT',
  CX: 'CX',
  PC: 'PC',
  PCT: 'PCT',
  DZ: 'DZ',
} as const

export type UnitOfMeasure = (typeof UnitOfMeasure)[keyof typeof UnitOfMeasure]

export const unitOfMeasureLabels: Record<UnitOfMeasure, string> = {
  UN: 'Unidade',
  KG: 'Quilograma',
  LT: 'Litro',
  MT: 'Metro',
  CX: 'Caixa',
  PC: 'Peça',
  PCT: 'Pacote',
  DZ: 'Dúzia',
}

export const unitOfMeasureShortLabels: Record<UnitOfMeasure, string> = {
  UN: 'UN',
  KG: 'KG',
  LT: 'LT',
  MT: 'MT',
  CX: 'CX',
  PC: 'PC',
  PCT: 'PCT',
  DZ: 'DZ',
}

export const unitOfMeasureOptions: { value: UnitOfMeasure; label: string }[] = [
  { value: UnitOfMeasure.UN, label: `${unitOfMeasureLabels.UN} (UN)` },
  { value: UnitOfMeasure.KG, label: `${unitOfMeasureLabels.KG} (KG)` },
  { value: UnitOfMeasure.LT, label: `${unitOfMeasureLabels.LT} (LT)` },
  { value: UnitOfMeasure.MT, label: `${unitOfMeasureLabels.MT} (MT)` },
  { value: UnitOfMeasure.CX, label: `${unitOfMeasureLabels.CX} (CX)` },
  { value: UnitOfMeasure.PC, label: `${unitOfMeasureLabels.PC} (PC)` },
  { value: UnitOfMeasure.PCT, label: `${unitOfMeasureLabels.PCT} (PCT)` },
  { value: UnitOfMeasure.DZ, label: `${unitOfMeasureLabels.DZ} (DZ)` },
]
