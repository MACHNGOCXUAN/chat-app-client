import { router } from 'expo-router'
import React, { useState } from 'react'
import { View, Text, TextInput, TouchableHighlight, StyleSheet, ActivityIndicator, Keyboard, TouchableOpacity, Platform } from 'react-native'
import AsyncStorage from "@react-native-async-storage/async-storage"
import axiosInstance from '../../utils/axiosInstance'
import { useDispatch } from 'react-redux'
import { addAuth } from '../../stores/reducers/authReducer'
import { appColors } from '../../constants/appColor'
import { Ionicons } from '@expo/vector-icons'

const isIOS = Platform.OS === "ios";

const LoginScreen = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errMessage, setErrMessage] = useState('')
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const validateInputs = () => {
    if (!email.trim()) {
      setErrMessage('Vui lòng nhập số điện thoại');
      return false
    }
    
    // if (!/^\d+$/.test(phone)) {
    //   setErrMessage('Số điện thoại chỉ được chứa số');
    //   return false
    // }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setErrMessage("Email không hợp lệ");
      return;
    }
    
    if (!password.trim()) {
      setErrMessage('Vui lòng nhập mật khẩu');
      return false
    }
    
    return true
  }

  const handleLogin = async () => {
    if (!validateInputs()) return
    
    Keyboard.dismiss()
    setErrMessage("")
    setLoading(true)
    
    try {
      const res = await axiosInstance.post("/login", {
        email,
        password
      })

      dispatch(addAuth(res.data.data));
      await AsyncStorage.setItem(
        "auth",
        JSON.stringify(res.data.data)
      );
      router.replace('/(tabs)')
    } catch (error) {
      console.log('Login error:', error);
      setErrMessage(error.response?.data?.message || error.error || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }  
  }

  const isDisabled = !email.trim() || !password.trim() || loading;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng nhập</Text>

      <TextInput
        style={styles.input}
        placeholder="Nhập email"
        value={email}
        placeholderTextColor={ appColors.placeholderTextColor }
        onChangeText={(text) => {
          setErrMessage("")
          setEmail(text)
        }}
        keyboardType="email-address"
        autoCapitalize="none"
        autoFocus
        returnKeyType="next"
      />

      <View style={styles.inputpassword}>
        <TextInput
          placeholderTextColor={ appColors.placeholderTextColor }
          placeholder="Mật khẩu"
          value={password}
          onChangeText={(text) => {
            setErrMessage("")
            setPassword(text)
          }}
          secureTextEntry={!showPassword}
          returnKeyType="done"
          onSubmitEditing={handleLogin}
          style = {{ flex: 1 }}
        />
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
        >
          <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={appColors.primary}/>
        </TouchableOpacity>
      </View>

      {errMessage ? (
        <Text style={styles.errorText}>{errMessage}</Text>
      ) : null}

      <TouchableOpacity onPress={() => router.push('/(screens)/forgotPassword')}>
        <Text style={styles.registerLinkText}>Lấy lại mật khẩu</Text>
      </TouchableOpacity>

      <TouchableHighlight
        style={[styles.loginButton, isDisabled && styles.disabledButton]}
        onPress={handleLogin}
        disabled={isDisabled}
        underlayColor="#1d4ed8"
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.loginButtonText}>Đăng nhập</Text>
        )}
      </TouchableHighlight>

      <TouchableHighlight
        style={styles.registerLink}
        underlayColor="#e2e8f0"
        onPress={() => router.push('/(screens)/register')}
        disabled={loading}
      >
        <Text style={styles.registerLinkText}>Tạo tài khoản mới</Text>
      </TouchableHighlight>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-start',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: appColors.primary,
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
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
  loginButton: {
    backgroundColor: appColors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerLink: {
    marginTop: 15,
    alignItems: 'center',
    padding: 10,
  },
  registerLinkText: {
    color: appColors.primary,
    fontSize: 16,
    marginBottom: 10
  },
  errorText: {
    color: '#ef4444',
    marginBottom: 15,
    textAlign: 'center',
  },
})

export default LoginScreen