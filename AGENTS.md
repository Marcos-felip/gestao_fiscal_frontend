# Gestão Fiscal Frontend — Instruções para Agentes

## Projeto

SaaS multi-tenant de gestão fiscal para empresas brasileiras.
Frontend: Vue 3 + TypeScript + Vite + Pinia + Tailwind CSS + Preline UI + Lucide Icons

## Repositórios

- **Backend:** `/home/marcos/Projetos/gestao_fiscal_backend/`
- **Frontend:** `/home/marcos/Projetos/gestao_fiscal_frontend/`

## Documentação obrigatória

### Frontend
- `API.md` — contratos da API REST
- `SPEC.md` — especificação completa (se existir)
- `DESIGN_SYSTEM.md` — design system (se existir)

### Backend
- `API.md` — contratos da API REST
- `REGRAS_DE_NEGOCIO.md` — regras de negócio
- `BANCO_DE_DADOS.md` — modelagem do banco
- `.github/copilot-instructions.md` — convenções de código

## Arquitetura (Clean Architecture)

```
src/
├── core/                    # Infraestrutura (não-componentes)
│   ├── client/              # HttpClient, interceptors
│   ├── either/              # Either<L, R> para tratamento de erros
│   ├── types/               # Tipos globais
│   └── utils/               # Storage, helpers
├── shared/                  # UI compartilhada
│   ├── components/          # Componentes reutilizáveis
│   └── layouts/             # Layouts de página
├── modules/                 # Módulos de feature
│   └── <feature>/
│       ├── domain/          # Entidades, modelos, interfaces
│       ├── data/            # Repositories (chamadas à API)
│       ├── application/     # Use cases (orquestradores)
│       └── presenter/       # Pages, components, controllers, schemas, stores
├── enums/                   # Enums em arquivos separados
└── router/                  # Vue Router + guards
```

## Convenções de código

### Estrutura
- **Classes** para use cases, repositories, controllers, entities, models
- **Interface** com prefixo `I` SOMENTE quando necessário (ex: `IAuthRepository`)
- **Enums** em arquivos separados em `src/enums/`
- **Zod schemas** em arquivos separados dentro de `presenter/schemas/`
- **Dados sempre tipados** — jamais `any`
- **Kebab-case** em nomes de arquivo (ex: `login-page.vue`, `auth-controller.ts`)

### Controllers
- Sempre estender `BaseController` de `presenter/controllers/base-controller.ts`
- `BaseController` provê: `loading`, `error`, `setLoading()`, `setError()`, `clearError()`, `handleEither()`
- Controllers gerenciam estado do formulário e orquestram use cases

### Either para erros
- Use `Either<AppError, T>` em repositories e use cases
- `Either.left(error)` para falhas
- `Either.right(data)` para sucesso
- Controllers usam `handleEither()` para processar resultado

### Consumo HTTP
- `HttpClient` (Axios wrapper) em `core/client/http-client.ts`
- Interceptors automáicos: headers de auth e refresh token
- Base URL: configurada via `VITE_API_URL` (default: `http://localhost:3000/api/v1`)

### Componentes Vue
- `<script setup lang="ts">` em todos os SFCs
- Classes Preline + tokens de tema (bg-primary, text-primary-foreground, etc.)
- Ícones Lucide (`import { LogIn } from 'lucide-vue-next'`)
- `changeDetection: ChangeDetectionStrategy.OnPush` (via defineOptions se necessário)

### Pinia Stores
- `defineStore('nome', () => { ... })` com Composition API
- Stores em `modules/<feature>/presenter/stores/`

## Regras de negócio críticas

1. Multi-tenant: toda requisição envia header Authorization com accessToken
2. Refresh token: interceptor faz refresh silencioso em 401
3. Permissões: OWNER > ADMIN > MEMBER
4. Force password change: se `forcePasswordChange === true`, redirecionar para troca de senha
5. Empresa ativa: `companyActiveId` no localStorage, enviado via header

## Comandos de qualidade

```bash
npm run build    # Build TypeScript + Vite
npm run dev      # Servidor de desenvolvimento
npm run format   # Prettier
```

## Agentes disponíveis

- `frontend-developer`: implementação Vue 3 + TypeScript + Preline
- `frontend-qa`: validação de componentes, fluxos e integração com API

## Skills disponíveis

- `/fullstack-contract-sync`: sincronização de contratos entre backend e frontend

## Fluxo recomendado

1. Em tarefas FE+BE, iniciar com skill `/fullstack-planning`
2. Delegar implementação para `frontend-developer`
3. Delegar validação para `frontend-qa`
4. Sincronizar contratos com backend via `/fullstack-contract-sync`