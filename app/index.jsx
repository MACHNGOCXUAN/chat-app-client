import { Dimensions, FlatList, Image, StyleSheet, Text, TouchableHighlight, View } from 'react-native';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import slider1 from '../assets/images/slider1.png';
import slider2 from '../assets/images/slider2.png';
import { router } from 'expo-router';
import { appColors } from '../constants/appColor';

const WelcomeScreen = () => {
  const screenWidth = Dimensions.get("window").width;
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef(null);
  const autoScrollInterval = useRef(null);

  const images = [
    {
      id: 1,
      image: slider1,
      name: "Gửi ảnh nhanh chóng",
      description: "Trao đổi hình ảnh chất lượng cao với bạn bè và người thân một cách dễ dàng"
    },
    {
      id: 2,
      image: slider2,
      name: "Chat nhóm tiện ích",
      description: "Nơi cùng nhau trao đổi, giữ liên lạc với gia đình bạn bè, đồng nghiệp..."
    }
  ];

  // Hàm scroll đến index với xử lý lỗi
  const scrollToIndex = useCallback((index) => {
    if (!flatListRef.current || index < 0 || index >= images.length) return;

    try {
      flatListRef.current.scrollToIndex({
        index,
        animated: true,
      });
      setActiveIndex(index);
    } catch (error) {
      console.warn("Scroll error:", error);
      flatListRef.current.scrollToOffset({
        offset: index * screenWidth,
        animated: true,
      });
    }
  }, [images.length, screenWidth]);

  // Tự động chuyển slide
  useEffect(() => {
    if (images.length <= 1) return;

    autoScrollInterval.current = setInterval(() => {
      const nextIndex = (activeIndex + 1) % images.length;
      scrollToIndex(nextIndex);
    }, 2000);

    return () => {
      if (autoScrollInterval.current) {
        clearInterval(autoScrollInterval.current);
      }
    };
  }, [activeIndex, images.length, scrollToIndex]);

  // Xử lý khi scroll kết thúc
  const handleScrollEnd = (event) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffset / screenWidth);

    if (currentIndex >= 0 && currentIndex < images.length) {
      setActiveIndex(currentIndex);
    }
  };

  // Render từng slide
  const renderItem = useCallback(({ item }) => {
    return (
      <View style={{ width: screenWidth }} className="flex flex-col gap-5 items-center">
        <Image
          style={{ height: 200, width: '100%' }}
          source={item.image}
          resizeMode="contain"
        />
        <View className="px-10">
          <Text className="font-bold text-[18px] text-center">{item.name}</Text>
          <Text className="text-center">{item.description}</Text>
        </View>
      </View>
    );
  }, [screenWidth]);

  // Render indicator dots
  const renderDots = () => {
    return images.map((_, index) => (
      <View
        key={`dot-${index}`}
        className={`w-2 h-2 rounded-full mx-1 ${activeIndex === index ? 'bg-blue-600' : 'bg-slate-400'}`}
      />
    ));
  };

  if (images.length === 0) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>No images available</Text>
      </View>
    );
  }

  return (
    <View className="flex-col justify-around" style={{ flex: 1, padding: 5 }}>
      <View style={{ paddingTop: 30, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 24, color: appColors.primary, fontWeight: 'bold' }}>CHAT APP</Text>
      </View>

      <View className="flex flex-col gap-4">
        <FlatList
          data={images}
          ref={flatListRef}
          renderItem={renderItem}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id.toString()}
          onMomentumScrollEnd={handleScrollEnd}
          initialScrollIndex={0}
          scrollEventThrottle={16}
          decelerationRate="fast"
          getItemLayout={(data, index) => ({
            length: screenWidth,
            offset: screenWidth * index,
            index,
          })}
        />

        <View className="flex-row justify-center">
          {renderDots()}
        </View>
      </View>

      <View className="px-7 flex-col gap-5">
        <TouchableHighlight
          onPress={() => router.push("/(screens)/Login")}
          className="py-5 rounded-lg"
          style = {{ backgroundColor: appColors.primary }}
          underlayColor="#1e3a8a"
        >
          <Text className="text-center text-white">Đăng nhập</Text>
        </TouchableHighlight>

        <TouchableHighlight
          onPress={() => router.push("/(screens)/Register")}
          className="py-5 bg-slate-200 rounded-lg"
          underlayColor="#e2e8f0"
        >
          <Text className="text-center">Tạo tài khoản mới</Text>
        </TouchableHighlight>
      </View>
    </View>
  );
};

export default WelcomeScreen;