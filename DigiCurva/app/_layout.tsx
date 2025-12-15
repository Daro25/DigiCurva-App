// Archivo: app/_layout.tsx
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      {/* La pantalla inicial que hace la verificación de sesión */}
      <Stack.Screen name="index" options={{ title: 'Home', headerShown: false }} />
      
      {/* Pantallas de Autenticación */}
      <Stack.Screen name="login" options={{ title: 'Login', headerShown: false, animation: 'fade' }} />
      <Stack.Screen name="registro" options={{ title: 'Registro', headerShown: false }} />
      
      {/* Pantallas de la App */}
      <Stack.Screen name="producto" options={{ title: 'Producto', headerShown: false }} />
      <Stack.Screen name="Anuncio" options={{ title: 'Anuncio', headerShown: false }} />
      <Stack.Screen name="carrito" options={{ title: 'Carrito', headerShown: false }} />
      <Stack.Screen name="paypal" options={{ title: 'Paypal', headerShown: false }} />
    </Stack>
  );
}