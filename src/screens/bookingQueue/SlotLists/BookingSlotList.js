import React, {useState, useEffect, useRef, Fragment} from 'react';
import {
  Text,
  View,
  Image,
  Keyboard,
  FlatList,
  Platform,
  StatusBar,
  TextInput,
  StyleSheet,
  I18nManager,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions,
  KeyboardAvoidingView,
} from 'react-native';
import LottieView from 'lottie-react-native';
import FastImage from 'react-native-fast-image';
import {useNavigation} from '@react-navigation/core';
import InputScrollView from 'react-native-input-scroll-view';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import ContentLoader, {Rect, Circle, Path} from 'react-content-loader/native';
import {
  Colors,
  Fonts,
  Globals,
  Images,
  Strings,
  Translations,
} from '../../../constants';
import {t} from 'i18next';
import moment from 'moment';
import {GetImage} from '../../shared/getImage/GetImage';
import Utilities from '../../../helpers/utils/Utilities';
import DisplayUtils from '../../../helpers/utils/DisplayUtils';
import DataManager from '../../../helpers/apiManager/DataManager';
import NO_VISITORS from '../../../assets/images/noVisitsError.svg';
import APIConnections from '../../../helpers/apiManager/APIConnections';
import StorageManager from '../../../helpers/storageManager/StorageManager';
import LoadingIndicator from '../../shared/loadingIndicator/LoadingIndicator';
import QueueSlotList from './QueueSlotList';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize
} from "react-native-responsive-dimensions";
 
const BookingSlotList = props => {
  const {
    index,
    isLoading,
    isReschedule,
    selectedDate,
    setIsLoading,
    isForceRefresh,
    selectedGender,
    selectedServicesId,
    isSelectedDayToday,
    setRightButtonText,
    selectedCustomerInfo,
    selectedDayIsHoliday,
    selectedServingUserId,
    isServingUserSelected,
    setIsRightButtonEnabled,
    setIsQueueSlotsAvailable,
    setIsThereAnyCanBookSlots,
    specialistAvailable,
    consultantAvailable,
    hideComponent,
    setHideComponent,
    selectedServingUserInfo
  } = props;
  const layout = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [
    isInitialRedirectionAvailableDate,
    setIsInitialRedirectionAvailableDate,
  ] = useState(true);

  const [bookingSlotList, setBookingSlotList] = useState([]);
  const [selectedBookingSlotIndex, setSetSelectedBookingSlotIndex] = useState();
  const [showSlotFullEmptyComponent, setShowSlotFullEmptyComponent] =
    useState(false);
    const[showEmptyComponent,setShowEmptyComponent]=useState(false);
  const [hideEmptyComponent, setHideEmptyComponent] = useState(true);
  useEffect(() => {
    if (index === 0) {
      setSetSelectedBookingSlotIndex('');
      getBusinessDetails(selectedDate, selectedServingUserId);
    }
console.log('Booking slot screen useEffect selectedDate ===========================', selectedDate , moment(selectedDate).format('DD_MM_YYYY'));
    // setTimeout(() => {
    //   setHideEmptyComponent(false);
    // }, 2000);
    setBookingSlotList('');  
     setShowSlotFullEmptyComponent(false)
    setShowEmptyComponent(true); 
  }, [selectedDate, index, isForceRefresh]);
  const dummyNotArrivedListData = [
    {
      id: '1',
      dateTo: '2022-02-15T10:35:00.000Z',
      canBook: true,
      dateFrom: '2022-02-15T10:30:00.000Z',
      name: 'Free-slot',
    },
    {
      id: '2',
      dateTo: '2022-02-15T10:35:00.000Z',
      canBook: true,
      dateFrom: '2022-02-15T10:30:00.000Z',
      name: 'Free-slot',
    },
    {
      id: '3',
      dateTo: '2022-02-15T10:35:00.000Z',
      canBook: true,
      dateFrom: '2022-02-15T10:30:00.000Z',
      name: 'Free-slot',
    },
    {
      id: '4',
      dateTo: '2022-02-15T10:35:00.000Z',
      canBook: true,
      dateFrom: '2022-02-15T10:30:00.000Z',
      name: 'Free-slot',
    },
    {
      id: '5',
      dateTo: '2022-02-15T10:35:00.000Z',
      canBook: true,
      dateFrom: '2022-02-15T10:30:00.000Z',
      name: 'Free-slot',
    },
    {
      id: '6',
      dateTo: '2022-02-15T10:35:00.000Z',
      canBook: true,
      dateFrom: '2022-02-15T10:30:00.000Z',
      name: 'Free-slot',
    },
    {
      id: '7',
      dateTo: '2022-02-15T10:35:00.000Z',
      canBook: true,
      dateFrom: '2022-02-15T10:30:00.000Z',
      name: 'Free-slot',
    },
    {
      id: '8',
      dateTo: '2022-02-15T10:35:00.000Z',
      canBook: true,
      dateFrom: '2022-02-15T10:30:00.000Z',
      name: 'Free-slot',
    },
    {
      id: '9',
      dateTo: '2022-02-15T10:35:00.000Z',
      canBook: true,
      dateFrom: '2022-02-15T10:30:00.000Z',
      name: 'Free-slot',
    },
    {
      id: '10',
      dateTo: '2022-02-15T10:35:00.000Z',
      canBook: true,
      dateFrom: '2022-02-15T10:30:00.000Z',
      name: 'Free-slot',
    },
    {
      id: '11',
      dateTo: '2022-02-15T10:35:00.000Z',
      canBook: true,
      dateFrom: '2022-02-15T10:30:00.000Z',
      name: 'Free-slot',
    },
    {
      id: '12',
      dateTo: '2022-02-15T10:35:00.000Z',
      canBook: true,
      dateFrom: '2022-02-15T10:30:00.000Z',
      name: 'Free-slot',
    },
    {
      id: '13',
      dateTo: '2022-02-15T10:35:00.000Z',
      canBook: true,
      dateFrom: '2022-02-15T10:30:00.000Z',
      name: 'Free-slot',
    },
    {
      id: '14',
      dateTo: '2022-02-15T10:35:00.000Z',
      canBook: true,
      dateFrom: '2022-02-15T10:30:00.000Z',
      name: 'Free-slot',
    },
    {
      id: '15',
      dateTo: '2022-02-15T10:35:00.000Z',
      canBook: true,
      dateFrom: '2022-02-15T10:30:00.000Z',
      name: 'Free-slot',
    },
    {
      id: '16',
      dateTo: '2022-02-15T10:35:00.000Z',
      canBook: true,
      dateFrom: '2022-02-15T10:30:00.000Z',
      name: 'Free-slot',
    },
    {
      id: '17',
      dateTo: '2022-02-15T10:35:00.000Z',
      canBook: true,
      dateFrom: '2022-02-15T10:30:00.000Z',
      name: 'Free-slot',
    },
    {
      id: '18',
      dateTo: '2022-02-15T10:35:00.000Z',
      canBook: true,
      dateFrom: '2022-02-15T10:30:00.000Z',
      name: 'Free-slot',
    },
    {
      id: '19',
      dateTo: '2022-02-15T10:35:00.000Z',
      canBook: true,
      dateFrom: '2022-02-15T10:30:00.000Z',
      name: 'Free-slot',
    },
    {
      id: '20',
      dateTo: '2022-02-15T10:35:00.000Z',
      canBook: true,
      dateFrom: '2022-02-15T10:30:00.000Z',
      name: 'Free-slot',
    },
    {
      id: '21',
      dateTo: '2022-02-15T10:35:00.000Z',
      canBook: true,
      dateFrom: '2022-02-15T10:30:00.000Z',
      name: 'Free-slot',
    },
    {
      id: '22',
      dateTo: '2022-02-15T10:35:00.000Z',
      canBook: true,
      dateFrom: '2022-02-15T10:30:00.000Z',
      name: 'Free-slot',
    },
    {
      id: '23',
      dateTo: '2022-02-15T10:35:00.000Z',
      canBook: true,
      dateFrom: '2022-02-15T10:30:00.000Z',
      name: 'Free-slot',
    },
    {
      id: '24',
      dateTo: '2022-02-15T10:35:00.000Z',
      canBook: true,
      dateFrom: '2022-02-15T10:30:00.000Z',
      name: 'Free-slot',
    },
  ];
  //Shimmer loader for the flatList
  const ListLoader = props => (
    <ContentLoader
      transform={[{scaleX: I18nManager.isRTL ? -1 : 1}]}
      speed={1.5}
      width={'100%'}
      height={'100%'}
      //viewBox="0 0 320 "
      backgroundColor="#dadada"
      foregroundColor="#eee"
      animate={true}
      {...props}>
      <Rect x="0" y="0" rx="5" ry="5" width="98%" height="100%" />
    </ContentLoader>
  );
  const isThereAnyCanBookSlots = timeSlots => {
    const canBookSlotIndex = timeSlots.findIndex(
      item => item?.canBook === true,
    );
    if (canBookSlotIndex !== -1) {
      return true;
    } else {
      return false;
    }
  };
  /**
      *
      * Purpose: check booking configurations
      * Created/Modified By: Vijin
      * Created/Modified Date: 17 Feb 2022
      * Steps:
         
   */
  const checkBookingSlotsWithBusinessConfigurations = (
    timeSlots,
    isQueueSlotsAvailable,
  ) => {
    console.log(
      'Globals.BUSINESS_DETAILS?.bookingSettings?.allowCurrentDayBooking',
      Globals.BUSINESS_DETAILS?.bookingSettings?.allowCurrentDayBooking,
    );
    console.log('isThereAnyCanBookSlots', isThereAnyCanBookSlots(timeSlots));
    setIsQueueSlotsAvailable(isQueueSlotsAvailable);
    if (isSelectedDayToday === true) {
      console.log('Today');
      if(isThereAnyCanBookSlots(timeSlots) === false){
        setIsRightButtonEnabled(false);
        setRightButtonText(
          isReschedule === true
            ? t(Translations.RESCHEDULE)
            : t(Translations.CONFIRM),
        );
setShowSlotFullEmptyComponent(false)
setShowEmptyComponent(false);
      }
      else
      if (
        Globals.BUSINESS_DETAILS?.bookingSettings?.allowCurrentDayBooking ===
          true &&
        isThereAnyCanBookSlots(timeSlots) === true
      ) {
        console.log('CurrentDayBooking');
        setIsThereAnyCanBookSlots(true);
        setIsRightButtonEnabled(false);
        setRightButtonText(
          isReschedule === true
            ? t(Translations.RESCHEDULE)
            : t(Translations.CONFIRM),
        );
        setShowSlotFullEmptyComponent(false);
        setShowEmptyComponent(false); 
        setBookingSlotList(timeSlots);
      } else {
        if (
          Globals.BUSINESS_DETAILS?.enableQueue === true &&
          Globals.BUSINESS_DETAILS?.pricePlan_id?.enableQueue === true &&
          isQueueSlotsAvailable
        ) {
          setIsThereAnyCanBookSlots(false);
          setIsRightButtonEnabled(true);
          setShowSlotFullEmptyComponent(true);
          setShowEmptyComponent(true); 
          setRightButtonText(
            isReschedule === true
            ? t(Translations.RESCHEDULE)
            : t(Translations.CONFIRM)
          );
          setBookingSlotList([]);
        } else {
          setIsThereAnyCanBookSlots(false);
          setIsRightButtonEnabled(false);
          setRightButtonText(
            isReschedule === true
              ? t(Translations.RESCHEDULE)
              : t(Translations.CONFIRM),
          );
          setShowSlotFullEmptyComponent(false);
          setShowEmptyComponent(false); 
          setBookingSlotList([]);
        }
      }
    } else if (isThereAnyCanBookSlots(timeSlots)) {
      setIsThereAnyCanBookSlots(true);
      setIsRightButtonEnabled(false);
      setRightButtonText(
        isReschedule === true
          ? t(Translations.RESCHEDULE)
          : t(Translations.CONFIRM),
      );
      setShowSlotFullEmptyComponent(false);
      setShowEmptyComponent(false); 
      setBookingSlotList(timeSlots);
    } else {
      if (
        Globals.BUSINESS_DETAILS?.enableQueue === true &&
        Globals.BUSINESS_DETAILS?.pricePlan_id?.enableQueue === true &&
        Globals.BUSINESS_DETAILS?.waitlistSettings?.allowFutureDayQueue ===
          true &&
          Globals?.BOOKING_DETAILS?.objects?.length>0 && 
             Globals?.BUSINESS_DETAILS?.enableBooking === true && 
             Globals?.BUSINESS_DETAILS?.enableCustomerBooking === true &&
             Globals?.BUSINESS_DETAILS?.bookingSettings?.allowCurrentDayBooking === true &&
             Globals.BUSINESS_DETAILS?.enableCustomerLogin === true && 
        isQueueSlotsAvailable
      ) {
        setIsThereAnyCanBookSlots(false);
        setIsRightButtonEnabled(true);
        setRightButtonText(
          isReschedule === true
          ? t(Translations.RESCHEDULE)
          : t(Translations.CONFIRM)
        );
        setShowSlotFullEmptyComponent(true);
        setShowEmptyComponent(true); 
        setBookingSlotList([]);
      } else {
        setIsThereAnyCanBookSlots(false);
        setIsRightButtonEnabled(false);
        setRightButtonText(
          isReschedule === true
            ? t(Translations.RESCHEDULE)
            : t(Translations.CONFIRM),
        );
        setShowSlotFullEmptyComponent(false);
        setShowEmptyComponent(false); 
        setBookingSlotList([]);
      }
    }
  };

  //API CALLS
  /**
       *
       * Purpose: Get selected business details
       * Created/Modified By: Jenson
       * Created/Modified Date: 28 Dec 2021
       * Steps:
           1.fetch business details from API and append to state variable
    */
  const getBusinessDetails = (selectedDate, serveUserId) => {
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
              setIsLoading(false);
              console.log('selectedDate', selectedDate);
              console.log('serveUserId', serveUserId);
              if (isServingUserSelected === true) {
                performGetBookingSlotList(selectedDate, serveUserId);
              } else {
                performGetAllBookingSlots(selectedDate);
              }
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

  /**
               *
               * Purpose: Business listing
               * Created/Modified By: Jenson
               * Created/Modified Date: 10 Mar 2021
               * Steps:
                   1.fetch business list from API and append to state variable
       */

  const performGetBookingSlotList = (date, serveUserId) => {
    let dateSelected = Utilities.appendBusinessTimeZoneToDate(date);

    let startDate =
      moment(dateSelected).format('dddd D MMMM YYYY 00:00:00 ') +
      Utilities.getBusinessTimeZoneOffset();
    let endDate =
      moment(dateSelected).format('dddd D MMMM YYYY 11:59:59 ') +
      Utilities.getBusinessTimeZoneOffset();
    setIsLoading(true);
    console.log('performGetBookingSlotList serveUserId: ', serveUserId);
    var body = {};
    if (Utilities.isServiceBasedBusiness()) {
      body = {
        [APIConnections.KEYS.SERVING_USER_ID]:
          serveUserId !== undefined
            ? serveUserId
            : Globals.SHARED_VALUES.SELECTED_SERVING_USER_ID,
        [APIConnections.KEYS.BUSINESS_ID]: Globals.BUSINESS_DETAILS._id,
        [APIConnections.KEYS.START_DATE]: startDate,
        [APIConnections.KEYS.END_DATE]: endDate,
        [APIConnections.KEYS.SERVICES]: selectedServicesId,
      };
    } else {
      body = {
        [APIConnections.KEYS.SERVING_USER_ID]:
          serveUserId !== undefined
            ? serveUserId
            : Globals.SHARED_VALUES.SELECTED_SERVING_USER_ID,
        [APIConnections.KEYS.BUSINESS_ID]: Globals.BUSINESS_DETAILS._id,
        [APIConnections.KEYS.START_DATE]: startDate,
        [APIConnections.KEYS.END_DATE]: endDate,
      };
    }

    DataManager.getBookingSlotList(body).then(([isSuccess, message, data]) => {
     console.log(isSuccess,message)
      if (isSuccess === true) {
        if (data !== undefined && data !== null) {
          Globals.BOOKING_DETAILS=data;
          // if (data?.objects?.length > 0) {
          if (
            data?.nextDate !== undefined &&
            isInitialRedirectionAvailableDate
          ) {
            let nextDateFormatted = moment(data.nextDate).format('DD MM YYYY');
            setIsInitialRedirectionAvailableDate(false);
            props.didFoundNextDate(nextDateFormatted);
          }
          
          checkBookingSlotsWithBusinessConfigurations(
            data?.objects,
            data?.isQueueSlotsAvailable,
          );
          // } else {
          //     setShowSlotFullEmptyComponent(false)
          // }
          setIsLoading(false);
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
        Utilities.showToast(t(Translations.FAILED), message, 'error', 'bottom');
        setIsLoading(false);
      }
    });
  };
  /**
               *
               * Purpose: Business listing
               * Created/Modified By: Jenson
               * Created/Modified Date: 27 Dec 2021
               * Steps:
                   1.fetch business list from API and append to state variable
       */

  const performGetAllBookingSlots = date => {
    let dateSelected = Utilities.appendBusinessTimeZoneToDate(date);

    let startDate =
      moment(dateSelected).format('dddd D MMMM YYYY 00:00:00 ') +
      Utilities.getBusinessTimeZoneOffset();
    let endDate =
      moment(dateSelected).format('dddd D MMMM YYYY 11:59:59 ') +
      Utilities.getBusinessTimeZoneOffset();
    setIsLoading(true);
    var body = {};

    if (Utilities.isServiceBasedBusiness()) {
      body = {
        [APIConnections.KEYS.BUSINESS_ID]: Globals.BUSINESS_DETAILS._id,
        [APIConnections.KEYS.START_DATE]: startDate,
        [APIConnections.KEYS.END_DATE]: endDate,
        [APIConnections.KEYS.SERVICES]: selectedServicesId,
      };
    } else {
      body = {
        [APIConnections.KEYS.BUSINESS_ID]: Globals.BUSINESS_DETAILS._id,
        [APIConnections.KEYS.START_DATE]: startDate,
        [APIConnections.KEYS.END_DATE]: endDate,
      };
    }

    DataManager.getAllServingUserBookingSlot(body).then(
      ([isSuccess, message, data]) => {
        if (isSuccess === true) {
          if (data !== undefined && data !== null) {
            Globals.BOOKING_DETAILS=data;
            if (
              data?.nextDate !== undefined &&
              isInitialRedirectionAvailableDate
            ) {
              let nextDateFormatted = moment(data.nextDate).format(
                'DD MM YYYY',
              );
              setIsInitialRedirectionAvailableDate(false);
              props.didFoundNextDate(nextDateFormatted);
            }
            checkBookingSlotsWithBusinessConfigurations(
              data?.objects,
              data?.isQueueSlotsAvailable,
            );
            setIsLoading(false);
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
  const onPressSlotCell = (item, index) => {
    if (!isLoading) {
      if (item.canBook === true) {
        setSetSelectedBookingSlotIndex(index);
        setIsRightButtonEnabled(true);
        setRightButtonText(
          isReschedule === true
            ? t(Translations.RESCHEDULE)
            : t(Translations.CONFIRM),
        );
        props.didSelectBookingSlot(item.dateFrom, item);
      }
    }
  };
  /**
          * Purpose:Render function of flat list
          * Created/Modified By: Sudhin Sudhakaran
          * Created/Modified Date: 8 Oct 2021
          * Steps:
              1.pass the data from api to customer details child component
      */
  const renderItem = ({item, index}) => {
    return <BookingSlotDataCell item={item} index={index} />;
  };

  const BookingSlotDataCell = ({item, index}) => {
    return (
      <TouchableOpacity
        onPress={() => onPressSlotCell(item, index)}
        style={{
          borderWidth: isLoading ? 0 : 0.3,
          borderColor: Colors.NOT_ARRIVED_TOP_COLOR,
          // width: '30%',
          // height: 34,
          height: responsiveHeight(4),
          width: responsiveWidth(28),
          backgroundColor:
            isReschedule === true
              ? Globals.SHARED_VALUES.RESCHEDULE_APPOINTMENT_INFO?.dateFrom ===
                item.dateFrom
                ? Colors.PRIMARY_COLOR
                : item.canBook === true
                ? selectedBookingSlotIndex === index
                  ? Colors.SECONDARY_COLOR
                  : Colors.WHITE_COLOR
                : Colors.TAB_VIEW_LABEL_COLOR
              : item.canBook === true
              ? selectedBookingSlotIndex === index
                ? Colors.SECONDARY_COLOR
                : Colors.WHITE_COLOR
              : Colors.TAB_VIEW_LABEL_COLOR,
              marginLeft: 15,
          marginTop: 25,
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 4,
        }}>
        {isLoading ? (
          <ListLoader />
        ) : (
          <Fragment>
            <Text
              style={{
                fontSize: 14,
                fontFamily: Fonts.Gibson_Regular,
                color:
                  isReschedule === true &&
                  Globals.SHARED_VALUES.RESCHEDULE_APPOINTMENT_INFO
                    ?.dateFrom === item.dateFrom
                    ? Colors.WHITE_COLOR
                    : selectedBookingSlotIndex === index
                    ? Colors.WHITE_COLOR
                    : item.canBook === true
                    ? Colors.PRIMARY_TEXT_COLOR
                    : Colors.WHITE_COLOR,
              }}>
              {Utilities.getUtcToLocalWithFormat(
                item.dateFrom,
                Utilities.isBusiness24HrTimeFormat() ? 'HH:mm' : 'hh:mm A',
              )}
            </Text>
          </Fragment>
        )}
      </TouchableOpacity>
    );
  };
  /**
           * Purpose: List empty component
           * Created/Modified By: Sudhin Sudhakaran
           * Created/Modified Date: 11 Oct 2021
           * Steps:
               1.Return the component when list is empty
       */
      /**
              * Purpose: List empty component
              * Created/Modified By: Monisha Sreejith
              * Created/Modified Date: 30 Nov 2022
              * Steps:
                  1.Return the component when list is empty 
                  2.Return the component when business settings conditions  disable
          */
  const BookingEmptyComponent = () => {
    setHideComponent(false);
    console.log('length',Globals?.BOOKING_DETAILS?.objects?.length)
    console.log('specialistAvailable====',specialistAvailable);
    console.log('consultantAvailable=====',consultantAvailable);
    console.log('ConsultantHour====',Globals.SHARED_VALUES.SELECTED_SERVING_USER_INFO?.workingHours);
    console.log('BuisnessHour====',Globals.BUSINESS_DETAILS?.generalHours);
    console.log('Consultant====',Globals.SHARED_VALUES.SELECTED_SERVING_USER_INFO);
    return (
      <View
        style={{
          alignSelf: 'center',
          justifyContent: 'center',
        }}>
         {showSlotFullEmptyComponent === false && isLoading ===false && showEmptyComponent ===false 
         &&   selectedDayIsHoliday === true && Globals.BUSINESS_DETAILS?.holidayList?.length>0 ? 
          <View
            style={{
              alignSelf: 'center',
              alignItems: 'center',
              justifyContent: 'center',
              // marginTop: 40,
              height: responsiveHeight(40),
              width: responsiveWidth(100),
            }}>
            <LottieView
              style={{
                width: DisplayUtils.setWidth(50),
                height: 150,
                alignSelf: 'center',
              }}
              source={Images.BUSINESS_CLOSED_ANIMATION}
              autoPlay
              loop
            />
            <Text
              style={{
                alignSelf: 'center',
                color: Colors.PRIMARY_TEXT_COLOR,
                fontFamily: Fonts.Gibson_Regular,
                fontSize: 14,
              }}>
              {
                 t(Translations.SELECTED_DATE_IS_A_HOLIDAY)
                }
            </Text>
          </View>
          :showSlotFullEmptyComponent === false && isLoading ===false && showEmptyComponent ===false 
          && !specialistAvailable  &&!consultantAvailable?
          <View
          style={{
            alignSelf: 'center',
            alignItems: 'center',
            justifyContent: 'center',
            //  marginTop: 40,
            height: responsiveHeight(50),
            width: responsiveWidth(100),
          }}>
            {isSelectedDayToday?
            <>
          <Text
             style={{
                // marginTop: 40,
               fontFamily: Fonts.Gibson_Regular,
               color: Colors.PRIMARY_TEXT_COLOR,
               fontSize: 16,
               alignSelf: 'center',
               justifyContent: 'center',
                marginRight: 40,
                marginLeft: 40,
               lineHeight: 20,
               textAlign: 'center',
             }}>
             {Globals?.BOOKING_DETAILS?.objects?.length>0 &&
             Globals?.BUSINESS_DETAILS?.enableBooking === true && 
             Globals?.BUSINESS_DETAILS?.enableCustomerBooking === true &&
             Globals?.BUSINESS_DETAILS?.bookingSettings?.allowCurrentDayBooking === true &&
             Globals?.BUSINESS_DETAILS?.bookingSettings?.allowCurrentSessionBooking === true ?
           t(Translations.BOOKING_ARE_FULL_YOU_CAN_SWITCH_TO_THE) +' '+
           t(Translations.QUEUE)
            :t(Translations.NO_BOOKING_AVAILABLE)}{'  '}
           </Text>
            <LottieView
            style={{
              width: 170,
              height: 170,
              alignSelf: 'center',
              marginTop: -5,
            }}
            source={Images.SLOT_FULL_ANIMATION}
            autoPlay
            loop
            colorFilters={[
              {
                keypath: 'no-appointment Outlines.Group 1',
                color: Colors.SECONDARY_COLOR,
              },
              {
                keypath: 'no-appointment Outlines.Group 2',
                color: Colors.SECONDARY_COLOR,
              },
              {
                keypath: 'no-appointment Outlines.Group 3',
                color: Colors.SECONDARY_COLOR,
              },
              {
                keypath: 'no-appointment Outlines.Group 4',
                color: Colors.SECONDARY_COLOR,
              },
              {
                keypath: 'no-appointment Outlines.Group 5',
                color: Colors.SECONDARY_COLOR,
              },
              {
                keypath: 'no-appointment Outlines.Group 6',
                color: Colors.SECONDARY_COLOR,
              },
              {
                keypath: 'no-appointment Outlines.Group 7',
                color: Colors.SECONDARY_COLOR,
              },
              {
                keypath: 'no-appointment Outlines.Group 8',
                color: Colors.SECONDARY_COLOR,
              },
              {
                keypath: 'no-appointment Outlines.Group 9',
                color: Colors.SECONDARY_COLOR,
              },
              // {
              //     keypath: 'no-appointment Outlines.Group 10',
              //     color: Colors.SECONDARY_COLOR,
              // },
              {
                keypath: 'no-appointment Outlines.Group 11',
                color: Colors.SECONDARY_COLOR,
              },
              {
                keypath: 'no-appointment Outlines.Group 12',
                color: Colors.SECONDARY_COLOR,
              },
              {
                keypath: 'no-appointment Outlines.Group 13',
                color: Colors.SECONDARY_COLOR,
              },
              {
                keypath: 'no-appointment Outlines.Group 14',
                color: Colors.SECONDARY_COLOR,
              },
              {
                keypath: 'no-appointment Outlines.Group 15',
                color: Colors.SECONDARY_COLOR,
              },
            ]}
          />
          </>
           : Globals?.BUSINESS_DETAILS?.bookingSettings?.advanceBookingAvialability?.isActive===true?null:
          <>
           <Text
         style={{
          // marginTop: 40,
          fontFamily: Fonts.Gibson_Regular,
          color: Colors.PRIMARY_TEXT_COLOR,
          fontSize: 16,
          alignSelf: 'center',
          justifyContent: 'center',
           marginRight: 40,
           marginLeft: 40,
          lineHeight: 20,
          textAlign: 'center',
          }}>
           {t(Translations.NO_BOOKING_AVAILABLE)}{' '}
           </Text>
           <LottieView
           style={{
             width: 170,
             height: 170,
             alignSelf: 'center',
             marginTop: -5,
           }}
           source={Images.SLOT_FULL_ANIMATION}
           autoPlay
           loop
           colorFilters={[
             {
               keypath: 'no-appointment Outlines.Group 1',
               color: Colors.SECONDARY_COLOR,
             },
             {
               keypath: 'no-appointment Outlines.Group 2',
               color: Colors.SECONDARY_COLOR,
             },
             {
               keypath: 'no-appointment Outlines.Group 3',
               color: Colors.SECONDARY_COLOR,
             },
             {
               keypath: 'no-appointment Outlines.Group 4',
               color: Colors.SECONDARY_COLOR,
             },
             {
               keypath: 'no-appointment Outlines.Group 5',
               color: Colors.SECONDARY_COLOR,
             },
             {
               keypath: 'no-appointment Outlines.Group 6',
               color: Colors.SECONDARY_COLOR,
             },
             {
               keypath: 'no-appointment Outlines.Group 7',
               color: Colors.SECONDARY_COLOR,
             },
             {
               keypath: 'no-appointment Outlines.Group 8',
               color: Colors.SECONDARY_COLOR,
             },
             {
               keypath: 'no-appointment Outlines.Group 9',
               color: Colors.SECONDARY_COLOR,
             },
             // {
             //     keypath: 'no-appointment Outlines.Group 10',
             //     color: Colors.SECONDARY_COLOR,
             // },
             {
               keypath: 'no-appointment Outlines.Group 11',
               color: Colors.SECONDARY_COLOR,
             },
             {
               keypath: 'no-appointment Outlines.Group 12',
               color: Colors.SECONDARY_COLOR,
             },
             {
               keypath: 'no-appointment Outlines.Group 13',
               color: Colors.SECONDARY_COLOR,
             },
             {
               keypath: 'no-appointment Outlines.Group 14',
               color: Colors.SECONDARY_COLOR,
             },
             {
               keypath: 'no-appointment Outlines.Group 15',
               color: Colors.SECONDARY_COLOR,
             },
           ]}
         />
         </>
           }
         </View>
                : isLoading ===false && showEmptyComponent ===false?
              <View
                style={{
                  alignSelf: 'center',
                  alignItems: 'center',
                  justifyContent: 'center',
                  // marginTop: 40,
                  height: responsiveHeight(40),
                  width: responsiveWidth(100),
                }}>
                <LottieView
                  style={{
                    width: DisplayUtils.setWidth(50),
                    height: 150,
                    alignSelf: 'center',
                  }}
                  source={Images.BUSINESS_CLOSED_ANIMATION}
                  autoPlay
                  loop
                />
                <Text
                  style={{
                    alignSelf: 'center',
                    color: Colors.PRIMARY_TEXT_COLOR,
                    fontFamily: Fonts.Gibson_Regular,
                    fontSize: 14,
                  }}>
                  {
                    Utilities.getSpecialistName() +
                      t(
                        Translations.CONSULTATION_NOT_AVAILABLE_FOR_THE_SELECTED_DAY,
                      )}
                </Text>
                </View>
         
                :null
        }
      </View>
    )};
const NotAvailableEmptyComponent=()=>{
  return(
    <View
    style={{
      alignSelf: 'center',
      alignItems: 'center',
      justifyContent: 'center',
      // marginTop: 40,
      height: responsiveHeight(40),
      width: responsiveWidth(100),
    }}>
    <LottieView
      style={{
        width: DisplayUtils.setWidth(50),
        height: 150,
        alignSelf: 'center',
      }}
      source={Images.BUSINESS_CLOSED_ANIMATION}
      autoPlay
      loop
    />
    <Text
      style={{
        alignSelf: 'center',
        color: Colors.PRIMARY_TEXT_COLOR,
        fontFamily: Fonts.Gibson_Regular,
        fontSize: 14,
      }}>
      {
        Utilities.getSpecialistName() +
          t(
            Translations.CONSULTATION_NOT_AVAILABLE_FOR_THE_SELECTED_DAY,
          )}
    </Text>
    </View>
  )
}
  //final return
  return (
    <>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        style={{flex: 1, backgroundColor: Colors.APP_MAIN_BACKGROUND_COLOR}}>
        <View
          style={{
            flex: 1,
            backgroundColor: Colors.APP_MAIN_BACKGROUND_COLOR,
          }}>
          <View
            style={{
              width: '100%',
              height: 0.5,
              backgroundColor: Colors.LINE_SEPARATOR_COLOR,
            }}
          />
{!selectedDayIsHoliday?
          <FlatList
            contentContainerStyle={{
              paddingBottom: 85,
            }}
            horizontal={false}
            numColumns={3}
            data={isLoading ? dummyNotArrivedListData
             : isSelectedDayToday  && 
             Globals?.BUSINESS_DETAILS?.enableBooking === true && 
             Globals?.BUSINESS_DETAILS?.enableCustomerBooking === true &&
             Globals?.BUSINESS_DETAILS?.bookingSettings?.allowCurrentDayBooking === true &&
             Globals.BUSINESS_DETAILS?.enableCustomerLogin === true ?
              bookingSlotList :
               !isSelectedDayToday &&isLoading ===false && showEmptyComponent ===false && 
               Globals?.BOOKING_DETAILS?.objects?.length>0&&
               Globals?.BUSINESS_DETAILS?.enableBooking === true && 
             Globals?.BUSINESS_DETAILS?.enableCustomerBooking === true &&
             Globals?.BUSINESS_DETAILS?.bookingSettings?.advanceBookingAvialability?.isActive===true
                ? bookingSlotList 
             : BookingEmptyComponent}
            keyboardShouldPersistTaps="handled"
            renderItem={renderItem}
            keyExtractor={(item,index) =>
              item._id ? item._id.toString() : index.toString()
            }
            ListEmptyComponent={
              selectedDayIsHoliday === true &&
                Globals?.SHARED_VALUES?.SELECTED_SERVING_USER_INFO?.availability==='NOTAVAILABLE'?<NotAvailableEmptyComponent/>:
             BookingEmptyComponent
            }
          />
          :  <FlatList
            contentContainerStyle={{
              paddingBottom: 85,
            }}
            horizontal={false}
            numColumns={3}
            data={isLoading ? dummyNotArrivedListData:!selectedDayIsHoliday?
              bookingSlotList:BookingEmptyComponent }
            keyboardShouldPersistTaps="handled"
            renderItem={renderItem}
            keyExtractor={(item,index) =>
              item._id ? item._id.toString() : index.toString()
            }
            ListEmptyComponent={
             BookingEmptyComponent
            }
          />
          }
        </View>
      </KeyboardAvoidingView>
    </>
  );
};

export default React.memo(BookingSlotList);

const styles = StyleSheet.create({});
