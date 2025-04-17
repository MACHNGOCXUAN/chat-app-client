import React, {useState, useEffect, useCallback} from 'react';
import {View, ScrollView, Text, Button, StyleSheet, SafeAreaView} from 'react-native';
import InputSend from '../../components/InputSend';
import MessageSection from '../../components/MessageSection';

const ChatScreen = () => {

  return (
    <SafeAreaView className = 'h-full w-full'>
      <ScrollView className = 'p-1 flex-1'>
        <MessageSection/>
      </ScrollView>
      <InputSend/>
    </SafeAreaView>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
