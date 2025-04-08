import { router } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView, Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { appColors } from '../../constants/appColor'
import DateTimePicker from '@react-native-community/datetimepicker';



const RegisterScreen = () => {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gender, setGender] = useState('');
  const [birthday, setBirthday] = useState(new Date());
  const [avatar, setAvatar] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errMessageSDT, setErrMessageSDT] = useState('')

  const handleSendOtp = () => {
    const phoneRegex = /^(03|05|07|08|09)\d{8}$/;
    if (!phone) {
      // Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại');
      setErrMessageSDT("Vui lòng nhập số điện thoại")
      return;
    }
    if (!phoneRegex.test(phone)) {
      // Alert.alert('Lỗi', 'Số điện thoại không hợp lệ. Vui lòng nhập số gồm 10 chữ số và bắt đầu bằng 03, 05, 07, 08 hoặc 09.');
      setErrMessageSDT("Số điện thoại không hợp lệ. Vui lòng nhập số gồm 10 chữ số và bắt đầu bằng 03, 05, 07, 08 hoặc 09.")
      return;
    }
    setStep(2);
  };

  const handleVerifyOtp = () => {
    if (!otp) {
      Alert.alert('Lỗi', 'Vui lòng nhập mã OTP');
      return;
    }
    // Xác minh OTP logic ở đây
    setStep(3);
  };

  const handleRegister = () => {
    if (!name || !password || !confirmPassword) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu không khớp');
      return;
    }
    setStep(4);
  };

  const handleCompleteProfile = () => {
    if (!gender) {
      Alert.alert('Lỗi', 'Vui lòng chọn giới tính');
      return;
    }
    // Hoàn tất đăng ký logic ở đây
    Alert.alert('Thành công', 'Đăng ký tài khoản thành công');
    router.replace('/');
  };

  const pickAvatar = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  const onChangeBirthday = (event, selectedDate) => {
    const currentDate = selectedDate || birthday;
    setShowDatePicker(false);
    setBirthday(currentDate);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {step === 1 && (
        <View style={styles.stepContainer}>
          <Text style={styles.title}>Nhập số điện thoại</Text>
          <TextInput
            style={styles.input}
            placeholder="Số điện thoại"
            placeholderTextColor={appColors.placeholderTextColor}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={(number) => {
              setErrMessageSDT("")
              setPhone(number)
            }}
          />

          {
            errMessageSDT && <Text className = 'text-red-500 mb-4'>
              {errMessageSDT}
            </Text>
          }
          
          <TouchableOpacity style={styles.button} onPress={handleSendOtp}>
            <Text style={styles.buttonText}>Gửi mã xác minh</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.loginText}>Đã có tài khoản? Đăng nhập</Text>
        </TouchableOpacity>
        </View>
      )}
      
      {step === 2 && (
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>Nhập mã xác thực</Text>
          <Text style={{ textAlign: "center", color: appColors.placeholderTextColor }}>Nhập dãy 6 chữ số được gửi đến số điện thoại</Text>
          <Text style = {{ textAlign: "center", marginTop: 5, fontWeight: 'bold', marginBottom: 20 }}>{phone}</Text>

          
          <TextInput
            style={styles.input}
            placeholder="Nhập mã OTP"
            keyboardType="number-pad"
            value={otp}
            onChangeText={setOtp}
          />
          
          <TouchableOpacity style={styles.button} onPress={handleVerifyOtp}>
            <Text style={styles.buttonText}>Xác minh</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.resendButton}>
            <Text style={styles.resendText}>Gửi lại mã OTP</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {step === 3 && (
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>Thông tin cá nhân</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Họ và tên"
            value={name}
            onChangeText={setName}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Mật khẩu"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Xác nhận mật khẩu"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          
          <TouchableOpacity style={styles.button} onPress={handleRegister}>
            <Text style={styles.buttonText}>Tiếp tục</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {step === 4 && (
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>Hoàn thiện hồ sơ</Text>
          
          {/* <TouchableOpacity style={styles.avatarContainer} onPress={pickAvatar}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>Chọn ảnh đại diện</Text>
              </View>
            )}
          </TouchableOpacity> */}
          
          <TouchableOpacity 
            style={styles.dateInput} 
            onPress={() => setShowDatePicker(true)}
          >
            <Text>{birthday.toLocaleDateString()}</Text>
          </TouchableOpacity>
          
          {showDatePicker && (
            <DateTimePicker
              value={birthday}
              className = "bg-black"
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onChangeBirthday}
              textColor="blue"
            />
          )}
          
          <View style={styles.genderContainer}>
            <TouchableOpacity 
              style={[styles.genderButton, gender === 'male' && styles.genderSelected]}
              onPress={() => setGender('male')}
            >
              <Text>Nam</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.genderButton, gender === 'female' && styles.genderSelected]}
              onPress={() => setGender('female')}
            >
              <Text>Nữ</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.genderButton, gender === 'other' && styles.genderSelected]}
              onPress={() => setGender('other')}
            >
              <Text>Khác</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={styles.button} onPress={handleCompleteProfile}>
            <Text style={styles.buttonText}>Hoàn tất đăng ký</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 30
  },
  title: {
    fontSize: 20,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 30,
  },
  stepContainer: {
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
  },
  instruction: {
    textAlign: 'center',
    marginBottom: 15,
    color: '#666',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16
  },
  dateInput: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#1E90FF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  resendButton: {
    alignItems: 'center',
  },
  resendText: {
    color: '#1E90FF',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#666',
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  genderButton: {
    flex: 1,
    marginHorizontal: 5,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    alignItems: 'center',
  },
  genderSelected: {
    backgroundColor: '#e6f2ff',
    borderColor: '#1E90FF',
  },
  loginText: {
    textAlign: 'center',
    color: '#1E90FF',
    marginTop: 20,
  },
});

export default RegisterScreen;