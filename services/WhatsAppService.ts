import { Cliente } from '../types';
import { databaseService } from './DatabaseService';

class WhatsAppService {
  private apiKey: string = '';
  private apiUrl: string = '';

  async init(): Promise<void> {
    const configs = await databaseService.getConfiguracoes();
    if (configs.length > 0) {
      this.apiKey = configs[0].whatsappApiKey;
      this.apiUrl = configs[0].whatsappApiUrl;
    }
  }

  async enviarMensagem(telefone: string, mensagem: string): Promise<boolean> {
    if (!this.apiKey || !this.apiUrl) {
      console.log('WhatsApp API não configurada');
      return false;
    }

    try {
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
  async enviarAlertaTerceiro(cliente: Cliente): Promise<boolean> {
    if (!cliente.telefone) return false;

    const mensagem = `Olá ${cliente.nome}, você é o ${cliente.posicao}º da fila na Bernades Barbearia. Fique atento, sua vez está chegando!`;
    
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

    const mensagem = `Sua vez chegou! Você tem até 5 minutos para se apresentar na Bernades Barbearia. Após isso, passaremos para o próximo cliente.`;
    
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

  async enviarConfirmacao(cliente: Cliente): Promise<boolean> {
    if (!cliente.telefone) return false;

    const mensagem = `Olá ${cliente.nome}, você foi cadastrado na fila da Bernades Barbearia na posição ${cliente.posicao}. Aguarde ser chamado!`;
    
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
}

export const whatsAppService = new WhatsAppService(); 