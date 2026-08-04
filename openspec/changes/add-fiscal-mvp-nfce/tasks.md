> Escopo: **Fase A** do backend (emissão em homologação). Itens de Fase B/C estão
> na seção 8 (diferidos) e só entram quando o backend liberar os endpoints.

## 1. Fundação do módulo fiscal (frontend)

- [x] 1.1 Criar `src/modules/fiscal/**` (domain/data/application/factories/presentation)
- [x] 1.2 Enums espelho: `fiscal-document-model` (NFE/NFCE), `fiscal-environment` (HOMOLOGACAO/PRODUCAO), `fiscal-document-status` (10 valores), `sale-fiscal-status` (5 valores — o `FiscalStatus` da venda), `tax-regime-code` (CRT), `fiscal-payment-code`
- [x] 1.3 Entidades: `FiscalDocument`, `FiscalStatusHistory`, `FiscalDocumentEvent`, `FiscalSettings` (decimais string → `toNumber`; datas ISO → Date/format)
- [x] 1.4 Mappers (+specs) tolerando `valorTotal`/alíquotas como string e campos `null`; repositórios (httpClient → Either) e interfaces
- [x] 1.5 Response paginada `{ data, total, page, limit }` para documentos (mapper calcula `totalPages`/`hasNext`)
- [x] 1.6 Route names + rotas (gated por `fiscal.*`) + item(ns) de sidebar

## 2. Configuração fiscal do estabelecimento

- [x] 2.1 Tela de configuração fiscal por estabelecimento (`GET /fiscal/settings` + `GET/POST/PATCH /fiscal/settings/:establishmentId`): ambiente, série, próximo número, CSC/idCSC
- [x] 2.2 Tratar `GET /fiscal/settings/:establishmentId` retornando `null` (200) → estado "sem configuração" com ação de criar
- [x] 2.3 Formulário read-only quando sem `fiscal.settings.edit` (padrão de gating do app)
- [x] 2.4 Exibir metadados do certificado (validade/titular) quando presentes; alerta a ≤30 dias do vencimento / vencido
- [x] 2.5 Indicador visual de "configuração fiscal completa/incompleta" do estabelecimento

## 3. Dados fiscais da empresa

> ⚠️ BLOQUEADO (backend): `UpdateCompanyDto` (PATCH `/companies/:id`) NÃO aceita os
> campos fiscais (CRT, IBGE, contribuinte ICMS, IE/IM, razão social, tel/e-mail
> fiscal) — eles só existem no `onboarding.dto` (one-time). Precisa o backend
> estender `UpdateCompanyDto` ou expor `PATCH /companies/:id/fiscal` antes de 3.1.
> Enquanto isso, exibir só leitura do indicador `fiscalConfigComplete`.

- [ ] 3.1 (bloqueado) Complementar dados fiscais da empresa (CRT, IE/IM, código IBGE, contribuinte ICMS, tel/e-mail fiscal) na página de Empresa — aguarda endpoint de update
- [ ] 3.2 Indicador `fiscalConfigComplete` da empresa (somente leitura por enquanto)
- [ ] 3.3 Máscaras/validações client-side (CNPJ, IE, IBGE, CEP) — quando 3.1 desbloquear

## 4. Dados e pendências fiscais dos produtos

> ⚠️ PARCIALMENTE BLOQUEADO (backend): o `CreateProductDto` só declara `ncm`, `cest`,
> `cfop` e `origin` entre os campos fiscais; com `ValidationPipe({ whitelist: true })`,
> `csosn`, `cstIcms/Pis/Cofins` e as alíquotas enviados são DESCARTADOS no save. Além
> disso, `fiscalComplete` NÃO é derivado por nenhuma lógica (fica sempre `false`).
> O frontend já envia/exibe tudo com os nomes corretos, mas só persiste/valida quando
> o backend adicionar esses campos ao `CreateProductDto` e derivar `fiscalComplete`.

- [x] 4.1 Seção fiscal no formulário de produto (NCM, CEST, origem, CFOP, CSOSN/CST ICMS/PIS/COFINS, alíquotas, unidade, GTIN) — frontend pronto
- [x] 4.2 Máscaras/validações client-side dos campos fiscais
- [x] 4.3 Indicador `fiscalComplete` na lista/detalhe de produto (somente leitura)
- [x] 4.4 Lista/painel de produtos com pendência fiscal (filtro client-side na página atual; sem endpoint dedicado na Fase A)

## 5. Emissão de NFC-e (a partir da venda)

- [ ] 5.1 Gatilho de emissão na venda concluída — `POST /fiscal/documents/nfce { saleId, establishmentId?, payments? }` (PDV e/ou detalhe da venda), gated por `fiscal.emit`
- [ ] 5.2 Acompanhar status assíncrono por **polling** (`GET /fiscal/documents/:id` ou `/documents/sale/:saleId`): PENDENTE → PROCESSANDO → AUTORIZADO/REJEITADO/ERRO
- [ ] 5.3 Pré-checagem/aviso quando empresa, estabelecimento ou produtos estiverem incompletos + tratar erro 400 de configuração incompleta do backend
- [ ] 5.4 Badge de status fiscal na venda (enum `FiscalStatus` de 5 valores) e exibir código/mensagem de rejeição quando REJEITADO/ERRO

## 6. Documentos fiscais (lista e detalhe)

- [x] 6.1 Lista de documentos fiscais (`GET /fiscal/documents`) paginada, filtros: status, período (createdAt), estabelecimento, modelo
- [x] 6.2 Badge de status fiscal do documento (`FiscalDocumentStatus`, cores por situação)
- [x] 6.3 Detalhe do documento (`GET /fiscal/documents/:id`): chave, protocolo, datas, `valorTotal`, snapshot dos itens/pagamentos, `statusHistory[]` e `events[]`
- [x] 6.4 Download do **XML** (`GET /fiscal/documents/:id/xml/:tipo` — string crua → blob `text/xml`), com `:tipo ∈ enviado|autorizado|cancelamento` conforme disponível

## 7. Verificação

- [ ] 7.1 `npm run verify` verde (lint + testes + build); specs dos mappers
- [ ] 7.2 Gating por permissão conferido (esconder/desabilitar conforme `fiscal.*`; OWNER sempre passa; backend semeia só ADMIN)
- [ ] 7.3 Dark mode e responsividade conferidos
- [ ] 7.4 Atualizar `AGENTS.md` com o módulo fiscal

## 8. Diferido — Fase B/C (aguardando endpoints do backend)

- [ ] 8.1 Upload/substituição de certificado A1 (.pfx) — quando existir rota de upload
- [ ] 8.2 Botão "testar comunicação com a SEFAZ" — quando existir endpoint
- [ ] 8.3 Cancelamento com justificativa (mín. 15 caracteres) — Fase B
- [ ] 8.4 Central de rejeições + ação de retry — Fase B
- [ ] 8.5 Consulta de situação na SEFAZ a partir do detalhe — Fase B
- [ ] 8.6 Ver/baixar DANFE, exibir QR Code, reimprimir — quando populados/servidos
- [ ] 8.7 Ativação de produção / checklist — Fase C
