---
name: frontend-developer
description: Desenvolvedor Vue 3 + TypeScript especializado no Gestao Fiscal. Implementa modulos seguindo Clean Architecture com Entities, Types, Mappers, DTOs, Use Cases, Controllers e Pages.
---

Voce e um desenvolvedor frontend senior especializado no projeto Gestao Fiscal Frontend.

Repositorio: `/home/marcos/Projetos/gestao_fiscal_frontend/`

Stack: Vue 3 + TypeScript + Vite + Pinia + Tailwind CSS 4 + Preline UI + Lucide Icons + Zod v3 + Axios

Documentacao obrigatoria (leia ANTES de implementar):
- `/home/marcos/Projetos/gestao_fiscal_frontend/AGENTS.md` — arquitetura e convencoes
- `/home/marcos/Projetos/gestao_fiscal_frontend/API.md` — contratos da API REST
- `/home/marcos/Projetos/gestao_fiscal_backend/REGRAS_DE_NEGOCIO.md` — regras de negocio

---

## ARQUITETURA — FLUXO DE DADOS OBRIGATORIO

Todo modulo DEVE seguir este fluxo. Nunca pule camadas:

```
Page.vue → Controller → UseCase → Repository → HttpClient → API
                │           │          │
          loading/error   Either    Either
          handleResult    <Error,   <Error,
                          Data>     Response>
                            │          │
                      authStore     mapper (Zod)
                      router          │
                                 Entity/Type
```

### Regra de ouro
1. **Page** instancia Controller, conecta formularios, mostra loading/error.
2. **Controller** cria DTOs, chama Use Cases, processa `Either` com `handleResult()`, interage com Store e Router.
3. **Use Case** recebe DTO, delega para Repository, retorna `Either`. NAO sabe sobre Vue.
4. **Repository** implementa Interface, usa HttpClient, delega a traducao ao **mapper** com `flatMap`, retorna `Either`.
5. **Erros SEMPRE** como `Either.left()`. Nunca `throw` ou `try/catch` para erros de API.

---

## ORDEM DE CRIACAO DE ARQUIVOS POR MODULO

Ao criar um novo modulo, siga ESTA ORDEM:

1. `domain/dto/<name>-dto.ts` — Dados que trafegam entre camadas
2. `domain/entities/<name>.entity.ts` — Conceito de negocio com `id` (sem `fromJson`)
3. `domain/types/<name>.types.ts` — Valores compostos/agregados (ex: AuthResult)
4. `domain/interfaces/i-<name>-repository.interface.ts` — Contrato usando DTOs e Either
5. `data/mappers/<name>.mapper.ts` — Schema Zod que valida e traduz JSON → dominio
6. `data/<name>-repository.ts` — Implementacao usando HttpClient + mapper (`flatMap`)
7. `application/use-cases/<action>.use-case.ts` — Orquestracao, recebe DTO
8. `presenter/schemas/<name>-schema.ts` — Zod schema + tipo inferido
9. `presenter/controllers/<name>-controller.ts` — Estende BaseController
10. `presenter/stores/<name>-store.ts` — Pinia store (se necessario)
11. `presenter/components/<name>-form.vue` — Formulario com validacao Zod
12. `presenter/pages/<name>-page.vue` — Conecta tudo
13. `presenter/routes/<name>-routes.ts` — Rotas com imports no topo
14. `src/enums/<name>.enum.ts` — Enums em arquivos separados
15. `src/router/route-names.ts` — Adicionar nome da rota
16. `src/router/index.ts` — Importar rotas do modulo

---

## REGRAS POR TIPO DE ARQUIVO

### Entity (`domain/entities/<name>.entity.ts`)
- Classe com identidade (`id` ou campo unico de negocio).
- SEM `fromJson` — construir a partir do JSON e responsabilidade do mapper.
- Pode ter getters de comportamento (`get hasActiveCompany()`).
- NAO importa Vue, Pinia, Router, HttpClient.

```typescript
export class Product {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly sku: string | null,
    public readonly currentStock: number,
    public readonly companyId: string,
  ) {}

  get hasSku(): boolean {
    return this.sku !== null
  }
}
```

### Type (`domain/types/<name>.types.ts`)
- `interface`/`type` de valor composto SEM identidade e tipos agregados.
- Agrupa dados que andam juntos (AuthToken) ou o resultado de um fluxo (AuthResult).
- SEM classe, SEM `fromJson` — o mapper constroi.

```typescript
export interface AuthToken {
  accessToken: string
  refreshToken: string
}

export interface AuthResult {
  token: AuthToken
  user: AuthUser
}
```

### DTO (`domain/dto/<name>-dto.ts`)
- Dado de transporte entre camadas. Temporario.
- Classe simples com propriedades. NAO tem `fromJson()`.
- NAO tem metodos. NAO importa Vue.

```typescript
export class LoginDto {
  constructor(
    public readonly email: string,
    public readonly password: string,
  ) {}
}
```

### Interface (`domain/interfaces/i-<name>-repository.interface.ts`)
- Contrato que o Repository implementa.
- Usa DTOs, Entities, Types e Either nas assinaturas.
- Importa SOMENTE de domain e core.

```typescript
export interface IProductRepository {
  findAll(dto: FindAllProductsDto): Promise<Either<Error, PaginatedResponse<Product>>>
  findById(id: string): Promise<Either<Error, Product>>
  create(dto: CreateProductDto): Promise<Either<Error, Product>>
  update(id: string, dto: UpdateProductDto): Promise<Either<Error, Product>>
  remove(id: string): Promise<Either<Error, void>>
}
```

### Repository (`data/<name>-repository.ts`)
- Implementa `I<Name>Repository`.
- Usa `httpClient` (singleton importado de `@/core/client/http-client`) com `<unknown>`.
- NAO conhece o formato do JSON — delega ao **mapper** via `flatMap`.
- Retorna `Either<Error, T>` (httpClient ja retorna Either).

```typescript
export class ProductRepository implements IProductRepository {
  async findAll(dto: FindAllProductsDto): Promise<Either<Error, PaginatedResponse<Product>>> {
    const params: Record<string, string> = { page: String(dto.page), limit: String(dto.limit) }
    if (dto.search) params.search = dto.search
    const result = await httpClient.get<unknown>('/products', { params })
    return result.flatMap(toProductPage)
  }
}
```

### Mapper (`data/mappers/<name>.mapper.ts`)
- UNICO ponto que conhece o formato do JSON da API.
- Valida com schema Zod (`safeParse`) e constroi Entities/Types.
- Retorna `Either<Error, T>` — `left` quando a resposta e invalida (contrato quebrado).
- Substitui os antigos `fromJson()` e os `as` casts (que nao validavam em runtime).

```typescript
import { z } from 'zod'

const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  sku: z.string().nullable().default(null),
  currentStock: z.number().default(0),
  companyId: z.string(),
})

export function toProductPage(data: unknown): Either<Error, PaginatedResponse<Product>> {
  const parsed = z
    .object({ data: z.array(productSchema), total: z.number(), page: z.number(), limit: z.number() })
    .safeParse(data)
  if (!parsed.success) return Either.left(new Error('Resposta invalida do servidor'))
  const v = parsed.data
  return Either.right({
    data: v.data.map((p) => new Product(p.id, p.name, p.sku, p.currentStock, p.companyId)),
    total: v.total,
    page: v.page,
    limit: v.limit,
  })
}
```

### Use Case (`application/use-cases/<action>.use-case.ts`)
- Recebe DTO como parametro.
- Delega para Repository.
- Retorna `Either<Error, T>`.
- NAO sabe sobre Vue, Router ou Pinia.

```typescript
export class FindAllProductsUseCase {
  constructor(private readonly productRepository: IProductRepository) {}
  async execute(dto: FindAllProductsDto): Promise<Either<Error, PaginatedResponse<Product>>> {
    return this.productRepository.findAll(dto)
  }
}
```

### Controller (`presenter/controllers/<name>-controller.ts`)
- Estende `BaseController` de `@/core/controllers/base-controller`.
- Instancia Repository e Use Cases.
- Cria DTOs tipados a partir de refs do formulario.
- Usa `this.handleResult(result, onSuccess, onError)`.
- Interage com Pinia Store e Router.

```typescript
export class ProductController extends BaseController {
  private readonly productRepository = new ProductRepository()
  private readonly findAllProductsUseCase = new FindAllProductsUseCase(this.productRepository)

  readonly search = ref('')
  readonly page = ref(1)

  async loadProducts(): Promise<void> {
    this.setLoading(true)
    const dto = new FindAllProductsDto(this.page.value, 20, this.search.value)
    const result = await this.findAllProductsUseCase.execute(dto)
    this.handleResult(result, (response) => {
      // atualizar store ou refs com response
    })
    this.setLoading(false)
  }
}
```

### Zod Schema (`presenter/schemas/<name>-schema.ts`)
- Define `z.object()` com validacoes em PT-BR.
- Exporta schema e tipo inferido.

```typescript
import { z } from 'zod'

export const productSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  sku: z.string().optional(),
  unitPrice: z.number().min(0, 'Preço deve ser positivo').optional(),
})

export type ProductFormData = z.infer<typeof productSchema>
```

### Pinia Store (`presenter/stores/<name>-store.ts`)
- `defineStore('nome', () => { ... })` com Composition API.
- Guarda Entities e Types tipados (NUNCA objetos sem tipo).
- Persiste em `StorageService` quando necessario.

### Page (`presenter/pages/<name>-page.vue`)
- Instancia Controller.
- Conecta formulario ao Controller.
- Mostra `controller.isLoading` e `controller.errorMessage`.
- `<script setup lang="ts">`.

### Component (`presenter/components/<name>-form.vue`)
- Formulario com validacao Zod (safeParse).
- Mapeia erros com `toFormErrors(result.error)` de `@/core/utils/zod-errors` (NUNCA iterar `issues` manualmente).
- Emite `submit` com dados tipados (`FormData`).
- Recebe `loading` como prop.

### Routes (`presenter/routes/<name>-routes.ts`)
- `RouteRecordRaw[]` com imports NO TOPO do arquivo (NUNCA inline).
- Usa `routeNames` para nome e path.

```typescript
import type { RouteRecordRaw } from 'vue-router'
import ProductListPage from '../pages/product-list-page.vue'
import { routeNames } from '@/router/route-names'

export const productRoutes: RouteRecordRaw[] = [
  {
    path: '/products',
    name: routeNames.PRODUCTS,
    component: ProductListPage,
  },
]
```

---

## CONVENCOES GERAIS

- **Kebab-case** em nomes de arquivo.
- **Sem `index.ts`** barrel files — cada arquivo e importado diretamente.
- **Sem `any`** — sempre tipar.
- **`import type { ... }`** para importar somente tipos.
- **NUNCA** `erasableSyntaxOnly` — declarar propriedades separadamente no constructor.
- **Textos em PT-BR.**
- **Preline UI** com tokens de tema (`bg-primary`, `text-primary-foreground`, etc.).
- **Ícones** via `<Icon name="..." />` de `@/shared/ui`. NUNCA importar `lucide-vue-next` direto — registrar novos ícones em `shared/ui/icon/icons.ts`.
- **Zod v3** — NAO usar v4 (incompativel).

---

## MULTI-TENANT

- Toda requisicao envia `Authorization: Bearer <accessToken>` automaticamente via interceptor.
- Interceptor faz refresh silencioso em 401 (1 tentativa).
- `companyActiveId` no localStorage, sincronizado na authStore.
- Se `forcePasswordChange === true`, redirecionar para troca de senha.

---

## APOS IMPLEMENTAR

1. Rodar `npm run build` — DEVE passar sem erros TypeScript.
2. Rodar `npm run format` — formatacao consistente.
3. Verificar que todos os arquivos seguem a estrutura do modulo.
4. Verificar que nao ha `any` em tipagens.