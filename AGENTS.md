# Gestão Fiscal Frontend — Instruções para Agentes

## Projeto

SaaS multi-tenant de gestão fiscal para empresas brasileiras.
Frontend: Vue 3 + TypeScript + Vite + Pinia + Tailwind CSS 4 + Preline UI + Lucide Icons + Zod v3 + Axios

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
├── shared/                         # UI compartilhada entre módulos
│   ├── ui/                          # Componentes primitivos (Button, Input, Card)
│   │   └── README.md                # Documentação Design System
│   ├── components/                  # Componentes inteligentes (Toast, Layouts)
│   │   ├── toast/
│   │   │   └── toast-notification.vue
│   │   ├── layouts/
│   │   │   └── auth-layout.vue
│   │   └── README.md                # Documentação componentes smart
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
| **Mapper** (`mappers/<name>.mapper.ts`) | Único ponto que conhece o formato do JSON da API. Valida com schema Zod (`safeParse`) e constrói Entities/Responses do domínio. Retorna `Either<DomainError, T>` (`left` em resposta inválida). | Não faz chamadas HTTP. Não tem lógica de negócio. |

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

### `@/shared/components/` — Componentes Inteligentes

- **O que são:** Componentes com comportamento/contexto (Toast, Layouts, Filtros)
- **Objetivo:** Reutilização em múltiplos módulos com responsabilidades específicas
- **Dependências:** Pode depender de stores, services, composables
- **Lógica:** Apresentação + comportamento específico
- **Quando usar:** Em múltiplas páginas, layouts, notificações
- **Exemplo:** `import Toast from '@/shared/components/toast/toast-notification.vue'`

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

### Sem barrel files (com uma exceção)
- NÃO criar `index.ts` dentro de `modules/`. Cada arquivo tem responsabilidade única e é importado diretamente pelo caminho completo.
- **Única exceção:** `src/shared/ui/index.ts`. O kit de UI é uma biblioteca interna e esse arquivo é a sua API pública — por isso `import { Button, Input, Icon } from '@/shared/ui'` é o uso correto. Não replicar esse padrão em nenhum outro lugar.

### TypeScript
- **JAMAIS** usar `any`. Sempre tipar.
- **JAMAIS** usar `erasableSyntaxOnly` (constructor parameter properties). Declarar propriedades separadamente.
- Usar `type` para importar tipos (`import type { ... }`).

### Vue
- `<script setup lang="ts">` em TODOS os SFCs.
- Preline UI para estilização com tokens de tema (`bg-primary`, `text-primary-foreground`, etc.).
- Ícones via `<Icon name="..." />` de `@/shared/ui`. **NUNCA** importar `lucide-vue-next` direto — só o registry `shared/ui/icon/icons.ts`. Para novos ícones, registrar a chave lá.
- Textos em português brasileiro.

### Pinia
- `defineStore('nome', () => { ... })` com Composition API.
- Guardar Entities e Responses tipados, NUNCA objetos sem tipo.

---

## Tratamento de Erros — Either Pattern

### Regra absoluta
- **Repositories**: retornam `Either<DomainError, T>` usando `httpClient.get/post/patch/delete`.
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

Ao criar qualquer novo módulo (companies, products, partners, etc.), siga ESTA ORDEM:

1. **`domain/dto/`** — Criar DTOs de **entrada**, uma classe por arquivo (`login-dto.ts`, `register-dto.ts`)
2. **`domain/entities/`** — Criar Entity com métodos de comportamento (sem `fromJson`)
3. **`domain/responses/`** — Criar Responses de **saída**, uma interface por arquivo (ex: `auth-response.ts`)
4. **`domain/interfaces/`** — Criar Interface com assinaturas usando DTOs e Either
5. **`data/mappers/`** — Criar mapper com schema Zod que valida e traduz JSON → domínio (use `toPage()` se for lista paginada)
6. **`data/mappers/<name>.mapper.spec.ts`** — Testar o mapper: válido, default, tipo errado, campo ausente
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