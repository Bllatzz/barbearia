# 🪒 Bernardes Barbearia - Sistema de Fila Moderno

Sistema premium de gerenciamento de fila para barbearia com design minimalista, notificações WhatsApp e painel administrativo elegante.

## ✨ Características

- **Design Premium**: Interface minimalista e moderna com gradientes e animações
- **Fila em Tempo Real**: Atualizações instantâneas via Firebase Firestore
- **Notificações WhatsApp**: Alertas automáticos para clientes
- **Painel Administrativo**: Controle completo da fila com interface elegante
- **Responsivo**: Otimizado para tablets e smartphones
- **Offline**: Funciona mesmo sem internet
- **Tipografia Moderna**: Sistema de fontes elegante e legível

## 🚀 Tecnologias

- **React Native** com Expo
- **Firebase Firestore** para banco de dados em tempo real
- **WhatsApp Business API** para notificações
- **TypeScript** para type safety
- **Expo Linear Gradient** para efeitos visuais
- **Design System** próprio com componentes premium

## 📱 Telas

### 1. Tela de Entrada (Cliente) - Design Premium
- Logo com gradiente animado
- Formulário elegante com campos modernos
- Status da fila com visual impactante
- Interface minimalista e intuitiva
- Efeitos visuais sutis

### 2. Painel Administrativo (Barbeiro) - Interface Profissional
- Lista da fila em tempo real com cards modernos
- Botões com gradientes e animações
- Adicionar/remover clientes com facilidade
- Estatísticas visuais elegantes
- Controles intuitivos

### 3. Configurações - Interface Limpa
- Configuração do Firebase
- Configuração do WhatsApp API
- Testes de conectividade
- Interface organizada e clara

## 🚀 Instalação

### Pré-requisitos
- Node.js 18+
- Expo CLI
- Android Studio (para Android) ou Xcode (para iOS)

### Passos

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd barbearia
```

2. **Instale as dependências**
```bash
npm install
```

3. **Execute o projeto**
```bash
npx expo start
```

4. **Escaneie o QR Code** com o app Expo Go no seu dispositivo

## ⚙️ Configuração

### 1. Configurar WhatsApp API

Acesse **Configurações** no app e configure uma das APIs suportadas:

#### Twilio
- **API URL**: `https://api.twilio.com/2010-04-01/Accounts/{AccountSid}/Messages.json`
- **API Key**: Sua Account SID do Twilio

#### Z-API
- **API URL**: `https://api.z-api.io/instances/{instance}/token/{token}/send-text`
- **API Key**: Seu Client-Token

#### Wati
- **API URL**: `https://api.wati.io/v1/sendMessage`
- **API Key**: Seu Bearer Token

#### UltraMsg
- **API URL**: `https://api.ultramsg.com/{instance}/messages/send`
- **API Key**: Seu Token

### 2. Configurações de Tempo
- **Tempo Médio de Atendimento**: 15 minutos (padrão)
- **Tempo de Confirmação**: 5 minutos (padrão)

## 📱 Como Usar

### Para Clientes
1. Abra o app no tablet da barbearia
2. Digite seu nome completo
3. Opcionalmente, informe seu WhatsApp
4. Clique em "ENTRAR NA FILA"
5. Aguarde as notificações

### Para Barbeiros
1. Acesse o "PAINEL ADMINISTRATIVO"
2. Use "CHAMAR PRÓXIMO" para chamar clientes
3. Marque como "✓" (atendido) ou "✗" (ausente)
4. Adicione clientes manualmente se necessário

## 🗄️ Banco de Dados

O sistema usa **Firebase Firestore** com as seguintes coleções:

- **clientes**: Dados dos clientes na fila
- **configuracoes**: Configurações do sistema
- **notificacoes**: Histórico de mensagens enviadas

### 🔥 Configuração do Firebase (Já Configurado)

O Firebase já está configurado para o projeto Bernardes Barbearia:

```typescript
const firebaseConfig = {
  apiKey: "AIzaSyBS1OaOcKorKUvaDgUHqypKoYpfKJYmK9w",
  authDomain: "bernardes-barbearia.firebaseapp.com",
  projectId: "bernardes-barbearia",
  storageBucket: "bernardes-barbearia.firebasestorage.app",
  messagingSenderId: "191865764626",
  appId: "1:191865764626:web:65e6f6831037d0471751cb"
};
```

**Status**: ✅ Configurado e funcionando

## 🔧 Estrutura do Projeto

```
barbearia/
├── app/
│   ├── index.tsx          # Tela principal de entrada
│   ├── painel.tsx         # Painel administrativo
│   └── configuracoes.tsx  # Configurações do sistema
├── components/
│   └── ui/                # Componentes de interface
├── services/
│   ├── DatabaseService.ts # Serviço de banco de dados
│   ├── WhatsAppService.ts # Serviço de WhatsApp
│   └── FilaService.ts     # Lógica de negócio da fila
├── types/
│   └── index.ts           # Tipos TypeScript
└── constants/
    └── Colors.ts          # Paleta de cores
```

## 🛠️ Tecnologias Utilizadas

- **React Native** com Expo
- **TypeScript**
- **Firebase Firestore**
- **React Navigation**
- **Expo Router**

## 📋 Checklist de Implementação

- [x] Tela de entrada na fila
- [x] Formulário com nome e WhatsApp
- [x] Sistema de notificações WhatsApp
- [x] Painel administrativo
- [x] Gerenciamento de fila em tempo real
- [x] Timer de confirmação (5 minutos)
- [x] Design com cores da barbearia
- [x] Banco de dados SQLite
- [x] Configurações do sistema
- [x] Suporte a múltiplas APIs WhatsApp

## 🚨 Importante

- O sistema funciona **online** (precisa de internet)
- As notificações WhatsApp precisam de internet
- Configure o Firebase antes de usar o sistema
- Configure a API do WhatsApp antes de usar as notificações
- O Firebase oferece sincronização em tempo real entre dispositivos

## 📞 Suporte

Para dúvidas ou problemas, entre em contato com o desenvolvedor.

---

**Bernades Barbearia** - Sistema Inteligente de Gerenciamento de Fila v1.0.0
