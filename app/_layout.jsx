import { useFonts } from "expo-font";
import { Stack, useLocalSearchParams, router } from "expo-router";
import { useEffect, useState } from "react";
import "react-native-reanimated";
import "./global.css";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { Provider } from "react-redux";
import { store } from "../stores/store";
import { appColors } from "../constants/appColor";
import Toast from "react-native-toast-message";
import ChatScreen from "./(main)/ChatScreen";
import socket from "../utils/socket";

export default function RootLayout() {
  // const otherUser = params.otherUser ? JSON.parse(params.otherUser) : null;
  const [memberCount, setMemberCount] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState({});
  const [lastOnline, setLastOnline] = useState({});


  useEffect(() => {
    // Lắng nghe sự kiện user-status
    socket.on("user-status", ({ userId, isOnline, lastActive }) => {
      setOnlineUsers(prev => ({
        ...prev,
        [userId]: isOnline
      }));
      
      if (!isOnline && lastActive) {
        setLastOnline(prev => ({
          ...prev,
          [userId]: lastActive
        }));
      }
    });

    return () => {
      socket.off("user-status");
    };
  }, []);

  const isUserOnline = (userId) => {
    return onlineUsers[userId] || false;
  };

  const getStatusText = (user, conversation) => {
    if (conversation?.type === "group") {
      // Tính số thành viên online trong nhóm
      const onlineCount = conversation.members?.filter(member => 
        isUserOnline(member._id)
      ).length || 0;
      
      return `${onlineCount}/${conversation.members.length} đang online`;
    }
    
    if (isUserOnline(user?._id)) {
      return "Đang hoạt động";
    }
    
    if (lastOnline[user?._id]) {
      return `Hoạt động ${dayjs(lastOnline[user?._id]).fromNow()}`;
    }
    
    return "Vừa mới truy cập";
  };



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

                const statusText = getStatusText(otherUser, conversation);

              return (
                <View

                  style={{
                    flexDirection: "row",
                    gap: 20,
                    alignItems: "center",
                    flex: 1
                  }}
                >
                  <MaterialIcons
                    color={appColors.white}
                    onPress={() => navigation.goBack()} // Sử dụng navigation từ closure
                    name="west"
                    size={25}
                  />
                  <Pressable onPress={() => {
                    if (conversation?.type === "group") {
                      // Sử dụng router.push với cú pháp đúng
                      router.push({
                        pathname: "(main)/GroupDetail",
                        params: {
                          conversation: route.params.conversation,
                        },
                      });
                    } else {
                      router.push({
                        pathname: "(contact)/UserDetail",
                        params: {
                          otherUser: route.params.otherUser,
                        },
                      });
                    }
                  }} className="flex-1 flex-col ">
                    <Text
                      style={{
                        fontWeight: "600",
                        fontSize: 18,
                        color: appColors.white,
                      }}
                    >
                      {conversation?.type === "group"
                        ? conversation?.name
                        : otherUser?.username}
                    </Text>
                    <Text className="text-sm text-gray-300">
                      {statusText}
                    </Text>
                  </Pressable>
                </View>
              );
            },
            headerRight: () => {
              return (
                <View className="flex-row gap-5 items-center">
                  <Pressable>
                    <MaterialIcons name="phone" size={24} color="white" />
                  </Pressable>
                  <Pressable>
                    <Ionicons name="videocam-outline" size={28} color="white" />
                  </Pressable>
                </View>
              )
            }
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
