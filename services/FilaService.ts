import { Cliente } from '../types';
import { whatsAppService } from './WhatsAppService';
import { databaseService } from './DatabaseService';

class FilaService {
  private monitoramentoAtivo = false;
  private intervalId: NodeJS.Timeout | null = null;

  async adicionarCliente(nome: string, telefone?: string, barbeiro: 'diego' | 'guilherme' | 'qualquer' = 'qualquer'): Promise<string> {
    const clientesAguardando = await databaseService.getClientesAguardando();
    const posicao = clientesAguardando.length + 1;

    const clienteId = await databaseService.inserirCliente({
      nome,
      telefone,
      horarioEntrada: new Date().toISOString(),
      posicao,
      status: 'aguardando',
      notificado: false,
      barbeiro
    });

    // Verificar se deve chamar próximo cliente
    await this.verificarEChamarProximo();

    return clienteId;
  }

  async getFilaAtual(): Promise<Cliente[]> {
    return await databaseService.getClientes();
  }

  async removerCliente(id: string, motivo: 'atendido' | 'ausente' = 'atendido'): Promise<void> {
    try {
      await databaseService.atualizarStatusCliente(id, motivo);
      await this.reorganizarFila();
      await this.verificarAlertas();
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

    // Enviar notificação WhatsApp (se configurado)
    try {
      await whatsAppService.enviarChamadaPrimeiro(proximoCliente);
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
    }

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
        }
      }
    } catch (error) {
      console.error('Erro ao reorganizar fila:', error);
      throw error;
    }
  }

  async verificarAlertas(): Promise<void> {
    const clientesAguardando = await databaseService.getClientesAguardando();
    
    // Enviar notificação para o 3º da fila
    if (clientesAguardando.length >= 3) {
      const terceiro = clientesAguardando[2];
      if (!terceiro.notificado) {
        try {
          await whatsAppService.enviarAlertaTerceiro(terceiro);
        } catch (error) {
          console.error('Erro ao enviar notificação para 3º:', error);
        }
      }
    }

    // Enviar notificação para o 1º da fila
    if (clientesAguardando.length >= 1) {
      const primeiro = clientesAguardando[0];
      if (!primeiro.notificado) {
        try {
          await whatsAppService.enviarChamadaPrimeiro(primeiro);
        } catch (error) {
          console.error('Erro ao enviar notificação para 1º:', error);
        }
      }
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
}

export const filaService = new FilaService(); 