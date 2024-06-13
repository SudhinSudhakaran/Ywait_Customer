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
  I18nManager,
} from 'react-native';

import {Fonts, Strings, Colors, Images, Globals,Translations} from '../../../constants';
import {GetImage} from '../../shared/getImage/GetImage';
import {useFocusEffect} from '@react-navigation/core';
import {useNavigation} from '@react-navigation/core';
import Utilities from '../../../helpers/utils/Utilities';
import ViewShot from 'react-native-view-shot';
import Share from 'react-native-share';
   import {t} from 'i18next';
const TicketScreen = props => {
  const navigation = useNavigation();
  const appointmentDetails = props?.selectedAppointment || {};
  const [servicesName, setServicesName] = useState('');

  const viewShotRef = useRef();
  var _imageURL = '';

  useEffect(() => {
    if (Utilities.isServiceBasedBusiness() === true) {
      if (appointmentDetails?.services?.length > 0) {
        let _servicesName = appointmentDetails?.services
          ?.map(_item => _item.name)
          .join(', ');
        setServicesName(_servicesName);
      }
    }
  }, []);

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

  const shareButtonAction = () => {
    // //Closing bottom sheet
    // if (props.refRBSheet !== undefined) {
    //     if (props.refRBSheet.current !== undefined) {
    //         props.refRBSheet.current.close();
    //     }
    // }
    // const timer = setTimeout(() => {
    //     //Callback to parent. Delay is to bypass iOS modal presentation
    //     //props.appointmentRescheduleAction();
    // }, 500);
    // return () => clearTimeout(timer);

    Share.open({
      title: `Share some text`,
      url: _imageURL,
    })
      .then(res => {
        console.log(res);
      })
      .catch(err => {
        err && console.log(err);
      });
  };

  const onCaptureAction = () => {
    if (_imageURL?.length === 0) {
      viewShotRef.current.capture().then(uri => {
        console.log('do something with ', uri);
        _imageURL = uri;
      });
    }
  };

  //Final return
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.GREY_COLOR,
      }}>
      {/* title */}
      <View style={{marginBottom: 8, height: 50}}>
        <Text
          style={{
            fontFamily: Fonts.Gibson_SemiBold,
            fontSize: 16,
            color: Colors.PRIMARY_COLOR,
            alignSelf: 'center',
            marginTop: 20,
          }}>
          {t(Translations.SHARE_TICKET)}
        </Text>
        <TouchableOpacity onPress={() => closePopupAction()}>
          <Image
            style={{
              position: 'absolute',
              right: 20,
              top: -16,
              tintColor: Colors.WHITE_COLOR,
            }}
            source={Images.CLOSE_ICON}
          />
        </TouchableOpacity>
      </View>

      <ScrollView>
        {/* keyboardOffset={110}
                keyboardShouldPersistTaps="handled"
                bounces={true}
                contentContainerStyle={{
                    flexGrow: 1,
                    justifyContent: 'flex-start',
                }}> */}

        <ViewShot
          ref={viewShotRef}
          onCapture={() => onCaptureAction()}
          captureMode={'mount'}>
          <View
            style={{
              flex: 1,
              backgroundColor: Colors.GREY_COLOR,
              marginTop: 10,
              marginBottom: 10,
              marginLeft: 10,
              marginRight: 10,
            }}>
            <View
              style={{
                height: Utilities.isServiceBasedBusiness() === true ? 590 : 523,
                backgroundColor: Colors.WHITE_COLOR,
                flex: 1,
                marginTop: 30,
                marginBottom: 30,
                marginLeft: 30,
                marginRight: 30,
                borderTopRightRadius: 10,
                borderTopLeftRadius: 10,
              }}>
              <GetImage
                style={{
                  marginTop: 30,
                  width: 50,
                  height: 50,
                  borderRadius: 50 / 2,
                  borderWidth: 1,
                  borderColor: Colors.SECONDARY_COLOR,
                  alignSelf: 'center',
                }}
                fullName={(
                  Globals.BUSINESS_DETAILS?.name || Strings.APP_NAME
                ).trim()}
                alphabetColor={Colors.PRIMARY_COLOR}
                url={Globals.BUSINESS_DETAILS?.image}
              />

              <Text
                style={{
                  marginTop: 12,
                  marginLeft: 12,
                  marginRight: 12,
                  fontFamily: Fonts.Gibson_SemiBold,
                  fontSize: 16,
                  color: Colors.SECONDARY_COLOR,
                  alignSelf: 'center',
                }}>
                {Globals.BUSINESS_DETAILS?.name || Strings.APP_NAME}
              </Text>

              <View
                style={{
                  marginTop: 8,
                  width: 50,
                  height: 3,
                  backgroundColor: Colors.SECONDARY_COLOR,
                  alignSelf: 'center',
                }}
              />

              {/* QUEUE POSITION VIEW */}
              <View
                style={{
                  marginTop: 16,
                  height: 190,
                  width: 170,
                  //Shadow props
                  borderWidth: 0.1,
                  borderColor: Colors.GREY_COLOR,
                  backgroundColor: Colors.WHITE_COLOR,
                  shadowColor: Colors.SHADOW_COLOR,
                  shadowOffset: {width: 0, height: 4},
                  shadowOpacity: 0.8,
                  shadowRadius: 10,
                  elevation: 8,
                  borderRadius: 20,
                  alignSelf: 'center',
                  alignItems: 'center',
                }}>
                <View style={{justifyContent: 'center', alignItems: 'center'}}>
                  <Image
                    style={{width: 181, height: '90%', resizeMode: 'contain'}}
                    source={Images.QUEUE_POSITION_IMAGE}
                  />
                  <View
                    style={{
                      height: 80,
                      //width: 70,

                      //Shadow props
                      borderWidth: 2,
                      borderColor: Colors.PRIMARY_COLOR,
                      backgroundColor: Colors.WHITE_COLOR,
                      justifyContent: 'center',
                      alignItems: 'center',
                      position: 'absolute',
                    }}>
                    <Text
                      style={{
                        marginLeft: 10,
                        marginRight: 10,
                        fontSize: 50,
                        color: Colors.PRIMARY_COLOR,
                        fontFamily: Fonts.Rift_Demi,
                      }}>
                      {appointmentDetails?.token || ''}
                    </Text>
                  </View>
                </View>
              </View>

              <View
                style={{
                  marginTop: 16,
                  marginLeft: 5,
                  marginRight: 5,
                  width: '100%',
                  borderStyle: 'dotted',
                  borderTopWidth: 4,
                  borderTopColor: Colors.GREY_COLOR,
                }}
              />
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginTop: -16,
                }}>
                <View
                  style={{
                    marginLeft: -10,
                    width: 20,
                    height: 20,
                    borderRadius: 20 / 2,
                    backgroundColor: Colors.GREY_COLOR,
                  }}
                />

                <View
                  style={{
                    marginRight: -10,
                    width: 20,
                    height: 20,
                    borderRadius: 20 / 2,
                    backgroundColor: Colors.GREY_COLOR,
                  }}
                />
              </View>

              <Text
                style={{
                  marginTop: 12,
                  color: Colors.BLACK_COLOR,
                  fontFamily: Fonts.Gibson_SemiBold,
                  fontSize: 12,
                  alignSelf: 'center',
                }}>
                {t(Translations.WE_LOOK_FORWARD_TO_SERVE_YOU_SOON)}
              </Text>

              <Text
                style={{
                  marginTop: 14,
                  color: Colors.PLACEHOLDER_COLOR,
                  fontFamily: Fonts.Gibson_Regular,
                  fontSize: 12,
                  alignSelf: 'center',
                }}>
                {t(Translations.DATE_AND_TIME)}
              </Text>

              <Text
                style={{
                  marginTop: 8,
                  color: Colors.PRIMARY_TEXT_COLOR,
                  fontFamily: Fonts.Gibson_SemiBold,
                  fontSize: 12,
                  alignSelf: 'center',
                }}>
                {Utilities.getUtcToLocalWithFormat(
                  appointmentDetails?.dateFrom,
                  'DD MMM YYYY',
                )}{' '}
             at{' '}
                {Utilities.getUtcToLocalWithFormat(
                  appointmentDetails?.dateFrom,
                  Utilities.isBusiness24HrTimeFormat() ? 'HH:mm' : 'hh:mm A',
                )}
              </Text>

              <View
                style={{
                  marginTop: 16,
                  backgroundColor: Colors.TEXT_PLACEHOLDER_COLOR,
                  height: 0.5,
                  marginLeft: 50,
                  marginRight: 50,
                }}
              />

              <Text
                style={{
                  marginTop: 16,
                  color: Colors.PLACEHOLDER_COLOR,
                  fontFamily: Fonts.Gibson_Regular,
                  fontSize: 12,
                  alignSelf: 'center',
                }}>
                {t(Translations.CONSULTATION_WITH)}
              </Text>

              <Text
                style={{
                  marginTop: 8,
                  color: Colors.PRIMARY_TEXT_COLOR,
                  fontFamily: Fonts.Gibson_SemiBold,
                  fontSize: 12,
                  alignSelf: 'center',
                }}
                numberOfLines={1}>
                {appointmentDetails?.servingUser_id?.fullName ||
                  Globals.BUSINESS_DETAILS?.name ||
                  Strings.APP_NAME}
              </Text>

              <View
                style={{
                  marginTop: 16,
                  backgroundColor: Colors.TEXT_PLACEHOLDER_COLOR,
                  height: 0.5,
                  marginLeft: 50,
                  marginRight: 50,
                }}
              />

              {Utilities.isServiceBasedBusiness() === true ? (
                <>
                  <Text
                    style={{
                      marginTop: 16,
                      color: Colors.PLACEHOLDER_COLOR,
                      fontFamily: Fonts.Gibson_Regular,
                      fontSize: 12,
                      alignSelf: 'center',
                    }}>
                    Services
                  </Text>

                  <Text
                    style={{
                      marginTop: 8,
                      color: Colors.PRIMARY_TEXT_COLOR,
                      fontFamily: Fonts.Gibson_SemiBold,
                      fontSize: 12,
                      alignSelf: 'center',
                    }}>
                    {servicesName}
                  </Text>

                  <View
                    style={{
                      marginTop: 16,
                      backgroundColor: Colors.TEXT_PLACEHOLDER_COLOR,
                      height: 0.5,
                      marginLeft: 50,
                      marginRight: 50,
                    }}
                  />
                </>
              ) : null}

              <Image
                style={{
                  width: '100%',
                  height: 30,
                  marginTop: 16,
                  resizeMode: 'stretch',
                }}
                source={Images.BILL_BORDER_IMAGE}
              />
            </View>
          </View>
        </ViewShot>
      </ScrollView>

      <TouchableOpacity
        style={{
          alignSelf: 'center',
          width: 100,
          height: 45,
          borderRadius: 8,
          borderWidth: 2,
          borderColor: Colors.SECONDARY_COLOR,
          backgroundColor: Colors.SECONDARY_COLOR,
          justifyContent: 'center',
          marginLeft: 15,
          marginBottom: 16,
          marginTop: 16,
        }}
        onPress={() => shareButtonAction()}>
        <Text
          style={{
            fontFamily: Fonts.Gibson_Regular,
            fontSize: 16,
            color: Colors.WHITE_COLOR,
            alignSelf: 'center',
          }}>
        {t(Translations.SHARE)}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
export default TicketScreen;
