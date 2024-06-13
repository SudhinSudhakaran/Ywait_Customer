import React, {useState, useEffect, useRef} from 'react';
import {
  StatusBar,
  Text,
  View,
  Image,
  TouchableOpacity,
  Keyboard,
  FlatList,
  Alert,
  ActivityIndicator,
  Platform,
  I18nManager,
  PermissionsAndroid,
  Linking,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation, useFocusEffect} from '@react-navigation/core';
import InputScrollView from 'react-native-input-scroll-view';
import FastImage from 'react-native-fast-image';
import Pdf from 'react-native-pdf';
import RBSheet from 'react-native-raw-bottom-sheet';
import ImagePicker from 'react-native-image-crop-picker';
import ImageView from 'react-native-image-viewing-rtl';
import AwesomeAlert from 'react-native-awesome-alerts';
import {
  Colors,
  Fonts,
  Globals,
  Images,
  Strings,
  Translations,
} from '../../../constants';
import LoadingIndicator from '../../shared/loadingIndicator/LoadingIndicator';
import StorageManager from '../../../helpers/storageManager/StorageManager';
import DataManager from '../../../helpers/apiManager/DataManager';
import Utilities from '../../../helpers/utils/Utilities';
import {GetImage} from '../../shared/getImage/GetImage';
import APIConnections from '../../../helpers/apiManager/APIConnections';
import UploadOptions from '../../shared/uploadOptionsPopup/uploadOptions';
import {UploadTypes} from '../../../helpers/enums/Enums';
import {t} from 'i18next';
import NetInfo from '@react-native-community/netinfo';
import {PERMISSIONS, check, request} from 'react-native-permissions';
import {checkMultiplePermissions} from '../../../helpers/utils/Permission';
const UserProfileScreen = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [personalInfoList, setPersonalInfoList] = useState([]);
  const [dynamicInfoWithUserValueList, setDynamicInfoWithUserValueList] =
    useState([]); //
  const [fullScreenImages, setFullScreenImages] = useState([]);
  const [imageFullScreenVisible, setImageFullScreenVisible] = useState([]);
  //Declaration
  const insets = useSafeAreaInsets();
  const refRBSheetPinSettings = useRef();
  const refRBSheetUploadOptions = useRef();
  const [showAlert, setShowAlert] = useState(false);

  // useEffect(() => {
  //     setIsLoading(true);
  //     getUserDetails(Globals.USER_DETAILS?._id);
  // }, []);
  useFocusEffect(
    React.useCallback(() => {
      setIsLoading(true);
      getUserDetails(Globals.USER_DETAILS?._id);
    }, []),
  );

  //Button actions
  const backButtonAction = () => {
    Keyboard.dismiss();
    navigation.goBack();
  };

  const userImageButtonAction = () => {
    if (
      Globals.USER_DETAILS?.image !== undefined &&
      Globals.USER_DETAILS?.image !== null &&
      Globals.USER_DETAILS?.image !== ''
    ) {
      Keyboard.dismiss();
      setFullScreenImages([
        {
          uri: Globals.USER_DETAILS?.image,
        },
      ]);
      setImageFullScreenVisible(true);
    }
  };

  const changePhotoButtonAction = () => {
    Keyboard.dismiss();
    refRBSheetUploadOptions.current.open();
  };

  const updateEmailButtonAction = () => {
    Keyboard.dismiss();
    navigation.navigate('ChangeEmailScreen');
  };

  const changePasswordButtonAction = () => {
    Keyboard.dismiss();
    navigation.navigate('ChangePasswordScreen');
  };

  const pinSettingsButtonAction = () => {
    Keyboard.dismiss();
    Globals.SHARED_VALUES.SELECTED_PIN_AUTH_SETTINGS =
      Globals.USER_DETAILS?.enablePinAuthentication;
    refRBSheetPinSettings.current.open();
  };

  const logoutButtonAction = () => {
    Keyboard.dismiss();
    showLogoutConfirmationAlert();
  };

  const editProfileButtonAction = () => {
    Keyboard.dismiss();
    NetInfo.fetch().then(state => {
      console.log('isConnected', state.isConnected);

      if (state.isConnected === false) {
        Utilities.showToast(
          t(Translations.FAILED),
          t(Translations.NO_INTERNET),
          'error',
          'bottom',
        );
      } else {
        if (dynamicInfoWithUserValueList.length > 0) {
          navigation.navigate('UpdateProfileScreen', {
            dynamicInfoWithUserValueList: dynamicInfoWithUserValueList,
          });
        } else {
          setIsLoading(true);
          getUserDetails(Globals.USER_DETAILS?._id);
        }
      }
    });
  };

  const filePreviewButtonAction = url => {
    Keyboard.dismiss();
    navigation.navigate('FilePreviewScreen', {
      titleText: Utilities.getFileName(url),
      url: url,
      isLocalFile: false,
    });
  };

  const imageFullscreenButtonAction = url => {
    Keyboard.dismiss();

    setFullScreenImages([
      {
        uri: url,
      },
    ]);
    setImageFullScreenVisible(true);
  };

  const showLogoutConfirmationAlert = () => {
    setShowAlert(true);
  };

  const performLogout = async () => {
    //Create OR use Token UUID

    getTokenUUID().then(res => {
      Globals.TOKEN_UUID = res;
      performLogoutAPI();
    });

    //Clear user related data
    // StorageManager.clearUserRelatedData();
    // clearUserDataAndResetNavigation();
  };

  const getTokenUUID = async () => {
    const uuid = await Utilities.getTokenUUID();
    if (uuid === null || uuid === undefined) {
      let timeStamp = Date.parse(new Date());
      console.log('timeStamp created: ', timeStamp);
      Globals.TOKEN_UUID = timeStamp;
      Utilities.saveTokenUUID(timeStamp);
      return timeStamp;
    }
    Globals.TOKEN_UUID = uuid;
    return uuid;
  };
  const clearUserDataAndResetNavigation = async () => {
    try {
      // Utilities.ClearUserRelatedData();
      Globals.IS_AUTHORIZED = false;

      Globals.TOKEN = '';
      //Resets Global shared values
      Globals.SHARED_VALUES.DYNAMIC_SELECTION_ITEMS = [];
    } catch (err) {
      console.log(err);
    }
    if (Globals.IS_STANDALONE_BUILD === true) {
      //Navigate to business selection
      navigation.reset({
        index: 0,
        routes: [{name: 'DashboardScreen'}],
      });
    } else {
      //Navigate to business selection
      navigation.reset({
        index: 0,
        routes: [{name: 'BusinessSelectionScreen'}],
      });
    }
  };

  const performLogoutAPI = () => {
    const body = {
      [APIConnections.KEYS.USER_ID]: Globals.USER_DETAILS?._id,
      [APIConnections.KEYS.DEVICE_ID]: Globals.TOKEN_UUID,
      [APIConnections.KEYS.DEVICE]: Platform.OS,
    };
    DataManager.performLogOut(body).then(([isSuccess, message, data]) => {
      if (isSuccess === true) {
        //Clear user related data
        StorageManager.clearUserRelatedData();

        clearUserDataAndResetNavigation();
      } else {
        Utilities.showToast(t(Translations.FAILED), message, 'error', 'bottom');
        setIsLoading(false);
        // setRefresh(false);
      }
    });
  };

  //Other methods
  const createPersonalInfoList = userDetails => {
    let additionalInfo = userDetails?.additionalInfo; //holds user values
    let dynamicInfo = userDetails?.dynamicInfo; //dynamic list structure
    var _dynamicInfoWithUserValueList = userDetails?.dynamicInfo; //copy dynamic list structure, and add user values

    if (
      additionalInfo !== undefined &&
      additionalInfo !== null &&
      dynamicInfo !== undefined &&
      dynamicInfo !== null
    ) {
      dynamicInfo.map((item, dynamicItemIndex) => {
        additionalInfo.map((userValueItem, userValueItemIndex) => {
          if (
            item.key === userValueItem.key &&
            item.type === userValueItem.type
          ) {
            _dynamicInfoWithUserValueList[dynamicItemIndex].userValue =
              userValueItem.value;
          }
        });
      });
    }

    console.log(
      '_dynamicInfoWithUserValueList: ',
      _dynamicInfoWithUserValueList,
    );

    setDynamicInfoWithUserValueList(_dynamicInfoWithUserValueList); //To pass data and value to update
    //Filter only ACTIVE and required with userValue if any
    let activeOnlyDynamicList = _dynamicInfoWithUserValueList.filter(data => {
      return (
        data.status?.toUpperCase() === 'ACTIVE' &&
        (data.isRequired === true || data.userValue !== undefined)
      );
    });

    //Remove customer id
    const customerIdIndex = activeOnlyDynamicList.findIndex(
      item => item.key.toUpperCase() === 'customerKey'.toUpperCase(),
    );
    customerIdIndex !== -1 && activeOnlyDynamicList.splice(customerIdIndex, 1);

    // console.log('activeOnlyDynamicList: ', activeOnlyDynamicList);

    setPersonalInfoList(activeOnlyDynamicList);
  };

  // const openCamera = async () => {
  //   if (Platform.OS === 'android') {
  //     try {
  //       const granted = await PermissionsAndroid.request(
  //         PermissionsAndroid.PERMISSIONS.CAMERA,
  //       );
  //       console.log(
  //         'Camera permission =>.',
  //         granted,
  //         '===',
  //         PermissionsAndroid.RESULTS.GRANTED,
  //       );
  //       if (granted === PermissionsAndroid.RESULTS.GRANTED) {
  //         _openCamera();
  //       } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
  //         Utilities.showToast(
  //           t(Translations.FAILED),
  //           t(Translations.ENABLE_CAMERA_PERMISSION),
  //           'error',
  //           'bottom',
  //         );
  //       } else {
  //         Utilities.showToast(
  //           t(Translations.FAILED),
  //           t(Translations.ENABLE_CAMERA_PERMISSION),
  //           'error',
  //           'bottom',
  //         );
  //       }
  //     } catch (err) {
  //       console.log(err);
  //     }
  //   } else {
  //     const res = await check(PERMISSIONS.IOS.CAMERA);
  //     console.log('QR PERMISSION <=>', res);
  //     if (res === 'granted') {
  //       _openCamera();
  //     } else if (res === 'denied' || res === 'blocked') {
  //       const res2 = await request(PERMISSIONS.IOS.CAMERA);
  //       res2 === 'granted' ? _openCamera() : null;
  //     }
  //   }
  // };

  const openCamera = async () => {
    console.log(' Camera selected');
    const permissions =
      Platform.OS === 'ios'
        ? [PERMISSIONS.IOS.CAMERA]
        : [PERMISSIONS.ANDROID.CAMERA];

    // Call our permission service and check for permissions
    var isPermissionGranted = await checkMultiplePermissions(permissions);
    console.log('isPermissionGranted', isPermissionGranted);
    if (isPermissionGranted) {
      _openCamera();
    } else {
      // Show an alert in case permission was not granted
      Alert.alert(
        'Permission Request',
        'Please allow permission to access the camera.',
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
    }
  };
  const _openCamera = () => {
    console.log('opening camera');
    ImagePicker.openCamera({
      width: 512,
      height: 512,
      cropping: true,
      includeBase64: true,
    })
      .then(image => {
        // const filename = image.path.replace(/^.*[\\\/]/, '')
        // const source = {
        //     uri: Platform.OS === 'android' ? image.path : image.path.replace('file://', ''),
        //     type: image.mime,
        //     name: `${filename}`
        // };
        console.log(image);
        let imageURL = image.path;
        uploadProfilePic(imageURL);
      })
      .catch(err => {
        console.log(err);
      });
  };

  const openGallery = async () => {
    const permissions =
      Platform.OS === 'ios'
        ? [PERMISSIONS.IOS.MEDIA_LIBRARY]
        : [PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE];
    // Call our permission service and check for permissions
    const isPermissionGranted = await checkMultiplePermissions(permissions);
    console.log('isPermissionGranted', isPermissionGranted);

    if (isPermissionGranted) {
      _openGallery();
    } else {
      Alert.alert(
        'Permission Request',
        'Please allow permission to access the storage.',
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
    }
  };

  const _openGallery = () => {
    ImagePicker.openPicker({
      width: 512,
      height: 512,
      cropping: true,
      includeBase64: true,
    })
      .then(image => {
        // const filename = image.path.replace(/^.*[\\\/]/, '')
        // const source = {
        //     uri: Platform.OS === 'android' ? image.path : image.path.replace('file://', ''),
        //     type: image.mime,
        //     name: `${filename}`
        // };
        console.log(image);
        let imageURL = image.path;
        uploadProfilePic(imageURL);
      })
      .catch(err => {
        console.log(err);
      });
  };

  const GetUploadOptions = () => {
    return (
      <RBSheet
        ref={refRBSheetUploadOptions}
        closeOnDragDown={true}
        closeOnPressMask={true}
        customStyles={{
          wrapper: {
            backgroundColor: '#00000080',
            paddingTop: insets.top,
            paddingLeft: insets.left,
            paddingRight: insets.right,
            paddingBottom: insets.bottom,
          },
          container: {
            borderTopLeftRadius: 15,
            borderTopRightRadius: 15,
          },
          draggableIcon: {
            backgroundColor: Colors.PRIMARY_TEXT_COLOR,
          },
        }}
        height={200}>
        <UploadOptions
          RBSheet={refRBSheetUploadOptions}
          isHideFileUpload={true}
          onUploadOptionSelection={handleUploadOptionSelection}
        />
      </RBSheet>
    );
  };

  //Callback from UploadOptions
  const handleUploadOptionSelection = (type: UploadTypes) => {
    console.log('Callback:', type);
    // setSelectedUploadOption(type)
    switch (type) {
      case UploadTypes.file:
        console.log('Opening file browser');

        break;
      case UploadTypes.camera:
        openCamera();
        break;
      case UploadTypes.image:
        console.log('Opening image picker');
        openGallery();
        break;
    }
  };

  //API Calls
  /**
            *
            * Purpose: Get user details
            * Created/Modified By: Jenson
            * Created/Modified Date: 04 Jan 2022
            * Steps:
                1.fetch business details from API and append to state variable
     */
  const getUserDetails = userId => {
    DataManager.getUserDetails(userId).then(([isSuccess, message, data]) => {
      if (isSuccess === true) {
        if (data.objects !== undefined && data.objects !== null) {
          StorageManager.saveUserDetails(data.objects);
          Globals.USER_DETAILS = data.objects;
          createPersonalInfoList(data.objects);
          setIsLoading(false);
        } else {
          Utilities.showToast(
            t(Translations.FAILED),
            message,
            'error',
            'bottom',
          );
          setIsLoading(false);
        }
      } else {
        Utilities.showToast(t(Translations.FAILED), message, 'error', 'bottom');
        setIsLoading(false);
      }
    });
  };

  /**
            *
            * Purpose: Get user details
            * Created/Modified By: Jenson
            * Created/Modified Date: 04 Jan 2022
            * Steps:
                1.fetch business details from API and append to state variable
     */
  const uploadProfilePic = imageURL => {
    setIsLoading(true);
    var formData = new FormData();
    //Adding static required values
    formData.append(APIConnections.KEYS.BUSINESS_ID, Globals.BUSINESS_ID);
    formData.append(APIConnections.KEYS.CUSTOMER_ID, Globals.USER_DETAILS._id);
    formData.append(APIConnections.KEYS.IMAGE, {
      uri: imageURL,
      type: 'image/png',
      name: Utilities.getFileName(imageURL),
    });
    DataManager.performProfileImageUpload(formData).then(
      ([isSuccess, message, data]) => {
        if (isSuccess === true) {
          getUserDetails(Globals.USER_DETAILS._id);
          Utilities.showToast(
            t(Translations.SUCCESS),
            t(Translations.PROFILE_IMAGE_UPDATED_SUCCESS),
            'success',
            'bottom',
          );
        } else {
          Utilities.showToast(
            t(Translations.FAILED),
            message,
            'error',
            'bottom',
          );
          setIsLoading(false);
        }
      },
    );
  };

  const changePINAuthForUser = status => {
    setIsLoading(true);
    const body = {
      [APIConnections.KEYS.STATUS]: status,
      [APIConnections.KEYS.USER_ID]: Globals.USER_DETAILS._id,
    };
    DataManager.updateAuthPINSettings(body).then(
      ([isSuccess, message, responseData]) => {
        if (isSuccess === true) {
          let _verificationData = responseData?.objects;
          if (_verificationData !== undefined && _verificationData !== null) {
            getUserDetails(Globals.USER_DETAILS._id);
          } else {
            Utilities.showToast(
              t(Translations.FAILED),
              message,
              'error',
              'bottom',
            );
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
      },
    );
  };

  //Render UI

  const renderFileAttachmentList = ({item, index}) => {
    return <FileAttachmentList item={item} itemIndex={index} />;
  };

  const FileAttachmentList = ({item, itemIndex}) => {
    if (item !== undefined && (item?.length || 0) > 0) {
      let fileType = Utilities.getFileExtension(item);
      if (fileType === 'pdf') {
        return (
          <>
            <TouchableOpacity
              onPress={() => filePreviewButtonAction(item)}
              style={{
                width: 100,
                height: 100,
                borderWidth: 1,
                borderRadius: 5,
                borderColor: Colors.TEXT_PLACEHOLDER_COLOR,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: Colors.WHITE_COLOR,
                marginRight: 12,
              }}>
              <Pdf
                source={{uri: item, cache: true}}
                pointerEvents={'none'}
                onLoadComplete={(numberOfPages, filePath) => {
                  //console.log(`Number of pages: ${numberOfPages}`);
                }}
                onPageChanged={(page, numberOfPages) => {
                  //console.log(`Current page: ${page}`);
                }}
                onError={error => {
                  //console.log(`FileAttachmentList error: ${error}`);
                }}
                onPressLink={uri => {
                  //console.log(`Link pressed: ${uri}`);
                }}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 5,
                  borderWidth: 1,
                  borderColor: Colors.TEXT_PLACEHOLDER_COLOR,
                }}
                renderActivityIndicator={progress => {
                  //console.log(progress);
                  return <ActivityIndicator color={Colors.PRIMARY_COLOR} />;
                }}
                singlePage
              />
            </TouchableOpacity>
          </>
        );
      } else if (fileType === 'doc' || fileType === 'docx') {
        return (
          <>
            <TouchableOpacity
              onPress={() => filePreviewButtonAction(item)}
              style={{
                width: 100,
                height: 100,
                borderWidth: 1,
                borderRadius: 5,
                borderColor: Colors.TEXT_PLACEHOLDER_COLOR,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: Colors.WHITE_COLOR,
                marginRight: 12,
              }}>
              <Image
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 5,
                  borderWidth: 1,
                  borderColor: Colors.TEXT_PLACEHOLDER_COLOR,
                }}
                source={Images.WORD_FILE_ICON}
                resizeMode={FastImage.resizeMode.contain}
              />
            </TouchableOpacity>
          </>
        );
      } else {
        return (
          <>
            <TouchableOpacity
              onPress={() => imageFullscreenButtonAction(item)}
              style={{
                width: 100,
                height: 100,
                borderWidth: 1,
                borderRadius: 5,
                borderColor: Colors.TEXT_PLACEHOLDER_COLOR,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: Colors.WHITE_COLOR,
                marginRight: 12,
              }}>
              <FastImage
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 5,
                  borderWidth: 1,
                  borderColor: Colors.TEXT_PLACEHOLDER_COLOR,
                }}
                source={{
                  uri: item,
                  priority: FastImage.priority.normal,
                }}
                resizeMode={FastImage.resizeMode.cover}
              />
            </TouchableOpacity>
          </>
        );
      }
    } else {
      return null;
    }
  };

  const DynamicList = ({item, itemIndex}) => {
    if (item.type?.toUpperCase() === 'File'.toUpperCase()) {
      if (item?.userValue instanceof Array) {
        //File type
        return (
          <>
            <View
              style={{
                flexDirection: 'row',
                marginLeft: 16,
                marginRight: 16,
                marginBottom: 20,
              }}>
              <View style={{width: '40%'}}>
                <Text
                  style={{
                    color: Colors.TEXT_LIGHT_GREY_COLOR_3E,
                    fontFamily: Fonts.Gibson_Regular,
                    fontSize: 14,
                    textAlign: 'left',
                  }}>
                  {item.label || '-'}
                </Text>
              </View>
              <View style={{width: '60%'}}>
                <FlatList
                  data={item?.userValue || []}
                  horizontal
                  renderItem={renderFileAttachmentList}
                  keyExtractor={(fileItem, fileItemIndex) =>
                    fileItemIndex.toString()
                  }
                  listKey={(fileItem, fileItemIndex) =>
                    fileItemIndex.toString()
                  }
                  contentContainerStyle={{paddingTop: 10, paddingBottom: 20}}
                />
              </View>
            </View>
          </>
        );
      } else {
        return null;
      }
    } else {
      return (
        <>
          <View
            style={{
              flexDirection: 'row',
              marginLeft: 16,
              marginRight: 16,
              marginBottom: 20,
            }}>
            <View style={{width: '40%'}}>
              <Text
                style={{
                  marginRight: 16,
                  color: Colors.TEXT_LIGHT_GREY_COLOR_3E,
                  fontFamily: Fonts.Gibson_Regular,
                  fontSize: 14,
                  textAlign: 'left',
                }}>
                {item.label || '-'}
              </Text>
            </View>
            <View style={{width: '60%'}}>
              <Text
                style={{
                  color: Colors.SECONDARY_COLOR,
                  fontFamily: Fonts.Gibson_Regular,
                  fontSize: 14,
                  textAlign: 'left',
                }}>
                {item.userValue || '-'}
              </Text>
            </View>
          </View>
        </>
      );
    }
  };

  const renderPersonalInfoDynamicIList = ({item, index}) => {
    return <DynamicList item={item} itemIndex={index} />;
  };

  /**
   * Header part above dynamic list
   * Purpose: Get user details
   * Created/Modified By: Jenson
   * Created/Modified Date: 04 Jan 2022
   */
  const ListHeaderComponent = (
    <>
      <View style={{flexDirection: 'row'}}>
        <View>
          <TouchableOpacity
            onPress={() => userImageButtonAction()}
            style={{
              marginLeft: 16,
              marginTop: 10,
              width: 66,
              height: 66,
              borderWidth: 3,
              borderRadius: 66 / 2,
              borderColor: Colors.SECONDARY_COLOR,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <GetImage
              style={{
                width: 60,
                height: 60,
                borderRadius: 60 / 2,
                borderWidth: 1,
                borderColor: Colors.WHITE_COLOR,
              }}
              fullName={(
                (Globals.USER_DETAILS?.firstName || 'N/A') +
                ' ' +
                (Globals.USER_DETAILS?.lastName || '')
              ).trim()}
              alphabetColor={Colors.PRIMARY_COLOR}
              url={Globals.USER_DETAILS?.image}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => changePhotoButtonAction()}>
            <Text
              style={{
                fontFamily: Fonts.Gibson_Regular,
                fontSize: 12,
                marginLeft: 16,
                marginTop: 8,
                color: Colors.PRIMARY_COLOR,
                textAlign: 'left',
              }}>
              {t(Translations.CHANGE_PHOTO)}
            </Text>
          </TouchableOpacity>
        </View>
        <View>
          <Text
            style={{
              marginLeft: 18,
              marginTop: 32,
              marginRight: 20,
              color: Colors.BLACK_COLOR,
              fontFamily: Fonts.Gibson_Regular,
              fontSize: 16,
              textAlign: 'left',
            }}
            numberOfLines={1}>
            {(
              (Globals.USER_DETAILS?.firstName || 'N/A') +
              ' ' +
              (Globals.USER_DETAILS?.lastName || '')
            ).trim()}
          </Text>

          <View style={{flexDirection: 'row'}}>
            <TouchableOpacity
              onPress={() => updateEmailButtonAction()}
              style={{
                marginLeft: 18,
                marginTop: 16,
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <Image
                source={Images.EMAIL_UPDATE_IMAGE}
                style={{
                  width: 13,
                  height: 13,
                  tintColor: Colors.PRIMARY_COLOR,
                  resizeMode: 'contain',
                }}
              />
              <Text
                style={{
                  marginLeft: 4,
                  color: Colors.PRIMARY_COLOR,
                  fontFamily: Fonts.Gibson_Regular,
                  fontSize: 10,
                  textAlign: 'left',
                }}
                numberOfLines={1}>
                {t(Translations.UPDATE_EMAIL)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => changePasswordButtonAction()}
              style={{
                marginLeft: 16,
                marginTop: 16,
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <Image
                source={Images.PASSWORD_UPDATE_IMAGE}
                style={{
                  width: 13,
                  height: 13,
                  tintColor: Colors.PRIMARY_COLOR,
                  resizeMode: 'contain',
                }}
              />
              <Text
                style={{
                  marginLeft: 4,
                  color: Colors.PRIMARY_COLOR,
                  fontFamily: Fonts.Gibson_Regular,
                  fontSize: 10,
                  textAlign: 'left',
                }}
                numberOfLines={1}>
                {t(Translations.CHANGE_PASSWORD)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                marginLeft: 16,
                marginTop: 16,
                flexDirection: 'row',
                alignItems: 'center',
              }}
              onPress={() => logoutButtonAction()}>
              <Image
                source={Images.LOGOUT_IMAGE}
                style={{
                  width: 13,
                  height: 13,
                  tintColor: Colors.PRIMARY_COLOR,
                  resizeMode: 'contain',
                }}
              />
              <Text
                style={{
                  marginLeft: 4,
                  color: Colors.PRIMARY_COLOR,
                  fontFamily: Fonts.Gibson_Regular,
                  fontSize: 10,
                  textAlign: 'left',
                }}
                numberOfLines={1}>
                {t(Translations.LOG_OUT)}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={{marginTop: 16, marginBottom: 20}}>
        <Text
          style={{
            marginLeft: 16,
            fontFamily: Fonts.Gibson_Regular,
            fontSize: 14,
            color: Colors.BLACK_COLOR,
            textAlign: 'left',
          }}>
          {t(Translations.PERSONAL_INFO)}
        </Text>
        <View
          style={{
            marginTop: 4,
            marginLeft: 16,
            backgroundColor: Colors.SECONDARY_COLOR,
            height: 2,
            width: 30,
          }}
        />
      </View>
    </>
  );

  /**
   * Footer part below dynamic list
   * Purpose: Show bottom buttons
   * Created/Modified By: Jenson
   * Created/Modified Date: 05 Jan 2022
   */
  const ListFooterComponent = (
    <View style={{flexDirection: 'row', paddingRight: 15}}>
      <View style={{flexDirection: 'row'}}>
        <TouchableOpacity
          onPress={() => editProfileButtonAction()}
          style={{
            marginLeft: 16,
            marginTop: 8,
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <Image
            source={Images.EDIT_PERSONAL_INFO_IMAGE}
            style={{
              width: 13,
              height: 13,
              tintColor: Colors.PRIMARY_COLOR,
              resizeMode: 'contain',
            }}
          />
          <Text
            style={{
              marginLeft: 4,
              color: Colors.PRIMARY_COLOR,
              fontFamily: Fonts.Gibson_Regular,
              fontSize: 10,
              textAlign: 'left',
            }}
            numberOfLines={1}>
            {t(Translations.EDIT_PERSONAL_INFO)}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  //Final return
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
        <LoadingIndicator visible={isLoading} />
        <GetUploadOptions />
        <StatusBar
          backgroundColor={Colors.PRIMARY_COLOR}
          barStyle="dark-content"
        />
        <ImageView
          images={fullScreenImages}
          imageIndex={0}
          visible={imageFullScreenVisible}
          onRequestClose={() => setImageFullScreenVisible(false)}
        />

        <View
          style={{
            backgroundColor: Colors.PRIMARY_COLOR,
            height: 45,
            width: '100%',
            justifyContent: 'center',
            flexDirection: 'row',
          }}>
          <TouchableOpacity
            style={{
              width: 20,
              height: 20,
              position: 'absolute',
              left: 20,
              alignSelf: 'center',
            }}
            onPress={() => backButtonAction()}>
            <Image
              source={Images.BACK_ARROW}
              style={{
                width: 20,
                height: 20,
                resizeMode: 'contain',
                tintColor: Colors.WHITE_COLOR,
                transform: [{scaleX: I18nManager.isRTL ? -1 : 1}],
              }}
            />
          </TouchableOpacity>
          <Text
            style={{
              fontFamily: Fonts.Gibson_Regular,
              fontSize: 16,
              color: Colors.WHITE_COLOR,
              alignSelf: 'center',
            }}>
            {t(Translations.PROFILE)}
          </Text>
        </View>

        <FlatList
          data={personalInfoList}
          renderItem={renderPersonalInfoDynamicIList}
          keyExtractor={(item, index) => index.toString()}
          listKey={(item, index) => index.toString()}
          contentContainerStyle={{paddingTop: 10, paddingBottom: 20}}
          bounces={false}
          ListHeaderComponent={ListHeaderComponent}
          ListFooterComponent={isLoading ? null : ListFooterComponent}
        />
      </View>
      <AwesomeAlert
        show={showAlert}
        showProgress={false}
        title={t(Translations.PLEASE_CONFIRM)}
        titleStyle={{
          color: Colors.BLACK_COLOR,
          fontFamily: Fonts.Gibson_Regular,
        }}
        message={t(Translations.ARE_YOU_SURE_YOU_WANT_LOG_OUT)}
        closeOnTouchOutside={false}
        closeOnHardwareBackPress={false}
        showCancelButton={true}
        showConfirmButton={true}
        animatedValue={0.8}
        cancelText={t(Translations.CANCEL)}
        confirmText={t(Translations.CONFIRM)}
        confirmButtonColor={Colors.PRIMARY_COLOR}
        cancelButtonColor={Colors.SECONDARY_COLOR}
        onCancelPressed={() => {
          setShowAlert(false);
        }}
        onConfirmPressed={() => {
          performLogout();
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
    </>
  );
};
export default UserProfileScreen;
