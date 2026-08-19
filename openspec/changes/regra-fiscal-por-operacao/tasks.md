> ⏸ **ADIADA em 12/08/2026.** O escopo virou **NFC-e e NF-e dentro do estado**.
> Sem venda interestadual, a operação praticamente não varia — o mesmo produto tem
> a mesma resposta no balcão e na venda para outra empresa da mesma UF. Quando a
> operação não varia, o cadastro do produto é o lugar certo da resposta.
>
> **O que já foi entregue e fica:** a porta `IRegraFiscal`, a
> `CadastroDoProdutoRule`, `montarItens` perguntando à porta e a regra aplicada
> gravada no snapshot. É a costura, e ela vale em qualquer cenário.
>
> **O que fica em espera:** modelo de regras, resolvedor, CRUD e conjunto base
> (seções 3, 4 e 6). As decisões da seção 0 param junto: sem interestadual não há
> DIFAL a confirmar nem matriz multi-UF a orçar.
>
> **O que reabre:** venda para fora do estado, a devolução da etapa 5, ou produto
> cuja resposta dependa do comprador dentro da mesma UF. Ver `ROADMAP_FISCAL.md`.

> ⚠️ **Revisada em 12/08/2026** — ver o aviso no `proposal.md`. O cadastro de
> regras é tela de configuração, não fluxo do lojista. Isso muda onde ela aparece
> e como a empresa começa.

## 1. Pré-requisito

- [ ] 1.1 Confirmar que a change irmã do backend está aplicada e que as permissões `fiscal.rules.*` foram semeadas (inclusive o backfill)
- [ ] 1.2 Espelhar as rotas e o contrato em `gestao_fiscal_frontend/API.md`
- [ ] 1.3 Confirmar o escopo resultante das decisões da seção 0 da change do backend — assinar ou construir a matriz, e se o DIFAL é devido. As duas mudam quais campos a regra tem.

## 1b. Onde a tela vive

- [ ] 1b.1 Manter o cadastro de regras **fora** da navegação do usuário comum — acessível pela configuração fiscal, não pelo menu principal
- [ ] 1b.2 Empresa nova parte do conjunto base aplicado no onboarding, não de uma lista vazia
- [ ] 1b.3 Texto de apoio na tela deixando claro que os valores vêm do contador — a interface não deve sugerir que o lojista escolha MVA ou redução de base

## 2. Módulo `fiscal-rules`

- [ ] 2.1 `domain/` — entidade da regra, DTOs de criação e edição
- [ ] 2.2 `data/mappers/` — mapper Zod, com situação tributária validada por `z.nativeEnum` (ver `AGENTS.md`)
- [ ] 2.3 `data/repositories/` — CRUD e simulação
- [ ] 2.4 `application/use-cases/` — listar, criar, editar, remover e simular
- [ ] 2.5 `factories/` — composition root do módulo

## 3. Interface de cadastro

- [ ] 3.1 Página de listagem com paginação no envelope `{ data, total, page, limit }`
- [ ] 3.2 Formulário separando **critérios** de **resultado**, em `FormSection` distintas
- [ ] 3.3 Rota e item de navegação gated por `fiscal.rules.read`
- [ ] 3.4 Ações de escrita gated por `fiscal.rules.edit`, com a tela em modo leitura quando faltar

## 4. Simulador

- [ ] 4.1 Tela de simulação: escolher produto e montar a operação
- [ ] 4.2 Exibir o quadro resultante e a regra aplicada
- [ ] 4.3 Deixar explícito quando nenhuma regra casou e o resultado veio do produto

## 5. Documento fiscal

- [ ] 5.1 Detalhe do documento passa a exibir a origem do quadro por item
- [ ] 5.2 Tolerar documento antigo, sem essa informação no snapshot, sem quebrar a tela

## 6. Conflito de regras

- [ ] 6.1 Tratar o erro de empate por `instanceof` de `DomainError`, nunca por texto
- [ ] 6.2 Exibir as regras em conflito com link para edição

## 7. Testes

- [ ] 7.1 Mapper: payload válido, campo ausente e enum desconhecido → `ContractError`
- [ ] 7.2 Gating: sem permissão de leitura a rota não abre; sem a de escrita a tela fica somente leitura
- [ ] 7.3 Simulação sem regra casada exibe a origem correta
- [ ] 7.4 Documento antigo sem origem do quadro não quebra o detalhe
- [ ] 7.5 `npm run verify` verde

## 8. Contexto

- [ ] 8.1 Atualizar `AGENTS.md` com o módulo novo e as permissões
