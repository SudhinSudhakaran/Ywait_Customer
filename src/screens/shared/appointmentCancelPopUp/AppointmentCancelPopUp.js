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
import {t} from 'i18next';
const AppointmentCancelPopup = props => {
  const navigation = useNavigation();
  useFocusEffect(
    React.useCallback(() => {
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
    if (props.refRBSheet !== undefined) {
      if (props.refRBSheet.current !== undefined) {
        props.refRBSheet.current.close();
      }
    }
    const timer = setTimeout(() => {
      //Callback to parent. Delay is to bypass iOS modal presentation
      props.appointmentCancelAction();
    }, 500);
    return () => clearTimeout(timer);
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
          color: Colors.PRIMARY_COLOR,
          alignSelf: 'center',
          marginTop: 20,
        }}>
        {t(Translations.CONFIRM_CANCEL)}
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

      <View style={{marginTop: 20, flexDirection: 'row'}}>
        <GetImage
          style={{
            marginLeft: 48,
            width: 93,
            height: 93,
            borderRadius: 93 / 2,
            borderWidth: 2,
            borderColor: Colors.SECONDARY_COLOR,
          }}
          fullName={(
            props.selectedAppointment.servingUser_id?.fullName ||
            Globals.BUSINESS_DETAILS.name
          ).trim()}
          url={props.selectedAppointment.servingUser_id?.image}
        />
        <View style={{flexDirection: 'column'}}>
          <Text
            style={{
              fontFamily: Fonts.Gibson_SemiBold,
              fontSize: 14,
              marginTop: 20,
              marginLeft: 25,
              color: Colors.PRIMARY_TEXT_COLOR,
              textAlign: 'left',
            }}>
            {props.selectedAppointment.servingUser_id?.name ||
              Globals.BUSINESS_DETAILS.name}
          </Text>
          <Text
            style={{
              fontFamily: Fonts.Gibson_Regular,
              fontSize: 14,
              marginTop: 20,
              marginLeft: 25,
              color: Colors.PRIMARY_TEXT_COLOR,
              textAlign: 'left',
            }}>
            {Utilities.getUtcToLocalWithFormat(
              props.selectedAppointment.dateFrom,
              'DD MMM YYYY',
            )}{' '}
            at{' '}
            {Utilities.getUtcToLocalWithFormat(
              props.selectedAppointment.dateFrom,
              'hh:mm A',
            )}
          </Text>
        </View>
      </View>
      <View style={{flex: 1}} />
      {Globals.BUSINESS_DETAILS.enableCancellationFee ? (
        <Text
          style={{
            fontFamily: Fonts.Gibson_Regular,
            fontSize: 14,
            marginBottom: 18,
            alignSelf: 'center',
            color: Colors.PRIMARY_TEXT_COLOR,
            marginHorizontal: 15,
            textAlign: 'center',
          }}>
          {t(Translations.A_FEE_OF)}{' '}
          {Globals.BUSINESS_DETAILS.fineForCancellation.factor === 'percentage'
            ? Globals.BUSINESS_DETAILS.fineForCancellation.figure + '%'
            : Utilities.getCurrencyFormattedPrice(
                Globals.BUSINESS_DETAILS.fineForCancellation.figure,
              )}{' '}
          {t(
            Translations.WILL_BE_APPLICABLE_UPON_CANCELLATION_ARE_YOU_SURE_TO_CANCEL_THIS_APPOINTMENT,
          )}
        </Text>
      ) : (
        <Text
          style={{
            fontFamily: Fonts.Gibson_Regular,
            fontSize: 14,
            marginBottom: 18,
            alignSelf: 'center',
            color: Colors.PRIMARY_TEXT_COLOR,
            marginHorizontal: 15,
            textAlign: 'center',
          }}>
          {t(Translations.ARE_YOU_SURE_TO_CANCEL_THIS_APPOINTMENT)}{' '}
        </Text>
      )}
      <View
        style={{flexDirection: 'row', alignSelf: 'center', marginBottom: 30}}>
        <TouchableOpacity
          style={{
            width: 80,
            height: 45,
            borderRadius: 8,
            borderWidth: 2,
            borderColor: Colors.SECONDARY_COLOR,
            justifyContent: 'center',
          }}
          onPress={() => okButtonAction()}>
          <Text
            style={{
              fontFamily: Fonts.Gibson_Regular,
              fontSize: 16,
              color: Colors.SECONDARY_COLOR,
              alignSelf: 'center',
            }}>
            {t(Translations.NO)}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            width: 134,
            height: 45,
            borderRadius: 8,
            borderWidth: 2,
            borderColor: Colors.SECONDARY_COLOR,
            backgroundColor: Colors.SECONDARY_COLOR,
            justifyContent: 'center',
            marginLeft: 15,
          }}
          onPress={() => viewDetailsButtonAction()}>
          <Text
            style={{
              fontFamily: Fonts.Gibson_Regular,
              fontSize: 16,
              color: Colors.WHITE_COLOR,
              alignSelf: 'center',
            }}>
            {t(Translations.YES_IAM_SURE)}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
export default AppointmentCancelPopup;
