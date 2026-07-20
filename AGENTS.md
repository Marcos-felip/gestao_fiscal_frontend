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
(pages, components,       (use cases)               (repositories)          (entities, models,
 controllers, stores)                                                        interfaces, DTOs)

  Page.vue                    LoginUseCase              AuthRepository          LoginDto
    │                              │                          │                     │
    │  dispara evento              │  orquestra               │  transforma          │  contrato
    ▼                              ▼                          ▼                     ▼
  Controller ──dto──▶ UseCase.execute(dto) ──dto──▶ Repository.method(dto)
    │                              │                          │
    │  handleResult()              │  return Either          │  httpClient.post()
    │  (loading, error)            │                          │  .map(fromJson)
    ▼                              ▼                          ▼
  AuthStore                   Either<Error, Data>       Either<Error, Response>
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
│   │   ├── http-client.ts          # Singleton Axios wrapper, retorna Either<Error, T>
│   │   └── interceptors.ts         # Auth header + refresh token on 401
│   ├── either/
│   │   └── either.ts               # Either<L, R> com map, mapLeft, fold
│   ├── types/
│   │   ├── api-error.ts            # interface ApiError { statusCode, message, error? }
│   │   └── paginated-response.ts   # interface PaginatedResponse<T> { data, total, page, limit }
│   └── utils/
│       ├── storage.ts              # StorageService (localStorage wrapper)
│       └── zod-errors.ts           # toFormErrors(ZodError) → { campo: mensagem } p/ formulários
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
│       │   ├── entities/           # ENTIDADES — classes com identidade, comportamento e fromJson()
│       │   │   └── <name>.entity.ts
│       │   ├── models/             # MODELOS — classes de valor composto com fromJson()
│       │   │   └── <name>.model.ts
│       │   ├── dto/                # DTOs — dados que trafegam entre camadas
│       │   │   └── <name>-dto.ts
│       │   └── interfaces/         # INTERFACES — contratos para repository (prefixo I)
│       │       └── i-<name>-repository.interface.ts
│       │
│       ├── data/                   # COMUNICAÇÃO COM A API
│       │   └── <name>-repository.ts  # Implementa I<Name>Repository, usa HttpClient, transforma JSON
│       │
│       ├── application/            # ORQUESTRAÇÃO
       │       └── <action>.use-case.ts  # Recebe DTO, delega para Repository, retorna Either
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
| **Entity** (`<name>.entity.ts`) | Conceito de negócio com identidade (`id`). Tem `fromJson()` factory. Pode ter métodos de comportamento (`get hasActiveCompany()`). | Não importa Vue, Pinia, Router, HttpClient. Não tem lógica de apresentação. |
| **Model** (`<name>.model.ts`) | Valor composto sem identidade própria (`AuthToken = accessToken + refreshToken`). Tem `fromJson()` factory. | Não tem comportamento de negócio. Não importa Vue. |
| **DTO** (`<name>-dto.ts`) | Dado tipado que trafega entre camadas. Classes simples com propriedades. (`LoginDto { email, password }`). | Não tem métodos. Não tem fromJson. Não importa Vue. É temporário — vive só no fluxo. |
| **Interface** (`i-<name>-repository.interface.ts`) | Contrato que o Repository implementa. Define assinaturas usando DTOs, Entities e Models. | Não tem implementação. Importa SÓ de domain (DTOs, Entities, Models, Either). |

### Data — `data/`

| Arquivo | O QUE FAZ | O QUE NÃO FAZ |
|---------|-----------|---------------|
| **Repository** (`<name>-repository.ts`) | Implementa `I<Name>Repository`. Faz chamadas HTTP via `httpClient`. Transforma resposta JSON em Entity/Model com `fromJson()`. Retorna `Either<Error, T>`. | Não orquestra múltiplos repositories. Não tem lógica de negócio. Não sabe sobre Vue. |

### Application — `application/`

| Arquivo | O QUE FAZ | O QUE NÃO FAZ |
|---------|-----------|---------------|
| **Use Case** (`<action>.use-case.ts`) | Orquestra chamadas ao repository. Recebe DTO, retorna `Either<Error, T>`. Pode chamar múltiplos repositories se necessário. | Não sabe sobre Vue, Router ou Pinia. Não faz chamadas HTTP diretamente. |

### Presentation — `presentation/`

| Arquivo | O QUE FAZ | O QUE NÃO FAZ |
|---------|-----------|---------------|
| **Controller** (`<name>-controller.ts`) | Estende `BaseController`. Cria DTOs tipados. Chama Use Cases. Processa `Either` com `handleResult()`. Gerencia estado (loading, error). Interage com Store e Router. | Não faz chamadas HTTP. Não tem lógica de negócio. |
| **Store** (`<name>-store.ts`) | Estado reativo global (Pinia). Guarda Entities e Models tipados. Persiste em `StorageService` quando necessário. | Não faz chamadas HTTP. Não chama Use Cases. |
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
- **Arquivos:** kebab-case (`auth-controller.ts`, `login-page.vue`, `auth-token.model.ts`)
- **Classes:** PascalCase (`AuthController`, `LoginUseCase`, `AuthToken`)
- **Interfaces:** PascalCase com prefixo `I` (`IAuthRepository`) — SOMENTE quando necessário
- **DTOs:** PascalCase com sufixo `Dto` (`LoginDto`, `CreateProductDto`)
- **Entities:** PascalCase com sufixo semanticamente none (`AuthUser`, `Product`, `Company`)
- **Models:** PascalCase sufixo semanticamente contextual (`AuthToken`, `PaginatedData`)
- **Schemas Zod:** camelCase variável, PascalCase tipo exportado (`loginSchema` → `LoginFormData`)
- **Enums:** PascalCase const + type (`MembershipRole`)
- **Imports de alias:** SEMPRE use `@/` (configurado no vite.config.ts)

### Sem barrel files
- NÃO criar `index.ts` em nenhuma pasta. Cada arquivo tem responsabilidade única e é importado diretamente.

### TypeScript
- **JAMAIS** usar `any`. Sempre tipar.
- **JAMAIS** usar `erasableSyntaxOnly` (constructor parameter properties). Declarar propriedades separadamente.
- Usar `type` para importar tipos (`import type { ... }`).

### Vue
- `<script setup lang="ts">` em TODOS os SFCs.
- Preline UI para estilização com tokens de tema (`bg-primary`, `text-primary-foreground`, etc.).
- Lucide Icons (`import { LogIn } from 'lucide-vue-next'`).
- Textos em português brasileiro.

### Pinia
- `defineStore('nome', () => { ... })` com Composition API.
- Guardar Entities e Models tipados, NUNCA plain objects.

---

## Tratamento de Erros — Either Pattern

### Regra absoluta
- **Repositories**: retornam `Either<Error, T>` usando `httpClient.get/post/patch/delete`.
- **Use Cases**: retornam `Either<Error, T>` (repassam ou transformam).
- **Controllers**: processam `Either` com `this.handleResult(result, onSuccess, onError)`.
- **NUNCA** usar `try/catch` em controllers para erros de API — `handleResult()` já cuida.
- **NUNCA** `throw` erros de negócio — sempre `Either.left()`.
- **NUNCA** acessar `localStorage` direto — sempre via `StorageService`. Chaves só em `core/constants/storage-keys.ts`.

#---

## Exemplo completo (referência: módulo auth)

```typescript
// 1. DTO — dado de transporte
export class LoginDto {
  email: string
  password: string
  constructor(email: string, password: string) {
    this.email = email
    this.password = password
  }
}

// 2. Entity — conceito de negócio
export class AuthUser {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: string,
    public readonly companyActiveId: string | null,
    public readonly role: string | null,
    public readonly forcePasswordChange: boolean,
  ) {}

  static fromJson(json: Record<string, unknown>): AuthUser {
    return new AuthUser(
      json.id as string,
      json.name as string,
      json.email as string,
      json.companyActiveId as string | null,
      json.role as string | null,
      json.forcePasswordChange as boolean,
    )
  }

  get hasActiveCompany(): boolean {
    return this.companyActiveId !== null
  }
}

// 3. Model — valor composto
export class AuthToken {
  constructor(
    public readonly accessToken: string,
    public readonly refreshToken: string,
  ) {}
  static fromJson(json: Record<string, unknown>): AuthToken {
    return new AuthToken(json.accessToken as string, json.refreshToken as string)
  }
}

// 4. Interface — contrato
export interface IAuthRepository {
  login(dto: LoginDto): Promise<Either<Error, { token: AuthToken; user: AuthUser }>>
}

// 5. Repository — implementação
export class AuthRepository implements IAuthRepository {
  async login(dto: LoginDto): Promise<Either<Error, { token: AuthToken; user: AuthUser }>> {
    const result = await httpClient.post<Record<string, unknown>>('/auth/login', {
      email: dto.email,
      password: dto.password,
    })
    return result.map((data) => ({
      token: AuthToken.fromJson(data),
      user: AuthUser.fromJson(data),
    }))
  }
}

// 6. Use Case — orquestração
export class LoginUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}
  async execute(dto: LoginDto): Promise<Either<Error, { token: AuthToken; user: AuthUser }>> {
    return this.authRepository.login(dto)
  }
}

// 7. Controller — presentation
export class AuthController extends BaseController {
  private readonly authRepository = new AuthRepository()
  private readonly loginUseCase = new LoginUseCase(this.authRepository)
  private readonly authStore = useAuthStore()

  readonly email = ref('')
  readonly password = ref('')

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
```

---

## Checklist para Criar um Novo Módulo

Ao criar qualquer novo módulo (companies, products, partners, etc.), siga ESTA ORDEM:

1. **`domain/dto/`** — Criar DTOs tipados para dados de entrada/saída
2. **`domain/entities/`** — Criar Entity com `fromJson()` e métodos de comportamento
3. **`domain/models/`** — Criar Models para valores compostos (se necessário)
4. **`domain/interfaces/`** — Criar Interface com assinaturas usando DTOs e Either
5. **`data/`** — Criar Repository implementando a Interface, usando HttpClient
6. **`application/use-cases/`** — Criar Use Cases que recebem DTO e chamam Repository
7. **`presentation/schemas/`** — Criar Zod schemas para validação de formulário
8. **`presentation/controllers/`** — Criar Controller estendendo BaseController
9. **`presentation/stores/`** — Criar Pinia store se necessário (estado reativo global)
10. **`presentation/components/`** — Criar componentes de formulário com Zod
11. **`presentation/pages/`** — Criar páginas que conectam tudo
12. **`presentation/routes/`** — Criar rotas com imports no topo
13. **`enums/`** — Criar enums em arquivos separados no diretório raiz `src/enums/`
14. **`router/route-names.ts`** — Adicionar nome da rota como const
15. **`router/index.ts`** — Importar e adicionar rotas do módulo

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
npm run build     # Build TypeScript + Vite — DEVE passar sem erros
npm run dev       # Servidor de desenvolvimento
npm run format    # Prettier
```

---

## Agentes Disponíveis

- `frontend-developer`: implementação Vue 3 + TypeScript seguindo Clean Architecture
- `frontend-qa`: validação de componentes, fluxos, contratos e regras de negócio

## Skills Disponíveis

- `/frontend-module-check`: validação de que um módulo segue a arquitetura e convenções