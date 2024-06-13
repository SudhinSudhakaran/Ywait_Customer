import Toast from 'react-native-toast-message';
import { Platform } from 'react-native';
import KeyboardManager from 'react-native-keyboard-manager';
import { Globals,Translations } from '../../constants';
import moment from 'moment';
import { decode } from 'html-entities';
import {
  AccessModules,
  AccessPermissions,
  AddVitalType,
  PaymentGateway,
} from '../../helpers/enums/Enums';

import { AppStorage } from '../storageManager/AppStorage';
import { t } from 'i18next';
import { useNetInfo } from '@react-native-community/netinfo';
export default class Utilities {
  static showToast(
    message,
    subMessage = '',
    type = 'error',
    position = 'bottom',
  ) {
    Toast.show({
      type: type, //'success | error | info '
      text1: message,
      text2: subMessage,
      position: position,
      topOffset: 60,
      bottomOffset: 100,
      visibilityTime: 3000,
      // text1Style: {marginLeft: 30, marginRight:30},
    });
  }
  static checkSelectedDateIsHoliday(_selectedDate) {
    console.log(
      'utils =====> selecetd date ',
      moment(_selectedDate)
        .utcOffset(Globals.BUSINESS_DETAILS.timeZone.offset)
        .format(''),
    );
    console.log('Time zone', Globals.BUSINESS_DETAILS.timeZone);
    const selectedDate = moment(_selectedDate)
      .utcOffset(Globals.BUSINESS_DETAILS.timeZone.offset)
      .format('');
    let isHoliday = false;
    Globals.BUSINESS_DETAILS.holidayList.forEach(holiday => {
      if (holiday.holidayType === 'day'|| holiday.holidayType === 'interval' && _selectedDate) {
        console.log('Holiday', holiday);

        const dateFrom = this.convertorTimeToBusinessTimeZone(
          moment(holiday.dateFrom),
        ).toISOString();
        const dateTo = this.convertorTimeToBusinessTimeZone(
          moment(holiday.dateTo),
        ).toISOString();
        console.log('dateFrom-----', dateFrom);
        console.log('dateTo-----', dateTo);
        console.log('selected date-----', selectedDate);
   
        if (
          moment(selectedDate).isBetween(dateFrom, dateTo) ||
          moment(selectedDate).isSame(dateFrom) ||
          moment(selectedDate).isSame(dateTo)
        ) {
          isHoliday = true;
        } else {
          // console.log('not between');
        }
      }
    });

    return isHoliday;
  }
  //https://stackoverflow.com/a/60749098/10476608
  static getQueryString = queryParams => {
    return Object.keys(queryParams)
      .reduce((result, key) => {
        return [
          ...result,
          `${encodeURIComponent(key)}=${encodeURIComponent(queryParams[key])}`,
        ];
      }, [])
      .join('&');
  };

  //enable or disable keyboard manager
  static changeKeyboardManager(status = false) {
    if (Platform.OS === 'ios') {
      KeyboardManager.setEnable(status);
    }
  }

  /*
        Get file extension from filename
        * Created/Modified By: Jenson John
        * Created/Modified Date: 05 Jan 2022
        Link: //https://stackoverflow.com/a/190878/10476608
    */
  static getFileExtension(filename) {
    try {
      if (filename !== undefined && filename !== null) {
        return filename.split('.').pop();
      } else {
        return '';
      }
    } catch (e) {
      console.log('getFileExtension: ', e);
      return '';
    }
  }

  static getFileName(url) {
    const lastInd = url.lastIndexOf('/');
    const strLen = url.length;
    const fileName = url.slice(lastInd + 1, strLen + 1);
    return fileName;
  }

  static getShortFilename(filename) {
    let ext = filename.split('.').pop();
    var newFilename = filename.replace('.' + ext, '');
    if (newFilename.length <= 20) {
      return filename;
    }
    newFilename =
      newFilename.substr(0, 20) + (filename.length > 20 ? '[...]' : '');
    return newFilename + '.' + ext;
  }
  //convert seconds to hour,minutes,seconds
  static convertHMS(seconds) {
    const sec = parseInt(seconds, 10);

    let h = Math.floor(sec / 3600); // get hours
    let m = Math.floor((sec % 3600) / 60); // get minutes
    let s = Math.floor((sec % 3600) % 60); //  get seconds

    let h_string = h < 10 ? '0' + h : h;
    let m_string = m < 10 ? '0' + m : m;
    let s_string = s < 10 ? '0' + s : s;

    if (h_string !== '00') {
      if (m_string !== '00') {
        if (s_string !== '00') {
          return h_string + ' hr ' + m_string + ' min ' + s_string + ' sec';
        }
        return h_string + ' hr ' + m_string + ' min';
      }
      return h_string + ' hr';
    } else if (m_string !== '00') {
      if (s_string !== '00') {
        return m_string + ' min ' + s_string + ' sec';
      }
      return m_string + ' min';
    } else {
      return s_string + ' sec';
    }
  }

  //convert seconds to hour,minutes,seconds
  static convertSecondsToMins(seconds) {
    let m = Math.floor(seconds / 60);
    return m;
  }
  //Validations
  static isEmailValid(email) {
    const reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return reg.test(email) === true;
  }

  /*
        Check text contains any digit
        * Created/Modified By: Jenson John
        * Created/Modified Date: 12 Jan 2022
        Link: https://stackoverflow.com/a/58407230/10476608
    */
  static isContainsDigit(text) {
    if (text.match(/\d/)) {
      //Digit Found
      return true;
    } else {
      return false;
    }
  }

  /*
       Check text contains only decimals
       * Created/Modified By: Jenson John
       * Created/Modified Date: 12 Jan 2022
       Link: https://www.codegrepper.com/code-examples/javascript/javascript+check+if+string+contains+only+numbers+and+decimal
   */
  static isHavingOnlyNumbers(num) {
    if (num.match(/^-?\d+$/)) {
      //valid integer (positive or negative)
      return true;
    } else if (num.match(/^\d+\.\d+$/)) {
      //valid float
      return true;
    } else {
      //not valid number
      return false;
    }
  }

  //Business details based checks
  static isAllowNonConsultantLogin() {
    if (
      Globals.BUSINESS_DETAILS?._id !== undefined &&
      Globals.BUSINESS_DETAILS?._id !== null
    ) {
      if (Globals.BUSINESS_DETAILS?.allowNonConsultantLogin === true) {
        return true;
      } else {
        return false;
      }
    }
    return false;
  }

  //Business details based checks
  static isOMHBuild() {
    if (
      Globals.BUSINESS_DETAILS?._id !== undefined &&
      Globals.BUSINESS_DETAILS?._id !== null
    ) {
      if (
        Globals.BUSINESS_DETAILS?._id === '603df1e23b1f0e6c90227492' ||
        Globals.BUSINESS_DETAILS?._id === '6028177c39b9620731de5ee5'
      ) {
        return true;
      } else {
        return false;
      }
    }
    return false;
  }

  //Check user is Consultant or Non-consultant
  static isUserIsConsultant() {
    if (
      Globals.USER_DETAILS?._id !== undefined &&
      Globals.USER_DETAILS?._id !== null
    ) {
      if (Globals.USER_DETAILS?.role_id.canServe === true) {
        return true;
      } else {
        return false;
      }
    }
    return false;
  }

  //Check user is Consultant or Non-consultant
  static isUserIsAdmin() {
    if (
      Globals.USER_DETAILS?._id !== undefined &&
      Globals.USER_DETAILS?._id !== null
    ) {
      if (Globals.USER_DETAILS?.role_id.isAdmin === true) {
        return true;
      } else {
        return false;
      }
    }
    return false;
  }

  //Check auth type is email
  static isAuthTypeEmail() {
    if (
      Globals.BUSINESS_DETAILS?._id !== undefined &&
      Globals.BUSINESS_DETAILS?._id !== null
    ) {
      if (Globals.BUSINESS_DETAILS?.authenticationType?.includes('email')) {
        return true;
      } else {
        return false;
      }
    }
    return false;
  }

  //Check auth type is OTP
  static isAuthTypeOTP() {
    if (
      Globals.BUSINESS_DETAILS?._id !== undefined &&
      Globals.BUSINESS_DETAILS?._id !== null
    ) {
      if (Globals.BUSINESS_DETAILS?.authenticationType?.includes('otp')) {
        return true;
      } else {
        return false;
      }
    }
    return false;
  }

  //Check PIN auth enabled for business
  static isBusinessPINAuthEnabled() {
    if (
      Globals.BUSINESS_DETAILS?._id !== undefined &&
      Globals.BUSINESS_DETAILS?._id !== null
    ) {
      if (Globals.BUSINESS_DETAILS?.enablePinAuthentication === true) {
        return true;
      }
    }
    return false;
  }

  //Check PIN auth enabled
  static isPINAuthEnabled() {
    if (Globals.IS_AUTHORIZED === true) {
      if (
        Globals.BUSINESS_DETAILS?.enablePinAuthentication === true &&
        Globals.USER_DETAILS?.enablePinAuthentication === true &&
        Globals.USER_DETAILS?.pinGenerated === true
      ) {
        return true;
      }
    }
    return false;
  }

  static isBusiness24HrTimeFormat() {
    if (
      Globals.BUSINESS_DETAILS?._id !== undefined &&
      Globals.BUSINESS_DETAILS?._id !== null
    ) {
      if (Globals.BUSINESS_DETAILS?.timeFormat === '24') {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  // Get utc to local

  static getUtcToLocalWithFormat(utcDate, format) {
    let gmtDateTime = moment(utcDate);
    let local = gmtDateTime
      .utcOffset(Globals.BUSINESS_DETAILS.timeZone.offset || '+05:30')
      .format(format);
    return local;
  }
  /*
           Get utc to local
           * Created/Modified By: Vijin Raj
           * Created/Modified Date: 10 Aug 2021
           Link: //https://stackoverflow.com/questions/33321495/how-to-convert-from-utc-to-local-time-in-moment-js
       */
  static getUtcToLocalWithFormatANdNoTimezone(utcDate, format) {
    let gmtDateTime = moment(utcDate);
    let local = gmtDateTime.local().format(format);
    return local;
  }

  //get placeholder image with letter of name

  // static generateHolderImageByName(name1,name2){
  //   return  https://ui-avatars.com/api/?name=name1+name2;

  // }

  static getBusinessTimeZoneOffset(isGMTNeeded = true) {
    var offset = '+05:30';
    if (
      Globals.BUSINESS_DETAILS?.timeZone?.offset !== undefined &&
      Globals.BUSINESS_DETAILS?.timeZone?.offset !== null &&
      Globals.BUSINESS_DETAILS?.timeZone?.offset?.trim().length > 0
    ) {
      let timezoneOffset = Globals.BUSINESS_DETAILS.timeZone.offset;
      offset = timezoneOffset;
    }
    return (isGMTNeeded === true ? 'GMT' : '') + offset;
  }

  // function to convert the time to timezone
  static convertorTimeToBusinessTimeZone(utcString: any) {
    const timezone = Globals.BUSINESS_DETAILS.timeZone.offset;
    return sharedConvertorTimeToBusinessTimeZone(utcString, timezone);
  }

  // function to append the timezone to api
  static appendBusinessTimeZoneToDate(date: any) {
    const timezone = Globals.BUSINESS_DETAILS.timeZone.offset;
    //this.businessService.getBusinessDetails().timeZone;
    return sharedAppendBusinessTimeZoneToDate(date, timezone);
  }
  static   BusinessDate(date: any) {
    const timezone = Globals.BUSINESS_DETAILS.timeZone.offset;
    //this.businessService.getBusinessDetails().timeZone;
    return sharedDate(date, timezone);
  }
  //Get specialist name
  static getSpecialistName() {
    if (
      Globals.BUSINESS_DETAILS?._id !== undefined &&
      Globals.BUSINESS_DETAILS?._id !== null
    ) {
      return Globals.BUSINESS_DETAILS?.specialistName || t(Translations.SPECIALIST);
    }
    return t(Translations.SPECIALIST);
  }

  //get patient info of business
  static getPatientInfo() {
    if (
      Globals.BUSINESS_DETAILS?._id !== undefined &&
      Globals.BUSINESS_DETAILS?._id !== null
    ) {
      let patientInfo = Globals.BUSINESS_DETAILS?.patientInfo;
      return patientInfo;
    }
  }
  //get gender option from patient info
  static getGenderOptions() {
    let patientInfos = this.getPatientInfo();
    if (patientInfos.length > 0) {
      let index = patientInfos?.findIndex(x => x.key === 'gender');
      return patientInfos[index]?.value;
    }
    return [];
  }

  //is single consultant business
  static isSingleConsultantBusiness() {
    if (
      Globals.BUSINESS_DETAILS?._id !== undefined &&
      Globals.BUSINESS_DETAILS?._id !== null
    ) {
      if (
        Globals.BUSINESS_DETAILS?.businessType === 'single-consultant' ||
        Globals.BUSINESS_DETAILS?.businessType ===
          'multiple-service-single-consultant'
      ) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  //is service based business
  static isServiceBasedBusiness() {
    if (
      Globals.BUSINESS_DETAILS?._id !== undefined &&
      Globals.BUSINESS_DETAILS?._id !== null
    ) {
      if (
        Globals.BUSINESS_DETAILS?.businessType ===
          'multiple-service-multiple-consultant' ||
        Globals.BUSINESS_DETAILS?.businessType ===
          'multiple-service-single-consultant'
      ) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  //is gender specific booking enabled
  static isGenderSpecificBooking() {
    if (
      Globals.BUSINESS_DETAILS?._id !== undefined &&
      Globals.BUSINESS_DETAILS?._id !== null
    ) {
      if (Globals.BUSINESS_DETAILS?.allowGenderSpecficBooking === true) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  //is billing enabled
  static isBillingEnabled() {
    if (
      Globals.BUSINESS_DETAILS?._id !== undefined &&
      Globals.BUSINESS_DETAILS?._id !== null
    ) {
      if (Globals.BUSINESS_DETAILS?.enablePricing === true) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  //is Online Payment Enabled
  static isOnlinePaymentEnabled() {
    if (
      Globals.BUSINESS_DETAILS?._id !== undefined &&
      Globals.BUSINESS_DETAILS?._id !== null
    ) {
      if (Globals.BUSINESS_DETAILS?.enablePricing === true) {
        if (
          Globals.BUSINESS_DETAILS?.pricePlan_id?.enableOnlinePayment === true
        ) {
          if (Globals.BUSINESS_DETAILS?.enableOnlinePayment === true) {
            return true;
          } else {
            return false;
          }
        } else {
          return false;
        }
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  static getPaymentGateway() {
    var type = PaymentGateway.none;
    if (
      Globals.BUSINESS_DETAILS?._id !== undefined &&
      Globals.BUSINESS_DETAILS?._id !== null
    ) {
      if (
        Globals.BUSINESS_DETAILS?.pricePlan_id?.paymentGateWay_id?.name?.toUpperCase() ===
        'stripe'.toUpperCase()
      ) {
        type = PaymentGateway.stripe;
      } else if (
        Globals.BUSINESS_DETAILS?.pricePlan_id?.paymentGateWay_id?.name?.toUpperCase() ===
        'razorpay'.toUpperCase()
      ) {
        type = PaymentGateway.razorpay;
      }
    }
    return type;
  }

  static getServiceBillingType() {
    //service,consultant-service
    if (
      Globals.BUSINESS_DETAILS?._id !== undefined &&
      Globals.BUSINESS_DETAILS?._id !== null
    ) {
      let billingType = Globals.BUSINESS_DETAILS?.serviceBillingType;
      // console.log(billingType)
      return billingType;
    }
  }
  //get business currency symbol
  static getBusinessCurrencySymbol() {
    if (
      Globals.BUSINESS_DETAILS?._id !== undefined &&
      Globals.BUSINESS_DETAILS?._id !== null
    ) {
      let encodedSymbol = decode(Globals.BUSINESS_DETAILS?.currency?.symbol);
      return encodedSymbol;
    }
  }

  //get formatted price with business symbol
  static getCurrencyFormattedPrice(price) {
    let formattedPrice = price.toFixed(2);
    let currencySymbol = this.getBusinessCurrencySymbol();
    let currencyFormatted = currencySymbol + formattedPrice;
    return currencyFormatted;
  }
  //get business booking duration
  static getDuration() {
    if (
      Globals.BUSINESS_DETAILS?._id !== undefined &&
      Globals.BUSINESS_DETAILS?._id !== null
    ) {
      let duration =
        Globals.BUSINESS_DETAILS?.bookingSettings?.bookingTimes?.minimumDuration
          ?.min;
      // console.log(billingType)
      return duration;
    }
  }

  static isReviewAndRatingEnabled() {
    if (
      Globals.BUSINESS_DETAILS?._id !== undefined &&
      Globals.BUSINESS_DETAILS?._id !== null
    ) {
      if (Globals.BUSINESS_DETAILS?.allowReviewAndRating === true) {
        return true;
      }
    }
    return false;
  }

  static isVitalsEnabled() {
    if (
      Globals.BUSINESS_DETAILS?._id !== undefined &&
      Globals.BUSINESS_DETAILS?._id !== null
    ) {
      if (Globals.BUSINESS_DETAILS?.enableVitals === true) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  static isAnyVitalsRequired() {
    if (
      Globals.BUSINESS_DETAILS?._id !== undefined &&
      Globals.BUSINESS_DETAILS?._id !== null
    ) {
      let vitals = Globals.BUSINESS_DETAILS?.vitals;
      let activeAndRequiredVitals = vitals.filter(
        data =>
          data?.status.toUpperCase() === 'ACTIVE' && data?.isRequired === true,
      );
      if (activeAndRequiredVitals.length > 0) {
        return true;
      }
    }
    return false;
  }

  static getAddVitalType() {
    /*
     'before-consultation' | 'after-consultation' | 'anytime' | 'optional'
     Vitals validation:
     1.    Before consultation – Vitals should be added on arrived
     2.    After consultation – Vitals should be added on serving
     3.    Any time – Vitals should be added before fulfilled (on  arrived or on serving)
     4.    Optional – Vitals may or may not be added
     */

    if (
      Globals.BUSINESS_DETAILS?._id !== undefined &&
      Globals.BUSINESS_DETAILS?._id !== null
    ) {
      let addVitalType = Globals.BUSINESS_DETAILS?.addVitals;
      switch (addVitalType) {
        case AddVitalType.beforeConsultation:
          return AddVitalType.beforeConsultation;
        case AddVitalType.afterConsultation:
          return AddVitalType.afterConsultation;
        case AddVitalType.anyTime:
          return AddVitalType.anyTime;
        case AddVitalType.optional:
          return AddVitalType.optional;
        default:
          return AddVitalType.optional;
      }
    }
    return AddVitalType.optional;
  }

  //is ContactlessCheckInEnabled
  static isContactlessCheckInEnabled() {
    if (
      Globals.BUSINESS_DETAILS?._id !== undefined &&
      Globals.BUSINESS_DETAILS?._id !== null
    ) {
      if (Globals.BUSINESS_DETAILS?.contactlessCheckin === true) {
        return true;
      }
    }
    return false;
  }

  static isStoryEnabled() {
    if (
      Globals.BUSINESS_DETAILS?._id !== undefined &&
      Globals.BUSINESS_DETAILS?._id !== null
    ) {
      if (Globals.BUSINESS_DETAILS?.enableStories === true) {
        return true;
      }
    }
    return false;
  }

  static getFormattedWeekDay = date => {
    if (
      moment(date).format('DD MM YYYY') ===
      moment()
        .utcOffset(Globals.BUSINESS_DETAILS?.timeZone?.offset || '+05:30')
        .format('DD MM YYYY')
    ) {
      return 'Today';
    } else if (
      moment(date).format('DD MM YYYY') ===
      moment()
        .utcOffset(Globals.BUSINESS_DETAILS?.timeZone?.offset || '+05:30')
        .add(1, 'days')
        .format('DD MM YYYY')
    ) {
      return 'Tomorrow';
    } else if (
      moment(date).format('DD MM YYYY') ===
      moment()
        .utcOffset(Globals.BUSINESS_DETAILS?.timeZone?.offset || '+05:30')
        .subtract(1, 'days')
        .format('DD MM YYYY')
    ) {
      return 'Yesterday';
    } else {
      return moment(date).format('dddd');
    }
  };

  // check the date is Today,Tomorrow or yesterday
  static checkDate = date => {
    if (moment(date).format('DD MM YYYY') === moment().format('DD MM YYYY')) {
      return 'Today';
    } else if (
      moment(date).format('DD MM YYYY') ===
      moment().add(1, 'days').format('DD MM YYYY')
    ) {
      return 'Tomorrow';
    } else if (
      moment(date).format('DD MM YYYY') ===
      moment().subtract(1, 'days').format('DD MM YYYY')
    ) {
      return 'Yesterday';
    } else {
      return '';
    }
  };

  static isImageLocationIsDropbox() {
    if (
      Globals.BUSINESS_DETAILS?._id !== undefined &&
      Globals.BUSINESS_DETAILS?._id !== null
    ) {
      if (Globals.BUSINESS_DETAILS?.imageLocation === 'dropbox') {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  static getSavedBusinessUserIdInfo() {
    var customerIdInfo = {};
    customerIdInfo.isCustomerId = true;
    customerIdInfo.key = 'customerId';
    customerIdInfo.label = 'CustomerID';

    if (
      Globals.BUSINESS_DETAILS?._id !== undefined &&
      Globals.BUSINESS_DETAILS?._id !== null
    ) {
      let patientInfo = Globals.BUSINESS_DETAILS?.patientInfo;
      if (patientInfo !== undefined && patientInfo !== null) {
        patientInfo.map((_item, itemIndex) => {
          if (_item?.isCustomerId === true) {
            customerIdInfo = _item;
          }
        });
      }
    }
    return customerIdInfo;
  }

  static getDummyServices() {
    const dummyServiceList = [
      {
        _id: '5f4ad97e7cb43e030f443061',
        customHours: [],
        isDeleted: false,
        image: 'https://ywait.in:2003/services/haircut.jpeg',
        name: 'Hair Bleaching m',
        category: 'Hair Cut',
        serviceIs: 'public',
        for: 'booking',
        during: 'all_hours',
        description:
          'Hair bleaching is a chemical hair dye technique that strips the color of your hair strands',
        duration: 30,
        price: 100,
        business_id: '5cf610fb384ef274d2f3c79c',
        __v: 0,
        status: 'ACTIVE',
        parallelService: true,
        sortIndex: 25,
        lottieImageName: '',
        genderSelection: 'unisex',
        consultantServiceFare: 100,
      },
      {
        _id: '5f4ad97e7cb43e030f443062',
        customHours: [],
        isDeleted: false,
        image: 'https://ywait.in:2003/services/haircut.jpeg',
        name: 'Hair Bleaching m',
        category: 'Hair Cut',
        serviceIs: 'public',
        for: 'booking',
        during: 'all_hours',
        description:
          'Hair bleaching is a chemical hair dye technique that strips the color of your hair strands',
        duration: 30,
        price: 100,
        business_id: '5cf610fb384ef274d2f3c79c',
        __v: 0,
        status: 'ACTIVE',
        parallelService: true,
        sortIndex: 25,
        lottieImageName: '',
        genderSelection: 'unisex',
        consultantServiceFare: 100,
      },
      {
        _id: '5f4ad97e7cb43e030f443063',
        customHours: [],
        isDeleted: false,
        image: 'https://ywait.in:2003/services/haircut.jpeg',
        name: 'Hair Bleaching m',
        category: 'Hair Cut',
        serviceIs: 'public',
        for: 'booking',
        during: 'all_hours',
        description:
          'Hair bleaching is a chemical hair dye technique that strips the color of your hair strands',
        duration: 30,
        price: 100,
        business_id: '5cf610fb384ef274d2f3c79c',
        __v: 0,
        status: 'ACTIVE',
        parallelService: true,
        sortIndex: 25,
        lottieImageName: '',
        genderSelection: 'unisex',
        consultantServiceFare: 100,
      },
      {
        _id: '5f4ad97e7cb43e030f443064',
        customHours: [],
        isDeleted: false,
        image: 'https://ywait.in:2003/services/haircut.jpeg',
        name: 'Hair Bleaching m',
        category: 'Hair Cut',
        serviceIs: 'public',
        for: 'booking',
        during: 'all_hours',
        description:
          'Hair bleaching is a chemical hair dye technique that strips the color of your hair strands',
        duration: 30,
        price: 100,
        business_id: '5cf610fb384ef274d2f3c79c',
        __v: 0,
        status: 'ACTIVE',
        parallelService: true,
        sortIndex: 25,
        lottieImageName: '',
        genderSelection: 'unisex',
        consultantServiceFare: 100,
      },
      {
        _id: '5f4ad97e7cb43e030f443065',
        customHours: [],
        isDeleted: false,
        image: 'https://ywait.in:2003/services/haircut.jpeg',
        name: 'Hair Bleaching m',
        category: 'Hair Cut',
        serviceIs: 'public',
        for: 'booking',
        during: 'all_hours',
        description:
          'Hair bleaching is a chemical hair dye technique that strips the color of your hair strands',
        duration: 30,
        price: 100,
        business_id: '5cf610fb384ef274d2f3c79c',
        __v: 0,
        status: 'ACTIVE',
        parallelService: true,
        sortIndex: 25,
        lottieImageName: '',
        genderSelection: 'unisex',
        consultantServiceFare: 100,
      },
      {
        _id: '5f4ad97e7cb43e030f443066',
        customHours: [],
        isDeleted: false,
        image: 'https://ywait.in:2003/services/haircut.jpeg',
        name: 'Hair Bleaching m',
        category: 'Hair Cut',
        serviceIs: 'public',
        for: 'booking',
        during: 'all_hours',
        description:
          'Hair bleaching is a chemical hair dye technique that strips the color of your hair strands',
        duration: 30,
        price: 100,
        business_id: '5cf610fb384ef274d2f3c79c',
        __v: 0,
        status: 'ACTIVE',
        parallelService: true,
        sortIndex: 25,
        lottieImageName: '',
        genderSelection: 'unisex',
        consultantServiceFare: 100,
      },
      {
        _id: '5f4ad97e7cb43e030f443067',
        customHours: [],
        isDeleted: false,
        image: 'https://ywait.in:2003/services/haircut.jpeg',
        name: 'Hair Bleaching m',
        category: 'Hair Cut',
        serviceIs: 'public',
        for: 'booking',
        during: 'all_hours',
        description:
          'Hair bleaching is a chemical hair dye technique that strips the color of your hair strands',
        duration: 30,
        price: 100,
        business_id: '5cf610fb384ef274d2f3c79c',
        __v: 0,
        status: 'ACTIVE',
        parallelService: true,
        sortIndex: 25,
        lottieImageName: '',
        genderSelection: 'unisex',
        consultantServiceFare: 100,
      },
      {
        _id: '5f4ad97e7cb43e030f443068',
        customHours: [],
        isDeleted: false,
        image: 'https://ywait.in:2003/services/haircut.jpeg',
        name: 'Hair Bleaching m',
        category: 'Hair Cut',
        serviceIs: 'public',
        for: 'booking',
        during: 'all_hours',
        description:
          'Hair bleaching is a chemical hair dye technique that strips the color of your hair strands',
        duration: 30,
        price: 100,
        business_id: '5cf610fb384ef274d2f3c79c',
        __v: 0,
        status: 'ACTIVE',
        parallelService: true,
        sortIndex: 25,
        lottieImageName: '',
        genderSelection: 'unisex',
        consultantServiceFare: 100,
      },
      {
        _id: '5f4ad97e7cb43e030f443069',
        customHours: [],
        isDeleted: false,
        image: 'https://ywait.in:2003/services/haircut.jpeg',
        name: 'Hair Bleaching m',
        category: 'Hair Cut',
        serviceIs: 'public',
        for: 'booking',
        during: 'all_hours',
        description:
          'Hair bleaching is a chemical hair dye technique that strips the color of your hair strands',
        duration: 30,
        price: 100,
        business_id: '5cf610fb384ef274d2f3c79c',
        __v: 0,
        status: 'ACTIVE',
        parallelService: true,
        sortIndex: 25,
        lottieImageName: '',
        genderSelection: 'unisex',
        consultantServiceFare: 100,
      },
      {
        _id: '5f4ad97e7cb43e030f443060',
        customHours: [],
        isDeleted: false,
        image: 'https://ywait.in:2003/services/haircut.jpeg',
        name: 'Hair Bleaching m',
        category: 'Hair Cut',
        serviceIs: 'public',
        for: 'booking',
        during: 'all_hours',
        description:
          'Hair bleaching is a chemical hair dye technique that strips the color of your hair strands',
        duration: 30,
        price: 100,
        business_id: '5cf610fb384ef274d2f3c79c',
        __v: 0,
        status: 'ACTIVE',
        parallelService: true,
        sortIndex: 25,
        lottieImageName: '',
        genderSelection: 'unisex',
        consultantServiceFare: 100,
      },
      {
        _id: '5f4ad97e7cb43e030f443010',
        customHours: [],
        isDeleted: false,
        image: 'https://ywait.in:2003/services/haircut.jpeg',
        name: 'Hair Bleaching m',
        category: 'Hair Cut',
        serviceIs: 'public',
        for: 'booking',
        during: 'all_hours',
        description:
          'Hair bleaching is a chemical hair dye technique that strips the color of your hair strands',
        duration: 30,
        price: 100,
        business_id: '5cf610fb384ef274d2f3c79c',
        __v: 0,
        status: 'ACTIVE',
        parallelService: true,
        sortIndex: 25,
        lottieImageName: '',
        genderSelection: 'unisex',
        consultantServiceFare: 100,
      },
      {
        _id: '5f4ad97e7cb43e030f443011',
        customHours: [],
        isDeleted: false,
        image: 'https://ywait.in:2003/services/haircut.jpeg',
        name: 'Hair Bleaching m',
        category: 'Hair Cut',
        serviceIs: 'public',
        for: 'booking',
        during: 'all_hours',
        description:
          'Hair bleaching is a chemical hair dye technique that strips the color of your hair strands',
        duration: 30,
        price: 100,
        business_id: '5cf610fb384ef274d2f3c79c',
        __v: 0,
        status: 'ACTIVE',
        parallelService: true,
        sortIndex: 25,
        lottieImageName: '',
        genderSelection: 'unisex',
        consultantServiceFare: 100,
      },
    ];
    return dummyServiceList;
  }

  //Reset all shared values before new booking
  static resetAllSharedBookingRelatedInfo() {
    Globals.SHARED_VALUES.IS_RESCHEDULE = false;
    Globals.SHARED_VALUES.IS_FROM_QR_CODE_SCAN = false;
    if (this.isSingleConsultantBusiness() === false) {
      Globals.SHARED_VALUES.SELECTED_SERVING_USER_INFO = {};
      Globals.SHARED_VALUES.SELECTED_SERVING_USER_ID = '';
      Globals.SHARED_VALUES.SELECTED_SERVING_USER_ROLE_TEXT = '';
    }
    Globals.SHARED_VALUES.SELECTED_GENDER = '';
    Globals.SHARED_VALUES.SELECTED_SERVICES_IDS = [];
    Globals.SHARED_VALUES.SELECTED_SLOT_INFO = {};
    Globals.SHARED_VALUES.SELECTED_PAYMENT_INFO = {};
    Globals.SHARED_VALUES.IS_FORCE_SERVICE_SELECT_NEED = false;
    Globals.SHARED_VALUES.SELECTED_DEPARTMENT_INFO = {};
    Globals.SHARED_VALUES.IS_FROM_DASHBOARD_DEPARTMENT_VIEW_ALL = false;
    Globals.SHARED_VALUES.IS_NO_CHOICE_SELECTED = false;
  }

  static isEnabledScheduleNextVisit() {
    if (
      Globals.BUSINESS_DETAILS?._id !== undefined &&
      Globals.BUSINESS_DETAILS?._id !== null
    ) {
      let isEnableRemainder = Globals.BUSINESS_DETAILS?.enableRemainder;
      let isScheduleNextVisitRemainder =
        Globals.BUSINESS_DETAILS?.nextVisitRemainder;
      if (isEnableRemainder === true && isScheduleNextVisitRemainder === true) {
        return true;
      }
    }
    return false;
  }

  /**
      * Purpose:Save UUID for push notification
      * Created/Modified By: Jenson John
      * Created/Modified Date: 19 Aug 2021
      * Steps:
          1.Get the base url from Async storage
       */
  static saveTokenUUID = async (uuid: String) => {
    try {
      await AppStorage.setItem(Globals.STORAGE_KEYS.PUSH_TOKEN_UUID, uuid);
      await AppStorage.setItem(
        Globals.STORAGE_KEYS.IS_PUSH_TOKEN_UUID_CREATED,
        'true',
      );
      Globals.TOKEN_UUID = uuid;
      Globals.IS_TOKEN_UUID_CREATED = true;
    } catch (e) {}
  };

  /**
               *  Purpose:Get the value of token UUID
              * Created/Modified By: Jenson
              * Created/Modified Date: 19 Aug 2021
              * Steps:
                  1.Get the value from Async storage
                  2.return the value
               */
  static getTokenUUID = async () => {
    try {
      let res = await AppStorage.getItem(Globals.STORAGE_KEYS.PUSH_TOKEN_UUID);
      console.log('Utils PUSH_TOKEN_UUID', res);
      return res;
    } catch (e) {}
  };

  /**
               *  Purpose:Get the value of token UUID
              * Created/Modified By: Jenson
              * Created/Modified Date: 19 Aug 2021
              * Steps:
                  1.Get the value from Async storage
                  2.return the value
               */
  static isTokenUUIDCreated = async () => {
    try {
      let res = await AppStorage.getItem(
        Globals.STORAGE_KEYS.IS_PUSH_TOKEN_UUID_CREATED,
      );
      console.log('Utils IS_PUSH_TOKEN_UUID_CREATED', res);
      return res;
    } catch (e) {}
  };
  // static clearRegistrationData = async () => {
  //   try {
  //     let keys = [
  //       Globals.STORAGE_KEYS.BASIC_PROFILE,
  //       Globals.STORAGE_KEYS.STORE_INFO,
  //     ];
  //     let res = await AppStorage.clearItems(keys);
  //     return res;
  //   } catch (e) {
  //     console.log('clearRegistrationData: ', e);
  //   }
  // };
}

// function to convert the time to timezone
export function sharedConvertorTimeToBusinessTimeZone(
  utcString: any,
  timezone: any,
) {
  // return new Date(utcString); //convert to local time
  let localUtc = moment().utcOffset();
  localUtc = 0 - localUtc;
  let time: any = moment(utcString).utcOffset(localUtc);
  let time1: any = moment(time['_d']).utcOffset(timezone);
  return time1['_d'];
}

// function to append the timezone to api
export function sharedAppendBusinessTimeZoneToDate(date: any, timezone: any) {
  // return date;
  const dateOnly = moment(date).format();
  // console.log(dateOnly);
  const len = dateOnly.length;
  const ti = dateOnly.substring(0, len - 6);
  //  console.log(ti);
  // console.log(timezone);
  const time = ti + timezone;
  // console.log(time);
  return  dateOnly;
}
export function sharedDate(date: any, timezone: any) {
  // return date;
  const datenew = moment(date).format();
  return datenew;
}



