import { z } from 'zod'
import type { FiscalSnapshot } from '@/modules/fiscal/domain/value-objects/fiscal-snapshot'

/**
 * Leitura do snapshot fiscal.
 *
 * Separado do mapper do documento de propósito: o snapshot é um JSONB congelado
 * na emissão, e o que ele contém depende da versão em que a nota nasceu. Aqui
 * fica a única tradução desse formato.
 *
 * **Snapshot ilegível não derruba o documento.** Ele é retrato auxiliar: a nota
 * continua tendo chave, protocolo, status e XML, e recusar tudo por causa dele
 * tiraria do usuário o que importa. Mas também **não vira silêncio** — quem não
 * parseia devolve `null`, e a tela diz que não conseguiu ler, em vez de mostrar
 * uma lista vazia como se a nota não tivesse itens. Foi exatamente esse silêncio
 * que escondeu, por dois dias, o snapshot inteiro deixando de aparecer.
 */

const impostoSchema = z.object({
  icms: z.object({
    situacao: z.string(),
    origem: z.number(),
    vBC: z.number().optional(),
    pICMS: z.number().optional(),
    vICMS: z.number().optional(),
    pRedBC: z.number().optional(),
    vBCST: z.number().optional(),
    pICMSST: z.number().optional(),
    vICMSST: z.number().optional(),
  }),
  pis: z.object({
    situacao: z.string(),
    vBC: z.number().optional(),
    aliquota: z.number().optional(),
    valor: z.number().optional(),
  }),
  cofins: z.object({
    situacao: z.string(),
    vBC: z.number().optional(),
    aliquota: z.number().optional(),
    valor: z.number().optional(),
  }),
})

const itemSchema = z.object({
  numeroItem: z.number(),
  codigoProduto: z.string(),
  descricao: z.string(),
  ncm: z.string(),
  cest: z.string().optional(),
  cfop: z.string(),
  unidadeComercial: z.string(),
  quantidade: z.number(),
  valorUnitario: z.number(),
  gtin: z.string().optional(),
  // Ausente nos snapshots anteriores ao contrato tributário do item.
  imposto: impostoSchema.optional(),
})

const enderecoBase = {
  logradouro: z.string(),
  numero: z.string(),
  complemento: z.string().optional(),
  bairro: z.string(),
  codigoMunicipio: z.string(),
  municipio: z.string(),
  uf: z.string(),
  cep: z.string(),
}

const emitenteSchema = z.object({
  cnpj: z.string(),
  razaoSocial: z.string(),
  nomeFantasia: z.string().optional(),
  inscricaoEstadual: z.string(),
  crt: z.union([z.string(), z.number()]).transform(String),
  ...enderecoBase,
  telefone: z.string().optional(),
  email: z.string().optional(),
})

const destinatarioNfceSchema = z.object({
  cpfCnpj: z.string().optional(),
  nome: z.string().optional(),
  logradouro: z.string().optional(),
  numero: z.string().optional(),
  bairro: z.string().optional(),
  municipio: z.string().optional(),
  uf: z.string().optional(),
  cep: z.string().optional(),
})

const destinatarioNfeSchema = z.object({
  cpfCnpj: z.string(),
  nome: z.string(),
  ...enderecoBase,
  indicadorIe: z.union([z.number(), z.string()]).transform(Number),
  inscricaoEstadual: z.string().optional(),
  telefone: z.string().optional(),
  email: z.string().optional(),
})

const transporteSchema = z.object({
  modalidadeFrete: z.number().optional(),
  transportadora: z
    .object({
      cpfCnpj: z.string().optional(),
      nome: z.string().optional(),
      municipio: z.string().optional(),
      uf: z.string().optional(),
    })
    .optional(),
  volumes: z
    .array(
      z.object({
        quantidade: z.number().optional(),
        especie: z.string().optional(),
        pesoLiquido: z.number().optional(),
        pesoBruto: z.number().optional(),
      }),
    )
    .optional(),
})

const cobrancaSchema = z.object({
  fatura: z
    .object({
      numero: z.string().optional(),
      valorOriginal: z.number().optional(),
      valorLiquido: z.number().optional(),
    })
    .optional(),
  duplicatas: z
    .array(
      z.object({
        numero: z.string().optional(),
        vencimento: z.string().optional(),
        valor: z.number().optional(),
      }),
    )
    .optional(),
})

const nfeSchema = z.object({
  naturezaOperacao: z.string(),
  tipoOperacao: z.number(),
  finalidade: z.number(),
  consumidorFinal: z.boolean(),
  presenca: z.number(),
  transporte: transporteSchema.optional(),
  cobranca: cobrancaSchema.optional(),
})

const snapshotSchema = z.object({
  versao: z.number(),
  modelo: z.enum(['NFCE', 'NFE']).optional(),
  venda: z.object({
    id: z.string(),
    numero: z.number(),
    subtotal: z.number(),
    desconto: z.number(),
    total: z.number(),
    data: z.string(),
  }),
  emitente: emitenteSchema,
  destinatario: destinatarioNfceSchema.optional(),
  destinatarioNfe: destinatarioNfeSchema.optional(),
  nfe: nfeSchema.optional(),
  itens: z.array(itemSchema),
  pagamentos: z.array(z.object({ tipo: z.string(), valor: z.number() })),
  valorTotal: z.number(),
  totais: z
    .object({
      vProd: z.number(),
      vBC: z.number(),
      vICMS: z.number(),
      vST: z.number(),
      vPIS: z.number(),
      vCOFINS: z.number(),
      vNF: z.number(),
    })
    .optional(),
  recebimento: z
    .object({ valorRecebido: z.number(), troco: z.number() })
    .optional(),
})

/**
 * Traduz o JSONB do snapshot. `null` quando não há snapshot **ou** quando o
 * formato não é o conhecido — quem chama distingue os dois pelo dado bruto.
 */
export function toFiscalSnapshot(data: unknown): FiscalSnapshot | null {
  if (data === null || data === undefined) return null

  const parsed = snapshotSchema.safeParse(data)

  if (!parsed.success) {
    // Não é erro do usuário: é contrato divergindo. Vai para o console, que é o
    // ponto de integração com telemetria, e a tela avisa que não leu.
    console.error('[fiscal-snapshot] formato desconhecido', parsed.error.issues)
    return null
  }

  return parsed.data
}
