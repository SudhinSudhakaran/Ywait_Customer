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
import {t} from 'i18next';
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
import NO_DEPARTMENT_ICON from '../../assets/images/departmentEmptyIcon.svg';
const FavouriteListScreen = props => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [favouriteList, setFavouriteList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaginating, setIsPaginating] = useState(false);
  const [isPageEnded, setIsPageEnded] = useState(false);
  const [pageNo, setPageNo] = useState(1);
  const [searchText, setSearchText] = useState('');

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
    getFavouritesList(true);
  }, []);

  const bottomHomeAction = () => {
    Utilities.resetAllSharedBookingRelatedInfo();
    //Navigate to dashboard
    navigation.reset({
      index: 0,
      routes: [{name: 'DashboardScreen'}],
    });
  };

  const favoriteButtonAction = () => {
    //TODO:Navigate to fav page
  };

  const newBookingAction = () => {
    Utilities.resetAllSharedBookingRelatedInfo();
    //Checking single consultant
    if (Utilities.isSingleConsultantBusiness() === false) {
      //Not single consultant
      //Checking gender specific booking
      if (Utilities.isGenderSpecificBooking() === true) {
        //Navigate to gender selection
        navigation.navigate('GenderSelectionScreen',{newBooking: true});
      } else if (Utilities.isServiceBasedBusiness() === true) {
        //Navigate to service selection
        navigation.navigate('ServiceListScreen');
      } else {
        //Navigate to specialist lists
        navigation.navigate('SpecialistListScreen');
      }
    } else {
      //TODO:Single consultant new booking
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
  const getFavouritesList = isLoaderRequired => {
    if (isLoaderRequired) {
      setIsLoading(true);
    }

    DataManager.getFavouritesList().then(([isSuccess, message, data]) => {
      if (isSuccess === true) {
        if (data?.objects !== undefined && data?.objects !== null) {
          setFavouriteList(data?.objects);
        }
      } else {
        Utilities.showToast(t(Translations.FAILED), message, 'error', 'bottom');
        setIsLoading(false);
      }
      setIsLoading(false);
    });
  };

  /**
             * Purpose: List empty component
             * Created/Modified By: Sudhin Sudhakaran
             * Created/Modified Date: 11 Oct 2021
             * Steps:
                 1.Return the component when list is empty
         */
  const SpecialistEmptyComponent = () => {
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
    );
  };
  const cellPressAction = item => {
    Globals.SHARED_VALUES.SELECTED_SERVING_USER_ID = item?._id;
    Globals.SHARED_VALUES.SELECTED_SERVING_USER_INFO = item;
    Globals.SHARED_VALUES.SELECTED_SERVING_USER_ROLE_TEXT =
      getDepartmentName(item);
    if (Utilities.isGenderSpecificBooking() === true) {
      Globals.SHARED_VALUES.SELECTED_GENDER = item?.canServeGenders;
    }
    if (Utilities.isServiceBasedBusiness() === true) {
      //Navigate to service selection
      navigation.navigate('ServiceListScreen');
    } else {
      navigation.navigate('BookingQueueScreen');
    }
  };

  const getDepartmentName = item => {
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

  /**
          * Purpose:Render function of flat list
          * Created/Modified By: Sudhin Sudhakaran
          * Created/Modified Date: 8 Oct 2021
          * Steps:
              1.pass the data from api to customer details child component
      */
  const renderItem = ({item, index}) => {
    return <FavouriteListItem item={item} index={index} />;
  };

  const FavouriteListItem = ({item, index}) => {
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
          <View style={{marginLeft: 20, marginRight: 20}}>
            <Text
              style={{
                marginRight: 16,
                fontFamily: Fonts.Gibson_SemiBold,
                fontSize: 14,
                textAlign: 'left',
                color: Colors.PRIMARY_TEXT_COLOR,
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
                textAlign: 'left',
                color: Colors.LOCATION_TEXT_COLOR,
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

            {item?.workingHours?.length > 0 ? (
              <View style={{marginTop: 8, flexDirection: 'row'}}>
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
                        }}>
                        {dayItem?.label[0]}
                      </Text>
                    </View>
                  );
                })}
              </View>
            ) : null}
          </View>
        </TouchableOpacity>
      );
    }
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
            <NO_DEPARTMENT_ICON
              width={25}
              height={25}
              fill={Colors.WHITE_COLOR}
              fillNoDepartmentSecondary={Colors.SECONDARY_COLOR}
              fillNoDepartmentPrimary={Colors.PRIMARY_COLOR}
            />
            <TouchableOpacity
              style={{marginLeft: 15}}
              activeOpacity={
                Utilities.isServiceBasedBusiness() === false ? 1 : 1
              }
              // onPress={() => onPressDepartmentChoose()}
            >
              <Text
                style={{
                  fontFamily: Fonts.Gibson_SemiBold,
                  color: Colors.PRIMARY_TEXT_COLOR,
                  fontSize: 18,
                }}>
                {t(Translations.FAVORITES)}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          // contentContainerStyle={{ paddingBottom: 85 }}
          style={{marginLeft: 6, marginTop: 12, marginBottom: 80}}
          data={isLoading ? DUMMY_DATA : favouriteList}
          renderItem={renderItem}
          keyExtractor={(item, index) =>
            item._id ? item._id.toString() : index.toString()
          }
          ListEmptyComponent={isLoading ? null : SpecialistEmptyComponent}
        />

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
            onPress={() => newBookingAction()}
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
              {t(Translations.NEW_BOOKING)}
            </Text>
          </TouchableOpacity>

          {Utilities.isSingleConsultantBusiness() === false ? (
            <TouchableOpacity
              // onPress={() => favoriteButtonAction()}
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

export default FavouriteListScreen;

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.PRIMARY_WHITE,
    width: DisplayUtils.setWidth(100),
    height: 70,
    borderBottomColor: Colors.LINE_SEPARATOR_COLOR,
    borderBottomWidth: 0.5,
  },
});
