import { useFonts } from "expo-font";
import { Stack, useLocalSearchParams, router } from "expo-router";
import { useEffect, useState } from "react";
import "react-native-reanimated";
import "./global.css";
import { MaterialIcons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { Provider } from "react-redux";
import { store } from "../stores/store";
import { appColors } from "../constants/appColor";
import Toast from "react-native-toast-message";
import ChatScreen from "./(main)/ChatScreen";

export default function RootLayout() {
  // const otherUser = params.otherUser ? JSON.parse(params.otherUser) : null;
  const [memberCount, setMemberCount] = useState(0);
  return (
    <Provider store={store}>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="(contact)/CreateGroup"
          options={({ navigation }) => ({
            title: "",
            headerShown: true,
            headerLeft: () => (
              <View
                style={{ flexDirection: "row", gap: 20, alignItems: "center" }}
              >
                <MaterialIcons
                  onPress={() => navigation.goBack()}
                  name="west"
                  size={25}
                />
                <View>
                  <Text style={{ fontWeight: "600", fontSize: 18 }}>
                    Tạo nhóm
                  </Text>
                  <Text>Đã chọn: {memberCount}</Text>
                </View>
              </View>
            ),
          })}
          // initialParams={{ setMemberCount }}
        />

        <Stack.Screen
          name="(contact)/AddFriend"
          options={({ navigation }) => ({
            title: "",
            headerShown: true,
            headerLeft: () => (
              <View
                style={{ flexDirection: "row", gap: 20, alignItems: "center" }}
              >
                <MaterialIcons
                  onPress={() => navigation.goBack()}
                  name="west"
                  size={25}
                />
                <Text style={{ fontWeight: "600", fontSize: 18 }}>
                  Thêm bạn
                </Text>
              </View>
            ),
          })}
          initialParams={{ setMemberCount }}
        />

        <Stack.Screen name="/(contact)/QRScanner" />
        <Stack.Screen
          name="(screens)/login"
          options={({ navigation }) => ({
            title: "",
            headerShown: true,
            headerStyle: { backgroundColor: appColors.primary },
            headerLeft: () => (
              <View
                style={{ flexDirection: "row", gap: 20, alignItems: "center" }}
              >
                <MaterialIcons
                  color={appColors.white}
                  onPress={() => navigation.goBack()}
                  name="west"
                  size={25}
                />
                <Text
                  style={{
                    fontWeight: "600",
                    fontSize: 18,
                    color: appColors.white,
                  }}
                >
                  Đăng nhập
                </Text>
              </View>
            ),
          })}
        />
        <Stack.Screen
          name="(screens)/register"
          options={({ navigation }) => ({
            title: "",
            headerShown: true,
            headerStyle: { backgroundColor: appColors.primary },
            headerLeft: () => (
              <View
                style={{ flexDirection: "row", gap: 20, alignItems: "center" }}
              >
                <MaterialIcons
                  color={appColors.white}
                  onPress={() => navigation.goBack()}
                  name="west"
                  size={25}
                />
                <Text
                  style={{
                    fontWeight: "600",
                    fontSize: 18,
                    color: appColors.white,
                  }}
                >
                  Tạo tài khoản mới
                </Text>
              </View>
            ),
          })}
        />
        <Stack.Screen
          name="(screens)/forgotPassword"
          options={({ navigation }) => ({
            title: "",
            headerShown: true,
            headerStyle: { backgroundColor: appColors.primary },
            headerLeft: () => (
              <View
                style={{ flexDirection: "row", gap: 20, alignItems: "center" }}
              >
                <MaterialIcons
                  color={appColors.white}
                  onPress={() => navigation.goBack()}
                  name="west"
                  size={25}
                />
                <Text
                  style={{
                    fontWeight: "600",
                    fontSize: 18,
                    color: appColors.white,
                  }}
                >
                  Lấy lại mật khẩu
                </Text>
              </View>
            ),
          })}
        />

        <Stack.Screen
          name="(contact)/NewFriend"
          options={({ navigation }) => ({
            title: "",
            headerShown: true,
            headerStyle: { backgroundColor: appColors.primary },
            headerLeft: () => (
              <View
                style={{ flexDirection: "row", gap: 20, alignItems: "center" }}
              >
                <MaterialIcons
                  color={appColors.white}
                  onPress={() => navigation.goBack()}
                  name="west"
                  size={25}
                />
                <Text
                  style={{
                    fontWeight: "600",
                    fontSize: 18,
                    color: appColors.white,
                  }}
                >
                  Lời mời kết bạn
                </Text>
              </View>
            ),
          })}
        />

        <Stack.Screen
          name="(main)/ChatScreen"
          options={({ navigation, route }) => ({
            // Thêm navigation vào đây
            title: "",
            headerShown: true,
            headerStyle: { backgroundColor: appColors.primary },
            headerLeft: () => {
              // Không cần destructuring ở đây
              const otherUser = route.params?.otherUser
                ? JSON.parse(route.params.otherUser)
                : null;

              const conversation = route.params?.conversation
                ? JSON.parse(route.params.conversation)
                : null;

              return (
                <View
                  style={{
                    flexDirection: "row",
                    gap: 20,
                    alignItems: "center",
                  }}
                >
                  <MaterialIcons
                    color={appColors.white}
                    onPress={() => navigation.goBack()} // Sử dụng navigation từ closure
                    name="west"
                    size={25}
                  />
                  <Text
                    style={{
                      fontWeight: "600",
                      fontSize: 18,
                      color: appColors.white,
                    }}
                    onPress={() => {
                      if (conversation?.type === "group") {
                        // Sử dụng router.push với cú pháp đúng
                        router.push({
                          pathname: "(main)/GroupDetail",
                          params: {
                            conversation: route.params.conversation,
                          },
                        });
                      }
                    }}
                  >
                    {conversation?.type === "group"
                      ? conversation?.name
                      : otherUser?.username}
                  </Text>
                </View>
              );
            },
          })}
        />

        <Stack.Screen
          name="(main)/ForwardMessage"
          options={({ navigation }) => ({
            title: "",
            headerShown: true,
            headerStyle: { backgroundColor: appColors.primary },
            headerLeft: () => (
              <View
                style={{ flexDirection: "row", gap: 20, alignItems: "center" }}
              >
                <MaterialIcons
                  color={appColors.white}
                  onPress={() => navigation.goBack()}
                  name="west"
                  size={25}
                />
                <Text
                  style={{
                    fontWeight: "600",
                    fontSize: 18,
                    color: appColors.white,
                  }}
                >
                  Chuyển tiếp
                </Text>
              </View>
            ),
          })}
        />

        <Stack.Screen
          name="(main)/GroupDetail"
          options={({ navigation }) => ({
            title: "",
            headerShown: true,
            headerStyle: { backgroundColor: appColors.primary },
            headerLeft: () => (
              <View
                style={{ flexDirection: "row", gap: 20, alignItems: "center" }}
              >
                <MaterialIcons
                  color={appColors.white}
                  onPress={() => navigation.goBack()}
                  name="west"
                  size={25}
                />
                <Text
                  style={{
                    fontWeight: "600",
                    fontSize: 18,
                    color: appColors.white,
                  }}
                >
                  Chi tiết nhóm
                </Text>
              </View>
            ),
          })}
        />

        <Stack.Screen
          name="(main)/SettingGroup"
          options={({ navigation }) => ({
            title: "",
            headerShown: true,
            headerStyle: { backgroundColor: appColors.primary },
            headerLeft: () => (
              <View
                style={{ flexDirection: "row", gap: 20, alignItems: "center" }}
              >
                <MaterialIcons
                  color={appColors.white}
                  onPress={() => navigation.goBack()}
                  name="west"
                  size={25}
                />
                <Text
                  style={{
                    fontWeight: "600",
                    fontSize: 18,
                    color: appColors.white,
                  }}
                >
                  Cài đặt nhóm
                </Text>
              </View>
            ),
          })}
        />

        <Stack.Screen
          name="(contact)/AddGroupMember"
          options={{
            headerShown: false, // Ẩn header từ Stack Navigator
          }}
        />

        <Stack.Screen
          name="(contact)/ModelSetting"
          options={{
            headerShown: false, // Ẩn header từ Stack Navigator
          }}
        />
      </Stack>
      <Toast />
    </Provider>
  );
}
