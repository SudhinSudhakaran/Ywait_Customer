import React, {useState, useEffect, useRef} from 'react';
import {
  StatusBar,
  Text,
  View,
  Image,
  TouchableOpacity,
  useWindowDimensions,
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  KeyboardAvoidingView,
  I18nManager,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/core';
import ContentLoader, {Rect} from 'react-content-loader/native';
import {useHeaderHeight} from '@react-navigation/elements';
import {Colors, Fonts, Globals, Images, Translations} from '../../constants';
import LoadingIndicator from '../shared/loadingIndicator/LoadingIndicator';
import DataManager from '../../helpers/apiManager/DataManager';
import Utilities from '../../helpers/utils/Utilities';
import DisplayUtils from '../../helpers/utils/DisplayUtils';
import LottieView from 'lottie-react-native';
import {GetImage} from '../shared/getImage/GetImage';
import {useFocusEffect} from '@react-navigation/core';
import moment from 'moment';
import APIConnections from '../../helpers/apiManager/APIConnections';
import RBSheet from 'react-native-raw-bottom-sheet';
import UpcomingDetailsPopUp from '../upcomingDetails/UpcomingDetailsPopUp';
import {t} from 'i18next';
const NotificationsListScreen = () => {
  const layout = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoaderLoading, setIsLoaderLoading] = useState(false);
  const [isPaginating, setIsPaginating] = useState(false);
  const [isPageEnded, setIsPageEnded] = useState(false);
  const [pageNo, setPageNo] = useState(1);
  const [notificationList, setNotificationList] = useState([]);
  // const [loadImage, setLoadImage] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [unReadCount, setUnReadCount] = useState(0);
  const upcomingDetailsRef = useRef();
  const searchInputRef = useRef();

  const bookingConfirmationRef = useRef();
  const queueConfirmationRef = useRef();
  const bookingPaymentConfirmationRef = useRef();
  const queuePaymentConfirmationRef = useRef();
  const bookingSuccessRef = useRef();
  const queueSuccessRef = useRef();
  const bookingFailureRef = useRef();
  const queueFailureRef = useRef();
  const dummyCustomerList = [
    {
      id: '1',
      firstName: 'neha',
      lastName: 'kumari',
      addressLineOne: 'Mahathma Gandhi Road',
      phoneNumber: '9596964241',
      hospitalID: '8859',
      lastVisit: '13 jan 2022',
    },
    {
      id: '2',
      firstName: 'Neha',
      lastName: 'Kumari',
      addressLineOne: 'Mahathma Gandhi Road',
      phoneNumber: '9596964241',
      hospitalID: '8859',
      lastVisit: 'No Visit',
    },
    {
      id: '3',
      firstName: 'Neha',
      lastName: 'Kumari',
      addressLineOne: 'Mahathma Gandhi Road',
      phoneNumber: '9596964241',
      hospitalID: 'Undefined',
      lastVisit: '13 jan 2022',
    },
    {
      id: '4',
      firstName: 'Neha',
      lastName: 'Kumari',
      addressLineOne: 'Mahathma Gandhi Road',
      phoneNumber: '9596964241',
      hospitalID: '8859',
      lastVisit: '13 jan 2022',
    },
    {
      id: '5',
      firstName: 'Neha',
      lastName: 'Kumari',
      addressLineOne: 'Mahathma Gandhi Road',
      phoneNumber: '9596964241',
      hospitalID: '8859',
      lastVisit: '13 jan 2022',
    },
    {
      id: '6',
      firstName: 'Neha',
      lastName: 'Kumari',
      addressLineOne: 'Mahathma Gandhi Road',
      phoneNumber: '9596964241',
      hospitalID: '8859',
      lastVisit: '13 jan 2022',
    },
    {
      id: '7',
      firstName: 'Neha',
      lastName: 'Kumari',
      addressLineOne: 'Mahathma Gandhi Road',
      phoneNumber: '9596964241',
      hospitalID: '8859',
      lastVisit: '13 jan 2022',
    },
    {
      id: '8',
      firstName: 'Neha',
      lastName: 'Kumari',
      addressLineOne: 'Mahathma Gandhi Road',
      phoneNumber: '9596964241',
      hospitalID: '8859',
      lastVisit: '13 jan 2022',
    },
    {
      id: '9',
      firstName: 'Neha',
      lastName: 'Kumari',
      addressLineOne: 'Mahathma Gandhi Road',
      phoneNumber: '9596964241',
      hospitalID: '8859',
      lastVisit: '13 jan 2022',
    },
    {
      id: '10',
      firstName: 'Neha',
      lastName: 'Kumari',
      addressLineOne: 'Mahathma Gandhi Road',
      phoneNumber: '9596964241',
      hospitalID: '8859',
      lastVisit: '13 jan 2022',
    },
  ];

  useFocusEffect(
    React.useCallback(() => {
      console.log(
        'Globals.SELECTED_CUSTOMER_INFO',
        Globals.SELECTED_CUSTOMER_INFO,
      );
      setIsLoading(true);
      setPageNo(1);
      setIsPageEnded(false);
      performGetNotificationList(true, 1);
      return () => {
        Globals.SELECTED_CUSTOMER_INFO = {};
        Globals.SELECTED_DATE_FROM = '';
        Globals.FAILURE_ERROR_MESSAGE = '';
        Globals.SELECTED_PAYMENT_INFO = {};
      };
    }, []),
  );
  const onRefresh = () => {
    //set isRefreshing to true
    setRefresh(true);
    setIsLoading(true);
    setPageNo(1);
    setIsPageEnded(false);
    performGetNotificationList(false, 1);
    // and set isRefreshing to false at the end of your callApiMethod()
  };

  const notificationCellPressAction = selectedNotificationItem => {
    console.log('Selected notification item', selectedNotificationItem);
    let _selectedNotificationId = selectedNotificationItem?.booking_id
      ? selectedNotificationItem?.booking_id._id
      : selectedNotificationItem?.waitlist_id
      ? selectedNotificationItem?.waitlist_id._id
      : '';
    let _notificationType = selectedNotificationItem?.booking_id
      ? 'Booking'
      : 'Queue';
      console.log(' _selectedNotificationId >', _selectedNotificationId);

    if (
      _selectedNotificationId !== undefined &&
      _selectedNotificationId !== ''
    ) {
      
      if (
        selectedNotificationItem.type === 'BOOKING-DELAY' ||
        selectedNotificationItem.type === 'WAITLIST-DELAY' ||
        selectedNotificationItem.type === 'QUEUE-DELAY'
      ) {
        console.log('item type', selectedNotificationItem.type);
        console.log('Navigation action');

        Globals.SHARED_VALUES.SELECTED_APPOINTMENT_TYPE = _notificationType;
        Globals.SHARED_VALUES.SELECTED_APPOINTMENT_ID = _selectedNotificationId;
        upcomingDetailsRef.current.open();
      } else if (
        selectedNotificationItem.type === 'SCHEDULE-NEXT-VISIT-REMINDER' ||
        selectedNotificationItem.type === 'NEXT-VISIT-REMINDER-BOOKING' ||
        selectedNotificationItem.type === 'NEXT-VISIT-REMINDER-QUEUE'
      ) {
        console.log('navigation stat');
        navigation.navigate('PreviousAppointmentDetails', {
          selectedAppointment_id: _selectedNotificationId,
          selectedAppointmentType: _notificationType,
          isFrom: 'NOTIFICATION_LIST',
        });
      }
      selectedNotificationItem.readStatus === false
        ? updateNotificationItem(selectedNotificationItem, true)
        : null;
    }
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

  //Shimmer loader for the flatList
  const ListLoader = props => (
    <ContentLoader
      transform={[{scaleX: I18nManager.isRTL ? -1 : 1}]}
      speed={1.5}
      width={'100%'}
      height={80}
      //viewBox="0 0 320 "
      backgroundColor="#dadada"
      foregroundColor="#eee"
      animate={true}
      {...props}>
      <Rect x="60" y="20" rx="5" ry="5" width="120" height="8" />
      <Rect x="60" y="40" rx="5" ry="5" width="230" height="8" />
      <Rect x="60" y="60" rx="5" ry="5" width="180" height="8" />

      <Rect x="10" y="30" rx="20" ry="20" width="40" height="40" />
    </ContentLoader>
  );
  /**
   * Purpose: list on end reached component
   * Created/Modified By: Vijn
   * Created/Modified Date: 10 Aug 2021
   * Steps:
   */
  const listOnEndReach = () => {
    console.log(
      `Detected on end reach isPaginating: ${isPaginating}, isPageEnded: ${isPageEnded}`,
    );

    if (!isPageEnded && !isLoading && !isPaginating) {
      let newPageNo = pageNo + 1;
      console.log('PageNo:', newPageNo);
      if (newPageNo !== 1) {
        setIsPaginating(true);
      }
      console.log('setIndicator:', isPaginating);
      setPageNo(newPageNo);
      performGetNotificationList(false, newPageNo);
    }
  };
  /**
            * Purpose: List empty component
            * Created/Modified By: Sudhin Sudhakaran
            * Created/Modified Date: 11 Oct 2021
            * Steps:
                1.Return the component when list is empty
        */
  const NotificationEmptyComponent = () => {
    return (
      <View
        style={{
          //   width: Display.setWidth(60),
          //   height: Display.setHeight(30),
          alignSelf: 'center',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 80,
          
        }}>
        <LottieView
          style={{width: DisplayUtils.setWidth(50)}}
          source={Images.EMPTY_NOTIFICATION_LIST}
          autoPlay
          loop
          colorFilters={[
            {
              keypath: 'No-Notification 2.star-2 Outlines.Group 1',
              color: Colors.SECONDARY_COLOR,
            },
            {
              keypath: 'No-Notification 2.star-1 Outlines.Group 1',
              color: Colors.SECONDARY_COLOR,
            },
            {
              keypath: 'No-Notification 2.buble-2 Outlines.Group 1',
              color: Colors.SECONDARY_COLOR,
            },
            {
              keypath: 'No-Notification 2.buble-2 Outlines.Group 2',
              color: Colors.SECONDARY_COLOR,
            },
            {
              keypath: 'No-Notification 2.buble1 Outlines.Group 1',
              color: Colors.SECONDARY_COLOR,
            },
            {
              keypath: 'No-Notification 2.buble1 Outlines.Group 2',
              color: Colors.SECONDARY_COLOR,
            },
            {
              keypath: 'No-Notification 2.buble1 Outlines.Group 3',
              color: Colors.SECONDARY_COLOR,
            },
            {
              keypath: 'No-Notification 2.bell-sleep3 Outlines.Group 1',
              color: Colors.SECONDARY_COLOR,
            },
            {
              keypath: 'No-Notification 2.bell-sleep2 Outlines.Group 1',
              color: Colors.SECONDARY_COLOR,
            },
            {
              keypath: 'No-Notification 2.bell-sleep Outlines.Group 1',
              color: Colors.SECONDARY_COLOR,
            },
            {
              keypath:
                'No-Notification 2.bell-dialog Outlines.Group 1.Stroke 1',
              color: Colors.SECONDARY_COLOR,
            },
            {
              keypath: 'No-Notification 2.bell-eyes Outlines.Group 1',
              color: Colors.SECONDARY_COLOR,
            },
            {
              keypath: 'No-Notification 2.bell-eyes Outlines.Group 2',
              color: Colors.SECONDARY_COLOR,
            },
            {
              keypath: 'No-Notification 2.bell-mouth Outlines.Group 1',
              color: Colors.SECONDARY_COLOR,
            },
            {
              keypath: 'No-Notification 2.bell-home Outlines.Group 1',
              color: Colors.SECONDARY_COLOR,
            },
            {
              keypath: 'No-Notification 2.bell-home Outlines.Group 2.Stroke 1',
              color: Colors.SECONDARY_COLOR,
            },
            {
              keypath: 'No-Notification 2.bell-home Outlines.Group 3',
              color: Colors.SECONDARY_COLOR,
            },
            {
              keypath: 'No-Notification 2.bell Outlines.Group 1',
              color: Colors.SECONDARY_COLOR,
            },
          ]}
        />

        <Text
          style={{
            alignSelf: 'center',
            color: Colors.ERROR_RED_COLOR,
            fontFamily: Fonts.Gibson_SemiBold,
            fontSize: 20,
            marginTop: 20,
          }}>
          {t(Translations.HEY_NOTHING_HERE)}
        </Text>
        <Text
          style={{
            alignSelf: 'center',
            color: Colors.PRIMARY_TEXT_COLOR,
            fontFamily: Fonts.Gibson_Regular,
            fontSize: 14,
            marginTop: 20,
          }}>
          {t(Translations.YOU_HAVE_NO_NOTIFICATIONS)}
        </Text>
      </View>
    );
  };
  /**
   * Purpose: pagination loader component
   * Created/Modified By: Vijin
   * Created/Modified Date: 10 Nov 2021
   * Steps:
   */
  const paginationComponent = () => {
    return (
      <View
        style={{
          width: '100%',
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <ActivityIndicator
          style={{marginBottom: 20}}
          color={Colors.PRIMARY_COLOR}
          size="small"
        />
      </View>
    );
  };

  //API CALLS
  /**
              *
              * Purpose: Business listing
              * Created/Modified By: Jenson
              * Created/Modified Date: 27 Dec 2021
              * Steps:
                  1.fetch business list from API and append to state variable
      */

  const performGetNotificationList = (isLoaderRequired, pageNumber) => {
    if (isLoaderRequired) {
      // setIsLoading(true);
    }
    DataManager.getNotificationList(pageNumber).then(
      ([isSuccess, message, data]) => {
        if (isSuccess === true) {
          if (data !== undefined && data !== null) {
            if (pageNumber !== 1) {
              if (data.data.objects.length === 0) {
                console.log('END FOUND');
                setIsPageEnded(true);
              } else {
                //Appending data
                //setSearchList(...searchList, ...data.data.objects)
                setNotificationList(notificationList => {
                  return [...notificationList, ...data.data.objects];
                });
              }
            } else {
              setNotificationList(data.data.objects);
              console.log('data', data.metadata.unreadingCount);
              setUnReadCount(data.metadata.unreadingCount);
              Globals.UN_READ_NOTIFICATION_COUNT = data.metadata.unreadingCount;
            }
          } else {
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
        setIsLoading(false);
        setRefresh(false);
        setIsPaginating(false);
      },
    );
  };

  //API CALLS
  /**
            *
            * Purpose:Update notification item
            * Created/Modified By: Sudhin
            * Created/Modified Date: 1 feb 2022
            * Steps:
                1.pass the notification id
    */

  const updateNotificationItem = (selectedItem, apiCallNeed) => {
    console.log('updateNotificationItem called')
    const body = {
      [APIConnections.KEYS.READ_STATUS]: true,
      [APIConnections.KEYS.NOTIFICATION_ID]: selectedItem._id,
    };
    DataManager.performUpdateNotificationItem(body).then(
      ([isSuccess, message, data]) => {
        if (isSuccess === true) {
          if (data !== undefined && data !== null) {
            console.log('Consultant data', data);
            setUnReadCount(data.objects.unreadingCount);
            // setRefresh(true);
      setIsLoading(true);
      setPageNo(1);
      setIsPageEnded(false);
    performGetNotificationList(false, 1);
            Globals.UN_READ_NOTIFICATION_COUNT = data.objects.unreadingCount;
          } else {
            Utilities.showToast(
              t(Translations.FAILED),
              message,
              'error',
              'bottom',
            );
            setIsLoading(false);
            // setRefresh(false);
          }
        } else {
          Utilities.showToast(
            t(Translations.FAILED),
            message,
            'error',
            'bottom',
          );
          setIsLoading(false);
          // setRefresh(false);
        }
      },
    );
  };

  //API CALLS
  /**
            *
            * Purpose:Update notification List
            * Created/Modified By: Sudhin
            * Created/Modified Date: 1 feb 2022
            * Steps:
                1.pass the notification id
    */

  const updateNotificationList = () => {
    const body = {
      [APIConnections.KEYS.READ_STATUS]: true,
      [APIConnections.KEYS.CUSTOMER_ID]: Globals.USER_DETAILS._id,
    };
    DataManager.performUpdateNotificationList(body).then(
      ([isSuccess, message, data]) => {
        if (isSuccess === true) {
          if (data !== undefined && data !== null) {
            console.log('Consultant data', data);
            Globals.UN_READ_NOTIFICATION_COUNT = 0;
            performGetNotificationList(false, 1);
          } else {
            Utilities.showToast(
              t(Translations.FAILED),
              message,
              'error',
              'bottom',
            );
            setIsLoading(false);
            // setRefresh(false);
          }
        } else {
          Utilities.showToast(
            t(Translations.FAILED),
            message,
            'error',
            'bottom',
          );
          setIsLoading(false);
          // setRefresh(false);
        }
      },
    );
  };
  /**
         * Purpose:Render function of flat list
         * Created/Modified By: Sudhin Sudhakaran
         * Created/Modified Date: 8 Oct 2021
         * Steps:
             1.pass the data from api to customer details child component
     */
  const renderItem = ({item, index}) => {
    return <NotificationListDataCell item={item} index={index} />;
  };

  const NotificationListDataCell = ({item}) => {
    const fullName =
      (item?.booking_id
        ? item?.booking_id?.servingUser_id?.firstName
        : item?.waitlist_id
        ? item?.waitlist_id?.servingUser_id?.firstName
        : item?.reminder_id
        ? item?.reminder_id?.servingUser_id?.firstName
        : '') +
      ' ' +
      (item?.booking_id
        ? item?.booking_id?.servingUser_id?.lastName
        : item?.waitlist_id
        ? item?.waitlist_id?.servingUser_id?.lastName
        : item?.reminder_id
        ? item?.reminder_id?.servingUser_id?.lastName
        : '');
    const imgUrl = item?.booking_id
      ? item?.booking_id?.servingUser_id?.image
      : item?.waitlist_id
      ? item?.waitlist_id?.servingUser_id?.image
      : item?.reminder_id
      ? item?.reminder_id?.servingUser_id?.image
      : '';
    return isLoading ? (
      <ListLoader />
    ) : (
      <TouchableOpacity
        onPress={() => (isLoading ? null : notificationCellPressAction(item))}
        style={{
          borderTopWidth: 0.25,
          borderBottomWidth: 0.25,
          borderBottomColor: Colors.TAB_VIEW_LABEL_COLOR,
          borderTopColor: Colors.TAB_VIEW_LABEL_COLOR,
          flexDirection: 'row',
          backgroundColor: item.readStatus
            ? Colors.WHITE_COLOR
            : Colors.NOTIFICATION_BACKGROUND_COLOR,
        }}>
        <View style={{marginHorizontal: 12, marginTop: 10}}>
          <GetImage
            style={{
              marginTop: 10,
              marginLeft: 10,
              width: 42,
              height: 42,
              borderRadius: 42 / 2,
              borderWidth: 1,
              borderColor: Colors.SECONDARY_COLOR,
            }}
            fullName={fullName.trim()}
            url={imgUrl}
          />
        </View>
        <View
          style={{
            marginTop: 15,
            marginBottom: 15,
            width: DisplayUtils.setWidth(75),
          }}>
          <Text
            style={{
              fontFamily: Fonts.Gibson_Regular,
              color: Colors.NOTIFICATION_TITLE_COLOR,
              fontSize: 12,
              textAlign: 'left',
            }}>
            {item.title_eng}
          </Text>
          <Text
            style={{
              fontFamily: Fonts.Gibson_Regular,
              color: Colors.GREY_COLOR,
              fontSize: 12,
              marginTop: 5,
              textAlign: 'left',
            }}
            numberOfLines={2}>
            {item.message_eng}
          </Text>
          <Text
            style={{
              fontFamily: Fonts.Gibson_Light,
              color: Colors.LOCATION_TEXT_COLOR,
              fontSize: 11,
              marginTop: 5,
              textAlign: 'left',
            }}>
            {moment(item.date).fromNow()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  //final return
  return (
    <>
      <KeyboardAvoidingView
        keyboardVerticalOffset={useHeaderHeight()}
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        style={{flex: 1, backgroundColor: 'white'}}>
        <View
          style={{
            flex: 1,
            backgroundColor: Colors.WHITE_COLOR,
            paddingTop: insets.top,
            paddingLeft: insets.left,
            paddingRight: insets.right,
            paddingBottom: insets.bottom,
          }}>
          <StatusBar
            backgroundColor={Colors.BACKGROUND_COLOR}
            barStyle="dark-content"
          />
          <GetUpcomingDetailsPopUp />
          <LoadingIndicator visible={isLoaderLoading} />
          <View
            style={{
              backgroundColor: Colors.PRIMARY_WHITE,
              width: DisplayUtils.setWidth(100),
              height: 70,
            }}>
            <View
              style={{
                marginTop: 25,
                marginLeft: 20,
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}>
              <Text
                style={{
                  fontFamily: Fonts.Gibson_SemiBold,
                  color: Colors.PRIMARY_TEXT_COLOR,
                  fontSize: 18,
                }}>
                {t(Translations.NOTIFICATION)}
              </Text>
              <TouchableOpacity
                style={{justifyContent: 'center', marginRight: 20}}
                onPress={() => navigation.goBack()}>
                <Image
                  style={{
                    height: 18,
                    width: 18,
                    tintColor: Colors.LOCATION_TEXT_COLOR,
                  }}
                  source={Images.CLOSE_ICON}
                />
              </TouchableOpacity>
            </View>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-end',
              marginBottom: 16,
              justifyContent: 'flex-end',
            }}>
            {unReadCount <= 0 ? null : (
              <TouchableOpacity
                onPress={() => updateNotificationList()}
                style={{marginRight: 38}}>
                <Text
                  style={{
                    color: Colors.CUSTOMER_NAME_COLOR,
                    fontSize: 14,
                    fontFamily: Fonts.Gibson_Regular,
                  }}>
                  {t(Translations.MARK_ALL_AS_READ)}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          <FlatList
            contentContainerStyle={{
              paddingBottom: 55,
              //   borderTopWidth: 0.5,
              //   borderTopColor: Colors.GREY_COLOR,
            }}
            data={isLoading ? dummyCustomerList : notificationList}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            renderItem={renderItem}
            keyExtractor={(item, index) =>
              item._id ? item._id.toString() : index.toString()
            }
            onEndReachedThreshold={0.2}
            onEndReached={() => {
              listOnEndReach();
            }}
            ListEmptyComponent={
              isLoading ? dummyCustomerList : NotificationEmptyComponent
            }
            ListFooterComponent={isPaginating ? paginationComponent : null}
            refreshControl={
              <RefreshControl
                refreshing={refresh}
                onRefresh={onRefresh}
                colors={[Colors.PRIMARY_COLOR, Colors.SECONDARY_COLOR]}
              />
            }
          />
        </View>
      </KeyboardAvoidingView>
    </>
  );
};

export default React.memo(NotificationsListScreen);
