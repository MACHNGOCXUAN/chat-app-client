import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, Pressable, StyleSheet, Image } from 'react-native';
import avatar from '../../assets/images/react-logo.png'; 

const CreateGroup = ({ navigation }) => {
  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Danh sách tất cả thành viên (ví dụ)
  const allMembers = [
    { id: '1', name: 'Người dùng 1', avatar: avatar },
    { id: '2', name: 'Người dùng 2', avatar: avatar },
    { id: '3', name: 'Người dùng 3', avatar: avatar },
  ];

  // Hàm thêm/xóa thành viên
  const toggleMember = (member) => {
    if (selectedMembers.some(m => m.id === member.id)) {
      setSelectedMembers(selectedMembers.filter(m => m.id !== member.id));
    } else {
      setSelectedMembers([...selectedMembers, member]);
    }
  };

  // Hàm tạo nhóm
  const handleCreateGroup = () => {
    if (groupName.trim() === '') {
      alert('Vui lòng nhập tên nhóm');
      return;
    }
    if (selectedMembers.length === 0) {
      alert('Vui lòng chọn ít nhất một thành viên');
      return;
    }
    // Xử lý tạo nhóm (ví dụ: gọi API)
    console.log('Tạo nhóm:', { groupName, selectedMembers });
    navigation.goBack(); // Quay lại màn hình trước
  };

  return (
    <View style={styles.container}>
      {/* Ô nhập tên nhóm */}
      <TextInput
        style={styles.groupNameInput}
        placeholder="Nhập tên nhóm"
        value={groupName}
        onChangeText={setGroupName}
      />

      {/* Danh sách thành viên được chọn */}
      <FlatList
        horizontal
        data={selectedMembers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.selectedMember}>
            <Image source={item.avatar} style={styles.avatar} />
            <Text style={styles.memberName}>{item.name}</Text>
          </View>
        )}
        contentContainerStyle={styles.selectedMembersList}
      />

      {/* Ô tìm kiếm thành viên */}
      <TextInput
        style={styles.searchInput}
        placeholder="Tìm kiếm thành viên"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Danh sách tất cả thành viên */}
      <FlatList
        data={allMembers.filter(member =>
          member.name.toLowerCase().includes(searchQuery.toLowerCase())
        )}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable style={styles.memberItem} onPress={() => toggleMember(item)}>
            <Image source={item.avatar} style={styles.avatar} />
            <Text style={styles.memberName}>{item.name}</Text>
            {selectedMembers.some(m => m.id === item.id) && (
              <Text style={styles.checkmark}>✓</Text>
            )}
          </Pressable>
        )}
      />

      {/* Nút tạo nhóm */}
      <Pressable style={styles.createButton} onPress={handleCreateGroup}>
        <Text style={styles.createButtonText}>Tạo nhóm</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  groupNameInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 16,
  },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 16,
  },
  selectedMembersList: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  selectedMember: {
    alignItems: 'center',
    marginRight: 10,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  memberName: {
    fontSize: 16,
  },
  checkmark: {
    marginLeft: 'auto',
    fontSize: 16,
    color: '#297EFF',
  },
  createButton: {
    backgroundColor: '#297EFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default CreateGroup;