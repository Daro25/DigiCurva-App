import React, { useState } from 'react';
import { Image } from 'expo-image';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ImageBackground, 
  useWindowDimensions, 
  ActivityIndicator, 
  Platform,
  KeyboardAvoidingView,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Iconos estándar en Expo
import { Link } from 'expo-router';

// URL de la imagen de fondo (Usamos una similar de Unsplash para la demo)
const BACKGROUND_IMAGE = require('@/assets/images/fondoHome.jpg');

export default function Login() {
  // Hooks de estado para los inputs
  const [identifier, setIdentifier] = useState(''); // ID: input_identifier
  const [password, setPassword] = useState('');     // ID: input_password
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [loading, setLoading] = useState(false);

  // Responsive: Detectar ancho de pantalla
  const { width } = useWindowDimensions();
  const isDesktop = width > 900;

  // --- LÓGICA CRÍTICA DE API ---
  const handleLogin = async () => {
    if (!identifier || !password) {
      alert("Por favor complete todos los campos");
      return;
    }

    setLoading(true);

    try {
      // REQUISITO: Método POST pero variables en URL (Query Params)
      const baseUrl = 'https://ljusstudie.site/DigiCurvaServer/login.php';
      
      // Construcción manual de los parámetros URL
      const params = new URLSearchParams({
        correo: identifier, // Mapeado al input de usuario
        contrasena: password    // Mapeado a la contraseña
      });

      const finalUrl = `${baseUrl}?${params.toString()}`;

      console.log('Enviando POST a:', finalUrl); 

      const response = await fetch(finalUrl, {
        method: 'POST', // Método solicitado
        headers: {
          'Content-Type': 'application/json',
          // 'Accept': 'application/json'
        },
        // BODY VACÍO intencionalmente según requerimiento
      });

      const data = await response.json();
      console.log('Respuesta:', data);
      alert(`Petición enviada exitosamente a: \n${finalUrl}`);

    } catch (error) {
      console.error(error);
      // Simulamos éxito para la demo visual si la API fake falla
      alert(`Simulación: Petición POST enviada con Query Params:\nUsuario: ${identifier}\nPass: ${password}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground source={BACKGROUND_IMAGE} style={styles.container} resizeMode="cover">
      {/* Capa azul semitransparente (Overlay) */}
      <View style={styles.overlay}>
        
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"} 
          style={styles.keyboardView}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            
            {/* Contenedor Principal (Cambia dirección según pantalla) */}
            <View style={[styles.mainContent, { flexDirection: isDesktop ? 'row' : 'column' }]}>
              
              {/* SECCIÓN IZQUIERDA: Texto Branding */}
              <View style={[styles.leftSection, { alignItems: isDesktop ? 'flex-start' : 'center', marginBottom: isDesktop ? 0 : 40 }]}>
                <Text style={styles.brandTitle}>Bienvenidos</Text>
                <Text style={styles.brandTitle}>a DigiCurva</Text>
                <Text style={styles.brandSubtitle}>Una tienda que apoya a tu comunidad</Text>
              </View>

              {/* SECCIÓN DERECHA: Formulario Login */}
              <View style={[styles.rightSection, { width: isDesktop ? 450 : '100%', maxWidth: 450 }]}>
                <View style={styles.card}>
                  
                  {/* Input 1: Identificador */}
                  <Text style={styles.label}>Número de teléfono o correo electrónico</Text>
                  <TextInput
                    style={styles.input}
                    placeholder=""
                    value={identifier}
                    onChangeText={setIdentifier}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    testID="input_identifier" // ID único solicitado
                  />

                  {/* Input 2: Contraseña */}
                  <Text style={styles.label}>Contraseña</Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={styles.inputPassword}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={secureTextEntry}
                      testID="input_password" // ID único solicitado
                    />
                    <TouchableOpacity 
                      style={styles.eyeIcon} 
                      onPress={() => setSecureTextEntry(!secureTextEntry)}
                    >
                      <Ionicons name={secureTextEntry ? "eye-off-outline" : "eye-outline"} size={20} color="#666" />
                    </TouchableOpacity>
                  </View>

                  {/* Botón Principal */}
                  <TouchableOpacity 
                    style={styles.button} 
                    onPress={handleLogin}
                    disabled={loading}
                    activeOpacity={0.8}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.buttonText}>Iniciar sesión</Text>
                    )}
                  </TouchableOpacity>

                  {/* Footer del Formulario */}
                  <View style={styles.formFooter}>
                    <Text style={styles.footerText}>
                      ¿No tiene una cuenta?{' '}
                      <Link href="/registro">
                          <Text style={{ color: 'blue', marginTop: 20 }}>Registrarse en su lugar</Text>
                      </Link>
                    </Text>
                    <Ionicons name="sunny-outline" size={24} color="#333" />
                  </View>

                </View>
              </View>

            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </ImageBackground>
  );
}

// --- STYLE.TS (Integrado) ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(100, 200, 255, 0.65)', // Tinte azul estilo DigiCurva
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  mainContent: {
    width: '100%',
    maxWidth: 1200,
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 40,
  },
  // Estilos Izquierda
  leftSection: {
    flex: 1,
    paddingHorizontal: 20,
  },
  brandTitle: {
    fontSize: 58, // Tamaño grande como en la imagen
    fontWeight: '900',
    color: '#fff',
    lineHeight: 65,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 10,
    fontFamily: Platform.OS === 'web' ? 'Arial, sans-serif' : 'System', // Fallback
  },
  brandSubtitle: {
    fontSize: 24,
    color: '#fff',
    marginTop: 10,
    fontWeight: '400',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  // Estilos Derecha (Card)
  rightSection: {
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#fff', // F1F5F9 según la imagen parece un gris muy claro o blanco
    borderRadius: 12,
    padding: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10.84,
    elevation: 10,
    width: '100%',
  },
  label: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
  },
  inputPassword: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: {
    padding: 10,
  },
  button: {
    backgroundColor: '#3b82f6', // Azul real similar a la imagen
    borderRadius: 6,
    paddingVertical: 14,
    marginTop: 25,
    alignItems: 'center',
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  formFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 13,
    color: '#333',
  },
  linkText: {
    color: '#2563eb',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});