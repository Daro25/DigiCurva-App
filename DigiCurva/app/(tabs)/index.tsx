import { Text, View } from "react-native";
import { Link } from "expo-router";

export default function Index2() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Edit app/index.tsx to edit this screen.</Text>
      <Link href="/login">
        <Text style={{ color: 'blue', marginTop: 20 }}>Go to Login</Text>
      </Link>
      <Link href="/registro">
        <Text style={{ color: 'blue', marginTop: 20 }}>Go to Registro</Text>
      </Link>
      <Link href="/product">
      <Text style={{ color: 'blue', marginTop: 20 }}>Go to producto</Text>
      </Link>
      <Link href="/">
      <Text style={{ color: 'blue', marginTop: 20 }}>Go to index</Text>
      </Link>
      <Link href="/(tabs)/carrito">
      <Text style={{ color: 'blue', marginTop: 20 }}>Go to carrito</Text>
      </Link>
    </View>
  );
}
