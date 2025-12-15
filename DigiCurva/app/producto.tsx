import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  ScrollView, 
  useWindowDimensions, 
  Platform, 
  ActivityIndicator,
  Alert,
  StatusBar,
  SafeAreaView
} from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons'; 

// --- 1. DEFINICIÓN DE TIPOS (TypeScript Senior) ---

// Estructura de las reseñas para las barras de progreso
interface ReviewBreakdown {
  stars: number;
  count: number;
}

// Estructura completa del producto que viene de la API
interface Product {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  currency: string;
  description: string;
  mainImage: string;
  thumbnails: string[];
  reviews: {
    total: number;
    average: number;
    breakdown: ReviewBreakdown[];
  };
}

// --- 2. DATOS MOCK (Simulando respuesta GET de la API) ---
const MOCK_API_RESPONSE: Product = {
  id: 'prod_galaxy_a36_5g',
  name: 'Samsung Galaxy A36 5G',
  subtitle: 'Nuevo',
  price: 4500,
  currency: 'MXN',
  description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla et lorem vestibulum, ultricies lacus a, euismod risus. Quisque lacinia augue arcu, sed ullamcorper nisl ultricies sed. Praesent mattis, lorem ac convallis interdum, augue eros dapibus ante, vitae efficitur diam libero vel leo. Maecenas luctus, dolor sit amet suscipit efficitur.',
  // Usamos imágenes reales de Samsung para la demo visual
  mainImage: 'https://images.samsung.com/is/image/samsung/p6pim/mx/sm-a546elgbmxo/gallery/mx-galaxy-a54-5g-sm-a546-sm-a546elgbmxo-536069774?$650_519_PNG$',
  thumbnails: [
    'https://images.samsung.com/is/image/samsung/p6pim/mx/sm-a546elgbmxo/gallery/mx-galaxy-a54-5g-sm-a546-sm-a546elgbmxo-536069774?$650_519_PNG$',
    'https://images.samsung.com/is/image/samsung/p6pim/mx/sm-a546elgbmxo/gallery/mx-galaxy-a54-5g-sm-a546-sm-a546elgbmxo-536069775?$650_519_PNG$',
    'https://images.samsung.com/is/image/samsung/p6pim/mx/sm-a546elgbmxo/gallery/mx-galaxy-a54-5g-sm-a546-sm-a546elgbmxo-536069776?$650_519_PNG$',
    'https://images.samsung.com/is/image/samsung/p6pim/mx/sm-a546elgbmxo/gallery/mx-galaxy-a54-5g-sm-a546-sm-a546elgbmxo-536069784?$650_519_PNG$'
  ],
  reviews: {
    total: 82,
    average: 4.5,
    breakdown: [
      { stars: 5, count: 37 },
      { stars: 4, count: 25 },
      { stars: 3, count: 3 },
      { stars: 2, count: 4 },
      { stars: 1, count: 13 },
    ]
  }
};

export default function Producto() {
  // --- STATES ---
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string>(''); // URL de la imagen grande actual
  const [isProcessing, setIsProcessing] = useState(false);

  // Responsive: Detectar escritorio vs móvil
  const { width } = useWindowDimensions();
  const isDesktop = width > 950;

  // --- EFECTO DE CARGA (GET Inicial) ---
  useEffect(() => {
    // Simulamos que la API tarda 500ms en responder
    const fetchProduct = async () => {
      try {
        // En producción: const res = await fetch('https://api.com/products/123');
        // const data = await res.json();
        
        // Mock:
        setTimeout(() => {
          setProduct(MOCK_API_RESPONSE);
          setActiveImage(MOCK_API_RESPONSE.mainImage);
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error("Error fetching product", error);
        setLoading(false);
      }
    };

    fetchProduct();
  }, []);

  // --- LÓGICA DE NEGOCIO CRÍTICA (POST vía URL) ---
  const handleTransaction = async (actionType: 'buy_now' | 'add_cart') => {
    if (!product) return;
    setIsProcessing(true);

    try {
      const baseUrl = 'https://tu-api.com/endpoint';
      
      // REQUISITO CRÍTICO: Construir Query Params para un método POST
      // La API no lee el body, lee la URL.
      const params = new URLSearchParams({
        action: actionType,
        product_id: product.id,
        sku: 'SKU-12345',
        qty: '1',
        unit_price: product.price.toString(),
        image_ref: activeImage // Enviamos qué variante de imagen eligió
      });

      const finalUrl = `${baseUrl}?${params.toString()}`;
      
      console.log(`[API POST] Enviando a: ${finalUrl}`);

      // Simulación de la petición de red
      // const response = await fetch(finalUrl, { 
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' } 
      //   // BODY VACÍO intencionalmente
      // });

      // Feedback Visual
      const message = `Petición POST ejecutada.\n\nDatos en URL:\n${params.toString()}`;
      
      if (Platform.OS === 'web') {
        alert(message);
      } else {
        Alert.alert("Éxito", message);
      }

    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo conectar con el servidor");
    } finally {
      setIsProcessing(false);
    }
  };

  // Renderizado de carga
  if (loading || !product) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      
      {/* 1. HEADER (Navbar) */}
      <View style={styles.header}>
        <View style={[styles.headerContent, { maxWidth: 1200 }]}>
          {/* Logo DigiCurva */}
          <View>
            <Text style={styles.logoText}>DigiCurva</Text>
          </View>

          {/* Search Bar (Solo visible si hay espacio suficiente) */}
          {isDesktop && (
            <View style={styles.searchContainer}>
              <TextInput 
                placeholder="Buscar" 
                style={styles.searchInput} 
                placeholderTextColor="#9ca3af"
                testID="search_input"
              />
              <Ionicons name="search" size={20} color="#6b7280" style={{marginRight: 10}} />
            </View>
          )}

          {/* User Actions */}
          <View style={styles.headerActions}>
            <View style={styles.userProfile}>
              <Image source={{uri: 'https://randomuser.me/api/portraits/women/44.jpg'}} style={styles.avatar} />
              {isDesktop && (
                <View>
                  <Text style={styles.userName}>Naomi Ruiz</Text>
                  <Text style={styles.userSettingsLink}>Ajustes</Text>
                </View>
              )}
            </View>
            <Ionicons name="heart-outline" size={24} color="#333" style={{marginLeft: 20}} />
            <Ionicons name="cart-outline" size={24} color="#333" style={{marginLeft: 15}} />
          </View>
        </View>
      </View>

      {/* 2. SUB-NAVIGATION */}
      <View style={styles.subNavbar}>
        <View style={[styles.subNavbarContent, { maxWidth: 1200 }]}>
          <Ionicons name="home-outline" size={18} color="#4b5563" />
          <Text style={styles.navLink}>Ofertas</Text>
          <Text style={styles.navLink}>Nuevo</Text>
          <Text style={styles.navLink}>Mas vendido</Text>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
             <Text style={styles.navLink}>Categorías</Text>
             <Ionicons name="caret-down" size={12} color="#4b5563" style={{marginLeft: 4}} />
          </View>
        </View>
      </View>

      {/* 3. MAIN CONTENT (PDP) */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.mainGrid, { flexDirection: isDesktop ? 'row' : 'column', maxWidth: 1200 }]}>
          
          {/* --- COLUMNA IZQUIERDA: Info Producto --- */}
          <View style={[styles.leftCol, { width: isDesktop ? '50%' : '100%', paddingRight: isDesktop ? 40 : 0 }]}>
            
            {/* Títulos */}
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productSubtitle}>{product.subtitle}</Text>
            
            {/* Precio */}
            <View style={styles.priceRow}>
              <Text style={styles.price}>${product.price.toLocaleString()}</Text>
              <TouchableOpacity style={styles.heartButton}>
                <Ionicons name="heart-outline" size={30} color="#000" />
              </TouchableOpacity>
            </View>
            <Text style={styles.freeShipping}>Envío gratis</Text>

            {/* Descripción */}
            <Text style={styles.sectionTitle}>Descripción</Text>
            <View style={styles.descriptionBox}>
              <Text style={styles.descriptionText}>{product.description}</Text>
            </View>

            {/* Reseñas (Stars & Bars) */}
            <Text style={styles.sectionTitle}>Reseñas</Text>
            <View style={styles.reviewsContainer}>
              {/* Estrellas totales */}
              <View style={styles.totalStarsRow}>
                {[1,2,3,4,5].map((_, i) => (
                   <FontAwesome key={i} name="star" size={20} color="#FCD34D" style={{marginRight: 2}} />
                ))}
              </View>

              {/* Barras de progreso */}
              {product.reviews.breakdown.map((item, index) => (
                <View key={index} style={styles.reviewBarRow}>
                  <View style={styles.starsLabel}>
                    {[...Array(item.stars)].map((_, i) => (
                      <FontAwesome key={i} name="star" size={14} color="#FCD34D" style={{marginRight: 1}} />
                    ))}
                  </View>
                  
                  {/* Barra Fondo */}
                  <View style={styles.progressBarBackground}>
                    {/* Barra Relleno (Cálculo simple de ancho) */}
                    <View style={[styles.progressBarFill, { width: `${(item.count / 50) * 100}%` }]} />
                  </View>
                  
                  <Text style={styles.reviewCountText}>{item.count}</Text>
                </View>
              ))}
            </View>

          </View>

          {/* --- COLUMNA DERECHA: Galería y Acciones --- */}
          <View style={[styles.rightCol, { width: isDesktop ? '50%' : '100%', marginTop: isDesktop ? 0 : 30 }]}>
            
            <View style={styles.galleryCard}>
              {/* Imagen Principal */}
              <View style={styles.mainImageWrapper}>
                <Image 
                  source={{ uri: activeImage }} 
                  style={styles.mainImage} 
                  resizeMode="contain" 
                />
                <Text style={styles.verticalText}>Galaxy A36 5G</Text>
              </View>

              {/* Miniaturas */}
              <View style={styles.thumbnailRow}>
                {product.thumbnails.map((thumb, index) => (
                  <TouchableOpacity 
                    key={index} 
                    onPress={() => setActiveImage(thumb)}
                    style={[
                      styles.thumbContainer, 
                      activeImage === thumb && styles.thumbActive
                    ]}
                  >
                    <Image source={{ uri: thumb }} style={styles.thumbImage} resizeMode="contain" />
                  </TouchableOpacity>
                ))}
              </View>

              {/* Botones de Acción */}
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={styles.btnPrimary}
                  onPress={() => handleTransaction('buy_now')}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.btnTextPrimary}>Comprar ahora</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.btnSecondary}
                  onPress={() => handleTransaction('add_cart')}
                >
                  <Text style={styles.btnTextSecondary}>Añadir al carro</Text>
                </TouchableOpacity>
              </View>

            </View>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- ESTILOS (Style.ts) ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // HEADER
  header: {
    backgroundColor: '#bae6fd', // Azul claro (sky-200) similar a la imagen
    width: '100%',
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#7dd3fc',
  },
  headerContent: {
    flexDirection: 'row',
    width: '94%',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    fontFamily: Platform.OS === 'web' ? 'Arial Black, sans-serif' : 'System',
  },
  searchContainer: {
    flex: 1,
    maxWidth: 500,
    backgroundColor: '#fff',
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 15,
    fontSize: 14,
    color: '#333',
    // outlineStyle: 'none' as any, // Fix para web
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
  },
  userName: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  userSettingsLink: {
    fontSize: 12,
    color: '#f0f9ff',
  },
  // SUBNAV
  subNavbar: {
    backgroundColor: '#f1f5f9', // Gris muy claro
    paddingVertical: 10,
    alignItems: 'center',
  },
  subNavbarContent: {
    flexDirection: 'row',
    width: '94%',
    gap: 25,
    alignItems: 'center',
  },
  navLink: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1f2937',
  },
  // MAIN LAYOUT
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  mainGrid: {
    width: '100%',
  },
  leftCol: {
    flexDirection: 'column',
  },
  rightCol: {
    flexDirection: 'column',
  },
  // TEXT STYLES
  productName: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  productSubtitle: {
    fontSize: 20,
    color: '#333',
    marginBottom: 15,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  price: {
    fontSize: 48, // Grande como en la imagen
    fontWeight: '300', // Light font weight
    color: '#333',
  },
  heartButton: {
    padding: 10,
  },
  freeShipping: {
    fontSize: 22,
    color: '#333',
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 15,
    marginTop: 10,
  },
  descriptionBox: {
    borderWidth: 1,
    borderColor: '#9ca3af',
    borderRadius: 8,
    padding: 20,
    marginBottom: 30,
  },
  descriptionText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    textAlign: 'justify',
  },
  // REVIEWS
  reviewsContainer: {
    width: '100%',
  },
  totalStarsRow: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  reviewBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  starsLabel: {
    flexDirection: 'row',
    width: 80,
    justifyContent: 'flex-end',
    marginRight: 10,
  },
  progressBarBackground: {
    flex: 1,
    height: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#000', // Borde negro como en la imagen
    borderRadius: 6,
    overflow: 'hidden',
    marginRight: 10,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#000', // Relleno negro
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
  },
  reviewCountText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
    width: 30,
    textAlign: 'right',
  },
  // GALLERY CARD
  galleryCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  mainImageWrapper: {
    width: '100%',
    height: 400,
    marginBottom: 20,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainImage: {
    width: '90%',
    height: '100%',
  },
  verticalText: {
    position: 'absolute',
    right: 10,
    bottom: 100,
    fontSize: 40,
    fontWeight: 'bold',
    color: 'rgba(100,100,255,0.2)', // Texto "Galaxy A36 5G" decorativo
    transform: [{ rotate: '-90deg' }],
    width: 300,
    textAlign: 'center',
  },
  thumbnailRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
    marginBottom: 30,
  },
  thumbContainer: {
    width: 60,
    height: 80,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbActive: {
    borderColor: '#2563eb',
    borderWidth: 2,
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  // BUTTONS
  actionButtons: {
    gap: 15,
  },
  btnPrimary: {
    backgroundColor: '#1d4ed8', // Azul fuerte
    paddingVertical: 15,
    borderRadius: 6,
    alignItems: 'center',
    shadowColor: "#1d4ed8",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  btnTextPrimary: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  btnSecondary: {
    backgroundColor: '#d1d5db', // Gris
    paddingVertical: 15,
    borderRadius: 6,
    alignItems: 'center',
  },
  btnTextSecondary: {
    color: '#000',
    fontSize: 18,
    fontWeight: '500',
  }
});