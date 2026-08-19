## Context

Com a distribuição da SEFAZ, notas passam a aparecer sem que ninguém as tenha
pedido. A interface ganha uma caixa de entrada fiscal — e, junto, o poder de
declarar coisas à SEFAZ por um botão.

A change irmã deste repositório já entregou a tela de conferência do XML. Esta
acrescenta a origem e a decisão que vem antes dela.

## Goals / Non-Goals

**Goals:**

- Fazer o usuário entender o que cada manifestação significa antes de enviá-la.
- Dar à nota fria a chance de ser notada.
- Reaproveitar inteira a tela de conferência que já existe.
- Não deixar a descoberta falhar em silêncio.

**Non-Goals:**

- Refazer a conferência de itens.
- Manifestar automaticamente — o backend já decidiu que nenhum evento sai sozinho.
- Controlar o prazo legal da manifestação (dívida registrada no backend).
- CT-e e MDF-e.

## Decisions

### Códigos de evento não aparecem como código

`210210` não diz nada a quem opera a loja. A tela mostra "Ciência da operação" com
uma linha do que ela faz — "confirma que você soube da operação e libera o
detalhe da nota". O código continua existindo no contrato e na auditoria, não na
decisão.

### Desconhecimento e operação não realizada pedem confirmação; ciência não

Ciência é reversível na prática (é o passo natural para ver a nota) e é o caminho
que o usuário vai percorrer sempre. Pedir confirmação nela treinaria o usuário a
clicar "sim" sem ler — e aí a confirmação que importa, a do desconhecimento,
perderia o efeito.

Desconhecimento e operação não realizada são declarações contra o emitente. Ganham
o mesmo tratamento do cancelamento de documento, que já pede confirmação.

### Resumo e nota completa são a mesma linha, com estados diferentes

Duas listas ("resumos" e "notas") obrigariam o usuário a entender uma distinção
que é nossa, não dele. É uma lista só; o que muda é o que a linha oferece.

### A caixa de entrada é destino próprio, não uma aba de compras

Ela contém notas que **não são** compras — nota fria, nota errada, nota de outro
CNPJ do mesmo grupo. Pendurá-la em compras diria que tudo ali vira compra, que é
justamente o que a manifestação existe para negar.

### O estado da descoberta fica na própria caixa de entrada

Última consulta e recusa por frequência aparecem na tela, não escondidos em
configuração. "Nenhuma nota nova" e "a consulta falha há três dias" produzem a
mesma tela vazia — e a segunda é uma compra que ninguém viu chegar.

## Risks / Trade-offs

- **Manifestação por engano não tem desfazer.** Mitigação: efeito escrito antes,
  confirmação nas duas destrutivas. Não há mais o que a interface possa fazer —
  o evento é da SEFAZ.
- **Caixa de entrada barulhenta.** A primeira carga de uma empresa antiga pode
  trazer centenas de notas velhas. O backend as marca como histórico; a tela
  precisa respeitar isso, ou a caixa nasce inutilizável.
- **O destaque de emitente desconhecido pode virar ruído** se todo fornecedor
  novo aparecer destacado. É o preço aceito: falso positivo aqui custa um olhar,
  falso negativo custa uma nota fria aceita.
