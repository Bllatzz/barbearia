import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Body, H1 } from "../components/ui/Typography";
import { Colors } from "../constants/Colors";
import { databaseService } from "../services/DatabaseService";
import { filaService } from "../services/FilaService";
import { Cliente } from "../types";

type Barbeiro = "diego" | "guilherme" | "qualquer";

export default function PainelScreen() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [barbeiroLogado, setBarbeiroLogado] = useState<Barbeiro | null>(null);
  const [nomeBarbeiro, setNomeBarbeiro] = useState("");
  const [nomeManual, setNomeManual] = useState("");
  const [whatsappManual, setWhatsappManual] = useState("");
  const [barbeiroManual, setBarbeiroManual] = useState<Barbeiro>("qualquer");
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [monitoramentoAtivo, setMonitoramentoAtivo] = useState(false);
  const [atendidosHoje, setAtendidosHoje] = useState(0);
  const [atendidosSemana, setAtendidosSemana] = useState(0);
  const [atendidosMes, setAtendidosMes] = useState(0);
  const [precisaTrocarSenha, setPrecisaTrocarSenha] = useState(false);
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState("");

  // Atualização em tempo real da fila
  useEffect(() => {
    if (isAdmin && barbeiroLogado) {
      const unsubscribe = filaService.onFilaChange((clientes: Cliente[]) => {
        setClientes(clientes);
      });
      return unsubscribe;
    }
  }, [isAdmin, barbeiroLogado]);

  useEffect(() => {
    carregarClientes();
    const unsubscribe = filaService.onFilaChange(carregarClientes);

    // Verificar status do monitoramento
    const verificarMonitoramento = () => {
      setMonitoramentoAtivo(filaService.isMonitoramentoAtivo());
    };

    verificarMonitoramento();
    const interval = setInterval(verificarMonitoramento, 5000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const carregarClientes = async () => {
    try {
      const todosClientes = await databaseService.getClientes();
      setClientes(todosClientes);

      // Carregar estatísticas de atendidos
      const hoje = await databaseService.getAtendidosPorDia();
      const semana = await databaseService.getAtendidosSemana();
      const mes = await databaseService.getAtendidosMes();

      setAtendidosHoje(hoje);
      setAtendidosSemana(semana);
      setAtendidosMes(mes);
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
    }
  };

  function isSenhaPadrao(usuario: string, senha: string) {
    return (
      (usuario === "diego" && senha === "diego123") ||
      (usuario === "guilherme" && senha === "guilherme123") ||
      (usuario === "admin" && senha === "admin123")
    );
  }

  async function handleLogin() {
    if (!usuario.trim() || !senha.trim()) {
      Alert.alert("Preencha usuário e senha");
      return;
    }

    setLoading(true);
    try {
      const resultado = await databaseService.verificarLogin(
        usuario.trim(),
        senha
      );

      if (resultado.sucesso && resultado.barbeiro) {
        if (isSenhaPadrao(usuario.trim(), senha)) {
          setPrecisaTrocarSenha(true);
          setIsAdmin(false);
          setBarbeiroLogado(null);
          setNomeBarbeiro(resultado.nome || "");
          setNovaSenha("");
          setConfirmarNovaSenha("");
          Alert.alert(
            "Troque sua senha",
            "Por segurança, altere sua senha padrão."
          );
          return;
        }

        setIsAdmin(true);
        setBarbeiroLogado(resultado.barbeiro as Barbeiro);
        setNomeBarbeiro(resultado.nome || "");

        const filaAtual = await filaService.getFilaAtual();
        setClientes(filaAtual);

        // Limpar campos
        setUsuario("");
        setSenha("");
      } else {
        Alert.alert("Erro", "Usuário ou senha incorretos");
      }
    } catch (e) {
      Alert.alert("Erro", "Não foi possível fazer login");
    } finally {
      setLoading(false);
    }
  }

  async function handleTrocarSenha() {
    if (!novaSenha || novaSenha.length < 6) {
      Alert.alert("A senha deve ter pelo menos 6 caracteres");
      return;
    }
    if (novaSenha !== confirmarNovaSenha) {
      Alert.alert("As senhas não coincidem");
      return;
    }
    setLoading(true);
    try {
      const sucesso = await databaseService.alterarSenha(
        usuario.trim(),
        senha,
        novaSenha
      );
      if (sucesso) {
        Alert.alert("Senha alterada com sucesso!");
        setPrecisaTrocarSenha(false);

        // Fazer login automaticamente com a nova senha
        const resultado = await databaseService.verificarLogin(
          usuario.trim(),
          novaSenha
        );
        if (resultado.sucesso && resultado.barbeiro) {
          setIsAdmin(true);
          setBarbeiroLogado(resultado.barbeiro as Barbeiro);
          setNomeBarbeiro(resultado.nome || "");

          const filaAtual = await filaService.getFilaAtual();
          setClientes(filaAtual);

          setUsuario("");
          setSenha("");
          setNovaSenha("");
          setConfirmarNovaSenha("");
        }
      } else {
        Alert.alert("Erro ao alterar senha");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleRemover(cliente: Cliente) {
    Alert.alert("Remover cliente", `Deseja remover ${cliente.nome} da fila?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Atendido",
        onPress: async () => {
          try {
            await filaService.removerCliente(cliente.id, "atendido");
          } catch (e) {
            console.error("Erro ao remover cliente como atendido:", e);
            Alert.alert("Erro", "Não foi possível remover o cliente");
          }
        },
      },
      {
        text: "Ausente",
        onPress: async () => {
          try {
            await filaService.removerCliente(cliente.id, "ausente");
          } catch (e) {
            console.error("Erro ao remover cliente como ausente:", e);
            Alert.alert("Erro", "Não foi possível remover o cliente");
          }
        },
      },
    ]);
  }

  async function handleAdicionarManual() {
    if (!nomeManual.trim()) {
      Alert.alert("Preencha o nome");
      return;
    }
    setLoading(true);
    try {
      await filaService.adicionarClienteManual(
        nomeManual.trim(),
        whatsappManual.trim() || undefined,
        barbeiroManual
      );
      setNomeManual("");
      setWhatsappManual("");
      setBarbeiroManual("qualquer");
    } catch (e) {
      Alert.alert("Erro", "Não foi possível adicionar o cliente");
    } finally {
      setLoading(false);
    }
  }

  async function removerPrimeiro() {
    const aguardando = getClientesAguardandoBarbeiro();
    if (aguardando.length === 0) {
      Alert.alert("Aviso", "Não há clientes aguardando");
      return;
    }

    try {
      await databaseService.removerCliente(aguardando[0].id);
      Alert.alert("Sucesso", `${aguardando[0].nome} removido da fila`);
    } catch (error) {
      Alert.alert("Erro", "Falha ao remover primeiro cliente");
    }
  }

  async function atualizarEstatisticas() {
    setLoading(true);
    try {
      const hoje = await databaseService.getAtendidosPorDia();
      const semana = await databaseService.getAtendidosSemana();
      const mes = await databaseService.getAtendidosMes();

      setAtendidosHoje(hoje);
      setAtendidosSemana(semana);
      setAtendidosMes(mes);

      Alert.alert("Sucesso", "Estatísticas atualizadas!");
    } catch (error) {
      Alert.alert("Erro", "Falha ao atualizar estatísticas");
    } finally {
      setLoading(false);
    }
  }

  async function corrigirPosicoes() {
    setLoading(true);
    try {
      await databaseService.corrigirPosicoesFila();
      await carregarClientes(); // Recarregar para mostrar as correções
      Alert.alert("Sucesso", "Posições da fila corrigidas!");
    } catch (error) {
      Alert.alert("Erro", "Falha ao corrigir posições");
    } finally {
      setLoading(false);
    }
  }

  // Filtrar clientes por barbeiro logado
  const getClientesBarbeiro = () => {
    if (!barbeiroLogado || barbeiroLogado === "qualquer") {
      return clientes;
    }
    return clientes.filter(
      (c) => c.barbeiro === barbeiroLogado || c.barbeiro === "qualquer"
    );
  };

  const getClientesAguardandoBarbeiro = () => {
    return getClientesBarbeiro().filter((c) => c.status === "aguardando");
  };

  const getClientesChamadosBarbeiro = () => {
    return getClientesBarbeiro().filter((c) => c.status === "chamado");
  };

  const getClientesAtendidosBarbeiro = () => {
    return getClientesBarbeiro().filter((c) => c.status === "atendido");
  };

  const getClientesAusentesBarbeiro = () => {
    return getClientesBarbeiro().filter((c) => c.status === "ausente");
  };

  const clientesAguardando = getClientesAguardandoBarbeiro();
  const clientesChamados = getClientesChamadosBarbeiro();
  const clientesAtendidos = getClientesAtendidosBarbeiro();
  const clientesAusentes = getClientesAusentesBarbeiro();

  // Verificar disponibilidade dos barbeiros
  const clientesChamadosDiego = clientes.filter(
    (c) =>
      c.status === "chamado" &&
      (c.barbeiro === "diego" || c.barbeiro === "qualquer")
  );
  const clientesChamadosGuilherme = clientes.filter(
    (c) =>
      c.status === "chamado" &&
      (c.barbeiro === "guilherme" || c.barbeiro === "qualquer")
  );

  const diegoDisponivel =
    clientesChamadosDiego.length === 0 &&
    clientes.filter((c) => c.status === "chamado").length < 2;
  const guilhermeDisponivel =
    clientesChamadosGuilherme.length === 0 &&
    clientes.filter((c) => c.status === "chamado").length < 2;

  const getBarbeiroLabel = (barbeiro: string) => {
    switch (barbeiro) {
      case "diego":
        return "Diego";
      case "guilherme":
        return "Guilherme";
      case "qualquer":
        return "Qualquer";
      default:
        return barbeiro;
    }
  };

  if (precisaTrocarSenha) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 24,
        }}
      >
        <H1>Trocar Senha</H1>
        <Text style={{ marginTop: 16 }}>
          Por segurança, altere sua senha padrão:
        </Text>
        <TextInput
          placeholder="Nova senha"
          secureTextEntry
          value={novaSenha}
          onChangeText={setNovaSenha}
          style={{
            marginTop: 24,
            borderWidth: 1,
            borderRadius: 8,
            padding: 12,
            width: "100%",
          }}
        />
        <TextInput
          placeholder="Confirmar nova senha"
          secureTextEntry
          value={confirmarNovaSenha}
          onChangeText={setConfirmarNovaSenha}
          style={{
            marginTop: 12,
            borderWidth: 1,
            borderRadius: 8,
            padding: 12,
            width: "100%",
          }}
        />
        <TouchableOpacity
          style={{
            marginTop: 24,
            backgroundColor: Colors.primary,
            padding: 16,
            borderRadius: 8,
            width: "100%",
          }}
          onPress={handleTrocarSenha}
          disabled={loading}
        >
          <Text
            style={{ color: "#fff", textAlign: "center", fontWeight: "bold" }}
          >
            {loading ? "Salvando..." : "Salvar nova senha"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!isAdmin) {
    return (
      <View style={styles.container}>
        <H1 color={Colors.primary} align="center" style={styles.title}>
          Login - Painel do Barbeiro
        </H1>
        <Body
          color={Colors.textSecondary}
          align="center"
          style={styles.subtitle}
        >
          Acesso restrito. Digite seu usuário e senha:
        </Body>

        <TextInput
          style={styles.input}
          placeholder="Usuário"
          placeholderTextColor={Colors.textMuted}
          value={usuario}
          onChangeText={setUsuario}
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Senha"
          placeholderTextColor={Colors.textMuted}
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>
            {loading ? "Entrando..." : "Entrar"}
          </Text>
        </TouchableOpacity>

        <View style={styles.loginInfo}>
          <Text style={styles.loginInfoText}>
            <Text style={styles.bold}>Usuários padrão:</Text>
            {"\n"}• Diego: diego / diego123{"\n"}• Guilherme: guilherme /
            guilherme123{"\n"}• Admin: admin / admin123
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerContainer}>
          <H1 color={Colors.primary} align="center" style={styles.title}>
            Painel do {nomeBarbeiro || getBarbeiroLabel(barbeiroLogado!)}
          </H1>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => {
              setIsAdmin(false);
              setBarbeiroLogado(null);
              setNomeBarbeiro("");
            }}
          >
            <Text style={styles.logoutButtonText}>Sair</Text>
          </TouchableOpacity>
        </View>

        {/* Status do Monitoramento Automático */}
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusIndicator,
                { backgroundColor: monitoramentoAtivo ? "#4CAF50" : "#F44336" },
              ]}
            />
            <Text style={styles.statusText}>
              Monitoramento Automático:{" "}
              {monitoramentoAtivo ? "ATIVO" : "INATIVO"}
            </Text>
          </View>
          <Text style={styles.statusDescription}>
            O sistema chama automaticamente o próximo cliente quando há vagas
            disponíveis
          </Text>
        </View>

        {/* Estatísticas da Fila */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{clientesAguardando.length}</Text>
            <Text style={styles.statLabel}>Aguardando</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{clientesChamados.length}/2</Text>
            <Text style={styles.statLabel}>Chamados</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{clientesAtendidos.length}</Text>
            <Text style={styles.statLabel}>Atendidos</Text>
          </View>
        </View>

        {/* Estatísticas de Atendidos */}
        <View style={styles.section}>
          <Body color={Colors.primary} style={styles.sectionTitle}>
            ESTATÍSTICAS DE ATENDIDOS
          </Body>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{atendidosHoje}</Text>
              <Text style={styles.statLabel}>Hoje</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{atendidosSemana}</Text>
              <Text style={styles.statLabel}>Semana</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{atendidosMes}</Text>
              <Text style={styles.statLabel}>Mês</Text>
            </View>
          </View>
        </View>

        {/* Status dos Barbeiros */}
        <View style={styles.section}>
          <Body color={Colors.primary} style={styles.sectionTitle}>
            STATUS DOS BARBEIROS
          </Body>
          <View style={styles.barbeiroStatus}>
            <View
              style={[
                styles.statusCard,
                { backgroundColor: diegoDisponivel ? "#d4edda" : "#f8d7da" },
              ]}
            >
              <Text style={styles.statusTitle}>Diego</Text>
              <Text style={styles.statusText}>
                {diegoDisponivel
                  ? "Disponível"
                  : clientesChamadosDiego.length > 0
                  ? "Ocupado"
                  : "Vagas lotadas"}
              </Text>
            </View>
            <View
              style={[
                styles.statusCard,
                {
                  backgroundColor: guilhermeDisponivel ? "#d4edda" : "#f8d7da",
                },
              ]}
            >
              <Text style={styles.statusTitle}>Guilherme</Text>
              <Text style={styles.statusText}>
                {guilhermeDisponivel
                  ? "Disponível"
                  : clientesChamadosGuilherme.length > 0
                  ? "Ocupado"
                  : "Vagas lotadas"}
              </Text>
            </View>
          </View>
        </View>

        {/* Botões de Ação */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#dc3545" }]}
            onPress={removerPrimeiro}
          >
            <Text style={styles.actionButtonText}>Remover Primeiro</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#17a2b8" }]}
            onPress={atualizarEstatisticas}
            disabled={loading}
          >
            <Text style={styles.actionButtonText}>Atualizar Estatísticas</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#ffc107" }]}
            onPress={corrigirPosicoes}
            disabled={loading}
          >
            <Text style={styles.actionButtonText}>Corrigir Posições</Text>
          </TouchableOpacity>
        </View>

        {/* Clientes Chamados */}
        {clientesChamados.length > 0 && (
          <View style={styles.section}>
            <Body color={Colors.primary} style={styles.sectionTitle}>
              CHAMADOS ({clientesChamados.length})
            </Body>
            {clientesChamados.map((cliente) => (
              <View key={cliente.id} style={styles.cardChamado}>
                <View style={styles.cardHeader}>
                  <Text style={styles.nomeChamado}>{cliente.nome}</Text>
                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      style={[
                        styles.actionButton,
                        { backgroundColor: "#28a745" },
                      ]}
                      onPress={() =>
                        filaService.removerCliente(cliente.id, "atendido")
                      }
                    >
                      <Text style={styles.actionButtonText}>✓</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.actionButton,
                        { backgroundColor: "#dc3545" },
                      ]}
                      onPress={() =>
                        filaService.removerCliente(cliente.id, "ausente")
                      }
                    >
                      <Text style={styles.actionButtonText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                {cliente.telefone && (
                  <Text style={styles.whatsapp}>📱 {cliente.telefone}</Text>
                )}
                {cliente.barbeiro && (
                  <Text style={styles.barbeiro}>
                    💇 {getBarbeiroLabel(cliente.barbeiro)}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Lista de Espera */}
        <View style={styles.section}>
          <Body color={Colors.primary} style={styles.sectionTitle}>
            AGUARDANDO ({clientesAguardando.length})
          </Body>
          {clientesAguardando.length === 0 ? (
            <Text style={styles.vazio}>Nenhum cliente aguardando</Text>
          ) : (
            clientesAguardando.map((cliente, index) => (
              <View key={cliente.id} style={styles.cardAguardando}>
                <View style={styles.cardHeader}>
                  <Text style={styles.nomeAguardando}>
                    {index + 1}º - {cliente.nome}
                  </Text>
                  <TouchableOpacity
                    style={styles.removerBtn}
                    onPress={() => handleRemover(cliente)}
                  >
                    <Text style={styles.removerBtnText}>Remover</Text>
                  </TouchableOpacity>
                </View>
                {cliente.telefone && (
                  <Text style={styles.whatsapp}>📱 {cliente.telefone}</Text>
                )}
                {cliente.barbeiro && (
                  <Text style={styles.barbeiro}>
                    💇 {getBarbeiroLabel(cliente.barbeiro)}
                  </Text>
                )}
              </View>
            ))
          )}
        </View>

        {/* Formulário para Adicionar Manualmente */}
        <View
          style={[
            styles.section,
            { display: "flex", justifyContent: "center", alignItems: "center" },
          ]}
        >
          <Body color={Colors.primary} style={styles.sectionTitle}>
            ADICIONAR CLIENTE
          </Body>
          <View style={styles.formContainer}>
            <TextInput
              style={styles.input}
              placeholder="Nome completo"
              placeholderTextColor={Colors.textMuted}
              value={nomeManual}
              onChangeText={setNomeManual}
            />
            <TextInput
              style={styles.input}
              placeholder="WhatsApp (opcional)"
              placeholderTextColor={Colors.textMuted}
              value={whatsappManual}
              onChangeText={setWhatsappManual}
              keyboardType="phone-pad"
            />

            <View style={styles.barbeiroSelector}>
              <TouchableOpacity
                style={[
                  styles.barbeiroOption,
                  barbeiroManual === "diego" && styles.barbeiroOptionSelected,
                ]}
                onPress={() => setBarbeiroManual("diego")}
              >
                <Text
                  style={[
                    styles.barbeiroOptionText,
                    barbeiroManual === "diego" &&
                      styles.barbeiroOptionTextSelected,
                  ]}
                >
                  Diego
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.barbeiroOption,
                  barbeiroManual === "guilherme" &&
                    styles.barbeiroOptionSelected,
                ]}
                onPress={() => setBarbeiroManual("guilherme")}
              >
                <Text
                  style={[
                    styles.barbeiroOptionText,
                    barbeiroManual === "guilherme" &&
                      styles.barbeiroOptionTextSelected,
                  ]}
                >
                  Guilherme
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.barbeiroOption,
                  barbeiroManual === "qualquer" &&
                    styles.barbeiroOptionSelected,
                ]}
                onPress={() => setBarbeiroManual("qualquer")}
              >
                <Text
                  style={[
                    styles.barbeiroOptionText,
                    barbeiroManual === "qualquer" &&
                      styles.barbeiroOptionTextSelected,
                  ]}
                >
                  Qualquer
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleAdicionarManual}
              disabled={loading}
              activeOpacity={0.85}
            >
              <Text style={styles.buttonText}>
                {loading ? "Adicionando..." : "Adicionar Cliente"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  title: {
    marginTop: 60,
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 32,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: 16,
    fontFamily: "Brewheat.ttf",
    shadowColor: Colors.shadowLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: Colors.shadowLight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Brewheat",
  },
  buttonDisabled: {
    backgroundColor: Colors.surfaceHover,
  },
  statusCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    margin: 16,
    shadowColor: Colors.shadowLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.textPrimary,
    fontFamily: "Brewheat.ttf",
  },
  statusDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: "Brewheat.ttf",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginHorizontal: 4,
    shadowColor: Colors.shadowLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.primary,
    fontFamily: "Brewheat.ttf",
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
    fontFamily: "Brewheat.ttf",
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 16,
    fontSize: 16,
    fontWeight: "bold",
  },
  barbeiroStatus: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.textPrimary,
    fontFamily: "Brewheat.ttf",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 16,
    flexWrap: "wrap",
  },
  actionButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    marginHorizontal: 2,
    marginBottom: 8,
    minWidth: "22%",
    shadowColor: Colors.shadowLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    fontFamily: "Brewheat.ttf",
  },
  cardChamado: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    shadowColor: Colors.shadowLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  nomeChamado: {
    fontSize: 18,
    color: Colors.textPrimary,
    fontFamily: "Brewheat.ttf",
    fontWeight: "bold",
  },
  cardActions: {
    flexDirection: "row",
    gap: 8,
  },
  cardAguardando: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    shadowColor: Colors.shadowLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  nomeAguardando: {
    fontSize: 18,
    color: Colors.textPrimary,
    fontFamily: "Brewheat.ttf",
    fontWeight: "bold",
  },
  whatsapp: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: "Brewheat.ttf",
    marginBottom: 6,
  },
  barbeiro: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: "Brewheat.ttf",
    marginBottom: 6,
  },
  removerBtn: {
    alignSelf: "flex-end",
    marginTop: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.error,
  },
  removerBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
    fontFamily: "Brewheat.ttf",
  },
  vazio: {
    fontSize: 16,
    color: Colors.textMuted,
    textAlign: "center",
    fontFamily: "Brewheat.ttf",
    fontStyle: "italic",
    padding: 20,
  },
  formContainer: {
    width: "100%",
    maxWidth: 340,
    marginTop: 24,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    shadowColor: Colors.shadowLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  barbeiroSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  barbeiroOption: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: Colors.surface,
  },
  barbeiroOptionSelected: {
    backgroundColor: Colors.primary,
  },
  barbeiroOptionText: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontFamily: "Brewheat.ttf",
  },
  barbeiroOptionTextSelected: {
    color: "#fff",
    fontWeight: "bold",
  },
  loginInfo: {
    marginTop: 24,
    padding: 16,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginHorizontal: 16,
  },
  loginInfoText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: "Brewheat.ttf",
    lineHeight: 20,
  },
  bold: {
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 60,
    marginBottom: 8,
  },
  logoutButton: {
    backgroundColor: Colors.error,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    fontFamily: "Brewheat.ttf",
  },
});
