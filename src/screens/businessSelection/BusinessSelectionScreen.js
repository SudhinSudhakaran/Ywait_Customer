import React, {useState, useEffect, useRef} from 'react';
import {
  FlatList,
  StatusBar,
  Text,
  View,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Platform,I18nManager
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/core';
import ContentLoader, {Rect, Circle, Path} from 'react-content-loader/native';
import KeyboardManager from 'react-native-keyboard-manager';

import {Colors, Fonts, Globals, Images, Translations} from '../../constants';
import Utilities from '../../helpers/utils/Utilities';
import DataManager from '../../helpers/apiManager/DataManager';
import RBSheet from 'react-native-raw-bottom-sheet';
import BaseURLUpdatePopup from '../shared/baseURLChangePopup/BaseURLChangePopupScreen';
import LoadingIndicator from '../shared/loadingIndicator/LoadingIndicator';
import StorageManager from '../../helpers/storageManager/StorageManager';
import { t } from 'i18next';

const BusinessSelectionScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const refRBSheet = useRef();
  const [isLoading, setIsLoading] = useState(true);
  const [isSpinnerLoading, setIsSpinnerLoading] = useState(false);
  const [businessList, setBusinessList] = useState([]);
  const [isPaginating, setIsPaginating] = useState(false);
  const [isPageEnded, setIsPageEnded] = useState(false);
  const [pageNo, setPageNo] = useState(1);

  useEffect(() => {
    setIsLoading(true);
    setPageNo(1);
    setIsPageEnded(false);
    getBusinessList(true, 1);
  }, []);

  // DUMMY DATA
  const DUMMY_DATA = [
    {
      id: '0',
      name: 'Demo1',
      type: 'single-consultant',
    },
    {
      id: '1',
      name: 'Demo2',
      type: 'single-consultant',
    },
    {
      id: '2',
      name: 'Demo3',
      type: 'single-consultant',
    },
    {
      id: '3',
      name: 'Demo4',
      type: 'single-consultant',
    },
    {
      id: '4',
      name: 'Demo1',
      type: 'single-consultant',
    },
    {
      id: '5',
      name: 'Demo2',
      type: 'single-consultant',
    },
    {
      id: '6',
      name: 'Demo3',
      type: 'single-consultant',
    },
    {
      id: '7',
      name: 'Demo4',
      type: 'single-consultant',
    },
  ];

  //Shimmer loader for the flatList
  const ListLoader = props => (
    <ContentLoader    transform={[{scaleX: I18nManager.isRTL ? -1 : 1}]}
      speed={1.5}
      width={'100%'}
      height={60}
      //viewBox="0 0 320 "
      backgroundColor="#dadada"
      foregroundColor="#eee"
      animate={true}
      {...props}>
      <Rect x="25" y="11" rx="5" ry="5" width="220" height="13" />
      <Rect x="25" y="35" rx="5" ry="5" width="339" height="8" />
      <Rect x="0" y="55" rx="5" ry="5" width="571" height="1" />
    </ContentLoader>
  );

  /**
          * Purpose: List empty component
          * Created/Modified By: Jenson
          * Created/Modified Date: 27 Dec 2021
          * Steps:
              1.Return the component when list is empty
      */
  const ListEmptyComponent = () => {
    return (
      <View
        style={{
          flex: 1,
          alignSelf: 'center',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 50,
        }}>
        <Image source={Images.EMPTY_CALENDAR_IMAGE} />
        <Text
          style={{
            fontFamily: Fonts.Gibson_SemiBold,
            fontSize: 18,
            color: Colors.PRIMARY_COLOR,
            marginTop: 20,
          }}>
         {t(Translations.NO_BUSINESS_IS_FOUND)}
        </Text>
      </View>
    );
  };

  /**
   * Purpose: Pagination loader component
   * Created/Modified By: Jenson
   * Created/Modified Date: 27 Dec 2021
   * Steps:
   */
  const paginationComponent = () => {
    return (
      <View
        style={{
          width: '100%',
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <ActivityIndicator color={Colors.PRIMARY_COLOR} size="small" />
      </View>
    );
  };

  const didSelectItem = index => {
    if (businessList?.length > 0) {
      let selectedItem = businessList[index];
      //Utilities.showToast(`${selectedItem?.name || 'N/A'}`, 'message', 'error', 'bottom');
      getBusinessDetails(selectedItem?._id || '');
    }
  };

  /**
        * Purpose: Render cell
        * Created/Modified By: Jenson
        * Created/Modified Date: 27 Dec 2021
        * Steps:
            1.Display the details to component
    */
  const BusinessListItem = ({item, index}) => {
    return isLoading ? (
      <ListLoader />
    ) : (
      <TouchableOpacity onPress={() => didSelectItem(index)}>
        <View style={{flex: 1, backgroundColor: Colors.WHITE_COLOR}}>
          <Text
            style={{
              marginTop: 16,
              marginLeft: 16,
              marginRight: 16,
              color: Colors.BLACK_COLOR,
              fontFamily: Fonts.Gibson_Regular,
              fontSize: 14,
            }}
            numberOfLines={1}>
            {item?.name || 'N/A'}
          </Text>
          <Text
            style={{
              marginTop: 8,
              marginLeft: 16,
              marginRight: 16,
              marginBottom: 8,
              color: Colors.GREY_COLOR,
              fontFamily: Fonts.Gibson_Regular,
              fontSize: 12,
            }}
            numberOfLines={1}>
            {item?.businessType || 'N/A'}
          </Text>
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
    return <BusinessListItem item={item} index={index} />;
  };

  /**
   * Purpose: list on end reached component
   * Created/Modified By: Jenson
   * Created/Modified Date: 27 Dec 2021
   * Steps:
   */
  const listOnEndReach = () => {
    console.log(
      `Detected on end reach isPaginating: ${isPaginating}, isPageEnded: ${isPageEnded}`,
    );

    if (!isPageEnded && !isLoading && !isPaginating) {
      let newPageNo = pageNo + 1;
      console.log('PageNo:', newPageNo);
      if (newPageNo !== 1) {
        setIsPaginating(true);
      }
      console.log('setIndicator:', isPaginating);
      setPageNo(newPageNo);
      getBusinessList(false, newPageNo);
    }
  };

  //API CALLS
  /**
            *
            * Purpose: Business listing
            * Created/Modified By: Jenson
            * Created/Modified Date: 27 Dec 2021
            * Steps:
                1.fetch business list from API and append to state variable
    */
  const getBusinessList = (isLoaderRequired, pageNumber) => {
    if (isLoaderRequired) {
      setIsLoading(true);
    }
    DataManager.getBusinessList(pageNumber).then(
      ([isSuccess, message, data]) => {
        if (isSuccess === true) {
          if (data !== undefined && data !== null) {
            if (pageNumber !== 1) {
              if (data.length === 0) {
                console.log('END FOUND');
                setIsPageEnded(true);
              } else {
                //Appending data
                //setSearchList(...searchList, ...data.data.objects)
                setBusinessList(customerList => {
                  return [...customerList, ...data];
                });
              }
            } else {
              if (data.length > 0) {
                //Animate intro cells
              }
              setBusinessList(data);
            }
          } else {
            setIsLoading(false);
          }
        } else {
          Utilities.showToast(t(Translations.FAILED), message, 'error', 'bottom');
          setIsLoading(false);
        }
        setIsLoading(false);
        setIsPaginating(false);
      },
    );
  };

  /**
        *
        * Purpose: Get selected business details
        * Created/Modified By: Jenson
        * Created/Modified Date: 28 Dec 2021
        * Steps:
            1.fetch business details from API and append to state variable
*/
  const getBusinessDetails = businessId => {
    setIsSpinnerLoading(true);
    DataManager.getBusinessDetails(businessId).then(
      ([isSuccess, message, data]) => {
        if (isSuccess === true) {
          setIsSpinnerLoading(false);
          if (data !== undefined && data !== null) {
            if (data?.objects !== undefined && data?.objects !== null) {
              //Save business info to local storage
              StorageManager.saveBusinessDetails(data?.objects);
              Globals.BUSINESS_DETAILS = data?.objects;
              Globals.BUSINESS_ID = data?.objects?._id;

              //Update themes
              if (
                data?.objects?.primaryColorCustomer !== undefined &&
                data.objects.primaryColorCustomer !== null &&
                data.objects.primaryColorCustomer !== ''
              ) {
                Colors.PRIMARY_COLOR = data.objects.primaryColorCustomer;
              } else {
                Colors.PRIMARY_COLOR = '#FF5264';
              }
              if (
                data?.objects?.secondaryColorCustomer !== undefined &&
                data.objects.secondaryColorCustomer !== null &&
                data.objects.secondaryColorCustomer !== ''
              ) {
                Colors.SECONDARY_COLOR = data.objects.secondaryColorCustomer;
              } else {
                Colors.SECONDARY_COLOR = '#5F73FC';
              }
              //Navigate to next screen
              checkAuthType(data?.objects);
            }
          } else {
            Utilities.showToast(t(Translations.FAILED), message, 'error', 'bottom');
          }
        } else {
          Utilities.showToast(t(Translations.FAILED), message, 'error', 'bottom');
        }
      },
    );
  };

  /**
            *
            * Purpose: Change base url action
            * Created/Modified By: Jenson
            * Created/Modified Date: 28 Dec 2021
            * Steps:
                1.Check authentication type and navigate.
    */
  const checkAuthType = businessDetails => {
    configureKeyboardManager();
    //Navigate to dashboard
    navigation.reset({
      index: 0,
      routes: [{name: 'DashboardScreen'}],
    });

    /*
        if (businessDetails !== undefined && businessDetails !== null) {
            if (businessDetails.authenticationType?.length > 0) {
                if (businessDetails.authenticationType?.includes('email')) {
                    //Navigate to Email login page
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'EmailLoginScreen' }],
                    });
                } else {
                    //Navigate to Phone number login page
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'PhoneLoginScreen' }],
                    });
                }
            }
        }
        */
  };

  const configureKeyboardManager = () => {
    if (Platform.OS === 'ios') {
      KeyboardManager.setEnable(true);
      KeyboardManager.setToolbarTintColor(Colors.PRIMARY_COLOR);
      KeyboardManager.setToolbarPreviousNextButtonEnable(true);
      KeyboardManager.setShouldShowToolbarPlaceholder(true);
    }
  };

  /**
            *
            * Purpose: Change base url action
            * Created/Modified By: Jenson
            * Created/Modified Date: 27 Dec 2021
            * Steps:
                1.Show base url popup
    */
  const baseURLPopupAction = () => {
    refRBSheet.current.open();
  };

  const handleUBaseUrlSelection = () => {
    refRBSheet.current.close();
    //Reset Page and perform api call
    setIsLoading(true);
    setPageNo(1);
    setIsPageEnded(false);
    getBusinessList(true, 1);
  };

  const BaseUrlSelectionPopup = () => {
    return (
      <RBSheet
        ref={refRBSheet}
        closeOnDragDown={true}
        closeOnPressMask={false}
        customStyles={{
          wrapper: {
            backgroundColor: '#00000080',
            paddingTop: insets.top,
            paddingLeft: insets.left,
            paddingRight: insets.right,
            paddingBottom: insets.bottom,
          },
          container: {
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
          },
          draggableIcon: {
            backgroundColor: '#000',
          },
        }}
        height={400}>
        <BaseURLUpdatePopup
          RBSheet={refRBSheet}
          onBaseUrlSelection={handleUBaseUrlSelection}
        />
      </RBSheet>
    );
  };

  return (
    <>
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.BACKGROUND_COLOR,
          paddingTop: insets.top,
          paddingLeft: insets.left,
          paddingRight: insets.right,
          paddingBottom: insets.bottom,
        }}>
        <BaseUrlSelectionPopup />
        <LoadingIndicator visible={isSpinnerLoading} />
        <StatusBar
          backgroundColor={Colors.BACKGROUND_COLOR}
          barStyle="dark-content"
        />
        <TouchableOpacity
          onPress={() => baseURLPopupAction()}
          style={{marginRight: 16, alignSelf: 'flex-end'}}>
          <Image style={{width: 40, height: 40}} source={Images.WEB_IMAGE} />
        </TouchableOpacity>
        <Text
          style={{
            marginTop: 16,
            color: Colors.BLACK_COLOR,
            fontFamily: Fonts.Gibson_Regular,
            fontSize: 20,
            alignSelf: 'center',
          }}>
          {t(Translations.CHOOSE_A_BUSINESS)}
        </Text>

        <FlatList
          style={{marginTop: 16}}
          data={isLoading ? DUMMY_DATA : businessList}
          keyboardShouldPersistTaps="handled"
          renderItem={renderItem}
          keyExtractor={(item, index) =>
            item._id ? item._id.toString() : index.toString()
          }
          onEndReachedThreshold={0.2}
          onEndReached={() => {
            listOnEndReach();
          }}
          ListEmptyComponent={isLoading ? DUMMY_DATA : ListEmptyComponent}
          ListFooterComponent={isPaginating ? paginationComponent : null}
        />
      </View>
    </>
  );
};
export default BusinessSelectionScreen;
