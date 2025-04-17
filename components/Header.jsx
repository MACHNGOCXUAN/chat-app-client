import React, { useEffect, useState } from "react";
import { View, TextInput, TouchableOpacity, StatusBar, StyleSheet, Platform, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

const Header = ({ title, setIsFocus, isFocus, onSearch  }) => {
  // const [isFocus, setIsFocus] = useState(false);
  const [text, setText] = useState("");

  const isIOS = Platform.OS === "ios";

  useEffect(() => {
    const isPhoneNumber = /^\d{10}$/.test(text);
  
    if (isPhoneNumber && isFocus) {
      onSearch(text);
      return;
    }
  
    const timer = setTimeout(() => {
      if (text.trim() !== "" && isFocus) {
        onSearch(text);
      } else {
        onSearch("");
      }
    }, 300);
  
    return () => clearTimeout(timer);
  }, [text, isFocus]);
  
  

  const handleBackPress = () => {
    setIsFocus(false);
    setText("");
    onSearch(""); // Reset kết quả tìm kiếm khi đóng tìm kiếm
  };

  return (
    <SafeAreaView edges={["top"]} className='bg-[#297EFF]'>
      <StatusBar
        backgroundColor="#297EFF"
        barStyle={isIOS ? "light-content" : "light-content"}
      />
      <View className={`flex-row items-center px-5 gap-5 ${isIOS?"py-3":'py-3'}`}>
        {isFocus ? (
          <TouchableOpacity
            onPress={handleBackPress}
          >
            <Ionicons name="chevron-back-outline" size={25} color="#fff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => setIsFocus(true)}
          >
            <Ionicons name="search-outline" size={25} color="#fff" />
          </TouchableOpacity>
        )}
        <TextInput
          placeholder={title || "Tìm kiếm..."}
          placeholderTextColor={isFocus ? "#7DD49A" : "#fff"}
          textAlignVertical="center"
          className = {`flex-1 py-2 px-4 text-[18px] rounded-[10px] ${isFocus?"bg-white":"bg-transparent"}`}
          onFocus={() => setIsFocus(true)}
          value={text}
          onChangeText={(newText) => setText(newText)}
        />
        <TouchableOpacity onPress={() => router.push("/(contact)/AddFriend")}>
          <Ionicons name="person-add-outline" size={25} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Header;