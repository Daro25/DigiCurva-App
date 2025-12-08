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
  SafeAreaView,
  StatusBar
} from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { ImageBackground } from 'expo-image';
import { useRouter, useRootNavigationState} from 'expo-router';
import { SesionUsuario } from '@/utils/SesionUsuario';

// --- 1. DEFINICIÓN DE TIPOS (TypeScript) ---

interface Product {
  id: string;
  title: string;
  condition: 'Nuevo' | 'Usado';
  price: number;
  image: string;
}

interface Banner {
  id: string;
  imageUrl: string;
  title: string;
  subtitle: string;
}

// --- 2. CONFIGURACIÓN Y CONSTANTES ---

const API_BASE = 'https://api.digicurva.com';
const HEADER_BG_COLOR = '#E1F5FE'; // Azul claro fiel al diseño

// Imágenes Mock (Simulando respuesta de API)
const MOCK_BANNER_IMG = 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?q=80&w=1200&auto=format&fit=crop';
const MOCK_PHONE_IMG = 'https://images.samsung.com/is/image/samsung/p6pim/mx/sm-a546elgbmxo/gallery/mx-galaxy-a54-5g-sm-a546-sm-a546elgbmxo-536069774?$650_519_PNG$';
const ICON = require('@/assets/images/icon.png');
const BACKGROUND_IMAGE = require('@/assets/images/fondoHome.jpg');

export default function Index() {
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();

  // Esta función se ejecuta AUTOMÁTICAMENTE al cargar el componente
  useEffect(() => {
    // 1. Si la navegación no está lista, no iniciamos el temporizador aún
    if (!rootNavigationState?.key) return;
    // 2. Iniciamos el temporizador de 3 segundos (3000 ms)
    const timer = setTimeout(() => {
      verificarSesion();
    }, 3000);
    // 3. Limpieza: Cancelar el timer si el componente se desmonta antes de los 3 seg
    return () => clearTimeout(timer);
  }, [rootNavigationState?.key]);

  const verificarSesion = () => {
    // 4. BLOQUEO DE SEGURIDAD:
    // Si la navegación no está lista (no tiene key), no hacemos nada todavía.
    if (!rootNavigationState?.key) return; 

    console.log("--- Iniciando App: Verificando Sesión ---");
    
    const idUsuario = SesionUsuario.getId();

    if (!idUsuario) {
      console.log("No hay usuario. Redirigiendo a Login...");
      router.replace('/login'); 
    } else {
      console.log(`Usuario autenticado: ${idUsuario}. Cargando contenido...`);
    }
  };
  // --- ESTADOS DE DATOS ---
  const [banners, setBanners] = useState<Banner[]>([]);
  const [ofertas, setOfertas] = useState<Product[]>([]);
  const [productos, setProductos] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');

  // Responsive Dimensions
  const { width } = useWindowDimensions();
  const isDesktop = width > 1024;
  const numColumns = isDesktop ? 4 : (width > 600 ? 2 : 1);

  // --- 3. SIMULACIÓN DE CARGA DE DATOS (3 APIs) ---
  useEffect(() => {
    const loadData = async () => {
      try {
        // Simulamos latencia de red
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 1. API Anuncios
        const mockBanners: Banner[] = [{
          id: 'b1',
          imageUrl: MOCK_BANNER_IMG,
          title: 'Que no te ganen las fiestas',
          subtitle: 'Ofertas de Navidad'
        }];

        // 2. API Ofertas (Navidad)
        const mockOfertas: Product[] = Array(4).fill(null).map((_, i) => ({
          id: `offer_${i}`,
          title: 'Samsung Galaxy A36 5G',
          condition: 'Usado',
          price: 4500,
          image: MOCK_PHONE_IMG
        }));

        // 3. API Productos (Nuevos/Recomendados)
        const mockProductos: Product[] = Array(8).fill(null).map((_, i) => ({
          id: `prod_${i}`,
          title: 'Samsung Galaxy A36 5G',
          condition: i % 2 === 0 ? 'Nuevo' : 'Usado',
          price: 4500,
          image: MOCK_PHONE_IMG
        }));

        setBanners(mockBanners);
        setOfertas(mockOfertas);
        setProductos(mockProductos);
      } catch (error) {
        console.error("Error cargando APIs", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // --- 4. LÓGICA CRÍTICA: POST CON QUERY PARAMS ---
  const executeApiAction = async (endpoint: string, params: Record<string, string>) => {
    try {
      // Convertimos objeto a Query String
      const queryString = new URLSearchParams(params).toString();
      const finalUrl = `${API_BASE}/${endpoint}?${queryString}`;

      console.log(`[POST Request] Enviando a: ${finalUrl} (Body vacío)`);

      // Simulación de Fetch
      // await fetch(finalUrl, { method: 'POST' });

      if (Platform.OS === 'web') {
        alert(`Petición POST enviada a:\n${finalUrl}`);
      } else {
        Alert.alert("API Request", `POST: ${finalUrl}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSearch = () => {
    if (!searchText.trim()) return;
    executeApiAction('search', { q: searchText, source: 'header' });
  };

  const handleAddToCart = (product: Product) => {
    executeApiAction('cart/add', { 
      product_id: product.id, 
      sku: 'SKU-GENERIC', 
      qty: '1' 
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={HEADER_BG_COLOR} />
      
      {/* --- HEADER --- */}
      <ImageBackground source={BACKGROUND_IMAGE}>
      <View style={styles.headerContainer}>
        {/* Top Row: Logo & User Info */}
        <View style={[styles.headerTop, { maxWidth: 1200, alignSelf: 'center', width: '100%' }]}>
          <Image 
            source={ICON} // Placeholder logo
            style={styles.logoImage} // Usar una imagen local o texto estilizado
          />
          <Text style={styles.logoText}>DigiCurva</Text>
          
          <View style={{ flex: 1 }} /> {/* Spacer */}

          <View style={styles.userInfo}>
            <Image source={{ uri: 'https://randomuser.me/api/portraits/women/44.jpg' }} style={styles.avatar} />
            {isDesktop && (
              <View>
                <Text style={styles.userName}>Naomi Ruiz</Text>
                <Text style={styles.userLink}>Ajustes</Text>
              </View>
            )}
          </View>
        </View>

        {/* Bottom Row: Nav & Search */}
        <View style={styles.navBar}>
          <View style={[styles.navContent, { maxWidth: 1200, alignSelf: 'center', width: '100%' }]}>
            {/* Desktop Nav Links */}
            {isDesktop ? (
              <View style={styles.navLinks}>
                <TouchableOpacity><Ionicons name="home-outline" size={20} color="#fff" /></TouchableOpacity>
                <Text style={styles.navLinkText}>Ofertas</Text>
                <Text style={styles.navLinkText}>Nuevo</Text>
                <Text style={styles.navLinkText}>Mas vendido</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.navLinkText}>Categorías</Text>
                  <Ionicons name="caret-down" size={12} color="#fff" style={{ marginLeft: 4 }} />
                </View>
              </View>
            ) : (
              <TouchableOpacity><Ionicons name="menu" size={28} color="#fff" /></TouchableOpacity>
            )}

            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <TextInput 
                style={styles.searchInput}
                placeholder="Buscar"
                value={searchText}
                onChangeText={setSearchText}
                onSubmitEditing={handleSearch}
              />
              <TouchableOpacity onPress={handleSearch}>
                <Ionicons name="search" size={20} color="#000" style={{ marginRight: 10 }} />
              </TouchableOpacity>
            </View>

            {/* Icons */}
            <View style={styles.headerIcons}>
              <TouchableOpacity><Ionicons name="heart-outline" size={24} color="#fff" /></TouchableOpacity>
              <TouchableOpacity><Ionicons name="cart-outline" size={24} color="#fff" /></TouchableOpacity>
            </View>
          </View>
        </View>
      </View></ImageBackground>

      {/* --- BODY CONTENT --- */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={{ maxWidth: 1200, width: '100%', alignSelf: 'center' }}>
          
          {/* 1. HERO BANNER (Carrusel Horizontal) */}
          <View style={styles.bannerContainer}>
            {banners.map(banner => (
              <View key={banner.id} style={styles.heroCard}>
                <Image source={{ uri: banner.imageUrl }} style={styles.heroImage} resizeMode="cover" />
                <View style={styles.heroOverlay}>
                  <Text style={styles.heroTitle}>{banner.title}</Text>
                  <Text style={styles.heroSubtitle}>{banner.subtitle}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* 2. SECCIÓN: OFERTAS DE NAVIDAD (Grid/Carrusel) */}
          <SectionTitle title="Ofertas de Navidad" />
          <View style={styles.gridContainer}>
            {ofertas.map((prod) => (
              <ProductCard 
                key={prod.id} 
                product={prod} 
                width={(Math.min(width, 1200) / numColumns) - 20} 
                onAdd={() => handleAddToCart(prod)}
              />
            ))}
          </View>

          {/* 3. SECCIÓN: RECOMENDADOS */}
          <SectionTitle title="Recomendados para ti" />
          <View style={styles.gridContainer}>
            {productos.slice(0, 4).map((prod) => (
              <ProductCard 
                key={prod.id} 
                product={prod} 
                width={(Math.min(width, 1200) / numColumns) - 20}
                onAdd={() => handleAddToCart(prod)}
              />
            ))}
          </View>

          {/* 4. SECCIÓN: PRODUCTOS NUEVOS */}
          <SectionTitle title="Productos nuevos" />
          <View style={styles.gridContainer}>
            {productos.map((prod) => (
              <ProductCard 
                key={prod.id} 
                product={prod} 
                width={(Math.min(width, 1200) / numColumns) - 20}
                onAdd={() => handleAddToCart(prod)}
              />
            ))}
          </View>

        </View>

        {/* --- FOOTER --- */}
        <View style={styles.footer}>
          <View style={[styles.footerContent, { flexDirection: isDesktop ? 'row' : 'column' }]}>
            
            {/* Brand */}
            <View style={styles.footerBrand}>
              <Text style={styles.footerLogo}>DigiCurva</Text>
              <Text style={styles.footerTagline}>De la comunidad, para la comunidad.</Text>
              <View style={styles.socialIcons}>
                 <Ionicons name="logo-instagram" size={20} color="#666" />
                 <Ionicons name="logo-linkedin" size={20} color="#666" />
                 <Text style={{ fontSize: 18, color: '#666', fontWeight: 'bold' }}>X</Text>
              </View>
            </View>

            {/* Links Columns */}
            <View style={styles.footerLinksContainer}>
              <FooterColumn title="Funciones" links={['Envío a domicilio', 'Vender', 'Pagos']} />
              <FooterColumn title="Información" links={['Acerca de nosotros', 'Preguntas frecuentes']} />
              <FooterColumn title="Soporte" links={['Contacto', 'Paquetería', 'Legal']} />
            </View>

          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// --- SUB-COMPONENTES REUTILIZABLES ---

const SectionTitle = ({ title }: { title: string }) => (
  <Text style={styles.sectionTitle}>{title}</Text>
);

const ProductCard = ({ product, width, onAdd }: { product: Product, width: number, onAdd: () => void }) => (
  <View style={[styles.card, { width: width }]}>
    <View style={styles.cardImageContainer}>
      <Image source={{ uri: product.image }} style={styles.cardImage} resizeMode="contain" />
      <TouchableOpacity style={styles.heartIcon}>
        <Ionicons name="heart-outline" size={20} color="#666" />
      </TouchableOpacity>
    </View>
    <View style={styles.cardContent}>
      <Text style={styles.cardTitle}>{product.title}</Text>
      <Text style={styles.cardCondition}>{product.condition}</Text>
      <Text style={styles.cardPrice}>${product.price.toLocaleString()}</Text>
      {/* Botón invisible para cubrir toda la card o explícito */}
      <TouchableOpacity style={styles.addButton} onPress={onAdd}>
        <Text style={styles.addButtonText}>Ver detalles</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const FooterColumn = ({ title, links }: { title: string, links: string[] }) => (
  <View style={styles.footerCol}>
    <Text style={styles.footerColTitle}>{title}</Text>
    {links.map((link, i) => (
      <Text key={i} style={styles.footerLink}>{link}</Text>
    ))}
  </View>
);

// --- ESTILOS (StyleSheet) ---

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Header
  headerContainer: {
    backgroundColor: 'rgba(56, 189, 248, 0.4)',
    width: '100%',
    paddingBottom: 10,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  logoImage: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff', // En la imagen parece blanco con borde o sombra, o gris muy claro
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    fontFamily: Platform.OS === 'web' ? 'Arial Black' : 'System',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 2,
    borderColor: '#fff',
  },
  userName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  userLink: {
    fontSize: 10,
    color: '#fff',
  },
  // Nav Bar
  navBar: {
    width: '100%',
  },
  navContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  navLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  navLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 4,
    alignItems: 'center',
    paddingHorizontal: 10,
    height: 36,
    marginHorizontal: 20,
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    outlineStyle: 'none' as any,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 15,
  },
  // Content
  scrollContent: {
    paddingBottom: 40,
  },
  // Banner
  bannerContainer: {
    width: '100%',
    height: 300,
    marginBottom: 30,
    marginTop: 20,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    paddingHorizontal: 20, // Margen lateral para que no toque bordes en desktop
  },
  heroCard: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    top: 40,
    right: 40,
    alignItems: 'flex-end',
  },
  heroTitle: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'right',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  heroSubtitle: {
    fontSize: 24,
    color: '#eee',
    textAlign: 'right',
    marginTop: 10,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  // Sections
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginLeft: 20,
    marginBottom: 15,
    marginTop: 10,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
    justifyContent: 'flex-start',
    marginBottom: 30,
  },
  // Cards
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 10,
    padding: 15,
    // Sombra (Elevation / Shadow)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  cardImageContainer: {
    width: '100%',
    aspectRatio: 1, // Cuadrado
    marginBottom: 10,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  heartIcon: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  cardContent: {
    alignItems: 'flex-start',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
    marginBottom: 2,
  },
  cardCondition: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  cardPrice: {
    fontSize: 22, // Grande como en la imagen
    fontWeight: '300', // Light
    color: '#333',
  },
  addButton: {
    marginTop: 10,
    backgroundColor: 'transparent',
  },
  addButtonText: {
    color: '#2196F3',
    fontSize: 12,
  },
  // Footer
  footer: {
    marginTop: 40,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: '#fff', // Opcional, puede ser gris muy claro
  },
  footerContent: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    justifyContent: 'space-between',
  },
  footerBrand: {
    marginBottom: 30,
    maxWidth: 300,
  },
  footerLogo: {
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 10,
  },
  footerTagline: {
    fontSize: 12,
    color: '#666',
    marginBottom: 15,
  },
  socialIcons: {
    flexDirection: 'row',
    gap: 15,
    alignItems: 'center',
  },
  footerLinksContainer: {
    flexDirection: 'row',
    gap: 40,
    flexWrap: 'wrap',
  },
  footerCol: {
    marginBottom: 20,
    minWidth: 120,
  },
  footerColTitle: {
    fontWeight: 'bold',
    marginBottom: 15,
    fontSize: 14,
  },
  footerLink: {
    fontSize: 12,
    color: '#555',
    marginBottom: 8,
  },
});