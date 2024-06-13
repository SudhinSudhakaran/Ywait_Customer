import React, {useState, useEffect, useRef} from 'react';
import {
  FlatList,
  Text,
  View,
  Image,
  TouchableOpacity,
  TextInput,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  I18nManager
} from 'react-native';
import {t} from 'i18next';
import {Fonts, Strings, Colors, Images, Globals,Translations} from '../../../constants';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {GetImage} from '../../shared/getImage/GetImage';
import {useFocusEffect} from '@react-navigation/core';
import {useNavigation} from '@react-navigation/core';
import Utilities from '../../../helpers/utils/Utilities';
import RADIO_ON_ICON from '../../../assets/images/radioButtonON.svg';
import {useHeaderHeight} from '@react-navigation/elements';

const QueuePaymentConfirmationPopUp = props => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [paymentDetails, setPaymentDetails] = useState();
  const [paymentType, setPaymentType] = useState('card'); //card,bycash
  const [referenceNumber, setReferenceNumber] = useState('');
  const [referenceNumberError, setReferenceNumberError] = useState('');
  useFocusEffect(
    React.useCallback(() => {
      console.log(
        'Globals.SELECTED_CUSTOMER_INFO',
        Globals.SELECTED_CUSTOMER_INFO,
      );
      configurePaymentInfo();
      return () => {
        // Globals.SELECTED_CUSTOMER_INFO = {};
        // Globals.SELECTED_DATE_FROM = '';
      };
    }, []),
  );

  const configurePaymentInfo = () => {
    var paymentArray = [];
    var paymentObject = {};
    Globals.SHARED_VALUES.SELECTED_PAYMENT_INFO.charges.map(
      (paymentItem, paymentIndex) => {
        paymentArray.push(paymentItem);
      },
    );
    Globals.SHARED_VALUES.SELECTED_PAYMENT_INFO.discounts.map(
      (paymentItem, paymentIndex) => {
        paymentArray.push(paymentItem);
      },
    );
    paymentObject.type = 'total';
    paymentObject.amounts = Globals.SHARED_VALUES.SELECTED_PAYMENT_INFO.total;
    paymentObject.item = 'Total';
    paymentArray.push(paymentObject);
    console.log('paymentArray', paymentArray);
    setPaymentDetails(paymentArray);
  };
  //Button actions
  const closePopupAction = () => {
    //Closing bottom sheet
    if (props.refRBSheet !== undefined) {
      if (props.refRBSheet.current !== undefined) {
        props.refRBSheet.current.close();
      }
    }
  };

  const noButtonAction = () => {
    //Closing bottom sheet
    if (props.refRBSheet !== undefined) {
      if (props.refRBSheet.current !== undefined) {
        props.refRBSheet.current.close();
      }
    }
    const timer = setTimeout(() => {
      //Callback to parent. Delay is to bypass iOS modal presentation
      props.didSelectNo();
    }, 500);
    return () => clearTimeout(timer);
  };

  const payNowButtonAction = () => {
    //Closing bottom sheet
    if (props.refRBSheet !== undefined) {
      if (props.refRBSheet.current !== undefined) {
        props.refRBSheet.current.close();
      }
    }
    const timer = setTimeout(() => {
      //Callback to parent. Delay is to bypass iOS modal presentation
      props.didSelectYes();
    }, 500);
    return () => clearTimeout(timer);
  };

  //Final return
  return (
    <View
      style={{
        flex: 1,
        paddingTop: insets.top,
        paddingLeft: insets.left,
        paddingRight: insets.right,
        paddingBottom: insets.bottom,
      }}>
      {/* title */}
      <Text
        style={{
          fontFamily: Fonts.Gibson_SemiBold,
          fontSize: 16,
          marginTop: 5,
          marginLeft: 16,
          color: Colors.PRIMARY_COLOR,
          alignSelf: 'center',
        }}>
        {t(Translations.CONFIRM_QUEUE)}
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
      <View
        style={{
          height: 1,
          backgroundColor: Colors.SLIM_LINE_SEPARATOR_COLOR,
          marginTop: 15,
          marginRight: 0,
          marginLeft: 0,
        }}
      />
      <ScrollView style={{marginTop: 10}}>
        <View style={{marginTop: 16, flexDirection: 'row'}}>
          <GetImage
            style={{
              marginLeft: 48,
              width: 93,
              height: 93,
              borderRadius: 93 / 2,
              borderWidth: 2,
              borderColor: Colors.PRIMARY_COLOR,
            }}
            fullName={
              Globals.SHARED_VALUES.SELECTED_SERVING_USER_INFO?._id !==
              undefined
                ? (
                    Globals.SHARED_VALUES.SELECTED_SERVING_USER_INFO
                      ?.fullName || 'N/A'
                  ).trim()
                : (Globals.BUSINESS_DETAILS?.name || Strings.APP_NAME).trim()
            }
            alphabetColor={Colors.SECONDARY_COLOR}
            url={
              Globals.SHARED_VALUES.SELECTED_SERVING_USER_INFO?._id !==
              undefined
                ? Globals.SHARED_VALUES.SELECTED_SERVING_USER_INFO?.image
                : Globals.BUSINESS_DETAILS?.image
            }
          />
          <View style={{flexDirection: 'column'}}>
            <Text
              style={{
                fontFamily: Fonts.Gibson_SemiBold,
                fontSize: 14,
                marginTop: 20,
                marginLeft: 25,
                color: Colors.PRIMARY_TEXT_COLOR,
              }}>
              {Globals.SHARED_VALUES.SELECTED_SERVING_USER_INFO?._id !==
              undefined
                ? (
                    Globals.SHARED_VALUES.SELECTED_SERVING_USER_INFO?.name ||
                    'N/A'
                  ).trim()
                : (Globals.BUSINESS_DETAILS?.name || Strings.APP_NAME).trim()}
            </Text>
            <Text
              style={{
                fontFamily: Fonts.Gibson_Regular,
                fontSize: 14,
                marginTop: 20,
                marginLeft: 25,
                color: Colors.PRIMARY_TEXT_COLOR,
              }}>
              {Utilities.getUtcToLocalWithFormat(
                Globals.SHARED_VALUES.SELECTED_SLOT_INFO?.expectedTimeOfServing,
                'DD MMM YYYY',
              )}{' '}
            at{' '}
              {Utilities.getUtcToLocalWithFormat(
                Globals.SHARED_VALUES.SELECTED_SLOT_INFO?.expectedTimeOfServing,
                'hh:mm A',
              )}
            </Text>
          </View>
        </View>
        <Text
          style={{
            fontFamily: Fonts.Gibson_SemiBold,
            fontSize: 14,
            marginTop: 15,
            marginLeft: 14,
            color: Colors.PRIMARY_TEXT_COLOR,
            marginBottom: 15,
          }}>
          {t(Translations.PRICE_DETAILS)}
        </Text>

        {paymentDetails !== undefined
          ? paymentDetails.map((paymentItem, paymentIndex) => {
              return (
                <View
                  style={{
                    borderTopColor: Colors.BACKGROUND_COLOR,
                    borderTopWidth: 1,
                    marginRight: 0,
                    marginLeft: 0,
                    flexDirection: 'row',
                    height: 42,
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                  <Text
                    style={{
                      fontFamily:
                        paymentItem.type === 'total'
                          ? Fonts.Gibson_SemiBold
                          : Fonts.Gibson_Regular,
                      fontSize: 14,
                      marginLeft: 20,
                      color: Colors.PRIMARY_TEXT_COLOR,
                    }}>
                    {paymentItem.type === 'discount'
                      ? paymentItem.item + '(discount)'
                      : paymentItem.item}
                  </Text>

                  <Text
                    style={{
                      fontFamily:
                        paymentItem.type === 'total'
                          ? Fonts.Gibson_SemiBold
                          : Fonts.Gibson_Regular,
                      fontSize: 14,
                      marginRight: 16,
                      color: Colors.PRIMARY_TEXT_COLOR,
                    }}>
                    {paymentItem.type === 'discount'
                      ? '- ' +
                        Utilities.getCurrencyFormattedPrice(
                          parseFloat(paymentItem.amounts),
                        )
                      : Utilities.getCurrencyFormattedPrice(
                          parseFloat(paymentItem.amounts),
                        )}
                  </Text>
                </View>
              );
            })
          : null}
      </ScrollView>

      <View style={{flex: 1}} />
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
          onPress={() => noButtonAction()}>
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
            // width: 134,
            height: 45,
            borderRadius: 8,
            borderWidth: 2,
            borderColor: Colors.SECONDARY_COLOR,
            backgroundColor: Colors.SECONDARY_COLOR,
            justifyContent: 'center',
            marginLeft: 15,
          }}
          onPress={() => payNowButtonAction()}>
          <Text
            style={{
              marginLeft: 12,
              marginRight: 12,
              fontFamily: Fonts.Gibson_Regular,
              fontSize: 16,
              color: Colors.WHITE_COLOR,
              alignSelf: 'center',
            }}>
            {parseFloat(
              Globals.SHARED_VALUES.SELECTED_PAYMENT_INFO?.total || '0',
            ) > 0 && Utilities.isOnlinePaymentEnabled() === true
              ? t(Translations.CONFIRM_AND_PAY_NOW)
              : t(Translations.YES_IAM_SURE)}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
export default QueuePaymentConfirmationPopUp;
