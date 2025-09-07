import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Switch,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import { H1, Body } from '../components/ui/Typography';
import { Colors } from '../constants/Colors';
import { router } from 'expo-router';
import { backendIntegration } from '../services/BackendIntegration';
import { whatsAppService } from '../services/WhatsAppService';

export default function ConfigurarWhatsAppScreen() {
  const [whatsappAtivo, setWhatsappAtivo] = useState(false);
  const [whatsappConectado, setWhatsappConectado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testPhone, setTestPhone] = useState('');
  const [testMessage, setTestMessage] = useState('🧪 Teste do sistema da barbearia - WhatsApp funcionando!');
  const [qrCode, setQrCode] = useState<string | null>(null);

  useEffect(() => {
    verificarStatus();
    // Verificar status a cada 5 segundos
    const interval = setInterval(verificarStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const verificarStatus = async () => {
    try {
      // Verificar se backend está rodando
      const backendConnected = await backendIntegration.checkBackendStatus();
      if (backendConnected) {
        const status = await backendIntegration.getWhatsAppStatus();
        setWhatsappConectado(status.connected);
        if (status.qrCode) {
          setQrCode(status.qrCode);
        }
      } else {
        setWhatsappConectado(false);
        setQrCode(null);
      }
    } catch (error) {
      console.error('Erro ao verificar status WhatsApp:', error);
      setWhatsappConectado(false);
    }
  };

  const toggleWhatsApp = async (ativo: boolean) => {
    setLoading(true);
    try {
      if (ativo) {
        // Verificar se backend está rodando
        const backendConnected = await backendIntegration.checkBackendStatus();
        if (!backendConnected) {
          Alert.alert(
            'Backend não encontrado',
            'O servidor WhatsApp não está rodando. Inicie o servidor na porta 8000 primeiro.'
          );
          setLoading(false);
          return;
        }

        // Ativar WhatsApp Web
        whatsAppService.setWebWhatsAppMode(true, 'http://localhost:8000');
        whatsAppService.setAdminMode(true);
        setWhatsappAtivo(true);
        
        // Verificar status
        await verificarStatus();
        
        Alert.alert(
          'WhatsApp Ativado',
          'WhatsApp Web está ativo e conectado ao backend na porta 8000.'
        );
      } else {
        // Desativar WhatsApp
        whatsAppService.setAdminMode(false);
        setWhatsappAtivo(false);
        setWhatsappConectado(false);
        
        Alert.alert('WhatsApp Desativado', 'Notificações WhatsApp foram desabilitadas');
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível alterar status do WhatsApp');
    } finally {
      setLoading(false);
    }
  };

  const testarWhatsApp = async () => {
    if (!testPhone.trim()) {
      Alert.alert('Erro', 'Digite um número de telefone para testar');
      return;
    }

    setLoading(true);
    try {
      const sucesso = await backendIntegration.testMessage(testPhone, testMessage);
      
      if (sucesso) {
        Alert.alert('Sucesso', 'Mensagem enviada com sucesso via backend!');
      } else {
        Alert.alert('Erro', 'Falha ao enviar mensagem. Verifique se o backend está rodando e WhatsApp conectado.');
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro ao enviar mensagem de teste');
    } finally {
      setLoading(false);
    }
  };

  const reiniciarWhatsApp = async () => {
    setLoading(true);
    try {
      const sucesso = await backendIntegration.restartWhatsApp();
      if (sucesso) {
        Alert.alert('Sucesso', 'WhatsApp reiniciado com sucesso');
        await verificarStatus();
      } else {
        Alert.alert('Erro', 'Falha ao reiniciar WhatsApp');
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro ao reiniciar WhatsApp');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <H1 color={Colors.primary} align="center" style={styles.title}>
          📱 Configurar WhatsApp
        </H1>
        <Body color={Colors.textSecondary} align="center" style={styles.subtitle}>
          Configure o WhatsApp Web para envio automático de mensagens
        </Body>
      </View>

      {/* Status do Sistema */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Status do Sistema</Text>
        
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>WhatsApp Ativo:</Text>
          <Switch
            value={whatsappAtivo}
            onValueChange={toggleWhatsApp}
            disabled={loading}
            trackColor={{ false: Colors.textMuted, true: Colors.primary }}
            thumbColor={whatsappAtivo ? '#fff' : '#f4f3f4'}
          />
        </View>
        
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Status Conexão:</Text>
          <View style={[
            styles.statusIndicator,
            { backgroundColor: whatsappConectado ? '#4CAF50' : '#F44336' }
          ]}>
            <Text style={styles.statusText}>
              {whatsappConectado ? 'Conectado' : 'Desconectado'}
            </Text>
          </View>
        </View>
      </View>

      {/* QR Code */}
      {qrCode && !whatsappConectado && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📱 Conectar WhatsApp</Text>
          <View style={styles.qrContainer}>
            <Text style={styles.qrText}>
              Escaneie o QR Code com seu WhatsApp:
            </Text>
            <View style={styles.qrCodeContainer}>
              <SvgXml
                xml={qrCode}
                width={200}
                height={200}
              />
            </View>
          </View>
        </View>
      )}

      {/* Controles */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔧 Controles</Text>
        
        <TouchableOpacity
          style={[styles.button, styles.refreshButton]}
          onPress={verificarStatus}
          disabled={loading}
        >
          <Text style={styles.buttonText}>🔄 Verificar Status</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.restartButton]}
          onPress={reiniciarWhatsApp}
          disabled={loading}
        >
          <Text style={styles.buttonText}>🔄 Reiniciar WhatsApp</Text>
        </TouchableOpacity>
      </View>

      {/* Teste de Envio */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🧪 Teste de Envio</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Número do telefone (ex: 5511999999999)"
          value={testPhone}
          onChangeText={setTestPhone}
          keyboardType="phone-pad"
        />
        
        <TextInput
          style={[styles.input, styles.messageInput]}
          placeholder="Mensagem de teste"
          value={testMessage}
          onChangeText={setTestMessage}
          multiline
          numberOfLines={3}
        />
        
        <TouchableOpacity
          style={[styles.button, styles.testButton]}
          onPress={testarWhatsApp}
          disabled={loading || !whatsappConectado}
        >
          <Text style={styles.buttonText}>📤 Enviar Mensagem</Text>
        </TouchableOpacity>
      </View>

      {/* Avisos */}
      {whatsappAtivo && !whatsappConectado && (
        <View style={styles.warningContainer}>
          <Text style={styles.warningText}>
            ⚠️ WhatsApp Web não está conectado.{'\n'}
            Certifique-se de que o servidor está rodando em:{'\n'}
            http://localhost:8000
          </Text>
        </View>
      )}

      {whatsappAtivo && whatsappConectado && (
        <View style={styles.successContainer}>
          <Text style={styles.successText}>
            ✅ WhatsApp Web conectado e funcionando!{'\n'}
            As notificações automáticas estão ativas.
          </Text>
        </View>
      )}

      {/* Botão Voltar */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backButtonText}>← Voltar ao Painel</Text>
      </TouchableOpacity>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 24,
    backgroundColor: Colors.surface,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  section: {
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: Colors.shadowLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  statusIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  qrContainer: {
    alignItems: 'center',
  },
  qrText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
    textAlign: 'center',
  },
  qrCodeContainer: {
    width: 200,
    height: 200,
    backgroundColor: Colors.background,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.surfaceHover,
  },
  qrCodeText: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  refreshButton: {
    backgroundColor: Colors.primary,
  },
  restartButton: {
    backgroundColor: '#FF9800',
  },
  testButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.surfaceHover,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  messageInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  warningContainer: {
    backgroundColor: '#FFF3CD',
    borderColor: '#FFEAA7',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  warningText: {
    color: '#856404',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  successContainer: {
    backgroundColor: '#D4EDDA',
    borderColor: '#C3E6CB',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  successText: {
    color: '#155724',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  backButton: {
    backgroundColor: Colors.primary,
    marginHorizontal: 16,
    marginBottom: 32,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 12,
  },
});
