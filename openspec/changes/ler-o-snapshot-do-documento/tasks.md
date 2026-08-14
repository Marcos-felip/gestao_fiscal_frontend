> **Defeito encontrado em 14/08/2026**, ao explicar para que serve o snapshot: a
> seção vinha vazia em toda nota.

## 1. Contrato

- [x] 1.1 Value object reescrito no formato real (versão 2, chaves em português)
- [x] 1.2 Quadro tributário do item (`imposto.icms/pis/cofins`) descrito
- [x] 1.3 Grupos da NF-e descritos: `destinatarioNfe`, `nfe`, transporte e cobrança
- [x] 1.4 Conferido contra o JSON real do banco, não contra a intenção

## 2. Leitura

- [x] 2.1 Mapper próprio com Zod, substituindo o `as FiscalSnapshot`
- [x] 2.2 Formato desconhecido devolve `null` e registra no console
- [x] 2.3 Snapshot ilegível **não** derruba o documento — a nota tem chave, protocolo e XML
- [x] 2.4 `snapshotIlegivel` na entidade, para a tela distinguir de "sem snapshot"

## 3. Tela

- [x] 3.1 Itens lidos de `itens`, com unidade e situação tributária
- [x] 3.2 Pagamentos lidos de `pagamentos`, com o rótulo em português
- [x] 3.3 Aviso de retrato ilegível, apontando o XML
- [x] 3.4 Seção "Operação" com natureza, tipo, finalidade e destino da mercadoria
- [x] 3.5 Seção "Destinatário", da NF-e ou da NFC-e identificada
- [x] 3.6 Seção "Totais fiscais"
- [x] 3.7 Seção "Transporte e cobrança" quando informados
- [x] 3.8 Recebido e troco exibidos quando houver

## 4. Testes

- [x] 4.1 Mapper do snapshot: formato real, quadro tributário, grupos da NF-e
- [x] 4.2 Formato antigo em inglês devolve `null` e avisa
- [x] 4.3 Item sem CFOP recusado; item sem imposto tolerado
- [x] 4.4 Fixture do mapper de documento trocado pelo JSON real
- [x] 4.5 `npm run verify` verde — 363 testes

## 5. Verificação

- [ ] 5.1 **Abrir a NF-e nº 5 e conferir na tela** — o defeito nasceu de ninguém
  ter aberto; o teste sozinho não fecha esta change
