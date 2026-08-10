import { computed, ref } from 'vue'
import { BaseController } from '@/core/controllers/base-controller'
import type { GetFiscalDocumentBySaleUseCase } from '@/modules/fiscal/application/use-cases/get-fiscal-document-by-sale.use-case'
import type { GetFiscalDocumentUseCase } from '@/modules/fiscal/application/use-cases/get-fiscal-document.use-case'
import type { EmitNfceUseCase } from '@/modules/fiscal/application/use-cases/emit-nfce.use-case'
import type { FiscalDocument } from '@/modules/fiscal/domain/entities/fiscal-document.entity'
import { EmitNfceDto } from '@/modules/fiscal/domain/dto/emit-nfce-dto'
import { FiscalDocumentStatus } from '@/core/enums/fiscal-document-status.enum'
import { useToast } from '@/shared/composables'

/** Intervalo entre consultas de status (ms). */
const POLL_INTERVAL = 3000
/** Máximo de consultas antes de desistir (evita loop infinito). */
const MAX_ATTEMPTS = 20

/** Estados que ainda evoluem — enquanto o documento estiver assim, faz polling. */
function isPending(status: FiscalDocumentStatus): boolean {
  return (
    status === FiscalDocumentStatus.PENDENTE ||
    status === FiscalDocumentStatus.PROCESSANDO
  )
}

/**
 * Orquestra o status fiscal de uma venda: descobre o documento vinculado,
 * dispara a emissão manual (fallback) e acompanha o processamento assíncrono
 * por polling até um estado terminal ou o limite de tentativas.
 */
export class SaleFiscalController extends BaseController {
  private readonly getBySaleUseCase: GetFiscalDocumentBySaleUseCase
  private readonly getByIdUseCase: GetFiscalDocumentUseCase
  private readonly emitUseCase: EmitNfceUseCase
  private readonly toast = useToast()

  private timer: number | null = null
  private attempts = 0

  readonly document = ref<FiscalDocument | null>(null)
  readonly loaded = ref(false)
  readonly emitting = ref(false)
  readonly polling = ref(false)

  /** Documento fiscal já existe para a venda. */
  readonly hasDocument = computed(() => this.document.value !== null)

  /** Documento em processamento na SEFAZ (mostra indicador). */
  readonly isProcessing = computed(
    () =>
      this.polling.value ||
      (this.document.value !== null && isPending(this.document.value.status)),
  )

  constructor(
    getBySaleUseCase: GetFiscalDocumentBySaleUseCase,
    getByIdUseCase: GetFiscalDocumentUseCase,
    emitUseCase: EmitNfceUseCase,
  ) {
    super()
    this.getBySaleUseCase = getBySaleUseCase
    this.getByIdUseCase = getByIdUseCase
    this.emitUseCase = emitUseCase
  }

  /** Busca o documento fiscal da venda; se estiver pendente, inicia o polling. */
  async load(saleId: string): Promise<void> {
    this.setLoading(true)
    const result = await this.getBySaleUseCase.execute(saleId)
    this.handleResult(result, (doc) => {
      this.document.value = doc
      if (doc && isPending(doc.status)) this.startPolling(saleId)
    })
    this.loaded.value = true
    this.setLoading(false)
  }

  /**
   * Emissão manual (fallback). A resposta inicial vem em `PENDENTE`; em sucesso
   * inicia o polling. Erros amigáveis do backend (config/produto incompleto)
   * são exibidos como vieram.
   */
  async emit(saleId: string, establishmentId?: string): Promise<void> {
    this.emitting.value = true
    const dto = new EmitNfceDto({ saleId, establishmentId })
    const result = await this.emitUseCase.execute(dto)
    this.handleResult(
      result,
      (doc) => {
        this.document.value = doc
        this.toast.info('Emissão iniciada — acompanhando o processamento…')
        if (isPending(doc.status)) this.startPolling(saleId)
      },
      (error) => {
        this.toast.error(
          error.isUserFacing
            ? error.message
            : 'Não foi possível emitir a NFC-e.',
        )
      },
    )
    this.emitting.value = false
  }

  private startPolling(saleId: string): void {
    this.stopPolling()
    this.attempts = 0
    this.polling.value = true
    this.scheduleNext(saleId)
  }

  private scheduleNext(saleId: string): void {
    this.timer = window.setTimeout(() => void this.poll(saleId), POLL_INTERVAL)
  }

  private async poll(saleId: string): Promise<void> {
    this.attempts += 1

    const current = this.document.value
    const result = current
      ? await this.getByIdUseCase.execute(current.id)
      : await this.getBySaleUseCase.execute(saleId)

    // Erro transitório na consulta não derruba o documento já conhecido.
    result.fold(
      () => {},
      (doc) => {
        if (doc) this.document.value = doc
      },
    )

    const status = this.document.value?.status
    const keepGoing =
      status !== undefined && isPending(status) && this.attempts < MAX_ATTEMPTS

    if (keepGoing) {
      this.scheduleNext(saleId)
    } else {
      this.stopPolling()
      this.notifyTerminal(status)
    }
  }

  private notifyTerminal(status: FiscalDocumentStatus | undefined): void {
    if (status === FiscalDocumentStatus.AUTORIZADO) {
      this.toast.success('NFC-e autorizada.')
    } else if (
      status === FiscalDocumentStatus.REJEITADO ||
      status === FiscalDocumentStatus.ERRO
    ) {
      this.toast.error('A emissão da NFC-e falhou. Verifique o motivo.')
    }
  }

  /** Interrompe o polling e limpa o timer. */
  stopPolling(): void {
    if (this.timer !== null) {
      window.clearTimeout(this.timer)
      this.timer = null
    }
    this.polling.value = false
  }

  /** Encerra o controller — chamar no `onUnmounted` da página. */
  dispose(): void {
    this.stopPolling()
  }
}
