import React, {useState} from 'react';
import {Text, View, Image, TouchableOpacity} from 'react-native';
import {t} from 'i18next';
import {
  Fonts,
  Strings,
  Colors,
  Images,
  Globals,
  Translations,
} from '../../../constants';
import RADIO_ON_ICON from '../../../assets/images/radioButtonON.svg';

const ReportLatePopup = props => {
  const [selectedDelay, setSelectedDelay] = useState(0);

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
        props.reportLateActon(selectedDelay);
      }
    }
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
          color: Colors.PRIMARY_TEXT_COLOR,
          alignSelf: 'flex-start',
          marginTop: 20,
          marginLeft: 20,
        }}>
        {t(Translations.REPORT_LATE)}
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

      <View style={{marginTop: 30}}>
        <TouchableOpacity
          style={{marginLeft: 20, flexDirection: 'row'}}
          onPress={() => setSelectedDelay(15)}>
          {selectedDelay === 15 ? (
            <RADIO_ON_ICON
              width={16}
              height={16}
              fillRadioPrimary={Colors.PRIMARY_COLOR}
            />
          ) : (
            <Image
              style={{height: 16, width: 16}}
              source={Images.RADIO_BUTTON_OFF}
            />
          )}

          <Text
            style={{
              marginLeft: 16,
              color: Colors.PRIMARY_TEXT_COLOR,
              fontFamily: Fonts.Gibson_SemiBold,
              fontSize: 14,
            }}>
            15 {t(Translations.MINS)}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{marginLeft: 20, marginTop: 30, flexDirection: 'row'}}
          onPress={() => setSelectedDelay(30)}>
          {selectedDelay === 30 ? (
            <RADIO_ON_ICON
              width={16}
              height={16}
              fillRadioPrimary={Colors.PRIMARY_COLOR}
            />
          ) : (
            <Image
              style={{height: 16, width: 16}}
              source={Images.RADIO_BUTTON_OFF}
            />
          )}

          <Text
            style={{
              marginLeft: 16,
              color: Colors.PRIMARY_TEXT_COLOR,
              fontFamily: Fonts.Gibson_SemiBold,
              fontSize: 14,
            }}>
            30 {t(Translations.MINS)}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{marginLeft: 20, marginTop: 30, flexDirection: 'row'}}
          onPress={() => setSelectedDelay(45)}>
          {selectedDelay === 45 ? (
            <RADIO_ON_ICON
              width={16}
              height={16}
              fillRadioPrimary={Colors.PRIMARY_COLOR}
            />
          ) : (
            <Image
              style={{height: 16, width: 16}}
              source={Images.RADIO_BUTTON_OFF}
            />
          )}

          <Text
            style={{
              marginLeft: 16,
              color: Colors.PRIMARY_TEXT_COLOR,
              fontFamily: Fonts.Gibson_SemiBold,
              fontSize: 14,
            }}>
            45 {t(Translations.MINS)}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{marginLeft: 20, marginTop: 30, flexDirection: 'row'}}
          onPress={() => setSelectedDelay(60)}>
          {selectedDelay === 60 ? (
            <RADIO_ON_ICON
              width={16}
              height={16}
              fillRadioPrimary={Colors.PRIMARY_COLOR}
            />
          ) : (
            <Image
              style={{height: 16, width: 16}}
              source={Images.RADIO_BUTTON_OFF}
            />
          )}

          <Text
            style={{
              marginLeft: 16,
              color: Colors.PRIMARY_TEXT_COLOR,
              fontFamily: Fonts.Gibson_SemiBold,
              fontSize: 14,
            }}>
            1 {t(Translations.HOUR)}
          </Text>
        </TouchableOpacity>
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignSelf: 'center',
          marginTop: 30,
          marginBottom: 30,
        }}>
        <TouchableOpacity
          style={{
            width: 100,
            height: 45,
            borderRadius: 8,
            borderWidth: 2,
            borderColor: Colors.SECONDARY_COLOR,
            justifyContent: 'center',
            backgroundColor: Colors.SECONDARY_COLOR,
          }}
          onPress={() => okButtonAction()}>
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
export default ReportLatePopup;
