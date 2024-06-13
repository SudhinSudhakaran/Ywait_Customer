import React, {useState, useEffect, useRef} from 'react';
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  I18nManager,
  Dimensions,
} from 'react-native';
import moment from 'moment';
import {Pagination} from 'react-native-snap-carousel';
import Carousel from 'react-native-reanimated-carousel';
import DisplayUtils from '../../../helpers/utils/DisplayUtils';
import {
  Colors,
  Fonts,
  Globals,
  Images,
  Strings,
  Translations,
} from '../../../constants';
import Utilities from '../../../helpers/utils/Utilities';
import {GetTimerView} from '../../shared/getTimerView/GetTimerView';
import {t} from 'i18next';
import {reverse} from 'lodash';
import {responsiveWidth} from 'react-native-responsive-dimensions';

const TodaysBannerComponent = ({
  data,
  navigation,
  addReviewAction,
  ratingOkayAction,
  bannerCloseAction,
}) => {
  const width = Dimensions.get('window').width;
  const [isLoading, setIsLoading] = useState(true);
  const [
    todaysAppointmentBannerActiveIndex,
    setTodaysAppointmentBannerActiveIndex,
  ] = useState(0);

  console.log('Data in todays banner component', data);
  const todaysBannerCarouselRef = useRef();
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     todaysBannerCarouselRef?.current?.snapToNext();
  //   }, 6000);
  //   return () => clearInterval(interval);
  // }, []);
  const ratingButtonAction = item => {
    Globals.SHARED_VALUES.SELECTED_APPOINTMENT_INFO = item;
    addReviewAction(item);
  };

  const ratingOkayButtonAction = (item, index) => {
    ratingOkayAction(item, index);
  };

  const bannerCloseButtonAction = (item, index) => {
    bannerCloseAction(item, index);
  };

  /**
* Purpose: Render todays appointments banner
* Created/Modified By: Jenson
* Created/Modified Date: 28 Mar 2022
* Steps:
   1.pass the data from api to customer details child component
  */
  const renderTodaysBanner = ({item, index}) => {
    console.log('-----------------Todays Banner', item);
    if (item?.status === 'PENDING') {
      return <GetTodaysBannerNotArrivedCell item={item} index={index} />;
    } else if (item?.status === 'ARRIVED') {
      return <GetTodaysBannerArrivedCell item={item} index={index} />;
    } else if (item?.status === 'SERVING') {
      return <GetTodaysBannerServingCell item={item} index={index} />;
    } else if (item?.status === 'SERVED') {
      return <GetTodaysBannerServedCell item={item} index={index} />;
    } else {
      return <GetTodaysBannerNotSuccessCell item={item} index={index} />;
    }
  };

  const GetTodaysBannerNotArrivedCell = ({item, index}) => {
    //console.log('GetTodaysBannerNotArrivedCell item: ', item);
    return (
      <View
        style={{
          alignSelf: 'center',
          width: DisplayUtils.setWidth(93),
          height: 175,
          flexDirection: 'row',
          //Shadow props
          borderWidth: 0.4,
          borderColor: Colors.TEXT_PLACEHOLDER_COLOR,
          backgroundColor: '#E3E3E3',
          shadowColor: Colors.SHADOW_COLOR,
          shadowOffset: {width: 0, height: 4},
          shadowOpacity: 0.4,
          shadowRadius: 8,
          elevation: 8,
          borderRadius: 8,
        }}
        key={index}>
        <View style={{flex: 0.4, justifyContent: 'center'}}>
          <Image
            style={{
              width: 113,
              height: 108,
              alignSelf: 'center',
              resizeMode: 'contain',
            }}
            source={Images.NOT_ARRIVED_BANNER_ICON}
          />
        </View>

        <View style={{flex: 0.6}}>
          <TouchableOpacity
            onPress={() => bannerCloseButtonAction(item, index)}>
            <Image
              style={{
                width: 12,
                height: 12,
                position: 'absolute',
                right: 10,
                top: 10,
                resizeMode: 'contain',
                tintColor: Colors.APPOINTMENT_DETAILS_TEXT_GRAY_COLOR,
              }}
              source={Images.CLOSE_ICON}
            />
          </TouchableOpacity>

          <Text
            style={{
              fontFamily: Fonts.Gibson_Regular,
              fontSize: 12,
              color: Colors.PRIMARY_TEXT_COLOR,
              marginTop: 18,
              alignSelf: 'center',
            }}
            numberOfLines={1}>
            {t(Translations.YOU_WILL_BE_SERVED_BY)}
          </Text>

          <Text
            style={{
              fontFamily: Fonts.Gibson_SemiBold,
              fontSize: 12,
              color: Colors.BLACK_COLOR,
              marginTop: 12,
              alignSelf: 'center',
            }}
            numberOfLines={1}>
            {item?.servingUser_id?.name ||
              Globals.BUSINESS_DETAILS?.name ||
              Strings.APP_NAME}
          </Text>

          <Text
            style={{
              fontFamily: Fonts.Gibson_Regular,
              fontSize: 12,
              color: Colors.PRIMARY_TEXT_COLOR,
              marginTop: 12,
              alignSelf: 'center',
            }}
            numberOfLines={1}>
            {t(Translations.WITHIN)}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              marginTop: 12,
              alignSelf: 'center',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Image
              style={{
                width: 12,
                height: 12,
                resizeMode: 'contain',
                tintColor: Colors.SECONDARY_COLOR,
              }}
              source={Images.ALARM_CLOCK_DASHBOARD}
            />

            <GetTimerView
              style={{
                marginLeft: 6,
                marginRight: 6,
                fontFamily: Fonts.Gibson_SemiBold,
                fontSize: 15,
                color: Colors.BLACK_COLOR,
              }}
              date={item?.dateFrom}
            />
          </View>

          <View
            style={{
              flexDirection: 'row',
              marginTop: 12,
              alignSelf: 'center',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Image
              style={{
                width: 12,
                height: 12,
                resizeMode: 'contain',
                tintColor: Colors.SECONDARY_COLOR,
              }}
              source={Images.QUEUE_POSITION_ICON}
            />

            <Text
              style={{
                marginLeft: 6,
                marginRight: 6,
                fontFamily: Fonts.Gibson_Regular,
                fontSize: 12,
                color: Colors.PRIMARY_TEXT_COLOR,
              }}>
              {t(Translations.QUEUE)}: {item?.queueIndex || '1'}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const GetTodaysBannerArrivedCell = ({item, index}) => {
    //console.log('GetTodaysBannerArrivedCell item: ', item);
    return (
      <View
        style={{
          alignSelf: 'center',
          width: DisplayUtils.setWidth(93),
          height: 175,
          flexDirection: 'row',
          //Shadow props
          borderWidth: 0.4,
          borderColor: Colors.TEXT_PLACEHOLDER_COLOR,
          backgroundColor: '#E3E3E3',
          shadowColor: Colors.SHADOW_COLOR,
          shadowOffset: {width: 0, height: 4},
          shadowOpacity: 0.4,
          shadowRadius: 8,
          elevation: 8,
          borderRadius: 8,
        }}
        key={index}>
        <View style={{flex: 0.4, justifyContent: 'center'}}>
          <Image
            style={{
              width: 113,
              height: 108,
              alignSelf: 'center',
              resizeMode: 'contain',
            }}
            source={Images.ARRIVED_BANNER_ICON}
          />
        </View>

        <View style={{flex: 0.6}}>
          <TouchableOpacity
            onPress={() => bannerCloseButtonAction(item, index)}>
            <Image
              style={{
                width: 12,
                height: 12,
                position: 'absolute',
                right: 10,
                top: 10,
                resizeMode: 'contain',
                tintColor: Colors.APPOINTMENT_DETAILS_TEXT_GRAY_COLOR,
              }}
              source={Images.CLOSE_ICON}
            />
          </TouchableOpacity>

          <Text
            style={{
              fontFamily: Fonts.Gibson_Regular,
              fontSize: 12,
              color: Colors.PRIMARY_TEXT_COLOR,
              marginTop: 40,
              alignSelf: 'center',
            }}
            numberOfLines={1}>
            {t(Translations.YOU_WILL_BE_SERVED_BY)}
          </Text>

          <Text
            style={{
              fontFamily: Fonts.Gibson_SemiBold,
              fontSize: 12,
              color: Colors.BLACK_COLOR,
              marginTop: 16,
              alignSelf: 'center',
            }}
            numberOfLines={1}>
            {item?.servingUser_id?.name ||
              Globals.BUSINESS_DETAILS?.name ||
              Strings.APP_NAME}
          </Text>

          <View
            style={{
              flexDirection: 'row',
              marginTop: 12,
              alignSelf: 'center',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Image
              style={{
                width: 12,
                height: 12,
                resizeMode: 'contain',
                tintColor: Colors.SECONDARY_COLOR,
              }}
              source={Images.ALARM_CLOCK_DASHBOARD}
            />

            <Text
              style={{
                marginLeft: 6,
                marginRight: 6,
                fontFamily: Fonts.Gibson_Regular,
                fontSize: 12,
                color: Colors.PRIMARY_TEXT_COLOR,
              }}>
              {t(Translations.ETS)}:{' '}
              {Utilities.getUtcToLocalWithFormat(item.estimatedTime, 'hh:mm A')}
              {/* {moment(item?.estimatedTime).format('hh:mm A')} */}
            </Text>
          </View>

          <View
            style={{
              flexDirection: 'row',
              marginTop: 12,
              alignSelf: 'center',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Image
              style={{
                width: 12,
                height: 12,
                resizeMode: 'contain',
                tintColor: Colors.SECONDARY_COLOR,
              }}
              source={Images.QUEUE_POSITION_ICON}
            />

            <Text
              style={{
                marginLeft: 6,
                marginRight: 6,
                fontFamily: Fonts.Gibson_Regular,
                fontSize: 12,
                color: Colors.PRIMARY_TEXT_COLOR,
              }}>
              {t(Translations.QUEUE)}: {item?.queueIndex || '1'}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const GetTodaysBannerServingCell = ({item, index}) => {
    //console.log('GetTodaysBannerServingCell item: ', item);
    return (
      <View
        style={{
          alignSelf: 'center',
          width: DisplayUtils.setWidth(93),
          height: 175,
          flexDirection: 'row',
          //Shadow props
          borderWidth: 0.4,
          borderColor: Colors.TEXT_PLACEHOLDER_COLOR,
          backgroundColor: '#E3E3E3',
          shadowColor: Colors.SHADOW_COLOR,
          shadowOffset: {width: 0, height: 4},
          shadowOpacity: 0.4,
          shadowRadius: 8,
          elevation: 8,
          borderRadius: 8,
        }}
        key={index}>
        <View style={{flex: 0.4, justifyContent: 'center'}}>
          <Image
            style={{
              width: 113,
              height: 108,
              alignSelf: 'center',
              resizeMode: 'contain',
            }}
            source={Images.SERVING_BANNER_IMAGE}
          />
        </View>

        <View style={{flex: 0.6}}>
          <TouchableOpacity
            onPress={() => bannerCloseButtonAction(item, index)}>
            <Image
              style={{
                width: 12,
                height: 12,
                position: 'absolute',
                right: 10,
                top: 10,
                resizeMode: 'contain',
                tintColor: Colors.APPOINTMENT_DETAILS_TEXT_GRAY_COLOR,
              }}
              source={Images.CLOSE_ICON}
            />
          </TouchableOpacity>

          <Text
            style={{
              fontFamily: Fonts.Gibson_Regular,
              fontSize: 12,
              color: Colors.PRIMARY_TEXT_COLOR,
              marginTop: 60,
              alignSelf: 'center',
            }}
            numberOfLines={1}>
            {t(Translations.YOU_ARE_BEING_SERVED_BY)}
          </Text>

          <Text
            style={{
              fontFamily: Fonts.Gibson_SemiBold,
              fontSize: 12,
              color: Colors.BLACK_COLOR,
              marginTop: 16,
              alignSelf: 'center',
            }}
            numberOfLines={1}>
            {item?.servingUser_id?.name ||
              Globals.BUSINESS_DETAILS?.name ||
              Strings.APP_NAME}
          </Text>
        </View>
      </View>
    );
  };

  const GetTodaysBannerServedCell = ({item, index}) => {
    //console.log('GetTodaysBannerServedCell item: ', item);
    return (
      <View
        style={{
          alignSelf: 'center',
          width: DisplayUtils.setWidth(93),
          height: 175,
          flexDirection: 'row',
          //Shadow props
          borderWidth: 0.4,
          borderColor: Colors.TEXT_PLACEHOLDER_COLOR,
          backgroundColor: '#E3E3E3',
          shadowColor: Colors.SHADOW_COLOR,
          shadowOffset: {width: 0, height: 4},
          shadowOpacity: 0.4,
          shadowRadius: 8,
          elevation: 8,
          borderRadius: 8,
        }}
        key={index}>
        <View style={{flex: 0.4, justifyContent: 'center'}}>
          <Image
            style={{
              width: 113,
              height: 108,
              alignSelf: 'center',
              resizeMode: 'contain',
            }}
            source={Images.THANKS_BANNER_IMAGE}
          />
        </View>

        <View style={{flex: 0.6}}>
          <TouchableOpacity
            onPress={() => bannerCloseButtonAction(item, index)}>
            <Image
              style={{
                width: 12,
                height: 12,
                position: 'absolute',
                right: 10,
                top: 10,
                resizeMode: 'contain',
                tintColor: Colors.APPOINTMENT_DETAILS_TEXT_GRAY_COLOR,
              }}
              source={Images.CLOSE_ICON}
            />
          </TouchableOpacity>

          <Text
            style={{
              fontFamily: Fonts.Gibson_SemiBold,
              fontSize: 12,
              color: Colors.BLACK_COLOR,
              marginTop: 30,
              alignSelf: 'center',
            }}
            numberOfLines={1}>
            {t(Translations.THANK_YOU)}
          </Text>

          {(
            item?.isReviewDone === undefined || item?.isReviewDone === null
              ? false
              : item?.isReviewDone === false
          ) ? (
            <>
              <Text
                style={{
                  fontFamily: Fonts.Gibson_Regular,
                  fontSize: 12,
                  color: Colors.PRIMARY_TEXT_COLOR,
                  marginTop: 16,
                  alignSelf: 'center',
                }}
                numberOfLines={1}>
                {t(Translations.YOU_WERE_SERVED_SUCCESSFULLY_BY)}
              </Text>

              <Text
                style={{
                  fontFamily: Fonts.Gibson_SemiBold,
                  fontSize: 12,
                  color: Colors.BLACK_COLOR,
                  marginTop: 16,
                  alignSelf: 'center',
                }}
                numberOfLines={1}>
                {item?.servingUser_id?.name ||
                  Globals.BUSINESS_DETAILS?.name ||
                  Strings.APP_NAME}
              </Text>

              <TouchableOpacity
                style={{
                  marginTop: 10,
                  borderRadius: 5,
                  width: 140,
                  height: 30,
                  backgroundColor: Colors.SECONDARY_COLOR,
                  justifyContent: 'center',
                  alignSelf: 'center',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
                onPress={() => ratingButtonAction(item)}>
                <Image
                  style={{width: 25, height: 25, resizeMode: 'contain'}}
                  source={Images.BANNER_RATING_ICON}
                />
                <Text
                  style={{
                    marginLeft: 8,
                    color: Colors.WHITE_COLOR,
                    fontFamily: Fonts.Gibson_SemiBold,
                    fontSize: 12,
                    alignSelf: 'center',
                  }}>
                  {t(Translations.LEAVE_A_RATING)}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text
                style={{
                  fontFamily: Fonts.Gibson_Regular,
                  fontSize: 12,
                  color: Colors.PRIMARY_TEXT_COLOR,
                  marginTop: 16,
                  alignSelf: 'center',
                }}
                numberOfLines={1}>
                {t(Translations.YOUR_REVIEW_HAS_BEEN)}
              </Text>

              <Text
                style={{
                  fontFamily: Fonts.Gibson_Regular,
                  fontSize: 12,
                  color: Colors.PRIMARY_TEXT_COLOR,
                  marginTop: 16,
                  alignSelf: 'center',
                }}
                numberOfLines={1}>
                {t(Translations.SUBMITTED)}
              </Text>

              <TouchableOpacity
                style={{
                  marginTop: 10,
                  borderRadius: 5,
                  width: 100,
                  height: 30,
                  backgroundColor: Colors.SECONDARY_COLOR,
                  justifyContent: 'center',
                  alignSelf: 'center',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
                onPress={() => ratingOkayButtonAction(item, index)}>
                <Image
                  style={{width: 16, height: 16, resizeMode: 'contain'}}
                  source={Images.OK_RATING_ICON}
                />
                <Text
                  style={{
                    marginLeft: 8,
                    color: Colors.WHITE_COLOR,
                    fontFamily: Fonts.Gibson_SemiBold,
                    fontSize: 12,
                    alignSelf: 'center',
                  }}>
                  {t(Translations.OKAY)}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  };

  const GetTodaysBannerNotSuccessCell = ({item, index}) => {
    //console.log('GetTodaysBannerNotSuccessCell item: ', item);
    return (
      <View
        style={{
          alignSelf: 'center',
          width: DisplayUtils.setWidth(93),
          height: 175,
          flexDirection: 'row',
          //Shadow props
          borderWidth: 0.4,
          borderColor: Colors.TEXT_PLACEHOLDER_COLOR,
          backgroundColor: '#E3E3E3',
          shadowColor: Colors.SHADOW_COLOR,
          shadowOffset: {width: 0, height: 4},
          shadowOpacity: 0.4,
          shadowRadius: 8,
          elevation: 8,
          borderRadius: 8,
        }}
        key={index}>
        <View style={{flex: 0.4, justifyContent: 'center'}}>
          <Image
            style={{
              width: 113,
              height: 108,
              alignSelf: 'center',
              resizeMode: 'contain',
            }}
            source={Images.SORRY_BANNER_ICON}
          />
        </View>

        <View style={{flex: 0.6}}>
          <TouchableOpacity
            onPress={() => bannerCloseButtonAction(item, index)}>
            <Image
              style={{
                width: 12,
                height: 12,
                position: 'absolute',
                right: 10,
                top: 10,
                resizeMode: 'contain',
                tintColor: Colors.APPOINTMENT_DETAILS_TEXT_GRAY_COLOR,
              }}
              source={Images.CLOSE_ICON}
            />
          </TouchableOpacity>

          <Text
            style={{
              fontFamily: Fonts.Gibson_SemiBold,
              fontSize: 14,
              color: Colors.PRIMARY_TEXT_COLOR,
              marginTop: 20,
              alignSelf: 'center',
            }}
            numberOfLines={1}>
            {t(Translations.OH_SORRY)}
          </Text>

          <Text
            style={{
              fontFamily: Fonts.Gibson_Regular,
              fontSize: 12,
              color: Colors.BLACK_COLOR,
              marginTop: 16,
              alignSelf: 'center',
            }}
            numberOfLines={1}>
            {t(Translations.YOUR_APPOINTMENT_WAS)}
          </Text>

          <Text
            style={{
              fontFamily: Fonts.Gibson_SemiBold,
              fontSize: 14,
              color: Colors.ERROR_RED_COLOR,
              marginTop: 16,
              alignSelf: 'center',
            }}
            numberOfLines={1}>
            {t(Translations.NOT_SUCCESSFUL)}
          </Text>

          <TouchableOpacity
            style={{
              marginTop: 10,
              borderRadius: 5,
              width: 140,
              height: 30,
              backgroundColor: Colors.SECONDARY_COLOR,
              justifyContent: 'center',
              alignSelf: 'center',
            }}
            onPress={() => todaysBannerTryAgainAction(item)}>
            <Text
              style={{
                color: Colors.WHITE_COLOR,
                fontFamily: Fonts.Gibson_Regular,
                fontSize: 12,
                alignSelf: 'center',
                zIndex: 2,
              }}>
              {t(Translations.TRY_AGAIN)}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const getServingUserDepartmentName = appointmentDetails => {
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

  const todaysBannerTryAgainAction = item => {
    let appointmentDetails = item;

    //set serving user info
    let servingUSerInfo = appointmentDetails?.servingUser_id || {};
    Globals.SHARED_VALUES.SELECTED_SERVING_USER_INFO = servingUSerInfo;
    Globals.SHARED_VALUES.SELECTED_SERVING_USER_ID = servingUSerInfo?._id;
    Globals.SHARED_VALUES.SELECTED_SERVING_USER_ROLE_TEXT =
      getServingUserDepartmentName(appointmentDetails);
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

  return (
    <View style={{marginTop: 8, height: 190}}>
      <View style={{marginTop: 8, height: 175}}>
        {/* <Carousel
          style={{
            flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
            alignContent: 'flex-start',
          }}
          ref={todaysBannerCarouselRef}
          data={data}
          renderItem={renderTodaysBanner}
          // firstItem={data.length}
          horizontal={true}
          loopClonesPerSide={I18nManager.isRTL ? data.length-1 : data.length}
          inverted={I18nManager.isRTL ? true : false}
          inactiveSlideScale={1}
          inactiveSlideOpacity={1}
          inactiveSlideShift={0.6}
          lockScrollWhileSnapping={true}
          enableMomentum={true}
          useScrollView={false}
          initialScrollIndex={
            isLoading
              ? 0
              : I18nManager.isRTL
              ? data.length - 1 || 0
              : data.length
          }
          firstItem={I18nManager.isRTL ? data.length - 1 || 0: 0}
          // listKey={
          //   moment().valueOf().toString() +
          //   'todaysBanner' +
          //   (Math.floor(Math.random() * 80) + 20).toString()
          // }
          keyExtractor={(item, index) =>
            index.toString() +
            'todaysBanner' +
            (Math.floor(Math.random() * 80) + 20).toString()
          }
          onSnapToItem={index => setTodaysAppointmentBannerActiveIndex(index)}
          // onSnapToItem={slideIndex => {
          //    console.log('onSnapToItem: ', slideIndex);
          //   setTodaysAppointmentBannerActiveIndex(slideIndex);
          //   if (slideIndex === data.length ||!isLoading) {
          //     setTimeout(() => {
          //       try {
          //         todaysBannerCarouselRef?.current?.snapToItem(0, true, true);
          //       } catch (e) {
          //         console.log('onSnapToItem error: ', e);
          //       }
          //     }, 10000); //10 sec
          //   }
          // }}
          // layout={'default'}
          enableSnap={true}
          // autoplay={true}
          // autoplayDelay={500}
          // autoplayInterval={10000} //30 sec
          sliderWidth={DisplayUtils.setWidth(100)}
          itemWidth={DisplayUtils.setWidth(100)}
          loop={true}
        />  */}

        <Carousel
          loop
          width={responsiveWidth(100)}
          height={width / 2}
          autoPlay={data.length > 1}
          style={{
            flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
            alignContent: 'flex-start',
          }}
          ref={todaysBannerCarouselRef}
          data={data}
          scrollAnimationDuration={1500}
          autoplayInterval={10000}
          renderItem={renderTodaysBanner}
          onSnapToItem={index => setTodaysAppointmentBannerActiveIndex(index)}
          initialScrollIndex={
            isLoading
              ? 0
              : I18nManager.isRTL
              ? data.length - 1 || 0
              : data.length
          }
          enabled={data.length > 1}
        />
      </View>

      <Pagination
        dotsLength={data.length < 14 ? data.length : 14}
        activeDotIndex={todaysAppointmentBannerActiveIndex}
        containerStyle={{
          paddingVertical: 5,
          marginTop: -20,
          backgroundColor: Colors.TRANSPARENT,
          marginLeft: 15,
          marginRight: 15,
        }}
        dotContainerStyle={{
          width: 8,
        }}
        dotStyle={{
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: Colors.SECONDARY_COLOR,
        }}
        inactiveDotStyle={{
          // Define styles for inactive dots here
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: Colors.GREY_COLOR,
        }}
        inactiveDotOpacity={0.4}
        inactiveDotScale={0.6}
      />

      <View
        style={{
          marginTop: 16,
          height: 1,
          backgroundColor: Colors.LINE_SEPARATOR_COLOR,
        }}
      />
    </View>
  );
};

export {TodaysBannerComponent};
