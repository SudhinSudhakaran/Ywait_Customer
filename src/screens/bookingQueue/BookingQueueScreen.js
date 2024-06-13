import React, {useState, useEffect, useRef, Fragment} from 'react';
import {
  Text,
  View,
  Image,
  Alert,
  FlatList,
  Platform,
  StatusBar,
  TextInput,
  StyleSheet,
  Dimensions,
  ScrollView,
  I18nManager,
  TouchableOpacity,
  TouchableHighlight,
  useWindowDimensions,
} from 'react-native';
import {useNavigation} from '@react-navigation/core';
import {useHeaderHeight} from '@react-navigation/elements';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  Colors,
  Fonts,
  Globals,
  Images,
  Strings,
  Translations,
} from '../../constants';
import moment from 'moment';
import LottieView from 'lottie-react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import {GetImage} from '../shared/getImage/GetImage';
import RazorpayCheckout from 'react-native-razorpay';
import Utilities from '../../helpers/utils/Utilities';
import {useFocusEffect} from '@react-navigation/core';
import QueueSlotList from './SlotLists/QueueSlotList';
import BookingSlotList from './SlotLists/BookingSlotList';
import DisplayUtils from '../../helpers/utils/DisplayUtils';
import DataManager from '../../helpers/apiManager/DataManager';
import {TabView, SceneMap, TabBar} from 'react-native-tab-view';
import NetInfo, {useNetInfo} from '@react-native-community/netinfo';
import APIConnections from '../../helpers/apiManager/APIConnections';
import StorageManager from '../../helpers/storageManager/StorageManager';
import LoadingIndicator from '../shared/loadingIndicator/LoadingIndicator';
import QueueSuccessPopUp from '../successAndFailurePopUps/queuePopUps/QueueSuccessPopUp';
import QueueFailurePopUp from '../successAndFailurePopUps/queuePopUps/QueueFailurePopUp';
import QueueConfirmationPopUp from '../confirmationPopUps/queuePopUps/QueueConfirmationPopUp';
import BookingSuccessPopUp from '../successAndFailurePopUps/bookingPopUps/BookingSuccessPopUp';
import BookingFailurePopUp from '../successAndFailurePopUps/bookingPopUps/BookingFailurePopUp';
import BookingConfirmationPopUp from '../confirmationPopUps/bookingPopUps/BookingConfirmationPopUp';
import QueuePaymentConfirmationPopUp from '../confirmationPopUps/queuePopUps/QueuePaymentConfirmationPopUp';
import BookingPaymentConfirmationPopUp from '../confirmationPopUps/bookingPopUps/BookingPaymentConfirmationPopUp';
import {
  initStripe,
  initPaymentSheet,
  presentPaymentSheet,
} from '@stripe/stripe-react-native';
import {GuestUserAuthSource, PaymentGateway} from '../../helpers/enums/Enums';
import UpcomingDetailsPopUp from '../upcomingDetails/UpcomingDetailsPopUp';
import {t} from 'i18next';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
  responsiveScreenHeight,
  responsiveScreenWidth,
} from "react-native-responsive-dimensions";
export default function BookingQueueScreen(props) {
  // const {  selectedServicesId } = props.route.params;

  var isReschedule = Globals.SHARED_VALUES.IS_RESCHEDULE;
  var selectedServicesId = Globals.SHARED_VALUES.SELECTED_SERVICES_IDS;
  var isServingUserSelected =
    Globals.SHARED_VALUES.SELECTED_SERVING_USER_INFO?._id !== undefined &&
    Globals.SHARED_VALUES.SELECTED_SERVING_USER_INFO?._id !== null
      ? true
      : false;
  var selectedGender = Globals.SHARED_VALUES.SELECTED_GENDER;
  var selectedServingUserId = Globals.SHARED_VALUES.SELECTED_SERVING_USER_ID;
  const selectedServingUserInfo =
    Globals.SHARED_VALUES.SELECTED_SERVING_USER_INFO;
  const selectedServingUserRoleText =
    Globals.SHARED_VALUES.SELECTED_SERVING_USER_ROLE_TEXT;

  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [userIdText, setUserIdText] = useState('');
  const [dateDataIndex, setDateDataIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState(
    Utilities.convertorTimeToBusinessTimeZone(moment().format()),
  );

  const [DATA, setDATA] = useState([]);
  const [dateRefresh, setDateRefresh] = useState(false);
  const [sessionHoursText, setSessionHoursText] = useState('');
  const [selectedDateFrom, setSelectedDateFrom] = useState('');
  const [isRightButtonEnabled, setIsRightButtonEnabled] = useState(false);
  const [rightButtonText, setRightButtonText] = useState(
    t(Translations.CONFIRM),
  );
  const [razorpayOrderId, setRazorpayOrderId] = useState('');
  const [isForceRefresh, setIsForceRefresh] = useState(false);
  const [isLoaderLoading, setIsLoaderLoading] = useState(false);
  const [isSelectedDayToday, setIsSelectedDateToday] = useState(true);
  const [newBookingSuccessData, setNewBookingSuccessData] = useState();
  const [selectedQueueSlotInfo, setSelectedQueueSlotInfo] = useState();
  const [selectedDayIsHoliday, setSelectedDayIsHoliDay] = useState(false);
  const [specialistAvailable, setSpecialistAvailable] = useState(false);
  const [consultantAvailable, setConsultantAvailable] = useState(false);
  const [isQueueSlotsAvailable, setIsQueueSlotsAvailable] = useState(true);
  const [isThereAnyCanBookSlots, setIsThereAnyCanBookSlots] = useState(false);
  const[hideComponent,setHideComponent]=useState(true);
  const dateFlatListRef = useRef();
  const queueSuccessRef = useRef();
  const queueFailureRef = useRef();
  const bookingSuccessRef = useRef();
  const bookingFailureRef = useRef();
  const upcomingDetailsRef = useRef();
  const queueConfirmationRef = useRef();
  const bookingConfirmationRef = useRef();
  const queuePaymentConfirmationRef = useRef();
  const bookingPaymentConfirmationRef = useRef();
  const isConnected = useNetInfo();
  var dateStart = moment(
    moment()
      .utcOffset(Globals.BUSINESS_DETAILS.timeZone.offset)
      .format('MM-DD-YYYY'),
    'MM-DD-YYYY',
  );

  var dateEnd = moment().add(
    Globals.BUSINESS_DETAILS?.bookingSettings?.advanceBookingAvialability
      ?.isActive
      ? Globals.BUSINESS_DETAILS?.bookingSettings?.advanceBookingAvialability
          ?.days
      : 30,
    'days',
  );

  var tempData = [];
useEffect(()=>{
  setHideComponent(false);
},[])
  useFocusEffect(
    React.useCallback(() => {
      console.log('DATE START', moment(dateStart).format('MM - DD-YYYY'));
      checkForAuthStatusChange();
      console.log('isReschedule<----====---->', isReschedule);
      console.log('selectedServingUserRoleText====',selectedServingUserInfo)
      return () => {
        //clean up on screen disappear
      };
    }, []),
  );

  useEffect(() => {
    //  setRightButtonText(t(Translations.CONFIRM));
    loadData();
    return () => {
      Globals.SELECTED_CUSTOMER_INFO = {};
      Globals.SELECTED_DATE_FROM = '';
      Globals.FAILURE_ERROR_MESSAGE = '';
      Globals.SHARED_VALUES.SELECTED_PAYMENT_INFO = {};
    };
  }, []);
  useEffect(() => {
    console.log('date data index', dateDataIndex);

    populateDates(
      Utilities.convertorTimeToBusinessTimeZone(moment().format()),
      moment().utcOffset(Globals.BUSINESS_DETAILS.timeZone.offset).format('D') -
        1,
    );

    if (isReschedule === true) {
      let rescheduleAppointmentDateFrom =
        Globals.SHARED_VALUES.RESCHEDULE_APPOINTMENT_INFO?.dateFrom;
      if (
        rescheduleAppointmentDateFrom !== undefined &&
        rescheduleAppointmentDateFrom !== null
      ) {
        if (tempData instanceof Array && tempData.length > 0) {
          let rescheduleDate = moment(rescheduleAppointmentDateFrom)
            // .utcOffset(Globals.BUSINESS_DETAILS.timeZone.offset)
            .format('MM-DD-YYYY');

          tempData.map((_date, _dateIndex) => {
            console.log(
              '-date ====',
              moment(_date).format('DD-MM-YYYY'),
              _dateIndex,
            );
            let _formattedDate = moment(_date)
              // .utcOffset(Globals.BUSINESS_DETAILS.timeZone.offset)
              .format('MM-DD-YYYY');
            if (_formattedDate === rescheduleDate) {
              console.log('_formattedDate ===>', _formattedDate);
              console.log(
                'rescheduleDate: === for check ===> ',
                rescheduleDate,
              );
              console.log(
                'Found reschedule _dateIndex:for check ===> ',
                _dateIndex,
              );
             setDateDataIndex(_dateIndex);
              setSelectedDate(
                Utilities.BusinessDate(
                  _date)
              );
              const timer = setTimeout(() => {
                dateCellSelectedAction(
                  Utilities.BusinessDate(
                   _date
                  ),
                   _dateIndex,
                  true,
                );
              }, 100);
              return () => clearTimeout(timer);
            }
          });
        }
      }
    } else {
      setDateDataIndex(0);
      setSelectedDate(Utilities.convertorTimeToBusinessTimeZone(moment().format()));
    }
  }, []);
  const [routes] = useState([
    {key: 'tab1', title: t(Translations.BOOKING)},
    {key: 'tab2', title: t(Translations.QUEUE)},
  ]);

  useEffect(() => {
    // console.log('selectedDateFrom= ', selectedDateFrom);
    checkHoliday(selectedDate);
    checkSpecialistAvailable(selectedDate);
    checkConsultant(selectedDate);
  }, [selectedDateFrom,selectedDate]);
  const checkHoliday = _day => {
    let _holiday = Utilities.checkSelectedDateIsHoliday(_day);
    console.log('is selected day is a holiday ?', _holiday);
    setSelectedDayIsHoliDay(_holiday);
  };
  const checkSpecialistAvailable = date => {
    console.log(
      'day Utilities =>...............................',
      moment(date).format('dddd'),
    );
    const _day = moment(date).format('dddd');
    if (
      Globals.BUSINESS_DETAILS?._id !== undefined &&
      Globals.BUSINESS_DETAILS?._id !== null
    ) {
      if (Globals.BUSINESS_DETAILS?.generalHours?.length > 0) {
        Globals.BUSINESS_DETAILS?.generalHours?.map(item => {
          console.log('item?.activeFlag',item?.activeFlag);
          if (_day.toUpperCase() === item.label.toUpperCase()) {
            if (item?.activeFlag===false) {
              setSpecialistAvailable(true);
              console.log('Businesshour====',specialistAvailable);
            }
            else{
              setSpecialistAvailable(false);
              console.log('Businesshourelse',specialistAvailable);
            }
          }
        });
      }
    }
    return specialistAvailable;
  };
  const checkConsultant = date => {
    console.log(
      'day Utilities =>...............................',
      moment(date).format('dddd'),
    );
    const _day = moment(date).format('dddd');
    if (
      Globals.BUSINESS_DETAILS?._id !== undefined &&
      Globals.BUSINESS_DETAILS?._id !== null
    ) {
      if (Globals.SHARED_VALUES.SELECTED_SERVING_USER_INFO?.workingHours?.length > 0) {
        Globals.SHARED_VALUES.SELECTED_SERVING_USER_INFO?.workingHours?.map(item => {
          console.log('consultantflag',item?.activeFlag);
          if (_day.toUpperCase() === item.label.toUpperCase()) {
            if (item?.activeFlag===false) {
              setConsultantAvailable(true);
              console.log('Consultant Businesshour=====',specialistAvailable);
            }
            else{
              setConsultantAvailable(false);
              console.log('ConsultantBusinesshourelse====',specialistAvailable);
            }
          }
        });
      }
    }
    return consultantAvailable;
  };
  const renderScene = ({route}) => {
    switch (route.key) {
      case 'tab1':
        return (
          <BookingSlotList
            index={index}
            isLoading={isLoading}
            isReschedule={isReschedule}
            selectedDate={selectedDate}
            setIsLoading={setIsLoading}
            isForceRefresh={isForceRefresh}
            selectedGender={selectedGender}
            didFoundNextDate={didFoundNextDate}
            selectedServicesId={selectedServicesId}
            isSelectedDayToday={isSelectedDayToday}
            setRightButtonText={setRightButtonText}
            didSelectBookingSlot={didSelectBookingSlot}
            selectedDayIsHoliday={selectedDayIsHoliday}
            specialistAvailable={specialistAvailable}
            hideComponent={hideComponent}
            setHideComponent={setHideComponent}
            consultantAvailable={consultantAvailable}
            selectedServingUserId={selectedServingUserId}
            isServingUserSelected={isServingUserSelected}
            setIsRightButtonEnabled={setIsRightButtonEnabled}
            setIsQueueSlotsAvailable={setIsQueueSlotsAvailable}
            setIsThereAnyCanBookSlots={setIsThereAnyCanBookSlots}
          />
        );
      case 'tab2':
        return (
          <QueueSlotList
            index={index}
            isLoading={isLoading}
            isReschedule={isReschedule}
            selectedDate={selectedDate}
            setIsLoading={setIsLoading}
            isForceRefresh={isForceRefresh}
            selectedGender={selectedGender}
            selectedServicesId={selectedServicesId}
            isSelectedDayToday={isSelectedDayToday}
            setRightButtonText={setRightButtonText}
            didSelectQueueSlot={didSelectQueueSlot}
            selectedDayIsHoliday={selectedDayIsHoliday}
            specialistAvailable={specialistAvailable}
          setHideComponent={setHideComponent}
            hideComponent={hideComponent}
            consultantAvailable={consultantAvailable}
            selectedServingUserId={selectedServingUserId}
            isServingUserSelected={isServingUserSelected}
            setIsRightButtonEnabled={setIsRightButtonEnabled}
            isRightButtonEnabled={isRightButtonEnabled}
          />
        );
      default:
        return null;
    }
  };

  const checkForAuthStatusChange = () => {
    if (Globals.IS_AUTHORIZED === true) {
      //Check for guest user navigation status
      if (Globals.SHARED_VALUES.IS_GUEST_USER_NAV_NEEDED === true) {
        //Register for notification
        performDeviceRegister();
        if (
          Globals.SHARED_VALUES.GUEST_USER_AUTH_SOURCE ===
          GuestUserAuthSource.newBooking
        ) {
          if (Utilities.isBillingEnabled() === true) {
            //Check billing settings and proceed
            getBookingPaymentInitDetails();
          } else {
            //Show confirmation popup
            bookingConfirmationRef.current.open();
          }
        } else if (
          Globals.SHARED_VALUES.GUEST_USER_AUTH_SOURCE ===
          GuestUserAuthSource.newQueueBooking
        ) {
          if (Utilities.isBillingEnabled() === true) {
            //Check billing settings and proceed
            getQueuePaymentInitDetails();
          } else {
            //Show confirmation popup
            queueConfirmationRef.current.open();
          }
        }

        Globals.SHARED_VALUES.IS_GUEST_USER_NAV_NEEDED = false;
        Globals.SHARED_VALUES.GUEST_USER_AUTH_SOURCE = GuestUserAuthSource.none;
      }
    }
  };

  const bottomHomeAction = () => {
    Utilities.resetAllSharedBookingRelatedInfo();
    //Navigate to dashboard
    navigation.reset({
      index: 0,
      routes: [{name: 'DashboardScreen'}],
    });
  };

  const didSelectBookingSlot = (selectedDateFrom, bookingSlotInfo) => {
    if (index === 0) {
      setSelectedDateFrom(selectedDateFrom);
      Globals.SHARED_VALUES.SELECTED_SLOT_INFO = bookingSlotInfo;

      console.log('selectedDateFrom: ', selectedDateFrom);
      if (isServingUserSelected === false) {
        if (Globals.BUSINESS_DETAILS?.autoAssign === true) {
          console.log('auto assign');
          selectedServingUserId = bookingSlotInfo?.servingUserId;
        } else {
          console.log('not assign');
          selectedServingUserId = '';
        }
      }
      console.log(
        'didSelectBookingSlot selectedServingUserId',
        selectedServingUserId,
      );

      // setIsRightButtonEnabled(true)
      // setRightButtonText('Confirm')
    }
  };
  const didFoundNextDate = nextDate => {
    console.log('FOUND NEXT DATE');
    console.log('nextDate:', nextDate);
  };

  const didSelectQueueSlot = selectedQueueInfo => {
    if (index === 1) {
      console.log('selectedQueueInfo:', selectedQueueInfo);
      Globals.SHARED_VALUES.SELECTED_SLOT_INFO = selectedQueueInfo;

      if (isServingUserSelected === false) {
        if (Globals.BUSINESS_DETAILS?.autoAssign === true) {
          selectedServingUserId = selectedQueueInfo?.servingUserId;
        } else {
          selectedServingUserId = '';
        }
      }
      setSelectedDateFrom(selectedQueueInfo?.expectedTimeOfServing);
      setSelectedQueueSlotInfo(selectedQueueInfo);
    }
  };
  const renderTabBar = props => (
    <TabBar
      {...props}
      indicatorStyle={{backgroundColor: Colors.SECONDARY_COLOR}}
      // indicatorContainerStyle={{ marginHorizontal: 60, paddingHorizontal: 120 }}
      // activeColor="#000000"
      // inactiveColor="#FFFFFF"
      pressColor={Colors.APP_MAIN_BACKGROUND_COLOR}
      bounces={false}
      style={{
        height: 35,
        elevation: 0,
        marginLeft: 100,
        shadowOpacity: 0,
        marginRight: 100,
        shadowColor: 'transparent',
        backgroundColor: Colors.APP_MAIN_BACKGROUND_COLOR,
      }}
      renderLabel={({route, focused, color}) => (
        <View
          style={{
            height: 30,
            // borderBottomWidth: focused ? 2 : 0,
            // borderBottomColor: focused
            //   ? Colors.DARK_BROWN_COLOR
            //   : Colors.TAB_VIEW_LABEL_COLOR,
          }}>
          <Text
            style={{
              fontSize: 14,
              fontFamily: Fonts.Gibson_Regular,
              color: focused
                ? Colors.SECONDARY_COLOR
                : Colors.PRIMARY_TEXT_COLOR,
              backgroundColor: 'transparent',
              //   marginTop: 5,
            }}>
            {route.title}
          </Text>
        </View>
      )}
      // tabStyle={{
      // }}
      labelStyle={{}}
      getLabelText={({route}) => route.title}
    />
  );
  /**
   * Purpose:load initial data
   * Created/Modified By: Vijin
   * Created/Modified Date: 11 feb 2022
   * Steps:
   */
  // const Tabs = () => {
  //     return (
  //         <TabView
  //             navigationState={{ index, routes }}
  //             renderScene={renderScene}

  //             onIndexChange={onIndexChange}
  //             renderTabBar={renderTabBar}

  //             initialLayout={{ width: layout.width }}
  //         />
  //     );
  // };
  const onIndexChange = index => {
    console.log('changedIndex', index);
    setSelectedDateFrom('');
    setIndex(index);
    setIsRightButtonEnabled(false);
    setIsLoading(true);
    setRightButtonText(
      isReschedule === true
        ? t(Translations.RESCHEDULE)
        : t(Translations.CONFIRM),
    );
    if (index === 0) {
      // setIsRightButtonEnabled(false)
      // setRightButtonText('Confirm')
    } else {
      // setIsRightButtonEnabled(false)
      // setRightButtonText('Join Queue')
    }
  };

  /**
   * Purpose:load initial data
   * Created/Modified By: Vijin
   * Created/Modified Date: 11 feb 2022
   * Steps:
   */
  const loadData = () => {
    //Set business hours
    loadSessionInfo();
  };

  const loadSessionInfo = (dateSelected = moment()) => {
    if (isServingUserSelected === true) {
      configureSessionInfo(selectedServingUserInfo?.workingHours, dateSelected);
      console.log(
        'selectedServingUserInfo workingHours: ',
        selectedServingUserInfo?.workingHours,
      );
    } else {
      configureSessionInfo(
        Globals.BUSINESS_DETAILS?.generalHours,
        dateSelected,
      );
      console.log(
        'selectedBUSINESS_DETAILS generalHours: ',
        Globals.BUSINESS_DETAILS?.generalHours,
      );
    }
  };

  const configureSessionInfo = (_availabilityInfo, dateSelected) => {
    if (_availabilityInfo !== undefined && _availabilityInfo !== null) {
      if (_availabilityInfo?.length > 0) {
        //Check current date
        let currentBusinessDay = moment(
          Utilities.BusinessDate(moment(dateSelected)),
        ).format('dddd');
        let currentDayWorkingHoursInfo = _availabilityInfo?.filter(
          data => data.label.toUpperCase() === currentBusinessDay.toUpperCase(),
        );

        //checking activeFlag
        if (
          currentDayWorkingHoursInfo[0]?.activeFlag === undefined ||
          currentDayWorkingHoursInfo[0]?.activeFlag === null
            ? false
            : currentDayWorkingHoursInfo[0]?.activeFlag === false
        ) {
          //No consultation
          setSessionHoursText(t(Translations.NO_CONSULTANT_NO_AVAILABLE));
          return;
        } else {
          //Check morning booking or queue available
          let isMorningBookingEnabled =
            currentDayWorkingHoursInfo[0]?.hours[0]?.isBookingEnabled ===
              undefined ||
            currentDayWorkingHoursInfo[0]?.hours[0]?.isBookingEnabled === null
              ? false
              : currentDayWorkingHoursInfo[0]?.hours[0]?.isBookingEnabled;
          let isMorningQueueEnabled =
            currentDayWorkingHoursInfo[0]?.hours[0]?.isQueueEnabled ===
              undefined ||
            currentDayWorkingHoursInfo[0]?.hours[0]?.isQueueEnabled === null
              ? false
              : currentDayWorkingHoursInfo[0]?.hours[0]?.isQueueEnabled;

          //Morning
          let morningFromHour =
            currentDayWorkingHoursInfo[0]?.hours[0]?.from?.hour;
          let morningFromMin =
            currentDayWorkingHoursInfo[0]?.hours[0]?.from?.min;
          let _businessMorningFromTime =
            (morningFromHour.length === 1
              ? `0${morningFromHour}`
              : `${morningFromHour}`) +
            ':' +
            (morningFromMin.length === 1
              ? `0${morningFromMin}`
              : `${morningFromMin}`);

          let morningToHour = currentDayWorkingHoursInfo[0]?.hours[0]?.to?.hour;
          let morningToMin = currentDayWorkingHoursInfo[0]?.hours[0]?.to?.min;
          let _businessMorningToTime =
            (morningToHour.length === 1
              ? `0${morningToHour}`
              : `${morningToHour}`) +
            ':' +
            (morningToMin.length === 1
              ? `0${morningToMin}`
              : `${morningToMin}`);

          let businessMorningFromTime = moment(
            Utilities.convertorTimeToBusinessTimeZone(
              `2022-01-31T${_businessMorningFromTime}:00.000Z`,
            ),
          ).format('hh:mm A');
          let businessMorningToTime = moment(
            Utilities.convertorTimeToBusinessTimeZone(
              `2022-01-31T${_businessMorningToTime}:00.000Z`,
            ),
          ).format('hh:mm A');
          console.log(
            `businessMorningFromTime: ${businessMorningFromTime} businessMorningToTime: ${businessMorningToTime}`,
          );

          var morningTime = `${businessMorningFromTime} - ${businessMorningToTime}`;
          if (
            isMorningBookingEnabled === false &&
            isMorningQueueEnabled === false
          ) {
            morningTime = '';
          }

          //Check evening booking or queue available
          let isEveningBookingEnabled =
            currentDayWorkingHoursInfo[0]?.hours[1]?.isBookingEnabled ===
              undefined ||
            currentDayWorkingHoursInfo[0]?.hours[1]?.isBookingEnabled === null
              ? false
              : currentDayWorkingHoursInfo[0]?.hours[1]?.isBookingEnabled;
          let isEveningQueueEnabled =
            currentDayWorkingHoursInfo[0]?.hours[1]?.isQueueEnabled ===
              undefined ||
            currentDayWorkingHoursInfo[0]?.hours[1]?.isQueueEnabled === null
              ? false
              : currentDayWorkingHoursInfo[0]?.hours[1]?.isQueueEnabled;

          //Evening
          let eveningFromHour =
            currentDayWorkingHoursInfo[0]?.hours[1]?.from?.hour;
          let eveningFromMin =
            currentDayWorkingHoursInfo[0]?.hours[1]?.from?.min;

          let _businessEveningFromTime =
            (eveningFromHour.length === 1
              ? `0${eveningFromHour}`
              : `${eveningFromHour}`) +
            ':' +
            (eveningFromMin.length === 1
              ? `0${eveningFromMin}`
              : `${eveningFromMin}`);

          let eveningToHour = currentDayWorkingHoursInfo[0]?.hours[1]?.to?.hour;
          let eveningToMin = currentDayWorkingHoursInfo[0]?.hours[1]?.to?.min;

          let _businessEveningToTime =
            (eveningToHour.length === 1
              ? `0${eveningToHour}`
              : `${eveningToHour}`) +
            ':' +
            (eveningToMin.length === 1
              ? `0${eveningToMin}`
              : `${eveningToMin}`);

          let businessEveningFromTime = moment(
            Utilities.convertorTimeToBusinessTimeZone(
              `2022-01-31T${_businessEveningFromTime}:00.000Z`,
            ),
          ).format('hh:mm A');
          let businessEveningToTime = moment(
            Utilities.convertorTimeToBusinessTimeZone(
              `2022-01-31T${_businessEveningToTime}:00.000Z`,
            ),
          ).format('hh:mm A');
          console.log(
            `businessEveningFromTime: ${businessEveningFromTime} businessEveningToTime: ${businessEveningToTime}`,
          );

          var eveningTime = `${businessEveningFromTime} - ${businessEveningToTime}`;
          if (
            isEveningBookingEnabled === false &&
            isEveningQueueEnabled === false
          ) {
            eveningTime = '';
          }
          if (morningTime.trim().length > 0 && eveningTime.trim().length > 0) {
            let sessionTime = `${morningTime}` + `, ${eveningTime}`;
            setSessionHoursText(sessionTime);
          } else if (
            morningTime.trim().length > 0 &&
            !(eveningTime.trim().length > 0)
          ) {
            let sessionTime = `${morningTime}`;
            setSessionHoursText(sessionTime);
          } else if (
            !(morningTime.trim().length > 0) &&
            eveningTime.trim().length > 0
          ) {
            let sessionTime = `${eveningTime}`;
            setSessionHoursText(sessionTime);
          } else {
            //No consultation
            setSessionHoursText(t(Translations.NO_CONSULTANT_NO_AVAILABLE));
          }
        }
      }
    }
  };

  /**
   * Purpose:populate date
   * Created/Modified By: Vijin
   * Created/Modified Date: 11 feb 2022
   * Steps:
   */
  const populateDates = (monthForDate, indexForDate) => {
    setHideComponent(false);
    tempData = [];
    console.log('dateEnd', dateEnd);
    console.log('dateStart', dateStart);
    var count = 0;
    while (dateEnd > dateStart) {
      // console.log('date func called');
      count = count + 1;
      tempData.push(dateStart.format());

      dateStart.add(1, 'days');
    }
    console.log('count', count);
    console.log(tempData);
    //2
    setDATA(tempData);

    setDateRefresh(!dateRefresh);
    // goToIndex(0)
  };
  const goToIndex = scrollIndex => {
    if (dateDataIndex !== undefined && DATA.length > dateDataIndex) {
      setTimeout(() => {
        console.log('scrolling to index', dateDataIndex);
        dateFlatListRef.current.scrollToIndex({
          index: scrollIndex,
          animated: true,
        });
      }, 500);
    }
  };
  const dateCellSelectedAction = (item, _index, _isForceRefresh = false) => {
    console.log(
      `'SELECTED DATE=>', ${
        moment(item).format('dddd D MMMM YYYY 00:00:00 ') +
        Utilities.getBusinessTimeZoneOffset()
      } `,
    );

    checkHoliday(item);
     checkSpecialistAvailable(item);
     checkConsultant(item);
    if (_isForceRefresh === true) {
      setIsForceRefresh(!isForceRefresh);
    }

    if (_index === dateDataIndex && _isForceRefresh === false) {
      return;
    }
    setIsRightButtonEnabled(false);
    setRightButtonText(
      isReschedule === true
        ? t(Translations.RESCHEDULE)
        : t(Translations.CONFIRM),
    );
    setSelectedDate(Utilities.BusinessDate(item));
    setDateDataIndex(_index);
    // goToIndex(_index);
    if (moment(item).format('DD MM YYYY') === moment().format('DD MM YYYY')) {
      console.log('TODAY');
      setIsSelectedDateToday(true);
    } else {
      console.log('NOT TODAY');
      setIsSelectedDateToday(false);
    }
    loadSessionInfo(item);
  };
  /**
   * Purpose: render the dates
   * Created/Modified By: sudhin
   * Created/Modified Date: 19 jan 2022
   * Steps: Render the date
   */
  const renderDates = ({item, index}) => {
    //  console.log('renderDate', item);
    return <DateItem item={item} index={index} />;
  };

  /**
      * Purpose: month cell styling
      * Created/Modified By: Vijin
      * Created/Modified Date: 4 Jun 2021
      * Steps: 1.if notread set background view color red else white(becomes hidden)
               2.if selected id and the current idex are equal set the text colrs to red
               3.if the month is January show the year at bottom
    */
  const DateItem = ({item, index}) => {
    return (
      <TouchableOpacity
        key={index.toString()}
        onPress={() => dateCellSelectedAction(item, index)}
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          width: responsiveWidth(23.5),
          height: 77,
          backgroundColor:
            dateDataIndex === index
              ? Colors.SECONDARY_COLOR
              : Colors.NOTIFICATION_BACKGROUND_COLOR,
        }}>
        <Text
          style={{
            fontFamily: Fonts.Gibson_Regular,
            fontSize: 10,
            color:
              dateDataIndex === index
                ? Colors.WHITE_COLOR
                : Colors.PRIMARY_TEXT_COLOR,
            marginBottom: 6,
          }}>
          {moment(item).format('ddd')}
        </Text>
        <Text
          style={{
            fontSize: 20,
            fontFamily: Fonts.Gibson_SemiBold,
            color:
              dateDataIndex === index
                ? Colors.WHITE_COLOR
                : Colors.PRIMARY_TEXT_COLOR,
            marginBottom: 6,
          }}>
          {moment(item).format('DD')}
        </Text>

        <Text
          style={{
            fontSize: 20,
            fontFamily: Fonts.Gibson_Regular,
            color:
              dateDataIndex === index
                ? Colors.WHITE_COLOR
                : Colors.PRIMARY_TEXT_COLOR,
          }}>
          {moment(item).format('MMM')}
        </Text>
      </TouchableOpacity>
    );
  };
  /**
   * Purpose: right button action
   * Created/Modified By: Vijin
   * Created/Modified Date: 4 Jun 2021
   * Steps:
   */
  const rightButtonAction = () => {
    if (isRightButtonEnabled === false) {
      return;
    }
    if (!isLoading) {
      if (index === 0) {
        //Booking confirm action
        if (Globals.IS_AUTHORIZED === true) {
          if (isThereAnyCanBookSlots === true) {
            if (Utilities.isBillingEnabled() === true) {
              //Check billing settings and proceed
              getBookingPaymentInitDetails();
            } else {
              //Show confirmation popup
              bookingConfirmationRef.current.open();
            }
          } else {
            if (
              Globals.BUSINESS_DETAILS?.enableQueue === true &&
              Globals.BUSINESS_DETAILS?.pricePlan_id?.enableQueue === true &&
              isQueueSlotsAvailable
            ) {
              console.log('navigate to queue');
              setIndex(1);
            } else {
              console.log('consultation not available');
            }
          }
        } else {
          //Navigate to login flow.
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
                GuestUserAuthSource.newBooking;
            }
          }
        }
      } else if (index === 1) {
        //Queue confirm action
        if (Globals.IS_AUTHORIZED === true) {
          if (Utilities.isBillingEnabled() === true) {
            //Check billing settings and proceed
            getQueuePaymentInitDetails();
          } else {
            //Show confirmation popup
            queueConfirmationRef.current.open();
          }
        } else {
          //Navigate to login flow.
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
                GuestUserAuthSource.newQueueBooking;
            }
          }
        }
      }
    }
  };

  const getBookingPaymentInitDetails = () => {
    if (Utilities.getPaymentGateway() === PaymentGateway.stripe) {
      fetchBookingTotalsAndStripeIndent();
    } else if (Utilities.getPaymentGateway() === PaymentGateway.razorpay) {
      fetchBookingTotalsAndRazorpayDetails();
    }
  };

  const getQueuePaymentInitDetails = () => {
    if (Utilities.getPaymentGateway() === PaymentGateway.stripe) {
      fetchQueueTotalsAndStripeIndent();
    } else if (Utilities.getPaymentGateway() === PaymentGateway.razorpay) {
      fetchQueueTotalsAndRazorpayDetails();
    }
  };

  //API Calls

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
          // Utils.showToast('Failed!', message, 'error', 'bottom');
          // setIsLoading(false);
        }
      },
    );
  };

  /**
     *
     * Purpose: fetch Booking Totals And StripeIndent
     * Created/Modified By: Jenson
     * Created/Modified Date: 18 Feb 2022
     * Steps:
     1.if login success navigate to drawer navigator else show the message on toast
     */
  const fetchBookingTotalsAndStripeIndent = () => {
    var body = {};
    body[APIConnections.KEYS.CUSTOMER_ID] = Globals.USER_DETAILS._id;
    body[APIConnections.KEYS.BUSINESS_ID] = Globals.BUSINESS_DETAILS._id;
    if (selectedServingUserId?.trim()?.length > 0) {
      body[APIConnections.KEYS.SERVING_USER_ID] = selectedServingUserId;
    }
    body[APIConnections.KEYS.TIME] =
      Globals.SHARED_VALUES.SELECTED_SLOT_INFO?.dateFrom;
    body[APIConnections.KEYS.DURATION] = Utilities.getDuration();
    if (Utilities.isGenderSpecificBooking() === true) {
      body[APIConnections.KEYS.GENDER] = Globals.SHARED_VALUES.SELECTED_GENDER;
    }
    if (Utilities.isServiceBasedBusiness() === true) {
      body[APIConnections.KEYS.SERVICES] =
        Globals.SHARED_VALUES.SELECTED_SERVICES_IDS;
    }
    //Adding reschedule info if needed
    if (isReschedule === true) {
      if (
        Globals.SHARED_VALUES.RESCHEDULE_APPOINTMENT_INFO?.name.toUpperCase() ===
        'Booking'.toUpperCase()
      ) {
        body[APIConnections.KEYS.BOOKING_ID] =
          Globals.SHARED_VALUES.RESCHEDULE_APPOINTMENT_INFO?._id;
      } else {
        body[APIConnections.KEYS.QUEUE_ID] =
          Globals.SHARED_VALUES.RESCHEDULE_APPOINTMENT_INFO?._id;
      }
      body[APIConnections.KEYS.IS_RESCHEDULE] = true;
    }

    setIsLoaderLoading(true);
    DataManager.getBookingPaymentInit(body).then(
      ([isSuccess, message, data]) => {
        if (isSuccess === true) {
          if (data?.objects !== undefined && data?.objects !== null) {
            setIsLoaderLoading(false);
            let paymentInfo = data.objects;
            let totalValDouble = parseFloat(paymentInfo?.total);
            console.log('total:', totalValDouble);
            if (
              totalValDouble > 0 &&
              Utilities.isOnlinePaymentEnabled() === true
            ) {
              let _paymentIntent = paymentInfo?.paymentIntent;
              if (
                _paymentIntent !== undefined &&
                _paymentIntent !== null &&
                _paymentIntent?.trim()?.length > 0
              ) {
                initStripeSDK(_paymentIntent);
                Globals.SHARED_VALUES.SELECTED_PAYMENT_INFO = paymentInfo;
                bookingPaymentConfirmationRef.current.open();
              } else {
                Globals.SHARED_VALUES.FAILURE_ERROR_MESSAGE =
                  Strings.PAYMENT_ERROR;
                bookingFailureRef.current.open();
              }
            } else {
              bookingConfirmationRef.current.open();
            }
          } else {
            setIsLoaderLoading(false);
            Globals.SHARED_VALUES.FAILURE_ERROR_MESSAGE = t(Translations.BLOCKED_CUSTOMER);
            bookingFailureRef.current.open();
          }
        } else {
          // Utilities.showToast('Failed!', message, 'error', 'bottom');
          setIsLoaderLoading(false);
          Globals.SHARED_VALUES.FAILURE_ERROR_MESSAGE = message;
          bookingFailureRef.current.open();
        }
      },
    );
  };

  /**
    *
    * Purpose: fetchBookingTotalsAndRazorpayDetails
    * Created/Modified By: Jenson
    * Created/Modified Date: 18 Feb 2022
    * Steps:
    1.if login success navigate to drawer navigator else show the message on toast
    */
  const fetchBookingTotalsAndRazorpayDetails = () => {
    var body = {};
    body[APIConnections.KEYS.CUSTOMER_ID] = Globals.USER_DETAILS._id;
    body[APIConnections.KEYS.BUSINESS_ID] = Globals.BUSINESS_DETAILS._id;
    if (selectedServingUserId?.trim()?.length > 0) {
      body[APIConnections.KEYS.SERVING_USER_ID] = selectedServingUserId;
    }
    body[APIConnections.KEYS.TIME] =
      Globals.SHARED_VALUES.SELECTED_SLOT_INFO?.dateFrom;
    body[APIConnections.KEYS.DURATION] = Utilities.getDuration();
    if (Utilities.isGenderSpecificBooking() === true) {
      body[APIConnections.KEYS.GENDER] = Globals.SHARED_VALUES.SELECTED_GENDER;
    }
    if (Utilities.isServiceBasedBusiness() === true) {
      body[APIConnections.KEYS.SERVICES] =
        Globals.SHARED_VALUES.SELECTED_SERVICES_IDS;
    }
    //Adding reschedule info if needed
    if (isReschedule === true) {
      if (
        Globals.SHARED_VALUES.RESCHEDULE_APPOINTMENT_INFO?.name.toUpperCase() ===
        'Booking'.toUpperCase()
      ) {
        body[APIConnections.KEYS.BOOKING_ID] =
          Globals.SHARED_VALUES.RESCHEDULE_APPOINTMENT_INFO?._id;
      } else {
        body[APIConnections.KEYS.QUEUE_ID] =
          Globals.SHARED_VALUES.RESCHEDULE_APPOINTMENT_INFO?._id;
      }
      body[APIConnections.KEYS.IS_RESCHEDULE] = true;
    }

    setIsLoaderLoading(true);
    DataManager.getBookingPaymentInit(body).then(
      ([isSuccess, message, data]) => {
        if (isSuccess === true) {
          if (data?.objects !== undefined && data?.objects !== null) {
            setIsLoaderLoading(false);
            let paymentInfo = data.objects;
            let totalValDouble = parseFloat(paymentInfo?.total);
            console.log('total:', totalValDouble);
            if (
              totalValDouble > 0 &&
              Utilities.isOnlinePaymentEnabled() === true
            ) {
              let _orderId = paymentInfo?.orderId;
              if (
                _orderId !== undefined &&
                _orderId !== null &&
                _orderId?.trim()?.length > 0
              ) {
                setRazorpayOrderId(_orderId);
                Globals.SHARED_VALUES.SELECTED_PAYMENT_INFO = paymentInfo;
                bookingPaymentConfirmationRef.current.open();
              } else {
                Globals.SHARED_VALUES.FAILURE_ERROR_MESSAGE =
                  Strings.PAYMENT_ERROR;
                bookingFailureRef.current.open();
              }
            } else {
              bookingConfirmationRef.current.open();
            }
          } else {
            setIsLoaderLoading(false);
            Globals.SHARED_VALUES.FAILURE_ERROR_MESSAGE = Strings.UNKNOWN_ERROR;
            bookingFailureRef.current.open();
          }
        } else {
          // Utilities.showToast('Failed!', message, 'error', 'bottom');
          setIsLoaderLoading(false);
          Globals.SHARED_VALUES.FAILURE_ERROR_MESSAGE = message;
          bookingFailureRef.current.open();
        }
      },
    );
  };

  /**
     *
     * Purpose: performAddBooking
     * Created/Modified By: Jenson
     * Created/Modified Date: 18 Feb 2022
     * Steps:
     1.if login success navigate to drawer navigator else show the message on toast
     */
  const performAddBooking = () => {
    var body = {};
    body[APIConnections.KEYS.CUSTOMER_ID] = Globals.USER_DETAILS._id;
    body[APIConnections.KEYS.BUSINESS_ID] = Globals.BUSINESS_DETAILS._id;
    if (selectedServingUserId?.trim()?.length > 0) {
      body[APIConnections.KEYS.SERVING_USER_ID] = selectedServingUserId;
    }
    body[APIConnections.KEYS.TIME] =
      Globals.SHARED_VALUES.SELECTED_SLOT_INFO?.dateFrom;
    body[APIConnections.KEYS.DURATION] = Utilities.getDuration();
    if (Utilities.isGenderSpecificBooking() === true) {
      body[APIConnections.KEYS.GENDER] = Globals.SHARED_VALUES.SELECTED_GENDER;
    }
    if (Utilities.isServiceBasedBusiness() === true) {
      body[APIConnections.KEYS.SERVICES] =
        Globals.SHARED_VALUES.SELECTED_SERVICES_IDS;
    }
    if (
      Utilities.isBillingEnabled() === true &&
      Utilities.isOnlinePaymentEnabled() === true &&
      parseFloat(Globals.SHARED_VALUES.SELECTED_PAYMENT_INFO?.total || '0') > 0
    ) {
      body[APIConnections.KEYS.PAYMENT_STATUS] = 'PAID';
      body[APIConnections.KEYS.PAYMENT_TYPE] = 'online';
      if (Utilities.getPaymentGateway() === PaymentGateway.stripe) {
        body[APIConnections.KEYS.PAYMENT_ID] =
          Globals.SHARED_VALUES.SELECTED_PAYMENT_INFO?.paymentIntent;
      } else if (Utilities.getPaymentGateway() === PaymentGateway.razorpay) {
        body[APIConnections.KEYS.PAYMENT_ID] =
          Globals.SHARED_VALUES.SELECTED_PAYMENT_INFO?.orderId;
      }
    }
    setIsLoaderLoading(true);
    DataManager.performAddBooking(body).then(([isSuccess, message, data]) => {
      if (isSuccess === true) {
        if (data?.objects !== undefined && data?.objects !== null) {
          Globals.SHARED_VALUES.NEW_SUCCESS_APPOINTMENT_INFO = data?.objects;
          setIsLoaderLoading(false);
          bookingSuccessRef.current.open();
        } else {
          setIsLoaderLoading(false);
          Globals.SHARED_VALUES.FAILURE_ERROR_MESSAGE = Strings.UNKNOWN_ERROR;
          bookingFailureRef.current.open();
        }
      } else {
        //Utilities.showToast('Failed!', message, 'error', 'bottom');
        setIsLoaderLoading(false);
        Globals.SHARED_VALUES.FAILURE_ERROR_MESSAGE = message;
        bookingFailureRef.current.open();
      }
    });
  };

  /**
     *
     * Purpose: performReschedule
     * Created/Modified By: Jenson
     * Created/Modified Date: 18 Feb 2022
     * Steps:
     1.if login success navigate to drawer navigator else show the message on toast
     */
  const performRescheduleBooking = () => {
    var body = {};
    body[APIConnections.KEYS.CUSTOMER_ID] = Globals.USER_DETAILS._id;
    body[APIConnections.KEYS.BUSINESS_ID] = Globals.BUSINESS_DETAILS._id;
    if (selectedServingUserId?.trim()?.length > 0) {
      body[APIConnections.KEYS.SERVING_USER_ID] = selectedServingUserId;
    }
    body[APIConnections.KEYS.TIME] =
      Globals.SHARED_VALUES.SELECTED_SLOT_INFO?.dateFrom;
    body[APIConnections.KEYS.DURATION] = Utilities.getDuration();
    if (Utilities.isGenderSpecificBooking() === true) {
      body[APIConnections.KEYS.GENDER] = Globals.SHARED_VALUES.SELECTED_GENDER;
    }
    if (Utilities.isServiceBasedBusiness() === true) {
      body[APIConnections.KEYS.SERVICES] =
        Globals.SHARED_VALUES.SELECTED_SERVICES_IDS;
    }
    if (
      Utilities.isBillingEnabled() === true &&
      Utilities.isOnlinePaymentEnabled() === true &&
      parseFloat(Globals.SHARED_VALUES.SELECTED_PAYMENT_INFO?.total || '0') > 0
    ) {
      body[APIConnections.KEYS.PAYMENT_STATUS] = 'PAID';
      body[APIConnections.KEYS.PAYMENT_TYPE] = 'online';
      if (Utilities.getPaymentGateway() === PaymentGateway.stripe) {
        body[APIConnections.KEYS.PAYMENT_ID] =
          Globals.SHARED_VALUES.SELECTED_PAYMENT_INFO?.paymentIntent;
      } else if (Utilities.getPaymentGateway() === PaymentGateway.razorpay) {
        body[APIConnections.KEYS.PAYMENT_ID] =
          Globals.SHARED_VALUES.SELECTED_PAYMENT_INFO?.orderId;
      }
    }
    if (
      Globals.SHARED_VALUES.RESCHEDULE_APPOINTMENT_INFO?.name.toUpperCase() ===
      'Booking'.toUpperCase()
    ) {
      body[APIConnections.KEYS.BOOKING_ID] =
        Globals.SHARED_VALUES.RESCHEDULE_APPOINTMENT_INFO?._id;
    } else {
      body[APIConnections.KEYS.QUEUE_ID] =
        Globals.SHARED_VALUES.RESCHEDULE_APPOINTMENT_INFO?._id;
    }

    setIsLoaderLoading(true);
    DataManager.performRescheduleBooking(body).then(
      ([isSuccess, message, data]) => {
        if (isSuccess === true) {
          if (data?.objects !== undefined && data?.objects !== null) {
            Globals.SHARED_VALUES.NEW_SUCCESS_APPOINTMENT_INFO = data?.objects;
            setIsLoaderLoading(false);
            bookingSuccessRef.current.open();
          } else {
            setIsLoaderLoading(false);
            Globals.SHARED_VALUES.FAILURE_ERROR_MESSAGE = Strings.UNKNOWN_ERROR;
            bookingFailureRef.current.open();
          }
        } else {
          //Utilities.showToast('Failed!', message, 'error', 'bottom');
          setIsLoaderLoading(false);
          Globals.SHARED_VALUES.FAILURE_ERROR_MESSAGE = message;
          bookingFailureRef.current.open();
        }
      },
    );
  };

  /**
    *
    * Purpose: performAddBookingDeletePreviousQueue
    * Created/Modified By: Jenson
    * Created/Modified Date: 22 Mar 2022
    * Steps:
    1.if login success navigate to drawer navigator else show the message on toast
    */
  const performAddBookingDeletePreviousQueue = () => {
    var body = {};
    body[APIConnections.KEYS.CUSTOMER_ID] = Globals.USER_DETAILS._id;
    body[APIConnections.KEYS.BUSINESS_ID] = Globals.BUSINESS_DETAILS._id;
    if (selectedServingUserId?.trim()?.length > 0) {
      body[APIConnections.KEYS.SERVING_USER_ID] = selectedServingUserId;
    }
    body[APIConnections.KEYS.TIME] =
      Globals.SHARED_VALUES.SELECTED_SLOT_INFO?.dateFrom;
    body[APIConnections.KEYS.DURATION] = Utilities.getDuration();
    if (Utilities.isGenderSpecificBooking() === true) {
      body[APIConnections.KEYS.GENDER] = Globals.SHARED_VALUES.SELECTED_GENDER;
    }
    if (Utilities.isServiceBasedBusiness() === true) {
      body[APIConnections.KEYS.SERVICES] =
        Globals.SHARED_VALUES.SELECTED_SERVICES_IDS;
    }
    if (
      Utilities.isBillingEnabled() === true &&
      Utilities.isOnlinePaymentEnabled() === true &&
      parseFloat(Globals.SHARED_VALUES.SELECTED_PAYMENT_INFO?.total || '0') > 0
    ) {
      body[APIConnections.KEYS.PAYMENT_STATUS] = 'PAID';
      body[APIConnections.KEYS.PAYMENT_TYPE] = 'online';
      if (Utilities.getPaymentGateway() === PaymentGateway.stripe) {
        body[APIConnections.KEYS.PAYMENT_ID] =
          Globals.SHARED_VALUES.SELECTED_PAYMENT_INFO?.paymentIntent;
      } else if (Utilities.getPaymentGateway() === PaymentGateway.razorpay) {
        body[APIConnections.KEYS.PAYMENT_ID] =
          Globals.SHARED_VALUES.SELECTED_PAYMENT_INFO?.orderId;
      }
    }
    if (
      Globals.SHARED_VALUES.RESCHEDULE_APPOINTMENT_INFO?.name.toUpperCase() ===
      'Booking'.toUpperCase()
    ) {
      body[APIConnections.KEYS.BOOKING_ID] =
        Globals.SHARED_VALUES.RESCHEDULE_APPOINTMENT_INFO?._id;
    } else {
      body[APIConnections.KEYS.QUEUE_ID] =
        Globals.SHARED_VALUES.RESCHEDULE_APPOINTMENT_INFO?._id;
    }

    setIsLoaderLoading(true);
    DataManager.performAddBooking(body).then(([isSuccess, message, data]) => {
      if (isSuccess === true) {
        if (data?.objects !== undefined && data?.objects !== null) {
          Globals.SHARED_VALUES.NEW_SUCCESS_APPOINTMENT_INFO = data?.objects;
          setIsLoaderLoading(false);
          bookingSuccessRef.current.open();
        } else {
          setIsLoaderLoading(false);
          Globals.SHARED_VALUES.FAILURE_ERROR_MESSAGE = Strings.UNKNOWN_ERROR;
          bookingFailureRef.current.open();
        }
      } else {
        //Utilities.showToast('Failed!', message, 'error', 'bottom');
        setIsLoaderLoading(false);
        Globals.SHARED_VALUES.FAILURE_ERROR_MESSAGE = message;
        bookingFailureRef.current.open();
      }
    });
  };

  /**
  *
  * Purpose: fetch Booking Totals And StripeIndent
  * Created/Modified By: Jenson
  * Created/Modified Date: 18 Feb 2022
  * Steps:
  1.if login success navigate to drawer navigator else show the message on toast
  */
  const fetchQueueTotalsAndStripeIndent = () => {
    var body = {};
    body[APIConnections.KEYS.CUSTOMER_ID] = Globals.USER_DETAILS._id;
    body[APIConnections.KEYS.BUSINESS_ID] = Globals.BUSINESS_DETAILS._id;
    if (selectedServingUserId?.trim()?.length > 0) {
      body[APIConnections.KEYS.SERVING_USER_ID] = selectedServingUserId;
    }
    body[APIConnections.KEYS.TIME] =
      Globals.SHARED_VALUES.SELECTED_SLOT_INFO?.dateFrom;
    body[APIConnections.KEYS.DURATION] = Utilities.getDuration();
    body[APIConnections.KEYS.EXPECTED_TIME_OF_SERVING] =
      Globals.SHARED_VALUES.SELECTED_SLOT_INFO?.expectedTimeOfServing;
    body[APIConnections.KEYS.PREFERRED_TIME_FROM] =
      Globals.SHARED_VALUES.SELECTED_SLOT_INFO?.from;
    body[APIConnections.KEYS.PREFERRED_TIME_TO] =
      Globals.SHARED_VALUES.SELECTED_SLOT_INFO?.to;
    if (Utilities.isGenderSpecificBooking() === true) {
      body[APIConnections.KEYS.GENDER] = Globals.SHARED_VALUES.SELECTED_GENDER;
    }
    if (Utilities.isServiceBasedBusiness() === true) {
      body[APIConnections.KEYS.SERVICES] =
        Globals.SHARED_VALUES.SELECTED_SERVICES_IDS;
    }
    //Adding reschedule info if needed
    if (isReschedule === true) {
      if (
        Globals.SHARED_VALUES.RESCHEDULE_APPOINTMENT_INFO?.name.toUpperCase() ===
        'Booking'.toUpperCase()
      ) {
        body[APIConnections.KEYS.BOOKING_ID] =
          Globals.SHARED_VALUES.RESCHEDULE_APPOINTMENT_INFO?._id;
      } else {
        body[APIConnections.KEYS.QUEUE_ID] =
          Globals.SHARED_VALUES.RESCHEDULE_APPOINTMENT_INFO?._id;
      }
      body[APIConnections.KEYS.IS_RESCHEDULE] = true;
    }

    setIsLoaderLoading(true);
    DataManager.getQueuePaymentInit(body).then(([isSuccess, message, data]) => {
      if (isSuccess === true) {
        if (data?.objects !== undefined && data?.objects !== null) {
          setIsLoaderLoading(false);
          let paymentInfo = data.objects;
          let totalValDouble = parseFloat(paymentInfo?.total);
          console.log('total:', totalValDouble);
          if (
            totalValDouble > 0 &&
            Utilities.isOnlinePaymentEnabled() === true
          ) {
            let _paymentIntent = paymentInfo?.paymentIntent;
            if (
              _paymentIntent !== undefined &&
              _paymentIntent !== null &&
              _paymentIntent?.trim()?.length > 0
            ) {
              initStripeSDK(_paymentIntent);
              Globals.SHARED_VALUES.SELECTED_PAYMENT_INFO = paymentInfo;
              queuePaymentConfirmationRef.current.open();
            } else {
              Globals.SHARED_VALUES.FAILURE_ERROR_MESSAGE =
                Strings.PAYMENT_ERROR;
              queueFailureRef.current.open();
            }
          } else {
            queueConfirmationRef.current.open();
          }
        } else {
          setIsLoaderLoading(false);
          Globals.SHARED_VALUES.FAILURE_ERROR_MESSAGE =  t(Translations.BLOCKED_CUSTOMER);
          queueFailureRef.current.open();
        }
      } else {
        // Utilities.showToast('Failed!', message, 'error', 'bottom');
        setIsLoaderLoading(false);
        Globals.SHARED_VALUES.FAILURE_ERROR_MESSAGE = message;
        queueFailureRef.current.open();
      }
    });
  };

  /**
    *
    * Purpose: fetchBookingTotalsAndRazorpayDetails
    * Created/Modified By: Jenson
    * Created/Modified Date: 18 Feb 2022
    * Steps:
    1.if login success navigate to drawer navigator else show the message on toast
    */
  const fetchQueueTotalsAndRazorpayDetails = () => {
    var body = {};
    body[APIConnections.KEYS.CUSTOMER_ID] = Globals.USER_DETAILS._id;
    body[APIConnections.KEYS.BUSINESS_ID] = Globals.BUSINESS_DETAILS._id;
    if (selectedServingUserId?.trim()?.length > 0) {
      body[APIConnections.KEYS.SERVING_USER_ID] = selectedServingUserId;
    }
    body[APIConnections.KEYS.TIME] =
      Globals.SHARED_VALUES.SELECTED_SLOT_INFO?.dateFrom;
    body[APIConnections.KEYS.DURATION] = Utilities.getDuration();
    body[APIConnections.KEYS.EXPECTED_TIME_OF_SERVING] =
      Globals.SHARED_VALUES.SELECTED_SLOT_INFO?.expectedTimeOfServing;
    body[APIConnections.KEYS.PREFERRED_TIME_FROM] =
      Globals.SHARED_VALUES.SELECTED_SLOT_INFO?.from;
    body[APIConnections.KEYS.PREFERRED_TIME_TO] =
      Globals.SHARED_VALUES.SELECTED_SLOT_INFO?.to;
    if (Utilities.isGenderSpecificBooking() === true) {
      body[APIConnections.KEYS.GENDER] = Globals.SHARED_VALUES.SELECTED_GENDER;
    }
    if (Utilities.isServiceBasedBusiness() === true) {
      body[APIConnections.KEYS.SERVICES] =
        Globals.SHARED_VALUES.SELECTED_SERVICES_IDS;
    }
    //Adding reschedule info if needed
    if (isReschedule === true) {
      if (
        Globals.SHARED_VALUES.RESCHEDULE_APPOINTMENT_INFO?.name.toUpperCase() ===
        'Booking'.toUpperCase()
      ) {
        body[APIConnections.KEYS.BOOKING_ID] =
          Globals.SHARED_VALUES.RESCHEDULE_APPOINTMENT_INFO?._id;
      } else {
        body[APIConnections.KEYS.QUEUE_ID] =
          Globals.SHARED_VALUES.RESCHEDULE_APPOINTMENT_INFO?._id;
      }
      body[APIConnections.KEYS.IS_RESCHEDULE] = true;
    }

    setIsLoaderLoading(true);
    DataManager.getQueuePaymentInit(body).then(([isSuccess, message, data]) => {
      if (isSuccess === true) {
        if (data?.objects !== undefined && data?.objects !== null) {
          setIsLoaderLoading(false);
          let paymentInfo = data.objects;
          let totalValDouble = parseFloat(paymentInfo?.total);
          console.log('total:', totalValDouble);
          if (
            totalValDouble > 0 &&
            Utilities.isOnlinePaymentEnabled() === true
          ) {
            let _orderId = paymentInfo?.orderId;
            if (
              _orderId !== undefined &&
              _orderId !== null &&
              _orderId?.trim()?.length > 0
            ) {
              setRazorpayOrderId(_orderId);
              Globals.SHARED_VALUES.SELECTED_PAYMENT_INFO = paymentInfo;
              queuePaymentConfirmationRef.current.open();
            } else {
              Globals.SHARED_VALUES.FAILURE_ERROR_MESSAGE =
                Strings.PAYMENT_ERROR;
              queueFailureRef.current.open();
            }
          } else {
            queueConfirmationRef.current.open();
          }
        } else {
          setIsLoaderLoading(false);
          Globals.SHARED_VALUES.FAILURE_ERROR_MESSAGE = Strings.UNKNOWN_ERROR;
          queueFailureRef.current.open();
        }
      } else {
        // Utilities.showToast('Failed!', message, 'error', 'bottom');
        setIsLoaderLoading(false);
        Globals.SHARED_VALUES.FAILURE_ERROR_MESSAGE = message;
        queueFailureRef.current.open();
      }
    });
  };

  /**
        *
        * Purpose: performAddQueue
        * Created/Modified By: Jenson
        * Created/Modified Date: 18 Feb 2022
        * Steps:
        1.if login success navigate to drawer navigator else show the message on toast
        */
  const performAddQueue = () => {
    var body = {};
    body[APIConnections.KEYS.CUSTOMER_ID] = Globals.USER_DETAILS._id;
    body[APIConnections.KEYS.BUSINESS_ID] = Globals.BUSINESS_DETAILS._id;
    if (selectedServingUserId?.trim()?.length > 0) {
      body[APIConnections.KEYS.SERVING_USER_ID] = selectedServingUserId;
    }
    body[APIConnections.KEYS.TIME] =
      Globals.SHARED_VALUES.SELECTED_SLOT_INFO?.dateFrom;
    body[APIConnections.KEYS.DURATION] = Utilities.getDuration();
    body[APIConnections.KEYS.EXPECTED_TIME_OF_SERVING] =
      Globals.SHARED_VALUES.SELECTED_SLOT_INFO?.expectedTimeOfServing;
    body[APIConnections.KEYS.PREFERRED_TIME_FROM] =
      Globals.SHARED_VALUES.SELECTED_SLOT_INFO?.from;
    body[APIConnections.KEYS.PREFERRED_TIME_TO] =
      Globals.SHARED_VALUES.SELECTED_SLOT_INFO?.to;
    if (Utilities.isGenderSpecificBooking() === true) {
      body[APIConnections.KEYS.GENDER] = Globals.SHARED_VALUES.SELECTED_GENDER;
    }
    if (Utilities.isServiceBasedBusiness() === true) {
      body[APIConnections.KEYS.SERVICES] =
        Globals.SHARED_VALUES.SELECTED_SERVICES_IDS;
    }
    if (
      Utilities.isBillingEnabled() === true &&
      Utilities.isOnlinePaymentEnabled() === true &&
      parseFloat(Globals.SHARED_VALUES.SELECTED_PAYMENT_INFO?.total || '0') > 0
    ) {
      body[APIConnections.KEYS.PAYMENT_STATUS] = 'PAID';
      body[APIConnections.KEYS.PAYMENT_TYPE] = 'online';
      if (Utilities.getPaymentGateway() === PaymentGateway.stripe) {
        body[APIConnections.KEYS.PAYMENT_ID] =
          Globals.SHARED_VALUES.SELECTED_PAYMENT_INFO?.paymentIntent;
      } else if (Utilities.getPaymentGateway() === PaymentGateway.razorpay) {
        body[APIConnections.KEYS.PAYMENT_ID] =
          Globals.SHARED_VALUES.SELECTED_PAYMENT_INFO?.orderId;
      }
    }

    setIsLoaderLoading(true);
    DataManager.performAddQueue(body).then(([isSuccess, message, data]) => {
      if (isSuccess === true) {
        if (data?.objects !== undefined && data?.objects !== null) {
          Globals.SHARED_VALUES.NEW_SUCCESS_APPOINTMENT_INFO = data?.objects;
          setIsLoaderLoading(false);
          queueSuccessRef.current.open();
        } else {
          setIsLoaderLoading(false);
          Globals.SHARED_VALUES.FAILURE_ERROR_MESSAGE = Strings.UNKNOWN_ERROR;
          queueFailureRef.current.open();
        }
      } else {
        // Utilities.showToast('Failed!', message, 'error', 'bottom');
        setIsLoaderLoading(false);
        Globals.SHARED_VALUES.FAILURE_ERROR_MESSAGE = message;
        queueFailureRef.current.open();
      }
    });
  };

  /**
        *
        * Purpose: performAddBookingDeletePreviousQueue
        * Created/Modified By: Jenson
        * Created/Modified Date: 22 Mar 2022
        * Steps:
        1.if login success navigate to drawer navigator else show the message on toast
        */
  const performAddQueueDeletePreviousBooking = () => {
    var body = {};
    body[APIConnections.KEYS.CUSTOMER_ID] = Globals.USER_DETAILS._id;
    body[APIConnections.KEYS.BUSINESS_ID] = Globals.BUSINESS_DETAILS._id;
    if (selectedServingUserId?.trim()?.length > 0) {
      body[APIConnections.KEYS.SERVING_USER_ID] = selectedServingUserId;
    }
    body[APIConnections.KEYS.TIME] =
      Globals.SHARED_VALUES.SELECTED_SLOT_INFO?.dateFrom;
    body[APIConnections.KEYS.DURATION] = Utilities.getDuration();
    body[APIConnections.KEYS.EXPECTED_TIME_OF_SERVING] =
      Globals.SHARED_VALUES.SELECTED_SLOT_INFO?.expectedTimeOfServing;
    body[APIConnections.KEYS.PREFERRED_TIME_FROM] =
      Globals.SHARED_VALUES.SELECTED_SLOT_INFO?.from;
    body[APIConnections.KEYS.PREFERRED_TIME_TO] =
      Globals.SHARED_VALUES.SELECTED_SLOT_INFO?.to;
    if (Utilities.isGenderSpecificBooking() === true) {
      body[APIConnections.KEYS.GENDER] = Globals.SHARED_VALUES.SELECTED_GENDER;
    }
    if (Utilities.isServiceBasedBusiness() === true) {
      body[APIConnections.KEYS.SERVICES] =
        Globals.SHARED_VALUES.SELECTED_SERVICES_IDS;
    }
    if (
      Utilities.isBillingEnabled() === true &&
      Utilities.isOnlinePaymentEnabled() === true &&
      parseFloat(Globals.SHARED_VALUES.SELECTED_PAYMENT_INFO?.total || '0') > 0
    ) {
      body[APIConnections.KEYS.PAYMENT_STATUS] = 'PAID';
      body[APIConnections.KEYS.PAYMENT_TYPE] = 'online';
      if (Utilities.getPaymentGateway() === PaymentGateway.stripe) {
        body[APIConnections.KEYS.PAYMENT_ID] =
          Globals.SHARED_VALUES.SELECTED_PAYMENT_INFO?.paymentIntent;
      } else if (Utilities.getPaymentGateway() === PaymentGateway.razorpay) {
        body[APIConnections.KEYS.PAYMENT_ID] =
          Globals.SHARED_VALUES.SELECTED_PAYMENT_INFO?.orderId;
      }
    }
    if (
      Globals.SHARED_VALUES.RESCHEDULE_APPOINTMENT_INFO?.name.toUpperCase() ===
      'Booking'.toUpperCase()
    ) {
      body[APIConnections.KEYS.BOOKING_ID] =
        Globals.SHARED_VALUES.RESCHEDULE_APPOINTMENT_INFO?._id;
      body[APIConnections.KEYS.CANCEL_BOOKING] = true;
    } else {
      body[APIConnections.KEYS.QUEUE_ID] =
        Globals.SHARED_VALUES.RESCHEDULE_APPOINTMENT_INFO?._id;
      body[APIConnections.KEYS.CANCEL_QUEUE] = true;
    }

    setIsLoaderLoading(true);
    DataManager.performAddQueue(body).then(([isSuccess, message, data]) => {
      if (isSuccess === true) {
        if (data?.objects !== undefined && data?.objects !== null) {
          Globals.SHARED_VALUES.NEW_SUCCESS_APPOINTMENT_INFO = data?.objects;
          setIsLoaderLoading(false);
          queueSuccessRef.current.open();
        } else {
          setIsLoaderLoading(false);
          Globals.SHARED_VALUES.FAILURE_ERROR_MESSAGE = Strings.UNKNOWN_ERROR;
          queueFailureRef.current.open();
        }
      } else {
        // Utilities.showToast('Failed!', message, 'error', 'bottom');
        setIsLoaderLoading(false);
        Globals.SHARED_VALUES.FAILURE_ERROR_MESSAGE = message;
        queueFailureRef.current.open();
      }
    });
  };

  //PAYMENT HELPERS

  const initStripeSDK = async paymentIntent => {
    initStripe({
      publishableKey: Globals.BUSINESS_DETAILS?.stripeId?.publicKey,
      stripeAccountId: Globals.BUSINESS_DETAILS?.connectedStripeId,
    });

    const {error} = await initPaymentSheet({
      paymentIntentClientSecret: paymentIntent,
      merchantDisplayName: Globals.BUSINESS_DETAILS?.name || Strings.APP_NAME,
      // Set `allowsDelayedPaymentMethods` to true if your business can handle payment
      //methods that complete payment after a delay, like SEPA Debit and Sofort.
      allowsDelayedPaymentMethods: true,
    });
    if (error) {
      console.log('initStripeSDK ERROR: ', error);
    }
  };

  const openStripePaymentSheet = async () => {
    const {error} = await presentPaymentSheet();

    if (error) {
      // Alert.alert(`Error code: ${error.code}`, error.message);
      Globals.SHARED_VALUES.FAILURE_ERROR_MESSAGE = error.message;
      bookingFailureRef.current.open();
    } else {
      // Alert.alert('Success', 'Your order is confirmed!');
      if (index === 0) {
        if (isReschedule === true) {
          if (
            Globals.SHARED_VALUES.RESCHEDULE_APPOINTMENT_INFO?.name.toUpperCase() ===
            'Booking'.toUpperCase()
          ) {
            performRescheduleBooking();
          } else {
            performAddBookingDeletePreviousQueue();
          }
        } else {
          performAddBooking();
        }
      } else if (index === 1) {
        //Queue
        if (isReschedule === true) {
          performAddQueueDeletePreviousBooking();
        } else {
          performAddQueue();
        }
      }
    }
  };

  const showRazorpayForm = (orderId, totalInSubUnit) => {
    var options = {
      description: 'Please select a payment method',
      image:
        Globals.BUSINESS_DETAILS?.image ||
        'https://y-wait.com/assets/images/logo.png',
      currency: Globals.BUSINESS_DETAILS?.currency?.abbreviation || 'INR',
      key:
        Globals.BUSINESS_DETAILS?.razorPayId?.key_id ||
        Globals.PAYMENT.RAZOR_PAY.TEST_KEY,
      amount: totalInSubUnit,
      name: Globals.BUSINESS_DETAILS?.name || Strings.APP_NAME,
      order_id: orderId,
      prefill: {
        email: Globals.USER_DETAILS?.email || '',
        contact: Globals.USER_DETAILS?.phoneNumber || '',
        name: (
          (Globals.USER_DETAILS?.firstName || 'N/A') +
          ' ' +
          (Globals.USER_DETAILS?.lastName || '')
        ).trim(),
      },
      theme: {color: Colors.SECONDARY_COLOR || '#1C33A6'},
    };
    RazorpayCheckout.open(options)
      .then(data => {
        // handle success
        //alert(`Success: ${data.razorpay_payment_id}`);
        if (index === 0) {
          if (isReschedule === true) {
            if (
              Globals.SHARED_VALUES.RESCHEDULE_APPOINTMENT_INFO?.name.toUpperCase() ===
              'Booking'.toUpperCase()
            ) {
              performRescheduleBooking();
            } else {
              performAddBookingDeletePreviousQueue();
            }
          } else {
            performAddBooking();
          }
        } else if (index === 1) {
          //Queue
          if (isReschedule === true) {
            performAddQueueDeletePreviousBooking();
          } else {
            performAddQueue();
          }
        }
      })
      .catch(error => {
        // handle failure
        // alert(`Error: ${error.code} | ${error.description}`);
        console.log(
          'RazorpayCheckout Error: ===> ',
          error.description,
          JSON.stringify(error.description),
        );
        if (error.description !== 'Payment cancelled by user') {
          Globals.SHARED_VALUES.FAILURE_ERROR_MESSAGE = 'sudhin';
          bookingFailureRef.current.open();
        }
      });
  };

  //POP UPS CONFIGURATION
  /**
      *
        * Purpose:BOOKING CONFIRMATION
        * Created/Modified By: Vijin Raj
        * Created/Modified Date: 29 Jan 2022
        * Steps:
            1.open the rb sheet
            2.pass the selected value
      */
  const GetBookingConfirmationPopUp = () => {
    return (
      <RBSheet
        ref={bookingConfirmationRef}
        closeOnDragDown={true}
        closeOnPressMask={true}
        height={DisplayUtils.setHeight(40)}
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
        <BookingConfirmationPopUp
          refRBSheet={bookingConfirmationRef}
          didSelectYes={handleBookingConfirmYes}
          didSelectNo={handleBookingConfirmNo}
        />
      </RBSheet>
    );
  };

  const handleBookingConfirmYes = () => {
    console.log('Yes');
    if (isReschedule === true) {
      if (
        Globals.SHARED_VALUES.RESCHEDULE_APPOINTMENT_INFO?.name.toUpperCase() ===
        'Booking'.toUpperCase()
      ) {
        performRescheduleBooking();
      } else {
        performAddBookingDeletePreviousQueue();
      }
    } else {
      performAddBooking();
    }
  };
  const handleBookingConfirmNo = () => {
    console.log('No');
  };
  /**
          *
            * Purpose:QUEUE CONFIRMATION
            * Created/Modified By: Vijin Raj
            * Created/Modified Date: 31 Jan 2022
            * Steps:
                1.open the rb sheet
                2.pass the selected value
          */

  const GetQueueConfirmationPopUp = () => {
    return (
      <RBSheet
        ref={queueConfirmationRef}
        closeOnDragDown={true}
        closeOnPressMask={true}
        height={DisplayUtils.setHeight(40)}
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
        <QueueConfirmationPopUp
          refRBSheet={queueConfirmationRef}
          didSelectYes={handleQueueConfirmYes}
          didSelectNo={handleQueueConfirmNo}
        />
      </RBSheet>
    );
  };
  const handleQueueConfirmYes = () => {
    console.log('handleQueueConfirmYes');
    if (isReschedule === true) {
      performAddQueueDeletePreviousBooking();
    } else {
      performAddQueue();
    }
  };
  const handleQueueConfirmNo = () => {
    console.log('handleQueueConfirmNo');
  };
  /**
      *
        * Purpose:BOOKING CONFIRMATION
        * Created/Modified By: Vijin Raj
        * Created/Modified Date: 29 Jan 2022
        * Steps:
            1.open the rb sheet
            2.pass the selected value
      */

  const GetBookingPaymentConfirmationPopUp = () => {
    return (
      <RBSheet
        ref={bookingPaymentConfirmationRef}
        closeOnDragDown={false}
        closeOnPressMask={false}
        height={DisplayUtils.setHeight(85)}
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
        <BookingPaymentConfirmationPopUp
          refRBSheet={bookingPaymentConfirmationRef}
          didSelectYes={handleDidSelectPaymentBookingYes}
          didSelectNo={handleDidSelectPaymentBookingNo}
        />
      </RBSheet>
    );
  };
  const handleDidSelectPaymentBookingYes = () => {
    console.log('BookingPaymentConfirmationPopUp Yes action');
    NetInfo.fetch().then(state => {
      if (state.isConnected === false) {
        Utilities.showToast(
          t(Translations.FAILED),
          t(Translations.NO_INTERNET),
          'error',
          'bottom',
        );
      } else {
        //Show payment sdk form
        if (Utilities.getPaymentGateway() === PaymentGateway.stripe) {
          if (Platform.OS === 'ios') {
            const timer = setTimeout(() => {
              //show stripe payment sheet
              openStripePaymentSheet();
            }, 500);
            return () => clearTimeout(timer);
          } else {
            //show stripe payment sheet
            openStripePaymentSheet();
          }
        } else if (Utilities.getPaymentGateway() === PaymentGateway.razorpay) {
          if (Platform.OS === 'ios') {
            const timer = setTimeout(() => {
              //show razor pay payment sheet
              showRazorpayForm(
                '',
                Globals.SHARED_VALUES.SELECTED_PAYMENT_INFO?.totalInSubUnit ||
                  '0',
              );
            }, 500);
            return () => clearTimeout(timer);
          } else {
            //show razor pay payment sheet
            showRazorpayForm(
              '',
              Globals.SHARED_VALUES.SELECTED_PAYMENT_INFO?.totalInSubUnit ||
                '0',
            );
          }
        }
      }
    });
  };
  const handleDidSelectPaymentBookingNo = () => {
    console.log('No');
  };

  /**
      *
       * Purpose:BOOKING CONFIRMATION
       * Created/Modified By: Vijin Raj
       * Created/Modified Date: 29 Jan 2022
       * Steps:
           1.open the rb sheet
           2.pass the selected value
      */

  const GetQueuePaymentConfirmationPopUp = () => {
    return (
      <RBSheet
        ref={queuePaymentConfirmationRef}
        closeOnDragDown={false}
        closeOnPressMask={false}
        height={DisplayUtils.setHeight(85)}
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
        <QueuePaymentConfirmationPopUp
          refRBSheet={queuePaymentConfirmationRef}
          didSelectYes={handleDidSelectPaymentQueueYes}
          didSelectNo={handleDidSelectPaymentQueueNo}
        />
      </RBSheet>
    );
  };
  const handleDidSelectPaymentQueueYes = () => {
    console.log('Yes');
    //Show payment sdk form
    NetInfo.fetch().then(state => {
      if (state.isConnected === false) {
        Utilities.showToast(
          t(Translations.FAILED),
          t(Translations.NO_INTERNET),
          'error',
          'bottom',
        );
      } else {
        if (Utilities.getPaymentGateway() === PaymentGateway.stripe) {
          if (Platform.OS === 'ios') {
            const timer = setTimeout(() => {
              //show stripe payment sheet
              openStripePaymentSheet();
            }, 500);
            return () => clearTimeout(timer);
          } else {
            //show stripe payment sheet
            openStripePaymentSheet();
          }
        } else if (Utilities.getPaymentGateway() === PaymentGateway.razorpay) {
          if (Platform.OS === 'ios') {
            const timer = setTimeout(() => {
              //show razor pay payment sheet
              showRazorpayForm(
                '',
                Globals.SHARED_VALUES.SELECTED_PAYMENT_INFO?.totalInSubUnit ||
                  '0',
              );
            }, 500);
            return () => clearTimeout(timer);
          } else {
            //show razor pay payment sheet
            showRazorpayForm(
              '',
              Globals.SHARED_VALUES.SELECTED_PAYMENT_INFO?.totalInSubUnit ||
                '0',
            );
          }
        }
      }
    });
  };
  const handleDidSelectPaymentQueueNo = () => {
    console.log('No');
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

  const GetBookingSuccessPopUp = () => {
    return (
      <RBSheet
        ref={bookingSuccessRef}
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
        <BookingSuccessPopUp
          refRBSheet={bookingSuccessRef}
          viewDetails={handleViewBookingDetails}
          onClosePopup={bookingSuccessOnClose}
        />
      </RBSheet>
    );
  };

  const bookingSuccessOnClose = () => {
    navigation.reset({
      index: 0,
      routes: [{name: 'DashboardScreen'}],
    });
  };

  const handleViewBookingDetails = () => {
    let item = Globals.SHARED_VALUES.NEW_SUCCESS_APPOINTMENT_INFO;
    if (item?.name === 'Booking') {
      Globals.SHARED_VALUES.SELECTED_APPOINTMENT_TYPE = 'booking';
    } else {
      Globals.SHARED_VALUES.SELECTED_APPOINTMENT_TYPE = 'queue';
    }
    Globals.SHARED_VALUES.SELECTED_APPOINTMENT_ID = item._id;

    if (Platform.OS === 'ios') {
      const timer = setTimeout(() => {
        upcomingDetailsRef.current.open();
      }, 500);
      return () => clearTimeout(timer);
    } else {
      upcomingDetailsRef.current.open();
    }
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

  const GetQueueSuccessPopUp = () => {
    return (
      <RBSheet
        ref={queueSuccessRef}
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
        <QueueSuccessPopUp
          refRBSheet={queueSuccessRef}
          viewDetails={handleViewBookingDetails}
          onClosePopup={bookingSuccessOnClose}
        />
      </RBSheet>
    );
  };

  /**
      *
         * Purpose:BOOKING FAILURE
         * Created/Modified By: Vijin Raj
         * Created/Modified Date: 29 Jan 2022
         * Steps:
             1.open the rb sheet
             2.pass the selected value
      */

  const GetBookingFailurePopUp = () => {
    return (
      <RBSheet
        ref={bookingFailureRef}
        closeOnDragDown={true}
        closeOnPressMask={true}
        height={320}
        onClose={onFailurePopupClose}
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
        <BookingFailurePopUp refRBSheet={bookingFailureRef} />
      </RBSheet>
    );
  };

  const onFailurePopupClose = () => {
    // Refresh slots
    dateCellSelectedAction(selectedDate, dateDataIndex, true);
  };

  /**
      *
         * Purpose:BOOKING FAILURE
         * Created/Modified By: Vijin Raj
         * Created/Modified Date: 29 Jan 2022
         * Steps:
             1.open the rb sheet
             2.pass the selected value
      */

  const GetQueueFailurePopUp = () => {
    return (
      <RBSheet
        ref={queueFailureRef}
        closeOnDragDown={true}
        closeOnPressMask={true}
        height={320}
        onClose={onFailurePopupClose}
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
        <QueueFailurePopUp refRBSheet={queueFailureRef} />
      </RBSheet>
    );
  };

  /**
          *
            * Purpose: View details action
            * Created/Modified By: Jenson
            * Created/Modified Date: 17 Mar 2022
            * Steps:
                1.open the rb sheet
                2.pass the selected value
          */

  const GetUpcomingDetailsPopUp = () => {
    return (
      <RBSheet
        ref={upcomingDetailsRef}
        closeOnDragDown={false}
        closeOnPressMask={false}
        height={DisplayUtils.setHeight(90)}
        onClose={upcomingDetailsPopupClose}
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
        <UpcomingDetailsPopUp
          refRBSheet={upcomingDetailsRef}
          onRescheduleAction={onRescheduleActionHandler}
        />
      </RBSheet>
    );
  };

  const onRescheduleActionHandler = () => {
    //VALUES WILL BE SET FROM UpcomingDetailsPopup.
    //Check business types
    if (Utilities.isServiceBasedBusiness() === true) {
      //Navigate to services with selected services
      navigation.navigate('ServiceListScreen');
    } else {
      navigation.navigate('BookingQueueScreen');
    }
  };

  const upcomingDetailsPopupClose = () => {
    navigation.reset({
      index: 0,
      routes: [{name: 'DashboardScreen'}],
    });
  };
  const backButtonActon = () => {
    navigation.goBack();
    Globals.SHARED_VALUES.IS_NO_CHOICE_SELECTED = false;
  };

  //final return
  return (
    <>
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.APP_MAIN_BACKGROUND_COLOR,
          paddingTop: insets.top,
          paddingLeft: insets.left,
          paddingRight: insets.right,
          paddingBottom: insets.bottom,
        }}>
        <StatusBar
          backgroundColor={Colors.BACKGROUND_COLOR}
          barStyle="dark-content"
        />
        <GetBookingConfirmationPopUp />
        <GetBookingSuccessPopUp />
        <GetQueueSuccessPopUp />
        <GetBookingFailurePopUp />
        <GetQueueConfirmationPopUp />
        <GetBookingPaymentConfirmationPopUp />
        <GetQueuePaymentConfirmationPopUp />
        <GetQueueFailurePopUp />
        <GetUpcomingDetailsPopUp />
        <LoadingIndicator visible={isLoaderLoading} />
        {/* HEADER */}
        {isServingUserSelected === true ? (
          <View style={styles.header}>
            <View
              style={{
                marginTop: 16,
                marginLeft: 20,
                flexDirection: 'row',
              }}>
              <TouchableOpacity
                style={{justifyContent: 'center'}}
                onPress={() => backButtonActon()}>
                <Image
                  style={{
                    height: 17,
                    width: 24,
                    transform: [{scaleX: I18nManager.isRTL ? -1 : 1}],
                  }}
                  source={Images.BACK_ARROW}
                />
              </TouchableOpacity>
              <GetImage
                style={{
                  marginTop: 0,
                  marginLeft: 18,
                  width: 48,
                  height: 48,
                  borderRadius: 48 / 2,
                  borderWidth: 2,
                  borderColor: Colors.PRIMARY_COLOR,
                }}
                fullName={(selectedServingUserInfo?.fullName || 'N/A').trim()}
                url={selectedServingUserInfo?.image}
                alphabetColor={Colors.SECONDARY_COLOR}
              />
              <View
                style={{
                  marginLeft: 12,
                  flexDirection: 'column',
                }}>
                <Text
                  style={{
                    marginTop: 6,
                    fontFamily: Fonts.Gibson_SemiBold,
                    color: Colors.PRIMARY_TEXT_COLOR,
                    fontSize: 18,
                    width: DisplayUtils.setWidth(65),
                    textAlign: 'left',
                  }}
                  numberOfLines={1}>
                  {(selectedServingUserInfo?.name || 'N/A').trim()}
                </Text>
                {selectedServingUserRoleText?.trim().length > 0 ? (
                  <Text
                    style={{
                      marginTop: 4,
                      fontFamily: Fonts.Gibson_Regular,
                      color: Colors.PRIMARY_TEXT_COLOR,
                      fontSize: 14,
                      width: DisplayUtils.setWidth(65),
                      textAlign: 'left',
                    }}
                    numberOfLines={1}>
                    {/* {selectedServingUserRoleText} */}
                   {selectedServingUserInfo?.department_id?.department_name}
                  </Text>
                ) :  <Text
                style={{
                  marginTop: 4,
                  fontFamily: Fonts.Gibson_Regular,
                  color: Colors.PRIMARY_TEXT_COLOR,
                  fontSize: 14,
                  width: DisplayUtils.setWidth(65),
                  textAlign: 'left',
                }}
                numberOfLines={1}>
                  {selectedServingUserInfo?.department_id?.department_name}</Text>
                }
                <Text
                  style={{
                    marginTop: 4,
                    fontFamily: Fonts.Gibson_Regular,
                    color: Colors.PRIMARY_TEXT_COLOR,
                    fontSize: 12,
                    width: DisplayUtils.setWidth(65),
                    textAlign: 'left',
                  }}
                  numberOfLines={1}>
                  {selectedDayIsHoliday || consultantAvailable===true || specialistAvailable===true
                  ?t(Translations.NO_CONSULTANT_NO_AVAILABLE)
                 : sessionHoursText}
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.header}>
            <View
              style={{
                marginTop: 16,
                marginLeft: 20,
                flexDirection: 'row',
              }}>
              <TouchableOpacity
                style={{justifyContent: 'center'}}
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
              <GetImage
                style={{
                  marginTop: 0,
                  marginLeft: 18,
                  width: 48,
                  height: 48,
                  borderRadius: 48 / 2,
                  borderWidth: 2,
                  borderColor: Colors.PRIMARY_COLOR,
                }}
                fullName={(Globals.BUSINESS_DETAILS?.name || 'N/A').trim()}
                url={Globals.BUSINESS_DETAILS?.image}
                alphabetColor={Colors.SECONDARY_COLOR}
              />
              <View
                style={{
                  marginLeft: 12,
                  flexDirection: 'column',
                }}>
                <Text
                  style={{
                    marginTop: 6,
                    fontFamily: Fonts.Gibson_SemiBold,
                    color: Colors.PRIMARY_TEXT_COLOR,
                    fontSize: 18,
                    width: DisplayUtils.setWidth(65),
                  }}
                  numberOfLines={1}>
                  {(Globals.BUSINESS_DETAILS?.name || Strings.APP_NAME).trim()}
                </Text>
                {selectedServingUserRoleText?.trim().length > 0 ? (
                  <Text
                    style={{
                      marginTop: 4,
                      fontFamily: Fonts.Gibson_Regular,
                      color: Colors.PRIMARY_TEXT_COLOR,
                      fontSize: 14,
                      width: DisplayUtils.setWidth(65),
                      textAlign: 'left',
                    }}
                    numberOfLines={1}>
                    {selectedServingUserRoleText}
                  </Text>
                ) : null}
                <Text
                  style={{
                    marginTop: 4,
                    fontFamily: Fonts.Gibson_Regular,
                    color: Colors.PRIMARY_TEXT_COLOR,
                    fontSize: 12,
                    width: DisplayUtils.setWidth(65),
                    textAlign: 'left',
                  }}
                  numberOfLines={1}>
                  {sessionHoursText}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* DAY SELECT LABEL */}
        <Text
          style={{
            marginTop: 20,
            fontFamily: Fonts.Gibson_Regular,
            color: Colors.PRIMARY_TEXT_COLOR,
            fontSize: 16,
            alignSelf: 'center',
          }}
          numberOfLines={1}>
          {t(Translations.WHICH)}{' '}
          <Text
            style={{
              fontFamily: Fonts.Gibson_SemiBold,
              color: Colors.PRIMARY_COLOR,
              fontSize: 16,
            }}>
            {t(Translations.DAY)}{' '}
          </Text>
          {t(Translations.YOU_WOULD_LIKE_TO_SELECT)}
        </Text>

        {/* CALENDER */}

        {/* <FlatList
          ref={dateFlatListRef}
          style={{
            flexGrow: 0,
            marginLeft: 24,
            marginRight: 24,
            marginTop: 20,
          }}
          refreshing={dateRefresh}
          onScrollToIndexFailed={info => {
            const wait = new Promise(resolve => setTimeout(resolve, 700));
            wait.then(() => {
              dateFlatListRef.current?.scrollToIndex({
                index: info.index,
                animated: true / false,
              });
            });
          }}
          contentContainerStyle={{
            paddingRight: 10,
            paddingBottom: 10,
            marginTop: 10,
          }}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          data={I18nManager.isRTL ? DATA.reverse() : DATA} //1
          renderItem={renderDates}
          keyExtractor={(item, index) => index.toString()} //2
          inverted={I18nManager.isRTL ? true : false}
        /> */}
        <View style={{marginHorizontal: responsiveWidth(3), marginTop: 20,alignItems:'flex-start'}}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{alignItems:'flex-start'}}>
            {DATA.length === 0
              ? null
              : DATA.map((item, index) => {
                  return <DateItem item={item} index={index} />;
                })}
          </ScrollView>
        </View>
        {/* TIME SELECT LABEL */}
        <Text
          style={{
            marginTop: 20,
            fontFamily: Fonts.Gibson_Regular,
            color: Colors.PRIMARY_TEXT_COLOR,
            fontSize: 16,
            alignSelf: 'center',
            marginBottom: 20,
          }}
          numberOfLines={1}>
          {t(Translations.WHAT)}{' '}
          <Text
            style={{
              fontFamily: Fonts.Gibson_SemiBold,
              color: Colors.PRIMARY_COLOR,
              fontSize: 16,
            }}>
            {t(Translations.TIME)}{' '}
          </Text>
          {t(Translations.YOU_WOULD_LIKE_TO_CHOOSE)}
        </Text>

        {/* TABS */}
        <TabView
          navigationState={{index, routes}}
          renderScene={renderScene}
          onIndexChange={onIndexChange}
          renderTabBar={renderTabBar}
          lazy={true}
          initialLayout={{width: layout.width}}
        />

        {/* BOTTOM BAR */}
        <View
          style={{
            borderTopColor: Colors.SHADOW_COLOR,
            justifyContent: 'center',
            borderTopWidth: 0.5,
            height: 60,
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: insets.bottom,
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
              height: 60,
              width: 75,
              justifyContent: 'center',
            }}
            onPress={() => bottomHomeAction()}>
            <Image
              source={Images.YWAIT_Y_LOGO}
              style={{
                width: 30,
                height: 30,
                alignSelf: 'center',
                tintColor: Colors.INACTIVE_BOTTOM_BAR_COLOR,
                resizeMode: 'contain',
              }}
            />
          </TouchableOpacity>
          <View style={{flex: 1, justifyContent: 'center'}}>
            <TouchableOpacity
              style={{
                backgroundColor: isRightButtonEnabled
                  ? Colors.SECONDARY_COLOR
                  : Colors.TAB_VIEW_LABEL_COLOR,
                height: 36,
                width: 167,
                alignSelf: 'flex-end',
                marginRight: 32,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 4,
              }}
              activeOpacity={1}
               disabled={(isRightButtonEnabled)?false:true}
              onPress={() => rightButtonAction()}>
              <Text
                style={{
                  fontFamily: Fonts.Gibson_Regular,
                  fontSize: 13,
                  color: Colors.WHITE_COLOR,
                }}>
                {rightButtonText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </>
  );
}
const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.PRIMARY_WHITE,
    width: DisplayUtils.setWidth(100),
    height: 85,
    borderBottomColor: Colors.LINE_SEPARATOR_COLOR,
    borderBottomWidth: 0.5,
  },
  tabContainer: {},
});
