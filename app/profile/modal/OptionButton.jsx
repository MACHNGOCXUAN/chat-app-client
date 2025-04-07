import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Icon, ListItem } from 'react-native-elements';
import { TouchableOpacity } from 'react-native';

export default function OptionButton({
  onPress = null,
  title = '',
  dividerStyle = {},
  titleStyle = {},
  iconType = '',
  iconName = '',
  iconColor = null,
  subtitle = '',
  containerStyle = null,
}) {
  return (
    <>
      <TouchableOpacity onPress={onPress}>
        <ListItem containerStyle={containerStyle}>
          <Icon type={iconType} name={iconName} color={iconColor} />
          <ListItem.Content>
            <ListItem.Title style={titleStyle}>{title}</ListItem.Title>
            {subtitle.length > 0 && (
              <ListItem.Subtitle style={titleStyle}>
                {subtitle}
              </ListItem.Subtitle>
            )}
          </ListItem.Content>
        </ListItem>
      </TouchableOpacity>
      <View style={[styles.divider, dividerStyle]}></View>
    </>
  );
}

OptionButton.propTypes = {
  onPress: PropTypes.func,
  title: PropTypes.string,
  dividerStyle: PropTypes.object,
  titleStyle: PropTypes.object,
  containerStyle: PropTypes.object,
  iconType: PropTypes.string,
  iconName: PropTypes.string,
  iconColor: PropTypes.string,
  subtitle: PropTypes.string,
};

const styles = StyleSheet.create({
  divider: {
    width: '100%',
    backgroundColor: '#E5E6E8',
    height: 1,
    marginLeft: 55,
  },
});
