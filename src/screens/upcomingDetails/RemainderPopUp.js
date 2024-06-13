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
  Platform,
  Alert,
  I18nManager,
  StyleSheet,
  Linking,
} from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import InputScrollView from 'react-native-input-scroll-view';
import moment from 'moment';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/core';
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
import {GetImage} from '../shared/getImage/GetImage';
import DisplayUtils from '../../helpers/utils/DisplayUtils';
import ReminderService from '../shared/reminderService/ReminderService';
import ReminderSuccessPopUp from './RemainderSuccessPopUp';
import RNCalendarEvents from 'react-native-calendar-events';
import {t} from 'i18next';
import AwesomeAlert from 'react-native-awesome-alerts';
import { responsiveWidth } from 'react-native-responsive-dimensions';

const ReminderPopUp = props => {
  //Declaration
  const Reminder = new ReminderService();

  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedReminderTime, setSelectedReminderTime] = useState(); //24,12,4,2,30,10
  const [reminderIfFound, setReminderIfFound] = useState();
  // const [hourDifference, setHourDifference] = useState();
  const [minuteDifference, setMinuteDifference] = useState();
  const [showAlert, setShowAlert] = useState(false);
  const refReminderSuccessPopUpRBsheetPopup = useRef();
  const [showNoTimeSelectedAlert, setShowNoTimeSelectedAlert] = useState(false);
  useEffect(() => {
    console.log('Reminder popup===>', props.appointmentDetails);

    RNCalendarEvents.requestPermissions(false)
      .then(fulfiled => {
        console.log('permission =>', fulfiled);
        if (fulfiled === 'denied' || fulfiled === 'restricted') {
          console.log('permission required');
          Alert.alert(
            'Permission Request',
            'Please allow permission to access the calendar.',
            [
              {
                text: 'Go to Settings',
                onPress: () => {
                  Linking.openSettings();
                },
              },
              {
                text: 'Cancel',
                style: 'cancel',
              },
            ],
            {cancelable: false},
          );
        } else if (fulfiled === 'authorized' || fulfiled === 'undetermined') {
          this.hasAccess = true;
          // check if device has custom calendar
          return new Promise((resolve, reject) => {
            RNCalendarEvents.findCalendars()
              .then(calendars => {
                const primaryCalendar = calendars.find(
                  c => c.isPrimary && c.allowsModifications,
                );
                console.log('primaryCalendar:', primaryCalendar);
                getEvents(primaryCalendar.id);
                resolve(calendars);
              })
              .catch(error => {
                setIsLoading(false);
                reject(error);
              });
          });
        }
      })
      .catch(error => {
        setIsLoading(false);
        console.error(error);
      });
  }, []);

  const getEvents = async calenderId => {
    if (Platform.OS === 'ios') {
      setIsLoading(true);
      let events = await Reminder.getEvents(
        moment(new Date()).format('YYYY-MM-DDTHH:mm:ss.sssZ'),
        moment(new Date()).add(50, 'day').format('YYYY-MM-DDTHH:mm:ss.sssZ'),
        calenderId,
      );
      console.log(
        'Start Date',
        moment(new Date()).format('YYYY-MM-DDTHH:mm:ss.sssZ'),
      );
      console.log('EVENTS', events);
      setIsLoading(false);
      checkIfEventAlreadyExist(events);
    } else {
      setIsLoading(true);
      let events = await Reminder.getEvents(
        moment(new Date())
          .subtract(1, 'day')
          .format('YYYY-MM-DDTHH:mm:ss.sss[Z]'),
        moment(new Date()).add(50, 'day').format('YYYY-MM-DDTHH:mm:ss.sss[Z]'),
        calenderId,
      );
      console.log(
        'Start Date',
        moment(new Date()).format('YYYY-MM-DDTHH:mm:ss.sss[Z]'),
      );
      console.log('EVENTS', events);
      setIsLoading(false);
      checkIfEventAlreadyExist(events);
    }
  };

  const checkIfEventAlreadyExist = events => {
    let servingUserName = props.appointmentDetails?.servingUser_id?.name;
    let time = Utilities.getUtcToLocalWithFormat(
      props.appointmentDetails?.dateFrom,
      'DD MMM YYYY',
    );
    let businessName = Globals.BUSINESS_DETAILS.name;
    let description =
      t(Translations.YOU_HAVE_AN_APPOINTMENT_WITH) +
      servingUserName +
      t(Translations.ON) +
      time +
      t(Translations.IN) +
      businessName;
    events?.map((itemData, rowIndex) => {
      if (description === itemData.description && Platform.OS === 'android') {
        //if remainder found
        console.log('TITLE FOUND');
        if (itemData.alarms.length > 0) {
          itemData?.alarms?.map((itemData1, rowIndex) => {
            console.log('itemData.startDate', itemData.startDate);
            console.log('itemData1.date', itemData1.date);
            let alarmHours =
              Platform.OS === 'ios'
                ? moment(itemData.startDate).diff(
                    moment(itemData1.date),
                    'hour',
                  )
                : -moment(itemData.startDate).diff(
                    moment(itemData1.date),
                    'hour',
                  );
            console.log('Alarms:', alarmHours);
            if (alarmHours > 0) {
              setSelectedReminderTime(alarmHours);
            } else {
              let alarmMinutes =
                Platform.OS === 'ios'
                  ? moment(itemData.startDate).diff(
                      moment(itemData1.date),
                      'minutes',
                    )
                  : -moment(itemData.startDate).diff(
                      moment(itemData1.date),
                      'minutes',
                    );
              setSelectedReminderTime(alarmMinutes);
              console.log('alarmMinutes:', alarmMinutes);
            }
          });
        }
        setReminderIfFound(itemData);
      } else if (description === itemData.notes && Platform.OS === 'ios') {
        console.log('TITLE FOUND');
        if (itemData.alarms.length > 0) {
          itemData?.alarms?.map((itemData1, rowIndex) => {
            console.log('itemData.startDate', itemData.startDate);
            console.log('itemData1.date', itemData1.date);
            let alarmHours =
              Platform.OS === 'ios'
                ? moment(itemData.startDate).diff(
                    moment(itemData1.date),
                    'hour',
                  )
                : -moment(itemData.startDate).diff(
                    moment(itemData1.date),
                    'hour',
                  );
            console.log('Alarms:', alarmHours);
            if (alarmHours > 0) {
              setSelectedReminderTime(alarmHours);
            } else {
              let alarmMinutes =
                Platform.OS === 'ios'
                  ? moment(itemData.startDate).diff(
                      moment(itemData1.date),
                      'minutes',
                    )
                  : -moment(itemData.startDate).diff(
                      moment(itemData1.date),
                      'minutes',
                    );
              setSelectedReminderTime(alarmMinutes);
              console.log('alarmMinutes:', alarmMinutes);
            }
          });
        }
        setReminderIfFound(itemData);
      }
    });
    checkDateFrom();
  };
  const checkDateFrom = () => {
    console.log(
      'props.appointmentDetails?.dateFrom',
      props.appointmentDetails?.dateFrom,
    );
    let minutesDiff = moment(props.appointmentDetails?.dateFrom).diff(
      moment(),
      'minutes',
    );
    // let hourDiff = moment(props.appointmentDetails?.dateFrom).diff(moment(), t(Translations.HOUR))

    console.log('minutesDiff', minutesDiff);
    // console.log('hourDiff', hourDiff)
    // setHourDifference(hourDiff)
    setMinuteDifference(minutesDiff);
  };
  const confirmation = () => {
    setShowAlert(true);
    // Alert.alert(
    //  t(Translations.ARE_YOU_SURE),
    //  t(Translations.IF_ANY_REMINDER_ADDED_FOR_THIS_APPOINTMENT_WILL_BE_REMOVED_DO_YOU_WANT_TO_CONTINUE),
    //   [
    //     {
    //       text: 'No',
    //       onPress: () => console.log('Cancel Pressed'),
    //       style: 'cancel',
    //     },
    //     {text: 'Yes', onPress: () => setRemainderWithoutAlarmButtonAction()},
    //   ],
  };

  //Button actions
  const closePopupAction = () => {
    //Closing bottom sheet
    if (props.RBSheet !== undefined) {
      if (props.RBSheet.current !== undefined) {
        props.RBSheet.current.close();
      }
    }
  };

  const setRemainderButtonAction = () => {
    console.log('finish');
    let servingUserName = props.appointmentDetails?.servingUser_id?.name;
    let time = Utilities.getUtcToLocalWithFormat(
      props.appointmentDetails?.dateFrom,
      'DD MMM YYYY',
    );
    let businessName = Globals.BUSINESS_DETAILS.name;
    let reminderName =
      t(Translations.APPOINTMENT_WITH) +
      servingUserName +
      t(Translations.FROM_Y_WAIT);
    let description =
      t(Translations.YOU_HAVE_AN_APPOINTMENT_WITH) +
      servingUserName +
      t(Translations.ON) +
      time +
      t(Translations.IN) +
      businessName;
    console.log('title:', reminderName);
    console.log('description:', description);

    var startDate = '';
    var endDate = '';
    if (Platform.OS === 'ios') {
      startDate = props.appointmentDetails?.dateFrom;
    } else {
      startDate = moment(props.appointmentDetails?.dateFrom).format(
        'YYYY-MM-DDTHH:mm:ss.sss[Z]',
      );
    }
    if (Platform.OS === 'ios') {
      endDate = props.appointmentDetails?.dateTo;
    } else {
      endDate = moment(props.appointmentDetails?.dateTo).format(
        'YYYY-MM-DDTHH:mm:ss.sss[Z]',
      );
    }

    console.log('startDate:', startDate);
    console.log('endDate:', endDate);

    //24,12,4,2,30,10
    var alarmDate = 0;
    if (selectedReminderTime === 10 || selectedReminderTime === 30) {
      if (Platform.OS === 'ios') {
        let _alarmDate = selectedReminderTime;
        alarmDate = -_alarmDate;
      } else {
        alarmDate = selectedReminderTime;
      }
    } else if (
      selectedReminderTime === 2 ||
      selectedReminderTime === 4 ||
      selectedReminderTime === 12 ||
      selectedReminderTime === 24
    ) {
      if (Platform.OS === 'ios') {
        let _alarmDate = moment
          .duration(selectedReminderTime, 'hour')
          .asMinutes();
        alarmDate = -_alarmDate;
      } else {
        alarmDate = moment.duration(selectedReminderTime, 'hour').asMinutes();
      }
    }
    console.log('alarmDate:', alarmDate);
    if (reminderIfFound === undefined) {
      RNCalendarEvents.requestPermissions(false)
        .then(fulfiled => {
          if (fulfiled === 'authorized' || fulfiled === 'undetermined') {
            this.hasAccess = true;
            // check if device has custom calendar
            return new Promise((resolve, reject) => {
              RNCalendarEvents.findCalendars()
                .then(calendars => {
                  const primaryCalendar = calendars.find(
                    c => c.isPrimary && c.allowsModifications,
                  );
                  console.log('primaryCalendar:', primaryCalendar);
                  Reminder.addEvent({
                    title: reminderName,
                    description: Platform.OS === 'ios' ? '' : description,
                    notes: Platform.OS === 'ios' ? description : '',
                    startDate: startDate,
                    endDate: endDate,
                    alarmDate: alarmDate,
                    calenderId: primaryCalendar.id,
                  })
                    .then(reminder => {
                      console.log('Success');
                      refReminderSuccessPopUpRBsheetPopup.current.open();
                    })
                    .catch(error => {
                      console.log(error);
                    });
                  resolve(calendars);
                })
                .catch(error => {
                  reject(error);
                });
            });
          }
        })
        .catch(error => {
          console.error(error);
        });
    } else {
      RNCalendarEvents.removeEvent(reminderIfFound.id, {
        futureEvents: true,
      })
        .then(() => {
          return new Promise((resolve, reject) => {
            RNCalendarEvents.findCalendars()
              .then(calendars => {
                const primaryCalendar = calendars.find(
                  c => c.isPrimary && c.allowsModifications,
                );
                console.log('primaryCalendar:', primaryCalendar);
                Reminder.addEvent({
                  title: reminderName,
                  description: Platform.OS === 'ios' ? '' : description,
                  notes: Platform.OS === 'ios' ? description : '',
                  startDate: startDate,
                  endDate: endDate,
                  alarmDate: alarmDate,
                  calenderId: primaryCalendar.id,
                })
                  .then(reminder => {
                    refReminderSuccessPopUpRBsheetPopup.current.open();
                  })
                  .catch(error => {
                    console.log(error);
                  });
                resolve(calendars);
              })
              .catch(error => {
                reject(error);
              });
          });
        })
        .catch(error => {
          console.log(error);
        });
    }
  };

  const setRemainderWithoutAlarmButtonAction = () => {
    RNCalendarEvents.removeEvent(reminderIfFound.id, {
      futureEvents: true,
    }).then(() => {
      closePopupAction();
    });
  };

  const ReminderSuccess = () => {
    return (
      <RBSheet
        ref={refReminderSuccessPopUpRBsheetPopup}
        closeOnDragDown={false}
        closeOnPressMask={true}
        customStyles={{
          wrapper: {
            backgroundColor: '#00000080',
          },
          container: {
            borderTopLeftRadius: 15,
            borderTopRightRadius: 15,
          },
          draggableIcon: {
            backgroundColor: Colors.PRIMARY_TEXT_COLOR,
          },
        }}
        height={DisplayUtils.setHeight(26)}
        onClose={() => closePopupAction()}>
        <ReminderSuccessPopUp
          RBSheet={refReminderSuccessPopUpRBsheetPopup}
          dateFrom={props.appointmentDetails?.dateFrom}
          remindBefore={selectedReminderTime}
          okAction={handleOkAction}
        />
      </RBSheet>
    );
  };
  const handleOkAction = () => {
    closePopupAction();
  };

  //Final return
  return (
    <View
      style={{
        flex: 1,
      }}>
      <LoadingIndicator visible={isLoading} />
      <ReminderSuccess />
      {/* title */}
      <Text
        style={{
          color: Colors.PRIMARY_TEXT_COLOR,
          marginTop: 25,
          fontFamily: Fonts.Gibson_SemiBold,
          fontSize: 18,
          marginLeft: 26,
          textAlign: 'left',
        }}>
        {t(Translations.REMINDER)}
      </Text>
      <TouchableOpacity
        style={{
          position: 'absolute',
          right: -10,
          top: 25,
          width: 50,
          height: 50,
        }}
        onPress={() => closePopupAction()}>
        <Image
          style={{width: 14, height: 14, tintColor: Colors.PRIMARY_TEXT_COLOR}}
          source={Images.CLOSE_ICON}
        />
      </TouchableOpacity>

      {/* CONSULTATION WITH */}
      <Text
        Text
        style={{
          fontFamily: Fonts.Gibson_Regular,
          fontSize: 14,
          color: Colors.HOSPITAL_NAME_COLOR,
          marginTop: 35,
          marginLeft: 26,
          textAlign: 'left',
        }}
        numberOfLines={1}>
        {t(Translations.CONSULTATION_WITH)}
      </Text>

      {/* SERVING USER */}
      <View style={{marginHorizontal: 12, marginTop: 30, flexDirection: 'row'}}>
        <View>
          <GetImage
            style={{
              marginTop: 5,
              marginLeft: 10,
              width: 50,
              height: 50,
              borderRadius: 50 / 2,
              borderWidth: 1.5,
              borderColor: Colors.PRIMARY_COLOR,
            }}
            fullName={(
              props.appointmentDetails?.servingUser_id?.fullName || 'N/A'
            ).trim()}
            alphabetColor={Colors.SECONDARY_COLOR}
            url={props.appointmentDetails?.servingUser_id?.image}
          />
        </View>
        <View style={{marginLeft: 15}}>
          <Text
            style={{
              fontFamily: Fonts.Gibson_Regular,
              color: Colors.PRIMARY_TEXT_COLOR,
              fontSize: 24,
              width: DisplayUtils.setWidth(75),
              textAlign: 'left',
            }}
            numberOfLines={1}>
            {props.appointmentDetails?.servingUser_id?.name || 'N/A'}
          </Text>

          <Text
            style={{
              color: Colors.SECONDARY_COLOR,
              fontFamily: Fonts.Gibson_Regular,
              fontSize: 14,
              marginTop: 8,
              width: DisplayUtils.setWidth(75),
              textAlign: 'left',
            }}
            numberOfLines={1}>
            {props.appointmentDetails?.servingUser_id?.department_id?.role}
          </Text>

          {/* <Text
                        style={{
                            color: Colors.HOSPITAL_NAME_COLOR,
                            fontSize: 12,
                            fontFamily: Fonts.Gibson_Regular,
                            marginTop: 8,
                        }}>
                        {props.appointmentDetails?.servingUser_id?.department_id?.department_name}
                    </Text> */}
        </View>
      </View>

      {/* SET REMINDER */}
      <View
        style={{
          flexDirection: 'row',
          width: DisplayUtils.setWidth(75),
          marginLeft: 10,
          marginTop: 40,
        }}>
        <Text style={styles.timeText}> {t(Translations.SET_REMINDER_ON)} </Text>
        <Text style={styles.timeText}>
          {Utilities.getUtcToLocalWithFormat(
            props.appointmentDetails?.dateFrom,
            'DD',
          )}{' '}
        </Text>
        <Text style={styles.timeText}>
          {Utilities.getUtcToLocalWithFormat(
            props.appointmentDetails?.dateFrom,
            'MMM',
          )}{' '}
        </Text>
        <Text style={styles.timeText}>
          {Utilities.getUtcToLocalWithFormat(
            props.appointmentDetails?.dateFrom,
            'YYYY',
          )}{' '}
        </Text>
        <Text
          style={[
            styles.timeText,
            {transform: [{scaleX: I18nManager.isRTL ? -1 : 1}]},
          ]}>
          {' '}
          ?{' '}
        </Text>
      </View>
      {/* REMIND ME BEFORE */}
      <Text
        style={{
          fontFamily: Fonts.Gibson_Regular,
          color: '#FF5264',
          fontSize: 14,
          marginLeft: 26,
          marginTop: 30,
          textAlign: 'left',
        }}
        numberOfLines={1}>
        {t(Translations.REMINDER_ME_BEFORE)}
      </Text>

      {/* SLOTS */}
      <View style={{marginTop: 25, width: 256}}>
        <View style={{flexDirection: 'row', marginLeft: 26}}>
          {/* 24 Hours */}
          <TouchableOpacity
            style={{
              backgroundColor:
                selectedReminderTime === 24
                  ? Colors.PRIMARY_COLOR
                  : minuteDifference > 1440
                  ? Colors.WHITE_COLOR
                  : Colors.TEXT_GREY_COLOR_9B,
              height: 42,
              width: 100,
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: selectedReminderTime === 24 ? 0 : 1,
              borderColor: Colors.GREY_COLOR,
            }}
            onPress={() =>
              minuteDifference > 1440 ? setSelectedReminderTime(24) : null
            }>
            <Text
              style={{
                fontFamily: Fonts.Gibson_Regular,
                color:
                  selectedReminderTime === 24
                    ? Colors.WHITE_COLOR
                    : Colors.GREY_COLOR,
                fontSize: 14,
              }}
              numberOfLines={1}>
              24 {t(Translations.HOUR)}
            </Text>
          </TouchableOpacity>

          {/* 12 Hours */}
          <TouchableOpacity
            style={{
              backgroundColor:
                selectedReminderTime === 12
                  ? Colors.PRIMARY_COLOR
                  : minuteDifference > 720
                  ? Colors.WHITE_COLOR
                  : Colors.TEXT_GREY_COLOR_9B,
              height: 42,
              width: 100,
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: selectedReminderTime === 12 ? 0 : 1,
              borderColor: Colors.GREY_COLOR,
              marginLeft: 30,
            }}
            onPress={() =>
              minuteDifference > 720 ? setSelectedReminderTime(12) : null
            }>
            <Text
              style={{
                fontFamily: Fonts.Gibson_Regular,
                color:
                  selectedReminderTime === 12
                    ? Colors.WHITE_COLOR
                    : Colors.GREY_COLOR,
                fontSize: 14,
              }}
              numberOfLines={1}>
              12 {t(Translations.HOUR)}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{flexDirection: 'row', marginLeft: 26, marginTop: 16}}>
          {/* 04 Hours */}
          <TouchableOpacity
            style={{
              backgroundColor:
                selectedReminderTime === 4
                  ? Colors.PRIMARY_COLOR
                  : minuteDifference > 240
                  ? Colors.WHITE_COLOR
                  : Colors.TEXT_GREY_COLOR_9B,
              height: 42,
              width: 100,
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: selectedReminderTime === 4 ? 0 : 1,
              borderColor: Colors.GREY_COLOR,
            }}
            onPress={() =>
              minuteDifference > 240 ? setSelectedReminderTime(4) : null
            }>
            <Text
              style={{
                fontFamily: Fonts.Gibson_Regular,
                color:
                  selectedReminderTime === 4
                    ? Colors.WHITE_COLOR
                    : Colors.GREY_COLOR,
                fontSize: 14,
              }}
              numberOfLines={1}>
              04 {t(Translations.HOUR)}
            </Text>
          </TouchableOpacity>

          {/* 02 Hours */}
          <TouchableOpacity
            style={{
              backgroundColor:
                selectedReminderTime === 2
                  ? Colors.PRIMARY_COLOR
                  : minuteDifference > 120
                  ? Colors.WHITE_COLOR
                  : Colors.TEXT_GREY_COLOR_9B,
              height: 42,
              width: 100,
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: selectedReminderTime === 2 ? 0 : 1,
              borderColor: Colors.GREY_COLOR,
              marginLeft: 30,
            }}
            onPress={() =>
              minuteDifference > 120 ? setSelectedReminderTime(2) : null
            }>
            <Text
              style={{
                fontFamily: Fonts.Gibson_Regular,
                color:
                  selectedReminderTime === 2
                    ? Colors.WHITE_COLOR
                    : Colors.GREY_COLOR,
                fontSize: 14,
              }}
              numberOfLines={1}>
              02 {t(Translations.HOUR)}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{flexDirection: 'row', marginLeft: 26, marginTop: 16}}>
          {/* 30 Mins */}
          <TouchableOpacity
            style={{
              backgroundColor:
                selectedReminderTime === 30
                  ? Colors.PRIMARY_COLOR
                  : minuteDifference > 30
                  ? Colors.WHITE_COLOR
                  : Colors.TEXT_GREY_COLOR_9B,
              height: 42,
              width: 100,
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: selectedReminderTime === 30 ? 0 : 1,
              borderColor: Colors.GREY_COLOR,
            }}
            onPress={() =>
              minuteDifference > 30 ? setSelectedReminderTime(30) : null
            }>
            <Text
              style={{
                fontFamily: Fonts.Gibson_Regular,
                color:
                  selectedReminderTime === 30
                    ? Colors.WHITE_COLOR
                    : Colors.GREY_COLOR,
                fontSize: 14,
              }}
              numberOfLines={1}>
              30 {t(Translations.MINS)}
            </Text>
          </TouchableOpacity>

          {/* 10 Mins */}
          <TouchableOpacity
            style={{
              backgroundColor:
                selectedReminderTime === 10
                  ? Colors.PRIMARY_COLOR
                  : minuteDifference > 10
                  ? Colors.WHITE_COLOR
                  : Colors.TEXT_GREY_COLOR_9B,
              height: 42,
              width: 100,
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: selectedReminderTime === 10 ? 0 : 1,
              borderColor: Colors.GREY_COLOR,
              marginLeft: 30,
            }}
            onPress={() =>
              minuteDifference > 10 ? setSelectedReminderTime(10) : null
            }>
            <Text
              style={{
                fontFamily: Fonts.Gibson_Regular,
                color:
                  selectedReminderTime === 10
                    ? Colors.WHITE_COLOR
                    : Colors.GREY_COLOR,
                fontSize: 14,
              }}
              numberOfLines={1}>
              10 {t(Translations.MINS)}
            </Text>
          </TouchableOpacity>
        </View>
        {/* NO REMINDER */}
        <TouchableOpacity
          style={{
            backgroundColor:
              selectedReminderTime === 0
                ? Colors.PRIMARY_COLOR
                : Colors.WHITE_COLOR,
            height: 42,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: selectedReminderTime === 0 ? 0 : 1,
            borderColor: Colors.GREY_COLOR,
            marginLeft: 26,
            marginTop: 16,
          }}
          onPress={() =>
            reminderIfFound !== undefined ? confirmation() : null
          }>
          <Text
            style={{
              fontFamily: Fonts.Gibson_Regular,
              color:
                selectedReminderTime === 0
                  ? Colors.WHITE_COLOR
                  : Colors.GREY_COLOR,
              fontSize: 14,
            }}
            numberOfLines={1}>
            {t(Translations.NO_REMINDER)}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{flex: 1}} />

      {/* BOTTOM BAR */}
      <View
        style={{
          flexDirection: 'row',
          alignSelf: 'flex-end',
          marginBottom: 30,
          marginRight: 20,
        }}>
        <TouchableOpacity
          style={{
            width: 80,
            height: 45,
            borderRadius: 8,
            borderWidth: 2,
            borderColor: Colors.SECONDARY_COLOR,
            justifyContent: 'center',
          }}
          onPress={() => closePopupAction()}>
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
          onPress={() =>
            selectedReminderTime !== undefined
              ? setRemainderButtonAction()
              : setShowNoTimeSelectedAlert(true)
          }>
          <Text
            style={{
              fontFamily: Fonts.Gibson_Regular,
              fontSize: 16,
              color: Colors.WHITE_COLOR,
              alignSelf: 'center',
            }}>
            {t(Translations.SET_REMINDER)}
          </Text>
        </TouchableOpacity>
      </View>

      <AwesomeAlert
        show={showAlert}
        showProgress={false}
        title={t(Translations.ARE_YOU_SURE)}
        titleStyle={{
          color: Colors.BLACK_COLOR,
          fontFamily: Fonts.Gibson_Regular,
        }}
        message={t(
          Translations.IF_ANY_REMINDER_ADDED_FOR_THIS_APPOINTMENT_WILL_BE_REMOVED_DO_YOU_WANT_TO_CONTINUE,
        )}
        closeOnTouchOutside={false}
        closeOnHardwareBackPress={false}
        showCancelButton={true}
        showConfirmButton={true}
        animatedValue={0.8}
        cancelText={t(Translations.NO)}
        confirmText={t(Translations.YES)}
        confirmButtonColor={Colors.PRIMARY_COLOR}
        cancelButtonColor={Colors.SECONDARY_COLOR}
        onCancelPressed={() => {
          setShowAlert(false);
        }}
        onConfirmPressed={() => {
          setRemainderWithoutAlarmButtonAction();
        }}
        cancelButtonStyle={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 8,
        }}
        confirmButtonStyle={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 8,
        }}
        actionContainerStyle={{
          width: '100%',
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

      <AwesomeAlert
        show={showNoTimeSelectedAlert}
        showProgress={false}
        title={''}
        titleStyle={{
          color: Colors.BLACK_COLOR,
          fontFamily: Fonts.Gibson_Regular,
        }}
        message={t(Translations.PLEASE_SELECT_TIME)}
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
          setShowNoTimeSelectedAlert(false);
        }}
        onConfirmPressed={() => {
          setShowNoTimeSelectedAlert(false);
        }}
        cancelButtonStyle={{
          // flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 8,
        }}
        confirmButtonStyle={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 8,
          marginHorizontal:responsiveWidth(20),
        }}
        actionContainerStyle={{
          width: '80%',
          height: 50,
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
export default ReminderPopUp;
const styles = StyleSheet.create({
  timeText: {
    fontFamily: Fonts.Gibson_Regular,
    color: Colors.PRIMARY_TEXT_COLOR,
    fontSize: 18,
  },
});
