import React, {useState, useEffect, useRef} from 'react';
import {
  StatusBar,
  Text,
  View,
  Image,
  TouchableOpacity,
  Keyboard,
  Platform,
  FlatList,
  Alert,
  BackHandler,
  ScrollView,
  Modal,
  PermissionsAndroid,
  I18nManager,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation, useFocusEffect} from '@react-navigation/core';
import InputScrollView from 'react-native-input-scroll-view';
import {HelperText, TextInput} from 'react-native-paper';
import {GetImage} from '../shared/getImage/GetImage';

 
import {GetLottieImage} from '../shared/getLottieImage/GetLottieImage';
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
import {GuestUserAuthSource} from '../../helpers/enums/Enums';
import LottieView from 'lottie-react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import UpcomingDetailsPopUp from '../upcomingDetails/UpcomingDetailsPopUp';
import DisplayUtils from '../../helpers/utils/DisplayUtils';
import FastImage from 'react-native-fast-image';
import ContentLoader, {Rect, Circle, Path} from 'react-content-loader/native';
import NO_DEPARTMENT_ICON from '../../assets/images/departmentEmptyIcon.svg';
import InstaStory from '../../components/InstaStory/react-native-insta-story';
import {PERMISSIONS, check, request} from 'react-native-permissions';
import {TodaysBannerComponent} from './TodaysBanner/TodaysBannerComponent';
import AddReviewPopUp from '../previousDetails/AddReviewPopUp';
import {Translation, useTranslation} from 'react-i18next';
import AwesomeAlert from 'react-native-awesome-alerts';
import RNRestart from 'react-native-restart';
import i18next from 'i18next';
import NetInfo, {useNetInfo} from '@react-native-community/netinfo';
import moment from 'moment';
import { responsiveWidth } from 'react-native-responsive-dimensions';
const DashboardScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const isConnected = useNetInfo();
  const {t, i18n} = useTranslation();
  const [isBusinessNameImageLoadError, setIsBusinessNameImageLoadError] =
    useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoaderLoading, setIsLoaderLoading] = useState(false);
  const [isStatusChanged, setIsStatusChanged] = useState(false);
  const [unReadCount, setUnReadCount] = useState(0);
  const [storyList, setStoryList] = useState([]);
  const [storyDataList, setStoryDataList] = useState([]);
  const [serviceList, setServiceList] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);
  const [consultantList, setConsultantList] = useState([]);
  const [upcomingCount, setUpcomingCount] = useState('');
  const [previousCount, setPreviousCount] = useState('');
  const [todaysAppointmentBannerList, setTodaysAppointmentBannerList] =
    useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const notificationLottieRef = useRef();
  const upcomingDetailsRef = useRef();
  const refRBSheetAddReview = useRef();

  const [showLanguageSwitchingAlert, setShowLanguageSwitchingAlert] =
    useState(false);

  useFocusEffect(
    React.useCallback(() => {
      checkForAuthStatusChange();
      return () => {
        //clean up on screen disappear
      };
    }, []),
  );
  useEffect(() => {
    console.log(
      'Device language is ',
      Globals.DEVICE_LANGUAGE,
      'isLanguageIsChanged',
      Globals.IS_LANGUAGE_CHANGED,
    );

    if (
      Globals.IS_LANGUAGE_CHANGED === false &&
      Globals.DEVICE_LANGUAGE === 'ar'
    ) {
      setShowLanguageSwitchingAlert(true);
    }
    return () => {};
  }, []);

  useEffect(() => {
    console.log(
      `<><><><>RTL Dash board : <><><><>`,
      `${I18nManager.isRTL}`,
    );
    if (Utilities.isStoryEnabled() === true) {
      //Load read story ids
      loadSavedReadStoryIds();
    }
    getBusinessDetails();
  }, []);

  useEffect(() => {
    if (Platform.OS === 'ios') {
      fetchFCMTokenFromAPNS();
    }
    //Create OR use Token UUID
    getTokenUUID().then(res => {
      Globals.TOKEN_UUID = res;
    });
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      if (Globals.IS_AUTHORIZED === true) {
        //Fetch user dashboard info
        getDashboardCounts();
        performDeviceRegister();
        if (Globals.UN_READ_NOTIFICATION_COUNT === 0) {
          notificationLottieRef?.current?.pause();
        } else {
          notificationLottieRef?.current?.resume();
        }
        performGetNotificationList();
        let notification = Globals.NOTIFICATION_DATA;
        console.log(
          'HOME Globals.NOTIFICATION_DATA: ',
          Globals.NOTIFICATION_DATA,
        );
        if (notification.data.type !== undefined) {
          handleNotificationTap();
        }
      }
      return () => {};
    }, []),
  );

  //MARK: Back Handler
  useFocusEffect(
    React.useCallback(() => {
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        backAction,
      );
      return () => backHandler.remove();
    }, []),
  );

  const _languageSwitchingAction = () => {
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

  const backAction = () => {
    // Alert.alert(t(Translations.PLEASE_CONFIRM), t(Translations.EXIT_CONFIRMATION), [
    //   {
    //     text: 'Cancel',
    //     onPress: () => null,
    //     style: 'cancel',
    //   },
    //   {text: 'YES', onPress: () => BackHandler.exitApp()},
    // ]);
    setShowAlert(true);
    return true;
  };

  const checkForAuthStatusChange = () => {
    if (Globals.IS_AUTHORIZED === true) {
      //Check for guest user navigation status
      if (Globals.SHARED_VALUES.IS_GUEST_USER_NAV_NEEDED === true) {
        setIsStatusChanged(!isStatusChanged);
        if (
          Globals.SHARED_VALUES.GUEST_USER_AUTH_SOURCE ===
          GuestUserAuthSource.dashboardUserProfile
        ) {
          navigation.navigate('UserProfileScreen');
        } else if (
          Globals.SHARED_VALUES.GUEST_USER_AUTH_SOURCE ===
          GuestUserAuthSource.favoritesList
        ) {
          navigation.navigate('FavouriteListScreen');
        } else if (
          Globals.SHARED_VALUES.GUEST_USER_AUTH_SOURCE ===
          GuestUserAuthSource.notificationList
        ) {
          navigation.navigate('NotificationListScreen');
        } else if (
          Globals.SHARED_VALUES.GUEST_USER_AUTH_SOURCE ===
          GuestUserAuthSource.scanQr
        ) {
          navigation.navigate('ScanQrScreen', {
            onNoAppointmentFound: noAppointment,
          });
        }

        Globals.SHARED_VALUES.IS_GUEST_USER_NAV_NEEDED = false;
        Globals.SHARED_VALUES.GUEST_USER_AUTH_SOURCE = GuestUserAuthSource.none;
      }
    }
  };
  const handleNotificationTap = () => {
    let notification = Globals.NOTIFICATION_DATA;
    var _selectedNotificationId = notification?.data?.booking_id
      ? notification?.data?.booking_id.replace(/['"]+/g, '')
      : notification?.data?.waitlist_id
      ? notification?.data?.waitlist_id.replace(/['"]+/g, '')
      : ''; //removing the single quotes
    var _notificationType = notification.data.booking_id ? 'Booking' : 'Queue';
    console.log('HOME handleNotificationTap: ', notification.data.type);
    console.log(
      'ISNavigationNeeded: ',
      Globals.IS_NOTIFICATION_NAVIGATION_NEEDED,
    );
    if (Globals.IS_NOTIFICATION_NAVIGATION_NEEDED) {
      Globals.IS_NOTIFICATION_NAVIGATION_NEEDED = false;
      if (notification.data.type !== undefined) {
        //console.log('ENTERED IS AUTHORIZED');
        if (
          _selectedNotificationId !== undefined &&
          _selectedNotificationId !== ''
        ) {
          if (
            notification.data.type === 'BOOKING-DELAY' ||
            notification.data.type === 'WAITLIST-DELAY' ||
            notification.data.type === 'QUEUE-DELAY'
          ) {
            console.log('item type', notification.data.type);
            console.log('Navigation action');

            Globals.SHARED_VALUES.SELECTED_APPOINTMENT_TYPE = _notificationType;
            Globals.SHARED_VALUES.SELECTED_APPOINTMENT_ID =
              _selectedNotificationId;
            upcomingDetailsRef.current.open();
          } else if (
            notification.data.type === 'SCHEDULE-NEXT-VISIT-REMINDER' ||
            notification.data.type === 'NEXT-VISIT-REMINDER-BOOKING' ||
            notification.data.type === 'NEXT-VISIT-REMINDER-QUEUE'
          ) {
            console.log('navigation stat');
            navigation.navigate('PreviousAppointmentDetails', {
              selectedAppointment_id: _selectedNotificationId,
              selectedAppointmentType: _notificationType,
              isFrom: 'DASH_BOARD',
            });
          }
        }
      }
    }
  };
  const getTokenUUID = async () => {
    const uuid = await Utilities.getTokenUUID();
    if (uuid === null || uuid === undefined) {
      let timeStamp = Date.parse(new Date());
      console.log('timeStamp: ', timeStamp);
      Globals.TOKEN_UUID = timeStamp;
      Utilities.saveTokenUUID(timeStamp);
      return timeStamp;
    }
    Globals.TOKEN_UUID = uuid;
    return uuid;
  };

  const loadSavedReadStoryIds = () => {
    getSavedReadStoryIds().then(res => {
      console.log('loadSavedReadStoryIds res: ', res || []);
      Globals.SAVED_STORY_IDS = res || [];
    });
  };

  //Local storage fetch
  const getSavedReadStoryIds = async () => {
    return await StorageManager.getSavedStoryIds();
  };

  //MARK: Button actions
  const profileButtonAction = () => {
    Keyboard.dismiss();
    if (Globals.IS_AUTHORIZED === true) {
      navigation.navigate('UserProfileScreen');
    } else {
      let businessDetails = Globals.BUSINESS_DETAILS;
      if (businessDetails !== undefined && businessDetails !== null) {
        if (businessDetails.authenticationType?.length > 0) {
          if (businessDetails.authenticationType?.includes('email')) {
            //Navigate to Email login page
            navigation.navigate('LoginRegisterScreen');
          } else {
            //Navigate to Phone number login page
            navigation.navigate('PhoneLoginScreen');
          }
          Globals.SHARED_VALUES.GUEST_USER_AUTH_SOURCE =
            GuestUserAuthSource.dashboardUserProfile;
        }
      }
    }
  };

  const newBookingAction = () => {
    if (isLoading === true) {
      return;
    }

    Utilities.resetAllSharedBookingRelatedInfo();
    //Checking single consultant
    if (Utilities.isSingleConsultantBusiness() === false) {
      //Not single consultant
      //Checking gender specific booking
      if (Utilities.isGenderSpecificBooking() === true) {
        //Navigate to gender selection
        navigation.navigate('GenderSelectionScreen', {newBooking: true});
      } else if (Utilities.isServiceBasedBusiness() === true) {
        //Navigate to service selection
        navigation.navigate('ServiceListScreen');
      } else {
        //Navigate to specialist lists
        navigation.navigate('SpecialistListScreen');
      }
    } else {
      //Single consultant new booking
      if (
        Globals.SHARED_VALUES.SELECTED_SERVING_USER_INFO?._id === undefined ||
        Globals.SHARED_VALUES.SELECTED_SERVING_USER_INFO?._id === null
      ) {
        Utilities.showToast(
          t(Translations.FAILED),
          'no users',
          'error',
          'bottom',
        );
        return;
      } else {
        if (Utilities.isServiceBasedBusiness() === true) {
          //Navigate to service selection
          navigation.navigate('ServiceListScreen');
        } else {
          //Navigate to specialist lists
          navigation.navigate('BookingQueueScreen');
        }
      }
    }
  };

  const noAppointment = () => {
    console.log('NAVIGATE TO APPOINTMENT');
    Utilities.resetAllSharedBookingRelatedInfo();
    Globals.SHARED_VALUES.IS_FROM_QR_CODE_SCAN = true;
    //Checking single consultant
    if (Utilities.isSingleConsultantBusiness() === false) {
      //Not single consultant
      //Checking gender specific booking
      if (Utilities.isGenderSpecificBooking() === true) {
        //Navigate to gender selection
        navigation.navigate('GenderSelectionScreen');
      } else if (Utilities.isServiceBasedBusiness() === true) {
        //Navigate to service selection
        navigation.navigate('ServiceListScreen');
      } else {
        //Navigate to specialist lists
        navigation.navigate('SpecialistListScreen');
      }
    } else {
      //Single consultant new booking
      if (
        Globals.SHARED_VALUES.SELECTED_SERVING_USER_INFO?._id === undefined ||
        Globals.SHARED_VALUES.SELECTED_SERVING_USER_INFO?._id === null
      ) {
        Utilities.showToast(
          t(Translations.FAILED),
          'no users',
          'error',
          'bottom',
        );
        return;
      } else {
        if (Utilities.isServiceBasedBusiness() === true) {
          //Navigate to service selection
          navigation.navigate('ServiceListScreen');
        } else {
          //Navigate to specialist lists
          navigation.navigate('BookingQueueScreen');
        }
      }
    }
  };

  const scanQRAction = async () => {
    if (Globals.IS_AUTHORIZED === true) {
      if (Platform.OS === 'android') {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA,
          );
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            navigation.navigate('ScanQrScreen', {
              onNoAppointmentFound: noAppointment,
            });
          } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
            Utilities.showToast(
              t(Translations.FAILED),
              t(Translations.ENABLE_CAMERA_PERMISSION),
              'error',
              'bottom',
            );
          } else {
            console.log('Camera permission denied.');
          }
        } catch (err) {
          console.log(err);
        }
      } else {
        const res = await check(PERMISSIONS.IOS.CAMERA);
        console.log(res);
        if (res === 'granted') {
          navigation.navigate('ScanQrScreen', {
            onNoAppointmentFound: noAppointment,
          });
        } else if (res === 'denied' || res === 'blocked') {
          const res2 = await request(PERMISSIONS.IOS.CAMERA);
          res2 === 'granted'
            ? navigation.navigate('ScanQrScreen', {
                onNoAppointmentFound: noAppointment,
              })
            : null;
        }
      }
    } else {
      let businessDetails = Globals.BUSINESS_DETAILS;
      if (businessDetails !== undefined && businessDetails !== null) {
        if (businessDetails.authenticationType?.length > 0) {
          if (businessDetails.authenticationType?.includes('email')) {
            //Navigate to Email login page
            navigation.navigate('LoginRegisterScreen');
          } else {
            //Navigate to Phone number login page
            navigation.navigate('PhoneLoginScreen');
          }
          Globals.SHARED_VALUES.GUEST_USER_AUTH_SOURCE =
            GuestUserAuthSource.scanQr;
        }
      }
    }
  };

  const favoriteButtonAction = () => {
    Utilities.resetAllSharedBookingRelatedInfo();
    Keyboard.dismiss();
    if (Globals.IS_AUTHORIZED === true) {
      navigation.navigate('FavouriteListScreen');
    } else {
      let businessDetails = Globals.BUSINESS_DETAILS;
      if (businessDetails !== undefined && businessDetails !== null) {
        if (businessDetails.authenticationType?.length > 0) {
          if (businessDetails.authenticationType?.includes('email')) {
            //Navigate to Email login page
            navigation.navigate('LoginRegisterScreen');
          } else {
            //Navigate to Phone number login page
            navigation.navigate('PhoneLoginScreen');
          }
          Globals.SHARED_VALUES.GUEST_USER_AUTH_SOURCE =
            GuestUserAuthSource.favoritesList;
        }
      }
    }
  };
  const notificationButtonAction = () => {
    Keyboard.dismiss();
    if (Globals.IS_AUTHORIZED === true) {
      NetInfo.fetch().then(state => {
        if (state.isConnected === false) {
          Utilities.showToast(
            t(Translations.FAILED),
            t(Translations.NO_INTERNET),
            'error',
            'bottom',
          );
        } else {
          navigation.navigate('NotificationListScreen');
        }
      });
    } else {
      let businessDetails = Globals.BUSINESS_DETAILS;
      if (businessDetails !== undefined && businessDetails !== null) {
        if (businessDetails.authenticationType?.length > 0) {
          if (businessDetails.authenticationType?.includes('email')) {
            //Navigate to Email login page
            navigation.navigate('LoginRegisterScreen');
          } else {
            //Navigate to Phone number login page
            navigation.navigate('PhoneLoginScreen');
          }
          Globals.SHARED_VALUES.GUEST_USER_AUTH_SOURCE =
            GuestUserAuthSource.notificationList;
        }
      }
    }
  };

  const myVisitUpcomingButtonAction = () => {
    if (isLoading === true) {
      return;
    }
    if (isConnected.isConnected === false) {
      Utilities.showToast(
        t(Translations.FAILED),
        t(Translations.NO_INTERNET),
        'error',
        'bottom',
      );
    } else {
      Globals.SHARED_VALUES.IS_PREVIOUS_MY_VISIT = false;
      navigation.navigate('MyVisitList');
    }
  };

  const myVisitPreviousButtonAction = () => {
    console.log('kkkkk', isConnected.isConnected);
    if (isLoading === true) {
      return;
    }
    if (isConnected.isConnected === false) {
      Utilities.showToast(
        t(Translations.FAILED),
        t(Translations.NO_INTERNET),
        'error',
        'bottom',
      );
    } else {
      Globals.SHARED_VALUES.IS_PREVIOUS_MY_VISIT = true;
      navigation.navigate('MyVisitList');
    }
  };

  const onClickServiceCell = item => {
    if (isLoading === true) {
      return;
    }
    Utilities.resetAllSharedBookingRelatedInfo();
    Globals.SHARED_VALUES.SELECTED_SERVICES_IDS = [item?._id];
    if (Utilities.isGenderSpecificBooking() === true) {
      Globals.SHARED_VALUES.SELECTED_GENDER = item?.genderSelection || '';
    }
    if (Utilities.isSingleConsultantBusiness() === true) {
      //Navigate to service selection
      navigation.navigate('ServiceListScreen');
    } else {
      Globals.SHARED_VALUES.IS_FORCE_SERVICE_SELECT_NEED = true;
      navigation.navigate('SpecialistListScreen');
    }
  };

  const onClickDepartmentCell = item => {
    if (isLoading === true) {
      return;
    }
    Utilities.resetAllSharedBookingRelatedInfo();
    Globals.SHARED_VALUES.SELECTED_DEPARTMENT_INFO = item;

    if (Utilities.isGenderSpecificBooking() === true) {
      //Navigate to gender selection
      navigation.navigate('GenderSelectionScreen');
    } else {
      //Navigate to specialist selection
      navigation.navigate('SpecialistListScreen');
    }
  };

  const onClickConsultantCell = item => {
    if (isLoading === true) {
      return;
    }
    Utilities.resetAllSharedBookingRelatedInfo();
    Globals.SHARED_VALUES.SELECTED_SERVING_USER_ID = item?._id;
    Globals.SHARED_VALUES.SELECTED_SERVING_USER_INFO = item;

    var departmentName = item?.role_id?.label || 'N/A';
    if (
      Globals.BUSINESS_DETAILS?.businessType ===
      'multiple-service-multiple-consultant'
    ) {
      departmentName = item?.role_id?.label || 'N/A';
    }
    //Show designation in multiple serving #21003
    if (Globals.BUSINESS_DETAILS?.businessType === 'multiple-consultant') {
      if (item?.departments instanceof Array && item?.departments?.length > 0) {
        departmentName = item?.departments
          .map(dep => dep?.department_name)
          .join(', ');
      } else if (
        item?.department_id !== undefined &&
        item?.department_id !== null
      ) {
        departmentName =
          item?.department_id?.department_name ||
          item?.department_id?.role ||
          'N/A';
      } else {
        departmentName = item?.designationInfo?.designation || 'N/A';
      }
    }

    Globals.SHARED_VALUES.SELECTED_SERVING_USER_ROLE_TEXT = departmentName;

    if (Utilities.isGenderSpecificBooking() === true) {
      Globals.SHARED_VALUES.SELECTED_GENDER = item?.canServeGenders || '';
    }

    if (Utilities.isServiceBasedBusiness() === true) {
      //Navigate to service selection
      navigation.navigate('ServiceListScreen');
    } else {
      //Navigate to BookingQueueScreen
      navigation.navigate('BookingQueueScreen');
    }
  };

  const onClickStoryCell = (item, index) => {
    //THIS FOR LOADER. INSTA STORY IS USING
  };

  const consultantsViewAllButtonAction = item => {
    if (isLoading === true) {
      return;
    }
    Utilities.resetAllSharedBookingRelatedInfo();
    if (Utilities.isGenderSpecificBooking() === true) {
      //Navigate to gender selection
      navigation.navigate('GenderSelectionScreen');
    } else {
      //Navigate to specialist lists
      navigation.navigate('SpecialistListScreen');
    }
  };

  const servicesViewAllButtonAction = item => {
    if (isLoading === true) {
      return;
    }
    Utilities.resetAllSharedBookingRelatedInfo();
    if (Utilities.isGenderSpecificBooking() === true) {
      //Navigate to gender selection
      navigation.navigate('GenderSelectionScreen');
    } else {
      //Navigate to service selection
      navigation.navigate('ServiceListScreen');
    }
  };

  const departmentsViewAllButtonAction = item => {
    if (isLoading === true) {
      return;
    }
    Utilities.resetAllSharedBookingRelatedInfo();
    Globals.SHARED_VALUES.IS_FROM_DASHBOARD_DEPARTMENT_VIEW_ALL = true;
    if (Utilities.isGenderSpecificBooking() === true) {
      //Navigate to gender selection
      navigation.navigate('GenderSelectionScreen');
    } else {
      //Navigate to specialist lists
      navigation.navigate('SpecialistListScreen');
    }
  };

  //MARK: Other methods

  const fetchOtherDashboardInfo = () => {
    if (Utilities.isStoryEnabled() === true) {
      getStoryList();
    }
    if (Utilities.isServiceBasedBusiness() === true) {
      //Fetch services
      getServiceList();
    } else {
      if (Utilities.isSingleConsultantBusiness() === true) {
        //Fetching consultants
        getConsultants();
      } else {
        //Fetch departments
        getDepartmentList();
      }
    }
  };

  //MARK: API Calls

  /**
       *
       * Purpose: Get selected business details
       * Created/Modified By: Jenson
       * Created/Modified Date: 28 Dec 2021
       * Steps:
           1.fetch business details from API and append to state variable
    */
  const getBusinessDetails = () => {
    setIsLoading(true);
    DataManager.getBusinessDetails(Globals.BUSINESS_ID).then(
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

              fetchOtherDashboardInfo();
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

  const fetchFCMTokenFromAPNS = () => {
    const body = {
      application: Globals.APPLICATION_ID,
      sandbox: false, //NEED FALSE FOR IOS ARCHIVE BUILD SCHEME..
      apns_tokens: [Globals.APNS_TOKEN],
    };

    fetch('https://iid.googleapis.com/iid/v1:batchImport', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization:
          'key=AAAAGm1FANg:APA91bEK7fefXZ5xBwWl37ZTA-tKeT5QkhIP1n9OH58-2ggszlkpiqY_dH8p29cgdel0lS4CmZtdirVkzI8FD77VJtV3iotgnTVLzLZCTBo0hCwFxDYx1Xm-kGNhz9DvyZLlMXQ7gNFB',
      },
      body: JSON.stringify(body),
    })
      .then(response => response.json())
      .then(responseJson => {
        console.log(responseJson);
        if (responseJson.results.length > 0) {
          Globals.PUSH_NOTIFICATION_TOKEN =
            responseJson.results[0].registration_token;
        }
      });
  };

  /**
*
* Purpose:perform device register
* Created/Modified By: Sudhin
* Created/Modified Date: 18 Feb 2022
* Steps:
  1.if login success navigate to drawer navigator else show the message on toast
*/
  const performDeviceRegister = () => {
    console.log(
      'Globals.PUSH_NOTIFICATION_TOKEN',
      Globals.PUSH_NOTIFICATION_TOKEN,
    );
    console.log('DEVICE ID', Globals.TOKEN_UUID);
    console.log('user id', Globals.USER_DETAILS._id);
    const body = {
      [APIConnections.KEYS.DEVICE_ID]: Globals.TOKEN_UUID,
      [APIConnections.KEYS.DEVICE]: Platform.OS,
      [APIConnections.KEYS.USER_ID]: Globals.USER_DETAILS._id,
      [APIConnections.KEYS.TOKEN]: Globals.PUSH_NOTIFICATION_TOKEN,
    };
    DataManager.performDeviceRegister(body).then(
      ([isSuccess, message, data]) => {
        if (isSuccess === true) {
          if (data !== undefined && data !== null) {
            // Utils.showToast('Success!', message, 'success', 'bottom');
          } else {
            // setIsLoading(false);
          }
        } else {
          // Utils.showToast(t(Translations.FAILED), message, 'error', 'bottom');
          // setIsLoading(false);
        }
      },
    );
  };

  /**
       *
       * Purpose: performGetNotificationList
       * Created/Modified By: Jenson
       * Created/Modified Date: 27 Dec 2021
       * Steps:
           1.fetch business list from API and append to state variable
      */

  const performGetNotificationList = () => {
    DataManager.getNotificationList(1).then(([isSuccess, message, data]) => {
      if (isSuccess === true) {
        Globals.UN_READ_NOTIFICATION_COUNT = data.metadata.unreadingCount || 0;

        console.log(
          'performGetNotificationList Globals.UN_READ_NOTIFICATION_COUNT....',
          Globals.UN_READ_NOTIFICATION_COUNT,
        );
        if (Globals.UN_READ_NOTIFICATION_COUNT === 0) {
          notificationLottieRef?.current?.pause();
        } else {
          notificationLottieRef?.current?.resume();
        }
        setUnReadCount(data.metadata.unreadingCount || 0);
      } else {
        // Utilities.showToast(t(Translations.FAILED), message, 'error', 'bottom');
        // setIsLoading(false);
        Globals.UN_READ_NOTIFICATION_COUNT = 0;
      }
    });
  };

  /**
  *
  * Purpose: Get user details
  * Created/Modified By: Jenson
  * Created/Modified Date: 28 Mar 2022
  * Steps:
      1.fetch business details from API and append to state variable
   */
  const getServiceList = () => {
    setIsLoading(true);
    var queryParams = {};
    DataManager.getServiceList(queryParams).then(
      ([isSuccess, message, data]) => {
        if (isSuccess === true) {
          if (data.objects !== undefined && data.objects !== null) {
            setServiceList(data.objects);
            //Fetching consultants
            getConsultants();
          } else {
            Utilities.showToast(
              t(Translations.FAILED),
              t(Translations.NO_SERVICE_FOUND),
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
    *
    * Purpose: getDepartmentList
    * Created/Modified By: Jenson John
    * Created/Modified Date: 28 Mar 2022
    * Steps:
        1.fetch department list from API and append to state variable
      */

  const getDepartmentList = () => {
    DataManager.getDepartmentList(1, '').then(([isSuccess, message, data]) => {
      if (isSuccess === true) {
        if (data?.objects !== undefined && data?.objects !== null) {
          setDepartmentList(data.objects);
          //Fetching consultants
          getConsultants();
        } else {
          Utilities.showToast(
            t(Translations.FAILED),
            t(Translations.NO_DEPARTMENT_FOUND),
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

  /**
    *
    * Purpose: Consultant listing
    * Created/Modified By: Jenson
    * Created/Modified Date: 28 Mar 2021
    * Steps:
        1.fetch consultant list from API and append to state variable
    */
  const getConsultants = () => {
    DataManager.getSpecialistList(1).then(([isSuccess, message, data]) => {
      if (isSuccess === true) {
        if (data?.objects !== undefined && data?.objects !== null) {
          let allConsultants = data.objects;
          //Need to filter non-blocked consultants
          let nonBlockedConsultants = allConsultants.filter(
            _data =>
              (_data?.is_blocked === undefined || _data?.is_blocked === null
                ? false
                : _data.is_blocked) === false,
          );
          setIsLoading(false);
          //Save user if single consultant
          if (Utilities.isSingleConsultantBusiness() === true) {
            if (nonBlockedConsultants?.length > 0) {
              let _singleUser = nonBlockedConsultants[0];
              Globals.SHARED_VALUES.SELECTED_SERVING_USER_INFO = _singleUser;
              Globals.SHARED_VALUES.SELECTED_SERVING_USER_ID = _singleUser?._id;

              var departmentName = _singleUser?.role_id?.label || 'N/A';
              if (
                Globals.BUSINESS_DETAILS?.businessType ===
                'multiple-service-multiple-consultant'
              ) {
                departmentName = _singleUser?.role_id?.label || 'N/A';
              }
              //Show designation in multiple serving #21003
              if (
                Globals.BUSINESS_DETAILS?.businessType === 'multiple-consultant'
              ) {
                if (
                  _singleUser?.departments instanceof Array &&
                  _singleUser?.departments?.length > 0
                ) {
                  departmentName = _singleUser?.departments
                    .map(dep => dep?.department_name)
                    .join(', ');
                } else if (
                  _singleUser?.department_id !== undefined &&
                  _singleUser?.department_id !== null
                ) {
                  departmentName =
                    _singleUser?.department_id?.department_name ||
                    _singleUser?.department_id?.role ||
                    'N/A';
                } else {
                  departmentName =
                    _singleUser?.designationInfo?.designation || 'N/A';
                }
              }
              Globals.SHARED_VALUES.SELECTED_SERVING_USER_ROLE_TEXT =
                departmentName;
            }
          }
          setConsultantList(nonBlockedConsultants);
          setIsLoading(false);
        } else {
          Utilities.showToast(
            t(Translations.FAILED),
            t(Translations.NO_CONSULTANT_FOUND),
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

  /**
    *
    * Purpose: Dashboard counts
    * Created/Modified By: Jenson
    * Created/Modified Date: 28 Mar 2021
    * Steps:
        1.fetch consultant list from API and append to state variable
    */
  const getDashboardCounts = () => {
    DataManager.getDashboardCounts().then(([isSuccess, message, data]) => {
      if (isSuccess === true) {
        let dataObjects = data?.objects;
        if (dataObjects !== undefined && dataObjects !== null) {
          let _upcomingCount = dataObjects?.upcoming_count || 0;
          let _previousCount = dataObjects?.past_count || 0;
          setUpcomingCount(_upcomingCount);
          setPreviousCount(_previousCount);
          //Filter view status based appointment list
          let todaysAppointments = dataObjects?.todaysBooking || [];
          let filteredBooking = todaysAppointments.filter(
            _data =>
              (_data?.viewStatus === undefined || _data?.viewStatus === null
                ? true
                : _data.viewStatus) === true,
          );

          console.log('filteredBooking--------------------',filteredBooking)
          setTodaysAppointmentBannerList(filteredBooking);

          setIsLoaderLoading(false);
        } else {
          setIsLoading(false);
          setIsLoaderLoading(false);
        }
      } else {
        Utilities.showToast(t(Translations.FAILED), message, 'error', 'bottom');
        setIsLoading(false);
        setIsLoaderLoading(false);
      }
    });
  };

  /**
    *
    * Purpose: Story listing
    * Created/Modified By: Jenson
    * Created/Modified Date: 28 Mar 2021
    * Steps:
        1.fetch consultant list from API and append to state variable
    */
  const getStoryList = () => {
    DataManager.getStoryList(1).then(([isSuccess, message, data]) => {
      if (isSuccess === true) {
        if (data?.objects?.list !== undefined && data?.objects?.list !== null) {
          configureStoryDataList(data.objects?.list);
        } else {
          //Utilities.showToast(t(Translations.FAILED), message, 'error', 'bottom');
          setIsLoading(false);
        }
      } else {
        Utilities.showToast(t(Translations.FAILED), message, 'error', 'bottom');
        setIsLoading(false);
      }
    });
  };

  const configureStoryDataList = list => {
    var _storyData = [];
    if (list?.length > 0) {
      list.map((_item, _itemIndex) => {
        var _storyItem = {};
        _storyItem.user_id = _item?._id || '';
        _storyItem.user_image = _item?.image[0] || '';
        _storyItem.user_name = _item?.topic + `${'  '}` || 'N/A';

        var _stories = [];
        _item?.image?.map((_storyImage, _imageIndex) => {
          var _storyImageItem = {};
          _storyImageItem.story_id = _imageIndex;
          _storyImageItem.story_image = _storyImage;

          _stories.push(_storyImageItem);
        });
        _storyItem.stories = _stories;
        //Check story is already read
        if (Globals.SAVED_STORY_IDS?.length > 0) {
          if (Globals.SAVED_STORY_IDS?.includes(_item?._id) === true) {
            _storyItem.seen = true;
          }
        }
        _storyData.push(_storyItem);
      });
    }
    console.log('storyDataList: ', _storyData);
    setStoryDataList(_storyData);
    setStoryList(list); //USED TO REFRESH STATE
  };

  const performAddReview = (appointmentDetails, rating, review) => {
    setIsLoaderLoading(true);
    var selectedAppointmentType = appointmentDetails?.name;
    var body = {};
    if (selectedAppointmentType === 'Booking') {
      body = {
        [APIConnections.KEYS.BUSINESS_ID]: Globals.BUSINESS_ID,
        [APIConnections.KEYS.USER_ID]: appointmentDetails?.servingUser_id?._id,
        [APIConnections.KEYS.COMMENT]: review,
        [APIConnections.KEYS.RATING]: rating,
        [APIConnections.KEYS.AUTHOR_ID]: Globals.USER_DETAILS?._id,
        [APIConnections.KEYS.BOOKING_ID]: appointmentDetails?._id,
      };
    } else {
      body = {
        [APIConnections.KEYS.BUSINESS_ID]: Globals.BUSINESS_ID,
        [APIConnections.KEYS.USER_ID]: appointmentDetails?.servingUser_id?._id,
        [APIConnections.KEYS.COMMENT]: review,
        [APIConnections.KEYS.RATING]: rating,
        [APIConnections.KEYS.AUTHOR_ID]: Globals.USER_DETAILS._id,
        [APIConnections.KEYS.QUEUE_ID]: appointmentDetails?._id,
      };
    }

    DataManager.performAddReview(body).then(
      ([isSuccess, message, responseData]) => {
        if (isSuccess === true) {
          getDashboardCounts();

          Utilities.showToast(
            'Success',
            t(Translations.SUCCESSFULLY_SUBMITTED_YOUR_REVIEW),
            'success',
            'bottom',
          );
        } else {
          Utilities.showToast(
            t(Translations.FAILED),
            message,
            'error',
            'bottom',
          );
          setIsLoaderLoading(false);
        }
      },
    );
  };

  const updateAppointmentBannerViewStatus = appointmentDetails => {
    setIsLoaderLoading(true);
    let selectedAppointmentType =
      appointmentDetails?.name?.toUpperCase() || 'Booking'.toUpperCase();
    var body = {};
    if (selectedAppointmentType === 'Booking'.toUpperCase()) {
      body = {
        [APIConnections.KEYS.BUSINESS_ID]: Globals.BUSINESS_ID,
        [APIConnections.KEYS.CUSTOMER_ID]: Globals.USER_DETAILS?._id,
        [APIConnections.KEYS.BOOKING_ID]: appointmentDetails?._id,
      };
    } else {
      body = {
        [APIConnections.KEYS.BUSINESS_ID]: Globals.BUSINESS_ID,
        [APIConnections.KEYS.CUSTOMER_ID]: Globals.USER_DETAILS?._id,
        [APIConnections.KEYS.QUEUE_ID]: appointmentDetails?._id,
      };
    }

    DataManager.performUpdateAppointmentViewStatus(
      selectedAppointmentType,
      body,
    ).then(([isSuccess, message, responseData]) => {
      if (isSuccess === true) {
        getDashboardCounts();
      } else {
        Utilities.showToast(t(Translations.FAILED), message, 'error', 'bottom');
        setIsLoaderLoading(false);
      }
    });
  };

  //MARK: Loaders
  const ServicesListLoader = props => (
    <ContentLoader
      transform={[{scaleX: I18nManager.isRTL ? -1 : 1}]}
      speed={1.5}
      width={100}
      height={110}
      viewBox="0 0 100 110 "
      backgroundColor="#dadada"
      foregroundColor="#eee"
      animate={true}
      {...props}>
      <Rect x="30%" y="10" rx="5" ry="5" width="40" height="40" />
      <Rect x="10" y="75" rx="5" ry="5" width="80%" height="8" />
      <Circle cx="21%" cy="94" r="4" />
      <Rect x="27%" y="90" rx="5" ry="5" width="50%" height="8" />
    </ContentLoader>
  );

  const DepartmentsListLoader = props => (
    <ContentLoader
      transform={[{scaleX: I18nManager.isRTL ? -1 : 1}]}
      speed={1.5}
      width={100}
      height={80}
      viewBox="0 0 100 80 "
      backgroundColor="#dadada"
      foregroundColor="#eee"
      animate={true}
      {...props}>
      <Rect x="30%" y="10" rx="5" ry="5" width="40" height="40" />
      <Rect x="10" y="60" rx="5" ry="5" width="80%" height="8" />
    </ContentLoader>
  );

  const StoryListLoader = props => (
    <ContentLoader
      transform={[{scaleX: I18nManager.isRTL ? -1 : 1}]}
      speed={1.5}
      width={95}
      height={95}
      viewBox="0 0 95 95 "
      backgroundColor="#dadada"
      foregroundColor="#eee"
      animate={true}
      {...props}>
      <Circle cx="50" cy="40" r="40" />
      <Circle cx="50" cy="40" r="30" />
      <Circle cx="50" cy="40" r="35" />
      <Rect x="22" y="88" rx="5" ry="5" width="65%" height="8" />
    </ContentLoader>
  );

  //Shimmer loader for the flatList
  const ConsultantsListLoader = props => (
    <ContentLoader
      transform={[{scaleX: I18nManager.isRTL ? -1 : 1}]}
      speed={1.5}
      width={182}
      height={120}
      viewBox="0 0 182 120 "
      backgroundColor="#dadada"
      foregroundColor="#eee"
      animate={true}
      {...props}>
      <Circle cx="25" cy="25" r="15" />
      <Circle cx="55" cy="25" r="8" />
      <Circle cx="75" cy="25" r="8" />
      <Circle cx="95" cy="25" r="8" />
      <Circle cx="115" cy="25" r="8" />
      <Circle cx="135" cy="25" r="8" />
      <Circle cx="155" cy="25" r="8" />

      <Rect x="15" y="60" rx="5" ry="5" width="55%" height="10" />
      <Rect x="15" y="80" rx="5" ry="5" width="80%" height="8" />
      {Utilities.isReviewAndRatingEnabled() === true ? (
        <Rect x="15" y="100" rx="5" ry="5" width="35" height="10" />
      ) : null}
    </ContentLoader>
  );

  //Shimmer loader for the flatList
  const SingleConsultantsListLoader = props => (
    <ContentLoader
      transform={[{scaleX: I18nManager.isRTL ? -1 : 1}]}
      speed={1.5}
      width={DisplayUtils.setWidth(91)}
      height={100}
      //viewBox="0 0 182 100 "
      backgroundColor="#dadada"
      foregroundColor="#eee"
      animate={true}
      {...props}>
      <Circle cx="52" cy="52" r="25" />

      <Circle cx="30%" cy="65" r="8" />
      <Circle cx="36%" cy="65" r="8" />
      <Circle cx="42%" cy="65" r="8" />
      <Circle cx="48%" cy="65" r="8" />
      <Circle cx="54%" cy="65" r="8" />
      <Circle cx="60%" cy="65" r="8" />

      <Rect x="28%" y="20" rx="5" ry="5" width="55%" height="10" />
      <Rect x="28%" y="40" rx="5" ry="5" width="25%" height="8" />
    </ContentLoader>
  );

  const VisitCountLoader = props => (
    <ContentLoader
      transform={[{scaleX: I18nManager.isRTL ? -1 : 1}]}
      speed={1.5}
      width={30}
      height={30}
      viewBox="0 0 30 30 "
      backgroundColor="#dadada"
      foregroundColor="#eee"
      animate={true}
      {...props}>
      <Rect x="0" y="0" rx="5" ry="5" width="30" height="30" />
    </ContentLoader>
  );

  //MARK: Render UI

  const GetUpcomingDetailsPopUp = () => {
    return (
      <RBSheet
        ref={upcomingDetailsRef}
        closeOnDragDown={false}
        closeOnPressMask={false}
        height={DisplayUtils.setHeight(90)}
        customStyles={{
          wrapper: {
            backgroundColor: '#00000080',
          },
          container: {
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
          },
          draggableIcon: {
            backgroundColor: '#fff',
          },
        }}>
        <UpcomingDetailsPopUp refRBSheet={upcomingDetailsRef} />
      </RBSheet>
    );
  };

  const GetAddReviewPopup = () => {
    return (
      <RBSheet
        ref={refRBSheetAddReview}
        closeOnDragDown={false}
        closeOnPressMask={true}
        customStyles={{
          wrapper: {
            backgroundColor: '#00000080',
            paddingTop: insets.top,
            paddingLeft: insets.left,
            paddingRight: insets.right,
            paddingBottom: insets.bottom,
          },
          container: {
            borderTopLeftRadius: 15,
            borderTopRightRadius: 15,
          },
          draggableIcon: {
            backgroundColor: Colors.PRIMARY_TEXT_COLOR,
          },
        }}
        height={DisplayUtils.setHeight(80)}
        onClose={() => {}}>
        <AddReviewPopUp
          RBSheet={refRBSheetAddReview}
          //appointmentDetails={Globals.SHARED_VALUES.SELECTED_APPOINTMENT_INFO}
          onAddReview={handleOnReviewAdded}
        />
      </RBSheet>
    );
  };
  const handleOnReviewAdded = (rating, review) => {
    console.log('ADD');
    performAddReview(
      Globals.SHARED_VALUES.SELECTED_APPOINTMENT_INFO,
      rating,
      review,
    );
  };

  /**
  * Purpose:Render services for flat list
  * Created/Modified By: Jenson
  * Created/Modified Date: 28 Mar 2022
  * Steps:
      1.pass the data from api to customer details child component
     */
  const renderServicesCells = ({item, index}) => {
    console.log('=========',serviceList.length)
    return <GetServiceCell item={item} index={index} />;
  };

  const GetServiceCell = ({item, index}) => {
    let durationInSeconds = item.duration * 60;

    return (
      <TouchableOpacity
        style={{
           marginLeft:responsiveWidth(1),
           marginRight:responsiveWidth(1),
          // marginLeft: index === 0 ? 20 : 10,
          // marginRight: index === serviceList.length - 1 ? 20 : 0,
          width: 100,
          height: 110,
          alignItems: 'center',
          //Shadow props
          borderWidth: 0.4,
          borderColor: Colors.TEXT_PLACEHOLDER_COLOR,
          backgroundColor: Colors.WHITE_COLOR,
          shadowColor: Colors.SHADOW_COLOR,
          shadowOffset: {width: 0, height: 4},
          shadowOpacity: 0.4,
          shadowRadius: 8,
          elevation: 8,
          borderRadius: 8,
        }}
        onPress={() => onClickServiceCell(item)}>
        {isLoading ? (
          <ServicesListLoader />
        ) : (
          <>
            {item?.lottieImageName !== '' &&
            item?.lottieImageName?.trim()?.length > 0 &&
            item?.lottieImageName !== undefined ? (
              <View style={{marginTop: 15, height: 35, width: 35}}>
                <GetLottieImage
                  style={{
                    height: 35,
                    width: 35,
                    alignSelf:'center',
                  }}
                  url={item.lottieImageName}
                />
              </View>
            ) : item?.image !== '' &&
              item?.image !== undefined &&
              item?.image?.trim()?.length > 0 ? (
              <FastImage
                style={{
                  marginTop: 15,
                  height: 35,
                  width: 35,
                }}
                source={{
                  uri: item.image,
                  priority: FastImage.priority.normal,
                }}
                resizeMode={FastImage.resizeMode.contain}
              />
            ) : (
              <View style={{marginTop: 15}}>
                <NO_DEPARTMENT_ICON
                  width={35}
                  height={35}
                  fill={Colors.WHITE_COLOR}
                  fillNoDepartmentSecondary={Colors.SECONDARY_COLOR}
                  fillNoDepartmentPrimary={Colors.PRIMARY_COLOR}
                />
              </View>
            )}
            <View
              style={{
                flexDirection: 'row',
                marginRight: 10,
                marginLeft: 10,
                marginTop: 20,
              }}>
              {Utilities.isGenderSpecificBooking() ? (
                item?.genderSelection === 'male' ? (
                  <LottieView
                    style={{width: 10, height: 10, marginRight: 3}}
                    source={Images.MALE_ANIMATION_ICON}
                    autoPlay
                    loop
                    colorFilters={[
                      {
                        keypath: 'ywait#primary',
                        color: Colors.PRIMARY_COLOR,
                      },
                      {
                        keypath: 'ywait#secondary',
                        color: Colors.SECONDARY_COLOR,
                      },
                    ]}
                  />
                ) : item?.genderSelection === 'female' ? (
                  <LottieView
                    style={{width: 10, height: 10, marginRight: 3}}
                    source={Images.FEMALE_ANIMATION_ICON}
                    autoPlay
                    loop
                    colorFilters={[
                      {
                        keypath: 'ywait#primary',
                        color: Colors.PRIMARY_COLOR,
                      },
                      {
                        keypath: 'ywait#secondary',
                        color: Colors.SECONDARY_COLOR,
                      },
                    ]}
                  />
                ) : item?.genderSelection === 'unisex' ? (
                  <LottieView
                    style={{width: 10, height: 10, marginRight: 3}}
                    source={Images.UNISEX_ANIMATION_ICON}
                    autoPlay
                    loop
                    colorFilters={[
                      {
                        keypath: 'ywait#primary',
                        color: Colors.PRIMARY_COLOR,
                      },
                      {
                        keypath: 'ywait#secondary',
                        color: Colors.SECONDARY_COLOR,
                      },
                    ]}
                  />
                ) : (
                  <LottieView
                    style={{width: 10, height: 10, marginRight: 3}}
                    source={Images.OTHER_ANIMATION_ICON}
                    autoPlay
                    loop
                    colorFilters={[
                      {
                        keypath: 'ywait#primary',
                        color: Colors.PRIMARY_COLOR,
                      },
                      {
                        keypath: 'ywait#secondary',
                        color: Colors.SECONDARY_COLOR,
                      },
                    ]}
                  />
                )
              ) : null}
              <Text
                style={{
                  fontFamily: Fonts.Gibson_SemiBold,
                  fontSize: 12,
                  color: Colors.PRIMARY_TEXT_COLOR,
                }}
                numberOfLines={1}>
                {item.name}
              </Text>
            </View>

            <View
              style={{
                flexDirection: 'row',
                marginRight: 2,
                marginLeft: 2,
                marginTop: 6,
              }}>
              <Image
                source={Images.CLOCK_CIRCULAR_ICON}
                style={{
                  height: 10,
                  width: 10,
                  marginRight: 4,
                  marginTop: 0,
                  tintColor: Colors.TEXT_GREY_COLOR_9B,
                }}
              />
              <Text
                style={{
                  fontFamily: Fonts.Gibson_Regular,
                  fontSize: 10,
                  color: Colors.TEXT_GREY_COLOR_9B,
                  marginBottom: 10,
                }}
                numberOfLines={1}>
                {/* {Utilities.convertHMS(durationInSeconds)} */}
                {item?.duration} min
              </Text>
            </View>
          </>
        )}
      </TouchableOpacity>
    );
  };

  /**
  * Purpose:Render departments for flat list
  * Created/Modified By: Jenson
  * Created/Modified Date: 28 Mar 2022
  * Steps:
      1.pass the data from api to customer details child component
     */
  const renderDepartmentCells = ({item, index}) => {
    return <GetDepartmentCell item={item} index={index} />;
  };

  const GetDepartmentCell = ({item, index}) => {
    return (
      <TouchableOpacity
        style={{
          // marginLeft: index === 0 ? 10 : 5,
          marginRight: 10,
          width: 100,
          height: 80,
          alignItems: 'center',
          //Shadow props
          borderWidth: 0.4,
          borderColor: Colors.TEXT_PLACEHOLDER_COLOR,
          backgroundColor: Colors.WHITE_COLOR,
          shadowColor: Colors.SHADOW_COLOR,
          shadowOffset: {width: 0, height: 4},
          shadowOpacity: 0.4,
          shadowRadius: 8,
          elevation: 8,
          borderRadius: 8,
        }}
        onPress={() => onClickDepartmentCell(item)}>
        {isLoading ? (
          <DepartmentsListLoader />
        ) : (
          <>
            {item?.lottieImageName !== '' &&
            item?.lottieImageName?.trim()?.length > 0 &&
            item?.lottieImageName !== undefined ? (
              <View style={{marginTop: 15, height: 35, width: 35}}>
                <GetLottieImage
                  style={{
                    height: 35,
                    width: 35,
                  }}
                  url={item.lottieImageName}
                />
              </View>
            ) : item?.departmentIcon !== '' &&
              item?.departmentIcon !== undefined &&
              item?.departmentIcon?.trim()?.length > 0 ? (
              <FastImage
                style={{
                  marginTop: 15,
                  height: 35,
                  width: 35,
                }}
                source={{
                  uri: item.departmentIcon,
                  priority: FastImage.priority.normal,
                }}
                resizeMode={FastImage.resizeMode.contain}
              />
            ) : (
              <View style={{marginTop: 15}}>
                <NO_DEPARTMENT_ICON
                  width={35}
                  height={35}
                  fill={Colors.WHITE_COLOR}
                  fillNoDepartmentSecondary={Colors.SECONDARY_COLOR}
                  fillNoDepartmentPrimary={Colors.PRIMARY_COLOR}
                />
              </View>
            )}
            <View
              style={{
                flexDirection: 'row',
                marginRight: 10,
                marginLeft: 10,
                marginTop: 8,
              }}>
              <Text
                style={{
                  fontFamily: Fonts.Gibson_SemiBold,
                  fontSize: 12,
                  color: Colors.PRIMARY_TEXT_COLOR,
                }}
                numberOfLines={1}>
                {item?.department_name || 'N/A'}
              </Text>
            </View>
          </>
        )}
      </TouchableOpacity>
    );
  };

  /**
* Purpose: Render story list
* Created/Modified By: Jenson
* Created/Modified Date: 28 Mar 2022
* Steps:
    1.pass the data from api to customer details child component
   */
  const renderStoryCells = ({item, index}) => {
    return <GetStoryCell item={item} index={index} />;
  };

  const GetStoryCell = ({item, index}) => {
    return (
      <TouchableOpacity
        style={{
          marginLeft: index === 0 ? 20 : 10,
          marginRight: index === storyList.length - 1 ? 20 : 0,
          width: 95,
          height: 95,
          alignItems: 'center',
        }}
        onPress={() => onClickStoryCell(item, index)}>
        {isLoading ? (
          <StoryListLoader />
        ) : (
          <>
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 80 / 2,
                borderWidth: 2,
                borderStyle: 'dashed',
                borderColor: Colors.PRIMARY_COLOR,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <View
                style={{
                  width: 73,
                  height: 73,
                  borderRadius: 73 / 2,
                  borderWidth: 2,
                  borderColor: Colors.SECONDARY_COLOR,
                  justifyContent: 'center',
                }}>
                <GetImage
                  style={{
                    width: 70,
                    height: 70,
                    borderRadius: 70 / 2,
                    borderWidth: 3,
                    borderColor: Colors.WHITE_COLOR,
                    alignSelf: 'center',
                  }}
                  fullName={(item?.topic).trim()}
                  alphabetColor={Colors.WHITE_COLOR}
                  url={item?.image[0]}
                  backgroundColor={Colors.TEXT_PLACEHOLDER_COLOR}
                />
              </View>
            </View>
            <View
              style={{
                flexDirection: 'row',
                marginRight: 10,
                marginLeft: 10,
                marginTop: 8,
              }}>
              <Text
                style={{
                  fontFamily: Fonts.Gibson_SemiBold,
                  fontSize: 12,
                  color: Colors.PRIMARY_TEXT_COLOR,
                }}
                numberOfLines={1}>
                {item?.topic || 'N/A'}
              </Text>
            </View>
          </>
        )}
      </TouchableOpacity>
    );
  };

  /**
 * Purpose:Render consultants of flat list
 * Created/Modified By: Jenson
 * Created/Modified Date: 28 Mar 2022
 * Steps:
     1.pass the data from api to customer details child component
    */
  const renderConsultantsCells = ({item, index}) => {
    if (Utilities.isSingleConsultantBusiness() === true) {
      return <GetSingleConsultantsCell item={item} index={index} />;
    } else {
      return <GetConsultantsCell item={item} index={index} />;
    }
  };

  const GetConsultantsCell = ({item, index}) => {
    var departmentName = item?.role_id?.label || 'N/A';
    if (
      Globals.BUSINESS_DETAILS?.businessType ===
      'multiple-service-multiple-consultant'
    ) {
      departmentName = item?.role_id?.label || 'N/A';
    }
    //Show designation in multiple serving #21003
    if (Globals.BUSINESS_DETAILS?.businessType === 'multiple-consultant') {
      if (item?.departments instanceof Array && item?.departments?.length > 0) {
        departmentName = item?.departments
          .map(dep => dep?.department_name)
          .join(', ');
      } else if (
        item?.department_id !== undefined &&
        item?.department_id !== null
      ) {
        departmentName =
          item?.department_id?.department_name ||
          item?.department_id?.role ||
          'N/A';
      } else {
        departmentName = item?.designationInfo?.designation || 'N/A';
      }
    }
    var ratings = '0';
    if (Utilities.isReviewAndRatingEnabled() === true) {
      ratings = item?.rating || '0';
    }

    return (
      <TouchableOpacity
        style={{
          marginLeft: 10,
          width: 182,
          height: Utilities.isReviewAndRatingEnabled() === true ? 120 : 100,
          //Shadow props
          borderWidth: 0.4,
          borderColor: Colors.TEXT_PLACEHOLDER_COLOR,
          backgroundColor: Colors.WHITE_COLOR,
          shadowColor: Colors.SHADOW_COLOR,
          shadowOffset: {width: 0, height: 4},
          shadowOpacity: 0.4,
          shadowRadius: 8,
          elevation: 8,
          borderRadius: 8,
        }}
        onPress={() => onClickConsultantCell(item)}>
        {isLoading ? (
          <ConsultantsListLoader />
        ) : (
          <View style={{}}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <GetImage
                style={{
                  marginTop: 12,
                  marginLeft: 10,
                  width: 30,
                  height: 30,
                  borderRadius: 30 / 2,
                  borderWidth: 1,
                  borderColor: Colors.PRIMARY_COLOR,
                }}
                fullName={(
                  (item?.firstName || 'N/A') +
                  ' ' +
                  (item?.lastName || '')
                ).trim()}
                alphabetColor={Colors.SECONDARY_COLOR}
                url={item?.image}
              />

              <View style={{flexDirection: 'row', marginLeft: 8, marginTop: 3}}>
                {item?.workingHours?.length > 0 ? (
                  <View
                    style={{marginTop: 8, flexDirection: 'row', width: 140}}>
                    {item?.workingHours?.map((dayItem, dayIndex) => {
                      return (
                        <View
                          key={dayIndex.toString()}
                          style={{
                            marginLeft: dayIndex !== 0 ? 5 : 0,
                            width: 13,
                            height: 13,
                            borderRadius: 13 / 2,
                            backgroundColor:
                              dayItem?.activeFlag === true
                                ? Colors.PRIMARY_COLOR
                                : '#D0D0D0',
                            justifyContent: 'center',
                          }}>
                          <Text
                            style={{
                              alignSelf: 'center',
                              color: Colors.WHITE_COLOR,
                              fontFamily: Fonts.Gibson_SemiBold,
                              fontSize: 8,
                            }}>
                            {dayItem?.label[0]}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                ) : null}
              </View>
            </View>

            <Text
              style={{
                marginTop: 14,
                marginLeft: 10,
                marginRight: 10,
                fontFamily: Fonts.Gibson_SemiBold,
                fontSize: 12,
                color: Colors.PRIMARY_TEXT_COLOR,
                textAlign: 'left',
              }}
              numberOfLines={1}>
              {item?.name || 'N/A'}
            </Text>

            <Text
              style={{
                marginLeft: 10,
                marginTop: 8,
                marginRight: 16,
                fontFamily: Fonts.Gibson_Regular,
                fontSize: 12,
                color: Colors.LOCATION_TEXT_COLOR,
                textAlign: 'left',
              }}
              numberOfLines={1}>
              {departmentName || 'N/A'}
            </Text>

            {Utilities.isReviewAndRatingEnabled() === true ? (
              ratings !== '0' ? (
                <View
                  style={{
                    marginLeft: 10,
                    flexDirection: 'row',
                    marginTop: 8,
                    backgroundColor: Colors.SECONDARY_COLOR,
                    height: 14,
                    width: 34,
                    alignItems: 'center',
                    borderRadius: 5,
                  }}>
                  <Text
                    style={{
                      marginLeft: 5,
                      marginTop: 2,
                      fontFamily: Fonts.Gibson_Regular,
                      fontSize: 10,
                      color: Colors.WHITE_COLOR,
                    }}>
                    {ratings.length === 1 ? ratings + '.0' : ratings}
                  </Text>
                  <Image
                    style={{
                      marginLeft: 2,
                      width: 8,
                      height: 8,
                      resizeMode: 'contain',
                    }}
                    source={Images.RATING_STAR_ICON}
                  />
                </View>
              ) : (
                <Text
                  style={{
                    marginLeft: 10,
                    marginTop: 8,
                    fontFamily: Fonts.Gibson_Regular,
                    fontSize: 10,
                    color: '#6F7987',
                    textAlign: 'left',
                  }}>
                  {t(Translations.NO_REVIEWS)}
                </Text>
              )
            ) : null}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const GetSingleConsultantsCell = ({item, index}) => {
    var departmentName = item?.role_id?.label || 'N/A';
    if (
      Globals.BUSINESS_DETAILS?.businessType ===
      'multiple-service-multiple-consultant'
    ) {
      departmentName = item?.role_id?.label || 'N/A';
    }
    //Show designation in multiple serving #21003
    if (Globals.BUSINESS_DETAILS?.businessType === 'multiple-consultant') {
      if (item?.departments instanceof Array && item?.departments?.length > 0) {
        departmentName = item?.departments
          .map(dep => dep?.department_name)
          .join(', ');
      } else if (
        item?.department_id !== undefined &&
        item?.department_id !== null
      ) {
        departmentName =
          item?.department_id?.department_name ||
          item?.department_id?.role ||
          'N/A';
      } else {
        departmentName = item?.designationInfo?.designation || 'N/A';
      }
    }
    var ratings = '0';
    if (Utilities.isReviewAndRatingEnabled() === true) {
      ratings = item?.rating || '0';
    }

    return (
      <TouchableOpacity
        style={{
          marginRight: 10,
          width: DisplayUtils.setWidth(91),
          height: 100,
          //Shadow props
          borderWidth: 0.4,
          borderColor: Colors.TEXT_PLACEHOLDER_COLOR,
          backgroundColor: Colors.WHITE_COLOR,
          shadowColor: Colors.SHADOW_COLOR,
          shadowOffset: {width: 0, height: 4},
          shadowOpacity: 0.4,
          shadowRadius: 8,
          elevation: 8,
          borderRadius: 8,
        }}
        onPress={() => onClickConsultantCell(item)}>
        {isLoading ? (
          <SingleConsultantsListLoader />
        ) : (
          <View style={{}}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                alignContent: 'center',
              }}>
              <View
                style={{
                  flex: 0.25,
                  justifyContent: 'center',
                  alignContent: 'center',
                }}>
                <GetImage
                  style={{
                    marginTop: 20,
                    marginLeft: 20,
                    width: 55,
                    height: 55,
                    borderRadius: 55 / 2,
                    borderWidth: 1,
                    borderColor: Colors.PRIMARY_COLOR,
                  }}
                  fullName={(
                    (item?.firstName || 'N/A') +
                    ' ' +
                    (item?.lastName || '')
                  ).trim()}
                  alphabetColor={Colors.SECONDARY_COLOR}
                  url={item?.image}
                />
              </View>

              <View style={{flex: 0.7}}>
                <View>
                  <Text
                    style={{
                      marginTop: 14,
                      marginLeft: 10,
                      marginRight: 10,
                      fontFamily: Fonts.Gibson_SemiBold,
                      fontSize: 12,
                      color: Colors.PRIMARY_TEXT_COLOR,
                      textAlign: 'left',
                    }}
                    numberOfLines={1}>
                    {item?.name || 'N/A'}
                  </Text>

                  <Text
                    style={{
                      marginLeft: 10,
                      marginTop: 8,
                      marginRight: 16,
                      fontFamily: Fonts.Gibson_Regular,
                      fontSize: 12,
                      color: Colors.LOCATION_TEXT_COLOR,
                      textAlign: 'left',
                    }}
                    numberOfLines={1}>
                    {departmentName || 'N/A'}
                  </Text>
                </View>

                <View
                  style={{flexDirection: 'row', marginLeft: 8, marginTop: 3}}>
                  {Utilities.isReviewAndRatingEnabled() === true ? (
                    ratings !== '0' ? (
                      <View
                        style={{
                          flexDirection: 'row',
                          marginTop: 8,
                          backgroundColor: Colors.SECONDARY_COLOR,
                          height: 14,
                          width: 34,
                          alignItems: 'center',
                          borderRadius: 5,
                        }}>
                        <Text
                          style={{
                            marginLeft: 5,
                            marginTop: 2,
                            fontFamily: Fonts.Gibson_Regular,
                            fontSize: 10,
                            color: Colors.WHITE_COLOR,
                            textAlign: 'left',
                          }}>
                          {ratings.length === 1 ? ratings + '.0' : ratings}
                        </Text>
                        <Image
                          style={{
                            marginLeft: 2,
                            width: 8,
                            height: 8,
                            resizeMode: 'contain',
                          }}
                          source={Images.RATING_STAR_ICON}
                        />
                      </View>
                    ) : (
                      <Text
                        style={{
                          marginTop: 8,
                          fontFamily: Fonts.Gibson_Regular,
                          fontSize: 10,
                          color: '#6F7987',
                          textAlign: 'left',
                        }}>
                        {t(Translations.NO_REVIEWS)}
                      </Text>
                    )
                  ) : null}

                  {item?.workingHours?.length > 0 ? (
                    <View
                      style={{
                        marginLeft: 8,
                        marginTop: 8,
                        flexDirection: 'row',
                        width: 140,
                      }}>
                      {item?.workingHours?.map((dayItem, dayIndex) => {
                        return (
                          <View
                            key={dayIndex.toString()}
                            style={{
                              marginLeft: dayIndex !== 0 ? 5 : 0,
                              width: 13,
                              height: 13,
                              borderRadius: 13 / 2,
                              backgroundColor:
                                dayItem?.activeFlag === true
                                  ? Colors.PRIMARY_COLOR
                                  : '#D0D0D0',
                              justifyContent: 'center',
                            }}>
                            <Text
                              style={{
                                alignSelf: 'center',
                                color: Colors.WHITE_COLOR,
                                fontFamily: Fonts.Gibson_SemiBold,
                                fontSize: 8,
                              }}>
                              {dayItem?.label[0]}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  ) : null}
                </View>
              </View>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  /**
    * Purpose: List empty component
    * Created/Modified By: Jenson John
    * Created/Modified Date: 28 Mar 2022
    * Steps:
        1.Return the component when list is empty
        */
  const ServicesEmptyComponent = () => {
    return (
      <View
        style={{
          height: 100,
          justifyContent: 'center',
          flex: 1,
          marginTop: 10,
        }}>
        <Text
          style={{
            alignSelf: 'center',
            color: Colors.ERROR_RED_COLOR,
            fontFamily: Fonts.Gibson_Regular,
            fontSize: 14,
            marginTop: 8,
          }}>
          {t(Translations.NO_SERVICE_AVAILABLE)}
        </Text>
      </View>
    );
  };

  /**
    * Purpose: List empty component
    * Created/Modified By: Jenson John
    * Created/Modified Date: 28 Mar 2022
    * Steps:
        1.Return the component when list is empty
        */
  const DepartmentEmptyComponent = () => {
    return (
      <View
        style={{
          height: 100,
          justifyContent: 'center',
          flex: 1,
          marginTop: 10,
        }}>
        <Text
          style={{
            alignSelf: 'center',
            color: Colors.ERROR_RED_COLOR,
            fontFamily: Fonts.Gibson_Regular,
            fontSize: 14,
            marginTop: 8,
          }}>
          {isLoading === true ? '' : t(Translations.NO_DEPARTMENT_AVAILABLE)}
        </Text>
      </View>
    );
  };

  /**
  * Purpose: List empty component consultants
  * Created/Modified By: Jenson John
  * Created/Modified Date: 28 Mar 2022
  * Steps:
      1.Return the component when list is empty
      */
  const StoryEmptyComponent = () => {
    return (
      <View
        style={{
          height: 100,
          justifyContent: 'center',
          flex: 1,
          marginTop: 10,
        }}>
        <Text
          style={{
            alignSelf: 'center',
            color: Colors.ERROR_RED_COLOR,
            fontFamily: Fonts.Gibson_Regular,
            fontSize: 14,
            marginTop: 8,
          }}>
          {t(Translations.NO_STORY_FOUND)}
        </Text>
      </View>
    );
  };

  /**
    * Purpose: List empty component consultants
    * Created/Modified By: Jenson John
    * Created/Modified Date: 28 Mar 2022
    * Steps:
        1.Return the component when list is empty
        */
  const ConsultantsEmptyComponent = () => {
    return (
      <View
        style={{
          height: 100,
          justifyContent: 'center',
          flex: 1,
          marginTop: 10,
        }}>
        <Text
          style={{
            alignSelf: 'center',
            color: Colors.ERROR_RED_COLOR,
            fontFamily: Fonts.Gibson_Regular,
            fontSize: 14,
            marginTop: 8,
          }}>
          {t(Translations.NO_CONSULTANT_NO_AVAILABLE)}
        </Text>
      </View>
    );
  };

  const onOpenStory = item => {
    console.log('InstaStory onStart: ', item);
    if (!item?.seen) {
      //Save storyID to db
      if (item?.user_id !== undefined) {
        var currentIds = Globals.SAVED_STORY_IDS;
        if (currentIds !== null) {
          currentIds.push(item?.user_id);
          const unique = [...new Set(currentIds)]; //remove duplicates
          Globals.SAVED_STORY_IDS = unique;
          StorageManager.saveStoryReadIds(unique);
          console.log('Updated SAVED_STORY_IDS: ', Globals.SAVED_STORY_IDS);
        } else {
          Globals.SAVED_STORY_IDS = [item?.user_id];
          StorageManager.saveStoryReadIds(item?.user_id);
          console.log('Updated SAVED_STORY_IDS: ', Globals.SAVED_STORY_IDS);
        }
      }
    }
  };

  const onCloseStory = item => {
    console.log('InstaStory onClose: ', item);
  };

  const addReviewActionHandler = appointmentInfo => {
    // Globals.SHARED_VALUES.SELECTED_APPOINTMENT_INFO = appointmentInfo;
    // console.log('addReviewActionHandler appointmentInfo:', appointmentInfo);
    refRBSheetAddReview.current.open();
  };

  const ratingOkayActionHandler = (item, index) => {
    //Update view status of item
    updateAppointmentBannerViewStatus(item);
  };

  const bannerCloseActionHandler = (item, index) => {
    //Update view status of item
    updateAppointmentBannerViewStatus(item);
  };

  const businessNameImageError = () => {
    console.log('Business Name image load error');
    setIsBusinessNameImageLoadError(true);
  };
  const changeLanguageButtonAction = () => {
    Keyboard.dismiss();
    navigation.navigate('LanguageListScreen');
  };
  // final return
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
        <LoadingIndicator visible={isLoaderLoading} />
        <StatusBar
          backgroundColor={Colors.BACKGROUND_COLOR}
          barStyle="dark-content"
        />
        <GetUpcomingDetailsPopUp />
        <GetAddReviewPopup />
        <View
          style={{
            flexDirection: 'row',

            paddingHorizontal: 15,
          }}>
          <TouchableOpacity
            style={{
              marginTop: 8,
              width: 38,
              height: 38,
            }}
            onPress={() => profileButtonAction()}>
            {Globals.IS_AUTHORIZED === true ? (
              <GetImage
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 38 / 2,
                  borderWidth: 1,
                  borderColor: Colors.SECONDARY_COLOR,
                }}
                fullName={(
                  (Globals.USER_DETAILS?.firstName || 'N/A') +
                  ' ' +
                  (Globals.USER_DETAILS?.lastName || '')
                ).trim()}
                alphabetColor={Colors.PRIMARY_COLOR}
                url={Globals.USER_DETAILS?.image}
              />
            ) : (
              <View
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 38 / 2,
                  borderWidth: 1,
                  borderColor: Colors.SECONDARY_COLOR,
                  backgroundColor: Colors.PRIMARY_COLOR,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Image
                  source={Images.USER_AVATAR_IMAGE}
                  style={{width: 20, height: 20, tintColor: 'white'}}
                />
              </View>
            )}
          </TouchableOpacity>

          {Utilities.isSingleConsultantBusiness() === false ? (
            <TouchableOpacity
              onPress={() => newBookingAction()}
              style={{
                marginLeft: 16,
                marginTop: 8,
                // marginRight:
                //   Globals.IS_AUTHORIZED === true
                //     ? Utilities.isContactlessCheckInEnabled() === true
                //       ? 0
                //       : 75
                //     : Utilities.isContactlessCheckInEnabled() === true
                //     ? 75
                //     : 20,
                alignItems: 'center',
                flexDirection: 'row',
                flex: 1,
                borderColor: Colors.TEXT_PLACEHOLDER_COLOR,
                borderRadius: 5,
                borderWidth: 0.3,
                height: 40,

                //Shadow props
                backgroundColor: Colors.WHITE_COLOR,
                shadowColor: Colors.SHADOW_COLOR,
                shadowOffset: {width: 0, height: 4},
                shadowOpacity: 0.8,
                shadowRadius: 10,
                elevation: 8,
              }}>
              <Text
                style={{
                  marginLeft: 12,
                  fontFamily: Fonts.Gibson_Regular,
                  fontSize: 16,
                  color: Colors.TEXT_PLACEHOLDER_COLOR,
                  textAlign: 'left',
                }}>
                {t(Translations.SEARCH)}
              </Text>
              <View
                style={{
                  backgroundColor: Colors.SECONDARY_COLOR,
                  height: 30,
                  width: 30,
                  justifyContent: 'center',
                  borderRadius: 5,
                  position: 'absolute',
                  right: 10,
                }}>
                <Image
                  style={{
                    height: 16,
                    width: 16,
                    resizeMode: 'contain',
                    alignSelf: 'center',
                    transform: [{scaleX: I18nManager.isRTL ? -1 : 1}],
                  }}
                  source={Images.SEARCH_ICON}
                />
              </View>
            </TouchableOpacity>
          ) : null}

          <View
            style={{
              flexDirection: 'row',

              justifyContent: 'flex-end',
            }}>
            {Utilities.isContactlessCheckInEnabled() === true ? (
              <TouchableOpacity
                onPress={() => scanQRAction()}
                style={{
                  width: 40,
                  height: 40,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginLeft: 8,
                  top: 8,

                  //Shadow props
                  borderWidth: 0.4,
                  borderColor: Colors.TEXT_PLACEHOLDER_COLOR,
                  backgroundColor: Colors.WHITE_COLOR,
                  shadowColor: Colors.SHADOW_COLOR,
                  shadowOffset: {width: 0, height: 4},
                  shadowOpacity: 0.8,
                  shadowRadius: 10,
                  elevation: 8,
                  borderRadius: 8,
                }}>
                <Image
                  style={{
                    width: 18,
                    height: 18,
                    resizeMode: 'contain',
                    alignSelf: 'center',
                    tintColor: Colors.SECONDARY_COLOR,
                    transform: [{scaleX: I18nManager.isRTL ? -1 : 1}],
                  }}
                  source={Images.SCAN_QR_ICON}
                />
                <Text
                  style={{
                    marginTop: 5,
                    fontFamily: Fonts.Gibson_Regular,
                    fontSize: 6,
                    color: Colors.SECONDARY_COLOR,
                    textAlign: 'left',
                  }}>
                  {t(Translations.SCAN_QR)}
                </Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              onPress={() => {
                changeLanguageButtonAction?.();
              }}
              style={{
                width: 40,
                height: 40,
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: 8,
                top: 8,

                //Shadow props
                borderWidth: 0.4,
                borderColor: Colors.TEXT_PLACEHOLDER_COLOR,
                backgroundColor: Colors.WHITE_COLOR,
                shadowColor: Colors.SHADOW_COLOR,
                shadowOffset: {width: 0, height: 4},
                shadowOpacity: 0.8,
                shadowRadius: 10,
                elevation: 8,
                borderRadius: 8,
              }}>
              <Image
                style={{
                  width: 18,
                  height: 18,
                  resizeMode: 'contain',
                  alignSelf: 'center',
                  marginTop: 4,
                  tintColor: Colors.SECONDARY_COLOR,
                  transform: [{scaleX: I18nManager.isRTL ? -1 : 1}],
                }}
                source={Images.CHANGE_LANGUAGE}
              />
              <Text
                style={{
                  marginTop: I18nManager.isRTL ? 5 : 1,
                  fontFamily: Fonts.Gibson_Regular,
                  fontSize: 6,
                  color: Colors.SECONDARY_COLOR,
                  textAlign: 'left',
                  marginBottom: 5,
                }}>
                {t(Translations.CHANGE_LANGUAGE)}
              </Text>
            </TouchableOpacity>
            {Globals.IS_AUTHORIZED === true ? (
              <TouchableOpacity
                onPress={() => notificationButtonAction()}
                style={{
                  width: 40,
                  height: 40,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginLeft: 8,
                  top: 8,

                  //Shadow props
                  borderWidth: 0.4,
                  borderColor: Colors.TEXT_PLACEHOLDER_COLOR,
                  backgroundColor: Colors.WHITE_COLOR,
                  shadowColor: Colors.SHADOW_COLOR,
                  shadowOffset: {width: 0, height: 4},
                  shadowOpacity: 0.8,
                  shadowRadius: 10,
                  elevation: 8,
                  borderRadius: 8,
                }}>
                <LottieView
                  ref={notificationLottieRef}
                  style={{width: 25}}
                  source={Images.NOTIFICATION_UNREAD_ANIMATION}
                  autoPlay={
                    Globals.UN_READ_NOTIFICATION_COUNT === 0 ? false : true
                  }
                  loop={Globals.UN_READ_NOTIFICATION_COUNT === 0 ? false : true}
                  colorFilters={[
                    {
                      keypath: 'bell-ae Outlines',
                      color:
                        Globals.UN_READ_NOTIFICATION_COUNT === 0
                          ? Colors.GREY_COLOR
                          : Colors.SECONDARY_COLOR,
                    },
                  ]}
                />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <View>
            <Text
              style={{
                color: Colors.PRIMARY_TEXT_COLOR,
                marginLeft: 20,
                marginTop: 30,
                fontFamily: Fonts.Gibson_Regular,
                fontSize: 18,
                textAlign: 'left',
              }}>
              {t(Translations.HI)}{' '}
              <Text style={{fontFamily: Fonts.Gibson_SemiBold, fontSize: 18}}>
                {Globals.IS_AUTHORIZED === false
                  ? t(Translations.GUEST)
                  : (
                      (Globals.USER_DETAILS?.firstName || 'N/A') +
                      ' ' +
                      (Globals.USER_DETAILS?.lastName || '')
                    ).trim()}
              </Text>
            </Text>

            <View style={{flexDirection: 'row'}}>
              <Text
                style={{
                  color: Colors.PRIMARY_TEXT_COLOR,
                  marginLeft: 20,
                  marginTop: 8,
                  fontFamily: Fonts.Gibson_Regular,
                  fontSize: 12,
                }}>
                {t(Translations.WELCOME_TO)}{' '}
              </Text>
              {Globals.BUSINESS_DETAILS?.businessNameImage?.trim()?.length >
                0 && isBusinessNameImageLoadError === false ? (
                <FastImage
                  style={{
                    marginLeft: 5,
                    marginTop: 6,
                    height: 18,
                    width: 75,
                    borderWidth: 0.2,
                    borderColor: Colors.TEXT_PLACEHOLDER_COLOR,
                    shadowColor: Colors.SHADOW_COLOR,
                    shadowOffset: {width: 0, height: 4},
                    shadowOpacity: 0.8,
                    shadowRadius: 4,
                    elevation: 4,
                    borderRadius: 3,
                    backgroundColor: '#fff',
                  }}
                  source={{
                    uri: Globals.BUSINESS_DETAILS?.businessNameImage,
                    priority: FastImage.priority.normal,
                  }}
                  resizeMode={FastImage.resizeMode.contain}
                  onError={() => businessNameImageError()}
                />
              ) : (
                <Text
                  style={{
                    color: Colors.PRIMARY_TEXT_COLOR,
                    marginLeft: 5,
                    marginTop: 8,
                    fontFamily: Fonts.Gibson_SemiBold,
                    fontSize: 12,
                  }}>
                  {Globals.BUSINESS_DETAILS?.name || Strings.APP_NAME}
                </Text>
              )}
            </View>
          </View>

          <FastImage
            style={{
              height: 45,
              width: 45,
              borderRadius: 45 / 2,
              marginTop: 20,
              marginRight: 16,
            }}
            source={{
              uri: Globals.BUSINESS_DETAILS?.image,
              priority: FastImage.priority.normal,
            }}
            resizeMode={FastImage.resizeMode.contain}
          />
        </View>

        <View
          style={{
            marginTop: 16,
            height: 1,
            backgroundColor: Colors.LINE_SEPARATOR_COLOR,
          }}
        />
      {/* <Text>RTL   {`${I18nManager.isRTL}`}</Text>   */}
        <ScrollView
          keyboardOffset={110}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          horizontal={false}
          bounces={true}
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'flex-start',
          }}>
          {/* todaysAppointmentBannerList */}
          {Globals.IS_AUTHORIZED === true &&
          todaysAppointmentBannerList.length > 0 ? (
            <TodaysBannerComponent
              data={todaysAppointmentBannerList}
              navigation={navigation}
              addReviewAction={addReviewActionHandler}
              ratingOkayAction={ratingOkayActionHandler}
              bannerCloseAction={bannerCloseActionHandler}
            />
          ) : null}

          {/* service or departments */}
          {Utilities.isServiceBasedBusiness() === true ? (
            <View style={{marginLeft: 20, marginRight: 16, marginTop: 16}}>
              <View
                style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text
                  style={{
                    fontFamily: Fonts.Gibson_Regular,
                    fontSize: 14,
                    color: Colors.PRIMARY_TEXT_COLOR,
                  }}>
                  {t(Translations.CHOOSE)}{' '}
                  <Text
                    style={{
                      fontFamily: Fonts.Gibson_SemiBold,
                      color: Colors.PRIMARY_COLOR,
                    }}>
                    {t(Translations.SERVICES)}
                  </Text>
                </Text>

                <TouchableOpacity
                  onPress={() => servicesViewAllButtonAction()}
                  style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Text
                    style={{
                      color: Colors.PRIMARY_TEXT_COLOR,
                      fontFamily: Fonts.Gibson_Regular,
                      fontSize: 12,
                    }}>
                    {t(Translations.VIEW_ALL)}
                  </Text>
                  <Image
                    style={{
                      marginLeft: 3,
                      width: 8,
                      height: 8,
                      resizeMode: 'contain',
                      transform: [{scaleX: I18nManager.isRTL ? -1 : 1}],
                    }}
                    source={Images.RIGHT_ANGLE_ARROW}
                  />
                </TouchableOpacity>
              </View>
              <View style={{paddingHorizontal: 10,}}>
              <FlatList
                style={{
                  marginLeft:-20,
                  marginRight:-20,
                  marginTop: 13,
                  height: 120,
                }}
                contentContainerStyle={{flexGrow: 1}}
                data={isLoading ? Utilities.getDummyServices() : serviceList}
                initialScrollIndex={
                  isLoading
                    ? 0
                    : I18nManager.isRTL 
                    ? serviceList.length-16
                    : 0
                }
                //  inverted={I18nManager.isRTL ? true: false}
                //  legacyImplementation={true}
                keyboardShouldPersistTaps="always"
                keyboardDismissMode="on-drag"
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                renderItem={renderServicesCells}
                horizontal={true}
                keyExtractor={(item, index) =>
                  item._id ? item._id.toString() : index.toString()
                }
                ListEmptyComponent={ServicesEmptyComponent}
              />
              </View>
            </View>
          ) : Utilities.isSingleConsultantBusiness() === false ? (
            <View style={{marginLeft: 20, marginRight: 16, marginTop: 16}}>
              {/* <View
                style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text
                  style={{
                    fontFamily: Fonts.Gibson_Regular,
                    fontSize: 14,
                    color: Colors.PRIMARY_TEXT_COLOR,
                  }}>
                  {t(Translations.FIND_YOUR)}{' '}
                  <Text
                    style={{
                      fontFamily: Fonts.Gibson_SemiBold,
                      color: Colors.PRIMARY_COLOR,
                    }}>
                    {Utilities.getSpecialistName()}
                  </Text>
                </Text>
                <TouchableOpacity
                  onPress={() => departmentsViewAllButtonAction()}
                  style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Text
                    style={{
                      color: Colors.PRIMARY_TEXT_COLOR,
                      fontFamily: Fonts.Gibson_Regular,
                      fontSize: 12,
                    }}>
                    {t(Translations.VIEW_ALL)}
                  </Text>
                  <Image
                    style={{
                      marginLeft: 3,
                      width: 8,
                      height: 8,
                      resizeMode: 'contain',
                      transform: [{scaleX: I18nManager.isRTL ? -1 : 1}],
                    }}
                    source={Images.RIGHT_ANGLE_ARROW}
                  />
                </TouchableOpacity>
              </View> */}
              <View
                style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <View style={{flexDirection: 'row'}}>
                  <Text
                    style={{
                      fontFamily: Fonts.Gibson_Regular,
                      fontSize: 14,
                      color: Colors.PRIMARY_TEXT_COLOR,
                    }}>
                    {t(Translations.FIND_YOUR)}{' '}
                  </Text>
                  <Text
                    style={{
                      fontFamily: Fonts.Gibson_SemiBold,
                      color: Colors.PRIMARY_COLOR,
                    }}>
                    {Utilities.getSpecialistName()}
                  </Text>
                </View>

                {Utilities.isSingleConsultantBusiness() === false &&
                consultantList.length > 3 ? (
                  <TouchableOpacity
                    onPress={() => departmentsViewAllButtonAction()}
                    style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Text
                      style={{
                        color: Colors.PRIMARY_TEXT_COLOR,
                        fontFamily: Fonts.Gibson_Regular,
                        fontSize: 12,
                      }}>
                      {t(Translations.VIEW_ALL)}
                    </Text>
                    <Image
                      style={{
                        marginLeft: 3,
                        width: 8,
                        height: 8,
                        resizeMode: 'contain',
                        transform: [{scaleX: I18nManager.isRTL ? -1 : 1}],
                      }}
                      source={Images.RIGHT_ANGLE_ARROW}
                    />
                  </TouchableOpacity>
                ) : null}
              </View>
              <View style={{paddingHorizontal: 10, flexDirection:I18nManager.isRTL ?'row-reverse':'row'}}>
                <FlatList
                  style={{
                    marginLeft: -20,
                    marginRight: -20,
                    marginTop: 13,
                    height: 90,
                  }}
                   contentContainerStyle={{flexGrow: 1, flexDirection:I18nManager.isRTL ?'row-reverse':'row'
                   }}
                  data={
                    isLoading ? Utilities.getDummyServices() 
                    :departmentList}
                  // initialScrollIndex={
                  //   isLoading
                  //     ? 0
                  //     : I18nManager.isRTL
                  //     ? departmentList.length-1
                  //     : 0
                  // }
                  inverted={I18nManager.isRTL ? true : false}
                  keyboardShouldPersistTaps="always"
                  keyboardDismissMode="on-drag"
                  showsVerticalScrollIndicator={false}
                  showsHorizontalScrollIndicator={false}
                  renderItem={renderDepartmentCells}
                  horizontal={true}
                  keyExtractor={(item, index) =>
                    item._id ? item._id.toString() : index.toString()
                  }
                  ListEmptyComponent={DepartmentEmptyComponent}
                />
              </View>
            </View>
          ) : null}

          {Utilities.isStoryEnabled() === true && storyList.length > 0 ? (
            <>
              <View
                style={{
                  marginTop: 16,
                  height: 1,
                  backgroundColor: Colors.LINE_SEPARATOR_COLOR,
                }}
              />

              <View style={{marginLeft: 20, marginRight: 16, marginTop: 16}}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}>
                  <Text
                    style={{
                      fontFamily: Fonts.Gibson_Regular,
                      fontSize: 14,
                      color: Colors.PRIMARY_TEXT_COLOR,
                    }}>
                    {t(Translations.NEW)}{' '}
                    <Text
                      style={{
                        fontFamily: Fonts.Gibson_SemiBold,
                        color: Colors.PRIMARY_COLOR,
                      }}>
                      {t(Translations.STORIES)}
                    </Text>
                  </Text>

                  {/* <TouchableOpacity
                      onPress={() => consultantsViewAllButtonAction()}
                      style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={{ color: Colors.PRIMARY_TEXT_COLOR, fontFamily: Fonts.Gibson_Regular, fontSize: 12 }}>View All</Text>
                      <Image style={{ marginLeft: 3, width: 8, height: 8, resizeMode: 'contain' }} source={Images.RIGHT_ANGLE_ARROW} />
                    </TouchableOpacity> */}
                </View>
                {isLoading ? (
                  <FlatList
                    style={{
                      marginLeft: -20,
                      marginRight: -20,
                      marginTop: 13,
                      height: 110,
                    }}
                    contentContainerStyle={{flexGrow: 1}}
                    data={isLoading ? Utilities.getDummyServices() : storyList}
                    keyboardShouldPersistTaps="always"
                    keyboardDismissMode="on-drag"
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                    renderItem={renderStoryCells}
                    horizontal={true}
                    keyExtractor={(item, index) =>
                      item._id ? item._id.toString() : index.toString()
                    }
                    ListEmptyComponent={StoryEmptyComponent}
                  />
                ) : (
                  <View
                    style={{
                      alignItems: 'flex-start',
                      height: 120,
                      marginTop: 5,
                     marginLeft:I18nManager.isRTL ? -10 : -20,
                      marginRight:I18nManager.isRTL ? -20 : -10,
                    }}>
                    <InstaStory
                      data={storyDataList}
                      avatarSize={80}
                      avatarStyle={{
                        width: 80,
                        height: 80,
                        borderRadius: 80 / 2,
                        borderWidth: 2,
                        borderStyle: 'dashed',
                        borderColor: Colors.PRIMARY_COLOR,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                      unPressedBorderColor={Colors.PRIMARY_COLOR}
                      pressedBorderColor={Colors.SECONDARY_COLOR}
                      avatarTextStyle={{
                        marginTop: 8,
                        fontFamily: Fonts.Gibson_SemiBold,
                        fontSize: 12,
                        color: Colors.PRIMARY_TEXT_COLOR,
                        marginLeft:I18nManager.isRTL ? 0 : 8,
                        marginRight:I18nManager.isRTL ? 8 : 0,
                      }}
                      duration={3}
                      onStart={item => onOpenStory(item)}
                      onClose={item => onCloseStory(item)}
                      // customSwipeUpComponent={<View>
                      //   <Text>Swipe</Text>
                      // </View>}
                    />
                  </View>
                )}
              </View>
            </>
          ) : null}

          <View
            style={{
              marginTop: 16,
              height: 1,
              backgroundColor: Colors.LINE_SEPARATOR_COLOR,
            }}
          />

          {/* Available to consult */}

          <View style={{marginLeft: 20, marginRight: 16, marginTop: 16}}>
            <View
              style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <Text
                style={{
                  fontFamily: Fonts.Gibson_Regular,
                  fontSize: 14,
                  color: Colors.PRIMARY_TEXT_COLOR,
                }}>
                {t(Translations.AVAILABLE_TO)}{' '}
                <Text
                  style={{
                    fontFamily: Fonts.Gibson_SemiBold,
                    color: Colors.PRIMARY_COLOR,
                  }}>
                  {t(Translations.CONSULT)}
                </Text>
              </Text>

              {Utilities.isSingleConsultantBusiness() === false &&
              consultantList.length > 3 ? (
                <TouchableOpacity
                  onPress={() => consultantsViewAllButtonAction()}
                  style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Text
                    style={{
                      color: Colors.PRIMARY_TEXT_COLOR,
                      fontFamily: Fonts.Gibson_Regular,
                      fontSize: 12,
                    }}>
                    {t(Translations.VIEW_ALL)}
                  </Text>
                  <Image
                    style={{
                      marginLeft: 3,
                      width: 8,
                      height: 8,
                      resizeMode: 'contain',
                      transform: [{scaleX: I18nManager.isRTL ? -1 : 1}],
                    }}
                    source={Images.RIGHT_ANGLE_ARROW}
                  />
                </TouchableOpacity>
              ) : null}
            </View>

            <View style={{paddingHorizontal: 10,flexDirection:I18nManager.isRTL ?'row-reverse':'row'}}>
            <FlatList
              style={{
                marginLeft: -20,
                marginRight: -20,
                marginTop: 13,
                height:
                  Utilities.isReviewAndRatingEnabled() === true ? 130 : 110,
              }}
              contentContainerStyle={{flexGrow: 1,
                                 }}
                  data={
                    isLoading ? Utilities.getDummyServices() 
                    :consultantList}
              initialScrollIndex={
                isLoading
                  ? 0
                  : I18nManager.isRTL
                  ? consultantList.length -8
                  : 0
              }
              // inverted={I18nManager.isRTL ? true : false}
                  keyboardShouldPersistTaps="always"
                  keyboardDismissMode="on-drag"
                  showsVerticalScrollIndicator={false}
                  showsHorizontalScrollIndicator={false}
                  renderItem={renderConsultantsCells}
                  horizontal={true}
                  keyExtractor={(item, index) =>
                    item._id ? item._id.toString() : index.toString()
                  }
                  ListEmptyComponent={ConsultantsEmptyComponent}
              legacyImplementation={true}
        
            />
            </View>

          </View>

          <View
            style={{
              marginTop: 16,
              height: 1,
              backgroundColor: Colors.LINE_SEPARATOR_COLOR,
            }}
          />

          {Globals.IS_AUTHORIZED === true ? (
            <View style={{marginLeft: 20, marginRight: 16, marginTop: 16}}>
              <View
                style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text
                  style={{
                    fontFamily: Fonts.Gibson_Regular,
                    fontSize: 14,
                    color: Colors.PRIMARY_TEXT_COLOR,
                  }}>
                  {t(Translations.MY)}{' '}
                  <Text
                    style={{
                      fontFamily: Fonts.Gibson_SemiBold,
                      color: Colors.PRIMARY_COLOR,
                    }}>
                    {t(Translations.VISITS)}
                  </Text>
                </Text>
              </View>

              <View
                View
                style={{
                  marginTop: 16,
                  marginBottom: 100,
                  backgroundColor: Colors.WHITE_COLOR,
                  height: 120,
                  flexDirection: 'row',
                  alignItems: 'center',
                  //Shadow props
                  borderWidth: 0.4,
                  borderColor: Colors.TEXT_PLACEHOLDER_COLOR,
                  shadowColor: Colors.SHADOW_COLOR,
                  shadowOffset: {width: 0, height: 4},
                  shadowOpacity: 0.8,
                  shadowRadius: 10,
                  elevation: 8,
                  borderRadius: 8,
                }}>
                <LottieView
                  style={{width: 110, height: 90, marginLeft: 8, marginTop: 4}}
                  source={Images.MY_VISITS_ANIMATION}
                  autoPlay
                  loop
                />

                <View style={{flexDirection: 'row', flex: 1}}>
                  <TouchableOpacity
                    onPress={() => myVisitUpcomingButtonAction()}
                    style={{flex: 0.5, justifyContent: 'center'}}>
                    {isLoading === true ? (
                      <View style={{alignSelf: 'center'}}>
                        <VisitCountLoader />
                      </View>
                    ) : (
                      <Text
                        style={{
                          color: Colors.SECONDARY_COLOR,
                          fontFamily: Fonts.Gibson_SemiBold,
                          fontSize: 22,
                          alignSelf: 'center',
                        }}>
                        {upcomingCount || '0'}
                      </Text>
                    )}
                    <Text
                      style={{
                        marginTop: 5,
                        color: Colors.PRIMARY_TEXT_COLOR,
                        fontFamily: Fonts.Gibson_Regular,
                        fontSize: 12,
                        alignSelf: 'center',
                      }}>
                      {t(Translations.UPCOMING)}
                    </Text>
                  </TouchableOpacity>

                  <View
                    style={{
                      width: 1,
                      height: 70,
                      backgroundColor: Colors.LINE_SEPARATOR_COLOR,
                    }}
                  />

                  <TouchableOpacity
                    style={{flex: 0.5, justifyContent: 'center'}}
                    onPress={() => myVisitPreviousButtonAction()}>
                    {isLoading === true ? (
                      <View style={{alignSelf: 'center'}}>
                        <VisitCountLoader />
                      </View>
                    ) : (
                      <Text
                        style={{
                          color: Colors.PRIMARY_COLOR,
                          fontFamily: Fonts.Gibson_SemiBold,
                          fontSize: 22,
                          alignSelf: 'center',
                        }}>
                        {previousCount || '0'}
                      </Text>
                    )}
                    <Text
                      style={{
                        marginTop: 5,
                        color: Colors.PRIMARY_TEXT_COLOR,
                        fontFamily: Fonts.Gibson_Regular,
                        fontSize: 12,
                        alignSelf: 'center',
                      }}>
                      {t(Translations.PREVIOUS)}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ) : (
            <View
              View
              style={{
                marginTop: 16,
                borderRadius: 8,
                marginBottom: 100,
                backgroundColor: Colors.SECONDARY_COLOR,
                height: 180,
                marginLeft: 20,
                marginRight: 20,
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                <View>
                  <Text
                    style={{
                      marginTop: 16,
                      marginLeft: 16,
                      fontFamily: Fonts.Gibson_SemiBold,
                      fontSize: 16,
                      color: Colors.WHITE_COLOR,
                      textAlign: 'left',
                    }}>
                    {t(Translations.HEALTH_TIPS)}
                  </Text>
                  <Text
                    style={{
                      marginTop: 8,
                      marginLeft: 16,
                      fontFamily: Fonts.Gibson_Regular,
                      fontSize: 12,
                      color: Colors.WHITE_COLOR,
                      alignSelf: 'center',
                      textAlign: 'left',
                      lineHeight: 20,
                    }}>
                    {t(Translations.HEALTH_TIPS_CONTENT)}
                  </Text>
                  <TouchableOpacity
                    style={{
                      marginTop: 15,
                      backgroundColor: Colors.APP_MAIN_BACKGROUND_COLOR,
                      width: 77,
                      height: 18,
                      justifyContent: 'center',
                      alignSelf: 'center',
                    }}>
                    <Text
                      style={{
                        alignSelf: 'center',
                        color: Colors.SECONDARY_COLOR,
                        fontFamily: Fonts.Gibson_Regular,
                        fontSize: 10,
                      }}>
                      {t(Translations.KNOW_MORE)}
                    </Text>
                  </TouchableOpacity>
                </View>

                <Image
                  style={{
                    height: 97,
                    width: 130,
                    marginRight: 20,
                    marginTop: 8,
                    resizeMode: 'contain',
                  }}
                  source={Images.SOCIAL_DISTANCE_IMAGE}
                />
              </View>
            </View>
          )}

          <View style={{flex: 1}} />
        </ScrollView>

        {/* BottomBar */}
        <View
          style={{
            borderTopColor: Colors.SHADOW_COLOR,
            justifyContent: 'center',
            borderTopWidth: 0.5,
            height: 81,
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            flexDirection: 'row',
            //Shadow props
            backgroundColor: Colors.WHITE_COLOR,
            shadowColor: Colors.SHADOW_COLOR,
            shadowOffset: {width: 0, height: 4},
            shadowOpacity: 0.8,
            shadowRadius: 10,
            elevation: 8,
          }}>
          <TouchableOpacity
            style={{
              borderRightWidth: 0.5,
              borderRightColor: Colors.SHADOW_COLOR,
              height: 81,
              width: 75,
              justifyContent: 'center',
            }}>
            <Image
              source={Images.YWAIT_Y_LOGO}
              style={{
                width: 30,
                height: 30,
                alignSelf: 'center',
                tintColor: Colors.SECONDARY_COLOR,
                resizeMode: 'contain',
              }}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => newBookingAction()}
            style={{
              borderRightWidth: 0.5,
              borderRightColor: Colors.SHADOW_COLOR,
              height: 81,
              flex: 1,
              justifyContent: 'center',
              flexDirection: 'row',
            }}>
            <Image
              source={Images.PLUS_ICON}
              style={{
                width: 16,
                height: 16,
                alignSelf: 'center',
                tintColor: Colors.INACTIVE_BOTTOM_BAR_COLOR,
                resizeMode: 'contain',
              }}
            />
            <Text
              style={{
                marginLeft: 8,
                marginRight: 8,
                fontFamily: Fonts.Gibson_SemiBold,
                fontSize: 14,
                color: Colors.INACTIVE_BOTTOM_BAR_COLOR,
                alignSelf: 'center',
              }}>
              {t(Translations.NEW_BOOKING)}
            </Text>
          </TouchableOpacity>

          {Utilities.isSingleConsultantBusiness() === false ? (
            <TouchableOpacity
              onPress={() => favoriteButtonAction()}
              style={{
                borderRightWidth: 0.5,
                borderRightColor: Colors.SHADOW_COLOR,
                height: 81,
                flex: 1,
                justifyContent: 'center',
                flexDirection: 'row',
              }}>
              <Image
                source={Images.HEART_ICON}
                style={{
                  width: 16,
                  height: 16,
                  alignSelf: 'center',
                  tintColor: Colors.INACTIVE_BOTTOM_BAR_COLOR,
                  resizeMode: 'contain',
                }}
              />
              <Text
                style={{
                  marginLeft: 8,
                  marginRight: 8,
                  fontFamily: Fonts.Gibson_SemiBold,
                  fontSize: 14,
                  color: Colors.INACTIVE_BOTTOM_BAR_COLOR,
                  alignSelf: 'center',
                }}>
                {t(Translations.FAVORITES)}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
        {/* End bottom bar */}
      </View>

      <AwesomeAlert
        show={showAlert}
        showProgress={false}
        title={t(Translations.PLEASE_CONFIRM)}
        titleStyle={{
          color: Colors.BLACK_COLOR,
          fontFamily: Fonts.Gibson_Regular,
        }}
        message={t(Translations.EXIT_CONFIRMATION)}
        closeOnTouchOutside={false}
        closeOnHardwareBackPress={false}
        showCancelButton={true}
        showConfirmButton={true}
        animatedValue={0.8}
        cancelText={t(Translations.CANCEL)}
        confirmText={t(Translations.YES)}
        confirmButtonColor={Colors.PRIMARY_COLOR}
        cancelButtonColor={Colors.SECONDARY_COLOR}
        onCancelPressed={() => {
          setShowAlert(false);
        }}
        onConfirmPressed={() => {
          BackHandler.exitApp();
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

      <AwesomeAlert
        show={showLanguageSwitchingAlert}
        showProgress={false}
        title={t(Translations.PLEASE_CONFIRM)}
        titleStyle={{
          color: Colors.BLACK_COLOR,
          fontFamily: Fonts.Gibson_Regular,
        }}
        message={'Do you want to switch the language to device language'}
        closeOnTouchOutside={false}
        closeOnHardwareBackPress={false}
        showCancelButton={true}
        showConfirmButton={true}
        animatedValue={0.8}
        cancelText={t(Translations.NO)}
        confirmText={t(Translations.YES)}
        confirmButtonColor={Colors.PRIMARY_COLOR}
        cancelButtonColor={Colors.SECONDARY_COLOR}
        onCancelPressed={() => {
          setShowLanguageSwitchingAlert(false);
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
export default DashboardScreen;
