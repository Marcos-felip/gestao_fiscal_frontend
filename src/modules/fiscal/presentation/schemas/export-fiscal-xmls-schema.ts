import { z } from 'zod'

/**
 * Limite de janela da exportação, espelhando o backend. Os dois lados calculam
 * a mesma coisa: a data de fim sem hora vale até o último milissegundo do dia.
 * Divergir aqui faria a tela aceitar um período que a API recusa.
 */
export const PERIODO_MAXIMO_DIAS = 92

const MILISSEGUNDOS_POR_DIA = 86_400_000

/** Dias cobertos por um período de datas `aaaa-MM-dd`, com o dia final inteiro. */
export function diasDoPeriodo(dataInicio: string, dataFim: string): number {
  const de = new Date(`${dataInicio}T00:00:00.000Z`).getTime()
  const ate = new Date(`${dataFim}T23:59:59.999Z`).getTime()

  return (ate - de) / MILISSEGUNDOS_POR_DIA
}

export const exportFiscalXmlsSchema = z
  .object({
    dataInicio: z.string().min(1, 'Informe a data de início'),
    dataFim: z.string().min(1, 'Informe a data de fim'),
  })
  .refine((valores) => new Date(valores.dataFim) >= new Date(valores.dataInicio), {
    message: 'A data de fim não pode ser anterior à data de início',
    path: ['dataFim'],
  })
  .refine(
    (valores) =>
      diasDoPeriodo(valores.dataInicio, valores.dataFim) <=
      PERIODO_MAXIMO_DIAS,
    {
      message: `O período não pode passar de ${PERIODO_MAXIMO_DIAS} dias. Exporte mês a mês.`,
      path: ['dataFim'],
    },
  )

export type ExportFiscalXmlsFormData = z.infer<typeof exportFiscalXmlsSchema>

/** Período de um mês em `aaaa-MM-dd`, do primeiro ao último dia. */
export interface PeriodoMensal {
  dataInicio: string
  dataFim: string
}

function paraEntrada(data: Date): string {
  const ano = data.getUTCFullYear()
  const mes = String(data.getUTCMonth() + 1).padStart(2, '0')
  const dia = String(data.getUTCDate()).padStart(2, '0')

  return `${ano}-${mes}-${dia}`
}

export function mesFechado(
  deslocamento: number,
  referencia: Date = new Date(),
): PeriodoMensal {
  const ano = referencia.getFullYear()
  const mes = referencia.getMonth() + deslocamento

  return {
    dataInicio: paraEntrada(new Date(Date.UTC(ano, mes, 1))),
    dataFim: paraEntrada(new Date(Date.UTC(ano, mes + 1, 0))),
  }
}
