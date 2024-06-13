import {StyleSheet, Text, View, Image, I18nManager} from 'react-native';
import React from 'react';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {HelperText, TextInput} from 'react-native-paper';
import {Colors, Translations, Fonts} from '../../../constants';
import {t} from 'i18next';
const PasswordTextInput = React.forwardRef((props, ref) => (
  <View style={{flexDirection: 'row'}}>
    <TextInput
      forwardedRef={ref}
      style={{
        backgroundColor: Colors.TRANSPARENT,
        textAlign: I18nManager.isRTL ? 'right' : 'left',
        flex: 1,
      }}
      activeUnderlineColor={Colors.PRIMARY_COLOR}
      secureTextEntry={props?.secureTextEntry}
      error={props?.error}
      //label={Strings.PASSWORD}
      label={
        <Text
          style={{
            fontFamily: Fonts.Gibson_Regular,
            fontSize: 16,
            color: Colors.TEXT_GREY_COLOR_9B,
          }}>
          {props?.placeHolder}
        </Text>
      }
      value={props?.value}
      onChangeText={text => props?.onChangeText(text)}
      returnKeyType={'done'}
      onSubmitEditing={() => {
        props?.nextRef !== undefined
          ? props?.nextRef?.current?.focus()
          : props?._onSubmitEditing();
      }}
    />
    <View
      style={{
        width: 30,
        height: 24,
        position: 'absolute',
        right: 5,
        top: 20,
      }}>
      <TextInput.Icon
        style={{width: 24, height: 24}}
        name={props?.isShowPassword ? 'eye' : 'eye-off-outline'}
        onPress={() => props?.setIsShowPassword(!props?.isShowPassword)}
        color={
          props?.isShowPassword
            ? Colors.PRIMARY_COLOR
            : Colors.TEXT_PLACEHOLDER_COLOR
        }
      />
    </View>
  </View>
));

export default PasswordTextInput;
