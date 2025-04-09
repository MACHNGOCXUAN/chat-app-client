// import { router } from 'expo-router'
// import React, { useState } from 'react'
// import { View, Text, TextInput, TouchableHighlight, StyleSheet, ActivityIndicator, Keyboard } from 'react-native'
// import AsyncStorage from "@react-native-async-storage/async-storage"
// import axiosInstance from '../../utils/axiosInstance'
// import { useDispatch } from 'react-redux'
// import { addAuth } from '../../stores/reducers/authReducer'
// import { appColors } from '../../constants/appColor'

// const forgotPassword = () => {
//   const [email, setEmail] = useState('')
//   const [errMessage, setErrMessage] = useState('')
//   const [loading, setLoading] = useState(false)

//   const handleLogin = async () => {
//     if (!validateInputs()) return
    
//     Keyboard.dismiss()
//     setErrMessage("")
//     setLoading(true)
    
//     try {
//       const res = await axiosInstance.post("/forgetPassword", {
//         phoneNumber: phone,
//         password
//       })

//       dispatch(addAuth(res.data.data));
//       await AsyncStorage.setItem(
//         "auth",
//         JSON.stringify(res.data.data)
//       );
//       router.replace('/(tabs)')
//     } catch (error) {
//       console.log('Login error:', error);
//       setErrMessage(error.response?.data?.message || error.error || 'Đăng nhập thất bại');
//     } finally {
//       setLoading(false);
//     }  
//   }

//   const isDisabled = !phone.trim() || !password.trim() || loading;

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Quên mật khẩu</Text>

//       <Text style={{ marginBottom: 10 }}>Nhập email để lấy lại mật khẩu</Text>

//       <TextInput
//         style={styles.input}
//         placeholder="Nhập email"
//         value={phone}
//         placeholderTextColor={ appColors.placeholderTextColor }
//         onChangeText={setEmail}
//         keyboardType="email-address"
//         autoCapitalize="none"
//         autoFocus
//         returnKeyType="next"
//       />

//       {errMessage ? (
//         <Text style={styles.errorText}>{errMessage}</Text>
//       ) : null}

//       <TouchableHighlight
//         style={[styles.loginButton, isDisabled && styles.disabledButton]}
//         onPress={handleLogin}
//         disabled={isDisabled}
//         underlayColor="#1d4ed8"
//       >
//         {loading ? (
//           <ActivityIndicator size="small" color="#fff" />
//         ) : (
//           <Text style={styles.loginButtonText}>Đăng nhập</Text>
//         )}
//       </TouchableHighlight>

//       <TouchableHighlight
//         style={styles.registerLink}
//         underlayColor="#e2e8f0"
//         onPress={() => router.push('/(screens)/Register')}
//         disabled={loading}
//       >
//         <Text style={styles.registerLinkText}>Tạo tài khoản mới</Text>
//       </TouchableHighlight>
//     </View>
//   )
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     justifyContent: 'flex-start',
//     backgroundColor: '#fff',
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: appColors.primary,
//     textAlign: 'center',
//     marginBottom: 20,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 8,
//     padding: 15,
//     marginBottom: 15,
//     fontSize: 16,
//   },
//   loginButton: {
//     backgroundColor: appColors.primary,
//     padding: 15,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   disabledButton: {
//     opacity: 0.6,
//   },
//   loginButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   registerLink: {
//     marginTop: 15,
//     alignItems: 'center',
//     padding: 10,
//   },
//   registerLinkText: {
//     color: '#1e3a8a',
//     fontSize: 16,
//   },
//   errorText: {
//     color: '#ef4444',
//     marginBottom: 15,
//     textAlign: 'center',
//   },
// })

// export default forgotPassword



import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView, Alert, Platform, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { appColors } from '../../constants/appColor'
import DateTimePicker from '@react-native-community/datetimepicker';
import axiosInstance from '../../utils/axiosInstance';



const forgotPassword = () => {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gender, setGender] = useState('');
  const [birthday, setBirthday] = useState(new Date());
  const [avatar, setAvatar] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errMessageSDT, setErrMessageSDT] = useState('')
  const [loading, setLoading] = useState(false)
  const [code, setCode] = useState('')
  const [errOTP, setErrOTP] = useState('')
  const [countdown, setCountdown] = useState(30);
  const [errProfile, setErrProfile] = useState('')
  const [errMessage, setErrMessage] = useState('')


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

      const checkResponse = await axiosInstance.post("/checkEmail", {
        email: email
      });
  
      if (!checkResponse.data.success) {
        setErrMessageSDT(checkResponse.data.message);
        return;
      }

      const response = await axiosInstance.post("/verify", {
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
    if (otp.length !== 4) {
      setErrOTP("Mã OTP phải có 4 chữ số")
      return;
    }
    if( otp != code) {
      setErrOTP("Mã OTP không chính xác")
      return;
    }
    setStep(3);
  };

  const handleUpdatePassword = () => {
    if (!name || !password || !confirmPassword) {
      setErrProfile("Vui lòng điền đầy đủ thông tin")
      return;
    }
    if (password !== confirmPassword) {
      setErrProfile("Mật khẩu không khớp")
      return;
    }
    Alert.alert("Đăng ký thành công", "Cập nhật thành công")
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {step === 1 && (
        <View style={styles.stepContainer}>
          <Text style={styles.title}>Nhập số điện thoại và email</Text>

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
          
          <TextInput
            style={styles.input}
            placeholder="Nhập mật khẩu mới"
            value={name}
            onChangeText={(text) => {
              setErrProfile("")
              setName(text)
            }}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Nhập lại mật khẩu mới"
            secureTextEntry
            value={password}
            placeholderTextColor={appColors.placeholderTextColor}
            onChangeText={(text) => {
              setErrProfile("")
              setPassword(text)
            }}
          />

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