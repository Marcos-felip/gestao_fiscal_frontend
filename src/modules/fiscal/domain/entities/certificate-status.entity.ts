/**
 * Situação do certificado digital A1 de um estabelecimento. Reflete o retorno
 * de `GET/POST /fiscal/settings/:establishmentId/certificate`: se está
 * configurado, o titular/subject, a validade e os dias que faltam para vencer.
 */
export class CertificateStatus {
  readonly configurado: boolean
  readonly titular: string | null
  readonly subject: string | null
  readonly validoAte: Date | null
  readonly diasParaVencer: number | null
  readonly vencido: boolean

  constructor(fields: {
    configurado: boolean
    titular: string | null
    subject: string | null
    validoAte: Date | null
    diasParaVencer: number | null
    vencido: boolean
  }) {
    this.configurado = fields.configurado
    this.titular = fields.titular
    this.subject = fields.subject
    this.validoAte = fields.validoAte
    this.diasParaVencer = fields.diasParaVencer
    this.vencido = fields.vencido
  }

  /** Certificado vence em 30 dias ou menos (e ainda não venceu). */
  get isExpiring(): boolean {
    if (this.vencido) return false
    if (this.diasParaVencer === null) return false
    return this.diasParaVencer <= 30 && this.diasParaVencer >= 0
  }
}
