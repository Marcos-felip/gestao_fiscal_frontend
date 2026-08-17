> **Depende da change irmã do backend.** Só comece quando `POST /purchases/import/nfe`
> existir — o contrato está em `gestao_fiscal_backend/API.md`.

## 1. Pré-requisitos

- [x] 1.1 Change irmã do backend aplicada
- [x] 1.2 Espelhar o contrato em `gestao_fiscal_frontend/API.md`

## 2. Camada de dados

- [x] 2.1 `multipart/form-data` enviado do repositório, como o upload de certificado
  já fazia — **não** `fetch` dentro de componente
- [x] 2.2 DTOs, entidades e mapper Zod da importação e dos seus itens
- [x] 2.3 `z.nativeEnum` para a situação do item e da importação; nada de `as`
- [x] 2.4 Repositório e casos de uso: importar, listar, ler, apontar produto, confirmar
- [x] 2.5 Factory como composition root

## 3. Conferência

- [x] 3.1 Três estados visíveis: por código de barras, por memória, não casado
- [x] 3.2 Casado por memória diz que veio de escolha anterior, e permite trocar
- [x] 3.3 Pendentes em primeiro lugar, **sem paginar**. Filtro por situação não
  foi feito: com o pendente no topo, a lista já responde "o que falta?"
- [x] 3.4 Divergência de unidade destacada, sem conversão
- [x] 3.5 Valores exibidos são os do XML; a tela **não** recalcula totais

## 4. Resolver item

- [x] 4.1 Buscar produto do catálogo e apontar
- [ ] 4.2 Criar produto abre o formulário do módulo de produtos, preenchido, e
  volta — **não feito**, o item pendente hoje só aceita produto já cadastrado
- [x] 4.3 Escolha grava o de-para do fornecedor (backend), refletida na tela

## 5. Conclusão

- [x] 5.1 Confirmar só com tudo casado, dizendo quantos faltam quando não
- [x] 5.2 A tela diz que gera **compra em rascunho**, não entrada de estoque
- [x] 5.3 Depois de confirmar, levar até a compra criada

## 6. Entradas e gating

- [x] 6.1 Ação de importar na lista de compras — **tela sem porta não existe**
- [x] 6.2 Rota `/compras/importar` com `requiresPermission: 'purchases.import'`
- [x] 6.3 Sem `purchases.import`, a rota nem abre — a importação é uma ação só,
  não há leitura parcial a oferecer

## 7. Testes

- [x] 7.1 Mapper: situação preservada, valor desconhecido vira `ContractError`
- [x] 7.2 Controller: confirmar bloqueado com item pendente
- [x] 7.3 Controller: erro do backend chega por `DomainError`, nunca por string
- [x] 7.4 Apontar produto atualiza o item sem recarregar a importação inteira
- [x] 7.5 `npm run verify` verde

## 8. Fora do escopo

- [ ] 8.1 Descoberta automática de notas — change `buscar-notas-de-entrada-na-sefaz`
- [ ] 8.2 Conversão de unidade
- [ ] 8.3 Mudanças na tela de compras além da porta de entrada
