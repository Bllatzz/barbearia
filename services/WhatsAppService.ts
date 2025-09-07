import { Cliente } from '../types';
import { databaseService } from './DatabaseService';

class WhatsAppService {
  private apiKey: string = '';
  private apiUrl: string = '';
  private useWebWhatsApp: boolean = true; // Ativado por padrão
  private webServerUrl: string = 'http://localhost:8000'; // URL do servidor WhatsApp Web
  private isAdminMode: boolean = true; // Modo admin ativo por padrão

  async init(): Promise<void> {
    const configs = await databaseService.getConfiguracoes();
    if (configs.length > 0) {
      this.apiKey = configs[0].whatsappApiKey;
      this.apiUrl = configs[0].whatsappApiUrl;
    }
  }

  async enviarMensagem(telefone: string, mensagem: string): Promise<boolean> {
    try {
      // Só enviar se estiver no modo admin
      if (!this.isAdminMode) {
        console.log('WhatsApp desabilitado - modo admin não ativo');
        return false;
      }

      // Priorizar WhatsApp Web se estiver ativo
      if (this.useWebWhatsApp) {
        const webSuccess = await this.enviarViaWebWhatsApp(telefone, mensagem);
        if (webSuccess) {
          return true;
        }
        console.log('WhatsApp Web falhou, tentando API externa...');
      }

      // Fallback para APIs externas
      if (!this.apiKey || !this.apiUrl) {
        console.log('WhatsApp API não configurada');
        return false;
      }

      // Exemplo para Twilio
      if (this.apiUrl.includes('twilio')) {
        return await this.enviarViaTwilio(telefone, mensagem);
      }
      
      // Exemplo para Z-API
      if (this.apiUrl.includes('z-api')) {
        return await this.enviarViaZApi(telefone, mensagem);
      }

      // Exemplo para Wati
      if (this.apiUrl.includes('wati')) {
        return await this.enviarViaWati(telefone, mensagem);
      }

      // Exemplo para UltraMsg
      if (this.apiUrl.includes('ultramsg')) {
        return await this.enviarViaUltraMsg(telefone, mensagem);
      }

      // API genérica
      return await this.enviarViaApiGenerica(telefone, mensagem);

    } catch (error) {
      console.error('Erro ao enviar mensagem WhatsApp:', error);
      return false;
    }
  }

  private async enviarViaWebWhatsApp(telefone: string, mensagem: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.webServerUrl}/notify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: this.formatarTelefoneBrasil(telefone),
          message: mensagem
        })
      });

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Erro ao enviar via WhatsApp Web:', error);
      return false;
    }
  }

  private async enviarViaTwilio(telefone: string, mensagem: string): Promise<boolean> {
    const response = await fetch(`${this.apiUrl}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${this.apiKey}:`)}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        To: `whatsapp:${telefone}`,
        From: 'whatsapp:+14155238886', // Número do Twilio
        Body: mensagem
      })
    });

    return response.ok;
  }

  private async enviarViaZApi(telefone: string, mensagem: string): Promise<boolean> {
    const response = await fetch(`${this.apiUrl}/send-text`, {
      method: 'POST',
      headers: {
        'Client-Token': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: telefone,
        message: mensagem
      })
    });

    return response.ok;
  }

  private async enviarViaWati(telefone: string, mensagem: string): Promise<boolean> {
    const response = await fetch(`${this.apiUrl}/sendMessage`, {
      method: 'POST',
      headers: {
        'Authorization': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumbers: [telefone],
        message: mensagem
      })
    });

    return response.ok;
  }

  private async enviarViaUltraMsg(telefone: string, mensagem: string): Promise<boolean> {
    const response = await fetch(`${this.apiUrl}/messages/send`, {
      method: 'POST',
      headers: {
        'Authorization': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: telefone,
        message: mensagem
      })
    });

    return response.ok;
  }

  private async enviarViaApiGenerica(telefone: string, mensagem: string): Promise<boolean> {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: telefone,
        message: mensagem
      })
    });

    return response.ok;
  }

  // Métodos específicos para o sistema da barbearia
  async enviarConfirmacaoEntrada(cliente: Cliente): Promise<boolean> {
    if (!cliente.telefone) return false;

    const mensagem = `💈 Barbearia Bernardes💈 \nOlá ${cliente.nome}, você entrou na fila da Bernardes Barbearia. \nAtualmente você é o número ${cliente.posicao} da fila.`;
    
    const sucesso = await this.enviarMensagem(cliente.telefone, mensagem);
    
    if (sucesso) {
      await databaseService.inserirNotificacao({
        clienteId: cliente.id,
        tipo: 'confirmacao',
        mensagem,
        enviada: true,
        horarioEnvio: new Date().toISOString()
      });
    }

    return sucesso;
  }

  async enviarAlertaTerceiro(cliente: Cliente): Promise<boolean> {
    if (!cliente.telefone) return false;

    const mensagem = `💈 Barbearia Bernardes💈 \nEstá quase na sua vez! Você é o terceiro na fila`;
    
    const sucesso = await this.enviarMensagem(cliente.telefone, mensagem);
    
    if (sucesso) {
      await databaseService.marcarComoNotificado(cliente.id);
      await databaseService.inserirNotificacao({
        clienteId: cliente.id,
        tipo: 'alerta',
        mensagem,
        enviada: true,
        horarioEnvio: new Date().toISOString()
      });
    }

    return sucesso;
  }

  async enviarAlertaSegundo(cliente: Cliente): Promise<boolean> {
    if (!cliente.telefone) return false;

    const mensagem = `Fique pronto, só falta 1 pessoa na sua frente.`;
    
    const sucesso = await this.enviarMensagem(cliente.telefone, mensagem);
    
    if (sucesso) {
      await databaseService.marcarComoNotificado(cliente.id);
      await databaseService.inserirNotificacao({
        clienteId: cliente.id,
        tipo: 'alerta',
        mensagem,
        enviada: true,
        horarioEnvio: new Date().toISOString()
      });
    }

    return sucesso;
  }

  async enviarChamadaPrimeiro(cliente: Cliente): Promise<boolean> {
    if (!cliente.telefone) return false;

    const mensagem = `💈 Barbearia Bernardes💈 \nChegou sua vez, por gentileza, compareça ao estabelecimento.`;
    
    const sucesso = await this.enviarMensagem(cliente.telefone, mensagem);
    
    if (sucesso) {
      await databaseService.marcarComoNotificado(cliente.id);
      await databaseService.inserirNotificacao({
        clienteId: cliente.id,
        tipo: 'chamada',
        mensagem,
        enviada: true,
        horarioEnvio: new Date().toISOString()
      });
    }

    return sucesso;
  }

  // Método para configurar o modo de envio
  setWebWhatsAppMode(useWeb: boolean, serverUrl?: string): void {
    this.useWebWhatsApp = useWeb;
    if (serverUrl) {
      this.webServerUrl = serverUrl;
    }
  }

  // Método para ativar/desativar modo admin
  setAdminMode(isAdmin: boolean): void {
    this.isAdminMode = isAdmin;
    console.log(`WhatsApp modo admin: ${isAdmin ? 'ATIVADO' : 'DESATIVADO'}`);
  }

  // Método para verificar se está no modo admin
  isAdminModeActive(): boolean {
    return this.isAdminMode;
  }

  // Método para verificar status do WhatsApp Web
  async getWebWhatsAppStatus(): Promise<any> {
    try {
      const response = await fetch(`${this.webServerUrl}/whatsapp/status`);
      return await response.json();
    } catch (error) {
      console.error('Erro ao verificar status do WhatsApp Web:', error);
      return { connected: false, error: error.message };
    }
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

export const whatsAppService = new WhatsAppService(); 