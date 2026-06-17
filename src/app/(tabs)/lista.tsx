import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

const azulSistema = "#1453bd";
const laranjaSistema = "#f19000";

interface IngressoValidado {
  id: number;
  nome: string;
  horaEntrada: string;
  status: string;
}

export default function ListaScreen() {
  const [ingressos, setIngressos] = useState<IngressoValidado[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [erro, setErro] = useState("");

  const carregarDados = async () => {
    setErro("");
    try {
      const response = await axios.get("https://jsonplaceholder.typicode.com/users");
      
      const dadosFormatados = response.data.slice(0, 5).map((user: any) => ({
        id: user.id,
        nome: user.name, 
        horaEntrada: "14:30",
        status: "Validado"
      }));

      // 3. Colocamos na tela!
      setIngressos(dadosFormatados);
      
    } catch (error: any) {
      setErro("Não foi possível carregar os dados. Verifique sua conexão.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const onRefresh = () => {
    setIsRefreshing(true);
    carregarDados();
  };

  const renderItem = ({ item }: { item: IngressoValidado }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.nomeText}>{item.nome}</Text>
        <View style={styles.tagStatus}>
          <Text style={styles.statusText}>{item.status || "Validado"}</Text>
        </View>
      </View>
      <Text style={styles.horaText}>Entrada: {item.horaEntrada}</Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={laranjaSistema} />
        <Text style={styles.loadingText}>Buscando registros...</Text>
      </View>
    );
  }

  if (erro) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="cloud-offline-outline" size={60} color="#dc3545" />
        <Text style={styles.erroText}>{erro}</Text>
        <TouchableOpacity style={styles.botaoRecarregar} onPress={() => { setIsLoading(true); carregarDados(); }}>
          <Text style={styles.textoBotao}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={ingressos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[azulSistema]} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nenhum ingresso validado até o momento.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20, backgroundColor: "#f8f9fa" },
  listContainer: { padding: 15, paddingBottom: 30 },
  
  card: { backgroundColor: "white", borderRadius: 10, padding: 15, marginBottom: 15, borderWidth: 1, borderColor: "#dee2e6", elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  nomeText: { fontSize: 18, fontWeight: "bold", color: "#343a40", flex: 1 },
  horaText: { fontSize: 14, color: "#6c757d" },
  
  tagStatus: { backgroundColor: "#d1e7dd", paddingVertical: 4, paddingHorizontal: 10, borderRadius: 20 },
  statusText: { color: "#0f5132", fontSize: 12, fontWeight: "bold" },
  
  loadingText: { marginTop: 15, fontSize: 16, color: "gray" },
  erroText: { marginTop: 15, fontSize: 16, color: "#dc3545", textAlign: "center", marginBottom: 20 },
  emptyText: { textAlign: "center", marginTop: 50, fontSize: 16, color: "gray" },
  
  botaoRecarregar: { backgroundColor: azulSistema, paddingVertical: 12, paddingHorizontal: 25, borderRadius: 8 },
  textoBotao: { color: "white", fontSize: 16, fontWeight: "bold" }
});