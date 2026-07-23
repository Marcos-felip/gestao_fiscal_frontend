# Icon Component

Componente primitivo para renderizar ícones do **Lucide Icons** dinamicamente.

## Uso

```vue
<script setup lang="ts">
import { Icon } from '@/shared/ui'
</script>

<template>
  <!-- Ícone padrão (20px, stroke-width 2) -->
  <Icon name="Bell" />

  <!-- Com tamanho -->
  <Icon name="Users" size="lg" />

  <!-- Com classes customizadas -->
  <Icon name="Settings" class="text-primary" />

  <!-- Com stroke-width customizado -->
  <Icon name="Heart" :stroke-width="3" />

  <!-- Tamanhos disponíveis -->
  <Icon name="Search" size="xs" />  <!-- 12px -->
  <Icon name="Search" size="sm" />  <!-- 16px -->
  <Icon name="Search" size="md" />  <!-- 20px (padrão) -->
  <Icon name="Search" size="lg" />  <!-- 24px -->
  <Icon name="Search" size="xl" />  <!-- 32px -->
</template>
```

## Props

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `name` | `string` | — | **Obrigatório**. Nome do ícone Lucide (ex: `Bell`, `Users`, `Settings`) |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Tamanho do ícone |
| `strokeWidth` | `1 \| 1.5 \| 2 \| 2.5 \| 3` | `2` | Espessura da linha |
| `className` | `string` | `''` | Classes CSS adicionais |

## Ícones Disponíveis

Todos os ícones do **Lucide Icons** estão disponíveis. Alguns exemplos:

- Navegação: `Home`, `Menu`, `Sidebar`, `SkipBack`, `SkipForward`
- Usuários: `Users`, `User`, `UserPlus`, `UserMinus`
- Empresas: `Building`, `Building2`, `Factory`
- Documentos: `FileText`, `File`, `Folder`, `FolderOpen`
- Ações: `Plus`, `Minus`, `Edit`, `Trash2`, `Copy`, `Download`
- UI: `ChevronDown`, `ChevronUp`, `ChevronLeft`, `ChevronRight`, `Search`, `Bell`, `Settings`
- Status: `Check`, `X`, `AlertCircle`, `Info`, `HelpCircle`
- Sistema: `Power`, `LogOut`, `Lock`, `Eye`, `EyeOff`

**Consulte**: [lucide.dev](https://lucide.dev) para lista completa.

## Exemplos Práticos

### Em um Button com Ícone

```vue
<Button size="md" variant="primary">
  <template #icon>
    <Icon name="Plus" size="sm" />
  </template>
  Novo Usuário
</Button>
```

### Em uma NavbarButton

```vue
<NavbarButton tooltip="Notificações">
  <Icon name="Bell" size="md" class="text-muted-foreground" />
  <Badge :count="5" variant="destructive" />
</NavbarButton>
```

### Em um SidebarLink

```vue
<SidebarLink to="/users" label="Usuários">
  <template #icon>
    <Icon name="Users" size="sm" />
  </template>
</SidebarLink>
```

## CSS Classes

O componente usa Tailwind CSS com suporte a design tokens:

- Tamanhos via `h-*` e `w-*` (h-3, h-4, h-5, h-6, h-8)
- Cor via `color: currentColor` (herda da cor do texto pai)
- Exemplo de customização:

```vue
<!-- Ícone vermelho, grande -->
<Icon name="AlertCircle" size="lg" class="text-destructive" />

<!-- Ícone verde, pequeno -->
<Icon name="Check" size="sm" class="text-green-500" />
```

## Tratamento de Erros

Se o ícone não for encontrado:

```vue
<!-- Mostra: ❌ Ícone não encontrado -->
<Icon name="IconQueNaoExiste" />
```

Verifique o console para mensagens de erro detalhadas.

## Performance

- Ícones são carregados **dinamicamente** via `defineAsyncComponent`
- Apenas ícones usados são importados (lazy loading)
- Cache automático pelo Vite

## Accessibility

```vue
<!-- Para SVG Icons, não há need de alt text (é decorativo) -->
<!-- Se usar em contexto importante, adicione aria-label no container pai -->
<button :aria-label="`${count} notificações`">
  <Icon name="Bell" />
</button>
```

---

**Versão**: 1.0  
**Última atualização**: Maio 2026
