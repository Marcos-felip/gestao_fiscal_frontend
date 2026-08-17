## Why

**Change irmã do backend `importar-nota-de-entrada-por-xml`.** O contrato está em
`gestao_fiscal_backend/API.md`.

A entrada de mercadoria é digitada à mão: a base tem 0 compras e 34 movimentações
de estoque sem documento nenhum. O módulo de compras existe e funciona, mas a
tela pede que se recadastre item por item o que o XML do fornecedor já traz — e
lançar o movimento cru sai mais barato.

O backend passa a ler o XML e casar os itens. **Sem tela, isso não existe para o
usuário:** o casamento que sobra precisa de alguém para resolver, e é aí que a
interface decide se a importação vira rotina ou vira outro formulário que
ninguém abre.

A tela tem uma regra que a distingue de um CRUD: **ela não pode fingir que
acertou.** Item casado por GTIN e item casado por memória de importação anterior
têm confianças diferentes, e o usuário precisa ver qual é qual antes de confirmar
uma entrada de estoque.

## What Changes

- **Tela de importação**: enviar o XML e ver o que dele saiu — fornecedor, nota,
  itens e parcelas — antes de qualquer confirmação.
- **Conferência item a item**, mostrando **como** cada um foi casado: por código
  de barras, por memória do fornecedor, ou não casado. Casamento por memória é
  exibido como o que é — uma escolha anterior, não uma certeza.
- **Resolver o que sobrou**: buscar o produto do catálogo, ou criar um novo já
  preenchido com os dados do XML. Criar é oferecido, nunca automático.
- **Divergência de unidade destacada** no item, sem conversão automática.
- **Confirmar gera a compra em RASCUNHO** e leva o usuário até ela — a entrada de
  estoque continua sendo um ato dele, na tela de compras que já existe.
- **Lista de importações**, com as que ficaram pendentes de resolução.
- **Baixar o XML** de uma importação.
- **Gating** por `purchases.import`, com leitura para quem só tem `purchases.list`.

## Capabilities

### New Capabilities
- `nfe-import-ui`: a tela de importação da nota de entrada, a conferência do
  casamento de itens e o caminho até a compra em rascunho.

### Modified Capabilities

Nenhuma. A tela de compras não muda nesta change: a importação a alimenta e
termina nela, sem alterar como ela se comporta.

## Impact

- **Depende do backend** estar aplicado — sem `POST /purchases/import/nfe` não há
  o que consumir.
- **Frontend:** módulo novo `src/modules/nfe-import/`, seguindo
  `Page → Controller → UseCase → Repository → HttpClient`, com mapper Zod e
  factory como composition root.
- **Upload de arquivo**: o `httpClient` hoje envia JSON; enviar `multipart` é
  capacidade nova da camada `data/`.
- **Espelhar o contrato** em `gestao_fiscal_frontend/API.md`.
- **Rota e entrada**: `/compras/importar`, alcançável a partir da lista de
  compras — o mesmo erro da tela de pendências fiscais, que nasceu sem porta, não
  se repete aqui.
