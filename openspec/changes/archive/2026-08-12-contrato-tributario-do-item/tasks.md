> **Contrato publicado em 12/08/2026.** As changes irmãs do motor e do backend
> estão aplicadas. O contrato campo a campo está em
> `fiscal_service/docs/CONTRATO_TRIBUTARIO.md`.

## 1. Pré-requisito

- [x] 1.1 Confirmar que a change irmã do backend está aplicada e que a migration de backfill rodou
  - Backend aplicado. **A migration de backfill não existe mais** — foi escrita, aplicada e removida: seu único motivo era não parar a emissão no dia do deploy, e não há produção. Sem ela, produto sem CST de PIS/COFINS fica incompleto e não emite, que é o comportamento correto. Isso muda as tasks 4.4 e 4.5, que falavam de "valores herdados da migração".
- [x] 1.2 Espelhar em `gestao_fiscal_frontend/API.md` os campos fiscais do produto que passaram a ser exigidos
  - Seção nova em `## Fiscal`: o que virou obrigatório, quando a alíquota é exigida e quais situações de ICMS o cadastro aceita mas a emissão ainda recusa.

## 2. Enums

- [x] 2.1 `src/core/enums/cst-pis.enum.ts` — códigos com rótulo descritivo
- [x] 2.2 `src/core/enums/cst-cofins.enum.ts` — idem
  - **Um arquivo só: `cst-contribuicao.enum.ts`.** A tabela de CST é idêntica para PIS e COFINS; dois arquivos seriam duas fontes que divergem sem ninguém perceber. Ficaram os aliases `cstPisOptions` e `cstCofinsOptions` para quem preferir nomear a contribuição no ponto de uso.
- [x] 2.3 Conferir que os valores batem com os do backend
  - `formaDaContribuicao` e `CST_CONTRIBUICAO_SUPORTADOS` espelham `fiscal-rules.ts`. Também atualizei `fiscal-tax-situation.enum.ts`: CSOSN foi de 5 para 10 códigos e CST de ICMS de 3 para 11, acompanhando o motor.

## 3. Mapper

- [x] 3.1 `product.mapper.ts`: validar `cstPis` e `cstCofins` com `z.enum` sobre a tabela, nunca `z.string()` + `as`
- [x] 3.2 Migrado também o cast `value.unit as UnitOfMeasure` → `z.nativeEnum(UnitOfMeasure)`, com o `import type` virando import de valor. `product` saiu da lista de dívida do `AGENTS.md`.
- [x] 3.3 Testes do mapper: unidade, CST de PIS e CST de COFINS fora da tabela → `ContractError`; nulo continua aceito
  - **Ressalva:** produto gravado antes do `Select` pode ter CST fora da tabela (o campo era texto livre). Nesse caso a listagem falha por `ContractError` — que é o sintoma certo para dado que não emite, mas exige limpeza no banco se acontecer.

## 4. Formulário

- [x] 4.1 Trocar os campos de texto de CST de PIS e COFINS por `Select` com descrição
  - Eram dois `Input` de texto livre com `maxlength=2`. Viraram `Select` com os 11 códigos que aparecem na prática, cada um com a descrição legível.
- [x] 4.2 Tornar os dois obrigatórios no schema de apresentação, com mensagem em PT-BR
- [x] 4.3 Exigir alíquota conforme a situação tributária escolhida; ocultar quando não couber
  - O campo some quando o CST não é tributado, e trocar para uma situação não tributada **limpa** a alíquota — deixá-la para trás gravaria valor num campo que o motor recusa preenchido.
- [x] 4.4 Aviso na seção fiscal sobre valores herdados da migração, citando bebidas (monofásicos) como caso típico
  - **Reescrito**: não há migração da qual herdar. O aviso passou a dizer que sem os dois CST o produto não emite, e cita bebida monofásica (04) e alimento isento (07) como referência — pedindo confirmação com o contador.
- [x] 4.5 Deixar de exibir o aviso depois que o produto for salvo com revisão
  - O aviso é condicionado a `!form.cstPis || !form.cstCofins`: some assim que os dois são escolhidos, sem precisar de flag de revisão no banco.

## 5. Pendências fiscais

- [x] 5.1 Incluir produto sem CST de PIS/COFINS no relatório de pendências
  - Já funciona sem mudança no frontend: o backend passou a devolver 'CST de PIS ausente ou não reconhecido' em `pendencias`, e a tela exibe o que a API mandar.
- [x] 5.2 Exibir o motivo devolvido pela API, sem reescrever a mensagem no frontend

## 6. Testes

- [x] 6.1 Schema: produto sem CST de PIS ou COFINS é recusado
- [x] 6.2 Alíquota exigida ou dispensada conforme a situação tributária
- [x] 6.3 Produto completo passa e o indicador de completude reflete
  - A primeira metade está coberta. O indicador de completude vem do backend e não foi testado aqui.
- [x] 6.4 `npm run verify` verde — 263 testes, 33 arquivos, lint sem erros, build ok

## 7. Contexto

- [x] 7.1 Atualizar o parágrafo do módulo fiscal em `AGENTS.md` com os campos que passaram a ser exigidos

## 8. Validação

- [x] 8.1 Cadastro real de produto pela tela, ponta a ponta com o backend — o usuário assumiu a validação ao repovoar o banco em 12/08/2026
