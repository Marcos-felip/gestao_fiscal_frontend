# Select

Select acessível para campos de enum (tipo de empresa, regime tributário,
tipo de estabelecimento, etc.). Segue a mesma API de `label`/`hint`/`error`
do `Input`, com dropdown animado por motion-v.

## Props

| Prop          | Tipo             | Padrão        | Descrição                                  |
| ------------- | ---------------- | ------------- | ------------------------------------------ |
| `modelValue`  | `string`         | —             | Valor selecionado (`v-model`).             |
| `options`     | `SelectOption[]` | —             | Lista `{ value, label }`.                  |
| `placeholder` | `string`         | `'Selecione'` | Texto quando nada está selecionado.        |
| `disabled`    | `boolean`        | `false`       | Desabilita o campo.                        |
| `error`       | `string`         | `''`          | Mensagem de erro (borda vermelha + shake). |
| `hint`        | `string`         | `''`          | Texto de ajuda abaixo do campo.            |
| `id`          | `string`         | auto          | Id do gatilho (liga ao `<label>`).         |

`SelectOption = { value: string; label: string }`.

## Slots

- `#label` — conteúdo do rótulo (renderizado acima do campo).

## Emits

- `update:modelValue` — ao escolher uma opção.

## Acessibilidade / teclado

- `role="listbox"` / `role="option"`, `aria-expanded`, `aria-selected`.
- Setas ↑/↓ navegam, `Enter`/`Espaço` selecionam, `Home`/`End` pulam para as
  pontas, `Esc` fecha. Clique externo fecha o painel.

## Exemplo

```vue
<Select
  v-model="type"
  :options="companyTypeOptions"
  placeholder="Selecione o tipo"
  :error="errors.type"
>
  <template #label>Tipo de empresa</template>
</Select>
```
