## 1. Pré-requisito

- [ ] 1.1 Confirmar que a change irmã do backend está aplicada e que a migration de backfill rodou
- [ ] 1.2 Espelhar em `gestao_fiscal_frontend/API.md` os campos fiscais do produto que passaram a ser exigidos

## 2. Enums

- [ ] 2.1 `src/core/enums/cst-pis.enum.ts` — códigos com rótulo descritivo
- [ ] 2.2 `src/core/enums/cst-cofins.enum.ts` — idem
- [ ] 2.3 Conferir que os valores batem com os do backend, como a auditoria de enums do `AGENTS.md` prevê

## 3. Mapper

- [ ] 3.1 `product.mapper.ts`: validar `cstPis` e `cstCofins` com `z.nativeEnum`, nunca `z.string()` + `as`
- [ ] 3.2 Ao tocar o arquivo, migrar também o cast existente `value.unit as UnitOfMeasure` — dívida registrada no `AGENTS.md`
- [ ] 3.3 Testes do mapper: valor de enum desconhecido → `ContractError`

## 4. Formulário

- [ ] 4.1 Trocar os campos de texto de CST de PIS e COFINS por `Select` com descrição
- [ ] 4.2 Tornar os dois obrigatórios no schema de apresentação, com mensagem em PT-BR
- [ ] 4.3 Exigir alíquota conforme a situação tributária escolhida; ocultar quando não couber
- [ ] 4.4 Aviso na seção fiscal sobre valores herdados da migração, citando bebidas (monofásicos) como caso típico
- [ ] 4.5 Deixar de exibir o aviso depois que o produto for salvo com revisão

## 5. Pendências fiscais

- [ ] 5.1 Incluir produto sem CST de PIS/COFINS no relatório de pendências
- [ ] 5.2 Exibir o motivo devolvido pela API, sem reescrever a mensagem no frontend

## 6. Testes

- [ ] 6.1 Schema: produto sem CST de PIS ou COFINS é recusado
- [ ] 6.2 Alíquota exigida ou dispensada conforme a situação tributária
- [ ] 6.3 Produto completo passa e o indicador de completude reflete
- [ ] 6.4 `npm run verify` verde

## 7. Contexto

- [ ] 7.1 Atualizar o parágrafo do módulo fiscal em `AGENTS.md` com os campos que passaram a ser exigidos
