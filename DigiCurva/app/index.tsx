import React, { useState, useEffect, useRef } from 'react';
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
  StatusBar, 
  FlatList,
  ViewToken
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ImageBackground } from 'expo-image';
import { useRouter, useRootNavigationState} from 'expo-router';
import { SesionUsuario } from '@/utils/SesionUsuario';

// --- 1. DEFINICIÓN DE TIPOS (Adaptados para API y UI) ---

// Interfaz para lo que consume la UI
interface Product {
  id: string;
  title: string;
  //condition: 'Nuevo' | 'Usado';
  price: number;
  image: string;
}

interface Banner {
  id: string;
  imageUrl: string;
  title: string;
  subtitle: string;
}

interface UserProfile {
  nombre: string;
  avatar: string;
}

// --- 2. CONFIGURACIÓN Y CONSTANTES ---

const API_BASE_URL = 'https://ljusstudie.site/DigiCurvaServer';
const HEADER_BG_COLOR = '#E1F5FE'; 

const ICON = require('@/assets/images/icon.png');
const BACKGROUND_IMAGE = require('@/assets/images/fondoHome.jpg');
const DEFAULT_AVATAR = 'https://randomuser.me/api/portraits/lego/1.jpg'; 
// AGREGA ESTA LÍNEA:
const MOCK_PHONE_IMG = 'https://via.placeholder.com/300x300.png?text=Sin+Imagen';

export default function Index() {
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();

  // --- ESTADOS DE DATOS ---
  const [banners, setBanners] = useState<Banner[]>([]);
  const [productos, setProductos] = useState<Product[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  // Estado de carga inicial (para el delay de 3s y carga de datos)
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');

  // Responsive Dimensions
  const { width } = useWindowDimensions();
  const isDesktop = width > 1024;
  const numColumns = isDesktop ? 4 : (width > 600 ? 2 : 1);

  // --- 3. LÓGICA DE SESIÓN Y CARGA DE DATOS ---

  useEffect(() => {
    if (!rootNavigationState?.key) return;

    // Ejecutamos la carga de datos y la verificación en paralelo
    const initApp = async () => {
      
      // 1. Esperar los 3 segundos requeridos visualmente
      await new Promise(resolve => setTimeout(resolve, 3000));

      // 2. Verificar Sesión
      const idUsuario = SesionUsuario.getId();
      
      if (!idUsuario) {
        console.log("No hay usuario. Redirigiendo a Login...");
        router.replace('/login');
        return; 
      }

      console.log(`Usuario autenticado: ${idUsuario}. Cargando datos remotos...`);

      // 3. Cargar datos del Servidor (APIs)
      await fetchRemoteData(idUsuario);
      
      setLoading(false);
    };

    initApp();
  }, [rootNavigationState?.key]);


  // Función centralizada para pedir datos a tus APIs PHP
  const fetchRemoteData = async (userId: number) => {
    try {
      // A. OBTENER PERFIL
      // URL: https://ljusstudie.site/DigiCurvaServer/obtener_perfil.php?usuario_id=0
      const resPerfil = await fetch(`${API_BASE_URL}/obtener_perfil.php?usuario_id=${userId}`);
      if (resPerfil.ok) {
        const dataPerfil = await resPerfil.json();
        console.log(dataPerfil);
        console.log(fetch(`${API_BASE_URL}/obtener_perfil.php?usuario_id=${userId}`));
        
        // Asumiendo que la API devuelve { "nombre": "...", "foto_perfil": "..." }
        // Ajusta las claves según tu respuesta real PHP
        setUserProfile({
          nombre: dataPerfil.perfil.nombre || 'Usuario',
          avatar: dataPerfil.perfil.foto_perfil_url || DEFAULT_AVATAR
        });
      }

      // B. OBTENER PRODUCTOS
      // URL: https://ljusstudie.site/DigiCurvaServer/Listar_productos.php
      const resProd = await fetch(`${API_BASE_URL}/Listar_productos.php`);
      if (resProd.ok) {
        const dataProd = await resProd.json();
        console.log(dataProd);
        
        // Mapeamos los datos crudos de la BD a la interfaz de la UI
        const mappedProducts: Product[] = Array.isArray(dataProd.producto) ? dataProd.producto.map((item: any) => ({
          id: item.anuncio_id || item.id, // Ajusta según tu columna BD
          title: item.titulo || item.nombre,
          //condition: item.producto.status === 'nuevo' ? 'Nuevo' : 'Usado', // Normalizar texto
          price: parseFloat(item.costo) || 0,
          image: item.url_imagen || item.imagen || MOCK_PHONE_IMG // Fallback si viene null
        })) : [];
        setProductos(mappedProducts);
      }

      // C. OBTENER ANUNCIOS (BANNERS)
      // URL: https://ljusstudie.site/DigiCurvaServer/obtener_anuncios.php
      const resAnuncios = await fetch(`${API_BASE_URL}/obtener_anuncios.php`);
      if (resAnuncios.ok) {
        const dataAnuncios = await resAnuncios.json();
        console.log(dataAnuncios);
        
        const mappedBanners: Banner[] = Array.isArray(dataAnuncios.anuncios_activos) ? dataAnuncios.anuncios_activos.map((item: any) => ({
          id: item.anuncio_id || item.id,
          imageUrl: item.url_imagen || item.imagen,
          title: item.titulo || '',
          subtitle: item.mensaje || ''
        })) : [];
        setBanners(mappedBanners);
      }

    } catch (error) {
      console.error("Error conectando con DigiCurva Server:", error);
      // Opcional: Mostrar alerta si falla la red
    }
  };

// ... tus otros estados ...

  // --- LÓGICA DEL CARRUSEL ---
  const flatListRef = useRef<FlatList>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // 1. Auto-Play: Cambia de slide cada 3 segundos
  useEffect(() => {
    // Si no hay banners o solo hay 1, no hacemos auto-play
    if (banners.length <= 1) return;

    const intervalId = setInterval(() => {
      // Calculamos el siguiente índice
      let nextIndex = activeIndex + 1;
      
      // Si llegamos al final, volvemos al 0
      if (nextIndex >= banners.length) {
        nextIndex = 0;
      }

      // Hacemos el scroll suave
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });

      setActiveIndex(nextIndex);
    }, 4000); // 4000ms = 4 segundos

    return () => clearInterval(intervalId);
  }, [activeIndex, banners.length]);

  // 2. Detectar cambio manual (cuando el usuario desliza)
  const onViewRef = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      setActiveIndex(viewableItems[0].index);
    }
  });

  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });

  // 3. Manejo de error si scroll falla (común en carruseles cíclicos)
  const onScrollToIndexFailed = (info: { index: number; highestMeasuredFrameIndex: number; averageItemLength: number }) => {
    const wait = new Promise(resolve => setTimeout(resolve, 500));
    wait.then(() => {
      flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
    });
  };
  // --- 4. ACCIONES DE LA UI ---
  const handleSearch = () => {
    if (!searchText.trim()) return;
    Alert.alert("Búsqueda", `Buscando: ${searchText}`);
    // Aquí podrías llamar a otra API de búsqueda si la tienes
  };

  const handleAddToCart = (product: Product) => {
    Alert.alert("Carrito", `Agregado: ${product.title}`);
  };

  // --- RENDER ---

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={{marginTop: 10, color: '#666'}}>Cargando DigiCurva...</Text>
      </View>
    );
  }

  // Filtros simples en el cliente (puedes mejorarlo con APIs específicas)
  // Asumimos que la API "Listar_productos" devuelve todo mezclado.
  // Aquí separamos para llenar las secciones de la UI.
  const ofertasList = productos.slice(0, 4); // Tomamos los primeros 4 como ofertas
  const nuevosList = productos//productos.filter(p => p.condition === 'Nuevo').slice(0, 4);
  const recomendadosList = productos.slice(4, 8); // Tomamos otros 4

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={HEADER_BG_COLOR} />
      
      {/* --- HEADER --- */}
      <ImageBackground source={BACKGROUND_IMAGE}>
      <View style={styles.headerContainer}>
        <View style={[styles.headerTop, { maxWidth: 1200, alignSelf: 'center', width: '100%' }]}>
          <Image source={ICON} style={styles.logoImage} />
          <Text style={styles.logoText}>DigiCurva</Text>
          
          <View style={{ flex: 1 }} /> 

          <View style={styles.userInfo}>
            <Image 
              source={{ uri: userProfile?.avatar || DEFAULT_AVATAR }} 
              style={styles.avatar} 
            />
            {isDesktop && (
              <View>
                <Text style={styles.userName}>{userProfile?.nombre || 'Usuario'}</Text>
                <Text style={styles.userLink}>Ajustes</Text>
              </View>
            )}
          </View>
        </View>

        {/* Nav & Search */}
        <View style={styles.navBar}>
          <View style={[styles.navContent, { maxWidth: 1200, alignSelf: 'center', width: '100%' }]}>
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
          
          <TouchableOpacity 
            style={styles.createAdButton}
            onPress={()=>{router.replace('/Anuncio')}}
          >
            <Text style={styles.createAdText}>+ Crear anuncio</Text>
          </TouchableOpacity>

          {/* 1. HERO BANNER (Datos de obtener_anuncios.php) */}
          {/* 1. HERO BANNER (CARRUSEL) */}
          <View style={styles.bannerContainer}>
            {banners.length > 0 ? (
              <>
                <FlatList
                  ref={flatListRef}
                  data={banners}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item) => item.id}
                  onScrollToIndexFailed={onScrollToIndexFailed}
                  onViewableItemsChanged={onViewRef.current}
                  viewabilityConfig={viewConfigRef.current}
                  renderItem={({ item }) => (
                    <View style={[styles.heroCard, { width: width/1.3 - 40 }]}> 
                      {/* width - 40 porque el container tiene paddingHorizontal 20 (20+20=40) */}
                      <Image source={{ uri: item.imageUrl }} style={styles.heroImage} resizeMode="cover" />
                      <View style={styles.heroOverlay}>
                        <Text style={styles.heroTitle}>{item.title}</Text>
                        <Text style={styles.heroSubtitle}>{item.subtitle}</Text>
                      </View>
                    </View>
                  )}
                />
                
                {/* Indicadores (Puntitos) */}
                {/*<View style={styles.paginationContainer}>
                  {banners.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.dot,
                        { backgroundColor: index === activeIndex ? '#fff' : 'rgba(255,255,255,0.5)' }
                      ]}
                    />
                  ))}
                </View>*/}
              </>
            ) : (
              // Fallback cargando
              <View style={[styles.heroCard, { backgroundColor: '#ccc', justifyContent: 'center', alignItems: 'center', width: '100%' }]}>
                <ActivityIndicator color="#fff" />
                <Text style={{ color: 'white', fontWeight: 'bold', marginTop: 5 }}>Cargando...</Text>
              </View>
            )}
          </View>

          {/* 2. SECCIÓN: OFERTAS (Datos de Listar_productos.php) */}
          <SectionTitle title="Ofertas de Navidad" />
          <View style={styles.gridContainer}>
            {ofertasList.map((prod) => (
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
            {recomendadosList.map((prod) => (
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
            {nuevosList.map((prod) => (
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
            <View style={styles.footerBrand}>
              <Text style={styles.footerLogo}>DigiCurva</Text>
              <Text style={styles.footerTagline}>De la comunidad, para la comunidad.</Text>
              <View style={styles.socialIcons}>
                 <Ionicons name="logo-instagram" size={20} color="#666" />
                 <Ionicons name="logo-linkedin" size={20} color="#666" />
                 <Text style={{ fontSize: 18, color: '#666', fontWeight: 'bold' }}>X</Text>
              </View>
            </View>
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
      <Image 
        source={{ uri: product.image }} 
        style={styles.cardImage} 
        resizeMode="cover" 
        // Fallback imagen por si falla la URL
        defaultSource={require('@/assets/images/icon.png')} 
      />
      <TouchableOpacity style={styles.heartIcon}>
        <Ionicons name="heart-outline" size={20} color="#666" />
      </TouchableOpacity>
    </View>
    <View style={styles.cardContent}>
      <Text style={styles.cardTitle} numberOfLines={2}>{product.title}</Text>
      {//<Text style={styles.cardCondition}>{product.condition}</Text>
      }
      <Text style={styles.cardPrice}>${product.price.toLocaleString()}</Text>
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

// --- ESTILOS ---

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
    color: '#fff', 
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
    backgroundColor: '#ccc',
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
  scrollContent: {
    paddingBottom: 40,
  },
  createAdButton: {
    margin: 20,
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 8,
    alignSelf: 'flex-start'
  },
  createAdText: {
    color: 'white',
    fontWeight: 'bold'
  },
  bannerContainer: {
    width: '100%',
    height: 300,
    marginBottom: 30,
    marginTop: 0,
    position: 'relative',
    paddingHorizontal: 20, 
    justifyContent: 'center'
  },
  heroCard: {
    //width: '100%',
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#eee',
    marginRight: 0,
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 15,
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10, // Para que quede encima de la imagen
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
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
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 10,
    padding: 15,
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
    aspectRatio: 1, 
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
    height: 40, 
  },
  cardCondition: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  cardPrice: {
    fontSize: 22, 
    fontWeight: '300', 
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
  footer: {
    marginTop: 40,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: '#fff', 
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