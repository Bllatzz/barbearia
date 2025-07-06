import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Body, H1 } from '../components/ui/Typography';
import { Colors } from '../constants/Colors';

export default function ConfirmarScreen() {
  const router = useRouter();
  const { dia, hora } = useLocalSearchParams<{ dia: string; hora: string }>();
  const [nome, setNome] = useState('');
  const data = dia ? new Date(dia) : new Date();

  function handleConfirmar() {
    if (!nome.trim()) {
      Alert.alert('Preencha seu nome');
      return;
    }
    // Aqui você pode salvar o agendamento no backend/Firebase
    router.push('/sucesso');
  }

  function handleCancelar() {
    router.back();
  }

  return (
    <View style={styles.container}>
      <H1 color={Colors.primary} align="center" style={styles.title}>
        Confirmar agendamento
      </H1>
      <View style={styles.resumoBox}>
        <Body color={Colors.textSecondary} style={styles.label}>Data</Body>
        <Text style={styles.valor}>{data.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'short' })}</Text>
        <Body color={Colors.textSecondary} style={styles.label}>Horário</Body>
        <Text style={styles.valor}>{hora}</Text>
      </View>
      <View style={styles.inputBox}>
        <Body color={Colors.textSecondary} style={styles.label}>Nome</Body>
        <TextInput
          style={styles.input}
          placeholder="Digite seu nome completo"
          placeholderTextColor={Colors.textMuted}
          value={nome}
          onChangeText={setNome}
        />
      </View>
      <TouchableOpacity
        style={[styles.button, !nome.trim() && styles.buttonDisabled]}
        activeOpacity={0.85}
        disabled={!nome.trim()}
        onPress={handleConfirmar}
      >
        <Text style={styles.buttonText}>Confirmar</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.buttonOutline}
        activeOpacity={0.85}
        onPress={handleCancelar}
      >
        <Text style={styles.buttonOutlineText}>Cancelar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 32,
    marginTop: 32,
    marginBottom: 32,
    fontFamily: 'Lobster',
  },
  resumoBox: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
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
  },
  valor: {
    fontSize: 20,
    color: Colors.primary,
    fontWeight: 'bold',
    fontFamily: 'Montserrat',
    marginBottom: 12,
  },
  inputBox: {
    width: '100%',
    maxWidth: 340,
    marginBottom: 32,
  },
  input: {
    backgroundColor: Colors.surface,
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
    maxWidth: 340,
    marginBottom: 12,
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
    maxWidth: 340,
    backgroundColor: Colors.background,
  },
  buttonOutlineText: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 1,
    fontFamily: 'Montserrat',
  },
}); 