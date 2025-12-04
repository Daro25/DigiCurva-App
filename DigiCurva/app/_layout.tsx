import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="login" options={{ title: 'Login' }} />
      <Tabs.Screen name="registro" options={{ title: 'Registro' }} />
      <Tabs.Screen name='producto' options={{title: 'Producto'}} />
      <Tabs.Screen name='carrito' options={{title: 'Carrito'}} />
    </Tabs>
  );
}
