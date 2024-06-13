import React, {useState, useEffect, useRef} from 'react';
import {
  StatusBar,
  Text,
  View,
  Image,
  TouchableOpacity,
  Keyboard,
  Platform,
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
import Utilities from '../../../helpers/utils/Utilities';
import DataManager from '../../../helpers/apiManager/DataManager';
import LoadingIndicator from '../../shared/loadingIndicator/LoadingIndicator';
import StorageManager from '../../../helpers/storageManager/StorageManager';
import APIConnections from '../../../helpers/apiManager/APIConnections';
import {GuestUserAuthSource, BUILD_SOURCE} from '../../../helpers/enums/Enums';
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {LoginManager, Profile, AccessToken} from 'react-native-fbsdk-next';
import {appleAuth} from '@invertase/react-native-apple-authentication';
import {useTranslation} from 'react-i18next';
import {responsiveHeight} from 'react-native-responsive-dimensions';
import PasswordTextInput from '../../shared/textInputs/PasswordTextInput';
const EmailLoginScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isShowPassword, setIsShowPassword] = useState(false);
  //Validations
  const [isValidEmail, setIsValidEmail] = useState(true);
  const [isValidPassword, setIsValidPassword] = useState(true);
  console.log(`isvalidEmail:${isValidEmail}`);
  const[emailErrorText,setEmailErrorText]=useState('')
  const[passwordError,setPasswordError]=useState('')
  //refs
  const emailRef = useRef();
  const passwordRef = useRef();
  const {t, i18n} = useTranslation();
  useEffect(() => {
    configureGoogleSignIn();
    return () => {};
  }, []);
  const configureGoogleSignIn = async () => {
    GoogleSignin.configure({
      webClientId:
        '895691039937-ctm8bs8nlh3vriud681hedls4sopjh4v.apps.googleusercontent.com',
      iosClientId:
        '895691039937-g0l8p4pipqchtklridreiahjp84mnb56.apps.googleusercontent.com',
    });
    const isSignedIn = await GoogleSignin.isSignedIn();
    if (isSignedIn) {
      try {
        await GoogleSignin.signOut();
      } catch (error) {
        console.error(error);
      }
    }
  };

  //Button actions
  const continueButtonAction = () => {
    Keyboard.dismiss();
    isValidInputs()
    
  };
  const forgotButtonAction = () => {
    Keyboard.dismiss();
    resetValidation();
    //Navigate to forgot password screen
    navigation.navigate('ForgotPasswordScreen');
  };
  const googleButtonAction = () => {
    Keyboard.dismiss();
    googlSignIn();
  };
  const facebookButtonAction = () => {
    Keyboard.dismiss();
    LoginManager.logInWithPermissions().then(
      function (result) {
        if (result.isCancelled) {
          console.log('Login Cancelled ', JSON.stringify(result));
        } else {
          console.log('Login Success ', result);
          AccessToken.getCurrentAccessToken().then(data => {
            const {accessToken} = data;
            initFacebookUser(accessToken);
          });
        }
      },
      function (error) {
        console.log('Login failed with error: ', error);
      },
    );
  };
  async function appleButtonAction() {
    Keyboard.dismiss();
    // performs login request
    const appleAuthRequestResponse = await appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.LOGIN,
      requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
    });
    console.log('response.user', appleAuthRequestResponse.user);
    console.log('appleToken', appleAuthRequestResponse.identityToken);
    console.log('appleEmail', appleAuthRequestResponse.email);
    if (appleAuthRequestResponse.email !== null) {
      performAppleSignIn(
        appleAuthRequestResponse.email,
        appleAuthRequestResponse.identityToken,
      );
    } else {
      Utilities.showToast(
        t(Translations.FAILED),
        'Email is required',
        'error',
        'bottom',
      );
    }
    // get current authentication state for user
    // /!\ This method must be tested on a real device. On the iOS simulator it always throws an error.
    const credentialState = await appleAuth.getCredentialStateForUser(
      appleAuthRequestResponse.user,
    );

    // use credentialState response to ensure the user is authenticated
    if (credentialState === appleAuth.State.AUTHORIZED) {
      // user is authenticated
    }
  }
  const guestButtonAction = () => {
    Keyboard.dismiss();
  };
  /**
       * Purpose:google sign in action
       * Created/Modified By: Vijin
       * Created/Modified Date: 24 Feb 2021
       * Steps:
    
    */
  const googlSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      console.log(userInfo);
      if (userInfo?.user?.email !== null) {
        performGoogleSignIn(userInfo?.user?.email, userInfo?.idToken);
      } else {
        Utilities.showToast(
          t(Translations.FAILED),
          t(Translations.EMAIL_IS_REQUIRED),
          'error',
          'bottom',
        );
      }
    } catch (error) {
      console.log(error);
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled the login flow
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // operation (e.g. sign in) is in progress already
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        // play services not available or outdated
      } else {
        // some other error happened
      }
    }
  };
  /**
   * Purpose:initialise facebook user details
   * Created/Modified By: Vijin
   * Created/Modified Date: 25 Feb 2021
   * Steps:
      https://stackoverflow.com/questions/37471905/how-to-get-user-info-email-name-etc-from-the-react-native-fbsdk

*/
  const initFacebookUser = accessToken => {
    fetch(
      'https://graph.facebook.com/v2.5/me?fields=email,name,friends&access_token=' +
        accessToken,
    )
      .then(response => response.json())
      .then(json => {
        console.log(json);
        if (json.email !== null) {
          performFacebookSignIn(json.email, json.id);
        } else {
          Utilities.showToast(
            t(Translations.FAILED),
            t(Translations.EMAIL_IS_REQUIRED),
            'error',
            'bottom',
          );
        }
      })
      .catch(() => {
        console.log('ERROR GETTING DATA FROM FACEBOOK');
      });
  };
  //Other functions

  

  const isValidInputs = () => {
    var _isValidEmail = 0;
    var _isValidPassword = 0;
    if (Utilities.isEmailValid(email) !== true) {
      setEmailErrorText(t(Translations.INVALID_EMAIL_ADDRESS))
      _isValidEmail = 0;
    } else {
      setEmailErrorText('')
      _isValidEmail = 1;
    }
    if (password.length > 0) {
      setPasswordError('')
      _isValidPassword = 1;
    } else {
      setPasswordError(t(Translations.INVALID_PASSWORD))
      _isValidPassword = 0;
    }
    if (_isValidEmail === 1 && _isValidPassword === 1) {
      performLogin()
    }
  };

  const resetValidation = () => {
    setIsValidEmail(true);
    setIsValidPassword(true);
    setEmail('');
    setPassword('');
  };

  const checkVerificationStatus = verificationDetails => {
    if (verificationDetails !== undefined && verificationDetails !== null) {
      Globals.TEMP_USER_DETAILS = verificationDetails;
      if (verificationDetails?.canRestPassword === true) {
        //Password reset required, Navigating to password resent page
        navigateToPasswordResetPage(verificationDetails);
      } else if (verificationDetails?.isProfileUpdated === true) {
        //Existing user found. Navigating user to source and save user details
        existingUserAuthorizationSuccess(verificationDetails);
      } else {
        //New user found. Navigating user to register update screen
        newUserFoundNavigateToRegister(verificationDetails);
      }
    } else {
      Utilities.showToast('Failed!', Strings.UNKNOWN_ERROR, 'error', 'bottom');
    }
  };

  const navigateToPasswordResetPage = verificationDetails => {
    navigation.navigate('PasswordResetScreen');
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
  const performLogin = () => {
    setIsLoading(true);
    const body = {
      [APIConnections.KEYS.EMAIL]: email,
      [APIConnections.KEYS.PASSWORD]: password,
      [APIConnections.KEYS.BUSINESS_ID]: Globals.BUSINESS_ID,
    };
    DataManager.performEmailLogin(body).then(
      ([isSuccess, message, responseData]) => {
        if (isSuccess === true) {
          let _verificationData = responseData?.objects;
          if (_verificationData !== undefined && _verificationData !== null) {
            setIsLoading(false);
            checkVerificationStatus(_verificationData);
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
  /**
          * Purpose:perform google sign in
          * Created/Modified By: Vijin
          * Created/Modified Date: 24 Feb 2021
          * Steps:
       
       */
  const performGoogleSignIn = (email, idToken) => {
    setIsLoading(true);
    const body = {
      [APIConnections.KEYS.EMAIL]: email,
      [APIConnections.KEYS.EMAIL_ID]: idToken,
      [APIConnections.KEYS.BUSINESS_ID]: Globals.BUSINESS_ID,
    };
    DataManager.performGoogleSignIn(body).then(
      ([isSuccess, message, responseData]) => {
        if (isSuccess === true) {
          let _verificationData = responseData?.objects;
          if (_verificationData !== undefined && _verificationData !== null) {
            setIsLoading(false);
            checkVerificationStatus(_verificationData);
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

  /**
      * Purpose:perform google sign in
      * Created/Modified By: Vijin
      * Created/Modified Date: 24 Feb 2021
      * Steps:
    
    */
  const performFacebookSignIn = (email, idToken) => {
    setIsLoading(true);
    const body = {
      [APIConnections.KEYS.EMAIL]: email,
      [APIConnections.KEYS.FACEBOOK_ID]: idToken,
      [APIConnections.KEYS.BUSINESS_ID]: Globals.BUSINESS_ID,
    };
    DataManager.performFacebookSignIn(body).then(
      ([isSuccess, message, responseData]) => {
        if (isSuccess === true) {
          let _verificationData = responseData?.objects;
          if (_verificationData !== undefined && _verificationData !== null) {
            setIsLoading(false);
            checkVerificationStatus(_verificationData);
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

  /**
      * Purpose:perform google sign in
      * Created/Modified By: Vijin
      * Created/Modified Date: 24 Feb 2021
      * Steps:
    
    */
  const performAppleSignIn = (email, idToken) => {
    setIsLoading(true);
    const body = {
      [APIConnections.KEYS.EMAIL]: email,
      [APIConnections.KEYS.APPLE_ID]: idToken,
      [APIConnections.KEYS.BUSINESS_ID]: Globals.BUSINESS_ID,
    };
    DataManager.performAppleSignIn(body).then(
      ([isSuccess, message, responseData]) => {
        if (isSuccess === true) {
          let _verificationData = responseData?.objects;
          if (_verificationData !== undefined && _verificationData !== null) {
            setIsLoading(false);
            checkVerificationStatus(_verificationData);
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
    extraHeight={responsiveHeight(40)}
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
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image
              style={{
                marginTop: 16,
                marginLeft: 30,
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
              textAlign: 'left',
              fontFamily: Fonts.Gibson_SemiBold,
              fontSize:
                Globals.CUSTOM_BUILD_SOURCE === BUILD_SOURCE.SKILLIKZ ? 20 : 28,
            }}
            numberOfLines={1}>
            {t(Translations.LOGIN)}
          </Text>

          {Globals.CUSTOM_BUILD_SOURCE === BUILD_SOURCE.ASTER ? (
            <View style={{marginTop: 10}}>
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
          ) : Globals.CUSTOM_BUILD_SOURCE === BUILD_SOURCE.FIRSTRESPONSE ? (
            <View style={{marginTop: 10}}>
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
          ) : Globals.CUSTOM_BUILD_SOURCE === BUILD_SOURCE.YWAIT ? (
            <View style={{marginTop: 60}}>
              <Image
                style={{
                  height: 80,
                  aspectRatio: 2.1,
                  alignSelf: 'center',
                  resizeMode: 'contain',
                }}
                source={Images.YWAIT_LOGO}
              />
            </View>
          ) :  Globals.CUSTOM_BUILD_SOURCE === BUILD_SOURCE.YWAITSERVICES ? (
            <View style={{marginTop: 60}}>
              <Image
                style={{
                  height: 80,
                  aspectRatio: 2.1,
                  alignSelf: 'center',
                  resizeMode: 'contain',
                }}
                source={Images.YWAIT_LOGO}
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
                  height: 76,
                  width: 84,
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
              {/* <Image
                style={{
                  marginTop: 8,
                  height: 35,
                  width: 155,
                  alignSelf: 'center',
                  resizeMode: 'contain',
                }}
                source={Images.SKILLIKZ_Q_TEXT_IMAGE}
              /> */}
            </View>
          ) : Globals.CUSTOM_BUILD_SOURCE === BUILD_SOURCE.ADVENTA ? (
            <View style={{marginTop: 0}}>
              <Image
                style={{
                  height: 250,
                  width: 250,
                  alignSelf: 'center',
                  resizeMode: 'contain',
                }}
                source={Images.ADVENTA_ICON}
              />
              {/* <Image
                style={{
                  marginTop: 8,
                  height: 35,
                  width: 155,
                  alignSelf: 'center',
                  resizeMode: 'contain',
                }}
                source={Images.SKILLIKZ_Q_TEXT_IMAGE}
              /> */}
            </View>
          ) : null}

          <View
            style={{
              marginTop:
                Globals.CUSTOM_BUILD_SOURCE === BUILD_SOURCE.ADVENTA ? 0 : 50,
              marginLeft: 30,
              marginRight: 30,
            }}>
            <View style={{}}>
              <TextInput
                ref={emailRef}
                style={{
                  backgroundColor: Colors.TRANSPARENT,
                  textAlign: I18nManager.isRTL ? 'right' : 'left',
                }}
                activeUnderlineColor={Colors.PRIMARY_COLOR}
                error={!isValidEmail}
                //  label={Strings.EMAIL_ADDRESS}
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
                returnKeyType={'next'}
                onSubmitEditing={() => {
                  passwordRef.current.focus();
                }}
              />
              { <HelperText type="error" visible={true}>
                {emailErrorText}
              </HelperText> }
            </View>
            <View style={{marginTop: 16}}>
              {/* <TextInput
                ref={passwordRef}
                style={{
                  backgroundColor: Colors.TRANSPARENT,
                  textAlign: I18nManager.isRTL ? 'right' : 'left',
                }}
                activeUnderlineColor={Colors.PRIMARY_COLOR}
                secureTextEntry={!isShowPassword}
                error={!isValidPassword}
                right={
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
                }
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
                onChangeText={text => setPassword(text)}
                returnKeyType={'done'}
                onSubmitEditing={() => {
                  continueButtonAction();
                }}
              /> */}
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
                      {t(Translations.PASSWORD)}
                    </Text>
                  }
                  value={password}
                  onChangeText={text => setPassword(text.trim())}
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
                    onPress={() => setIsShowPassword(!isShowPassword)}
                    color={
                      isShowPassword
                        ? Colors.PRIMARY_COLOR
                        : Colors.TEXT_PLACEHOLDER_COLOR
                    }
                  />
                </View>
              </View>
              { <HelperText type="error" visible={true}>
                {passwordError}
              </HelperText> }
            </View>
          </View>

          <TouchableOpacity
            style={{
              marginTop: 30,
              height: 20,
              marginLeft: 30,
              marginRight: 30,
              alignSelf: 'flex-end',
            }}
            onPress={() => forgotButtonAction()}>
            <Text
              style={{
                color: Colors.PRIMARY_COLOR,
                fontSize: 16,
                fontFamily: Fonts.Gibson_Regular,
                alignSelf: 'center',
                textDecorationLine: 'underline',
              }}>
              {t(Translations.FORGOT_PASSWORD)}
            </Text>
          </TouchableOpacity>

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

          {/* GOOGLE */}
          <TouchableOpacity
            style={{
              marginTop: 25,
              height: 50,
              marginLeft: 25,
              marginRight: 25,
              justifyContent: 'center',
              borderColor: '#FF4539',
              borderWidth: 1,
              borderRadius: 2,
            }}
            onPress={() => googleButtonAction()}>
            <Text
              style={{
                color: '#FF4539',
                fontSize: 16,
                fontFamily: Fonts.Gibson_SemiBold,
                alignSelf: 'center',
              }}>
              {t(Translations.CONTINUE_WITH_GOOGLE)}
            </Text>
            <Image
              style={{
                height: 24,
                width: 24,
                resizeMode: 'contain',
                position: 'absolute',
                left: 12,
              }}
              source={Images.GOOGLE_LOGO}
            />
          </TouchableOpacity>

          {/* FACEBOOK */}
          <TouchableOpacity
            style={{
              marginTop: 16,
              height: 50,
              marginLeft: 25,
              marginRight: 25,
              justifyContent: 'center',
              borderColor: '#1C33A6',
              borderWidth: 1,
              borderRadius: 2,
            }}
            onPress={() => facebookButtonAction()}>
            <Text
              style={{
                color: '#1C33A6',
                fontSize: 16,
                fontFamily: Fonts.Gibson_SemiBold,
                alignSelf: 'center',
              }}>
              {t(Translations.CONTINUE_WITH_FACEBOOK)}
            </Text>
            <Image
              style={{
                height: 24,
                width: 24,
                resizeMode: 'contain',
                position: 'absolute',
                left: 12,
              }}
              source={Images.FACEBOOK_LOGO}
            />
          </TouchableOpacity>

          {/* APPLE */}
          {Platform.OS === 'ios' ? (
            <TouchableOpacity
              style={{
                marginTop: 16,
                height: 50,
                marginLeft: 25,
                marginRight: 25,
                justifyContent: 'center',
                borderColor: Colors.BLACK_COLOR,
                borderWidth: 1,
                borderRadius: 2,
              }}
              onPress={() => appleButtonAction()}>
              <Text
                style={{
                  color: Colors.BLACK_COLOR,
                  fontSize: 16,
                  fontFamily: Fonts.Gibson_SemiBold,
                  alignSelf: 'center',
                }}>
                {t(Translations.CONTINUE_WITH_APPLE)}
              </Text>
              <Image
                style={{
                  height: 24,
                  width: 24,
                  resizeMode: 'contain',
                  position: 'absolute',
                  left: 12,
                }}
                source={Images.APPLE_LOGO}
              />
            </TouchableOpacity>
          ) : null}

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
export default EmailLoginScreen;
