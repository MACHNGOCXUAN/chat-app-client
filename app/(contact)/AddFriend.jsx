import { Pressable, ScrollView, Text, TextInput, TouchableHighlight, View } from 'react-native'
import React, { Component, useState } from 'react'
import { MaterialIcons } from '@expo/vector-icons'
import QRCode from 'react-native-qrcode-svg'
import { router } from 'expo-router';
import { appColors } from '../../constants/appColor';


const AddFriend = () =>  {
  const [phone, setPhone] = useState("");
  const userId = "123456";

  const handlePress = () => {
    router.push("/(contact)/QRScanner")
  };


  return (
    <ScrollView className='bg-[#ddd] flex-col gap-5'>
      <View className='w-full h-[350px] flex justify-center items-center'>
        <View className='w-[250px] h-[250px] bg-slate-400 rounded-lg flex flex-col items-center justify-center gap-4'>
          <Text className='font-bold text-[18px] text-[#fff]'>Mạch Xuân</Text>
          <View className='p-2 bg-white rounded-md'>
            <QRCode value={userId} size={130} className='p-2 border-2'/>
          </View>
          <Text className='text-gray-800'>Quét mã để kết bạn với tôi</Text>
        </View>
      </View>
      <View className='flex-col bg-white'>
        <View className='px-5 flex-row items-center gap-5 py-5'>
          <TextInput 
            placeholder='Nhập số điện thoại' 
            placeholderTextColor= {appColors.placeholderTextColor}
            className='border-[1px] border-[#888] rounded-[5px] p-3 text-[18px] flex-1'
            keyboardType='numeric'
            value={phone}
            onChangeText={setPhone}

          />
          <Pressable className={`p-3 bg-blue-700 rounded-full ${phone?"opacity-100":"opacity-50"}`}>
            <MaterialIcons color='#fff' onPress={()=>alert("k")} name="arrow-right-alt" size={25}/>
          </Pressable>
        </View>
        <TouchableHighlight 
          onPress={handlePress}
          className='p-5 px-5 rounded-[5px] border-t-[1px] border-[#ddd]'
          underlayColor="#ddd"
        >
          <View className='flex-row gap-5 items-center'>
            <MaterialIcons name="qr-code-scanner" size={25} color='#507FB4'/>
            <Text className='text-[18px]'>Quét mã QR</Text>
          </View>
        </TouchableHighlight>
      </View>
      <View className='flex-col bg-white mt-5'>
        <TouchableHighlight 
          onPress={() => console.log("xuan")}
          className='p-5 px-5 rounded-[5px] border-t-[1px] border-[#ddd]'
          underlayColor="#ddd"
        >
          <View className='flex-row gap-5 items-center'>
            <MaterialIcons name="qr-code-scanner" size={25} color='#507FB4'/>
            <Text className='text-[18px]'>Quét mã QR</Text>
          </View>
        </TouchableHighlight>
        <TouchableHighlight 
          onPress={() => console.log("xuan")}
          className='p-5 px-5 rounded-[5px] border-t-[1px] border-[#ddd]'
          underlayColor="#ddd"
        >
          <View className='flex-row gap-5 items-center'>
            <MaterialIcons name="qr-code-scanner" size={25} color='#507FB4'/>
            <Text className='text-[18px]'>Quét mã QR</Text>
          </View>
        </TouchableHighlight>
      </View>
    </ScrollView>
  )
}

export default AddFriend