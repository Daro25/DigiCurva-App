import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ImageBackground, 
  useWindowDimensions, 
  Platform,
  ScrollView,
  Alert,
  KeyboardTypeOptions // Importante para tipar el teclado
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons'; 

// --- DEFINICIONES DE TIPOS (INTERFACES) ---

// 1. Renombramos a UserFormData para evitar choque con 'FormData' nativo
interface UserFormData {
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  calle: string;
  numeroCasa: string;
  localidad: string;
}

// 2. Definimos qué props recibe el componente InputGroup
interface InputGroupProps {
  label: string;
  id: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: KeyboardTypeOptions;
}

const BACKGROUND_IMAGE = require('@/assets/images/fondoHome.jpg');

export default function Registro() {
  // --- ESTADO INICIAL ---
  // 3. Indicamos explícitamente que el estado usa la interfaz UserFormData
  const [formData, setFormData] = useState<UserFormData>({
    nombres: '',
    apellidos: '',
    email: '',
    telefono: '',
    calle: '',
    numeroCasa: '',
    localidad: ''
  });

  const { width } = useWindowDimensions();
  const isDesktop = width > 850; 

  // --- MANEJADOR DE CAMBIOS ---
  // 4. Tipamos 'field' como una de las claves de UserFormData y 'value' como string
  const handleChange = (field: keyof UserFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.nombres || !formData.email) {
      if (Platform.OS === 'web') alert("Complete campos obligatorios");
      else Alert.alert("Error", "Complete campos obligatorios");
      return;
    }

    try {
      const baseUrl = 'https://tu-api.com/endpoint';
      
      const params = new URLSearchParams({
        nombre: formData.nombres,
        apellido: formData.apellidos,
        email: formData.email,
        telefono: formData.telefono,
        calle: formData.calle,
        num_casa: formData.numeroCasa,
        localidad: formData.localidad
      });

      const finalUrl = `${baseUrl}?${params.toString()}`;
      console.log('Enviando a:', finalUrl);

      if (Platform.OS === 'web') {
        alert(`URL Generada:\n${finalUrl}`);
      } else {
        Alert.alert("API Request", `POST a:\n${finalUrl}`);
      }

    } catch (error) {
      console.error(error);
    }
  };

  return (
    <ImageBackground source={BACKGROUND_IMAGE} style={styles.container} resizeMode="cover">
      <View style={styles.overlay}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logoIcon}>
               <View style={styles.logoDot} />
            </View>
            <Text style={styles.logoText}>DigiCurva</Text>
          </View>
          <View style={styles.navLinks}>
             <TouchableOpacity><Text style={styles.navText}>Acceder</Text></TouchableOpacity>
             <TouchableOpacity><Text style={styles.navText}>Registrarse</Text></TouchableOpacity>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={[styles.card, { maxWidth: isDesktop ? 900 : '95%' }]}>
            
            {/* CARD HEADER */}
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Cuentenos sobre usted</Text>
              <TouchableOpacity onPress={handleSubmit} style={styles.arrowButton}>
                 <Ionicons name="arrow-forward" size={28} color="#000" />
              </TouchableOpacity>
            </View>

            {/* FORMULARIO - GRID */}
            <View style={[styles.formGrid, { flexDirection: isDesktop ? 'row' : 'column' }]}>
              
              {/* COLUMNA IZQUIERDA */}
              <View style={[styles.column, { marginRight: isDesktop ? 40 : 0 }]}>
                
                <InputGroup 
                  label="Nombre(s)" 
                  id="input_nombres"
                  value={formData.nombres}
                  onChangeText={(text: string) => handleChange('nombres', text)}
                />
                
                <InputGroup 
                  label="Apellido(s)" 
                  id="input_apellidos"
                  value={formData.apellidos}
                  onChangeText={(text: string) => handleChange('apellidos', text)}
                />

                <InputGroup 
                  label="Correo electrónico" 
                  id="input_email"
                  keyboardType="email-address"
                  value={formData.email}
                  onChangeText={(text: string) => handleChange('email', text)}
                />

                <InputGroup 
                  label="Número de teléfono" 
                  id="input_telefono"
                  keyboardType="phone-pad"
                  value={formData.telefono}
                  onChangeText={(text: string) => handleChange('telefono', text)}
                />

              </View>

              {/* COLUMNA DERECHA */}
              <View style={styles.column}>
                
                {/* Fila: Calle y # */}
                <View style={styles.rowInputs}>
                  <View style={{ flex: 3, marginRight: 15 }}>
                    <InputGroup 
                      label="Nombre de calle" 
                      id="input_calle"
                      value={formData.calle}
                      onChangeText={(text: string) => handleChange('calle', text)}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <InputGroup 
                      label="# de casa" 
                      id="input_numero_casa"
                      value={formData.numeroCasa}
                      onChangeText={(text: string) => handleChange('numeroCasa', text)}
                    />
                  </View>
                </View>

                <InputGroup 
                  label="Localidad" 
                  id="input_localidad"
                  value={formData.localidad}
                  onChangeText={(text: string) => handleChange('localidad', text)}
                />

                {/* FOTO UI */}
                <Text style={styles.label}>Foto (opcional)</Text>
                <View style={styles.photoSection}>
                  <View style={styles.photoPlaceholder}>
                    <Ionicons name="person-outline" size={40} color="#333" />
                  </View>
                  
                  <View style={styles.photoActions}>
                    <TouchableOpacity style={styles.cameraButton}>
                      <Ionicons name="camera-outline" size={24} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.fileButton}>
                       <MaterialIcons name="note-add" size={24} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>

              </View> 
              {/* Fin Columna Derecha */}

            </View> 
            {/* Fin FormGrid */}

          </View> 
          {/* Fin Card */}
        </ScrollView>
      </View> 
      {/* Fin Overlay */}
    </ImageBackground>
  );
}

// --- COMPONENTE AUXILIAR TIPADO ---
const InputGroup = ({ label, id, value, onChangeText, keyboardType = 'default' }: InputGroupProps) => (
  <View style={styles.inputContainer}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      testID={id}
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
    />
  </View>
);

// --- ESTILOS ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(56, 189, 248, 0.4)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 40,
    paddingBottom: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 35,
    height: 35,
    backgroundColor: '#1e40af',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  logoDot: {
    width: 10,
    height: 10,
    backgroundColor: '#60a5fa',
    borderRadius: 5,
    position: 'absolute',
    top: 5,
    right: 5
  },
  logoText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2
  },
  navLinks: {
    flexDirection: 'row',
    gap: 20,
  },
  navText: {
    color: '#1e3a8a',
    fontWeight: '600',
    fontSize: 16,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 20,
    padding: 40,
    width: '100%',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  cardTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#000',
    fontFamily: Platform.OS === 'web' ? 'Arial, sans-serif' : 'System',
  },
  arrowButton: {
    padding: 5,
  },
  formGrid: {
    width: '100%',
  },
  column: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000',
  },
  rowInputs: {
    flexDirection: 'row',
    width: '100%',
  },
  photoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  photoPlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#9ca3af',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoActions: {
    flexDirection: 'row',
    gap: 15,
  },
  cameraButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  fileButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#9ca3af',
    justifyContent: 'center',
    alignItems: 'center',
  }
});