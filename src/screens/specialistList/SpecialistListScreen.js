import React, {useState, useEffect, useRef} from 'react';
import {
  StatusBar,
  Text,
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TextInput,
  I18nManager,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/core';
import {useHeaderHeight} from '@react-navigation/elements';
import ContentLoader, {Rect, Circle, Path} from 'react-content-loader/native';
import {
  Colors,
  Fonts,
  Globals,
  Images,
  Strings,
  Translations,
} from '../../constants';
import StorageManager from '../../helpers/storageManager/StorageManager';
import Utilities from '../../helpers/utils/Utilities';
import DisplayUtils from '../../helpers/utils/DisplayUtils';
import LottieView from 'lottie-react-native';
import {useFocusEffect} from '@react-navigation/core';
import DataManager from '../../helpers/apiManager/DataManager';
import APIConnections from '../../helpers/apiManager/APIConnections';
import {GetImage} from '../shared/getImage/GetImage';
import RBSheet from 'react-native-raw-bottom-sheet';
import DepartmentSelectionPopUp from './DepartmentSelectionPopup/DepartmentSelectionPopUp';
import {GuestUserAuthSource} from '../../helpers/enums/Enums';
import {t} from 'i18next';
import {useRoute} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {useDispatch} from 'react-redux';
import { setConsultantList } from '../../redux/slice/ConsultantListSlice';
const SpecialistListScreen = props => {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const {consultantlist} = useSelector(state => state.consultantlist);
  const [specialistList, setSpecialistList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPaginating, setIsPaginating] = useState(false);
  const [isPageEnded, setIsPageEnded] = useState(false);
  const [pageNo, setPageNo] = useState(1);
  const [showEmptyScreen, setShowEmptyScreen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedDepartmentInfo, setSelectedDepartmentInfo] = useState(
    Globals.SHARED_VALUES.SELECTED_DEPARTMENT_INFO || {},
  );
  // const [selectedServeUserTitle, setSelectedServeUserTitle] = useState({});

  const departmentSelectionRBSheetRef = useRef();

  // DUMMY DATA
  const DUMMY_DATA = [
    {
      id: '0',
      name: 'Demo1',
      type: 'single-consultant',
    },
    {
      id: '1',
      name: 'Demo2',
      type: 'single-consultant',
    },
    {
      id: '2',
      name: 'Demo3',
      type: 'single-consultant',
    },
    {
      id: '3',
      name: 'Demo4',
      type: 'single-consultant',
    },
    {
      id: '4',
      name: 'Demo1',
      type: 'single-consultant',
    },
    {
      id: '5',
      name: 'Demo2',
      type: 'single-consultant',
    },
    {
      id: '6',
      name: 'Demo3',
      type: 'single-consultant',
    },
    {
      id: '7',
      name: 'Demo4',
      type: 'single-consultant',
    },
  ];

  //Shimmer loader for the flatList
  const ListLoader = props => (
    <ContentLoader
      transform={[{scaleX: I18nManager.isRTL ? -1 : 1}]}
      speed={1.5}
      width={'100%'}
      height={60}
      //viewBox="0 0 320 "
      backgroundColor="#dadada"
      foregroundColor="#eee"
      animate={true}
      {...props}>
      <Rect x="25" y="11" rx="5" ry="5" width="220" height="13" />
      <Rect x="25" y="35" rx="5" ry="5" width="339" height="8" />
      <Rect x="0" y="55" rx="5" ry="5" width="571" height="1" />
    </ContentLoader>
  );

  useEffect(() => {
    if (Globals.SHARED_VALUES.IS_FROM_DASHBOARD_DEPARTMENT_VIEW_ALL === true) {
      const timer = setTimeout(() => {
        departmentSelectionRBSheetRef.current.open();
      }, 200);
      return () => clearTimeout(timer);
    } else {
      resetAndFetchSpecialists();
    }
  }, []);

  const resetAndFetchSpecialists = (
    departmentId = selectedDepartmentInfo?._id || '',
    __searchText = searchText,
  ) => {
    setShowEmptyScreen(true);
    setPageNo(1);
    setIsPageEnded(false);
    getSpecialistList(true, 1, departmentId, __searchText);
  };

  const searchButtonAction = () => {
    //search action
    resetAndFetchSpecialists();
  };

  const searchResetButtonAction = () => {
    //search action
    setSearchText('');
    resetAndFetchSpecialists(selectedDepartmentInfo?._id || '', '');
  };

  const noChoiceAction = () => {
    Globals.SHARED_VALUES.SELECTED_SERVING_USER_INFO = {};
    Globals.SHARED_VALUES.SELECTED_SERVING_USER_ID = null;
    Globals.SHARED_VALUES.SELECTED_SERVING_USER_ROLE_TEXT = '';
    Globals.SHARED_VALUES.IS_NO_CHOICE_SELECTED = true;

    if (
      Utilities.isServiceBasedBusiness() === true &&
      !(Globals.SHARED_VALUES.SELECTED_SERVICES_IDS?.length > 0)
    ) {
      //No services selected
      //Navigate to service selection
      navigation.navigate('ServiceListScreen');
    } else if (
      Utilities.isServiceBasedBusiness() === true &&
      Globals.SHARED_VALUES.IS_FORCE_SERVICE_SELECT_NEED === true
    ) {
      //Navigate to service selection
      navigation.navigate('ServiceListScreen');
    } else {
      navigation.navigate('BookingQueueScreen');
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

  const favoriteButtonAction = () => {
    Utilities.resetAllSharedBookingRelatedInfo();
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

  //API CALLS
  /**
            *
            * Purpose: Business listing
            * Created/Modified By: Jenson
            * Created/Modified Date: 02 Mar 2021
            * Steps:
                1.fetch business list from API and append to state variable
    */
  const getSpecialistList = (
    isLoaderRequired,
    pageNumber,
    departmentId = selectedDepartmentInfo?._id || '',
    _searchText = searchText,
  ) => {
    if (isLoading === true || isPaginating === true) {
      return;
    }
    if (isLoaderRequired) {
      setIsLoading(true);
    }
    var queryParams = {};
    if (Utilities.isGenderSpecificBooking() === true) {
      queryParams[APIConnections.KEYS.GENDER] =
        Globals.SHARED_VALUES.SELECTED_GENDER.toLowerCase();
    }
    if (_searchText.trim().length > 0) {
      queryParams[APIConnections.KEYS.SEARCH] = _searchText;
    }
    if (departmentId !== undefined && departmentId?.trim().length > 0) {
      queryParams[APIConnections.KEYS.FILTER] = departmentId;
    }
    var _serviceIds = [];
    if (
      Utilities.isServiceBasedBusiness() === true &&
      Utilities.isBillingEnabled() === true
    ) {
      let serviceIds = Globals.SHARED_VALUES.SELECTED_SERVICES_IDS;
      if (serviceIds instanceof Array && serviceIds?.length > 0) {
        //  queryParams[APIConnections.KEYS.SERVICE_IDS] = '[%225f4ad97e7cb43e030f44306b%22,%20%22609eae71784e602e340fcc36%22]';
        _serviceIds = serviceIds;
      }
    }

    DataManager.getSpecialistList(pageNumber, queryParams, _serviceIds).then(
      ([isSuccess, message, data]) => {
        if (isSuccess === true) {
          if (data?.objects !== undefined && data?.objects !== null) {
            // Globals.CONSULTANTS_LIST=data.objects;
            // dispatch(setConsultantList(data.objects));
            if (pageNumber !== 1) {
              if (data.objects?.length === 0) {
                console.log('END FOUND');
                setIsPageEnded(true);
                setShowEmptyScreen(true);
              } else {
                let allConsultants = data.objects;
                //Need to filter non-blocked consultants
                let nonBlockedConsultants = allConsultants.filter(
                  _data =>
                    (_data?.is_blocked === undefined ||
                    _data?.is_blocked === null
                      ? false
                      : _data.is_blocked) === false,
                );
                //Appending data
                setSpecialistList(existingList => {
                  return [...existingList, ...nonBlockedConsultants];
                });
              }
            } else {
              if (data?.objects.length > 0) {
                //Animate intro cells
              }
              let allConsultants = data?.objects;
              //Need to filter non-blocked consultants
              let nonBlockedConsultants = allConsultants.filter(
                _data =>
                  (_data?.is_blocked === undefined || _data?.is_blocked === null
                    ? false
                    : _data.is_blocked) === false,
              );
              setSpecialistList(nonBlockedConsultants);
            }
          } else {
            setShowEmptyScreen(true);
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
        setIsPaginating(false);
      },
    );
  };

  const onPressDepartmentChoose = () => {
    if (Utilities.isServiceBasedBusiness() === false) {
      departmentSelectionRBSheetRef.current.open();
    }
  };
  /**
           * Purpose:show consultant filter popup
           * Created/Modified By: Sudhin
           * Created/Modified Date: 20 jan 2022
           * Steps:
               1.Open the rbSheet
       */
  const DepartmentFilterPopupComponent = () => {
    return (
      <RBSheet
        ref={departmentSelectionRBSheetRef}
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
        height={DisplayUtils.setHeight(80)}
        // onClose={() => {

        // }}
      >
        <DepartmentSelectionPopUp
          refRBSheet={departmentSelectionRBSheetRef}
          onDepartmentSelection={handleDepartmentSelection}
          selectedDepartmentId={selectedDepartmentInfo?._id || '-1'}
          getAllSpecialist={getAllSpecialist}
        />
      </RBSheet>
    );
  };
  const getAllSpecialist = () => {
    getSpecialistList(true, 1, '', '');
  };
  const handleDepartmentSelection = departmentInfo => {
    console.log('handleDepartmentSelection departmentInfo: ', departmentInfo);
    setShowEmptyScreen(true);
    if (departmentInfo?._id !== '-1') {
      console.log('handleDepartmentSelection = true');
      Globals.SHARED_VALUES.SELECTED_DEPARTMENT_INFO = departmentInfo;
      setSelectedDepartmentInfo(departmentInfo);
      resetAndFetchSpecialists(departmentInfo?._id);
    } else {
      console.log('handleDepartmentSelection = false');
      Globals.SHARED_VALUES.SELECTED_DEPARTMENT_INFO = {};
      setSelectedDepartmentInfo({});
      resetAndFetchSpecialists('');
    }
  };

  /**
   * Purpose: Pagination loader component
   * Created/Modified By: Jenson
   * Created/Modified Date: 02 Mar 2022
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
   * Created/Modified Date: 02 Mar 2022
   * Steps:
   */
  const listOnEndReach = () => {
    console.log(
      `Detected on end reach isPaginating: ${isPaginating}, isPageEnded: ${isPageEnded}`,
    );

    if (
      isPageEnded === false &&
      isLoading === false &&
      isPaginating === false
    ) {
      let newPageNo = pageNo + 1;
      console.log('PageNo:', newPageNo);
      if (newPageNo !== 1) {
        setIsPaginating(true);
      }
      console.log('setIndicator:', isPaginating);
      setPageNo(newPageNo);
      getSpecialistList(false, newPageNo, selectedDepartmentInfo?._id);
    }
  };

  /**
            * Purpose: List empty component
            * Created/Modified By: Sudhin Sudhakaran
            * Created/Modified Date: 11 Oct 2021
            * Steps:
                1.Return the component when list is empty
        */
  const SpecialistEmptyComponent = () => {
    console.log('SpecialistEmptyComponent ,showEmptyScreen ', showEmptyScreen);
    return showEmptyScreen || searchText.length > 0 ? (
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
          style={{width: 200, height: 180}}
          source={Images.EMPTY_CHAIR_ANIMATION_ICON}
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
        <Text
          style={{
            alignSelf: 'center',
            color: Colors.PRIMARY_TEXT_COLOR,
            fontFamily: Fonts.Gibson_Regular,
            fontSize: 18,
            marginTop: 8,
          }}>
          {t(Translations.SMALL_NO)} {Utilities.getSpecialistName()}{' '}
          {t(Translations.FOUND)}
        </Text>
        <Text
          style={{
            alignSelf: 'center',
            color: Colors.SECONDARY_COLOR,
            fontFamily: Fonts.Gibson_Regular,
            fontSize: 12,
            marginTop: 12,
          }}>
          {t(Translations.Y_WAIT)}
          <Text
            style={{
              alignSelf: 'center',
              color: Colors.PRIMARY_TEXT_COLOR,
            }}>
            {' '}
            {t(Translations.FIND_YOUR_SPECIALIST_NOW)}
          </Text>
        </Text>
      </View>
    ) : null;
  };
  const cellPressAction = item => {
    console.log('selected Serving userInfo: ', item);
    Globals.SHARED_VALUES.SELECTED_SERVING_USER_INFO = item;
    Globals.SHARED_VALUES.SELECTED_SERVING_USER_ID = item?._id;
    Globals.SHARED_VALUES.IS_NO_CHOICE_SELECTED = false;

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

    if (
      Utilities.isServiceBasedBusiness() === true &&
      !(Globals.SHARED_VALUES.SELECTED_SERVICES_IDS?.length > 0)
    ) {
      //No services selected
      //Navigate to service selection
      navigation.navigate('ServiceListScreen');
    } else if (
      Utilities.isServiceBasedBusiness() === true &&
      Globals.SHARED_VALUES.IS_FORCE_SERVICE_SELECT_NEED === true
    ) {
      //Navigate to service selection
      navigation.navigate('ServiceListScreen');
    } else {
      navigation.navigate('BookingQueueScreen');
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
    return <SpecialistItem item={item} index={index} />;
  };

  const SpecialistItem = ({item, index}) => {
    if (isLoading === true) {
      return <ListLoader />;
    } else {
      var departmentName = item?.role_id?.label || 'N/A';
      if (
        Globals.BUSINESS_DETAILS?.businessType ===
        'multiple-service-multiple-consultant'
      ) {
        departmentName = item?.role_id?.label || 'N/A';
      }
      //Show designation in multiple serving #21003
      if (Globals.BUSINESS_DETAILS?.businessType === 'multiple-consultant') {
        if (
          item?.departments instanceof Array &&
          item?.departments?.length > 0
        ) {
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
            flexDirection: 'row',
            borderBottomWidth: 1,
            borderBottomColor: Colors.LINE_SEPARATOR_COLOR,
            padding: 12,
          }}
          onPress={() => cellPressAction(item)}>
          <GetImage
            style={{
              width: 48,
              height: 48,
              borderRadius: 48 / 2,
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
          <View style={{width: '83%', marginLeft: 20, marginRight: 20}}>
            <Text
              style={{
                marginRight: 16,
                fontFamily: Fonts.Gibson_SemiBold,
                fontSize: 14,
                color: Colors.PRIMARY_TEXT_COLOR,
                textAlign: 'left',
              }}
              numberOfLines={1}>
              {item?.name || 'N/A'}
            </Text>
            <Text
              style={{
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
                    marginTop: 8,
                    fontFamily: Fonts.Gibson_Regular,
                    fontSize: 10,
                    color: '#6F7987',
                  }}>
                  {t(Translations.NO_REVIEWS)}
                </Text>
              )
            ) : null}

            <View style={{flexDirection: 'row'}}>
              {item?.workingHours?.length > 0 ? (
                <View style={{marginTop: 8, flexDirection: 'row', width: 140}}>
                  {item?.workingHours?.map((dayItem, dayIndex) => {
                    return (
                      <View
                        key={dayIndex.toString()}
                        style={{
                          marginLeft: dayIndex !== 0 ? 5 : 0,
                          width: 15,
                          height: 15,
                          borderRadius: 15 / 2,
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
                            textAlign: 'left',
                          }}>
                          {dayItem?.label[0]}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              ) : null}

              {Utilities.isBillingEnabled() === true &&
              Utilities.isServiceBasedBusiness() === true &&
              item?.serviceRate !== undefined &&
              item?.serviceRate !== null &&
              item?.serviceRate > 0 ? (
                <View style={{flex: 1}}>
                  <Text
                    style={{
                      marginRight: 8,
                      marginLeft: 8,
                      marginTop: 8,
                      textAlign: 'right',
                      color: '#6F7987',
                      fontFamily: Fonts.Gibson_Regular,
                      fontSize: 15,
                    }}
                    adjustsFontSizeToFit
                    numberOfLines={1}>
                    Service(s) rate:{' '}
                    {Utilities.getCurrencyFormattedPrice(
                      item?.serviceRate || 0,
                    )}
                  </Text>
                </View>
              ) : Utilities.isBillingEnabled() === true &&
                Utilities.isServiceBasedBusiness() === false &&
                item?.consultationFee !== undefined &&
                item?.consultationFee !== null &&
                item?.consultationFee > 0 ? (
                <View style={{flex: 1}}>
                  <Text
                    style={{
                      marginRight: 8,
                      marginLeft: 8,
                      marginTop:I18nManager.isRTL? 1:8,
                      textAlign: 'right',
                      color: '#6F7987',
                      fontFamily: Fonts.Gibson_Regular,
                      fontSize: 16,
                    }}
                    adjustsFontSizeToFit
                    numberOfLines={1}>
                    {t(Translations.CONSULATION_FEE)}:{' '}
                    {Utilities.getCurrencyFormattedPrice(
                      item?.consultationFee || 0,
                    )}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        </TouchableOpacity>
      );
    }
  };
  const onBackAction = () => {
    if (route?.params?.newBooking === true) {
      Globals.SHARED_VALUES.SELECTED_DEPARTMENT_INFO = {};
    }
    navigation.goBack();
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
        <DepartmentFilterPopupComponent />
        <View style={styles.header}>
          <View
            style={{
              marginTop: 25,
              marginLeft: 20,
              flexDirection: 'row',
            }}>
            <TouchableOpacity
              style={{justifyContent: 'center', marginRight: 20}}
              onPress={() => onBackAction()}>
              <Image
                style={{
                  height: 17,
                  width: 24,
                  transform: [{scaleX: I18nManager.isRTL ? -1 : 1}],
                }}
                source={Images.BACK_ARROW}
              />
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={
                Utilities.isServiceBasedBusiness() === false ? 0.2 : 1
              }
              onPress={() => onPressDepartmentChoose()}>
              {selectedDepartmentInfo?._id === undefined ||
              selectedDepartmentInfo?._id === '-1' ? (
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Text
                    style={{
                      fontFamily: Fonts.Gibson_SemiBold,
                      color: Colors.PRIMARY_TEXT_COLOR,
                      fontSize: 18,
                    }}
                    numberOfLines={1}>
                    {t(Translations.CHOOSE)}{'  '}{Utilities.getSpecialistName()}
                  </Text>
                  {Utilities.isServiceBasedBusiness() === false ? (
                    <Image
                      style={{
                        marginTop: 4,
                        marginLeft: 8,
                        marginRight: 8,
                        width: 14,
                        height: 14,
                        resizeMode: 'contain',
                        tintColor: Colors.PRIMARY_TEXT_COLOR,
                      }}
                      source={Images.DROP_DOWN_ICON}
                    />
                  ) : null}
                </View>
              ) : (
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 20,
                  }}>
                  <Text
                    style={{
                      fontFamily: Fonts.Gibson_SemiBold,
                      color: Colors.PRIMARY_TEXT_COLOR,
                      fontSize: 18,
                    }}
                    numberOfLines={1}>
                    {selectedDepartmentInfo?.department_name ||
                      ` ${t(
                        Translations.CHOOSE,
                      )} ${' '} ${Utilities.getSpecialistName()}`}
                  </Text>

                  <Image
                    style={{
                      marginTop: 4,
                      marginLeft: 8,
                      marginRight: 8,
                      width: 14,
                      height: 14,
                      resizeMode: 'contain',
                      tintColor: Colors.PRIMARY_TEXT_COLOR,
                    }}
                    source={Images.DROP_DOWN_ICON}
                  />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View
          style={{
            marginTop: 12,
            marginLeft: 30,
            marginRight: 30,
            width: '80%',
            alignSelf: 'center',
            height: 50,
            flexDirection: 'row',
            borderWidth: 1,
            borderColor: Colors.LINE_SEPARATOR_COLOR,
            alignItems: 'center',
          }}>
          <TextInput
            style={{
              flex: 1,
              marginLeft: 16,
              marginRight: 30,
              height: 50,
              color: Colors.PRIMARY_TEXT_COLOR,
              textAlign: I18nManager.isRTL ? 'right' : 'left',
            }}
            placeholder={t(Translations.SEARCH)}
            placeholderTextColor={Colors.PLACEHOLDER_COLOR}
            returnKeyType={'search'}
            autoCapitalize={'none'}
            value={searchText}
            onChangeText={text => setSearchText(text)}
            onSubmitEditing={() => searchButtonAction()}
          />

          {searchText !== '' ? (
            <TouchableOpacity
              style={{
                width: 30,
                height: 30,
                alignItems: 'center',
                justifyContent: 'center',
                position: 'absolute',
                right: 50,
              }}
              onPress={() => searchResetButtonAction()}>
              <Image
                style={{
                  width: 22,
                  height: 22,
                }}
                source={Images.CROSS_BUTTON_ICON}
              />
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            onPress={() => searchButtonAction()}
            style={{
              justifyContent: 'center',
              backgroundColor: Colors.SECONDARY_COLOR,
              width: 31,
              height: 31,
              marginRight: 16,
            }}>
            <Image
              style={{
                width: 20,
                height: 20,
                alignSelf: 'center',
                resizeMode: 'contain',
                transform: [{scaleX: I18nManager.isRTL ? -1 : 1}],
              }}
              source={Images.SEARCH_ICON}
            />
          </TouchableOpacity>
        </View>

        <FlatList
          // contentContainerStyle={{ paddingBottom: 85 }}
          style={{
            marginLeft: 6,
            marginTop: 12,
            marginBottom:
              Utilities.isServiceBasedBusiness() === true &&
              specialistList?.length > 1  &&
              Globals.BUSINESS_DETAILS.autoAssign === true
                ? 0
                : 80,
          }}
          data={isLoading ? DUMMY_DATA : specialistList}
          renderItem={renderItem}
          keyExtractor={(item, index) =>
            item._id ? item._id.toString() : index.toString()
          }
          onEndReachedThreshold={0.2}
          onEndReached={() => {
            listOnEndReach();
          }}
          ListFooterComponent={isPaginating ? paginationComponent : null}
          ListEmptyComponent={isLoading ? null : SpecialistEmptyComponent}
        />
        {Utilities.isServiceBasedBusiness() === true &&
        specialistList?.length > 1 &&
        Globals.BUSINESS_DETAILS.autoAssign === true ? (
          <TouchableOpacity
            onPress={() => noChoiceAction()}
            style={{
              backgroundColor: Colors.SECONDARY_COLOR,
              marginBottom: 80,
              height: 40,
              justifyContent: 'center',
            }}>
            <Text
              style={{
                color: Colors.WHITE_COLOR,
                fontFamily: Fonts.Gibson_Regular,
                fontSize: 14,
                textAlign: 'center',
              }}>
              {t(Translations.NO_CHOICE)}
            </Text>
          </TouchableOpacity>
        ) : null}

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
            onPress={() => bottomHomeAction()}
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
                tintColor: Colors.INACTIVE_BOTTOM_BAR_COLOR,
                resizeMode: 'contain',
              }}
            />
          </TouchableOpacity>
          <TouchableOpacity
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
                tintColor: Colors.SECONDARY_COLOR,
                resizeMode: 'contain',
              }}
            />
            <Text
              style={{
                marginLeft: 8,
                marginRight: 8,
                fontFamily: Fonts.Gibson_SemiBold,
                fontSize: 14,
                color: Colors.SECONDARY_COLOR,
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
    </>
  );
};

export default SpecialistListScreen;

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.PRIMARY_WHITE,
    width: DisplayUtils.setWidth(100),
    height: 70,
    borderBottomColor: Colors.LINE_SEPARATOR_COLOR,
    borderBottomWidth: 0.5,
  },
});
