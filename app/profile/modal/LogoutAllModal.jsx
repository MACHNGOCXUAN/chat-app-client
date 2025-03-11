import PropTypes from 'prop-types';
import React from 'react';
import { Platform, StyleSheet, View, TextInput, Text } from 'react-native';
import { Button, Icon } from 'react-native-elements';
import { Formik } from 'formik';
import * as Yup from 'yup'; // Import Yup để xác thực form
import CustomModal from './CustomModal';

// Xác thực form với Yup
const logoutAllValid = {
  initial: { password: '' }, // Giá trị khởi tạo
  validationSchema: Yup.object().shape({
    password: Yup.string().required('Mật khẩu là bắt buộc'), // Kiểm tra mật khẩu
  }),
};

const LogoutAllModal = (props) => {
  const { modalVisible, setModalVisible } = props;

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const handleOnSubmit = async (values) => {
    const { password } = values;
    // Xử lý đăng xuất ở đây (ví dụ: gọi API)
    console.log('Đăng xuất với mật khẩu:', password);
    handleCloseModal();
  };

  return (
    <CustomModal visible={modalVisible} onCloseModal={handleCloseModal} title="Đăng xuất ra khỏi các thiết bị khác">
      <Formik
        initialValues={logoutAllValid.initial}
        validationSchema={logoutAllValid.validationSchema}
        onSubmit={(values) => handleOnSubmit(values)} // Gọi hàm khi form được submit
      >
        {(formikProps) => {
          const { values, errors, handleChange, handleSubmit } = formikProps;
          return (
            <>
              <View style={styles.body}>
                <TextInput
                  placeholder="Nhập mật khẩu hiện tại"
                  autoFocus
                  secureTextEntry={true}
                  style={styles.input}
                  onChangeText={handleChange('password')} // Liên kết với field password
                  value={values.password} // Giá trị mật khẩu
                />
                {errors.password && <Text style={styles.error}>{errors.password}</Text>} {/* Hiển thị lỗi nếu có */}
              </View>
              <View style={styles.footer}>
                <Button
                  title="Hủy"
                  onPress={handleCloseModal}
                  type="clear"
                  titleStyle={{ color: 'black' }}
                  containerStyle={{ marginRight: 20 }}
                />
                <Button
                  title="Đăng xuất"
                  onPress={handleSubmit} // Gọi handleSubmit từ Formik
                  type="clear"
                />
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

LogoutAllModal.defaultProps = {
  modalVisible: false,
  setModalVisible: null,
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
    paddingVertical: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: BUTTON_RADIUS,
    paddingHorizontal: 10,
    height: 40,
  },
  footer: {
    paddingHorizontal: 15,
    paddingBottom: 5,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  error: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
  },
});

export default LogoutAllModal;
