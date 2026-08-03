## 1. Fundação do módulo fiscal (frontend)

- [ ] 1.1 Criar `src/modules/fiscal/**` (domain/data/application/factories/presentation)
- [ ] 1.2 Enums espelho: `fiscal-document-model` (55/65), `fiscal-environment` (homologação/produção), `fiscal-document-status`
- [ ] 1.3 Entidades: `FiscalDocument`, `FiscalDocumentEvent`, `FiscalSettings` (decimais string → toNumber)
- [ ] 1.4 Mappers (+specs), repositórios (httpClient → Either) e interfaces
- [ ] 1.5 Route names + rotas (gated por permissão) + item(ns) de sidebar

## 2. Configuração fiscal (empresa + estabelecimento)

- [ ] 2.1 Tela de configuração fiscal do estabelecimento (ambiente, série/numeração NFC-e, CSC/idCSC)
- [ ] 2.2 Formulário read-only quando sem `fiscal.settings.edit` (padrão de gating do app)
- [ ] 2.3 Complementar os dados fiscais da empresa (CRT, IE/IM, IBGE, contribuinte ICMS) na página de Empresa
- [ ] 2.4 Indicador visual de "configuração fiscal completa/incompleta"

## 3. Certificado A1

- [ ] 3.1 Upload do certificado A1 (.pfx) + senha (envio seguro, sem exibir a senha)
- [ ] 3.2 Exibir validade e titular do certificado
- [ ] 3.3 Alerta de certificado próximo do vencimento / vencido
- [ ] 3.4 Substituir certificado
- [ ] 3.5 Botão "testar comunicação com a SEFAZ" com feedback (toast/estado)

## 4. Pendências fiscais dos produtos

- [ ] 4.1 Tela/painel de produtos com pendência fiscal (consome relatório do backend)
- [ ] 4.2 Adicionar seção fiscal ao formulário de produto (NCM, CEST, origem, CFOP, CSOSN/CST, alíquotas, unidade, GTIN)
- [ ] 4.3 Máscaras/validações client-side dos campos fiscais
- [ ] 4.4 Indicador de "produto fiscalmente completo" na lista/detalhe

## 5. Emissão de NFC-e (a partir da venda)

- [ ] 5.1 Gatilho de emissão na venda concluída (PDV e/ou detalhe da venda)
- [ ] 5.2 Estado de progresso da emissão assíncrona (PENDENTE/PROCESSANDO → AUTORIZADO/REJEITADO)
- [ ] 5.3 Bloquear/avisar quando configuração ou produtos estiverem incompletos
- [ ] 5.4 Exibir o status fiscal na venda (badge)

## 6. Documentos fiscais (lista e detalhe)

- [ ] 6.1 Lista de documentos fiscais (filtros: status, período, estabelecimento, modelo) paginada
- [ ] 6.2 Badge de status fiscal (cores por situação)
- [ ] 6.3 Detalhe do documento (chave, protocolo, datas, valores, snapshot dos itens/pagamentos)
- [ ] 6.4 Ver/baixar **DANFE**, baixar **XML**, exibir **QR Code**, reimprimir

## 7. Cancelamento e rejeições

- [ ] 7.1 Diálogo de cancelamento com justificativa (mín. 15 caracteres, validação client-side)
- [ ] 7.2 Refletir CANCELADO no documento e na venda
- [ ] 7.3 Central de rejeições (lista + código + mensagem amigável + retorno técnico)
- [ ] 7.4 Ação de retry (reprocessar) a partir do documento rejeitado
- [ ] 7.5 Consulta de situação na SEFAZ a partir do detalhe

## 8. Verificação

- [ ] 8.1 `npm run verify` verde (lint + testes + build); specs dos mappers
- [ ] 8.2 Gating por permissão conferido (esconder/desabilitar conforme `fiscal.*`)
- [ ] 8.3 Dark mode e responsividade conferidos
- [ ] 8.4 Atualizar `AGENTS.md` com o módulo fiscal
