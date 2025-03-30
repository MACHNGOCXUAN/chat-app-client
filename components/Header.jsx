import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, StatusBar, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

const Header = ({ title }) => {
  const [isFocus, setIsFocus] = useState(false);
  const [text, setText] = useState("");

  const isIOS = Platform.OS === "ios";

  return (
    <SafeAreaView edges={["top"]} className='bg-[#297EFF]'>
      <StatusBar
        backgroundColor="#297EFF"
        barStyle={isIOS ? "light-content" : "light-content"}
      />
      <View className={`flex-row items-center px-5 gap-5 ${isIOS?"py-3":'py-3'}`}>
        {isFocus ? (
          <TouchableOpacity
            onPress={() => {
              setIsFocus(false);
              setText("");
            }}
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
          onBlur={() => setIsFocus(false)}
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