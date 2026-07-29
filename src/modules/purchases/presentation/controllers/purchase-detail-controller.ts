import { computed, ref } from 'vue'
import { BaseController } from '@/core/controllers/base-controller'
import type { GetPurchaseUseCase } from '@/modules/purchases/application/use-cases/get-purchase.use-case'
import type { UpdatePurchaseUseCase } from '@/modules/purchases/application/use-cases/update-purchase.use-case'
import type { ConfirmPurchaseUseCase } from '@/modules/purchases/application/use-cases/confirm-purchase.use-case'
import type { CancelPurchaseUseCase } from '@/modules/purchases/application/use-cases/cancel-purchase.use-case'
import type { DeletePurchaseUseCase } from '@/modules/purchases/application/use-cases/delete-purchase.use-case'
import { UpdatePurchaseDto } from '@/modules/purchases/domain/dto/update-purchase-dto'
import type { Purchase } from '@/modules/purchases/domain/entities/purchase.entity'
import { PurchaseStatus } from '@/enums/purchase-status.enum'
import type { ListPartnersUseCase } from '@/modules/partners/application/use-cases/list-partners.use-case'
import { ListPartnersDto } from '@/modules/partners/domain/dto/list-partners-dto'
import { PartnerType } from '@/enums/partner-type.enum'
import { dateInputToIso, isoToDateInput } from '@/core/utils/date'
import { useToast } from '@/shared/composables'
import { routeNames } from '@/router/route-names'

const PICKER_LIMIT = 100

export interface PurchaseMetaForm {
  supplierId: string
  notes: string
  purchaseDate: string
}

export class PurchaseDetailController extends BaseController {
  private readonly getUseCase: GetPurchaseUseCase
  private readonly updateUseCase: UpdatePurchaseUseCase
  private readonly confirmUseCase: ConfirmPurchaseUseCase
  private readonly cancelUseCase: CancelPurchaseUseCase
  private readonly deleteUseCase: DeletePurchaseUseCase
  private readonly listPartnersUseCase: ListPartnersUseCase
  private readonly toast = useToast()

  readonly purchase = ref<Purchase | null>(null)
  readonly loaded = ref(false)
  readonly acting = ref(false)
  readonly suppliers = ref<{ id: string; name: string }[]>([])
  readonly meta = ref<PurchaseMetaForm>({
    supplierId: '',
    notes: '',
    purchaseDate: '',
  })

  readonly supplierOptions = computed(() =>
    this.suppliers.value.map((s) => ({ value: s.id, label: s.name })),
  )

  readonly isDraft = computed(
    () => this.purchase.value?.status === PurchaseStatus.DRAFT,
  )
  readonly isConfirmed = computed(
    () => this.purchase.value?.status === PurchaseStatus.CONFIRMED,
  )

  constructor(
    getUseCase: GetPurchaseUseCase,
    updateUseCase: UpdatePurchaseUseCase,
    confirmUseCase: ConfirmPurchaseUseCase,
    cancelUseCase: CancelPurchaseUseCase,
    deleteUseCase: DeletePurchaseUseCase,
    listPartnersUseCase: ListPartnersUseCase,
  ) {
    super()
    this.getUseCase = getUseCase
    this.updateUseCase = updateUseCase
    this.confirmUseCase = confirmUseCase
    this.cancelUseCase = cancelUseCase
    this.deleteUseCase = deleteUseCase
    this.listPartnersUseCase = listPartnersUseCase
  }

  async load(id: string): Promise<void> {
    this.setLoading(true)
    const result = await this.getUseCase.execute(id)
    this.handleResult(result, (purchase) => this.apply(purchase))
    this.loaded.value = true
    this.setLoading(false)
    void this.loadSuppliers()
  }

  private apply(purchase: Purchase): void {
    this.purchase.value = purchase
    this.meta.value = {
      supplierId: purchase.supplierId ?? '',
      notes: purchase.notes ?? '',
      purchaseDate: isoToDateInput(purchase.purchaseDate),
    }
  }

  private async loadSuppliers(): Promise<void> {
    const dto = new ListPartnersDto({ page: 1, limit: PICKER_LIMIT })
    const result = await this.listPartnersUseCase.execute(dto)
    result.map((list) => {
      this.suppliers.value = list.items
        .filter((p) => p.type !== PartnerType.CLIENT)
        .map((p) => ({ id: p.id, name: p.name }))
    })
  }

  async saveMeta(): Promise<void> {
    if (!this.purchase.value) return
    this.acting.value = true
    const dto = new UpdatePurchaseDto({
      supplierId: this.meta.value.supplierId || undefined,
      notes: this.meta.value.notes || undefined,
      purchaseDate: dateInputToIso(this.meta.value.purchaseDate),
    })
    const result = await this.updateUseCase.execute(this.purchase.value.id, dto)
    this.handleResult(result, (purchase) => {
      this.apply(purchase)
      this.toast.success('Compra atualizada.')
    })
    this.acting.value = false
  }

  async confirm(): Promise<void> {
    if (!this.purchase.value) return
    this.acting.value = true
    const result = await this.confirmUseCase.execute(this.purchase.value.id)
    this.handleResult(result, (purchase) => {
      this.apply(purchase)
      this.toast.success('Compra confirmada — estoque atualizado.')
    })
    this.acting.value = false
  }

  async cancel(): Promise<void> {
    if (!this.purchase.value) return
    this.acting.value = true
    const wasConfirmed = this.isConfirmed.value
    const result = await this.cancelUseCase.execute(this.purchase.value.id)
    this.handleResult(result, (purchase) => {
      this.apply(purchase)
      this.toast.success(
        wasConfirmed
          ? 'Compra cancelada — estoque estornado.'
          : 'Compra cancelada.',
      )
    })
    this.acting.value = false
  }

  async remove(): Promise<void> {
    if (!this.purchase.value) return
    this.acting.value = true
    const result = await this.deleteUseCase.execute(this.purchase.value.id)
    this.handleResult(result, () => {
      this.toast.success('Compra excluída.')
      this.router.push({ name: routeNames.PURCHASES })
    })
    this.acting.value = false
  }
}
