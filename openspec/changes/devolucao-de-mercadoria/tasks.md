> ⏸ **ADIADA em 12/08/2026.** Devolução saiu do escopo atual. O roteiro passou a
> ser 0, 1, 3, 4 — NFC-e e NF-e dentro do estado, mais os eventos.
>
> Quando voltar, note que ela é o **primeiro caso de operação variável** do
> escopo interno: CFOP 1202 espelhando os impostos da nota original. É ela que
> justifica a porta `IRegraFiscal` ter uma segunda implementação.

> **Reveja esta proposta antes de começar** — depende das etapas 1, 2 e 3.

## 1. Pré-requisitos

- [ ] 1.1 Change irmã do backend aplicada, com a permissão `fiscal.devolucao` semeada
- [ ] 1.2 Espelhar rotas e regra de saldo em `gestao_fiscal_frontend/API.md`
- [ ] 1.3 Revisar esta proposta contra o que as etapas anteriores produziram

## 2. Domain e Data

- [ ] 2.1 DTO da devolução: documento original, itens e quantidades
- [ ] 2.2 Entidade de devolução e do saldo devolvível por item
- [ ] 2.3 Mapper Zod, com enums validados por `z.nativeEnum` (ver `AGENTS.md`)
- [ ] 2.4 Repository e caso de uso

## 3. Tela de devolução

- [ ] 3.1 Seleção de itens com quantidade, exibindo original, já devolvido e saldo
- [ ] 3.2 Campo limitado pelo saldo, com erro em PT-BR ao ultrapassar
- [ ] 3.3 Item sem saldo marcado e não selecionável
- [ ] 3.4 Atalho de devolução total, com quantidades ainda editáveis
- [ ] 3.5 Resumo antes de confirmar, com o efeito em estoque e financeiro
- [ ] 3.6 Gating por `fiscal.devolucao`

## 4. Nota sem dados fiscais

- [ ] 4.1 Detectar e explicar o caso da nota anterior ao quadro tributário
- [ ] 4.2 Resolver pelo `instanceof` do erro de domínio, nunca por texto

## 5. Rastreabilidade

- [ ] 5.1 Seção de devoluções no detalhe da nota original, com link
- [ ] 5.2 Identificação da original no documento de devolução, com link
- [ ] 5.3 Seção omitida quando não houver devoluções

## 6. Testes

- [ ] 6.1 Quantidade acima do saldo bloqueia a confirmação
- [ ] 6.2 Item sem saldo não é selecionável
- [ ] 6.3 Atalho de devolução total preenche as quantidades
- [ ] 6.4 Nota sem quadro tributário exibe a explicação certa
- [ ] 6.5 Documento sem devoluções não exibe a seção
- [ ] 6.6 `npm run verify` verde

## 7. Contexto

- [ ] 7.1 Atualizar `AGENTS.md` com o fluxo de devolução
