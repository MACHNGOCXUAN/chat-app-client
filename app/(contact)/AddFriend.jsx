import { Pressable, ScrollView, Text, TextInput, TouchableHighlight, View } from 'react-native'
import React, { useState } from 'react'
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons'
import QRCode from 'react-native-qrcode-svg'
import { router } from 'expo-router';
import { appColors } from '../../constants/appColor';

const AddFriend = () => {
  const [phone, setPhone] = useState("");
  const userId = "123456";

  const handlePress = () => {
    router.push("/(contact)/QRScanner")
  };

  return (
    <View className='flex-1 bg-white'>

      <ScrollView className='flex-1'>
        {/* QR Code Section */}
        <View className='items-center py-6 bg-gray-50'>
          <View className='w-[200px] h-[200px] bg-white rounded-lg p-4 shadow-sm'>
            <QRCode value={userId} size={160} />
          </View>
          <Text className='mt-4 text-gray-600'>Quét mã để kết bạn với tôi</Text>
        </View>

        {/* Search by Phone */}
        <View className='px-4 py-3 border-b border-gray-100'>
          <View className='flex-row items-center bg-gray-50 rounded-lg px-3'>
            <MaterialIcons name="search" size={24} color={appColors.placeholderTextColor} />
            <TextInput
              placeholder='Tìm kiếm theo số điện thoại'
              placeholderTextColor={appColors.placeholderTextColor}
              className='flex-1 p-3 text-base'
              keyboardType='numeric'
              value={phone}
              onChangeText={setPhone}
            />
          </View>
        </View>

        {/* Menu Items */}
        <View className='mt-4'>
          <TouchableHighlight
            onPress={handlePress}
            underlayColor="#f5f5f5"
          >
            <View className='flex-row items-center px-4 py-3 border-b border-gray-100'>
              <View className='w-10 h-10 bg-blue-100 rounded-full items-center justify-center'>
                <MaterialIcons name="qr-code-scanner" size={20} color={appColors.primary} />
              </View>
              <Text className='ml-4 text-base'>Quét mã QR</Text>
            </View>
          </TouchableHighlight>

          <TouchableHighlight
            onPress={() => console.log("From Contacts")}
            underlayColor="#f5f5f5"
          >
            <View className='flex-row items-center px-4 py-3 border-b border-gray-100'>
              <View className='w-10 h-10 bg-green-100 rounded-full items-center justify-center'>
                <MaterialIcons name="contacts" size={20} color="#4CAF50" />
              </View>
              <Text className='ml-4 text-base'>Từ danh bạ</Text>
            </View>
          </TouchableHighlight>

          <TouchableHighlight
            onPress={() => console.log("From Facebook")}
            underlayColor="#f5f5f5"
          >
            <View className='flex-row items-center px-4 py-3 border-b border-gray-100'>
              <View className='w-10 h-10 bg-blue-100 rounded-full items-center justify-center'>
                <FontAwesome5 name="facebook" size={20} color="#1877F2" />
              </View>
              <Text className='ml-4 text-base'>Từ Facebook</Text>
            </View>
          </TouchableHighlight>
        </View>
      </ScrollView>
    </View>
  )
}

export default AddFriend