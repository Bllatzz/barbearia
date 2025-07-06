import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Body, H1 } from '../components/ui/Typography';
import { Colors } from '../constants/Colors';

const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const horarios = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00',
];

function getDiasCalendario() {
  const hoje = new Date();
  const dias = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(hoje);
    d.setDate(hoje.getDate() + i);
    dias.push(d);
  }
  return dias;
}

export default function AgendarScreen() {
  const router = useRouter();
  const [diaSelecionado, setDiaSelecionado] = useState(getDiasCalendario()[0]);
  const [horaSelecionada, setHoraSelecionada] = useState<string | null>(null);

  const dias = getDiasCalendario();

  return (
    <View style={styles.container}>
      <H1 color={Colors.primary} align="center" style={styles.title}>
        Escolha seu horário
      </H1>
      <Body color={Colors.textSecondary} align="center" style={styles.subtitle}>
        Selecione o dia e o horário desejado
      </Body>
      {/* Calendário simples */}
      <View style={styles.calendarioBox}>
        {dias.map((dia, idx) => {
          const isHoje = idx === 0;
          const isSelected = diaSelecionado.toDateString() === dia.toDateString();
          return (
            <TouchableOpacity
              key={dia.toDateString()}
              style={[styles.dia, isSelected && styles.diaSelecionado]}
              onPress={() => setDiaSelecionado(dia)}
              activeOpacity={0.8}
            >
              <Text style={[styles.diaSemana, isSelected && styles.diaSemanaSelecionado]}>{diasSemana[dia.getDay()]}</Text>
              <Text style={[styles.diaNumero, isSelected && styles.diaNumeroSelecionado]}>{dia.getDate()}</Text>
              {isHoje && <Text style={styles.hoje}>Hoje</Text>}
            </TouchableOpacity>
          );
        })}
      </View>
      {/* Seleção de horários */}
      <ScrollView contentContainerStyle={styles.horariosBox} horizontal showsHorizontalScrollIndicator={false}>
        {horarios.map((hora) => (
          <TouchableOpacity
            key={hora}
            style={[styles.horario, horaSelecionada === hora && styles.horarioSelecionado]}
            onPress={() => setHoraSelecionada(hora)}
            activeOpacity={0.85}
          >
            <Text style={[styles.horarioText, horaSelecionada === hora && styles.horarioTextSelecionado]}>{hora}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {/* Botão avançar */}
      <TouchableOpacity
        style={[styles.button, !(diaSelecionado && horaSelecionada) && styles.buttonDisabled]}
        activeOpacity={0.85}
        disabled={!(diaSelecionado && horaSelecionada)}
        onPress={() => router.push({ pathname: '/confirmar', params: { dia: diaSelecionado.toISOString(), hora: horaSelecionada! } })}
      >
        <Text style={styles.buttonText}>Avançar</Text>
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
    marginBottom: 8,
    fontFamily: 'Lobster',
  },
  subtitle: {
    marginBottom: 24,
  },
  calendarioBox: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
    gap: 8,
  },
  dia: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    shadowColor: Colors.shadowLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    minWidth: 48,
  },
  diaSelecionado: {
    backgroundColor: Colors.primary,
  },
  diaSemana: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontFamily: 'Montserrat',
  },
  diaSemanaSelecionado: {
    color: '#fff',
    fontWeight: 'bold',
  },
  diaNumero: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Montserrat',
  },
  diaNumeroSelecionado: {
    color: '#fff',
  },
  hoje: {
    fontSize: 10,
    color: Colors.primary,
    marginTop: 2,
    fontFamily: 'Montserrat',
  },
  horariosBox: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
    paddingHorizontal: 4,
  },
  horario: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 18,
    marginRight: 8,
    shadowColor: Colors.shadowLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  horarioSelecionado: {
    backgroundColor: Colors.primary,
  },
  horarioText: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontFamily: 'Montserrat',
  },
  horarioTextSelecionado: {
    color: '#fff',
    fontWeight: 'bold',
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
    marginTop: 8,
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
}); 