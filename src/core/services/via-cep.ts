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
}

interface ViaCepResponse {
  logradouro?: string
  bairro?: string
  localidade?: string
  uf?: string
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
    }
  } catch {
    return null
  }
}
