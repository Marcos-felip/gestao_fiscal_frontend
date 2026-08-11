> **Reveja esta proposta antes de começar.** Escrita antes das etapas 1 e 2
> existirem. Rode `openspec-update-change` primeiro.

## 1. Pré-requisitos

- [ ] 1.1 Change irmã do backend aplicada, com as permissões `fiscal.nfe.*` semeadas
- [ ] 1.2 Espelhar rotas e contrato em `gestao_fiscal_frontend/API.md`
- [ ] 1.3 Revisar esta proposta contra o que as etapas anteriores produziram

## 2. Enums

- [ ] 2.1 `ind-ie-dest.enum.ts`, `tipo-operacao.enum.ts` e `finalidade-nfe.enum.ts`, com rótulos descritivos
- [ ] 2.2 Conferir paridade com os enums do backend, como a auditoria do `AGENTS.md` prevê

## 3. Parceiros

- [ ] 3.1 Indicador de IE no DTO, na entidade e no mapper, validado com `z.nativeEnum`
- [ ] 3.2 Campo no formulário de parceiro, com descrição das opções
- [ ] 3.3 Migrar os casts existentes do `partner.mapper.ts` ao tocar o arquivo — dívida registrada no `AGENTS.md`

## 4. Configuração fiscal

- [ ] 4.1 Série e próxima numeração de NF-e na tela, ao lado das de NFC-e
- [ ] 4.2 Deixar explícito que as sequências são independentes

## 5. Emissão

- [ ] 5.1 Fluxo de emissão de NF-e: destinatário, natureza da operação, finalidade
- [ ] 5.2 Verificação de completude do destinatário **antes** de enviar, listando o que falta
- [ ] 5.3 Link direto para o cadastro do parceiro a partir da pendência
- [ ] 5.4 Seções opcionais de transporte, volumes e cobrança
- [ ] 5.5 Acompanhamento do status por polling, reaproveitando o da NFC-e
- [ ] 5.6 Gating por `fiscal.nfe.emit`

## 6. Documentos fiscais

- [ ] 6.1 Modelo visível na lista, com filtro
- [ ] 6.2 Detalhe exibindo os grupos do modelo 55 quando presentes
- [ ] 6.3 Detalhe de NFC-e inalterado, sem campos vazios do modelo 55
- [ ] 6.4 DANFE de NF-e no mesmo caminho de download do da NFC-e

## 7. Testes

- [ ] 7.1 Destinatário incompleto bloqueia a emissão e lista os campos
- [ ] 7.2 Gating por permissão
- [ ] 7.3 Mapper do parceiro com indicador de IE, incluindo enum desconhecido → `ContractError`
- [ ] 7.4 Detalhe de NFC-e não regride
- [ ] 7.5 `npm run verify` verde

## 8. Contexto

- [ ] 8.1 Atualizar `AGENTS.md` com o fluxo de NF-e
