import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import { databaseService } from '../services/DatabaseService';
import { Configuracao } from '../types';

export default function ConfiguracoesScreen() {
  const [config, setConfig] = useState<Configuracao | null>(null);
  const [loading, setLoading] = useState(false);
  const [whatsappApiKey, setWhatsappApiKey] = useState('');
  const [whatsappApiUrl, setWhatsappApiUrl] = useState('');
  const [tempoEspera, setTempoEspera] = useState('15');
  const [tempoConfirmacao, setTempoConfirmacao] = useState('5');
  const [whatsappAtivo, setWhatsappAtivo] = useState(false);

  useEffect(() => {
    carregarConfiguracoes();
  }, []);

  const carregarConfiguracoes = async () => {
    try {
      const configs = await databaseService.getConfiguracoes();
      if (configs.length > 0) {
        const configAtual = configs[0];
        setConfig(configAtual);
        setWhatsappApiKey(configAtual.whatsappApiKey || '');
        setWhatsappApiUrl(configAtual.whatsappApiUrl || '');
        setTempoEspera(configAtual.tempoEspera.toString());
        setTempoConfirmacao(configAtual.tempoConfirmacao.toString());
        setWhatsappAtivo(!!configAtual.whatsappApiKey && !!configAtual.whatsappApiUrl);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const handleSalvarConfiguracoes = async () => {
    if (!config) {
      Alert.alert('Erro', 'Configuração não encontrada.');
      return;
    }

    setLoading(true);

    try {
      await databaseService.atualizarConfiguracao(config.id, {
        whatsappApiKey: whatsappAtivo ? whatsappApiKey : '',
        whatsappApiUrl: whatsappAtivo ? whatsappApiUrl : '',
        tempoEspera: parseInt(tempoEspera) || 15,
        tempoConfirmacao: parseInt(tempoConfirmacao) || 5,
      });

      Alert.alert('Sucesso', 'Configurações salvas com sucesso!');
      await carregarConfiguracoes();
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      Alert.alert('Erro', 'Não foi possível salvar as configurações.');
    } finally {
      setLoading(false);
    }
  };

  const handleTestarWhatsApp = () => {
    if (!whatsappApiKey || !whatsappApiUrl) {
      Alert.alert('Erro', 'Configure a API do WhatsApp primeiro.');
      return;
    }

    Alert.alert(
      'Teste WhatsApp',
      'Esta funcionalidade testará a conexão com a API do WhatsApp. Deseja continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Testar',
          onPress: () => {
            Alert.alert('Teste', 'Funcionalidade de teste será implementada.');
          }
        }
      ]
    );
  };

  const handleLimparDados = () => {
    Alert.alert(
      'Limpar Dados',
      'Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpar',
          style: 'destructive',
          onPress: async () => {
            try {
              await databaseService.limparFila();
              Alert.alert('Sucesso', 'Todos os dados foram limpos.');
            } catch (error) {
              console.error('Erro ao limpar dados:', error);
              Alert.alert('Erro', 'Não foi possível limpar os dados.');
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Configurações</Text>
          <Text style={styles.subtitle}>Bernades Barbearia</Text>
        </View>

        <Card variant="glass" style={styles.configCard}>
          <Text style={styles.cardTitle}>WhatsApp API</Text>
          
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Ativar WhatsApp</Text>
            <Switch
              value={whatsappAtivo}
              onValueChange={setWhatsappAtivo}
              trackColor={{ false: 'rgba(211, 211, 211, 0.3)', true: '#FF0000' }}
              thumbColor={whatsappAtivo ? '#FFFFFF' : '#D3D3D3'}
            />
          </View>

          {whatsappAtivo && (
            <>
              <Input
                label="API Key"
                value={whatsappApiKey}
                onChangeText={setWhatsappApiKey}
                placeholder="Sua chave da API"
                secureTextEntry
              />

              <Input
                label="API URL"
                value={whatsappApiUrl}
                onChangeText={setWhatsappApiUrl}
                placeholder="https://api.whatsapp.com/v1/messages"
              />

              <Button
                title="Testar Conexão"
                onPress={handleTestarWhatsApp}
                variant="secondary"
                size="medium"
                style={styles.testButton}
              />
            </>
          )}

          <Text style={styles.infoText}>
            APIs suportadas: Twilio, Z-API, Wati, UltraMsg
          </Text>
        </Card>

        <Card variant="glass" style={styles.configCard}>
          <Text style={styles.cardTitle}>Configurações de Tempo</Text>
          
          <Input
            label="Tempo Médio de Atendimento (minutos)"
            value={tempoEspera}
            onChangeText={setTempoEspera}
            placeholder="15"
            keyboardType="numeric"
          />

          <Input
            label="Tempo de Confirmação (minutos)"
            value={tempoConfirmacao}
            onChangeText={setTempoConfirmacao}
            placeholder="5"
            keyboardType="numeric"
          />

          <Text style={styles.infoText}>
            Tempo que o cliente tem para se apresentar após ser chamado
          </Text>
        </Card>

        <Card variant="glass" style={styles.configCard}>
          <Text style={styles.cardTitle}>Informações do Sistema</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Versão</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Banco de Dados</Text>
            <Text style={styles.infoValue}>Firebase Firestore</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status WhatsApp</Text>
            <Text style={[styles.infoValue, { color: whatsappAtivo ? '#00FF00' : '#FF0000' }]}>
              {whatsappAtivo ? 'Ativo' : 'Inativo'}
            </Text>
          </View>
        </Card>

        <Card variant="glass" style={styles.configCard}>
          <Text style={styles.cardTitle}>Ações</Text>
          
          <Button
            title="Salvar Configurações"
            onPress={handleSalvarConfiguracoes}
            loading={loading}
            size="large"
            style={styles.actionButton}
          />

          <Button
            title="Limpar Todos os Dados"
            onPress={handleLimparDados}
            variant="danger"
            size="medium"
            style={styles.actionButton}
          />
        </Card>

        <Button
          title="Voltar"
          onPress={() => router.back()}
          variant="ghost"
          size="medium"
          style={styles.voltarButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FF0000',
    textAlign: 'center',
    marginBottom: 4,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: '#D3D3D3',
    textAlign: 'center',
    fontWeight: '400',
  },
  configCard: {
    margin: 24,
    marginTop: 8,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  switchLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  testButton: {
    marginTop: 12,
  },
  infoText: {
    fontSize: 12,
    color: '#D3D3D3',
    fontStyle: 'italic',
    marginTop: 12,
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(211, 211, 211, 0.1)',
  },
  infoLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#D3D3D3',
    fontWeight: '400',
  },
  actionButton: {
    marginBottom: 12,
  },
  voltarButton: {
    margin: 24,
    marginTop: 8,
  },
}); 