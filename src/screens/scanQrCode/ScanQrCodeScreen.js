import React, {useState, useEffect, useRef} from 'react';
import {
  StatusBar,
  Text,
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
  PermissionsAndroid,
  Platform,
  I18nManager
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/core';
import {Colors,Translations, Fonts, Globals, Images, Strings} from '../../constants';
import DisplayUtils from '../../helpers/utils/DisplayUtils';
import QRCodeScanner from 'react-native-qrcode-scanner';
import Utilities from '../../helpers/utils/Utilities';
import DataManager from '../../helpers/apiManager/DataManager';
import APIConnections from '../../helpers/apiManager/APIConnections';
import Geolocation from 'react-native-geolocation-service';
import {PERMISSIONS, check, request} from 'react-native-permissions';
import LoadingIndicator from '../shared/loadingIndicator/LoadingIndicator';
import ScanQrSuccessPopUp from '../scanQrCode/ScanQrSuccessPopUp';
import RBSheet from 'react-native-raw-bottom-sheet';
import {t} from 'i18next';
const ScanQrScreen = ({route}) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);

  const scanCodeSuccessRef = useRef();

  useEffect(() => {
    // getLatitudeAndLongitude()
  }, []);
  const onSuccess = e => {
    console.log(e.data);
    let splittedData = e.data.split('|||');
    console.log('splittedData', splittedData);
    if (splittedData.length > 0) {
      if (splittedData[0] === Globals.BUSINESS_ID) {
        console.log('SAME BUSINESS ID');
        getLatitudeAndLongitude();
      } else {
        navigation.goBack();
        
      Utilities.showToast(
        t(Translations.FAILED),
        t(Translations.INVALID_QR_CODE),
        'error',
        'bottom',
      );
      }
    }
  };
  const getLatitudeAndLongitude = async () => {
    if (Platform.OS === 'android') {
      try {
        const grantedFineLocation = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        const grantedCoarseLocation = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        );
        if (
          grantedFineLocation === PermissionsAndroid.RESULTS.GRANTED &&
          grantedCoarseLocation === PermissionsAndroid.RESULTS.GRANTED
        ) {
          Geolocation.getCurrentPosition(
            position => {
              console.log(position);
              console.log('LATITUDE:', position.coords.latitude);
              console.log('LONGITUDE::', position.coords.longitude);
              getTodaysBookings(
                position.coords.latitude,
                position.coords.longitude,
              );
            },
            error => {
              // See error code charts below.
              console.log(error.code, error.message);
            },
            {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
          );
        } else if (
          grantedFineLocation === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN &&
          grantedCoarseLocation === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN
        ) {
          // Utilities.showToast('Please enable map permission from settings');

           Utilities.showToast(
             t(Translations.FAILED),
             t(Translations.MAP_PERMISSION),
             'error',
             'bottom',
           );
        } else {
          console.log('Map permission denied.');
        }
      } catch (err) {
        console.warn(err);
      }
    } else {
      const resAlways = await check(PERMISSIONS.IOS.LOCATION_ALWAYS);
      const resWhenInUse = await check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
      console.log('resAlways', resAlways);
      console.log('resWhenInUse', resWhenInUse);
      if (resAlways === 'granted' && resWhenInUse === 'granted') {
        Geolocation.getCurrentPosition(
          position => {
            console.log(position);
            console.log('LATITUDE:', position.coords.latitude);
            console.log('LONGITUDE::', position.coords.longitude);
            getTodaysBookings(
              position.coords.latitude,
              position.coords.longitude,
            );
          },
          error => {
            // See error code charts below.
            console.log(error.code, error.message);
          },
          {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
        );
      } else if (
        (resAlways === 'denied' || resAlways === 'blocked') &&
        (resWhenInUse === 'denied' || resWhenInUse === 'blocked')
      ) {
        const res2 = await request(PERMISSIONS.IOS.LOCATION_ALWAYS);
        res2 === 'granted'
          ? Geolocation.getCurrentPosition(
              position => {
                console.log(position);
                console.log('LATITUDE:', position.coords.latitude);
                console.log('LONGITUDE::', position.coords.longitude);
                getTodaysBookings(
                  position.coords.latitude,
                  position.coords.longitude,
                );
              },
              error => {
                // See error code charts below.
                console.log(error.code, error.message);
              },
              {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
            )
          : null;
      }
    }
  };

  /**
           *
           * Purpose: report late
           * Created/Modified By: Sudhin
           * Created/Modified Date: 8 feb 2022
           * Steps:
               1.fetch UpcomingBookingLists list from API and append to state variable
    */

  const performMarkAttendance = () => {
    setIsLoading(true);

    var body = {};
    body[APIConnections.KEYS.BUSINESS_ID] = Globals.BUSINESS_DETAILS?._id;
    body[APIConnections.KEYS.CUSTOMER_ID] = Globals.USER_DETAILS?._id;

    DataManager.performMarkAttendance(body).then(
      ([isSuccess, message, data]) => {
        if (isSuccess === true) {
          setIsLoading(false);
          scanCodeSuccessRef.current.open();
        } else {
          navigation.goBack();
          Utilities.showToast(t(Translations.FAILED), message, 'error', 'bottom');
          setIsLoading(false);
        }
      },
    );
  };

  /**
           *
           * Purpose: report late
           * Created/Modified By: Sudhin
           * Created/Modified Date: 8 feb 2022
           * Steps:
               1.fetch UpcomingBookingLists list from API and append to state variable
    */

  const getTodaysBookings = (latitude, longitude) => {
    setIsLoading(true);

    var body = {};
    body[APIConnections.KEYS.BUSINESS_ID] = Globals.BUSINESS_DETAILS?._id;
    body[APIConnections.KEYS.CUSTOMER_ID] = Globals.USER_DETAILS?._id;
    body[APIConnections.KEYS.LATITUDE] = latitude;
    body[APIConnections.KEYS.LONGITUDE] = longitude;

    DataManager.performGetTodaysAppointments(body).then(
      ([isSuccess, message, data]) => {
        if (isSuccess === true) {
          setIsLoading(false);

          if (data.objects.length > 0) {
            console.log('APPOINTMENT FOUND');
            performMarkAttendance();
          } else {
            console.log('APPOINTMENT NOT FOUND');
            navigation.goBack();
            route.params.onNoAppointmentFound();
            //NAVIGATE TO BOOKING
          }
        } else {
          navigation.goBack();
          Utilities.showToast(t(Translations.FAILED), message, 'error', 'bottom');
          setIsLoading(false);
        }
      },
    );
  };
  /**
   *
      * Purpose:BOOKING SUCCESS
      * Created/Modified By: Vijin Raj
      * Created/Modified Date: 29 Jan 2022
      * Steps:
          1.open the rb sheet
          2.pass the selected value
   */

  const GetScanCodeSuccessPopUp = () => {
    return (
      <RBSheet
        ref={scanCodeSuccessRef}
        closeOnDragDown={false}
        closeOnPressMask={false}
        height={350}
        // onClose={}
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
        <ScanQrSuccessPopUp
          refRBSheet={scanCodeSuccessRef}
          onClosePopup={onCloseQrSuccess}
        />
      </RBSheet>
    );
  };

  const onCloseQrSuccess = () => {
    navigation.goBack();
  };
  const CustomQrMarker = () => {
    return (
      <View
        style={{
          height: 175,
          width: 175,
          borderWidth: 2,
          borderColor: Colors.PRIMARY_COLOR,
        }}
      />
    );
  };

  //final return
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
        <StatusBar
          backgroundColor={Colors.BACKGROUND_COLOR}
          barStyle="dark-content"
        />
        <LoadingIndicator visible={isLoading} />
        <GetScanCodeSuccessPopUp />
        <View style={styles.header}>
          <View
            style={{
              marginTop: 25,
              marginLeft: 20,
              flexDirection: 'row',
            }}>
            <TouchableOpacity
              style={{justifyContent: 'center', marginRight: 20}}
              onPress={() => navigation.goBack()}>
              <Image
                style={{
                  height: 17,
                  width: 24,
                  transform: [{scaleX: I18nManager.isRTL ? -1 : 1}],
                }}
                source={Images.BACK_ARROW}
              />
            </TouchableOpacity>
            <Text
              style={{
                fontFamily: Fonts.Gibson_SemiBold,
                color: Colors.PRIMARY_TEXT_COLOR,
                fontSize: 18,
              }}>
              {t(Translations.PLEASE_SCAN_YOUR_QR_CODE)}
            </Text>
          </View>
        </View>
        <QRCodeScanner
          reactivate={false}
          showMarker={true}
          customMarker={<CustomQrMarker />}
          fadeIn={false}
          //flashMode={RNCamera.Constants.FlashMode.torch}
          onRead={onSuccess}
          topViewStyle={{flex: 0}}
          bottomViewStyle={{flex: 0}}
          cameraStyle={{height: Dimensions.get('window').height}}
        />
      </View>
    </>
  );
};

export default ScanQrScreen;

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.PRIMARY_WHITE,
    width: DisplayUtils.setWidth(100),
    height: 70,
    borderBottomColor: Colors.LINE_SEPARATOR_COLOR,
    borderBottomWidth: 0.5,
  },
});
