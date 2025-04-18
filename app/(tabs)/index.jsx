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
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
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

const message = ({ navigation }) => {
  const {accessToken, user} = useSelector(state => state.auth)
  const [groupName, setGroupName] = useState("");
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [conversation, setConversation] = useState([])

  const [isFocus, setIsFocus] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = (text) => {
    setSearchText(text);

    if (text.trim() === "") {
      setSearchResults([]);
      return;
    }

    const mockFriends = [
      {
        id: 1,
        name: "Nguyễn Văn A",
        phone: "0987654321",
        avatar: avatar,
        isFriend: true,
      },
      {
        id: 2,
        name: "Trần Thị B",
        phone: "0912345678",
        avatar: avatar,
        isFriend: false,
      },
    ];

    const mockGroups = [
      { id: 1, name: "Nhóm lớp học", members: 20 },
      { id: 2, name: "0912345678 đồng nghiệp", members: 15 },
    ];

    // Lọc kết quả phù hợp
    const filteredFriends = mockFriends.filter(
      (item) =>
        item.name.toLowerCase().includes(text.toLowerCase()) ||
        item.phone.includes(text)
    );

    const filteredGroups = mockGroups.filter((item) =>
      item.name.toLowerCase().includes(text.toLowerCase())
    );

    setSearchResults([
      ...filteredFriends.map((item) => ({ ...item, type: "friend" })),
      ...filteredGroups.map((item) => ({ ...item, type: "group" })),
    ]);
  };

  const route = useRoute();
  const setMemberCount = route.params?.setMemberCount;

  const allMembers = [
    { id: "1", name: "Người dùng 1", avatar: avatar, time: "10 giờ trước" },
    { id: "2", name: "Người dùng 2", avatar: avatar, time: "10 giờ trước" },
    { id: "3", name: "Người dùng 3", avatar: avatar, time: "10 giờ trước" },
    { id: "4", name: "Người dùng 3", avatar: avatar, time: "10 giờ trước" },
    { id: "5", name: "Người dùng 3", avatar: avatar, time: "10 giờ trước" },
    { id: "6", name: "Người dùng 3", avatar: avatar, time: "10 giờ trước" },
    { id: "7", name: "Người dùng 3", avatar: avatar, time: "10 giờ trước" },
    { id: "8", name: "Người dùng 3", avatar: avatar, time: "10 giờ trước" },
    { id: "9", name: "Người dùng 3", avatar: avatar, time: "10 giờ trước" },
    { id: "10", name: "Người dùng 3", avatar: avatar, time: "10 giờ trước" },
    { id: "11", name: "Người dùng 3", avatar: avatar, time: "10 giờ trước" },
  ];

  const toggleSelect = (contact) => {
    setSelectedContacts((prev) =>
      prev.some((c) => c.id === contact.id)
        ? prev.filter((c) => c.id !== contact.id)
        : [...prev, contact]
    );
  };

  const handleCreateGroup = () => {
    if (groupName.trim() === "") {
      alert("Vui lòng nhập tên nhóm");
      return;
    }
    if (selectedMembers.length === 0) {
      alert("Vui lòng chọn ít nhất một thành viên");
      return;
    }
    // navigation.goBack();
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  useEffect(() => {
    if (setMemberCount) {
      setMemberCount(selectedContacts.length);
    }
  }, [selectedContacts]);

  const inputRef = useRef(null);


  const fetchConversation = async () => {
    try {
      const response = await axiosInstance.get("/api/conversation/conversation", {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      if (response.data.success) {
        const accepted = response.data.data || [];
        setConversation(accepted);
        getOtherUser()
      } else {
        console.error("Request succeeded but API returned false:", response.data);
      }
    } catch (error) {
      console.error("Failed to fetch conversation:", error);
    }
  };



  useEffect(() => {
    fetchConversation();

    const handleConversationUpdate = (updatedConversation) => {
      setConversation(prev => {
        // Cập nhật conversation trong danh sách
        const updated = prev.map(conv => 
          conv._id === updatedConversation._id ? updatedConversation : conv
        );
        
        // Sắp xếp lại theo thời gian cập nhật
        return updated.sort((a, b) => 
          new Date(b.updatedAt) - new Date(a.updatedAt)
        );
      });
    };

    socket.on('conversation_updated', handleConversationUpdate);

    return () => {
      socket.off('conversation_updated', handleConversationUpdate);
    };
  }, [accessToken]);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to server");
    });
  }, []);

  const getOtherUser = (conversationItem) => {
    if (conversationItem?.type !== 'private') return null;
    
    const otherUser = conversationItem.members.find(
      member => member._id !== user._id
    );
    return otherUser || conversationItem.members[0];
  };
  
  

  return (
    <>
      <Header setIsFocus = {setIsFocus} isFocus = {isFocus} onSearch={handleSearch}/>
      <Container>
        <FlatList
          data={conversation}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => {

            const otherUser = getOtherUser(item)
            const lastMessageTime = item.lastMessage ? new Date(item.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

            return (
              <Card
                onPress={() => router.push({
                  pathname: "/(main)/ChatScreen",
                  params: { 
                    conversationId: item._id,
                    otherUser: JSON.stringify(otherUser) // Truyền thông tin người dùng khác
                  }
                })}
              >
                <UserInfo>
                  <UserImgWrapper>
                    <UserImg source={otherUser?.avatarURL ? { uri: otherUser.avatarURL } : require("../../assets/users/user-4.jpg") } />
                  </UserImgWrapper>
                  <TextSection>
                    <UserInfoText>
                      <UserName>{otherUser?.username}</UserName>
                      <PostTime>{lastMessageTime}</PostTime>
                    </UserInfoText>
                    <MessageText>
                      {item.lastMessage?.content || 'No messages yet'}
                    </MessageText>
                  </TextSection>
                </UserInfo>
              </Card>
            )
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
});
