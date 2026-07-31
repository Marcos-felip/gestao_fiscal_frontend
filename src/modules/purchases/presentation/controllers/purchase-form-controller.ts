import { computed, ref } from 'vue'
import { BaseController } from '@/core/controllers/base-controller'
import type { CreatePurchaseUseCase } from '@/modules/purchases/application/use-cases/create-purchase.use-case'
import { CreatePurchaseDto } from '@/modules/purchases/domain/dto/create-purchase-dto'
import type { PurchaseFormValues } from '@/modules/purchases/presentation/schemas/purchase-schema'
import type { ListEstablishmentsUseCase } from '@/modules/establishments/application/use-cases/list-establishments.use-case'
import type { Establishment } from '@/modules/establishments/domain/entities/establishment.entity'
import type { ListProductsUseCase } from '@/modules/products/application/use-cases/list-products.use-case'
import { ListProductsDto } from '@/modules/products/domain/dto/list-products-dto'
import type { Product } from '@/modules/products/domain/entities/product.entity'
import type { ListPartnersUseCase } from '@/modules/partners/application/use-cases/list-partners.use-case'
import { ListPartnersDto } from '@/modules/partners/domain/dto/list-partners-dto'
import { PartnerType } from '@/enums/partner-type.enum'
import { PaymentCondition } from '@/enums/payment-condition.enum'
import { dateBrToIso, parseDecimal } from '@/shared/ui/utils/masks'
import { dateInputToIso } from '@/core/utils/date'
import { useToast } from '@/shared/composables'
import { routeNames } from '@/router/route-names'

const PICKER_LIMIT = 100

export class PurchaseFormController extends BaseController {
  private readonly createUseCase: CreatePurchaseUseCase
  private readonly listEstablishmentsUseCase: ListEstablishmentsUseCase
  private readonly listProductsUseCase: ListProductsUseCase
  private readonly listPartnersUseCase: ListPartnersUseCase
  private readonly toast = useToast()

  readonly loaded = ref(false)
  readonly establishments = ref<Establishment[]>([])
  readonly products = ref<Product[]>([])
  readonly suppliers = ref<{ id: string; name: string }[]>([])

  readonly establishmentOptions = computed(() =>
    this.establishments.value.map((e) => ({ value: e.id, label: e.name })),
  )
  readonly productOptions = computed(() =>
    this.products.value.map((p) => ({ value: p.id, label: p.name })),
  )
  readonly supplierOptions = computed(() =>
    this.suppliers.value.map((s) => ({ value: s.id, label: s.name })),
  )

  constructor(
    createUseCase: CreatePurchaseUseCase,
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
      this.loadSuppliers(),
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

  private async loadSuppliers(): Promise<void> {
    const dto = new ListPartnersDto({ page: 1, limit: PICKER_LIMIT })
    const result = await this.listPartnersUseCase.execute(dto)
    result.map((list) => {
      // Só fornecedores: quem é FORNECEDOR ou AMBOS.
      this.suppliers.value = list.items
        .filter((p) => p.type !== PartnerType.CLIENT)
        .map((p) => ({ id: p.id, name: p.name }))
    })
  }

  /** Preço de custo sugerido para prefill ao escolher um produto. */
  costPriceOf(productId: string): number | null {
    return this.products.value.find((p) => p.id === productId)?.costPrice ?? null
  }

  async save(values: PurchaseFormValues): Promise<void> {
    this.setLoading(true)

    const onCredit = values.paymentCondition === PaymentCondition.A_PRAZO
    const installments = onCredit
      ? Math.max(1, Math.trunc(parseDecimal(values.installments) ?? 1))
      : undefined
    const intervalDays = onCredit
      ? Math.max(1, Math.trunc(parseDecimal(values.intervalDays) ?? 30))
      : undefined

    const dto = new CreatePurchaseDto({
      establishmentId: values.establishmentId,
      items: values.items.map((row) => ({
        productId: row.productId,
        quantity: parseDecimal(row.quantity) ?? 0,
        unitPrice: parseDecimal(row.unitPrice) ?? 0,
      })),
      supplierId: values.supplierId || undefined,
      paymentCondition:
        (values.paymentCondition as PaymentCondition) || undefined,
      installments,
      firstDueDate: onCredit ? dateBrToIso(values.firstDueDate) : undefined,
      intervalDays,
      notes: values.notes || undefined,
      purchaseDate: dateInputToIso(values.purchaseDate),
    })

    const result = await this.createUseCase.execute(dto)
    this.handleResult(result, (purchase) => {
      this.toast.success('Compra criada como rascunho.')
      this.router.push({
        name: routeNames.PURCHASE_DETAIL,
        params: { id: purchase.id },
      })
    })
    this.setLoading(false)
  }
}
