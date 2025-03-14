import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, Pressable, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import avatar from '../../assets/images/avatar.png'
import { useRoute } from '@react-navigation/native';

const CreateGroup = ({ navigation }) => {
  const [groupName, setGroupName] = useState('');
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const route = useRoute();
  const setMemberCount = route.params?.setMemberCount;  

  const allMembers = [
    { id: '1', name: 'Người dùng 1', avatar: avatar, time: '10 giờ trước' },
    { id: '2', name: 'Người dùng 2', avatar: avatar, time: '10 giờ trước' },
    { id: '3', name: 'Người dùng 3', avatar: avatar, time: '10 giờ trước' },
    { id: '4', name: 'Người dùng 3', avatar: avatar, time: '10 giờ trước' },
    { id: '5', name: 'Người dùng 3', avatar: avatar, time: '10 giờ trước' },
    { id: '6', name: 'Người dùng 3', avatar: avatar, time: '10 giờ trước' },
  ];

  const toggleSelect = (contact) => {
    setSelectedContacts((prev) =>
      prev.some((c) => c.id === contact.id)
        ? prev.filter((c) => c.id !== contact.id)
        : [...prev, contact]
    );
  };

  const handleCreateGroup = () => {
    if (groupName.trim() === '') {
      alert('Vui lòng nhập tên nhóm');
      return;
    }
    if (selectedMembers.length === 0) {
      alert('Vui lòng chọn ít nhất một thành viên');
      return;
    }
    navigation.goBack();
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  useEffect(() => {
    if (setMemberCount) {
      setMemberCount(selectedContacts.length);
    }
  }, [selectedContacts]);

  return (
    <View className='flex-1 relative'>
      <View className='p-5 flex-col gap-5'>
        <View className='flex flex-row items-center'>
          {
            selectedImage?(
              <Pressable onPress={pickImage} className='rounded-full'>
                <Image source={{ uri: selectedImage }} className='size-16 rounded-full'/>
              </Pressable>
            ):(
              <Pressable onPress={pickImage} className='bg-slate-400 opacity-45 rounded-full'>
                <Ionicons className='p-4' size={30} name='camera-outline'/>
              </Pressable>
            )
          }
          <View className='relative flex-1'>
            <TextInput
              className={`text-[20px] ml-4 leading-none py-2 pr-12 border-b-[1px] ${isFocused ? "border-[#0045AD]": "border-transparent"}`}
              placeholder="Đặt tên nhóm"
              value={groupName}
              onChangeText={setGroupName}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
            {
              isFocused && <Ionicons name='image-outline' size={25} className='absolute right-3 bottom-1 opacity-70'/>
            }
            
          </View>
          {
            isFocused && <Ionicons name='checkmark-outline' size={35} className='font-bold' color="#0045AD"/>
          }
        </View>

        <View className='relative'>
          <TextInput
            className='bg-[#ECF9F0] text-[18px] py-3 rounded-[10px] pl-12'
            placeholder="Tìm tên hoặc số điện thoại"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          <Ionicons name='search-outline' size={25} className='absolute top-1/2 -translate-y-1/2 left-2'/>
        </View>

        <FlatList
          data={allMembers.filter(member =>
            member.name.toLowerCase().includes(searchQuery.toLowerCase())
          )}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => toggleSelect(item)}
              className='h-[70px]'
            >
              <View className='flex-row gap-4 items-center'>
                <View className={`size-7 rounded-full border-[2px] border-[#ADD1FF] flex-row justify-center items-center ${selectedContacts.some(c => c.id === item.id)?"bg-blue-600":"bg-transparent"}`}>
                  {selectedContacts.some(c => c.id === item.id) && (
                    <Ionicons color="#fff" name='checkmark-outline'/>
                  )}
                </View>
                <Image source={item.avatar} className='size-16 rounded-full' />
                <View>
                  <Text className='text-[18px]'>{item.name}</Text>
                  <Text className='opacity-55 text-black'>{item.time}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>

      {selectedContacts.length > 0 && (
        <View className='bg-white absolute bottom-0 w-full flex-row items-center justify-between p-4'>
          <View className='flex-row'>
            {selectedContacts.map((contact) => (
              <View key={contact.id} className='pl-4 flex-row items-center justify-center'>
                <Image source={ contact.avatar} className='size-16 rounded-full' />
              </View>
            ))}
          </View>
          <Pressable className='bg-blue-700 p-3 rounded-full flex-row justify-center items-center'>
            <MaterialIcons name='send' size={25} color='#fff'/>
          </Pressable>
        </View>
      )}
    </View>
  );
};

export default CreateGroup;