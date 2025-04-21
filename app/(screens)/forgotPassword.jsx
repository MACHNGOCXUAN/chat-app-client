import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView, Alert, Platform, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { appColors } from '../../constants/appColor'
import DateTimePicker from '@react-native-community/datetimepicker';
import axiosInstance from '../../utils/axiosInstance';
import { Ionicons } from '@expo/vector-icons';


const isIOS = Platform.OS === "ios";
const forgotPassword = () => {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errMessageSDT, setErrMessageSDT] = useState('')
  const [loading, setLoading] = useState(false)
  const [code, setCode] = useState('')
  const [errOTP, setErrOTP] = useState('')
  const [countdown, setCountdown] = useState(30);
  const [errProfile, setErrProfile] = useState('')
  const [showPassword, setShowPassword] = useState(false)


  useEffect(() => {
    if (step === 2 && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, step]);


  const handleSendOtp = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      setErrMessageSDT("Vui lòng nhập email");
      return;
    }
  
    if (!emailRegex.test(email)) {
      setErrMessageSDT("Email không hợp lệ");
      return;
    }

    setLoading(true)
    try {

      const checkResponse = await axiosInstance.post("/api/auth/checkEmail", {
        email: email
      });
      
  
      if (!checkResponse.data.success) {
        setErrMessageSDT(checkResponse.data.message);
        return;
      }

      const response = await axiosInstance.post("/api/auth/verify", {
        email
      })

      setCode(response.data.data.code)
      setCountdown(30);
      setStep(2);
    } catch (error) {
      console.log('Login error:', error);
      setErrMessageSDT(error.response?.data?.message || error.message || 'Gửi mã thất bại');
    } finally {
      setLoading(false);
    } 
  }

  const handleVerifyOtp = () => {
    if (!otp) {
      setErrOTP("Vui lòng nhập mã OTP!")
      return;
    }
    if (otp.length !== 6) {
      setErrOTP("Mã OTP phải có 6 chữ số")
      return;
    }
    if( otp != code) {
      setErrOTP("Mã OTP không chính xác")
      return;
    }
    setStep(3);
  };

  const handleUpdatePassword = async () => {
    if (!password || !confirmPassword) {
      setErrProfile("Vui lòng điền đầy đủ thông tin")
      return;
    }
    if (password !== confirmPassword) {
      setErrProfile("Mật khẩu không khớp")
      return;
    }

    setLoading(true)
    try {
      const updatePassword = await axiosInstance.put("/api/auth/forgotPasswrod", {
        email: email,
        password
      })

      if(!updatePassword.data.success) {
        setErrMessageSDT(error.response?.data?.error || error.error || 'Không thể cập nhật mật khẩu');
      }

      Alert.alert("Thông báo", "Cập nhật thành công")
      router.replace('/(screens)/login')
    } catch (error) {
      console.log('Login error:', error);
      setErrMessageSDT(error.response?.data?.message || error.message || 'Không thể cập nhật mật khẩu');
    } finally {
      setLoading(false);
    } 
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {step === 1 && (
        <View style={styles.stepContainer}>
          <Text style={styles.title}>Nhập email</Text>

          <TextInput
            style={styles.input}
            placeholder="Nhập email"
            placeholderTextColor={appColors.placeholderTextColor}
            keyboardType="email-address"
            value={email}
            onChangeText={(text) => {
              setErrMessageSDT("")
              setEmail(text)
            }}
          />

          {
            errMessageSDT && <Text className = 'text-red-500 mb-4'>
              {errMessageSDT}
            </Text>
          }
          
          <TouchableOpacity style={styles.button} onPress={handleSendOtp}>
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Gửi mã xác minh</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/(screens)/login')}>
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

          {
            errOTP && <Text className = 'text-red-500 mb-4'>
              {errOTP}
            </Text>
          }
          
          <TouchableOpacity style={styles.button} onPress={handleVerifyOtp}>
            <Text style={styles.buttonText}>Xác minh</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.resendButton}
            disabled={countdown > 0}
          >
            <Text style={[styles.resendText, countdown > 0 && { color: '#ccc' }]}>
              {countdown > 0 ? `Gửi lại sau ${countdown}s` : 'Gửi lại mã OTP'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      
      {step === 3 && (
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>Mật khẩu mới</Text>
          
          <View style={styles.inputpassword}>
            <TextInput
              placeholderTextColor={ appColors.placeholderTextColor }
              placeholder="Nhập mật khẩu mới"
              value={password}
              onChangeText={(text) => {
                setErrProfile("")
                setPassword(text)
              }}
              secureTextEntry={!showPassword}
              returnKeyType="done"
              style = {{ flex: 1 }}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={appColors.primary}/>
            </TouchableOpacity>
          </View>
          
          <View style={styles.inputpassword}>
            <TextInput
              placeholderTextColor={ appColors.placeholderTextColor }
              placeholder="Nhập lại mật khẩu mới"
              value={confirmPassword}
              onChangeText={(text) => {
                setErrProfile("")
                setConfirmPassword(text)
              }}
              secureTextEntry={!showPassword}
              returnKeyType="done"
              style = {{ flex: 1 }}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={appColors.primary}/>
            </TouchableOpacity>
          </View>

          {
            errProfile && <Text className = 'text-red-500 mb-4'>
              {errProfile}
            </Text>
          }
          
          <TouchableOpacity style={styles.button} onPress={handleUpdatePassword}>
            <Text style={styles.buttonText}>Cập nhật</Text>
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
  inputpassword: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: isIOS ? 15 : 7,
    marginBottom: 15,
    fontSize: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: 'center'
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

export default forgotPassword;