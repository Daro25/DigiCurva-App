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
  ImageBackground,
  StatusBar
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'; 

// --- 1. DEFINICIÓN DE TIPOS ---

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  sku: string;
}

interface CartItem extends Product {
  quantity: number;
}

type PaymentMethod = 'card' | 'cash';

// --- 2. DATOS MOCK (Simulando respuesta de API) ---
const MOCK_CART_ITEMS: CartItem[] = [
  {
    id: 'prod_galaxy_a36_5g',
    name: 'Samsung Galaxy A36 5G',
    price: 4500.00,
    quantity: 1,
    sku: 'SAM-A36-5G-WHT',
    // URL de la API del producto (simulada)
    image: 'https://images.samsung.com/is/image/samsung/p6pim/mx/sm-a356elgbltm/gallery/mx-galaxy-a35-5g-sm-a356-sm-a356elgbltm-540859530?$650_519_PNG$'
  }
];

// Imagen de fondo del header (Local o remota, usaremos remota para el ejemplo portable)
const HEADER_BG = { uri: 'https://images.unsplash.com/photo-1568218151240-6d4277b21e86?q=80&w=1920&auto=format&fit=crop' };

export default function Carrito() {
  // --- ESTADOS ---
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card'); // 'card' por defecto como en la imagen
  const [isProcessing, setIsProcessing] = useState(false);

  const { width, height } = useWindowDimensions();
  const isDesktop = width > 900;

  // --- EFECTOS ---
  useEffect(() => {
    // Simular carga de datos del carrito desde API
    setTimeout(() => {
      setCartItems(MOCK_CART_ITEMS);
      setLoading(false);
    }, 600);
  }, []);

  // Calcular total
  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // --- LÓGICA DE API CRÍTICA ---
  const processPayment = async () => {
    setIsProcessing(true);

    try {
      const baseUrl = 'https://tu-api.com/checkout';
      
      // Construir lista de IDs para la URL
      const itemIds = cartItems.map(i => i.id).join(',');

      // REQUISITO: Datos en URL params (Query String) para un POST
      const params = new URLSearchParams({
        amount: total.toString(),
        currency: 'MXN',
        payment_method: paymentMethod, // 'card' o 'cash'
        items: itemIds,
        user_id: 'usr_naomi_123'
      });

      const finalUrl = `${baseUrl}?${params.toString()}`;
      
      console.log(`[POST Request] Enviando a: ${finalUrl}`);

      // Simulación de fetch
      // await fetch(finalUrl, { method: 'POST' }); 

      // Feedback visual
      const alertMsg = `Orden Procesada.\n\nMétodo: ${paymentMethod.toUpperCase()}\nTotal: $${total}\nURL: ${finalUrl}`;
      
      if (Platform.OS === 'web') {
        alert(alertMsg);
      } else {
        Alert.alert("Éxito", alertMsg);
      }

    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* --- HEADER (Con fondo de imagen como en el diseño original) --- */}
      <ImageBackground source={HEADER_BG} style={styles.headerBackground} resizeMode="cover">
        <View style={styles.headerOverlay}>
          <View style={[styles.headerContent, { maxWidth: 1200 }]}>
            <Text style={styles.logoText}>DigiCurva</Text>
            
            {isDesktop && (
              <View style={styles.searchBar}>
                <TextInput 
                  placeholder="Buscar" 
                  style={styles.searchInput}
                  placeholderTextColor="#666" 
                />
                <Ionicons name="search" size={20} color="#666" />
              </View>
            )}

            <View style={styles.userSection}>
              <Image source={{ uri: 'https://randomuser.me/api/portraits/women/44.jpg' }} style={styles.avatar} />
              {isDesktop && (
                <View>
                  <Text style={styles.userName}>Naomi Ruiz</Text>
                  <Text style={styles.userLink}>Ajustes</Text>
                </View>
              )}
            </View>
            <View style={styles.headerIcons}>
                <Ionicons name="heart-outline" size={24} color="#fff" />
                <Ionicons name="cart-outline" size={24} color="#fff" style={{marginLeft: 15}} />
            </View>
          </View>
        </View>
      </ImageBackground>

      {/* --- SUBNAV --- */}
      <View style={styles.subNavbar}>
        <View style={[styles.subNavbarContent, { maxWidth: 1200 }]}>
          <Ionicons name="home-outline" size={20} color="#333" />
          <Text style={styles.navLink}>Ofertas</Text>
          <Text style={styles.navLink}>Nuevo</Text>
          <Text style={styles.navLink}>Mas vendido</Text>
          <View style={styles.dropdown}>
             <Text style={styles.navLink}>Categorías</Text>
             <Ionicons name="caret-down" size={12} color="#333" style={{marginLeft: 5}} />
          </View>
        </View>
      </View>

      {/* --- MAIN CONTENT (Dos Columnas) --- */}
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={[styles.mainLayout, { flexDirection: isDesktop ? 'row' : 'column', minHeight: height - 150 }]}>
          
          {/* COLUMNA IZQUIERDA: Lista de Productos */}
          <View style={[styles.cartColumn, { width: isDesktop ? '65%' : '100%' }]}>
            <View style={styles.columnContent}>
              <Text style={styles.sectionTitle}>Carrito de compras</Text>

              {cartItems.map((item) => (
                <View key={item.id} style={styles.cartItemCard}>
                  <View style={styles.itemImageContainer}>
                    <Image source={{ uri: item.image }} style={styles.itemImage} resizeMode="contain" />
                  </View>
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemPrice}>${item.price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* COLUMNA DERECHA: Resumen y Pago (Fondo Azul) */}
          <View style={[styles.checkoutColumn, { width: isDesktop ? '35%' : '100%' }]}>
            <View style={styles.columnContent}>
              
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalAmount}>${total.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</Text>

              <View style={styles.paymentHeader}>
                <Text style={styles.paymentTitle}>Metodo de pago</Text>
                <Ionicons name="add" size={24} color="#555" />
              </View>

              {/* Opción 1: Tarjeta (Santander) */}
              <TouchableOpacity 
                style={styles.paymentOption} 
                onPress={() => setPaymentMethod('card')}
                testID="payment_card"
              >
                <View style={styles.paymentTextContainer}>
                  <Text style={styles.paymentMethodName}>SANTANDER</Text>
                  <Text style={styles.paymentMethodDetail}>XXXX-XXXX-XXXX-XXX</Text>
                </View>
                <View style={[styles.radioOuter, paymentMethod === 'card' && styles.radioOuterSelected]}>
                  {paymentMethod === 'card' && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>

              {/* Opción 2: Efectivo */}
              <TouchableOpacity 
                style={styles.paymentOption} 
                onPress={() => setPaymentMethod('cash')}
                testID="payment_cash"
              >
                <View style={styles.paymentTextContainer}>
                  <Text style={styles.paymentMethodName}>Pago en efectivo</Text>
                </View>
                <View style={[styles.radioOuter, paymentMethod === 'cash' && styles.radioOuterSelected]}>
                  {paymentMethod === 'cash' && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>

              {/* Botón Pagar (No estaba explícito en la imagen recortada pero es necesario para la funcionalidad) */}
              <TouchableOpacity 
                style={styles.payButton}
                onPress={processPayment}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.payButtonText}>Finalizar Compra</Text>
                )}
              </TouchableOpacity>

            </View>
          </View>

        </View>
      </ScrollView>

    </SafeAreaView>
  );
}

// --- ESTILOS (Style.ts) ---
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
  // HEADER
  headerBackground: {
    width: '100%',
    height: 80, 
  },
  headerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(56, 189, 248, 0.6)', // Azul semi-transparente sobre la imagen
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    width: '95%',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 4,
    fontFamily: Platform.OS === 'web' ? 'Arial Black' : 'System',
  },
  searchBar: {
    flex: 1,
    maxWidth: 500,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderRadius: 4,
    height: 35,
    marginHorizontal: 20,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    outlineStyle: 'none' as any, // TypeScript fix for web
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#fff',
  },
  userName: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  userLink: {
    color: '#e0f2fe',
    fontSize: 12,
  },
  headerIcons: {
    flexDirection: 'row',
    marginLeft: 20,
  },
  // SUBNAV
  subNavbar: {
    backgroundColor: '#f0f9ff', // Azul muy pálido
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0f2fe',
  },
  subNavbarContent: {
    flexDirection: 'row',
    width: '95%',
    alignItems: 'center',
    gap: 25,
  },
  navLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // LAYOUT PRINCIPAL
  mainLayout: {
    width: '100%',
    flex: 1,
  },
  columnContent: {
    padding: 30,
    maxWidth: 800, // Limite ancho contenido
    alignSelf: 'center',
    width: '100%',
  },
  // COLUMNA IZQUIERDA (CARRITO)
  cartColumn: {
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
  },
  cartItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  itemImageContainer: {
    width: 100,
    height: 100,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 5,
    // Sombra suave en la imagen como en el diseño
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    marginRight: 20,
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemDetails: {
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 22, // Grande y bold
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  itemPrice: {
    fontSize: 22,
    fontWeight: '400',
    color: '#333',
  },
  // COLUMNA DERECHA (CHECKOUT)
  checkoutColumn: {
    backgroundColor: '#e0f7fa', // Azul claro distintivo de la imagen
    borderLeftWidth: 1,
    borderLeftColor: '#cffafe',
  },
  totalLabel: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  totalAmount: {
    fontSize: 36,
    fontWeight: '400',
    color: '#333',
    marginBottom: 30,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  paymentTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  paymentOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    marginBottom: 10,
  },
  paymentTextContainer: {
    flex: 1,
  },
  paymentMethodName: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  paymentMethodDetail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  // RADIO BUTTON CUSTOM
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2563eb', // Azul
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  radioOuterSelected: {
    borderColor: '#1d4ed8',
  },
  radioInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#1d4ed8', // Azul relleno
  },
  // BOTÓN DE PAGO
  payButton: {
    marginTop: 40,
    backgroundColor: '#1d4ed8',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: "#1d4ed8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  }
});