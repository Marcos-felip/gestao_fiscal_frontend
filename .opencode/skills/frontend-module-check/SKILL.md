---
name: frontend-module-check
description: Valida que um modulo Vue 3 segue a Clean Architecture completa — Entities, Responses, Mappers, DTOs, Interfaces, Repositories, Use Cases, Controllers, Schemas, Pages, Routes.
---

Voce e o validador de arquitetura de modulos do Gestao Fiscal Frontend.

Repositorio: `/home/marcos/Projetos/gestao_fiscal_frontend/`

Referencias obrigatorias:
- `/home/marcos/Projetos/gestao_fiscal_frontend/AGENTS.md`
- `/home/marcos/Projetos/gestao_fiscal_frontend/API.md`
- `/home/marcos/Projetos/gestao_fiscal_backend/REGRAS_DE_NEGOCIO.md`

---

## Protocolo de Validacao

Quando receber um nome de modulo (ex: `companies`, `products`, `partners`), execute os passos abaixo em ordem.

### Passo 1 — Verificar Estrutura de Diretorios

Para o modulo `<name>`, verifique que TODOS os arquivos existem:

```
src/modules/<name>/
├── domain/
│   ├── dto/<action>-dto.ts                (uma classe por arquivo)
│   ├── entities/<name>.entity.ts          (se aplicavel)
│   ├── responses/<name>-response.ts       (uma interface por arquivo, se aplicavel)
│   └── interfaces/i-<name>-repository.interface.ts
├── data/
│   ├── repositories/<name>-repository.ts
│   ├── mappers/<name>.mapper.ts
│   └── mappers/<name>.mapper.spec.ts      (OBRIGATORIO)
├── application/
│   └── use-cases/<action>.use-case.ts     (1 ou mais)
├── factories/
│   └── <name>.factory.ts                  (composition root — OBRIGATORIO)
└── presentation/
    ├── controllers/<name>-controller.ts
    ├── stores/<name>-store.ts              (se aplicavel)
    ├── schemas/<name>-schema.ts
    ├── pages/<name>-page.vue              (1 ou mais)
    ├── components/<name>-form.vue          (se aplicavel)
    └── routes/<name>-routes.ts
```

Para cada arquivo FALTANTE:
- Severidade: **ALTA**
- Recomendacao: Criar o arquivo faltante seguindo as convencoes de AGENTS.md

### Passo 2 — Validar Domain

#### DTO (`domain/dto/<action>-dto.ts`) — dado de ENTRADA
- [ ] UMA classe por arquivo (`login-dto.ts`, `register-dto.ts`, `refresh-token-dto.ts`)
- [ ] Classe com propriedades tipadas
- [ ] NAO tem metodos (apenas constructor)
- [ ] NAO tem `fromJson()`
- [ ] NAO importa Vue, Pinia, Router
- [ ] Exportado com `export class <Name>Dto`

#### Entity (`domain/entities/<name>.entity.ts`)
- [ ] Classe com `id` (ou campo unico de negocio)
- [ ] SEM `fromJson` — a construcao a partir do JSON e do mapper
- [ ] Pode ter getters de comportamento (`get ...():`)
- [ ] NAO importa Vue, Pinia, Router, HttpClient
- [ ] Propriedades `readonly` quando apropriado

#### Response (`domain/responses/<name>-response.ts`) — dado de SAIDA
- [ ] UMA interface por arquivo (`auth-token-response.ts`, `auth-result-response.ts`)
- [ ] `interface`/`type` de valor composto (sem `id`) e tipos agregados (`AuthResult`)
- [ ] SEM classe e SEM `fromJson` — o mapper constroi
- [ ] NAO tem getters de comportamento de negocio
- [ ] NAO e o JSON cru da API — esse formato vive no schema Zod do mapper

#### Interface (`domain/interfaces/i-<name>-repository.interface.ts`)
- [ ] Prefixo `I` no nome
- [ ] Usa DTOs nas assinaturas (tipos de entrada)
- [ ] Usa Entities/Responses nos retornos (tipos de saida)
- [ ] Retorna `Either<DomainError, T>` ou `Either<DomainError, void>`
- [ ] Importa SOMENTE de `domain/` e `@/core/either`

### Passo 3 — Validar Data

#### Repository (`data/repositories/<name>-repository.ts`)
- [ ] Implementa `I<Name>Repository`
- [ ] Usa `httpClient` importado de `@/core/client/http-client` com `<unknown>`
- [ ] Delega a traducao ao mapper via `result.flatMap(to<Name>)`
- [ ] Retorna `Either<DomainError, T>` (httpClient ja retorna Either)
- [ ] NAO conhece o formato do JSON nem tem logica de negocio

#### Mapper (`data/mappers/<name>.mapper.ts`)
- [ ] Schema Zod que valida a resposta com `safeParse`
- [ ] Constroi Entities/Responses e retorna `Either<DomainError, T>` (`left` se invalido)
- [ ] Devolve `ContractError` com `toIssueList(parsed.error)` — NUNCA `new Error(...)`
- [ ] Se for lista paginada, usa `toPage()` de `@/core/mappers/to-page`
- [ ] UNICO ponto que conhece o formato do JSON (substitui `fromJson`/`as`)

#### Teste do Mapper (`data/mappers/<name>.mapper.spec.ts`) — OBRIGATORIO
- [ ] Resposta valida → `Either.right` com a entidade construida
- [ ] Campo opcional ausente → default aplicado
- [ ] Campo com TIPO ERRADO → `Either.left(ContractError)`
- [ ] Campo obrigatorio ausente → `left` e `issues[]` cita o campo
- Severidade se faltar: **ALTA** — mapper e o unico ponto que valida o contrato da API

### Passo 4 — Validar Application

#### Use Case (`application/use-cases/<action>.use-case.ts`)
- [ ] Recebe DTO como parametro
- [ ] Delega para Repository via `this.<repo>.<method>(dto)`
- [ ] Retorna `Either<DomainError, T>`
- [ ] NAO sabe sobre Vue, Router, Pinia
- [ ] NAO faz chamadas HTTP diretamente

### Passo 5 — Validar Presenter

#### Factory (`factories/<name>.factory.ts`) — pasta propria do modulo
- [ ] Exporta `make<Name>Controller()`
- [ ] E o UNICO arquivo do modulo que importa de `data/`
- [ ] Fica FORA de `presentation/` (o ESLint proibe presentation → data)

#### Controller (`presentation/controllers/<name>-controller.ts`)
- [ ] Estende `BaseController` de `@/core/controllers/base-controller`
- [ ] Recebe os Use Cases pelo CONSTRUTOR — NAO da `new` em Repository
- [ ] Cria DTOs tipados a partir de `ref()`s
- [ ] Usa `this.handleResult(result, onSuccess, onError)`
- [ ] Interage com Store e Router no `onSuccess`
- [ ] NAO faz chamadas HTTP diretamente
- [ ] Gerencia estado com `this.setLoading()`, `this.setError()`, `this.clearError()`

#### Store (`presentation/stores/<name>-store.ts`)
- [ ] `defineStore('<name>', () => { ... })` com Composition API
- [ ] Guarda Entities/Responses tipados (NUNCA objetos sem tipo)
- [ ] Persiste em `StorageService` quando necessario

#### Schema (`presentation/schemas/<name>-schema.ts`)
- [ ] `z.object()` com validacoes
- [ ] Mensagens de erro em PT-BR
- [ ] Exporta tipo inferido: `export type <Name>FormData = z.infer<typeof <name>Schema>`

#### Component (`presentation/components/<name>-form.vue`)
- [ ] `<script setup lang="ts">`
- [ ] Valida com `safeParse()` do Zod
- [ ] Emite `submit` com dados tipados (`<Name>FormData`)
- [ ] Recebe `loading` como prop

#### Page (`presentation/pages/<name>-page.vue`)
- [ ] `<script setup lang="ts">`
- [ ] Usa `make<Name>Controller()` — NUNCA `new <Name>Controller()`
- [ ] Mostra `controller.isLoading` e `controller.errorMessage`
- [ ] Usa componentes com `@submit` conectado ao Controller

#### Routes (`presentation/routes/<name>-routes.ts`)
- [ ] Imports NO TOPO do arquivo (nunma inline `() => import(...)`)
- [ ] Usa `routeNames` para `name`
- [ ] Exporta `const <name>Routes: RouteRecordRaw[]`

### Passo 6 — Validar Enums

- [ ] Enums em `src/enums/<name>.enum.ts`
- [ ] Usam `as const` pattern
- [ ] Exportam tipo: `export type <Name> = (typeof <Name>)[keyof typeof <Name>]`

### Passo 7 — Validar Router

- [ ] `src/router/route-names.ts` tem nome da rota adicionado
- [ ] `src/router/index.ts` importa e adiciona as rotas do modulo

### Passo 8 — Validar Contratos HTTP

- [ ] URL do Repository bate com `API.md`
- [ ] DTO enviado bate com contrato (campos obrigatorios, tipos, enums)
- [ ] Schema Zod do mapper cobre TODOS os campos da resposta
- [ ] Tipos TypeScript batem com contrato (string | null onde backend retorna null)
- [ ] Paginacao: resposta `{ data, total, page, limit }` mapeada com `PaginatedResponse<T>`

### Passo 9 — Validar Regras de Negocio

- [ ] Multi-tenant: header Authorization enviado
- [ ] Multi-tenant: `companyActiveId` sincronizado Store + localStorage
- [ ] Permissoes: OWNER > ADMIN > MEMBER
- [ ] Soft delete: DELETE no frontend, backend faz exclusao logica

### Passo 10 — Validar Convencoes

- [ ] Kebab-case em nomes de arquivo
- [ ] PascalCase em classes
- [ ] Sem `any` em tipagens
- [ ] `import type { ... }` para tipos
- [ ] Sem `erasableSyntaxOnly`
- [ ] Sem `index.ts` barrel files em `modules/` (unica excecao: `src/shared/ui/index.ts`)
- [ ] Imports de alias com `@/`

### Passo 11 — Validar Fronteiras e Pipeline

- [ ] `npm run lint` passa sem erros (as fronteiras de camada estao no `eslint.config.js`)
- [ ] Nenhum `eslint-disable` de `no-restricted-imports` — se precisou, o desenho esta errado
- [ ] `npm test` passa
- [ ] `npm run build` passa
- [ ] Nenhum `Either<Error, T>` remanescente — sempre `Either<DomainError, T>`

---

## Output

Gere um relatorio com:

```
## Modulo: <name>

### Estrutura
- [x]/[ ] arquivo — problema (se houver)

### Domain
- [x]/[ ] validacao — problema (se houver)

### Data
- [x]/[ ] validacao — problema (se houver)

### Application
- [x]/[ ] validacao — problema (se houver)

### Presenter
- [x]/[ ] validacao — problema (se houver)

### Contratos HTTP
- [x]/[ ] validacao — problema (se houver)

### Regras de Negocio
- [x]/[ ] validacao — problema (se houver)

### Convencoes
- [x]/[ ] validacao — problema (se houver)

---
Total: X problemas (Y alta, Z media, W baixa)
Status: APROVADO | APROVADO COM RESSALVAS | REPROVADO
```

**Reprovado** = qualquer item de severidade alta.
**Aprovado com ressalvas** = itens de media/baixa sem alta.
**Aprovado** = todos os itens passaram.