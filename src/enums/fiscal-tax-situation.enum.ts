/**
 * Situações tributárias de ICMS suportadas pelo motor fiscal (fiscal_service).
 * O motor rejeita qualquer CSOSN/CST fora destes conjuntos, então o cadastro de
 * produto só oferece estes valores.
 * - CSOSN: regime Simples Nacional (CRT 1/2).
 * - CST ICMS: regime Normal (CRT 3).
 */

export const CSOSN_SUPORTADOS = ['102', '103', '300', '400', '500'] as const

export const CST_ICMS_SUPORTADOS = ['40', '41', '50'] as const

export const csosnOptions: { value: string; label: string }[] = [
  { value: '102', label: '102 - Tributada sem permissão de crédito' },
  { value: '103', label: '103 - Isenção do ICMS para faixa de receita' },
  { value: '300', label: '300 - Imune' },
  { value: '400', label: '400 - Não tributada' },
  { value: '500', label: '500 - ICMS cobrado anteriormente por ST' },
]

export const cstIcmsOptions: { value: string; label: string }[] = [
  { value: '40', label: '40 - Isenta' },
  { value: '41', label: '41 - Não tributada' },
  { value: '50', label: '50 - Suspensão' },
]
