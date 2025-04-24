import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Pressable,
  ScrollView,
  TouchableOpacity,
  TouchableHighlight,
  Image,
} from "react-native";
import { FontAwesome6, Ionicons, MaterialIcons } from "@expo/vector-icons";
import avatar from '../../assets/images/avatar.png';
import { router } from "expo-router";
import axios from "axios";
import axiosInstance from "../../utils/axiosInstance";
import { useSelector } from "react-redux";

const Friend = () => {

  const {accessToken, user} = useSelector(state => state.auth)

  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([])
  

  useEffect(() => {
    
    const fetchRequests = async () => {
      try {
        const response = await axiosInstance.get('/api/friend/friends', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const accepted = response.data.acceptedFriends || [];
        const pending = response.data.pendingRequests || [];
        setFriends(accepted);
        setRequests(pending)
      } catch (error) {
        console.error('Lỗi khi lấy lời mời:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

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

  const renderFriend = ({ item }) => {
    console.log("jkbkb: ", item);
    
    return (
      <TouchableOpacity onPress={() => router.push({
        pathname: "(main)/ChatScreen",
        params: {
          conversation: null,
          otherUser: JSON.stringify(item),
        },
      })} style={{ flexDirection: "row", alignItems: 'center', padding: 15, justifyContent: 'space-between' }}>
        <View style={styles.friendItem}>
          <View style={styles.avatar}>
            <Image source={{ uri: item.avatarURL }} style={styles.avatar} />
          </View>
          <Text style={styles.friendName}>{item.username}</Text>
        </View>
        <View style={{ flexDirection: "row", gap: 20 }}>
          <TouchableOpacity>
            <Ionicons name="call-outline" size={25}/>
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="videocam-outline" size={28}/>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <Pressable style={styles.item} onPress={() => router.push('/(contact)/NewFriend')}>
        <View style={styles.itemContent}>
          <View style={styles.itemImage}>
            <FontAwesome6 name="user-group" size={18} color="#fff" />
          </View>
          <View>
            <Text style={styles.itemName}>Lời mới kết bạn ({requests.length})</Text>
          </View>
        </View>
      </Pressable>
      <Pressable style={styles.item}>
        <View style={styles.itemContent}>
          <View style={styles.itemImage}>
            <FontAwesome6 name="id-badge" size={18} color="#fff" />
          </View>
          <View>
            <Text style={styles.itemName}>Danh bạ máy</Text>
            <Text style={styles.itemDescription}>Liên hệ có dùng zalo</Text>
          </View>
        </View>
      </Pressable>
      <Pressable style={styles.item}>
        <View style={styles.itemContent}>
          <View style={styles.itemImage}>
            <FontAwesome6 name="cake-candles" size={18} color="#fff" />
          </View>
          <View>
            <Text style={styles.itemName}>Sinh nhật</Text>
          </View>
        </View>
      </Pressable>

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
    justifyContent: "center",
    alignItems: "center"
  },
  friendName: {
    marginLeft: 10,
    fontSize: 18,
  },
});

export default Friend;
