import { Formik } from 'formik';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
} from 'react-native';
import { Button, CheckBox } from 'react-native-elements';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { userProfileValid } from '../utils/validation';
import CustomModal from './CustomModal';
import axiosInstance from '../../../utils/axiosInstance';
import { useDispatch, useSelector } from 'react-redux';
import { addAuth } from '../../../stores/reducers/authReducer';

const UpdateUserProfileModal = ({ modalVisible = false, setModalVisible = null, userProfile = {} }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const [genderValue, setGenderValue] = useState(userProfile?.gender || false);
  const [show, setShow] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [dobTitle, setDobTitle] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userProfile?.dateOfBirth) {
      let dob;

    
      if (userProfile.dateOfBirth instanceof Date) {
        dob = userProfile.dateOfBirth;
      } else if (typeof userProfile.dateOfBirth === 'string') {
  
        dob = new Date(userProfile.dateOfBirth);
      } else if (userProfile.dateOfBirth.year) {
   
        dob = new Date(
          userProfile.dateOfBirth.year,
          userProfile.dateOfBirth.month - 1,
          userProfile.dateOfBirth.day + 1
        );
      } else {
      
        dob = new Date();
      }

      setDobTitle(handleDateOfBirth(dob));
      setDateOfBirth(dob);
    }
  }, [modalVisible, userProfile]);

  const initialValues = {
    name: userProfile?.name || '',
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const handleDateOfBirth = dateOfBirth => {
    const date = dateOfBirth.getDate();
    const month = dateOfBirth.getMonth() + 1;
    const year = dateOfBirth.getFullYear();

    return (
      ('00' + date).slice(-2) + '/' + ('00' + month).slice(-2) + '/' + year
    );
  };

  const handleUpdateUserProfile = async profile => {
    try {
      setLoading(true);


      const dateOfBirthObj = new Date(dateOfBirth);

      const updateData = {
        _id: user._id, 
        username: profile.name,
        gender: genderValue ? "female" : "male", 
        dateOfBirth: dateOfBirthObj,
        email: user.email 
      };

      console.log('Update profile data:', updateData);

      const response = await axiosInstance.put('/api/auth/updateProfile', updateData);

      if (response.data.user) {
      
        dispatch(addAuth({ user: response.data.user }));
        Alert.alert('Thành công', 'Cập nhật thông tin thành công');
        handleCloseModal();
      } else {
        Alert.alert('Lỗi', response.data.message || 'Có lỗi xảy ra khi cập nhật thông tin');
      }
    } catch (error) {
      console.error('Update profile error: ', error);
      Alert.alert('Lỗi', error.message || 'Có lỗi xảy ra khi cập nhật thông tin');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = selectedDate => {
    const dateSelected = selectedDate || dateOfBirth;
    setDateOfBirth(dateSelected);
    setDobTitle(handleDateOfBirth(dateSelected));
    hideDatePicker();
  };

  const hideDatePicker = () => {
    setShow(false);
  };

  const handleOpenDatePicker = () => {
    if (userProfile?.dateOfBirth) {
      let dob;

    
      if (userProfile.dateOfBirth instanceof Date) {
        dob = userProfile.dateOfBirth;
      } else if (typeof userProfile.dateOfBirth === 'string') {
      
        dob = new Date(userProfile.dateOfBirth);
      } else if (userProfile.dateOfBirth.year) {
    
        dob = new Date(
          userProfile.dateOfBirth.year,
          userProfile.dateOfBirth.month - 1,
          userProfile.dateOfBirth.day
        );
      } else {
      
        dob = new Date();
      }

      setDateOfBirth(dob);
    }
    setShow(true);
  };

  return (
    <>
      <CustomModal
        visible={modalVisible}
        onCloseModal={handleCloseModal}
        title="Cập nhật thông tin">
        <Formik
          initialValues={initialValues}
          validationSchema={userProfileValid.validationSchema}
          onSubmit={values => handleUpdateUserProfile(values)}>
          {formikProps => {
            const { values, errors, handleChange, handleSubmit } = formikProps;
            return (
              <>
                <View style={styles.body}>
                  <View style={styles.row}>
                    <Text style={styles.titleBody}>Họ và tên</Text>
                    <TextInput
                      placeholder={'Họ và tên'}
                      autoFocus
                      onChangeText={handleChange('name')}
                      value={values.name}
                      style={styles.inputField}
                    />
                    {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
                  </View>

                  <View style={styles.row}>
                    <Text style={styles.titleBody}>Giới tính</Text>
                    <CheckBox
                      center
                      title="Nam"
                      checkedIcon="dot-circle-o"
                      uncheckedIcon="circle-o"
                      checked={!genderValue}
                      onPress={() => setGenderValue(false)}
                      value={false}
                      containerStyle={{
                        backgroundColor: '#fff',
                        borderColor: '#fff',
                        borderWidth: 0,
                      }}
                    />
                    <CheckBox
                      center
                      title="Nữ"
                      checkedIcon="dot-circle-o"
                      uncheckedIcon="circle-o"
                      checked={genderValue}
                      onPress={() => setGenderValue(true)}
                      value={true}
                      containerStyle={{
                        backgroundColor: '#fff',
                        borderColor: '#fff',
                        borderWidth: 0,
                      }}
                    />
                  </View>

                  <View style={styles.row}>
                    <Text style={styles.titleBody}>Ngày sinh</Text>
                    <Button
                      type="clear"
                      title={dobTitle}
                      onPress={handleOpenDatePicker}
                      titleStyle={{ color: '#000' }}
                      containerStyle={{ marginLeft: 10 }}
                    />
                  </View>
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
                    title={loading ? "Đang cập nhật..." : "Cập nhật"}
                    onPress={handleSubmit}
                    type="clear"
                    disabled={loading}
                  />
                </View>
              </>
            );
          }}
        </Formik>
        <DateTimePickerModal
          isVisible={show}
          date={dateOfBirth}
          mode="date"
          onConfirm={handleConfirm}
          onCancel={hideDatePicker}
        />
      </CustomModal>
    </>
  );
};

UpdateUserProfileModal.propTypes = {
  modalVisible: PropTypes.bool,
  setModalVisible: PropTypes.func,
  userProfile: PropTypes.object,
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
  body: {},
  titleBody: {
    width: '20%',
    alignSelf: 'center',
    fontSize: 15,
  },
  row: {
    flexDirection: 'row',
    paddingHorizontal: 15,
  },
  footer: {
    paddingHorizontal: 15,
    paddingBottom: 5,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  inputField: {
    height: 40,
    width: '80%',
    borderColor: '#E5E6E8',
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
    marginVertical: 5,
    fontSize: 15,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
  },
});

export default UpdateUserProfileModal;