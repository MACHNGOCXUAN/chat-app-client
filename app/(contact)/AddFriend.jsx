import { Pressable, Text, TextInput, View } from 'react-native'
import React, { Component } from 'react'
import { MaterialIcons } from '@expo/vector-icons'

export class AddFriend extends Component {
  render() {
    return (
      <View className='p-5'>
        <View className='flex-row items-center gap-5'>
          <TextInput placeholder='Nhập số điện thoại' className='border-2 rounded-[5px] px-5 text-[18px] flex-1'/>
          <Pressable className='bg-blue-700 p-3 rounded-full'>
            <MaterialIcons color='#fff' onPress={() => navigation.goBack()} name="west" size={25}/>
          </Pressable>
        </View>
      </View>
    )
  }
}

export default AddFriend