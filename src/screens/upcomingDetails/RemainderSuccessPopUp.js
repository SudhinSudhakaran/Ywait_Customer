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
  I18nManager,
} from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import InputScrollView from 'react-native-input-scroll-view';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/core';
import {Fonts, Strings, Colors, Images, Globals,Translations} from '../../constants';
import APIConnections from '../../helpers/apiManager/APIConnections';
import DataManager from '../../helpers/apiManager/DataManager';
import Utilities from '../../helpers/utils/Utilities';
import LoadingIndicator from '../shared/loadingIndicator/LoadingIndicator';
import {GetImage} from '../shared/getImage/GetImage';
import DisplayUtils from '../../helpers/utils/DisplayUtils';
import ReminderService from '../shared/reminderService/ReminderService';
import moment from 'moment';
 import {t} from 'i18next';
const ReminderSuccessPopUp = props => {
  //Declaration
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedReminderTime, setSelectedReminderTime] = useState(); //24,12,4,2,30,10
  const [timesNow, setTimesNow] = useState('');

  useEffect(() => {
    loadTimesNow();
  }, []);
  const loadTimesNow = () => {
    var date = 0;
    if (props.remindBefore === 10 || props.remindBefore === 30) {
      date = moment(props.dateFrom).subtract(props.remindBefore, 'minutes');
    } else if (
      props.remindBefore === 2 ||
      props.remindBefore === 4 ||
      props.remindBefore === 12 ||
      props.remindBefore === 24
    ) {
      date = moment(props.dateFrom).subtract(props.remindBefore, 'hours');
    }
    console.log('date:', date);
    console.log('moment(date):', moment(date));
    setTimesNow(moment(date).fromNow());
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
  const doneButtonAction = () => {
    props.okAction();
    closePopupAction();
  };

  //Final return
  return (
    <View
      style={{
        flex: 1,
      }}>
      <LoadingIndicator visible={isLoading} />
      {/* title */}
      <Text
        style={{
          color: Colors.PRIMARY_TEXT_COLOR,
          marginTop: 25,
          fontFamily: Fonts.Gibson_SemiBold,
          fontSize: 16,
          marginLeft: 26,
        }}>
       {t(Translations.REMINDER_SET)}
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

      {/* YOU WILL BE REMINDED */}
      <Text
        Text
        style={{
          fontFamily: Fonts.Gibson_Regular,
          fontSize: 14,
          color: Colors.PRIMARY_TEXT_COLOR,
          marginTop: 35,
          marginLeft: 26,
        }}
        numberOfLines={1}>
        {t(Translations.YOU_WILL_BE_REMINDED_WITH)}{timesNow}
      </Text>

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
            width: 134,
            height: 45,
            borderRadius: 8,
            borderWidth: 2,
            borderColor: Colors.SECONDARY_COLOR,
            backgroundColor: Colors.SECONDARY_COLOR,
            justifyContent: 'center',
            marginLeft: 15,
          }}
          onPress={() => doneButtonAction()}>
          <Text
            style={{
              fontFamily: Fonts.Gibson_Regular,
              fontSize: 16,
              color: Colors.WHITE_COLOR,
              alignSelf: 'center',
            }}>
            {t(Translations.OK)}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
export default ReminderSuccessPopUp;
