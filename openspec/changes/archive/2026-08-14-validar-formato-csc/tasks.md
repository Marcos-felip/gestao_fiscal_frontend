## 1. Pré-requisito

- [x] 1.1 Confirmar que a change irmã do backend (`validar-formato-csc`) está aplicada e que `API.md` do backend publica o formato de `codigoCsc` e `idCsc`
- [x] 1.2 Espelhar o contrato em `gestao_fiscal_frontend/API.md` — este arquivo nunca cobriu os endpoints fiscais (o contrato fiscal vive em `AGENTS.md`), então o formato do CSC entrou como item em "Pontos de atenção conhecidos" + seção própria, em vez de uma seção `/fiscal/settings` inteira

## 2. Schema de apresentação

- [x] 2.1 `fiscal-settings-schema.ts:44` — `codigoCsc`: `.min(16)`, `.max(64)`, `.regex(/^[A-Za-z0-9]+$/)` com mensagens em PT-BR
- [x] 2.2 `fiscal-settings-schema.ts:45` — `idCsc`: `.regex(/^\d{1,6}$/)` com mensagem em PT-BR
- [x] 2.3 Manter os campos opcionais enquanto vazios: a validação só vale quando preenchidos, para não travar o cadastro parcial da configuração
- [x] 2.4 Comentar no schema por que o mínimo é 16 e não 32 (tamanho varia por UF)

## 3. Formulário

- [x] 3.1 `fiscal-settings-detail-page.vue` — corrigir o `maxlength` do "ID do CSC" de 20 para 6
- [x] 3.2 Texto de apoio no "ID do CSC": token numérico de até 6 posições, emitido junto com o código
- [x] 3.3 Texto de apoio no "Código CSC": obtido no portal da SEFAZ da UF (credenciamento NFC-e); par específico do ambiente
- [x] 3.4 Deixar explícito na tela que o par CSC/idCSC de homologação não vale em produção
- [x] 3.5 Conferir que o valor do CSC não é escrito em nenhum `console.*` nem em toast

## 4. Testes

- [x] 4.1 `fiscal-settings-schema.spec.ts`: CSC de 6 caracteres recusado (o caso real da rejeição 464)
- [x] 4.2 CSC de 32 caracteres aceito; CSC de 64 aceito; 65 recusado
- [x] 4.3 idCSC `'000001'` aceito; `'abc'` e `'1234567'` recusados
- [x] 4.4 Campo vazio continua válido (cadastro parcial)
- [x] 4.5 `npm run verify` verde (lint + testes + build)
