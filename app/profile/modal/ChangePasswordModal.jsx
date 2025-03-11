import { Formik } from 'formik';
import PropTypes from 'prop-types';
import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Button, Icon } from 'react-native-elements';
import { changePasswordValid } from '../utils/validation';
import CustomModal from './CustomModal';

const ChangePasswordModal = ({ modalVisible = false, setModalVisible = () => {} }) => {
  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const handleChangePassword = async (values) => {
    const { oldPassword, newPassword } = values;
    // Xử lý đổi mật khẩu
    console.log('Change password: ', { oldPassword, newPassword });
    handleCloseModal();
  };

  return (
    <CustomModal
      visible={modalVisible}
      onCloseModal={handleCloseModal}
      title="Đổi mật khẩu"
    >
      <Formik
        initialValues={changePasswordValid.initial}
        validationSchema={changePasswordValid.validationSchema}
        onSubmit={(values) => handleChangePassword(values)}
      >
        {({ values, errors, handleChange, handleSubmit }) => (
          <>
            <View style={styles.body}>
              <View style={styles.inputContainer}>
                <Icon name="lock" type="antdesign" size={24} color="#555" style={styles.icon} />
                <TextInput
                  placeholder="Nhập mật khẩu hiện tại"
                  autoFocus
                  onChangeText={handleChange('oldPassword')}
                  secureTextEntry
                  value={values.oldPassword}
                  style={styles.input}
                  placeholderTextColor="#888"
                />
              </View>
              {errors.oldPassword && <Text style={styles.errorText}>{errors.oldPassword}</Text>}

              <View style={styles.inputContainer}>
                <Icon name="lock" type="antdesign" size={24} color="#555" style={styles.icon} />
                <TextInput
                  placeholder="Nhập mật khẩu mới"
                  onChangeText={handleChange('newPassword')}
                  secureTextEntry
                  value={values.newPassword}
                  style={styles.input}
                  placeholderTextColor="#888"
                />
              </View>
              {errors.newPassword && <Text style={styles.errorText}>{errors.newPassword}</Text>}

              <View style={styles.inputContainer}>
                <Icon name="lock" type="antdesign" size={24} color="#555" style={styles.icon} />
                <TextInput
                  placeholder="Nhập lại mật khẩu"
                  secureTextEntry
                  onChangeText={handleChange('passwordConfirmation')}
                  value={values.passwordConfirmation}
                  style={styles.input}
                  placeholderTextColor="#888"
                />
              </View>
              {errors.passwordConfirmation && <Text style={styles.errorText}>{errors.passwordConfirmation}</Text>}
            </View>

            <View style={styles.footer}>
              <Button
                title="Hủy"
                onPress={handleCloseModal}
                type="clear"
                titleStyle={{ color: 'black' }}
                containerStyle={{ marginRight: 20 }}
              />
              <Button title="Thay đổi" onPress={handleSubmit} type="clear" />
            </View>
          </>
        )}
      </Formik>
    </CustomModal>
  );
};

ChangePasswordModal.propTypes = {
  modalVisible: PropTypes.bool,
  setModalVisible: PropTypes.func,
};

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#F8F9FA', // Màu nền nhẹ
    borderRadius: 12, // Bo góc mềm mại
    paddingHorizontal: 12,
    marginVertical: 8,
    height: 50, // Độ cao vừa phải
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2, // Đổ bóng nhẹ trên Android
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#333', // Màu chữ tối hơn để dễ đọc
    paddingHorizontal: 10,
  },
  icon: {
    marginRight: 8,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginLeft: 10,
    marginTop: 2,
  },
  footer: {
    paddingHorizontal: 15,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
});

export default ChangePasswordModal;
