import { View, Text, Image, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import React, { useEffect, useState } from 'react'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
import { useSelector } from 'react-redux';
import axiosInstance from '../../utils/axiosInstance';


const ReceivedRequests = () => {
  // Dữ liệu mẫu - thay bằng API thực tế sau
  const {accessToken, user} = useSelector(state => state.auth)
  const [requests, setRequests] = useState([])
  // const [requests, setRequests] = useState([
  //   {
  //     id: '1',
  //     name: 'Nguyễn Văn A',
  //     avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
  //     mutualFriends: 5,
  //   },
  //   {
  //     id: '2',
  //     name: 'Trần Thị B',
  //     avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
  //     mutualFriends: 2,
  //   },
  //   {
  //     id: '3',
  //     name: 'Lê Văn C',
  //     avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
  //     mutualFriends: 8,
  //   },
  // ]);

  useEffect(() => {
    
    const fetchRequests = async () => {
      try {
        const response = await axiosInstance.get('/api/friend/friends', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const pending = response.data.pendingRequests || [];
        setRequests(pending);
      } catch (error) {
        console.error('Lỗi khi lấy lời mời:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleAccept = async (receiverPhone, id) => {
    try {
      const response = await axiosInstance.post("/api/friend/accept", {
        senderPhone: receiverPhone,
        receiverPhone: user.phoneNumber
      })

      const data = await response.data;
      
      if (data.success) {
        setRequests(prev => prev.filter(request => request._id !== id));
      } else {
        console.warn('Lỗi:', data.message);
      }
    } catch (error) {
      console.error('Lỗi khi chấp nhận yêu cầu:', error);
    }
  };

  const handleDecline = (id) => {
    // Gọi API từ chối ở đây
    setRequests(requests.filter(request => request.id !== id));
  };

  if (requests.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Không có yêu cầu kết bạn nào</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={requests}
      keyExtractor={(item) => item._id}
      contentContainerStyle={styles.listContainer}
      renderItem={({ item }) => (
        <View style={styles.requestItem}>
          <Image source={{ uri: item.avatarURL}} style={styles.avatar} />
          
          <View className="flex flex-col">
            <Text style={styles.name}>{item.username}</Text>
            <View className = "flex flex-row gap-2">
              <TouchableOpacity 
                style={[styles.button, styles.acceptButton]}
                onPress={() => handleAccept(item.phoneNumber, item._id)}
              >
                <Text style={styles.buttonText}>Chấp nhận</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.button, styles.declineButton]}
                onPress={() => handleDecline(item._id)}
              >
                <Text style={styles.buttonText}>Từ chối</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    />
  );
};

const SentRequests = () => (
  <View style={styles.tabContent}>
    <Text>Danh sách lời mời đã gửi</Text>
    {/* Thêm logic và UI cho lời mời đã gửi ở đây */}
  </View>
)

// Tạo top tab navigator
const Tab = createMaterialTopTabNavigator()

class NewFriend extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <Tab.Navigator
          screenOptions={{
            tabBarLabelStyle: { fontSize: 14, fontWeight: 'bold' },
            tabBarIndicatorStyle: { backgroundColor: '#007AFF', height: 3 },
            tabBarStyle: { backgroundColor: 'white' },
          }}
        >
          <Tab.Screen 
            name="Received" 
            component={ReceivedRequests} 
            options={{ tabBarLabel: 'Đã nhận' }} 
          />
          <Tab.Screen 
            name="Sent" 
            component={SentRequests} 
            options={{ tabBarLabel: 'Đã gửi' }} 
          />
        </Tab.Navigator>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  tabContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  listContainer: {
    padding: 10,
  },
  requestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  infoContainer: {
    display: "flex",
    flexDirection: "row"
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  mutualFriends: {
    fontSize: 14,
    color: '#666',
  },
  actionsContainer: {
    flexDirection: 'row',
    marginLeft: 10,
  },
  button: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptButton: {
    backgroundColor: '#1877F2',
  },
  declineButton: {
    backgroundColor: '#e4e6eb',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
})

export default NewFriend