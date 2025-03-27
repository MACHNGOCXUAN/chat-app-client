import { router } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableHighlight, StyleSheet } from 'react-native';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    const user = {
      email: "xuan@gmail.com",
      password: "123456"
    }

    if(email === user.email && password === user.password) {
      router.push('/(tabs)');
    } else {
      alert("Tài khoản không tồn tại!");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng nhập</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Mật khẩu"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableHighlight
        style={styles.loginButton}
        underlayColor="#1e3a8a"
        onPress={handleLogin}
      >
        <Text style={styles.loginButtonText}>Đăng nhập</Text>
      </TouchableHighlight>

      <TouchableHighlight
        style={styles.registerLink}
        underlayColor="#e2e8f0"
        onPress={() => router.push('/(screens)/Register')}
      >
        <Text style={styles.registerLinkText}>Tạo tài khoản mới</Text>
      </TouchableHighlight>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e3a8a',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#1e3a8a',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerLink: {
    marginTop: 15,
    alignItems: 'center',
  },
  registerLinkText: {
    color: '#1e3a8a',
    fontSize: 16,
  },
});

export default LoginScreen;