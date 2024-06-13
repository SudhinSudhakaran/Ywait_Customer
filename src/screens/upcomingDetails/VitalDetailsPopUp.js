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

import {Fonts, Colors, Images, Strings, Translations} from '../../constants';
import {Globals} from '../../constants';
import {useFocusEffect} from '@react-navigation/core';
import {useNavigation} from '@react-navigation/core';
import {t} from 'i18next';
import { ScrollView } from 'react-native-gesture-handler';
const VitalsDetailsPopup = props => {
  const navigation = useNavigation();
  const [newVitalsArray, setNewVitalArray] = useState([]);
  useFocusEffect(
    React.useCallback(() => {
      // console.log('vitalsDetails', props.vitals);
      console.log('Globals vital array', Globals.BUSINESS_DETAILS.vitals);
      configureVitalsList();
      return () => {};
    }, []),
  );
  const _vitalDetails = Globals.BUSINESS_DETAILS.vitals;

  const configureVitalsList = () => {
    var _newVitalsArray = [];

    _vitalDetails.map((subItem, subIndex) => {
      props.vitals.map((subMappingItem, subMappingIndex) => {
        if (subItem.key === subMappingItem.key) {
          _vitalDetails[subIndex].value = subMappingItem.value;
        }
      });
    });

    // _newVitalsArray.push(subItem);
    //return x

    setNewVitalArray(_vitalDetails);
    console.log('_vitalDetails', _vitalDetails);
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

  const onSelectionAction = option => {
    //Closing bottom sheet
    if (props.refRBSheet !== undefined) {
      if (props.refRBSheet.current !== undefined) {
        props.refRBSheet.current.close();
      }
    }
    const timer = setTimeout(() => {
      //Callback to parent. Delay is to bypass iOS modal presentation
      //   props.handleOptionSelection(option);
    }, 500);
    return () => clearTimeout(timer);
  };

  const renderItem = ({item}) => {
    return item.status === 'ACTIVE' ? <VitalsDataCell item={item} /> : null;
  };
  const VitalsDataCell = ({item}) => {
    // console.log('item', item);
    var statusText = '';
    var statusTextColor = Colors.GREEN_COLOR;
    if (item?.type === 'Integer') {
      if (item.value < item.minimumCharacters) {
        statusText = t(Translations.LOW);
        statusTextColor = Colors.ERROR_RED_COLOR;
      } else if (item.value > item.minimumCharacters) {
        statusText = t(Translations.HIGH);
        statusTextColor = Colors.ERROR_RED_COLOR;
      } else {
        statusText = t(Translations.NORMAL);
        statusTextColor = Colors.GREEN_COLOR;
      }
    }

    return (
      <View
        style={{
          flexDirection: 'row',
          marginVertical: 10,
          backgroundColor: Colors.WHITE_COLOR,
        }}>
        <View style={{flex: 1}}>
          <Text
            style={{
              fontFamily: Fonts.Gibson_Regular,
              color: Colors.INACTIVE_BOTTOM_BAR_COLOR,
              fontSize: 14,
              marginTop: 5,
              textAlign:'left',
            }}>
            {item.label}
          </Text>
        </View>
        <View style={{flex: 1, flexDirection: 'row'}}>
          <Text
            style={{
              fontFamily: Fonts.Gibson_Regular,
              color: Colors.SECONDARY_COLOR,
              fontSize: 14,
              marginTop: 5,
              textAlign:'left',
            }}>
            {item.value}
          </Text>
          <Text
            style={{
              fontFamily: Fonts.Gibson_Regular,
              color: Colors.SECONDARY_COLOR,
              fontSize: 14,
              marginTop: 5,
              marginLeft: 4,
              textAlign:'left',
            }}>
            {item.unit} {item.type === 'Integer' ? '-' : null}
          </Text>
          <Text
            style={{
              fontFamily: Fonts.Gibson_Regular,
              color: statusTextColor,
              fontSize: 14,
              marginTop: 5,
              marginLeft: 5,
               textAlign:'left',
            }}>
            {statusText}
          </Text>
        </View>
      </View>
    );
  };

  //Final return
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.WHITE_COLOR,
      }}>
      {/* title */}
      <Text
        style={{
          fontFamily: Fonts.Gibson_SemiBold,
          fontSize: 16,
          color: Colors.PRIMARY_TEXT_COLOR,
          marginTop: 20,
          marginLeft: 15,
          textAlign: 'left',
        }}>
        {t(Translations.VITALS_DETAILS)}
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
          backgroundColor: Colors.TAB_VIEW_LABEL_COLOR,
          marginTop: 15,
        }}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{marginHorizontal: 20}}>
        <FlatList
          contentContainerStyle={{marginTop: 20, paddingBottom: 20}}
          data={newVitalsArray}
          keyboardShouldPersistTaps="handled"
          scrollEnabled={false}
          renderItem={renderItem}
          keyExtractor={(item, index) =>
            item._id ? item._id.toString() : index.toString()
          }
          showsVerticalScrollIndicator={false}
        />
      </ScrollView>
    </View>
  );
};
export default VitalsDetailsPopup;
