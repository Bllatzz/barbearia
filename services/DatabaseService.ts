import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { Cliente, Configuracao, Notificacao } from "../types";
import bcrypt from "bcryptjs";

// Função de hash usando bcrypt
async function hashSenha(senha: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(senha, saltRounds);
}

// Função para verificar senha com bcrypt
async function verificarSenha(senha: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(senha, hash);
}

class DatabaseService {
  private db = db;
  private clientesCollection = collection(db, "clientes");
  private configuracoesCollection = collection(db, "configuracoes");
  private notificacoesCollection = collection(db, "notificacoes");

  async initDatabase(): Promise<void> {
    try {
      await this.criarUsuariosPadrao();
      await this.initConfiguracoes();
    } catch (error) {
      console.error("Erro ao inicializar banco:", error);
    }
  }

  async initConfiguracoes(): Promise<void> {
    const configs = await this.getConfiguracoes();
    if (configs.length === 0) {
      await this.inserirConfiguracao({
        whatsappApiKey: "",
        whatsappApiUrl: "",
        tempoEspera: 15,
        tempoConfirmacao: 5,
      });
    }
  }

  async inserirCliente(cliente: Omit<Cliente, "id">): Promise<string> {
    console.log('🔍 DEBUG - Inserindo cliente no banco:');
    console.log('   Dados:', cliente);
    
    const docRef = await addDoc(this.clientesCollection, {
      nome: cliente.nome,
      telefone: cliente.telefone || null,
      horarioEntrada: Timestamp.now(),
      posicao: cliente.posicao,
      status: cliente.status,
      notificado: cliente.notificado,
      barbeiro: cliente.barbeiro || "qualquer",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    console.log('   Cliente inserido com ID:', docRef.id);
    return docRef.id;
  }

  async getClientes(): Promise<Cliente[]> {
    const q = query(this.clientesCollection, orderBy("posicao", "asc"));
    const querySnapshot = await getDocs(q);

    const clientes = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      nome: doc.data().nome,
      telefone: doc.data().telefone,
      horarioEntrada:
        doc.data().horarioEntrada?.toDate?.()?.toISOString() ||
        new Date().toISOString(),
      posicao: doc.data().posicao,
      status: doc.data().status,
      notificado: doc.data().notificado || false,
      barbeiro: doc.data().barbeiro || "qualquer",
    }));
    
    console.log('🔍 DEBUG - getClientes retornou:', clientes.length, 'clientes');
    console.log('   Clientes:', clientes);
    
    return clientes;
  }

  async getClientesAguardando(): Promise<Cliente[]> {
    const q = query(this.clientesCollection, orderBy("posicao", "asc"));
    const querySnapshot = await getDocs(q);

    const todosClientes = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      nome: doc.data().nome,
      telefone: doc.data().telefone,
      horarioEntrada:
        doc.data().horarioEntrada?.toDate?.()?.toISOString() ||
        new Date().toISOString(),
      posicao: doc.data().posicao,
      status: doc.data().status,
      notificado: doc.data().notificado || false,
      barbeiro: doc.data().barbeiro || "qualquer",
    }));
    
    const clientesAguardando = todosClientes.filter((cliente) => cliente.status === "aguardando");
    
    console.log('🔍 DEBUG - getClientesAguardando:');
    console.log('   Total de clientes:', todosClientes.length);
    console.log('   Aguardando:', clientesAguardando.length);
    console.log('   Status dos clientes:', todosClientes.map(c => ({ nome: c.nome, status: c.status })));
    
    return clientesAguardando;
  }

  async getClientesChamados(): Promise<Cliente[]> {
    const q = query(this.clientesCollection, orderBy("posicao", "asc"));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs
      .map((doc) => ({
        id: doc.id,
        nome: doc.data().nome,
        telefone: doc.data().telefone,
        horarioEntrada:
          doc.data().horarioEntrada?.toDate?.()?.toISOString() ||
          new Date().toISOString(),
        posicao: doc.data().posicao,
        status: doc.data().status,
        notificado: doc.data().notificado || false,
        barbeiro: doc.data().barbeiro || "qualquer",
      }))
      .filter((cliente) => cliente.status === "chamado");
  }

  async atualizarStatusCliente(
    id: string,
    status: Cliente["status"]
  ): Promise<void> {
    const docRef = doc(this.clientesCollection, id);
    await updateDoc(docRef, {
      status: status,
      updatedAt: serverTimestamp(),
    });
  }

  async atualizarPosicaoCliente(id: string, posicao: number): Promise<void> {
    const docRef = doc(this.clientesCollection, id);
    await updateDoc(docRef, {
      posicao: posicao,
      updatedAt: serverTimestamp(),
    });
  }

  async marcarComoNotificado(id: string): Promise<void> {
    const docRef = doc(this.clientesCollection, id);
    await updateDoc(docRef, {
      notificado: true,
      updatedAt: serverTimestamp(),
    });
  }

  async removerCliente(id: string): Promise<void> {
    const docRef = doc(this.clientesCollection, id);
    await deleteDoc(docRef);
  }

  async getProximaPosicao(): Promise<number> {
    const clientesAguardando = await this.getClientesAguardando();

    if (clientesAguardando.length === 0) {
      return 1;
    }

    return clientesAguardando.length + 1;
  }

  async getConfiguracoes(): Promise<Configuracao[]> {
    const querySnapshot = await getDocs(this.configuracoesCollection);

    return querySnapshot.docs.map((doc) => ({
      id: parseInt(doc.id),
      whatsappApiKey: doc.data().whatsappApiKey || "",
      whatsappApiUrl: doc.data().whatsappApiUrl || "",
      tempoEspera: doc.data().tempoEspera || 15,
      tempoConfirmacao: doc.data().tempoConfirmacao || 5,
    }));
  }

  async inserirConfiguracao(config: Omit<Configuracao, "id">): Promise<string> {
    const docRef = await addDoc(this.configuracoesCollection, {
      whatsappApiKey: config.whatsappApiKey,
      whatsappApiUrl: config.whatsappApiUrl,
      tempoEspera: config.tempoEspera,
      tempoConfirmacao: config.tempoConfirmacao,
      createdAt: serverTimestamp(),
    });

    return docRef.id;
  }

  async atualizarConfiguracao(
    id: number,
    config: Partial<Configuracao>
  ): Promise<void> {
    const docRef = doc(this.configuracoesCollection, id.toString());
    await updateDoc(docRef, {
      ...config,
      updatedAt: serverTimestamp(),
    });
  }

  async inserirNotificacao(
    notificacao: Omit<Notificacao, "id">
  ): Promise<string> {
    const docRef = await addDoc(this.notificacoesCollection, {
      clienteId: notificacao.clienteId,
      tipo: notificacao.tipo,
      mensagem: notificacao.mensagem,
      enviada: notificacao.enviada,
      horarioEnvio: Timestamp.now(),
      createdAt: serverTimestamp(),
    });

    return docRef.id;
  }

  async marcarNotificacaoComoEnviada(id: number): Promise<void> {
    const docRef = doc(this.notificacoesCollection, id.toString());
    await updateDoc(docRef, {
      enviada: true,
      updatedAt: serverTimestamp(),
    });
  }

  async limparFila(): Promise<void> {
    const clientes = await this.getClientes();
    const notificacoes = await getDocs(this.notificacoesCollection);

    for (const cliente of clientes) {
      await this.removerCliente(cliente.id);
    }

    for (const doc of notificacoes.docs) {
      await deleteDoc(doc.ref);
    }
  }

  onFilaChange(callback: (clientes: Cliente[]) => void): () => void {
    const q = query(this.clientesCollection, orderBy("posicao", "asc"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const clientes = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        nome: doc.data().nome,
        telefone: doc.data().telefone,
        horarioEntrada:
          doc.data().horarioEntrada?.toDate?.()?.toISOString() ||
          new Date().toISOString(),
        posicao: doc.data().posicao,
        status: doc.data().status,
        notificado: doc.data().notificado || false,
        barbeiro: doc.data().barbeiro || "qualquer",
      }));

      callback(clientes);
    });

    return unsubscribe;
  }

  // Obter atendidos por dia
  async getAtendidosPorDia(data?: Date): Promise<number> {
    try {
      const dataConsulta = data || new Date();
      const inicioDia = new Date(dataConsulta);
      inicioDia.setHours(0, 0, 0, 0);

      const fimDia = new Date(dataConsulta);
      fimDia.setHours(23, 59, 59, 999);

      const q = query(
        this.clientesCollection,
        where("status", "==", "atendido"),
        where("updatedAt", ">=", Timestamp.fromDate(inicioDia)),
        where("updatedAt", "<=", Timestamp.fromDate(fimDia))
      );

      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.error("Erro ao obter atendidos por dia:", error);
      return 0;
    }
  }

  // Obter atendidos da semana
  async getAtendidosSemana(): Promise<number> {
    try {
      const hoje = new Date();
      const inicioSemana = new Date(hoje);
      inicioSemana.setDate(hoje.getDate() - hoje.getDay());
      inicioSemana.setHours(0, 0, 0, 0);

      const q = query(
        this.clientesCollection,
        where("status", "==", "atendido"),
        where("updatedAt", ">=", Timestamp.fromDate(inicioSemana))
      );

      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.error("Erro ao obter atendidos da semana:", error);
      return 0;
    }
  }

  // Obter atendidos do mês
  async getAtendidosMes(): Promise<number> {
    try {
      const hoje = new Date();
      const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

      const q = query(
        this.clientesCollection,
        where("status", "==", "atendido"),
        where("updatedAt", ">=", Timestamp.fromDate(inicioMes))
      );

      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.error("Erro ao obter atendidos do mês:", error);
      return 0;
    }
  }

  // Corrigir posições da fila
  async corrigirPosicoesFila(): Promise<void> {
    try {
      const clientesAguardando = await this.getClientesAguardando();

      for (let i = 0; i < clientesAguardando.length; i++) {
        const novaPosicao = i + 1;
        const cliente = clientesAguardando[i];

        if (cliente.posicao !== novaPosicao) {
          await this.atualizarPosicaoCliente(cliente.id, novaPosicao);
        }
      }
    } catch (error) {
      console.error("Erro ao corrigir posições:", error);
      throw error;
    }
  }

  // Sistema de autenticação
  async verificarLogin(
    usuario: string,
    senha: string
  ): Promise<{ sucesso: boolean; barbeiro?: string; nome?: string }> {
    try {
      const q = query(
        collection(this.db, "usuarios"),
        where("usuario", "==", usuario.toLowerCase())
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return { sucesso: false };
      }

      const userDoc = snapshot.docs[0];
      const userData = userDoc.data();

      // Verificar senha com bcrypt
      const senhaValida = await verificarSenha(senha, userData.senha);

      if (senhaValida) {
        return {
          sucesso: true,
          barbeiro: userData.barbeiro,
          nome: userData.nome,
        };
      }

      return { sucesso: false };
    } catch (error) {
      console.error("Erro ao verificar login:", error);
      return { sucesso: false };
    }
  }

  // Criar usuários padrão se não existirem
  async criarUsuariosPadrao(): Promise<void> {
    try {
      const usuariosRef = collection(this.db, "usuarios");

      const snapshot = await getDocs(usuariosRef);

      if (snapshot.empty) {
        // Diego
        await addDoc(usuariosRef, {
          usuario: "diego",
          senha: await hashSenha("diego123"),
          nome: "Diego",
          barbeiro: "diego",
          ativo: true,
          createdAt: serverTimestamp(),
        });

        // Guilherme
        await addDoc(usuariosRef, {
          usuario: "guilherme",
          senha: await hashSenha("guilherme123"),
          nome: "Guilherme",
          barbeiro: "guilherme",
          ativo: true,
          createdAt: serverTimestamp(),
        });

        // Admin
        await addDoc(usuariosRef, {
          usuario: "admin",
          senha: await hashSenha("admin123"),
          nome: "Administrador",
          barbeiro: "qualquer",
          ativo: true,
          createdAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error("Erro ao criar usuários padrão:", error);
    }
  }

  // Alterar senha do usuário
  async alterarSenha(
    usuario: string,
    senhaAtual: string,
    novaSenha: string
  ): Promise<boolean> {
    try {
      const q = query(
        collection(this.db, "usuarios"),
        where("usuario", "==", usuario.toLowerCase())
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return false;
      }

      const userDoc = snapshot.docs[0];
      const userData = userDoc.data();

      // Verificar senha atual com bcrypt
      const senhaAtualValida = await verificarSenha(senhaAtual, userData.senha);
      if (!senhaAtualValida) {
        return false;
      }

      // Hash da nova senha
      const novaSenhaHash = await hashSenha(novaSenha);

      await updateDoc(userDoc.ref, {
        senha: novaSenhaHash,
        updatedAt: serverTimestamp(),
      });

      return true;
    } catch (error) {
      console.error("Erro ao alterar senha:", error);
      return false;
    }
  }
}

export const databaseService = new DatabaseService();
