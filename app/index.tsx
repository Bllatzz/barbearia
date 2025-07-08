import { router } from "expo-router";
import React from "react";
import {
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { H1 } from "../components/ui/Typography";
import { Colors } from "../constants/Colors";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <View style={styles.logoBox}>
        <Image
          source={require("../assets/images/logo.png")}
          style={styles.logoImg}
          resizeMode="contain"
        />
      </View>
      <H1 color={Colors.primary} align="center" style={styles.title}>
        Bernardes Barbearia
      </H1>
      <TouchableOpacity
        style={styles.button}
        activeOpacity={0.85}
        onPress={() => router.push("/fila")}
      >
        <Text style={styles.buttonText}>Entrar na Fila</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        activeOpacity={0.85}
        onPress={() => router.push("/painel")}
      >
        <Text style={styles.buttonText}>Acessar Painel</Text>
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
  logoBox: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
    shadowColor: Colors.shadowLight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  logoImg: {
    width: "90%",
    height: "90%",
  },
  title: {
    fontSize: 40,
    marginBottom: 48,
    fontFamily: "Lobster",
    color: Colors.primary,
    textAlign: "center",
    letterSpacing: 1,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 48,
    shadowColor: Colors.shadowLight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    marginTop: 8,
    width: "100%",
    maxWidth: 340,
  },
  buttonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    letterSpacing: 1,
    fontFamily: "Brewheat.ttf",
  },
});
