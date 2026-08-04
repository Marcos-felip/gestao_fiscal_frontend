/**
 * Registro do histórico do certificado digital de um estabelecimento: cada
 * troca/substituição gera um evento com o titular e a validade vigentes, além
 * do subject anterior (quando houve substituição) e quem fez a operação.
 */
export class FiscalCertificateEvent {
  readonly tipo: string
  readonly subject: string | null
  readonly titular: string | null
  readonly validoAte: Date | null
  readonly subjectAnterior: string | null
  readonly usuarioId: string | null
  readonly createdAt: Date

  constructor(fields: {
    tipo: string
    subject: string | null
    titular: string | null
    validoAte: Date | null
    subjectAnterior: string | null
    usuarioId: string | null
    createdAt: Date
  }) {
    this.tipo = fields.tipo
    this.subject = fields.subject
    this.titular = fields.titular
    this.validoAte = fields.validoAte
    this.subjectAnterior = fields.subjectAnterior
    this.usuarioId = fields.usuarioId
    this.createdAt = fields.createdAt
  }
}
