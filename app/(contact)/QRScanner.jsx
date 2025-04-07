import React, { useState, useEffect } from 'react';
import { Text, View, TouchableOpacity, StyleSheet, Button, Linking, Animated } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

const QRScanner = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [facing, setFacing] = useState('back');
  const [animation] = useState(new Animated.Value(0));

  useEffect(() => {
    requestPermission();
    startAnimation();
  }, []);

  const startAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(animation, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="Grant permission" />
      </View>
    );
  }

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    
    // Kiểm tra nếu là URL thì mở trình duyệt
    if (data.startsWith('http://') || data.startsWith('https://')) {
      Linking.openURL(data).catch(err => 
        alert('Không thể mở liên kết: ' + err.message)
      );
    } 
    // Xử lý các loại QR code khác (như thêm bạn bè, thanh toán, v.v.)
    else {
      alert(`Đã quét mã QR: ${data}`);
    }
  };

  const toggleCameraFacing = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  const translateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 200],
  });

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={facing}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      >
        <View style={styles.overlay}>
          <View style={styles.unfocusedArea} />
          <View style={styles.middleArea}>
            <View style={styles.unfocusedArea} />
            <View style={styles.focusedArea}>
              <Animated.View 
                style={[styles.scanLine, { transform: [{ translateY }] }]} 
              />
            </View>
            <View style={styles.unfocusedArea} />
          </View>
          <View style={styles.unfocusedArea} />
        </View>
        
        <Text style={styles.helpText}>Đưa mã QR vào khung để quét</Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing}>
            <Text style={styles.flipButtonText}>Đổi camera</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
      
      {scanned && (
        <View style={styles.rescanButton}>
          <Button 
            title="Quét lại" 
            onPress={() => {
              setScanned(false);
              startAnimation();
            }} 
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  unfocusedArea: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  middleArea: {
    flexDirection: 'row',
    flex: 1.5,
  },
  focusedArea: {
    flex: 8,
    borderColor: 'white',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanLine: {
    height: 2,
    width: '100%',
    backgroundColor: 'red',
  },
  helpText: {
    color: 'white',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    backgroundColor: 'transparent',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  flipButton: {
    padding: 15,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
  },
  flipButtonText: {
    color: 'white',
    fontSize: 16,
  },
  rescanButton: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    paddingHorizontal: 50,
  },
});

export default QRScanner;