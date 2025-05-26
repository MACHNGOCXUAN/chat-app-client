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
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialIcons, FontAwesome5, Feather } from "@expo/vector-icons";
import avatar from "../../assets/images/avatar.png";
import { useRoute } from "@react-navigation/native";
import Header from "../../components/Header";
import socket from "../../utils/socket";
import { router } from "expo-router";
import axiosInstance from "../../utils/axiosInstance";
import { useSelector } from "react-redux";
import { BlurView } from "expo-blur";

const isIOS = Platform.OS === "ios";

const Message = ({ navigation }) => {
  const { accessToken, user } = useSelector((state) => state.auth);
  const [groupName, setGroupName] = useState("");
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(true);

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
    setLoading(true);
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
    } finally {
      setLoading(false);
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
    socket.on("forwardConversation", () => {
      fetchConversation()
    })
    socket.on("group_created", () => {
      fetchConversation()
    });

    socket.on("added_to_group", () => {
      fetchConversation()
    })

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

  // Format time to display relative time (e.g. "3m", "2h", "Yesterday")
  const formatTime = (timestamp) => {
    if (!timestamp) return "";

    const now = new Date();
    const messageDate = new Date(timestamp);
    const diffMs = now - messageDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays === 1) return "Yesterday";

    // Format to day/month
    return messageDate.toLocaleDateString([], {
      day: '2-digit',
      month: '2-digit',
    });
  };

  // Truncate message content if it's too long
  const truncateMessage = (message, maxLength = 30) => {
    if (!message) return "No messages yet";
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + "...";
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
          style={styles.searchItemContainer}
        >
          <View style={styles.friendItem}>
            <View style={styles.avatarContainer}>
              <Image
                source={item?.avatarURL ? { uri: item?.avatarURL } : avatar}
                style={styles.searchAvatar}
              />
            </View>
            <View style={styles.userInfoContainer}>
              <Text style={styles.username}>{item.username}</Text>
              <Text style={styles.phoneNumber}>{item.phoneNumber}</Text>
            </View>
          </View>
          <View style={styles.actionButtonsContainer}>
            {item.isFriend ? (
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="call-outline" size={22} color="#297EFF" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.addFriendButton}
                onPress={() => addFriend(item.phoneNumber)}
              >
                <Ionicons name="person-add-outline" size={18} color="#FFF" />
                <Text style={styles.addFriendText}>Kết bạn</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      );
    } else {
      return (
        <TouchableOpacity style={styles.groupSearchItem}>
          <View style={styles.groupAvatarContainer}>
            <View style={styles.groupIconContainer}>
              <FontAwesome5 name="users" size={18} color="#FFF" />
            </View>
          </View>
          <View style={styles.groupInfoContainer}>
            <Text style={styles.username}>{item.name}</Text>
            <Text style={styles.memberCount}>{item.members} thành viên</Text>
          </View>
        </TouchableOpacity>
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

  const renderConversationItem = ({ item }) => {
    const otherUser = getOtherUser(item);
    const lastMessageTime = item.lastMessage
      ? formatTime(item.lastMessage.timestamp)
      : "";

      // const lastMessageTime = item?.isActive == false ? "Nhóm đã giải tán" : (
      //   item.lastMessage
      // ? formatTime(item.lastMessage.timestamp)
      // : ""
      // )

    const hasUnread = item.unreadCount > 0;
    const isOnline = otherUser?.isOnline || false;

    return (
      <TouchableOpacity
        style={styles.conversationItem}
        activeOpacity={0.7}
        onPress={() =>
          router.push({
            pathname: "/(main)/ChatScreen",
            params: {
              conversation: JSON.stringify(item),
              otherUser: JSON.stringify(otherUser),
            },
          })
        }
        onLongPress={() => {
          if (item.type === 'group') {
            Alert.alert(
              "Tùy chọn nhóm",
              "Chọn hành động",
              [
                {
                  text: "Xem chi tiết nhóm",
                  onPress: () => router.push({
                    pathname: "/(main)/GroupDetail",
                    params: {
                      conversation: JSON.stringify(item)
                    }
                  })
                },
                {
                  text: "Hủy",
                  style: "cancel"
                }
              ]
            );
          }
        }}
      >
        <View style={styles.avatarContainer}>
          <Image
            source={
              item.type === "private"
                ? otherUser?.avatarURL
                  ? { uri: otherUser.avatarURL }
                  : avatar
                : item?.imageGroup
                  ? { uri: item.imageGroup }
                  : avatar
            }
            style={styles.avatar}
          />
          {item.type === "private" && isOnline && (
            <View style={styles.onlineIndicator} />
          )}
          {item.type === "group" && (
            <View style={styles.groupIndicator}>
              <FontAwesome5 name="users" size={10} color="#FFF" />
            </View>
          )}
        </View>

        <View style={styles.conversationInfo}>
          <View style={styles.conversationHeader}>
            <Text style={[
              styles.conversationName,
              hasUnread && styles.unreadName
            ]}>
              {item.type === "private"
                ? otherUser?.username || "Người dùng"
                : item?.name || "Nhóm chat"}
            </Text>
            <Text style={styles.timeText}>{lastMessageTime}</Text>
          </View>

          <View style={styles.conversationFooter}>
            <Text
              style={[
                styles.lastMessage,
                hasUnread && styles.unreadMessage
              ]}
              numberOfLines={1}
            >
              {
                truncateMessage(item?.isActive == false ? "Nhóm đã giải tán" : item.lastMessage?.content)
              }

              
            </Text>

            {hasUnread && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadCount}>
                  {item.unreadCount > 99 ? '99+' : item.unreadCount}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Header
        setIsFocus={setIsFocus}
        isFocus={isFocus}
        onSearch={handleSearch}
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#297EFF" />
        </View>
      ) : (
        <View style={styles.conversationContainer}>
          {conversation.length > 0 ? (
            <FlatList
              data={conversation}
              keyExtractor={(item) => item?._id}
              renderItem={renderConversationItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <FontAwesome5 name="comments" size={50} color="#CCCCCC" />
              <Text style={styles.emptyText}>Chưa có cuộc trò chuyện nào</Text>
              <Text style={styles.emptySubtext}>
                Tìm kiếm bạn bè để bắt đầu trò chuyện
              </Text>
            </View>
          )}

          {/* Floating action button */}
          <TouchableOpacity
            style={styles.floatingButton}
            onPress={() => router.push('/(tabs)/newMessage')}
          >
            <Feather name="edit" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      )}

      {isFocus && (
        <View style={[
          styles.searchResultsContainer,
          { top: isIOS ? 110 : 65 }
        ]}>
          {searchText ? (
            searchResults.length > 0 ? (
              <FlatList
                data={searchResults}
                renderItem={renderSearchItem}
                keyExtractor={(item) => `${item.type}-${item._id}`}
                contentContainerStyle={styles.searchResultsList}
              />
            ) : (
              <View style={styles.noResultsContainer}>
                <Feather name="search" size={40} color="#CCCCCC" />
                <Text style={styles.noResultsText}>
                  Không tìm thấy kết quả
                </Text>
              </View>
            )
          ) : (
            <View style={styles.searchSuggestionsContainer}>
              <Text style={styles.suggestionsTitle}>
                Gợi ý tìm kiếm
              </Text>
              <View style={styles.suggestionsRow}>
                <TouchableOpacity
                  style={styles.suggestionChip}
                  onPress={() => {
                    setSearchText("098");
                    handleSearch("098");
                  }}
                >
                  <Text style={styles.suggestionText}>098...</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.suggestionChip}
                  onPress={() => {
                    setSearchText("Nhóm");
                    handleSearch("Nhóm");
                  }}
                >
                  <Text style={styles.suggestionText}>Nhóm...</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default Message;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  conversationContainer: {
    flex: 1,
  },
  listContainer: {
    paddingBottom: 15,
  },
  conversationItem: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F0F0F0',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
  },
  onlineIndicator: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4AD15F',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  groupIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#5B86E5',
    position: 'absolute',
    bottom: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  conversationInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2C2C2C',
  },
  unreadName: {
    fontWeight: '700',
    color: '#000000',
  },
  timeText: {
    fontSize: 12,
    color: '#909090',
  },
  conversationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    color: '#8C8C8C',
    flex: 1,
  },
  unreadMessage: {
    fontWeight: '600',
    color: '#297EFF',
  },
  unreadBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  unreadCount: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#555555',
    marginTop: 15,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888888',
    marginTop: 5,
    textAlign: 'center',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#297EFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  // Search results styles
  searchResultsContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
    paddingTop: 5,
  },
  searchResultsList: {
    paddingVertical: 10,
  },
  searchItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F0F0F0',
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchAvatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
  },
  userInfoContainer: {
    marginLeft: 12,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2C2C',
  },
  phoneNumber: {
    fontSize: 13,
    color: '#8C8C8C',
    marginTop: 2,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
  },
  addFriendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#297EFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  addFriendText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
    marginLeft: 4,
  },
  groupSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F0F0F0',
  },
  groupAvatarContainer: {
    marginRight: 12,
  },
  groupIconContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#5B86E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupInfoContainer: {
    flex: 1,
  },
  memberCount: {
    fontSize: 13,
    color: '#8C8C8C',
    marginTop: 2,
  },
  noResultsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  noResultsText: {
    fontSize: 16,
    color: '#8C8C8C',
    marginTop: 10,
  },
  searchSuggestionsContainer: {
    padding: 16,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2C2C',
    marginBottom: 12,
  },
  suggestionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  suggestionChip: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  suggestionText: {
    fontSize: 14,
    color: '#555555',
  },
});
