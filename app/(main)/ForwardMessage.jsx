import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  SectionList,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { appColors } from "../../constants/appColor";
import axiosInstance from "../../utils/axiosInstance";
import { useSelector } from "react-redux";
import socket from "../../utils/socket";

const ForwardMessage = () => {
  const { accessToken, user } = useSelector((state) => state.auth);
  const params = useLocalSearchParams();
  const message = params?.message ? JSON.parse(params?.message) : null;

  const [searchText, setSearchText] = useState("");
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [friends, setFriends] = useState([]);
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [friendsResponse, groupsResponse] = await Promise.all([
          axiosInstance.get("/api/friend/friends", {
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
          axiosInstance.get("/api/conversation/groupJoin", {
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
        ]);

        setFriends(friendsResponse.data.acceptedFriends || []);
        setGroups(groupsResponse.data.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load contacts. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [accessToken]);


  useEffect(() => {
    socket.on("forward_success", ({ message }) => {
      setIsLoading(false);
      Alert.alert("Thành công", message);
      router.back(); // Sử dụng router từ expo-router
    });
  
    socket.on("forward_partial_error", ({ message, errors }) => {
      setIsLoading(false);
      Alert.alert("Có lỗi", `${message}: ${errors.map(e => e.error).join(', ')}`);
    });
  
    socket.on("forward_error", ({ message }) => {
      setIsLoading(false);
      Alert.alert("Lỗi", message);
    });
  
    return () => {
      socket.off("forward_success");
      socket.off("forward_partial_error");
      socket.off("forward_error");
    };
  }, []);
  

  const sections = [
    {
      title: "Nhóm",
      data: groups.filter((group) =>
        group.name.toLowerCase().includes(searchText.toLowerCase())
      ),
    },
    {
      title: "Bạn bè",
      data: friends.filter((friend) =>
        friend.username.toLowerCase().includes(searchText.toLowerCase())
      ),
    },
  ];

  const toggleContact = (contact) => {
    setSelectedContacts((prev) => {
      const isSelected = prev.some((c) => c._id === contact._id);
      return isSelected
        ? prev.filter((c) => c._id !== contact._id)
        : [...prev, contact];
    });
  };

  const handleForward = () => {
    if (!message || selectedContacts.length === 0) return;
    
    setIsLoading(true);
    setError(null);
  
    socket.emit("forward_message", {
      originalMessage: message,
      targetConversations: selectedContacts,
      senderId: user._id
    }, (response) => {
      setIsLoading(false);
      if (response.error) {
        Alert.alert("Lỗi", response.error);
      } else {
        Alert.alert("Thành công", "Đã chuyển tiếp tin nhắn");
        router.back(); // Quay lại màn hình trước
      }
    });
  };

  // Render each contact item
  const renderItem = ({ item }) => {
    const isSelected = selectedContacts.some((c) => c._id === item._id);
    const isGroup = item.name !== undefined; // Group has 'name', friend has 'username'

    return (
      <TouchableOpacity
        style={[styles.contactItem, isSelected && styles.selectedContact]}
        onPress={() => toggleContact(item)}
      >
        <Image
          source={{ uri: isGroup ? item.imageGroup : item.avatarURL }}
          style={styles.avatar}
        />
        <View style={styles.contactInfo}>
          <Text style={styles.contactName}>
            {isGroup ? item.name : item.username}
          </Text>
          {isGroup && (
            <Text style={styles.contactType}>
              {item.members.length} thành viên
            </Text>
          )}
        </View>

        {isSelected && (
          <View style={styles.checkmark}>
            <Text style={styles.checkmarkText}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Render section header
  const renderSectionHeader = ({ section }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{section.title}</Text>
    </View>
  );

  if (isLoading && !friends.length && !groups.length) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={appColors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {message && (
        <View style={styles.messagePreview}>
          <Text style={styles.messageText}>{message?.content}</Text>
        </View>
      )}

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm"
          placeholderTextColor= {appColors.placeholderTextColor}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No contacts found</Text>
          </View>
        }
      />

      {selectedContacts.length > 0 && (
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleForward}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.sendButtonText}>Chuyển đến</Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appColors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: appColors.error,
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: appColors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  messagePreview: {
    backgroundColor: appColors.messageBackground,
    padding: 15,
    margin: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: appColors.primary,
  },
  messageText: {
    fontSize: 16,
    color: appColors.text,
  },
  searchContainer: {
    padding: 10,
    backgroundColor: "white",
  },
  searchInput: {
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
    fontSize: 18,
  },
  listContent: {
    paddingBottom: 80,
  },
  sectionHeader: {
    backgroundColor: appColors.sectionHeader,
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  sectionHeaderText: {
    fontWeight: "600",
    color: appColors.sectionHeaderText,
    fontSize: 14,
    textTransform: "uppercase",
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "white",
    borderBottomColor: appColors.border,
  },
  selectedContact: {
    backgroundColor: appColors.selectedBackground,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: "500",
    color: appColors.text,
    marginBottom: 3,
  },
  contactType: {
    fontSize: 12,
    color: appColors.secondaryText,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: appColors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  checkmarkText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    color: appColors.secondaryText,
    fontSize: 16,
  },
  sendButton: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: appColors.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    elevation: 3,
  },
  sendButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ForwardMessage;
