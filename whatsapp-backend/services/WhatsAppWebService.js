const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const fs = require('fs');
const path = require('path');
const { MessageService } = require('./MessageService');

class WhatsAppWebService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.qrCode = null;
    this.sessionData = null;
    this.init();
  }

  async init() {
    try {
      // Criar diretório para sessão se não existir
      const sessionDir = path.join(__dirname, '..', '.wwebjs_auth');
      if (!fs.existsSync(sessionDir)) {
        fs.mkdirSync(sessionDir, { recursive: true });
      }

      // Configurar cliente WhatsApp
      this.client = new Client({
        authStrategy: new LocalAuth({
          clientId: "barbearia-whatsapp"
        }),
        puppeteer: {
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
          ]
        }
      });

      // Event listeners
      this.setupEventListeners();

      // Inicializar cliente
      await this.client.initialize();
      
      console.log('🤖 WhatsApp Web Service inicializado');
    } catch (error) {
      console.error('❌ Erro ao inicializar WhatsApp Web Service:', error);
    }
  }

  setupEventListeners() {
    // QR Code gerado
    this.client.on('qr', async (qr) => {
      console.log('📱 QR Code gerado');
      try {
        this.qrCode = await qrcode.toString(qr, { 
          type: 'svg',
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        console.log('✅ QR Code convertido para SVG');
      } catch (error) {
        console.error('❌ Erro ao gerar QR Code:', error);
      }
    });

    // Cliente autenticado
    this.client.on('authenticated', (session) => {
      console.log('✅ WhatsApp autenticado com sucesso');
      this.sessionData = session;
    });

    // Cliente pronto
    this.client.on('ready', () => {
      console.log('🚀 WhatsApp Web está pronto!');
      this.isConnected = true;
      this.qrCode = null; // Limpar QR Code após conexão
    });

    // Cliente desconectado
    this.client.on('disconnected', (reason) => {
      console.log('❌ WhatsApp desconectado:', reason);
      this.isConnected = false;
      this.qrCode = null;
    });

    // Erro de autenticação
    this.client.on('auth_failure', (msg) => {
      console.error('❌ Falha na autenticação:', msg);
      this.isConnected = false;
    });

    // Erro geral
    this.client.on('error', (error) => {
      console.error('❌ Erro no WhatsApp Web:', error);
    });

    // Mensagem recebida (opcional - para logs)
    this.client.on('message', (message) => {
      if (message.from.includes('status@broadcast')) {
        return; // Ignorar status updates
      }
      console.log(`📨 Mensagem recebida de ${message.from}: ${message.body}`);
    });
  }

  // Enviar mensagem
  async sendMessage(phone, message) {
    try {
      if (!this.isConnected) {
        console.log('❌ WhatsApp não está conectado');
        return false;
      }

      // Formatar número do telefone
      const formattedPhone = this.formatPhoneNumber(phone);
      
      if (!formattedPhone) {
        console.log('❌ Número de telefone inválido:', phone);
        return false;
      }

      // Verificar se o número existe no WhatsApp
      const isRegistered = await this.client.isRegisteredUser(formattedPhone);
      if (!isRegistered) {
        console.log('❌ Número não está registrado no WhatsApp:', formattedPhone);
        return false;
      }

      // Enviar mensagem
      await this.client.sendMessage(formattedPhone, message);
      console.log(`✅ Mensagem enviada para ${formattedPhone}: ${message}`);
      
      return true;
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      return false;
    }
  }

  // Formatar número do telefone
  formatPhoneNumber(phone) {
    try {
      // Remover todos os caracteres não numéricos
      let cleanPhone = phone.replace(/\D/g, '');
      
      // Se não começar com código do país, adicionar Brasil (55)
      if (cleanPhone.length === 11 && cleanPhone.startsWith('11')) {
        cleanPhone = '55' + cleanPhone;
      } else if (cleanPhone.length === 10) {
        cleanPhone = '5511' + cleanPhone;
      }
      
      // Adicionar @c.us para WhatsApp
      return cleanPhone + '@c.us';
    } catch (error) {
      console.error('❌ Erro ao formatar número:', error);
      return null;
    }
  }

  // Obter status da conexão
  getStatus() {
    return {
      connected: this.isConnected,
      qrCode: this.qrCode,
      hasSession: !!this.sessionData
    };
  }

  // Obter QR Code
  getQRCode() {
    return this.qrCode;
  }

  // Reiniciar WhatsApp
  async restart() {
    try {
      console.log('🔄 Reiniciando WhatsApp...');
      
      if (this.client) {
        await this.client.destroy();
      }
      
      this.isConnected = false;
      this.qrCode = null;
      this.sessionData = null;
      
      // Aguardar um pouco antes de reinicializar
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await this.init();
      
      return true;
    } catch (error) {
      console.error('❌ Erro ao reiniciar WhatsApp:', error);
      return false;
    }
  }

  // Destruir cliente
  async destroy() {
    try {
      if (this.client) {
        await this.client.destroy();
      }
      console.log('🛑 WhatsApp Web Service destruído');
    } catch (error) {
      console.error('❌ Erro ao destruir WhatsApp Web Service:', error);
    }
  }

  // Métodos específicos para a barbearia
  async enviarConfirmacaoEntrada(nome, telefone, posicao) {
    const mensagem = MessageService.getMensagemEntrada(nome, posicao);
    return await this.sendMessage(telefone, mensagem);
  }

  async enviarAlertaTerceiro(nome, telefone) {
    const mensagem = MessageService.getMensagemTerceiro(nome);
    return await this.sendMessage(telefone, mensagem);
  }

  async enviarAlertaSegundo(nome, telefone) {
    const mensagem = MessageService.getMensagemSegundo(nome);
    return await this.sendMessage(telefone, mensagem);
  }

  async enviarChamadaPrimeiro(nome, telefone) {
    const mensagem = MessageService.getMensagemPrimeiro(nome);
    return await this.sendMessage(telefone, mensagem);
  }
}

module.exports = { WhatsAppWebService };
