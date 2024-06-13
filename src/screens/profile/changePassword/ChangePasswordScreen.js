import React, {useState, useEffect, useRef} from 'react';
import {
  StatusBar,
  Text,
  View,
  Image,
  TouchableOpacity,
  Keyboard,
  ScrollView,
  I18nManager,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/core';
import InputScrollView from 'react-native-input-scroll-view';
import {HelperText, TextInput} from 'react-native-paper';
import OTPInputView from '@twotalltotems/react-native-otp-input';
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
} from '../../../constants';
import Utilities from '../../../helpers/utils/Utilities';
import DataManager from '../../../helpers/apiManager/DataManager';
import LoadingIndicator from '../../shared/loadingIndicator/LoadingIndicator';
import StorageManager from '../../../helpers/storageManager/StorageManager';
import APIConnections from '../../../helpers/apiManager/APIConnections';
import MessageAlertModalScreen from '../../shared/messageAlertModal/MessageAlertModalScreen';
import {t} from 'i18next';
const ChangePasswordScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  //Declaration
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isShowOldPassword, setIsShowOldPassword] = useState(false);
  const [isShowPassword, setIsShowPassword] = useState(false);
  const [isShowConfirmPassword, setIsShowConfirmPassword] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  //Validations
  const [isValidOldPassword, setIsValidOldPassword] = useState(true);
  const [isValidPassword, setIsValidPassword] = useState(true);
  const [isValidConfirmPassword, setIsValidConfirmPassword] = useState(true);
  const [oldPasswordErrorMessage, setOldPasswordErrorMessage] = useState('');
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
  const [confirmPasswordErrorMessage, setConfirmPasswordErrorMessage] =
    useState('');
  //refs
  const oldPasswordRef = useRef();
  const passwordRef = useRef();
  const confirmPasswordRef = useRef();

  //Button actions
  const continueButtonAction = () => {
    Keyboard.dismiss();
    if (isValidInputs() === true) {
      //api call
      performChangePassword();
    }
  };

  const cancelButtonAction = () => {
    Keyboard.dismiss();
    navigation.goBack();
  };

  //Other functions
  const isValidInputs = () => {
    console.log('businessdetail',Globals.BUSINESS_DETAILS);
    console.log('primarycolor',Colors.PRIMARY_COLOR);
    var _isValidOldPassword = 0;
    var _isValidPassword = 0;
    var _isValidConfirmPassword = 0;
    if (oldPassword.length===0) {
      setOldPasswordErrorMessage(
        t(Translations.OLD_PASSWORD_IS_REQUIRED),
      );
      setIsValidOldPassword(false);
      _isValidOldPassword = 0;
    } else if (oldPassword.length < 8 && oldPassword.length > 0) {
      setOldPasswordErrorMessage(
        t(Translations.PASSWORD_MIN_LENGTH_VALIDATION_TEXT),
      );
      setIsValidOldPassword(false);
      _isValidOldPassword = 0;
    } else {
      setOldPasswordErrorMessage('');
      setIsValidOldPassword(true);
      _isValidOldPassword = 1;
    }

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

    if (confirmPassword.length < 8 && confirmPassword.length > 0) {
      setConfirmPasswordErrorMessage(
        t(Translations.PASSWORD_MIN_LENGTH_VALIDATION_TEXT),
      );
      setIsValidConfirmPassword(false);
      _isValidConfirmPassword = 0;
    } else if (confirmPassword.length === 0) {
      setConfirmPasswordErrorMessage(
        t(Translations.CONFIRM_PASSWORD_IS_REQUIRED),
      );
      setIsValidConfirmPassword(false);
      _isValidConfirmPassword = 0;
    } else if (confirmPassword !== password) {
      setConfirmPasswordErrorMessage(t(Translations.PASSWORD_DO_NOT_MATCH));
      setIsValidConfirmPassword(false);
      _isValidConfirmPassword = 0;
    } else {
      setConfirmPasswordErrorMessage('');
      setIsValidConfirmPassword(true);
      _isValidConfirmPassword = 1;
    }

    if (
      _isValidOldPassword === 1 &&
      _isValidConfirmPassword === 1 &&
      _isValidPassword === 1
    ) {
      return true;
    } else {
      return false;
    }
  };

  //API Calls
  const performChangePassword = () => {
    setIsLoading(true);
    const body = {
      [APIConnections.KEYS.OLD_PASSWORD]: oldPassword,
      [APIConnections.KEYS.NEW_PASSWORD]: confirmPassword,
      [APIConnections.KEYS.BUSINESS_ID]: Globals.BUSINESS_DETAILS._id,
      [APIConnections.KEYS.CUSTOMER_ID]: Globals.USER_DETAILS._id,
    };
    DataManager.performChangePassword(body).then(
      ([isSuccess, message, responseData]) => {
        if (isSuccess === true) {
          //Show alert
          setIsLoading(false);
          setAlertMessage(message);
          setModalVisible(true);
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
    StorageManager.clearUserRelatedData();
    //Navigate to login screen
    let businessDetails = Globals.BUSINESS_DETAILS;
    if (businessDetails !== undefined && businessDetails !== null) {
      if (businessDetails.authenticationType?.length > 0) {
        if (businessDetails.authenticationType?.includes('email')) {
          //Navigate to Email login page
          navigation.reset({
            index: 0,
            routes: [{name: 'EmailLoginScreen'}],
          });
        } else {
          //Navigate to Phone number login page
          navigation.reset({
            index: 0,
            routes: [{name: 'PhoneLoginScreen'}],
          });
        }
      }
    }
  };

  return (
    <>
      <KeyboardAwareScrollView
    enableOnAndroid={true}
    extraHeight={responsiveHeight(47)}
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
            textAlign: 'left',
          }}
          numberOfLines={1}>
          {t(Translations.CHANGE_PASSWORD)}
        </Text>

        <ScrollView
           keyboardOffset={45}
           keyboardShouldPersistTaps="handled"
          bounces={false}
            contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'flex-start',
          }}
        >
          <Text
            style={{
              marginTop: 64,
              marginLeft: 30,
              marginRight: 30,
              color: Colors.BLACK_COLOR,
              fontFamily: Fonts.Gibson_Regular,
              fontSize: 17,
              textAlign: 'left',
            }}
            numberOfLines={3}>
            {t(Translations.CHANGE_PASSWORD_DESCRIPTION)}
          </Text>

          <View style={{marginTop: 50, marginLeft: 30, marginRight: 30}}>
            <View style={{}}>
              
                <TextInput
                  ref={oldPasswordRef}
                  style={{
                    backgroundColor: Colors.TRANSPARENT,
                    textAlign: I18nManager.isRTL ? 'right' : 'left',
                    flex: 1,
                  }}
                  activeUnderlineColor={Colors.PRIMARY_COLOR}
                  secureTextEntry={!isShowOldPassword}
                  error={!isValidOldPassword}
                  //label={Strings.PASSWORD}
                  label={
                    <Text
                      style={{
                        fontFamily: Fonts.Gibson_Regular,
                        fontSize: 16,
                        color: Colors.TEXT_GREY_COLOR_9B,
                      }}>
                      {t(Translations.OLD_PASSWORD)}
                    </Text>
                  }
                  value={oldPassword}
                  onChangeText={text => setOldPassword(text.trim())}
                  returnKeyType={'done'}
                  onSubmitEditing={() => {
                    passwordRef.current.focus();
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
                    name={isShowOldPassword ? 'eye' : 'eye-off-outline'}
                    onPress={() => setIsShowOldPassword(!isShowOldPassword)}
                    color={
                      isShowOldPassword
                        ? Colors.PRIMARY_COLOR
                        : Colors.TEXT_PLACEHOLDER_COLOR
                    }
                  />
                </View>
              
              <HelperText type="error" visible={!isValidOldPassword}>
                {oldPasswordErrorMessage}
              </HelperText>
            </View>
            <View style={{}}>
              <View style={{flexDirection: 'row'}}>
                <TextInput
                  ref={passwordRef}
                  style={{
                    backgroundColor: Colors.TRANSPARENT,
                    textAlign: I18nManager.isRTL ? 'right' : 'left',
                    flex: 1,
                  }}
                  activeUnderlineColor={Colors.PRIMARY_COLOR}
                  secureTextEntry={!isShowPassword}
                  error={!isValidPassword}
                  //label={Strings.PASSWORD}
                  label={
                    <Text
                      style={{
                        fontFamily: Fonts.Gibson_Regular,
                        fontSize: 16,
                        color: Colors.TEXT_GREY_COLOR_9B,
                      }}>
                      {t(Translations.NEW_PASSWORD)}
                    </Text>
                  }
                  value={password}
                  onChangeText={text => setPassword(text.trim())}
                  returnKeyType={'done'}
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
              </View>

              <HelperText type="error" visible={!isValidPassword}>
                {passwordErrorMessage}
              </HelperText>
            </View>
            <View style={{marginTop: 8}}>
              <View style={{flexDirection: 'row'}}>
                <TextInput
                  ref={confirmPasswordRef}
                  style={{
                    backgroundColor: Colors.TRANSPARENT,
                    textAlign: I18nManager.isRTL ? 'right' : 'left',
                    flex: 1,
                  }}
                  activeUnderlineColor={Colors.PRIMARY_COLOR}
                  secureTextEntry={!isShowConfirmPassword}
                  error={!isValidConfirmPassword}
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
                    name={isShowConfirmPassword ? 'eye' : 'eye-off-outline'}
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
              {t(Translations.CHANGE_NOW)}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
      </KeyboardAwareScrollView>
    </>
  );
};
export default ChangePasswordScreen;
