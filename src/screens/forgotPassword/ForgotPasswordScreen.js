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
import Modal from 'react-native-modal';
import {t} from 'i18next';
import {Colors, Fonts, Globals, Images, Strings,Translations} from '../../constants';
import Utilities from '../../helpers/utils/Utilities';
import DataManager from '../../helpers/apiManager/DataManager';
import LoadingIndicator from '../shared/loadingIndicator/LoadingIndicator';
import StorageManager from '../../helpers/storageManager/StorageManager';
import APIConnections from '../../helpers/apiManager/APIConnections';
import MessageAlertModalScreen from '../shared/messageAlertModal/MessageAlertModalScreen';

const ForgotPasswordScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  //Declaration
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  //Validations
  const [isValidEmail, setIsValidEmail] = useState(true);
  //refs
  const emailRef = useRef();

  //Button actions
  const continueButtonAction = () => {
    Keyboard.dismiss();
    if (isValidInputs() === true) {
      //api call
      performForgotPassword();
    }
  };

  const cancelButtonAction = () => {
    Keyboard.dismiss();
    navigation.goBack();
  };

  //Other functions
  const isValidInputs = () => {
    var _isValidEmail = 0;
    if (Utilities.isEmailValid(email) !== true) {
      setIsValidEmail(false);
      _isValidEmail = 0;
    } else {
      setIsValidEmail(true);
      _isValidEmail = 1;
    }

    if (_isValidEmail === 1) {
      return true;
    } else {
      return false;
    }
  };

  //API Calls
  const performForgotPassword = () => {
    setIsLoading(true);
    const body = {
      [APIConnections.KEYS.EMAIL]: email,
      [APIConnections.KEYS.BUSINESS_ID]: Globals.BUSINESS_ID,
    };
    DataManager.performForgotPassword(body).then(
      ([isSuccess, message, responseData]) => {
        if (isSuccess === true) {
          setIsLoading(false);
          setAlertMessage(Strings.FORGOT_PASSWORD_SUCCESS);
          setModalVisible(true);
        } else {
          Utilities.showToast('Failed!', message, 'error', 'bottom');
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
    navigation.goBack();
  };

  return (
    <>
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
          {t(Translations.FORGOT_PASSWORD_TITLE)}
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
            {t(Translations.FORGOT_PASSWORD_DESCRIPTION)}
          </Text>

          <View style={{marginTop: 70, marginLeft: 30, marginRight: 30}}>
            <TextInput
              ref={emailRef}
              style={{
                backgroundColor: Colors.TRANSPARENT,
                textAlign: I18nManager.isRTL ? 'right' : 'left',
              }}
              activeUnderlineColor={Colors.PRIMARY_COLOR}
              error={!isValidEmail}
              //label={Strings.EMAIL_ADDRESS}
              label={
                <Text
                  style={{
                    fontFamily: Fonts.Gibson_Regular,
                    fontSize: 16,
                    color: Colors.TEXT_GREY_COLOR_9B,
                  }}>
                  {t(Translations.EMAIL_ADDRESS)}
                </Text>
              }
              value={email}
              onChangeText={text => setEmail(text)}
              keyboardType={'email-address'}
              autoCapitalize={'none'}
              autoComplete={'off'}
              autoCorrect={false}
              returnKeyType={'done'}
              onSubmitEditing={() => {
                continueButtonAction();
              }}
            />
            <HelperText type="error" visible={!isValidEmail}>
              {t(Translations.INVALID_EMAIL_ADDRESS)}
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
              {t(Translations.SENT)}
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
    </>
  );
};
export default ForgotPasswordScreen;
