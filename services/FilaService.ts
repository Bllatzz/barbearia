import { Cliente } from '../types';
import { whatsAppService } from './WhatsAppService';
import { databaseService } from './DatabaseService';
import { backendIntegration } from './BackendIntegration';
import { MessageService } from './MessageService';

class FilaService {
  private monitoramentoAtivo = false;
  private intervalId: ReturnType<typeof setInterval> | null = null;

  async adicionarCliente(
    nome: string,
    telefone?: string,
    barbeiro: 'diego' | 'guilherme' | 'qualquer' = 'qualquer'
  ): Promise<{ id: string; posicao: number }> {
    console.log('🔍 DEBUG - Adicionando cliente:');
    console.log('   Nome:', nome);
    console.log('   Telefone:', telefone);
    console.log('   Barbeiro:', barbeiro);
    
    const clientesAguardando = await databaseService.getClientesAguardando();
    const posicao = clientesAguardando.length + 1;
    
    console.log('   Posição calculada:', posicao);
    console.log('   Clientes aguardando:', clientesAguardando.length);
  
    const clienteId = await databaseService.inserirCliente({
      nome,
      telefone,
      horarioEntrada: new Date().toISOString(),
      posicao,
      status: 'aguardando',
      notificado: false,
      barbeiro,
    });
    
    console.log('   Cliente inserido com ID:', clienteId);

    // Enviar confirmação de entrada na fila (só se admin ativo)
    console.log('🔍 DEBUG - Verificando envio de mensagem:');
    console.log('   Telefone:', telefone);
    console.log('   Admin ativo:', whatsAppService.isAdminModeActive());
    
    if (telefone && whatsAppService.isAdminModeActive()) {
      try {
        // Adicionar +55 automaticamente no backend
        const telefoneCompleto = this.formatarTelefoneBrasil(telefone);
        const mensagem = MessageService.getMensagemEntrada(nome, posicao);
        
        console.log('📱 Enviando mensagem:');
        console.log('   Para:', telefoneCompleto);
        console.log('   Mensagem:', mensagem);
        
        const sucesso = await backendIntegration.sendMessage(telefoneCompleto, mensagem);
        console.log('   Sucesso:', sucesso);
      } catch (error) {
        console.error('❌ Erro ao enviar confirmação de entrada:', error);
      }
    } else {
      console.log('❌ Não enviou mensagem - telefone ou admin não ativo');
    }
  
    await this.verificarEChamarProximo();
  
    return { id: clienteId, posicao };
  }  

  async getFilaAtual(): Promise<Cliente[]> {
    return await databaseService.getClientes();
  }

  async removerCliente(id: string, motivo: 'atendido' | 'ausente' = 'atendido'): Promise<void> {
    try {
      console.log(`🗑️ Removendo cliente ${id} - Motivo: ${motivo}`);
      await databaseService.atualizarStatusCliente(id, motivo);
      await this.reorganizarFila();
      await this.verificarAlertas();
      console.log(`✅ Cliente ${id} removido e fila reorganizada`);
    } catch (error) {
      console.error('Erro ao remover cliente:', error);
      throw error;
    }
  }

  async chamarProximoCliente(barbeiro?: 'diego' | 'guilherme' | 'qualquer'): Promise<Cliente | null> {
    const clientesChamados = await databaseService.getClientesChamados();
    const clientesAguardando = await databaseService.getClientesAguardando();

    if (clientesAguardando.length === 0) {
      return null;
    }

    if (clientesChamados.length >= 2) {
      return null;
    }

    // Se um barbeiro específico foi especificado, verificar se já tem cliente chamado
    if (barbeiro && barbeiro !== 'qualquer') {
      const clienteBarbeiro = clientesChamados.find(c => c.barbeiro === barbeiro);
      if (clienteBarbeiro) {
        return null;
      }
    }

    // Encontrar próximo cliente disponível
    let proximoCliente: Cliente | null = null;
    
    if (barbeiro && barbeiro !== 'qualquer') {
      // Procurar cliente que prefere este barbeiro ou qualquer
      proximoCliente = clientesAguardando.find(c => 
        c.barbeiro === barbeiro || c.barbeiro === 'qualquer'
      ) || null;
    } else {
      // Qualquer cliente disponível
      proximoCliente = clientesAguardando[0];
    }

    if (!proximoCliente) {
      return null;
    }

    // Chamar o cliente
    await databaseService.atualizarStatusCliente(proximoCliente.id, 'chamado');

    // Enviar notificação WhatsApp (só se admin ativo)
    if (whatsAppService.isAdminModeActive() && proximoCliente.telefone) {
      try {
        const telefoneCompleto = this.formatarTelefoneBrasil(proximoCliente.telefone);
        const mensagem = MessageService.getMensagemPrimeiro(proximoCliente.nome);
        await backendIntegration.sendMessage(telefoneCompleto, mensagem);
        console.log(`📱 Cliente ${proximoCliente.nome} foi chamado e notificado`);
      } catch (error) {
        console.error('Erro ao enviar notificação:', error);
      }
    }

    // Reorganizar fila após chamar cliente
    await this.reorganizarFila();

    return proximoCliente;
  }

  async adicionarClienteManual(nome: string, telefone?: string, barbeiro: 'diego' | 'guilherme' | 'qualquer' = 'qualquer'): Promise<string> {
    const clientesAguardando = await databaseService.getClientesAguardando();
    const posicaoFinal = clientesAguardando.length + 1;

    const clienteId = await databaseService.inserirCliente({
      nome,
      telefone,
      horarioEntrada: new Date().toISOString(),
      posicao: posicaoFinal,
      status: 'aguardando',
      notificado: false,
      barbeiro
    });

    // Verificar se deve chamar próximo cliente
    await this.verificarEChamarProximo();

    return clienteId;
  }

  async verificarEChamarProximo(): Promise<void> {
    const clientesChamados = await databaseService.getClientesChamados();
    const clientesAguardando = await databaseService.getClientesAguardando();

    if (clientesAguardando.length === 0) {
      return;
    }

    if (clientesChamados.length >= 2) {
      return;
    }

    // Verificar se há vagas para Diego
    if (clientesChamados.filter(c => c.barbeiro === 'diego').length === 0) {
      await this.chamarProximoCliente('diego');
    }

    // Verificar se há vagas para Guilherme
    if (clientesChamados.filter(c => c.barbeiro === 'guilherme').length === 0) {
      await this.chamarProximoCliente('guilherme');
    }
  }

  async reorganizarFila(): Promise<void> {
    try {
      const clientesAguardando = await databaseService.getClientesAguardando();

      for (let i = 0; i < clientesAguardando.length; i++) {
        const novaPosicao = i + 1;
        const cliente = clientesAguardando[i];
        
        if (cliente.posicao !== novaPosicao) {
          await databaseService.atualizarPosicaoCliente(cliente.id, novaPosicao);
          console.log(`📝 Posição atualizada: ${cliente.nome} - Posição ${novaPosicao}`);
        }
      }
    } catch (error) {
      console.error('Erro ao reorganizar fila:', error);
      throw error;
    }
  }

  async verificarAlertas(): Promise<void> {
    // Só enviar alertas se admin estiver ativo
    if (!whatsAppService.isAdminModeActive()) {
      return;
    }

    const clientesAguardando = await databaseService.getClientesAguardando();
    
    console.log(`🔍 Verificando alertas para ${clientesAguardando.length} clientes aguardando`);
    
    // Enviar notificação para o 3º da fila (posição 3) - apenas uma vez
    if (clientesAguardando.length >= 3) {
      const terceiro = clientesAguardando[2];
      if (terceiro.posicao === 3 && terceiro.telefone && !terceiro.notificado) {
        try {
          const telefoneCompleto = this.formatarTelefoneBrasil(terceiro.telefone);
          const mensagem = MessageService.getMensagemTerceiro(terceiro.nome);
          await backendIntegration.sendMessage(telefoneCompleto, mensagem);
          await databaseService.marcarComoNotificado(terceiro.id);
          console.log(`📱 Alerta 3º enviado para ${terceiro.nome}`);
        } catch (error) {
          console.error('Erro ao enviar notificação para 3º:', error);
        }
      }
    }

    // Enviar notificação para o 2º da fila (posição 2) - apenas uma vez
    if (clientesAguardando.length >= 2) {
      const segundo = clientesAguardando[1];
      if (segundo.posicao === 2 && segundo.telefone && !segundo.notificado) {
        try {
          const telefoneCompleto = this.formatarTelefoneBrasil(segundo.telefone);
          const mensagem = MessageService.getMensagemSegundo(segundo.nome);
          await backendIntegration.sendMessage(telefoneCompleto, mensagem);
          await databaseService.marcarComoNotificado(segundo.id);
          console.log(`📱 Alerta 2º enviado para ${segundo.nome}`);
        } catch (error) {
          console.error('Erro ao enviar notificação para 2º:', error);
        }
      }
    }
  }

  // Método para enviar notificação de mudança de posição
  async enviarNotificacaoPosicao(cliente: Cliente, novaPosicao: number): Promise<void> {
    if (!whatsAppService.isAdminModeActive() || !cliente.telefone) {
      return;
    }

    try {
      const telefoneCompleto = this.formatarTelefoneBrasil(cliente.telefone);
      const mensagem = MessageService.getMensagemPorPosicao(cliente.nome, novaPosicao);
      await backendIntegration.sendMessage(telefoneCompleto, mensagem);
      console.log(`📱 Notificação de posição enviada para ${cliente.nome} - Posição ${novaPosicao}`);
    } catch (error) {
      console.error('Erro ao enviar notificação de posição:', error);
    }
  }

  // Sistema de monitoramento automático
  iniciarMonitoramento(): void {
    if (this.monitoramentoAtivo) {
      return;
    }

    this.monitoramentoAtivo = true;
    this.intervalId = setInterval(async () => {
      try {
        await this.verificarEChamarProximo();
      } catch (error) {
        console.error('Erro no monitoramento automático:', error);
      }
    }, 3000); // Verificar a cada 3 segundos
  }

  pararMonitoramento(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.monitoramentoAtivo = false;
  }

  isMonitoramentoAtivo(): boolean {
    return this.monitoramentoAtivo;
  }

  onFilaChange(callback: (clientes: Cliente[]) => void): () => void {
    return databaseService.onFilaChange(callback);
  }

  // Método para formatar telefone brasileiro automaticamente
  private formatarTelefoneBrasil(telefone: string): string {
    // Remove todos os caracteres não numéricos
    let numeros = telefone.replace(/\D/g, '');
    
    // Se já tem código do país (55), remove para processar
    if (numeros.startsWith('55') && numeros.length >= 12) {
      numeros = numeros.substring(2); // Remove o 55
    }
    
    // Corrigir duplo 9 (celular com 2 noves) - ex: 31996702935 -> 3196702935
    if (numeros.length === 11 && numeros.charAt(2) === '9' && numeros.charAt(3) === '9') {
      // Remove o segundo 9 (posição 3)
      numeros = numeros.substring(0, 3) + numeros.substring(4);
    }
    
    // Adicionar +55 de volta
    const telefoneFinal = `+55${numeros}`;
    
    // Validar se o número tem tamanho correto (10 ou 11 dígitos)
    if (numeros.length >= 10 && numeros.length <= 11) {
      return telefoneFinal;
    }
    
    // Se o número é muito curto ou muito longo, retorna como estava
    return telefone;
  }
}

export const filaService = new FilaService(); 