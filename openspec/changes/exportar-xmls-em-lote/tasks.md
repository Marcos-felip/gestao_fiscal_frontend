## 1. Pré-requisito

- [ ] 1.1 Confirmar que a change irmã do backend está aplicada e que `API.md` publica a rota, os filtros e os limites
- [ ] 1.2 Espelhar o contrato em `gestao_fiscal_frontend/API.md`

## 2. Domain e Data

- [ ] 2.1 `domain/dto/export-fiscal-xmls-dto.ts` — período, estabelecimento, modelo e ambiente
- [ ] 2.2 Estender `IFiscalDocumentRepository` com `exportXmls(dto): Promise<Either<DomainError, Blob>>`
- [ ] 2.3 Implementar no repository pedindo resposta binária, no mesmo padrão do download do DANFE — **sem mapper Zod**, a resposta não é JSON
- [ ] 2.4 Erro `400` do backend continua atravessando o `httpClient` como `DomainError`, sem tratamento especial no repository

## 3. Application e Presentation

- [ ] 3.1 `application/use-cases/export-fiscal-xmls.use-case.ts`
- [ ] 3.2 Registrar na factory do módulo fiscal (composition root)
- [ ] 3.3 `presentation/schemas/export-fiscal-xmls-schema.ts` — datas obrigatórias, fim não anterior ao início, período máximo de 92 dias espelhando o backend
- [ ] 3.4 Controller com estado de carregamento próprio da exportação, sem travar a lista
- [ ] 3.5 Modal de exportação na página de documentos fiscais, com atalhos de mês fechado
- [ ] 3.6 Aviso visível ao selecionar homologação
- [ ] 3.7 Disparo do download a partir do `Blob`, reaproveitando o utilitário já usado no XML individual e no DANFE
- [ ] 3.8 Gating por `fiscal.read` na ação

## 4. Testes

- [ ] 4.1 Schema: fim anterior ao início recusado; período acima de 92 dias recusado; datas válidas passam
- [ ] 4.2 Atalho de mês fechado preenche início e fim corretamente
- [ ] 4.3 Controller: durante a exportação o botão fica em carregamento e disparo repetido é ignorado
- [ ] 4.4 Falha na exportação devolve o botão ao estado normal e exibe o erro
- [ ] 4.5 Erro de limite é resolvido por `instanceof` de `DomainError`, nunca por texto
- [ ] 4.6 `npm run verify` verde

## 5. Ajuste de contexto

- [ ] 5.1 Atualizar o parágrafo do módulo fiscal em `AGENTS.md` com a exportação em lote
