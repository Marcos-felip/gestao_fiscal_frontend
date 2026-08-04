import { z } from 'zod'
import { UnitOfMeasure } from '@/enums/unit-of-measure.enum'
import { onlyDigits, parseDecimal } from '@/shared/ui/utils/masks'

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
  csosn: z.string().max(4, 'Máximo 4 dígitos').optional(),
  cstIcms: z.string().max(3, 'Máximo 3 dígitos').optional(),
  cstPis: z.string().max(2, 'Máximo 2 dígitos').optional(),
  cstCofins: z.string().max(2, 'Máximo 2 dígitos').optional(),
  aliquotaIcms: optionalPercent('Alíquota deve estar entre 0 e 100'),
  aliquotaPis: optionalPercent('Alíquota deve estar entre 0 e 100'),
  aliquotaCofins: optionalPercent('Alíquota deve estar entre 0 e 100'),
})

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
