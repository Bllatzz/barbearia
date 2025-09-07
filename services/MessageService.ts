export class MessageService {
  private static readonly BARBEARIA_NOME = '💈 Barbearia Bernardes💈';

  /**
   * Gera mensagem de confirmação de entrada na fila
   */
  static getMensagemEntrada(nome: string, posicao: number): string {
    return `${this.BARBEARIA_NOME} \nOlá ${nome}, você entrou na fila da Bernardes Barbearia. \nAtualmente você é o número ${posicao} da fila.`;
  }

  /**
   * Gera mensagem para 3º lugar na fila
   */
  static getMensagemTerceiro(nome: string): string {
    return `${this.BARBEARIA_NOME} \nEstá quase na sua vez! Você é o terceiro na fila`;
  }

  /**
   * Gera mensagem para 2º lugar na fila
   */
  static getMensagemSegundo(nome: string): string {
    return `${this.BARBEARIA_NOME} \n${nome}, fique atento, você já é o próximo, fique atento.`;
  }

  /**
   * Gera mensagem para 1º lugar na fila (sua vez)
   */
  static getMensagemPrimeiro(nome: string): string {
    return `${this.BARBEARIA_NOME} \n${nome}, Chegou sua vez, por gentileza, compareça ao estabelecimento.`;
  }

  /**
   * Gera mensagem para posição específica
   */
  static getMensagemPorPosicao(nome: string, posicao: number): string {
    switch (posicao) {
      case 3:
        return this.getMensagemTerceiro(nome);
      case 2:
        return this.getMensagemSegundo(nome);
      case 1:
        return this.getMensagemPrimeiro(nome);
      default:
        return `${this.BARBEARIA_NOME} \n${nome}, você está na posição ${posicao} da fila.`;
    }
  }

  /**
   * Gera mensagem de teste
   */
  static getMensagemTeste(): string {
    return '🧪 Teste do sistema da barbearia - WhatsApp funcionando!';
  }

  /**
   * Gera mensagem personalizada
   */
  static getMensagemPersonalizada(nome: string, mensagem: string): string {
    return `${this.BARBEARIA_NOME} \n${nome}, ${mensagem}`;
  }
}

