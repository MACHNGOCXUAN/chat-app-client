import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import "./global.css";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      {/* <Stack.Screen name="login" options={{ presentation: "modal" }} />
      <Stack.Screen
        name="(screens)/register"
        options={{ presentation: "modal" }}
      /> */}
    </Stack>
  );
}
