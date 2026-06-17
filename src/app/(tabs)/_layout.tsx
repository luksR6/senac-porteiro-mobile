import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs, router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import authService from "../../services/authService";

const azulSistema = "#1453bd";
const laranjaSistema = "#f19000";

export default function TabsLayout() {
  const [isVerifying, setIsVerifying] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Controle de visibilidade do nosso Modal customizado
  const [modalSairVisivel, setModalSairVisivel] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const user = await authService.getUserFromStorage();
        if (user) {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Erro ao ler o authService:", error);
      } finally {
        setIsVerifying(false);
      }
    }
    checkAuth();
  }, []);

  const confirmarLogout = async () => {
    setModalSairVisivel(false);
    await authService.clearUserData();
    router.replace("/");
  };

  if (isVerifying) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={laranjaSistema} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href={"/" as any} />;
  }

  return (
    <>
      <Tabs
        screenOptions={{
          headerTintColor: 'white',
          tabBarActiveTintColor: laranjaSistema,
          tabBarInactiveTintColor: 'gray',
          headerStyle: { backgroundColor: azulSistema },
          tabBarStyle: { paddingBottom: 5, height: 60 },
          
          headerRight: () => (
            <TouchableOpacity 
              onPress={() => setModalSairVisivel(true)} // Abre o Modal em vez do Alert
              style={{ marginRight: 20 }}
            >
              <Ionicons name="log-out-outline" size={28} color="white" />
            </TouchableOpacity>
          ),
        }}
      >
        <Tabs.Screen
          name="leitor"
          options={{
            tabBarLabel: 'Leitor QR',
            headerTitle: 'Validação de Entrada',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="qr-code-outline" size={size} color={color} />
            )
          }}
        />
        <Tabs.Screen
          name="lista"
          options={{
            tabBarLabel: 'Lista',
            headerTitle: 'Ingressos Validados',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="list-outline" size={size} color={color} />
            )
          }}
        />
      </Tabs>

      {/* MODAL CUSTOMIZADO DE LOGOUT */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalSairVisivel}
        onRequestClose={() => setModalSairVisivel(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            
            <View style={styles.iconeContainer}>
              <Ionicons name="warning-outline" size={40} color={laranjaSistema} />
            </View>
            
            <Text style={styles.modalTitulo}>Sair do Sistema</Text>
            <Text style={styles.modalTexto}>Tem certeza que deseja desconectar e voltar para o login?</Text>
            
            <View style={styles.botoesContainer}>
              <TouchableOpacity 
                style={[styles.botao, styles.botaoCancelar]} 
                onPress={() => setModalSairVisivel(false)}
              >
                <Text style={styles.textoBotaoCancelar}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.botao, styles.botaoSair]} 
                onPress={confirmarLogout}
              >
                <Text style={styles.textoBotaoSair}>Sim, Sair</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>
    </>
  );
}

// Estilos adicionados para o Modal
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fundo escurecido semi-transparente
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 25,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    elevation: 5, // Sombra no Android
    shadowColor: '#000', // Sombra no iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  iconeContainer: {
    marginBottom: 15,
    backgroundColor: '#fff3cd', // Laranja bem clarinho no fundo do ícone
    padding: 15,
    borderRadius: 50,
  },
  modalTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: azulSistema,
    marginBottom: 10,
  },
  modalTexto: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 25,
  },
  botoesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  botao: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  botaoCancelar: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  botaoSair: {
    backgroundColor: laranjaSistema,
  },
  textoBotaoCancelar: {
    color: '#495057',
    fontSize: 16,
    fontWeight: 'bold',
  },
  textoBotaoSair: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  }
});