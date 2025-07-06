export interface Cliente {
  id: string;
  nome: string;
  telefone?: string;
  horarioEntrada: string;
  posicao: number;
  status: 'aguardando' | 'chamado' | 'atendido' | 'ausente';
  notificado: boolean;
  barbeiro?: 'diego' | 'guilherme' | 'qualquer';
}

export interface Configuracao {
  id: number;
  whatsappApiKey: string;
  whatsappApiUrl: string;
  tempoEspera: number; // em minutos
  tempoConfirmacao: number; // em minutos
}

export interface Notificacao {
  id: number;
  clienteId: string;
  tipo: 'alerta' | 'chamada' | 'confirmacao';
  mensagem: string;
  enviada: boolean;
  horarioEnvio: string;
} 