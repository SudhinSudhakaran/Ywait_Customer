import React, {useState, useEffect, useRef} from 'react';
import {
  StatusBar,
  Text,
  View,
  Image,
  TouchableOpacity,
  Keyboard,
  I18nManager,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/core';
import InputScrollView from 'react-native-input-scroll-view';
import {HelperText, TextInput} from 'react-native-paper';

import {
  Colors,
  Fonts,
  Globals,
  Images,
  Strings,
  Translations,
} from '../../../constants';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {responsiveHeight} from 'react-native-responsive-dimensions';
import Utilities from '../../../helpers/utils/Utilities';
import DataManager from '../../../helpers/apiManager/DataManager';
import LoadingIndicator from '../../shared/loadingIndicator/LoadingIndicator';
import StorageManager from '../../../helpers/storageManager/StorageManager';
import APIConnections from '../../../helpers/apiManager/APIConnections';
import {GuestUserAuthSource, BUILD_SOURCE} from '../../../helpers/enums/Enums';
import {t} from 'i18next';

const PhoneLoginScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  //Validations
  const [isValidPhoneNumber, setIsValidPhoneNumber] = useState(true);
  //refs
  const phoneNumberRef = useRef();

  //Button actions
  const continueButtonAction = () => {
    Keyboard.dismiss();
    if (isValidInputs() === true) {
      //Login api call
      performLogin();
    }
  };
  const cancelButtonAction = () => {
    navigation.goBack();
  };


  //Other functions
  const isValidInputs = () => {
    var _isValidPhone = 0;
    if (phoneNumber.trim().length > 9 && phoneNumber.trim().length < 15) {
      setIsValidPhoneNumber(true);
      _isValidPhone = 1;
    } else {
      setIsValidPhoneNumber(false);
      _isValidPhone = 0;
    }
    if (_isValidPhone === 1) {
      return true;
    } else {
      return false;
    }
  };

  //API Calls
  const performLogin = () => {
    setIsLoading(true);
    const body = {
      [APIConnections.KEYS.PHONE_NUMBER]: phoneNumber,
      [APIConnections.KEYS.BUSINESS_ID]: Globals.BUSINESS_ID,
    };
    DataManager.performPhoneLogin(body).then(([isSuccess, message, data]) => {
      if (isSuccess === true) {
        if (data !== undefined && data !== null) {
          setIsLoading(false);
          Utilities.showToast(
            t(Translations.SUCCESS),
            message,
            'success',
            'bottom',
          );
          navigation.navigate('OtpValidationScreen', {
            phoneNumber: phoneNumber,
          });
        } else {
          Utilities.showToast(
            t(Translations.FAILED),
            message,
            'error',
            'bottom',
          );
          setIsLoading(false);
        }
      } else {
        Utilities.showToast(t(Translations.FAILED), message, 'error', 'bottom');
        setIsLoading(false);
      }
    });
  };

  return (
    <>
    <KeyboardAwareScrollView
    enableOnAndroid={true}
    extraHeight={responsiveHeight(23)}
     backgroundColor= {Colors.WHITE_COLOR}
    keyboardShouldPersistTaps="always"
    style={{
      flex: 1,
    }}>
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.WHITE_COLOR,
          paddingTop: insets.top,
          paddingLeft: insets.left,
          paddingRight: insets.right,
          paddingBottom: insets.bottom,
        }}>
        <LoadingIndicator visible={isLoading} />
        <StatusBar
          backgroundColor={Colors.WHITE_COLOR}
          barStyle="dark-content"
        />
        <InputScrollView
          keyboardOffset={110}
          keyboardShouldPersistTaps="handled"
          bounces={false}
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'flex-start',
          }}>
          <TouchableOpacity onPress={() => cancelButtonAction()}
           style={{
            marginTop: 8,
            backgroundColor: Colors.TRANSPARENT,
            height: 50,
            width: 50,
            marginLeft: 30,
            justifyContent: 'center',
          }}>
            <Image
              style={{
                // marginTop: 16,
                // marginLeft: 30,
                height: 24,
                width: 24,
                resizeMode: 'contain',
                transform: [{scaleX: I18nManager.isRTL ? -1 : 1}],
              }}
              source={Images.BACK_ARROW}
            />
          </TouchableOpacity>
          <Text
            style={{
              marginTop: 30,
              marginLeft: 30,
              marginRight: 30,
              color: Colors.BLACK_COLOR,
              fontFamily: Fonts.Gibson_SemiBold,
              fontSize:
                Globals.CUSTOM_BUILD_SOURCE === BUILD_SOURCE.SKILLIKZ ? 20 : 28,
            }}
            numberOfLines={1}>
            {t(Translations.LOGIN)}
          </Text>

          {Globals.CUSTOM_BUILD_SOURCE === BUILD_SOURCE.ASTER ? (
            <View style={{marginTop: 10,}}>
              <Image
                style={{
                  height: 150,
                  aspectRatio: 2.1,
                  alignSelf: 'center',
                  resizeMode: 'contain',
                }}
                source={Images.ASTER_LOGO}
              />
            </View>
          ) : Globals.CUSTOM_BUILD_SOURCE === BUILD_SOURCE.YWAIT ? (
            <View style={{marginTop:responsiveHeight(2.5)}}>
              <Image
                style={{
                  height: 250,
                  aspectRatio: 1,
                  alignSelf: 'center',
                  resizeMode: 'contain',
                }}
                source={Images.YWAIT_LOGO}
              />
            </View>
          ) : Globals.CUSTOM_BUILD_SOURCE === BUILD_SOURCE.YWAITSERVICES ? (
            <View style={{marginTop:responsiveHeight(2.5)}}>
              <Image
                style={{
                  height: 250,
                  aspectRatio: 1,
                  alignSelf: 'center',
                  resizeMode: 'contain',
                }}
                source={Images.YWAIT_LOGO}
              />
            </View>
          ) :
           Globals.CUSTOM_BUILD_SOURCE === BUILD_SOURCE.FIRSTRESPONSE ? (
            <View style={{marginTop: 10,}}>
              <Image
                style={{
                  height: 150,
                  aspectRatio: 2.1,
                  alignSelf: 'center',
                  resizeMode: 'contain',
                }}
                source={Images.FIRSTRESPONSE_LOGO}
              />
            </View>
          ) :
          Globals.CUSTOM_BUILD_SOURCE === BUILD_SOURCE.SPOTLESS ? (
            <View style={{marginTop: 10}}>
              <Image
                style={{
                  height: 150,
                  aspectRatio: 2.1,
                  alignSelf: 'center',
                  resizeMode: 'contain',
                }}
                source={Images.SPOTLESS_LOGO}
              />
            </View>
          ) : Globals.CUSTOM_BUILD_SOURCE === BUILD_SOURCE.SKILLIKZ ? (
            <View style={{marginTop: -20}}>
              <Image
                style={{
                  height: 96,
                  width: 104,
                  alignSelf: 'center',
                  resizeMode: 'contain',
                }}
                source={Images.SKILLIKZ_Q_PINK}
              />
              <Image
                style={{
                  marginTop: 8,
                  height: 35,
                  width: 155,
                  alignSelf: 'center',
                  resizeMode: 'contain',
                }}
                source={Images.SKILLIKZ_Q_TEXT_IMAGE}
              />
            </View>
          ) : Globals.CUSTOM_BUILD_SOURCE === BUILD_SOURCE.PRINCECOURT ? (
            <View style={{marginTop: 10}}>
              <Image
                style={{
                  height: 136,
                  width: 144,
                  alignSelf: 'center',
                  resizeMode: 'contain',
                }}
                source={Images.PRINCE_COURT_ICON}
              />
            </View>
          ) : Globals.CUSTOM_BUILD_SOURCE === BUILD_SOURCE.ADVENTA ? (
            <View style={{marginTop: 10}}>
              <Image
                style={{
                  height: 250,
                  width: 250,
                  alignSelf: 'center',
                  resizeMode: 'contain',
                }}
                source={Images.ADVENTA_ICON}
              />
            </View>
          ) : null}

          <Text
            style={{
              marginTop: 40,
              marginLeft: 30,
              marginRight: 30,
              color: Colors.BLACK_COLOR,
              fontFamily: Fonts.Gibson_Regular,
              fontSize: 17,
            }}
            numberOfLines={3}>
            {t(Translations.PHONE_LOGIN_DESCRIPTION)}
          </Text>

          <View
            style={{
              marginTop:
                Globals.CUSTOM_BUILD_SOURCE === BUILD_SOURCE.ADVENTA ? 0 : 70,
              marginLeft: 30,
              marginRight: 30,
            }}>
            <View style={{}}>
              <TextInput
                ref={phoneNumberRef}
                style={{
                  backgroundColor: Colors.TRANSPARENT,
                  textAlign: I18nManager.isRTL ? 'right' : 'left',
                }}
                activeUnderlineColor={Colors.PRIMARY_COLOR}
                error={!isValidPhoneNumber}
                //label={Strings.MOBILE_NUMBER}
                label={
                  <Text
                    style={{
                      fontFamily: Fonts.Gibson_Regular,
                      fontSize: 20,
                      color: Colors.TEXT_GREY_COLOR_9B,
                    }}>
                    {t(Translations.MOBILE_NUMBER)}
                  </Text>
                }
                value={phoneNumber}
                onChangeText={text => setPhoneNumber(text)}
                keyboardType={'phone-pad'}
                autoCapitalize={'none'}
                returnKeyType={'done'}
                onSubmitEditing={() => {
                  continueButtonAction();
                }}
              />
              <HelperText type="error" visible={!isValidPhoneNumber}>
                {t(Translations.INVALID_PHONE_NUMBER)}
              </HelperText>
            </View>
          </View>

          <TouchableOpacity
            style={{
              marginTop: 40,
              backgroundColor: Colors.SECONDARY_COLOR,
              height: 50,
              marginLeft: 30,
              marginRight: 30,
              justifyContent: 'center',
              marginBottom: 20,
            }}
            onPress={() => continueButtonAction()}>
            <Text
              style={{
                color: Colors.WHITE_COLOR,
                fontSize: 18,
                fontFamily: Fonts.Gibson_SemiBold,
                alignSelf: 'center',
              }}>
              {t(Translations.CONTINUE)}
            </Text>
          </TouchableOpacity>

          {Globals.CUSTOM_BUILD_SOURCE === BUILD_SOURCE.SKILLIKZ ? (
            <View style={{marginTop: 30, marginBottom: 16}}>
              <Text
                style={{
                  alignSelf: 'center',
                  color: Colors.BLACK_COLOR,
                  fontFamily: Fonts.Gibson_Regular,
                  fontSize: 13,
                }}>
                Powered by
              </Text>
              <Image
                style={{
                  width: 150,
                  height: 50,
                  resizeMode: 'contain',
                  alignSelf: 'center',
                }}
                source={Images.SKILLIKZ_BLUE_TEXT_LOGO_IMAGE}
              />
            </View>
          ) : null}
        </InputScrollView>
      </View>
      </KeyboardAwareScrollView>
    </>
  );
};
export default PhoneLoginScreen;
