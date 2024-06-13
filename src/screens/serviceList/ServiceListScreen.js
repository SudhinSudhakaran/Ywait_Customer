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
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/core';
import InputScrollView from 'react-native-input-scroll-view';
import FastImage from 'react-native-fast-image';
import ContentLoader, {Rect, Circle, Path} from 'react-content-loader/native';
import {useHeaderHeight} from '@react-navigation/elements';
import {
  Colors,
  Fonts,
  Globals,
  Images,
  Strings,
  Translations,
} from '../../constants';
import LoadingIndicator from '../shared/loadingIndicator/LoadingIndicator';
import StorageManager from '../../helpers/storageManager/StorageManager';
import DataManager from '../../helpers/apiManager/DataManager';
import Utilities from '../../helpers/utils/Utilities';
import {AppointmentType} from '../../helpers/enums/Enums';
import DisplayUtils from '../../helpers/utils/DisplayUtils';
import APIConnections from '../../helpers/apiManager/APIConnections';
import LottieView from 'lottie-react-native';
import NO_DEPARTMENT_ICON from '../../assets/images/departmentEmptyIcon.svg';
import RBSheet from 'react-native-raw-bottom-sheet';
import {useFocusEffect} from '@react-navigation/core';
import { responsiveScreenWidth, responsiveWidth } from 'react-native-responsive-dimensions';
import {t} from 'i18next';
// import BookingConfirmationPopUp from '../confirmationPopUps/bookingPopUps/BookingConfirmationPopUp';
// import QueueConfirmationPopUp from '../confirmationPopUps/queuePopUps/QueueConfirmationPopUp';
// import BookingSuccessPopUp from '../successAndFailurePopUps/bookingPopUps/BookingSuccessPopUp';
// import QueueSuccessPopUp from '../successAndFailurePopUps/queuePopUps/QueueSuccessPopUp';
// import BookingFailurePopUp from '../successAndFailurePopUps/bookingPopUps/BookingFailurePopUp';
// import QueueFailurePopUp from '../successAndFailurePopUps/queuePopUps/QueueFailurePopUp';
// import BookingPaymentConfirmationPopUp from '../confirmationPopUps/bookingPopUps/BookingPaymentConfirmationPopUp';
// import QueuePaymentConfirmationPopUp from '../confirmationPopUps/queuePopUps/QueuePaymentConfirmationPopUp';
import {GetLottieImage} from '../shared/getLottieImage/GetLottieImage';
import {GuestUserAuthSource} from '../../helpers/enums/Enums';
import { useRoute } from '@react-navigation/native';
const ServiceListScreen = props => {
  const layout = useWindowDimensions();
  const route=useRoute();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [search, setSearch] = useState('');
  const [isLoaderLoading, setIsLoaderLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaginating, setIsPaginating] = useState(false);
  const [isPageEnded, setIsPageEnded] = useState(false);
  const [pageNo, setPageNo] = useState(1);
  const [serviceList, setServiceList] = useState([]);
  const [selectedServicesId, setSelectedServicesId] = useState(Globals.SHARED_VALUES.SELECTED_SERVICES_IDS);
  const [filteredDataSource, setFilteredDataSource] = useState([]);
  const [selectedServiceImageUrl, setSelectedServiceImageUrl] = useState('');
  const [selectedServiceTitle, setSelectedServiceTitle] =
    useState(t(Translations.CHOOSE_SERVICE));
  // const [loadImage, setLoadImage] = useState(true);
  const [newBookingSuccessData, setNewBookingSuccessData] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const searchInputRef = useRef();
  const bookingConfirmationRef = useRef();
  const queueConfirmationRef = useRef();
  const bookingPaymentConfirmationRef = useRef();
  const queuePaymentConfirmationRef = useRef();
  const bookingSuccessRef = useRef();
  const queueSuccessRef = useRef();
  const bookingFailureRef = useRef();
  const queueFailureRef = useRef();
  useFocusEffect(
    React.useCallback(() => {
      return () => {};
    }, []),
  );
  const dummyServiceList = [
    {
      _id: '5f4ad97e7cb43e030f443061',
      customHours: [],
      isDeleted: false,
      image: 'https://ywait.in:2003/services/haircut.jpeg',
      name: 'Hair Bleaching m',
      category: 'Hair Cut',
      serviceIs: 'public',
      for: 'booking',
      during: 'all_hours',
      description:
        'Hair bleaching is a chemical hair dye technique that strips the color of your hair strands',
      duration: 30,
      price: 100,
      business_id: '5cf610fb384ef274d2f3c79c',
      __v: 0,
      status: 'ACTIVE',
      parallelService: true,
      sortIndex: 25,
      lottieImageName: '',
      genderSelection: 'unisex',
      consultantServiceFare: 100,
    },
    {
      _id: '5f4ad97e7cb43e030f443062',
      customHours: [],
      isDeleted: false,
      image: 'https://ywait.in:2003/services/haircut.jpeg',
      name: 'Hair Bleaching m',
      category: 'Hair Cut',
      serviceIs: 'public',
      for: 'booking',
      during: 'all_hours',
      description:
        'Hair bleaching is a chemical hair dye technique that strips the color of your hair strands',
      duration: 30,
      price: 100,
      business_id: '5cf610fb384ef274d2f3c79c',
      __v: 0,
      status: 'ACTIVE',
      parallelService: true,
      sortIndex: 25,
      lottieImageName: '',
      genderSelection: 'unisex',
      consultantServiceFare: 100,
    },
    {
      _id: '5f4ad97e7cb43e030f443063',
      customHours: [],
      isDeleted: false,
      image: 'https://ywait.in:2003/services/haircut.jpeg',
      name: 'Hair Bleaching m',
      category: 'Hair Cut',
      serviceIs: 'public',
      for: 'booking',
      during: 'all_hours',
      description:
        'Hair bleaching is a chemical hair dye technique that strips the color of your hair strands',
      duration: 30,
      price: 100,
      business_id: '5cf610fb384ef274d2f3c79c',
      __v: 0,
      status: 'ACTIVE',
      parallelService: true,
      sortIndex: 25,
      lottieImageName: '',
      genderSelection: 'unisex',
      consultantServiceFare: 100,
    },
    {
      _id: '5f4ad97e7cb43e030f443064',
      customHours: [],
      isDeleted: false,
      image: 'https://ywait.in:2003/services/haircut.jpeg',
      name: 'Hair Bleaching m',
      category: 'Hair Cut',
      serviceIs: 'public',
      for: 'booking',
      during: 'all_hours',
      description:
        'Hair bleaching is a chemical hair dye technique that strips the color of your hair strands',
      duration: 30,
      price: 100,
      business_id: '5cf610fb384ef274d2f3c79c',
      __v: 0,
      status: 'ACTIVE',
      parallelService: true,
      sortIndex: 25,
      lottieImageName: '',
      genderSelection: 'unisex',
      consultantServiceFare: 100,
    },
    {
      _id: '5f4ad97e7cb43e030f443065',
      customHours: [],
      isDeleted: false,
      image: 'https://ywait.in:2003/services/haircut.jpeg',
      name: 'Hair Bleaching m',
      category: 'Hair Cut',
      serviceIs: 'public',
      for: 'booking',
      during: 'all_hours',
      description:
        'Hair bleaching is a chemical hair dye technique that strips the color of your hair strands',
      duration: 30,
      price: 100,
      business_id: '5cf610fb384ef274d2f3c79c',
      __v: 0,
      status: 'ACTIVE',
      parallelService: true,
      sortIndex: 25,
      lottieImageName: '',
      genderSelection: 'unisex',
      consultantServiceFare: 100,
    },
    {
      _id: '5f4ad97e7cb43e030f443066',
      customHours: [],
      isDeleted: false,
      image: 'https://ywait.in:2003/services/haircut.jpeg',
      name: 'Hair Bleaching m',
      category: 'Hair Cut',
      serviceIs: 'public',
      for: 'booking',
      during: 'all_hours',
      description:
        'Hair bleaching is a chemical hair dye technique that strips the color of your hair strands',
      duration: 30,
      price: 100,
      business_id: '5cf610fb384ef274d2f3c79c',
      __v: 0,
      status: 'ACTIVE',
      parallelService: true,
      sortIndex: 25,
      lottieImageName: '',
      genderSelection: 'unisex',
      consultantServiceFare: 100,
    },
    {
      _id: '5f4ad97e7cb43e030f443067',
      customHours: [],
      isDeleted: false,
      image: 'https://ywait.in:2003/services/haircut.jpeg',
      name: 'Hair Bleaching m',
      category: 'Hair Cut',
      serviceIs: 'public',
      for: 'booking',
      during: 'all_hours',
      description:
        'Hair bleaching is a chemical hair dye technique that strips the color of your hair strands',
      duration: 30,
      price: 100,
      business_id: '5cf610fb384ef274d2f3c79c',
      __v: 0,
      status: 'ACTIVE',
      parallelService: true,
      sortIndex: 25,
      lottieImageName: '',
      genderSelection: 'unisex',
      consultantServiceFare: 100,
    },
    {
      _id: '5f4ad97e7cb43e030f443068',
      customHours: [],
      isDeleted: false,
      image: 'https://ywait.in:2003/services/haircut.jpeg',
      name: 'Hair Bleaching m',
      category: 'Hair Cut',
      serviceIs: 'public',
      for: 'booking',
      during: 'all_hours',
      description:
        'Hair bleaching is a chemical hair dye technique that strips the color of your hair strands',
      duration: 30,
      price: 100,
      business_id: '5cf610fb384ef274d2f3c79c',
      __v: 0,
      status: 'ACTIVE',
      parallelService: true,
      sortIndex: 25,
      lottieImageName: '',
      genderSelection: 'unisex',
      consultantServiceFare: 100,
    },
    {
      _id: '5f4ad97e7cb43e030f443069',
      customHours: [],
      isDeleted: false,
      image: 'https://ywait.in:2003/services/haircut.jpeg',
      name: 'Hair Bleaching m',
      category: 'Hair Cut',
      serviceIs: 'public',
      for: 'booking',
      during: 'all_hours',
      description:
        'Hair bleaching is a chemical hair dye technique that strips the color of your hair strands',
      duration: 30,
      price: 100,
      business_id: '5cf610fb384ef274d2f3c79c',
      __v: 0,
      status: 'ACTIVE',
      parallelService: true,
      sortIndex: 25,
      lottieImageName: '',
      genderSelection: 'unisex',
      consultantServiceFare: 100,
    },
    {
      _id: '5f4ad97e7cb43e030f443060',
      customHours: [],
      isDeleted: false,
      image: 'https://ywait.in:2003/services/haircut.jpeg',
      name: 'Hair Bleaching m',
      category: 'Hair Cut',
      serviceIs: 'public',
      for: 'booking',
      during: 'all_hours',
      description:
        'Hair bleaching is a chemical hair dye technique that strips the color of your hair strands',
      duration: 30,
      price: 100,
      business_id: '5cf610fb384ef274d2f3c79c',
      __v: 0,
      status: 'ACTIVE',
      parallelService: true,
      sortIndex: 25,
      lottieImageName: '',
      genderSelection: 'unisex',
      consultantServiceFare: 100,
    },
    {
      _id: '5f4ad97e7cb43e030f443010',
      customHours: [],
      isDeleted: false,
      image: 'https://ywait.in:2003/services/haircut.jpeg',
      name: 'Hair Bleaching m',
      category: 'Hair Cut',
      serviceIs: 'public',
      for: 'booking',
      during: 'all_hours',
      description:
        'Hair bleaching is a chemical hair dye technique that strips the color of your hair strands',
      duration: 30,
      price: 100,
      business_id: '5cf610fb384ef274d2f3c79c',
      __v: 0,
      status: 'ACTIVE',
      parallelService: true,
      sortIndex: 25,
      lottieImageName: '',
      genderSelection: 'unisex',
      consultantServiceFare: 100,
    },
    {
      _id: '5f4ad97e7cb43e030f443011',
      customHours: [],
      isDeleted: false,
      image: 'https://ywait.in:2003/services/haircut.jpeg',
      name: 'Hair Bleaching m',
      category: 'Hair Cut',
      serviceIs: 'public',
      for: 'booking',
      during: 'all_hours',
      description:
        'Hair bleaching is a chemical hair dye technique that strips the color of your hair strands',
      duration: 30,
      price: 100,
      business_id: '5cf610fb384ef274d2f3c79c',
      __v: 0,
      status: 'ACTIVE',
      parallelService: true,
      sortIndex: 25,
      lottieImageName: '',
      genderSelection: 'unisex',
      consultantServiceFare: 100,
    },
  ];
  useEffect(() => {
    // loadSelectedIdIfNeeded();
    getServiceList();
  }, []);
  //Shimmer loader for the flatList
  const ListLoader = props => (
    <ContentLoader    transform={[{scaleX: I18nManager.isRTL ? -1 : 1}]}
      speed={1.5}
      width={'100%'}
      height={90}
      //viewBox="0 0 320 "
      backgroundColor="#dadada"
      foregroundColor="#eee"
      animate={true}
      {...props}>
      <Rect x="30%" y="10" rx="5" ry="5" width="40" height="40" />
      <Rect x="10" y="60" rx="5" ry="5" width="80%" height="8" />
      <Rect x="25%" y="72" rx="5" ry="5" width="50%" height="8" />
    </ContentLoader>
  );
  /**
            * Purpose: List empty component
            * Created/Modified By: Sudhin Sudhakaran
            * Created/Modified Date: 11 Oct 2021
            * Steps:
                1.Return the component when list is empty
        */
  const CustomerEmptyComponent = () => {
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
          source={Images.LOTTIE_SEARCH_NO_RESULT}
          autoPlay
          loop
          colorFilters={[
            {
              keypath: 'main.magnifier.矩形.矩形.Fill 1',
              color: Colors.SECONDARY_COLOR,
            },
          ]}
        />

        <Text
          style={{
            alignSelf: 'center',
            color: Colors.ERROR_RED_COLOR,
            fontFamily: Fonts.Gibson_SemiBold,
            fontSize: 18,
            marginTop: 20,
          }}>
      {t(Translations.NO_RESULT_FOUND)}
        </Text>
      </View>
    );
  };

  const loadSelectedIdIfNeeded = () => {
    if (Globals.SHARED_VALUES.SELECTED_SERVICES_IDS?.length > 0) {
      setSelectedServicesId(Globals.SHARED_VALUES.SELECTED_SERVICES_IDS);
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

  const searchButtonAction = () => {
    Keyboard.dismiss();
  };

  // const closeButtonAction = () => {
  //     Keyboard.dismiss();
  //     setSearch('');
  // };
  //API Calls
  /**
          *
          * Purpose: Get user details
          * Created/Modified By: Jenson
          * Created/Modified Date: 04 Jan 2022
          * Steps:
              1.fetch business details from API and append to state variable
   */
  const getServiceList = () => {
    setIsLoading(true);
    var queryParams = {};
    if (
      Utilities.getGenderOptions()?.length > 0 &&
      !Utilities.isSingleConsultantBusiness() &&
      Utilities.isGenderSpecificBooking()
    ) {
      queryParams[APIConnections.KEYS.GENDER] =
        Globals.SHARED_VALUES.SELECTED_GENDER;
    }
    if (
      Globals.SHARED_VALUES.SELECTED_SERVING_USER_ID?.trim().length > 0 &&
      Utilities.isBillingEnabled() &&
      Utilities.getServiceBillingType() === 'consultant-service'
    ) {
      queryParams[APIConnections.KEYS.SERVING_USER_ID] =
        Globals.SHARED_VALUES.SELECTED_SERVING_USER_ID;
    }

    DataManager.getServiceList(queryParams).then(
      ([isSuccess, message, data]) => {
        if (isSuccess === true) {
          if (data.objects !== undefined && data.objects !== null) {
            setIsLoading(false);
            setServiceList(data.objects);
            setFilteredDataSource(data.objects);
            //Set titles if services already available
            if (Globals.SHARED_VALUES.SELECTED_SERVICES_IDS?.length > 0) {
              configureTitleAndImage(
                Globals.SHARED_VALUES.SELECTED_SERVICES_IDS,
                data.objects,
              );
            }
          } else {
            Utilities.showToast(t(Translations.FAILED), message, 'error', 'bottom');
            setIsLoading(false);
          }
        } else {
          Utilities.showToast(t(Translations.FAILED), message, 'error', 'bottom');
          setIsLoading(false);
        }
      },
    );
  };

  /**
   * Purpose:Configure the title text and title image
   * Created/Modified By: Vijin Raj
   * Created/Modified Date: 28 Jan 2022
   * Steps:
   */

  const configureTitleAndImage = (
    serviceIdList,
    _serviceList = serviceList,
  ) => {
    var serviceName = '';
    var serviceImageUrl = null;
    serviceName = '';
    serviceImageUrl = null;
    if (serviceIdList?.length === 1) {
      if (serviceIdList?.length > 0 && _serviceList?.length > 0) {
        _serviceList.map((serviceItem, serviceItemIndex) => {
          serviceIdList.map((selectedServiceId, selectedServiceIdIndex) => {
            if (selectedServiceId === serviceItem._id) {
              if (serviceImageUrl === null || serviceImageUrl === undefined) {
                if (
                  serviceItem.lottieImageName !== undefined ||
                  serviceItem.lottieImageName !== ''
                ) {
                  serviceImageUrl = serviceItem.lottieImageName;
                } else {
                  serviceImageUrl = serviceItem.image;
                }
              }
              serviceName += serviceItem.name;
            }
          });
        });
      }
      setSelectedServiceImageUrl(serviceImageUrl);
      setSelectedServiceTitle(serviceName);
    } else if (serviceIdList?.length === 2) {
      if (serviceIdList?.length > 0 && _serviceList?.length > 0) {
        _serviceList.map((serviceItem, serviceItemIndex) => {
          serviceIdList.map((selectedServiceId, selectedServiceIdIndex) => {
            if (selectedServiceId === serviceItem._id) {
              if (serviceImageUrl === null || serviceImageUrl === undefined) {
                if (
                  serviceItem.lottieImageName !== undefined ||
                  serviceItem.lottieImageName !== ''
                ) {
                  serviceImageUrl = serviceItem.lottieImageName;
                } else {
                  serviceImageUrl = serviceItem.image;
                }
              }
              serviceName += serviceItem.name + ' and ';
            }
          });
        });
      }
      setSelectedServiceImageUrl(serviceImageUrl);
      let last5WordsDropped = serviceName.substring(0, serviceName.length - 5);
      setSelectedServiceTitle(last5WordsDropped);
    } else if (serviceIdList?.length > 2) {
      if (serviceIdList?.length > 0 && _serviceList?.length > 0) {
        let firstItemIndex = _serviceList.findIndex(
          item => item._id === serviceIdList[0],
        );
        if (serviceImageUrl === null || serviceImageUrl === undefined) {
          if (
            _serviceList[firstItemIndex].lottieImageName !== undefined ||
            _serviceList[firstItemIndex].lottieImageName !== ''
          ) {
            serviceImageUrl = _serviceList[firstItemIndex].lottieImageName;
          } else {
            serviceImageUrl = _serviceList[firstItemIndex].image;
          }
        }
        console.log('serviceImageUrl', serviceImageUrl);
        serviceName =
          _serviceList[firstItemIndex].name +
          ' and ' +
          (serviceIdList.length - 1) +
          ' others';
      }
      setSelectedServiceImageUrl(serviceImageUrl);
      setSelectedServiceTitle(serviceName);
    } else {
      setSelectedServiceImageUrl('');
      setSelectedServiceTitle(t(Translations.CHOOSE_SERVICE));
    }
  };
  /**
        * Purpose:On click flatlist cell
        * Created/Modified By: Vijin Raj
        * Created/Modified Date: 28 Jan 2022
        * Steps:
            1.removes the selected service
            2.add the selected service
    */
  const onClickCell = item => {
    if (isLoading === true) {
      return;
    }
    var equalServicesFound = false;
    equalServicesFound = selectedServicesId.some(id => id === item._id)
    if (equalServicesFound) {
      //1
      const filteredItems = selectedServicesId.filter(id => id !== item._id);
      setSelectedServicesId(filteredItems);
      configureTitleAndImage(filteredItems);
    } else {
      //2
      let newServiceList = [];
      selectedServicesId.map((selectedServiceId, selectedServiceIdIndex) => {
        newServiceList.push(selectedServiceId);
      });
      newServiceList.push(item._id);
      setSelectedServicesId(newServiceList);
      configureTitleAndImage(newServiceList);
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
    return <ServiceListData item={item} index={index} />;
  };
  const ServiceListData = ({item}) => {
    var equalServicesFound = false;
    let durationInSeconds = item.duration * 60;
    equalServicesFound = selectedServicesId.some(id => id === item._id) ||
    route?.params?.services.some(_item => _item?._id === item._id);
    return (
      <TouchableOpacity
        style={{
          marginLeft: 10,
          marginBottom: 25,
          backgroundColor: Colors.WHITE_COLOR,
          width: '30%',
          borderRadius: 6,
          borderWidth: equalServicesFound ? 1 : 0.1,
          borderColor: equalServicesFound
            ? Colors.SECONDARY_COLOR
            : Colors.GREY_COLOR,
          shadowColor: Colors.SHADOW_COLOR,
          shadowOffset: {width: 0, height: 4},
          shadowOpacity: 0.8,
          shadowRadius: 5,
          elevation: 8,
          alignItems: 'center',
        }}
        onPress={() => onClickCell(item)}>
        {isLoading ? (
          <ListLoader />
        ) : (
          <Fragment>
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
                  {item?.duration} min
                {/* {Utilities.convertHMS(durationInSeconds)} */}
              </Text>
            </View>

            {Utilities.isBillingEnabled() ? (
              Utilities.getServiceBillingType() === 'service' ? (
                <Text
                  Text
                  style={{
                    fontFamily: Fonts.Gibson_Regular,
                    fontSize: 10,
                    color: Colors.TEXT_GREY_COLOR_9B,
                    marginBottom: 10,
                  }}
                  numberOfLines={1}>
                  {item.price !== undefined && item.price > 0
                    ? Utilities.getCurrencyFormattedPrice(item.price)
                    : ''}
                </Text>
              ) : (
                <Text
                  Text
                  style={{
                    fontFamily: Fonts.Gibson_Regular,
                    fontSize: 10,
                    color: Colors.TEXT_GREY_COLOR_9B,
                    marginBottom: 10,
                  }}
                  numberOfLines={1}>
                  {item.consultantServiceFare !== undefined
                    ? Utilities.getCurrencyFormattedPrice(
                        item.consultantServiceFare,
                      )
                  :''
                  }
                </Text>
              )
            ) : null}

            {equalServicesFound ? (
              <Image
                source={Images.SERVICE_SELECT_ICON}
                style={{
                  height: 14,
                  width: 20,
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  tintColor: Colors.SECONDARY_COLOR,
                }}
              />
            ) : null}
          </Fragment>
        )}
      </TouchableOpacity>
    );
  };

  const confirmButtonAction = () => {
    console.log('confirm pressed, selected services: ', selectedServicesId);
    Globals.SHARED_VALUES.SELECTED_SERVICES_IDS = selectedServicesId;
    if (Globals.SHARED_VALUES.IS_RESCHEDULE === true) {
      navigation.navigate('BookingQueueScreen');
    } else {
      if (
        Globals.SHARED_VALUES.SELECTED_SERVING_USER_INFO?._id === undefined ||
        Globals.SHARED_VALUES.SELECTED_SERVING_USER_INFO?._id === null
      ) {
        if (Globals.SHARED_VALUES.IS_NO_CHOICE_SELECTED === true) {
          navigation.navigate('BookingQueueScreen');
        } else {
          navigation.navigate('SpecialistListScreen');
        }
      } else {
        navigation.navigate('BookingQueueScreen');
      }
    }
  };

  const searchFilterFunction = text => {
    // Check if searched text is not blank
    console.log('search Filter', text);
    if (serviceList !== undefined && serviceList !== null) {
      if (text) {
        // Inserted text is not blank
        // Filter the masterDataSource
        // Update FilteredDataSource
        const newData = serviceList.filter(function (item) {
          const itemData = item.name
            ? item.name.toUpperCase()
            : ''.toUpperCase();
          const textData = text.toUpperCase();
          return itemData.indexOf(textData) > -1;
        });
        setFilteredDataSource(newData);
        setSearch(text);
        // setCrossButtonVisible(false);
      } else {
        // Inserted text is blank
        // Update FilteredDataSource with masterDataSource
        setFilteredDataSource(serviceList);
        setSearch(text);
        // setCrossButtonVisible(false);
      }
    }
  };

  //final return
  return (
    <>
      <View
        keyboardVerticalOffset={useHeaderHeight()}
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        style={{flex: 1, backgroundColor: 'white'}}>
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
          {/* <GetBookingConfirmationPopUp />
          <GetBookingSuccessPopUp />
          <GetQueueSuccessPopUp />
          <GetBookingFailurePopUp />
          <GetQueueConfirmationPopUp />
          <GetBookingPaymentConfirmationPopUp />
          <GetQueuePaymentConfirmationPopUp />
          <GetQueueFailurePopUp /> */}
          <LoadingIndicator visible={isLoaderLoading} />
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
              {selectedServiceImageUrl === '' ||
              selectedServiceImageUrl === undefined ? (
                <NO_DEPARTMENT_ICON
                  width={24}
                  height={24}
                  fill={Colors.WHITE_COLOR}
                  fillNoDepartmentSecondary={Colors.SECONDARY_COLOR}
                  fillNoDepartmentPrimary={Colors.PRIMARY_COLOR}
                />
              ) : Utilities.getFileExtension(selectedServiceImageUrl) ===
                'json' ? (
                <View style={{height: 17, width: 24,marginTop:3}}>
                  <GetLottieImage
                    style={{
                      height: 17,
                      width: 24,
                    }}
                    url={selectedServiceImageUrl}
                  />
                </View>
              ) : (
                <FastImage
                  style={{
                    height: 17,
                    width: 24,
                  }}
                  source={{
                    uri: selectedServiceImageUrl,
                    priority: FastImage.priority.normal,
                  }}
                  resizeMode={FastImage.resizeMode.contain}
                />
              )}
              <Text
                style={{
                  fontFamily: Fonts.Gibson_SemiBold,
                  color: Colors.PRIMARY_TEXT_COLOR,
                  fontSize: 18,
                  marginLeft:3,
                  marginHorizontal:100,
                  lineHeight:21,
                  // marginTop: 3,
                  // marginRight:3,
                //  width: I18nManager.isRTL ? DisplayUtils.setWidth(20) : DisplayUtils.setWidth(70),
                }}
                numberOfLines={2}>
                {selectedServiceTitle}
              </Text>
            </View>
          </View>

          <View
            style={{
              marginTop: 8,
              marginLeft: 28,
              marginRight: 28,
              height: 42,
              justifyContent: 'center',
              borderRadius: 4,
              borderWidth: 1,
              borderColor: Colors.SEARCH_INPUT_BORDER_GRAY_COLOR,
              backgroundColor: Colors.WHITE_COLOR,
            }}>
            <TouchableOpacity
              onPress={() => (search !== '' ? searchButtonAction() : null)}
              style={{
                position: 'absolute',
                left: 8,
                justifyContent: 'center',
                height: 31,
                width: 31,
              }}>
              <Image
                style={{
                  width: 16,
                  height: 16,
                  resizeMode: 'contain',
                  alignSelf: 'center',
                }}
                source={Images.GRAY_SEARCH_ICON}
              />
            </TouchableOpacity>
            <TextInput
              style={{
                marginLeft: 53,
                paddingRight: 45,
                fontFamily: Fonts.Gibson_Regular,
                fontSize: 16,
                color: Colors.SECONDARY_TEXT_COLOR,
                textAlign: I18nManager.isRTL ? 'right' : 'left',
              }}
              placeholder={t(Translations.SEARCH)}
              autoCorrect={false}
              returnKeyType="search"
              editable={true}
              value={search}
              onSubmitEditing={() => {
                searchButtonAction();
              }}
              onChangeText={text => searchFilterFunction(text.trimStart())}
              onClear={text => searchFilterFunction('')}
              ref={searchInputRef}
            />
            {search !== '' ? (
              <TouchableOpacity
                style={{
                  width: 30,
                  height: 30,
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'absolute',
                  right: 10,
                }}
                onPress={() => searchFilterFunction('')}>
                <Image
                  style={{
                    width: 20,
                    height: 20,
                  }}
                  source={Images.CROSS_BUTTON_ICON}
                />
              </TouchableOpacity>
            ) : null}
          </View>
          <FlatList
            style={{marginLeft: 20, marginRight: 20, marginTop: 8}}
            contentContainerStyle={{paddingBottom: 8}}
            data={isLoading ? dummyServiceList : filteredDataSource}
            keyboardShouldPersistTaps="always"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
            renderItem={renderItem}
            horizontal={false}
            numColumns={3}
            keyExtractor={(item, index) =>
              item._id ? item._id.toString() : index.toString()
            }
            ListEmptyComponent={
              isLoading ? dummyServiceList : CustomerEmptyComponent
            }
          />

          <TouchableOpacity
            style={{
              width: 130,
              height: 44,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor:
                selectedServicesId.length > 0 && filteredDataSource.length > 0
                  ? Colors.SECONDARY_COLOR
                  : Colors.DISABLE_BUTTON_COLOR,
              borderRadius: 8,
              marginBottom: 90,
              alignSelf: 'center',
            }}
            activeOpacity={1}
            onPress={() =>
              selectedServicesId.length > 0 && filteredDataSource.length > 0 ? confirmButtonAction() : null
            }>
            <Text
              Text
              style={{
                fontFamily: Fonts.Gibson_Regular,
                fontSize: 16,
                color: Colors.WHITE_COLOR,
              }}
              numberOfLines={1}>
              {t(Translations.CONFIRM)}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

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
    </>
  );
};

export default ServiceListScreen;

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.BACKGROUND_COLOR,
    width: DisplayUtils.setWidth(100),
    height: 70,
    borderBottomColor: Colors.LINE_SEPARATOR_COLOR,
    borderBottomWidth: 0.5,
  },
});
