> **Contrato publicado em 12/08/2026.** A change irmã do backend está aplicada
> (`GET /fiscal/documents/xml/export`) e o contrato está em
> `gestao_fiscal_backend/API.md`, na seção de documentos fiscais: filtros,
> estrutura do ZIP, colunas do `_relacao.csv`, regra do ambiente e os limites de
> 92 dias / 5.000 documentos.
>
> Dois detalhes que mudam o desenho da tela:
> - `dataFim` **sem hora vale o dia inteiro** — não é preciso somar um dia no cliente.
> - Período vazio devolve `200` com um ZIP só de manifesto, não `404`.

## 1. Pré-requisito

- [x] 1.1 Confirmar que a change irmã do backend está aplicada e que `API.md` publica a rota, os filtros e os limites
- [x] 1.2 Espelhar o contrato em `gestao_fiscal_frontend/API.md`
  - Seção `## Fiscal` nova: este repositório não tinha nenhuma. Só o que tem particularidade de consumo entra aqui; o módulo inteiro continua documentado no backend.

## 2. Domain e Data

- [x] 2.1 `domain/dto/export-fiscal-xmls-dto.ts` — período, estabelecimento, modelo e ambiente
  - As datas ficam como `aaaa-MM-dd` cru: é a **única** data do app que não passa por `dateInputToIso`. O porquê está no cabeçalho do arquivo.
- [x] 2.2 Estender `IFiscalDocumentRepository` com `exportXmls(dto): Promise<Either<DomainError, Blob>>`
- [x] 2.3 Implementar no repository pedindo resposta binária, no mesmo padrão do download do DANFE — **sem mapper Zod**, a resposta não é JSON
- [x] 2.4 Erro `400` do backend continua atravessando o `httpClient` como `DomainError`, sem tratamento especial no repository
  - **Precisou de conserto na infra.** Em requisição `responseType: 'blob'`, o Axios entrega o corpo do erro como `Blob` e o `http-error-mapper` não enxerga `{ statusCode, message }` lá dentro: todo `400` virava "Dados inválidos.", e a orientação de como fatiar o pedido se perdia. `unwrapBlobError`, no interceptor de resposta, desembrulha antes de rejeitar. Vale para XML e DANFE também, que tinham o mesmo defeito latente.

## 3. Application e Presentation

- [x] 3.1 `application/use-cases/export-fiscal-xmls.use-case.ts`
- [x] 3.2 Registrar na factory do módulo fiscal (composition root)
- [x] 3.3 `presentation/schemas/export-fiscal-xmls-schema.ts` — datas obrigatórias, fim não anterior ao início, período máximo de 92 dias espelhando o backend
  - O cálculo é idêntico ao do backend (dia final inteiro), com teste provando que os dois recusam o mesmo período.
- [x] 3.4 Controller com estado de carregamento próprio da exportação, sem travar a lista
- [x] 3.5 Modal de exportação na página de documentos fiscais, com atalhos de mês fechado
  - Abre já preenchido com o mês passado, que é o período do fechamento.
- [x] 3.6 Aviso visível ao selecionar homologação
- [x] 3.7 Disparo do download a partir do `Blob`, reaproveitando o utilitário já usado no XML individual e no DANFE
  - O "utilitário" era um método privado do controller de detalhe. Extraído para `core/utils/download.ts` e os dois passaram a usá-lo.
- [x] 3.8 Gating por `fiscal.read` na ação

## 4. Testes

- [x] 4.1 Schema: fim anterior ao início recusado; período acima de 92 dias recusado; datas válidas passam
- [x] 4.2 Atalho de mês fechado preenche início e fim corretamente
  - Inclui mês de 30 dias, fevereiro bissexto e virada de ano.
- [x] 4.3 Controller: durante a exportação o botão fica em carregamento e disparo repetido é ignorado
- [x] 4.4 Falha na exportação devolve o botão ao estado normal e exibe o erro
- [x] 4.5 Erro de limite é resolvido por `instanceof` de `DomainError`, nunca por texto
  - `ValidationError` passa a mensagem adiante; `ServerError` cai no texto genérico. A decisão é do `isUserFacing` da subclasse.
- [x] 4.6 `npm run verify` verde — 248 testes, 32 arquivos, lint sem erros, build ok
- [ ] 4.7 **Não feito:** exportação real contra o backend de pé. Os testes cobrem schema, controller, nome do arquivo e tradução de erro com o use case mockado; ninguém baixou um ZIP pela tela ainda.

## 5. Ajuste de contexto

- [x] 5.1 Atualizar o parágrafo do módulo fiscal em `AGENTS.md` com a exportação em lote

## 6. Requisito não atendido

- [ ] 6.1 **Cenário "Período sem documentos" da spec não foi implementado.** O download acontece normalmente, mas a interface **não informa** que o período não teve movimento — o cliente recebe um `Blob` e não tem como saber quantos documentos entraram sem descompactar o ZIP.
  - Duas saídas, nenhuma barata: (a) o backend manda um header com o total e o expõe em `Access-Control-Expose-Headers` — mas o `httpClient` hoje devolve só `data`, então leria header nenhum sem uma mudança no core; (b) heurística pelo tamanho do `Blob`, que é frágil e mentiria em algum caso.
  - Fica registrado em vez de resolvido por chute. A decisão é de escopo, não técnica.
