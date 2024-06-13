import React, {useState, useEffect, useRef} from 'react';
import {
  StatusBar,
  Text,
  View,
  Image,
  TouchableOpacity,
  Keyboard,
  Platform,
  ImageBackground,
  I18nManager,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/core';
import InputScrollView from 'react-native-input-scroll-view';
import {HelperText, TextInput} from 'react-native-paper';
import {Translation, useTranslation} from 'react-i18next';
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
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import {LoginManager, Profile, AccessToken} from 'react-native-fbsdk-next';
import {appleAuth} from '@invertase/react-native-apple-authentication';
import {GuestUserAuthSource, BUILD_SOURCE} from '../../../helpers/enums/Enums';
const LoginRegisterScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(false);
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

      // scopes: ['https://www.googleapis.com/auth/drive.readonly'], // what API you want to access on behalf of the user, default is email and profile
      // offlineAccess: true, // if you want to access Google API on behalf of the user FROM YOUR SERVER
      // hostedDomain: '', // specifies a hosted domain restriction
      // forceCodeForRefreshToken: true, // [Android] related to `serverAuthCode`, read the docs link below *.
      // accountName: '', // [Android] specifies an account name on the device that should be used
      // googleServicePlistPath: '', // [iOS] if you renamed your GoogleService-Info file, new name here, e.g. GoogleService-Info-Staging
      // openIdRealm: '', // [iOS] The OpenID2 realm of the home web server. This allows Google to include the user's OpenID Identifier in the OpenID Connect ID token.
      // profileImageSize: 120, // [iOS] The desired height (and width) of the profile image. Defaults to 120px
    });
    const isSignedIn = await GoogleSignin.isSignedIn();
    console.log('isSignedIn', isSignedIn);
    if (isSignedIn) {
      try {
        await GoogleSignin.signOut();
      } catch (error) {
        console.error(error);
      }
    }
  };

  //Button actions
  const loginButtonAction = () => {
    Keyboard.dismiss();
    navigation.navigate('EmailLoginScreen');
  };
  const registerButtonAction = () => {
    Keyboard.dismiss();
    navigation.navigate('RegisterScreen');
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
    navigation.goBack();
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
      console.log('use info ', userInfo);
      if (userInfo?.user?.email !== null) {
        performGoogleSignIn(userInfo?.user?.email, userInfo?.idToken);
      } else {
        Utilities.showToast(
          t(Translations.FAILED),
          'Email is required',
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
  //API Calls
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
      Utilities.showToast(
        t(Translations.FAILED),
        Strings.UNKNOWN_ERROR,
        'error',
        'bottom',
      );
    }
  };

  const navigateToPasswordResetPage = verificationDetails => {
    navigation.navigate('PasswordResetScreen');
  };

  const newUserFoundNavigateToRegister = verificationDetails => {
    navigation.navigate('RegisterUpdateScreen',{isFromOtpValidation:false});
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
  return (
    <>
      <ImageBackground
        style={{
          flex: 1,
          backgroundColor:
            Globals.CUSTOM_BUILD_SOURCE === BUILD_SOURCE.YWAIT
              ? Colors.BACKGROUND_COLOR
              : BUILD_SOURCE.YWAITSERVICES
              ? Colors.BACKGROUND_COLOR
              : Colors.WHITE_COLOR,
          paddingTop: insets.top,
          paddingLeft: insets.left,
          paddingRight: insets.right,
          paddingBottom: insets.bottom,
        }}
        source={
          Globals.CUSTOM_BUILD_SOURCE === BUILD_SOURCE.YWAIT
            ? Images.PAPER_BACKGROUND_IMAGE
            : Globals.CUSTOM_BUILD_SOURCE === BUILD_SOURCE.YWAITSERVICES
            ? Images.PAPER_BACKGROUND_IMAGE
            : Images.NONE
        }>
        <LoadingIndicator visible={isLoading} />
        <StatusBar
          backgroundColor={Colors.BACKGROUND_COLOR}
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
          {Globals.CUSTOM_BUILD_SOURCE === BUILD_SOURCE.YWAIT
          || Globals.CUSTOM_BUILD_SOURCE === BUILD_SOURCE.YWAITSERVICES  ? (
            <Image
              style={{
                height: 644,
                marginTop: -360,
                marginLeft: -158,
                marginRight: -158,
                resizeMode: 'contain',
              }}
              source={
                Globals.CUSTOM_BUILD_SOURCE === BUILD_SOURCE.YWAIT
                || Globals.CUSTOM_BUILD_SOURCE === BUILD_SOURCE.YWAITSERVICES
                  ? Images.SEMI_CIRCLE_IMAGE
                  : null
              }
            />
          ) : null}

          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image
              style={{
                marginTop:
                  Globals.CUSTOM_BUILD_SOURCE === BUILD_SOURCE.YWAIT
                  || Globals.CUSTOM_BUILD_SOURCE === BUILD_SOURCE.YWAITSERVICES
                    ? -270
                    : 25,
                marginLeft: 30,
                height: 24,
                width: 24,
                resizeMode: 'contain',
                transform: [{scaleX: I18nManager.isRTL ? -1 : 1}],
              }}
              source={Images.BACK_ARROW}
            />
          </TouchableOpacity>

          {Globals.CUSTOM_BUILD_SOURCE === BUILD_SOURCE.ASTER ? (
            <View style={{marginTop: 10}}>
              <Image
                style={{
                  height: 150,
                  aspectRatio: 2.1,
                  alignSelf: 'center',
                  resizeMode: 'contain',
                  marginTop: 20,
                }}
                source={Images.ASTER_LOGO}
              />
            </View>
          ) : Globals.CUSTOM_BUILD_SOURCE === BUILD_SOURCE.FIRSTRESPONSE ? (
            <View style={{marginTop: 50}}>
              <Image
                style={{
                  height: 130,
                  aspectRatio: 2.1,
                  alignSelf: 'center',
                  resizeMode: 'contain',
                }}
                source={Images.FIRSTRESPONSE_LOGO}
              />
            </View>
          ) : Globals.CUSTOM_BUILD_SOURCE === BUILD_SOURCE.SPOTLESS ? (
            <View style={{marginTop: 10}}>
              <Image
                style={{
                  height: 150,
                  aspectRatio: 2.1,
                  alignSelf: 'center',
                  resizeMode: 'contain',
                  marginTop: 20,
                }}
                source={Images.SPOTLESS_LOGO}
              />
            </View>
          ) : Globals.CUSTOM_BUILD_SOURCE === BUILD_SOURCE.YWAIT ? (
            <Image
              style={{
                marginTop: -170,
                width: 120,
                height: 46,
                alignSelf: 'center',
                resizeMode: 'contain',
              }}
              source={Images.YWAIT_LOGO}
            />
          ) :
          Globals.CUSTOM_BUILD_SOURCE === BUILD_SOURCE.YWAITSERVICES ? (
            <Image
              style={{
                marginTop: -170,
                width: 120,
                height: 46,
                alignSelf: 'center',
                resizeMode: 'contain',
              }}
              source={Images.YWAIT_LOGO}
            />
          ) : Globals.CUSTOM_BUILD_SOURCE === BUILD_SOURCE.SKILLIKZ ? (
            <View style={{marginTop: 0}}>
              <Image
                style={{
                  height: 96,
                  width: 107,
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
            <View style={{marginTop: 0}}>
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
            </View>
          ) : null}

          <View
            style={{
              flexDirection: 'row',
              marginTop:
                Globals.CUSTOM_BUILD_SOURCE === BUILD_SOURCE.YWAIT ||
                Globals.CUSTOM_BUILD_SOURCE === BUILD_SOURCE.YWAITSERVICES
                  ? 150
                  : Globals.CUSTOM_BUILD_SOURCE === BUILD_SOURCE.ADVENTA
                  ? 30
                  : 100,
              marginLeft: 30,
              marginRight: 30,
            }}>
            <TouchableOpacity
              style={{
                flex: 0.4,
                borderWidth: 1,
                borderColor: Colors.SECONDARY_COLOR,
                height: 50,
                justifyContent: 'center',
                marginBottom: 20,
              }}
              onPress={() => loginButtonAction()}>
              <Text
                style={{
                  color: Colors.SECONDARY_COLOR,
                  fontSize: 16,
                  fontFamily: Fonts.Gibson_SemiBold,
                  alignSelf: 'center',
                }}>
                {t(Translations.LOGIN)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flex: 0.6,
                marginLeft: 8,
                backgroundColor: Colors.SECONDARY_COLOR,
                height: 50,
                justifyContent: 'center',
                marginBottom: 20,
              }}
              onPress={() => registerButtonAction()}>
              <Text
                style={{
                  color: Colors.WHITE_COLOR,
                  fontSize: 16,
                  fontFamily: Fonts.Gibson_SemiBold,
                  alignSelf: 'center',
                }}>
                {t(Translations.REGISTER)}
              </Text>
            </TouchableOpacity>
          </View>
          {/* GOOGLE */}
          {Globals.BUSINESS_DETAILS.enableSocialNetworkIntegration === true ? (
            <View>
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
            </View>
          ) : null}
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

          <TouchableOpacity
            onPress={() => guestButtonAction()}
            style={{marginTop: 20, alignSelf: 'center', marginBottom: 20}}>
            <Text
              style={{
                fontFamily: Fonts.Gibson_Regular,
                fontSize: 16,
                color: Colors.PRIMARY_COLOR,
              }}>
              {t(Translations.CONTINUE_AS_A_GUEST)}
            </Text>
          </TouchableOpacity>

          {Globals.CUSTOM_BUILD_SOURCE === BUILD_SOURCE.SKILLIKZ ? (
            <View style={{marginTop: 10, marginBottom: 16}}>
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
      </ImageBackground>
    </>
  );
};
export default LoginRegisterScreen;
