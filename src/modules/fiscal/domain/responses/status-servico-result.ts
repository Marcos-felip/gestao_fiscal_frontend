/**
 * Resultado do teste de comunicação com a SEFAZ (status do serviço). Retornado
 * por `POST /fiscal/settings/:establishmentId/sefaz-status`.
 */
export interface StatusServicoResult {
  disponivel: boolean
  mensagem: string | null
  tempoMedioResposta: number | null
}
