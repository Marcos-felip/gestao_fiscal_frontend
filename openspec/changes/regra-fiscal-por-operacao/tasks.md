## 1. Pré-requisito

- [ ] 1.1 Confirmar que a change irmã do backend está aplicada e que as permissões `fiscal.rules.*` foram semeadas (inclusive o backfill)
- [ ] 1.2 Espelhar as rotas e o contrato em `gestao_fiscal_frontend/API.md`

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
