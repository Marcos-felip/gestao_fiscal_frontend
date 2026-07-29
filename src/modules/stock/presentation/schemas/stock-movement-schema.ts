import { z } from 'zod'
import { StockMovementType } from '@/enums/stock-movement-type.enum'
import { parseDecimal } from '@/shared/ui/utils/masks'

export const stockMovementSchema = z.object({
  productId: z.string().min(1, 'Selecione o produto'),
  type: z.nativeEnum(StockMovementType, {
    errorMap: () => ({ message: 'Selecione o tipo' }),
  }),
  quantity: z.string().refine((v) => {
    const parsed = parseDecimal(v)
    return parsed !== undefined && parsed > 0
  }, 'Informe uma quantidade maior que zero'),
  reason: z.string().max(255, 'Máximo 255 caracteres').optional(),
})

export type StockMovementFormData = z.infer<typeof stockMovementSchema>

export interface StockMovementFormValues {
  productId: string
  type: string
  quantity: string
  reason: string
}
