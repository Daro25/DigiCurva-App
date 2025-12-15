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
  Linking, // Importante para abrir el link de PayPal
} from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import ImageColors from 'react-native-image-colors';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter, useRootNavigationState} from 'expo-router';
// Si configuraste el alias '@' en tu tsconfig.json
import { SesionUsuario } from '../utils/SesionUsuario';

// --- DEFINICIÓN DE URLs (Flujo de 3 Pasos) ---
const URL_SUBIR_IMAGEN = 'https://ljusstudie.site/SubirImagenBucker/subirImage.php';      // 1. Sube foto -> Devuelve URL string
const URL_CREAR_ANUNCIO = 'https://ljusstudie.site/DigiCurvaServer/publicar_anuncio.php';     // 2. Sube datos + URL foto -> Devuelve ID
const URL_PROCESAR_PAGO = 'https://ljusstudie.site/paypal/crear_link_paypal.php';  // 3. Sube ID + Precio -> Devuelve Link PayPal

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

const ICON = require('@/assets/images/icon.png');
const BACKGROUND_IMAGE = require('@/assets/images/fondoHome.jpg');

export default function Anuncio() {
  const router = useRouter();
  const [photoUri, setPhotoUri] = useState<string>('');
  const [textColor, setTextColor] = useState<string>('#000');
  const [adTitle, setAdTitle] = useState('Titulo de anuncio');
  const [adDescription, setAdDescription] = useState('Lorem ipsum dolor sit amet, consectetur adipiscing elit.');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // ... (Las funciones checkContrast y pickImage se mantienen IGUALES que antes) ...
  const checkContrast = (hex: string): string => {
    const r = parseInt(hex.substr(1, 2), 16);
    const g = parseInt(hex.substr(3, 2), 16);
    const b = parseInt(hex.substr(5, 2), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return yiq < 150 ? '#fff' : '#000';
  };
  const pickImage = async (useCamera: boolean) => {
  // Permisos
  const { status } = useCamera
    ? await ImagePicker.requestCameraPermissionsAsync()
    : await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    alert('Se necesitan permisos');
    return;
  }

  // Selector con recorte 9:5
  let result = await (useCamera
    ? ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [5,9],
        quality: 0.7,
      })
    : ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [5,9],
        quality: 0.7,
      })
  );
  if (result.canceled || !result.assets?.length) return;

  const finalImageUri = result.assets[0].uri;
  //setPhotoUri(finalImageUri);
  //================= ANALIZAR SOLO LA MITAD DERECHA =================
  try {
    // 1. Obtener tamaño real de la imagen recortada
    const imageInfo = await ImageManipulator.manipulateAsync(
      finalImageUri,
      [],
      { base64: false }
    );
    const width = imageInfo.width;
    const height = imageInfo.height;
    const nueve5 = await ImageManipulator.manipulateAsync(
      finalImageUri,
      [
        {
          crop: {
            originX: (width < height ? 0 : (width/2) - (height/5)*9/2),
            originY: (height < width ? 0 : (height/2) - (width /9)*5/2),
            width: (width < height ? width : (height / 5)*9),
            height: (height < width ? height : (width / 9)*5),
          },
        }
      ],
      { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }
    );
    setPhotoUri(nueve5.uri);
    //console.log(nueve5.height+':'+nueve5.width+':'+(width < height ? width : (height / 9)*5)+':'+(height < width ? height : (width / 5)*9));

    // 2. Recortar SOLO la mitad derecha
    const rightHalf = await ImageManipulator.manipulateAsync(
      nueve5.uri,
      [
        {
          crop: {
            originX: width / 1.5,
            originY: 0,
            width: width / 1.5,
            height: height,
          },
        }
      ],
      { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }
    );
    //setPhotoUri(rightHalf.uri)
    // 3. Extraer color usando la imagen recortada
    const resultColors = await ImageColors.getColors(rightHalf.uri, {
      fallback: '#000000',
      cache: true,
      key: rightHalf.uri,
    });
    let averageColorHex = '#000000';
    if (resultColors.platform === 'android') {
      averageColorHex = resultColors.average;
    } else if (resultColors.platform === 'ios') {
      averageColorHex = resultColors.primary;
    } else {
      averageColorHex = resultColors.dominant;
    }
    // Definir el color del texto
    const newTextColor = checkContrast(averageColorHex);
    setTextColor(newTextColor);
    console.log("Color mitad derecha:", averageColorHex);
    console.log("Texto:", newTextColor);
  } catch (error) {
    console.log("Error analizando colores:", error);
    setTextColor('#000');
  }
  }
  // =====================================================================
  //  NUEVA LÓGICA DE ENVÍO EN 3 PASOS SECUENCIALES
  // =====================================================================

  // PASO 1: Subir la imagen física y obtener su URL pública
  const step1_uploadImage = async (localUri: string): Promise<string> => {
    console.log("--- INICIANDO PASO 1: SUBIR FOTO ---");
    // 1. Obtener la extensión del archivo original
    let filenameOriginal = localUri.split('/').pop();
    let filematch = /\.(\w+)$/.exec(filenameOriginal || '');
    let extension = filematch ? filematch[1] : 'jpg';
    let type = `image/${extension}`;

    // 2. Generar nombre personalizado: IMG_YYYYMMDD_HHMMSS.jpg
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Mes empieza en 0
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    // Ejemplo resultado: "IMG_20251207_143005.jpg"
    const finalName = `IMG_${year}${month}${day}_${hours}${minutes}${seconds}.${extension}`;
    let filename = localUri.split('/').pop();

    const formData = new FormData();
    formData.append('image', {
      uri: localUri,
      name: finalName || 'foto.jpg',
      type: type
    } as any);

    const response = await fetch(URL_SUBIR_IMAGEN, {
      method: 'POST',
      body: formData,
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    const json = await response.json();
    
    // Asumimos que el PHP devuelve: { "url": "https://bucket.../img.jpg" }
    if (!response.ok || !json.url) {
      throw new Error(json.error || 'Error al subir la imagen al servidor');
    }

    console.log("URL de imagen recibida:", json.url);
    return json.url || photoUri;
  };

  // PASO 2: Crear el registro en BD con la URL de la imagen
  const step2_createAdRecord = async (idhj : number,imageUrl: string | null, title: string, desc: string, costo : string): Promise<number> => {
    console.log("--- INICIANDO PASO 2: CREAR REGISTRO ---");
    const fechas = calcularFechasPlan(idhj);
const idUsuario = SesionUsuario.getId();
// Aquí usamos un objeto simple para facilitar la codificación
const data = {
    titulo: title,
    mensaje: desc,
    // Aseguramos que sea una cadena, con '1' como fallback
    usuario_id: idUsuario.toString() || '1', 
    fecha_inicio: fechas.fecha_inicio,
    fecha_fin: fechas.fecha_fin,

    // Enviamos la URL que obtuvimos en paso 1
    url_imagen: imageUrl || photoUri || '', 
    // Añadir cualquier otro dato que el endpoint PHP necesite
    costo: costo // Ejemplo
};

// 1. Convertir el objeto de datos a una cadena de consulta codificada (GET)
const params = new URLSearchParams(data).toString();

// 2. Construir la URL final con los parámetros
const finalUrl = `${URL_CREAR_ANUNCIO}?${params}`;
console.log('URL de Petición GET:', finalUrl);
//FormData para ser consistente con PHP $_POST simple)

    const formData = new FormData();

    formData.append('titulo', title);

    formData.append('mensaje', desc);

    formData.append('usuario_id', idUsuario.toString()||'1');

    formData.append('fecha_inicio', fechas.fecha_inicio);

    formData.append('fecha_fin', fechas.fecha_fin);
    formData.append('costo', costo);
    formData.append('url_imagen', imageUrl || photoUri||''); // Enviamos la URL que obtuvimos en paso 1
// 3. Realizar la petición GET (sin cuerpo)
const response = await fetch(finalUrl, {
    method: 'POST', // Cambiamos explícitamente a GET
    body: formData,
    // NO se necesita el 'body' ni los headers 'Content-Type' para GET
});

// A partir de aquí, tu script PHP debe usar filter_input(INPUT_GET, ...) para leer los datos.

    const json = await response.json();
    console.log(json);

    // Asumimos que el PHP devuelve: { "id_anuncio": 123 }
    if (!response.ok || !json.id_anuncio) {
      throw new Error(json.error || 'Error al guardar los datos del anuncio');
    } else {

    }

    console.log("ID Anuncio creado:", json.id_anuncio);
    return parseInt(json.id_anuncio);
  };

  /**
 * Función para calcular fechas de inicio y fin según el plan.
 * Retorna un objeto con las fechas formateadas en 'YYYY-MM-DD'.
 */
function calcularFechasPlan (planId: number) {
  const fechaInicio = new Date();
  const fechaFin = new Date(fechaInicio); // Clonamos la fecha actual para modificarla

  // Lógica de cálculo según el ID del plan
  switch (planId) {
    case 1: // Plan 1: 1 Semana
      fechaFin.setDate(fechaInicio.getDate() + 7);
      break;
    case 2: // Plan 2: 1 Mes
      fechaFin.setMonth(fechaInicio.getMonth() + 1);
      break;
    case 3: // Plan 3: 4 Meses
      fechaFin.setMonth(fechaInicio.getMonth() + 4);
      break;
    default:
      // Por defecto 7 días si el plan no coincide
      fechaFin.setDate(fechaInicio.getDate() + 7);
      break;
  }

  // Función interna para formatear a YYYY-MM-DD
  const formatSQL = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return {
    fecha_inicio: formatSQL(fechaInicio),
    fecha_fin: formatSQL(fechaFin),
  };
};
  // PASO 3: Obtener Link de PayPal usando el ID y el Precio
  const step3_getPaymentLink = async (adId: number, plan: Plan): Promise<string> => {
    console.log("--- INICIANDO PASO 3: OBTENER LINK PAGO ---");

    const payload = {
      id_anuncio: adId.toString(),
      precio: plan.price.toString(),
      plan_id: plan.id.toString()
  };
  const formData = new FormData();
    formData.append('id_anuncio', adId.toString());
    formData.append('precio',plan.price.toString());
  // 1. Convertir el objeto payload a una cadena de consulta codificada (GET)
  const params = new URLSearchParams(payload).toString();
  // 2. Construir la URL final
  const finalUrl = `${URL_PROCESAR_PAGO}?${params}`;
  console.log('URL de Pago (GET):', finalUrl);
    const response = await fetch(URL_PROCESAR_PAGO, {
      method: 'POST',
      body: formData,
    });
    const json = await response.json();
    // Asumimos que el PHP devuelve: { "paypal_link": "https://paypal.com/..." }
    if (!response.ok || !json.paypal_link) {
      throw new Error(json.error || 'No se pudo generar el link de pago');
    }
    console.log("Link de pago recibido:", json.paypal_link);
    return json.paypal_link;
  };
  // --- FUNCIÓN ORQUESTADORA (MASTER) ---
  const handleCreateAndPay = async (plan: Plan) => {
    // 1. Validaciones Locales
    if (!adTitle.trim() || !adDescription.trim()) {
      Alert.alert('Atención', 'Por favor llena el título y la descripción.');
      return;
    }
    setSubmitting(true);
    try {
      let finalImageUrl: string | null = null;
      // 1. Ejecutar Paso 1 (Solo si hay foto seleccionada)
      try {if (photoUri) {finalImageUrl = await step1_uploadImage(photoUri);}} catch (error) {}
      // 2. Ejecutar Paso 2 (Crear registro usando la URL de la imagen)
      const newAdId = await step2_createAdRecord(plan.id, finalImageUrl || photoUri, adTitle, adDescription, plan.price.toString());
      // 3. Ejecutar Paso 3 (Obtener link de pago con el ID del anuncio)
      try {
      const paymentLink = await step3_getPaymentLink(newAdId, plan);
      } catch (error) {
        
      }
      // 4. Abrir el navegador con el link
      Alert.alert(
        'Redirigiendo',
        'Se abrirá PayPal para completar tu pago.',
        [
          { 
            text: 'Ir a Pagar', 
            onPress: () => {
              router.replace('/paypal');
              //Linking.openURL(paymentLink).catch(err => console.error("No se pudo abrir link", err));
            }
          }
        ]
      );

    } catch (error: any) {
      console.error("Error en el flujo:", error);
      Alert.alert('Error', error.message || 'Ocurrió un error desconocido.');
    } finally {
      setSubmitting(false);
    }
  };

  // Carga de planes simulada
  useEffect(() => {
    const mockData: Plan[] = [
      {
        id: 1,
        title: 'Plan 1',
        subtitle: 'Por una semana',
        price: 30,
        currency: 'MXN',
        frequency: '',
        featureText: 'Date a conocer por una semana',
        isRecommended: false,
      },
      {
        id: 2,
        title: 'Plan 2',
        subtitle: 'Por un Mes',
        price: 120,
        currency: ' - 15% dto. ',
        frequency: 'MXN',
        featureText: 'Graba el anuncio en la mente de todos por un mes.',
        isRecommended: true,
      },
      {
        id: 3,
        title: 'Plan 3',
        subtitle: 'Por cuatro meses',
        price: 480,
        currency: ' - 47.91% dto. ',
        frequency: 'MXN',
        featureText: 'Se más radical y haz que todos vean tu anuncio por 4 meses.',
        isRecommended: false,
      },
    ];
    setPlans(mockData);
    setLoading(false);
  }, []);
console.log('user:    ',SesionUsuario.getId());
const idUsuario = SesionUsuario.getId();
SesionUsuario.setId(idUsuario); // Aseguramos que el ID esté seteado globalmente
  return (
    <ImageBackground source={BACKGROUND_IMAGE} style={styles.background} resizeMode="cover">
      <LinearGradient colors={['rgba(135, 206, 250, 0.6)', 'rgba(135, 206, 235, 0.4)']} style={StyleSheet.absoluteFill} />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image source={ICON} style={styles.logoIcon}/>
            <Text style={styles.logoText}>DigiCurva</Text>
          </View>
          <TouchableOpacity onPress={()=>{router.replace('/')}}>
          <Text style={styles.navLink}>Home</Text></TouchableOpacity>
        </View>

        <Text style={styles.pageTitle}>Crea un anuncio</Text>

        {/* Sección Superior */}
        <View style={styles.topSectionContainer}>
          <View style={styles.leftColumn}>
            <View style={styles.floatingTools}>
              <TouchableOpacity style={styles.toolButtonPrimary} onPress={() => pickImage(true)} disabled={submitting}>
                <Ionicons name="camera-outline" size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.toolButtonSecondary} onPress={() => pickImage(false)} disabled={submitting}>
                <MaterialIcons name="add-to-photos" size={24} color="white" />
              </TouchableOpacity>
            </View>

            <LinearGradient colors={['rgba(200, 200, 200, 1)', 'rgba(130, 142, 177, 1)']} style={styles.previewCard}>
              <View style={styles.previewHeader}>
                <Text style={[styles.previewTitle, {color:textColor}]}>{adTitle || 'Titulo'}</Text>
              </View>
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={{ width: '100%', height: '100%', borderRadius: 8, position: 'absolute' , top: 0, left: 0}} />
              ) : (
                <View style={styles.previewImagePlaceholder}>
                  <Ionicons name="camera-outline" size={40} color="#fff" />
                </View>
              )}
              <Text style={[styles.previewDesc, {color:textColor}]}>{adDescription}</Text>
            </LinearGradient>
          </View>

          <View style={styles.formCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Titulo:</Text>
              <TextInput style={styles.input} placeholder="Titulo" value={adTitle} onChangeText={setAdTitle} editable={!submitting} />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Descripción:</Text>
              <TextInput style={[styles.input, styles.textArea]} placeholder="Descripción..." value={adDescription} onChangeText={setAdDescription} multiline numberOfLines={4} editable={!submitting} />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>url:</Text>
              <TextInput style={[styles.input]} placeholder="Descripción..." value={photoUri} onChangeText={setPhotoUri} editable={!submitting} />
            </View>
          </View>
        </View>

        {/* Sección Planes */}
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
                    <Text style={styles.priceFrequency}>{plan.currency}{plan.frequency}</Text>
                  </View>
                  <View style={styles.featureRow}>
                    <Ionicons name="checkmark" size={18} color="#666" style={{ marginRight: 6 }} />
                    <Text style={styles.featureText}>{plan.featureText}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.planButton, plan.isRecommended ? styles.planButtonBlack : styles.planButtonWhite, submitting && { opacity: 0.6 }]}
                  onPress={() => handleCreateAndPay(plan)}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator color={plan.isRecommended ? '#fff' : '#000'} />
                  ) : (
                    <Text style={[styles.planButtonText, plan.isRecommended ? styles.textWhite : styles.textBlack]}>
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

// Estilos (Se mantienen igual que en tu código original)
const styles = StyleSheet.create({
  background: { flex: 1, width: '100%' },
  scrollContainer: { padding: 20, alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: 1200, marginBottom: 20 },
  logoContainer: { flexDirection: 'row', alignItems: 'center' },
  logoIcon: { width: 32, height: 32, backgroundColor: '#0056b3', borderRadius: 8, marginRight: 8, justifyContent: 'center', alignItems: 'center' },
  logoText: { fontSize: 24, fontWeight: '900', color: '#fff', textShadowColor: 'rgba(0, 0, 0, 0.3)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2, fontFamily: Platform.OS === 'ios' ? 'Arial Rounded MT Bold' : 'Roboto' },
  navLink: { fontSize: 16, fontWeight: '500', color: '#333' },
  pageTitle: { fontSize: 24, fontWeight: 'bold', color: '#000', alignSelf: 'flex-start', maxWidth: 1200, width: '100%', marginBottom: 20, marginLeft: Platform.OS === 'web' ? 'auto' : 0, marginRight: Platform.OS === 'web' ? 'auto' : 0 },
  topSectionContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 40, width: '100%', maxWidth: 1200, marginBottom: 40 },
  leftColumn: { flex: 1, minWidth: 300, position: 'relative' },
  floatingTools: { position: 'absolute', left: -20, top: 20, zIndex: 10, gap: 15 },
  toolButtonPrimary: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#4a90e2', justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOpacity: 0.2, shadowOffset: { width: 0, height: 2 } },
  toolButtonSecondary: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#888', justifyContent: 'center', alignItems: 'center', elevation: 5 },
  previewCard: { width: '100%', height: 250, borderRadius: 12, padding: 20, justifyContent: 'space-between', marginLeft: 30, borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)' },
  previewHeader: { alignItems: 'flex-end', zIndex: 5 },
  previewTitle: { fontSize: 22, fontFamily: 'serif', fontWeight: 'bold' },
  previewImagePlaceholder: { alignSelf: 'center', width: 80, height: 60, borderWidth: 2, borderColor: '#fff', borderRadius: 10, justifyContent: 'center', alignItems: 'center', opacity: 0.8 },
  previewDesc: { fontSize: 16, fontFamily: 'serif' },
  formCard: { flex: 1, minWidth: 300, backgroundColor: '#fff', borderRadius: 20, padding: 20, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, height: 300 },
  inputGroup: { marginBottom: 20, flexDirection: 'row', alignItems: 'flex-start' },
  label: { fontWeight: 'bold', width: 80, marginTop: 15, fontSize: 14, color: '#333' },
  input: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 15, fontSize: 14, color: '#000', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, borderWidth: 0.5, borderColor: '#eee' },
  textArea: { height: 120 },
  plansContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 20, width: '100%', maxWidth: 1200 },
  planCard: { backgroundColor: '#fff', borderRadius: 16, padding: 24, width: 300, minHeight: 320, justifyContent: 'space-between', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
  planContent: { marginBottom: 20 },
  planTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  planSubtitle: { fontSize: 14, color: '#666', marginBottom: 20 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 20 },
  currencySymbol: { fontSize: 24, fontWeight: 'bold', marginRight: 2 },
  priceAmount: { fontSize: 48, fontWeight: 'bold', color: '#000' },
  priceFrequency: { fontSize: 16, color: '#666', marginLeft: 5 },
  featureRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 10 },
  featureText: { fontSize: 14, color: '#333', lineHeight: 20, flex: 1 },
  planButton: { paddingVertical: 14, borderRadius: 10, alignItems: 'center', borderWidth: 1 },
  planButtonBlack: { backgroundColor: '#000', borderColor: '#000' },
  planButtonWhite: { backgroundColor: '#fff', borderColor: '#ddd' },
  planButtonText: { fontSize: 14, fontWeight: '600' },
  textWhite: { color: '#fff' },
  textBlack: { color: '#000' },
});