import React, {useState, useEffect, useRef} from 'react';
import {
  StatusBar,
  Text,
  View,
  Image,
  TouchableOpacity,
  Keyboard,
  ActivityIndicator,
  ScrollView,
  Alert,
  I18nManager,
  BackHandler,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/core';
import {HelperText, TextInput} from 'react-native-paper';
import {useRoute} from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import Pdf from 'react-native-pdf';
import RBSheet from 'react-native-raw-bottom-sheet';
import DatePicker from 'react-native-date-picker';
import ImagePicker from 'react-native-image-crop-picker';
import DocumentPicker, {
  isInProgress,
  types,
} from 'react-native-document-picker';
import moment from 'moment';
import ImageView from 'react-native-image-viewing';

import {UploadTypes} from '../../../helpers/enums/Enums';
import {
  Colors,
  Fonts,
  Globals,
  Images,
  Strings,
  Translations,
} from '../../../constants';
import Utilities from '../../../helpers/utils/Utilities';
import DataManager from '../../../helpers/apiManager/DataManager';
import LoadingIndicator from '../../shared/loadingIndicator/LoadingIndicator';
import StorageManager from '../../../helpers/storageManager/StorageManager';
import APIConnections from '../../../helpers/apiManager/APIConnections';
import CountryListPopupScreen from '../../shared/countryListPopup/CountryListPopupScreen';
import CountryCodePopupScreen from '../../shared/countryCodePopup/CountryCodePopupScreen';
import StateAndCityPopupScreen from '../../shared/stateAndCityPopup/StateAndCityPopupScreen';
import DynamicSelectionPopupScreen from '../../shared/dynamicSelectionPopup/DynamicSelectionPopupScreen';
import UploadOptions from '../../shared/uploadOptionsPopup/uploadOptions';
import AlertConfirmPopupScreen from '../../shared/alertConfirmPopup/AlertConfirmPopupScreen';
import {t} from 'i18next';
import DropdownTextInput from '.././../shared/textInputs/DropdownTextInput';
import {useFocusEffect} from '@react-navigation/core';
import AwesomeAlert from 'react-native-awesome-alerts';
const UpdateProfileScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  //Declaration
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(true);
  const [isValidationActive, setIsValidationActive] = useState(false);
  const [countryCode, setCountryCode] = useState(
    Globals?.USER_DETAILS?.countryCode ||
      Globals?.BUSINESS_DETAILS?.countryPhoneCode ||
      '+91',
  );
  const [dynamicInfoWithUserValueList, setDynamicInfoWithUserValueList] =
    useState([]);
  const [stateAndCityList, setStateAndCityList] = useState([]);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [fullScreenImages, setFullScreenImages] = useState([]);
  const [imageFullScreenVisible, setImageFullScreenVisible] = useState(false);
  const [hideButton, setHideButton] = useState(true);
  const [profileData, setProfileData] = useState(
    Globals.SHARED_VALUES.PROFILE_PREVIOUS_DATA,
  );
  const [showChangeAlert, setShowChangeAlert] = useState(false);
  const refRBSheetCountry = useRef();
  const refRBSheetCountryCode = useRef();
  const refRBSheetStateCity = useRef();
  const refRBSheetDynamicSelection = useRef();
  const refRBSheetUploadOptions = useRef();
  const refRBSheetAlertConfirm = useRef();
  var stateInputIndex = -1; //To keep track state.
  var cityInputIndex = -1; //To keep track city.

  useFocusEffect(
    React.useCallback(() => {
      loadStateAndCityListIfNeeded();
      createDynamicFields();
      getUserDetails(Globals.USER_DETAILS?._id);
    }, []),
  );
  useEffect(() => {
    function handleBackButton() {
      backButtonAction();
      return true;
    }
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackButton,
    );
    return () => {
      //Clean up
      backHandler.remove();
    };
  });
  const getUserDetails = userId => {
    DataManager.getUserDetails(userId).then(([isSuccess, message, data]) => {
      if (isSuccess === true) {
        if (data.objects !== undefined && data.objects !== null) {
          createPersonalInfoList(data.objects);
        } else {
          // Utilities.showToast(
          //   t(Translations.FAILED),
          //   message,
          //   'error',
          //   'bottom',
          // );
          setIsLoading(false);
        }
      } else {
        Utilities.showToast(t(Translations.FAILED), message, 'error', 'bottom');
        setIsLoading(false);
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

    // //Filter only ACTIVE and required with userValue if any
    // let activeOnlyDynamicList = _dynamicInfoWithUserValueList.filter(data => {
    //   return (
    //     // data.status?.toUpperCase() === 'ACTIVE' &&
    //     data.isRequired === true || data.userValue !== undefined
    //   );
    // });

    // //Remove customer id
    // const customerIdIndex = activeOnlyDynamicList.findIndex(
    //   item => item.key.toUpperCase() === 'customerKey'.toUpperCase(),
    // );
    // customerIdIndex !== -1 && activeOnlyDynamicList.splice(customerIdIndex, 1);

    // // console.log('activeOnlyDynamicList: ', activeOnlyDynamicList);

    setProfileData(_dynamicInfoWithUserValueList);
  };

  //Button actions
  const updateButtonAction = () => {
    Keyboard.dismiss();
    performInputsValidation();
    if (isValidInputFields() === true) {
      let params = getValuesFromDynamicViews();
      performProfileUpdate(params);
    }
  };
  const backButtonAction = () => {
    Keyboard.dismiss();
    // console.log('is data changed ', checkIsChanged());
    if (checkIsChanged() === false) {
       navigation.goBack();
    } else {
      setShowChangeAlert(true);
    }
  };

  
  const checkIsChanged = () => {
    var isChanged = false;
    console.log('back button action', profileData);
    console.log('new data', convertFormData()); 
if (Globals.USER_DETAILS?.countryCode !== countryCode) {
  isChanged = true;                                               
} else {
    if (profileData?.length > 0) {
      profileData.map((_item, index) => {
        if (convertFormData().length > 0) {
          convertFormData().map((item, index) => {
            if (_item?.key === item?.[0]) {
              console.log(
                'profile data \n',
                _item?.userValue,
                'new data',
                item?.[1],
              );
              if (_item?.userValue !== item?.[1]) {
                console.log('changed');
                isChanged = true;
              }
            }
          });
        }
      });
    }
  }
    return isChanged;
  };
  const convertFormData = () => {
    var obj = {};
    var data = [];
    const _data = getValuesFromDynamicViews()._parts;
    // console.log(' _data', _data);
    _data.map((__item, index) => {
      data.push(__item);
    });
    // console.log('After =========', data);
    return data;
  };

  const filePreviewButtonAction = (url, isLocalFile) => {
    Keyboard.dismiss();
    navigation.navigate('FilePreviewScreen', {
      titleText: Utilities.getFileName(url),
      url: url,
      isLocalFile: isLocalFile,
    });
  };

  const imageFullscreenButtonAction = url => {
    // console.log('imageFullscreenButtonAction url: ', url);
    Keyboard.dismiss();
    setFullScreenImages([
      {
        uri: url,
      },
    ]);
    setImageFullScreenVisible(true);
  };

  const onPressDateSelectionInputItemAction = (item, index) => {
    Keyboard.dismiss();
    Globals.SHARED_VALUES.POPUP_ACTIVE_SOURCE_INDEX = index;
    let currentDateValue = item?.userValue || new Date();
    // console.log('currentDateValue: ', currentDateValue);
    let currentDateValueInDateFormat = moment(
      currentDateValue,
      'DD/MM/YYYY',
    )._d;
    // console.log('currentDateValueInDateFormat: ', currentDateValueInDateFormat);
    Globals.SHARED_VALUES.DATE_PICKER_DATE = currentDateValueInDateFormat;
    //Disable future dates if item key is "dateOfBirth"
    if (item?.key.toUpperCase() === 'dateOfBirth'.toUpperCase()) {
      Globals.SHARED_VALUES.DATE_PICKER_MAX_DATE = new Date();
    } else {
      Globals.SHARED_VALUES.DATE_PICKER_MAX_DATE = null;
    }
    setIsDatePickerOpen(true);
  };

  const onPressDynamicSelectionInputItemAction = (item, index) => {
    Keyboard.dismiss();
    Globals.SHARED_VALUES.POPUP_ACTIVE_SOURCE_INDEX = index;

    // console.log(
    //   `onPressDynamicSelectionInputItemAction index: ${index}\nitem: ${item.label}`,
    // );

    if (item?.key?.toUpperCase() === 'country'.toUpperCase()) {
      Globals.SHARED_VALUES.COUNTRY_POPUP_TITLE = `${t(Translations.SELECT)} ${
        item.label
      }`;
      refRBSheetCountry.current.open();
    } else if (item?.key?.toUpperCase() === 'state'.toUpperCase()) {
      if (stateAndCityList.length > 0) {
        Globals.SHARED_VALUES.COUNTRY_POPUP_TITLE = `${t(
          Translations.SELECT,
        )} ${item.label}`;
        Globals.SHARED_VALUES.IS_FOR_CITY = false;
        refRBSheetStateCity.current.open();
      } else {
        Utilities.showToast(
          t(Translations.FAILED),
          t(Translations.PLEASE_SELECT_COUNTRY_FIRST),
          'error',
          'bottom',
        );
      }
    } else if (item?.key?.toUpperCase() === 'city'.toUpperCase()) {
      if (
        stateAndCityList.length > 0 &&
        Globals.SHARED_VALUES.SELECTED_STATE_INDEX !== -1
      ) {
        Globals.SHARED_VALUES.COUNTRY_POPUP_TITLE = `${t(
          Translations.SELECT,
        )} ${item.label}`;
        Globals.SHARED_VALUES.IS_FOR_CITY = true;
        refRBSheetStateCity.current.open();
      } else {
        Utilities.showToast(
          t(Translations.FAILED),
          t(Translations.PLEASE_SELECT_STATE_FIRST),
          'error',
          'bottom',
        );
      }
    } else if (
      item?.key?.toUpperCase() === 'phoneNumber'.toUpperCase() ||
      item?.key?.toUpperCase() === 'phoneNo'.toUpperCase() ||
      item?.key?.toUpperCase() === 'phone'.toUpperCase() ||
      item?.key?.toUpperCase() === 'Mobile'.toUpperCase()
    ) {
      Globals.SHARED_VALUES.COUNTRY_POPUP_TITLE = t(Translations.SELECT_CODE);
      refRBSheetCountryCode.current.open();
    } else {
      if (item?.value.length > 0) {
        Globals.SHARED_VALUES.COUNTRY_POPUP_TITLE = `${t(
          Translations.SELECT,
        )} ${item.label}`;
        Globals.SHARED_VALUES.DYNAMIC_SELECTION_ITEMS = item?.value;
        refRBSheetDynamicSelection.current.open();
      }
    }
  };

  const onPressFileAttachmentAddAction = (item, index) => {
    //Show file upload option popup
    Keyboard.dismiss();
    Globals.SHARED_VALUES.POPUP_ACTIVE_SOURCE_INDEX = index;
    refRBSheetUploadOptions.current.open();
  };

  const onPressFileAttachmentDeleteAction = (item, index, attachmentIndex) => {
    //Show confirmation popup
    Keyboard.dismiss();
    Globals.SHARED_VALUES.POPUP_ACTIVE_SOURCE_INDEX = index;
    Globals.SHARED_VALUES.ALERT_CONFIRM_MESSAGE =
      Strings.REMOVE_ATTACHMENT_CONFIRM_MESSAGE;
    Globals.SHARED_VALUES.DELETE_ATTACHMENT_SELECTED_INDEX = attachmentIndex;
    refRBSheetAlertConfirm.current.open();
  };

  //Other function
  const onChangeDynamicInputText = (index, value) => {
    const newArray = [...dynamicInfoWithUserValueList];
    newArray[index].userValue = value;
    setDynamicInfoWithUserValueList(newArray);
  };

  const loadStateAndCityListIfNeeded = () => {
    let userCountry = Globals.USER_DETAILS?.country;
    if (userCountry !== undefined && userCountry !== null) {
      getStateAndCity(userCountry, true);
    }
  };

  const createDynamicFields = () => {
    var _dynamicInfoWithUserValueList =
      route?.params?.dynamicInfoWithUserValueList || [];

    //Filter only ACTIVE and not office use
    var activeOnlyDynamicList = _dynamicInfoWithUserValueList.filter(data => {
      let isForOfficeUseOnly =
        data?.forOfficeUseOnly !== undefined && data?.forOfficeUseOnly !== null
          ? data?.forOfficeUseOnly
          : false;
      return (
        data.status?.toUpperCase() === 'ACTIVE' && isForOfficeUseOnly === false
      );
    });
    //Remove customer id
    const customerIdIndex = activeOnlyDynamicList.findIndex(
      item => item.key.toUpperCase() === 'customerKey'.toUpperCase(),
    );
    customerIdIndex !== -1 && activeOnlyDynamicList.splice(customerIdIndex, 1);

    //Insert empty attachment add type to end of values if 'File' type found
    activeOnlyDynamicList.map((item, dynamicItemIndex) => {
      if (item.type?.toUpperCase() === 'File'.toUpperCase()) {
        if (item.userValue !== undefined && item?.userValue instanceof Array) {
          if (item.userValue.length > 0) {
            var _attachments = [];
            item.userValue.map((attachmentItem, attachmentItemIndex) => {
              var _attachmentItem = {};
              _attachmentItem.type = 'Existing';
              _attachmentItem.url = attachmentItem;
              _attachments.push(_attachmentItem);
            });

            var _addAttachmentItem = {};
            _addAttachmentItem.type = 'Add';
            _attachments.push(_addAttachmentItem);
            item.userValue = _attachments;
          } else {
            //Insert add type object
            var _attachmentItem = {};
            _attachmentItem.type = 'Add';
            item.userValue = [_attachmentItem];
          }
        } else {
          //Insert add type object
          var _attachmentItem = {};
          _attachmentItem.type = 'Add';
          item.userValue = [_attachmentItem];
        }
      }
    });

    // console.log('Update page - activeOnlyDynamicList: ', activeOnlyDynamicList);
    setProfileData(activeOnlyDynamicList);
    setTimeout(() => {
      setDynamicInfoWithUserValueList(activeOnlyDynamicList || []);
      setHideButton(false);
      setIsLoading(false);
    }, 500);
  };

  const performInputsValidation = () => {
    const newArray = [...dynamicInfoWithUserValueList]; //copy of main list
    dynamicInfoWithUserValueList.map((item, itemIndex) => {
      //Types are: Text, Date, Integer, Selection, Text area, File
      if (
        item?.type?.toUpperCase() === 'Text'.toUpperCase() ||
        item?.type?.toUpperCase() === 'Text area'.toUpperCase()
      ) {
        let trimmedUserValue = (item.userValue || '').trim();
        newArray[itemIndex].userErrorText = null;
        if (item?.isRequired === true) {
          //Check for allowDigits
          if (
            (item.allowDigits !== undefined ? item.allowDigits : true) === false
          ) {
            if (Utilities.isContainsDigit(item?.userValue || '') === true) {
              newArray[itemIndex].userErrorText = `${t(
                Translations.DIGITS_NOT_ALLOWED_FOR,
              )} ${
                item?.label || item?.placeHolder || t(Translations.THIS_FIELD)
              }`;
            }
          }
          //Check for minimumCharacters
          if (
            trimmedUserValue.length <
            (item.minimumCharacters !== undefined ? item.minimumCharacters : 2)
          ) {
            let minChar =
              item.minimumCharacters !== undefined ? item.minimumCharacters : 2;
            newArray[itemIndex].userErrorText = `${t(
              Translations.MINIMUM,
            )} ${minChar} ${t(Translations.CHARACTERS_REQUIRED)}`;
          }
          //Check for maximumCharacters
          if (
            trimmedUserValue.length >
            (item.maximumCharacters !== undefined
              ? item.maximumCharacters
              : 10000)
          ) {
            let maxChar =
              item.maximumCharacters !== undefined
                ? item.maximumCharacters
                : 10000;
            newArray[itemIndex].userErrorText = `${t(
              Translations.ONLY,
            )}  ${maxChar} ${t(Translations.CHARACTERS_REQUIRED)}`;
          }
          //Check for value exist
          if (trimmedUserValue.length === 0) {
            newArray[itemIndex].userErrorText = `${
              item?.label || item?.placeHolder || Translations.THIS_FIELD
            } ${t(Translations.IS_REQUIRED)}`;
          }
          //Check valid email
          if (item?.key.toUpperCase().includes('EMAIL')) {
            if (Utilities.isEmailValid(trimmedUserValue) !== true) {
              newArray[itemIndex].userErrorText =
                'Please enter valid email address';
            }
          }
        } else {
          // Need to check other validations if text entered
          if (trimmedUserValue.length > 0) {
            //Check for allowDigits
            if (
              (item.allowDigits !== undefined ? item.allowDigits : true) ===
              false
            ) {
              if (Utilities.isContainsDigit(item?.userValue || '') === true) {
                newArray[itemIndex].userErrorText = `${t(
                  Translations.DIGITS_NOT_ALLOWED_FOR,
                )} ${item?.label || item?.placeHolder || 'this field'}`;
              }
            }
            //Check for minimumCharacters
            // if (
            //   trimmedUserValue.length <
            //   (item.minimumCharacters !== undefined
            //     ? item.minimumCharacters
            //     : 2)
            // ) {
            //   let minChar =
            //     item.minimumCharacters !== undefined
            //       ? item.minimumCharacters
            //       : 2;
            //   newArray[itemIndex].userErrorText = `${t(
            //     Translations.MINIMUM,
            //   )} ${minChar} ${t(Translations.CHARACTERS_REQUIRED)}`;
            // }
            //Check for maximumCharacters
            if (
              trimmedUserValue.length >
              (item.maximumCharacters !== undefined
                ? item.maximumCharacters
                : 10000)
            ) {
              let maxChar =
                item.maximumCharacters !== undefined
                  ? item.maximumCharacters
                  : 10000;
              newArray[itemIndex].userErrorText = `${t(
                Translations.ONLY,
              )} ${maxChar} ${t(Translations.CHARACTERS_REQUIRED)}`;
            }
            //Check valid email
            if (item?.key?.toUpperCase().includes('EMAIL')) {
              if (Utilities.isEmailValid(trimmedUserValue) !== true) {
                newArray[itemIndex].userErrorText =
                  'Please enter valid email address';
              }
            }
          }
        }
      } else if (
        item?.type?.toUpperCase() === 'Date'.toUpperCase() ||
        item?.type?.toUpperCase() === 'Selection'.toUpperCase()
      ) {
        let trimmedUserValue = (item.userValue || '').trim();
        newArray[itemIndex].userErrorText = null;
        if (item?.isRequired === true) {
          //Check for value exist
          if (trimmedUserValue.length === 0) {
            newArray[itemIndex].userErrorText = `${
              item?.label || item?.placeHolder || t(Translations.THIS_FIELD)
            } ${t(Translations.IS_REQUIRED)}`;
          }
        }
      } else if (item?.type?.toUpperCase() === 'Integer'.toUpperCase()) {
        let trimmedUserValue = (item.userValue || '').trim();
        newArray[itemIndex].userErrorText = null;
        if (item?.isRequired === true) {
          //Check for is having only numbers
          if (Utilities.isHavingOnlyNumbers(item?.userValue || '') === false) {
            newArray[itemIndex].userErrorText = `Please enter a valid ${
              item?.label || item?.placeHolder || t(Translations.THIS_FIELD)
            }`;
          }
          //Check for minimumCharacters
          if (
            trimmedUserValue.length <
            (item.minimumCharacters !== undefined ? item.minimumCharacters : 2)
          ) {
            let minChar =
              item.minimumCharacters !== undefined ? item.minimumCharacters : 2;
            newArray[itemIndex].userErrorText = `${t(
              Translations.MINIMUM,
            )} ${minChar} ${t(Translations.CHARACTERS_REQUIRED)}`;
          }
          //Check for maximumCharacters
          if (
            trimmedUserValue.length >
            (item.maximumCharacters !== undefined
              ? item.maximumCharacters
              : 10000)
          ) {
            let maxChar =
              item.maximumCharacters !== undefined
                ? item.maximumCharacters
                : 10000;
            newArray[itemIndex].userErrorText = `${t(
              Translations.ONLY,
            )} ${maxChar} ${t(Translations.CHARACTERS_REQUIRED)}`;
          }
          //Check for value exist
          if (trimmedUserValue.length === 0) {
            newArray[itemIndex].userErrorText = `${
              item?.label || item?.placeHolder || t(Translations.THIS_FIELD)
            } ${t(Translations.IS_REQUIRED)}`;
          }
        } else {
          // Need to check other validations if text entered
          if (trimmedUserValue.length > 0) {
            //Check for is having only numbers
            if (
              Utilities.isHavingOnlyNumbers(item?.userValue || '') === false
            ) {
              newArray[itemIndex].userErrorText = `Please enter a valid ${
                item?.label || item?.placeHolder || t(Translations.THIS_FIELD)
              }`;
            }

            //Check for minimumCharacters
            if (
              trimmedUserValue.length <
              (item.minimumCharacters !== undefined
                ? item.minimumCharacters
                : 2)
            ) {
              let minChar =
                item.minimumCharacters !== undefined
                  ? item.minimumCharacters
                  : 2;
              newArray[itemIndex].userErrorText = `${t(
                Translations.MINIMUM,
              )} ${minChar} ${t(Translations.CHARACTERS_REQUIRED)}`;
            }
            //Check for maximumCharacters
            if (
              trimmedUserValue.length >
              (item.maximumCharacters !== undefined
                ? item.maximumCharacters
                : 10000)
            ) {
              let maxChar =
                item.maximumCharacters !== undefined
                  ? item.maximumCharacters
                  : 10000;
              newArray[itemIndex].userErrorText = `${t(
                Translations.ONLY,
              )} ${maxChar} ${t(Translations.CHARACTERS_REQUIRED)}`;
            }
          }
        }
      } else if (item?.type?.toUpperCase() === 'File'.toUpperCase()) {
        let trimmedUserValue = item.userValue || [];
        newArray[itemIndex].userErrorText = null;
        if (item?.isRequired === true) {
          //Check for value exist
          if (trimmedUserValue.length === 1) {
            newArray[itemIndex].userErrorText = `${
              item?.label || item?.placeHolder || t(Translations.THIS_FIELD)
            } ${t(Translations.IS_REQUIRED)}`;
          }
        }
      }
    });
    setDynamicInfoWithUserValueList(newArray);
  };

  const isValidInputFields = () => {
    const validationFailedIndex = dynamicInfoWithUserValueList.findIndex(
      item => (item?.userErrorText?.length || 0) > 0,
    );
    if (validationFailedIndex !== -1) {
      //Validation failed
      setIsValidationActive(true);
      return false;
    } else {
      return true;
    }
  };

  const getValuesFromDynamicViews = () => {
    var formData = new FormData();
    //Adding static required values
    formData.append(APIConnections.KEYS.BUSINESS_ID, Globals.BUSINESS_ID);
    formData.append(APIConnections.KEYS.CUSTOMER_ID, Globals.USER_DETAILS._id);
    formData.append(APIConnections.KEYS.COUNTRY_CODE, countryCode);

    dynamicInfoWithUserValueList.map((item, itemIndex) => {
      //Types are: Text, Date, Integer, Selection, Text area, File
      if (item?.type?.toUpperCase() === 'File'.toUpperCase()) {
        let attachmentsInfoList = item.userValue || [];
        var existingItems = [];
        if (attachmentsInfoList.length > 1) {
          attachmentsInfoList.map((attachmentItem, attachmentItemIndex) => {
            if (attachmentItem.type === 'Existing') {
              existingItems.push(attachmentItem.url);
            } else if (attachmentItem.type === 'Local') {
              let localItemURL = attachmentItem.url;
              let fileType = Utilities.getFileExtension(localItemURL);
              let fileName = Utilities.getFileName(localItemURL);
              if (fileType.toUpperCase() === 'pdf'.toUpperCase()) {
                formData.append(item.key, {
                  uri: localItemURL,
                  type: 'application/pdf',
                  name: fileName,
                });
              } else if (fileType.toUpperCase() === 'doc'.toUpperCase()) {
                formData.append(item.key, {
                  uri: localItemURL,
                  type: 'application/msword',
                  name: fileName,
                });
              } else if (fileType.toUpperCase() === 'docx'.toUpperCase()) {
                formData.append(item.key, {
                  uri: localItemURL,
                  type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                  name: fileName,
                });
              } else {
                formData.append(item.key, {
                  uri: localItemURL,
                  type: 'image/png',
                  name: fileName,
                });
              }
            }
          });
        }
        //Append existing values if available
        if (existingItems.length > 0) {
          let existingKey = 'existing' + item.key;
          formData.append(existingKey, JSON.stringify(existingItems));
        }
      } else {
        let value = item.userValue;
        if (value !== undefined) {
          let key = item.key;
          formData.append(key, value);
        }
      }
    });

    // console.log('-------', formData);
    return formData;
  };

  const openCamera = () => {
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
        // console.log(image);
        let imageURL = image.path;
        const newArray = [...dynamicInfoWithUserValueList];
        var currentAttachments =
          newArray[Globals.SHARED_VALUES.POPUP_ACTIVE_SOURCE_INDEX].userValue;
        //Remove last add item attachment
        currentAttachments.splice(-1);
        //Attaching selected image
        var _attachmentItem = {};
        _attachmentItem.type = 'Local';
        _attachmentItem.url = imageURL;
        currentAttachments.push(_attachmentItem);
        //Insert add type object
        var _addAttachmentItem = {};
        _addAttachmentItem.type = 'Add';
        currentAttachments.push(_addAttachmentItem);
        //update copy object
        newArray[Globals.SHARED_VALUES.POPUP_ACTIVE_SOURCE_INDEX].userValue =
          currentAttachments;
        setDynamicInfoWithUserValueList(newArray);
      })
      .catch(err => {
        console.log(err);
      });
  };

  const openGallery = () => {
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
        const newArray = [...dynamicInfoWithUserValueList];
        var currentAttachments =
          newArray[Globals.SHARED_VALUES.POPUP_ACTIVE_SOURCE_INDEX].userValue;
        //Remove last add item attachment
        currentAttachments.splice(-1);
        //Attaching selected image
        var _attachmentItem = {};
        _attachmentItem.type = 'Local';
        _attachmentItem.url = imageURL;
        currentAttachments.push(_attachmentItem);
        //Insert add type object
        var _addAttachmentItem = {};
        _addAttachmentItem.type = 'Add';
        currentAttachments.push(_addAttachmentItem);
        //update copy object
        newArray[Globals.SHARED_VALUES.POPUP_ACTIVE_SOURCE_INDEX].userValue =
          currentAttachments;
        setDynamicInfoWithUserValueList(newArray);
      })
      .catch(err => {
        console.log(err);
      });
  };

  const openDocPicker = async () => {
    try {
      const pickerResult = await DocumentPicker.pickSingle({
        type: [types.doc, types.docx, types.pdf, types.images],
        presentationStyle: 'fullScreen',
        copyTo: 'cachesDirectory',
      });
      console.log('openDocPicker pickerResult: ', [pickerResult]);
      let docItems = [pickerResult];
      if (docItems.length > 0) {
        const newArray = [...dynamicInfoWithUserValueList];
        var currentAttachments =
          newArray[Globals.SHARED_VALUES.POPUP_ACTIVE_SOURCE_INDEX].userValue;
        //Remove last add item attachment
        currentAttachments.splice(-1);
        //Attaching selected image
        var _attachmentItem = {};
        _attachmentItem.type = 'Local';
        _attachmentItem.url = docItems[0].uri;
        currentAttachments.push(_attachmentItem);
        //Insert add type object
        var _addAttachmentItem = {};
        _addAttachmentItem.type = 'Add';
        currentAttachments.push(_addAttachmentItem);
        //update copy object
        newArray[Globals.SHARED_VALUES.POPUP_ACTIVE_SOURCE_INDEX].userValue =
          currentAttachments;
        setDynamicInfoWithUserValueList(newArray);
      }
    } catch (e) {
      handleDocPickerError(e);
    }
  };

  const handleDocPickerError = (err: unknown) => {
    if (DocumentPicker.isCancel(err)) {
      // console.warn('cancelled');
      // User cancelled the picker, exit any dialogs or menus and move on
    } else if (isInProgress(err)) {
      console.warn(
        'multiple pickers were opened, only the last will be considered',
      );
    } else {
      throw err;
    }
  };

  //API Calls
  /**
          *
          * Purpose: Get state and city list based on country
          * Created/Modified By: Jenson
          * Created/Modified Date: 13 Jan 2022
          * Steps:
              1.fetch details from API and update to state variable
   */
  const getStateAndCity = (countryName, isAutoSelectStateIndex = false) => {
    setIsLoading(true);
    DataManager.getStateAndCityList(countryName).then(
      ([isSuccess, message, data]) => {
        if (isSuccess === true) {
          if (data !== undefined && data !== null) {
            if (data.length > 0) {
              setStateAndCityList(data[0].states);
              if (isAutoSelectStateIndex === true) {
                let userState = Globals.USER_DETAILS?.state || '';
                if (userState.length > 0) {
                  let selectedItemIndex = data[0].states.findIndex(
                    obj => obj.state === userState,
                  );
                  //Save selected state index
                  Globals.SHARED_VALUES.SELECTED_STATE_INDEX =
                    selectedItemIndex;
                }
              }
            } else {
              setStateAndCityList([]);
            }
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

  const performProfileUpdate = params => {
    setIsLoading(true);
    DataManager.performCustomerProfileUpdate(params).then(
      ([isSuccess, message, data]) => {
        if (isSuccess === true) {
          if (data !== undefined && data !== null) {
            Utilities.showToast(
              t(Translations.SUCCESS),
              t(Translations.PROFILE_UPDATED_SUCCESS),
              'success',
              'bottom',
            );
            setIsLoading(false);
            navigation.goBack();
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

  //Child callbacks
  const didSelectedCountryItem = item => {
    refRBSheetCountry.current.close();
    console.log('Selected item: ', item.countryName);
    if (Globals.SHARED_VALUES.POPUP_ACTIVE_SOURCE_INDEX !== -1) {
      getStateAndCity(item.countryName);
      const newArray = [...dynamicInfoWithUserValueList];
      newArray[Globals.SHARED_VALUES.POPUP_ACTIVE_SOURCE_INDEX].userValue =
        item.countryName;
      //Reset state and city
      if (stateInputIndex !== -1) {
        newArray[stateInputIndex].userValue = '';
      }
      if (cityInputIndex !== -1) {
        newArray[cityInputIndex].userValue = '';
      }
      Globals.SHARED_VALUES.SELECTED_STATE_INDEX = -1;
      setDynamicInfoWithUserValueList(newArray);
    }
  };

  const didSelectedCountryCodeItem = item => {
    refRBSheetCountryCode.current.close();
    if (Globals.SHARED_VALUES.POPUP_ACTIVE_SOURCE_INDEX !== -1) {
      setCountryCode(item?.countryPhoneCode || '');
    }
  };

  const didSelectedStateOrCity = item => {
    refRBSheetStateCity.current.close();
    if (Globals.SHARED_VALUES.POPUP_ACTIVE_SOURCE_INDEX !== -1) {
      if (Globals.SHARED_VALUES.POPUP_ACTIVE_SOURCE_INDEX === stateInputIndex) {
        //From state popup
        const newArray = [...dynamicInfoWithUserValueList];
        newArray[Globals.SHARED_VALUES.POPUP_ACTIVE_SOURCE_INDEX].userValue =
          item.state;
        //Get selected state index
        let selectedItemIndex = stateAndCityList.findIndex(
          obj => obj.state === item.state,
        );
        //Save selected state index
        Globals.SHARED_VALUES.SELECTED_STATE_INDEX = selectedItemIndex;
        //Reset city
        if (cityInputIndex !== -1) {
          newArray[cityInputIndex].userValue = '';
        }
        setDynamicInfoWithUserValueList(newArray);
      } else if (
        Globals.SHARED_VALUES.POPUP_ACTIVE_SOURCE_INDEX === cityInputIndex
      ) {
        //From city popup
        const newArray = [...dynamicInfoWithUserValueList];
        newArray[Globals.SHARED_VALUES.POPUP_ACTIVE_SOURCE_INDEX].userValue =
          item;
        setDynamicInfoWithUserValueList(newArray);
      }
    }
  };

  const didSelectedDynamicSelectionItem = item => {
    refRBSheetDynamicSelection.current.close();
    if (Globals.SHARED_VALUES.POPUP_ACTIVE_SOURCE_INDEX !== -1) {
      const newArray = [...dynamicInfoWithUserValueList];
      newArray[Globals.SHARED_VALUES.POPUP_ACTIVE_SOURCE_INDEX].userValue =
        item;
      setDynamicInfoWithUserValueList(newArray);
    }
  };

  //Callback from UploadOptions
  const handleUploadOptionSelection = (type: UploadTypes) => {
    console.log('Callback:', type);
    // setSelectedUploadOption(type)
    switch (type) {
      case UploadTypes.file:
        console.log('Opening file browser');
        openDocPicker();
        break;
      case UploadTypes.camera:
        console.log('Opening camera');
        openCamera();
        break;
      case UploadTypes.image:
        console.log('Opening image picker');
        openGallery();
        break;
    }
  };

  const alertConfirmPopupSelectedNo = () => {
    refRBSheetAlertConfirm.current.close();
  };

  const alertConfirmPopupSelectedYes = () => {
    refRBSheetAlertConfirm.current.close();
    if (
      Globals.SHARED_VALUES.POPUP_ACTIVE_SOURCE_INDEX !== -1 &&
      Globals.SHARED_VALUES.DELETE_ATTACHMENT_SELECTED_INDEX !== -1
    ) {
      const newArray = [...dynamicInfoWithUserValueList];
      var currentAttachments =
        newArray[Globals.SHARED_VALUES.POPUP_ACTIVE_SOURCE_INDEX].userValue;
      if (currentAttachments.length > 0) {
        currentAttachments.splice(
          Globals.SHARED_VALUES.DELETE_ATTACHMENT_SELECTED_INDEX,
          1,
        );
      }
      newArray[Globals.SHARED_VALUES.POPUP_ACTIVE_SOURCE_INDEX].userValue =
        currentAttachments;
      setDynamicInfoWithUserValueList(newArray);
    }
  };

  //Render UI

  const CountrySelectionPopup = () => {
    return (
      <RBSheet
        ref={refRBSheetCountry}
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
        height={550}>
        <CountryListPopupScreen
          RBSheet={refRBSheetCountry}
          onItemSelection={didSelectedCountryItem}
        />
      </RBSheet>
    );
  };

  const CountryCodeSelectionPopup = () => {
    return (
      <RBSheet
        ref={refRBSheetCountryCode}
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
        height={550}>
        <CountryCodePopupScreen
          RBSheet={refRBSheetCountryCode}
          onItemSelection={didSelectedCountryCodeItem}
        />
      </RBSheet>
    );
  };

  const CityStateSelectionPopup = () => {
    return (
      <RBSheet
        ref={refRBSheetStateCity}
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
        height={550}>
        <StateAndCityPopupScreen
          RBSheet={refRBSheetStateCity}
          stateOrCityList={stateAndCityList}
          onItemSelection={didSelectedStateOrCity}
        />
      </RBSheet>
    );
  };

  const DynamicSelectionPopup = () => {
    return (
      <RBSheet
        ref={refRBSheetDynamicSelection}
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
        height={550}>
        <DynamicSelectionPopupScreen
          RBSheet={refRBSheetDynamicSelection}
          onItemSelection={didSelectedDynamicSelectionItem}
        />
      </RBSheet>
    );
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
        }}>
        <UploadOptions
          RBSheet={refRBSheetUploadOptions}
          onUploadOptionSelection={handleUploadOptionSelection}
        />
      </RBSheet>
    );
  };

  const AlertConfirmPopup = () => {
    return (
      <RBSheet
        ref={refRBSheetAlertConfirm}
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
        height={320}>
        <AlertConfirmPopupScreen
          RBSheet={refRBSheetAlertConfirm}
          didSelectNo={alertConfirmPopupSelectedNo}
          didSelectYes={alertConfirmPopupSelectedYes}
        />
      </RBSheet>
    );
  };

  const DatePickerPopup = () => {
    return (
      <DatePicker
        modal
        mode={'date'}
        tintColor={Colors.PRIMARY_COLOR}
        open={isDatePickerOpen}
        date={Globals.SHARED_VALUES.DATE_PICKER_DATE || new Date()}
        maximumDate={
          Globals.SHARED_VALUES.DATE_PICKER_MAX_DATE !== undefined &&
          Globals.SHARED_VALUES.DATE_PICKER_MAX_DATE !== ''
            ? Globals.SHARED_VALUES.DATE_PICKER_MAX_DATE
            : null
        }
        onConfirm={date => {
          setIsDatePickerOpen(false);
          // setDate(date)
          console.log('onConfirmDatePicker: ', date);
          const newArray = [...dynamicInfoWithUserValueList];
          newArray[Globals.SHARED_VALUES.POPUP_ACTIVE_SOURCE_INDEX].userValue =
            moment(date).format('DD/MM/YYYY');
          setDynamicInfoWithUserValueList(newArray);
        }}
        onCancel={() => {
          setIsDatePickerOpen(false);
        }}
      />
    );
  };

  //Final return
  return isLoading ? (
    <View style={{flex: 1}}>
      <LoadingIndicator visible={isLoading} />
    </View>
  ) : (
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
        <StatusBar
          backgroundColor={Colors.BACKGROUND_COLOR}
          barStyle="dark-content"
        />
        <CountrySelectionPopup />
        <CountryCodeSelectionPopup />
        <CityStateSelectionPopup />
        <DynamicSelectionPopup />
        <GetUploadOptions />
        <AlertConfirmPopup />
        <DatePickerPopup />
        <ImageView
          images={fullScreenImages}
          imageIndex={0}
          visible={imageFullScreenVisible}
          onRequestClose={() => setImageFullScreenVisible(false)}
        />

        <View
          style={{
            borderBottomColor: Colors.LINE_SEPARATOR_COLOR,
            borderBottomWidth: 1,
            height: 45,
            width: '100%',
            justifyContent: 'flex-start',
            flexDirection: 'row',
          }}>
          <TouchableOpacity
            style={{width: 20, height: 20, marginLeft: 30, alignSelf: 'center'}}
            onPress={() => backButtonAction()}>
            <Image
              source={Images.BACK_ARROW}
              style={{
                width: 20,
                height: 20,
                resizeMode: 'contain',
                transform: [{scaleX: I18nManager.isRTL ? -1 : 1}],
                tintColor: Colors.PRIMARY_TEXT_COLOR,
              }}
            />
          </TouchableOpacity>
          <Text
            style={{
              fontFamily: Fonts.Gibson_SemiBold,
              marginLeft: 20,
              fontSize: 16,
              color: Colors.PRIMARY_TEXT_COLOR,
              alignSelf: 'center',
            }}>
            {t(Translations.PROFILE_UPDATE)}
          </Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {dynamicInfoWithUserValueList.map((item, index) => {
            // Remove email field if auth type is email
            if (Utilities.isAuthTypeEmail() === true) {
              if (item.key.toUpperCase() === 'email'.toUpperCase()) {
                return null;
              }
            }
            //Types are: Text, Date, Integer, Selection, Text area, File
            if (item?.type?.toUpperCase() === 'Text'.toUpperCase()) {
              //Check for phone number key
              if (
                item?.key?.toUpperCase() === 'phoneNumber'.toUpperCase() ||
                item?.key?.toUpperCase() === 'phoneNo'.toUpperCase() ||
                item?.key?.toUpperCase() === 'phone'.toUpperCase() ||
                item?.key?.toUpperCase() === 'Mobile'.toUpperCase()
              ) {
                return (
                  <View
                    key={index}
                    style={{
                      flexDirection: 'row',
                      marginLeft: 16,
                      marginRight: 16,
                      marginBottom: 0,
                    }}>
                    <View style={{flex: 0.35}}>
                      <TouchableOpacity
                        key={index}
                        style={{justifyContent: 'center'}}
                        onPress={() =>
                          onPressDynamicSelectionInputItemAction(item, index)
                        }>
                        {/* <TextInput
                          multiline={true}
                          numberOfLines={1}
                          editable={false}
                          style={{
                            backgroundColor: Colors.TRANSPARENT,
                            textAlign: I18nManager.isRTL ? 'right' : 'left',
                          }}
                          pointerEvents={'none'}
                          activeUnderlineColor={Colors.PRIMARY_COLOR}
                          label={
                            <Text
                              style={{
                                fontFamily: Fonts.Gibson_Regular,
                                fontSize: 16,
                                color: Colors.TEXT_GREY_COLOR_9B,
                              }}>
                              {'Code'}
                            </Text>
                          }
                          value={countryCode}
                          right={
                            <TextInput.Icon
                              style={{width: 24, height: 24, opacity: 0}}
                              name={'blank'}
                              color={Colors.TEXT_PLACEHOLDER_COLOR}
                            />
                          }
                        />
                        <Image
                          style={{
                            width: 18,
                            height: 18,
                            tintColor: Colors.PRIMARY_COLOR,
                            resizeMode: 'contain',
                            position: 'absolute',
                            right: 8,
                          }}
                          source={Images.DROP_DOWN_ICON}
                        /> */}
                        <DropdownTextInput
                          value={countryCode}
                          placeHolder={'Code'}
                        />
                      </TouchableOpacity>
                    </View>
                    <View style={{flex: 0.65, marginLeft: 8}}>
                      {/* <TextInput
                        multiline={true}
                        numberOfLines={1}
                        style={{
                          backgroundColor: Colors.TRANSPARENT,
                          textAlign: I18nManager.isRTL ? 'right' : 'left',
                        }}
                        activeUnderlineColor={Colors.PRIMARY_COLOR}
                        label={
                          <Text
                            style={{
                              fontFamily: Fonts.Gibson_Regular,
                              fontSize: 16,
                              color: Colors.TEXT_GREY_COLOR_9B,
                            }}>
                            {(item.label || '') +
                              (item.isRequired === true ? '*' : '')}
                          </Text>
                        }
                        placeholder={item.placeHolder || ''}
                        value={item.userValue}
                        blurOnSubmit={false}
                        onChangeText={text =>
                          onChangeDynamicInputText(index, text)
                        }
                        keyboardType={'number-pad'}
                        autoCapitalize={'none'}
                        returnKeyType={'default'}
                      /> */}

                      <TextInput
                        style={{backgroundColor: Colors.TRANSPARENT}}
                        activeUnderlineColor={Colors.PRIMARY_COLOR}
                        label={
                          <Text
                            style={{
                              fontFamily: Fonts.Gibson_Regular,
                              fontSize: 16,
                              color: Colors.TEXT_GREY_COLOR_9B,
                            }}>
                            {(item.label || '') +
                              (item.isRequired === true ? '*' : '')}
                          </Text>
                        }
                        placeholder={item.placeHolder || ''}
                        value={item.userValue}
                        blurOnSubmit={false}
                        onChangeText={text =>
                          onChangeDynamicInputText(index, text)
                        }
                        keyboardType={'number-pad'}
                        autoCapitalize={'none'}
                        returnKeyType={'default'}
                      />
                      <HelperText
                        type="error"
                        visible={(item?.userErrorText?.length || 0) > 0}>
                        {item.userErrorText}
                      </HelperText>
                    </View>
                  </View>
                );
              } else {
                return (
                  <View
                    key={index}
                    style={{marginLeft: 16, marginRight: 16, marginBottom: 0}}>
                    <TextInput
                      multiline={true}
                      numberOfLines={1}
                      style={{
                        backgroundColor: Colors.TRANSPARENT,
                        textAlign: I18nManager.isRTL ? 'right' : 'left',
                      }}
                      activeUnderlineColor={Colors.PRIMARY_COLOR}
                      label={
                         <Text
                          style={{
                            fontFamily: Fonts.Gibson_Regular,
                            fontSize: 16,
                            color: Colors.TEXT_GREY_COLOR_9B,
                          }}>
                          {(item.label || '') +
                            (item.isRequired === true ? '*' : '')}
                        </Text>
                      }
                      placeholder={item.placeHolder || ''}
                      value={item.userValue}
                      blurOnSubmit={false}
                      onChangeText={text =>
                        onChangeDynamicInputText(index, text)
                      }
                      keyboardType={
                        item?.key?.toUpperCase().includes('EMAIL')
                          ? 'email-address'
                          : 'default'
                      }
                      autoCapitalize={'none'}
                      returnKeyType={'default'}
                    />
                    <HelperText
                      type="error"
                      visible={(item?.userErrorText?.length || 0) > 0}>
                      {item.userErrorText}
                    </HelperText>
                  </View>
                );
              }
            } else if (
              item?.type?.toUpperCase() === 'Text area'.toUpperCase()
            ) {
              return (
                <View
                  key={index}
                  style={{marginLeft: 16, marginRight: 16, marginBottom: 0}}>
                  <TextInput
                    style={{
                      backgroundColor: Colors.TRANSPARENT,
                      textAlign: I18nManager.isRTL ? 'right' : 'left',
                    }}
                    activeUnderlineColor={Colors.PRIMARY_COLOR}
                    label={
                      <Text
                        style={{
                          backgroundColor: Colors.TRANSPARENT,
                          fontFamily: Fonts.Gibson_Regular,
                          fontSize: 16,
                          color: Colors.TEXT_GREY_COLOR_9B,
                        }}>
                        {(item.label || '') +
                          (item.isRequired === true ? '*' : '')}
                      </Text>
                    }
                    placeholder={item.placeHolder || ''}
                    value={item.userValue}
                    blurOnSubmit={false}
                    onChangeText={text => onChangeDynamicInputText(index, text)}
                    keyboardType={'default'}
                    autoCapitalize={'none'}
                    returnKeyType={'default'}
                    multiline
                  />
                  <HelperText
                    type="error"
                    visible={(item?.userErrorText?.length || 0) > 0}>
                    {item.userErrorText}
                  </HelperText>
                </View>
              );
            } else if (item?.type?.toUpperCase() === 'Date'.toUpperCase()) {
              return (
                <TouchableOpacity
                  key={index}
                  style={{
                    marginLeft: 16,
                    marginRight: 16,
                    marginBottom: 0,
                    justifyContent: 'center',
                  }}
                  onPress={() =>
                    onPressDateSelectionInputItemAction(item, index)
                  }>
                  {/* <TextInput
                    multiline={true}
                    numberOfLines={1}
                    editable={false}
                    style={{
                      backgroundColor: Colors.TRANSPARENT,
                      textAlign: I18nManager.isRTL ? 'right' : 'left',
                    }}
                    pointerEvents={'none'}
                    activeUnderlineColor={Colors.PRIMARY_COLOR}
                    label={
                      <Text
                        style={{
                          fontFamily: Fonts.Gibson_Regular,
                          fontSize: 16,
                          color: Colors.TEXT_GREY_COLOR_9B,
                        }}>
                        {(item.label || '') +
                          (item.isRequired === true ? '*' : '')}
                      </Text>
                    }
                    placeholder={item.placeHolder || ''}
                    value={item.userValue}
                    right={
                      <TextInput.Icon
                        style={{width: 24, height: 24, opacity: 0}}
                        name={'blank'}
                        color={Colors.TEXT_PLACEHOLDER_COLOR}
                      />
                    }
                  /> */}
                  <TextInput
                    editable={false}
                    style={{backgroundColor: Colors.TRANSPARENT}}
                    pointerEvents={'none'}
                    activeUnderlineColor={Colors.PRIMARY_COLOR}
                    label={
                      <Text
                        style={{
                          fontFamily: Fonts.Gibson_Regular,
                          fontSize: 16,
                          color: Colors.TEXT_GREY_COLOR_9B,
                        }}>
                        {(item.label || '') +
                          (item.isRequired === true ? '*' : '')}
                      </Text>
                    }
                    placeholder={item.placeHolder || ''}
                    value={item.userValue}
                  />
                  <HelperText
                    type="error"
                    visible={(item?.userErrorText?.length || 0) > 0}>
                    {item.userErrorText}
                  </HelperText>
                  <Image
                    style={{
                      width: 15,
                      height: 15,
                      tintColor: Colors.PRIMARY_COLOR,
                      resizeMode: 'contain',
                      position: 'absolute',
                      right: 20,
                      top: 20,
                    }}
                    source={Images.CALENDAR_ICON}
                  />
                </TouchableOpacity>
              );
            } else if (
              item?.type?.toUpperCase() === 'Selection'.toUpperCase()
            ) {
              //Save city and state index
              if (item?.key?.toUpperCase() === 'state'.toUpperCase()) {
                stateInputIndex = index;
              } else if (item?.key?.toUpperCase() === 'city'.toUpperCase()) {
                cityInputIndex = index;
              }
              return (
                <TouchableOpacity
                  key={index}
                  style={{
                    marginLeft: 16,
                    marginRight: 16,
                    marginBottom: 0,
                    justifyContent: 'center',
                  }}
                  onPress={() =>
                    onPressDynamicSelectionInputItemAction(item, index)
                  }>
                  {/* <TextInput
                    multiline={true}
                    numberOfLines={1}
                    editable={false}
                    style={{
                      backgroundColor: Colors.TRANSPARENT,
                      textAlign: I18nManager.isRTL ? 'right' : 'left',
                    }}
                    pointerEvents={'none'}
                    activeUnderlineColor={Colors.PRIMARY_COLOR}
                    label={
                      <Text
                        style={{
                          fontFamily: Fonts.Gibson_Regular,
                          fontSize: 16,
                          color: Colors.TEXT_GREY_COLOR_9B,
                        }}>
                        {(item.label || '') +
                          (item.isRequired === true ? '*' : '')}
                      </Text>
                    }
                    placeholder={item.placeHolder || ''}
                    value={item.userValue}
                    right={
                      <TextInput.Icon
                        style={{width: 24, height: 24, opacity: 0}}
                        name={'blank'}
                        color={Colors.TEXT_PLACEHOLDER_COLOR}
                      />
                    }
                  /> */}
                  <DropdownTextInput
                    value={item.userValue}
                    placeholder={
                      (item.label || '') + (item.isRequired === true ? '*' : '')
                    }
                  />
                  <HelperText
                    type="error"
                    visible={(item?.userErrorText?.length || 0) > 0}>
                    {item.userErrorText}
                  </HelperText>
                </TouchableOpacity>
              );
            } else if (item?.type?.toUpperCase() === 'Integer'.toUpperCase()) {
              //Check for phone number key
              if (
                item?.key?.toUpperCase() === 'phoneNumber'.toUpperCase() ||
                item?.key?.toUpperCase() === 'phoneNo'.toUpperCase() ||
                item?.key?.toUpperCase() === 'phone'.toUpperCase() ||
                item?.key?.toUpperCase() === 'Mobile'.toUpperCase()
              ) {
                return (
                  <View
                    key={index}
                    style={{
                      flexDirection: 'row',
                      marginLeft: 16,
                      marginRight: 16,
                      marginBottom: 0,
                    }}>
                    <View style={{flex: 0.35}}>
                      <TouchableOpacity
                        key={index}
                        style={{justifyContent: 'center'}}
                        onPress={() =>
                          onPressDynamicSelectionInputItemAction(item, index)
                        }>
                        {/* <TextInput
                          multiline={true}
                          numberOfLines={1}
                          editable={false}
                          style={{
                            backgroundColor: Colors.TRANSPARENT,
                            textAlign: I18nManager.isRTL ? 'right' : 'left',
                          }}
                          pointerEvents={'none'}
                          activeUnderlineColor={Colors.PRIMARY_COLOR}
                          label={
                            <Text
                              style={{
                                fontFamily: Fonts.Gibson_Regular,
                                fontSize: 16,
                                color: Colors.TEXT_GREY_COLOR_9B,
                              }}>
                              {'Code'}
                            </Text>
                          }
                          value={countryCode}
                          right={
                            <TextInput.Icon
                              style={{width: 24, height: 24, opacity: 0}}
                              name={'blank'}
                              color={Colors.TEXT_PLACEHOLDER_COLOR}
                            />
                          }
                        /> */}
                        {/* <Image
                          style={{
                            width: 18,
                            height: 18,
                            tintColor: Colors.PRIMARY_COLOR,
                            resizeMode: 'contain',
                            position: 'absolute',
                            right: 8,
                          }}
                          source={Images.DROP_DOWN_ICON}
                        /> */}

                        <DropdownTextInput
                          value={countryCode}
                          placeholder={'Code'}
                        />
                      </TouchableOpacity>
                    </View>
                    <View style={{flex: 0.65, marginLeft: 8}}>
                      <TextInput
                        multiline={true}
                        numberOfLines={1}
                        style={{
                          backgroundColor: Colors.TRANSPARENT,
                          textAlign: I18nManager.isRTL ? 'right' : 'left',
                        }}
                        activeUnderlineColor={Colors.PRIMARY_COLOR}
                        label={
                          <Text
                            style={{
                              fontFamily: Fonts.Gibson_Regular,
                              fontSize: 16,
                              color: Colors.TEXT_GREY_COLOR_9B,
                            }}>
                            {(item.label || '') +
                              (item.isRequired === true ? '*' : '')}
                          </Text>
                        }
                        placeholder={item.placeHolder || ''}
                        value={item.userValue}
                        blurOnSubmit={false}
                        onChangeText={text =>
                          onChangeDynamicInputText(index, text)
                        }
                        keyboardType={'number-pad'}
                        autoCapitalize={'none'}
                        returnKeyType={'default'}
                      />
                      <HelperText
                        type="error"
                        visible={(item?.userErrorText?.length || 0) > 0}>
                        {item.userErrorText}
                      </HelperText>
                    </View>
                  </View>
                );
              } else {
                return (
                  <View
                    key={index}
                    style={{marginLeft: 16, marginRight: 16, marginBottom: 0}}>
                    <TextInput
                      multiline={true}
                      numberOfLines={1}
                      style={{
                        backgroundColor: Colors.TRANSPARENT,
                        textAlign: I18nManager.isRTL ? 'right' : 'left',
                      }}
                      activeUnderlineColor={Colors.PRIMARY_COLOR}
                      label={
                        <Text
                          style={{
                            fontFamily: Fonts.Gibson_Regular,
                            fontSize: 16,
                            color: Colors.TEXT_GREY_COLOR_9B,
                          }}>
                          {(item.label || '') +
                            (item.isRequired === true ? '*' : '')}
                        </Text>
                      }
                      placeholder={item.placeHolder || ''}
                      value={item.userValue}
                      blurOnSubmit={false}
                      onChangeText={text =>
                        onChangeDynamicInputText(index, text)
                      }
                      keyboardType={'decimal-pad'}
                      autoCapitalize={'none'}
                      returnKeyType={'default'}
                    />
                    <HelperText
                      type="error"
                      visible={(item?.userErrorText?.length || 0) > 0}>
                      {item.userErrorText}
                    </HelperText>
                  </View>
                );
              }
            } else if (item.type?.toUpperCase() === 'File'.toUpperCase()) {
              return (
                <View
                  key={index}
                  style={{marginLeft: 25, marginRight: 0, marginBottom: 8}}>
                  <Text
                    style={{
                      fontFamily: Fonts.Gibson_Regular,
                      fontSize: 16,
                      color: Colors.TEXT_GREY_COLOR_9B,
                      marginRight: 16,
                      marginBottom: 8,
                    }}>
                    {(item.label || '') + (item.isRequired === true ? '*' : '')}
                  </Text>

                  <ScrollView horizontal>
                    {item.userValue.map((subItem, subIndex) => {
                      if (subItem.type !== undefined) {
                        if (subItem.type === 'Add') {
                          return (
                            <TouchableOpacity
                              key={subIndex}
                              onPress={() =>
                                onPressFileAttachmentAddAction(item, index)
                              }
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
                              <View
                                style={{
                                  width: 50,
                                  height: 50,
                                  justifyContent: 'center',
                                  borderRadius: 50 / 2,
                                  borderWidth: 1,
                                  borderColor: Colors.SECONDARY_COLOR,
                                }}>
                                <Image
                                  style={{
                                    width: 20,
                                    height: 20,
                                    borderRadius: 20 / 2,
                                    alignSelf: 'center',
                                    tintColor: Colors.SECONDARY_COLOR,
                                  }}
                                  source={Images.PLUS_FILL_ROUND_ICON}
                                  resizeMode={FastImage.resizeMode.contain}
                                />
                              </View>
                            </TouchableOpacity>
                          );
                        } else if (subItem.type === 'Local') {
                          let localItemURL = subItem.url || '';
                          let fileType =
                            Utilities.getFileExtension(localItemURL);
                          if (fileType === 'pdf') {
                            return (
                              <View key={subIndex}>
                                <TouchableOpacity
                                  onPress={() =>
                                    filePreviewButtonAction(localItemURL, true)
                                  }
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
                                    source={{uri: localItemURL, cache: true}}
                                    pointerEvents={'none'}
                                    onLoadComplete={(
                                      numberOfPages,
                                      filePath,
                                    ) => {
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
                                      borderColor:
                                        Colors.TEXT_PLACEHOLDER_COLOR,
                                    }}
                                    renderActivityIndicator={progress => {
                                      //console.log(progress);
                                      return (
                                        <ActivityIndicator
                                          color={Colors.PRIMARY_COLOR}
                                        />
                                      );
                                    }}
                                    singlePage
                                  />
                                </TouchableOpacity>
                                <TouchableOpacity
                                  onPress={() =>
                                    onPressFileAttachmentDeleteAction(
                                      item,
                                      index,
                                      subIndex,
                                    )
                                  }
                                  style={{
                                    position: 'absolute',
                                    right: 14,
                                    top: 1,
                                    justifyContent: 'center',
                                    width: 24,
                                    height: 24,
                                    borderRadius: 24 / 2,
                                    backgroundColor: Colors.WHITE_COLOR,
                                  }}>
                                  <Image
                                    style={{
                                      width: 15,
                                      height: 15,
                                      resizeMode: 'cover',
                                      tintColor: Colors.PRIMARY_TEXT_COLOR,
                                      alignSelf: 'center',
                                    }}
                                    source={Images.CLOSE_ICON}
                                  />
                                </TouchableOpacity>
                              </View>
                            );
                          } else if (
                            fileType === 'doc' ||
                            fileType === 'docx'
                          ) {
                            return (
                              <View key={subIndex}>
                                <TouchableOpacity
                                  onPress={() =>
                                    filePreviewButtonAction(localItemURL, true)
                                  }
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
                                      borderColor:
                                        Colors.TEXT_PLACEHOLDER_COLOR,
                                    }}
                                    source={Images.WORD_FILE_ICON}
                                    resizeMode={FastImage.resizeMode.contain}
                                  />
                                </TouchableOpacity>
                                <TouchableOpacity
                                  onPress={() =>
                                    onPressFileAttachmentDeleteAction(
                                      item,
                                      index,
                                      subIndex,
                                    )
                                  }
                                  style={{
                                    position: 'absolute',
                                    right: 14,
                                    top: 1,
                                    justifyContent: 'center',
                                    width: 24,
                                    height: 24,
                                    borderRadius: 24 / 2,
                                    backgroundColor: Colors.WHITE_COLOR,
                                  }}>
                                  <Image
                                    style={{
                                      width: 15,
                                      height: 15,
                                      resizeMode: 'cover',
                                      tintColor: Colors.PRIMARY_TEXT_COLOR,
                                      alignSelf: 'center',
                                    }}
                                    source={Images.CLOSE_ICON}
                                  />
                                </TouchableOpacity>
                              </View>
                            );
                          } else {
                            return (
                              <View key={subIndex}>
                                <TouchableOpacity
                                  onPress={() =>
                                    imageFullscreenButtonAction(localItemURL)
                                  }
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
                                      borderColor:
                                        Colors.TEXT_PLACEHOLDER_COLOR,
                                    }}
                                    source={{
                                      uri: localItemURL,
                                      priority: FastImage.priority.normal,
                                    }}
                                    resizeMode={FastImage.resizeMode.cover}
                                  />
                                </TouchableOpacity>
                                <TouchableOpacity
                                  onPress={() =>
                                    onPressFileAttachmentDeleteAction(
                                      item,
                                      index,
                                      subIndex,
                                    )
                                  }
                                  style={{
                                    position: 'absolute',
                                    right: 14,
                                    top: 1,
                                    justifyContent: 'center',
                                    width: 24,
                                    height: 24,
                                    borderRadius: 24 / 2,
                                    backgroundColor: Colors.WHITE_COLOR,
                                  }}>
                                  <Image
                                    style={{
                                      width: 15,
                                      height: 15,
                                      resizeMode: 'cover',
                                      tintColor: Colors.PRIMARY_TEXT_COLOR,
                                      alignSelf: 'center',
                                    }}
                                    source={Images.CLOSE_ICON}
                                  />
                                </TouchableOpacity>
                              </View>
                            );
                          }
                        } else {
                          let existingItemURL = subItem.url || '';
                          let fileType =
                            Utilities.getFileExtension(existingItemURL);
                          if (fileType === 'pdf') {
                            return (
                              <View key={subIndex}>
                                <TouchableOpacity
                                  onPress={() =>
                                    filePreviewButtonAction(
                                      existingItemURL,
                                      false,
                                    )
                                  }
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
                                    source={{uri: existingItemURL, cache: true}}
                                    pointerEvents={'none'}
                                    onLoadComplete={(
                                      numberOfPages,
                                      filePath,
                                    ) => {
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
                                      borderColor:
                                        Colors.TEXT_PLACEHOLDER_COLOR,
                                    }}
                                    renderActivityIndicator={progress => {
                                      //console.log(progress);
                                      return (
                                        <ActivityIndicator
                                          color={Colors.PRIMARY_COLOR}
                                        />
                                      );
                                    }}
                                    singlePage
                                  />
                                </TouchableOpacity>
                                <TouchableOpacity
                                  onPress={() =>
                                    onPressFileAttachmentDeleteAction(
                                      item,
                                      index,
                                      subIndex,
                                    )
                                  }
                                  style={{
                                    position: 'absolute',
                                    right: 14,
                                    top: 1,
                                    justifyContent: 'center',
                                    width: 24,
                                    height: 24,
                                    borderRadius: 24 / 2,
                                    backgroundColor: Colors.WHITE_COLOR,
                                  }}>
                                  <Image
                                    style={{
                                      width: 15,
                                      height: 15,
                                      resizeMode: 'cover',
                                      tintColor: Colors.PRIMARY_TEXT_COLOR,
                                      alignSelf: 'center',
                                    }}
                                    source={Images.CLOSE_ICON}
                                  />
                                </TouchableOpacity>
                              </View>
                            );
                          } else if (
                            fileType === 'doc' ||
                            fileType === 'docx'
                          ) {
                            return (
                              <View key={subIndex}>
                                <TouchableOpacity
                                  onPress={() =>
                                    filePreviewButtonAction(
                                      existingItemURL,
                                      false,
                                    )
                                  }
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
                                      borderColor:
                                        Colors.TEXT_PLACEHOLDER_COLOR,
                                    }}
                                    source={Images.WORD_FILE_ICON}
                                    resizeMode={FastImage.resizeMode.contain}
                                  />
                                </TouchableOpacity>
                                <TouchableOpacity
                                  onPress={() =>
                                    onPressFileAttachmentDeleteAction(
                                      item,
                                      index,
                                      subIndex,
                                    )
                                  }
                                  style={{
                                    position: 'absolute',
                                    right: 14,
                                    top: 1,
                                    justifyContent: 'center',
                                    width: 24,
                                    height: 24,
                                    borderRadius: 24 / 2,
                                    backgroundColor: Colors.WHITE_COLOR,
                                  }}>
                                  <Image
                                    style={{
                                      width: 15,
                                      height: 15,
                                      resizeMode: 'cover',
                                      tintColor: Colors.PRIMARY_TEXT_COLOR,
                                      alignSelf: 'center',
                                    }}
                                    source={Images.CLOSE_ICON}
                                  />
                                </TouchableOpacity>
                              </View>
                            );
                          } else {
                            return (
                              <View key={subIndex}>
                                <TouchableOpacity
                                  onPress={() =>
                                    imageFullscreenButtonAction(existingItemURL)
                                  }
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
                                      borderColor:
                                        Colors.TEXT_PLACEHOLDER_COLOR,
                                    }}
                                    source={{
                                      uri: existingItemURL,
                                      priority: FastImage.priority.normal,
                                    }}
                                    resizeMode={FastImage.resizeMode.cover}
                                  />
                                </TouchableOpacity>
                                <TouchableOpacity
                                  onPress={() =>
                                    onPressFileAttachmentDeleteAction(
                                      item,
                                      index,
                                      subIndex,
                                    )
                                  }
                                  style={{
                                    position: 'absolute',
                                    right: 14,
                                    top: 1,
                                    justifyContent: 'center',
                                    width: 24,
                                    height: 24,
                                    borderRadius: 24 / 2,
                                    backgroundColor: Colors.WHITE_COLOR,
                                  }}>
                                  <Image
                                    style={{
                                      width: 15,
                                      height: 15,
                                      resizeMode: 'cover',
                                      tintColor: Colors.PRIMARY_TEXT_COLOR,
                                      alignSelf: 'center',
                                    }}
                                    source={Images.CLOSE_ICON}
                                  />
                                </TouchableOpacity>
                              </View>
                            );
                          }
                        }
                      } else {
                        return null;
                      }
                    })}
                  </ScrollView>
                  <HelperText
                    type="error"
                    visible={(item?.userErrorText?.length || 0) > 0}>
                    {item.userErrorText}
                  </HelperText>
                </View>
              );
            }
          })}

          {!hideButton && dynamicInfoWithUserValueList.length > 0 ? (
            <TouchableOpacity
              style={{
                marginTop: 20,
                marginBottom: 20,
                backgroundColor: Colors.SECONDARY_COLOR,
                height: 50,
                marginLeft: 30,
                marginRight: 30,
                justifyContent: 'center',
              }}
              onPress={() => updateButtonAction()}>
              <Text
                style={{
                  color: Colors.WHITE_COLOR,
                  fontSize: 18,
                  fontFamily: Fonts.Gibson_SemiBold,
                  alignSelf: 'center',
                }}>
                {t(Translations.UPDATE)}
              </Text>
            </TouchableOpacity>
          ) : null}
        </ScrollView>
      </View>

      <AwesomeAlert
        show={showChangeAlert}
        showProgress={false}
        title={t(Translations.UPDATE_PROFILE)}
        message={t(Translations.PROFILE_CHANGE_ALERT_MESSAGE)}
        titleStyle={{
          color: Colors.BLACK_COLOR,
          fontFamily: Fonts.Gibson_Regular,
        }}
        closeOnTouchOutside={false}
        closeOnHardwareBackPress={false}
        showCancelButton={true}
        showConfirmButton={true}
        animatedValue={0.8}
        cancelText={t(Translations.DISCARD)}
        confirmText={t(Translations.SAVE)}
        confirmButtonColor={Colors.PRIMARY_COLOR}
        cancelButtonColor={Colors.SECONDARY_COLOR}
        onCancelPressed={() => {
          setShowChangeAlert(false);
          navigation.goBack();
        }}
        onConfirmPressed={() => {
           setShowChangeAlert(false);
          updateButtonAction();

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
export default UpdateProfileScreen;
