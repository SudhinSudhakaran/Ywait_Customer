import React, {useState, useEffect, useRef} from 'react';
import {
  FlatList,
  Text,
  View,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Keyboard,
  ScrollView,
  ImageBackground,
  I18nManager,
} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import RBSheet from 'react-native-raw-bottom-sheet';
import InputScrollView from 'react-native-input-scroll-view';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/core';
import AwesomeAlert from 'react-native-awesome-alerts';
import {
  Fonts,
  Strings,
  Colors,
  Images,
  Globals,
  Translations,
} from '../../constants';
import APIConnections from '../../helpers/apiManager/APIConnections';
import DataManager from '../../helpers/apiManager/DataManager';
import Utilities from '../../helpers/utils/Utilities';
import LoadingIndicator from '../shared/loadingIndicator/LoadingIndicator';
import {HelperText} from 'react-native-paper';
import {t} from 'i18next';

const AddReviewPopUp = props => {
  //Declaration
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const appointmentDetails =
    props?.appointmentDetails ||
    Globals.SHARED_VALUES.SELECTED_APPOINTMENT_INFO;

  useEffect(() => {}, []);

  //Button actions
  const closePopupAction = () => {
    //Closing bottom sheet
    if (props.RBSheet !== undefined) {
      if (props.RBSheet.current !== undefined) {
        props.RBSheet.current.close();
      }
    }
  };

  const doneButtonAction = () => {
    if (rating === 0) {
      setShowAlert(true);
      setAlertMessage(t(Translations.PLEASE_SELECT_RATING));
      setShowAlert(true);
      // alert('Please select rating');
    } else if (review.trim() === '') {
      setAlertMessage(t(Translations.PLEASE_ENTER_REVIEW));
      setShowAlert(true);
      // alert('Please enter review');
    } else {
      closePopupAction();
      props.onAddReview(rating, review);
    }
  };

  //Final return
  return (
    <View
      style={
        {
          // flex: 1,
        }
      }>
      <LoadingIndicator visible={isLoading} />
      {/* title */}
      <Text
        style={{
          marginTop: 20,
          fontFamily: Fonts.Gibson_Regular,
          fontSize: 18,
          marginLeft: 16,
          color: Colors.NOTES_CONTENT,
          textAlign:'left'
        }}>
        {t(Translations.REVIEW_AND_RATING)}
      </Text>
      <TouchableOpacity
        style={{
          position: 'absolute',
          right: -10,
          top: 15,
          width: 50,
          height: 50,
        }}
        onPress={() => closePopupAction()}>
        <Image
          style={{width: 14, height: 14, tintColor: Colors.PRIMARY_TEXT_COLOR}}
          source={Images.CLOSE_ICON}
        />
      </TouchableOpacity>

      <KeyboardAwareScrollView enableOnAndroid extraHeight={120}>
        {/* TITLE TEXT */}
        <Text
          style={{
            marginTop: 50,
            fontFamily: Fonts.Gibson_SemiBold,
            fontSize: 14,
            color: Colors.RATING_BLACK_COLOR,
            alignSelf: 'center',
          }}>
          {t(Translations.HOW_IS_THE_EXPERIENCE_WITH)}
        </Text>
        <Text
          style={{
            marginTop: 6,
            fontFamily: Fonts.Gibson_SemiBold,
            fontSize: 16,
            color: Colors.RATING_BLACK_COLOR,
            alignSelf: 'center',
            marginLeft: 16,
            marginRight: 16,
          }}
          numberOfLines={1}>
          {appointmentDetails?.servingUser_id?.name || 'N/A'}
        </Text>
        {/* RATING VIEW */}
        <View
          style={{height: 130, marginLeft: 45, marginRight: 45, marginTop: 10}}>
          <ImageBackground
            source={Images.RATING_BACKGROUND}
            resizeMode="contain"
            style={{height: 130}}>
            <View
              style={{
                marginTop: 32,
                height: 32,
                flexDirection: 'row',
                marginLeft: 30,
                marginRight: 30,
              }}>
              {/* 1 */}
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <TouchableOpacity
                  style={{
                    height: 32,
                    width: 32,
                    backgroundColor:
                      rating === 1 ||
                      rating === 2 ||
                      rating === 3 ||
                      rating === 4 ||
                      rating === 5
                        ? Colors.RATING_FILL_BLUE_COLOR
                        : Colors.APP_PRIMARY_COLOR,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: Colors.RATING_FILL_BLUE_COLOR,
                  }}
                  onPress={() => setRating(1)}>
                  <Text
                    style={{
                      fontFamily: Fonts.Gibson_Regular,
                      fontSize: 16,
                      color:
                        rating === 1 ||
                        rating === 2 ||
                        rating === 3 ||
                        rating === 4 ||
                        rating === 5
                          ? Colors.APP_PRIMARY_COLOR
                          : Colors.RATING_FILL_BLUE_COLOR,
                    }}>
                    1
                  </Text>
                </TouchableOpacity>
              </View>

              {/* 2 */}
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <TouchableOpacity
                  style={{
                    height: 32,
                    width: 32,
                    backgroundColor:
                      rating === 2 ||
                      rating === 3 ||
                      rating === 4 ||
                      rating === 5
                        ? Colors.RATING_FILL_BLUE_COLOR
                        : Colors.APP_PRIMARY_COLOR,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: Colors.RATING_FILL_BLUE_COLOR,
                  }}
                  onPress={() => setRating(2)}>
                  <Text
                    style={{
                      fontFamily: Fonts.Gibson_Regular,
                      fontSize: 16,
                      color:
                        rating === 2 ||
                        rating === 3 ||
                        rating === 4 ||
                        rating === 5
                          ? Colors.APP_PRIMARY_COLOR
                          : Colors.RATING_FILL_BLUE_COLOR,
                    }}>
                    2
                  </Text>
                </TouchableOpacity>
              </View>

              {/* 3 */}
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <TouchableOpacity
                  style={{
                    height: 32,
                    width: 32,
                    backgroundColor:
                      rating === 3 || rating === 4 || rating === 5
                        ? Colors.RATING_FILL_BLUE_COLOR
                        : Colors.APP_PRIMARY_COLOR,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: Colors.RATING_FILL_BLUE_COLOR,
                  }}
                  onPress={() => setRating(3)}>
                  <Text
                    style={{
                      fontFamily: Fonts.Gibson_Regular,
                      fontSize: 16,
                      color:
                        rating === 3 || rating === 4 || rating === 5
                          ? Colors.APP_PRIMARY_COLOR
                          : Colors.RATING_FILL_BLUE_COLOR,
                    }}>
                    3
                  </Text>
                </TouchableOpacity>
              </View>

              {/* 4 */}
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <TouchableOpacity
                  style={{
                    height: 32,
                    width: 32,
                    backgroundColor:
                      rating === 4 || rating === 5
                        ? Colors.RATING_FILL_BLUE_COLOR
                        : Colors.APP_PRIMARY_COLOR,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: Colors.RATING_FILL_BLUE_COLOR,
                  }}
                  onPress={() => setRating(4)}>
                  <Text
                    style={{
                      fontFamily: Fonts.Gibson_Regular,
                      fontSize: 16,
                      color:
                        rating === 4 || rating === 5
                          ? Colors.APP_PRIMARY_COLOR
                          : Colors.RATING_FILL_BLUE_COLOR,
                    }}>
                    4
                  </Text>
                </TouchableOpacity>
              </View>

              {/* 5 */}
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <TouchableOpacity
                  style={{
                    height: 32,
                    width: 32,
                    backgroundColor:
                      rating === 5
                        ? Colors.RATING_FILL_BLUE_COLOR
                        : Colors.APP_PRIMARY_COLOR,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: Colors.RATING_FILL_BLUE_COLOR,
                  }}
                  onPress={() => setRating(5)}>
                  <Text
                    style={{
                      fontFamily: Fonts.Gibson_Regular,
                      fontSize: 16,
                      color:
                        rating === 5
                          ? Colors.APP_PRIMARY_COLOR
                          : Colors.RATING_FILL_BLUE_COLOR,
                    }}>
                    5
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text
              style={{
                marginTop: 30,
                fontFamily: Fonts.Gibson_SemiBold,
                fontSize: 18,
                color: Colors.RATING_BLACK_COLOR,
                alignSelf: 'center',
                marginLeft: 16,
                marginRight: 16,
              }}
              numberOfLines={1}>
              {rating} {t(Translations.OUT_OF)} 5
            </Text>
          </ImageBackground>
        </View>

        <TextInput
          style={{
            marginTop: 30,
            marginLeft: 16,
            marginRight: 16,
            fontFamily: Fonts.Gibson_Regular,
            fontSize: 14,
            color: Colors.PRIMARY_TEXT_COLOR,
            height: 150,
            borderWidth: 1,
            borderColor: Colors.LINE_SEPARATOR_COLOR,
            padding: 10,
            textAlign: I18nManager.isRTL ? 'right' : 'left',
            textAlignVertical: 'top',
          }}
          multiline={true}
          placeholder={t(Translations.ADD_REVIEW)}
          placeholderTextColor={Colors.PLACEHOLDER_COLOR}
          value={review}
          onChangeText={text => setReview(text)}
        />

        {/* <HelperText
                    style={{ marginBottom: 80 }}
                    type="error"
                    visible={(item?.userErrorText?.length || 0) > 0}>
                    {item.userErrorText}
                </HelperText> */}
        <TouchableOpacity
          style={{
            width: 150,
            height: 44,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: Colors.SECONDARY_COLOR,
            borderRadius: 8,
            alignSelf: 'center',
            marginTop: 40,
          }}
          activeOpacity={1}
          onPress={() => doneButtonAction()}>
          <Text
            Text
            style={{
              fontFamily: Fonts.Gibson_Regular,
              fontSize: 16,
              color: Colors.WHITE_COLOR,
            }}
            numberOfLines={1}>
            {t(Translations.DONE)}
          </Text>
        </TouchableOpacity>
      </KeyboardAwareScrollView>

      <AwesomeAlert
        show={showAlert}
        showProgress={false}
        title={''}
        titleStyle={{
          color: Colors.BLACK_COLOR,
          fontFamily: Fonts.Gibson_Regular,
        }}
        message={alertMessage}
        closeOnTouchOutside={false}
        closeOnHardwareBackPress={false}
        showCancelButton={false}
        showConfirmButton={true}
        animatedValue={0.8}
        cancelText={t(Translations.NO)}
        confirmText={t(Translations.OK)}
        confirmButtonColor={Colors.PRIMARY_COLOR}
        cancelButtonColor={Colors.SECONDARY_COLOR}
        onCancelPressed={() => {
          setShowAlert(false);
        }}
        onConfirmPressed={() => {
           setShowAlert(false);
        }}
        cancelButtonStyle={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 8,
        }}
        confirmButtonStyle={{
          flex: 1,
          marginRight:60,
          marginLeft:60,
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 8,
        }}
        actionContainerStyle={{
          width: '80%',
        }}
        cancelButtonTextStyle={{
          color: Colors.WHITE_COLOR,
          fontFamily: Fonts.Gibson_SemiBold,
        }}
        confirmButtonTextStyle={{
          color: Colors.WHITE_COLOR,
          fontFamily: Fonts.Gibson_SemiBold,
        }}
        messageStyle={{
          textAlign: 'left',
          color: Colors.BLACK_COLOR,
          fontFamily: Fonts.Gibson_Regular,
          fontSize: 15,
        }}
      />
    </View>
  );
};
export default AddReviewPopUp;
