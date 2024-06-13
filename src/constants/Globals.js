import {GuestUserAuthSource, BUILD_SOURCE} from '../helpers/enums/Enums';
// BUSINESS IDs
//demo id-> '6082c2c53d655c1d25e0b58d',
// spotless id : '62fb976b38ed6141331cd259'
// Aster : '6322dec6600e070d1ea35162'
//FirstResponse : '63c15cbbbf847c70f0b31306'
//YwaitServices :'6136211c8a1fec162da9084e'

// APPLICATION IDs
// ASTER: 'com.ywait.aster'
// Ywait Demo: 'com.stackontech.bookmyslot'
//YwaitServices:'com.ywait.services'
// FirstResponse : 'com.ywait.firstResponse'
export default {
  IS_STANDALONE_BUILD: true, //TRUE = Work as single business app with below id
  STANDALONE_BUSINESS_ID: '6082c2c53d655c1d25e0b58d', //demo id-> '6082c2c53d655c1d25e0b58d',
  BUSINESS_ID: '6082c2c53d655c1d25e0b58d',
  CUSTOM_BUILD_SOURCE: BUILD_SOURCE.YWAIT,
  APPLICATION_ID: 'com.ywait.services',
  // y-wait-demo web clent id : '895691039937-ctm8bs8nlh3vriud681hedls4sopjh4v.apps.googleusercontent.com',
  // spotless : '113502388440-erc3a0v0rnjr8piaoatmd75r5lcjairc.apps.googleusercontent.com'
  WEB_CLIENT_ID:
    '895691039937-ctm8bs8nlh3vriud681hedls4sopjh4v.apps.googleusercontent.com',
  IS_AUTHORIZED: false,
  TOKEN: null,
  TEMP_USER_DETAILS: {}, //user temp verification info if not authorized.
  USER_DETAILS: {},
  BUSINESS_DETAILS: {},
  QUEUE_DETAILS: {},
  BOOKING_DETAILS: {},
  CONSULTANTS_LIST:[],
  PREVIOUS_LIST:{},
  UN_READ_NOTIFICATION_COUNT: 0,
  APNS_TOKEN: '',
  PUSH_NOTIFICATION_TOKEN: '',
  PUSH_DEVICE_ID: '',
  NOTIFICATION_DATA: {data: {}},
  TOKEN_UUID: '',
  IS_TOKEN_UUID_CREATED: '',
  IS_NOTIFICATION_NAVIGATION_NEEDED: false,
  SAVED_STORY_IDS: [],
  SELECTED_LANGUAGE: 'en',
  IS_LANGUAGE_CHANGED: 'false',
  DEVICE_LANGUAGE: 'en',
    //Used for Storage
  STORAGE_KEYS: {
    IS_AUTH: 'isAuthorized',
    TOKEN: 'token',
    BASE_URL: 'baseUrl',
    BASE_URL_TYPE: 'baseUrlType',
    BUSINESS_DETAILS: 'businessDetails',
    QUEUE_DETAILS: 'queueDetails',
    BOOKING_DETAILS: 'bookingdetails',
    CONSULTANTS_LIST:'consultantlist',
    PREVIOUS_LIST:'previouslist',
    USER_DETAILS: 'userDetails',
    PUSH_TOKEN_UUID: 'pushTokenUuid',
    IS_PUSH_TOKEN_UUID_CREATED: 'isPushTokenCreated',
    STORY_READ_IDS: 'storyReadIds',
    SELECTED_LANGUAGE: 'language',
    IS_LANGUAGE_CHANGED: 'is_language_changed',
  },

  //Shared data
  SHARED_VALUES: {
    COUNTRY_POPUP_TITLE: 'Select Country',
    POPUP_ACTIVE_SOURCE_INDEX: -1,
    DELETE_ATTACHMENT_SELECTED_INDEX: -1,
    SELECTED_STATE_INDEX: -1,
    IS_FOR_CITY: false, //Used in update profile screen popup
    DYNAMIC_SELECTION_ITEMS: [],
    // ALERT_CONFIRM_POPUP_SOURCE: AlertConfirmPopupSource.none,
    ALERT_CONFIRM_MESSAGE: 'Are you sure?',
    DATE_PICKER_DATE: new Date(),
    DATE_PICKER_MAX_DATE: '',
    //Guest user login source
    GUEST_USER_AUTH_SOURCE: GuestUserAuthSource.none,
    IS_GUEST_USER_NAV_NEEDED: false,
    //New booking flow
    IS_RESCHEDULE: false,
    RESCHEDULE_APPOINTMENT_INFO: {},
    SELECTED_GENDER: '',
    SELECTED_SERVING_USER_ROLE_TEXT: '',
    SELECTED_SERVING_USER_INFO: {},
    SELECTED_SERVING_USER_ID: '',
    IS_NO_CHOICE_SELECTED: false,
    SELECTED_SERVICES_IDS: [],
    IS_FORCE_SERVICE_SELECT_NEED: false, //When choose single service from dashboard->true
    IS_FROM_DASHBOARD_DEPARTMENT_VIEW_ALL: false, //when choose view all department from dashboard->true
    SELECTED_DEPARTMENT_INFO: {}, //loads when choose single department from dashboard
    SELECTED_SLOT_INFO: {},
    SELECTED_PAYMENT_INFO: {},
    FAILURE_ERROR_MESSAGE: '',
    NEW_SUCCESS_APPOINTMENT_INFO: {},
    IS_UPCOMING_APPOINTMENT_NEED_SHOW: false,
    IS_FROM_QR_CODE_SCAN: false,
    //Appointment Details
    SELECTED_APPOINTMENT_INFO: {},
    SELECTED_APPOINTMENT_ID: '',
    SELECTED_APPOINTMENT_TYPE: '',
    //Dashboard
    IS_PREVIOUS_MY_VISIT: false,
    //Story
    SELECTED_STORY_INFO: {},
    PROFILE_PREVIOUS_DATA: {},
  },
  PAYMENT: {
    RAZOR_PAY: {
      TEST_KEY: 'rzp_test_I5g9npl5uUrX1m',
      LIVE_KEY: 'rzp_test_I5g9npl5uUrX1m',
    },
    STRIPE: {
      TEST_KEY:
        'pk_test_51I9V3MKqqNkOglYTIucdPpLsuvLzWSlo20kgiR9UB6aHlVF9Esmt7NDFiA0kw3mn3hk4OOo3YkNR60mdPyUmBKg600RDAsrHBX',
      LIVE_KEY:
        'sk_test_51J8fq7SIR4x5000QMqMe1WBiQD0uuBGmzvHGegeDGule1f3Jzfefr5dSWmW1TFUYov10XP4jxTsaXbFQ3LkWs3TM00AxJJ6y1B',
    },
  },
};
