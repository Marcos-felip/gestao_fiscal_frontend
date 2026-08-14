## Why

**O detalhe de toda nota mostra a seção de itens vazia.** Não é ausência de
dados: é o frontend procurando chaves que não existem.

O snapshot é o retrato congelado do que foi enviado à SEFAZ — existe porque
cadastro muda e nota emitida não. A etapa 1 do roteiro fiscal reescreveu esse
retrato para carregar o quadro tributário por item, trocou as chaves para
português e marcou `versao: 2`. O value object do frontend continuou descrevendo
o formato antigo, em inglês:

| Backend grava | Frontend procura |
|---|---|
| `itens` | `items` |
| `pagamentos` | `payments` |
| `venda` | `sale` |
| `emitente` | `establishment` |
| `destinatarioNfe` | `customer` |

Como todo campo era opcional e o mapper fazia `snapshot as FiscalSnapshot`,
`snapshot.items` virava `undefined` e a tela renderizava `?? []`. **Nenhum erro,
nenhum aviso** — a mesma família do `as` que o `AGENTS.md` proíbe nos mappers,
transformando contrato quebrado em silêncio. O teste do mapper passava porque o
fixture também usava o formato inventado.

Com o snapshot ilegível, o detalhe da NF-e também nunca mostrou o que só ela
tem: destinatário completo, natureza da operação, finalidade, transporte e
cobrança.

## What Changes

- **O value object passa a descrever o formato real** (versão 2, chaves em
  português), incluindo o quadro tributário do item e os grupos da NF-e.
- **O snapshot passa a ser validado com Zod**, em mapper próprio. Formato
  desconhecido devolve `null` e registra no console — não vira nota sem itens.
- **A tela distingue "sem retrato" de "retrato ilegível"** (`snapshotIlegivel`),
  em vez de mostrar uma nota sem itens como se ela não tivesse nenhum.
- **O detalhe ganha os grupos do modelo 55**: operação, destinatário, totais
  fiscais e transporte/cobrança quando informados.
- **O fixture do teste passa a ser o JSON real**, conferido contra o banco.

## Capabilities

### Modified Capabilities
- `nfe-emission-ui`: o detalhe do documento passa a exibir os grupos próprios do
  modelo 55, que a etapa 3 deixou em aberto.

## Impact

- `src/modules/fiscal/domain/value-objects/fiscal-snapshot.ts` — reescrito.
- `src/modules/fiscal/data/mappers/fiscal-snapshot.mapper.ts` — novo.
- `fiscal-document.mapper.ts`, entidade e tela de detalhe.
- **Sem mudança no backend:** o formato dele está correto e é a fonte da verdade.
