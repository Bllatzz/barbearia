import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Body, H1 } from '../components/ui/Typography';
import { Colors } from '../constants/Colors';
import { filaService } from '../services/FilaService';

type Barbeiro = 'diego' | 'guilherme' | 'qualquer';

export default function FilaScreen() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [barbeiro, setBarbeiro] = useState<Barbeiro>('qualquer');
  const [posicao, setPosicao] = useState<number | null>(null);
  const [sucesso, setSucesso] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleConfirmar() {
    if (!nome.trim()) {
      Alert.alert('Preencha seu nome completo');
      return;
    }
    setLoading(true);
    try {
      const { posicao } = await filaService.adicionarCliente(nome.trim(), whatsapp.trim() || undefined, barbeiro);
      setPosicao(posicao);
      setSucesso(true);
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível entrar na fila. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  function handleNovaEntrada() {
    setNome('');
    setWhatsapp('');
    setBarbeiro('qualquer');
    setPosicao(null);
    setSucesso(false);
  }

  if (sucesso && posicao) {
    return (
      <View style={styles.container}>
        <H1 color={Colors.primary} align="center" style={styles.title}>
          Sucesso!
        </H1>
        <Body color={Colors.textSecondary} align="center" style={styles.subtitle}>
          Você entrou na fila.
        </Body>
        <Text style={styles.posicao}>Sua posição: <Text style={styles.posicaoNum}>{posicao}º</Text></Text>
        <Text style={styles.barbeiroInfo}>
          Barbeiro: <Text style={styles.barbeiroNome}>
            {barbeiro === 'diego' ? 'Diego' : barbeiro === 'guilherme' ? 'Guilherme' : 'Qualquer um'}
          </Text>
        </Text>
        <TouchableOpacity style={styles.button} onPress={handleNovaEntrada} activeOpacity={0.85}>
          <Text style={styles.buttonText}>Nova entrada</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonOutline} onPress={() => router.replace('/')} activeOpacity={0.85}>
          <Text style={styles.buttonOutlineText}>Voltar ao início</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <H1 color={Colors.primary} align="center" style={styles.title}>
        Entrar na Fila
      </H1>
      <View style={styles.formBox}>
        <Body color={Colors.textSecondary} style={styles.label}>Nome completo *</Body>
        <TextInput
          style={styles.input}
          placeholder="Digite seu nome completo"
          placeholderTextColor={Colors.textMuted}
          value={nome}
          onChangeText={setNome}
        />
        
        <Body color={Colors.textSecondary} style={styles.label}>WhatsApp (opcional)</Body>
        <TextInput
          style={styles.input}
          placeholder="(11) 99999-9999"
          placeholderTextColor={Colors.textMuted}
          value={whatsapp}
          onChangeText={setWhatsapp}
          keyboardType="phone-pad"
        />
        
        <Body color={Colors.textSecondary} style={styles.label}>Escolher barbeiro</Body>
        <View style={styles.barbeiroSelector}>
          <TouchableOpacity 
            style={[
              styles.barbeiroOption, 
              barbeiro === 'diego' && styles.barbeiroOptionSelected
            ]} 
            onPress={() => setBarbeiro('diego')}
          >
            <Text style={[
              styles.barbeiroOptionText,
              barbeiro === 'diego' && styles.barbeiroOptionTextSelected
            ]}>Diego</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.barbeiroOption, 
              barbeiro === 'guilherme' && styles.barbeiroOptionSelected
            ]} 
            onPress={() => setBarbeiro('guilherme')}
          >
            <Text style={[
              styles.barbeiroOptionText,
              barbeiro === 'guilherme' && styles.barbeiroOptionTextSelected
            ]}>Guilherme</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.barbeiroOption, 
              barbeiro === 'qualquer' && styles.barbeiroOptionSelected
            ]} 
            onPress={() => setBarbeiro('qualquer')}
          >
            <Text style={[
              styles.barbeiroOptionText,
              barbeiro === 'qualquer' && styles.barbeiroOptionTextSelected
            ]}>Qualquer</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity
          style={[styles.button, (!nome.trim() || loading) && styles.buttonDisabled]}
          activeOpacity={0.85}
          disabled={!nome.trim() || loading}
          onPress={handleConfirmar}
        >
          <Text style={styles.buttonText}>{loading ? 'Enviando...' : 'Confirmar'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonOutline} onPress={() => router.replace('/')} activeOpacity={0.85}>
          <Text style={styles.buttonOutlineText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  title: {
    fontSize: 32,
    marginBottom: 24,
    fontFamily: 'Lobster',
  },
  subtitle: {
    marginBottom: 16,
  },
  formBox: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    shadowColor: Colors.shadowLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: 'Montserrat',
    marginBottom: 2,
    marginTop: 12,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.surfaceHover,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: Colors.textPrimary,
    fontFamily: 'Montserrat',
    shadowColor: Colors.shadowLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
    marginBottom: 4,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 48,
    shadowColor: Colors.shadowLight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    width: '100%',
    marginTop: 20,
    marginBottom: 8,
  },
  buttonDisabled: {
    backgroundColor: Colors.textMuted,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 1,
    fontFamily: 'Montserrat',
  },
  buttonOutline: {
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 48,
    width: '100%',
    backgroundColor: Colors.background,
    marginBottom: 4,
  },
  buttonOutlineText: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 1,
    fontFamily: 'Montserrat',
  },
  posicao: {
    fontSize: 20,
    color: Colors.textSecondary,
    marginBottom: 16,
    marginTop: 16,
    textAlign: 'center',
    fontFamily: 'Montserrat',
  },
  posicaoNum: {
    color: Colors.primary,
    fontWeight: 'bold',
    fontSize: 28,
    fontFamily: 'Montserrat',
  },
  barbeiroInfo: {
    fontSize: 18,
    color: Colors.textSecondary,
    marginBottom: 16,
    marginTop: 16,
    textAlign: 'center',
    fontFamily: 'Montserrat',
  },
  barbeiroNome: {
    color: Colors.primary,
    fontWeight: 'bold',
    fontSize: 20,
    fontFamily: 'Montserrat',
  },
  barbeiroSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  barbeiroOption: {
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: Colors.surfaceHover,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: '30%',
  },
  barbeiroOptionSelected: {
    backgroundColor: Colors.primary,
  },
  barbeiroOptionText: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'Montserrat',
  },
  barbeiroOptionTextSelected: {
    color: '#fff',
  },
}); 