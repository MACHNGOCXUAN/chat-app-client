import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
  Image,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import avatar from "../../assets/images/avatar.png";
import { useRoute } from "@react-navigation/native";
import Header from "../../components/Header";
import socket from "../../utils/socket";
import {
  Card,
  Container,
  MessageText,
  PostTime,
  TextSection,
  UserImg,
  UserImgWrapper,
  UserInfo,
  UserInfoText,
  UserName,
} from "../../styles/MessageStyles";
import { router } from "expo-router";
import axiosInstance from "../../utils/axiosInstance";
import { useSelector } from "react-redux";

const isIOS = Platform.OS === "ios";

const message = ({ navigation }) => {
  const { accessToken, user } = useSelector((state) => state.auth);
  const [groupName, setGroupName] = useState("");
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [conversation, setConversation] = useState([]);

  const [isFocus, setIsFocus] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  

  const route = useRoute();
  const setMemberCount = route.params?.setMemberCount;

  useEffect(() => {
    if (setMemberCount) {
      setMemberCount(selectedContacts.length);
    }
  }, [selectedContacts]);

  const fetchConversation = async () => {
    try {
      const response = await axiosInstance.get(
        "/api/conversation/conversation",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.data.success) {
        const accepted = response.data.data || [];
        setConversation(accepted);
        getOtherUser();
      } else {
        console.error(
          "Request succeeded but API returned false:",
          response.data
        );
      }
    } catch (error) {
      console.error("Failed to fetch conversation:", error);
    }
  };

  useEffect(() => {
    fetchConversation();

    const handleGroupCreated = (newConversation) => {
      setConversation((prev) => [newConversation, ...prev]);
    };

    const handleJoinedConversation = (newConversation) => {
      console.log("New conversation joined:", newConversation);

      setConversation((prev) => [newConversation, ...prev]);
    };

    const handleConversationUpdate = (updatedConversation) => {
      setConversation((prev) => {
        // Cập nhật conversation trong danh sách
        const updated = prev.map((conv) =>
          conv._id === updatedConversation._id ? updatedConversation : conv
        );

        // Sắp xếp lại theo thời gian cập nhật
        return updated.sort(
          (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
        );
      });
    };
    
    socket.on("joined_room", handleJoinedConversation);
    socket.on("conversation_updated", handleConversationUpdate);
    socket.on("group_created", () => {
      fetchConversation()
    });

    return () => {
      socket.off("joined_room", handleJoinedConversation);
      socket.off("conversation_updated", handleConversationUpdate);
      socket.off("group_created", handleGroupCreated);
    };
  }, [socket, accessToken]);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to server");
    });
  }, []);

  const getOtherUser = (conversationItem) => {
    if (conversationItem?.type !== "private") return null;

    const otherUser = conversationItem.members.find(
      (member) => member?.userId?._id !== user._id
    );
    return otherUser.userId || conversationItem.members[0].userId;
  };

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
                source={item?.avatarURL ? { uri: item?.avatarURL } : avatar}
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

  return (
    <>
      <Header
        setIsFocus={setIsFocus}
        isFocus={isFocus}
        onSearch={handleSearch}
      />
      <Container>
        <FlatList
          data={conversation}
          keyExtractor={(item) => item?._id}
          renderItem={({ item }) => {
            const otherUser = getOtherUser(item);
            const lastMessageTime = item.lastMessage
              ? new Date(item.lastMessage.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "";

            return (
              <Card
                onPress={() =>
                  router.push({
                    pathname: "/(main)/ChatScreen",
                    params: {
                      conversation: JSON.stringify(item),
                      otherUser: JSON.stringify(otherUser), // Truyền thông tin người dùng khác
                    },
                  })
                }
              >
                <UserInfo>
                  <UserImgWrapper>
                    <UserImg
                      source={
                        item.type === "private"
                          ? { uri: otherUser?.avatarURL }
                          : { uri: item?.imageGroup }
                      }
                    />
                  </UserImgWrapper>
                  <TextSection>
                    <UserInfoText>
                      <UserName>
                        {item.type === "private"
                          ? otherUser?.username
                          : item?.name}
                      </UserName>
                      <PostTime>{lastMessageTime}</PostTime>
                    </UserInfoText>
                    <MessageText>
                      {item.lastMessage?.content || "No messages yet"}
                    </MessageText>
                  </TextSection>
                </UserInfo>
              </Card>
            );
          }}
        />
        {selectedContacts.length > 0 && (
          <View className="bg-white absolute bottom-0 w-full flex-row items-center justify-between p-4">
            <View className="flex-row">
              {selectedContacts.map((contact) => (
                <View
                  key={contact.id}
                  className="pl-4 flex-row items-center justify-center"
                >
                  <Image
                    source={contact.avatar}
                    className="size-16 rounded-full"
                  />
                </View>
              ))}
            </View>
            <Pressable className="bg-blue-700 p-3 rounded-full flex-row justify-center items-center">
              <MaterialIcons name="send" size={25} color="#fff" />
            </Pressable>
          </View>
        )}
      </Container>

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
    </>
  );
};

export default message;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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
