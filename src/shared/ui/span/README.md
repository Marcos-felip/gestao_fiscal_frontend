# Span Component

Componente de texto para tipografia padronizada com props de tamanho, peso, variante e família de fonte.

## Props

| Propriedade | Tipo | Padrão | Descrição |
|---|---|---|---|
| `size` | `'xs' \| 'sm' \| 'base' \| 'lg' \| 'xl' \| '2xl'` | `'base'` | Tamanho do texto |
| `weight` | `'extralight' \| 'light' \| 'normal' \| 'medium' \| 'semibold' \| 'bold' \| 'extrabold' \| 'black'` | `'normal'` | Peso da fonte |
| `variant` | `'default' \| 'muted' \| 'primary' \| 'destructive'` | `'default'` | Cor/tom do texto |
| `color` | `string` | — | Cor livre (classe Tailwind, `var(--color-...)` ou valor CSS). Tem prioridade sobre `variant`. |
| `font` | `'sans' \| 'serif' \| 'mono'` | `'sans'` | Família de fonte |

## Slots

- **default**: conteúdo do texto

## Exemplos

```vue
<Span size="sm" weight="medium">Texto padrão</Span>
<Span size="xs" variant="muted" weight="light">Texto secundário</Span>
<Span size="2xl" weight="black" variant="primary">Gestão Fiscal</Span>
<Span size="sm" color="text-white">Ativo</Span>
<Span size="sm" :color="'--color-primary'">Primario</Span>
```
