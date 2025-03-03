import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, StatusBar, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const Header = ({ title }) => {

  const [isFocus, setIsFocus] = useState(false);
  const [text, setText] = useState("");

  return (
    <>
      <StatusBar backgroundColor="#297EFF" barStyle="light-content" />
      <View style={styles.headerContainer}>
        {
          isFocus?(
            <TouchableOpacity style={styles.searchIcon} onPress={()=>{
              setIsFocus(false)
              setText("")
            }}>
              <Ionicons name="chevron-back-outline" size={25} color="#fff" />
            </TouchableOpacity>
          ):(
            <TouchableOpacity style={styles.searchIcon} onPress={()=>setIsFocus(true)}>
              <Ionicons name="search-outline" size={25} color="#fff" />
            </TouchableOpacity>
          )
        }
        <TextInput
          placeholder={title || "Tìm kiếm..."}
          placeholderTextColor={isFocus?"#7DD49A":"#fff"}
          textAlignVertical="center"
          style={[
            styles.searchInput,
            { backgroundColor: isFocus?"#fff":"#297EFF" }
          ]}
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          value={text}
          onChangeText={(newText) => setText(newText)} 
        />
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="person-add-outline" size={25} color="#fff" />
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#297EFF",
    paddingHorizontal: 15,
    paddingVertical: 10,
    height: 60,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 17,
    color: "#333",
    borderRadius: 15,
    paddingHorizontal: 15,
    marginHorizontal: 5,
    paddingVertical: 10
  },
  iconButton: {
    marginLeft: 10,
  },
});

export default Header;
