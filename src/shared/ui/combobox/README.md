# Combobox

Select com busca por texto: mostra um input com ícone de busca, filtra as opções
conforme o que é digitado e resolve para um `value` ao escolher. Ideal para
listas grandes (produtos, fornecedores) onde percorrer um `Select` puro é lento.
Segue a mesma API de `label`/`hint`/`error` do `Input`/`Select`; o `modelValue`
é o `value` da opção selecionada (`''` = nada selecionado).

## Props

| Prop          | Tipo             | Padrão               | Descrição                                     |
| ------------- | ---------------- | -------------------- | --------------------------------------------- |
| `modelValue`  | `string`         | —                    | `value` da opção selecionada (`v-model`).     |
| `options`     | `SelectOption[]` | —                    | Lista `{ value, label }`.                     |
| `placeholder` | `string`         | `'Buscar…'`          | Texto quando nada está selecionado.           |
| `disabled`    | `boolean`        | `false`              | Desabilita o campo.                           |
| `error`       | `string`         | `''`                 | Mensagem de erro (borda vermelha + shake).    |
| `hint`        | `string`         | `''`                 | Texto de ajuda abaixo do campo.               |
| `id`          | `string`         | auto                 | Id do input (liga ao `<label>`).              |
| `emptyText`   | `string`         | `'Nenhum resultado'` | Texto quando o filtro não retorna opções.     |

`SelectOption = { value: string; label: string }` (reaproveitado de `Select`).

## Slots

- `#label` — conteúdo do rótulo (renderizado acima do campo).

## Emits

- `update:modelValue` — ao escolher uma opção ou limpar a seleção (`''`).

## Comportamento

- Foco/digitação abre o painel e filtra por substring (case-insensitive) do
  `label`. Escolher fecha e mostra o rótulo; o botão **×** limpa (emite `''`).
- Ao fechar sem confirmar, o texto volta ao rótulo da seleção atual — não fica
  texto "solto" sem opção correspondente.

## Acessibilidade / teclado

- `role="combobox"` no input, `role="listbox"`/`role="option"` no painel,
  `aria-expanded` / `aria-selected`.
- Setas ↑/↓ navegam, `Enter` seleciona o item ativo, `Esc` fecha. Clique externo
  fecha o painel.

## Exemplo

```vue
<Combobox
  :model-value="productValue"
  :options="productOptions"
  placeholder="Buscar produto…"
  empty-text="Nenhum produto encontrado"
  @update:model-value="onProduct"
/>
```
