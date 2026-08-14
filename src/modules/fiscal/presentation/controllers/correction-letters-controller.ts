import { computed, ref } from 'vue'
import { BaseController } from '@/core/controllers/base-controller'
import type { CreateCorrectionLetterUseCase } from '@/modules/fiscal/application/use-cases/create-correction-letter.use-case'
import type { ListCorrectionLettersUseCase } from '@/modules/fiscal/application/use-cases/list-correction-letters.use-case'
import type { DownloadCorrectionLetterXmlUseCase } from '@/modules/fiscal/application/use-cases/download-correction-letter-xml.use-case'
import type { FiscalCorrectionLetter } from '@/modules/fiscal/domain/entities/fiscal-correction-letter.entity'
import { LIMITE_CARTAS_CORRECAO } from '@/modules/fiscal/domain/entities/fiscal-correction-letter.entity'
import { CreateCorrectionLetterDto } from '@/modules/fiscal/domain/dto/create-correction-letter-dto'
import { triggerFileDownload } from '@/core/utils/download'
import { useToast } from '@/shared/composables'

/**
 * Cartas de correção de um documento.
 *
 * Controller próprio, montado ao lado do detalhe: a correção tem estado e regra
 * de sobra (histórico, limite legal, download por sequência) para não caber
 * como mais três campos no controller do documento.
 */
export class CorrectionLettersController extends BaseController {
  private readonly listUseCase: ListCorrectionLettersUseCase
  private readonly createUseCase: CreateCorrectionLetterUseCase
  private readonly downloadXmlUseCase: DownloadCorrectionLetterXmlUseCase
  private readonly toast = useToast()

  private documentId: string | null = null

  readonly letters = ref<FiscalCorrectionLetter[]>([])
  readonly loadingLetters = ref(false)
  readonly creating = ref(false)
  /** Sequência em download, para desabilitar só o botão daquela linha. */
  readonly downloadingSequencia = ref<number | null>(null)

  /** Quantas ainda cabem antes do limite legal. */
  readonly restantes = computed(() =>
    Math.max(0, LIMITE_CARTAS_CORRECAO - this.letters.value.length),
  )

  readonly limiteAtingido = computed(() => this.restantes.value === 0)

  constructor(
    listUseCase: ListCorrectionLettersUseCase,
    createUseCase: CreateCorrectionLetterUseCase,
    downloadXmlUseCase: DownloadCorrectionLetterXmlUseCase,
  ) {
    super()
    this.listUseCase = listUseCase
    this.createUseCase = createUseCase
    this.downloadXmlUseCase = downloadXmlUseCase
  }

  async load(fiscalDocumentId: string): Promise<void> {
    this.documentId = fiscalDocumentId
    this.loadingLetters.value = true

    const result = await this.listUseCase.execute(fiscalDocumentId)
    this.handleResult(
      result,
      (letters) => {
        this.letters.value = letters
      },
      // Falhar aqui não pode derrubar o detalhe do documento: a seção some e o
      // resto da tela continua utilizável.
      () => {
        this.letters.value = []
      },
    )

    this.loadingLetters.value = false
  }

  /**
   * Emite a correção. Devolve `true` para a tela fechar o diálogo — em erro o
   * texto digitado continua lá.
   */
  async create(correcao: string): Promise<boolean> {
    if (!this.documentId || this.creating.value) return false

    this.creating.value = true
    const result = await this.createUseCase.execute(
      this.documentId,
      new CreateCorrectionLetterDto(correcao),
    )

    let ok = false
    this.handleResult(
      result,
      (letter) => {
        this.letters.value = [...this.letters.value, letter]
        this.toast.success(`Carta de correção ${letter.sequencia} registrada.`)
        ok = true
      },
      (error) => {
        this.toast.error(
          error.isUserFacing
            ? error.message
            : 'Não foi possível emitir a carta de correção.',
        )
      },
    )

    this.creating.value = false
    return ok
  }

  /**
   * Baixa o XML de uma correção. `baseName` é a chave de acesso da nota — o
   * mesmo nome que a exportação em lote usa, para os dois arquivos casarem na
   * pasta do contador.
   */
  async downloadXml(
    letter: FiscalCorrectionLetter,
    baseName?: string,
  ): Promise<void> {
    if (!this.documentId || this.downloadingSequencia.value !== null) return

    this.downloadingSequencia.value = letter.sequencia
    const result = await this.downloadXmlUseCase.execute(
      this.documentId,
      letter.sequencia,
    )

    this.handleResult(
      result,
      (xml) => {
        const sequencia = String(letter.sequencia).padStart(2, '0')
        triggerFileDownload(
          new Blob([xml], { type: 'application/xml' }),
          `${baseName ?? this.documentId}-cce-${sequencia}.xml`,
        )
      },
      (error) => {
        this.toast.error(
          error.isUserFacing
            ? error.message
            : 'Não foi possível baixar o XML da correção.',
        )
      },
    )

    this.downloadingSequencia.value = null
  }
}
