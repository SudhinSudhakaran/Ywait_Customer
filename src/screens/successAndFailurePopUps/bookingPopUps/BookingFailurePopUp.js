import React, {useState, useEffect, useRef} from 'react';
import {
  FlatList,
  Text,
  View,
  Image,
  TouchableOpacity,
  TextInput,
  Platform,
  I18nManager,
} from 'react-native';
import {t} from 'i18next';
import {
  Fonts,
  Strings,
  Colors,
  Images,
  Globals,
  Translations,
} from '../../../constants';
import {GetImage} from '../../shared/getImage/GetImage';
import {useFocusEffect} from '@react-navigation/core';
import {useNavigation} from '@react-navigation/core';
import Utilities from '../../../helpers/utils/Utilities';
import LottieView from 'lottie-react-native';

const BookingFailurePopUp = props => {
  const navigation = useNavigation();
  useFocusEffect(
    React.useCallback(() => {
      console.log(
        'Globals.SELECTED_CUSTOMER_INFO',
        Globals.SELECTED_CUSTOMER_INFO,
      );
      return () => {
        // Globals.SELECTED_CUSTOMER_INFO = {};
        // Globals.SELECTED_DATE_FROM = '';
      };
    }, []),
  );
  //Button actions
  const closePopupAction = () => {
    //Closing bottom sheet
    if (props.refRBSheet !== undefined) {
      if (props.refRBSheet.current !== undefined) {
        props.refRBSheet.current.close();
      }
    }
  };

  const okButtonAction = () => {
    //Closing bottom sheet
    if (props.refRBSheet !== undefined) {
      if (props.refRBSheet.current !== undefined) {
        props.refRBSheet.current.close();
      }
    }
    // const timer = setTimeout(() => {
    //     //Callback to parent. Delay is to bypass iOS modal presentation
    //     props.didSelectNo();
    // }, 500);
    // return () => clearTimeout(timer);
  };

  const viewDetailsButtonAction = () => {
    //Closing bottom sheet
    // if (props.refRBSheet !== undefined) {
    //     if (props.refRBSheet.current !== undefined) {
    //         props.refRBSheet.current.close();
    //     }
    // }
    // const timer = setTimeout(() => {
    //     //Callback to parent. Delay is to bypass iOS modal presentation
    //     props.didSelectYes();
    // }, 500);
    // return () => clearTimeout(timer);
  };

  //Final return
  return (
    <View
      style={{
        flex: 1,
      }}>
      {/* title */}
      <Text
        style={{
          fontFamily: Fonts.Gibson_SemiBold,
          fontSize: 16,
          color: '#FF5264',
          marginLeft: 22,
          textAlign:'left'
        }}>
        {t(Translations.FAILED_TITLE)}
      </Text>
      <TouchableOpacity onPress={() => closePopupAction()}>
        <Image
          style={{
            position: 'absolute',
            right: 20,
            top: -16,
            tintColor: Colors.PRIMARY_TEXT_COLOR,
          }}
          source={Images.CLOSE_ICON}
        />
      </TouchableOpacity>
      <LottieView
        style={{alignSelf: 'center', width: 100, height: 100, marginTop: 0}}
        source={Images.FAILED_ANIMATION}
        autoPlay
        loop
        colorFilters={[
          {
            keypath: 'body.Shape 1',
            color: Colors.SECONDARY_COLOR,
          },
          {
            keypath: 'Shape Layer 2',
            color: Colors.PRIMARY_COLOR,
          },
          {
            keypath: 'Shape Layer 3',
            color: Colors.PRIMARY_COLOR,
          },
          {
            keypath: 'stroke.Shape 1',
            color: Colors.PRIMARY_COLOR,
          },
        ]}
      />
      <Text
        style={{
          fontFamily: Fonts.Gibson_Regular,
          fontSize: 14,
          marginTop: 16,
          alignSelf: 'center',
          color: Colors.PRIMARY_TEXT_COLOR,
          marginLeft: 22,
          marginRight: 22,
          textAlign: 'center',
        }}>
        {Globals.SHARED_VALUES.FAILURE_ERROR_MESSAGE}
      </Text>
      <View style={{flex: 1}} />

      <View
        style={{flexDirection: 'row', alignSelf: 'flex-end', marginBottom: 30}}>
        <TouchableOpacity
          style={{
            width: 80,
            height: 45,
            borderRadius: 8,
            borderWidth: 2,
            borderColor: Colors.SECONDARY_COLOR,
            justifyContent: 'center',
            marginRight: 22,
          }}
          onPress={() => okButtonAction()}>
          <Text
            style={{
              fontFamily: Fonts.Gibson_Regular,
              fontSize: 16,
              color: Colors.SECONDARY_COLOR,
              alignSelf: 'center',
            }}>
           {t(Translations.OK)}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
export default BookingFailurePopUp;
