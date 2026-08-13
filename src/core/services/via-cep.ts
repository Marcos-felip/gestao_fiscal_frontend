/**
 * Consulta de endereço por CEP na API pública ViaCEP.
 *
 * É um serviço externo (host próprio), por isso usa `fetch` direto — não o
 * httpClient da aplicação. Retorna `null` em qualquer falha (rede, CEP
 * inexistente, formato inválido) para o chamador tratar de forma simples.
 */

export interface ViaCepAddress {
  street: string
  neighborhood: string
  city: string
  state: string
  /**
   * Código IBGE do município (7 dígitos).
   *
   * É o `cMun` do destinatário da NF-e. Vem de graça na mesma consulta, e
   * preenchê-lo aqui poupa o lojista de procurar um número que ele não tem
   * motivo para conhecer.
   */
  ibgeCode: string
}

interface ViaCepResponse {
  logradouro?: string
  bairro?: string
  localidade?: string
  uf?: string
  ibge?: string
  erro?: boolean
}

export async function fetchAddressByCep(
  cep: string,
): Promise<ViaCepAddress | null> {
  const digits = cep.replace(/\D/g, '')
  if (digits.length !== 8) return null

  try {
    const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
    if (!response.ok) return null

    const data = (await response.json()) as ViaCepResponse
    if (data.erro) return null

    return {
      street: data.logradouro ?? '',
      neighborhood: data.bairro ?? '',
      city: data.localidade ?? '',
      state: data.uf ?? '',
      ibgeCode: data.ibge ?? '',
    }
  } catch {
    return null
  }
}
