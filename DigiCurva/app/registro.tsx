import React, { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
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
  Image,
  Alert,
  KeyboardTypeOptions, // Importante para tipar el teclado
  ActivityIndicator
} from 'react-native';
import { useRouter} from 'expo-router';
import { SesionUsuario } from '@/utils/SesionUsuario';
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
  contraseña: string;
  fotoUrl?: string; // Opcional, para la URL de la imagen subida
}

// 2. Definimos qué props recibe el componente InputGroup
interface InputGroupProps {
  label: string;
  id: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: KeyboardTypeOptions; 
  secureTextEntry?: boolean;
}

const BACKGROUND_IMAGE = require('@/assets/images/fondoHome.jpg');
const ICON = require('@/assets/images/icon.png');
export default function Registro() {
  const router = useRouter();
  //=============================Imagenes=============================
  // Estado para la foto (puede ser null, cargando, o la URL final)
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // 1. Función para seleccionar imagen (Galería o Cámara)
  const pickImage = async (useCamera: boolean) => {
    // Pedir permisos
    if (useCamera) {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        alert('Se necesitan permisos de cámara');
        return;
      }
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Se necesitan permisos de galería');
        return;
      }
    }

    // Abrir selector
    let result = await (useCamera 
      ? ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.7, // Comprimir un poco para subir rápido
        })
      : ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.7,
        })
    );

    if (!result.canceled) {
      // Mostrar la imagen localmente primero
      setPhotoUri(result.assets[0].uri);
      // Subir inmediatamente a tu API PHP
      //uploadToPHP(result.assets[0].uri);
    }
  };

  // 2. Función que conecta con tu API PHP
  const uploadToPHP = async (localUri: string) => {
    setUploading(true);
    const apiUrl = 'https://ljusstudie.site/SubirImagenBucker/subirImage.php'; // <--- PON TU URL AQUÍ

    // Preparar el nombre del archivo
    let filename = localUri.split('/').pop();

    // Inferir el tipo de archivo (jpeg/png)
    let match = /\.(\w+)$/.exec(filename || '');
    let type = match ? `image/${match[1]}` : `image`;

    // Crear el FormData (Esto es lo que lee $_FILES en PHP)
    const _formData = new FormData();
    
    // @ts-ignore: React Native espera un objeto especial para archivos
    _formData.append('image', { 
      uri: localUri, 
      name: filename || 'photo.jpg', 
      type: type 
    });

    // Opcional: Si quieres enviar el 'name' que tu PHP acepta
    _formData.append('name', 'foto_perfil_' + Date.now() + '.jpg');

    try {
      console.log("Subiendo a...", apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: _formData,
      });

      const responseData = await response.json();

      if (response.ok) {
        console.log("Imagen subida con éxito:", responseData);
        alert("Imagen guardada en la nube");
        // Aquí podrías guardar responseData.url en tu formData principal si lo necesitas
        handleChange('fotoUrl', responseData.url); 
        return responseData.url;
      } else {
        alert("Error del servidor: " + (responseData.error || 'Desconocido'));
        return '';
      }

    } catch (error) {
      console.error("Error de red:", error);
      alert("Error al subir la imagen");
    } finally {
      setUploading(false);
    }
  };
  //=============================Fin Imagenes=============================
  // --- ESTADO INICIAL ---
  // 3. Indicamos explícitamente que el estado usa la interfaz UserFormData
  const [formData, setFormData] = useState<UserFormData>({
    nombres: '',
    apellidos: '',
    email: '',
    telefono: '',
    calle: '',
    numeroCasa: '',
    localidad: '',
    contraseña: ''
  });

  const { width } = useWindowDimensions();
  const isDesktop = width > 850; 

  // --- MANEJADOR DE CAMBIOS ---
  // 4. Tipamos 'field' como una de las claves de UserFormData y 'value' como string
  const handleChange = (field: keyof UserFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    // 1. VALIDACIÓN
    var imageurl = '';
    if (!formData.nombres || !formData.email || !formData.contraseña || !formData.telefono || !formData.calle || !formData.numeroCasa || !formData.localidad) {
        if (Platform.OS === 'web') alert("Complete campos obligatorios");
        else Alert.alert("Error", "Complete campos obligatorios");
        return;
    }

    // 2. SUBIDA DE FOTO
    // Importante: Asegúrate de que uploadToPHP actualice el estado o devuelve la URL.
    // Si uploadToPHP es asíncrono, esperamos a que termine antes de armar el JSON.
    if (photoUri && !formData.fotoUrl) {
        imageurl = await uploadToPHP(photoUri);
        // Nota: Si uploadToPHP actualiza el estado 'formData', React podría no reflejarlo 
        // instantáneamente en esta misma ejecución. Lo ideal sería que uploadToPHP 
        // devolviera la URL string y la usaras aquí.
    }

    try {
        const apiUrl = 'https://ljusstudie.site/DigiCurvaServer/registro.php';

        // Preparamos el objeto con los datos limpios
        const url = `https://ljusstudie.site/DigiCurvaServer/registro.php?nombre=${encodeURIComponent(formData.nombres + ' ' + formData.apellidos)}&correo=${encodeURIComponent(formData.email)}&contrasena_hash=${encodeURIComponent(formData.contraseña)}&telefono=${encodeURIComponent(formData.telefono)}&direccion=${encodeURIComponent(formData.calle + ', ' + formData.numeroCasa + ', ' + formData.localidad)}&foto_perfil_url=${encodeURIComponent(imageurl || '')}`;
        /*const _formData = new FormData();
        _formData.append('nombre', formData.nombres + ' ' + formData.apellidos);
        _formData.append('correo', formData.email);
        _formData.append('contrasena_hash', formData.contraseña);
        _formData.append('telefono', formData.telefono);
        _formData.append('direccion', `${formData.calle}, ${formData.numeroCasa}, ${formData.localidad}`);
        _formData.append('foto_perfil_url', imageurl || '');

        console.log('Enviando datos (POST):', _formData);
        // 3. REALIZAR LA PETICIÓN POST
        const response = await fetch(apiUrl, {
            method: 'POST', // <--- CAMBIO CRUCIAL
            headers: {
                'Content-Type': 'application/json', // Indicamos que enviamos JSON
                'Accept': 'application/json'
            },
            body: _formData // Convertimos el objeto a texto JSON
        });*/
        console.log(url);
        
        const response = await fetch(url);

        // 4. MANEJO DE RESPUESTA
        const data = await response.json();
        console.log("Respuesta del servidor:", data);

        if (data && (data.id_usuario || data.success)) {
            // ==========================================
            // 👇 LÓGICA DE ÉXITO
            // ==========================================
            console.log("Registro exitoso. ID:", data.id_usuario);
            
            if (Platform.OS === 'web') alert(`¡Registro completado!`);
            else Alert.alert("Éxito", `¡Registro completado!`);

            if (data.id_usuario) {
                // Asegúrate que tu API devuelve 'id_usuario' o 'usuario_id' y sé consistente
                SesionUsuario.setId(data.id_usuario);
                router.replace('/');
            }
            // ==========================================
        } else {
            // ==========================================
            // 👇 LÓGICA DE FALLO
            // ==========================================
            const errorMessage = data.error || data.mensaje || "Error desconocido.";
            console.error("Fallo en el registro:", errorMessage);

            if (Platform.OS === 'web') alert(`Error: ${errorMessage}`);
            else Alert.alert("Error de Registro", errorMessage);
            // ==========================================
        }

    } catch (error) {
        console.error("Error en la petición:", error);
        if (Platform.OS === 'web') alert("Error de conexión con el servidor.");
        else Alert.alert("Error", "No se pudo conectar con el servidor.");
    }
};

  return (
    <ImageBackground source={BACKGROUND_IMAGE} style={styles.container} resizeMode="cover">
      <View style={styles.overlay}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image source={ICON} style={styles.logoIcon}/>
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

                <InputGroup 
                  label="Contraseña" 
                  id="input_contraseña"
                  value={formData.contraseña}
                  onChangeText={(text: string) => handleChange('contraseña', text)}
                  secureTextEntry={true} // <--- Agrega esta línea
                />
                
                {/* FOTO UI CONECTADA */}
                <Text style={styles.label}>Foto (opcional)</Text>
                <View style={styles.photoSection}>
                  
                  {/* Círculo de previsualización */}
                  <View style={styles.photoPlaceholder}>
                    {uploading ? (
                       <ActivityIndicator color="#333" />
                    ) : photoUri ? (
                       // Si hay foto, la mostramos. Si no, mostramos el icono
                       <Image 
                         source={{ uri: photoUri }} 
                         style={{ width: '100%', height: '100%', borderRadius: 8 }} 
                       />
                    ) : (
                       <Ionicons name="person-outline" size={40} color="#333" />
                    )}
                  </View>
                  
                  <View style={styles.photoActions}>
                    {/* Botón CÁMARA */}
                    <TouchableOpacity 
                      style={styles.cameraButton}
                      onPress={() => pickImage(true)} // true = usar cámara
                    >
                      <Ionicons name="camera-outline" size={24} color="#fff" />
                    </TouchableOpacity>

                    {/* Botón ARCHIVO/GALERÍA */}
                    <TouchableOpacity 
                      style={styles.fileButton}
                      onPress={() => pickImage(false)} // false = usar galería
                    >
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
const InputGroup = ({ label, id, value, onChangeText, keyboardType = 'default', secureTextEntry = false}: InputGroupProps) => (
  <View style={styles.inputContainer}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      testID={id}
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      secureTextEntry={secureTextEntry}
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