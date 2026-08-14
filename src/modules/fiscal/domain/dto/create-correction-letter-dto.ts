/**
 * Texto da carta de correção.
 *
 * Não há campo de sequência: quem a atribui é o servidor, a partir das
 * correções que a nota já tem.
 */
export class CreateCorrectionLetterDto {
  readonly correcao: string

  constructor(correcao: string) {
    this.correcao = correcao
  }
}
