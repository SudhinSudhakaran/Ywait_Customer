import React, {useEffect, useRef, useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  Platform,
  ImageBackground,
  I18nManager,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Video from 'react-native-video';
import KeyboardManager from 'react-native-keyboard-manager';
import {t} from 'i18next';
import {Colors, Globals, Images, Strings, Translations} from '../../constants';
import StorageManager from '../../helpers/storageManager/StorageManager';
import APIConnections from '../../helpers/apiManager/APIConnections';
import DataManager from '../../helpers/apiManager/DataManager';
import Utilities from '../../helpers/utils/Utilities';
import {BUILD_SOURCE} from '../../helpers/enums/Enums';
const SplashScreen = () => {
  const navigation = useNavigation();
  const refVideo = useRef();
  const splashVideo = Images.DEFAULT_SPLASH_VIDEO;
  const [isAPILoaded, setIsAPILoaded] = useState(false);
  const [isVideoEnded, setIsVideoEnded] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  useEffect(() => {
   
    getBaseURL().then(urlRes => {
      console.log('url Result', urlRes);
      getUrlType();
      //Get user details if logged in
      getIsUserLoggedIn().then(res => {
        Globals.IS_AUTHORIZED = res === 'true' ? true : false;
        getJWTToken().then(_token => {
          Globals.TOKEN = _token;
          if (Globals.IS_AUTHORIZED === true) {
            console.log('Globals.IS_AUTHORIZED', Globals.IS_AUTHORIZED);
            getUserDetails().then(userIfo => {
              Globals.USER_DETAILS = userIfo;
              getSelectedBusinessDetails().then(businessInfo => {
                getBusinessDetails(businessInfo._id || '');
              });
            });
          } else {
            //Check stand alone build to fetch business info
            console.log('Globals.IS_AUTHORIZED', Globals.IS_AUTHORIZED);
            if (Globals.IS_STANDALONE_BUILD === true) {
              getBusinessDetails(Globals.STANDALONE_BUSINESS_ID || '');
            }
          }
        });
      });
    });
  }, []);

  const [time, setTime] = React.useState(0);
  React.useEffect(() => {
     console.log(`<><><><>RTL Splash screen : <><><><>`, `${I18nManager.isRTL}`);
    const timer = setTimeout(
      () => {
        setTime(time + 1);
        if (
          Globals.CUSTOM_BUILD_SOURCE === BUILD_SOURCE.SKILLIKZ ||
          Globals.CUSTOM_BUILD_SOURCE === BUILD_SOURCE.PRINCECOURT ||
          Globals.CUSTOM_BUILD_SOURCE === BUILD_SOURCE.ADVENTA ||
          Globals.CUSTOM_BUILD_SOURCE === BUILD_SOURCE.SPOTLESS ||
          Globals.CUSTOM_BUILD_SOURCE === BUILD_SOURCE.ASTER ||
          Globals.CUSTOM_BUILD_SOURCE === BUILD_SOURCE.FIRSTRESPONSE
        ) {
          updateVideoEndedIfNeeded();
        } else {
          clearTimeout(timer);
        }
      },
      Globals.CUSTOM_BUILD_SOURCE === BUILD_SOURCE.PRINCECOURT
        ? 2000
        : Globals.CUSTOM_BUILD_SOURCE === BUILD_SOURCE.ADVENTA
        ? 2000
        : 6000,
    );
    return () => {
      clearTimeout(timer);
    };
  }, [time]);

  //Local storage fetch
  const getIsUserLoggedIn = async () => {
    return await StorageManager.getIsAuthorized();
  };
  const getJWTToken = async () => {
    return await StorageManager.getSavedToken();
  };
  const getUserDetails = async () => {
    return await StorageManager.getUserDetails();
  };
  const getSelectedBusinessDetails = async () => {
    return await StorageManager.getBusinessDetails();
  };
  const getUrlType = async () => {
    const urlType = await StorageManager.getBaseURLType();
    if (urlType === null || urlType === undefined) {
      StorageManager.saveBaseURL('Prod', APIConnections.DEFAULT_URL);
    }
    const _urlType =
      urlType !== null || urlType === undefined ? urlType : 'Prod';
    APIConnections.URL_TYPE = _urlType;
    console.log('App getUrlType: ', _urlType);
    return urlType;
  };

  const getBaseURL = async () => {
    const baseURL = await StorageManager.getBaseURL();
    if (baseURL === null || baseURL === undefined) {
      StorageManager.saveBaseURL('Prod', APIConnections.DEFAULT_URL);
    }
    const _baseURL =
      baseURL !== null || baseURL === undefined
        ? baseURL
        : APIConnections.DEFAULT_URL;
    APIConnections.BASE_URL = _baseURL;
    console.log('App getBaseURL: ', _baseURL);
    return _baseURL;
  };

  const updateVideoEndedIfNeeded = () => {
    console.log('updateVideoEndedIfNeeded called');
    setIsVideoEnded(true);
    navigateToScreen();
  };

  const navigateToScreen = async () => {
    configureKeyboardManager();

    console.log(
      `navigateToScreen auth: ${Globals.IS_AUTHORIZED} isAPILoaded=${isAPILoaded} isVideoEnded=${isVideoEnded}`,
    );
    if (Globals.IS_AUTHORIZED === true) {
      if (isAPILoaded === true && isVideoEnded === true) {
        console.log('navigateToScreen: DashboardScreen auth=true');
        //Navigate to dashboard
        navigation.reset({
          index: 0,
          routes: [{name: 'DashboardScreen'}],
        });
      }
    } else {
      //Check for standalone build to navigate to dashboard
      if (Globals.IS_STANDALONE_BUILD === true) {
        if (isAPILoaded === true && isVideoEnded === true) {
          //Navigate to dashboard
          navigation.reset({
            index: 0,
            routes: [{name: 'DashboardScreen'}],
          });
        }
      } else {
        console.log('navigateToScreen: BusinessSelectionScreen auth=false');
        //Navigate to business selection
        navigation.reset({
          index: 0,
          routes: [{name: 'BusinessSelectionScreen'}],
        });
      }
    }
  };

  const configureKeyboardManager = () => {
    if (Platform.OS === 'ios') {
      KeyboardManager.setEnable(true);
      KeyboardManager.setToolbarTintColor(Colors.PRIMARY_COLOR);
      KeyboardManager.setToolbarPreviousNextButtonEnable(true);
      KeyboardManager.setShouldShowToolbarPlaceholder(true);
    }
  };

  //Video delegates
  const onVideoError = () => {
    console.log('video error');
    setIsVideoEnded(true);
    navigateToScreen();
  };
  const onVideoEnd = () => {
    console.log('video ended..');
    setIsPaused(true);
    setTimeout(() => {
      if (refVideo?.current !== null) {
        refVideo?.current?.seek(1, 50);
        setIsPaused(false);
      }
    }, 10);
    setIsVideoEnded(true);
    navigateToScreen();
  };

  //API Calls
  /**
       *
       * Purpose: Get selected business details
       * Created/Modified By: Jenson
       * Created/Modified Date: 28 Dec 2021
       * Steps:
           1.fetch business details from API and append to state variable
*/
  const getBusinessDetails = businessId => {
    DataManager.getBusinessDetails(businessId).then(
      ([isSuccess, message, data]) => {
        if (isSuccess === true) {
          if (data !== undefined && data !== null) {
            if (data?.objects !== undefined && data?.objects !== null) {
              //Save business info to local storage
              StorageManager.saveBusinessDetails(data?.objects);
              Globals.BUSINESS_DETAILS = data?.objects;
              Globals.BUSINESS_ID = data?.objects?._id;

              //Update themes
              if (
                data?.objects?.primaryColorCustomer !== undefined &&
                data.objects.primaryColorCustomer !== null &&
                data.objects.primaryColorCustomer !== ''
              ) {
                Colors.PRIMARY_COLOR = data.objects.primaryColorCustomer;
              } else {
                Colors.PRIMARY_COLOR = '#FF5264';
              }
              if (
                data?.objects?.secondaryColorCustomer !== undefined &&
                data.objects.secondaryColorCustomer !== null &&
                data.objects.secondaryColorCustomer !== ''
              ) {
                Colors.SECONDARY_COLOR = data.objects.secondaryColorCustomer;
              } else {
                Colors.SECONDARY_COLOR = '#5F73FC';
              }
              setIsAPILoaded(true);
              //Navigate to next screen
              navigateToScreen();
            }
          } else {
            Utilities.showToast(
              t(Translations.FAILED),
              message,
              'error',
              'bottom',
            );
          }
        } else {
          Utilities.showToast(
            t(Translations.FAILED),
            message,
            'error',
            'bottom',
          );
        }
      },
    );
  };

  return (
    <>
      {Globals.CUSTOM_BUILD_SOURCE === BUILD_SOURCE.ASTER ? (
        <>
          <ImageBackground
            style={{flex: 1, resizeMode: 'contain'}}
            source={Images.ASTER_SPLASH_SCREEN}
          />
        </>
      ) : Globals.CUSTOM_BUILD_SOURCE === BUILD_SOURCE.FIRSTRESPONSE ? (
       <>
       <ImageBackground
            style={{flex: 1, resizeMode: 'contain'}}
            source={Images.FIRSTRESPONSE_SPLASH_SCREEN}
          />
       </>
      ) :
       Globals.CUSTOM_BUILD_SOURCE === BUILD_SOURCE.SPOTLESS ? (
        <>
          <ImageBackground
            style={{flex: 1, resizeMode: 'contain'}}
            source={Images.SPOTLESS_SPLASH_IMAGE}
          />
        </>
      ) : Globals.CUSTOM_BUILD_SOURCE === BUILD_SOURCE.SKILLIKZ ? (
        <>
          <ImageBackground
            style={{flex: 1, resizeMode: 'contain'}}
            source={Images.SKILLIKZ_SPLASH_ANIMATION}
          />
        </>
      ) : Globals.CUSTOM_BUILD_SOURCE === BUILD_SOURCE.PRINCECOURT ? (
        <>
          <ImageBackground
            style={{flex: 1}}
            source={Images.PRINCE_COURT_SPLASH_SCREEN}
          />
        </>
      ) : Globals.CUSTOM_BUILD_SOURCE === BUILD_SOURCE.ADVENTA ? (
        <>
          <ImageBackground
            style={{flex: 1}}
            source={Images.ADVENTA_SPLASH_SCREEN}
          />
        </>
      ) : (
        <>
          <Video
            source={splashVideo}
            ref={refVideo}
            style={styles.backgroundVideo}
            resizeMode={'contain'}
            paused={isPaused}
            onEnd={() => onVideoEnd()}
            onError={() => onVideoError()}
          />
        </>
      )}

      <Text
        style={{
          color: Colors.TEXT_PLACEHOLDER_COLOR,
          position: 'absolute',
          bottom: 20,
          left: 0,
          right: 0,
          textAlign: 'center',
        }}>
        {Strings.APP_VERSION_NUMBER}
      </Text>
    </>
  );
};

const styles = StyleSheet.create({
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    backgroundColor: Colors.SPLASH_BACKGROUND_COLOR,
  },
});

export default SplashScreen;
