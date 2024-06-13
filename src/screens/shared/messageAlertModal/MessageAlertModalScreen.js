import React, {useState} from 'react';
import {Button, Text, TouchableOpacity, View, } from 'react-native';
import Modal from 'react-native-modal';
import {Colors, Fonts,Translations} from '../../../constants';
import {t} from 'i18next';

const MessageAlertModalScreen = props => {
  const hideAction = () => {
    props?.onOkAction();
  };

  return (
    <View
      style={{
        backgroundColor: Colors.WHITE_COLOR,
        justifyContent: 'center',
        margin: 20,
        borderRadius: 10,
      }}>
      <Text
        style={{
          color: Colors.PRIMARY_TEXT_COLOR,
          margin: 20,
          fontFamily: Fonts.Gibson_Regular,
          fontSize: 16,
          textAlign: 'center',
        }}>
        {props?.message || ''}
      </Text>
      <TouchableOpacity
        style={{
          backgroundColor: Colors.PRIMARY_COLOR,
          width: 80,
          height: 40,
          justifyContent: 'center',
          alignItems: 'center',
          alignSelf: 'center',
          marginBottom: 20,
        }}
        onPress={() => hideAction()}>
        <Text
          style={{
            color: Colors.WHITE_COLOR,
            fontFamily: Fonts.Gibson_SemiBold,
            fontSize: 16,
          }}>
        {t(Translations.OK)}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default MessageAlertModalScreen;
