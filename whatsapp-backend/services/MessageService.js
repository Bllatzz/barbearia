// Classe de mensagens centralizada para o sistema da barbearia
class MessageService {
  static getMensagemEntrada(nome, posicao) {
    return `💈 Barbearia Bernardes💈 \nOlá ${nome}, você entrou na fila da Bernardes Barbearia. \nAtualmente você é o número ${posicao} da fila.`;
  }

  static getMensagemTerceiro(nome) {
    return `💈 Barbearia Bernardes💈 \n${nome}, fique de olho, está quase na sua vez! Você é o terceiro na fila`;
  }

  static getMensagemSegundo(nome) {
    return `💈 Barbearia Bernardes💈 \n${nome}, fique atento, você já é o próximo, fique atento.`;
  }

  static getMensagemPrimeiro(nome) {
    return `💈 Barbearia Bernardes💈 \n${nome}, Chegou sua vez, por gentileza, compareça ao estabelecimento.`;
  }

  static getMensagemPorPosicao(nome, posicao) {
    switch (posicao) {
      case 3:
        return this.getMensagemTerceiro(nome);
      case 2:
        return this.getMensagemSegundo(nome);
      case 1:
        return this.getMensagemPrimeiro(nome);
      default:
        return `💈 Barbearia Bernardes💈 \n${nome}, você está na posição ${posicao} da fila.`;
    }
  }

  static getMensagemTeste() {
    return '🧪 Teste do sistema da barbearia - WhatsApp funcionando!';
  }

  static getMensagemPersonalizada(nome, mensagemCustomizada) {
    return `💈 Barbearia Bernardes💈 \nOlá ${nome}, ${mensagemCustomizada}`;
  }
}

module.exports = { MessageService };

