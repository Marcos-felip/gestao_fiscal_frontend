import { z } from 'zod'
import { UnitOfMeasure } from '@/core/enums/unit-of-measure.enum'
import {
  CSOSN_SUPORTADOS,
  CST_ICMS_SUPORTADOS,
} from '@/core/enums/fiscal-tax-situation.enum'
import {
  CST_CONTRIBUICAO_SUPORTADOS,
  exigeAliquota,
} from '@/core/enums/cst-contribuicao.enum'
import { onlyDigits, parseDecimal } from '@/shared/ui/utils/masks'

/** Refine: string vazia OU um dos códigos suportados pelo motor fiscal. */
function optionalOneOf(codes: readonly string[], message: string) {
  return z
    .string()
    .optional()
    .refine((v) => !v || codes.includes(v), message)
}

/** Refine reutilizável: string vazia OU decimal válido >= 0. */
function optionalPositiveDecimal(message: string) {
  return z
    .string()
    .optional()
    .refine((v) => {
      if (!v) return true
      const parsed = parseDecimal(v)
      return parsed !== undefined && parsed >= 0
    }, message)
}

/** Refine: string vazia OU exatamente `length` dígitos. */
function optionalDigits(length: number, message: string) {
  return z
    .string()
    .optional()
    .refine((v) => !v || onlyDigits(v).length === length, message)
}

/** Refine: string vazia OU GTIN válido (8, 12, 13 ou 14 dígitos). */
function optionalGtin(message: string) {
  return z
    .string()
    .optional()
    .refine(
      (v) => !v || [8, 12, 13, 14].includes(onlyDigits(v).length),
      message,
    )
}

/** Refine: string vazia OU percentual (decimal) entre 0 e 100. */
function optionalPercent(message: string) {
  return z
    .string()
    .optional()
    .refine((v) => {
      if (!v) return true
      const parsed = parseDecimal(v)
      return parsed !== undefined && parsed >= 0 && parsed <= 100
    }, message)
}

export const productSchema = z.object({
  name: z
    .string()
    .min(2, 'Mínimo 2 caracteres')
    .max(120, 'Máximo 120 caracteres'),
  sku: z.string().max(60, 'Máximo 60 caracteres').optional(),
  barcode: optionalGtin('GTIN deve ter 8, 12, 13 ou 14 dígitos'),
  unit: z.nativeEnum(UnitOfMeasure, {
    errorMap: () => ({ message: 'Selecione a unidade' }),
  }),
  description: z.string().max(1000, 'Máximo 1000 caracteres').optional(),
  costPrice: optionalPositiveDecimal('Preço de custo inválido'),
  salePrice: optionalPositiveDecimal('Preço de venda inválido'),
  minStock: optionalPositiveDecimal('Estoque mínimo inválido'),
  ncm: optionalDigits(8, 'NCM deve ter 8 dígitos'),
  cest: optionalDigits(7, 'CEST deve ter 7 dígitos'),
  cfop: optionalDigits(4, 'CFOP deve ter 4 dígitos'),
  origin: z.string().optional(),
  csosn: optionalOneOf(CSOSN_SUPORTADOS, 'CSOSN não suportado pela emissão'),
  cstIcms: optionalOneOf(
    CST_ICMS_SUPORTADOS,
    'CST ICMS não suportado pela emissão',
  ),
  // Obrigatórios desde que o motor deixou de completar PIS/COFINS com CST 07
  // fixo: sem eles o produto não compõe quadro tributário e a nota não sai.
  cstPis: z
    .string()
    .min(1, 'Selecione a situação tributária de PIS')
    .refine(
      (valor) => (CST_CONTRIBUICAO_SUPORTADOS as readonly string[]).includes(valor),
      'CST de PIS não suportado pela emissão',
    ),
  cstCofins: z
    .string()
    .min(1, 'Selecione a situação tributária de COFINS')
    .refine(
      (valor) => (CST_CONTRIBUICAO_SUPORTADOS as readonly string[]).includes(valor),
      'CST de COFINS não suportado pela emissão',
    ),
  aliquotaIcms: optionalPercent('Alíquota deve estar entre 0 e 100'),
  aliquotaPis: optionalPercent('Alíquota deve estar entre 0 e 100'),
  aliquotaCofins: optionalPercent('Alíquota deve estar entre 0 e 100'),
})
  .refine(
    (valores) => !exigeAliquota(valores.cstPis) || valores.aliquotaPis !== undefined,
    {
      message: 'Informe a alíquota de PIS para a situação escolhida',
      path: ['aliquotaPis'],
    },
  )
  .refine(
    (valores) =>
      !exigeAliquota(valores.cstCofins) || valores.aliquotaCofins !== undefined,
    {
      message: 'Informe a alíquota de COFINS para a situação escolhida',
      path: ['aliquotaCofins'],
    },
  )

export type ProductFormData = z.infer<typeof productSchema>

/** Par chave/valor livre dos atributos técnicos (JSON). */
export interface AttributeRow {
  key: string
  value: string
}

export interface ProductFormValues {
  name: string
  sku: string
  barcode: string
  unit: string
  description: string
  costPrice: string
  salePrice: string
  minStock: string
  ncm: string
  cest: string
  cfop: string
  origin: string
  csosn: string
  cstIcms: string
  cstPis: string
  cstCofins: string
  aliquotaIcms: string
  aliquotaPis: string
  aliquotaCofins: string
  /** Somente leitura: indicador de completude fiscal vindo do backend. */
  fiscalComplete: boolean
  attributes: AttributeRow[]
}

/**
 * Formulário de produto em branco.
 *
 * Vive aqui, e não no controller, porque outros fluxos partem dele já
 * preenchido — a importação de nota de entrada cadastra o produto a partir do
 * que o XML trouxe, sem sair da conferência.
 */
export function emptyProductForm(): ProductFormValues {
  return {
    name: '',
    sku: '',
    barcode: '',
    unit: UnitOfMeasure.UN,
    description: '',
    costPrice: '',
    salePrice: '',
    minStock: '',
    ncm: '',
    cest: '',
    cfop: '',
    origin: '',
    csosn: '',
    cstIcms: '',
    cstPis: '',
    cstCofins: '',
    aliquotaIcms: '',
    aliquotaPis: '',
    aliquotaCofins: '',
    fiscalComplete: false,
    attributes: [],
  }
}
