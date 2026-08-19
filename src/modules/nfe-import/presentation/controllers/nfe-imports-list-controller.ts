import { computed, ref } from 'vue'
import { BaseController } from '@/core/controllers/base-controller'
import type { ImportNfeXmlUseCase } from '@/modules/nfe-import/application/use-cases/import-nfe-xml.use-case'
import type { ListNfeImportsUseCase } from '@/modules/nfe-import/application/use-cases/list-nfe-imports.use-case'
import { ListNfeImportsDto } from '@/modules/nfe-import/domain/dto/list-nfe-imports-dto'
import type { NfeImport } from '@/modules/nfe-import/domain/entities/nfe-import.entity'
import { useToast } from '@/shared/composables'

const PAGE_LIMIT = 20

export class NfeImportsListController extends BaseController {
  private readonly listUseCase: ListNfeImportsUseCase
  private readonly importUseCase: ImportNfeXmlUseCase
  private readonly toast = useToast()

  readonly imports = ref<NfeImport[]>([])
  readonly loaded = ref(false)
  readonly total = ref(0)
  readonly page = ref(1)
  readonly limit = ref(PAGE_LIMIT)
  readonly importing = ref(false)

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.total.value / this.limit.value)),
  )

  constructor(
    listUseCase: ListNfeImportsUseCase,
    importUseCase: ImportNfeXmlUseCase,
  ) {
    super()
    this.listUseCase = listUseCase
    this.importUseCase = importUseCase
  }

  async loadList(): Promise<void> {
    this.setLoading(true)
    const dto = new ListNfeImportsDto({
      page: this.page.value,
      limit: this.limit.value,
    })
    const result = await this.listUseCase.execute(dto)
    this.handleResult(result, (list) => {
      this.imports.value = list.items
      this.total.value = list.total
      this.page.value = list.page
      this.limit.value = list.limit
    })
    this.loaded.value = true
    this.setLoading(false)
  }

  /**
   * Envia o XML e devolve o id da importação criada.
   *
   * Devolve o id em vez de navegar: quem decide para onde ir é a página, e o
   * controller não conhece rota.
   */
  async importXml(file: File): Promise<string | null> {
    if (this.importing.value) return null

    this.importing.value = true
    let created: string | null = null

    const result = await this.importUseCase.execute(file)
    this.handleResult(result, (nfeImport) => {
      created = nfeImport.id
      this.toast.success(
        nfeImport.unmatchedCount === 0
          ? 'Nota lida. Confira os itens antes de gerar a compra.'
          : `Nota lida. ${nfeImport.unmatchedCount} ${
              nfeImport.unmatchedCount === 1
                ? 'item precisa'
                : 'itens precisam'
            } ser apontados.`,
      )
    })

    this.importing.value = false
    return created
  }

  async goToPage(page: number): Promise<void> {
    if (page < 1 || page > this.totalPages.value || page === this.page.value) {
      return
    }
    this.page.value = page
    await this.loadList()
  }
}
