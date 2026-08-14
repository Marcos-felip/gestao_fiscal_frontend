import { computed, ref } from 'vue'
import { BaseController } from '@/core/controllers/base-controller'
import type { InutilizeNumberingUseCase } from '@/modules/fiscal/application/use-cases/inutilize-numbering.use-case'
import type { ListPendingRangesUseCase } from '@/modules/fiscal/application/use-cases/list-pending-ranges.use-case'
import type { FiscalPendingRange } from '@/modules/fiscal/domain/responses/fiscal-pending-range'
import { InutilizeNumberingDto } from '@/modules/fiscal/domain/dto/inutilize-numbering-dto'
import type { FiscalDocumentModel } from '@/core/enums/fiscal-document-model.enum'
import { useToast } from '@/shared/composables'

/** Faixa pedida pela tela, já validada pelo schema. */
export interface InutilizacaoPedido {
  modelo: FiscalDocumentModel
  serie: number
  numeroInicial: number
  numeroFinal: number
  justificativa: string
}

/**
 * Inutilização de numeração de um estabelecimento.
 *
 * As faixas pendentes vêm calculadas do servidor e são oferecidas como sugestão:
 * digitar a faixa errada aqui inutiliza numeração válida, e isso não se desfaz.
 */
export class InutilizationController extends BaseController {
  private readonly inutilizeUseCase: InutilizeNumberingUseCase
  private readonly listPendingUseCase: ListPendingRangesUseCase
  private readonly toast = useToast()

  private establishmentId: string | null = null

  readonly pendingRanges = ref<FiscalPendingRange[]>([])
  readonly loadingPending = ref(false)
  readonly submitting = ref(false)
  /** Mensagem da recusa, mantida na tela junto do formulário preenchido. */
  readonly conflito = ref<string | null>(null)

  readonly hasPending = computed(() =>
    this.pendingRanges.value.some((r) => r.faixas.length > 0),
  )

  constructor(
    inutilizeUseCase: InutilizeNumberingUseCase,
    listPendingUseCase: ListPendingRangesUseCase,
  ) {
    super()
    this.inutilizeUseCase = inutilizeUseCase
    this.listPendingUseCase = listPendingUseCase
  }

  async loadPending(establishmentId: string): Promise<void> {
    this.establishmentId = establishmentId
    this.loadingPending.value = true

    const result = await this.listPendingUseCase.execute(establishmentId)
    this.handleResult(
      result,
      (ranges) => {
        this.pendingRanges.value = ranges
      },
      () => {
        this.pendingRanges.value = []
      },
    )

    this.loadingPending.value = false
  }

  /**
   * Envia a inutilização. Devolve `true` para a tela fechar o diálogo; em recusa
   * mantém a mensagem em `conflito`, porque é ela que diz **qual número** está
   * ocupado e permite corrigir a faixa.
   */
  async inutilize(pedido: InutilizacaoPedido): Promise<boolean> {
    if (!this.establishmentId || this.submitting.value) return false

    this.submitting.value = true
    this.conflito.value = null

    const result = await this.inutilizeUseCase.execute(
      new InutilizeNumberingDto({
        establishmentId: this.establishmentId,
        ...pedido,
      }),
    )

    let ok = false
    this.handleResult(
      result,
      (inutilizacao) => {
        this.toast.success(
          `Numeração ${inutilizacao.faixaLabel} inutilizada na SEFAZ.`,
        )
        ok = true
        void this.loadPending(this.establishmentId as string)
      },
      (error) => {
        this.conflito.value = error.isUserFacing
          ? error.message
          : 'Não foi possível inutilizar a numeração.'
      },
    )

    this.submitting.value = false
    return ok
  }

  limparConflito(): void {
    this.conflito.value = null
  }
}
