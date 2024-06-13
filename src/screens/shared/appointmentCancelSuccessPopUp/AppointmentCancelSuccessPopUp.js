import React, {useState, useEffect, useRef} from 'react';
import {
  FlatList,
  Text,
  View,
  Image,
  TouchableOpacity,
  TextInput,
  Platform,I18nManager
} from 'react-native';

import {Fonts, Strings, Colors, Images, Globals,Translations} from '../../../constants';
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
          color: Colors.BOOKING_SUCCESS_GREEN_COLOR,
          alignSelf: 'center',
          marginTop: 20,
        }}>
        {t(Translations.DONE)}
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
        style={{
          position: 'absolute',
          top: 5,
          alignSelf: 'center',
          width: 180,
          height: 180,
        }}
        source={Images.SUCCESS_ANIMATION}
        autoPlay
        loop={false}
        colorFilters={[
          {
            keypath: 'Shape Layer 1',
            color: Colors.SECONDARY_COLOR,
          },
          {
            keypath: 'Shape Layer 4',
            color: Colors.SECONDARY_COLOR,
          },
          {
            keypath: 'Shape Layer 6',
            color: Colors.SECONDARY_COLOR,
          },
          {
            keypath: 'Shape Layer 7',
            color: Colors.SECONDARY_COLOR,
          },
          {
            keypath: 'Shape Layer 3',
            color: Colors.SECONDARY_COLOR,
          },
          {
            keypath: 'Shape Layer 8',
            color: Colors.SECONDARY_COLOR,
          },
          {
            keypath: 'Shape Layer 5',
            color: Colors.SECONDARY_COLOR,
          },
          {
            keypath: 'Shape Layer 2',
            color: Colors.SECONDARY_COLOR,
          },
          {
            keypath: 'Capa 1/confirmation Outlines',
            color: Colors.SECONDARY_COLOR,
          },
          {
            keypath: 'Shape Layer 9',
            color: Colors.PRIMARY_COLOR,
          },
        ]}
      />
      <View style={{marginTop: 106, flexDirection: 'row'}}>
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
            props.selectedAppointment?.servingUser_id?.fullName ||
            Globals.BUSINESS_DETAILS.name
          ).trim()}
          url={props.selectedAppointment?.servingUser_id?.image}
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
            {props.selectedAppointment?.servingUser_id?.name ||
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
              props.selectedAppointment?.dateFrom,
              'DD MMM YYYY',
            )}{' '}
            at{' '}
            {Utilities.getUtcToLocalWithFormat(
              props.selectedAppointment?.dateFrom,
              'hh:mm A',
            )}
          </Text>
        </View>
      </View>
      <View style={{flex: 1}} />
      <Text
        style={{
          fontFamily: Fonts.Gibson_Regular,
          fontSize: 14,
          marginTop: 16,
          marginBottom: 18,
          alignSelf: 'center',
          color: Colors.PRIMARY_TEXT_COLOR,
        }}>
        {t(Translations.YOUR_APPOINTMENT_IS_CANCELED)}
      </Text>
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
            {t(Translations.OK)}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
export default AppointmentCancelPopup;
// import React, { useState, useEffect, useRef } from 'react';
// import {
//     FlatList,
//     Text,
//     View,
//     Image,
//     TouchableOpacity,
//     TextInput,
//     Platform,
// } from 'react-native';

// import { Fonts, Strings, Colors, Images, Globals } from '../../../constants';
// import { GetImage } from '../../shared/getImage/GetImage';
// import { useFocusEffect } from '@react-navigation/core';
// import { useNavigation } from '@react-navigation/core';
// import Utilities from '../../../helpers/utils/Utilities';
// import LottieView from 'lottie-react-native';

// const AppointmentCancelSuccessPopup = props => {
//     const navigation = useNavigation();
//     useFocusEffect(
//         React.useCallback(() => {
//             console.log('appointmentDetails', props.selectedAppointment);
//             return () => {
//                 // Globals.SELECTED_CUSTOMER_INFO = {};
//                 // Globals.SELECTED_DATE_FROM = '';
//             };
//         }, []),
//     );
//     //Button actions
//     const closePopupAction = () => {
//         //Closing bottom sheet
//         if (props.refRBSheet !== undefined) {
//             if (props.refRBSheet.current !== undefined) {
//                 props.refRBSheet.current.close();

//             }
//         }
//     };

//     const okButtonAction = () => {
//         //Closing bottom sheet
//         if (props.refRBSheet !== undefined) {
//             if (props.refRBSheet.current !== undefined) {
//                 props.refRBSheet.current.close();

//             }
//         }

//         // const timer = setTimeout(() => {
//         //     //Callback to parent. Delay is to bypass iOS modal presentation
//         //     props.didSelectNo();
//         // }, 500);
//         // return () => clearTimeout(timer);
//     };

//     //Final return
//     return (
//         <View
//             style={{
//                 flex: 1,
//             }}>
//             {/* title */}
//             <Text
//                 style={{
//                     fontFamily: Fonts.Gibson_SemiBold,
//                     fontSize: 16,
//                     color: Colors.BOOKING_SUCCESS_GREEN_COLOR,
//                     alignSelf: 'center',
//                     marginTop: 20
//                 }}>
//                 Done
//             </Text>
//             <TouchableOpacity onPress={() => closePopupAction()}>
//                 <Image
//                     style={{
//                         position: 'absolute',
//                         right: 20,
//                         top: -16,
//                         tintColor: Colors.PRIMARY_TEXT_COLOR,
//                     }}
//                     source={Images.CLOSE_ICON}
//                 />
//             </TouchableOpacity>
//             <LottieView
//                 style={{
//                     position: 'absolute',
//                     top: 5,
//                     alignSelf: 'center',
//                     width: 180,
//                     height: 180,
//                 }}
//                 source={Images.SUCCESS_ANIMATION}
//                 autoPlay
//                 loop={false}
//                 colorFilters={[
//                     {
//                         keypath: 'Shape Layer 1',
//                         color: Colors.APPOINTMENT_CANCEL_SUCCESS_COLOR,
//                     },
//                     {
//                         keypath: 'Shape Layer 4',
//                         color: Colors.APPOINTMENT_CANCEL_SUCCESS_COLOR,
//                     },
//                     {
//                         keypath: 'Shape Layer 6',
//                         color: Colors.APPOINTMENT_CANCEL_SUCCESS_COLOR,
//                     },
//                     {
//                         keypath: 'Shape Layer 7',
//                         color: Colors.APPOINTMENT_CANCEL_SUCCESS_COLOR,
//                     },
//                     {
//                         keypath: 'Shape Layer 3',
//                         color: Colors.APPOINTMENT_CANCEL_SUCCESS_COLOR,
//                     },
//                     {
//                         keypath: 'Shape Layer 8',
//                         color: Colors.APPOINTMENT_CANCEL_SUCCESS_COLOR,
//                     },
//                     {
//                         keypath: 'Shape Layer 5',
//                         color: Colors.APPOINTMENT_CANCEL_SUCCESS_COLOR,
//                     },
//                     {
//                         keypath: 'Shape Layer 2',
//                         color: Colors.APPOINTMENT_CANCEL_SUCCESS_COLOR,
//                     },
//                     {
//                         keypath: 'Capa 1/confirmation Outlines',
//                         color: Colors.APPOINTMENT_CANCEL_SUCCESS_COLOR,
//                     },
//                     {
//                         keypath: 'Shape Layer 9',
//                         color: Colors.ERROR_RED_COLOR,
//                     },
//                 ]}
//             />
//             <View style={{ marginTop: 106, flexDirection: 'row' }}>
//                 <GetImage
//                     style={{
//                         marginLeft: 48,
//                         width: 93,
//                         height: 93,
//                         borderRadius: 93 / 2,
//                         borderWidth: 2,
//                         borderColor: Colors.SECONDARY_COLOR,
//                     }}
//                     fullName={(
//                         (props.selectedAppointment?.servingUser_id?.fullName || Globals.BUSINESS_DETAILS.name)
//                     ).trim()}
//                     url={props.selectedAppointment?.servingUser_id?.image}
//                 />
//                 <View style={{ flexDirection: 'column' }}>
//                     <Text
//                         style={{
//                             fontFamily: Fonts.Gibson_SemiBold,
//                             fontSize: 14,
//                             marginTop: 20,
//                             marginLeft: 25,
//                             color: Colors.PRIMARY_TEXT_COLOR,
//                         }}>
//                         {props.selectedAppointment?.servingUser_id?.name || Globals.BUSINESS_DETAILS.name}
//                     </Text>
//                     <Text
//                         style={{
//                             fontFamily: Fonts.Gibson_Regular,
//                             fontSize: 14,
//                             marginTop: 20,
//                             marginLeft: 25,
//                             color: Colors.PRIMARY_TEXT_COLOR,
//                         }}>
//                         {Utilities.getUtcToLocalWithFormat(
//                             props.selectedAppointment?.dateFrom,
//                             'DD MMM YYYY',
//                         )}{' '}
//                         at{' '}
//                         {Utilities.getUtcToLocalWithFormat(
//                             props.selectedAppointment?.dateFrom,
//                             'hh:mm A',
//                         )}
//                     </Text>
//                 </View>
//             </View>
//             <View style={{ flex: 1 }} />
//             <Text
//                 style={{
//                     fontFamily: Fonts.Gibson_Regular,
//                     fontSize: 14,
//                     marginTop: 16,
//                     marginBottom: 18,
//                     alignSelf: 'center',
//                     color: Colors.PRIMARY_TEXT_COLOR,
//                 }}>
//                 Your appointment is cancelled
//             </Text>
//             <View
//                 style={{ flexDirection: 'row', alignSelf: 'center', marginBottom: 30 }}>
//                 <TouchableOpacity
//                     style={{
//                         width: 80,
//                         height: 45,
//                         borderRadius: 8,
//                         borderWidth: 2,
//                         borderColor: Colors.SECONDARY_COLOR,
//                         justifyContent: 'center',
//                     }}
//                     onPress={() => okButtonAction()}>
//                     <Text
//                         style={{
//                             fontFamily: Fonts.Gibson_Regular,
//                             fontSize: 16,
//                             color: Colors.SECONDARY_COLOR,
//                             alignSelf: 'center',
//                         }}>
//                         Ok
//                     </Text>
//                 </TouchableOpacity>

//             </View>
//         </View>
//     );
// };
// export default AppointmentCancelSuccessPopup;
