import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Header from "../../components/Header";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import Friend from "../(contact)/Friend";
import Group from "../(contact)/Group";


const Tab = createMaterialTopTabNavigator();

const Contacts = () => {
  return (
    <>
      <Header/>
      <Tab.Navigator 
        lazy={true} // Chỉ tải tab khi người dùng nhấn vào
        removeClippedSubviews={true} // Giúp tiết kiệm bộ nhớ
        screenOptions={{
          tabBarLabelStyle: { fontSize: 16 },
          tabBarIndicatorStyle: { backgroundColor: "#007AFF", height: 2, borderRadius: 1 }
        }}
      >
        <Tab.Screen name="Bạn bè" component={Friend}/>
        <Tab.Screen name="Nhóm" component={Group}/>
      </Tab.Navigator>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    fontSize: 18
  },
});

export default Contacts;
