import React, {useState, useEffect, useRef} from 'react';
import {
  StatusBar,
  Text,
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  FlatList,I18nManager
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/core';
import {useHeaderHeight} from '@react-navigation/elements';
import {Colors, Fonts, Globals, Images, Strings,Translations} from '../../constants';
import StorageManager from '../../helpers/storageManager/StorageManager';
import Utilities from '../../helpers/utils/Utilities';
import DisplayUtils from '../../helpers/utils/DisplayUtils';
import LottieView from 'lottie-react-native';
import {TabView, SceneMap, TabBar} from 'react-native-tab-view';
import {useFocusEffect} from '@react-navigation/core';
import UpcomingAppointmentList from './upcomingAppointmentList/UpcomingAppointmentList';
import PreviousAppointmentList from './previousAppointmentList/PreviousAppointmentList';
import {GuestUserAuthSource} from '../../helpers/enums/Enums';
import { t } from 'i18next';
const MyVisitList = props => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const layout = useWindowDimensions();

  const [isLoading, setIsLoading] = useState(false);
  const FirstRoute = () => <UpcomingAppointmentList />;
  const SecondRoute = () => <PreviousAppointmentList />;

  const renderScene = SceneMap({
    first: FirstRoute,
    second: SecondRoute,
  });
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    {key: 'first', title: t(Translations.UPCOMING)},
    {key: 'second', title: t(Translations.PREVIOUS)},
  ]);
  const renderTabBar = props => (
    <TabBar
      {...props}
      indicatorStyle={{
        backgroundColor:
          index === 0 ? Colors.SECONDARY_COLOR : Colors.PRIMARY_COLOR,
      }}
      // activeColor="#000000"
      // inactiveColor="#FFFFFF"
      pressColor={Colors.BACKGROUND_COLOR}
      bounces={false}
      style={{
        backgroundColor: Colors.BACKGROUND_COLOR,
        elevation: 0,
        height: 50,
        shadowColor: 'transparent',
        shadowOpacity: 0,
      }}
      renderLabel={({route, focused, color}) => (
        <View
          style={{
            height: 30,

            // borderBottomWidth: focused ? 2 : 0,
            // borderBottomColor: focused
            //   ? Colors.DARK_BROWN_COLOR
            //   : Colors.TAB_VIEW_LABEL_COLOR,

            // paddingHorizontal: 3,
            justifyContent: 'center',
          }}>
          <Text
            style={{
              fontSize: 16,
              fontFamily: Fonts.Gibson_Regular,
              color: Colors.PRIMARY_TEXT_COLOR,
              backgroundColor: 'transparent',
              //   marginTop: 5,
            }}>
            {route.title}
          </Text>
        </View>
      )}
      tabStyle={{
        flexDirection: 'row',
      }}
      labelStyle={{}}
      getLabelText={({route}) => route.title}
    />
  );

  useEffect(() => {
    if (Globals.SHARED_VALUES.IS_PREVIOUS_MY_VISIT === true) {
      setIndex(1);
    }
  }, []);

  // const Tabs = () => {
  //     return (

  //     );
  // };
  const bottomHomeAction = () => {
    Utilities.resetAllSharedBookingRelatedInfo();
    //Navigate to dashboard
    navigation.reset({
      index: 0,
      routes: [{name: 'DashboardScreen'}],
    });
  };
  const newBookingAction = () => {
    Utilities.resetAllSharedBookingRelatedInfo();
    //Checking single consultant
    if (Utilities.isSingleConsultantBusiness() === false) {
      //Not single consultant
      //Checking gender specific booking
      if (Utilities.isGenderSpecificBooking() === true) {
        //Navigate to gender selection
        navigation.navigate('GenderSelectionScreen');
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
            <Text
              style={{
                fontFamily: Fonts.Gibson_SemiBold,
                color: Colors.PRIMARY_TEXT_COLOR,
                fontSize: 18,
              }}>
              {t(Translations.MY_VISITS)}
            </Text>
          </View>
        </View>

        <TabView
          navigationState={{index, routes}}
          renderScene={renderScene}
          lazy={true}
          onIndexChange={setIndex}
          renderTabBar={renderTabBar}
          style={styles.tabContainer}
          initialLayout={{width: layout.width}}
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
            }}
            onPress={() => newBookingAction()}>
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

export default MyVisitList;

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.PRIMARY_WHITE,
    width: DisplayUtils.setWidth(100),
    height: 70,
    borderBottomColor: Colors.LINE_SEPARATOR_COLOR,
    borderBottomWidth: 0.5,
  },
});
