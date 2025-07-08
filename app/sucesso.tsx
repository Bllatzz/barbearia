import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Body, H1 } from "../components/ui/Typography";
import { Colors } from "../constants/Colors";

export default function SucessoScreen() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <View style={styles.iconBox}>
        <MaterialIcons name="check-circle" size={80} color={Colors.primary} />
      </View>
      <H1 color={Colors.primary} align="center" style={styles.title}>
        Agendamento confirmado!
      </H1>
      <Body color={Colors.textSecondary} align="center" style={styles.subtitle}>
        Seu horário foi reservado com sucesso. Nos vemos em breve!
      </Body>
      <TouchableOpacity
        style={styles.button}
        activeOpacity={0.85}
        onPress={() => router.replace("/")}
      >
        <Text style={styles.buttonText}>Voltar ao início</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  iconBox: {
    marginBottom: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    marginBottom: 16,
    fontFamily: "Lobster",
  },
  subtitle: {
    marginBottom: 40,
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
    width: "100%",
    maxWidth: 340,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    letterSpacing: 1,
    fontFamily: "Brewheat.ttf",
  },
});
