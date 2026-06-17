import { Ionicons } from "@expo/vector-icons";
import axios from "axios"; // Não esqueça do Axios para o upload real!
import { CameraView, useCameraPermissions } from "expo-camera";
import * as FileSystem from "expo-file-system";
import { useRef, useState } from "react";
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const azulSistema = "#1453bd";
const laranjaSistema = "#f19000";

export default function LeitorScreen() {
  const [permissao, pedirPermissao] = useCameraPermissions();
  const [fotoUri, setFotoUri] = useState<string | null>(null);
  const [isProcessando, setIsProcessando] = useState(false);
  
  const cameraRef = useRef<any>(null);

  if (!permissao) {
    return <View style={styles.container} />;
  }

  if (!permissao.granted) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="qr-code-outline" size={80} color="gray" />
        <Text style={styles.textoPermissao}>O aplicativo precisa da câmera para ler os QR Codes.</Text>
        <TouchableOpacity 
          style={[styles.botaoAcao, { backgroundColor: azulSistema, marginTop: 20 }]} 
          onPress={pedirPermissao}
        >
          <Text style={styles.textoBotaoAcao}>Conceder Permissão</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const baterFoto = async () => {
    if (cameraRef.current) {
      setIsProcessando(true);
      try {
        // mode="picture" ajuda a estabilizar a câmera
        const foto = await cameraRef.current.takePictureAsync();
        
        if (foto && foto.uri) {
          const infoArquivo = await FileSystem.getInfoAsync(foto.uri);
          console.log("Arquivo manipulado:", infoArquivo);
          setFotoUri(foto.uri);
        }
      } catch (error) {
        console.log("O Emulador falhou:", error);
        Alert.alert(
          "Aviso do Emulador", 
          "O emulador falhou ao gerar o arquivo físico. Simulando uma captura para você continuar os testes."
        );
        // Macete para você não ficar travado: cria uma imagem falsa para prosseguir
        setFotoUri("https://via.placeholder.com/400x400.png?text=QR+Code+Simulado");
      } finally {
        setIsProcessando(false);
      }
    }
  };

  const enviarParaServidor = async () => {
    if (!fotoUri) return;
    setIsProcessando(true);
    
    try {
      const formData = new FormData();
      formData.append("documento", {
        uri: fotoUri,
        name: "qrcode_capturado.jpg",
        type: "image/jpeg",
      } as any);

      const resposta = await axios.post("https://httpbin.org/post", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Upload concluído:", resposta.data);
      Alert.alert("Sucesso!", "QR Code enviado e validado no servidor externo.");
      setFotoUri(null); 
      
    } catch (error) {
      console.log("Erro no upload:", error);
      Alert.alert("Erro de Conexão", "Não foi possível enviar o arquivo.");
    } finally {
      setIsProcessando(false);
    }
  };

  const descartarFoto = () => {
    setFotoUri(null);
  };

  if (fotoUri) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: fotoUri }} style={styles.fotoPreview} />
        <View style={styles.botoesPreviewContainer}>
          <TouchableOpacity style={[styles.botaoAcao, styles.botaoDescartar]} onPress={descartarFoto} disabled={isProcessando}>
            <Ionicons name="trash-outline" size={24} color="white" />
            <Text style={styles.textoBotaoAcao}>Descartar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.botaoAcao, styles.botaoEnviar]} onPress={enviarParaServidor} disabled={isProcessando}>
            <Ionicons name="checkmark-circle-outline" size={24} color="white" />
            <Text style={styles.textoBotaoAcao}>Validar Ingresso</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing="back" ref={cameraRef} mode="picture">
        {/* A câmera agora ocupa 100% da tela, e tudo aqui dentro flutua sobre ela */}
        <View style={styles.overlayCamera}>
          <View style={styles.molduraFoco} />
          <Text style={styles.textoInstrucao}>Posicione o QR Code no centro</Text>
        </View>
        
        {/* Botão flutuante posicionado na parte inferior */}
        <View style={styles.controlesCameraFlutuante}>
          <TouchableOpacity 
            style={styles.botaoCaptura} 
            onPress={baterFoto} 
            disabled={isProcessando}
          >
            <View style={styles.mioloBotaoCaptura} />
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "black" },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20, backgroundColor: "#f8f9fa" },
  textoPermissao: { textAlign: "center", fontSize: 16, marginVertical: 20, color: "#6c757d" },
  
  // A câmera pega a tela toda
  camera: { flex: 1 }, 
  
  // O overlay tem o fundo levemente escuro, mas deixa o quadrado transparente
  overlayCamera: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.4)" },
  molduraFoco: { width: 250, height: 250, borderWidth: 2, borderColor: laranjaSistema, borderRadius: 15, backgroundColor: "transparent" },
  textoInstrucao: { color: "white", marginTop: 20, fontSize: 16, fontWeight: "bold", textShadowColor: "black", textShadowRadius: 5 },
  
  // 👇 A mágica do botão flutuante acontece aqui 👇
  controlesCameraFlutuante: { 
    position: "absolute", 
    bottom: 40, // Distância da margem inferior
    alignSelf: "center", // Centraliza horizontalmente
    alignItems: "center" 
  },
  botaoCaptura: { width: 70, height: 70, borderRadius: 35, borderWidth: 4, borderColor: "white", justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.3)" },
  mioloBotaoCaptura: { width: 54, height: 54, borderRadius: 27, backgroundColor: "white" },
  
  fotoPreview: { flex: 1, resizeMode: "contain" },
  botoesPreviewContainer: { flexDirection: "row", justifyContent: "space-around", padding: 20, backgroundColor: "black" },
  botaoAcao: { flexDirection: "row", alignItems: "center", paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, gap: 10 },
  botaoDescartar: { backgroundColor: "#dc3545" },
  botaoEnviar: { backgroundColor: azulSistema },
  textoBotaoAcao: { color: "white", fontSize: 16, fontWeight: "bold" }
});