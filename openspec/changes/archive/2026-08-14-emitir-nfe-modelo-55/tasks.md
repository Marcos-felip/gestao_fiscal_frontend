> **Podada em 13/08/2026**, contra o que as etapas 0 e 1 produziram e contra os
> dois recortes do backend: operação **interna** e destinatário **pessoa
> jurídica**.

## 1. Pré-requisitos

- [x] 1.1 Change irmã do backend aplicada, com as permissões `fiscal.nfe.*` semeadas
- [x] 1.2 Espelhar rotas e contrato em `gestao_fiscal_frontend/API.md`
- [x] 1.3 Revisar esta proposta contra o que as etapas anteriores produziram

## 2. Enums

- [x] 2.1 `ind-ie-dest.enum.ts` com os três valores e uma descrição por opção
- [x] 2.2 ~~`tipo-operacao.enum.ts` e `finalidade-nfe.enum.ts`~~ — **não criados.** O recorte aceita um único valor de cada (`saída` e `normal`), e o backend os carimba no snapshot. Um enum no frontend com uma opção só seria escolha falsa na tela e código morto no mapper. Voltam quando o recorte abrir
- [x] 2.3 Paridade com o backend conferida: `IndIeDest` espelha `IND_IE_DEST` do `fiscal-engine.interface.ts`

## 3. Parceiros

- [x] 3.1 Indicador de IE no DTO, na entidade e no mapper
- [x] 3.1b **Achado ao implementar:** faltava também `ibgeCode` — a NF-e exige `cMun` no destinatário e a NFC-e nunca levou endereço de destinatário
- [x] 3.2 Campos no formulário, com a descrição mudando conforme a opção escolhida
- [x] 3.2b **Melhor que pedir:** o `ibgeCode` é preenchido pelo ViaCEP junto do endereço. O lojista não tem por que conhecer o código IBGE do próprio município
- [x] 3.3 Migrar os casts do `partner.mapper.ts` — `type` e `personType` passaram a `z.nativeEnum`; `partner` saiu da lista de dívida do `AGENTS.md`

## 4. Configuração fiscal

- [x] 4.1 **Feito em 13/08/2026:** série e próxima numeração da NF-e na tela, em bloco próprio ao lado das da NFC-e
- [x] 4.2 Cada modelo tem seu `fieldset` com `legend`, o que deixa as duas sequências visivelmente separadas

## 5. Emissão

- [x] 5.1 Fluxo de emissão de NF-e a partir do detalhe da venda
- [x] 5.2 ~~Verificação de completude do destinatário **antes** de enviar~~ — **decidido não duplicar.** A regra vive no `buildNfeSnapshot` do backend, que recusa nomeando cada campo faltante. Repeti-la aqui criaria uma segunda fonte para divergir da primeira, e o custo do 400 é um toast, não uma numeração queimada
- [ ] 5.3 Link direto para o cadastro do parceiro a partir da pendência — **não feito.** Depende de a mensagem do backend identificar o parceiro de forma navegável; hoje ela nomeia o cliente por nome, não por id
- [ ] 5.4 Seções opcionais de transporte, volumes e cobrança — **não feito na tela.** O contrato aceita os três (DTO, repository e testes cobrem), mas o formulário ainda não os coleta: venda de balcão não tem frete, e o grupo ausente já significa "sem frete"
- [x] 5.5 Acompanhamento do status por polling, reaproveitando o da NFC-e
- [x] 5.6 Gating por `fiscal.nfe.emit`, separado de `fiscal.emit`

## 6. Documentos fiscais

- [x] 6.1 Modelo visível na lista, com filtro — já existia desde o MVP
- [ ] 6.2 Detalhe exibindo os grupos do modelo 55 quando presentes — **não feito.** O snapshot da NF-e traz destinatário completo, transporte e cobrança; a tela de detalhe ainda mostra só o que a NFC-e tem
- [x] 6.3 Detalhe de NFC-e inalterado, sem campos vazios do modelo 55
- [x] 6.4 **Corrigido em 13/08/2026, depois de aparecer na tela.** O controller forçava `application/pdf` em todo DANFE, então o HTML da NF-e chegava renomeado para `.pdf` e o navegador respondia "Falha ao carregar documento PDF". A extensão passou a sair do tipo que o servidor declarou; tipo ausente continua virando PDF, porque só a NFC-e cai nesse caso

## 7. Testes

- [x] 7.1 ~~Destinatário incompleto bloqueia a emissão e lista os campos~~ — a conferência é do backend; o que o frontend garante é exibir a mensagem dele (`isUserFacing`)
- [x] 7.2 Gating por permissão
- [x] 7.3 Mapper do parceiro com indicador de IE, incluindo enum desconhecido → `ContractError` para `type`/`personType` e degradação para `null` no indicador
- [x] 7.4 Detalhe de NFC-e não regride — 273 testes verdes, os 263 anteriores intactos
- [x] 7.5 `npm run verify` verde

## 8. Contexto

- [x] 8.1 Atualizar `AGENTS.md` e `API.md` com o fluxo de NF-e
