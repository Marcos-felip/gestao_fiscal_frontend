/**
 * Carta de correção eletrônica (evento 110110) de um documento autorizado.
 *
 * A `sequencia` é atribuída pelo servidor, não escolhida aqui: ela precisa ser a
 * próxima da nota, e só quem tem o histórico sabe qual é.
 */
export class FiscalCorrectionLetter {
  readonly id: string
  readonly fiscalDocumentId: string
  readonly sequencia: number
  readonly correcao: string
  /**
   * Texto legal vigente quando a correção foi feita. Vem gravado com a carta —
   * a redação muda com o tempo, e o que vale é a que o operador leu.
   */
  readonly condicaoDeUso: string | null
  readonly protocolo: string | null
  readonly xmlEvento: string | null
  readonly createdAt: Date

  constructor(fields: {
    id: string
    fiscalDocumentId: string
    sequencia: number
    correcao: string
    condicaoDeUso: string | null
    protocolo: string | null
    xmlEvento: string | null
    createdAt: Date
  }) {
    this.id = fields.id
    this.fiscalDocumentId = fields.fiscalDocumentId
    this.sequencia = fields.sequencia
    this.correcao = fields.correcao
    this.condicaoDeUso = fields.condicaoDeUso
    this.protocolo = fields.protocolo
    this.xmlEvento = fields.xmlEvento
    this.createdAt = fields.createdAt
  }

  /** Só oferece o download quando há XML do outro lado. */
  get hasXml(): boolean {
    return this.xmlEvento !== null && this.xmlEvento !== ''
  }
}

/** Limite legal de cartas de correção por nota. */
export const LIMITE_CARTAS_CORRECAO = 20
