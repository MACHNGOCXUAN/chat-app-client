import PropTypes from 'prop-types';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-elements';
import ImageViewer from 'react-native-image-zoom-viewer';
import VideoPlayer from 'react-native-video-player';
import { Dimensions } from 'react-native';

const failImage = 'https://i.ibb.co/Myc2ZSfR/default-cover-image.jpg';
const SCREEN_HEIGHT = Dimensions.get('screen').height;
const DEFAULT_IMAGE_MODAL = {
  isVisible: false,
  userName: '',
  content: [],
  isImage: true,
};
const ERROR_MESSAGE = 'Đã có lỗi xảy ra'; 
const ViewImageModal = ({ imageProps = DEFAULT_IMAGE_MODAL, setImageProps = () => {} }) => {
  const handleCloseModal = () => {
    setImageProps(DEFAULT_IMAGE_MODAL); // reset modal
  };

  return (
    <Modal visible={imageProps.isVisible} transparent={true} onRequestClose={handleCloseModal}>
      {imageProps.isImage ? (
        <ImageViewer
          imageUrls={imageProps.content}
          onCancel={handleCloseModal}
          onSwipeDown={handleCloseModal}
          saveToLocalByLongPress={false}
          failImageSource={{
            uri: failImage,
          }}
          renderIndicator={currentIndex => (
            <View style={styles.indicator}>
              <TouchableOpacity style={{ marginTop:40 }} onPress={handleCloseModal}>
                <Icon name="arrowleft" type="antdesign" size={22} color="white" />
              </TouchableOpacity>
              {imageProps.userName && (
                <Text style={styles.text}>{imageProps.userName}</Text>
              )}
              <TouchableOpacity style={{ marginTop:40 }}
                onPress={() =>
                  checkPermissionDownloadFile(imageProps.content[currentIndex - 1].url)
                }>
                <Icon name="download" type="antdesign" size={22} color="white" />
              </TouchableOpacity>
            </View>
          )}
        />
      ) : (
        <View
          style={{
            backgroundColor: 'black',
            height: '100%',
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <View
            style={{
              height: SCREEN_HEIGHT / 3,
              width: '100%',
            }}>
            <VideoPlayer />
          </View>
        </View>
      )}
    </Modal>
  );
};

ViewImageModal.propTypes = {
  imageProps: PropTypes.object,
  setImageProps: PropTypes.func,
};

export default ViewImageModal;

const styles = StyleSheet.create({
  indicator: {
    position: 'absolute',
    zIndex: 9999,
    width: '100%',
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  text: { color: '#fff', fontSize: 18, marginLeft: 15,marginTop:40 },
  video: {
    width: '100%',
    height: '100%',
  },
});
