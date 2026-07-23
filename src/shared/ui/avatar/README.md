# Avatar Component

Componente de avatar para padronizar imagem ou iniciais.

## Props

| Propriedade | Tipo | Padrao | Descricao |
|---|---|---|---|
| `src` | `string` | `''` | URL da imagem do avatar |
| `alt` | `string` | `'Avatar'` | Texto alternativo da imagem |
| `initials` | `string` | `''` | Iniciais exibidas quando nao ha imagem |
| `size` | `'sm' \| 'md' \| 'lg'` | `'sm'` | Tamanho do avatar |
| `shape` | `'circle' \| 'rounded'` | `'circle'` | Formato do avatar |
| `variant` | `'primary' \| 'secondary' \| 'muted'` | `'primary'` | Cor de fundo/texto quando sem imagem |

## Exemplos

```vue
<Avatar initials="MF" />
<Avatar size="md" initials="GF" />
<Avatar size="lg" shape="rounded" initials="GF" />
<Avatar src="/images/user.jpg" alt="Marcos Felipe" />
```
