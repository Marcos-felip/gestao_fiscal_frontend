## 1. Correção independente do backend

- [x] 1.1 `company-controller.ts:222` (`applySede`) — preencher `stateRegistration` a partir de `matriz.inscricaoEstadual ?? ''`, junto dos campos que já são copiados
- [x] 1.2 Conferir a ordem em `load()`: `applySede` roda depois de `applyCompany`, para a matriz vencer o valor vindo da empresa
- [x] 1.3 Texto na seção "Sede" indicando que essa é a IE do estabelecimento emissor, usada na NFC-e
- [x] 1.4 Teste do controller: após `load()`, o formulário carrega a IE da matriz

## 2. Após o backend publicar `stateRegistration` (change irmã)

- [x] 2.1 Confirmar em `gestao_fiscal_backend/API.md` que o campo é read-write e espelhar em `gestao_fiscal_frontend/API.md`
- [x] 2.2 `company.mapper.ts:16` — trocar `z.string().nullable().default(null)` por `z.string().nullable()`, para campo ausente voltar a produzir `ContractError`
- [x] 2.3 **Verificado em 14/08/2026:** `GET /companies/:id` da Sal e Fogo Braga devolve `stateRegistration: "0046845300054"` — a IE do estabelecimento, que era justamente a que não voltava
- [x] 2.4 Auditar os demais `.nullable().default(null)` de `company.mapper.ts` → **nenhum outro mascara campo ausente.** Dos 21 campos declarados no mapper, `stateRegistration` era o único que não é coluna de `Company` no Prisma; todos os demais são colunas escalares que o `findFirst`/`findMany` sempre devolve, então o `.default(null)` neles é redundante, não mascaramento. Nada a corrigir em outra change.

## 3. Testes

- [x] 3.1 `company.mapper.spec.ts`: `stateRegistration` ausente → `ContractError`
- [x] 3.2 `company.mapper.spec.ts`: `stateRegistration` nulo explícito → entidade com nulo, sem erro
- [x] 3.3 Teste de regressão do sintoma relatado: salvar a IE, recarregar, campo preenchido
- [x] 3.4 Caso da empresa sem matriz: seção "Sede" indisponível, sem quebrar a página
- [x] 3.5 `npm run verify` verde (lint + testes + build)
