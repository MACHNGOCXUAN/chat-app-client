import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
} from "react-native";
import Header from "../../components/Header";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import Friend from "../(contact)/Friend";
import Group from "../(contact)/Group";
import avatar from "../../assets/images/avatar.png";
import { Ionicons } from "@expo/vector-icons";
import axiosInstance from "../../utils/axiosInstance";
import { useSelector } from "react-redux";
import socket from "../../utils/socket";
import Toast from "react-native-toast-message";
import { router } from "expo-router";

const Tab = createMaterialTopTabNavigator();

const isIOS = Platform.OS === "ios";

const Contacts = () => {
  const [isFocus, setIsFocus] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const { user } = useSelector((state) => state.auth);

  const handleSearch = async (text) => {
    setSearchText(text);

    if (text.trim() === "") {
      setSearchResults([]);
      return;
    }

    const isPhoneNumber = /^\d{10}$/.test(text);

    if (isPhoneNumber) {
      try {
        const response = await axiosInstance.get("/api/auth/searchphone", {
          params: { phoneNumber: text },
        });

        const userFriend = response.data;

        if (userFriend) {
          const isFriend = userFriend.friends.find(
            (f) =>
              f.friendId.toString() === user._id.toString() &&
              f.status === "accepted"
          );

          setSearchResults([
            {
              _id: userFriend._id,
              username: userFriend.username,
              phoneNumber: userFriend.phoneNumber,
              email: userFriend.email,
              avatarURL: userFriend.avatarURL,
              isFriend: isFriend,
              type: "friend",
            },
          ]);
        } else {
          setSearchResults([]);
          Alert("loi");
        }
      } catch (error) {
        console.error("Search API error:", error);
        setSearchResults([]);
      }
    }
  };

  const addFriend = async (receiverPhone) => {
    const senderPhone = user.phoneNumber;

    try {
      const res = await axiosInstance.post("/api/friend/request", {
        senderPhone,
        receiverPhone,
      });

      if (res.data && !res.data.success) {
        Alert.alert(
          "❌ Lỗi",
          res.data.message || "Không gửi được lời mời kết bạn."
        );
        return;
      }
      Alert.alert(
        "✅ Thành công",
        res.data?.message || "Đã gửi lời mời kết bạn."
      );
    } catch (error) {
      Alert.alert("❌ Lỗi", "Không gửi được lời mời.");
      console.error(error);
    }
  };

  const showToast = (data) => {
    Toast.show({
      type: "success",
      text1: "📬 Lời mời kết bạn",
      text2: `${data.username} muốn kết bạn với bạn`,
      visibilityTime: 3000,
      props: {
        avatar: data.avatarURL || defaultAvatar,
      },
    });
  };

  useEffect(() => {
    if (user?._id) {
      socket.emit("joinUserRoom", user._id);

      socket.on("friendRequestReceived", (data) => {
        Alert.alert(
          "📬 Lời mời kết bạn",
          `${data.username} muốn kết bạn với bạn`
        );
        // showToast(data)
      });

      return () => {
        socket.off("friendRequestReceived");
      };
    }
  }, [user?._id]);

  const renderSearchItem = ({ item }) => {
    if (item.type == "friend") {
      return (
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/(main)/ChatScreen",
              params: {
                otherUser: JSON.stringify(item),
              },
            })
          }
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 15,
            justifyContent: "space-between",
          }}
        >
          <View style={styles.friendItem} className="flex flex-row gap-5">
            <View>
              <Image
                source={item.avatarURL ? { uri: item?.avatarURL } : avatar}
                style={styles.avatar}
              />
            </View>
            <View>
              <Text className="text-lg font-semibold">{item.username}</Text>
              <Text className="text-gray-600">{item.phoneNumber}</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: 20 }}>
            {item.isFriend ? (
              <TouchableOpacity>
                <Ionicons name="call-outline" size={25} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => addFriend(item.phoneNumber)}>
                <Ionicons name="person-add-outline" size={25} />
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      );
    } else {
      return (
        <View className="p-3 border-b border-gray-200">
          <Text className="text-lg font-semibold">{item.name}</Text>
          <Text className="text-gray-600">{item.members} thành viên</Text>
        </View>
      );
    }
  };

  return (
    <View className='flex-1'>
      <Header
        setIsFocus={setIsFocus}
        isFocus={isFocus}
        onSearch={handleSearch}
      />
      <Tab.Navigator
        initialRouteName="Bạn bè"
        // lazy={true} // Chỉ tải tab khi người dùng nhấn vào
        removeClippedSubviews={true} // Giúp tiết kiệm bộ nhớ
        screenOptions={{
          tabBarLabelStyle: { fontSize: 16 },
          tabBarIndicatorStyle: {
            backgroundColor: "#007AFF",
            height: 2,
            borderRadius: 1,
          },
        }}
      >
        <Tab.Screen
          name="Bạn bè"
          component={Friend}
          options={{ tabBarLabel: "Bạn bè" }}
        />
        <Tab.Screen
          name="Nhóm"
          component={Group}
          options={{ tabBarLabel: "Nhóm" }}
        />
      </Tab.Navigator>

      {isFocus && (
        <View
          className={`px-5 pb-3 flex-1 bg-white absolute left-0 right-0 bottom-0 ${
            isIOS ? "top-28" : "top-16"
          }`}
        >
          {searchText ? (
            searchResults.length > 0 ? (
              <FlatList
                data={searchResults}
                renderItem={renderSearchItem}
                keyExtractor={(item) => `${item.type}-${item.id}`}
                className="mt-2"
              />
            ) : (
              <Text className="text-gray-500 mt-4 text-center">
                Không tìm thấy kết quả
              </Text>
            )
          ) : (
            <View className="mt-4">
              <Text className="text-gray-700 font-semibold">
                Gợi ý tìm kiếm
              </Text>
              <View className="flex-row flex-wrap mt-2">
                <TouchableOpacity
                  className="bg-gray-100 rounded-full px-3 py-1 mr-2 mb-2"
                  onPress={() => {
                    setSearchText("098");
                    handleSearch("098");
                  }}
                >
                  <Text className="text-gray-700">098...</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="bg-gray-100 rounded-full px-3 py-1 mr-2 mb-2"
                  onPress={() => {
                    setSearchText("Nhóm");
                    handleSearch("Nhóm");
                  }}
                >
                  <Text className="text-gray-700">Nhóm...</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    fontSize: 18,
  },
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Contacts;
