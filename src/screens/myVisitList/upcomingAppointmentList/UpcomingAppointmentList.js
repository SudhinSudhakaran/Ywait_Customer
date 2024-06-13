import React, {useState, useEffect, useRef} from 'react';
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
import RBSheet from 'react-native-raw-bottom-sheet';
import APIConnections from '../../../helpers/apiManager/APIConnections';
import {GetImage} from '../../shared/getImage/GetImage';
import UpcomingDetailsPopUp from '../../upcomingDetails/UpcomingDetailsPopUp';
import {t} from 'i18next';

const UpcomingAppointmentList = () => {
  const layout = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [upcomingList, setUpcomingList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaginating, setIsPaginating] = useState(false);
  const [isPageEnded, setIsPageEnded] = useState(false);
  const [pageNo, setPageNo] = useState(1);

  const upcomingDetailsRef = useRef();

  const dummyUpcomingListData = [
    {
      id: '1',
      firstName: 'neha',
      lastName: 'kumari',
      addressLineOne: 'Mahathma Gandhi Road',
      phoneNumber: '9596964241',
      bookingId: '8859',
      lastVisit: '13 jan 2022',
      token: 'A161',
      date: '2022-01-14T08:25:35.240Z',
      name: 'Booking',
    },
    {
      id: '2',
      firstName: 'Neha',
      lastName: 'Kumari',
      addressLineOne: 'Mahathma Gandhi Road',
      phoneNumber: '9596964241',
      bookingId: '8859',
      lastVisit: 'No Visit',
      token: 'A161',
      date: '2022-01-14T08:25:35.240Z',
      name: 'Booking',
    },
    {
      id: '3',
      firstName: 'Neha',
      lastName: 'Kumari',
      addressLineOne: 'Mahathma Gandhi Road',
      phoneNumber: '9596964241',
      bookingId: 'Undefined',
      lastVisit: '13 jan 2022',
      token: 'A161',
      date: '2022-01-14T08:25:35.240Z',
      name: 'Booking',
    },
    {
      id: '4',
      firstName: 'Neha',
      lastName: 'Kumari',
      addressLineOne: 'Mahathma Gandhi Road',
      phoneNumber: '9596964241',
      bookingId: '8859',
      lastVisit: '13 jan 2022',
      token: 'A161',
      date: '2022-01-14T08:25:35.240Z',
      name: 'Booking',
    },
    {
      id: '5',
      firstName: 'Neha',
      lastName: 'Kumari',
      addressLineOne: 'Mahathma Gandhi Road',
      phoneNumber: '9596964241',
      bookingId: '8859',
      lastVisit: '13 jan 2022',
      token: 'A161',
      date: '2022-01-14T08:25:35.240Z',
      name: 'Booking',
    },
    {
      id: '6',
      firstName: 'Neha',
      lastName: 'Kumari',
      addressLineOne: 'Mahathma Gandhi Road',
      phoneNumber: '9596964241',
      bookingId: '8859',
      lastVisit: '13 jan 2022',
      token: 'A161',
      date: '2022-01-14T08:25:35.240Z',
      name: 'Booking',
    },
    {
      id: '7',
      firstName: 'Neha',
      lastName: 'Kumari',
      addressLineOne: 'Mahathma Gandhi Road',
      phoneNumber: '9596964241',
      bookingId: '8859',
      lastVisit: '13 jan 2022',
      token: 'A161',
      date: '2022-01-14T08:25:35.240Z',
      name: 'Booking',
    },
    {
      id: '8',
      firstName: 'Neha',
      lastName: 'Kumari',
      addressLineOne: 'Mahathma Gandhi Road',
      phoneNumber: '9596964241',
      bookingId: '8859',
      lastVisit: '13 jan 2022',
      token: 'A161',
      date: '2022-01-14T08:25:35.240Z',
      name: 'Booking',
    },
    {
      id: '9',
      firstName: 'Neha',
      lastName: 'Kumari',
      addressLineOne: 'Mahathma Gandhi Road',
      phoneNumber: '9596964241',
      bookingId: '8859',
      lastVisit: '13 jan 2022',
      token: 'A161',
      date: '2022-01-14T08:25:35.240Z',
      name: 'Booking',
    },
    {
      id: '10',
      firstName: 'Neha',
      lastName: 'Kumari',
      addressLineOne: 'Mahathma Gandhi Road',
      phoneNumber: '9596964241',
      bookingId: '8859',
      lastVisit: '13 jan 2022',
      token: 'A161',
      date: '2022-01-14T08:25:35.240Z',
      name: 'Booking',
    },
  ];
  useEffect(() => {
    setIsLoading(true);
    setPageNo(1);
    setIsPageEnded(false);
    getUpcomingList(true, 1);
  }, []);
  //Shimmer loader for the flatList
  const ListLoader = props => (
    <ContentLoader    transform={[{scaleX: I18nManager.isRTL ? -1 : 1}]}
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
      <Rect x="300" y="20" rx="0" ry="0" width="80" height="10" />
      <Rect x="300" y="60" rx="0" ry="0" width="80" height="10" />
      <Rect x="10" y="10" rx="20" ry="20" width="40" height="40" />
    </ContentLoader>
  );
  /**
   * Purpose: Pagination loader component
   * Created/Modified By: Jenson
   * Created/Modified Date: 27 Dec 2021
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
        <ActivityIndicator color={Colors.PRIMARY_COLOR} size="small" />
      </View>
    );
  };
  /**
   * Purpose: list on end reached component
   * Created/Modified By: Jenson
   * Created/Modified Date: 27 Dec 2021
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
      getUpcomingList(false, newPageNo);
    }
  };
  /**
             * Purpose: List empty component
             * Created/Modified By: Sudhin Sudhakaran
             * Created/Modified Date: 11 Oct 2021
             * Steps:
                 1.Return the component when list is empty
         */
  const upcomingListDataEmptyComponent = () => {
    return (
      <View
        style={{
          alignSelf: 'center',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 120,
        }}>
        <LottieView
          style={{
            width: DisplayUtils.setWidth(30),
            height: DisplayUtils.setWidth(30),
          }}
          source={Images.LOTTIE_DATE_CALENDAR_ANIMATION}
          autoPlay
          loop
          colorFilters={[
            {
              keypath: 'calendar.x',
              color: Colors.PRIMARY_COLOR,
            },
            {
              keypath: 'calendar.x 2',
              color: Colors.PRIMARY_COLOR,
            },
            {
              keypath: 'calendar.x 3',
              color: Colors.PRIMARY_COLOR,
            },
            {
              keypath: 'calendar.tabs',
              color: Colors.SECONDARY_COLOR,
            },
            {
              keypath: 'calendar.tabs.Rectangle 2',
              color: Colors.SECONDARY_COLOR,
            },
            {
              keypath: 'calendar.page Comp 1.page.Shape 1.Stroke 1',
              color: Colors.SECONDARY_COLOR,
            },
          ]}
        />

        <Text
          style={{
            alignSelf: 'center',
            color: Colors.PRIMARY_TEXT_COLOR,
            fontFamily: Fonts.Gibson_Regular,
            fontSize: 14,
            marginTop: 20,
          }}>
        {t(Translations.NO_APPOINTMENTS_RIGHT_NOW)}
        </Text>
        <Text
          style={{
            alignSelf: 'center',
            color: Colors.PRIMARY_TEXT_COLOR,
            fontFamily: Fonts.Gibson_Regular,
            fontSize: 10,
            marginTop: 12,
          }}>
          <Text
            style={{
              alignSelf: 'center',
              color: Colors.SECONDARY_COLOR,
              fontFamily: Fonts.Gibson_Regular,
              fontSize: 10,
              marginTop: 12,
            }}>
       {t(Translations.Y_WAIT)}
          </Text>{' '}
          {t(Translations.FIND_YOUR_SPECIALIST_NOW)}
        </Text>
      </View>
    );
  };

  //API Calls
  /**
            *
            * Purpose: Get user details
            * Created/Modified By: Jenson
            * Created/Modified Date: 21 Jan 2022
            * Steps:
                1.fetch business details from API and append to state variable
     */
  const getUpcomingList = (isLoaderRequired, pageNumber) => {
    if (isLoaderRequired) {
      setIsLoading(true);
    }
    DataManager.getUpcomingList(pageNumber).then(
      ([isSuccess, message, data]) => {
        if (isSuccess === true) {
          if (data !== undefined && data !== null) {
            if (pageNumber !== 1) {
              if (data.objects.length === 0) {
                console.log('END FOUND');
                setIsPageEnded(true);
              } else {
                //Appending data
                //setSearchList(...searchList, ...data.data.objects)
                setUpcomingList(upcomingList => {
                  return [...upcomingList, ...data.objects];
                });
              }
            } else {
              if (data.objects.length > 0) {
                //Animate intro cells
              }
              setUpcomingList(data.objects);
            }
          } else {
            setIsLoading(false);
          }
        } else {
          Utilities.showToast(t(Translations.FAILED), message, 'error', 'bottom');
          setIsLoading(false);
        }
        setIsLoading(false);
        setIsPaginating(false);
      },
    );
  };
  const onPresCell = item => {
    if (item?.name === 'Booking') {
      Globals.SHARED_VALUES.SELECTED_APPOINTMENT_TYPE = 'booking';
    } else {
      Globals.SHARED_VALUES.SELECTED_APPOINTMENT_TYPE = 'queue';
    }
    Globals.SHARED_VALUES.SELECTED_APPOINTMENT_ID = item._id;
    upcomingDetailsRef.current.open();
  };
  /**
          * Purpose:Render function of flat list
          * Created/Modified By: Sudhin Sudhakaran
          * Created/Modified Date: 8 Oct 2021
          * Steps:
              1.pass the data from api to customer details child component
      */
  const renderItem = ({item, index}) => {
    return <UpcomingDataCell item={item} index={index} />;
  };

  const UpcomingDataCell = ({item}) => {
    var departmentName = '';
    var showDepartmentLabel = false;
    var time = '';
    var highlightTimeText = '';
    var date = '';
    var highlightDate = '';
    var etsTime = '';
    var etsHighLightTime = '';

    if (item?.servingUser_id?.department_id?.role !== undefined) {
      departmentName = item?.servingUser_id?.department_id?.role;
      showDepartmentLabel = true;
    }
    //
    if (Globals.BUSINESS_DETAILS?.businessType === 'multiple-consultant') {
      if (item?.servingUser_id?.designationInfo?.designation !== undefined) {
        departmentName = item?.servingUser_id?.designationInfo?.designation;
        showDepartmentLabel = true;
      }
    }
    if (Utilities.isBusiness24HrTimeFormat()) {
      time = Utilities.getUtcToLocalWithFormat(item?.dateFrom, 'HH:MM');
      highlightTimeText = '';
    } else {
      time = Utilities.getUtcToLocalWithFormat(item?.dateFrom, 'hh:mm');
      highlightTimeText = Utilities.getUtcToLocalWithFormat(
        item?.dateFrom,
        ' A',
      );
    }
    highlightDate = Utilities.getUtcToLocalWithFormat(item?.dateFrom, 'DD ');
    date = Utilities.getUtcToLocalWithFormat(item?.dateFrom, 'MMM YYYY');

    if (item.status === 'ARRIVED') {
      if (Utilities.isBusiness24HrTimeFormat()) {
        etsTime =
          'ETS: ' +
          Utilities.getUtcToLocalWithFormat(item?.estimatedTime, 'HH:MM');
        etsHighLightTime = '';
      } else {
        etsTime =
          'ETS: ' +
          Utilities.getUtcToLocalWithFormat(item?.estimatedTime, 'hh:mm');
        etsHighLightTime = Utilities.getUtcToLocalWithFormat(
          item?.estimatedTime,
          ' A',
        );
      }
    }

    return isLoading ? (
      <ListLoader />
    ) : (
      <TouchableOpacity
        style={{
          borderTopWidth: 0.7,
          borderTopColor: Colors.LINE_SEPARATOR_COLOR,
          borderBottomWidth: 0.7,
          borderBottomColor: Colors.LINE_SEPARATOR_COLOR,
          flexDirection: 'row',
          backgroundColor: Colors.WHITE_COLOR,
          paddingTop: 10,
        }}
        onPress={() => onPresCell(item)}>
        {/* IMAGE */}
        <View
          style={{
            marginHorizontal: 12,
            marginTop: showDepartmentLabel ? 15 : 5,
          }}>
          <GetImage
            style={{
              width: 50,
              height: 50,
              borderRadius: 50 / 2,
              borderWidth: 1,
              borderColor: Colors.PRIMARY_COLOR,
            }}
            fullName={(item?.servingUser_id !== undefined
              ? item?.servingUser_id?.fullName || 'N/A'
              : Globals.BUSINESS_DETAILS?.name || Strings.APP_NAME
            ).trim()}
            alphabetColor={Colors.SECONDARY_COLOR}
            url={
              item?.servingUser_id !== undefined
                ? item?.servingUser_id?.image
                : Globals.BUSINESS_DETAILS?.image
            }
          />
        </View>

        <View style={{marginBottom: 20, flex: 1}}>
          {/* NAME */}
          <Text
            style={{
              fontSize: 14,
              fontFamily: Fonts.Gibson_SemiBold,
              color: Colors.PRIMARY_TEXT_COLOR,
              marginTop: 10,
              // paddingRight: 120,
              textAlign: 'left',
            }}
            numberOfLines={1}>
            {(item?.servingUser_id !== undefined
              ? item?.servingUser_id?.name || 'N/A'
              : Globals.BUSINESS_DETAILS?.name || Strings.APP_NAME
            ).trim()}
          </Text>
          {/* DEPARTMENT */}
          {showDepartmentLabel ? (
            <View style={{marginTop: 8, flexDirection: 'row', marginRight: 10}}>
              <Text
                style={{
                  color: Colors.LOCATION_TEXT_COLOR,
                  fontSize: 12,
                  fontFamily: Fonts.Gibson_Regular,
                }}
                numberOfLines={2}>
                {departmentName}
              </Text>
            </View>
          ) : null}

          <View style={{marginTop: 10, flexDirection: 'row', marginRight: 10}}>
            {/* TIME*/}
            <Image
              source={Images.CLOCK_CIRCULAR_ICON}
              style={{
                height: 14,
                width: 14,
                tintColor: Colors.SECONDARY_COLOR,
              }}
            />
            <Text
              style={{
                color: Colors.PRIMARY_TEXT_COLOR,
                fontSize: 14,
                fontFamily: Fonts.Gibson_Regular,
                marginLeft: 6,
              }}
              numberOfLines={2}>
              {time}{' '}
              <Text
                style={{
                  color: Colors.PRIMARY_TEXT_COLOR,
                  fontSize: 14,
                  fontFamily: Fonts.Gibson_SemiBold,
                }}
                numberOfLines={2}>
                {highlightTimeText}
              </Text>
            </Text>

            {/* DATE*/}
            <Image
              source={Images.CALENDER_SMALL_ICON}
              style={{
                height: 14,
                width: 14,
                tintColor: Colors.SECONDARY_COLOR,
                marginLeft: 20,
              }}
            />
            <Text
              style={{
                color: Colors.PRIMARY_TEXT_COLOR,
                fontSize: 14,
                fontFamily: Fonts.Gibson_SemiBold,
                marginLeft: 6,
              }}
              numberOfLines={2}>
              {highlightDate}{' '}
              <Text
                style={{
                  color: Colors.PRIMARY_TEXT_COLOR,
                  fontSize: 14,
                  fontFamily: Fonts.Gibson_Regular,
                }}
                numberOfLines={2}>
                {date}
              </Text>
            </Text>
          </View>
          {/* ETS */}
          {item?.status === 'ARRIVED' ? (
            <View
              style={{marginTop: 10, flexDirection: 'row', marginRight: 10}}>
              {/* TIME*/}
              <Image
                source={Images.ETS_ICON}
                style={{
                  height: 14,
                  width: 14,
                  tintColor: Colors.SECONDARY_COLOR,
                }}
              />
              <Text
                style={{
                  color: Colors.PRIMARY_TEXT_COLOR,
                  fontSize: 14,
                  fontFamily: Fonts.Gibson_Regular,
                  marginLeft: 6,
                }}
                numberOfLines={2}>
                {etsTime}
              
              <Text
                style={{
                  color: Colors.PRIMARY_TEXT_COLOR,
                  fontSize: 14,
                  fontFamily: Fonts.Gibson_SemiBold,
                }}
                numberOfLines={2}>
                {etsHighLightTime}
              </Text>
              </Text>
              {/* QUEUE POSITION*/}
              <Image
                source={Images.QUEUE_POSITION_ICON}
                style={{
                  height: 14,
                  width: 14,
                  tintColor: Colors.SECONDARY_COLOR,
                  marginLeft: 20,
                }}
              />
              <Text
                style={{
                  color: Colors.PRIMARY_TEXT_COLOR,
                  fontSize: 14,
                  fontFamily: Fonts.Gibson_Regular,
                  marginLeft: 6,
                }}
                numberOfLines={2}>
                {t(Translations.QUEUE)}:
             
              <Text
                style={{
                  color: Colors.PRIMARY_TEXT_COLOR,
                  fontSize: 14,
                  fontFamily: Fonts.Gibson_SemiBold,
                }}
                numberOfLines={2}>
                {item?.queueIndex}
              </Text>
              </Text>
            </View>
          ) : null}
        </View>

        <View
          style={{
            borderWidth: 1,
            borderColor: Colors.SECONDARY_COLOR,
            position: 'absolute',
            bottom: 20,
            right: 10,
          }}>
          <Text
            style={{
              fontFamily: Fonts.Gibson_Regular,
              fontSize: 10,
              color: Colors.SECONDARY_COLOR,
              marginHorizontal: 5,
              marginVertical: 2.5,
            }}>
            {item.name === 'Booking'
              ? t(Translations.BOOKING)?.toUpperCase()
              : t(Translations.QUEUE)?.toUpperCase()}
          </Text>
        </View>
      </TouchableOpacity>
    );
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

  //final return
  return (
    <>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        style={{flex: 1, backgroundColor: Colors.BACKGROUND_COLOR}}>
        <View
          style={{
            flex: 1,
            backgroundColor: Colors.BACKGROUND_COLOR,
          }}>
          <GetUpcomingDetailsPopUp />
          <FlatList
            contentContainerStyle={{
              paddingBottom: 85,

              borderTopWidth: 0.7,
              borderTopColor: Colors.LINE_SEPARATOR_COLOR,
            }}
            data={isLoading ? dummyUpcomingListData : upcomingList}
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
              isLoading ? dummyUpcomingListData : upcomingListDataEmptyComponent
            }
            ListFooterComponent={isPaginating ? paginationComponent : null}
          />
        </View>
      </KeyboardAvoidingView>
    </>
  );
};

export default React.memo(UpcomingAppointmentList);

const styles = StyleSheet.create({});
