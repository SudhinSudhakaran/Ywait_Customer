import React, {useState, useEffect, useRef} from 'react';
import {
  StatusBar,
  Text,
  View,
  Image,
  TouchableOpacity,
  Keyboard,
  I18nManager,
  Platform,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation, useFocusEffect} from '@react-navigation/core';
import RNRestart from 'react-native-restart';
import i18next from 'i18next';
import {useTranslation} from 'react-i18next';
import {
  Colors,
  Fonts,
  Globals,
  Images,
  Strings,
  Translations,
} from '../../../constants';
import LoadingIndicator from '../../shared/loadingIndicator/LoadingIndicator';
import AwesomeAlert from 'react-native-awesome-alerts';
import StorageManager from '../../../helpers/storageManager/StorageManager';

const LanguageListScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const {t, i18n} = useTranslation();
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [cancelButtonText, setCancelButtonText] = useState('');
  const [confirmButtonText, setConfirmButtonText] = useState('');
  const [selectedOption, setSelectedOption] = useState(null);
  const [alertAction, setAlertAction] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(
    Globals.SELECTED_LANGUAGE === 'ar'
      ? 'Arabic'
      : Globals.SELECTED_LANGUAGE === 'mal'
      ? 'Malayalam'
      : 'English',
  );
  const [showLoader, setShowLoader] = useState(false);
  useEffect(() => {
    console.log('Globals.SELECTED_LANGUAGE', Globals.SELECTED_LANGUAGE);
    return () => {};
  }, []);

  const _languageSwitchingAction = () => {
    setShowAlert(false);
    setShowLoader(true);
    if (selectedOption !== null) {
      if (selectedOption === 'English') {
        onPressEnglishOk();
      } else if (selectedOption === 'Arabic') {
        onPressOk();
      } else if (selectedOption === 'Malayalam') {
        // onPressMalayalamOk();
      }
    }
  };
  // Button Actions

  const onPressEnglish = () => {
    console.log('Globals.SELECTED_LANGUAGE: ', Globals.SELECTED_LANGUAGE);
    if (Globals.SELECTED_LANGUAGE !== 'en') {
      confirmationEnglish();
    }
  };

  const confirmationEnglish = () => {
    setSelectedOption('English');
    setShowAlert(true);
  };
  const onPressEnglishOk = () => {
    setSelectedLanguage('English');
    i18next.changeLanguage('en').then(t => {
      StorageManager.saveLanguage('en');
      StorageManager.saveIsLanguageChanged('CHANGED');
      I18nManager.forceRTL(false);
      setTimeout(() => {
        RNRestart.Restart();
      }, 1000);
    });
  };

  const onPressArabic = () => {
    console.log('Globals.SELECTED_LANGUAGE: ', Globals.SELECTED_LANGUAGE);
    if (Globals.SELECTED_LANGUAGE !== 'ar') {
      confirmationArabic();
    }
  };
  const confirmationArabic = () => {
    setSelectedOption('Arabic');
    setShowAlert(true);
  };

  const onPressOk = () => {
    setSelectedLanguage('Arabic');
    i18next.changeLanguage('ar').then(t => {
      StorageManager.saveLanguage('ar');
      StorageManager.saveIsLanguageChanged('CHANGED');
      I18nManager.forceRTL(true);
      setTimeout(() => {
        RNRestart.Restart();
      }, 1000);
      // navigation.navigate('DrawerNavigator')
    });
  };

  //Button actions
  const backButtonAction = () => {
    Keyboard.dismiss();
    navigation.goBack();
  };

  //Final return
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
        {/* <LoadingIndicator visible={isLoading} /> */}

        <StatusBar
          backgroundColor={Colors.PRIMARY_COLOR}
          barStyle="dark-content"
        />

        <View
          style={{
            backgroundColor: Colors.PRIMARY_COLOR,
            height: 50,
            width: '100%',
            justifyContent: 'center',
            flexDirection: 'row',
          }}>
          <TouchableOpacity
            style={{
              width: 20,
              height: 20,
              position: 'absolute',
              left: 20,
              alignSelf: 'center',
            }}
            onPress={() => backButtonAction()}>
            <Image
              source={Images.BACK_ARROW}
              style={{
                width: 20,
                height: 20,
                resizeMode: 'contain',
                tintColor: Colors.BLACK_COLOR,
                transform: [{scaleX: I18nManager.isRTL ? -1 : 1}],   
              }}
            />
          </TouchableOpacity>
          <Text
            style={{
              fontFamily: Fonts.Gibson_Regular,
              fontSize: 16,
              color: Colors.WHITE_COLOR,
              alignSelf: 'center',
            }}>
            {t(Translations.CHANGE_LANGUAGE)}
          </Text>
        </View>
        <View
          style={
            {
              // height: 1.5,
              // backgroundColor: Colors.LINE_SEPARATOR_COLOR,
              // marginTop: 12,
            }
          }
        />
        <View style={{marginTop: 30, marginHorizontal: 15}}>
          <TouchableOpacity
            onPress={() => {
              selectedLanguage === 'English' ? null : onPressEnglish();
            }}
            style={{
              backgroundColor: Colors.SECONDARY_COLOR,
              marginTop: 30,
              padding: 10,
              paddingVertical: 15,
              borderRadius: 5,
            }}>
            <Text
              style={{
                color: Colors.WHITE_COLOR,
                fontFamily: Fonts.Gibson_Regular,
                textAlign: 'left',
              }}>
              {t(Translations.ENGLISH)}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              selectedLanguage === 'Arabic' ? null : onPressArabic();
            }}
            style={{
              backgroundColor: Colors.SECONDARY_COLOR,
              marginTop: 30,
              padding: 10,
              paddingVertical: 15,
              borderRadius: 5,
            }}>
            <Text
              style={{
                color: Colors.WHITE_COLOR,
                fontFamily: Fonts.Gibson_Regular,
                textAlign: 'left',
              }}>
              {t(Translations.ARABIC)}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <LoadingIndicator visible={showLoader} />
      <AwesomeAlert
        show={showAlert}
        showProgress={false}
        title={t(Translations.PLEASE_CONFIRM)}
        titleStyle={{
          color: Colors.BLACK_COLOR,
          fontFamily: Fonts.Gibson_Regular,
        }}
        message={t(Translations.RESTART_APP)}
        closeOnTouchOutside={false}
        closeOnHardwareBackPress={false}
        showCancelButton={true}
        showConfirmButton={true}
        animatedValue={0.8}
        cancelText={t(Translations.CANCEL)}
        confirmText={t(Translations.CONFIRM)}
        confirmButtonColor={Colors.PRIMARY_COLOR}
        cancelButtonColor={Colors.SECONDARY_COLOR}
        onCancelPressed={() => {
          setShowAlert(false);
        }}
        onConfirmPressed={() => {
          _languageSwitchingAction();
        }}
        cancelButtonStyle={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 8,
        }}
        confirmButtonStyle={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 8,
        }}
        actionContainerStyle={{
          width: '100%',
        }}
        cancelButtonTextStyle={{
          color: Colors.WHITE_COLOR,
          fontFamily: Fonts.Gibson_SemiBold,
        }}
        confirmButtonTextStyle={{
          color: Colors.WHITE_COLOR,
          fontFamily: Fonts.Gibson_SemiBold,
        }}
        messageStyle={{
          textAlign: 'left',
          color: Colors.BLACK_COLOR,
          fontFamily: Fonts.Gibson_Regular,
          fontSize: 15,
        }}
      />
    </>
  );
};
export default LanguageListScreen;
