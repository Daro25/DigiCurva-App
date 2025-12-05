import { Stack } from 'expo-router';

export default function TabLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Home' , headerShown: false}} />
      <Stack.Screen name="login" options={{ title: 'Login' , headerShown: false }} />
      <Stack.Screen name="registro" options={{ title: 'Registro' , headerShown: false}} />
      <Stack.Screen name="producto" options={{ title: 'Producto' , headerShown: false }} />
      
      <Stack.Screen name="Anuncio" options={{ title: 'Anuncio' , headerShown: false }} />
      {/* El Stack que envuelve a los Tabs también debe ocultar su header */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
      
  );
}
