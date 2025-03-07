import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { useEffect } from "react";
import "react-native-reanimated";
import "./global.css";
import CreateGroup from "./(contact)/CreateGroup";
import { MaterialIcons } from "@expo/vector-icons";
import { Text, View } from "react-native";

export default function RootLayout() {
  return (
    <Stack screenOptions={{
      headerShown: false
    }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(contact)/CreateGroup" 
        options={({navigation}) => ({
          title: "",
          headerShown: true,
          headerLeft: ()=>(
            <View style={{ flexDirection: 'row', gap: 20, alignItems: 'center' }}>
              <MaterialIcons onPress={() => navigation.goBack()} name="west" size={25}/>
              <View>
                <Text style={{ fontWeight: '600', fontSize: 18 }}>Tạo nhóm</Text>
                <Text>Đã chọn: 0</Text>
              </View>
            </View>
          )
        })}
      />
      {/* <Stack.Screen name="login" options={{ presentation: "modal" }} />
      <Stack.Screen
        name="(screens)/register"
        options={{ presentation: "modal" }}
      /> */}
    </Stack>
  );
}
