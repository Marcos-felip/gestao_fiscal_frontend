/**
 * Situações tributárias de ICMS suportadas pelo motor fiscal (fiscal_service).
 * O motor rejeita qualquer CSOSN/CST fora destes conjuntos, então o cadastro de
 * produto só oferece estes valores.
 * - CSOSN: regime Simples Nacional (CRT 1/2).
 * - CST ICMS: regime Normal (CRT 3).
 */

export const CSOSN_SUPORTADOS = [
  '101',
  '102',
  '103',
  '201',
  '202',
  '203',
  '300',
  '400',
  '500',
  '900',
] as const

export const CST_ICMS_SUPORTADOS = [
  '00',
  '10',
  '20',
  '30',
  '40',
  '41',
  '50',
  '51',
  '60',
  '70',
  '90',
] as const

/**
 * Situações que o backend aceita no cadastro mas **ainda recusa na emissão**:
 * elas exigem substituição tributária, redução de base ou crédito do Simples,
 * que dependem da matriz tributária por operação — etapa 2 do roteiro fiscal.
 * Ficam disponíveis para o cadastro nascer correto antes de a emissão alcançar.
 */
export const SITUACOES_SEM_EMISSAO = [
  '101',
  '201',
  '202',
  '203',
  '500',
  '10',
  '20',
  '30',
  '60',
  '70',
] as const

export const csosnOptions: { value: string; label: string }[] = [
  { value: '101', label: '101 - Tributada com permissão de crédito' },
  { value: '102', label: '102 - Tributada sem permissão de crédito' },
  { value: '103', label: '103 - Isenção do ICMS para faixa de receita' },
  { value: '201', label: '201 - Com crédito e com ST' },
  { value: '202', label: '202 - Sem crédito e com ST' },
  { value: '203', label: '203 - Isenção para faixa de receita e com ST' },
  { value: '300', label: '300 - Imune' },
  { value: '400', label: '400 - Não tributada' },
  { value: '500', label: '500 - ICMS cobrado anteriormente por ST' },
  { value: '900', label: '900 - Outras' },
]

export const cstIcmsOptions: { value: string; label: string }[] = [
  { value: '00', label: '00 - Tributada integralmente' },
  { value: '10', label: '10 - Tributada e com cobrança por ST' },
  { value: '20', label: '20 - Com redução de base de cálculo' },
  { value: '30', label: '30 - Isenta ou não tributada e com ST' },
  { value: '40', label: '40 - Isenta' },
  { value: '41', label: '41 - Não tributada' },
  { value: '50', label: '50 - Suspensão' },
  { value: '51', label: '51 - Diferimento' },
  { value: '60', label: '60 - ICMS cobrado anteriormente por ST' },
  { value: '70', label: '70 - Com redução de base e com ST' },
  { value: '90', label: '90 - Outras' },
]
