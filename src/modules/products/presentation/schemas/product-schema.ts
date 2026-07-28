import { z } from 'zod'
import { UnitOfMeasure } from '@/enums/unit-of-measure.enum'
import { parseDecimal } from '@/shared/ui/utils/masks'

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

export const productSchema = z.object({
  name: z
    .string()
    .min(2, 'Mínimo 2 caracteres')
    .max(120, 'Máximo 120 caracteres'),
  sku: z.string().max(60, 'Máximo 60 caracteres').optional(),
  barcode: z.string().max(60, 'Máximo 60 caracteres').optional(),
  unit: z.nativeEnum(UnitOfMeasure, {
    errorMap: () => ({ message: 'Selecione a unidade' }),
  }),
  description: z.string().max(1000, 'Máximo 1000 caracteres').optional(),
  costPrice: optionalPositiveDecimal('Preço de custo inválido'),
  salePrice: optionalPositiveDecimal('Preço de venda inválido'),
  minStock: optionalPositiveDecimal('Estoque mínimo inválido'),
  ncm: z.string().max(10, 'Máximo 10 caracteres').optional(),
  cest: z.string().max(10, 'Máximo 10 caracteres').optional(),
  cfop: z.string().max(6, 'Máximo 6 caracteres').optional(),
  origin: z.string().optional(),
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
  attributes: AttributeRow[]
}
