import React from 'react';
import {StyleSheet, View, Text, TouchableOpacity, Image} from 'react-native';
import {Colors, Fonts, Images, Strings, Translations} from '../../../constants';
import {UploadTypes} from '../../../helpers/enums/Enums';
import {t} from 'i18next';
export default function UploadOptions(props) {
  const isHideFile = props.isHideFileUpload === undefined ? false : true;

  //Button actions
  const closePopupAction = () => {
    //Closing bottom sheet
    if (props.RBSheet !== undefined) {
      if (props.RBSheet.current !== undefined) {
        props.RBSheet.current.close();
      }
    }
  };

  /**
    * Purpose: Upload options selection handler.
    * Created/Modified By: Jenson
    * Created/Modified Date: 27 May 2021
    * Steps: 1. Closing bottom sheet
             2. Callback to parent
    */
  const selectedOptionAction = uploadTypes => {
    //Closing bottom sheet
    props.RBSheet.current.close();
    const timer = setTimeout(() => {
      //Callback to parent. Delay is to bypass iOS modal presentation
      props.onUploadOptionSelection(uploadTypes);
    }, 500);
    return () => clearTimeout(timer);
  };

  return (
    <View style={styles.container}>
      {/* title */}
      <Text
        style={{
          fontFamily: Fonts.Gibson_SemiBold,
          fontSize: 14,
          marginLeft: 16,
          color: Colors.PRIMARY_TEXT_COLOR,
          textAlign: 'left',
        }}>
        {t(Translations.SELECT_AN_OPTION)}
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
      <View style={styles.itemsContainer}>
        {/* Items */}

        {!isHideFile && (
          <TouchableOpacity
            onPress={() => selectedOptionAction(UploadTypes.file)}>
            <View style={styles.items}>
              <Image
                style={{width: 24, height: 24, tintColor: Colors.PRIMARY_COLOR}}
                source={Images.FILES_ICON}
              />
              <Text style={styles.itemText}>{t(Translations.FILES)}</Text>
            </View>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={{marginTop: 16}}
          onPress={() => selectedOptionAction(UploadTypes.image)}>
          <View style={styles.items}>
            <Image
              style={{width: 24, height: 24, tintColor: Colors.PRIMARY_COLOR}}
              source={Images.GALLERY_ICON}
            />
            <Text style={styles.itemText}> {t(Translations.GALLERY)}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={{marginTop: 16}}
          onPress={() => selectedOptionAction(UploadTypes.camera)}>
          <View style={styles.items}>
            <Image
              style={{width: 24, height: 24, tintColor: Colors.PRIMARY_COLOR}}
              source={Images.CAMERA_ICON}
            />
            <Text style={styles.itemText}> {t(Translations.CAMERA)}</Text>
          </View>
        </TouchableOpacity>

        {/* cancel */}
        <TouchableOpacity
          style={{marginTop: 20}}
          onPress={() => selectedOptionAction(UploadTypes.none)}>
          <Text style={[styles.cancelText, {color: Colors.SECONDARY_COLOR}]}>
            {t(Translations.CANCEL)}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 30,
  },
  title: {
    fontFamily: Fonts.Gibson_SemiBold,
    fontSize: 14,
    textAlign: 'left',
    marginLeft: 20,
  },
  itemsContainer: {
    marginTop: 30,
    marginLeft: 20,
    marginRight: 20,
  },
  items: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  itemText: {
    fontFamily: Fonts.Gibson_Regular,
    fontSize: 14,
    marginLeft: 16,
    color: Colors.PRIMARY_TEXT_COLOR,
  },
  cancelText: {
    fontFamily: Fonts.Gibson_SemiBold,
    fontSize: 14,
    textAlign: 'center',
  },
});
