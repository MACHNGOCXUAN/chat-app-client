import React, { useState } from "react";
import { View, Text, StyleSheet, Platform, TouchableOpacity, FlatList, Image } from "react-native";
import Header from "../../components/Header";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import Friend from "../(contact)/Friend";
import Group from "../(contact)/Group";
import avatar from '../../assets/images/avatar.png';
import { Ionicons } from "@expo/vector-icons";


const Tab = createMaterialTopTabNavigator();

const isIOS = Platform.OS === "ios";

const Contacts = () => {
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
      { id: 1, name: "Nguyễn Văn A", phone: "0987654321", avatar: avatar, isFriend: true },
      { id: 2, name: "Trần Thị B", phone: "0912345678", avatar: avatar, isFriend: false },
    ];
    
    const mockGroups = [
      { id: 1, name: "Nhóm lớp học", members: 20 },
      { id: 2, name: "0912345678 đồng nghiệp", members: 15 },
    ];

    // Lọc kết quả phù hợp
    const filteredFriends = mockFriends.filter(item => 
      item.name.toLowerCase().includes(text.toLowerCase()) || 
      item.phone.includes(text)
    );
    
    const filteredGroups = mockGroups.filter(item => 
      item.name.toLowerCase().includes(text.toLowerCase())
    );

    setSearchResults([
      ...filteredFriends.map(item => ({ ...item, type: 'friend' })),
      ...filteredGroups.map(item => ({ ...item, type: 'group' }))
    ]);
  };

  const renderSearchItem = ({ item }) => {
    if(item.type == "friend") {
      return (
        <TouchableOpacity style={{ flexDirection: "row", alignItems: 'center', padding: 15, justifyContent: 'space-between' }}>
          <View style={styles.friendItem} className = "flex flex-row gap-5">
            <View style={styles.avatar}>
              <Image source={item.avatar} style={styles.avatar} />
            </View>
            <View>
              <Text className="text-lg font-semibold">{item.name}</Text>
              <Text className="text-gray-600">{item.phone}</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: 20 }}>
            {item.isFriend ? (
              <TouchableOpacity>
                <Ionicons name="call-outline" size={25}/>
              </TouchableOpacity>
            ) : (
              <Text className="text-blue-500">Kết bạn</Text>
            )}
          </View>
        </TouchableOpacity>
      )
    } else {
      return (
        <View className="p-3 border-b border-gray-200">
          <Text className="text-lg font-semibold">{item.name}</Text>
          <Text className="text-gray-600">{item.members} thành viên</Text>
        </View>
      );
    }
  }


  // const renderSearchItem = ({ item }) => {
  //   if (item.type === 'friend') {
  //     return (
  //       <View className="p-3 border-b border-gray-200">
  //         <Text className="text-lg font-semibold">{item.name}</Text>
  //         <Text className="text-gray-600">{item.phone}</Text>
  //         {item.isFriend ? (
  //           <Text className="text-green-500">Bạn bè</Text>
  //         ) : (
  //           <Text className="text-blue-500">Thêm bạn bè</Text>
  //         )}
  //       </View>
  //     );
  //   } else {
  //     return (
  //       <View className="p-3 border-b border-gray-200">
  //         <Text className="text-lg font-semibold">{item.name}</Text>
  //         <Text className="text-gray-600">{item.members} thành viên</Text>
  //       </View>
  //     );
  //   }
  // };

  return (
    <>
      <Header setIsFocus = {setIsFocus} isFocus = {isFocus} onSearch={handleSearch}/>
      <Tab.Navigator 
        lazy={true} // Chỉ tải tab khi người dùng nhấn vào
        removeClippedSubviews={true} // Giúp tiết kiệm bộ nhớ
        screenOptions={{
          tabBarLabelStyle: { fontSize: 16 },
          tabBarIndicatorStyle: { backgroundColor: "#007AFF", height: 2, borderRadius: 1 }
        }}
      >
        <Tab.Screen name="Bạn bè" component={Friend}/>
        <Tab.Screen name="Nhóm" component={Group}/>
      </Tab.Navigator>

      {isFocus && (
        <View className={`px-5 pb-3 flex-1 bg-white absolute left-0 right-0 bottom-0 ${isIOS ? "top-28" : "top-16"}`}>
          {searchText ? (
            searchResults.length > 0 ? (
              <FlatList
                data={searchResults}
                renderItem={renderSearchItem}
                keyExtractor={(item) => `${item.type}-${item.id}`}
                className="mt-2"
              />
            ) : (
              <Text className="text-gray-500 mt-4 text-center">Không tìm thấy kết quả</Text>
            )
          ) : (
            <View className="mt-4">
              <Text className="text-gray-700 font-semibold">Gợi ý tìm kiếm</Text>
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

const styles = StyleSheet.create({
  container: {
    fontSize: 18
  },
  friendItem: {
    flexDirection: "row",
    alignItems: "center"
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center"
  },

});

export default Contacts;
