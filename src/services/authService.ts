import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LoginRequest {
  email: string;
  senha: string;
  lembrarMe?: boolean;
}

export interface AuthUser {
  id: number;
  nome: string;
  email: string;
}

const STORAGE_USER_DATA = "@user_data";
const STORAGE_AUTH_STATE = "@auth_state";
const STORAGE_REMEMBER_EMAIL = "@remember_email"; // <-- Nova gaveta para o Lembrar-me

class AuthService {
  async login(credentials: LoginRequest): Promise<AuthUser> {
    // 🚀 MOCK PARA TESTAR O FRONTEND SEM O BACKEND 🚀
    
    // Finge um delay de 1.5 segundos da rede
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Cria um usuário fake
    const mockUser = { 
      id: 1, 
      nome: "Lucas", 
      email: credentials.email 
    };

    // Salva a sessão do usuário
    await AsyncStorage.setItem(STORAGE_USER_DATA, JSON.stringify(mockUser));
    await AsyncStorage.setItem(STORAGE_AUTH_STATE, "authenticated");
    
    // 👇 O "CÉREBRO" DO LEMBRAR-ME 👇
    if (credentials.lembrarMe) {
      // Se a chave estiver ligada, salva o e-mail no celular
      await AsyncStorage.setItem(STORAGE_REMEMBER_EMAIL, credentials.email);
    } else {
      // Se estiver desligada, apaga qualquer e-mail salvo anteriormente
      await AsyncStorage.removeItem(STORAGE_REMEMBER_EMAIL);
    }
    
    return mockUser;

    /* === CÓDIGO ORIGINAL (DESCOMENTE QUANDO O SPRING BOOT ESTIVER RODANDO) ===
    const response = await api.post<AuthUser>("/auth/login", credentials);
    await AsyncStorage.setItem(STORAGE_USER_DATA, JSON.stringify(response.data));
    await AsyncStorage.setItem(STORAGE_AUTH_STATE, "authenticated");
    
    if (credentials.lembrarMe) {
      await AsyncStorage.setItem(STORAGE_REMEMBER_EMAIL, credentials.email);
    } else {
      await AsyncStorage.removeItem(STORAGE_REMEMBER_EMAIL);
    }

    return response.data;
    =========================================================================== */
  }

  async getUserFromStorage(): Promise<AuthUser | null> {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      return null;
    }
  }

  // 👇 NOVA FUNÇÃO PARA A TELA DE LOGIN PUXAR O E-MAIL 👇
  async getRememberedEmail(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_REMEMBER_EMAIL);
    } catch (error) {
      return null;
    }
  }

  async clearUserData(): Promise<void> {
    // Apaga apenas a sessão. NÃO apaga o STORAGE_REMEMBER_EMAIL para o e-mail continuar lá!
    await AsyncStorage.removeItem(STORAGE_USER_DATA);
    await AsyncStorage.removeItem(STORAGE_AUTH_STATE);
  }
}

const authService = new AuthService();
export default authService;