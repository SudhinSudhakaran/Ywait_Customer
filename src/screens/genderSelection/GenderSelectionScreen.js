import React, {useState, useEffect, useRef} from 'react';
import {
  StatusBar,
  Text,
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  I18nManager,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/core';
import {useHeaderHeight} from '@react-navigation/elements';
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
import {GuestUserAuthSource} from '../../helpers/enums/Enums';
import RBSheet from 'react-native-raw-bottom-sheet';
import DepartmentSelectionPopUp from '../specialistList/DepartmentSelectionPopup/DepartmentSelectionPopUp';
import {t} from 'i18next';
import {useRoute} from '@react-navigation/native';
import { responsiveScreenWidth, responsiveWidth } from 'react-native-responsive-dimensions';
const GenderSelectionScreen = props => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const [genderList, setGenderList] = useState();

  const departmentSelectionRBSheetRef = useRef();

  useEffect(() => {
    configureGenderFromBusiness();
    console.log('gender selection screen', route?.params?.newBooking || false);
  }, []);

  const configureGenderFromBusiness = () => {
    let genderOptions = Utilities.getGenderOptions();
    setGenderList(genderOptions);

    const timer = setTimeout(() => {
      showDepartmentPopupIfNeeded();
    }, 200);
    return () => clearTimeout(timer);
  };

  const showDepartmentPopupIfNeeded = () => {
    if (Globals.SHARED_VALUES.IS_FROM_DASHBOARD_DEPARTMENT_VIEW_ALL === true) {
      departmentSelectionRBSheetRef.current.open();
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
    //Navigate to fav page
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

  /**
            * Purpose: List empty component
            * Created/Modified By: Sudhin Sudhakaran
            * Created/Modified Date: 11 Oct 2021
            * Steps:
                1.Return the component when list is empty
        */
  const GenderEmptyComponent = () => {
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
  const cellPressAction = item => {
    Globals.SHARED_VALUES.SELECTED_GENDER = item;
    if (Utilities.isServiceBasedBusiness() === true) {
      navigation.navigate('ServiceListScreen');
    } else {
      navigation.navigate('SpecialistListScreen',{newBooking: route?.params?.newBooking || false});
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
    return <GenderListData item={item} index={index} />;
  };

  const GenderListData = ({item}) => {
    var _backgroundColor = Colors.WHITE_COLOR;
    if (Globals.IS_AUTHORIZED === true) {
      let _userAdditionalInfo = Globals.USER_DETAILS?.additionalInfo || [];
      if (_userAdditionalInfo?.length > 0) {
        _userAdditionalInfo.map(_info => {
          if (_info?.key?.toUpperCase() === 'GENDER') {
            if (item?.toUpperCase() === _info?.value?.toUpperCase()) {
              //  _backgroundColor = Colors.SLIM_LINE_SEPARATOR_COLOR;
            }
          }
        });
      }
    }
    return (
      <TouchableOpacity
        style={{
          backgroundColor: _backgroundColor,
          marginLeft: 10,
          borderColor: Colors.LINE_SEPARATOR_COLOR,
          borderWidth: 1,
          width: responsiveWidth(28),
          height: 100,
          marginRight:5,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 10,
        }}
        onPress={() => cellPressAction(item)}>
        {item === 'Male' ? (
          <LottieView
            style={{width: 40, height: 40}}
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
        ) : item === 'Female' ? (
          <LottieView
            style={{width: 40, height: 40}}
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
        ) : (
          <LottieView
            style={{width: 40, height: 40}}
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
            marginTop: 16,
            fontFamily: Fonts.Gibson_SemiBold,
            fontSize: 14,
            color: Colors.PRIMARY_TEXT_COLOR,
          }}>
          {item}
        </Text>
      </TouchableOpacity>
    );
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
          selectedDepartmentId={'-1'}
        />
      </RBSheet>
    );
  };

  const handleDepartmentSelection = departmentInfo => {
    console.log('handleDepartmentSelection departmentInfo: ', departmentInfo);
    if (departmentInfo?._id !== '-1') {
      Globals.SHARED_VALUES.SELECTED_DEPARTMENT_INFO = departmentInfo;
    } else {
      Globals.SHARED_VALUES.SELECTED_DEPARTMENT_INFO = {};
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
            <Text
              style={{
                fontFamily: Fonts.Gibson_SemiBold,
                color: Colors.PRIMARY_TEXT_COLOR,
                fontSize: 18,
              }}>
              {t(Translations.CHOOSE_GENDER)}
            </Text>
          </View>
        </View>

        <FlatList
          // contentContainerStyle={{ paddingBottom: 85 }}
          style={{marginLeft: 6, marginTop: 12}}
          data={genderList}
          renderItem={renderItem}
          horizontal={false}
          numColumns={3}
          keyExtractor={(item, index) =>
            item._id ? item._id.toString() : index.toString()
          }
          ListEmptyComponent={GenderEmptyComponent}
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

export default GenderSelectionScreen;

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.PRIMARY_WHITE,
    width: DisplayUtils.setWidth(100),
    height: 70,
    borderBottomColor: Colors.LINE_SEPARATOR_COLOR,
    borderBottomWidth: 0.5,
  },
});
