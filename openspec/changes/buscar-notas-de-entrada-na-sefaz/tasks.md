> **Depende de duas changes:** `importar-nota-de-entrada-por-xml` deste
> repositório (a tela de conferência) e `buscar-notas-de-entrada-na-sefaz` do
> backend (os dados).

## 1. Pré-requisitos

- [ ] 1.1 Change irmã do backend aplicada
- [ ] 1.2 Importação por XML já entregue neste repositório
- [ ] 1.3 Espelhar o contrato em `gestao_fiscal_frontend/API.md`

## 2. Camada de dados

- [ ] 2.1 DTOs, entidades e mapper Zod do documento e da manifestação
- [ ] 2.2 `z.nativeEnum` para situação e tipo de manifestação
- [ ] 2.3 Repositório e casos de uso: listar, ler, manifestar, importar
- [ ] 2.4 Factory como composition root

## 3. Caixa de entrada

- [ ] 3.1 Lista com emitente, valor, data, situação e manifestação
- [ ] 3.2 Não manifestadas em destaque
- [ ] 3.3 Emitente sem compra anterior destacado, com o aviso do porquê
- [ ] 3.4 Última consulta e recusa por frequência visíveis na própria tela
- [ ] 3.5 Carga histórica não polui a caixa de entrada
- [ ] 3.6 Destino próprio na navegação — **não** uma aba de compras

## 4. Manifestação

- [ ] 4.1 Quatro opções com o **efeito escrito**, sem código de evento na decisão
- [ ] 4.2 Desconhecimento e operação não realizada exigem confirmação explícita
- [ ] 4.3 Ciência **não** pede confirmação — senão a que importa perde o efeito
- [ ] 4.4 Recusa da SEFAZ exibida como veio, preservando a situação anterior

## 5. Ligação com a importação

- [ ] 5.1 Resumo diz que é resumo e **não** oferece importação
- [ ] 5.2 XML completo leva à tela de conferência já existente
- [ ] 5.3 Origem do XML exibida na importação, com a chave de acesso

## 6. Gating

- [ ] 6.1 `dfe.read` para ver, `dfe.manifestar` para agir — separados
- [ ] 6.2 Sem `dfe.manifestar`, a caixa de entrada é somente leitura

## 7. Testes

- [ ] 7.1 Mapper: situação e manifestação preservadas; valor desconhecido vira `ContractError`
- [ ] 7.2 Controller: manifestação recusada preserva a situação anterior
- [ ] 7.3 Resumo não oferece importação
- [ ] 7.4 Somente leitura sem `dfe.manifestar`
- [ ] 7.5 `npm run verify` verde

## 8. Fora do escopo

- [ ] 8.1 Alerta de prazo legal da manifestação
- [ ] 8.2 CT-e e MDF-e
- [ ] 8.3 Mudanças na conferência de itens
