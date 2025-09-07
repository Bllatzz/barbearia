const express = require('express');
const cors = require('cors');
const path = require('path');
const { WhatsAppWebService } = require('./services/WhatsAppWebService');
const { MessageService } = require('./services/MessageService');

// Função para formatar telefone brasileiro automaticamente
function formatarTelefoneBrasil(telefone) {
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

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Inicializar serviço WhatsApp Web
const whatsappService = new WhatsAppWebService();

// Endpoint para testar envio de mensagem
app.post('/notify', async (req, res) => {
  try {
    const { phone, message } = req.body;
    
    if (!phone || !message) {
      return res.status(400).json({ 
        error: 'Telefone e mensagem são obrigatórios',
        example: {
          phone: '5511999999999',
          message: 'Mensagem de teste'
        }
      });
    }

    // Formatar número do telefone automaticamente para Brasil
    const formattedPhone = formatarTelefoneBrasil(phone);
    
    const success = await whatsappService.sendMessage(formattedPhone, message);
    
    if (success) {
      res.json({ 
        success: true, 
        message: 'Mensagem enviada com sucesso',
        phone: formattedPhone,
        sentMessage: message
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: 'Falha ao enviar mensagem' 
      });
    }
  } catch (error) {
    console.error('Erro no endpoint /notify:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Endpoint para verificar status do WhatsApp
app.get('/whatsapp/status', (req, res) => {
  const status = whatsappService.getStatus();
  res.json(status);
});

// Endpoint para obter QR Code
app.get('/whatsapp/qr', (req, res) => {
  const qrCode = whatsappService.getQRCode();
  if (qrCode) {
    res.json({ qrCode });
  } else {
    res.status(404).json({ error: 'QR Code não disponível' });
  }
});

// Endpoint para reiniciar WhatsApp
app.post('/whatsapp/restart', async (req, res) => {
  try {
    await whatsappService.restart();
    res.json({ success: true, message: 'WhatsApp reiniciado' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint para adicionar cliente na fila (integração com o sistema existente)
app.post('/fila/adicionar', async (req, res) => {
  try {
    const { nome, telefone, barbeiro = 'qualquer' } = req.body;
    
    if (!nome) {
      return res.status(400).json({ error: 'Nome é obrigatório' });
    }

    // Aqui você pode integrar com seu FilaService existente
    // Por enquanto, vou simular a adição
    const posicao = Math.floor(Math.random() * 10) + 1; // Simulação
    
    // Enviar mensagem de confirmação
    if (telefone) {
      const mensagem = MessageService.getMensagemEntrada(nome, posicao);
      await whatsappService.sendMessage(telefone.replace(/\D/g, ''), mensagem);
    }

    res.json({
      success: true,
      cliente: {
        nome,
        telefone,
        posicao,
        barbeiro
      }
    });
  } catch (error) {
    console.error('Erro ao adicionar cliente:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint para notificar mudança de posição
app.post('/fila/notificar-posicao', async (req, res) => {
  try {
    const { telefone, posicao, nome } = req.body;
    
    if (!telefone || !posicao) {
      return res.status(400).json({ error: 'Telefone e posição são obrigatórios' });
    }

    const mensagem = MessageService.getMensagemPorPosicao(nome, posicao);

    const success = await whatsappService.sendMessage(telefone.replace(/\D/g, ''), mensagem);
    
    res.json({
      success,
      mensagem,
      posicao
    });
  } catch (error) {
    console.error('Erro ao notificar posição:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Página principal - apenas informações básicas
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Servidor WhatsApp - Barbearia</title>
        <meta charset="utf-8">
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; background: #f0f0f0; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .info { background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .warning { background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107; }
            .success { background: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745; }
            button { background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin: 5px; }
            button:hover { background: #0056b3; }
            .admin-link { background: #28a745; }
            .admin-link:hover { background: #218838; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🤖 Servidor WhatsApp - Barbearia</h1>
            
            <div class="success">
                <h3>✅ Servidor Ativo</h3>
                <p>O servidor WhatsApp está rodando e pronto para receber requisições.</p>
            </div>
            
            <div class="info">
                <h3>📱 Como Usar</h3>
                <p>1. <strong>Para Clientes:</strong> Use o app React Native normalmente</p>
                <p>2. <strong>Para Admin:</strong> Faça login no painel do app e ative o WhatsApp</p>
                <p>3. <strong>Configuração:</strong> Acesse a interface de admin abaixo</p>
            </div>
            
            <div class="warning">
                <h3>⚠️ Acesso Restrito</h3>
                <p>Esta interface é apenas para configuração do WhatsApp. O app principal é o React Native.</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <button class="admin-link" onclick="window.open('/admin', '_blank')">
                    🔧 Interface Admin WhatsApp
                </button>
                <button onclick="checkStatus()">📊 Verificar Status</button>
            </div>
            
            <div id="status" style="padding: 15px; border-radius: 5px; margin: 20px 0; background: #f8f9fa;">
                Verificando status...
            </div>
        </div>

        <script>
            function checkStatus() {
                fetch('/whatsapp/status')
                    .then(response => response.json())
                    .then(data => {
                        const statusDiv = document.getElementById('status');
                        
                        if (data.connected) {
                            statusDiv.innerHTML = '<strong>✅ WhatsApp Conectado</strong><br>Pronto para enviar mensagens!';
                            statusDiv.style.background = '#d4edda';
                            statusDiv.style.color = '#155724';
                        } else {
                            statusDiv.innerHTML = '<strong>❌ WhatsApp Desconectado</strong><br>Configure na interface admin';
                            statusDiv.style.background = '#f8d7da';
                            statusDiv.style.color = '#721c24';
                        }
                    })
                    .catch(error => {
                        document.getElementById('status').innerHTML = '<strong>❌ Erro</strong><br>Não foi possível verificar status';
                        document.getElementById('status').style.background = '#f8d7da';
                        document.getElementById('status').style.color = '#721c24';
                    });
            }
            
            // Verificar status automaticamente
            checkStatus();
            setInterval(checkStatus, 10000);
        </script>
    </body>
    </html>
  `);
});

// Interface admin para configuração do WhatsApp
app.get('/admin', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Admin WhatsApp - Barbearia</title>
        <meta charset="utf-8">
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; background: #f0f0f0; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .qr-container { text-align: center; margin: 20px 0; }
            .status { padding: 10px; border-radius: 5px; margin: 10px 0; }
            .connected { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
            .disconnected { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
            .loading { background: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb; }
            button { background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin: 5px; }
            button:hover { background: #0056b3; }
            .test-form { margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 5px; }
            input, textarea { width: 100%; padding: 8px; margin: 5px 0; border: 1px solid #ddd; border-radius: 3px; }
            .admin-header { background: #dc3545; color: white; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="admin-header">
                <h1>🔧 Admin WhatsApp - Barbearia</h1>
                <p>Interface de configuração para administradores</p>
            </div>
            
            <div id="status" class="status loading">
                Verificando status...
            </div>
            
            <div id="qr-container" class="qr-container" style="display: none;">
                <h3>Escaneie o QR Code com seu WhatsApp:</h3>
                <div id="qr-code"></div>
            </div>
            
            <div style="text-align: center; margin: 20px 0;">
                <button onclick="checkStatus()">🔄 Verificar Status</button>
                <button onclick="restartWhatsApp()">🔄 Reiniciar WhatsApp</button>
            </div>
            
            <div class="test-form">
                <h3>📱 Teste de Envio</h3>
                <input type="text" id="phone" placeholder="Número do telefone (ex: 5511999999999)" />
                <textarea id="message" placeholder="Mensagem de teste" rows="3">Olá! Esta é uma mensagem de teste da barbearia.</textarea>
                <button onclick="sendTestMessage()">📤 Enviar Mensagem</button>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
                <button onclick="window.location.href='/'">← Voltar ao Servidor</button>
            </div>
        </div>

        <script>
            function checkStatus() {
                fetch('/whatsapp/status')
                    .then(response => response.json())
                    .then(data => {
                        const statusDiv = document.getElementById('status');
                        const qrContainer = document.getElementById('qr-container');
                        const qrCode = document.getElementById('qr-code');
                        
                        if (data.connected) {
                            statusDiv.className = 'status connected';
                            statusDiv.textContent = '✅ WhatsApp conectado e pronto!';
                            qrContainer.style.display = 'none';
                        } else if (data.qrCode) {
                            statusDiv.className = 'status loading';
                            statusDiv.textContent = '⏳ Aguardando conexão...';
                            qrContainer.style.display = 'block';
                            qrCode.innerHTML = data.qrCode;
                        } else {
                            statusDiv.className = 'status disconnected';
                            statusDiv.textContent = '❌ WhatsApp desconectado';
                            qrContainer.style.display = 'none';
                        }
                    })
                    .catch(error => {
                        console.error('Erro:', error);
                        document.getElementById('status').textContent = '❌ Erro ao verificar status';
                    });
            }
            
            function restartWhatsApp() {
                fetch('/whatsapp/restart', { method: 'POST' })
                    .then(response => response.json())
                    .then(data => {
                        alert(data.message);
                        checkStatus();
                    })
                    .catch(error => {
                        alert('Erro ao reiniciar: ' + error.message);
                    });
            }
            
            function sendTestMessage() {
                const phone = document.getElementById('phone').value;
                const message = document.getElementById('message').value;
                
                if (!phone || !message) {
                    alert('Por favor, preencha telefone e mensagem');
                    return;
                }
                
                fetch('/notify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phone, message })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert('✅ Mensagem enviada com sucesso!');
                    } else {
                        alert('❌ Erro: ' + data.error);
                    }
                })
                .catch(error => {
                    alert('❌ Erro: ' + error.message);
                });
            }
            
            // Verificar status automaticamente a cada 5 segundos
            checkStatus();
            setInterval(checkStatus, 5000);
        </script>
    </body>
    </html>
  `);
});

// Inicializar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor WhatsApp rodando na porta ${PORT}`);
  console.log(`📱 App React Native: http://localhost:3000 (expo start)`);
  console.log(`🔧 Interface Admin: http://localhost:${PORT}/admin`);
  console.log(`📊 Status Servidor: http://localhost:${PORT}`);
  console.log(`🔗 Endpoint API: http://localhost:${PORT}/notify`);
  console.log(`\n✅ CONFIGURAÇÃO:`);
  console.log(`   - Frontend (React Native): Porta 3000`);
  console.log(`   - Backend (WhatsApp): Porta ${PORT}`);
  console.log(`   - Integração automática entre frontend e backend`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Encerrando servidor...');
  await whatsappService.destroy();
  process.exit(0);
});

module.exports = app;
