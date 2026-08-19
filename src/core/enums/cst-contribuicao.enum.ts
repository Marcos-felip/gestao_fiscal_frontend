/**
 * CST de PIS e COFINS.
 *
 * **Um arquivo, não dois.** A change previa `cst-pis.enum.ts` e
 * `cst-cofins.enum.ts` separados, mas a tabela de códigos é a mesma para as
 * duas contribuições — duplicá-la criaria duas fontes que podem divergir sem
 * ninguém perceber. Quem quiser tratá-las separadamente usa os dois aliases
 * exportados no fim.
 *
 * A forma de apuração é o que decide se a alíquota é exigida, e espelha
 * `formaDaContribuicao` em `gestao_fiscal_backend/src/fiscal/emission/fiscal-rules.ts`.
 */

/** Como o CST apura a contribuição. */
export const FormaContribuicao = {
  /** Base × alíquota percentual. */
  PERCENTUAL: 'percentual',
  /** Quantidade × alíquota em reais por unidade. */
  QUANTIDADE: 'quantidade',
  /** Não tributado: não comporta base, alíquota nem valor. */
  NENHUMA: 'nenhuma',
  /** Outras operações: uma das duas formas, nunca as duas. */
  QUALQUER: 'qualquer',
} as const

export type FormaContribuicao =
  (typeof FormaContribuicao)[keyof typeof FormaContribuicao]

interface CstContribuicao {
  value: string
  label: string
  forma: FormaContribuicao
}

/**
 * Códigos oferecidos no cadastro.
 *
 * É um recorte dos aceitos pelo backend — a tabela oficial tem mais de trinta
 * códigos, e listar todos num `Select` esconderia os cinco que aparecem na
 * prática. Produto que chegue por importação com um código fora desta lista
 * **não é recusado**: a validação usa {@link CST_CONTRIBUICAO_SUPORTADOS}, que é
 * a lista inteira.
 */
export const cstContribuicaoOptions: CstContribuicao[] = [
  {
    value: '01',
    label: '01 - Tributada com alíquota básica',
    forma: FormaContribuicao.PERCENTUAL,
  },
  {
    value: '02',
    label: '02 - Tributada com alíquota diferenciada',
    forma: FormaContribuicao.PERCENTUAL,
  },
  {
    value: '03',
    label: '03 - Tributada por quantidade',
    forma: FormaContribuicao.QUANTIDADE,
  },
  {
    value: '04',
    label: '04 - Monofásica, alíquota zero na revenda',
    forma: FormaContribuicao.NENHUMA,
  },
  {
    value: '05',
    label: '05 - Substituição tributária',
    forma: FormaContribuicao.NENHUMA,
  },
  {
    value: '06',
    label: '06 - Alíquota zero',
    forma: FormaContribuicao.NENHUMA,
  },
  {
    value: '07',
    label: '07 - Isenta da contribuição',
    forma: FormaContribuicao.NENHUMA,
  },
  {
    value: '08',
    label: '08 - Sem incidência da contribuição',
    forma: FormaContribuicao.NENHUMA,
  },
  {
    value: '09',
    label: '09 - Com suspensão da contribuição',
    forma: FormaContribuicao.NENHUMA,
  },
  {
    value: '49',
    label: '49 - Outras operações de saída',
    forma: FormaContribuicao.QUALQUER,
  },
  {
    value: '99',
    label: '99 - Outras operações',
    forma: FormaContribuicao.QUALQUER,
  },
]

/** Todos os CST que o backend aceita, incluindo os fora do `Select`. */
export const CST_CONTRIBUICAO_SUPORTADOS = [
  '01',
  '02',
  '03',
  '04',
  '05',
  '06',
  '07',
  '08',
  '09',
  '49',
  '50',
  '51',
  '52',
  '53',
  '54',
  '55',
  '56',
  '60',
  '61',
  '62',
  '63',
  '64',
  '65',
  '66',
  '67',
  '70',
  '71',
  '72',
  '73',
  '74',
  '75',
  '98',
  '99',
] as const

const PERCENTUAL = ['01', '02']
const QUANTIDADE = ['03']
const SEM_TRIBUTACAO = ['04', '05', '06', '07', '08', '09']

/** Forma de apuração do CST, ou `undefined` quando ele não existe. */
export function formaDaContribuicao(
  cst: string | null | undefined,
): FormaContribuicao | undefined {
  const codigo = cst?.trim() ?? ''

  if (PERCENTUAL.includes(codigo)) return FormaContribuicao.PERCENTUAL
  if (QUANTIDADE.includes(codigo)) return FormaContribuicao.QUANTIDADE
  if (SEM_TRIBUTACAO.includes(codigo)) return FormaContribuicao.NENHUMA
  if ((CST_CONTRIBUICAO_SUPORTADOS as readonly string[]).includes(codigo)) {
    return FormaContribuicao.QUALQUER
  }

  return undefined
}

/** `true` quando a situação tributária exige alíquota cadastrada. */
export function exigeAliquota(cst: string | null | undefined): boolean {
  const forma = formaDaContribuicao(cst)
  return forma === FormaContribuicao.PERCENTUAL || forma === FormaContribuicao.QUANTIDADE
}

/** Aliases para quem preferir nomear a contribuição no ponto de uso. */
export const cstPisOptions = cstContribuicaoOptions
export const cstCofinsOptions = cstContribuicaoOptions
