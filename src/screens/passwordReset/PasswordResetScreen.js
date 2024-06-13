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
import {useRoute} from '@react-navigation/native';
import Modal from 'react-native-modal';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {responsiveHeight} from 'react-native-responsive-dimensions';
import {
  Colors,
  Fonts,
  Globals,
  Images,
  Strings,
  Translations,
} from '../../constants';
import Utilities from '../../helpers/utils/Utilities';
import DataManager from '../../helpers/apiManager/DataManager';
import LoadingIndicator from '../shared/loadingIndicator/LoadingIndicator';
import StorageManager from '../../helpers/storageManager/StorageManager';
import APIConnections from '../../helpers/apiManager/APIConnections';
import MessageAlertModalScreen from '../shared/messageAlertModal/MessageAlertModalScreen';
import {GuestUserAuthSource} from '../../helpers/enums/Enums';
import {t} from 'i18next';

const PasswordResetScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  //Declaration
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isShowPassword, setIsShowPassword] = useState(false);
  const [isShowConfirmPassword, setIsShowConfirmPassword] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  //Validations
  const [isValidPassword, setIsValidPassword] = useState(true);
  const [isValidConfirmPassword, setIsValidConfirmPassword] = useState(true);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
  const [confirmPasswordErrorMessage, setConfirmPasswordErrorMessage] =
    useState('');
  //refs
  const passwordRef = useRef();
  const confirmPasswordRef = useRef();

  //Button actions
  const continueButtonAction = () => {
    Keyboard.dismiss();
    if (isValidInputs() === true) {
      //api call
      performResetPassword();
    }
  };

  const cancelButtonAction = () => {
    Keyboard.dismiss();
    navigation.goBack();
  };

  //Other functions
  const isValidInputs = () => {
    var _isValidPassword = 0;
    var _isValidConfirmPassword = 0;
    if (password.length < 8 && password.length > 0) {
      setPasswordErrorMessage(
        t(Translations.PASSWORD_MIN_LENGTH_VALIDATION_TEXT),
      );
      setIsValidPassword(false);
      _isValidPassword = 0;
    } else if (password.length === 0) {
      setPasswordErrorMessage(
        t(Translations.NEW_PASSWORD_IS_REQUIRED),
      );
      setIsValidPassword(false);
      _isValidPassword = 0;
    } else {
      setPasswordErrorMessage('');
      setIsValidPassword(true);
      _isValidPassword = 1;
    }
    if (confirmPassword.length > 0) {
      if (confirmPassword === password) {
        setConfirmPasswordErrorMessage('');
        setIsValidConfirmPassword(true);
        _isValidConfirmPassword = 1;
      } else {
        setConfirmPasswordErrorMessage(t(Translations.PASSWORD_DO_NOT_MATCH));
        setIsValidConfirmPassword(false);
        _isValidConfirmPassword = 0;
      }
    } else {
      setConfirmPasswordErrorMessage(t(Translations.CONFIRM_PASSWORD_IS_REQUIRED));
      setIsValidConfirmPassword(false);
      _isValidConfirmPassword = 0;
    }
    if (_isValidConfirmPassword === 1 && _isValidPassword === 1) {
      return true;
    } else {
      return false;
    }
  };

  const checkVerificationStatus = verificationDetails => {
    if (verificationDetails !== undefined && verificationDetails !== null) {
      if (verificationDetails?.canRestPassword === true) {
        //Password reset required, Navigating to password resent page
        Utilities.showToast(
          t(Translations.FAILED),
         t(Translations.ACCOUNT_NOT_VERIFIED_PLEASE_CONTACT_ADMINISTER),
          'error',
          'bottom',
        );
      } else if (verificationDetails?.isProfileUpdated === true) {
        //Existing user found. Navigating user to source and save user details
        existingUserAuthorizationSuccess(verificationDetails);
      } else {
        //New user found. Navigating user to register update screen
        newUserFoundNavigateToRegister(verificationDetails);
      }
    } else {
      Utilities.showToast(t(Translations.FAILED), Strings.UNKNOWN_ERROR, 'error', 'bottom');
    }
  };

  const newUserFoundNavigateToRegister = verificationDetails => {
    navigation.navigate('RegisterUpdateScreen');
  };

  const existingUserAuthorizationSuccess = verificationDetails => {
    //Save user details to local db
    StorageManager.saveUserDetails(verificationDetails);
    Globals.USER_DETAILS = verificationDetails;
    Globals.IS_AUTHORIZED = true;

    if (
      Globals.SHARED_VALUES.GUEST_USER_AUTH_SOURCE ===
        GuestUserAuthSource.dashboardUserProfile ||
      Globals.SHARED_VALUES.GUEST_USER_AUTH_SOURCE ===
        GuestUserAuthSource.favoritesList ||
      Globals.SHARED_VALUES.GUEST_USER_AUTH_SOURCE ===
        GuestUserAuthSource.notificationList ||
      Globals.SHARED_VALUES.GUEST_USER_AUTH_SOURCE ===
        GuestUserAuthSource.scanQr
    ) {
      Globals.SHARED_VALUES.IS_GUEST_USER_NAV_NEEDED = true;
      navigation.navigate('DashboardScreen');
    } else if (
      Globals.SHARED_VALUES.GUEST_USER_AUTH_SOURCE ===
        GuestUserAuthSource.newBooking ||
      Globals.SHARED_VALUES.GUEST_USER_AUTH_SOURCE ===
        GuestUserAuthSource.newQueueBooking
    ) {
      Globals.SHARED_VALUES.IS_GUEST_USER_NAV_NEEDED = true;
      navigation.navigate('BookingQueueScreen');
    } else {
      Globals.SHARED_VALUES.IS_GUEST_USER_NAV_NEEDED = false;
      navigation.navigate('DashboardScreen');
    }
  };

  //API Calls
  const performResetPassword = () => {
    setIsLoading(true);
    var userId = '';
    if (Globals.IS_AUTHORIZED === true) {
      userId = Globals.USER_DETAILS._id;
    } else {
      userId = Globals.TEMP_USER_DETAILS._id;
    }
    const body = {
      [APIConnections.KEYS.BUSINESS_ID]: Globals.BUSINESS_DETAILS._id,
      [APIConnections.KEYS.CUSTOMER_ID]: userId,
      [APIConnections.KEYS.PASSWORD]: password,
    };
    DataManager.performPasswordReset(body).then(
      ([isSuccess, message, responseData]) => {
        if (isSuccess === true) {
          setIsLoading(false);
          let _verificationData = responseData?.objects;
          if (_verificationData !== undefined && _verificationData !== null) {
            setIsLoading(false);
            checkVerificationStatus(_verificationData);
          } else {
            Utilities.showToast(t(Translations.FAILED), message, 'error', 'bottom');
            setIsLoading(false);
          }
        } else {
          Utilities.showToast(t(Translations.FAILED), message, 'error', 'bottom');
          setIsLoading(false);
        }
      },
    );
  };

  const MessageAlertModal = () => {
    return (
      <Modal
        isVisible={isModalVisible}
        animationIn={'slideInUp'}
        animationOut={'slideOutDown'}
        onBackdropPress={() => {
          messageAlertOkButtonHandler();
        }}>
        <MessageAlertModalScreen
          onOkAction={messageAlertOkButtonHandler}
          message={alertMessage}
        />
      </Modal>
    );
  };

  const messageAlertOkButtonHandler = () => {
    setModalVisible(false);
  };

  return (
    <>
     <KeyboardAwareScrollView
    enableOnAndroid={true}
    extraHeight={responsiveHeight(40)}
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
        <MessageAlertModal />
        <LoadingIndicator visible={isLoading} />
        <StatusBar
          backgroundColor={Colors.BACKGROUND_COLOR}
          barStyle="dark-content"
        />
        <TouchableOpacity
          style={{
            marginTop: 8,
            backgroundColor: Colors.TRANSPARENT,
            height: 50,
            width: 50,
            marginLeft: 30,
            justifyContent: 'center',
          }}
          onPress={() => cancelButtonAction()}>
          <Image
            source={Images.BACK_ARROW}
            style={{
              width: 24,
              height: 17,
              transform: [{scaleX: I18nManager.isRTL ? -1 : 1}],
            }}
          />
        </TouchableOpacity>
        <Text
          style={{
            marginTop: 16,
            marginLeft: 30,
            marginRight: 30,
            color: Colors.BLACK_COLOR,
            fontFamily: Fonts.Gibson_SemiBold,
            fontSize: 28,
          }}
          numberOfLines={1}>
          {t(Translations.RESET_PASSWORD)}
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
            {t(Translations.RESET_PASSWORD_DESCRIPTION)}
          </Text>

          <View style={{marginTop: 50,marginLeft:30, marginRight: 30}}>
            <View style={{}}>
              <TextInput
                ref={passwordRef}
                style={{
                  backgroundColor: Colors.TRANSPARENT,
                  textAlign: I18nManager.isRTL ? 'right' : 'left',
                  flex:1
                }}
                activeUnderlineColor={Colors.PRIMARY_COLOR}
                secureTextEntry={!isShowPassword}
                error={!isValidPassword}
                // right={
                //   <TextInput.Icon
                //     style={{width: 24, height: 24}}
                //     name={isShowPassword ? 'eye' : 'eye-off-outline'}
                //     onPress={() => setIsShowPassword(!isShowPassword)}
                //     color={
                //       isShowPassword
                //         ? Colors.PRIMARY_COLOR
                //         : Colors.TEXT_PLACEHOLDER_COLOR
                //     }
                //   />
                // }
                //label={Strings.PASSWORD}
                label={
                  <Text
                    style={{
                      fontFamily: Fonts.Gibson_Regular,
                      fontSize: 16,
                      color: Colors.TEXT_GREY_COLOR_9B,
                    }}>
                    {t(Translations.PASSWORD)}
                  </Text>
                }
                value={password}
                onChangeText={text => setPassword(text.trim())}
                returnKeyType={'next'}
                onSubmitEditing={() => {
                  confirmPasswordRef.current.focus();
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
                    name={isShowPassword ? 'eye' : 'eye-off-outline'}
                    onPress={() => setIsShowPassword(!isShowPassword)}
                    color={
                      isShowPassword
                        ? Colors.PRIMARY_COLOR
                        : Colors.TEXT_PLACEHOLDER_COLOR
                    }
                  />

              </View>
              <HelperText type="error" visible={!isValidPassword}>
                {passwordErrorMessage}
              </HelperText>
            
            </View>
            <View style={{marginTop:8}}>
              <TextInput
                ref={confirmPasswordRef}
                style={{
                  backgroundColor: Colors.TRANSPARENT,
                  textAlign: I18nManager.isRTL ? 'right' : 'left',
                }}
                activeUnderlineColor={Colors.PRIMARY_COLOR}
                secureTextEntry={!isShowConfirmPassword}
                error={!isValidConfirmPassword}
                // right={
                //   <TextInput.Icon
                //     style={{width: 24, height: 24}}
                //     name={isShowPassword ? 'eye' : 'eye-off-outline'}
                //     onPress={() =>
                //       setIsShowConfirmPassword(!isShowConfirmPassword)
                //     }
                //     color={
                //       isShowConfirmPassword
                //         ? Colors.PRIMARY_COLOR
                //         : Colors.TEXT_PLACEHOLDER_COLOR
                //     }
                //   />
                //   }
                //label={Strings.PASSWORD}
                label={
                  <Text
                    style={{
                      fontFamily: Fonts.Gibson_Regular,
                      fontSize: 16,
                      color: Colors.TEXT_GREY_COLOR_9B,
                    }}>
                    {t(Translations.CONFIRM_PASSWORD)}
                  </Text>
                }
                value={confirmPassword}
                onChangeText={text => setConfirmPassword(text.trim())}
                returnKeyType={'done'}
                onSubmitEditing={() => {
                  continueButtonAction();
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
                    name={isShowPassword ? 'eye' : 'eye-off-outline'}
                    onPress={() =>
                      setIsShowConfirmPassword(!isShowConfirmPassword)
                    }
                    color={
                      isShowConfirmPassword
                        ? Colors.PRIMARY_COLOR
                        : Colors.TEXT_PLACEHOLDER_COLOR
                    }
/>
              </View>
              </View>
              <HelperText type="error" visible={!isValidConfirmPassword}>
                {confirmPasswordErrorMessage}
              </HelperText>
            </View>
          

          <TouchableOpacity
            style={{
              marginTop: 60,
              backgroundColor: Colors.SECONDARY_COLOR,
              height: 50,
              marginLeft: 30,
              marginRight: 30,
              justifyContent: 'center',
            }}
            onPress={() => continueButtonAction()}>
            <Text
              style={{
                color: Colors.WHITE_COLOR,
                fontSize: 18,
                fontFamily: Fonts.Gibson_SemiBold,
                alignSelf: 'center',
              }}>
              {t(Translations.RESET_NOW)}
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
            onPress={() => cancelButtonAction()}>
            <Text
              style={{
                color: Colors.PRIMARY_COLOR,
                fontSize: 14,
                fontFamily: Fonts.Gibson_SemiBold,
                alignSelf: 'center',
              }}>
              {t(Translations.CANCEL)}
            </Text>
          </TouchableOpacity>
        </InputScrollView>
      </View>
      </KeyboardAwareScrollView>
    </>
  );
};
export default PasswordResetScreen;
