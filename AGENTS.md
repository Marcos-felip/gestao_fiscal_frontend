# Gestão Fiscal Frontend — Instruções para Agentes

## Projeto

SaaS multi-tenant de gestão fiscal para empresas brasileiras.
Frontend: Vue 3 + TypeScript + Vite + Pinia + Tailwind CSS 4 + Preline UI + Lucide Icons + motion-v + Zod v3 + Axios

## Repositórios

- **Frontend:** `/home/marcos/Projetos/gestao_fiscal_frontend/`
- **Backend:** `/home/marcos/Projetos/gestao_fiscal_backend/`

## Documentação obrigatória

### Frontend
- `API.md` — contratos da API REST (endpoints, DTOs, enums, erros)
- `AGENTS.md` — este arquivo (arquitetura e convenções)

### Backend (referência cruzada)
- `/home/marcos/Projetos/gestao_fiscal_backend/API.md`
- `/home/marcos/Projetos/gestao_fiscal_backend/REGRAS_DE_NEGOCIO.md`

---

## Arquitetura Clean Architecture — Fluxo de Dados Obrigatório

TODOS os módulos DEVEM seguir este fluxo de dados. Nunca pule camadas.

```
PRESENTATION              APPLICATION               DATA                    DOMAIN
(pages, components,       (use cases)               (repositories,          (entities, responses,
 controllers, stores)                                mappers)                interfaces, DTOs)

  Page.vue                    LoginUseCase              AuthRepository          LoginDto
    │                              │                          │                     │
    │  dispara evento              │  orquestra               │  transforma          │  contrato
    ▼                              ▼                          ▼                     ▼
  Controller ──dto──▶ UseCase.execute(dto) ──dto──▶ Repository.method(dto)
    │                              │                          │
    │  handleResult()              │  return Either          │  httpClient.post()
    │  (loading, error)            │                          │  .flatMap(mapper)
    ▼                              ▼                          ▼
  AuthStore                   Either<DomainError, Data>       Either<DomainError, Response>
```

### Regra de ouro

1. **Nunca** a Page acessa Repository ou HttpClient diretamente.
2. **Nunca** o UseCase sabe sobre Vue, Pinia, Router ou HTTP.
3. **Nunca** o Repository sabe sobre Vue, Pinia, Router ou UseCase — só HttpClient e Domain.
4. **Sempre** o fluxo é: Page → Controller → UseCase → Repository → HttpClient.
5. **Erros SEMPRE** sobem como `Either.left()`, nunca como `throw` ou `try/catch`.
6. **Sucesso SEMPRE** sobem como `Either.right()`, processados no Controller via `handleResult()`.

---

## Estrutura de Diretórios Obrigatória

```
src/
├── core/                          # Infraestrutura (NUNCA depende de módulos)
│   ├── constants/
│   │   └── storage-keys.ts         # StorageKeys — chaves do localStorage (fonte única)
│   ├── controllers/
│   │   └── base-controller.ts      # Classe abstrata com loading, error, handleResult, router
│   ├── client/
│   │   ├── http-client.ts          # Singleton Axios wrapper, retorna Either<DomainError, T>
│   │   ├── http-error-mapper.ts    # toDomainError(unknown) — ÚNICO ponto que conhece o Axios
│   │   └── interceptors.ts         # Auth header + refresh token on 401
│   ├── either/
│   │   └── either.ts               # Either<L, R> com map, flatMap, mapLeft, fold
│   ├── errors/                     # HIERARQUIA DE ERROS — um por arquivo
│   │   ├── domain-error.ts         # Abstrata. Todo erro do Either herda dela
│   │   ├── network-error.ts        # Sem resposta (offline, timeout)
│   │   ├── unauthorized-error.ts   # 401
│   │   ├── forbidden-error.ts      # 403
│   │   ├── not-found-error.ts      # 404
│   │   ├── validation-error.ts     # 400/422 — carrega `details[]`
│   │   ├── server-error.ts         # 5xx — carrega `statusCode`
│   │   ├── contract-error.ts       # Zod falhou = BUG NOSSO, nunca do usuário
│   │   └── unexpected-error.ts     # Fallback
│   ├── mappers/
│   │   └── to-page.ts              # toPage(...) — fábrica de mappers paginados
│   ├── types/
│   │   ├── api-error.ts            # interface ApiError { statusCode, message, error? }
│   │   └── paginated-response.ts   # interface PaginatedResponse<T> { data, total, page, limit }
│   └── utils/
│       ├── storage.ts              # StorageService (localStorage wrapper)
│       └── zod-errors.ts           # toFormErrors() p/ formulários, toIssueList() p/ ContractError
│
├── enums/                          # Enums em arquivos SEPARADOS
│   ├── membership-role.enum.ts     # export const MembershipRole = {...} as const
│   ├── company-type.enum.ts
│   └── ...                         # UM ARQUIVO POR ENUM
│
├── shared/                         # UI e utilidades compartilhadas entre módulos
│   ├── ui/                          # Componentes primitivos (Button, Input, Card)
│   │   └── README.md                # Documentação Design System
│   ├── components/                  # Componentes inteligentes (Toast, Layouts, Dialog)
│   │   ├── toast/
│   │   │   └── toast-notification.vue
│   │   ├── layouts/
│   │   │   └── auth-layout.vue
│   │   ├── dialog/
│   │   │   └── confirm-dialog.vue    # Modal de confirmação reutilizável
│   │   └── README.md                # Documentação componentes smart
│   ├── composables/                 # TODO composable Vue mora aqui (useSidebar, usePermissions, ...)
│   │   └── index.ts                 # Barrel: import via `@/shared/composables`
│
├── modules/                         # MÓDULOS DE FEATURE (1 módulo = 1 domínio)
│   └── <feature>/                   # ex: auth, companies, products, partners, purchases, stock
│       ├── domain/                  # CONTRATOS E TIPOS DO DOMÍNIO
│       │   ├── entities/           # ENTIDADES — classes com identidade e comportamento (sem fromJson)
│       │   │   └── <name>.entity.ts
│       │   ├── responses/          # RESPONSES — dados de SAÍDA do domínio (ex: AuthToken, AuthResponse)
│       │   │   └── <name>-response.ts    # uma interface por arquivo
│       │   ├── dto/                # DTOs — dados de ENTRADA que trafegam entre camadas
│       │   │   └── <action>-dto.ts       # uma classe por arquivo (login-dto.ts, register-dto.ts)
│       │   └── interfaces/         # INTERFACES — contratos para repository (prefixo I)
│       │       └── i-<name>-repository.interface.ts
│       │
│       ├── data/                   # COMUNICAÇÃO COM A API
│       │   ├── repositories/       # REPOSITORIES — implementam a interface, usam HttpClient
│       │   │   └── <name>-repository.ts
│       │   └── mappers/            # MAPPERS — schema Zod que valida e traduz JSON → domínio
│       │       ├── <name>.mapper.ts
│       │       └── <name>.mapper.spec.ts
│       │
│       ├── application/            # ORQUESTRAÇÃO
       │       └── <action>.use-case.ts  # Recebe DTO, delega para Repository, retorna Either
│       │
│       ├── factories/             # COMPOSITION ROOT — única porta autorizada para data/
│       │   └── <feature>.factory.ts   # make<Feature>Controller()
│       │
│       └── presentation/            # CAMADA VUE (O QUE O USUÁRIO VÊ)
│           ├── controllers/
│           │   └── <name>-controller.ts    # Estende BaseController, orquestra UC + Store + Router
│           ├── stores/
│           │   └── <name>-store.ts         # Pinia store com defineStore composition API
│           ├── schemas/
│           │   └── <name>-schema.ts         # Zod schemas + tipos inferidos
│           ├── pages/
│           │   └── <name>-page.vue         # SFC que monta controller e conecta formulario
│           ├── components/
│           │   └── <name>-form.vue          # SFC de formulario com validacao Zod
│           └── routes/
│               └── <name>-routes.ts          # RouteRecordRaw[] com imports no topo
│
└── router/
    ├── index.ts                     # Compose routes from modules
    ├── route-names.ts               # export const routeNames = { ... } as const
    └── guards/
        ├── auth-guard.ts            # Redireciona para /login se nao autenticado
        └── guest-guard.ts           # Redireciona para /dashboard se ja autenticado
```

---

## Responsabilidades de Cada Arquivo — O QUE FAZ E O QUE NÃO FAZ

### Domain — `domain/`

| Arquivo | O QUE FAZ | O QUE NÃO FAZ |
|---------|-----------|---------------|
| **Entity** (`<name>.entity.ts`) | Conceito de negócio com identidade (`id`) e comportamento (`get hasActiveCompany()`). Construída pelo mapper. | Não tem `fromJson` (mapeamento é do mapper). Não importa Vue, Pinia, Router, HttpClient. |
| **Response** (`<name>-response.ts`) | Dado de **saída** do domínio: valor composto sem identidade (`AuthToken`) e agregados (`AuthResponse`). `interface`/`type`, sem classe. **Uma interface por arquivo.** | Não tem comportamento nem mapeamento. Não importa Vue. Não é o JSON cru da API (isso é o schema Zod do mapper). |
| **DTO** (`<action>-dto.ts`) | Dado de **entrada** que trafega entre camadas. Classes simples com propriedades (`LoginDto { email, password }`). **Uma classe por arquivo.** | Não tem métodos. Não tem fromJson. Não importa Vue. É temporário — vive só no fluxo. |
| **Interface** (`i-<name>-repository.interface.ts`) | Contrato que o Repository implementa. Define assinaturas usando DTOs (entrada), Entities e Responses (saída). | Não tem implementação. Importa SÓ de domain (DTOs, Entities, Responses, Either). |

### Data — `data/`

| Arquivo | O QUE FAZ | O QUE NÃO FAZ |
|---------|-----------|---------------|
| **Repository** (`repositories/<name>-repository.ts`) | Implementa `I<Name>Repository`. Faz chamadas HTTP via `httpClient` (`post<unknown>`). Traduz a resposta com `result.flatMap(mapper)`. Retorna `Either<DomainError, T>`. | Não conhece o formato do JSON (é do mapper). Não orquestra múltiplos repositories. Não sabe sobre Vue. |
| **Mapper** (`mappers/<name>.mapper.ts`) | Único ponto que conhece o formato do JSON da API. Valida com schema Zod (`safeParse`) e constrói Entities/Responses do domínio. Retorna `Either<DomainError, T>` (`left` em resposta inválida). | Não faz chamadas HTTP. Não tem lógica de negócio. **Não usa `as` para enum** nem `.default()` para campo que a API não envia — os dois transformam contrato quebrado em silêncio. Ver [Enums no mapper](#enums-no-mapper--znativeenum-nunca-as). |

### Application — `application/`

| Arquivo | O QUE FAZ | O QUE NÃO FAZ |
|---------|-----------|---------------|
| **Use Case** (`<action>.use-case.ts`) | Orquestra chamadas ao repository. Recebe DTO, retorna `Either<DomainError, T>`. Pode chamar múltiplos repositories se necessário. | Não sabe sobre Vue, Router ou Pinia. Não faz chamadas HTTP diretamente. |

### Presentation — `presentation/`

| Arquivo | O QUE FAZ | O QUE NÃO FAZ |
|---------|-----------|---------------|
| **Controller** (`<name>-controller.ts`) | Estende `BaseController`. Cria DTOs tipados. Chama Use Cases. Processa `Either` com `handleResult()`. Gerencia estado (loading, error). Interage com Store e Router. | Não faz chamadas HTTP. Não tem lógica de negócio. |
| **Store** (`<name>-store.ts`) | Estado reativo global (Pinia). Guarda Entities e Responses tipados. Persiste em `StorageService` quando necessário. | Não faz chamadas HTTP. Não chama Use Cases. |
| **Schema** (`<name>-schema.ts`) | Validação de formulário com Zod. Define `z.object()` e exporta tipo inferido. | Não faz chamadas. Não importa Vue. |
| **Page** (`<name>-page.vue`) | Instancia Controller. Conecta formulário ao Controller. Mostra loading/error feedback. | Não chama Use Cases diretamente. Não faz chamadas HTTP. |
| **Component** (`<name>-form.vue`) | Formulário com Zod validation. Emite evento `submit` com dados tipados. | Não chama Controller. Não sabe sobre Use Cases. |
| **Routes** (`<name>-routes.ts`) | Define `RouteRecordRaw[]`. Imports no topo do arquivo (NÃO inline). Usa `routeNames`. | Não tem lógica de negócio. |

---

## UI vs Components — Distinção Crítica

### `@/shared/ui/` — Componentes Primitivos

- **O que são:** Wrappers leves do Preline (Button, Input, Card)
- **Objetivo:** Reutilização extrema, customização, manutenção centralizada
- **Dependências:** Apenas Preline, Tailwind, Vue
- **Lógica:** ZERO — apenas apresentação
- **Quando usar:** Em formulários, listas, cards, headers
- **Exemplo:** `import { ButtonUi, InputUi, CardUi } from '@/shared/ui'`
- **Disponíveis (destaques):** `Button`, `Input` (repassa `maxlength`/`inputmode`/`id` ao `<input>` real; slots `#prefix`/`#suffix`), `PasswordInput`, `Select` (campos de enum, API igual à do Input), `Tooltip` (dica por hover/foco), `Card`, `Icon`, `Span`, `Badge`, `Switch`, `Spinner`, `Skeleton`. Utilitários de máscara/validação BR em `@/shared/ui/utils/masks` (`formatCnpj`, `formatCep`, `formatPhone`, `onlyDigits`, `isValidCnpj`).

### `@/shared/components/` — Componentes Inteligentes

- **O que são:** Componentes com comportamento/contexto (Toast, Layouts, Filtros)
- **Objetivo:** Reutilização em múltiplos módulos com responsabilidades específicas
- **Dependências:** Pode depender de stores, services, composables
- **Lógica:** Apresentação + comportamento específico
- **Quando usar:** Em múltiplas páginas, layouts, notificações
- **Exemplo:** `import Toast from '@/shared/components/toast/toast-notification.vue'`
- **Disponíveis:** `toast/`, `layouts/`, `navbar/`, `sidebar/`, `dialog/confirm-dialog.vue` (modal de confirmação reutilizável — usado, ex., no logout), `form/form-section.vue` (seção de formulário em Card com ícone/título/descrição — usada no form de empresa).

### Decisão: UI vs Component

```mermaid
stateDiagram-v2
    [*] --> Pergunta
    Pergunta --> Primitivo?{É um primitivo\nPreline?}
    Primitivo? -->|Sim| UI{Reutilizável?}
    UI -->|Sim| UI_Folder["src/shared/ui/<nome>/"] 
    UI -->|Não| Module_UI["modules/<feature>/"] 
    Primitivo? -->|Não| Inteligente{Comportamento?}
    Inteligente -->|Sim| Inteligente_Reutilizavel{Múltiplos\nmódulos?}
    Inteligente_Reutilizavel -->|Sim| Component_Folder["src/shared/components/<tipo>/<nome>/"]
    Inteligente_Reutilizavel -->|Não| Module_Component["modules/<feature>/presentation/components/"]
    Inteligente -->|Não| [*]
    UI_Folder --> [*]
    Module_UI --> [*]
    Module_Component --> [*]
    Component_Folder --> [*]
```

---

## Convenções de Código — REGRAS OBRIGATÓRIAS

### Nomenclatura
- **Arquivos:** kebab-case (`auth-controller.ts`, `login-page.vue`, `login-dto.ts`, `auth.mapper.ts`)
- **Classes:** PascalCase (`AuthController`, `LoginUseCase`, `AuthToken`)
- **Interfaces:** PascalCase com prefixo `I` (`IAuthRepository`) — SOMENTE quando necessário
- **DTOs:** PascalCase com sufixo `Dto` (`LoginDto`, `CreateProductDto`) — arquivo `<action>-dto.ts`, **uma classe por arquivo**
- **Entities:** PascalCase com sufixo semanticamente none (`AuthUser`, `Product`, `Company`)
- **Responses:** PascalCase para valores compostos e agregados (`AuthToken`, `AuthResponse`) — arquivo `<name>-response.ts`, **uma interface por arquivo**
- **Mappers:** função `to<Nome>` no arquivo `<name>.mapper.ts` (`toAuthResponse`)
- **Schemas Zod:** camelCase variável, PascalCase tipo exportado (`loginSchema` → `LoginFormData`)
- **Enums:** PascalCase const + type (`MembershipRole`)
- **Imports de alias:** SEMPRE use `@/` (configurado no vite.config.ts)

### Sem barrel files (com duas exceções)
- NÃO criar `index.ts` dentro de `modules/`. Cada arquivo tem responsabilidade única e é importado diretamente pelo caminho completo.
- **Exceções (bibliotecas internas com API pública):** `src/shared/ui/index.ts` (`import { Button, Input, Icon } from '@/shared/ui'`) e `src/shared/composables/index.ts` (`import { useToast, usePermissions } from '@/shared/composables'`). Não replicar esse padrão em nenhum outro lugar.

### Composables
- **TODO composable (`useXxx`) vive em `src/shared/composables/`** — inclusive os específicos de um módulo (ex.: `usePermissions`, `useOnboardingContext`). **NÃO** criar pasta `composables/` dentro de `modules/`. Um composable em `shared/` pode importar stores/tipos de um módulo (`@/modules/...`) — a fronteira só é restrita *dentro* de `modules/**`.
- **Stores Pinia (`useXxxStore`) NÃO são composables** — ficam em `presentation/stores/` do módulo (ex.: `usePermissionsStore`, `useCompaniesStore`).

### TypeScript
- **JAMAIS** usar `any`. Sempre tipar.
- **JAMAIS** usar `erasableSyntaxOnly` (constructor parameter properties). Declarar propriedades separadamente.
- Usar `type` para importar tipos (`import type { ... }`).

### Vue
- `<script setup lang="ts">` em TODOS os SFCs.
- Preline UI para estilização com tokens de tema (`bg-primary`, `text-primary-foreground`, etc.).
- Ícones via `<Icon name="..." />` de `@/shared/ui` (resolve qualquer ícone do Lucide pelo nome, ex: `name="Users"`). **NUNCA** importar `lucide-vue-next` direto nas telas — sempre pelo `<Icon>`.
- Textos em português brasileiro.

### Pinia
- `defineStore('nome', () => { ... })` com Composition API.
- Guardar Entities e Responses tipados, NUNCA objetos sem tipo.

### Design System e Motion
- **Direção visual:** editorial-tech — display com caráter nos títulos/marca, corpo legível, muito respiro, um acento azul.
- **Tipografia:** `--font-display` (Space Grotesk) aplicada automaticamente a `h1/h2/h3` e à classe `.font-display` (marca, números de destaque); `--font-sans` (Inter) no corpo. Use `.tabular-nums` em colunas de dados fiscais.
- **Tokens semânticos** (definidos em `theme.css`, expostos ao Tailwind no `@theme inline` de `style.css`): `bg-background`, `bg-muted`/`text-muted-foreground`, `bg-primary`/`text-primary-foreground`, `bg-destructive`/`text-destructive-foreground`, `border-line-1..4`, `ring`. **Toda utility de cor precisa de um `--color-*` no `@theme`** — no Tailwind 4, classe sem token é silenciosamente ignorada.
- **Elevação:** `.ui-shadow-soft` e `.ui-shadow-float` (nunca sombras avulsas). Raio padrão `--radius`.
- **Dark mode:** alterna o atributo `data-theme="dark"` no `<html>` (via `useNavbar().toggleDarkMode`). `theme.css` chaveia por `[data-theme='dark']` — nunca use `data-hs-theme-switch`.
- **Animação — `motion-v`:**
  - `<MotionConfig>` no `App.vue` define a transição padrão e respeita `prefers-reduced-motion`.
  - Componentes `motion.*` (ex: `motion.button`, `motion.div`) para `initial/animate/variants/whileHover/whilePress`.
  - **Springs** (`{ type: 'spring', stiffness, damping }`) para interação; `--ease-out-quart` para tweens de CSS.
  - Listas entram em **stagger** (`staggerChildren`); o item ativo da sidebar usa **`layoutId`** para deslizar entre posições.
  - Sempre importe `motion` de `motion-v` manualmente (sem auto-import).
- **Movimento com propósito:** uma sequência de entrada bem dirigida vale mais que vinte micro-hovers aleatórios. Nunca imponha movimento a quem pediu `prefers-reduced-motion`.
- **Loading e feedback:**
  - **Barra de progresso global** no topo: `useProgress()` (`@/shared/composables`) com `start()`/`done()`/`track(promise)`. Já ligada ao router; envolva requests com `progress.track(...)`. Renderizada por `ProgressBar` no `App.vue`.
  - **Botão:** `:loading` mostra o `Spinner` (herda a cor do texto); use `loading-text` para trocar o rótulo (ex: `Entrando…`).
  - **Skeleton** (`@/shared/ui`): prefira skeleton a spinner central ao carregar dados de tela. Tamanho/raio via utilities (`<Skeleton class="h-4 w-24 rounded" />`).
  - **Toast** de sucesso/erro: `useToast()` (`@/shared/composables`) com `.success()`/`.error()`/`.info()` — encapsula o evento escutado por `ToastNotification` no `App.vue`.
- **Formulários:** agrupe campos por assunto em `FormSection` (Card com ícone/título). Use `Select` para enums, `Tooltip` (ícone `HelpCircle`) para ajuda contextual, `maxlength`/`inputmode` e as máscaras de `@/shared/ui/utils/masks` aplicadas no `@update:model-value`. Validação client-side com `safeParse` + `toFormErrors` (padrão dos forms de auth, empresa e estabelecimentos). Barra de ações fixa embaixo via `FormActionBar` (`@/shared/components/form`): botão secundário (`secondary-label` + evento `secondary`) + submit (`type="submit"`, dispara o `@submit` do form pai). Com `show-status` + `:dirty` funciona como "save bar" — só aparece (com transição) quando há alterações não salvas; sem `show-status` fica sempre visível (fluxos de criar/editar). NÃO reimplemente essa barra por form.
- **Endereço:** UF via `Select` com `brazilianStateOptions` (`@/core/constants/brazilian-states`). Autopreenchimento por CEP com `fetchAddressByCep` (`@/core/services/via-cep`, API pública ViaCEP) — dispare no `@update:model-value` do CEP (não em `watch`, para não sobrescrever dados carregados na edição).
- **Datas:** use o `DatePicker` (`@/shared/ui`) — calendário próprio com motion-v e tokens do tema; **nunca** `<input type="date">` nativo (feio e fora do design system). API espelha `Input`/`Select` (slot `#label`, `error`, `hint`, `disabled`), `align="start"|"end"` e `min`/`max` (formato `aaaa-MM-dd`, útil para faixas De/Até). O `modelValue` é `aaaa-MM-dd` (mesmo do input nativo), então combina direto com `dateInputToIso`/`isoToDateInput` de `@/core/utils/date`. Emite `''` ao limpar; para reagir à mudança sem `v-model`, escute `@update:model-value`.
- **CRUD em lista:** há duas variantes de listagem, ambas com criar/editar em **página separada** (`/new`, `/:id/edit`) reusando `FormSection` e exclusão com `ConfirmDialog`. (1) **Cards** (grade) — referência: `establishments`. (2) **Tabela + busca/paginação** para catálogos grandes com envelope paginado (`{data,total,page,limit}`) — referência: `partners` e `products`, com `SearchInput` (debounce 400ms), paginação no controller (`goToPage`, recua página ao esvaziar) e gating por permissão nas ações da linha (editar/ver/excluir). Em `products`, a tabela ainda destaca **estoque baixo** (`Product.isLowStock`, `currentStock ≤ minStock`) e o form tem seção de **atributos técnicos** (pares chave/valor → JSON `technicalAttributes`); preços/estoque são `Decimal` que chegam como **string** no JSON — o mapper coage para número (`toNumber`) e o form usa `parseDecimal`/`formatMoney`. Não há edição de `isActive` na UI (o `GET /products` só lista ativos, então expor o toggle esconderia o item sem forma de recuperá-lo).
- **Estoque (razão):** o módulo `stock` não tem CRUD — é um **livro-razão** append-only (`GET /stock/movements` + `POST /stock/movements`). A página lista movimentações com **badge direcional** (`ENTRADA` ↑ verde, `SAIDA` ↓ vermelho, `AJUSTE` = âmbar), quantidade com sinal/cor, e filtros por tipo e produto. Registro via **modal** (`stock-movement-dialog`) reusando o catálogo de produtos (o `StockController` injeta `ListProductsUseCase` — composição no factory). Efeitos no backend: ENTRADA soma, SAIDA subtrai (não pode negativar), AJUSTE define o valor absoluto — a dica do modal explica cada caso. Gating `stock.list`/`stock.create`.
- **Compras (ciclo de vida):** o módulo `purchases` é orientado a **documento com status** (`DRAFT → CONFIRMED | CANCELLED`). Três telas: **lista** (tabela, filtros status + intervalo de datas, linha clicável → detalhe), **criação** (`/purchases/new` com editor de itens — linhas produto+qtd+preço, prefill do preço de custo ao escolher o produto, **total recalculado ao vivo**) e **detalhe** (`/purchases/:id`, não `/edit`). Regras do backend refletidas na UI: **edição só de metadados** (fornecedor/observações/data) e **só em DRAFT** — os itens são imutáveis após criar; **Confirmar** (`POST /:id/confirm`, dá entrada no estoque) e **Cancelar** (`POST /:id/cancel`, estorna se confirmada) são endpoints próprios com `ConfirmDialog`; **excluir** só em DRAFT/CANCELADA. Ações gated por permissão **e** status (`purchases.confirm`/`cancel`/`delete`/`edit`). O factory injeta os catálogos de `products`, `partners` (fornecedores = tipo ≠ CLIENT) e `establishments` para os seletores; datas trafegam via `@/core/utils/date` (`dateInputToIso`/`isoToDateInput`). Valores monetários seguem o padrão de `products` (`Decimal` string → `toNumber`; `parseDecimal`/`formatMoney`).
- **Vendas / PDV (venda de balcão):** o módulo `sales` separa **três eixos de status** (comercial `SaleStatus` ORCAMENTO→EM_ABERTO→CONCLUIDA|CANCELADA; pagamento `PaymentStatus`; fiscal `FiscalStatus`, cada um em `src/enums`). A **lista** (`/vendas`, tabela + filtros status/datas) e o **detalhe** (`/vendas/:id`, com Finalizar/Cancelar/Excluir gated por permissão **e** status) vivem no `AppLayout`; o **PDV** (`/pdv`) é uma **rota imersiva fora do AppLayout** (`sale-form.vue`) com barra do operador, busca de produto, carrinho ao vivo, atalhos de teclado (F1 ajuda, F2 buscar, F4 finalizar, F6 orçamento, F8 cancelar), tela cheia (`useFullscreen`) e **cancelamento com autorização de supervisor** (`supervisor-auth-dialog` → `POST /auth/authorize`) quando o operador não tem `sales.cancel`. Todo o catálogo do PDV vem de **uma** chamada `GET /sales/context` (gated `sales.create`, evita exigir `establishments.list`/`partners.list` do vendedor). **Condição de pagamento:** bloco à vista × a prazo — a prazo abre parcelas + 1º vencimento + intervalo (dias) + forma prevista, enviados no `confirm` (`paymentCondition`/`installments`/`firstDueDate`/`intervalDays`); à vista quita na hora, a prazo gera N títulos a receber no backend. **Checkout (finalizar à vista):** o `sale-payment-dialog.vue` (compartilhado entre PDV e detalhe) coleta **múltiplas formas de pagamento** (`payments: [{method, amount, amountReceived?}]`, dividido — parte PIX, parte dinheiro) com "restante a pagar" ao vivo e **troco** no dinheiro (`amountReceived` → `changeGiven`); a soma tem que fechar o total (tolerância de 1 centavo, validada também no backend). `POST /sales` (create+confirm) **e** `POST /sales/:id/confirm` (finalizar orçamento) recebem `payments`; a venda volta com `payments: SalePayment[]` (decimais como string → `toNumber`). A prazo ignora `payments`. `Decimal` string → `toNumber`; `parseDecimal`/`formatMoney`.
- **Contas a receber (títulos):** o módulo `receivables` (`/contas-a-receber`, rótulo "Contas a receber") lista **títulos** — que no backend são `FinancialEntry` do tipo `RECEBER`. Cada parcela de uma venda a prazo (ou um título avulso) é uma linha. Status `FinancialStatus` **ABERTO/PARCIAL/PAGO/CANCELADO** (o `VENCIDO` do enum **nunca é persistido** — o atraso vem no booleano derivado `isOverdue`; por isso o filtro de vencidos usa `overdue=true`, não `status=VENCIDO`). Três telas/ações: **lista** (tabela, filtros status + "só vencidos" + intervalo de vencimento, envelope paginado `{data,total,page,limit}`), **detalhe** (`/contas-a-receber/:id`, cartões Total/Recebido/Saldo + histórico de baixas) e **baixa parcial** (`POST /:id/pay` com valor ≤ saldo, via `pay-receivable-dialog`) / **cancelar** (`POST /:id/cancel`, sem body, bloqueado se houver baixa). **Título avulso** via `create-receivable-dialog` (`POST /receivables`, devolve as parcelas geradas como **array cru** → `toReceivableArray`). Getters da entidade: `balance` (amount − paidAmount), `canPay`/`canCancel` refletem as regras. Gating `receivables.list/read/create/pay/cancel`. `Decimal` string → `toNumber`.
- **Contas a pagar (títulos):** o módulo `payables` (`/contas-a-pagar`) espelha `receivables` no lado da compra — títulos são `FinancialEntry` do tipo `PAGAR`. Cada parcela de uma **compra a prazo** (ou título avulso) é uma linha; mesmos status **ABERTO/PARCIAL/PAGO/CANCELADO** + `isOverdue` derivado (filtro de vencidos `overdue=true`). **Lista** (filtros status + "só vencidos" + intervalo de vencimento, envelope `{data,total,page,limit}`), **detalhe** (`/contas-a-pagar/:id`, cartões Total/Pago/Saldo + histórico de pagamentos), **baixa parcial** (`POST /:id/pay`, via `pay-payable-dialog`) e **cancelar** (`POST /:id/cancel`, bloqueado se houver pagamento). **Título avulso** via `create-payable-dialog` (`POST /payables`, devolve as parcelas como array cru → `toPayableArray`). Relações achatam `partner {id,name}` (fornecedor) e `purchase {id,purchaseNumber}`. **Condição de pagamento na compra:** o form de compra ganhou uma seção **Pagamento** (à vista × a prazo com parcelas/1º vencimento/intervalo, enviados no create); ao **confirmar** a compra a prazo o backend gera os títulos a pagar (à vista não gera). Gating `payables.list/read/create/pay/cancel`. `Decimal` string → `toNumber`.
- **Caixa (terminal + sessão):** o módulo `cash` reúne **caixas** (terminais cadastrados) e **sessões** (abertura→fechamento), pois um depende do outro. **Cadastro de caixas** (`/caixas`, dialog CRUD `cash-register-dialog` sobre `Modal`, `GET/POST/PATCH/DELETE /cash-registers` — lista é **array cru**, não paginada) com `isActive` (caixa inativo não abre sessão); o seletor de estabelecimento vem do módulo `establishments` via adapter na factory (`makeEstablishmentOptionsLoader`, `{id,name}` — cruzamento de módulo só na `factories/`). **Sessão** tem `status` ABERTA/FECHADA (`src/enums/cash-session-status`), `openingAmount` (fundo), `expectedCash`/`countedCash`/`difference` e um **`summary`** calculado. ⚠️ **Serialização mista:** os decimais do **topo** da sessão vêm como **string** (`toNumber`/`toNumberOrNull`), mas os campos do **`summary` já são number** — não recoaja. **PDV exige caixa aberto:** o `sale-form-page` consulta `GET /cash-sessions/current` (pode devolver **null** → `toCashSessionOrNull`); sem sessão renderiza o `open-cash-session-panel` (escolhe caixa + fundo, `POST /cash-sessions/open`), com sessão renderiza o PDV. Finalizar venda **à vista** sem caixa aberto o backend rejeita (`400 "Abra um caixa…"`) — o servidor carimba `sale.cashSessionId`. Na barra do operador, um **Dropdown do caixa** faz **suprimento**/**sangria** (`POST /:id/movements`, `CashMovementType` SANGRIA/SUPRIMENTO, valor sempre positivo) e **fechar** (`close-cash-session-dialog`, `POST /:id/close`). **Conferência é só de dinheiro:** `expectedCash = fundo + vendas em dinheiro + suprimentos − sangrias`; cartão/PIX entram no `paymentBreakdown` só como informação; `difference = contado − esperado` e o backend **exige `notes` quando há diferença** (o dialog torna a observação obrigatória ao vivo). **Fechamento às cegas** (`Company.cashBlindClose`): com a sessão aberta o `summary` devolve `null` em esperado/vendas/breakdown e `blind:true` — o `cash-session-summary-card` mascara esses valores até fechar. Ao fechar, navega ao **relatório** (`/sessoes-de-caixa/:id`). **Histórico** em `/sessoes-de-caixa` (paginado, filtros status/caixa/datas). Gating `cash-registers.list/create/read/edit/delete` e `cash.open/close/movement/list/read`.
- **Fiscal (MVP NFC-e, Fase A+B):** o módulo `fiscal` cobre **configuração fiscal do estabelecimento**, **documentos fiscais** e **emissão de NFC-e a partir da venda**, consumindo `/api/v1/fiscal/**`. **Configuração** (`/configuracao-fiscal`): lista os estabelecimentos com sua `FiscalSettings` (`GET /fiscal/settings` traz os configurados com `establishment{id,name,type}`; os não configurados vêm do módulo `establishments` via loader na factory), edita em `Modal` (`GET/POST/PATCH /fiscal/settings/:establishmentId` — o GET por estabelecimento pode devolver **null com 200** → modo criar) com ambiente/série/próximo número/CSC/idCSC; gerência do **certificado A1** (upload `.pfx`+senha via **multipart**, status/validade/titular, alerta ≤30 dias/vencido, substituição e histórico), **teste de comunicação com a SEFAZ** (`POST /fiscal/settings/:id/sefaz-status`) e badge de **saúde do motor** (`GET /fiscal/engine/health`). **Documentos** (`/documentos-fiscais` + `/:id`): lista paginada com envelope **`{data,total,page,limit}`** (mapper deriva `totalPages`/`hasNext`) e filtros status/modelo/estabelecimento/período; detalhe full-width com chave/protocolo/datas, **snapshot** (itens/pagamentos, tolerando forma rica ou enxuta), `statusHistory[]` e `events[]`, e **download do XML** (`GET /:id/xml/:tipo`, `:tipo ∈ enviado|autorizado|cancelamento` — vem **string crua** → `Blob`). **Emissão** disparada no **detalhe da venda** (`POST /fiscal/documents/nfce {saleId}`, gated `fiscal.emit`) — mas o **backend auto-emite** na confirmação da venda (evento `sale.confirmed`), então o botão manual é **fallback** para `NAO_EMITIDO`; a resposta é `PENDENTE` e a UI faz **polling** (3s, limite 20, para em estado terminal, cleanup no `onUnmounted`) via `GET /fiscal/documents/sale/:saleId` (null com 200) e `GET /:id`; erro 400 de config/produto incompleto é exibido (`DomainError.isUserFacing`). **Enums** (`src/enums`): `fiscal-document-model` (NFE/NFCE), `fiscal-environment`, `fiscal-document-status` (**10 valores** + `fiscalDocumentStatusTones`), `fiscal-status` (o **status fiscal da venda**, **5 valores** + tones — distinto do documento), `tax-regime-code` (CRT) e `fiscal-payment-code` (tPag). **Gotchas:** `valorTotal`/alíquotas são `Decimal` **string** → `toNumber`; badges por token sólido. **Cross-module:** produto ganhou seção fiscal no form (NCM/CEST/CFOP/origem/CSOSN/CST/alíquotas) + indicador `fiscalComplete` + filtro de pendências client-side; a venda mostra badge de status fiscal (lista e detalhe) + link ao documento. Gating `fiscal.settings.read/edit`, `fiscal.read`, `fiscal.emit` (o backend semeia só no template **ADMIN**; OWNER sempre passa). **Fase B (implementada):** no detalhe do documento há **cancelamento** (justificativa 15–255 → `POST /:id/cancel`), **consulta** SEFAZ (`/:id/consulta`), **reprocessar** (`/:id/retry` com polling), **baixar DANFE** (`GET /:id/danfe` → **PDF stream/blob**) e **QR Code** (campo `qrCode`); a central de rejeições é a lista filtrada por `status=REJEITADO` com retry por linha. **Empresa fiscal** editável (`PATCH /companies/:id` — CRT/IE/IM/IBGE/contribuinte ICMS/tel/e-mail) com indicador `fiscalConfigComplete`; **CSOSN/CST do produto** restritos ao conjunto aceito pelo motor (`src/enums/fiscal-tax-situation.enum`). **Exportação de XMLs em lote (etapa 0 do roteiro fiscal):** botão "Exportar XMLs" no cabeçalho de `/documentos-fiscais` (gated `fiscal.read`) abre modal com período (atalhos **mês passado**/**mês atual**), estabelecimento, modelo e ambiente → `GET /fiscal/documents/xml/export` devolve **ZIP em stream** (`responseType: 'blob'`, **sem mapper** — não é JSON). **Gotcha nº 1:** as datas vão como `aaaa-MM-dd` cru do `<input type="date">`, **sem** `dateInputToIso` — o backend lê data sem hora como o dia inteiro, e mandar ISO com hora deixaria as notas do último dia fora do fechamento. **Gotcha nº 2:** o nome do arquivo é montado no cliente porque `Content-Disposition` não está em `Access-Control-Expose-Headers`. O estado de carregamento é próprio (`exporting`), não o da lista, e o erro fica em `exportError` para o modal continuar aberto com o preenchimento; os limites do backend (92 dias, 5.000 documentos) chegam como `ValidationError` e a mensagem é exibida como veio, decidida por `isUserFacing`. Download disparado por `triggerFileDownload` (`core/utils/download.ts`), o mesmo do XML individual e da DANFE. Falha em resposta binária é desembrulhada no interceptor (`unwrapBlobError`): sem isso o corpo do erro chega como `Blob` e todo `400` viraria "Dados inválidos.". **Fora do MVP (Fase C, no backend):** separação/checklist de produção e auditoria de série/CSC/ambiente — a UI seguirá o que o backend expuser.
- **Contexto de empresa (multi-tenant):** o tenant é resolvido **no servidor** a partir de `user.companyActiveId` (não por header) — trocar de empresa é `PATCH /users/active-company { companyId }` e depois **recarregar permissões + dados** (sem refresh de token). O `companiesStore` (Pinia, espelha o `permissionsStore`) guarda as empresas do usuário (`GET /companies`, array simples) e deriva `activeCompany`/`hasMultiple`/`needsOnboarding` a partir do `companyActiveId` da sessão; é carregado nos mesmos 3 pontos (login em `AuthController`, boot em `main.ts`, limpo no logout). O **seletor de empresa** (`navbar/company-switcher.vue`, na navbar — tone light sobre o fundo primário) usa o `CompanySwitcherController` (injeta `SetActiveCompanyUseCase` do módulo `account`): ao trocar, atualiza o `authStore`, recarrega `permissionsStore` + `companiesStore` e navega ao dashboard. Só vira dropdown quando `hasMultiple`.
- **Onboarding (configuração inicial):** o registro **não cria empresa** — usuário novo nasce com `companyActiveId` nulo. O fluxo: `POST /companies` cria empresa + membership OWNER + define como ativa; `POST /companies/onboarding` (só OWNER, empresa ativa não configurada) grava CNPJ/regime e cria o estabelecimento **MATRIZ**. A tela `onboarding-page.vue` (rota standalone `/onboarding`, fora do `AppLayout`) cobre os dois estados num só formulário: **cria a empresa se não houver** (nome/tipo) e depois **configura** (CNPJ, regime, telefone, matriz + endereço com autofill de CEP). O `OnboardingController` orquestra create→onboard, atualizando `authStore` e recarregando os stores. O gating é o `onboarding-guard.ts` (registrado antes do `permission-guard`): se autenticado e `companiesStore.needsOnboarding`, redireciona a `/onboarding`; se já configurada e na rota de onboarding, volta ao dashboard. CNPJ segue a convenção do app (enviado **mascarado**; `cpf-cnpj-validator` aceita).
- **Empresa ⇄ Sede (matriz):** no backend, **empresa** (PJ) e **matriz** (estabelecimento sede) são entidades separadas que compartilham CNPJ + Inscrição Estadual e nascem juntas no onboarding. Para evitar dois formulários confusos e divergência de dados, a **página de Empresa absorve a sede**: além das seções da PJ, tem a seção **"Sede / Matriz"** (endereço + inscrição municipal). No `save`, o controller faz **dois PATCH** (`/companies/:id` e `/establishments/:matrizId`) e **propaga CNPJ/IE da empresa para a matriz** (fonte única). A composição vive em `companies.factory.ts`, que injeta `ListEstablishmentsUseCase` + `UpdateEstablishmentUseCase` de estabelecimentos no `CompanyController` (permitido: `factories/` é o único ponto sem restrição de import). Consequência: o **módulo `establishments` cuida só de FILIAIS** — o form tem tipo fixo `FILIAL` (matriz gerida em Empresa), a lista mostra as filiais + um **card "Sede" read-only** que leva a `/companies`, e acessar a URL de edição da matriz redireciona para Empresa.
- **Autorização (papel + permissão):** duas camadas — **papel** (`MembershipRole` OWNER/ADMIN/MEMBER, em `src/enums`) para ações estruturais e **permissão granular** `dominio.acao` para CRUDs. Fonte no front: `GET /permissions/me` → `usePermissionsStore` (Pinia, `codes: Set`) carregado no login (`AuthController`), no reload (`main.ts`) e limpo no logout. Consuma via `usePermissions()` (`@/shared/composables`): `can(code)`, `canAny`, `isAtLeast(role)`, `role`, `isOwner` (OWNER sempre passa). Rotas protegem com `meta.requiresPermission` / `meta.requiresRole` (guard `permission-guard.ts` → redireciona a `FORBIDDEN`); o sidebar (`sidebar-nav.vue`) esconde itens sem acesso. Hierarquia de atribuição: `assignableRoles(ator)` (nunca OWNER, nunca acima do próprio).
- **Usuários e Permissões:** módulo `memberships` (rótulo "Usuários", rota `/users`) lista membros e **cadastra** via `POST /users` (cria user + membership de forma atômica e mostra a **senha provisória** uma única vez). Gating por permissão + hierarquia (`assertCanManageMember`: não se gerencia papel superior ao seu; OWNER protegido): **editar** (`users.edit` → `PATCH /users/:id`) e **remover** (`users.delete` → `DELETE /memberships/:id`) valem para OWNER/ADMIN; **alterar papel** segue **OWNER-only** (`PATCH /memberships/:id/role`). O acesso do MEMBER é definido **exclusivamente por perfis** (ver abaixo) — não há tela de matriz por papel: o baseline do MEMBER é **vazio** no backend, então "sem perfil = sem acesso". OWNER/ADMIN têm acesso amplo e fixo. Permissões são **por empresa**.
- **Perfis de permissão (grupos):** no módulo `permissions`, um **perfil** é um conjunto nomeado de permissões, **por empresa**, e é a **única** forma de conceder acesso a um MEMBER (efetivas do MEMBER = união dos perfis vinculados). CRUD em `/permission-profiles` (`ProfilesController` + `profile-form-dialog.vue` com seletor de permissões agrupado por domínio) e **vínculo** N-N a membros via `PUT /memberships/:id/profiles` (`MemberProfilesController` + `assign-profiles-dialog.vue`, acionado no menu da linha em Usuários). Só se aplica a **MEMBER** (OWNER/ADMIN já têm acesso amplo). Tudo gated por `permissions.manage` (padrão OWNER+ADMIN) + hierarquia. O `GET /memberships` já devolve `profiles: [{id,name}]` de cada membro (chips na lista). Perfil é config, não dado de negócio: `DELETE` é **físico** e desvincula por cascade. O módulo `permissions` ainda expõe `GET /permissions/me` (permissões efetivas → `usePermissionsStore`) e `GET /permissions` (catálogo agrupado, usado pelo seletor do perfil).
- **Gating de permissão na UI (regra padrão de todo CRUD):** _esconde o que não leva a lugar nenhum; desabilita e explica o que dá pra ver mas não pode fazer._ Concretamente: **sem ler** (`x.list`/`x.read`) → esconder link da sidebar (`permission` no `NavLink`) + `meta.requiresPermission` na rota (guard → `FORBIDDEN`); **sem criar** (`x.create`) → esconder o botão "Novo…"; **sem editar** (`x.edit`) → tela abre em **somente leitura** (campos dentro de `<fieldset :disabled>`, `FormActionBar` escondido, `ReadOnlyNotice` no topo — `@/shared/components/permission/read-only-notice.vue`), e em lista o ícone de editar vira **Ver** (olho) ou some; **sem excluir** (`x.delete`) → esconder a ação. `Input`/`Select` já respeitam `<fieldset disabled>` via CSS (`disabled:` variants), então basta um fieldset por form. Rota de detalhe/edição costuma exigir `x.read` (não `x.edit`) para permitir a visualização read-only. Aplicado em Usuários, Perfis, Estabelecimentos e Empresa.
- **Senha no 1º acesso:** usuário criado por admin nasce com `forcePasswordChange`; o `login()` redireciona para `/change-password` e o `force-password-guard.ts` trava a navegação até a troca (`POST /auth/change-password-first-login`).
- **Modal genérico:** `src/shared/components/dialog/modal.vue` (Teleport + motion-v, slot default + `#footer`, prop `size` `sm|md|lg`) para formulários em diálogo (ex.: cadastro de usuário, perfil de permissão). Para confirmação destrutiva continue usando o `ConfirmDialog`.
- **Shell / Navbar:** header na **cor sólida da marca** (`--color-primary`) com duas linhas — breadcrumb (`NavbarBreadcrumb`, derivado de `useNavigation().breadcrumbs`) + ações à direita, e uma faixa de **abas** por página (`NavbarTabs`). Botões da navbar usam `NavbarButton` com `tone="light"` sobre o fundo escuro. A busca é um **ícone** que abre o `SearchModal` (não há mais barra de busca fixa).
- **Abas de páginas (`useTabs`):** cada rota com `meta: { title, icon }` vira uma aba; a lista persiste em `localStorage` e a aba "Início" é fixa. Ao criar uma página navegável, adicione `meta.title` (rótulo da aba) e `meta.icon` (nome Lucide) na rota. Aba ativa = rota atual; fechar (`✕`) navega para a vizinha.

---

## Tratamento de Erros — Either Pattern

### Regra absoluta
- **Repositories**: retornam `Either<DomainError, T>` usando `httpClient.get/post/patch/put/delete`.
- **Use Cases**: retornam `Either<DomainError, T>` (repassam ou transformam).
- **Controllers**: processam `Either` com `this.handleResult(result, onSuccess, onError)`.
- **NUNCA** usar `try/catch` em controllers para erros de API — `handleResult()` já cuida.
- **NUNCA** `throw` erros de negócio — sempre `Either.left()`.
- **NUNCA** usar `Error` cru no `Either`. Sempre uma subclasse de `DomainError`.
- **NUNCA** acessar `localStorage` direto — sempre via `StorageService`. Chaves só em `core/constants/storage-keys.ts`.

### Hierarquia de erros — `core/errors/`

Todo erro que trafega no `Either` herda de `DomainError`, que expõe `isUserFacing`:

| Erro | Quando | `isUserFacing` |
|------|--------|----------------|
| `NetworkError` | Requisição sem resposta (offline, timeout) | `true` |
| `UnauthorizedError` | HTTP 401 | `true` |
| `ForbiddenError` | HTTP 403 (OWNER > ADMIN > MEMBER) | `true` |
| `NotFoundError` | HTTP 404 | `true` |
| `ValidationError` | HTTP 400/422 — carrega `details[]` | `true` |
| `ServerError` | HTTP 5xx — carrega `statusCode` | `false` |
| `ContractError` | Schema Zod do mapper falhou — carrega `issues[]` | `false` |
| `UnexpectedError` | Não se encaixa em nada acima | `false` |

**Por que `isUserFacing` importa:** `handleResult()` exibe a mensagem crua quando é `true`. Quando é `false`, o usuário vê um texto genérico e o erro real vai para o console (ponto de integração com telemetria). Um `ContractError` significa que o contrato com o backend quebrou — é bug nosso, não erro do usuário, e jamais deve virar "e-mail ou senha inválidos" na tela.

Quem traduz HTTP → `DomainError` é `core/client/http-error-mapper.ts`. É o **único** arquivo do projeto que conhece o Axios como fonte de erro. As camadas de cima decidem comportamento por `instanceof`, **nunca** inspecionando a string da mensagem.

---

## Enums no mapper — `z.nativeEnum`, nunca `as`

**Regra:** campo de enum no schema do mapper usa `z.nativeEnum(MeuEnum)`. `z.string()` seguido de `as MeuEnum` é proibido.

```typescript
// ERRADO — o schema aceita qualquer texto e o cast só mente para o compilador
const schema = z.object({ crt: z.string().nullable().default(null) })
new Company(..., value.crt as TaxRegimeCode | null, ...)

// CERTO — valor desconhecido vira ContractError
const schema = z.object({ crt: z.nativeEnum(TaxRegimeCode).nullable().default(null) })
new Company(..., value.crt, ...)
```

**Por quê.** `as` é apagado na compilação: não valida nada em tempo de execução. Um valor que o frontend não conhece atravessa o mapper, chega na entidade e some na tela — `Select` em branco, badge sem cor, filtro que não casa — **sem erro nenhum**. É a mesma família do `.default(null)` sobre campo que a API não envia: transforma contrato quebrado em silêncio. O mapper é o único lugar que conhece o JSON da API; se ele não conferir, ninguém confere.

Isso mordeu de verdade: o CRT entrava como `z.string()` + `as TaxRegimeCode`, e um regime desconhecido renderizava o campo vazio na tela de Empresa sem sinal de erro.

**Duas exceções legítimas:**

1. **Não existe enum equivalente em `src/core/enums`** — mantenha `z.string()` e deixe a entidade expor texto livre. É o caso de `businessSegment` no `company.mapper.ts`.
2. **O campo não é enum** — `snapshot as FiscalSnapshot | null` é objeto estruturado, não conjunto fechado de valores. Não se aplica.

**Importe o enum como valor, não como tipo:** `z.nativeEnum` precisa do objeto em runtime, então `import { X }` e não `import type { X }`.

### Estado atual — a regra ainda não vale em todo o código

Auditoria de 11/08/2026 comparando `src/core/enums` com os enums do Prisma: **os 23 enums são idênticos dos dois lados, sem divergência**. Ou seja, apertar os mappers restantes é seguro — nenhum passaria a recusar valor que o backend realmente manda.

Já seguem a regra: `company.mapper.ts` (`type`, `taxRegime`, `crt`).

Ainda usam `as` e devem migrar quando o arquivo for tocado — `cash-session`, `establishment`, `fiscal-consulta`, `fiscal-document`, `fiscal-production`, `fiscal-settings`, `membership`, `partner`, `payable`, `product`, `purchase`, `receivable`, `sale`, `sale-context`.

---

## Injeção de Dependência — `factories/<feature>.factory.ts`

O Controller **não** dá `new` em Repository. Ele recebe os Use Cases prontos pelo construtor:

```typescript
// modules/auth/factories/auth.factory.ts — composition root do módulo
export function makeAuthController(): AuthController {
  const authRepository = new AuthRepository()

  return new AuthController(
    new LoginUseCase(authRepository),
    new RegisterUseCase(authRepository),
    new LogoutUseCase(authRepository),
  )
}
```

```typescript
// pages/login-page.vue
const controller = makeAuthController()   // nunca `new AuthController()`
```

**Por quê:** sem isso a `I<Name>Repository` é decorativa — ela existe mas nada é desacoplado, e o Controller vira intestável (toda chamada bate na rede). Com a factory, testes injetam dublês.

A factory fica em `<feature>/factories/`, fora de `presentation/`. O ESLint proíbe **qualquer** arquivo do módulo fora de `factories/` de importar `data/` — essa pasta é a única porta autorizada.

---

## Paginação — `toPage()`

Não repita o envelope `{ data, total, page, limit }` em cada mapper. Informe só o schema do item e como construir a entidade:

```typescript
const productSchema = z.object({ id: z.string(), name: z.string() })

export const toProductPage = toPage(
  'products',
  productSchema,
  (p) => new Product(p.id, p.name),
)
```

Devolve `Either<DomainError, PaginatedResponse<T>>`, com `ContractError` quando o envelope ou qualquer item quebrar.

---

## Exemplo completo (referência: módulo auth)

```typescript
// 1. DTO — dado de entrada — domain/dto/login-dto.ts (uma classe por arquivo)
export class LoginDto {
  email: string
  password: string
  constructor(email: string, password: string) {
    this.email = email
    this.password = password
  }
}

// 2. Entity — conceito de negócio (sem fromJson; construída pelo mapper)
export class AuthUser {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: string,
    public readonly companyActiveId: string | null,
    public readonly role: string | null,
    public readonly forcePasswordChange: boolean,
  ) {}

  get hasActiveCompany(): boolean {
    return this.companyActiveId !== null
  }
}

// 3. Responses — dado de saída do domínio (sem classe, sem fromJson) — um por arquivo
// domain/responses/auth-token-response.ts
export interface AuthToken {
  accessToken: string
  refreshToken: string
}
// domain/responses/auth-response.ts — NÃO importa a entidade: os campos são declarados à mão
export interface AuthResponse {
  token: AuthToken
  user: {
    id: string
    name: string
    email: string
    companyActiveId: string | null
    role: string | null
    forcePasswordChange: boolean
    hasActiveCompany: boolean
  }
}

// 4. Interface — contrato
export interface IAuthRepository {
  login(dto: LoginDto): Promise<Either<DomainError, AuthResponse>>
}

// 5. Mapper — valida (Zod) e traduz JSON → domínio (único que conhece o formato)
// O schema reflete o JSON REAL da API: tokens no topo e o usuário aninhado em `user`.
const authResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    companyActiveId: z.string().nullable().default(null),
    role: z.string().nullable().default(null),
    forcePasswordChange: z.boolean().default(false),
  }),
})

export function toAuthResponse(data: unknown): Either<DomainError, AuthResponse> {
  const parsed = authResponseSchema.safeParse(data)
  if (!parsed.success) {
    // ContractError = bug nosso, isUserFacing: false. Nunca `new Error(...)` cru.
    return Either.left(new ContractError('auth', toIssueList(parsed.error)))
  }
  const v = parsed.data
  return Either.right({
    token: { accessToken: v.accessToken, refreshToken: v.refreshToken },
    user: new AuthUser(
      v.user.id,
      v.user.name,
      v.user.email,
      v.user.companyActiveId,
      v.user.role,
      v.user.forcePasswordChange,
    ),
  })
}

// 6. Repository — implementação (não conhece o JSON, delega ao mapper)
export class AuthRepository implements IAuthRepository {
  async login(dto: LoginDto): Promise<Either<DomainError, AuthResponse>> {
    const result = await httpClient.post<unknown>('/auth/login', {
      email: dto.email,
      password: dto.password,
    })
    return result.flatMap(toAuthResponse)
  }
}

// 7. Use Case — orquestração
export class LoginUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}
  async execute(dto: LoginDto): Promise<Either<DomainError, AuthResponse>> {
    return this.authRepository.login(dto)
  }
}

// 8. Controller — presentation. Recebe os Use Cases prontos; NUNCA dá `new` em Repository.
export class AuthController extends BaseController {
  private readonly loginUseCase: LoginUseCase
  private readonly authStore = useAuthStore()

  readonly email = ref('')
  readonly password = ref('')

  constructor(loginUseCase: LoginUseCase) {
    super()
    this.loginUseCase = loginUseCase
  }

  async login(): Promise<void> {
    this.setLoading(true)
    const dto = new LoginDto(this.email.value, this.password.value)
    const result = await this.loginUseCase.execute(dto)
    this.handleResult(result, ({ token, user }) => {
      this.authStore.setToken(token)
      this.authStore.setUser(user)
      this.router.push({ name: routeNames.DASHBOARD })
    })
    this.setLoading(false)
  }
}

// 9. Factory — composition root, em factories/auth.factory.ts
export function makeAuthController(): AuthController {
  const authRepository = new AuthRepository()
  return new AuthController(new LoginUseCase(authRepository))
}

// 10. Page — <script setup lang="ts">
const controller = makeAuthController()   // nunca `new AuthController()`
```

---

## Checklist para Criar um Novo Módulo

> **Módulos sem backend próprio** (ex: `dashboard`, `errors`) podem ter apenas `presentation/` (pages + routes + components) — não crie `domain/`, `data/` e `application/` vazios só para cumprir a estrutura; isso seria código morto. As camadas entram quando existir contrato de API real. As rotas do módulo são compostas em `router/index.ts` (ex: `dashboardRoutes` como filhas do `AppLayout`; `errorRoutes` no nível raiz, com o catch-all `/:pathMatch(.*)*` do 404 **sempre por último**). As telas de status (403/404/500/502) vivem em `modules/errors/` e reaproveitam o componente `error-view.vue`.

Ao criar qualquer novo módulo (companies, products, partners, etc.) COM backend, siga ESTA ORDEM:

1. **`domain/dto/`** — Criar DTOs de **entrada**, uma classe por arquivo (`login-dto.ts`, `register-dto.ts`)
2. **`domain/entities/`** — Criar Entity com métodos de comportamento (sem `fromJson`)
3. **`domain/responses/`** — Criar Responses de **saída**, uma interface por arquivo (ex: `auth-response.ts`)
4. **`domain/interfaces/`** — Criar Interface com assinaturas usando DTOs e Either
5. **`data/mappers/`** — Criar mapper com schema Zod que valida e traduz JSON → domínio (use `toPage()` se for lista paginada). Campo de enum com [`z.nativeEnum`](#enums-no-mapper--znativeenum-nunca-as), nunca `z.string()` + `as`
6. **`data/mappers/<name>.mapper.spec.ts`** — Testar o mapper: válido, default, tipo errado, campo ausente, **valor de enum desconhecido → `ContractError`**
7. **`data/repositories/`** — Criar Repository implementando a Interface, delegando ao mapper via `flatMap`
8. **`application/use-cases/`** — Criar Use Cases que recebem DTO e chamam Repository
9. **`presentation/schemas/`** — Criar Zod schemas para validação de formulário
10. **`presentation/controllers/`** — Criar Controller estendendo BaseController, recebendo Use Cases pelo construtor
11. **`factories/<feature>.factory.ts`** — Criar o composition root (`make<Feature>Controller()`) em `factories/`
12. **`presentation/stores/`** — Criar Pinia store se necessário (estado reativo global)
13. **`presentation/components/`** — Criar componentes de formulário com Zod
14. **`presentation/pages/`** — Criar páginas que chamam `make<Feature>Controller()` (nunca `new`)
15. **`presentation/routes/`** — Criar rotas com imports no topo
16. **`enums/`** — Criar enums em arquivos separados no diretório raiz `src/enums/`
17. **`router/route-names.ts`** — Adicionar nome da rota como const
18. **`router/index.ts`** — Importar e adicionar rotas do módulo
19. **`npm run verify`** — lint + testes + build devem passar antes do commit

---

## Regras de Negócio Críticas

1. **Multi-tenant:** Toda requisição envia `Authorization: Bearer <accessToken>`
2. **Refresh token:** Interceptor faz refresh silencioso em 401 (1 tentativa)
3. **Empresa ativa:** `companyActiveId` no localStorage + header `X-Company-Id`
4. **Permissões:** OWNER > ADMIN > MEMBER
5. **Force password change:** Se `forcePasswordChange === true`, redirecionar para troca de senha
6. **Paginação:** Resposta sempre `{ data: T[], total, page, limit }`
7. **Erros da API:** Formato `{ statusCode, message, error }` — usar `message` para feedback

---

## Comandos de Qualidade

```bash
npm run verify        # lint + testes + build — rode ANTES de commitar
npm run lint          # ESLint (inclui as fronteiras de camada)
npm run lint:fix      # ESLint com correção automática
npm test              # Vitest (uma passagem)
npm run test:watch    # Vitest em modo watch
npm run test:coverage # Cobertura
npm run build         # Typecheck (vue-tsc) + bundle Vite
npm run dev           # Servidor de desenvolvimento
npm run format        # Prettier
npm run format:check  # Prettier em modo verificação (usado no CI)
```

O mesmo pipeline roda no CI (`.github/workflows/ci.yml`) em todo push e PR para `develop`/`main`.

---

## Fronteiras de Camada — garantidas pelo ESLint

As regras de arquitetura **não são de confiança**: estão em `eslint.config.js` com `no-restricted-imports` e quebram o build.

| Camada | Não pode importar |
|--------|-------------------|
| `domain/` | vue, vue-router, pinia, axios, e `data/`, `application/`, `presentation/` |
| `application/` | vue, vue-router, pinia, axios, e `data/`, `presentation/` |
| `data/` | vue, vue-router, pinia, e `presentation/` |
| `presentation/` | `data/` — use `factories/<feature>.factory.ts` |
| qualquer outro arquivo do módulo | `data/` — só `factories/` tem essa porta |

`factories/` é intencionalmente irrestrita: é o único lugar autorizado a costurar `data/` com `application/` e `presentation/`.

Arquivos `*.spec.ts` são isentos (precisam montar cenários atravessando camadas).

Se você precisa violar uma dessas regras, o desenho está errado — não adicione `eslint-disable`.

---

## Testes

- **Runner:** Vitest (`vitest.config.ts`), ambiente `happy-dom`, alias `@/` configurado.
- **Localização:** ao lado do arquivo testado, com sufixo `.spec.ts` (`auth.mapper.ts` → `auth.mapper.spec.ts`).
- **Prioridade:** mappers primeiro. São o único ponto que valida o contrato com a API — um mapper sem teste é o maior risco do projeto.

Todo mapper novo deve cobrir, no mínimo:

1. Resposta válida → `Either.right` com a entidade construída
2. Campo opcional ausente → default aplicado
3. Campo com **tipo errado** → `Either.left(ContractError)`
4. Campo obrigatório ausente → `Either.left` e `issues[]` citando o campo

O caso 3 é o que justifica o mapper existir: antes dos schemas Zod, um `as boolean` engolia contrato quebrado em silêncio.

Controllers são testáveis injetando dublês dos Use Cases — é para isso que serve a factory.

---

## Agentes Disponíveis

- `frontend-developer`: implementação Vue 3 + TypeScript seguindo Clean Architecture
- `frontend-qa`: validação de componentes, fluxos, contratos e regras de negócio

## Skills Disponíveis

- `/frontend-module-check`: validação de que um módulo segue a arquitetura e convenções