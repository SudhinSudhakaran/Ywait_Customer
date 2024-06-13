import React, {useState, useRef, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Keyboard,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  I18nManager,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import {useHeaderHeight} from '@react-navigation/elements';
import {useNavigation} from '@react-navigation/core';
import APIConnections from '../../../helpers/apiManager/APIConnections';
import DataManager from '../../../helpers/apiManager/DataManager';
import ContentLoader, {Rect, Circle, Path} from 'react-content-loader/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  Colors,
  Fonts,
  Globals,
  Images,
  Strings,
  Translations,
} from '../../../constants';
import Utilities from '../../../helpers/utils/Utilities';
import DisplayUtils from '../../../helpers/utils/DisplayUtils';
import {GetImage} from '../../shared/getImage/GetImage';
import NO_DEPARTMENT_ICON from '../../../assets/images/departmentEmptyIcon.svg';
import LottieView from 'lottie-react-native';
import RADIO_ON_ICON from '../../../assets/images/radioButtonON.svg';
import {GetLottieImage} from '../../shared/getLottieImage/GetLottieImage';
import {t} from 'i18next';
const DepartmentSelectionPopUp = props => {
  const navigation = useNavigation();

  const [isLoading, setIsLoading] = useState(false);
  const insets = useSafeAreaInsets();
  const [departmentList, setDepartmentList] = useState([]);
  const [loadImage, setLoadImage] = useState(true);
  const [isPaginating, setIsPaginating] = useState(false);
  const [isPageEnded, setIsPageEnded] = useState(false);
  const [search, setSearch] = useState('');
  const [pageNo, setPageNo] = useState(1);

  const searchInputRef = useRef();

  useEffect(() => {
    setIsLoading(true);
    setPageNo(1);
    setIsPageEnded(false);
    performGetDepartmentList(true, 1, '');
  }, []);

  const dummyConsultantList = [
    {
      id: '1',
      firstName: 'Mr. Paul',
      lastName: 'Bill',
      role_id: {
        label: 'barber specialist',
      },
    },
    {
      id: '2',
      firstName: 'Mr. Paul',
      lastName: 'Bill',
      role_id: {
        label: 'barber specialist',
      },
    },
    {
      id: '3',
      firstName: 'Mr. Paul',
      lastName: 'Bill',
      role_id: {
        label: 'barber specialist',
      },
    },
    {
      id: '4',
      firstName: 'Mr. Paul',
      lastName: 'Bill',
      role_id: {
        label: 'barber specialist',
      },
    },
    {
      id: '5',
      firstName: 'Mr. Paul',
      lastName: 'Bill',
      role_id: {
        label: 'barber specialist',
      },
    },
    {
      id: '6',
      firstName: 'Mr. Paul',
      lastName: 'Bill',
      role_id: {
        label: 'barber specialist',
      },
    },
    {
      id: '7',
      firstName: 'Mr. Paul',
      lastName: 'Bill',
      consultantType: 'barber specialist',
    },
    {
      id: '8',
      firstName: 'Mr. Paul',
      lastName: 'Bill',
      consultantType: 'barber specialist',
    },
    {
      id: '9',
      firstName: 'Mr. Paul',
      lastName: 'Bill',
      consultantType: 'barber specialist',
    },
    {
      id: '10',
      firstName: 'Mr. Paul',
      lastName: 'Bill',
      consultantType: 'barber specialist',
    },
    {
      id: '11',
      firstName: 'Mr. Paul',
      lastName: 'Bill',
      consultantType: 'barber specialist',
    },
    {
      id: '12',
      firstName: 'Mr. Paul',
      lastName: 'Bill',
      consultantType: 'barber specialist',
    },
  ];

  //Shimmer loader for the flatList
  const ListLoader = props => (
    <ContentLoader
      transform={[{scaleX: I18nManager.isRTL ? -1 : 1}]}
      speed={1.5}
      width={'100%'}
      height={50}
      //viewBox="0 0 320 "
      backgroundColor="#dadada"
      foregroundColor="#eee"
      animate={true}
      {...props}>
      <Rect x="10" y="27" rx="7" ry="7" width="14" height="14" />
      <Rect x="44" y="20" rx="0" ry="0" width="25" height="25" />
      <Rect x="80" y="27" rx="4" ry="4" width="50%" height="10" />
    </ContentLoader>
  );

  /**
            * Purpose: List empty component
            * Created/Modified By: Sudhin Sudhakaran
            * Created/Modified Date: 11 Oct 2021
            * Steps:
                1.Return the component when list is empty
        */
  const ConsultantEmptyComponent = () => {
    return (
      <View
        style={{
          //   width: Display.setWidth(60),
          //   height: Display.setHeight(30),
          alignSelf: 'center',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 80,
        }}>
        <LottieView
          style={{width: DisplayUtils.setWidth(50)}}
          source={Images.LOTTIE_SEARCH_NO_RESULT}
          autoPlay
          loop
          colorFilters={[
            {
              keypath: 'main.magnifier.矩形.矩形.Fill 1',
              color: Colors.SECONDARY_COLOR,
            },
          ]}
        />

        <Text
          style={{
            alignSelf: 'center',
            color: Colors.ERROR_RED_COLOR,
            fontFamily: Fonts.Gibson_SemiBold,
            fontSize: 18,
            marginTop: 20,
          }}>
          {t(Translations.NO_RESULT_FOUND)}
        </Text>
      </View>
    );
  };

  //API CALLS
  /**
              *
              * Purpose:UpcomingBookingList listing
              * Created/Modified By: Sudhin
              * Created/Modified Date: 20 jan 2022
              * Steps:
                  1.fetch UpcomingBookingLists list from API and append to state variable
      */

  const performGetDepartmentList = (
    isLoaderRequired,
    pageNumber,
    searchValue,
  ) => {
    if (isLoaderRequired) {
      setIsLoading(true);
    }
    DataManager.getDepartmentList(pageNumber, searchValue).then(
      ([isSuccess, message, data]) => {
        if (isSuccess === true) {
          if (data !== undefined && data !== null) {
            if (pageNumber !== 1) {
              if (data.objects.length === 0) {
                console.log('END FOUND');
                setIsPageEnded(true);
              } else {
                //Appending data
                //setSearchList(...searchList, ...data.data.objects)
                setDepartmentList(departmentList => {
                  return [...departmentList, ...data.objects];
                });
              }
            } else {
              if (data.objects.length === 0) {
                console.log('END FOUND');
                setIsPageEnded(true);
                setDepartmentList(data.objects);
              } else {
                if (searchValue === '') {
                  let departmentArray = [];
                  let departmentObject = {};
                  departmentObject._id = '-1';
                  departmentObject.department_name = 'All';

                  departmentArray.push(departmentObject);
                  data.objects.map((item, itemIndex) => {
                    departmentArray.push(item);
                  });
                  setDepartmentList(departmentArray);
                } else {
                  setDepartmentList(data.objects);
                }
              }
            }
          } else {
            setIsLoading(false);
          }
        } else {
          Utilities.showToast(
            t(Translations.FAILED),
            message,
            'error',
            'bottom',
          );
          setIsLoading(false);
        }
        setIsLoading(false);
        setIsPaginating(false);
      },
    );
  };

  const consultantCellPressAction = item => {
    console.log(`selected item: ${item.toString()}`);
    props.onDepartmentSelection(item);
    props.refRBSheet.current.close();
    Globals.SHARED_VALUES.IS_FROM_DASHBOARD_DEPARTMENT_VIEW_ALL = false;
  };

  const popupCloseButtonAction = () => {
    if (Globals.SHARED_VALUES.IS_FROM_DASHBOARD_DEPARTMENT_VIEW_ALL === true) {
      Utilities.resetAllSharedBookingRelatedInfo();
      props.refRBSheet.current.close();
      //Navigate to dashboard
      // navigation.navigate('DashboardScreen');
      props?.getAllSpecialist?.();
    } else {
      props.refRBSheet.current.close();
    }
  };
  /**
                       * Purpose:Render function of flat list
                       * Created/Modified By: Sudhin Sudhakaran
                       * Created/Modified Date: 8 Oct 2021
                       * Steps:
                           1.pass the data from api to customer details child component
                   */
  const renderItem = ({item, index}) => {
    return <ConsultantDataCell item={item} index={index} />;
  };

  const ConsultantDataCell = ({item}) => {
    // console.log('item:', item)
    return (
      <TouchableOpacity
        onPress={() => consultantCellPressAction(item)}
        style={{
          flexDirection: 'row',
          backgroundColor: Colors.WHITE_COLOR,
          height: 50,
          marginLeft: 15,
          alignItems: 'center',
        }}>
        {isLoading ? (
          <ListLoader />
        ) : (
          <>
            {props.selectedDepartmentId === item._id ? (
              <RADIO_ON_ICON
                width={16}
                height={16}
                fillRadioPrimary={Colors.PRIMARY_COLOR}
              />
            ) : props.selectedDepartmentId === '' && item._id === '-1' ? (
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

            {item.lottieImageName !== '' &&
            item.lottieImageName !== undefined ? (
              <View style={{height: 24, width: 24, marginLeft: 29}}>
                <GetLottieImage
                  style={{
                    height: 24,
                    width: 24,
                  }}
                  url={item.lottieImageName}
                />
              </View>
            ) : item.departmentIcon !== '' &&
              item.departmentIcon !== undefined ? (
              <FastImage
                style={{
                  height: 24,
                  width: 24,
                  marginLeft: 29,
                }}
                source={{
                  uri: item.departmentIcon,
                  priority: FastImage.priority.normal,
                }}
                resizeMode={FastImage.resizeMode.contain}
              />
            ) : (
              <View style={{marginLeft: 29}}>
                <NO_DEPARTMENT_ICON
                  width={24}
                  height={24}
                  fill={Colors.WHITE_COLOR}
                  fillNoDepartmentSecondary={Colors.SECONDARY_COLOR}
                  fillNoDepartmentPrimary={Colors.PRIMARY_COLOR}
                />
              </View>
            )}

            <View style={{width: DisplayUtils.setWidth(70)}}>
              <View style={{marginLeft: 16}}>
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: Fonts.Gibson_Regular,
                    color: Colors.PRIMARY_TEXT_COLOR,
                    textAlign: 'left',
                  }}
                  numberOfLines={1}>
                  {item?.department_name || ''}
                </Text>
              </View>
            </View>
          </>
        )}
      </TouchableOpacity>
    );
  };
  /**
   * Purpose: list on end reached component
   * Created/Modified By: Vijn
   * Created/Modified Date: 10 Aug 2021
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
      performGetDepartmentList(false, newPageNo, search);
    }
  };
  /**
   * Purpose: pagination loader component
   * Created/Modified By: Vijin
   * Created/Modified Date: 10 Nov 2021
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
        <ActivityIndicator
          style={{marginBottom: 20}}
          color={Colors.PRIMARY_COLOR}
          size="small"
        />
      </View>
    );
  };
  const searchButtonAction = () => {
    Keyboard.dismiss();
    if (!isLoading) {
      setIsLoading(true);
      setPageNo(1);
      setIsPageEnded(false);
      performGetDepartmentList(true, 1, search);
    }
  };
  const closeButtonAction = () => {
    Keyboard.dismiss();
    setSearch('');
    if (!isLoading) {
      setIsLoading(true);
      setPageNo(1);
      setIsPageEnded(false);
      performGetDepartmentList(true, 1, '');
    }
  };
  // paddingTop: insets.top,
  // paddingLeft: insets.left,
  // paddingRight: insets.right,
  // paddingBottom: insets.bottom,
  return (
    <KeyboardAvoidingView
      keyboardVerticalOffset={useHeaderHeight()}
      behavior={Platform.OS === 'ios' ? 'padding' : null}
      style={{flex: 1, backgroundColor: 'white'}}>
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.WHITE_COLOR,
        }}>
        <View style={{height: 70, paddingTop: 30, flexDirection: 'row'}}>
          <Text
            style={{
              marginLeft: 15,
              fontFamily: Fonts.Gibson_SemiBold,
              fontSize: 18,
              color: Colors.DARK_BROWN_COLOR,
            }}>
            {t(Translations.DEPARTMENT)}
          </Text>

          <TouchableOpacity
            onPress={() => popupCloseButtonAction()}
            style={{
              position: 'absolute',
              top: 20,
              right: 20,
              width: 30,
              height: 30,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Image
              source={Images.CLOSE_ICON}
              style={{tintColor: Colors.TAB_VIEW_LABEL_COLOR}}
            />
          </TouchableOpacity>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-end',
            marginBottom: 16,
          }}>
          <View
            style={{
              marginLeft: 15,
              marginRight: 10,
              width: DisplayUtils.setWidth(90),
              height: 50,
              borderRadius: 4,
              justifyContent: 'center',
              //Shadow props
              borderWidth: 1,
              borderColor: Colors.SEARCH_INPUT_BORDER_GRAY_COLOR,
              backgroundColor: Colors.WHITE_COLOR,
            }}>
            <TextInput
              style={{
                marginLeft: 16,
                marginRight: 50,
                paddingRight: 30,
                textAlign: I18nManager.isRTL ? 'right' : 'left',
              }}
              placeholder={t(Translations.SEARCH)}
              color={Colors.PRIMARY_TEXT_COLOR}
              placeholderTextColor={Colors.TEXT_PLACEHOLDER_COLOR}
              autoCorrect={false}
              returnKeyType="search"
              editable={true}
              value={search}
              onSubmitEditing={() => {
                searchButtonAction();
              }}
              onChangeText={value => setSearch(value.trimStart())}
              ref={searchInputRef}
            />
            {search !== '' ? (
              <TouchableOpacity
                style={{
                  width: 30,
                  height: 30,
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'absolute',
                  right: 45,
                }}
                onPress={() => closeButtonAction()}>
                <Image
                  style={{
                    width: 20,
                    height: 20,
                  }}
                  source={Images.CROSS_BUTTON_ICON}
                />
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              onPress={() => (search !== '' ? searchButtonAction() : null)}
              style={{
                position: 'absolute',
                right: 8,
                justifyContent: 'center',
                backgroundColor: Colors.SECONDARY_COLOR,
                height: 31,
                width: 31,
                borderRadius: 4,
              }}>
              <Image
                style={{
                  width: 16,
                  height: 16,
                  resizeMode: 'contain',
                  tintColor: Colors.WHITE_COLOR,
                  alignSelf: 'center',
                  transform: [{scaleX: I18nManager.isRTL ? -1 : 1}],
                }}
                source={Images.SEARCH_ICON}
              />
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          style={{marginBottom: 30}}
          data={isLoading === true ? dummyConsultantList : departmentList}
          renderItem={renderItem}
          keyExtractor={(item, index) =>
            item._id ? item._id.toString() : index.toString()
          }
          contentContainerStyle={{}}
          onEndReachedThreshold={0.2}
          onEndReached={() => {
            listOnEndReach();
          }}
          ListEmptyComponent={
            isLoading === true ? dummyConsultantList : ConsultantEmptyComponent
          }
          ListFooterComponent={isPaginating ? paginationComponent : null}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

export default DepartmentSelectionPopUp;

const styles = StyleSheet.create({});
