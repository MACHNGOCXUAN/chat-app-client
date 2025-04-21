import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';

const ImageGrid = ({ images, onPress }) => {
  if (!images || images.length === 0) return null;

  const renderImage = (uri, style) => (
    <TouchableOpacity key={uri} onPress={() => onPress(uri)}>
      <Image source={{ uri }} style={style} resizeMode="cover" />
    </TouchableOpacity>
  );

  switch (images.length) {
    case 1:
      return (
        <View style={styles.container}>
          {renderImage(images[0], styles.singleImage)}
        </View>
      );
    case 2:
      return (
        <View style={styles.twoImagesContainer}>
          {images.map((uri) => renderImage(uri, styles.twoImage))}
        </View>
      );
    case 3:
      return (
        <View style={styles.threeImagesContainer}>
          {renderImage(images[0], styles.threeImageMain)}
          <View style={styles.threeImagesRight}>
            {renderImage(images[1], styles.threeImageSmall)}
            {renderImage(images[2], styles.threeImageSmall)}
          </View>
        </View>
      );
    case 4:
      return (
        <View style={styles.fourImagesContainer}>
          {images.slice(0, 2).map((uri) => renderImage(uri, styles.fourImage))}
          <View style={styles.fourImagesBottom}>
            {images.slice(2, 4).map((uri) => renderImage(uri, styles.fourImage))}
          </View>
        </View>
      );
    default:
      return (
        <View style={styles.manyImagesContainer}>
          {images.slice(0, 4).map((uri, index) => (
            <View key={uri} style={styles.manyImageWrapper}>
              {renderImage(uri, styles.manyImage)}
              {index === 3 && images.length > 4 && (
                <View style={styles.remainingCount}>
                  <Text style={styles.remainingCountText}>+{images.length - 4}</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      );
  }
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  singleImage: {
    width: 250,
    height: 300,
    borderRadius: 8,
  },
  twoImagesContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  twoImage: {
    width: '49.5%',
    aspectRatio: 1,
  },
  threeImagesContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  threeImageMain: {
    width: '66%',
    aspectRatio: 0.8,
  },
  threeImagesRight: {
    flex: 1,
    gap: 2,
  },
  threeImageSmall: {
    width: '100%',
    height: '49.5%',
  },
  fourImagesContainer: {
    gap: 2,
  },
  fourImage: {
    width: '49.5%',
    aspectRatio: 1,
  },
  fourImagesBottom: {
    flexDirection: 'row',
    gap: 2,
  },
  manyImagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
  },
  manyImageWrapper: {
    width: '49.5%',
    aspectRatio: 1,
  },
  manyImage: {
    width: '100%',
    height: '100%',
  },
  remainingCount: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  remainingCountText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default ImageGrid;