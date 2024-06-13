import React, {useState, useEffect, useRef, Fragment} from 'react';
import {
  StatusBar,
  Text,
  View,
  Image,
  TouchableOpacity,
  Keyboard,
  useWindowDimensions,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  KeyboardAvoidingView,
  I18nManager,
} from 'react-native';
import LottieView from 'lottie-react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/core';
import InputScrollView from 'react-native-input-scroll-view';
import FastImage from 'react-native-fast-image';
import ContentLoader, {Rect, Circle, Path} from 'react-content-loader/native';
import {
  Colors,
  Fonts,
  Globals,
  Images,
  Strings,
  Translations,
} from '../../../constants';
import LoadingIndicator from '../../shared/loadingIndicator/LoadingIndicator';
import StorageManager from '../../../helpers/storageManager/StorageManager';
import DataManager from '../../../helpers/apiManager/DataManager';
import Utilities from '../../../helpers/utils/Utilities';
import DisplayUtils from '../../../helpers/utils/DisplayUtils';
import APIConnections from '../../../helpers/apiManager/APIConnections';
import NO_VISITORS from '../../../assets/images/noVisitsError.svg';
import {GetImage} from '../../shared/getImage/GetImage';
import moment from 'moment';
import {ScrollView} from 'react-native-gesture-handler';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
  responsiveScreenHeight,
  responsiveScreenWidth,
} from "react-native-responsive-dimensions";
import {t} from 'i18next';
const QueueSlotList = props => {
  const {
    isReschedule,
    isForceRefresh,
    selectedServingUserId,
    selectedGender,
    selectedCustomerInfo,
    isServingUserSelected,
    selectedDate,
    index,
    selectedServicesId,
    isSelectedDayToday,
    setIsRightButtonEnabled,
    isRightButtonEnabled,
    setRightButtonText,
    setIsLoading,
    isLoading,
    selectedDayIsHoliday,
    specialistAvailable,
    consultantAvailable,
    hideComponent,
    setHideComponent,
  } = props;
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const layout = useWindowDimensions();
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState();
  const [plusButtonEnable, setPlusButtonEnable] = useState(false);
  const [queueSlotList, setQueueSlotList] = useState([]);
  const [isRefreshNeeded, setIsRefreshNeeded] = useState(false);
  const [selectedQueueSlot, setSelectedQueueSlot] = useState(null);
  const [hideEmptyComponent, setHideEmptyComponent] = useState(true);
  const [expectedTimeOfServing, setExpectedTimeOfServing] = useState();
  const [selectedSubSlotIndex, setSelectedSubSlotIndex] = useState(-1); //-1 if system generated time
  const[showEmptyComponent,setShowEmptyComponent]=useState(false);
  const[hideText,setHideText]=useState(false);
  const[queueNotAvailable,setQueueNotAvailable]=useState(false);
  const[timecolor,setTimeColor]=useState(false);
   const [availabilityInfo, setAvailabilityInfo] = useState({});
  useEffect(() => {
    if (index === 1) {
      getBusinessDetails(selectedDate, selectedServingUserId);
    }
    // setTimeout(() => {
    //    setHideEmptyComponent(false);
    // }, 2000);
    setQueueSlotList('');
    setSelectedIndex('');
    setPlusButtonEnable(false);
    setShowEmptyComponent(true); 
    setHideText(false);
    setQueueNotAvailable(true);
    setSelectedSubSlotIndex(-1);
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
  const SuggestedTimeLoader = props => (
    <ContentLoader
      transform={[{scaleX: I18nManager.isRTL ? -1 : 1}]}
      speed={1.5}
      width={'100%'}
      height={40}
      //viewBox="0 0 320 "
      backgroundColor="#dadada"
      foregroundColor="#eee"
      animate={true}
      {...props}>
      <Rect x="20%" y="0" rx="5" ry="5" width="60%" height="12" />
      <Rect x="25%" y="22" rx="5" ry="5" width="50%" height="12" />
    </ContentLoader>
  );
  const ConsultantTextLoader = props => (
    <ContentLoader
      transform={[{scaleX: I18nManager.isRTL ? -1 : 1}]}
      speed={1.5}
      width={'100%'}
      height={25}
      //viewBox="0 0 320 "
      backgroundColor="#dadada"
      foregroundColor="#eee"
      animate={true}
      {...props}>
      <Rect x="35%" y="10" rx="5" ry="5" width="30%" height="12" />
    </ContentLoader>
  );
  /**
          *
          * Purpose: check booking configurations
          * Created/Modified By: Vijin
          * Created/Modified Date: 17 Feb 2022
          * Steps:
             
       */
  const checkQueueSlotsWithBusinessConfigurations = (
    queueSlotData,
    systemGeneratedTime,
    queueSlot,
  ) => {
    setExpectedTimeOfServing(queueSlotData);
    props.didSelectQueueSlot(systemGeneratedTime);
    setShowEmptyComponent(false); 
    setQueueNotAvailable(false);
    setQueueSlotList(queueSlot);
    console.log('queuedetails.........',Globals?.QUEUE_DETAILS?.objects?.length)
    if(!specialistAvailable && !selectedDayIsHoliday&&Globals?.QUEUE_DETAILS?.objects?.length>0 )
  {
   if (
    Globals?.QUEUE_DETAILS?.objects?.length >0 && 
      Globals?.BUSINESS_DETAILS?.enableCustomerQueue===true &&
      Globals?.BUSINESS_DETAILS?.enableQueue===true &&
      Globals?.BUSINESS_DETAILS?.enableCustomerLogin===true &&
      isSelectedDayToday
      ) {
      setIsRightButtonEnabled(false);
      }
    else if(Globals?.QUEUE_DETAILS?.objects?.length >0 && 
      Globals?.BUSINESS_DETAILS?.enableCustomerQueue===true &&
      Globals?.BUSINESS_DETAILS?.enableQueue===true &&
      Globals?.BUSINESS_DETAILS?.enableCustomerLogin===true &&
      Globals?.BUSINESS_DETAILS?.waitlistSettings?.allowFutureDayQueue===true &&
      !isSelectedDayToday) {
      setIsRightButtonEnabled(false);
    }
    else{
      setIsRightButtonEnabled(false);
    }
  }
  else{
    setIsRightButtonEnabled(false);
  }
    // if (Globals?.BUSINESS_DETAILS?.waitlistSettings?.allowFutureDayQueue===true
    //   &&!(Utilities.checkSelectedDateIsHoliday(selectedDate))) {
    //   setIsRightButtonEnabled(true);
    // }
    // else {
    //   setIsRightButtonEnabled(false);
    // }
    setRightButtonText(
         t(Translations.JOIN_QUEUE),
    );
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
              if (isServingUserSelected) {
                performGetQueueSlotList(selectedDate, serveUserId);
              } else {
                performGetAllQueueSlots(selectedDate);
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
               * Created/Modified Date: 27 Dec 2021
               * Steps:
                   1.fetch business list from API and append to state variable
       */

  const performGetQueueSlotList = (date, serveUserId) => {
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
        [APIConnections.KEYS.SERVING_USER_ID]:
          serveUserId !== undefined ? serveUserId : Globals.USER_DETAILS._id,
        [APIConnections.KEYS.BUSINESS_ID]: Globals.BUSINESS_DETAILS._id,
        [APIConnections.KEYS.START_DATE]: startDate,
        [APIConnections.KEYS.END_DATE]: endDate,
        [APIConnections.KEYS.SERVICES]: selectedServicesId,
      };
    } else {
      body = {
        [APIConnections.KEYS.SERVING_USER_ID]:
          serveUserId !== undefined ? serveUserId : Globals.USER_DETAILS._id,
        [APIConnections.KEYS.BUSINESS_ID]: Globals.BUSINESS_DETAILS._id,
        [APIConnections.KEYS.START_DATE]: startDate,
        [APIConnections.KEYS.END_DATE]: endDate,
      };
    }

    DataManager.getQueueSlotList(body).then(([isSuccess, message, data]) => {
      if (isSuccess === true) {
        if (data !== undefined && data !== null) {
          Globals.QUEUE_DETAILS=data;
          checkQueueSlotsWithBusinessConfigurations(
            data,
            data?.systemGeneratedTime,
            data.objects,
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

  const performGetAllQueueSlots = date => {
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

    DataManager.getAllQueueSlots(body).then(([isSuccess, message, data]) => {
      if (isSuccess === true) {
        if (data !== undefined && data !== null) {
          Globals.QUEUE_DETAILS=data;
          checkQueueSlotsWithBusinessConfigurations(
            data,
            data?.systemGeneratedTime,
            data.objects,
          );
          setAvailabilityInfo(data.objects);
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
  const plusButtonAction = index => {
    if (index === selectedIndex) {
      setSelectedIndex('');
       setPlusButtonEnable(false);
    } else {
      setSelectedIndex(index);
      setPlusButtonEnable(true);
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
    return <QueueSlotDataCell item={item} index={index} />;
  };

  const QueueSlotDataCell = ({item, index}) => {
    return (
      <View
        style={{alignSelf: 'center', width: DisplayUtils.setWidth(90)}}
        // onPress={() =>
        //     navigation.navigate('CustomerDetailsScreen', { selectedCustomer: item })
        // }
      >
        {isLoading ? (
          <ListLoader />
        ) : (
          <View
            style={{
              borderWidth: isLoading ? 0 : 0.5,
              borderColor: Colors.NOTIFICATION_TITLE_COLOR,
              height: 50,
              backgroundColor: Colors.WHITE_COLOR,
              marginTop: 20,
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 8,
              marginHorizontal: 10,
            }}>
            <Text
              style={{
                fontSize: 14,
                fontFamily: Fonts.Gibson_Regular,
                color: Colors.PRIMARY_TEXT_COLOR,
              }}>
              {Utilities.getUtcToLocalWithFormat(
                item.from,
                Utilities.isBusiness24HrTimeFormat() ? 'HH:mm' : 'hh:mm A',
              )}{' '}
              -{' '}
              {Utilities.getUtcToLocalWithFormat(
                item.to,
                Utilities.isBusiness24HrTimeFormat() ? 'HH:mm' : 'hh:mm A',
              )}
            </Text>
            <TouchableOpacity
              style={{
                height: 50,
                width: 52,
                borderLeftColor: Colors.NOTIFICATION_TITLE_COLOR,
                borderLeftWidth: isLoading ? 0 : 0.5,
                position: 'absolute',
                right: 0,
                justifyContent: 'center',
              }}
              onPress={() => plusButtonAction(index)}>
                {index === selectedIndex ?
              <Image
                style={{
                  width: 12,
                  height: 12,
                  resizeMode: 'contain',
                  tintColor: Colors.PRIMARY_COLOR,
                  alignSelf: 'center',
                }}
                source={Images.MINUS_ICON}
              />
              : <Image
              style={{
                width: 12,
                height: 12,
                resizeMode: 'contain',
                tintColor: Colors.PRIMARY_COLOR,
                alignSelf: 'center',
              }}
              source={Images.PLUS_ICON}
            />}
            </TouchableOpacity>
          </View>
        )}
        {selectedIndex === index ? (
          <FlatList
            contentContainerStyle={{
              paddingBottom: 85,
              marginLeft: 16,
              marginRight: 22,
            }}
            horizontal={false}
            numColumns={2}
            data={item?.available}
            keyboardShouldPersistTaps="handled"
            renderItem={renderAvailableItem}
            keyExtractor={(item, index) =>
              item._id ? item._id.toString() : index.toString()
            }
          />
        ) : null}
      </View>
    );
  };
  const availableSubSlotOnPress = (item, index) => {
    queueSlotList?.map((queueItem, queueItemIndex) => {
      queueItem?.available.map(
        (queueAvailableItem, queueAvailableItemIndex) => {
          if (queueItemIndex === selectedIndex) {
            if (queueAvailableItemIndex === index) {
              setIsRightButtonEnabled(true);
              queueSlotList[queueItemIndex].available[
                queueAvailableItemIndex
              ].isSelected = true;
            } else {
              queueSlotList[queueItemIndex].available[
                queueAvailableItemIndex
              ].isSelected = false;
            }
          } else {
            queueSlotList[queueItemIndex].available[
              queueAvailableItemIndex
            ].isSelected = false;
          }
        },
      );
    });

    setSelectedQueueSlot(item);
    setSelectedSubSlotIndex(index); //-1 if system generated time
    setIsRefreshNeeded(!isRefreshNeeded);
    props.didSelectQueueSlot(item);
  };
  /**
          * Purpose:Render function of flat list
          * Created/Modified By: Sudhin Sudhakaran
          * Created/Modified Date: 8 Oct 2021
          * Steps:
              1.pass the data from api to customer details child component
      */
  const renderAvailableItem = ({item, index}) => {
    return <AvailableDataCell item={item} index={index} />;
  };

  const AvailableDataCell = ({item, index}) => {
    return (
      <TouchableOpacity
        onPress={() => availableSubSlotOnPress(item, index)}
        style={{
          borderWidth: isLoading ? 0 : 0.3,
          borderColor: Colors.SEARCH_INPUT_BORDER_GRAY_COLOR,
          height: 35,
          backgroundColor:
            item?.isSelected || false
              ? Colors.SECONDARY_COLOR
              : Colors.WHITE_COLOR,
          marginLeft: 12,
          marginTop: 20,
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 4,
          width: '45%',
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
                  item?.isSelected || false
                    ? Colors.WHITE_COLOR
                    : Colors.PRIMARY_TEXT_COLOR,
              }}>
              {Utilities.getUtcToLocalWithFormat(
                item.from,
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
  const QueueEmptyComponent = () => {
    setIsLoading(false);
    setHideComponent(false);
    return isLoading === false && showEmptyComponent === false && selectedDayIsHoliday ===true
    && Globals.BUSINESS_DETAILS?.holidayList?.length>0 ? (
      <View
        style={{
          alignSelf: 'center',
          alignItems: 'center',
          justifyContent: 'center',
          // marginTop:40,
          height: responsiveHeight(40),
          width: responsiveWidth(100),
        }}>
         { Globals.BUSINESS_DETAILS?.enableCustomerLogin === false ? null : (
 <View  style={{

}}>
 <LottieView
 style={{width: DisplayUtils.setWidth(50), height: 150}}
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
 {selectedDayIsHoliday === true
   ? t(Translations.SELECTED_DATE_IS_A_HOLIDAY)
   : ( Utilities.getSpecialistName() +
     ' ' +
     t(Translations.CONSULTATION_NOT_AVAILABLE_FOR_THE_SELECTED_DAY))}
</Text>
</View>
         )}
</View>
) : (Globals?.QUEUE_DETAILS?.objects?.length === 0 && isLoading === false && showEmptyComponent === false 
?
<View
style={{
 alignSelf: 'center',
 alignItems: 'center',
 justifyContent: 'center',
  // marginTop:40,
  height: responsiveHeight(40),
  width: responsiveWidth(100),
}}>
{  !specialistAvailable  &&!consultantAvailable?
  <>
<Text
style={{
 marginTop: 40,
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
{Globals?.BOOKING_DETAILS?.objects?.length>0&&
                Globals?.BUSINESS_DETAILS?.enableCustomerQueue===true &&
                Globals?.BUSINESS_DETAILS?.enableQueue===true &&
                Globals?.BUSINESS_DETAILS?.enableCustomerLogin===true &&
               Globals?.BUSINESS_DETAILS?.waitlistSettings?.allowCurrentSessionQueue===true ?            
t(Translations.QUEUE_IS_FULL):t(Translations.NO_QUEUE_AVAILABLE)
}
</Text>
<LottieView
style={{
width: 170,
height: 170,
alignSelf: 'center',
marginTop: -5,
marginLeft:10
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
:
<View
style={{
 
}}>
<LottieView
 style={{width: DisplayUtils.setWidth(50), height: 150}}
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
     ' ' +
     t(Translations.CONSULTATION_NOT_AVAILABLE_FOR_THE_SELECTED_DAY)}
</Text>
</View>
}
</View>
: isLoading === false && showEmptyComponent === false ?
 <View
 style={{
  alignSelf: 'center',
  alignItems: 'center',
  justifyContent: 'center',
  height: responsiveHeight(50),
  width: responsiveWidth(100),
 }}>
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
 {t(Translations.NO_QUEUE_AVAILABLE)}
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
 </View>
 :null
)
};
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
  const systemGeneratedViewOnPress = () => {
    setIsRightButtonEnabled(true);
    if (selectedSubSlotIndex !== -1) {
      queueSlotList?.map((queueItem, queueItemIndex) => {
        queueItem?.available.map(
          (queueAvailableItem, queueAvailableItemIndex) => {
            if (queueAvailableItem?.isSelected === true) {
              queueSlotList[queueItemIndex].available[
                queueAvailableItemIndex
              ].isSelected = false;
            }
          },
        );
      });
      setSelectedQueueSlot(expectedTimeOfServing);
      setSelectedSubSlotIndex(-1); //-1 if system generated time
      setIsRefreshNeeded(!isRefreshNeeded);
      props.didSelectQueueSlot(expectedTimeOfServing?.systemGeneratedTime);
    }
  };
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
            {specialistAvailable ===false && !selectedDayIsHoliday
            && queueSlotList?.length>0 ?   
          <ScrollView showsVerticalScrollIndicator={false}>
                 {/* QUEUE MODE LABEL */}
                 {queueSlotList?.length > 0 && 
            Globals?.BUSINESS_DETAILS?.enableCustomerQueue===true &&
            Globals?.BUSINESS_DETAILS?.enableQueue===true &&
            Globals?.BUSINESS_DETAILS?.enableCustomerLogin===true &&
            Globals?.BUSINESS_DETAILS?.waitlistSettings?.allowFutureDayQueue===true?
      (
      <Text
                style={{
                  marginTop: 20,
                  fontFamily: Fonts.Gibson_Regular,
                  color: Colors.PRIMARY_TEXT_COLOR,
                  fontSize: 16,
                  alignSelf: 'center',
                }}
                numberOfLines={1}>
                {t(Translations.YOU_ARE_IN)}{' '}
                <Text
                  style={{
                    fontFamily: Fonts.Gibson_SemiBold,
                    color: Colors.PRIMARY_COLOR,
                    fontSize: 16,
                  }}>
                  {t(Translations.QUEUE)}{' '}
                </Text>
                {t(Translations.MODE)}
              </Text>
            ) : 
          isSelectedDayToday?
            (
              <Text
                        style={{
                          marginTop: 20,
                          fontFamily: Fonts.Gibson_Regular,
                          color: Colors.PRIMARY_TEXT_COLOR,
                          fontSize: 16,
                          alignSelf: 'center',
                        }}
                        numberOfLines={1}>
                        {t(Translations.YOU_ARE_IN)}{' '}
                        <Text
                          style={{
                            fontFamily: Fonts.Gibson_SemiBold,
                            color: Colors.PRIMARY_COLOR,
                            fontSize: 16,
                          }}>
                          {t(Translations.QUEUE)}{' '}
                        </Text>
                        {t(Translations.MODE)}
                      </Text>
                    ) 
            :null
            }

            {/* SYSTEM GENERATED TIME */}
            {queueSlotList?.length > 0 && 
            Globals?.BUSINESS_DETAILS?.enableCustomerQueue===true &&
            Globals?.BUSINESS_DETAILS?.enableQueue===true &&
            Globals?.BUSINESS_DETAILS?.enableCustomerLogin===true &&
            Globals?.BUSINESS_DETAILS?.waitlistSettings?.allowFutureDayQueue===true ?
                       (
                        <View>
                         {isRightButtonEnabled === true && selectedSubSlotIndex === -1 ?
                         <View  style={{
                          marginLeft: 40,
                          marginRight: 40,
                          height: 127,
                          borderWidth: selectedSubSlotIndex === -1 ? 2 : 1,
                          borderColor:
                            selectedSubSlotIndex === -1
                              ? isRightButtonEnabled === true ?
                              Colors.PRIMARY_COLOR : Colors.SECONDARY_COLOR
                              : Colors.NOTIFICATION_TITLE_COLOR,
                          borderRadius: 8,
                          backgroundColor:
                            selectedSubSlotIndex === -1
                              ? Colors.SECONDARY_COLOR
                              : Colors.WHITE_COLOR,
                          marginTop: 20,
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}><Text
                    style={{
                      fontFamily: Fonts.Gibson_Regular,
                      fontSize: 14,
                      textAlign: 'center',
                      color:
                        selectedSubSlotIndex === -1
                          ? Colors.WHITE_COLOR
                          : Colors.INACTIVE_BOTTOM_BAR_COLOR,
                      lineHeight: 25,
                    }}>
                    {t(Translations.THE_BEST_SUGGESTED_TIME)}
                    {'\n'}
                    {t(Translations.FOR_THE_CONSULTATION_IS)}
                  </Text>
                  <Image
                      source={Images.ALARM_CLOCK_ICON}
                      style={{
                        height: 14,
                        width: 14,
                        marginRight: 4,
                        marginTop: 0,
                        tintColor:
                          selectedSubSlotIndex === -1
                            ? Colors.WHITE_COLOR
                            : Colors.INACTIVE_BOTTOM_BAR_COLOR,
                      }}
                    />
                    <Text
                      style={{
                        fontFamily: Fonts.Gibson_SemiBold,
                        fontSize: 14,
                        textAlign: 'center',
                        color:
                          selectedSubSlotIndex === -1
                            ? Colors.WHITE_COLOR
                            : Colors.INACTIVE_BOTTOM_BAR_COLOR,
                      }}>
                      {expectedTimeOfServing !== undefined
                        ? Utilities.getUtcToLocalWithFormat(
                            expectedTimeOfServing?.systemGeneratedTime
                              ?.expectedTimeOfServing,
                            Utilities.isBusiness24HrTimeFormat()
                              ? 'HH:mm'
                              : 'hh:mm A',
                          )
                        : 'N/A'}
                    </Text>
                    <View
                  style={{
                    top: 58,
                    left: 16,
                    width: 12,
                    height: 12,
                    borderWidth: 1,
                    borderRadius: 6,
                    position: 'absolute',
                    backgroundColor:selectedSubSlotIndex === -1 &&
                    isRightButtonEnabled === true ?
                    Colors.PRIMARY_COLOR : Colors.WHITE_COLOR,
                    borderColor: Colors.NOTIFICATION_TITLE_COLOR,
                  }}
                />
                  </View> :
              <TouchableOpacity
                style={{
                  marginLeft: 40,
                  marginRight: 40,
                  height: 127,
                  borderWidth: selectedSubSlotIndex === -1 ? 2 : 1,
                  borderColor:
                    selectedSubSlotIndex === -1
                      ? isRightButtonEnabled === true ?
                      Colors.PRIMARY_COLOR : Colors.SECONDARY_COLOR
                      : Colors.NOTIFICATION_TITLE_COLOR,
                  borderRadius: 8,
                  backgroundColor:
                    selectedSubSlotIndex === -1
                      ? Colors.SECONDARY_COLOR
                      : Colors.WHITE_COLOR,
                  marginTop: 20,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                onPress={() => systemGeneratedViewOnPress()}>
                {isLoading === true || showEmptyComponent === true ? (
                  <SuggestedTimeLoader />
                ) : (isLoading === false && showEmptyComponent === false ?
                  <Text
                    style={{
                      fontFamily: Fonts.Gibson_Regular,
                      fontSize: 14,
                      textAlign: 'center',
                      color:
                        selectedSubSlotIndex === -1
                          ? Colors.WHITE_COLOR
                          : Colors.INACTIVE_BOTTOM_BAR_COLOR,
                      lineHeight: 25,
                    }}>
                    {t(Translations.THE_BEST_SUGGESTED_TIME)}
                    {'\n'}
                    {t(Translations.FOR_THE_CONSULTATION_IS)}
                  </Text>
                  :<View/>
                )}

                {isLoading === true || showEmptyComponent === true  ? (
                  <ConsultantTextLoader />
                ) : (isLoading === false && showEmptyComponent === false?
                  <View style={{flexDirection: 'row', marginTop: 15}}>
                    <Image
                      source={Images.ALARM_CLOCK_ICON}
                      style={{
                        height: 14,
                        width: 14,
                        marginRight: 4,
                        marginTop: 0,
                        tintColor:
                          selectedSubSlotIndex === -1
                            ? Colors.WHITE_COLOR
                            : Colors.INACTIVE_BOTTOM_BAR_COLOR,
                      }}
                    />
                    <Text
                      style={{
                        fontFamily: Fonts.Gibson_SemiBold,
                        fontSize: 14,
                        textAlign: 'center',
                        color:
                          selectedSubSlotIndex === -1
                            ? Colors.WHITE_COLOR
                            : Colors.INACTIVE_BOTTOM_BAR_COLOR,
                      }}>
                      {expectedTimeOfServing !== undefined
                        ? Utilities.getUtcToLocalWithFormat(
                            expectedTimeOfServing?.systemGeneratedTime
                              ?.expectedTimeOfServing,
                            Utilities.isBusiness24HrTimeFormat()
                              ? 'HH:mm'
                              : 'hh:mm A',
                          )
                        : 'N/A'}
                    </Text>
                  </View>
                  :<View/>
                )}

                <View
                  style={{
                    top: 58,
                    left: 16,
                    width: 12,
                    height: 12,
                    borderWidth: 1,
                    borderRadius: 6,
                    position: 'absolute',
                    backgroundColor:selectedSubSlotIndex === -1 &&
                    isRightButtonEnabled === true ?
                    Colors.PRIMARY_COLOR : Colors.WHITE_COLOR,
                    borderColor: Colors.NOTIFICATION_TITLE_COLOR,
                  }}
                />
              </TouchableOpacity>
}
              </View>
            ) 
            :isSelectedDayToday?
               (
              <TouchableOpacity
              style={{
                marginLeft: 40,
                marginRight: 40,
                height: 127,
                borderWidth: selectedSubSlotIndex === -1 ? 2 : 1,
                borderColor:
                  selectedSubSlotIndex === -1
                    ? Colors.PRIMARY_COLOR
                    : Colors.NOTIFICATION_TITLE_COLOR,
                borderRadius: 8,
                backgroundColor:
                  selectedSubSlotIndex === -1
                    ? Colors.SECONDARY_COLOR
                    : Colors.WHITE_COLOR,
                marginTop: 20,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={() => systemGeneratedViewOnPress()}>
              {isLoading ===true || showEmptyComponent ===true ? (
                <SuggestedTimeLoader />
              ) : (isLoading ===false && showEmptyComponent ===false?
                <Text
                  style={{
                    fontFamily: Fonts.Gibson_Regular,
                    fontSize: 14,
                    textAlign: 'center',
                    color:
                      selectedSubSlotIndex === -1
                        ? Colors.WHITE_COLOR
                        : Colors.INACTIVE_BOTTOM_BAR_COLOR,
                    lineHeight: 25,
                  }}>
                  {t(Translations.THE_BEST_SUGGESTED_TIME)}
                  {'\n'}
                  {t(Translations.FOR_THE_CONSULTATION_IS)}
                </Text>
                :<View/>
              )}

              {isLoading ===true || showEmptyComponent ===true  ? (
                <ConsultantTextLoader />
              ) : (isLoading ===false && showEmptyComponent ===false?
                <View style={{flexDirection: 'row', marginTop: 15}}>
                  <Image
                    source={Images.ALARM_CLOCK_ICON}
                    style={{
                      height: 14,
                      width: 14,
                      marginRight: 4,
                      marginTop: 0,
                      tintColor:
                        selectedSubSlotIndex === -1
                          ? Colors.WHITE_COLOR
                          : Colors.INACTIVE_BOTTOM_BAR_COLOR,
                    }}
                  />
                  <Text
                    style={{
                      fontFamily: Fonts.Gibson_SemiBold,
                      fontSize: 14,
                      textAlign: 'center',
                      color:
                        selectedSubSlotIndex === -1
                          ? Colors.WHITE_COLOR
                          : Colors.INACTIVE_BOTTOM_BAR_COLOR,
                    }}>
                    {expectedTimeOfServing !== undefined
                      ? Utilities.getUtcToLocalWithFormat(
                          expectedTimeOfServing?.systemGeneratedTime
                            ?.expectedTimeOfServing,
                          Utilities.isBusiness24HrTimeFormat()
                            ? 'HH:mm'
                            : 'hh:mm A',
                        )
                      : 'N/A'}
                  </Text>
                </View>
                :<View/>
              )}

              <View
                style={{
                  top: 58,
                  left: 16,
                  width: 12,
                  height: 12,
                  borderWidth: 1,
                  borderRadius: 6,
                  position: 'absolute',
                  backgroundColor: Colors.WHITE_COLOR,
                  borderColor: Colors.NOTIFICATION_TITLE_COLOR,
                }}
              />
            </TouchableOpacity>
          ) 
            : null}

            {/* OR VIEW */}
            {queueSlotList?.length > 0 && 
            Globals?.BUSINESS_DETAILS?.enableCustomerQueue===true &&
            Globals?.BUSINESS_DETAILS?.enableQueue===true &&
            Globals?.BUSINESS_DETAILS?.enableCustomerLogin===true &&
            Globals?.BUSINESS_DETAILS?.waitlistSettings?.allowFutureDayQueue===true ?
              (
              <View style={{marginTop: 60, flexDirection: 'row'}}>
                <View
                  style={{
                    height: 1,
                    width: '45%',
                    backgroundColor: Colors.TEXT_GREY_COLOR_9B,
                  }}
                />
                <Text
                  style={{
                    fontSize: 14,
                    marginTop: -8,
                    marginLeft: 12,
                    marginRight: 12,
                    fontFamily: Fonts.Gibson_SemiBold,
                    color: Colors.QUEUE_LIST_DAY_COLOR,
                  }}>
                  {t(Translations.OR)}
                </Text>
                <View
                  style={{
                    height: 1,
                    width: '50%',
                    backgroundColor: Colors.TEXT_GREY_COLOR_9B,
                  }}
                />
              </View>
            ) 
            :isSelectedDayToday?
               (
              <View style={{marginTop: 60, flexDirection: 'row'}}>
              <View
                style={{
                  height: 1,
                  width: '45%',
                  backgroundColor: Colors.TEXT_GREY_COLOR_9B,
                }}
              />
              <Text
                style={{
                  fontSize: 14,
                  marginTop: -8,
                  marginLeft: 12,
                  marginRight: 12,
                  fontFamily: Fonts.Gibson_SemiBold,
                  color: Colors.QUEUE_LIST_DAY_COLOR,
                }}>
                {t(Translations.OR)}
              </Text>
              <View
                style={{
                  height: 1,
                  width: '50%',
                  backgroundColor: Colors.TEXT_GREY_COLOR_9B,
                }}
              />
            </View>
          ) 
            : null}

            {/* CHOOSE TIME LABEL */}
            {queueSlotList?.length > 0 && 
            Globals?.BUSINESS_DETAILS?.enableCustomerQueue===true &&
            Globals?.BUSINESS_DETAILS?.enableQueue===true &&
            Globals?.BUSINESS_DETAILS?.enableCustomerLogin===true  &&
            Globals?.BUSINESS_DETAILS?.waitlistSettings?.allowFutureDayQueue===true ?
  
         (
              <Text
                style={{
                  fontSize: 14,
                  marginTop: 30,
                  marginLeft: 40,
                  lineHeight: 20,
                  marginRight: 40,
                  textAlign: 'left',
                  fontFamily: Fonts.Gibson_Regular,
                  color: Colors.PRIMARY_TEXT_COLOR,
                }}>
                {t(Translations.CHOOSE_A)}{' '}
                <Text
                  style={{
                    fontFamily: Fonts.Gibson_SemiBold,
                    color: Colors.PRIMARY_COLOR,
                    fontSize: 14,
                  }}>
                  {t(Translations.TIME)}{' '}
                </Text>
                {t(Translations.FROM_THE_BELOW_TIME_INTERVALS_FOR_CONSULTATION)}
              </Text>
            ) 
            :isSelectedDayToday?
               (
              <Text
              style={{
                fontSize: 14,
                marginTop: 30,
                marginLeft: 40,
                lineHeight: 20,
                marginRight: 40,
                textAlign: 'left',
                fontFamily: Fonts.Gibson_Regular,
                color: Colors.PRIMARY_TEXT_COLOR,
              }}>
              {t(Translations.CHOOSE_A)}{' '}
              <Text
                style={{
                  fontFamily: Fonts.Gibson_SemiBold,
                  color: Colors.PRIMARY_COLOR,
                  fontSize: 14,
                }}>
                {t(Translations.TIME)}{' '}
              </Text>
              {t(Translations.FROM_THE_BELOW_TIME_INTERVALS_FOR_CONSULTATION)}
            </Text>
          ) 
            : null}
{isSelectedDayToday?
<>
            <FlatList
              contentContainerStyle={{
                paddingBottom: 85,
              }}
              showsVerticalScrollIndicator={false}
              data={isLoading ? dummyNotArrivedListData :
                Globals?.QUEUE_DETAILS?.objects?.length>0 &&
                Globals?.BUSINESS_DETAILS?.enableCustomerQueue===true &&
                // Globals?.BUSINESS_DETAILS?.waitlistSettings?.allowCurrentSessionQueue===true&&
                Globals?.BUSINESS_DETAILS?.enableQueue===true?
                queueSlotList: Globals?.BUSINESS_DETAILS?.waitlistSettings?.allowFutureDayQueue===true &&!isSelectedDayToday?
                queueSlotList:QueueEmptyComponent}
              refreshing={isRefreshNeeded}
              keyboardShouldPersistTaps="handled"
              renderItem={renderItem}
              keyExtractor={(item, index) =>
                item._id ? item._id.toString() : index.toString()
              }
              ListEmptyComponent={
                QueueEmptyComponent
              }
            />
            </>
            :<>
            <FlatList
            contentContainerStyle={{
              paddingBottom: 85,
            }}
            showsVerticalScrollIndicator={false}
            data={isLoading ? dummyNotArrivedListData :
              Globals?.QUEUE_DETAILS?.objects?.length>0 &&
              Globals?.BUSINESS_DETAILS?.waitlistSettings?.allowFutureDayQueue===true &&
              Globals?.BUSINESS_DETAILS?.enableCustomerQueue===true &&
              Globals?.BUSINESS_DETAILS?.enableQueue===true ?
              queueSlotList:QueueEmptyComponent}
            refreshing={isRefreshNeeded}
            keyboardShouldPersistTaps="handled"
            renderItem={renderItem}
            keyExtractor={(item, index) =>
              item._id ? item._id.toString() : index.toString()
            }
            ListEmptyComponent={
              QueueEmptyComponent
            }
          />
          </>
}
          </ScrollView>
          :
          <ScrollView showsVerticalScrollIndicator={false}>
                 {/* QUEUE MODE LABEL */}
            {isLoading  ? 
      (

            <Text
                style={{
                  marginTop: 20,
                  fontFamily: Fonts.Gibson_Regular,
                  color: Colors.PRIMARY_TEXT_COLOR,
                  fontSize: 16,
                  alignSelf: 'center',
                }}
                numberOfLines={1}>
                {t(Translations.YOU_ARE_IN)}{' '}
                <Text
                  style={{
                    fontFamily: Fonts.Gibson_SemiBold,
                    color: Colors.PRIMARY_COLOR,
                    fontSize: 16,
                  }}>
                  {t(Translations.QUEUE)}{' '}
                </Text>
                {t(Translations.MODE)}
              </Text>
            ) : null}

            {/* SYSTEM GENERATED TIME */}
            {isLoading ?
                       (
              <TouchableOpacity
                style={{
                  marginLeft: 40,
                  marginRight: 40,
                  height: 127,
                  borderWidth: selectedSubSlotIndex === -1 ? 2 : 1,
                  borderColor:
                    selectedSubSlotIndex === -1
                      ? isRightButtonEnabled === true ?
                       Colors.PRIMARY_COLOR : Colors.SECONDARY_COLOR
                      : Colors.NOTIFICATION_TITLE_COLOR,
                  borderRadius: 8,
                  backgroundColor:
                    selectedSubSlotIndex === -1
                      ? Colors.SECONDARY_COLOR
                      : Colors.WHITE_COLOR,
                  marginTop: 20,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                onPress={() => systemGeneratedViewOnPress()}>
                {isLoading ===true || showEmptyComponent ===true ? (
                  <SuggestedTimeLoader />
                ) : (isLoading ===false && showEmptyComponent ===false?
                  <Text
                    style={{
                      fontFamily: Fonts.Gibson_Regular,
                      fontSize: 14,
                      textAlign: 'center',
                      color:
                        selectedSubSlotIndex === -1
                          ? Colors.WHITE_COLOR
                          : Colors.INACTIVE_BOTTOM_BAR_COLOR,
                      lineHeight: 25,
                    }}>
                    {t(Translations.THE_BEST_SUGGESTED_TIME)}
                    {'\n'}
                    {t(Translations.FOR_THE_CONSULTATION_IS)}
                  </Text>
                  :<View/>
                )}

                {isLoading ===true || showEmptyComponent ===true  ? (
                  <ConsultantTextLoader />
                ) : (isLoading ===false && showEmptyComponent ===false?
                  <View style={{flexDirection: 'row', marginTop: 15}}>
                    <Image
                      source={Images.ALARM_CLOCK_ICON}
                      style={{
                        height: 14,
                        width: 14,
                        marginRight: 4,
                        marginTop: 0,
                        tintColor:
                          selectedSubSlotIndex === -1
                            ? Colors.WHITE_COLOR
                            : Colors.INACTIVE_BOTTOM_BAR_COLOR,
                      }}
                    />
                    <Text
                      style={{
                        fontFamily: Fonts.Gibson_SemiBold,
                        fontSize: 14,
                        textAlign: 'center',
                        color:
                          selectedSubSlotIndex === -1
                            ? Colors.WHITE_COLOR
                            : Colors.INACTIVE_BOTTOM_BAR_COLOR,
                      }}>
                      {expectedTimeOfServing !== undefined
                        ? Utilities.getUtcToLocalWithFormat(
                            expectedTimeOfServing?.systemGeneratedTime
                              ?.expectedTimeOfServing,
                            Utilities.isBusiness24HrTimeFormat()
                              ? 'HH:mm'
                              : 'hh:mm A',
                          )
                        : 'N/A'}
                    </Text>
                  </View>
                  :<View/>
                )}

                <View
                  style={{
                    top: 58,
                    left: 16,
                    width: 12,
                    height: 12,
                    borderWidth: 1,
                    borderRadius: 6,
                    position: 'absolute',
                    backgroundColor:Colors.WHITE_COLOR,
                    borderColor: Colors.NOTIFICATION_TITLE_COLOR,
                  }}
                />
              </TouchableOpacity>
            ) : null}

           {/* OR VIEW */}
           {isLoading  ?
              (
              <View style={{marginTop: 60, flexDirection: 'row'}}>
                <View
                  style={{
                    height: 1,
                    width: '45%',
                    backgroundColor: Colors.TEXT_GREY_COLOR_9B,
                  }}
                />
                <Text
                  style={{
                    fontSize: 14,
                    marginTop: -8,
                    marginLeft: 12,
                    marginRight: 12,
                    fontFamily: Fonts.Gibson_SemiBold,
                    color: Colors.QUEUE_LIST_DAY_COLOR,
                  }}>
                  {t(Translations.OR)}
                </Text>
                <View
                  style={{
                    height: 1,
                    width: '50%',
                    backgroundColor: Colors.TEXT_GREY_COLOR_9B,
                  }}
                />
              </View>
            ) : null}

            {/* CHOOSE TIME LABEL */}
            {isLoading ?
         (
              <Text
                style={{
                  fontSize: 14,
                  marginTop: 30,
                  marginLeft: 40,
                  lineHeight: 20,
                  marginRight: 40,
                  textAlign: 'left',
                  fontFamily: Fonts.Gibson_Regular,
                  color: Colors.PRIMARY_TEXT_COLOR,
                }}>
                {t(Translations.CHOOSE_A)}{' '}
                <Text
                  style={{
                    fontFamily: Fonts.Gibson_SemiBold,
                    color: Colors.PRIMARY_COLOR,
                    fontSize: 14,
                  }}>
                  {t(Translations.TIME)}{' '}
                </Text>
                {t(Translations.FROM_THE_BELOW_TIME_INTERVALS_FOR_CONSULTATION)}
              </Text>
            ) : null}

            <FlatList
              contentContainerStyle={{
                paddingBottom: 85,
              }}
              showsVerticalScrollIndicator={false}
              data={isLoading ? dummyNotArrivedListData :!selectedDayIsHoliday?
                 queueSlotList: QueueEmptyComponent}
              refreshing={isRefreshNeeded}
              keyboardShouldPersistTaps="handled"
              renderItem={renderItem}
              keyExtractor={(item, index) =>
                item._id ? item._id.toString() : index.toString()
              }
              ListEmptyComponent={
                 Globals?.SHARED_VALUES?.SELECTED_SERVING_USER_INFO?.availability==='NOTAVAILABLE'?<NotAvailableEmptyComponent/>:
                QueueEmptyComponent
              }
            />
          </ScrollView>
          }
        </View>
      </KeyboardAvoidingView>
    </>
  );
};

export default React.memo(QueueSlotList);

const styles = StyleSheet.create({});
