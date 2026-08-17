## Context

O backend passa a ler o XML e devolver a importação com o casamento de cada item
já tentado. A tela é a etapa em que uma pessoa confere antes de a mercadoria
existir no estoque.

O frontend segue Clean Architecture com fronteiras impostas por ESLint:
`Page → Controller → UseCase → Repository → HttpClient`, mapper Zod na entrada e
factory como composition root.

Uma nota de distribuidor pode ter 300 itens.

## Goals / Non-Goals

**Goals:**

- Tornar visível a diferença entre casar por GTIN e casar por memória.
- Fazer o item pendente ser resolvido em poucos cliques, e a resposta valer para
  as próximas notas.
- Terminar na compra em rascunho, não numa mensagem de sucesso.

**Non-Goals:**

- Refazer a tela de compras.
- Conversão de unidade.
- Descoberta automática de notas — change irmã `buscar-notas-de-entrada-na-sefaz`.

## Decisions

### A confiança do casamento é informação de primeira classe

Três estados visualmente distintos: **por código de barras**, **por memória** e
**não casado**. Não é enfeite — é o que separa uma conferência real de um "aceitar
tudo". O item por memória carrega o erro de quem escolheu antes, e a tela oferece
trocar ali mesmo.

### Enviar arquivo é capacidade nova da camada `data/`

O `httpClient` hoje só manda JSON. `multipart/form-data` entra nele, não na page:
`fetch` dentro de componente atravessaria as fronteiras que o ESLint impõe, e o
`eslint-disable` que isso pediria seria o sinal de que o desenho está errado.

### Lista longa não vira scroll infinito

Com 300 itens, o que importa é **o que falta resolver**. A tela abre com os
pendentes em primeiro lugar e permite filtrar por situação. Paginar a conferência
esconderia pendência na página 2 — o mesmo erro do filtro fiscal que acabou de
ser removido da tela de produtos.

### A tela não recalcula totais

Os valores exibidos são os do XML, como o backend os leu. Recalcular na tela
criaria uma segunda verdade que divergiria por arredondamento, e a nota é o
documento — não a nossa aritmética sobre ele.

### Criar produto sai da importação e volta para ela

Criar produto abre o formulário do módulo de produtos, preenchido, e retorna à
importação com o item casado. Duplicar um mini-formulário dentro da importação
criaria um segundo lugar para cadastrar produto, que envelheceria diferente do
primeiro.

## Risks / Trade-offs

- **A tela pode virar "confirmar tudo".** É o risco central: se a conferência for
  cansativa, o usuário clica sem ler. Mitigação: o que já está casado por GTIN
  fica discreto, e a atenção vai para pendente e divergente.
- **Volume de 300 itens** pressiona a renderização. Mitigação: linha simples,
  sem componente pesado por item.
- **Sair para criar produto perde contexto** se a importação não estiver
  persistida. Ela está: o backend guarda a importação, então a volta é uma
  releitura, não uma reconstituição de estado da tela.
- **Erro do backend em português exibido cru** é proposital, mas mensagem longa
  quebra layout. Mitigação: o erro tem lugar próprio na tela, não um toast curto.
