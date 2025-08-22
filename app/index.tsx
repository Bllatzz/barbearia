import React, { useEffect, useRef, useState } from "react";
import {
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  Pressable,
  Alert,
} from "react-native";
import { H1 } from "../components/ui/Typography";
import { Colors } from "../constants/Colors";
import { router } from "expo-router";
import { Cliente } from "@/types";
import { databaseService } from "@/services/DatabaseService";

export default function HomeScreen() {
  // Animações
  const logoAnim = useRef(new Animated.Value(0)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;
  const btnAnim = useRef(new Animated.Value(0)).current;
  const [clientes, setClientes] = useState<Cliente[]>([]);



  useEffect(() => {
    Animated.stagger(200, [
      Animated.spring(logoAnim, {
        toValue: 1,
        friction: 7,
        tension: 60,
        useNativeDriver: true,
      }),
      Animated.spring(titleAnim, {
        toValue: 1,
        friction: 7,
        tension: 60,
        useNativeDriver: true,
      }),
      Animated.timing(btnAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
    const carregarClientes = async () => {
      try {
        const clientes = await databaseService.getClientes();
        setClientes(clientes);
      } catch (error) {
        console.error("Erro ao carregar clientes:", error);
      }
    };
    carregarClientes();
  }, []);


  
  const getClientesBarbeiro = () => {
    return clientes;
  };

  const getClientesAguardandoBarbeiro = () => {
    return getClientesBarbeiro().filter((c) => c.status === "aguardando");
  };
  const clientesAguardando = getClientesAguardandoBarbeiro();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <Animated.View
        style={{
          ...styles.logoBox,
          opacity: logoAnim,
          transform: [
            {
              scale: logoAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              }),
            },
            {
              translateY: logoAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [40, 0],
              }),
            },
          ],
        }}
      >
        <Image
          source={require("../assets/images/logo.png")}
          style={styles.logoImg}
          resizeMode="contain"
        />
      </Animated.View>
      <Animated.View
        style={{
          opacity: titleAnim,
          transform: [
            {
              translateY: titleAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [40, 0],
              }),
            },
            {
              scale: titleAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.95, 1],
              }),
            },
          ],
        }}
      >
        <H1 color={Colors.primary} align="center" style={styles.title}>
          Bernardes Barbearia
        </H1>
      </Animated.View>
      <Animated.View
        style={{
          opacity: btnAnim,
          transform: [
            {
              translateY: btnAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              }),
            },
          ],
          width: "100%",
          alignItems: "center",
        }}
      >
        {/**(Aparecer a quantidade de clientes na fila) */}
        <Pressable style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]} android_ripple={{ color: "#fff2" }}>
          <Text style={styles.buttonText}>{clientesAguardando.length} clientes na fila</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
          android_ripple={{ color: "#fff2" }}
          onPress={() => router.push("/fila")}
        >
          <Text style={styles.buttonText}>Entrar na Fila</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
          android_ripple={{ color: "#fff2" }}
          onPress={() => router.push("/painel")}
        >
          <Text style={styles.buttonText}>Acessar Painel</Text>
        </Pressable>


      </Animated.View>
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
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 36,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },
  logoImg: {
    width: "92%",
    height: "92%",
  },
  title: {
    fontSize: 48,
    marginBottom: 52,
    fontFamily: "Brewheat.ttf",
    color: Colors.primary,
    textAlign: "center",
    letterSpacing: 2,
    fontWeight: "bold",
    textShadowColor: "#7a001a99",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    elevation: 12,
    paddingHorizontal: 10,
    backgroundColor: "trasnsparent", // ou remova esta linha
    borderRadius: 18,
    overflow: "hidden",
    // Efeito de brilho sutil
    borderWidth: 2,
    borderColor: "#fff4",
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 18,
    paddingVertical: 22,
    paddingHorizontal: 54,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 8,
    marginTop: 14,
    width: "100%",
    maxWidth: 360,
    alignItems: "center",
    justifyContent: "center",
    transitionDuration: "200ms",
  },
  buttonPressed: {
    transform: [{ scale: 0.97 }],
    shadowOpacity: 0.12,
    backgroundColor: "#7a001aee",
  },
  buttonText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    letterSpacing: 1.5,
    fontFamily: "Brewheat.ttf",
    textShadowColor: "#00000044",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
});
