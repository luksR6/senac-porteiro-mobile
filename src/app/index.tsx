import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ActivityIndicator, Modal, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from "react-native";
import authService from "../services/authService";

const azulSistema = "#1453bd";
const laranjaSistema = "#f19000";

type LoginFormData = {
  email: string;
  senha: string;
  local: string;
  lembrarMe: boolean;
};

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [modalErroVisivel, setModalErroVisivel] = useState(false);
  const [mensagemErro, setMensagemErro] = useState("");

  const { control, handleSubmit, setValue, formState: { errors } } = useForm<LoginFormData>({
    defaultValues: {
      email: "",
      senha: "",
      local: "Principal",
      lembrarMe: false
    }
  });

  useEffect(() => {
    async function carregarEmailSalvo() {
      const emailSalvo = await authService.getRememberedEmail();
      if (emailSalvo) {
        setValue("email", emailSalvo);
        setValue("lembrarMe", true);
      }
    }
    carregarEmailSalvo();
  }, [setValue]);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    try {
      const user = await authService.login({ 
        email: data.email, 
        senha: data.senha, 
        lembrarMe: data.lembrarMe 
      });
      
      console.log(`Logado no portão: ${data.local} | Usuário:`, user);
      router.replace("/(tabs)/leitor" as any);
      
    } catch (error: any) {
      const msg = error.response?.data?.message || "Não foi possível conectar ao servidor. Verifique sua conexão.";
      setMensagemErro(msg);
      setModalErroVisivel(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Bem-vindo</Text>
      <Text style={styles.subtitulo}>Faça login para continuar</Text>

      {/* CAMPO 1: E-MAIL */}
      <Controller
        control={control}
        name="email"
        rules={{ 
          required: "O e-mail é obrigatório.",
          pattern: { value: /\S+@\S+\.\S+/, message: "Digite um e-mail válido." }
        }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={[styles.input, errors.email && styles.inputErro]}
            placeholder="E-mail"
            keyboardType="email-address"
            autoCapitalize="none"
            value={value}
            onChangeText={onChange}
          />
        )}
      />
      {errors.email && <Text style={styles.textoErro}>{errors.email.message}</Text>}

      <Controller
        control={control}
        name="senha"
        rules={{ required: "A senha é obrigatória." }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={[styles.input, errors.senha && styles.inputErro]}
            placeholder="Senha"
            secureTextEntry
            value={value}
            onChangeText={onChange}
          />
        )}
      />
      {errors.senha && <Text style={styles.textoErro}>{errors.senha.message}</Text>}

      <View style={styles.pickerContainer}>
        <Text style={styles.labelPicker}>Local de Acesso:</Text>
        <Controller
          control={control}
          name="local"
          render={({ field: { onChange, value } }) => (
            <Picker
              selectedValue={value}
              onValueChange={onChange}
              style={styles.picker}
            >
              <Picker.Item label="Portão Principal" value="Principal" />
              <Picker.Item label="Entrada de Serviço" value="Servico" />
              <Picker.Item label="Área VIP" value="VIP" />
            </Picker>
          )}
        />
      </View>

      <View style={styles.opcoesContainer}>
        <View style={styles.lembrarMeContainer}>
          <Controller
            control={control}
            name="lembrarMe"
            render={({ field: { onChange, value } }) => (
              <Switch
                trackColor={{ false: "#dee2e6", true: "#cce5ff" }}
                thumbColor={value ? azulSistema : "#f8f9fa"}
                onValueChange={onChange}
                value={value}
              />
            )}
          />
          <Text style={styles.textoOpcoes}>Lembrar-me</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.botao} onPress={handleSubmit(onSubmit)} disabled={isLoading}>
        {isLoading ? <ActivityIndicator color="white" /> : <Text style={styles.textoBotao}>Entrar</Text>}
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalErroVisivel}
        onRequestClose={() => setModalErroVisivel(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.iconeContainer}>
              <Ionicons name="close-circle-outline" size={40} color="#dc3545" />
            </View>
            <Text style={styles.modalTitulo}>Falha no Acesso</Text>
            <Text style={styles.modalTexto}>{mensagemErro}</Text>
            <TouchableOpacity style={styles.botaoFechar} onPress={() => setModalErroVisivel(false)}>
              <Text style={styles.textoBotaoFechar}>Tentar Novamente</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20, backgroundColor: "#f8f9fa" },
  titulo: { fontSize: 28, fontWeight: "bold", color: azulSistema, textAlign: "center", marginBottom: 5 },
  subtitulo: { fontSize: 16, color: "gray", textAlign: "center", marginBottom: 30 },
  
  input: { backgroundColor: "white", borderWidth: 1, borderColor: "#dee2e6", borderRadius: 10, padding: 15, marginBottom: 5, fontSize: 16 },
  inputErro: { borderColor: "#dc3545" }, // Borda vermelha se der erro
  textoErro: { color: "#dc3545", fontSize: 13, marginBottom: 15, marginLeft: 5 },
  
  pickerContainer: { backgroundColor: "white", borderWidth: 1, borderColor: "#dee2e6", borderRadius: 10, marginBottom: 15, overflow: 'hidden' },
  labelPicker: { fontSize: 12, color: "gray", paddingTop: 8, paddingLeft: 15 },
  picker: { height: 50, width: '100%', marginTop: -5 },
  
  opcoesContainer: { flexDirection: "row", justifyContent: "flex-start", alignItems: "center", marginBottom: 25, paddingHorizontal: 5 },
  lembrarMeContainer: { flexDirection: "row", alignItems: "center" },
  textoOpcoes: { marginLeft: 8, color: "#6c757d", fontSize: 14 },
  
  botao: { backgroundColor: laranjaSistema, padding: 15, borderRadius: 10, alignItems: "center", marginTop: 10 },
  textoBotao: { color: "white", fontSize: 18, fontWeight: "bold" },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: 'white', borderRadius: 15, padding: 25, width: '100%', maxWidth: 320, alignItems: 'center', elevation: 5 },
  iconeContainer: { marginBottom: 15, backgroundColor: '#f8d7da', padding: 15, borderRadius: 50 },
  modalTitulo: { fontSize: 20, fontWeight: 'bold', color: '#842029', marginBottom: 10 },
  modalTexto: { fontSize: 15, color: '#6c757d', textAlign: 'center', marginBottom: 20, lineHeight: 22 },
  botaoFechar: { backgroundColor: azulSistema, paddingVertical: 12, borderRadius: 8, alignItems: 'center', width: '100%' },
  textoBotaoFechar: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});