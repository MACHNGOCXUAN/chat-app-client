import { FlatList, Pressable, ScrollView, StyleSheet, Text, View, Image } from 'react-native';
import React, { useState } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import ButtonSheet from '../../components/ButtonSheet';
import avatar from '../../assets/images/avatar.png'; 
import { router, useNavigation } from 'expo-router';

const Group = () => {
  const navigation = useNavigation();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOption, setSelectedOption] = useState('Hoạt động cuối');

  const groups = [
    { id: "1", name: "Nhom 1", image: avatar, message: "Mạch Ngoc Xuan" },
    { id: "2", name: "Danh bạ máy", image: avatar, message: "Liên hệ có dùng Zalo" },
    { id: "3", name: "Sinh nhật", image: avatar, message: "Liên hệ có dùng Zalo" },
  ];

  const handleSelectOption = (option) => {
    setSelectedOption(option);
    setModalVisible(false);
  };

  const renderFeature = ({ item }) => (
    <Pressable style={styles.item}>
      <View style={styles.itemContent}>
        <View style={styles.itemImage}>
          <Image source={item.image} style={styles.image} />
        </View>
        <View>
          <Text style={styles.itemName}>{item.name}</Text>
          {item.message && <Text style={styles.message}>{item.message}</Text>}
        </View>
        <Text style={{textAlign: 'right', flex: 1, marginRight: 10}}>3 giờ</Text>
      </View>
    </Pressable>
  );

  return (
    <ScrollView style={styles.container}>
      <Pressable onPress={() => router.push("/(contact)/CreateGroup")} style={{ padding: 10, flexDirection: 'row', alignItems: 'center', gap: 15 }}>
        <View style={{ backgroundColor: '#DBEBFF', width: 45, height: 45, justifyContent: 'center', alignItems: 'center', borderRadius: 100 }} >
          <MaterialIcons name='group-add' size={20} color={"#297EFF"}/>
        </View>
        <Text style={{ color: '#297EFF', fontSize: 18 }}>Tạo nhóm</Text>
      </Pressable>

      <View style={{ padding: 3, backgroundColor: "#f0f0f0" }}></View>

      <View style={{ flexDirection: 'row', paddingHorizontal: 15, paddingVertical: 10, justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontSize: 15 }}>Nhóm đang tham gia (100)</Text>
        <Pressable style={{ flexDirection:'row', alignItems: 'center', gap: 4 }} onPress={() => setModalVisible(true)}>
          <MaterialIcons name='sync' size={15}/>
          <Text style={{ fontSize: 15 }}>{selectedOption}</Text>
        </Pressable>
      </View>

      <FlatList
        data={groups}
        keyExtractor={(item) => item.id}
        renderItem={renderFeature}
        scrollEnabled={false}
      />

      <ButtonSheet visible={modalVisible} onClose={() => setModalVisible(false)} onSelect={handleSelectOption}/>
    </ScrollView>
  )
}

export default Group

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  item: {
    marginTop: 10,
    paddingHorizontal: 10,
    height: 55,
    justifyContent: "center",
  },
  itemContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  itemImage: {
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 100
  },
  image: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  itemName: {
    fontSize: 17,
  },
  message: {
    fontSize: 15,
    color: "gray",
  },
});