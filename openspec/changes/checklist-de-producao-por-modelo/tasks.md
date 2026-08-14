> **Depende da change irmã do backend.** Só comece quando o campo dos modelos e o
> formato novo do checklist existirem — o contrato está em
> `gestao_fiscal_backend/API.md`.

## 1. Pré-requisitos

- [x] 1.1 Change irmã do backend aplicada
- [x] 1.2 Espelhar o contrato em `gestao_fiscal_frontend/API.md`

## 2. Modelos emitidos

- [x] 2.1 Campo na seção de numeração, junto das séries de cada modelo
- [x] 2.2 Validação de ao menos um modelo, em português
- [x] 2.3 Mapper, entidade e DTO acompanhando o campo novo, com `z.nativeEnum`
- [x] 2.4 `isDirty` compara o array por conteúdo — por referência acusaria alteração a cada re-semeadura

## 3. Checklist por modelo

- [x] 3.1 Mapper do checklist acompanha `modelo` em cada item
- [x] 3.2 Seção de produção exibe itens comuns e um grupo por modelo
- [x] 3.3 Grupo de modelo não emitido não é exibido — o backend nem o envia
- [x] 3.4 **Achado ao implementar:** o botão de liberar exigia todos os itens `ok`,
  incluindo os não bloqueantes. Consulta pública só se valida depois de liberar,
  então a liberação era impossível pela tela. Passou a olhar `bloqueante`

## 4. Pendência de cadastro

- [x] 4.1 Aviso com a contagem de produtos pendentes, vindo do backend
- [ ] 4.2 Caminho para a lista de produtos com pendência fiscal — **não feito.** O
  filtro de pendências existe na tela de produtos, mas não há rota que já abra
  filtrada; deixar um link que leva à lista inteira ensinaria pouco

## 5. Testes

- [x] 5.1 Mapper: `modelo` preservado, não bloqueante preservado, modelo desconhecido vira `ContractError`
- [x] 5.2 Schema: configuração sem modelo é recusada
- [x] 5.3 Grupo omitido para modelo não emitido (coberto pelo agrupamento do mapper + backend)
- [x] 5.4 `npm run verify` verde

## 6. Contexto

- [x] 6.1 Atualizar `AGENTS.md` com o checklist por modelo
