import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import axiosInstance from "../../utils/axiosInstance";
import socket from "../../utils/socket";
import { router } from "expo-router";
import avatar from "../../assets/images/avatar.png";

const CreateGroup = () => {
  const [groupName, setGroupName] = useState("");
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [members, setMembers] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const { accessToken, user } = useSelector((state) => state.auth);
  const navigation = useNavigation();
  const route = useRoute();
  const setMemberCount = route.params?.setMemberCount;
  const inputRef = useRef(null);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await axiosInstance.get("/api/friend/friends", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const accepted = response.data.acceptedFriends || [];
        const formattedMembers = accepted.map((friend, index) => ({
          _id: friend._id || `temp-id-${index}`,
          username: friend.username,
          avatarURL: friend.avatarURL ? { uri: friend.avatarURL } : avatar,
          uniqueId: `friend-${index}-${Date.now()}`
        }));
        setMembers(formattedMembers);
      } catch (error) {
        console.error("Error fetching friends:", error);
        Alert.alert("Error", "Could not fetch friends list");
      }
    };

    fetchFriends();

    // Socket listeners

    socket.on("group_created", (conversation) => {
      setIsCreating(false);
      router.push({
        pathname: "/(main)/ChatScreen",
        params: {
          conversation: JSON.stringify(conversation)
        }
      })
    });

    socket.on("friend_request_accepted", () => {
      fetchFriends()
    })

    socket.on("error", (error) => {
      setIsCreating(false);
      Alert.alert("Error", error.message || "Failed to create group");
    });

    return () => {
      socket.off("group_created");
      socket.off("error");
    };
  }, [accessToken, navigation]);

  const toggleSelect = (contact) => {
    setSelectedContacts((prev) =>
      prev.some((c) => c.uniqueId === contact.uniqueId)
        ? prev.filter((c) => c.uniqueId !== contact.uniqueId)
        : [...prev, contact]
    );
  };

  const handleCreateGroup = async () => {
    if (isCreating) return;

    if (!groupName.trim()) {
      Alert.alert("Error", "Please enter group name");
      return;
    }

    if (selectedContacts.length === 0) {
      Alert.alert("Error", "Please select at least one member");
      return;
    }

    setIsCreating(true);
    const memberIds = selectedContacts.map((contact) => contact._id.startsWith('temp-id-') ? null : contact._id).filter(Boolean);

    try {
      if (selectedImage) {
        const uriParts = selectedImage.split(".");
        const fileType = uriParts[uriParts.length - 1];

        const formData = new FormData();
        formData.append("avatarURL", {
          uri: selectedImage,
          name: `group_avatar.${fileType}`,
          type: `image/${fileType}`,
        });

        const uploadResponse = await axiosInstance.post(
          "/api/message/uploadimage",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (uploadResponse.data.success) {
          socket.emit("create_group", {
            creatorId: user._id,
            name: groupName.trim(),
            imageGroup: uploadResponse.data.data,
            members: memberIds,
          });
        }
      } else {
        socket.emit("create_group", {
          creatorId: user._id,
          name: groupName.trim(),
          members: memberIds,
        });
      }
    } catch (error) {
      setIsCreating(false);
      console.error("Error:", error);
      Alert.alert("Error", "Failed to create group");
    }
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert("Permission required", "Need camera roll permission to select images");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  useEffect(() => {
    if (setMemberCount) {
      setMemberCount(selectedContacts.length);
    }
  }, [selectedContacts, setMemberCount]);

  const filteredMembers = members.filter((member) =>
    member.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View className="flex-1 relative bg-white">
      <View className="p-5 flex-col gap-5">
        <View className="flex flex-row items-center gap-4">
          <Pressable onPress={pickImage}>
            {selectedImage ? (
              <Image
                source={{ uri: selectedImage }}
                className="w-16 h-16 rounded-full"
              />
            ) : (
              <View className="bg-gray-200 w-16 h-16 rounded-full justify-center items-center">
                <Ionicons name="camera-outline" size={24} color="#666" />
              </View>
            )}
          </Pressable>

          <View className="flex-1">
            <TextInput
              ref={inputRef}
              className={`text-xl py-2 border-b ${isFocused ? "border-blue-500" : "border-gray-300"}`}
              placeholder="Group name"
              placeholderTextColor="#888"
              value={groupName}
              onChangeText={setGroupName}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
          </View>
        </View>

        <View className="relative">
          <TextInput
            className="bg-gray-100 text-lg border border-gray-300 py-2 rounded-lg pl-12"
            placeholder="Search friends"
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <Ionicons
            name="search-outline"
            size={24}
            color="#888"
            style={{ position: "absolute", left: 12, top: 12 }}
          />
        </View>

        <FlatList
          data={filteredMembers}
          keyExtractor={(item, index) => `member-${item._id}-${index}`}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => toggleSelect(item)}
              className="h-16 flex-row items-center my-1"
            >
              <View className={`w-7 h-7 rounded-full border-2 border-blue-200 mr-3 justify-center items-center ${selectedContacts.some((c) => c.uniqueId === item.uniqueId) ? "bg-blue-500" : "bg-transparent"
                }`}>
                {selectedContacts.some((c) => c.uniqueId === item.uniqueId) && (
                  <Ionicons name="checkmark" size={16} color="white" />
                )}
              </View>
              <Image source={item.avatarURL} className="w-12 h-12 rounded-full mr-3" />
              <Text className="text-lg">{item.username}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text className="text-center text-gray-500 mt-10">No friends found</Text>
          }
        />
      </View>

      {selectedContacts.length > 0 && (
        <View className="absolute bottom-0 left-0 right-0 bg-white p-4 border-t border-gray-200 flex-row items-center">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-1 mr-3"
          >
            {selectedContacts.map((contact, index) => (
              <View key={contact.uniqueId || `selected-${index}`} className="mr-2">
                <Image
                  source={contact.avatarURL}
                  className="w-12 h-12 rounded-full"
                />
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity
            onPress={handleCreateGroup}
            disabled={isCreating}
            className="bg-blue-600 p-3 rounded-full"
          >
            <MaterialIcons
              name="send"
              size={24}
              color="white"
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default CreateGroup;