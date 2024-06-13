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
import OTPInputView from '@twotalltotems/react-native-otp-input';
import {useRoute} from '@react-navigation/native';
import BackgroundTimer from 'react-native-background-timer';
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
import {PINSource} from '../../../helpers/enums/Enums';
import {t} from 'i18next';
import { responsiveWidth } from 'react-native-responsive-dimensions';
import _BackgroundTimer from 'react-native-background-timer';
const OtpValidationScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  //Set from parent
  const phoneNumber = route?.params?.phoneNumber;
const phoneNumberRef=useRef();
  //Declaration
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');
  const [seconds, setSeconds] = useState(59);
  const [isTimerReachedZero, setIsTimerReachedZero] = useState(false);
  //Validations
  const [isValidEnteredPin, setIsValidEnteredPin] = useState(true);
  const [otpValidationMessage, setOtpValidationMessage] = useState('');
  const [clearInput, setclearInput] = useState(false)
  const [code, setCode] = useState()
  var myInterval = null;

  useEffect(() => {
       initializeTimer();
    return () => {
      BackgroundTimer.clearInterval(myInterval);
    };
  }, []);
  useEffect(() => {
    console.log('isTimerReachedZero:', isTimerReachedZero);
  }, [isTimerReachedZero]);
  //Button actions
  const continueButtonAction = () => {
    Keyboard.dismiss();
    if (isValidInputs() === true) {
      //PIN Verify api call
      performOTPVerification();
    }
  };

  const resendButtonAction = () => {
    setEnteredPin();
    setclearInput(true);
    Keyboard.dismiss();
    resetValidation();
    performResendOtp();
  };

  //Other functions
  const isValidInputs = () => {
    var _isValidEnteredPin = 0;
    console.log('isValidInputs code: ', enteredPin);
    if (enteredPin.trim().length === 4) {
      setOtpValidationMessage('');
      setIsValidEnteredPin(true);
      _isValidEnteredPin = 1;
    } else {
      setOtpValidationMessage(t(Translations.PLEASE_ENTER_VALID_OTP_TO_SENT));
      setIsValidEnteredPin(false);
      _isValidEnteredPin = 0;
    }
    if (_isValidEnteredPin === 1) {
      return true;
    } else {
      return false;
    }
  };

  const resetValidation = () => {
    setOtpValidationMessage('');
    setIsValidEnteredPin(true);
  };
  const clearAndResetTimer = myInterval => {
    clearInterval(myInterval);
    setIsTimerReachedZero(true);
  };
  const initializeTimer = () => {
    myInterval = BackgroundTimer.setInterval(() => {
      setSeconds(lastTimerCount => {
        console.log('lastTimerCount', lastTimerCount);
        lastTimerCount <= 1 ? clearAndResetTimer(myInterval) : null;
        return lastTimerCount - 1;
      });
    }, 1000);
  };
 
//   const timeoutId = BackgroundTimer.setTimeout(() => {
// setIsTimerReachedZero(true)
//   }, 10000);
  //API Calls
  const performOTPVerification = () => {
    setIsLoading(true);
    const body = {
      [APIConnections.KEYS.PHONE_NUMBER]: phoneNumber,
      [APIConnections.KEYS.BUSINESS_ID]: Globals.BUSINESS_ID,
      [APIConnections.KEYS.OTP]: enteredPin,
    };
    DataManager.performOTPValidation(body).then(
      ([isSuccess, message, responseData]) => {
        if (isSuccess === true) {
          Utilities.showToast(
            t(Translations.SUCCESS),
            message,
            'success',
            'bottom',
          );
          navigation.navigate('RegisterUpdateScreen',{phoneNumber:phoneNumber,isFromOtpValidation:true});
          setIsLoading(false);
        } else {
          Utilities.showToast(
            t(Translations.FAILED),
            message,
            'error',
            'bottom',
          );
          setIsLoading(false);
        }
      },
    );
  };

  const performResendOtp = () => {
    setIsLoading(true);
    const body = {
      [APIConnections.KEYS.PHONE_NUMBER]: phoneNumber,
      [APIConnections.KEYS.BUSINESS_ID]: Globals.BUSINESS_ID,
    };
    DataManager.performOTPResend(body).then(
      ([isSuccess, message, responseData]) => {
        if (isSuccess === true) {
          Utilities.showToast(
            t(Translations.SUCCESS),
            message,
            'success',
            'bottom',
          );
          setIsTimerReachedZero(false);
          setSeconds(59);
         initializeTimer();
          setIsLoading(false);
        } else {
          Utilities.showToast(
            t(Translations.FAILED),
            message,
            'error',
            'bottom',
          );
          setIsLoading(false);
        }
      },
    );
  };

  return (
    <>
    <KeyboardAwareScrollView
    enableOnAndroid={true}
    extraHeight={responsiveHeight(36)}
    keyboardShouldPersistTaps="always"
    style={{
      flex: 1,
    }}>
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.BACKGROUND_COLOR,
          paddingTop: insets.top,
          paddingLeft: insets.left,
          paddingRight: insets.right,
          paddingBottom: insets.bottom,
        }}>
        <LoadingIndicator visible={isLoading} />
        <StatusBar
          backgroundColor={Colors.BACKGROUND_COLOR}
          barStyle="dark-content"
        />
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            style={{marginTop: 28, height: 26, width: 26, marginLeft: 30}}
            source={Images.BACK_ARROW}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Text
          style={{
            marginTop: 20,
            marginLeft: 30,
            marginRight: 30,
            color: Colors.BLACK_COLOR,
            fontFamily: Fonts.Gibson_SemiBold,
            fontSize: 28,
          }}
          numberOfLines={1}>
          {t(Translations.VERIFICATION)}
        </Text>

        <InputScrollView
          keyboardOffset={110}
          keyboardShouldPersistTaps="handled"
          bounces={false}
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'flex-start',
          }}>
          <Text
            style={{
              marginTop: 64,
              marginLeft: 30,
              marginRight: 30,
              color: Colors.BLACK_COLOR,
              fontFamily: Fonts.Gibson_Regular,
              fontSize: 17,
            }}
            numberOfLines={3}>
            {t(
              Translations.A_FOUR_DIGIT_VERIFICATION_CODE_IS_SENT_TO_YOUR_MOBILE_NUMBER,
            )}
          </Text>

          <View style={{
           marginTop: 70,
           marginLeft: 30,
           marginRight: 30,
           alignItems: 'center',
           transform: [{scaleX: I18nManager.isRTL ? -1 : 1}],
            }}>
            {/* <OTPInputView
              style={{width: '60%', height: 100}}
              pinCount={4}
              //code={this.state.code} //You can supply this prop or not. The component will be used as a controlled / uncontrolled component respectively.
              onCodeChanged={code => setEnteredPin(code)}
              autoFocusOnLoad={false}
              codeInputFieldStyle={{
                width: 45,
                height: 50,
                borderWidth: 0,
                borderBottomWidth: 2,
                borderColor: Colors.OTP_INACTIVE_FIELD_COLOR,
                color: Colors.PRIMARY_TEXT_COLOR,
                fontSize: 24,
                fontFamily: Fonts.Gibson_SemiBold,
              }}
              codeInputHighlightStyle={{
                borderColor: Colors.PRIMARY_COLOR,
              }}
              onCodeFilled={code => {
                console.log(`Code is ${code}, you are good to go!`);
              }}
            /> */}
             <OTPInputView
              style={{
                width: responsiveWidth(80),
                height: 100,
              }}
              pinCount={4}
              //code={this.state.code} //You can supply this prop or not. The component will be used as a controlled / uncontrolled component respectively.
              code={enteredPin}
              onCodeChanged={(code)=>{setEnteredPin(code);
                              setclearInput(false)}} 
              // onCodeChanged={code => setEnteredPin(code)}
              autoFocusOnLoad={false}
              clearInputs={clearInput}
              codeInputFieldStyle={{
                width: 45,
                height: 50,
                borderWidth: 0,
                borderBottomWidth: 2,
                borderColor: Colors.OTP_INACTIVE_FIELD_COLOR,
                color: Colors.PRIMARY_TEXT_COLOR,
                fontSize: 24,
                fontFamily: Fonts.Gibson_SemiBold,

                transform: [{scaleX: I18nManager.isRTL ? -1 : 1}],
              }}
              codeInputHighlightStyle={{
                borderColor: Colors.PRIMARY_COLOR,
              }}
              onCodeFilled={code => {
                console.log(`Code is ${code}, you are good to go!`);
              }}
              isRTL={I18nManager?.isRTL ? true : false}
            />
            <HelperText type="error" visible={!isValidEnteredPin}>
              {otpValidationMessage}
            </HelperText>
          </View>
          {isTimerReachedZero ? null : (
            <View style={{marginTop: 6, marginLeft: 30, flexDirection: 'row'}}>
              <View
                style={{
                  backgroundColor: Colors.TEXT_GREY_COLOR_9B,
                  height: 18,
                  width: 18,
                  borderRadius: 9,
                }}
              />
              <Text
                style={{
                  marginTop: 2,
                  marginLeft: 8,
                  color: Colors.TEXT_GREY_COLOR_9B,
                  fontFamily: Fonts.Gibson_Regular,
                  fontSize: 14,
                }}>
                {seconds} {t(Translations.SEC)}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={{
              marginTop: 60,
              backgroundColor: Colors.SECONDARY_COLOR,
              height: 50,
              marginLeft: 30,
              marginRight: 30,
              justifyContent: 'center',
            }}
            disabled={isTimerReachedZero ? true : false}
            onPress={() =>
              isTimerReachedZero ? null : continueButtonAction()
            }>
            <Text
              style={{
                color: Colors.WHITE_COLOR,
                fontSize: 18,
                fontFamily: Fonts.Gibson_SemiBold,
                alignSelf: 'center',
                opacity: isTimerReachedZero ? 0.5 : 1,
              }}>
          {t(Translations.VERIFY)}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              marginTop: 16,
              backgroundColor: Colors.TRANSPARENT,
              height: 40,
              marginLeft: 30,
              marginRight: 30,
              justifyContent: 'center',
              marginBottom: 20,
            }}
            disabled={!isTimerReachedZero ? true : false}
            onPress={() => (isTimerReachedZero ? resendButtonAction() : null)}>
            <Text
              style={{
                color: Colors.PRIMARY_COLOR,
                fontSize: 14,
                fontFamily: Fonts.Gibson_SemiBold,
                alignSelf: 'center',
                opacity: isTimerReachedZero ? 1 : 0.5,
              }}>
             {t(Translations.RESENT)}
            </Text>
          </TouchableOpacity>
        </InputScrollView>
      </View>
      </KeyboardAwareScrollView>
    </>
  );
};
export default OtpValidationScreen;
