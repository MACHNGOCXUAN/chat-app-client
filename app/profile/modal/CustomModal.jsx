import PropTypes from 'prop-types';
import React, { Children } from 'react'; // các thành phần con
import {
  Modal,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button } from 'react-native-elements';

const CustomModal = ({
  title = 'Cảnh báo',
  showFooter = false,
  visible = false,
  isPressOut = false,
  onCloseModal = null,
  children,
  isShowTitle = true,
  submitTitle = 'Ok',
  onSubmit = null,
  cancelTitle = 'Cancel',
  containerStyle = null,
}) => {

  return (
    <SafeAreaView>
      <Modal
        animationType="fade"
        transparent={true}
        visible={visible}
        onRequestClose={onCloseModal}>
        <TouchableOpacity
          activeOpacity={1}
          onPressOut={isPressOut ? onCloseModal : null}
          style={styles.container}>
          <SafeAreaView style={[styles.modalView, containerStyle]}>
            {isShowTitle && (
              <>
                <View style={styles.header}>
                  <Text style={styles.title}>{title}</Text>
                </View>
                <View style={styles.headerDivider}></View>
              </>
            )}

            {children}

            {showFooter && (
              <View style={styles.footer}>
                <Button
                  title={cancelTitle}
                  onPress={onCloseModal}
                  type="clear"
                  titleStyle={{ color: 'black' }}
                  containerStyle={{ marginRight: 20 }}
                />
                <Button title={submitTitle} onPress={onSubmit} type="clear" />
              </View>
            )}
          </SafeAreaView>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

CustomModal.propTypes = {
  title: PropTypes.string,
  visible: PropTypes.bool,
  showFooter: PropTypes.bool,
  isPressOut: PropTypes.bool,
  isShowTitle: PropTypes.bool,
  onCloseModal: PropTypes.func,
  submitTitle: PropTypes.string,
  onSubmit: PropTypes.func,
  cancelTitle: PropTypes.string,
  containerStyle: PropTypes.object,
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
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  headerDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E6E8',
    marginHorizontal: 12,
  },
  title: {
    fontFamily: Platform.OS === 'ios' ? 'Arial' : 'normal',
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'left',
    fontSize: 20,
    borderBottomColor: 'black',
  },
  body: {},
  footer: {
    paddingHorizontal: 15,
    paddingBottom: 5,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
});

export default CustomModal;
