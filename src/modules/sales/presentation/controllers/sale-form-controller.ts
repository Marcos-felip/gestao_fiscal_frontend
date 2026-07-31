import { computed, ref } from 'vue'
import { BaseController } from '@/core/controllers/base-controller'
import type { CreateSaleUseCase } from '@/modules/sales/application/use-cases/create-sale.use-case'
import type { GetSaleContextUseCase } from '@/modules/sales/application/use-cases/get-sale-context.use-case'
import { CreateSaleDto } from '@/modules/sales/domain/dto/create-sale-dto'
import type {
  SaleContextProduct,
  SaleContextRef,
} from '@/modules/sales/domain/responses/sale-context-response'
import type {
  SaleFormValues,
  SaleProductOption,
} from '@/modules/sales/presentation/schemas/sale-schema'
import type { PaymentMethod } from '@/enums/payment-method.enum'
import { PaymentCondition } from '@/enums/payment-condition.enum'
import { dateBrToIso, parseDecimal } from '@/shared/ui/utils/masks'
import { useToast } from '@/shared/composables'
import { routeNames } from '@/router/route-names'

export class SaleFormController extends BaseController {
  private readonly createUseCase: CreateSaleUseCase
  private readonly getContextUseCase: GetSaleContextUseCase
  private readonly toast = useToast()

  readonly loaded = ref(false)
  readonly finalizing = ref(false)
  readonly establishments = ref<SaleContextRef[]>([])
  readonly products = ref<SaleContextProduct[]>([])
  readonly customers = ref<SaleContextRef[]>([])

  readonly establishmentOptions = computed(() =>
    this.establishments.value.map((e) => ({ value: e.id, label: e.name })),
  )
  readonly customerOptions = computed(() =>
    this.customers.value.map((c) => ({ value: c.id, label: c.name })),
  )
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
    getContextUseCase: GetSaleContextUseCase,
  ) {
    super()
    this.createUseCase = createUseCase
    this.getContextUseCase = getContextUseCase
  }

  /**
   * Carrega tudo que o PDV precisa numa chamada só (`GET /sales/context`),
   * gated em `sales.create` — o vendedor não precisa de `establishments.list`
   * nem `partners.list`, então esses módulos seguem escondidos.
   */
  async prepareCreate(): Promise<void> {
    this.setLoading(true)
    const result = await this.getContextUseCase.execute()
    this.handleResult(result, (context) => {
      this.establishments.value = context.establishments
      this.customers.value = context.customers
      this.products.value = context.products
    })
    this.loaded.value = true
    this.setLoading(false)
  }

  salePriceOf(productId: string): number | null {
    return this.products.value.find((p) => p.id === productId)?.salePrice ?? null
  }

  /** Feedback pós-venda: destaca as parcelas geradas quando finalizada a prazo. */
  private successMessage(
    confirm: boolean,
    onCredit: boolean,
    installments: number,
  ): string {
    if (!confirm) return 'Orçamento salvo.'
    if (onCredit) {
      const label = installments === 1 ? 'parcela gerada' : 'parcelas geradas'
      return `Venda finalizada — estoque baixado e ${installments} ${label} em contas a receber.`
    }
    return 'Venda finalizada — estoque baixado.'
  }

  async save(values: SaleFormValues, confirm: boolean): Promise<void> {
    this.setLoading(true)
    this.finalizing.value = confirm

    const onCredit = values.paymentCondition === PaymentCondition.A_PRAZO
    const installments = onCredit
      ? Math.max(1, Math.trunc(parseDecimal(values.installments) ?? 1))
      : undefined
    const intervalDays = onCredit
      ? Math.max(1, Math.trunc(parseDecimal(values.intervalDays) ?? 30))
      : undefined

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
      paymentCondition:
        (values.paymentCondition as PaymentCondition) || undefined,
      installments,
      firstDueDate: onCredit ? dateBrToIso(values.firstDueDate) : undefined,
      intervalDays,
      notes: values.notes || undefined,
      confirm,
    })

    const result = await this.createUseCase.execute(dto)
    this.handleResult(
      result,
      (sale) => {
        this.toast.success(
          this.successMessage(confirm, onCredit, installments ?? 1),
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
