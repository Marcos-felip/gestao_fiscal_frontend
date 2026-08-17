/**
 * Como o item da nota foi casado com o produto do catálogo.
 *
 * **Não é detalhe técnico: é a confiança do casamento.** Item casado pelo código
 * de barras e item casado pela memória de uma importação anterior valem coisas
 * diferentes — o segundo carrega o erro de quem escolheu daquela vez. Exibir os
 * dois com a mesma cara faria o usuário confirmar uma entrada de estoque sem
 * saber no que estava confiando.
 */
export const NfeImportMatch = {
  UNMATCHED: 'UNMATCHED',
  GTIN: 'GTIN',
  SUPPLIER_CODE: 'SUPPLIER_CODE',
  MANUAL: 'MANUAL',
} as const

export type NfeImportMatch =
  (typeof NfeImportMatch)[keyof typeof NfeImportMatch]

export const nfeImportMatchLabels: Record<NfeImportMatch, string> = {
  UNMATCHED: 'Não reconhecido',
  GTIN: 'Pelo código de barras',
  SUPPLIER_CODE: 'Pela importação anterior',
  MANUAL: 'Escolhido agora',
}

/** O que cada casamento significa, para quem vai conferir. */
export const nfeImportMatchHints: Record<NfeImportMatch, string> = {
  UNMATCHED: 'Aponte a que produto do catálogo este item corresponde.',
  GTIN: 'O código de barras da nota bate com o do produto.',
  SUPPLIER_CODE:
    'Veio de uma escolha feita numa nota anterior deste fornecedor — confira se ainda vale.',
  MANUAL: 'Você apontou este produto nesta importação.',
}
