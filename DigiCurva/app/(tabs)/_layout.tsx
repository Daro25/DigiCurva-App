import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs>
        <Tabs.Screen name="index2" options={{ title: 'Home',  headerShown: false  }} />
        <Tabs.Screen name='carrito' options={{ title: 'Carrito',  headerShown: false  }} />
    </Tabs>
  );
}
