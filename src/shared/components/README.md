# Smart Components

Este diretório contém **componentes inteligentes** que encapsulam lógica de apresentação e comportamentos específicos, em contraste com os componentes primitivos em `@/shared/ui`.

## 🧠 O Que São Componentes Inteligentes?

- **Com contexto:** Lidam com lógica de apresentação, estado temporário ou comportamentos específicos
- **Reutilizáveis:** Usados em múltiplas páginas e módulos
- **Independentes de domínio:** Não vinculados a uma única feature (diferentemente de componentes dentro de módulos)
- **Podem depender de stores/services:** Diferentemente de UI primitivos

## 📂 Estrutura

```
components/
├── toast/
│   └── toast-notification.vue      # Notificações toast reutilizáveis
├── layouts/
│   └── auth-layout.vue             # Layout para páginas de autenticação
└── README.md                        # Este arquivo
```

## 📦 Componentes Disponíveis

### 🔔 `toast/` — Toast Notifications

Notificações não-intrusivas para feedback ao usuário (sucesso, erro, aviso).

**Localização:** `src/shared/components/toast/toast-notification.vue`

**Importar:**
```typescript
import Toast from '@/shared/components/toast/toast-notification.vue'
```

---

### 🎨 `layouts/` — Layouts Compartilhados

Layouts reutilizáveis entre diferentes seções da aplicação.

#### `auth-layout.vue`
Layout para páginas de autenticação (login, registro, recuperação de senha).

**Localização:** `src/shared/components/layouts/auth-layout.vue`

**Importar:**
```typescript
import AuthLayout from '@/shared/components/layouts/auth-layout.vue'
```

**Uso:**
```vue
<template>
  <AuthLayout>
    <!-- Conteúdo específico da página -->
  </AuthLayout>
</template>
```

---

## 🔄 Diferença: UI vs Components

| Aspecto | UI (`@/shared/ui`) | Components (`@/shared/components`) |
|--------|-------|---------|
| **Que é** | Primitivos (Button, Input, Card) | Inteligentes (Toast, Layouts) |
| **Dependências** | Apenas Preline + Tailwind | Pode depender de stores, serviços |
| **Lógica** | Nenhuma — apenas apresentação | Pode ter comportamento/estado |
| **Uso** | Em formulários, cards, headers | Em páginas inteiras, múltiplos contextos |
| **Customização** | Via props e slots | Mais determinado/menos customizável |

---

## 🎯 Quando Criar um Novo Componente Smart

✅ **Crie se:**
- É usado em múltiplos módulos/páginas
- Encapsula comportamento reutilizável
- Não é específico de uma feature

❌ **Não crie:**
- Componentes específicos de um módulo — coloque em `modules/<feature>/presentation/components/`
- Wrappers simples do Preline — coloque em `ui/`
- Lógica de negócio — coloque em controllers/use-cases

---

## 📝 Como Adicionar um Novo Componente Smart

1. Crie a pasta apropriada: `components/<tipo>/`
2. Crie o arquivo `.vue`: `<nome>-<tipo>.vue`
3. Implemente o componente com TypeScript + props tipadas
4. Exporte em `components/` (sem index.ts)
5. Documente aqui neste README
6. Use: `import Component from '@/shared/components/<tipo>/<nome>-<tipo>.vue'`

---

## 🚀 Exemplos de Importação

```typescript
// Toast notification
import Toast from '@/shared/components/toast/toast-notification.vue'

// Layouts
import AuthLayout from '@/shared/components/layouts/auth-layout.vue'
```
