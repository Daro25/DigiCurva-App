import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Platform,
  Alert,
  ActivityIndicator,
  Image,
  Dimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import ImageColors from 'react-native-image-colors';
import { LinearGradient } from 'expo-linear-gradient'; // Asegúrate de instalar expo-linear-gradient
import { Ionicons, MaterialIcons } from '@expo/vector-icons'; // Iconos estándar de Expo

// Definición de tipos para los datos
interface Plan {
  id: number;
  title: string;
  subtitle: string;
  price: number;
  currency: string;
  frequency: string;
  featureText: string;
  isRecommended?: boolean;
}

// URL de la API (Placeholder)
const API_URL = 'https://tu-api.com/endpoint';
const ICON = require('@/assets/images/icon.png');
const BACKGROUND_IMAGE = require('@/assets/images/fondoHome.jpg');

export default function Anuncio() {
  //=============================Imagenes=============================
    // Estado para la foto (puede ser null, cargando, o la URL final)
    const [photoUri, setPhotoUri] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    // Estado para el color de la letra (Blanco o Negro/Oscuro)
  const [textColor, setTextColor] = useState<string>('black');
    // Función auxiliar para convertir Hex a RGB y calcular brillo
  const checkContrast = (hex: string) => {
        const r = parseInt(hex.substr(1, 2), 16);
        const g = parseInt(hex.substr(3, 2), 16);
        const b = parseInt(hex.substr(5, 2), 16);
        
        // Fórmula estándar de luminancia (percibida por el ojo humano)
        // Rango de 0 (negro absoluto) a 255 (blanco absoluto)
        const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        
        // Interpretación de tu regla "arriba de 7 oscuro":
        // Aquí usamos el estándar: si es menor a 128 es oscuro -> letra blanca.
        // Si quieres tu escala específica de 0 a 10 donde 10 es muy claro:
        // (yiq / 25.5) te da un valor del 0 al 10.
        
        const scale0to10 = yiq / 25.5; 

        // LOGICA: Si la imagen es oscura (promedio bajo), necesitamos letra BLANCA.
        // Si la escala es baja (ej. 3/10), es oscuro. Si es alta (8/10), es claro.
        
        // Si el brillo es menor a 5 (escala 0-10), es una imagen oscura -> Letra Blanca
        // Ajusta este '5' o '7' según qué tan estricto quieras ser.
        return (scale0to10 < 5) ? 'white' : '#1a1a1a'; // #1a1a1a es gris muy oscuro (casi negro)
    };
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
      // Si el usuario no canceló
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setPhotoUri(uri);

      // --- INICIO DE ANÁLISIS DE COLOR ---
      try {
        const resultColors = await ImageColors.getColors(uri, {
          fallback: '#000000',
          cache: true,
          key: uri,
        });

        let averageColorHex = '#000000';

        // Dependiendo de la plataforma (iOS/Android), la propiedad cambia
        if (resultColors.platform === 'android') {
          averageColorHex = resultColors.average;
        } else if (resultColors.platform === 'ios') {
          // iOS no siempre devuelve 'average', usamos background o primary como aproximación
          averageColorHex = resultColors.primary; 
        } else {
            // Web 
            averageColorHex = resultColors.dominant;
        }

        // Determinamos el color de la letra basado en el promedio
        const newTextColor = checkContrast(averageColorHex);
        setTextColor(newTextColor);
        
        console.log(`Color promedio: ${averageColorHex}, Color de letra: ${newTextColor}`);

      } catch (error) {
        console.log("Error analizando colores", error);
        // Fallback por defecto
        setTextColor('black');
      }
      // --- FIN DE ANÁLISIS DE COLOR ---
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
      const formData = new FormData();
      
      // @ts-ignore: React Native espera un objeto especial para archivos
      formData.append('image', { 
        uri: localUri, 
        name: filename || 'photo.jpg', 
        type: type 
      });
  
      // Opcional: Si quieres enviar el 'name' que tu PHP acepta
      formData.append('name', 'foto_perfil_' + Date.now() + '.jpg');
  
      try {
        console.log("Subiendo a...", apiUrl);
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data', // Importante para PHP
          },
        });
  
        const responseData = await response.json();
  
        if (response.ok) {
          console.log("Imagen subida con éxito:", responseData);
          alert("Imagen guardada en la nube");
          // Aquí podrías guardar responseData.url en tu formData principal si lo necesitas
          //handleChange('fotoUrl', responseData.url); 
        } else {
          alert("Error del servidor: " + (responseData.error || 'Desconocido'));
        }
  
      } catch (error) {
        console.error("Error de red:", error);
        alert("Error al subir la imagen");
      } finally {
        setUploading(false);
      }
    };
    //=============================Fin Imagenes=============================
  const [adTitle, setAdTitle] = useState('Titulo de anuncio');
  const [adDescription, setAdDescription] = useState('Lorem ipsum dolor sit amet, consectetur adipiscing elit.');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // 1. Simulación de carga de datos desde API (Los planes de la imagen)
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        // Aquí iría tu fetch real: const res = await fetch(`${API_URL}/plans`);
        
        // Simulamos respuesta de la API para replicar la imagen exactamente
        const mockData: Plan[] = [
          {
            id: 1,
            title: 'Plan 1',
            subtitle: 'Por una semana',
            price: 70,
            currency: 'MXN',
            frequency: '',
            featureText: 'Date a conocer por una semana',
            isRecommended: false,
          },
          {
            id: 2,
            title: 'Plan 2',
            subtitle: 'Por un Mes',
            price: 150,
            currency: '',
            frequency: '/ month',
            featureText: 'Graba el anuncio en la mente de todos por un mes.',
            isRecommended: true, // El plan negro de la imagen
          },
          {
            id: 3,
            title: 'Plan 3',
            subtitle: 'Por cuatro meses',
            price: 250,
            currency: '',
            frequency: '/ month',
            featureText: 'Se más radical y haz que todos vean tu anuncio por 4 meses.',
            isRecommended: false,
          },
        ];
        
        setPlans(mockData);
      } catch (error) {
        console.error('Error fetching plans', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  // 2. Lógica del POST Request
  const handleCreateAndPay = async (plan: Plan) => {
    if (!adTitle.trim() || !adDescription.trim()) {
      Alert.alert('Campos incompletos', 'Por favor llena el título y la descripción de tu anuncio.');
      return;
    }

    setSubmitting(true);

    const payload = {
      title: adTitle,
      description: adDescription,
      plan_id: plan.id,
      amount: plan.price,
    };

    try {
      console.log('Enviando Payload:', JSON.stringify(payload, null, 2));

      // Descomentar para producción:
      /*
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      */

      // Simulación de éxito
      setTimeout(() => {
        Alert.alert('Éxito', `Anuncio creado con el ${plan.title}. Redirigiendo a pagos...`);
        setSubmitting(false);
      }, 1500);

    } catch (error) {
      Alert.alert('Error', 'Hubo un problema conectando con el servidor.');
      setSubmitting(false);
    }
  };

  return (
    <ImageBackground source={BACKGROUND_IMAGE} style={styles.background} resizeMode="cover">
      {/* Overlay azulado sutil para mejorar legibilidad */}
      <LinearGradient colors={['rgba(135, 206, 250, 0.6)', 'rgba(135, 206, 235, 0.4)']} style={StyleSheet.absoluteFill} />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image source={ICON} style={styles.logoIcon}/>
            <Text style={styles.logoText}>DigiCurva</Text>
          </View>
          <Text style={styles.navLink}>Home</Text>
        </View>

        <Text style={styles.pageTitle}>Crea un anuncio</Text>

        {/* Sección Superior: Preview y Formulario */}
        <View style={styles.topSectionContainer}>
          
          {/* Columna Izquierda: Herramientas y Preview */}
          <View style={styles.leftColumn}>
            
            {/* Botones flotantes (Cámara y Archivo) */}
            <View style={styles.floatingTools}>
              <TouchableOpacity style={styles.toolButtonPrimary}
                      onPress={() => pickImage(true)} // true = usar cámara
                      >
                <Ionicons name="camera-outline" size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.toolButtonSecondary}
                      onPress={() => pickImage(false)} // false = usar galería
                    >
                <MaterialIcons name="add-to-photos" size={24} color="white" />
              </TouchableOpacity>
            </View>

            {/* Tarjeta de Previsualización (Glassmorphism) */}
            <LinearGradient
              colors={['rgba(200, 200, 200, 1)', 'rgba(130, 142, 177, 1)']}
              style={styles.previewCard}
            >
              <View style={styles.previewHeader}>
                 {/* El título se actualiza en tiempo real */}
                <Text style={[styles.previewTitle, {color:textColor}]}>{adTitle || 'Titulo de anuncio'}</Text>
              </View>
              {uploading ? (
                    <ActivityIndicator color="#333" />
                ) : photoUri ? (
                    // Si hay foto, la mostramos. Si no, mostramos el icono
                    <Image 
                        source={{ uri: photoUri }} 
                        style={{ width: '100%', height: '100%', borderRadius: 8, position: 'absolute' , top: 0, left: 0}} 
                        />
                ) : (
                    <View style={styles.previewImagePlaceholder}>
                        <Ionicons name="camera-outline" size={40} color="#fff" />
                    </View>
                )}
              {/* La descripción se actualiza en tiempo real */}
              <Text style={styles.previewDesc}>
                {adDescription || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'}
              </Text>
            </LinearGradient>
          </View>

          {/* Columna Derecha: Formulario (Inputs detectados) */}
          <View style={styles.formCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Titulo:</Text>
              <TextInput
                testID="input-titulo" // ID único para testing/referencia
                style={styles.input}
                placeholder="Titulo de anuncio"
                value={adTitle}
                onChangeText={setAdTitle}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Descrpción:</Text>
              <TextInput
                testID="input-descripcion" // ID único para testing/referencia
                style={[styles.input, styles.textArea]}
                placeholder="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
                value={adDescription}
                onChangeText={setAdDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                placeholderTextColor="#999"
              />
            </View>
          </View>
        </View>

        {/* Sección Inferior: Planes de Precios */}
        <View style={styles.plansContainer}>
          {loading ? (
            <ActivityIndicator size="large" color="#000" />
          ) : (
            plans.map((plan) => (
              <View key={plan.id} style={styles.planCard}>
                <View style={styles.planContent}>
                  <Text style={styles.planTitle}>{plan.title}</Text>
                  <Text style={styles.planSubtitle}>{plan.subtitle}</Text>
                  
                  <View style={styles.priceRow}>
                    <Text style={styles.currencySymbol}>$</Text>
                    <Text style={styles.priceAmount}>{plan.price}</Text>
                    <Text style={styles.priceFrequency}>
                      {plan.currency ? ` ${plan.currency}` : ''}
                      {plan.frequency}
                    </Text>
                  </View>

                  <View style={styles.featureRow}>
                    <Ionicons name="checkmark" size={18} color="#666" style={{ marginRight: 6 }} />
                    <Text style={styles.featureText}>{plan.featureText}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[
                    styles.planButton,
                    plan.isRecommended ? styles.planButtonBlack : styles.planButtonWhite
                  ]}
                  onPress={() => handleCreateAndPay(plan)}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator color={plan.isRecommended ? '#fff' : '#000'} />
                  ) : (
                    <Text style={[
                      styles.planButtonText,
                      plan.isRecommended ? styles.textWhite : styles.textBlack
                    ]}>
                      Crear y pagar
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

      </ScrollView>
    </ImageBackground>
  );
}

// --- HOJA DE ESTILOS (Responsive & Flexbox) ---
const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
  },
  scrollContainer: {
    padding: 20,
    alignItems: 'center', // Centra el contenido en pantallas grandes
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    maxWidth: 1200,
    marginBottom: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 32,
    height: 32,
    backgroundColor: '#0056b3', // Azul oscuro similar al logo
    borderRadius: 8,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoDot: {
    width: 8,
    height: 8,
    backgroundColor: '#4fc3f7', // Azul claro
    borderRadius: 4,
    position: 'absolute',
    top: 6,
    right: 6,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    fontFamily: Platform.OS === 'ios' ? 'Arial Rounded MT Bold' : 'Roboto',
  },
  navLink: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    alignSelf: 'flex-start',
    maxWidth: 1200,
    width: '100%',
    marginBottom: 20,
    marginLeft: Platform.OS === 'web' ? 'auto' : 0,
    marginRight: Platform.OS === 'web' ? 'auto' : 0,
  },
  
  // --- Layout Principal (Grid sistema manual) ---
  topSectionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap', // Permite responsive en móviles
    justifyContent: 'center',
    gap: 40,
    width: '100%',
    maxWidth: 1200,
    marginBottom: 40,
  },
  
  // --- Columna Izquierda ---
  leftColumn: {
    flex: 1,
    minWidth: 300,
    position: 'relative',
  },
  floatingTools: {
    position: 'absolute',
    left: -20, // Simulando que salen un poco del contenedor
    top: 20,
    zIndex: 10,
    gap: 15,
  },
  toolButtonPrimary: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4a90e2',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
  },
  toolButtonSecondary: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#888', // Gris
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  previewCard: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    padding: 20,
    justifyContent: 'space-between',
    marginLeft: 30, // Espacio para los botones flotantes
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  previewHeader: {
    alignItems: 'flex-end',
    zIndex: 5,
  },
  previewTitle: {
    fontSize: 22,
    fontFamily: 'serif',
    fontWeight: 'bold',
    color: '#333',
  },
  previewImagePlaceholder: {
    alignSelf: 'center',
    width: 80,
    height: 60,
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.8,
  },
  previewDesc: {
    fontSize: 16,
    fontFamily: 'serif',
    color: '#222',
  },

  // --- Columna Derecha (Formulario) ---
  formCard: {
    flex: 1,
    minWidth: 300,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    height: 250, // Altura fija aproximada para coincidir con diseño
  },
  inputGroup: {
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  label: {
    fontWeight: 'bold',
    width: 80,
    marginTop: 15,
    fontSize: 14,
    color: '#333',
  },
  input: {
    flex: 1,
    backgroundColor: '#fff', // Fondo blanco como en diseño
    borderRadius: 12,
    padding: 15,
    fontSize: 14,
    color: '#000',
    // Sombra interna simulada con elevación suave
    elevation: 2, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 0.5,
    borderColor: '#eee',
  },
  textArea: {
    height: 120,
  },

  // --- Sección de Planes ---
  plansContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 20,
    width: '100%',
    maxWidth: 1200,
  },
  planCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: 300,
    minHeight: 320, // Para alinear alturas
    justifyContent: 'space-between',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  planContent: {
    marginBottom: 20,
  },
  planTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  planSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 20,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: 2,
  },
  priceAmount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#000',
  },
  priceFrequency: {
    fontSize: 16,
    color: '#666',
    marginLeft: 5,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 10,
  },
  featureText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    flex: 1,
  },
  planButton: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  planButtonBlack: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  planButtonWhite: {
    backgroundColor: '#fff',
    borderColor: '#ddd',
  },
  planButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  textWhite: {
    color: '#fff',
  },
  textBlack: {
    color: '#000',
  },
});
}