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
  ScrollView,
  LogBox,
  Linking,
  BackHandler,
  I18nManager,
} from 'react-native';
import LottieView from 'lottie-react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/core';
import ContentLoader, {Rect, Circle, Path} from 'react-content-loader/native';
import {
  Colors,
  Fonts,
  Globals,
  Images,
  Strings,
  Translations,
} from '../../constants';
import LoadingIndicator from '../shared/loadingIndicator/LoadingIndicator';
import DataManager from '../../helpers/apiManager/DataManager';
import Utilities from '../../helpers/utils/Utilities';
import DisplayUtils from '../../helpers/utils/DisplayUtils';
import RBSheet from 'react-native-raw-bottom-sheet';
import {GetImage} from '../shared/getImage/GetImage';
import FastImage from 'react-native-fast-image';
import NO_DEPARTMENT_ICON from '../../assets/images/departmentEmptyIcon.svg';
import APIConnections from '../../helpers/apiManager/APIConnections';
import VitalsDetailsPopup from '../upcomingDetails/VitalDetailsPopUp';
import ImageView from 'react-native-image-viewing-rtl';
import Pdf from 'react-native-pdf';
import {GetLottieImage} from '../shared/getLottieImage/GetLottieImage';
import AddReviewPopUp from './AddReviewPopUp';
import {t} from 'i18next';
import AwesomeAlert from 'react-native-awesome-alerts';
import { responsiveWidth,responsiveHeight } from 'react-native-responsive-dimensions';
const PreviousAppointmentDetails = props => {
  const {selectedAppointment_id, selectedAppointmentType, isFrom} =
    props.route.params;
  const layout = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [isLoaderLoading, setIsLoaderLoading] = useState(false);
  const [appointmentDetails, setAppointmentDetails] = useState();
  const [customerDetails, setCustomerDetails] = useState([]);
  const [customerNotesList, setCustomerNotesList] = useState();
  const [fullScreenImages, setFullScreenImages] = useState([]);
  const [imageFullScreenVisible, setImageFullScreenVisible] = useState([]);
  const refVitalDetailsPopupRBsheet = useRef();
  const refRBSheetAddNotes = useRef();
  const refRBSheetAddReview = useRef();
  const [refundStatusText, setRefundStatusText] = useState('');
  const [visibleRefundStatus, setVisibleRefundStatus] = useState(false);
    useEffect(()=>{
    console.log('1=====',appointmentDetails?.services.length)
  },[appointmentDetails])
  const dummyServicesList = [
    {
      id: '1',
      image: '',
      description: 'aaa bbb ccc dd eee ffff G',
      genderSelection: 'male',
    },
    {
      id: '2',
      image: '',
      description: 'aaa bbb ccc dd eee ffff G',
      genderSelection: 'male',
    },
    {
      id: '3',
      image: '',
      description: 'aaa bbb ccc dd eee ffff G',
      genderSelection: 'male',
    },
    {
      id: '3',
      image: '',
      description: 'aaa bbb ccc dd eee ffff G',
      genderSelection: 'male',
    },
    {
      id: '4',
      image: '',
      description: 'aaa bbb ccc dd eee ffff G',
      genderSelection: 'male',
    },
  ];

  var statusText = 'at';
  if (appointmentDetails?.status === 'PENDING') {
    statusText = 'is scheduled at';
  } else if (appointmentDetails?.status === 'ARRIVED') {
    statusText = 'presence is marked at';
  } else if (appointmentDetails?.status === 'SERVING') {
    statusText = 'started serving at';
  } else if (appointmentDetails?.status === 'SERVED') {
    statusText = 'at';
  } else if (appointmentDetails?.status === 'CANCELLED') {
    statusText = 'at';
  } else if (appointmentDetails?.status === 'NOSHOW') {
    statusText = 'at';
  } else {
    statusText = 'at';
  }

  var CompletedStatusText = '';
  if (appointmentDetails?.status === 'PENDING') {
    CompletedStatusText =
      Utilities.getUtcToLocalWithFormat(
        appointmentDetails?.dateFrom,
        Utilities.isBusiness24HrTimeFormat() ? 'HH:mm' : 'hh:mm A',
      ) +
      ' ' +
      Utilities.checkDate(appointmentDetails?.dateFrom) +
      ' ' +
      '(' +
      Utilities.getUtcToLocalWithFormat(
        appointmentDetails.dateFrom,
        'DD-MMM-YYYY, dddd',
      ) +
      ')';
  } else if (appointmentDetails?.status === 'SERVED') {
    CompletedStatusText =
      Utilities.getUtcToLocalWithFormat(
        appointmentDetails?.servingDate,
        Utilities.isBusiness24HrTimeFormat() ? 'HH:mm' : 'hh:mm A',
      ) +
      ' ' +
      Utilities.checkDate(appointmentDetails?.servingDate) +
      ' ' +
      '(' +
      Utilities.getUtcToLocalWithFormat(
        appointmentDetails?.servingDate,
        'DD-MMM-YYYY, dddd',
      ) +
      ')';
  } else if (appointmentDetails?.status === 'SERVING') {
    CompletedStatusText =
      Utilities.getUtcToLocalWithFormat(
        appointmentDetails?.servingDate,
        Utilities.isBusiness24HrTimeFormat() ? 'HH:mm' : 'hh:mm A',
      ) +
      ' ' +
      Utilities.checkDate(appointmentDetails?.servingDate) +
      ' ' +
      '(' +
      Utilities.getUtcToLocalWithFormat(
        appointmentDetails?.servingDate,
        'DD-MMM-YYYY, dddd',
      ) +
      ')';
  } else if (appointmentDetails?.status === 'ARRIVED') {
    CompletedStatusText =
      Utilities.getUtcToLocalWithFormat(
        appointmentDetails?.arrivingDate,
        Utilities.isBusiness24HrTimeFormat() ? 'HH:mm' : 'hh:mm A',
      ) +
      ' ' +
      Utilities.checkDate(appointmentDetails?.arrivingDate) +
      ' ' +
      '(' +
      Utilities.getUtcToLocalWithFormat(
        appointmentDetails?.arrivingDate,
        'DD-MMM-YYYY, dddd',
      ) +
      ')';
  } else if (appointmentDetails?.status === 'CANCELLED') {
    CompletedStatusText =
      Utilities.getUtcToLocalWithFormat(
        appointmentDetails?.dateFrom,
        Utilities.isBusiness24HrTimeFormat() ? 'HH:mm' : 'hh:mm A',
      ) +
      ' ' +
      Utilities.checkDate(appointmentDetails?.dateFrom) +
      ' ' +
      '(' +
      Utilities.getUtcToLocalWithFormat(
        appointmentDetails?.dateFrom,
        'DD-MMM-YYYY, dddd',
      ) +
      ')';
  } else if (appointmentDetails?.status === 'NOSHOW') {
    CompletedStatusText =
      Utilities.getUtcToLocalWithFormat(
        appointmentDetails?.dateFrom,
        Utilities.isBusiness24HrTimeFormat() ? 'HH:mm' : 'hh:mm A',
      ) +
      ' ' +
      Utilities.checkDate(appointmentDetails?.dateFrom) +
      ' ' +
      '(' +
      Utilities.getUtcToLocalWithFormat(
        appointmentDetails?.dateFrom,
        'DD-MMM-YYYY, dddd',
      ) +
      ')';
  } else {
    CompletedStatusText =
      Utilities.getUtcToLocalWithFormat(
        appointmentDetails?.dateFrom,
        Utilities.isBusiness24HrTimeFormat() ? 'HH:mm' : 'hh:mm A',
      ) +
      ' ' +
      Utilities.checkDate(appointmentDetails?.dateFrom) +
      ' ' +
      '(' +
      Utilities.getUtcToLocalWithFormat(
        appointmentDetails?.dateFrom,
        'DD-MMM-YYYY, dddd',
      ) +
      ')';
  }

  useEffect(() => {
    LogBox.ignoreLogs(['VirtualizedLists should never be nested']);
  }, []);
  useEffect(() => {
    if (selectedAppointmentType === 'Booking') {
      getBookingAppointmentDetails();
    } else {
      getQueueAppointmentDetails();
    }
  }, []);

  const backBUttonPressAction = () => {
    navigation.goBack();
  };
  const configureRefundStatus = appointment => {
    console.log('appointment ----', appointment);
    if (appointment.status === 'CANCELLED') {
      if (appointment.paymentType === 'online') {
        if (appointment.refundStatus === 'PENDING') {
          setVisibleRefundStatus(true);
          setRefundStatusText(
            t(Translations.REFUND_FOR) +
              Utilities.getCurrencyFormattedPrice(appointment.refundAmount) +
              t(
                Translations.HAS_BEEN_INITIATED_SUCCESSFULLY_REFUND_WILL_BE_PROCESSED_IN,
              ),
          );
        } else if (appointment.refundStatus === 'PAID') {
          setVisibleRefundStatus(true);
          setRefundStatusText(
            t(Translations.REFUND_FOR) +
              Utilities.getCurrencyFormattedPrice(appointment.refundAmount) +
              t(Translations.HAS_BEEN_SUCCESSFULLY_COMPLETED),
          );
        } else {
          setVisibleRefundStatus(false);
        }
      } else if (appointment.refundStatus === 'PENDING') {
        setVisibleRefundStatus(true);
        const _status = `${Utilities.getCurrencyFormattedPrice(
          appointment.refundAmount,
        )} ${t(Translations.REFUND_AVAILABLE)}`;
        console.log('************', _status);
        setRefundStatusText(`${_status}`);
      } else if (appointment.refundStatus === 'PAID') {
        setVisibleRefundStatus(true);
        setRefundStatusText(
          t(Translations.REFUND_FOR) +
            Utilities.getCurrencyFormattedPrice(appointment.refundAmount) +
            t(Translations.HAS_BEEN_SUCCESSFULLY_COMPLETED),
        );
      } else {
        setVisibleRefundStatus(false);
      }
    }
  };

  //API CALLS
  /**
           *
           * Purpose: Get user details
           * Created/Modified By: Jenson
           * Created/Modified Date: 04 Jan 2022
           * Steps:
               1.fetch business details from API and append to state variable
    */
  const getBookingAppointmentDetails = () => {
    DataManager.getBookingAppointmentDetails(selectedAppointment_id).then(
      ([isSuccess, message, data]) => {
        if (isSuccess === true) {
          setIsLoading(false);
          configureRefundStatus(data.objects);
          setAppointmentDetails(data.objects);
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
           * Purpose: Get user details
           * Created/Modified By: Jenson
           * Created/Modified Date: 04 Jan 2022
           * Steps:
               1.fetch business details from API and append to state variable
    */
  const getQueueAppointmentDetails = () => {
    DataManager.getQueueAppointmentDetails(selectedAppointment_id).then(
      ([isSuccess, message, data]) => {
        if (isSuccess === true) {
          setIsLoading(false);
          configureRefundStatus(data.objects);
          setAppointmentDetails(data.objects);
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
  //API Calls
  const performAddReview = (rating, review) => {
    setIsLoading(true);
    var body = {};
    if (selectedAppointmentType === 'Booking') {
      body = {
        [APIConnections.KEYS.BUSINESS_ID]: Globals.BUSINESS_ID,
        [APIConnections.KEYS.USER_ID]: appointmentDetails?.servingUser_id?._id,
        [APIConnections.KEYS.COMMENT]: review,
        [APIConnections.KEYS.RATING]: rating,
        [APIConnections.KEYS.AUTHOR_ID]: Globals.USER_DETAILS._id,
        [APIConnections.KEYS.BOOKING_ID]: selectedAppointment_id,
      };
    } else {
      body = {
        [APIConnections.KEYS.BUSINESS_ID]: Globals.BUSINESS_ID,
        [APIConnections.KEYS.USER_ID]: appointmentDetails?.servingUser_id?._id,
        [APIConnections.KEYS.COMMENT]: review,
        [APIConnections.KEYS.RATING]: rating,
        [APIConnections.KEYS.AUTHOR_ID]: Globals.USER_DETAILS._id,
        [APIConnections.KEYS.QUEUE_ID]: selectedAppointment_id,
      };
    }

    DataManager.performAddReview(body).then(
      ([isSuccess, message, responseData]) => {
        if (isSuccess === true) {
          if (selectedAppointmentType === 'Booking') {
            getBookingAppointmentDetails();
          } else {
            getQueueAppointmentDetails();
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

  const filePreviewButtonAction = url => {
    Keyboard.dismiss();
    navigation.navigate('FilePreviewScreen', {
      titleText: Utilities.getFileName(url),
      url: url,
      isLocalFile: false,
    });
  };
  const imageFullscreenButtonAction = url => {
    Keyboard.dismiss();

    setFullScreenImages([
      {
        uri: url,
      },
    ]);
    setImageFullScreenVisible(true);
  };
  //Shimmer loader for the flatList
  const ProfileLoader = props => (
    <ContentLoader
      transform={[{scaleX: I18nManager.isRTL ? -1 : 1}]}
      speed={1.5}
      width={'100%'}
      height={120}
      //viewBox="0 0 320 "
      backgroundColor="#dadada"
      foregroundColor="#eee"
      animate={true}
      {...props}>
      <Rect x="90" y="30" rx="5" ry="5" width="120" height="8" />
      <Rect x="90" y="50" rx="5" ry="5" width="180" height="8" />
      <Rect x="90" y="70" rx="5" ry="5" width="230" height="8" />
      <Rect x="90" y="90" rx="5" ry="5" width="120" height="8" />
      <Rect x="90" y="110" rx="5" ry="5" width="60" height="8" />
      <Rect x="30" y="40" rx="25" ry="25" width="50" height="50" />
    </ContentLoader>
  );
  //Shimmer loader for the previous visit
  const NoteLoader = props => (
    <ContentLoader
      transform={[{scaleX: I18nManager.isRTL ? -1 : 1}]}
      speed={1.5}
      width={'100%'}
      height={100}
      //viewBox="0 0 320 "
      backgroundColor="#dadada"
      foregroundColor="#eee"
      animate={true}
      {...props}>
      <Rect x="95%" y="25" rx="3" ry="3" width="5" height="5" />
      <Rect x="95%" y="35" rx="3" ry="3" width="5" height="5" />
      <Rect x="95%" y="45" rx="3" ry="3" width="5" height="5" />
      <Rect x="20" y="20" rx="0" ry="0" width="100" height="15" />
      <Rect x="130" y="20" rx="0" ry="0" width="100" height="15" />
      <Rect x="20" y="50" rx="5" ry="5" width="180" height="8" />
      <Rect x="20" y="70" rx="5" ry="5" width="230" height="8" />
      <Rect x="20" y="90" rx="5" ry="5" width="260" height="8" />
    </ContentLoader>
  );

  //Shimmer loader for the previous visit
  const PreviousVisitsLoader = props => (
    <ContentLoader
      transform={[{scaleX: I18nManager.isRTL ? -1 : 1}]}
      speed={1.5}
      width={'100%'}
      height={50}
      //viewBox="0 0 320 "
      backgroundColor="#dadada"
      foregroundColor="#eee"
      animate={true}
      {...props}>
      <Rect x="20" y="20" rx="0" ry="0" width="150" height="10" />
    </ContentLoader>
  );
  //Shimmer loader for the status button
  const StatusButtonLoader = props => (
    <ContentLoader
      transform={[{scaleX: I18nManager.isRTL ? -1 : 1}]}
      speed={1.5}
      width={'100%'}
      height={50}
      //viewBox="0 0 320 "
      backgroundColor="#dadada"
      foregroundColor="#eee"
      animate={true}
      {...props}>
      <Rect x="20" y="0" rx="15" ry="15" width="100" height="30" />
      <Rect x="130" y="0" rx="15" ry="15" width="100" height="30" />
      <Rect x="80%" y="0" rx="25" ry="25" width="50" height="50" />
    </ContentLoader>
  );
  //Shimmer loader for the previous visit
  const ServicesListLoader = props => (
    <ContentLoader
      transform={[{scaleX: I18nManager.isRTL ? -1 : 1}]}
      speed={1.5}
      width={100}
      height={60}
      //viewBox="0 0 320 "
      backgroundColor="#dadada"
      foregroundColor="#eee"
      animate={true}
      {...props}>
      <Rect x="35" y="10" rx="0" ry="0" width="40" height="30" />
      <Rect x="10" y="50" rx="2" ry="2" width="90" height="10" />
    </ContentLoader>
  );
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

  const renderNotesImageItem = ({item, index}) => {
    return <FileAttachmentList item={item} itemIndex={index} />;
  };

  const FileAttachmentList = ({item, itemIndex}) => {
    if (item !== undefined && (item?.length || 0) > 0) {
      let fileType = Utilities.getFileExtension(item);
      if (fileType === 'pdf') {
        return (
          <>
            <TouchableOpacity
              onPress={() => filePreviewButtonAction(item)}
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 12,
              }}>
              <Pdf
                source={{uri: item, cache: true}}
                pointerEvents={'none'}
                onLoadComplete={(numberOfPages, filePath) => {
                  //console.log(`Number of pages: ${numberOfPages}`);
                }}
                onPageChanged={(page, numberOfPages) => {
                  //console.log(`Current page: ${page}`);
                }}
                onError={error => {
                  //console.log(`FileAttachmentList error: ${error}`);
                }}
                onPressLink={uri => {
                  //console.log(`Link pressed: ${uri}`);
                }}
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 5,
                  borderWidth: 1,
                  borderColor: Colors.PRIMARY_COLOR,
                }}
                renderActivityIndicator={progress => {
                  //console.log(progress);
                  return <ActivityIndicator color={Colors.PRIMARY_COLOR} />;
                }}
                singlePage
              />
            </TouchableOpacity>
          </>
        );
      } else if (fileType === 'doc' || fileType === 'docx') {
        return (
          <>
            <TouchableOpacity
              onPress={() => filePreviewButtonAction(item)}
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 12,
              }}>
              <Image
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 5,
                  borderWidth: 1,
                  borderColor: Colors.PRIMARY_COLOR,
                }}
                source={Images.WORD_FILE_ICON}
                resizeMode={FastImage.resizeMode.contain}
              />
            </TouchableOpacity>
          </>
        );
      } else {
        return (
          <>
            <TouchableOpacity
              onPress={() => imageFullscreenButtonAction(item)}
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 12,
              }}>
              <FastImage
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 5,
                  borderWidth: 1,
                  borderColor: Colors.PRIMARY_COLOR,
                }}
                source={{
                  uri: item,
                  priority: FastImage.priority.normal,
                }}
                resizeMode={FastImage.resizeMode.cover}
              />
            </TouchableOpacity>
          </>
        );
      }
    } else {
      return null;
    }
  };

  const renderServicesItem = ({item}) => {
    return <ServicesItem item={item} />;
  };

  const ServicesItem = ({item}) => {
    return (
      <View
        style={{
          borderWidth: 1,
          width: 110,
          height: 80,
          borderRadius: 8,
          borderColor: Colors.SHADOW_COLOR,
          marginRight: 10,
        }}>
        {isLoading ? (
          <ServicesListLoader />
        ) : (
          <>
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
                  width: 40,
                  height: 30,
                  alignSelf: 'center',
                }}
                url={item.lottieImageName}
              />
            ) : item.image !== '' && item.image !== undefined ? (
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
              style={{
                flexDirection: 'row',
                marginTop: 12,
                alignSelf: 'center',
              }}>
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
          </>
        )}
      </View>
    );
  };
  const openPhoneCall = phoneNumber => {
    var message = t(Translations.PHONE_NUMBER_IS_EMPTY);
    if (phoneNumber) {
      Linking.openURL(`tel:${phoneNumber}`);
    } else {
      Utilities.showToast(t(Translations.FAILED), message, 'error', 'bottom');
    }
  };
  const AddReviewPopup = () => {
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
          appointmentDetails={
            appointmentDetails !== undefined ? appointmentDetails : ''
          }
          onAddReview={handleOnReviewAdded}
        />
      </RBSheet>
    );
  };
  const handleOnReviewAdded = (rating, review) => {
    console.log('ADD');
    performAddReview(rating, review);
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
      if (item?.servingUser_id?.departments instanceof Array && item?.servingUser_id?.departments?.length > 0) {
        departmentName = item?.servingUser_id?.departments
          .map(dep => dep?.department_name)
          .join(', ');
      } else if (
        item?.servingUser_id?.department_id !== undefined &&
        item?.servingUser_id?.department_id !== null
      ) {
        departmentName =
          item?.servingUser_id?.department_id?.department_name ||
          item?.servingUser_id?.department_id?.role ||
          'N/A';
      } else {
        departmentName = item?.servingUser_id?.designationInfo?.designation || 'N/A';
      }
    }
    return departmentName;
  };

  const scheduleAppointmentAction = () => {
    // set serving user info
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
    Globals.SHARED_VALUES.IS_RESCHEDULE = false;

    //Check business types
    if (Utilities.isServiceBasedBusiness() === true) {
      //Navigate to services with selected services
      navigation.navigate('ServiceListScreen');
    } else {
      navigation.navigate('BookingQueueScreen');
    }
  };

  //final return
  return (
    <>
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
        <VitalDetailsPopup />
        <AddReviewPopup />
        <LoadingIndicator visible={isLoaderLoading} />
        <ImageView
          images={fullScreenImages}
          imageIndex={0}
          visible={imageFullScreenVisible}
          onRequestClose={() => setImageFullScreenVisible(false)}
        />
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
            }}>
            <TouchableOpacity
              style={{justifyContent: 'center', marginRight: 20}}
              onPress={() => backBUttonPressAction()}>
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
              {t(Translations.APPOINTMENT_DETAILS)}
            </Text>
          </View>
        </View>
        <ScrollView contentContainerStyle={styles.scrollViewContent} >
          <View
            style={{
              borderTopWidth: 0.25,
              borderBottomWidth: 0.25,
              borderBottomColor: Colors.TAB_VIEW_LABEL_COLOR,
              borderTopColor: Colors.TAB_VIEW_LABEL_COLOR,

              paddingBottom: 20,
            }}>
            {appointmentDetails?.vitalsUpdated === true ? (
              <TouchableOpacity
                onPress={() => refVitalDetailsPopupRBsheet.current.open()}
                style={{
                  position: 'absolute',
                  right: 15,
                  top: 8,
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
                  }}
                />
              </TouchableOpacity>
            ) : null}

            {isLoading ? (
              <PreviousVisitsLoader />
            ) : (
              <>
                <Text
                  style={{
                    color: Colors.CUSTOMER_NAME_COLOR,
                    fontSize: 14,
                    fontFamily: Fonts.Gibson_Regular,
                    marginLeft: 20,
                    marginTop: 20,
                    textAlign: 'left',
                  }}>
                  {t(Translations.YOUR)}{' '}
                  <Text
                    style={{
                      fontFamily: Fonts.Gibson_SemiBold,
                      color: Colors.PRIMARY_TEXT_COLOR,
                    }}>
                    {t(Translations.CONSULTATION)}
                  </Text>{' '}
                  {appointmentDetails?.status === 'SERVED'
                    ? t(Translations.WAS_SERVED_BY)
                    : t(Translations.WAS_WITH)}
                </Text>
              </>
            )}
            <View style={{flexDirection: 'row'}}>
              {isLoading ? (
                <ProfileLoader />
              ) : (
                <>
                  <View style={{marginHorizontal: 12, marginTop: 30}}>
                    <GetImage
                      style={{
                        marginTop: 5,
                        marginLeft: 10,
                        width: 50,
                        height: 50,
                        borderRadius: 50 / 2,
                        borderWidth: 1.5,
                        borderColor: Colors.PRIMARY_COLOR,
                      }}
                      fullName={(
                        appointmentDetails?.servingUser_id?.fullName || 'N/A'
                      ).trim()}
                      alphabetColor={Colors.SECONDARY_COLOR}
                      url={appointmentDetails?.servingUser_id?.image}
                    />
                  </View>
                  <View style={{marginTop: 30}}>
                    <Text
                      style={{
                        fontFamily: Fonts.Gibson_SemiBold,
                        color: Colors.PRIMARY_TEXT_COLOR,
                        fontSize: 14,
                        textAlign: 'left',
                      }}>
                      {appointmentDetails?.servingUser_id?.name || 'N/A'}
                    </Text>

                    {appointmentDetails?.servingUser_id?.department_id?.role !==
                    undefined ? (
                      <Text
                        style={{
                          color: Colors.HOSPITAL_NAME_COLOR,
                          fontFamily: Fonts.Gibson_Regular,
                          fontSize: 12,
                          marginTop: 12,
                          textAlign: 'left',
                        }}>
                        {
                          appointmentDetails?.servingUser_id?.department_id
                            ?.role
                        }
                      </Text>
                    ) : null}
         {appointmentDetails?.servingUser_id?.department_id
                          ?.department_name ?
                    <Text
                      style={{
                        color: Colors.HOSPITAL_NAME_COLOR,
                        fontSize: 12,
                        fontFamily: Fonts.Gibson_Regular,
                        marginTop: 8,
                        textAlign: 'left',
                      }}>
                      {
                        appointmentDetails?.servingUser_id?.department_id
                          ?.department_name
                      }
                    </Text>
                    : null}
                  </View>
                </>
              )}
            </View>
            {isLoading ? (
              <PreviousVisitsLoader />
            ) : (
              <>
                <Text
                  style={{
                    color: Colors.INACTIVE_BOTTOM_BAR_COLOR,
                    fontFamily: Fonts.Gibson_Regular,
                    fontSize: 12,
                    marginLeft: 86,
                    lineHeight: 20,
                    textAlign: 'left',
                    marginHorizontal:responsiveWidth(5)
                  }}>
                  {statusText}{' '}
                  <Text
                    style={{
                      color: Colors.SECONDARY_COLOR,
                      fontSize: 12,
                      fontFamily: Fonts.Gibson_SemiBold,
                    }}>
                    {CompletedStatusText}
                  </Text>
                  {appointmentDetails?.status === 'CANCELLED'
                    ? t(Translations.STAYS_CONNECTED)
                    : appointmentDetails?.status === 'NOSHOW'
                    ? t(Translations.STAYS_CANCELLED_ON_ABSENCE_OF_CUSTOMER)
                    : ''}
                </Text>
              </>
            )}
            <View>
              {isLoading ? (
                <PreviousVisitsLoader />
              ) : appointmentDetails?.services?.length > 0 ? (
                <Text
                  style={{
                    fontFamily: Fonts.Gibson_SemiBold,
                    color: Colors.PRIMARY_TEXT_COLOR,
                    fontSize: 12,
                    marginTop: 15,
                    marginBottom: 15,
                    marginLeft: 15,
                  }}>
                  {t(Translations.SERVICES)}
                </Text>
              ) : null}
                          <View style={{
                          paddingLeft:I18nManager.isRTL ?responsiveWidth(1) :responsiveWidth(3),
                          paddingRight:I18nManager.isRTL ?responsiveWidth(3) :responsiveWidth(1)}}>
              <FlatList
                   contentContainerStyle={{flexGrow: 1,
                    flexDirection:I18nManager.isRTL && appointmentDetails?.services.length<=appointmentDetails?.services.length
                     ?appointmentDetails?.services.length===5?'row':'row-reverse':'row'
                   }}
                   data={
                  isLoading ? dummyServicesList : appointmentDetails?.services
                }
                keyboardShouldPersistTaps="handled"
                renderItem={renderServicesItem}
                keyExtractor={(item, index) =>
                  item._id ? item._id.toString() : index.toString()
                }
                inverted={I18nManager.isRTL && appointmentDetails?.services.length<=appointmentDetails?.services.length 
                   ? appointmentDetails?.services.length===5?false: true : false}
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

            {isLoading ? (
              <PreviousVisitsLoader />
            ) : visibleRefundStatus ? (
              <View style={{}}>
                <Text
                  style={{
                    fontFamily: Fonts.Gibson_SemiBold,
                    color: Colors.PRIMARY_TEXT_COLOR,
                    fontSize: 12,
                    marginTop: 15,
                    marginBottom: 15,
                    marginLeft: 15,
                  }}>
                  {t(Translations.REFUND)}
                </Text>
                {appointmentDetails?.refundStatus === 'PENDING' ? (
                  <View style={{flexDirection: 'row'}}>
                    {/* <Text
                      style={{
                        color: Colors.NOTES_DETAILS_DATE_COLOR,
                        fontFamily: Fonts.Gibson_Regular,
                        fontSize: 12,
                        marginLeft: 15,
                        textAlign: 'left',
                      }}>
                      {Utilities.getCurrencyFormattedPrice(
                        appointmentDetails?.refundAmount,
                      )}
                    </Text> */}
                    <Text
                      style={{
                        color: Colors.NOTES_DETAILS_DATE_COLOR,
                        fontFamily: Fonts.Gibson_Regular,
                        fontSize: 12,
                        marginLeft: responsiveWidth(4),
                        marginRight: responsiveWidth(4),
                        textAlign: 'left',
                        lineHeight:18,
                      }}
                      numberOfLines={2}>
                        {refundStatusText}
                    </Text>
                  </View>
                ) : (
                  <Text
                    style={{
                      color: Colors.NOTES_DETAILS_DATE_COLOR,
                      fontFamily: Fonts.Gibson_Regular,
                      fontSize: 12,
                      marginLeft: responsiveWidth(4),
                      marginRight: responsiveWidth(4),
                      textAlign: 'left',
                    }}>
                   {refundStatusText}
                    {/* {t(Translations.REFUND_AVAILABLE)} */}
                  </Text>
                )}
              </View>
            ) : null}
          </View>
          {/* NOTES LABEL */}
          <View
            style={{
              borderBottomWidth: 0.25,
              borderBottomColor: Colors.TAB_VIEW_LABEL_COLOR,
            }}>
            {isLoading ? (
              <PreviousVisitsLoader />
            ) : (
              <View style={{flexDirection: 'row'}}>
                <Text
                  style={{
                    fontFamily: Fonts.Gibson_SemiBold,
                    color: Colors.PRIMARY_TEXT_COLOR,
                    fontSize: 12,
                    marginTop: 15,
                    marginBottom: 15,
                    marginLeft: 15,
                    textAlign: 'left',
                  }}>
                  {t(Translations.NOTES)}
                </Text>
              </View>
            )}
          </View>
          {/* NOTES TITLE */}
          <View style={{flex: 1}}>
            {(appointmentDetails?.notes !== undefined &&
              appointmentDetails?.notes?.trimStart() !== '') ||
            appointmentDetails?.images?.length > 0 ? (
              appointmentDetails?.images.length > 0 ? (
                <View>
                  <Text
                    style={{
                      color: Colors.NOTES_CONTENT,
                      fontFamily: Fonts.Gibson_Light,
                      fontSize: 12,
                      marginLeft: 16,
                      marginTop: 10,
                      textAlign: 'left',
                    }}>
                    {appointmentDetails?.notes}
                  </Text>
                  <View
                    style={{alignItems: 'flex-start',flexDirection:I18nManager.isRTL ?'row-reverse':'row', marginHorizontal: 16}}>
                    <FlatList
                      contentContainerStyle={{
                        // marginLeft: 16,
                        marginTop: 10,
                        flexDirection:I18nManager.isRTL ?'row-reverse':'row'
                        // paddingLeft: I18nManager.isRTL ? 16 : 0,
                      }}
                      data={appointmentDetails?.images}
                      keyboardShouldPersistTaps="handled"
                      renderItem={renderNotesImageItem}
                      inverted={I18nManager.isRTL?true:false}
                      keyExtractor={(item, index) =>
                        item._id ? item._id.toString() : index.toString()
                      }
                      onEndReachedThreshold={0.2}
                      horizontal
                      showsHorizontalScrollIndicator={false}
                    />
                  </View>
                </View>
              ) : (
                <Text
                  style={{
                    color: Colors.NOTES_CONTENT,
                    fontFamily: Fonts.Gibson_Light,
                    fontSize: 12,
                    marginLeft: 16,
                    marginTop: 10,
                    textAlign: 'left',
                  }}>
                  {appointmentDetails?.notes}
                </Text>
              )
            ) : isLoading ? (
              <PreviousVisitsLoader />
            ) : (
              <Text
                style={{
                  color: Colors.NOTES_EMPTY_COLOR,
                  fontFamily: Fonts.Gibson_SemiBold,
                  fontSize: 10,
                  marginTop: 10,
                  marginLeft: 16,
                  textAlign: 'left',
                }}>
                {t(Translations.NO_NOTES_ADDED)}
              </Text>
            )}
          </View>
          {/* RATING AND REVIEW */}
          {appointmentDetails?.review_id?.rating !== undefined &&
          Utilities.isReviewAndRatingEnabled() === true ? (
            <View style={{backgroundColor:'transparent',marginBottom:responsiveHeight(25)}}>
              <View
                style={{
                  borderBottomWidth: 0.25,
                  borderBottomColor: Colors.TAB_VIEW_LABEL_COLOR,
                  borderTopColor: Colors.TAB_VIEW_LABEL_COLOR,
                  borderTopWidth: 0.25,
                  marginTop: 20,
                }}>
                {isLoading ? (
                  <PreviousVisitsLoader />
                ) : (
                  <Text
                    style={{
                      fontFamily: Fonts.Gibson_SemiBold,
                      color: Colors.PRIMARY_TEXT_COLOR,
                      fontSize: 12,
                      marginTop: 15,
                      marginBottom: 15,
                      marginLeft: 15,
                    }}>
                    {t(Translations.RATING_AND_REVIEW)}
                  </Text>
                )}
              </View>
              {/* YOUR RATING */}
              <View style={{flexDirection: 'row'}}>
                <Text
                  style={{
                    fontFamily: Fonts.Gibson_Regular,
                    color: Colors.SECONDARY_TEXT_COLOR,
                    fontSize: 14,
                    marginTop: 15,
                    marginLeft: 15,
                  }}>
                  {t(Translations.YOUR_RATING)} :
                </Text>

                <Text
                  style={{
                    fontFamily: Fonts.Gibson_SemiBold,
                    color: Colors.PRIMARY_TEXT_COLOR,
                    fontSize: 14,
                    marginTop: 15,

                    marginLeft: 5,
                  }}>
                  {appointmentDetails?.review_id?.rating + ' out of 5'}
                </Text>
              </View>
              {/* REVIEW ADDED ON */}

              <View
                style={{
                  flexDirection: 'row',
                  width: DisplayUtils.setWidth(75),
                  marginLeft: 10,
                  marginTop: 15,
                }}>
                <Text
                  style={{
                    fontFamily: Fonts.Gibson_Regular,
                    color: Colors.SECONDARY_TEXT_COLOR,
                    fontSize: 14,
                    marginTop: 15,
                  }}>
                  {' '}
                  {t(Translations.REVIEW_ADDED_ON)} :{' '}
                </Text>
                <Text style={styles.timeText}>
                  {Utilities.getUtcToLocalWithFormat(
                    appointmentDetails?.review_id?.date,
                    'DD',
                  )}{' '}
                </Text>
                <Text style={styles.timeText}>
                  {Utilities.getUtcToLocalWithFormat(
                    appointmentDetails?.review_id?.date,
                    'MMM',
                  )}{' '}
                </Text>
                <Text style={styles.timeText}>
                  {Utilities.getUtcToLocalWithFormat(
                    appointmentDetails?.review_id?.date,
                    'YYYY',
                  )}{' '}
                </Text>
              </View>
              {/* YOUR COMMENT */}
              <Text
                style={{
                  fontFamily: Fonts.Gibson_Regular,
                  color: Colors.SECONDARY_TEXT_COLOR,
                  fontSize: 14,
                  marginTop: 15,
                  marginLeft: 15,
                  marginRight: 15,
                }}>
                {t(Translations.YOUR_COMMENT)} :{' '}
                <Text
                  style={{
                    fontFamily: Fonts.Gibson_SemiBold,
                    color: Colors.PRIMARY_TEXT_COLOR,
                    fontSize: 14,
                    marginTop: 15,
                    marginBottom: 15,
                    marginLeft: 15,
                  }}>
                  {appointmentDetails?.review_id?.comment}
                </Text>
              </Text>
            </View>
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
                    fontSize: 8,
                  }}>
                  {t(Translations.CALL)}
                </Text>
              </TouchableOpacity>
            </View>

            {/*WRITE A REVIEW */}
            {appointmentDetails.status === 'SERVED' &&
            Utilities.isReviewAndRatingEnabled() === true ? (
              <View
                style={{
                  flex: 1,
                  backgroundColor: Colors.WHITE_COLOR,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRightColor: Colors.SHADOW_COLOR,
                  borderRightWidth: 0.5,
                  opacity: appointmentDetails?.isReviewDone ? 0.2 : 1,
                }}>
                <TouchableOpacity
                  style={{marginTop: 10}}
                  activeOpacity={1}
                  onPress={() =>
                    appointmentDetails?.isReviewDone
                      ? null
                      : refRBSheetAddReview.current.open()
                  }>
                  <Image
                    source={Images.RATING_ICON}
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
                      fontSize: 8,
                    }}>
                    {t(Translations.WRITE_A_REVIEW)}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : null}

            {/*SCHEDULE */}
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
                onPress={() => scheduleAppointmentAction()}>
                <Image
                  source={Images.CALENDER_ICON_RESCHEDULE}
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
                    fontSize: 8,
                  }}>
                  {t(Translations.SCHEDULE_AN_APPOINTMENT)}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
        {/* BOTTOM BAR END*/}
      </View>
    </>
  );
};

export default PreviousAppointmentDetails;

const styles = StyleSheet.create({
  timeText: {
    fontFamily: Fonts.Gibson_SemiBold,
    color: Colors.PRIMARY_TEXT_COLOR,
    fontSize: 14,
    marginTop: 15,
    marginBottom: 15,
  },
  scrollViewContent: {
    minHeight: '100%',
    // justifyContent: 'center',
    // alignItems: 'center',
  },
});
