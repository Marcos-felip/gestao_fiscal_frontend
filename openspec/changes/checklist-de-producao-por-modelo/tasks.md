> **Depende da change irmã do backend.** Só comece quando o campo dos modelos e o
> formato novo do checklist existirem — o contrato está em
> `gestao_fiscal_backend/API.md`.

## 1. Pré-requisitos

- [ ] 1.1 Change irmã do backend aplicada
- [ ] 1.2 Espelhar o contrato em `gestao_fiscal_frontend/API.md`

## 2. Modelos emitidos

- [ ] 2.1 Campo na seção de numeração, junto das séries de cada modelo
- [ ] 2.2 Validação de ao menos um modelo, em português
- [ ] 2.3 Mapper e DTO acompanhando o campo novo, com `z.nativeEnum`

## 3. Checklist por modelo

- [ ] 3.1 Mapper do checklist acompanha o agrupamento por modelo
- [ ] 3.2 Seção de produção exibe itens comuns e um grupo por modelo
- [ ] 3.3 Grupo de modelo não emitido não é exibido
- [ ] 3.4 Marca de pendência da seção na coluna considera só o que se aplica

## 4. Pendência de cadastro

- [ ] 4.1 Aviso com a contagem de produtos pendentes
- [ ] 4.2 Caminho para a lista de produtos com pendência fiscal, que já existe

## 5. Testes

- [ ] 5.1 Mapper: checklist agrupado, e valor de modelo desconhecido vira `ContractError`
- [ ] 5.2 Schema: configuração sem modelo é recusada
- [ ] 5.3 Grupo omitido para modelo não emitido
- [ ] 5.4 `npm run verify` verde

## 6. Contexto

- [ ] 6.1 Atualizar `AGENTS.md` com o checklist por modelo
