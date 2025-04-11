import { Formik } from 'formik';
import PropTypes from 'prop-types';
import React from 'react';
import {
  Modal,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Alert,
} from 'react-native';
import { Button, Icon } from 'react-native-elements';
import axiosInstance from '../../../utils/axiosInstance';
import { useSelector } from 'react-redux';
import Spinner from 'react-native-loading-spinner-overlay';
import { useState } from 'react';

import { logoutAllValid } from '../utils/validation';
import CustomModal from './CustomModal';

const LogoutAllModal = ({ modalVisible = false, setModalVisible = null }) => {
  const [loading, setLoading] = useState(false);
  const { user } = useSelector(state => state.auth);

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const handleOnSubmit = async values => {
    const { password } = values;

    try {
      setLoading(true);

      const response = await axiosInstance.post('/logout', {
        email: user.email,
        password: password
      });

      if (response.data.message) {
        Alert.alert('Thành công', 'Đã đăng xuất khỏi tất cả thiết bị');
        handleCloseModal();
      }
    } catch (error) {
      console.error('Logout all error:', error);
      Alert.alert(
        'Lỗi',
        error.error || 'Không thể đăng xuất khỏi các thiết bị khác. Vui lòng thử lại sau.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <CustomModal
      visible={modalVisible}
      onCloseModal={handleCloseModal}
      title="Đăng xuất ra khỏi các thiết bị khác"
    >
      <Spinner visible={loading} textContent="Đang xử lý..." />
      <Formik
        initialValues={logoutAllValid.initial}
        validationSchema={logoutAllValid.validationSchema}
        onSubmit={values => handleOnSubmit(values)}
      >
        {formikProps => {
          const { values, errors, handleChange, handleSubmit } = formikProps;
          return (
            <>
              <View style={styles.body}>
                <View style={styles.inputContainer}>
                  <Icon
                    name="lock"
                    type="antdesign"
                    size={24}
                    color="black"
                    style={styles.icon}
                  />
                  <TextInput
                    placeholder="Nhập mật khẩu hiện tại"
                    autoFocus
                    onChangeText={handleChange('password')}
                    secureTextEntry
                    value={values.password}
                    style={styles.input}
                  />
                </View>
                {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
              </View>

              <View style={styles.footer}>
                <Button
                  title="Hủy"
                  onPress={handleCloseModal}
                  type="clear"
                  titleStyle={{ color: 'black' }}
                  containerStyle={{ marginRight: 20 }}
                />
                <Button title="Đăng xuất" onPress={handleSubmit} type="clear" />
              </View>
            </>
          );
        }}
      </Formik>
    </CustomModal>
  );
};

LogoutAllModal.propTypes = {
  modalVisible: PropTypes.bool,
  setModalVisible: PropTypes.func,
};

const BUTTON_RADIUS = 10;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(52, 52, 52, 0.3)',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
  },
  modalView: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 5,
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E6E8',
    paddingVertical: 5,
    paddingHorizontal: 15,
  },
  title: {
    fontFamily: Platform.OS === 'ios' ? 'Arial' : 'normal',
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'left',
    fontSize: 18,
    borderBottomColor: 'black',
  },
  body: {
    paddingHorizontal: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginVertical: 5,
  },
  input: {
    flex: 1,
    height: 40,
    paddingLeft: 10,
    fontSize: 14,
  },
  icon: {
    marginRight: 5,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginLeft: 10,
  },
  footer: {
    paddingHorizontal: 15,
    paddingBottom: 5,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
});

export default LogoutAllModal;
