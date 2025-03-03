import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import { FontAwesome6, MaterialIcons } from '@expo/vector-icons'
import ButtonSheet from '../../components/ButtonSheet'

const Group = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOption, setSelectedOption] = useState('Hoạt động cuối');

  const groups = [
    { id: "1", name: "Nhom 1", icon: "user-group", message: "Mạch Ngoc Xuan" },
    { id: "2", name: "Danh bạ máy", icon: "id-badge", message: "Liên hệ có dùng Zalo" },
    { id: "3", name: "Sinh nhật", icon: "cake-candles", message: "Liên hệ có dùng Zalo" },
  ];

  const handleSelectOption = (option) => {
    setSelectedOption(option);
    setModalVisible(false);
  };

  const renderFeature = ({ item }) => (
    <Pressable style={styles.item}>
      <View style={styles.itemContent}>
        <View style={styles.itemImage}>
          <FontAwesome6 name={item.icon} size={18} color="#fff" />
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
      <View style={{ padding: 10, flexDirection: 'row', alignItems: 'center', gap: 15 }}>
        <View style={{ backgroundColor: '#DBEBFF', width: 45, height: 45, justifyContent: 'center', alignItems: 'center', borderRadius: 100 }} >
          <MaterialIcons name='group-add' size={20} color={"#297EFF"}/>
        </View>
        <Text style={{ color: '#297EFF', fontSize: 18 }}>Tạo nhóm</Text>
      </View>

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
    borderRadius: 100,
    backgroundColor: "#297EFF",
  },
  itemName: {
    fontSize: 17,
  },
  message: {
    fontSize: 15,
    color: "gray",
  },
})