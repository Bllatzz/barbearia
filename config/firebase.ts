import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Configuração do Firebase para Bernades Barbearia
const firebaseConfig = {
  apiKey: "AIzaSyBS1OaOcKorKUvaDgUHqypKoYpfKJYmK9w",
  authDomain: "bernardes-barbearia.firebaseapp.com",
  projectId: "bernardes-barbearia",
  storageBucket: "bernardes-barbearia.firebasestorage.app",
  messagingSenderId: "191865764626",
  appId: "1:191865764626:web:65e6f6831037d0471751cb"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Firestore
export const db = getFirestore(app);

export default app;

// 📋 Configuração do Firestore:
// 1. No Firebase Console, vá em "Firestore Database"
// 2. Clique em "Create database"
// 3. Escolha "Start in test mode" (para desenvolvimento)
// 4. Escolha a localização mais próxima
// 5. As coleções serão criadas automaticamente quando o app for usado

// 🔒 Regras de Segurança (opcional):
// No Firestore > Rules, você pode usar estas regras básicas:
/*
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // Apenas para desenvolvimento
    }
  }
}
*/ 