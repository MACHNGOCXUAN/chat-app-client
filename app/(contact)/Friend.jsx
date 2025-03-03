import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Pressable,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { FontAwesome6, Ionicons, MaterialIcons } from "@expo/vector-icons";

const Friend = () => {
  const features = [
    { id: "1", name: "Lời mời kết bạn (13)", icon: "user-group" },
    { id: "2", name: "Danh bạ máy", icon: "id-badge", description: "Liên hệ có dùng Zalo" },
    { id: "3", name: "Sinh nhật", icon: "cake-candles" },
  ];

  const [friends, setFriends] = useState([
    { id: "101", name: "Nguyễn Văn A", avatar: "user" },
    { id: "102", name: "Trần Thị B", avatar: "user" },
    { id: "103", name: "Lê Minh C", avatar: "user" },
    { id: "104", name: "Phạm Hữu D", avatar: "user" },
    { id: "105", name: "Đặng Văn E", avatar: "user" },
    { id: "106", name: "Đặng Văn E", avatar: "user" },
    { id: "107", name: "Đặng Văn E", avatar: "user" },
    { id: "108", name: "Đặng Văn E", avatar: "user" },
    { id: "109", name: "Đặng Văn E", avatar: "user" },
  ]);

  const [active, setActive] = useState(0)

  const tabs = [
    { id: 0, label: 'Tất cả 80' },
    { id: 1, label: 'Mới truy cập 7' },
  ];

  const renderFeature = ({ item }) => (
    <Pressable style={styles.item}>
      <View style={styles.itemContent}>
        <View style={styles.itemImage}>
          <FontAwesome6 name={item.icon} size={18} color="#fff" />
        </View>
        <View>
          <Text style={styles.itemName}>{item.name}</Text>
          {item.description && <Text style={styles.itemDescription}>{item.description}</Text>}
        </View>
      </View>
    </Pressable>
  );

  const renderFriend = ({ item }) => (
    <View style={{ flexDirection: "row", alignItems: 'center', padding: 15, justifyContent: 'space-between' }}>
      <View style={styles.friendItem}>
        <View style={styles.avatar}>
          {item.avatar ? (
            <Image
              source={{uri: "https://yt3.ggpht.com/yti/ANjgQV_-ulcm3ayQp1BHT4huv8WIf5VP_FqS1s7z6xjyD1C6aQ=s88-c-k-c0x00ffffff-no-rj"}}
              style={styles.avatarImage}
            />
          ) : (
            <FontAwesome6 name="user" size={20} color="#fff" />
          )}
        </View>
        <Text style={styles.friendName}>{item.name}</Text>
      </View>
      <View style={{ flexDirection: "row", gap: 20 }}>
        <TouchableOpacity>
          <MaterialIcons name="call" size={25}/>
        </TouchableOpacity>
        <TouchableOpacity>
          <MaterialIcons name="videocam" size={28}/>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <FlatList
        data={features}
        keyExtractor={(item) => item.id}
        renderItem={renderFeature}
        scrollEnabled={false}
      />

      <View style={{ padding: 5, backgroundColor: "#f0f0f0" }}></View>

      <View style={styles.tabBar}>
        {
          tabs.map((tab)=>(
            <TouchableOpacity key={tab.id} activeOpacity={1} style={[
              styles.tabBarItem,
              active === tab.id && styles.selectedTabBarItem
            ]} 
            onPress={() => setActive(tab.id)}>
              <Text>{tab.label}</Text>
            </TouchableOpacity>
          ))
        }
      </View>

      <FlatList
        data={friends}
        keyExtractor={(item) => item.id}
        renderItem={renderFriend}
        scrollEnabled={false}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  searchBar: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    margin: 10,
    borderRadius: 10,
    fontSize: 16,
  },
  tabBar: {
    flexDirection: 'row',
    gap: 10,
    padding: 15,
    borderBottomWidth: 0.2
  },
  tabBarItem: {
    borderColor: "gray",
    borderWidth: 0.5,
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 10,
    color: "gray",
  },
  selectedTabBarItem: {
    backgroundColor: 'gray',
    opacity:0.7,
    color: '#333'
  },
  item: {
    padding: 15,
    height: 55,
    justifyContent: "center",
  },
  itemContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  itemImage: {
    width: 35,
    height: 35,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
    backgroundColor: "#297EFF",
  },
  itemName: {
    fontSize: 17,
  },
  itemDescription: {
    fontSize: 14,
    color: "gray",
  },
  friendItem: {
    flexDirection: "row",
    alignItems: "center"
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 100,
    backgroundColor: "#297EFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  friendName: {
    fontSize: 18,
  },
});

export default Friend;
