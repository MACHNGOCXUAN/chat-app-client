import React from "react";
import { Tabs } from "expo-router";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import Header from "../../components/Header";
import { Text, View } from "react-native";

export default function Layout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Tin nhắn",
          tabBarIcon: ({ color }) => (
            <Ionicons name="chatbubble-outline" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="contact"
        options={{
          title: "Danh bạ",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="id-badge" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: "Khám phá",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="compass" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="timeLine"
        options={{
          title: "Nhật ký",
          tabBarIcon: ({ color }) => (
            <Ionicons name="time-outline" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Tôi",
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-outline" size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}