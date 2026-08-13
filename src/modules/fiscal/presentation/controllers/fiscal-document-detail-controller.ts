import { ref } from 'vue'
import { BaseController } from '@/core/controllers/base-controller'
import type { GetFiscalDocumentUseCase } from '@/modules/fiscal/application/use-cases/get-fiscal-document.use-case'
import type { DownloadFiscalXmlUseCase } from '@/modules/fiscal/application/use-cases/download-fiscal-xml.use-case'
import type { CancelFiscalDocumentUseCase } from '@/modules/fiscal/application/use-cases/cancel-fiscal-document.use-case'
import type { ConsultFiscalDocumentUseCase } from '@/modules/fiscal/application/use-cases/consult-fiscal-document.use-case'
import type { RetryFiscalDocumentUseCase } from '@/modules/fiscal/application/use-cases/retry-fiscal-document.use-case'
import type { DownloadFiscalDanfeUseCase } from '@/modules/fiscal/application/use-cases/download-fiscal-danfe.use-case'
import type {
  FiscalDocument,
  FiscalXmlType,
} from '@/modules/fiscal/domain/entities/fiscal-document.entity'
import { CancelFiscalDocumentDto } from '@/modules/fiscal/domain/dto/cancel-fiscal-document-dto'
import { FiscalDocumentStatus } from '@/core/enums/fiscal-document-status.enum'
import { triggerFileDownload } from '@/core/utils/download'
import { useToast } from '@/shared/composables'

/** Intervalo entre consultas de status durante o polling (ms). */
const POLL_INTERVAL = 3000
/** Máximo de consultas antes de desistir (evita loop infinito). */
const MAX_ATTEMPTS = 20

/** Estados que ainda evoluem — enquanto assim, mantém o polling. */
function isPending(status: FiscalDocumentStatus): boolean {
  return (
    status === FiscalDocumentStatus.PENDENTE ||
    status === FiscalDocumentStatus.PROCESSANDO
  )
}

export class FiscalDocumentDetailController extends BaseController {
  private readonly getUseCase: GetFiscalDocumentUseCase
  private readonly downloadXmlUseCase: DownloadFiscalXmlUseCase
  private readonly cancelUseCase: CancelFiscalDocumentUseCase
  private readonly consultUseCase: ConsultFiscalDocumentUseCase
  private readonly retryUseCase: RetryFiscalDocumentUseCase
  private readonly downloadDanfeUseCase: DownloadFiscalDanfeUseCase
  private readonly toast = useToast()

  private timer: number | null = null
  private attempts = 0

  readonly document = ref<FiscalDocument | null>(null)
  readonly loaded = ref(false)
  /** Tipo de XML em download no momento (para desabilitar só o botão certo). */
  readonly downloadingXml = ref<FiscalXmlType | null>(null)
  readonly cancelling = ref(false)
  readonly consulting = ref(false)
  readonly retrying = ref(false)
  readonly downloadingDanfe = ref(false)
  readonly polling = ref(false)

  constructor(
    getUseCase: GetFiscalDocumentUseCase,
    downloadXmlUseCase: DownloadFiscalXmlUseCase,
    cancelUseCase: CancelFiscalDocumentUseCase,
    consultUseCase: ConsultFiscalDocumentUseCase,
    retryUseCase: RetryFiscalDocumentUseCase,
    downloadDanfeUseCase: DownloadFiscalDanfeUseCase,
  ) {
    super()
    this.getUseCase = getUseCase
    this.downloadXmlUseCase = downloadXmlUseCase
    this.cancelUseCase = cancelUseCase
    this.consultUseCase = consultUseCase
    this.retryUseCase = retryUseCase
    this.downloadDanfeUseCase = downloadDanfeUseCase
  }

  async load(id: string): Promise<void> {
    this.setLoading(true)
    const result = await this.getUseCase.execute(id)
    this.handleResult(result, (doc) => {
      this.document.value = doc
      if (isPending(doc.status)) this.startPolling(doc.id)
    })
    this.loaded.value = true
    this.setLoading(false)
  }

  async downloadXml(tipo: FiscalXmlType): Promise<void> {
    const doc = this.document.value
    if (!doc || this.downloadingXml.value) return

    this.downloadingXml.value = tipo
    const result = await this.downloadXmlUseCase.execute(doc.id, tipo)
    this.handleResult(
      result,
      (xml) => {
        triggerFileDownload(
          new Blob([xml], { type: 'application/xml' }),
          `${this.baseFileName(doc)}-${tipo}.xml`,
        )
      },
      (error) => {
        this.toast.error(
          error.isUserFacing ? error.message : 'Não foi possível baixar o XML.',
        )
      },
    )
    this.downloadingXml.value = null
  }

  /**
   * Cancela o documento autorizado. Em sucesso substitui o documento (agora
   * CANCELADO). Retorna `true` para a tela fechar o diálogo.
   */
  async cancel(justificativa: string): Promise<boolean> {
    const doc = this.document.value
    if (!doc || this.cancelling.value) return false

    this.cancelling.value = true
    const result = await this.cancelUseCase.execute(
      doc.id,
      new CancelFiscalDocumentDto(justificativa),
    )
    let ok = false
    this.handleResult(
      result,
      (updated) => {
        this.document.value = updated
        this.toast.success('Documento cancelado.')
        ok = true
      },
      (error) => {
        this.toast.error(
          error.isUserFacing
            ? error.message
            : 'Não foi possível cancelar o documento.',
        )
      },
    )
    this.cancelling.value = false
    return ok
  }

  /**
   * Consulta a situação na SEFAZ. Mostra a mensagem/situação retornada e, se o
   * status local mudou (`atualizado`), recarrega o documento.
   */
  async consult(): Promise<void> {
    const doc = this.document.value
    if (!doc || this.consulting.value) return

    this.consulting.value = true
    const result = await this.consultUseCase.execute(doc.id)
    this.handleResult(
      result,
      (consulta) => {
        const message =
          consulta.mensagem ?? consulta.situacao ?? 'Situação consultada.'
        if (consulta.atualizado) {
          this.toast.success(message)
          void this.load(doc.id)
        } else {
          this.toast.info(message)
        }
      },
      (error) => {
        this.toast.error(
          error.isUserFacing
            ? error.message
            : 'Não foi possível consultar a situação.',
        )
      },
    )
    this.consulting.value = false
  }

  /**
   * Reprocessa (reenfileira) a emissão. A resposta volta em PENDENTE; em
   * sucesso reinicia o polling até um estado terminal.
   */
  async retry(): Promise<void> {
    const doc = this.document.value
    if (!doc || this.retrying.value) return

    this.retrying.value = true
    const result = await this.retryUseCase.execute(doc.id)
    this.handleResult(
      result,
      (updated) => {
        this.document.value = updated
        this.toast.info('Reprocessamento iniciado — acompanhando o status…')
        if (isPending(updated.status)) this.startPolling(updated.id)
      },
      (error) => {
        this.toast.error(
          error.isUserFacing
            ? error.message
            : 'Não foi possível reprocessar o documento.',
        )
      },
    )
    this.retrying.value = false
  }

  /**
   * Baixa o DANFE e dispara o download.
   *
   * O formato varia por modelo: NFC-e é PDF, NF-e é HTML. Este método já forçou
   * `application/pdf` em tudo, e o resultado era um HTML renomeado para `.pdf`
   * que o navegador recusava abrir — "Falha ao carregar documento PDF". Tipo
   * desconhecido continua virando PDF, porque só a NFC-e cai nesse caso.
   */
  async downloadDanfe(): Promise<void> {
    const doc = this.document.value
    if (!doc || this.downloadingDanfe.value) return

    this.downloadingDanfe.value = true
    const result = await this.downloadDanfeUseCase.execute(doc.id)
    this.handleResult(
      result,
      (blob) => {
        const ehHtml = blob.type.includes('html')
        const arquivo = ehHtml
          ? blob
          : new Blob([blob], { type: 'application/pdf' })

        triggerFileDownload(
          arquivo,
          `${this.danfeFileName(doc)}.${ehHtml ? 'html' : 'pdf'}`,
        )
      },
      (error) => {
        this.toast.error(
          error.isUserFacing
            ? error.message
            : 'Não foi possível baixar a DANFE.',
        )
      },
    )
    this.downloadingDanfe.value = false
  }

  /** Nome-base do arquivo: chave de acesso quando existe, senão modelo+número. */
  private baseFileName(doc: FiscalDocument): string {
    return doc.chaveAcesso
      ? doc.chaveAcesso
      : `${doc.modelo.toLowerCase()}-${doc.numero}`
  }

  private danfeFileName(doc: FiscalDocument): string {
    return doc.chaveAcesso
      ? doc.chaveAcesso
      : `${doc.modelo.toLowerCase()}-${doc.numero}`
  }

  private startPolling(id: string): void {
    this.stopPolling()
    this.attempts = 0
    this.polling.value = true
    this.scheduleNext(id)
  }

  private scheduleNext(id: string): void {
    this.timer = window.setTimeout(() => void this.poll(id), POLL_INTERVAL)
  }

  private async poll(id: string): Promise<void> {
    this.attempts += 1
    const result = await this.getUseCase.execute(id)

    // Erro transitório não derruba o documento já conhecido.
    result.fold(
      () => {},
      (doc) => {
        this.document.value = doc
      },
    )

    const status = this.document.value?.status
    const keepGoing =
      status !== undefined && isPending(status) && this.attempts < MAX_ATTEMPTS

    if (keepGoing) {
      this.scheduleNext(id)
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
