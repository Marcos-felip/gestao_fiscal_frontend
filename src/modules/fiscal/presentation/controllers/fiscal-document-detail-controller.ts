import { ref } from 'vue'
import { BaseController } from '@/core/controllers/base-controller'
import type { GetFiscalDocumentUseCase } from '@/modules/fiscal/application/use-cases/get-fiscal-document.use-case'
import type { DownloadFiscalXmlUseCase } from '@/modules/fiscal/application/use-cases/download-fiscal-xml.use-case'
import type {
  FiscalDocument,
  FiscalXmlType,
} from '@/modules/fiscal/domain/entities/fiscal-document.entity'
import { useToast } from '@/shared/composables'

export class FiscalDocumentDetailController extends BaseController {
  private readonly getUseCase: GetFiscalDocumentUseCase
  private readonly downloadXmlUseCase: DownloadFiscalXmlUseCase
  private readonly toast = useToast()

  readonly document = ref<FiscalDocument | null>(null)
  readonly loaded = ref(false)
  /** Tipo de XML em download no momento (para desabilitar só o botão certo). */
  readonly downloadingXml = ref<FiscalXmlType | null>(null)

  constructor(
    getUseCase: GetFiscalDocumentUseCase,
    downloadXmlUseCase: DownloadFiscalXmlUseCase,
  ) {
    super()
    this.getUseCase = getUseCase
    this.downloadXmlUseCase = downloadXmlUseCase
  }

  async load(id: string): Promise<void> {
    this.setLoading(true)
    const result = await this.getUseCase.execute(id)
    this.handleResult(result, (doc) => {
      this.document.value = doc
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
        this.triggerDownload(xml, this.fileNameFor(doc, tipo))
      },
      (error) => {
        this.toast.error(
          error.isUserFacing ? error.message : 'Não foi possível baixar o XML.',
        )
      },
    )
    this.downloadingXml.value = null
  }

  /** Nome do arquivo: usa a chave de acesso quando existe, senão modelo+número. */
  private fileNameFor(doc: FiscalDocument, tipo: FiscalXmlType): string {
    const base = doc.chaveAcesso
      ? doc.chaveAcesso
      : `${doc.modelo.toLowerCase()}-${doc.numero}`
    return `${base}-${tipo}.xml`
  }

  private triggerDownload(xml: string, fileName: string): void {
    const blob = new Blob([xml], { type: 'application/xml' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = fileName
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
    URL.revokeObjectURL(url)
  }
}
