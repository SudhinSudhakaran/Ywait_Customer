import React, {useState, useEffect, useRef} from 'react';
import {
  FlatList,
  Text,
  View,
  Image,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';

import {Fonts, Strings, Colors, Images, Globals,Translations} from '../../../constants';
import {t} from 'i18next';
const DynamicSelectionPopupScreen = props => {
  //Declaration
  const titleText = Globals.SHARED_VALUES.COUNTRY_POPUP_TITLE;
  const [contentList, setContentList] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  //Button actions
  const closePopupAction = () => {
    //Closing bottom sheet
    if (props.RBSheet !== undefined) {
      if (props.RBSheet.current !== undefined) {
        props.RBSheet.current.close();
      }
    }
  };

  const didSelectItem = index => {
    const selectedItem = contentList[index];
    if (props.onItemSelection !== undefined && props.onItemSelection !== null) {
      props.onItemSelection(selectedItem);
    }
  };

  //Other functions
  const loadData = () => {
    if (Globals.SHARED_VALUES.DYNAMIC_SELECTION_ITEMS.length > 0) {
      setContentList(Globals.SHARED_VALUES.DYNAMIC_SELECTION_ITEMS);
    }
  };

  /**
        * Purpose: Render cell
        * Created/Modified By: Jenson
        * Created/Modified Date: 13 Jan 2022
        * Steps:
            1.Display the details to component
    */
  const CountryListItem = ({item, index}) => {
    return (
      <TouchableOpacity onPress={() => didSelectItem(index)}>
        <View
          style={{flex: 1, backgroundColor: Colors.WHITE_COLOR, height: 50}}>
          <Text
            style={{
              marginTop: 16,
              marginLeft: 16,
              marginRight: 16,
              color: Colors.BLACK_COLOR,
              fontFamily: Fonts.Gibson_Regular,
              fontSize: 14,
              textAlign:'left'
            }}
            numberOfLines={1}>{`${item}`}</Text>
          <View
            style={{
              height: 0.5,
              backgroundColor: Colors.GREY_COLOR,
              opacity: 0.5,
              marginTop: 8,
            }}
          />
        </View>
      </TouchableOpacity>
    );
  };

  /**
       * Purpose:Render function of flat list
       * Created/Modified By: Jenson John
       * Created/Modified Date: 27 Dec 2021
       * Steps:
           1.pass the data from local model to render child component
   */
  const renderItem = ({item, index}) => {
    return <CountryListItem item={item} index={index} />;
  };

  const listEmptyComponent = () => {
    return (
      <View style={{flex: 2, height: '100%'}}>
        <Text
          style={{
            marginTop: 20,
            marginLeft: 20,
            fontFamily: Fonts.Gibson_Regular,
            fontSize: 14,
            color: '#E0251B',
          }}>
        {t(Translations.NO_RESULT_FOUND)}
        </Text>
        <View style={{flex: 1}} />
      </View>
    );
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
          fontSize: 14,
          marginLeft: 16,
          color: Colors.PRIMARY_TEXT_COLOR,
          textAlign: 'left',
        }}>
        {titleText}
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

      <FlatList
        //ref={(ref) => flatListRef = ref}
        style={{marginTop: 16, marginBottom: 24}}
        //contentContainerStyle={{ paddingVertical: 10 }}
        showsHorizontalScrollIndicator={false}
        data={contentList}
        renderItem={renderItem}
        extraData={contentList}
        keyExtractor={(item, index) => index.toString()} //2
        ListEmptyComponent={listEmptyComponent}
        keyboardShouldPersistTaps={'handled'}
      />
    </View>
  );
};
export default DynamicSelectionPopupScreen;
