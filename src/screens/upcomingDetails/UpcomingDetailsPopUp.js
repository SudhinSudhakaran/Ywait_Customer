import React, {useState, useEffect, useRef} from 'react';
import {
  FlatList,
  Text,
  View,
  Image,
  TouchableOpacity,
  TextInput,
  Platform,
  ScrollView,
  Linking,
  I18nManager,
} from 'react-native';

import {
  Fonts,
  Strings,
  Colors,
  Images,
  Globals,
  Translations,
} from '../../constants';
import {GetImage} from '../shared/getImage/GetImage';
import DisplayUtils from '../../helpers/utils/DisplayUtils';
import {useFocusEffect} from '@react-navigation/core';
import {useNavigation} from '@react-navigation/core';
import Utilities from '../../helpers/utils/Utilities';
import DataManager from '../../helpers/apiManager/DataManager';
import ContentLoader, {Rect, Circle, Path} from 'react-content-loader/native';
import FastImage from 'react-native-fast-image';
import LottieView from 'lottie-react-native';
import NO_DEPARTMENT_ICON from '../../assets/images/departmentEmptyIcon.svg';
import RBSheet from 'react-native-raw-bottom-sheet';
import {GetLottieImage} from '../shared/getLottieImage/GetLottieImage';
import APIConnections from '../../helpers/apiManager/APIConnections';
import VitalsDetailsPopup from './VitalDetailsPopUp';
import AppointmentCancelPopup from '../shared/appointmentCancelPopUp/AppointmentCancelPopUp';
import LoadingIndicator from '../shared/loadingIndicator/LoadingIndicator';
import AppointmentCancelSuccessPopup from '../shared/appointmentCancelSuccessPopUp/AppointmentCancelSuccessPopUp';
import ReminderPopUp from './RemainderPopUp';
import AppointmentRescheduleConfirmPopup from '../shared/appointmentRescheduleConfirmPopup/AppointmentRescheduleConfirmPopup';
import ReportLatePopup from './reportLate/ReportLatePopup';
import TicketScreen from './ticket/TicketScreen';
import {t} from 'i18next';
import moment from 'moment';
import {delay} from 'lodash';
import AwesomeAlert from 'react-native-awesome-alerts';
import {checkPermission} from '../../helpers/utils/Permission';
import { responsiveScreenWidth, responsiveWidth } from 'react-native-responsive-dimensions';
const UpcomingDetailsPopUp = props => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [isLoaderLoading, setIsLoaderLoading] = useState(false);
  const [appointmentDetails, setAppointmentDetails] = useState();
  const [messageText, setMessageText] = useState('');
  const [showQueuePositionView, setShowQueuePositionView] = useState(true);
  const [queuePosition, setQueuePosition] = useState();
  const [showQueueLeftView, setShowQueueLeftView] = useState(true);
  const [queueLeftText, setQueueLeftText] = useState();
  const [queueRightText, setQueueRightText] = useState();
  const [delayTime, setDelayTime] = useState('');
  const [showReportLateAlert, setShowReportLateAlert] = useState(false);
  const [reportLateMessage, setReportLateMessage] = useState('');
  const [isRequestedDelay, setIsRequestedDelay] = useState(false);
  const [
    currentTimeGraterThanAppointmentTime,
    setCurrentTimeGraterThanAppointmentTime,
  ] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const refVitalDetailsPopupRBsheet = useRef();
  const refAppointmentCancelRBsheetPopup = useRef();
  const refAppointmentRescheduleRBsheetPopup = useRef();
  const refReminderPopUpRBsheetPopup = useRef();
  const appointmentCancelSuccessPopupRBsheet = useRef();
  const reportLateRBsheetPopup = useRef();
  const shareTicketRBsheetPopup = useRef();

  useFocusEffect(
    React.useCallback(() => {
      console.log('business details', Globals.BUSINESS_DETAILS);
      getDetails();
      return () => {
        Globals.SHARED_VALUES.SELECTED_APPOINTMENT_TYPE = '';
        Globals.SHARED_VALUES.SELECTED_APPOINTMENT_ID = '';
      };
    }, []),
  );

  const getDetails = () => {
    if (Globals.SHARED_VALUES.SELECTED_APPOINTMENT_TYPE === 'booking') {
      getBookingAppointmentDetails();
    } else {
      getQueueAppointmentDetails();
    }
  };

  const HiTextLoader = props => (
    <ContentLoader
      transform={[{scaleX: I18nManager.isRTL ? -1 : 1}]}
      speed={1.5}
      width={'100%'}
      height={35}
      //viewBox="0 0 320 "
      backgroundColor="#dadada"
      foregroundColor="#eee"
      animate={true}
      {...props}>
      <Rect x="40%" y="20" rx="5" ry="5" width="20%" height="12" />
    </ContentLoader>
  );
  const TitleLoader = props => (
    <ContentLoader
      transform={[{scaleX: I18nManager.isRTL ? -1 : 1}]}
      speed={1.5}
      width={'100%'}
      height={35}
      //viewBox="0 0 320 "
      backgroundColor="#dadada"
      foregroundColor="#eee"
      animate={true}
      {...props}>
      <Rect x="20%" y="10" rx="5" ry="5" width="60%" height="12" />
    </ContentLoader>
  );
  const QueuePositionLoader = props => (
    <ContentLoader
      transform={[{scaleX: I18nManager.isRTL ? -1 : 1}]}
      speed={1.5}
      width={70}
      height={70}
      //viewBox="0 0 320 "
      backgroundColor="#dadada"
      foregroundColor="#eee"
      animate={true}
      {...props}>
      <Rect x="5" y="1" rx="0" ry="0" width="60" height="68" />
    </ContentLoader>
  );
  const QueueCornerPositionLoader = props => (
    <ContentLoader
      transform={[{scaleX: I18nManager.isRTL ? -1 : 1}]}
      speed={1.5}
      width={70}
      height={70}
      //viewBox="0 0 320 "
      backgroundColor="#dadada"
      foregroundColor="#eee"
      animate={true}
      {...props}>
      <Rect x="1" y="1" rx="0" ry="0" width="68" height="68" />
    </ContentLoader>
  );
  const DataLoader = props => (
    <ContentLoader
      transform={[{scaleX: I18nManager.isRTL ? -1 : 1}]}
      speed={1.5}
      width={'100%'}
      height={55}
      //viewBox="0 0 320 "
      backgroundColor="#dadada"
      foregroundColor="#eee"
      animate={true}
      {...props}>
      <Rect x="20%" y="10" rx="5" ry="5" width="60%" height="12" />
      <Rect x="10%" y="30" rx="5" ry="5" width="80%" height="12" />
    </ContentLoader>
  );
  //Button actions
  const closePopupAction = () => {
    //Closing bottom sheet
    if (props.refRBSheet !== undefined) {
      if (props.refRBSheet.current !== undefined) {
        props.refRBSheet.current.close();
      }
    }
  };

  const rescheduleButtonAction = () => {
    if (Globals.BUSINESS_DETAILS?.enableRescheduleFee === true) {
      refAppointmentRescheduleRBsheetPopup.current.open();
    } else {
      rescheduleAction();
    }
  };

  const rescheduleAction = () => {
    //Closing bottom sheet
    if (props.refRBSheet !== undefined) {
      if (props.refRBSheet.current !== undefined) {
        props.refRBSheet.current.close();
      }
    }

    //set serving user info
    let servingUSerInfo = appointmentDetails?.servingUser_id || {};
    Globals.SHARED_VALUES.SELECTED_SERVING_USER_INFO = servingUSerInfo;
    Globals.SHARED_VALUES.SELECTED_SERVING_USER_ID = servingUSerInfo?._id;
    Globals.SHARED_VALUES.SELECTED_SERVING_USER_ROLE_TEXT =
      getServingUserDepartmentName();
    if (Utilities.isGenderSpecificBooking() === true) {
      let selectedGender = appointmentDetails?.gender || 'Male';
      Globals.SHARED_VALUES.SELECTED_GENDER = selectedGender;
    }
    if (Utilities.isServiceBasedBusiness() === true) {
      let selectedServices = appointmentDetails?.services || [];
      var newServiceIdList = [];
      selectedServices.map(_serviceItem => {
        newServiceIdList.push(_serviceItem?._id);
      });
      Globals.SHARED_VALUES.SELECTED_SERVICES_IDS = newServiceIdList;
    }

    Globals.SHARED_VALUES.RESCHEDULE_APPOINTMENT_INFO = appointmentDetails;
    Globals.SHARED_VALUES.IS_RESCHEDULE = true;

    //Activate source callback if needed[Booking success->View details->Reschedule]
    setTimeout(() => {
      if (props.onRescheduleAction !== undefined) {
        props.onRescheduleAction();
      }
    }, 500);

    //Check business types
    if (Utilities.isServiceBasedBusiness() === true) {
      console.log('serve base============',appointmentDetails?.services)
      //Navigate to services with selected services
      navigation.navigate('ServiceListScreen',{services:appointmentDetails?.services});
    } else {
      navigation.navigate('BookingQueueScreen');
    }
  };

  const getServingUserDepartmentName = () => {
    let item = appointmentDetails?.servingUser_id || {};
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
    return departmentName;
  };

  const populateData = appointmentData => {
    let queueIndex = appointmentData?.queueIndex;
    console.log('queueIndex', queueIndex);
    if (queueIndex !== undefined) {
      setShowQueuePositionView(true);
      if (
        queueIndex === 1 ||
        queueIndex === 2 ||
        queueIndex === 3 ||
        queueIndex === 4 ||
        queueIndex === 5 ||
        queueIndex === 6 ||
        queueIndex === 7 ||
        queueIndex === 8 ||
        queueIndex === 9
      ) {
        setQueuePosition('0' + queueIndex.toString());
      } else {
        setQueuePosition(queueIndex.toString());
      }

      if (queueIndex === 1) {
        setShowQueueLeftView(false);
        setQueueLeftText('');
        setQueueRightText('02');
      } else if (queueIndex === 0) {
        setShowQueueLeftView(false);
        setQueueLeftText('');
        setQueueRightText('01');
      } else {
        setShowQueueLeftView(true);
        let incrementIndex = queueIndex + 1;
        let decrementIndex = queueIndex - 1;

        if (
          incrementIndex === 1 ||
          incrementIndex === 2 ||
          incrementIndex === 3 ||
          incrementIndex === 4 ||
          incrementIndex === 5 ||
          incrementIndex === 6 ||
          incrementIndex === 7 ||
          incrementIndex === 8 ||
          incrementIndex === 9
        ) {
          setQueueRightText('0' + incrementIndex.toString());
        } else {
          setQueueRightText(incrementIndex.toString());
        }

        if (
          decrementIndex === 1 ||
          decrementIndex === 2 ||
          decrementIndex === 3 ||
          decrementIndex === 4 ||
          decrementIndex === 5 ||
          decrementIndex === 6 ||
          decrementIndex === 7 ||
          decrementIndex === 8 ||
          decrementIndex === 9
        ) {
          setQueueLeftText('0' + decrementIndex.toString());
        } else {
          setQueueLeftText(decrementIndex.toString());
        }
      }
    }
  };
  const populateMessage = (messages, _appointmentDetails) => {
    console.log('_appointmentDetails', _appointmentDetails);
    messages.map((messageItem, itemIndex) => {
      if (_appointmentDetails.status === messageItem.type.toUpperCase()) {
        console.log(messageItem.message);
        setMessageText(messageItem.message);
      } else {
        console.log('_appointmentDetails.status', _appointmentDetails.status);
        console.log(messageItem.type);
      }
    });
  };
  //API Calls
  /**
           *
           * Purpose: Get user details
           * Created/Modified By: Jenson
           * Created/Modified Date: 04 Jan 2022
           * Steps:
               1.fetch business details from API and append to state variable
    */
  const getBookingAppointmentDetails = () => {
    DataManager.getBookingAppointmentDetails(
      Globals.SHARED_VALUES.SELECTED_APPOINTMENT_ID,
    ).then(([isSuccess, message, data]) => {
      if (isSuccess === true) {
        console.log();
        setAppointmentDetails(data.objects);
        setIsRequestedDelay(data.objects.isRequestedDelay);
        console.log('isRequestedDelay', data.objects.isRequestedDelay);
        populateData(data.objects);
        getMessageText(data.objects);
        configureDelayTime(data.objects.delayReportDuration);
        checkCurrentTimeGraterThanAppointmentTime(data.objects.dateFrom);
      } else {
        Utilities.showToast(t(Translations.FAILED), message, 'error', 'bottom');
        setIsLoading(false);
      }
    });
  };

  const configureDelayTime = _delay => {
    console.log('delayyyy func called', _delay, _delay === '60');
    if (_delay === '60') {
      setDelayTime('You have reported 1 hour late to reach for consultation');
    } else {
      setDelayTime(
        ` You have reported ${_delay} minutes late to reach for consultation`,
      );
    }
  };

  const checkCurrentTimeGraterThanAppointmentTime = dateFrom => {
    console.log(
      'check time =====',
      moment(moment().format()).toISOString() < moment(dateFrom).toISOString(),
    );
    if (moment().toISOString() < moment(dateFrom).toISOString()) {
      console.log('check time', true);
      setCurrentTimeGraterThanAppointmentTime(true);
    } else {
      console.log('check time', false);
      setCurrentTimeGraterThanAppointmentTime(false);
    }
  };

  const reportLateButtonAction = () => {
    console.log(
      'check time =====',
      moment(moment().format()).toISOString() <
        moment(appointmentDetails.dateFrom).toISOString(),
    );
    if (
      moment(moment().format()).toISOString() <
      moment(appointmentDetails.dateFrom).toISOString()
    ) {
      reportLateRBsheetPopup.current.open();
    } else {
      setShowAlert(true);
    }
  };
  /**
           *
           * Purpose: Get user details
           * Created/Modified By: Jenson
           * Created/Modified Date: 04 Jan 2022
           * Steps:
               1.fetch business details from API and append to state variable
    */
  const getQueueAppointmentDetails = () => {
    DataManager.getQueueAppointmentDetails(
      Globals.SHARED_VALUES.SELECTED_APPOINTMENT_ID,
    ).then(([isSuccess, message, data]) => {
      if (isSuccess === true) {
        console.log();
        setAppointmentDetails(data.objects);
        configureDelayTime(data.objects.delayReportDuration);
        setIsRequestedDelay(data.objects.isRequestedDelay);
        console.log('isRequestedDelay', data.objects.isRequestedDelay);
        populateData(data.objects);
        getMessageText(data.objects);
      } else {
        Utilities.showToast(t(Translations.FAILED), message, 'error', 'bottom');
        setIsLoading(false);
      }
    });
  };
  /**
           *
           * Purpose:cancel appointment
           * Created/Modified By: Sudhin
           * Created/Modified Date: 8 feb 2022
           * Steps:
               1.fetch UpcomingBookingLists list from API and append to state variable
   */

  const performCancelAppointmentDetails = () => {
    setIsLoaderLoading(true);
    let selectedEndPoint =
      Globals.SHARED_VALUES.SELECTED_APPOINTMENT_TYPE === 'booking'
        ? APIConnections.ENDPOINTS.CANCEL_BOOKING
        : APIConnections.ENDPOINTS.CANCEL_QUEUE;
    let url = APIConnections.BASE_URL + selectedEndPoint;
    var body = {};
    if (Globals.SHARED_VALUES.SELECTED_APPOINTMENT_TYPE === 'booking') {
      body = {
        [APIConnections.KEYS.STATUS]: 'CANCELLED',
        [APIConnections.KEYS.BUSINESS_ID]: Globals.BUSINESS_DETAILS._id,
        [APIConnections.KEYS.BOOKING_ID]:
          Globals.SHARED_VALUES.SELECTED_APPOINTMENT_ID,
      };
    } else {
      body = {
        [APIConnections.KEYS.STATUS]: 'CANCELLED',
        [APIConnections.KEYS.BUSINESS_ID]: Globals.BUSINESS_DETAILS._id,
        [APIConnections.KEYS.WAITLIST_ID]:
          Globals.SHARED_VALUES.SELECTED_APPOINTMENT_ID,
      };
    }

    DataManager.cancelAppointment(url, body).then(
      ([isSuccess, message, data]) => {
        if (isSuccess === true) {
          console.log(' appointment cancelation status success');
          setIsLoaderLoading(false);
          appointmentCancelSuccessPopupRBsheet.current.open();
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

  /**
               *
               * Purpose: report late
               * Created/Modified By: Sudhin
               * Created/Modified Date: 8 feb 2022
               * Steps:
                   1.fetch UpcomingBookingLists list from API and append to state variable
       */

  const performReportLate = delay => {
    setIsLoaderLoading(true);
    let isBooking =
      Globals.SHARED_VALUES.SELECTED_APPOINTMENT_TYPE === 'booking';

    var body = {};
    body[APIConnections.KEYS.BUSINESS_ID] = Globals.BUSINESS_DETAILS?._id;
    body[APIConnections.KEYS.CUSTOMER_ID] = Globals.USER_DETAILS?._id;
    body[APIConnections.KEYS.SERVING_USER_ID] =
      appointmentDetails?.servingUser_id?._id;
    body[APIConnections.KEYS.DELAY] = delay;
    if (Globals.SHARED_VALUES.SELECTED_APPOINTMENT_TYPE === 'booking') {
      body[APIConnections.KEYS.BOOKING_ID] =
        Globals.SHARED_VALUES.SELECTED_APPOINTMENT_ID;
    } else {
      body[APIConnections.KEYS.QUEUE_ID] =
        Globals.SHARED_VALUES.SELECTED_APPOINTMENT_ID;
    }

    DataManager.performReportLate(isBooking, body).then(
      ([isSuccess, message, data]) => {
        if (isSuccess === true) {
          configureDelayTime(data.objects.delayReportDuration);
          checkCurrentTimeGraterThanAppointmentTime(data.objects.dateFrom);
          setIsLoaderLoading(false);
          // Utilities.showToast(
          //   t(Translations.SUCCESS),
          //   message,
          //   'success',
          //   'bottom',
          // );
          setReportLateMessage(message);
          setShowReportLateAlert(true);
          getDetails();
        } else {
          // Utilities.showToast(
          //   t(Translations.FAILED),
          //   message,
          //   'error',
          //   'bottom',
          // );
          setIsLoaderLoading(false);
          setReportLateMessage(message);
          setShowReportLateAlert(true);
        }
      },
    );
  };

  /**
            *
            * Purpose: Get user details
            * Created/Modified By: Jenson
            * Created/Modified Date: 04 Jan 2022
            * Steps:
                1.fetch business details from API and append to state variable
     */
  const getMessageText = _appointmentDetails => {
    DataManager.getMessagesText().then(([isSuccess, message, data]) => {
      if (isSuccess === true) {
        setIsLoading(false);
        populateMessage(data.objects, _appointmentDetails);
      } else {
        Utilities.showToast(t(Translations.FAILED), message, 'error', 'bottom');
        setIsLoading(false);
      }
    });
  };
  const renderServicesItem = ({item}) => {
    return <ServicesItem item={item} />;
  };

  const ServicesItem = ({item}) => {
    return (
      <View
        style={{
          borderWidth: 1,
          width: responsiveWidth(30),
          height: 80,
          borderRadius: 8,
          borderColor: Colors.SHADOW_COLOR,
         marginRight: 10,
        }}>
        {/* <FastImage
                  style={{
                    marginTop: 10,
                    width: 40,
                    height: 30,
                    alignSelf: 'center',
                  }}
                  source={{
                    uri: item?.image,
                    priority: FastImage.priority.high,
                    cache: FastImage.cacheControl.immutable,
                  }}
                  onError={() => {
                    //console.log(`Image Error fullName: ${fullName}`);
                    // setIsImageError(true);
                  }}
                /> */}
        {item.lottieImageName !== '' &&
        item.lottieImageName?.trim().length > 0 &&
        item.lottieImageName !== undefined ? (
            <GetLottieImage
              style={{
                marginTop: 8,
                height: 35,
                width: 35,
                alignSelf: 'center',
              }}
              url={item.lottieImageName}
            />
        ) : item.image !== '' &&
          item.image !== undefined &&
          item.image.trim().length > 0 ? (
          <FastImage
            style={{
              marginTop: 10,
              width: 40,
              height: 30,
              alignSelf: 'center',
            }}
            source={{
              uri: item.image,
              priority: FastImage.priority.normal,
            }}
            resizeMode={FastImage.resizeMode.contain}
          />
        ) : (
          <NO_DEPARTMENT_ICON
            style={{
              marginTop: 10,
              width: 40,
              height: 30,
              alignSelf: 'center',
            }}
            width={30}
            height={30}
            fill={Colors.WHITE_COLOR}
            fillNoDepartmentSecondary={Colors.SECONDARY_COLOR}
            fillNoDepartmentPrimary={Colors.PRIMARY_COLOR}
          />
        )}
        <View
          style={{flexDirection: 'row', marginTop: 12, alignSelf: 'center'}}>
          {item?.genderSelection === 'male' ? (
            <LottieView
              style={{
                width: 10,
                height: 10,
                marginLeft: 2,
                marginTop: 2,
                marginRight: 8,
              }}
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
              style={{
                width: 10,
                height: 10,
                marginLeft: 2,
                marginTop: 2,
                marginRight: 8,
              }}
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
              style={{
                width: 10,
                height: 10,
                marginLeft: 2,
                marginTop: 2,
                marginRight: 8,
              }}
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
              style={{
                width: 10,
                height: 10,
                marginLeft: 2,
                marginTop: 2,
                marginRight: 8,
              }}
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
          )}
          <Text
            style={{
              color: Colors.PRIMARY_TEXT_COLOR,
              fontSize: 12,
              fontFamily: Fonts.Gibson_SemiBold,
              width: '70%',
              marginTop: 4,
              textAlign:'left',
            }}
            numberOfLines={1}>
            {item.name}
          </Text>
        </View>
      </View>
    );
  };

  /**
         * Purpose:show notes option popup
         * Created/Modified Date: 20 jan 2022
         * Steps:
             1.Open the rbSheet
     */
  const VitalDetailsPopup = () => {
    return (
      <RBSheet
        ref={refVitalDetailsPopupRBsheet}
        closeOnDragDown={false}
        closeOnPressMask={false}
        customStyles={{
          wrapper: {
            backgroundColor: '#00000080',
          },
          container: {
            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,
          },
          draggableIcon: {
            backgroundColor: '#fff',
          },
        }}
        height={400}
        onClose={() => {}}>
        <VitalsDetailsPopup
          refRBSheet={refVitalDetailsPopupRBsheet}
          vitals={appointmentDetails?.vitals}
        />
      </RBSheet>
    );
  };
  /**
       * Purpose:show notes option popup
       * Created/Modified Date: 20 jan 2022
       * Steps:
           1.Open the rbSheet
   */
  const AppointmentCancelPopupComponent = () => {
    return (
      <RBSheet
        ref={refAppointmentCancelRBsheetPopup}
        closeOnDragDown={false}
        closeOnPressMask={false}
        customStyles={{
          wrapper: {
            backgroundColor: '#00000080',
          },
          container: {
            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,
          },
          draggableIcon: {
            backgroundColor: '#fff',
          },
        }}
        height={300}
        onClose={() => {}}>
        <AppointmentCancelPopup
          refRBSheet={refAppointmentCancelRBsheetPopup}
          selectedAppointment={appointmentDetails}
          appointmentCancelAction={appointmentCancelAction}
        />
      </RBSheet>
    );
  };
  const appointmentCancelAction = () => {
    performCancelAppointmentDetails();
    console.log('appointmetnt cancel action');
  };
  /**
            * Purpose:show notes option popup
            * Created/Modified Date: 20 jan 2022
            * Steps:
                1.Open the rbSheet
        */
  const AppointmentCancelSuccessPopupComponent = () => {
    return (
      <RBSheet
        ref={appointmentCancelSuccessPopupRBsheet}
        closeOnDragDown={false}
        closeOnPressMask={false}
        customStyles={{
          wrapper: {
            backgroundColor: '#00000080',
          },
          container: {
            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,
          },
          draggableIcon: {
            backgroundColor: '#fff',
          },
        }}
        height={350}
        onClose={() => navigationToDashBoard()}>
        <AppointmentCancelSuccessPopup
          refRBSheet={appointmentCancelSuccessPopupRBsheet}
          selectedAppointment={appointmentDetails}
          // handleOptionSelection={handleNoteOptionSelection}
        />
      </RBSheet>
    );
  };

  /**
           * Purpose:show reschedule popup
           * Created/Modified Date: 20 jan 2022
           * Steps:
               1.Open the rbSheet
       */
  const AppointmentReschedulePopupComponent = () => {
    return (
      <RBSheet
        ref={refAppointmentRescheduleRBsheetPopup}
        closeOnDragDown={false}
        closeOnPressMask={false}
        customStyles={{
          wrapper: {
            backgroundColor: '#00000080',
          },
          container: {
            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,
          },
          draggableIcon: {
            backgroundColor: '#fff',
          },
        }}
        height={300}
        onClose={() => {}}>
        <AppointmentRescheduleConfirmPopup
          refRBSheet={refAppointmentRescheduleRBsheetPopup}
          selectedAppointment={appointmentDetails}
          appointmentRescheduleAction={appointmentRescheduleActionHandler}
        />
      </RBSheet>
    );
  };

  const appointmentRescheduleActionHandler = () => {
    rescheduleAction();
  };

  /**
       * Purpose: Report late
       * Created/Modified Date: 20 jan 2022
       * Steps:
           1.Open the rbSheet
   */
  const ReportLateComponent = () => {
    return (
      <RBSheet
        ref={reportLateRBsheetPopup}
        closeOnDragDown={false}
        closeOnPressMask={false}
        customStyles={{
          wrapper: {
            backgroundColor: '#00000080',
          },
          container: {
            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,
          },
          draggableIcon: {
            backgroundColor: '#fff',
          },
        }}
        height={340}
        onClose={() => {}}>
        <ReportLatePopup
          refRBSheet={reportLateRBsheetPopup}
          reportLateActon={reportLateActonHandler}
        />
      </RBSheet>
    );
  };
  const reportLateActonHandler = delay => {
    performReportLate(delay);
  };

  /**
       * Purpose: Share ticket
       * Created/Modified Date: 20 jan 2022
       * Steps:
           1.Open the rbSheet
   */
  const ShareTicketComponent = () => {
    return (
      <RBSheet
        ref={shareTicketRBsheetPopup}
        closeOnDragDown={false}
        closeOnPressMask={false}
        customStyles={{
          wrapper: {
            backgroundColor: '#00000080',
          },
          container: {
            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,
          },
          draggableIcon: {
            backgroundColor: '#fff',
          },
        }}
        height={DisplayUtils.setHeight(90)}
        onClose={() => {}}>
        <TicketScreen
          refRBSheet={shareTicketRBsheetPopup}
          selectedAppointment={appointmentDetails}
        />
      </RBSheet>
    );
  };

  const navigationToDashBoard = () => {
    navigation.reset({
      index: 0,
      routes: [{name: 'DashboardScreen'}],
    });
  };
  const openPhoneCall = phoneNumber => {
    var message = t(Translations.PHONE_NUMBER_IS_EMPTY);
    if (phoneNumber) {
      Linking.openURL(`tel:${phoneNumber}`);
    } else {
      Utilities.showToast(t(Translations.FAILED), message, 'error', 'bottom');
    }
  };

  const ScheduleReminder = () => {
    return (
      <RBSheet
        ref={refReminderPopUpRBsheetPopup}
        closeOnDragDown={false}
        closeOnPressMask={true}
        customStyles={{
          wrapper: {
            backgroundColor: '#00000080',
          },
          container: {
            borderTopLeftRadius: 15,
            borderTopRightRadius: 15,
          },
          draggableIcon: {
            backgroundColor: Colors.PRIMARY_TEXT_COLOR,
          },
        }}
        height={DisplayUtils.setHeight(90)}
        onClose={() => {}}>
        <ReminderPopUp
          RBSheet={refReminderPopUpRBsheetPopup}
          appointmentDetails={
            appointmentDetails !== undefined ? appointmentDetails : ''
          }
          onAddReminder={handleOnReminderAdded}
        />
      </RBSheet>
    );
  };
  const handleOnReminderAdded = () => {};

  //Final return
  return (
    <View
      style={{
        flex: 1,
      }}>
      <VitalDetailsPopup />
      <AppointmentCancelPopupComponent />
      <AppointmentCancelSuccessPopupComponent />
      <ScheduleReminder />
      <AppointmentReschedulePopupComponent />
      <ReportLateComponent />
      <ShareTicketComponent />
      <LoadingIndicator visible={isLoaderLoading} />
      {/* title */}
      <View style={{backgroundColor: Colors.SECONDARY_COLOR}}>
        <TouchableOpacity onPress={() => closePopupAction()}>
          <Image
            style={{
              position: 'absolute',
              right: 20,
              top: 15,
              tintColor: Colors.WHITE_COLOR,
              width: 14,
              height: 14,
            }}
            source={Images.CLOSE_ICON}
          />
        </TouchableOpacity>
        {isLoading ? (
          <HiTextLoader />
        ) : (
          <Text
            style={{
              fontFamily: Fonts.Gibson_Light,
              fontSize: 18,
              marginLeft: 16,
              color: Colors.WHITE_COLOR,
              alignSelf: 'center',
              marginTop: 39,
            }}>
            {t(Translations.HI)},
            <Text
              style={{
                fontFamily: Fonts.Gibson_SemiBold,
                fontSize: 18,
                marginLeft: 16,
                color: Colors.WHITE_COLOR,
                alignSelf: 'center',
              }}>
              {Globals.USER_DETAILS.firstName} {Globals.USER_DETAILS.lastName}
            </Text>
          </Text>
        )}

        {isLoading ? (
          <TitleLoader />
        ) : (
          <Text
            style={{
              fontFamily: Fonts.Gibson_Regular,
              fontSize: 14,
              marginLeft: 16,
              color: Colors.WHITE_COLOR,
              alignSelf: 'center',
              marginTop: 12,
              marginBottom: 20,
            }}>
            {messageText}
          </Text>
        )}
      </View>
      <ScrollView style={{marginBottom: 85}}>
        {appointmentDetails?.status === 'SERVING' ? (
          <View
            style={{
              marginTop: 22,
              flexDirection: 'row',
              width: '100%',
              justifyContent: 'center',
            }}>
            {/* TOKEN VIEW */}
            <View
              style={{
                height: 194,
                width: 236,
                //Shadow props
                backgroundColor: Colors.WHITE_COLOR,
                shadowColor: Colors.SHADOW_COLOR,
                shadowOffset: {width: 0, height: 4},
                shadowOpacity: 0.8,
                shadowRadius: 10,
                elevation: 8,
                borderRadius: 20,

                alignItems: 'center',
              }}>
              <View style={{justifyContent: 'center', alignItems: 'center'}}>
                <View
                  style={{
                    height: 95,
                    width: 95,
                    marginTop: 32,
                    //Shadow props
                    backgroundColor: Colors.DARK_BROWN_COLOR,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: 47,
                  }}>
                  <Text
                    style={{
                      fontSize: 35,
                      color: Colors.WHITE_COLOR,
                      fontFamily: Fonts.Gibson_Regular,
                    }}>
                    {appointmentDetails?.token}
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 14,
                    color: Colors.DARK_BROWN_COLOR,
                    fontFamily: Fonts.Gibson_Regular,
                    marginTop: 16,
                  }}>
                  {t(Translations.IS_THE_POSITION_OF_YOUR_TOKEN)}
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: Colors.DARK_BROWN_COLOR,
                    fontFamily: Fonts.Gibson_Regular,
                    marginTop: 4,
                  }}>
                  {t(Translations.IN)}{' '}
                  <Text
                    style={{
                      fontSize: 14,
                      color: Colors.PRIMARY_COLOR,
                      fontFamily: Fonts.Gibson_SemiBold,
                    }}>
                    {t(Translations.QUEUE)}
                  </Text>
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View
            style={{
              marginTop: 22,
              flexDirection: 'row',
              width: '100%',
              justifyContent: 'center',
            }}>
            {/* LEFT QUEUE POSITION VIEW */}
            {showQueueLeftView ? (
              <View
                style={{
                  height: 70,
                  width: 70,
                  //Shadow props
                  borderWidth: 1,
                  borderColor: Colors.HOSPITAL_NAME_COLOR,
                  backgroundColor: Colors.WHITE_COLOR,
                  position: 'absolute',
                  left: -20,
                  top: 80,
                  justifyContent: 'center',
                  alignItems: 'flex-end',
                }}>
                {isLoading ? (
                  <QueueCornerPositionLoader />
                ) : (
                  <Text
                    style={{
                      marginRight: 6,
                      fontSize: 42,
                      color: Colors.HOSPITAL_NAME_COLOR,
                      fontFamily: Fonts.Rift_Demi,
                    }}>
                    {queueLeftText}
                  </Text>
                )}
              </View>
            ) : null}

            {/* QUEUE POSITION VIEW */}
            <View
              style={{
                height: 212,
                width: 181,
                //Shadow props
                borderWidth: 0.1,
                borderColor: Colors.GREY_COLOR,
                backgroundColor: Colors.WHITE_COLOR,
                shadowColor: Colors.SHADOW_COLOR,
                shadowOffset: {width: 0, height: 4},
                shadowOpacity: 0.8,
                shadowRadius: 10,
                elevation: 8,
                borderRadius: 20,

                alignItems: 'center',
              }}>
              <Text
                style={{
                  fontSize: 12,
                  color: Colors.DARK_BROWN_COLOR,
                  fontFamily: Fonts.Gibson_Regular,
                  marginBottom: 15,
                  marginTop: 29,
                }}>
                {t(Translations.YOUR_QUEUE_POSITION)}
              </Text>
              <View style={{justifyContent: 'center', alignItems: 'center'}}>
                <Image
                  style={{width: 181, height: 115}}
                  source={Images.QUEUE_POSITION_IMAGE}
                />
                <View
                  style={{
                    height: 80,
                    width: 70,
                    //Shadow props
                    borderWidth: 2,
                    borderColor: Colors.PRIMARY_COLOR,
                    backgroundColor: Colors.WHITE_COLOR,
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'absolute',
                  }}>
                  {isLoading ? (
                    <QueuePositionLoader />
                  ) : (
                    <Text
                      style={{
                        fontSize: 50,
                        color: Colors.SECONDARY_COLOR,
                        fontFamily: Fonts.Rift_Demi,
                      }}>
                      {queuePosition}
                    </Text>
                  )}
                </View>
              </View>
            </View>

            {/* RIGHT QUEUE POSITION VIEW */}
            <View
              style={{
                height: 70,
                width: 70,
                //Shadow props
                borderWidth: 1,
                borderColor: Colors.HOSPITAL_NAME_COLOR,
                backgroundColor: Colors.WHITE_COLOR,
                alignItems: 'center',
                position: 'absolute',
                right: -15,
                top: 80,
                justifyContent: 'center',
              }}>
              {isLoading ? (
                <QueueCornerPositionLoader />
              ) : (
                <Text
                  style={{
                    fontSize: 42,
                    color: Colors.HOSPITAL_NAME_COLOR,
                    fontFamily: Fonts.Rift_Demi,
                  }}>
                  {queueRightText}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* CONSULTATION WITH */}
        {
          <View style={{marginTop: 47}}>
            {isLoading ? (
              <DataLoader />
            ) : (
              <View>
                <Text
                  style={{
                    fontSize: 12,
                    color: Colors.APPOINTMENT_DETAILS_TEXT_GRAY_COLOR,
                    fontFamily: Fonts.Gibson_Regular,
                    alignSelf: 'center',
                  }}>
                  {t(Translations.CONSULTATION_WITH)}
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    marginTop: 9,
                    color: Colors.APPOINTMENT_DETAILS_BOLD_GRAY_COLOR,
                    fontFamily: Fonts.Gibson_SemiBold,
                    alignSelf: 'center',
                  }}>
                  {appointmentDetails.servingUser_id?.name ||
                    Globals.BUSINESS_DETAILS.name}
                </Text>
              </View>
            )}
          </View>
        }
        {/* SEPARATOR VIEW */}
        <View
          style={{
            width: '80%',
            height: 2,
            backgroundColor: Colors.LIGHT_SEPARATOR_COLOR,
            alignSelf: 'center',
            marginTop: 20,
          }}
        />

        {/* DATE */}
        {
          <View style={{marginTop: 20}}>
            {isLoading ? (
              <DataLoader />
            ) : (
              <View>
                <Text
                  style={{
                    fontSize: 12,
                    color: Colors.APPOINTMENT_DETAILS_TEXT_GRAY_COLOR,
                    fontFamily: Fonts.Gibson_Regular,
                    alignSelf: 'center',
                  }}>
                  {t(Translations.DATE)}
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    marginTop: 9,
                    color: Colors.APPOINTMENT_DETAILS_BOLD_GRAY_COLOR,
                    fontFamily: Fonts.Gibson_SemiBold,
                    alignSelf: 'center',
                  }}>
                  {Utilities.getUtcToLocalWithFormat(
                    appointmentDetails?.dateFrom,
                    'DD MMM YYYY',
                  )}
                </Text>
              </View>
            )}
          </View>
        }

        {/* TIME */}
        {
          <View style={{marginTop: 20}}>
            {isLoading ? (
              <DataLoader />
            ) : (
              <View>
                <Text
                  style={{
                    fontSize: 12,
                    color: Colors.APPOINTMENT_DETAILS_TEXT_GRAY_COLOR,
                    fontFamily: Fonts.Gibson_Regular,
                    alignSelf: 'center',
                  }}>
                  {t(Translations.TIME)}
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    marginTop: 9,
                    color: Colors.APPOINTMENT_DETAILS_BOLD_GRAY_COLOR,
                    fontFamily: Fonts.Gibson_SemiBold,
                    alignSelf: 'center',
                  }}>
                  {Utilities.getUtcToLocalWithFormat(
                    appointmentDetails?.dateFrom,
                    Utilities.isBusiness24HrTimeFormat() ? 'HH:mm' : 'hh:mm A',
                  )}
                </Text>
              </View>
            )}
          </View>
        }

        {/* TOKEN */}
        {appointmentDetails?.status !== 'SERVING' ? (
          <View style={{marginTop: 20}}>
            {isLoading ? (
              <DataLoader />
            ) : (
              <View>
                <Text
                  style={{
                    fontSize: 12,
                    color: Colors.APPOINTMENT_DETAILS_TEXT_GRAY_COLOR,
                    fontFamily: Fonts.Gibson_Regular,
                    alignSelf: 'center',
                  }}>
                  {t(Translations.TOKEN_NUMBER)}
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    marginTop: 9,
                    color: Colors.APPOINTMENT_DETAILS_BOLD_GRAY_COLOR,
                    fontFamily: Fonts.Gibson_SemiBold,
                    alignSelf: 'center',
                  }}>
                  {appointmentDetails?.token}
                </Text>
              </View>
            )}
          </View>
        ) : null}

        {/* ETS */}
        {appointmentDetails?.status === 'ARRIVED' ? (
          <View style={{marginTop: 20}}>
            {isLoading ? (
              <DataLoader />
            ) : (
              <View>
                <Text
                  style={{
                    fontSize: 12,
                    color: Colors.APPOINTMENT_DETAILS_TEXT_GRAY_COLOR,
                    fontFamily: Fonts.Gibson_Regular,
                    alignSelf: 'center',
                  }}>
                  {t(Translations.ETS)}
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    marginTop: 9,
                    color: Colors.APPOINTMENT_DETAILS_BOLD_GRAY_COLOR,
                    fontFamily: Fonts.Gibson_SemiBold,
                    alignSelf: 'center',
                  }}>
                  {Utilities.getUtcToLocalWithFormat(
                    appointmentDetails?.estimatedTime,
                    Utilities.isBusiness24HrTimeFormat() ? 'HH:mm' : 'hh:mm A',
                  )}
                </Text>
              </View>
            )}
          </View>
        ) : null}

        {isRequestedDelay ? (
          <View style={{marginVertical: 20}}>
            <Text
              style={{
                fontSize: 12,
                color: Colors.APPOINTMENT_DETAILS_TEXT_GRAY_COLOR,
                fontFamily: Fonts.Gibson_Regular,
                alignSelf: 'center',
              }}>
              {delayTime}
            </Text>
          </View>
        ) : null}

        {/* SERVICES */}
        {Utilities.isServiceBasedBusiness() ? (
          <View style={{marginTop: 20}}>
            {isLoading ? (
              <DataLoader />
            ) : (
              <View>
                <Text
                  style={{
                    fontSize: 12,
                    color: Colors.APPOINTMENT_DETAILS_TEXT_GRAY_COLOR,
                    fontFamily: Fonts.Gibson_Regular,
                    alignSelf: 'center',
                  }}>
                  {t(Translations.SERVICES)}
                </Text>
                                          <View style={{alignItems:'flex-start',paddingLeft:responsiveWidth(3),paddingRight:responsiveWidth(1)}}>
                <FlatList
                  contentContainerStyle={{}}
                  data={appointmentDetails?.services}
                  keyboardShouldPersistTaps="handled"
                  renderItem={renderServicesItem}
                  keyExtractor={(item, index) =>
                    item._id ? item._id.toString() : index.toString()
                  }
                  horizontal
                  // refreshControl={
                  //   <RefreshControl
                  //     refreshing={refresh}
                  //     onRefresh={onRefresh}
                  //     colors={[Colors.PRIMARY_COLOR, Colors.SECONDARY_COLOR]}
                  //   />
                  // }
                  showsHorizontalScrollIndicator={false}
                />
                </View>
              </View>
            )}
          </View>
        ) : null}
        {/* VITALS */}
        {appointmentDetails?.vitalsUpdated === true ? (
          <TouchableOpacity
            onPress={() => refVitalDetailsPopupRBsheet.current.open()}
            style={{
              position: 'absolute',
              left: 8,
              top: 20,
              borderWidth: 1,
              borderColor: Colors.PRIMARY_COLOR,
              width: 45,
              height: 45,
              borderRadius: 45 / 2,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Image
              source={Images.VITALS_ICON}
              style={{
                width: 25,
                height: 25,
                resizeMode: 'contain',
                tintColor: Colors.PRIMARY_COLOR,
                alignSelf: 'center',
                transform: [{scaleX: I18nManager.isRTL ? -1 : 1}],
              }}
            />
          </TouchableOpacity>
        ) : null}

        {/* SHARE BUTTON */}
        {appointmentDetails !== undefined ? (
          <TouchableOpacity
            onPress={() => shareTicketRBsheetPopup.current.open()}
            style={{
              position: 'absolute',
              right: 8,
              top: 20,
              // borderWidth: 1,
              // borderColor: Colors.PRIMARY_COLOR,
              width: 55,
              height: 55,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Image
              source={Images.SHARE_ICON}
              style={{
                width: 40,
                height: 35,
                resizeMode: 'contain',
                tintColor: Colors.PRIMARY_COLOR,
                alignSelf: 'center',
                transform: [{scaleX: I18nManager.isRTL ? -1 : 1}],
              }}
            />
          </TouchableOpacity>
        ) : null}
      </ScrollView>

      {/* BOTTOM BAR */}
      {appointmentDetails !== undefined ? (
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
          {/* CANCEL */}
          {appointmentDetails?.status !== 'SERVING' ? (
            <View
              style={{
                flex: 1,
                backgroundColor: Colors.WHITE_COLOR,
                borderRightColor: Colors.SHADOW_COLOR,
                borderRightWidth: 0.5,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <TouchableOpacity
                onPress={() => refAppointmentCancelRBsheetPopup.current.open()}
                style={{marginTop: 10}}>
                <Image
                  source={Images.CLOSE_ICON}
                  style={{
                    tintColor: Colors.SECONDARY_COLOR,
                    alignSelf: 'center',
                    height: 20,
                    width: 20,
                  }}
                />
                <Text
                  style={{
                    color: Colors.SECONDARY_COLOR,
                    marginTop: 10,
                    fontFamily: Fonts.Gibson_Regular,
                    fontSize: 10,
                  }}>
                  {t(Translations.CANCEL)}
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* CALL */}
          <View
            style={{
              flex: 1,
              backgroundColor: Colors.WHITE_COLOR,
              alignItems: 'center',
              justifyContent: 'center',
              borderRightColor: Colors.SHADOW_COLOR,
              borderRightWidth: 0.5,
            }}>
            <TouchableOpacity
              style={{marginTop: 10}}
              onPress={() =>
                openPhoneCall(
                  Globals.BUSINESS_DETAILS?.phoneNo ||
                    Globals.BUSINESS_DETAILS?.mobileNo,
                )
              }>
              <Image
                source={Images.CALL_ICON}
                style={{
                  tintColor: Colors.SECONDARY_COLOR,
                  alignSelf: 'center',
                  height: 20,
                  width: 20,
                  transform: [{scaleX: I18nManager.isRTL ? -1 : 1}],
                }}
              />
              <Text
                style={{
                  color: Colors.SECONDARY_COLOR,
                  marginTop: 10,
                  fontFamily: Fonts.Gibson_Regular,
                  fontSize: 10,
                }}>
                {t(Translations.CALL)}
              </Text>
            </TouchableOpacity>
          </View>

          {/* REMINDER */}
          {appointmentDetails?.status === 'PENDING' ? (
            <View
              style={{
                flex: 1,
                backgroundColor: Colors.WHITE_COLOR,
                alignItems: 'center',
                justifyContent: 'center',
                borderRightColor: Colors.SHADOW_COLOR,
                borderRightWidth: 0.5,
              }}>
              <TouchableOpacity
                style={{marginTop: 10}}
                onPress={() => refReminderPopUpRBsheetPopup.current.open()}>
                <Image
                  source={Images.REMINDER_ICON}
                  style={{
                    tintColor: Colors.SECONDARY_COLOR,
                    alignSelf: 'center',
                    height: 20,
                    width: 20,
                    transform: [{scaleX: I18nManager.isRTL ? -1 : 1}],
                  }}
                />
                <Text
                  style={{
                    color: Colors.SECONDARY_COLOR,
                    marginTop: 10,
                    fontFamily: Fonts.Gibson_Regular,
                    fontSize: 10,
                  }}>
                  {t(Translations.REMINDER)}
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* RESCHEDULE */}
          {appointmentDetails?.status === 'PENDING' ? (
            <View
              style={{
                flex: 1,
                backgroundColor: Colors.WHITE_COLOR,
                alignItems: 'center',
                justifyContent: 'center',
                borderRightColor: Colors.SHADOW_COLOR,
                borderRightWidth: 0.5,
              }}>
              <TouchableOpacity
                style={{marginTop: 10}}
                onPress={() => rescheduleButtonAction()}>
                <Image
                  source={Images.CALENDER_ICON_RESCHEDULE}
                  style={{
                    tintColor: Colors.SECONDARY_COLOR,
                    alignSelf: 'center',
                    height: 20,
                    width: 20,
                  }}
                />
                <Text
                  style={{
                    color: Colors.SECONDARY_COLOR,
                    marginTop: 10,
                    fontFamily: Fonts.Gibson_Regular,
                    fontSize: 10,
                  }}>
                  {t(Translations.RESCHEDULE)}
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* REPORT LATE */}
          {appointmentDetails?.status === 'PENDING' ? (
            isRequestedDelay === true ? null : (
              <View
                style={{
                  flex: 1,
                  backgroundColor: Colors.WHITE_COLOR,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRightColor: Colors.SHADOW_COLOR,
                  borderRightWidth: 0.5,
                }}>
                <TouchableOpacity
                  style={{marginTop: 10}}
                  onPress={() => reportLateButtonAction()}>
                  <Image
                    source={Images.REPORT_LATE}
                    style={{
                      tintColor: Colors.SECONDARY_COLOR,
                      alignSelf: 'center',
                      height: 20,
                      width: 20,
                    }}
                  />
                  <Text
                    style={{
                      color: Colors.SECONDARY_COLOR,
                      marginTop: 10,
                      fontFamily: Fonts.Gibson_Regular,
                      fontSize: 10,
                    }}>
                    {t(Translations.REPORT_LATE)}
                  </Text>
                </TouchableOpacity>
              </View>
            )
          ) : null}

          {/* PAY NOW */}
          {appointmentDetails?.status === 'PENDING' &&
          Utilities.isBillingEnabled() === true &&
          Utilities.isOnlinePaymentEnabled() === true &&
          appointmentDetails?.paymentStatus === 'ENDING' ? (
            <View
              style={{
                flex: 1,
                backgroundColor: Colors.WHITE_COLOR,
                alignItems: 'center',
                justifyContent: 'center',
                borderRightColor: Colors.SHADOW_COLOR,
                borderRightWidth: 0.5,
              }}>
              <TouchableOpacity style={{marginTop: 10}}>
                <Image
                  source={Images.PAY_NOW_ICON}
                  style={{
                    tintColor: Colors.SECONDARY_COLOR,
                    alignSelf: 'center',
                    height: 20,
                    width: 20,
                  }}
                />
                <Text
                  style={{
                    color: Colors.SECONDARY_COLOR,
                    marginTop: 10,
                    fontFamily: Fonts.Gibson_Regular,
                    fontSize: 10,
                  }}>
                  {t(Translations.PAY_NOW)}
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      ) : null}
      {/* BOTTOM BAR END*/}

      <AwesomeAlert
        show={showAlert}
        showProgress={false}
        title={''}
        titleStyle={{
          color: Colors.BLACK_COLOR,
          fontFamily: Fonts.Gibson_Regular,
        }}
        message={t(Translations.APPOINTMENT_TIME_EXCEEDED)}
        closeOnTouchOutside={false}
        closeOnHardwareBackPress={false}
        showCancelButton={false}
        showConfirmButton={true}
        animatedValue={0.8}
        cancelText={t(Translations.CANCEL)}
        confirmText={t(Translations.OK)}
        confirmButtonColor={Colors.PRIMARY_COLOR}
        cancelButtonColor={Colors.SECONDARY_COLOR}
        onCancelPressed={() => {
          setShowAlert(false);
        }}
        onConfirmPressed={() => {
          setShowAlert(false);
        }}
        cancelButtonStyle={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 8,
        }}
        confirmButtonStyle={{
          alignItems: 'center',
          justifyContent: 'center',
          width: '50%',
          alignSelf: 'center',
        }}
        actionContainerStyle={{
          alignItems: 'center',
          alignSelf: 'center',
          justifyContent: 'center',
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
        show={showReportLateAlert}
        showProgress={false}
        title={''}
        titleStyle={{
          color: Colors.BLACK_COLOR,
          fontFamily: Fonts.Gibson_Regular,
        }}
        message={reportLateMessage}
        closeOnTouchOutside={false}
        closeOnHardwareBackPress={false}
        showCancelButton={false}
        showConfirmButton={true}
        animatedValue={0.8}
        cancelText={t(Translations.CANCEL)}
        confirmText={t(Translations.OK)}
        confirmButtonColor={Colors.PRIMARY_COLOR}
        cancelButtonColor={Colors.SECONDARY_COLOR}
        onCancelPressed={() => {
          setShowReportLateAlert(false);
        }}
        onConfirmPressed={() => {
          setShowReportLateAlert(false);
        }}
        cancelButtonStyle={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 8,
        }}
        confirmButtonStyle={{
          alignItems: 'center',
          justifyContent: 'center',
          width: '50%',
          alignSelf: 'center',
        }}
        actionContainerStyle={{
          alignItems: 'center',
          alignSelf: 'center',
          justifyContent: 'center',
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
    </View>
  );
};
export default UpcomingDetailsPopUp;
