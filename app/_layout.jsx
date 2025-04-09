import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import "react-native-reanimated";
import "./global.css";
import { MaterialIcons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { Provider } from 'react-redux'
import { store } from "../stores/store";
import { appColors } from '../constants/appColor'

export default function RootLayout() {
  const [memberCount, setMemberCount] = useState(0);
  return (
    <Provider store={store}>
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
                  <Text>Đã chọn: {memberCount}</Text>
                </View>
              </View>
            )
          })}
          initialParams={{setMemberCount}}
        />

        <Stack.Screen name="(contact)/AddFriend" 
          options={({navigation}) => ({
            title: "",
            headerShown: true,
            headerLeft: ()=>(
              <View style={{ flexDirection: 'row', gap: 20, alignItems: 'center' }}>
                <MaterialIcons onPress={() => navigation.goBack()} name="west" size={25}/>
                <Text style={{ fontWeight: '600', fontSize: 18 }}>Thêm bạn</Text>
              </View>
            )
          })}
          initialParams={{setMemberCount}}
        />

        <Stack.Screen name="/(contact)/QRScanner"/>
        <Stack.Screen 
          name="(screens)/login" 
          options={({ navigation }) => ({
            title: "",
            headerShown: true,
            headerStyle: { backgroundColor: appColors.primary },
            headerLeft: () => (
              <View style={{ flexDirection: 'row', gap: 20, alignItems: 'center' }}>
                <MaterialIcons color={appColors.white} onPress={() => navigation.goBack()} name="west" size={25}/>
                <Text style={{ fontWeight: '600', fontSize: 18, color: appColors.white }}>Đăng nhập</Text>
              </View>
            )
          })}
        /> 
        <Stack.Screen
          name="(screens)/register"
          options={({ navigation }) => ({
            title: "",
            headerShown: true,
            headerStyle: { backgroundColor: appColors.primary },
            headerLeft: () => (
              <View style={{ flexDirection: 'row', gap: 20, alignItems: 'center' }}>
                <MaterialIcons color={appColors.white} onPress={() => navigation.goBack()} name="west" size={25}/>
                <Text style={{ fontWeight: '600', fontSize: 18, color: appColors.white }}>Tạo tài khoản mới</Text>
              </View>
            )
          })}
        />
        <Stack.Screen
          name="(screens)/forgotPassword"
          options={({ navigation }) => ({
            title: "",
            headerShown: true,
            headerStyle: { backgroundColor: appColors.primary },
            headerLeft: () => (
              <View style={{ flexDirection: 'row', gap: 20, alignItems: 'center' }}>
                <MaterialIcons color={appColors.white} onPress={() => navigation.goBack()} name="west" size={25}/>
                <Text style={{ fontWeight: '600', fontSize: 18, color: appColors.white }}>Lấy lại mật khẩu</Text>
              </View>
            )
          })}
        />
      </Stack>
    </Provider>
  );
}
