import { ref } from 'vue'
import { BaseController } from '@/core/controllers/base-controller'
import type { GetProductUseCase } from '@/modules/products/application/use-cases/get-product.use-case'
import type { CreateProductUseCase } from '@/modules/products/application/use-cases/create-product.use-case'
import type { UpdateProductUseCase } from '@/modules/products/application/use-cases/update-product.use-case'
import { CreateProductDto } from '@/modules/products/domain/dto/create-product-dto'
import { UpdateProductDto } from '@/modules/products/domain/dto/update-product-dto'
import type {
  Product,
  TechnicalAttributes,
} from '@/modules/products/domain/entities/product.entity'
import {
  emptyProductForm,
  type AttributeRow,
  type ProductFormValues,
} from '@/modules/products/presentation/schemas/product-schema'
import { UnitOfMeasure } from '@/core/enums/unit-of-measure.enum'
import { useToast } from '@/shared/composables'
import {
  formatMoney,
  formatQuantity,
  parseDecimal,
} from '@/shared/ui/utils/masks'
import { routeNames } from '@/router/route-names'

export class ProductFormController extends BaseController {
  private readonly getUseCase: GetProductUseCase
  private readonly createUseCase: CreateProductUseCase
  private readonly updateUseCase: UpdateProductUseCase
  private readonly toast = useToast()

  private editingId: string | null = null

  readonly values = ref<ProductFormValues>(emptyProductForm())
  readonly loaded = ref(false)

  constructor(
    getUseCase: GetProductUseCase,
    createUseCase: CreateProductUseCase,
    updateUseCase: UpdateProductUseCase,
  ) {
    super()
    this.getUseCase = getUseCase
    this.createUseCase = createUseCase
    this.updateUseCase = updateUseCase
  }

  get isEditing(): boolean {
    return this.editingId !== null
  }

  prepareCreate(): void {
    this.editingId = null
    this.values.value = emptyProductForm()
    this.loaded.value = true
  }

  async loadForEdit(id: string): Promise<void> {
    this.editingId = id
    this.setLoading(true)
    const result = await this.getUseCase.execute(id)
    this.handleResult(result, (product) => {
      this.values.value = this.toValues(product)
    })
    this.loaded.value = true
    this.setLoading(false)
  }

  async save(input: ProductFormValues): Promise<void> {
    this.setLoading(true)
    const result = this.editingId
      ? await this.updateUseCase.execute(
          this.editingId,
          this.toUpdateDto(input),
        )
      : await this.createUseCase.execute(this.toCreateDto(input))

    this.handleResult(result, () => {
      this.toast.success(
        this.editingId
          ? 'Produto atualizado com sucesso.'
          : 'Produto criado com sucesso.',
      )
      this.router.push({ name: routeNames.PRODUCTS })
    })
    this.setLoading(false)
  }

  /** Monta o JSON de atributos técnicos a partir das linhas com chave. */
  private buildAttributes(
    rows: AttributeRow[],
  ): TechnicalAttributes | undefined {
    const attributes: TechnicalAttributes = {}
    for (const row of rows) {
      const key = row.key.trim()
      if (key) attributes[key] = row.value
    }
    return Object.keys(attributes).length ? attributes : undefined
  }

  private optionalFields(input: ProductFormValues) {
    return {
      description: input.description || undefined,
      sku: input.sku || undefined,
      barcode: input.barcode || undefined,
      costPrice: parseDecimal(input.costPrice),
      salePrice: parseDecimal(input.salePrice),
      minStock: parseDecimal(input.minStock),
      ncm: input.ncm || undefined,
      cest: input.cest || undefined,
      cfop: input.cfop || undefined,
      origin: input.origin ? Number(input.origin) : undefined,
      csosn: input.csosn || undefined,
      cstIcms: input.cstIcms || undefined,
      cstPis: input.cstPis || undefined,
      cstCofins: input.cstCofins || undefined,
      aliquotaIcms: parseDecimal(input.aliquotaIcms),
      aliquotaPis: parseDecimal(input.aliquotaPis),
      aliquotaCofins: parseDecimal(input.aliquotaCofins),
      technicalAttributes: this.buildAttributes(input.attributes),
    }
  }

  private toCreateDto(input: ProductFormValues): CreateProductDto {
    return new CreateProductDto({
      name: input.name,
      unit: input.unit as UnitOfMeasure,
      ...this.optionalFields(input),
    })
  }

  private toUpdateDto(input: ProductFormValues): UpdateProductDto {
    return new UpdateProductDto({
      name: input.name || undefined,
      unit: (input.unit || undefined) as UnitOfMeasure | undefined,
      ...this.optionalFields(input),
    })
  }

  private toValues(p: Product): ProductFormValues {
    const attributes: AttributeRow[] = p.technicalAttributes
      ? Object.entries(p.technicalAttributes).map(([key, value]) => ({
          key,
          value: typeof value === 'string' ? value : JSON.stringify(value),
        }))
      : []

    return {
      name: p.name ?? '',
      sku: p.sku ?? '',
      barcode: p.barcode ?? '',
      unit: p.unit ?? UnitOfMeasure.UN,
      description: p.description ?? '',
      costPrice: p.costPrice !== null ? formatMoney(p.costPrice) : '',
      salePrice: p.salePrice !== null ? formatMoney(p.salePrice) : '',
      minStock: p.minStock !== null ? formatQuantity(p.minStock) : '',
      ncm: p.ncm ?? '',
      cest: p.cest ?? '',
      cfop: p.cfop ?? '',
      origin: p.origin !== null ? String(p.origin) : '',
      csosn: p.csosn ?? '',
      cstIcms: p.cstIcms ?? '',
      cstPis: p.cstPis ?? '',
      cstCofins: p.cstCofins ?? '',
      aliquotaIcms:
        p.aliquotaIcms !== null ? formatQuantity(p.aliquotaIcms) : '',
      aliquotaPis: p.aliquotaPis !== null ? formatQuantity(p.aliquotaPis) : '',
      aliquotaCofins:
        p.aliquotaCofins !== null ? formatQuantity(p.aliquotaCofins) : '',
      fiscalComplete: p.fiscalComplete,
      attributes,
    }
  }
}
