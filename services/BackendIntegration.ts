import { Cliente } from '../types';
import { MessageService } from './MessageService';

class BackendIntegration {
  private backendUrl: string = 'http://localhost:8000';
  private isConnected: boolean = false;

  // Verificar se o backend está rodando
  async checkBackendStatus(): Promise<boolean> {
    try {
      const response = await fetch(`${this.backendUrl}/whatsapp/status`, {
        method: 'GET',
        timeout: 5000
      });
      
      if (response.ok) {
        this.isConnected = true;
        return true;
      }
    } catch (error) {
      console.log('Backend WhatsApp não está rodando:', error);
      this.isConnected = false;
    }
    
    return false;
  }

  // Enviar mensagem via backend
  async sendMessage(phone: string, message: string): Promise<boolean> {
    try {
      console.log('🔍 DEBUG - BackendIntegration.sendMessage:');
      console.log('   Telefone original:', phone);
      
      // Formatar telefone automaticamente
      const telefoneFormatado = this.formatarTelefoneBrasil(phone);
      console.log('   Telefone formatado:', telefoneFormatado);
      console.log('   Mensagem:', message);
      console.log('   URL:', `${this.backendUrl}/notify`);
      
      const response = await fetch(`${this.backendUrl}/notify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: telefoneFormatado,
          message: message
        })
      });

      console.log('   Status da resposta:', response.status);
      console.log('   Response OK:', response.ok);
      
      const result = await response.json();
      console.log('   Resultado do servidor:', result);
      
      const sucesso = result.success;
      console.log('   Sucesso final:', sucesso);
      
      return sucesso;
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem via backend:', error);
      console.error('   Detalhes do erro:', error.message);
      return false;
    }
  }

  // Adicionar cliente na fila (integração completa)
  async addClientToQueue(nome: string, telefone?: string, barbeiro: 'diego' | 'guilherme' | 'qualquer' = 'qualquer'): Promise<{ id: string; posicao: number; whatsappSent: boolean }> {
    try {
      // Primeiro, adicionar cliente localmente (seu sistema existente)
      const { filaService } = await import('./FilaService');
      const resultado = await filaService.adicionarCliente(nome, telefone, barbeiro);
      
      // Se tem telefone e backend está rodando, enviar WhatsApp
      let whatsappSent = false;
      if (telefone && this.isConnected) {
        const telefoneFormatado = this.formatarTelefoneBrasil(telefone);
        const mensagem = MessageService.getMensagemEntrada(nome, resultado.posicao);
        whatsappSent = await this.sendMessage(telefoneFormatado, mensagem);
      }

      return {
        id: resultado.id,
        posicao: resultado.posicao,
        whatsappSent
      };
    } catch (error) {
      console.error('Erro ao adicionar cliente:', error);
      throw error;
    }
  }

  // Notificar mudança de posição
  async notifyPositionChange(cliente: Cliente, novaPosicao: number): Promise<boolean> {
    if (!cliente.telefone || !this.isConnected) {
      return false;
    }

    const mensagem = MessageService.getMensagemPorPosicao(cliente.nome, novaPosicao);
    
    if (novaPosicao > 3) {
      return false; // Não enviar para outras posições
    }

    const telefoneFormatado = this.formatarTelefoneBrasil(cliente.telefone);
    return await this.sendMessage(telefoneFormatado, mensagem);
  }

  // Verificar status do WhatsApp Web
  async getWhatsAppStatus(): Promise<any> {
    try {
      const response = await fetch(`${this.backendUrl}/whatsapp/status`);
      return await response.json();
    } catch (error) {
      console.error('Erro ao verificar status WhatsApp:', error);
      return { connected: false, error: error.message };
    }
  }

  // Reiniciar WhatsApp Web
  async restartWhatsApp(): Promise<boolean> {
    try {
      const response = await fetch(`${this.backendUrl}/whatsapp/restart`, {
        method: 'POST'
      });
      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Erro ao reiniciar WhatsApp:', error);
      return false;
    }
  }

  // Testar envio de mensagem
  async testMessage(phone: string, message: string): Promise<boolean> {
    const telefoneFormatado = this.formatarTelefoneBrasil(phone);
    return await this.sendMessage(telefoneFormatado, message);
  }

  // Configurar URL do backend
  setBackendUrl(url: string): void {
    this.backendUrl = url;
  }

  // Verificar se está conectado
  isBackendConnected(): boolean {
    return this.isConnected;
  }

  // Obter URL do backend
  getBackendUrl(): string {
    return this.backendUrl;
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

export const backendIntegration = new BackendIntegration();
