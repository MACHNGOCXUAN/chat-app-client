import PropTypes from 'prop-types';
import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { Button, Icon } from 'react-native-elements';
import CustomModal from './CustomModal';
import commonFuc, { openCamera, updateAvatar } from '../utils/commonFuc';
import { useDispatch, useSelector } from 'react-redux';

const AvatarModal = ({
  modalVisible = false,
  setModalVisible = () => { },
  isCoverImage = false,
  onViewImage = () => { },
  onUploadFile = () => { },
}) => {
  const handleCloseModal = () => {
    setModalVisible(false);
  };


  const handleOnSubmit = async values => {
    const { password } = values;
    // xử lý logout 
    handleCloseModal();
  };

  const handleViewImage = () => {
    onViewImage(isCoverImage);
    handleCloseModal();
  };


  const { user } = useSelector(state => state.auth)

  const urlUpdateName = isCoverImage ? "updateImageCover" : "updateAvatar"

  const dispatch = useDispatch()

  const email = user?.email

  return (
    <CustomModal
      visible={modalVisible}
      onCloseModal={handleCloseModal}
      isShowTitle={false}
      isPressOut={true}
      containerStyle={{ width: '60%' }}>
      <Button
        title={`Xem ảnh ${isCoverImage ? 'bìa' : 'đại diện'}`}
        type="clear"
        iconPosition="left"
        icon={<Icon type="antdesign" name="eyeo" />}
        containerStyle={[styles.button, styles.buttonTop]}
        titleStyle={styles.title}
        buttonStyle={{ justifyContent: 'flex-start' }}
        onPress={handleViewImage}
      />
      <Button
        title="Chụp ảnh mới"
        type="clear"
        iconPosition="left"
        icon={<Icon type="feather" name="camera" />}
        containerStyle={styles.button}
        titleStyle={styles.title}
        buttonStyle={{ justifyContent: 'flex-start' }}
        onPress={() => dispatch(openCamera({email, urlUpdateName}))}
      />
      <Button
        title="Chọn ảnh từ thiết bị"
        type="clear"
        iconPosition="left"
        icon={<Icon type="ionicon" name="image-outline" />}
        containerStyle={[styles.button, styles.buttonBottom]}
        titleStyle={styles.title}
        buttonStyle={{ justifyContent: 'flex-start' }}
        onPress={() => {
          dispatch(updateAvatar({email, urlUpdateName}))
        }}
      />
    </CustomModal>
  );
};

AvatarModal.propTypes = {
  modalVisible: PropTypes.bool,
  isCoverImage: PropTypes.bool,
  setModalVisible: PropTypes.func,
  onViewImage: PropTypes.func,
  onUploadFile: PropTypes.func,
};

const BUTTON_RADIUS = 5;

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
    fontWeight: '100',
    color: 'black',
    marginLeft: 6,
  },
  body: {},
  footer: {
    paddingHorizontal: 15,
    paddingBottom: 5,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  buttonTop: {
    borderTopStartRadius: BUTTON_RADIUS,
    borderTopEndRadius: BUTTON_RADIUS,
  },
  button: {
    width: '100%',
    borderRadius: 0,
    alignItems: 'stretch',
  },
  buttonBottom: {
    borderBottomStartRadius: BUTTON_RADIUS,
    borderBottomEndRadius: BUTTON_RADIUS,
  },

});

export default AvatarModal;