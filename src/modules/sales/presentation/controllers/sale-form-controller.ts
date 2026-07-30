import { computed, ref } from 'vue'
import { BaseController } from '@/core/controllers/base-controller'
import type { CreateSaleUseCase } from '@/modules/sales/application/use-cases/create-sale.use-case'
import { CreateSaleDto } from '@/modules/sales/domain/dto/create-sale-dto'
import type {
  SaleFormValues,
  SaleProductOption,
} from '@/modules/sales/presentation/schemas/sale-schema'
import type { ListEstablishmentsUseCase } from '@/modules/establishments/application/use-cases/list-establishments.use-case'
import type { Establishment } from '@/modules/establishments/domain/entities/establishment.entity'
import type { ListProductsUseCase } from '@/modules/products/application/use-cases/list-products.use-case'
import { ListProductsDto } from '@/modules/products/domain/dto/list-products-dto'
import type { Product } from '@/modules/products/domain/entities/product.entity'
import type { ListPartnersUseCase } from '@/modules/partners/application/use-cases/list-partners.use-case'
import { ListPartnersDto } from '@/modules/partners/domain/dto/list-partners-dto'
import { PartnerType } from '@/enums/partner-type.enum'
import type { PaymentMethod } from '@/enums/payment-method.enum'
import { parseDecimal } from '@/shared/ui/utils/masks'
import { useToast } from '@/shared/composables'
import { routeNames } from '@/router/route-names'

const PICKER_LIMIT = 100

export class SaleFormController extends BaseController {
  private readonly createUseCase: CreateSaleUseCase
  private readonly listEstablishmentsUseCase: ListEstablishmentsUseCase
  private readonly listProductsUseCase: ListProductsUseCase
  private readonly listPartnersUseCase: ListPartnersUseCase
  private readonly toast = useToast()

  readonly loaded = ref(false)
  readonly finalizing = ref(false)
  readonly establishments = ref<Establishment[]>([])
  readonly products = ref<Product[]>([])
  readonly customers = ref<{ id: string; name: string }[]>([])

  readonly establishmentOptions = computed(() =>
    this.establishments.value.map((e) => ({ value: e.id, label: e.name })),
  )
  readonly customerOptions = computed(() =>
    this.customers.value.map((c) => ({ value: c.id, label: c.name })),
  )
  /** Produtos no formato consumido pela busca e pelo carrinho do PDV. */
  readonly productItems = computed<SaleProductOption[]>(() =>
    this.products.value.map((p) => ({
      id: p.id,
      name: p.name,
      unit: p.unit,
      sku: p.sku,
      barcode: p.barcode,
      salePrice: p.salePrice,
      currentStock: p.currentStock,
    })),
  )

  constructor(
    createUseCase: CreateSaleUseCase,
    listEstablishmentsUseCase: ListEstablishmentsUseCase,
    listProductsUseCase: ListProductsUseCase,
    listPartnersUseCase: ListPartnersUseCase,
  ) {
    super()
    this.createUseCase = createUseCase
    this.listEstablishmentsUseCase = listEstablishmentsUseCase
    this.listProductsUseCase = listProductsUseCase
    this.listPartnersUseCase = listPartnersUseCase
  }

  async prepareCreate(): Promise<void> {
    this.setLoading(true)
    await Promise.all([
      this.loadEstablishments(),
      this.loadProducts(),
      this.loadCustomers(),
    ])
    this.loaded.value = true
    this.setLoading(false)
  }

  private async loadEstablishments(): Promise<void> {
    const result = await this.listEstablishmentsUseCase.execute()
    result.map((list) => {
      this.establishments.value = list
    })
  }

  private async loadProducts(): Promise<void> {
    const dto = new ListProductsDto({ page: 1, limit: PICKER_LIMIT })
    const result = await this.listProductsUseCase.execute(dto)
    result.map((list) => {
      this.products.value = list.items
    })
  }

  private async loadCustomers(): Promise<void> {
    const dto = new ListPartnersDto({ page: 1, limit: PICKER_LIMIT })
    const result = await this.listPartnersUseCase.execute(dto)
    result.map((list) => {
      this.customers.value = list.items
        .filter((p) => p.type !== PartnerType.SUPPLIER)
        .map((p) => ({ id: p.id, name: p.name }))
    })
  }

  /** Preço de venda sugerido para prefill ao adicionar um produto. */
  salePriceOf(productId: string): number | null {
    return this.products.value.find((p) => p.id === productId)?.salePrice ?? null
  }

  async save(values: SaleFormValues, confirm: boolean): Promise<void> {
    this.setLoading(true)
    this.finalizing.value = confirm

    const dto = new CreateSaleDto({
      establishmentId: values.establishmentId,
      items: values.items.map((row) => ({
        productId: row.productId,
        quantity: parseDecimal(row.quantity) ?? 0,
        unitPrice: parseDecimal(row.unitPrice) ?? 0,
      })),
      customerId: values.customerId || undefined,
      discount: parseDecimal(values.discount) || undefined,
      paymentMethod: (values.paymentMethod as PaymentMethod) || undefined,
      notes: values.notes || undefined,
      confirm,
    })

    const result = await this.createUseCase.execute(dto)
    this.handleResult(
      result,
      (sale) => {
        this.toast.success(
          confirm ? 'Venda finalizada — estoque baixado.' : 'Orçamento salvo.',
        )
        this.router.push({
          name: routeNames.SALE_DETAIL,
          params: { id: sale.id },
        })
      },
      (error) => {
        this.toast.error(
          error.isUserFacing
            ? error.message
            : 'Não foi possível concluir a venda. Tente novamente.',
        )
      },
    )

    this.finalizing.value = false
    this.setLoading(false)
  }
}
