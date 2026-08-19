import { computed, ref } from 'vue'
import { BaseController } from '@/core/controllers/base-controller'
import type { GetNfeImportUseCase } from '@/modules/nfe-import/application/use-cases/get-nfe-import.use-case'
import type { SetImportItemProductUseCase } from '@/modules/nfe-import/application/use-cases/set-import-item-product.use-case'
import type { ConfirmNfeImportUseCase } from '@/modules/nfe-import/application/use-cases/confirm-nfe-import.use-case'
import type {
  NfeImport,
  NfeImportItem,
} from '@/modules/nfe-import/domain/entities/nfe-import.entity'
import type { ListProductsUseCase } from '@/modules/products/application/use-cases/list-products.use-case'
import type { CreateProductUseCase } from '@/modules/products/application/use-cases/create-product.use-case'
import { ListProductsDto } from '@/modules/products/domain/dto/list-products-dto'
import { CreateProductDto } from '@/modules/products/domain/dto/create-product-dto'
import type { Product } from '@/modules/products/domain/entities/product.entity'
import type { ProductFormValues } from '@/modules/products/presentation/schemas/product-schema'
import type { UnitOfMeasure } from '@/core/enums/unit-of-measure.enum'
import { parseDecimal } from '@/shared/ui/utils/masks'
import { useToast } from '@/shared/composables'

/** Catálogo carregado de uma vez para o seletor, como nas telas de compra. */
const PICKER_LIMIT = 100

export class NfeImportDetailController extends BaseController {
  private readonly getUseCase: GetNfeImportUseCase
  private readonly setItemUseCase: SetImportItemProductUseCase
  private readonly confirmUseCase: ConfirmNfeImportUseCase
  private readonly listProductsUseCase: ListProductsUseCase
  private readonly createProductUseCase: CreateProductUseCase
  private readonly toast = useToast()

  readonly nfeImport = ref<NfeImport | null>(null)
  readonly products = ref<Product[]>([])
  readonly loaded = ref(false)
  readonly confirming = ref(false)
  readonly savingItemId = ref<string | null>(null)
  readonly creatingProduct = ref(false)

  /**
   * Pendentes primeiro.
   *
   * O que importa numa nota de 300 itens é o que falta resolver. Paginar a
   * conferência esconderia pendência na página 2 — o mesmo erro do filtro
   * fiscal que saiu da tela de produtos.
   */
  readonly sortedItems = computed<NfeImportItem[]>(() => {
    const items = this.nfeImport.value?.items ?? []
    return [...items].sort((a, b) => {
      if (a.isMatched !== b.isMatched) return a.isMatched ? 1 : -1
      return a.itemNumber - b.itemNumber
    })
  })

  constructor(
    getUseCase: GetNfeImportUseCase,
    setItemUseCase: SetImportItemProductUseCase,
    confirmUseCase: ConfirmNfeImportUseCase,
    listProductsUseCase: ListProductsUseCase,
    createProductUseCase: CreateProductUseCase,
  ) {
    super()
    this.getUseCase = getUseCase
    this.setItemUseCase = setItemUseCase
    this.confirmUseCase = confirmUseCase
    this.listProductsUseCase = listProductsUseCase
    this.createProductUseCase = createProductUseCase
  }

  async load(id: string): Promise<void> {
    this.setLoading(true)
    const [result] = await Promise.all([
      this.getUseCase.execute(id),
      this.loadProducts(),
    ])
    this.handleResult(result, (value) => {
      this.nfeImport.value = value
    })
    this.loaded.value = true
    this.setLoading(false)
  }

  private async loadProducts(): Promise<void> {
    const dto = new ListProductsDto({ page: 1, limit: PICKER_LIMIT })
    const result = await this.listProductsUseCase.execute(dto)
    result.map((list) => {
      this.products.value = list.items
    })
  }

  async setItemProduct(itemId: string, productId: string): Promise<boolean> {
    const current = this.nfeImport.value
    if (!current) return false

    this.savingItemId.value = itemId
    let ok = false

    const result = await this.setItemUseCase.execute(
      current.id,
      itemId,
      productId,
    )
    this.handleResult(result, (value) => {
      // A resposta traz a importação inteira: o status muda quando o último
      // pendente é resolvido, e recarregar por fora perderia isso.
      this.nfeImport.value = value
      ok = true
      this.toast.success(
        'Produto apontado. A escolha vale para as próximas notas deste fornecedor.',
      )
    })

    this.savingItemId.value = null
    return ok
  }

  /**
   * Cadastra o produto e já vincula ao item, sem sair da conferência.
   *
   * Os dois passos vivem juntos porque separá-los deixaria o usuário com um
   * produto novo no catálogo e o item ainda pendente — pior do que antes de
   * começar. Se a criação falha, nada é vinculado; se a vinculação falha, o
   * produto criado continua lá e o item pode ser apontado à mão.
   */
  async createProductForItem(
    itemId: string,
    values: ProductFormValues,
  ): Promise<boolean> {
    if (this.creatingProduct.value) return false

    this.creatingProduct.value = true
    let created: Product | null = null

    const result = await this.createProductUseCase.execute(
      this.toCreateProductDto(values),
    )
    this.handleResult(result, (product) => {
      created = product
    })

    this.creatingProduct.value = false

    if (!created) return false

    // `products` alimenta o seletor: sem isto o item recém-vinculado apareceria
    // como "Produto do catálogo", sem nome.
    this.products.value = [created, ...this.products.value]

    return this.setItemProduct(itemId, (created as Product).id)
  }

  private toCreateProductDto(values: ProductFormValues): CreateProductDto {
    const optional = (raw: string): string | undefined =>
      raw.trim() === '' ? undefined : raw.trim()

    const decimal = (raw: string): number | undefined => {
      const parsed = parseDecimal(raw)
      return parsed === 0 && raw.trim() === '' ? undefined : parsed
    }

    return new CreateProductDto({
      name: values.name.trim(),
      description: optional(values.description),
      sku: optional(values.sku),
      barcode: optional(values.barcode),
      unit: values.unit as UnitOfMeasure,
      costPrice: decimal(values.costPrice),
      salePrice: decimal(values.salePrice),
      minStock: decimal(values.minStock),
      ncm: optional(values.ncm),
      cest: optional(values.cest),
      cfop: optional(values.cfop),
      origin: values.origin === '' ? undefined : Number(values.origin),
      csosn: optional(values.csosn),
      cstIcms: optional(values.cstIcms),
      cstPis: optional(values.cstPis),
      cstCofins: optional(values.cstCofins),
      aliquotaIcms: decimal(values.aliquotaIcms),
      aliquotaPis: decimal(values.aliquotaPis),
      aliquotaCofins: decimal(values.aliquotaCofins),
    })
  }

  /** Devolve o id da compra criada, para a página levar o usuário até ela. */
  async confirm(): Promise<string | null> {
    const current = this.nfeImport.value
    if (!current || this.confirming.value) return null

    this.confirming.value = true
    let purchaseId: string | null = null

    const result = await this.confirmUseCase.execute(current.id)
    this.handleResult(result, (value) => {
      this.nfeImport.value = value
      purchaseId = value.purchaseId
      this.toast.success(
        `Compra #${value.purchaseNumber ?? ''} criada em rascunho.`.replace(
          '# ',
          '',
        ),
      )
    })

    this.confirming.value = false
    return purchaseId
  }

}
