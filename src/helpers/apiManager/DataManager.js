import { Strings,Translations } from '../../constants';
import { NetworkManager } from './NetworkManager';
import NetworkUtils from '../utils/NetworkUtils';
import APIConnections from './APIConnections';
import StorageManager from '../storageManager/StorageManager';
import { Globals } from '../../constants';
import Utilities from '../utils/Utilities';
import { t } from 'i18next';

export default class DataManager {
  /**
       * Purpose: Get Business List
       * Created/Modified By: Jenson John
       * Created/Modified Date: 27 Dec 2021
       * Steps:
           1.Check network status
           2.Fetch the data
           3.Return data and other info
      */
  static getBusinessList = async pageNo => {
    let url =
      APIConnections.BASE_URL +
      APIConnections.ENDPOINTS.BUSINESS_LIST +
      '/' +
      pageNo +
      '/10';
    //1
    const isConnected = await NetworkUtils.isNetworkAvailable();
    if (isConnected === false) {
     return [false, t(Translations.NO_INTERNET), null];
    } else {
      //2
      const response = await NetworkManager.get(url);
      //3
      if (response.status === false) {
        return [false, response.message, null];
      } else {
        return [true, response.message, response.data];
      }
    }
  };

  /**
       * Purpose: Get getBusinessDetails
       * Created/Modified By: Jenson John
       * Created/Modified Date: 27 Dec 2021
       * Steps:
              1.Check network status
              2.Fetch the data
              3.Return data and other info
      */
  static getBusinessDetails = async (businessId, headers = {}) => {
    let url =
      APIConnections.BASE_URL +
      APIConnections.ENDPOINTS.BUSINESS_DETAILS +
      `?business_id=${businessId}`;
    //1
    const isConnected = await NetworkUtils.isNetworkAvailable();
    if (isConnected === false) {
     return [false, t(Translations.NO_INTERNET), null];
    } else {
      //2
      const response = await NetworkManager.get(url, headers);
      //3
      if (response.status === false) {
        return [false, response.message, null];
      } else {
        return [true, response.message, response.data];
      }
    }
  };

  /**
       * Purpose: Perform login by email
       * Created/Modified By: Jenson John
       * Created/Modified Date: 28 Dec 2021
       * Steps:
              1.Check network status
              2.Fetch the data
              3.Return data and other info
      */
  static performEmailLogin = async (body = {}, headers = {}) => {
    let url = APIConnections.BASE_URL + APIConnections.ENDPOINTS.EMAIL_LOGIN;
    //1
    const isConnected = await NetworkUtils.isNetworkAvailable();
    if (isConnected === false) {
     return [false, t(Translations.NO_INTERNET), null];
    } else {
      const response = await NetworkManager.post(url, body, headers);
      if (response.status === false) {
        return [false, response.message, null];
      } else {
        //Save token
        if (response.token !== null || response.token !== undefined) {
          StorageManager.saveToken(response.token);
          Globals.TOKEN = response.token;
          return [true, response.message, response.data];
        } else {
          return [false, Strings.TOKEN_NOT_FOUND, null];
        }
      }
    }
  };
  /**
      * Purpose: Perform login by email
      * Created/Modified By: Jenson John
      * Created/Modified Date: 28 Dec 2021
      * Steps:
             1.Check network status
             2.Fetch the data
             3.Return data and other info
     */
  static performGoogleSignIn = async (body = {}, headers = {}) => {
    let url = APIConnections.BASE_URL + APIConnections.ENDPOINTS.GOOGLE_SIGN_IN;
    //1
    const isConnected = await NetworkUtils.isNetworkAvailable();
    if (isConnected === false) {
     return [false, t(Translations.NO_INTERNET), null];
    } else {
      const response = await NetworkManager.post(url, body, headers);
      if (response.status === false) {
        return [false, response.message, null];
      } else {
        //Save token
        if (response.token !== null || response.token !== undefined) {
          StorageManager.saveToken(response.token);
          Globals.TOKEN = response.token;
          return [true, response.message, response.data];
        } else {
          return [false, Strings.TOKEN_NOT_FOUND, null];
        }
      }
    }
  };

  /**
     * Purpose: Perform login by facebook
     * Created/Modified By: Vijin
     * Created/Modified Date: 25 Feb 2021
     * Steps:
            1.Check network status
            2.Fetch the data
            3.Return data and other info
    */
  static performFacebookSignIn = async (body = {}, headers = {}) => {
    let url =
      APIConnections.BASE_URL + APIConnections.ENDPOINTS.FACEBOOK_SIGN_IN;
    //1
    const isConnected = await NetworkUtils.isNetworkAvailable();
    if (isConnected === false) {
     return [false, t(Translations.NO_INTERNET), null];
    } else {
      const response = await NetworkManager.post(url, body, headers);
      if (response.status === false) {
        return [false, response.message, null];
      } else {
        //Save token
        if (response.token !== null || response.token !== undefined) {
          StorageManager.saveToken(response.token);
          Globals.TOKEN = response.token;
          return [true, response.message, response.data];
        } else {
          return [false, Strings.TOKEN_NOT_FOUND, null];
        }
      }
    }
  };

  /**
     * Purpose: Perform login by facebook
     * Created/Modified By: Vijin
     * Created/Modified Date: 25 Feb 2021
     * Steps:
            1.Check network status
            2.Fetch the data
            3.Return data and other info
    */
  static performAppleSignIn = async (body = {}, headers = {}) => {
    let url = APIConnections.BASE_URL + APIConnections.ENDPOINTS.APPLE_SIGN_IN;
    //1
    const isConnected = await NetworkUtils.isNetworkAvailable();
    if (isConnected === false) {
     return [false, t(Translations.NO_INTERNET), null];
    } else {
      const response = await NetworkManager.post(url, body, headers);
      if (response.status === false) {
        return [false, response.message, null];
      } else {
        //Save token
        if (response.token !== null || response.token !== undefined) {
          StorageManager.saveToken(response.token);
          Globals.TOKEN = response.token;
          return [true, response.message, response.data];
        } else {
          return [false, Strings.TOKEN_NOT_FOUND, null];
        }
      }
    }
  };

  /**
          * Purpose: Perform login by phone
          * Created/Modified By: Jenson John
          * Created/Modified Date: 28 Dec 2021
          * Steps:
              1 .Check network status
              2.Fetch the data
              3.Return data and other info
  */
  static performPhoneLogin = async (body = {}, headers = {}) => {
    let url = APIConnections.BASE_URL + APIConnections.ENDPOINTS.PHONE_LOGIN;
    //1
    const isConnected = await NetworkUtils.isNetworkAvailable();
    if (isConnected === false) {
     return [false, t(Translations.NO_INTERNET), null];
    } else {
      const response = await NetworkManager.post(url, body, headers);
      if (response.status === false) {
        return [false, response.message, null];
      } else {
        //Save token
        if (response.token !== null || response.token !== undefined) {
          StorageManager.saveToken(response.token);
          Globals.TOKEN = response.token;
          return [true, response.message, response.data];
        } else {
          return [false, Strings.TOKEN_NOT_FOUND, null];
        }
      }
    }
  };
  /**
       * Purpose: Perform login by email
       * Created/Modified By: Jenson John
       * Created/Modified Date: 28 Dec 2021
       * Steps:
              1.Check network status
              2.Fetch the data
              3.Return data and other info
      */
  static performOTPValidation = async (body = {}, headers = {}) => {
    let url = APIConnections.BASE_URL + APIConnections.ENDPOINTS.OTP_VALIDATION;
    //1
    const isConnected = await NetworkUtils.isNetworkAvailable();
    if (isConnected === false) {
     return [false, t(Translations.NO_INTERNET), null];
    } else {
      const response = await NetworkManager.post(url, body, headers);
      if (response.status === false) {
        return [false, response.message, null];
      } else {
        //Save token
        // if (response.token !== null || response.token !== undefined) {
        //     StorageManager.saveToken(response.token);
        return [true, response.message, response.data];
        // } else {
        //     return [false, Strings.TOKEN_NOT_FOUND, null];
        // }
      }
    }
  };
  /**
       * Purpose: Perform login by email
       * Created/Modified By: Jenson John
       * Created/Modified Date: 28 Dec 2021
       * Steps:
              1.Check network status
              2.Fetch the data
              3.Return data and other info
      */
  static performOTPResend = async (body = {}, headers = {}) => {
    let url = APIConnections.BASE_URL + APIConnections.ENDPOINTS.RESEND_OTP;
    //1
    const isConnected = await NetworkUtils.isNetworkAvailable();
    if (isConnected === false) {
     return [false, t(Translations.NO_INTERNET), null];
    } else {
      const response = await NetworkManager.post(url, body, headers);
      if (response.status === false) {
        return [false, response.message, null];
      } else {
        return [true, response.message, response.data];
      }
    }
  };

  /**
       * Purpose: Perform login by email
       * Created/Modified By: Jenson John
       * Created/Modified Date: 23 Feb 2022
       * Steps:
              1.Check network status
              2.Fetch the data
              3.Return data and other info
      */
  static performEmailRegister = async (body = {}, headers = {}) => {
    let url = APIConnections.BASE_URL + APIConnections.ENDPOINTS.EMAIL_REGISTER;
    //1
    const isConnected = await NetworkUtils.isNetworkAvailable();
    if (isConnected === false) {
     return [false, t(Translations.NO_INTERNET), null];
    } else {
      const response = await NetworkManager.post(url, body, headers);
      if (response.status === false) {
        return [false, response.message, null];
      } else {
        return [true, response.message, response.data];
      }
    }
  };

  /**
    * Purpose: Get country list with code
    * Created/Modified By: Jenson John
    * Created/Modified Date: 13 Jan 2022
    * Steps:
           1.Check network status
           2.Fetch the data
           3.Return data and other info
   */
  static getCountryList = async (headers = {}) => {
    let url = APIConnections.BASE_URL + APIConnections.ENDPOINTS.COUNTRY_CODE;
    //1
    const isConnected = await NetworkUtils.isNetworkAvailable();
    if (isConnected === false) {
     return [false, t(Translations.NO_INTERNET), null];
    } else {
      //2
      const response = await NetworkManager.get(url, headers);
      //3
      if (response.status === false) {
        return [false, response.message, null];
      } else {
        return [true, response.message, response.data];
      }
    }
  };

  /**
      * Purpose: Get state and city list
      * Created/Modified By: Jenson John
      * Created/Modified Date: 24 Feb 2022
      * Steps:
             1.Check network status
             2.Fetch the data
             3.Return data and other info
     */
  static getStateAndCityList = async (countryName, headers = {}) => {
    //let encodeCountryName = countryName.replace(/\s+/g, '%20');

    let url =
      APIConnections.BASE_URL +
      APIConnections.ENDPOINTS.STATE_AND_CITY +
      `/${countryName}`;
    //1
    const isConnected = await NetworkUtils.isNetworkAvailable();
    if (isConnected === false) {
     return [false, t(Translations.NO_INTERNET), null];
    } else {
      //2
      const response = await NetworkManager.get(url, headers);
      //3
      if (response.status === false) {
        return [false, response.message, null];
      } else {
        return [true, response.message, response.data];
      }
    }
  };

  /**
     * Purpose: Perform customer create
     * Created/Modified By: Jenson John
     * Created/Modified Date: 25 Feb 2022
     * Steps:
         1 .Check network status
         2.Fetch the data
         3.Return data and other info
  */
  static performCustomerProfileUpdate = async body => {
    let url = APIConnections.BASE_URL + APIConnections.ENDPOINTS.PROFILE_UPDATE;
    //1
    const isConnected = await NetworkUtils.isNetworkAvailable();
    if (isConnected === false) {
     return [false, t(Translations.NO_INTERNET), null];
    } else {
      const response = await NetworkManager.uploadFiles(url, body);
      if (response.status === false) {
        return [false, response.message, null];
      } else {
        if (response.status === false) {
          return [false, response.message, null];
        } else {
          return [true, response.message, response.data];
        }
      }
    }
  };

  /**
       * Purpose: Perform password reset
       * Created/Modified By: Jenson John
       * Created/Modified Date: 04 Jan 2022
       * Steps:
           1 .Check network status
           2.Fetch the data
           3.Return data and other info
    */
  static performPasswordReset = async (body = {}, headers = {}) => {
    let url =
      APIConnections.BASE_URL + APIConnections.ENDPOINTS.UPDATE_PASSWORD;
    //1
    const isConnected = await NetworkUtils.isNetworkAvailable();
    if (isConnected === false) {
     return [false, t(Translations.NO_INTERNET), null];
    } else {
      const response = await NetworkManager.post(url, body, headers);
      if (response.status === false) {
        return [false, response.message, null];
      } else {
        if (response.status === false) {
          return [false, response.message, null];
        } else {
          return [true, response.message, response.data];
        }
      }
    }
  };

  /**
      * Purpose: Get user details
      * Created/Modified By: Jenson John
      * Created/Modified Date: 25 Feb 2022
      * Steps:
             1.Check network status
             2.Fetch the data
             3.Return data and other info
     */
  static getUserDetails = async (userId, headers = {}) => {
    let url =
      APIConnections.BASE_URL +
      APIConnections.ENDPOINTS.USER_DETAILS +
      `?customer_id=${userId}`;
    //1
    const isConnected = await NetworkUtils.isNetworkAvailable();
    if (isConnected === false) {
     return [false, t(Translations.NO_INTERNET), null];
    } else {
      //2
      const response = await NetworkManager.get(url, headers);
      //3
      if (response.status === false) {
        return [false, response.message, null];
      } else {
        return [true, response.message, response.data];
      }
    }
  };

  /**
     * Purpose: Perform forgot password
     * Created/Modified By: Jenson John
     * Created/Modified Date: 03 Jan 2022
     * Steps:
         1 .Check network status
         2.Fetch the data
         3.Return data and other info
  */
  static performForgotPassword = async (body = {}, headers = {}) => {
    let url =
      APIConnections.BASE_URL + APIConnections.ENDPOINTS.FORGOT_PASSWORD;
    //1
    const isConnected = await NetworkUtils.isNetworkAvailable();
    if (isConnected === false) {
     return [false, t(Translations.NO_INTERNET), null];
    } else {
      const response = await NetworkManager.post(url, body, headers);
      if (response.status === false) {
        return [false, response.message, null];
      } else {
        if (response.status === false) {
          return [false, response.message, null];
        } else {
          return [true, response.message, response.data];
        }
      }
    }
  };

  /**
     * Purpose: Perform password reset
     * Created/Modified By: Jenson John
     * Created/Modified Date: 18 Feb 2022
     * Steps:
         1 .Check network status
         2.Fetch the data
         3.Return data and other info
  */
  static performChangePassword = async (body = {}, headers = {}) => {
    let url =
      APIConnections.BASE_URL + APIConnections.ENDPOINTS.PASSWORD_CHANGE;
    //1
    const isConnected = await NetworkUtils.isNetworkAvailable();
    if (isConnected === false) {
     return [false, t(Translations.NO_INTERNET), null];
    } else {
      const response = await NetworkManager.post(url, body, headers);
      if (response.status === false) {
        return [false, response.message, null];
      } else {
        if (response.status === false) {
          return [false, response.message, null];
        } else {
          return [true, response.message, response.data];
        }
      }
    }
  };

  /**
       * Purpose: Perform forgot password
       * Created/Modified By: Jenson John
       * Created/Modified Date: 28 Feb 2022
       * Steps:
           1 .Check network status
           2.Fetch the data
           3.Return data and other info
    */
  static performEmailUpdate = async (body = {}, headers = {}) => {
    let url = APIConnections.BASE_URL + APIConnections.ENDPOINTS.EMAIL_UPDATE;
    //1
    const isConnected = await NetworkUtils.isNetworkAvailable();
    if (isConnected === false) {
     return [false, t(Translations.NO_INTERNET), null];
    } else {
      const response = await NetworkManager.post(url, body, headers);
      if (response.status === false) {
        return [false, response.message, null];
      } else {
        if (response.status === false) {
          return [false, response.message, null];
        } else {
          return [true, response.message, response.data];
        }
      }
    }
  };

  /**
       * Purpose: Get Specialist List
       * Created/Modified By: Jenson John
       * Created/Modified Date: 02 Mar 2021
       * Steps:
           1.Check network status
           2.Fetch the data
           3.Return data and other info
      */
  static getSpecialistList = async (pageNo, queryParams = {}, serviceIds) => {
    var serviceIdsArrayString = '';
    var customURLValue = '';
    if (serviceIds?.length > 0) {
      serviceIds.map(value => {
        serviceIdsArrayString += `%22${value}%22` + ',';
      });
      serviceIdsArrayString = serviceIdsArrayString.slice(0, -1);

      customURLValue = `&serviceIds=[${serviceIdsArrayString}]`;
    }

    let url =
      APIConnections.BASE_URL +
      APIConnections.ENDPOINTS.SPECIALIST_LIST +
      '/' +
      pageNo +
      '/10' +
      `?${Utilities.getQueryString(queryParams)}`;
    //1
    const isConnected = await NetworkUtils.isNetworkAvailable();
    if (isConnected === false) {
     return [false, t(Translations.NO_INTERNET), null];
    } else {
      //2
      const response = await NetworkManager.get(url, {}, customURLValue);
      //3
      if (response.status === false) {
        return [false, response.message, null];
      } else {
        return [true, response.message, response.data];
      }
    }
  };
  /**
       * Purpose: Get notification list
       * Created/Modified By: Sudhin Sudhakaran
       * Created/Modified Date: 31 Jan 2022
       * Steps:
              1.Check network status
              2.Fetch the data
              3.Return data and other info
      */
  static getNotificationList = async pageNo => {
    let url =
      APIConnections.BASE_URL +
      APIConnections.ENDPOINTS.NOTIFICATION_LIST +
      '/' +
      pageNo +
      '/10';

    //1
    const isConnected = await NetworkUtils.isNetworkAvailable();
    if (isConnected === false) {
     return [false, t(Translations.NO_INTERNET), null];
    } else {
      //2
      const response = await NetworkManager.get(url);
      //3
      if (response.status === false) {
        return [false, response.message, null];
      } else {
        return [true, response.message, response];
      }
    }
  };
  /**
  * Purpose: Perform Update notification data
  * Created/Modified By: Sudhin Sudhakaran
  * Created/Modified Date: 1 Feb 2022
  * Steps:
       1.Check network status
       2.pass data
       3.Return data 
  */
  static performUpdateNotificationItem = async (body = {}, headers = {}) => {
    let url =
      APIConnections.BASE_URL + APIConnections.ENDPOINTS.UPDATE_NOTIFICATION;
    //1
    const isConnected = await NetworkUtils.isNetworkAvailable();
    if (isConnected === false) {
     return [false, t(Translations.NO_INTERNET), null];
    } else {
      const response = await NetworkManager.post(url, body, headers);
      if (response.status === false) {
        return [false, response.message, null];
      } else {
        return [true, response.message, response.data];
      }
    }
  };
  /**
  * Purpose: Perform Update notification list
  * Created/Modified By: Sudhin Sudhakaran
  * Created/Modified Date: 1 Feb 2022
  * Steps:
       1.Check network status
       2.pass data
       3.Return data 
  */
  static performUpdateNotificationList = async (body = {}, headers = {}) => {
    let url =
      APIConnections.BASE_URL +
      APIConnections.ENDPOINTS.UPDATE_NOTIFICATION_ALL;
    //1
    const isConnected = await NetworkUtils.isNetworkAvailable();
    if (isConnected === false) {
     return [false, t(Translations.NO_INTERNET), null];
    } else {
      const response = await NetworkManager.post(url, body, headers);
      if (response.status === false) {
        return [false, response.message, null];
      } else {
        return [true, response.message, response.data];
      }
    }
  };

  /**
    * Purpose: getAverageBookingCountData
    * Created/Modified By: Jenson John
    * Created/Modified Date: 17 Feb 2022
    * Steps:
        1.Check network status
        2.Fetch the data
        3.Return data and other info
    */
  static performDeviceRegister = async (body = {}) => {
    let url =
      APIConnections.BASE_URL + APIConnections.ENDPOINTS.DEVICE_REGISTRATION;
    //1
    const isConnected = await NetworkUtils.isNetworkAvailable();
    if (isConnected === false) {
     return [false, t(Translations.NO_INTERNET), null];
    } else {
      //2
      const response = await NetworkManager.post(url, body);
      //3
      if (response.status === false) {
        return [false, response.message, null];
      } else {
        return [true, response.message, response.data];
      }
    }
  };
  /**
         * Purpose: Get Business List
         * Created/Modified By: Jenson John
         * Created/Modified Date: 27 Dec 2021
         * Steps:
             1.Check network status
             2.Fetch the data
             3.Return data and other info
        */
  static getUpcomingList = async pageNo => {
    let url =
      APIConnections.BASE_URL +
      APIConnections.ENDPOINTS.UPCOMING_LIST +
      '/' +
      pageNo +
      '/10' +
      '?filter=upcoming';
    //1
    const isConnected = await NetworkUtils.isNetworkAvailable();
    if (isConnected === false) {
     return [false, t(Translations.NO_INTERNET), null];
    } else {
      //2
      const response = await NetworkManager.get(url);
      //3
      if (response.status === false) {
        return [false, response.message, null];
      } else {
        return [true, response.message, response.data];
      }
    }
  };
  /**
        * Purpose: Get Business List
        * Created/Modified By: Jenson John
        * Created/Modified Date: 27 Dec 2021
        * Steps:
            1.Check network status
            2.Fetch the data
            3.Return data and other info
       */
  static getPreviousList = async pageNo => {
    let url =
      APIConnections.BASE_URL +
      APIConnections.ENDPOINTS.UPCOMING_LIST +
      '/' +
      pageNo +
      '/10' +
      '?filter=past';
    //1
    const isConnected = await NetworkUtils.isNetworkAvailable();
    if (isConnected === false) {
     return [false, t(Translations.NO_INTERNET), null];
    } else {
      //2
      const response = await NetworkManager.get(url);
      //3
      if (response.status === false) {
        return [false, response.message, null];
      } else {
        return [true, response.message, response.data];
      }
    }
  };

  /**
     * Purpose: Get user details
     * Created/Modified By: Jenson John
     * Created/Modified Date: 04 Jan 2022
     * Steps:
            1.Check network status
            2.Fetch the data
            3.Return data and other info
    */
  static getServiceList = async (queryParams = {}, headers = {}) => {
    let url =
      APIConnections.BASE_URL +
      APIConnections.ENDPOINTS.SERVICES_LIST +
      `/${Globals.BUSINESS_DETAILS?._id}` +
      `?${Utilities.getQueryString(queryParams)}`;
    console.log('URL', url);
    //1
    const isConnected = await NetworkUtils.isNetworkAvailable();
    if (isConnected === false) {
     return [false, t(Translations.NO_INTERNET), null];
    } else {
      //2
      const response = await NetworkManager.get(url, headers);
      //3
      if (response.status === false) {
        return [false, response.message, null];
      } else {
        return [true, response.message, response.data];
      }
    }
  };
  /**
     * Purpose: Get user details
     * Created/Modified By: Jenson John
     * Created/Modified Date: 25 Feb 2022
     * Steps:
            1.Check network status
            2.Fetch the data
            3.Return data and other info
    */
  static getMessagesText = async (headers = {}) => {
    let url = APIConnections.BASE_URL + APIConnections.ENDPOINTS.MESSAGES;
    //1
    const isConnected = await NetworkUtils.isNetworkAvailable();
    if (isConnected === false) {
     return [false, t(Translations.NO_INTERNET), null];
    } else {
      //2
      const response = await NetworkManager.get(url, headers);
      //3
      if (response.status === false) {
        return [false, response.message, null];
      } else {
        return [true, response.message, response.data];
      }
    }
  };

  /**
     * Purpose: Get user details
     * Created/Modified By: Jenson John
     * Created/Modified Date: 25 Feb 2022
     * Steps:
            1.Check network status
            2.Fetch the data
            3.Return data and other info
    */
  static getBookingAppointmentDetails = async (id, headers = {}) => {
    let url =
      APIConnections.BASE_URL +
      APIConnections.ENDPOINTS.BOOKING_APPOINTMENT_DETAILS +
      id;
    //1
    const isConnected = await NetworkUtils.isNetworkAvailable();
    if (isConnected === false) {
     return [false, t(Translations.NO_INTERNET), null];
    } else {
      //2
      const response = await NetworkManager.get(url, headers);
      //3
      if (response.status === false) {
        return [false, response.message, null];
      } else {
        return [true, response.message, response.data];
      }
    }
  };
  /**
  * Purpose: Get user details
  * Created/Modified By: Jenson John
  * Created/Modified Date: 25 Feb 2022
  * Steps:
         1.Check network status
         2.Fetch the data
         3.Return data and other info
 */
  static getQueueAppointmentDetails = async (id, headers = {}) => {
    let url =
      APIConnections.BASE_URL +
      APIConnections.ENDPOINTS.QUEUE_APPOINTMENT_DETAILS +
      id;
    //1
    const isConnected = await NetworkUtils.isNetworkAvailable();
    if (isConnected === false) {
     return [false, t(Translations.NO_INTERNET), null];
    } else {
      //2
      const response = await NetworkManager.get(url, headers);
      //3
      if (response.status === false) {
        return [false, response.message, null];
      } else {
        return [true, response.message, response.data];
      }
    }
  };

  /**
      * Purpose: Get Department List
      * Created/Modified By: Jenson John
      * Created/Modified Date: 07 Mar 2021
      * Steps:
          1.Check network status
          2.Fetch the data
          3.Return data and other info
     */
  static getDepartmentList = async (pageNo, search) => {
    let url =
      APIConnections.BASE_URL +
      APIConnections.ENDPOINTS.DEPARTMENT_LIST +
      '/' +
      pageNo +
      '/10' +
      `?search=${search}`;
    //1
    const isConnected = await NetworkUtils.isNetworkAvailable();
    if (isConnected === false) {
     return [false, t(Translations.NO_INTERNET), null];
    } else {
      //2
      const response = await NetworkManager.get(url);
      //3
      if (response.status === false) {
        return [false, response.message, null];
      } else {
        return [true, response.message, response.data];
      }
    }
  };
  /**
       * Purpose: Get Favourit List
       * Created/Modified By: Jenson John
       * Created/Modified Date: 02 Mar 2021
       * Steps:
           1.Check network status
           2.Fetch the data
           3.Return data and other info
      */
  static getFavouritesList = async () => {
    let url = APIConnections.BASE_URL + APIConnections.ENDPOINTS.FAVOURITE_LIST;
    //1
    const isConnected = await NetworkUtils.isNetworkAvailable();
    if (isConnected === false) {
     return [false, t(Translations.NO_INTERNET), null];
    } else {
      //2
      const response = await NetworkManager.get(url);
      //3
      if (response.status === false) {
        return [false, response.message, null];
      } else {
        return [true, response.message, response.data];
      }
    }
  };
  /**
* Purpose: Cancel appointment
* Created/Modified By: Sudhin Sudhakaran
* Created/Modified Date: 9 feb 2022
* Steps:
     1.Check network status
     2.Fetch the data
     3.Return data and other info
*/
  static cancelAppointment = async (url, body = {}) => {
    //1
    const isConnected = await NetworkUtils.isNetworkAvailable();
    if (isConnected === false) {
     return [false, t(Translations.NO_INTERNET), null];
    } else {
      //2
      const response = await NetworkManager.post(url, body);
      //3
      if (response.status === false) {
        return [false, response.message, null];
      } else {
        return [true, response.message, response.data];
      }
    }
  };

  /**
  * Purpose: Perform notes update
  * Created/Modified By: Jenson John
  * Created/Modified Date: 20 Feb 2022
  * Steps:
      1 .Check network status
      2.Fetch the data
      3.Return data and other info
*/
  static performProfileImageUpload = async body => {
    let url =
      APIConnections.BASE_URL + APIConnections.ENDPOINTS.PROFILE_IMAGE_UPLOAD;
    //1
    const isConnected = await NetworkUtils.isNetworkAvailable();
    if (isConnected === false) {
     return [false, t(Translations.NO_INTERNET), null];
    } else {
      const response = await NetworkManager.uploadFiles(url, body);
      if (response.status === false) {
        return [false, response.message, null];
      } else {
        if (response.status === false) {
          return [false, response.message, null];
        } else {
          return [true, response.message, response.data];
        }
      }
    }
  };

  /**
    * Purpose: Get slots list
    * Created/Modified By: Jenson John
    * Created/Modified Date: 10 Mar 2022
    * Steps:
           1.Check network status
           2.Fetch the data
           3.Return data and other info
   */
  static getBookingSlotList = async (body = {}) => {
    let url =
      APIConnections.BASE_URL + APIConnections.ENDPOINTS.AVAILABLE_BOOKING;
    //1
    const isConnected = await NetworkUtils.isNetworkAvailable();
    if (isConnected === false) {
     return [false, t(Translations.NO_INTERNET), null];
    } else {
      //2
      const response = await NetworkManager.post(url, body);
      //3
      if (response.status === false) {
        return [false, response.message, null];
      } else {
        return [true, response.message, response.data];
      }
    }
  };

  /**
    * Purpose: Get slots list
    * Created/Modified By: Jenson John
    * Created/Modified Date: 10 Mar 2022
    * Steps:
           1.Check network status
           2.Fetch the data
           3.Return data and other info
   */
  static getAllServingUserBookingSlot = async (body = {}) => {
    let url =
      APIConnections.BASE_URL + APIConnections.ENDPOINTS.BOOKING_ALL_SLOT;
    //1
    const isConnected = await NetworkUtils.isNetworkAvailable();
    if (isConnected === false) {
     return [false, t(Translations.NO_INTERNET), null];
    } else {
      //2
      const response = await NetworkManager.post(url, body);
      //3
      if (response.status === false) {
        return [false, response.message, null];
      } else {
        return [true, response.message, response.data];
      }
    }
  };

  /**
* Purpose: Get slots list
* Created/Modified By: Jenson John
* Created/Modified Date: 10 Mar 2022
* Steps:
       1.Check network status
       2.Fetch the data
       3.Return data and other info
*/
  static getQueueSlotList = async (body = {}) => {
    let url =
      APIConnections.BASE_URL + APIConnections.ENDPOINTS.AVAILABLE_QUEUE;
    //1
    const isConnected = await NetworkUtils.isNetworkAvailable();
    if (isConnected === false) {
     return [false, t(Translations.NO_INTERNET), null];
    } else {
      //2
      const response = await NetworkManager.post(url, body);
      //3
      if (response.status === false) {
        return [false, response.message, null];
      } else {
        return [true, response.message, response.data];
      }
    }
  };

  /**
    * Purpose: Get slots list
    * Created/Modified By: Jenson John
    * Created/Modified Date: 10 Mar 2022
    * Steps:
           1.Check network status
           2.Fetch the data
           3.Return data and other info
   */
  static getAllQueueSlots = async (body = {}) => {
    let url = APIConnections.BASE_URL + APIConnections.ENDPOINTS.QUEUE_ALL_SLOT;
    //1
    const isConnected = await NetworkUtils.isNetworkAvailable();
    if (isConnected === false) {
     return [false, t(Translations.NO_INTERNET), null];
    } else {
      //2
      const response = await NetworkManager.post(url, body);
      //3
      if (response.status === false) {
        return [false, response.message, null];
      } else {
        return [true, response.message, response.data];
      }
    }
  };

  /**
       * Purpose: Perform login by email
       * Created/Modified By: Jenson John
       * Created/Modified Date: 28 Dec 2021
       * Steps:
              1.Check network status
              2.Fetch the data
              3.Return data and other info
      */
  static performAddReview = async (body = {}, headers = {}) => {
    let url = APIConnections.BASE_URL + APIConnections.ENDPOINTS.ADD_REVIEW;
    //1
    const isConnected = await NetworkUtils.isNetworkAvailable();
    if (isConnected === false) {
     return [false, t(Translations.NO_INTERNET), null];
    } else {
      const response = await NetworkManager.post(url, body, headers);
      if (response.status === false) {
        return [false, response.message, null];
      } else {
        return [true, response.message, response.data];
      }
    }
  };

  /**
    * Purpose: Get booking payment init info
    * Created/Modified By: Jenson John
    * Created/Modified Date: 10 Mar 2022
    * Steps:
           1.Check network status
           2.Fetch the data
           3.Return data and other info
   */
  static getBookingPaymentInit = async (body = {}) => {
    let url =
      APIConnections.BASE_URL + APIConnections.ENDPOINTS.BOOKING_PAYMENT_INIT;
    //1
    const isConnected = await NetworkUtils.isNetworkAvailable();
    if (isConnected === false) {
     return [false, t(Translations.NO_INTERNET), null];
    } else {
      //2
      const response = await NetworkManager.post(url, body);
      //3
      if (response.status === false) {
        return [false, response.message, null];
      } else {
        return [true, response.message, response.data];
      }
    }
  };

  /**
    * Purpose: Get booking payment init info
    * Created/Modified By: Jenson John
    * Created/Modified Date: 10 Mar 2022
    * Steps:
           1.Check network status
           2.Fetch the data
           3.Return data and other info
   */
  static getQueuePaymentInit = async (body = {}) => {
    let url =
      APIConnections.BASE_URL + APIConnections.ENDPOINTS.QUEUE_PAYMENT_INIT;
    //1
    const isConnected = await NetworkUtils.isNetworkAvailable();
    if (isConnected === false) {
     return [false, t(Translations.NO_INTERNET), null];
    } else {
      //2
      const response = await NetworkManager.post(url, body);
      //3
      if (response.status === false) {
        return [false, response.message, null];
      } else {
        return [true, response.message, response.data];
      }
    }
  };

  /**
    * Purpose: Add booking
    * Created/Modified By: Jenson John
    * Created/Modified Date: 15 Mar 2022
    * Steps:
           1.Check network status
           2.Fetch the data
           3.Return data and other info
   */
  static performAddBooking = async (body = {}) => {
    let url = APIConnections.BASE_URL + APIConnections.ENDPOINTS.ADD_BOOKING;
    //1
    const isConnected = await NetworkUtils.isNetworkAvailable();
    if (isConnected === false) {
     return [false, t(Translations.NO_INTERNET), null];
    } else {
      //2
      const response = await NetworkManager.post(url, body);
      //3
      if (response.status === false) {
        return [false, response.message, null];
      } else {
        return [true, response.message, response.data];
      }
    }
  };

  /**
    * Purpose: Add queue
    * Created/Modified By: Jenson John
    * Created/Modified Date: 15 Mar 2022
    * Steps:
           1.Check network status
           2.Fetch the data
           3.Return data and other info
   */
  static performAddQueue = async (body = {}) => {
    let url = APIConnections.BASE_URL + APIConnections.ENDPOINTS.ADD_QUEUE;
    //1
    const isConnected = await NetworkUtils.isNetworkAvailable();
    if (isConnected === false) {
     return [false, t(Translations.NO_INTERNET), null];
    } else {
      //2
      const response = await NetworkManager.post(url, body);
      //3
      if (response.status === false) {
        return [false, response.message, null];
      } else {
        return [true, response.message, response.data];
      }
    }
  };

  /**
    * Purpose: Reschedule booking
    * Created/Modified By: Jenson John
    * Created/Modified Date: 22 Mar 2022
    * Steps:
           1.Check network status
           2.Fetch the data
           3.Return data and other info
   */
  static performRescheduleBooking = async (body = {}) => {
    let url =
      APIConnections.BASE_URL + APIConnections.ENDPOINTS.RESCHEDULE_BOOKING;
    //1
    const isConnected = await NetworkUtils.isNetworkAvailable();
    if (isConnected === false) {
     return [false, t(Translations.NO_INTERNET), null];
    } else {
      //2
      const response = await NetworkManager.post(url, body);
      //3
      if (response.status === false) {
        return [false, response.message, null];
      } else {
        return [true, response.message, response.data];
      }
    }
  };

  /**
      * Purpose: Get dashboard counts
      * Created/Modified By: Jenson John
      * Created/Modified Date: 29 Mar 2021
      * Steps:
          1.Check network status
          2.Fetch the data
          3.Return data and other info
     */
  static getDashboardCounts = async () => {
    let url =
      APIConnections.BASE_URL + APIConnections.ENDPOINTS.DASHBOARD_COUNTS;
    //1
    const isConnected = await NetworkUtils.isNetworkAvailable();
    if (isConnected === false) {
     return [false, t(Translations.NO_INTERNET), null];
    } else {
      //2
      const response = await NetworkManager.get(url);
      //3
      if (response.status === false) {
        return [false, response.message, null];
      } else {
        return [true, response.message, response.data];
      }
    }
  };

  /**
      * Purpose: Get story list
      * Created/Modified By: Jenson John
      * Created/Modified Date: 29 Mar 2021
      * Steps:
          1.Check network status
          2.Fetch the data
          3.Return data and other info
     */
  static getStoryList = async pageNo => {
    let url =
      APIConnections.BASE_URL +
      APIConnections.ENDPOINTS.STORY_LIST +
      '/' +
      Globals.BUSINESS_ID +
      '/' +
      pageNo +
      '/20';
    //1
    const isConnected = await NetworkUtils.isNetworkAvailable();
    if (isConnected === false) {
     return [false, t(Translations.NO_INTERNET), null];
    } else {
      //2
      const response = await NetworkManager.get(url);
      //3
      if (response.status === false) {
        return [false, response.message, null];
      } else {
        return [true, response.message, response.data];
      }
    }
  };

  /**
    * Purpose: Report late
    * Created/Modified By: Jenson John
    * Created/Modified Date: 22 Mar 2022
    * Steps:
           1.Check network status
           2.Fetch the data
           3.Return data and other info
   */
  static performReportLate = async (isBooking = true, body = {}) => {
    var url =
      APIConnections.BASE_URL + APIConnections.ENDPOINTS.REPORT_LATE_BOOKING;
    if (isBooking === false) {
      url =
        APIConnections.BASE_URL + APIConnections.ENDPOINTS.REPORT_LATE_QUEUE;
    }
    //1
    const isConnected = await NetworkUtils.isNetworkAvailable();
    if (isConnected === false) {
     return [false, t(Translations.NO_INTERNET), null];
    } else {
      //2
      const response = await NetworkManager.post(url, body);
      //3
      if (response.status === false) {
        return [false, response.message, null];
      } else {
        return [true, response.message, response.data];
      }
    }
  };
  /**
  * Purpose: Mark attendance
  * Created/Modified By: Jenson John
  * Created/Modified Date: 22 Mar 2022
  * Steps:
         1.Check network status
         2.Fetch the data
         3.Return data and other info
 */
  static performMarkAttendance = async (body = {}) => {
    let url =
      APIConnections.BASE_URL + APIConnections.ENDPOINTS.MARK_ATTENDANCE;
    //1
    const isConnected = await NetworkUtils.isNetworkAvailable();
    if (isConnected === false) {
     return [false, t(Translations.NO_INTERNET), null];
    } else {
      //2
      const response = await NetworkManager.post(url, body);
      //3
      if (response.status === false) {
        return [false, response.message, null];
      } else {
        return [true, response.message, response.data];
      }
    }
  };
  /**
* Purpose: Mark attendance
* Created/Modified By: Jenson John
* Created/Modified Date: 22 Mar 2022
* Steps:
   1.Check network status
   2.Fetch the data
   3.Return data and other info
*/
  static performGetTodaysAppointments = async (body = {}) => {
    let url =
      APIConnections.BASE_URL + APIConnections.ENDPOINTS.TODAYS_APPOINTMENTS;
    //1
    const isConnected = await NetworkUtils.isNetworkAvailable();
    if (isConnected === false) {
     return [false, t(Translations.NO_INTERNET), null];
    } else {
      //2
      const response = await NetworkManager.post(url, body);
      //3
      if (response.status === false) {
        return [false, response.message, null];
      } else {
        return [true, response.message, response.data];
      }
    }
  };

  /**
       * Purpose: Perform update view status of appointment
       * Created/Modified By: Jenson John
       * Created/Modified Date: 28 Dec 2021
       * Steps:
              1.Check network status
              2.Fetch the data
              3.Return data and other info
      */
  static performUpdateAppointmentViewStatus = async (
    type,
    body = {},
    headers = {},
  ) => {
    var url =
      APIConnections.BASE_URL +
      APIConnections.ENDPOINTS.UPDATE_QUEUE_VIEW_STATUS;
    if (type === 'Booking'.toUpperCase()) {
      url =
        APIConnections.BASE_URL +
        APIConnections.ENDPOINTS.UPDATE_BOOKING_VIEW_STATUS;
    }
    //1
    const isConnected = await NetworkUtils.isNetworkAvailable();
    if (isConnected === false) {
     return [false, t(Translations.NO_INTERNET), null];
    } else {
      const response = await NetworkManager.post(url, body, headers);
      if (response.status === false) {
        return [false, response.message, null];
      } else {
        return [true, response.message, response.data];
      }
    }
  };
  /**
     * Purpose: Perform logout
     * Created/Modified By:Sudhin Sudhakaran
     * Created/Modified Date: 21 FEB 2022
     * Steps:
         1 .Check network status
         2.Fetch the data
         3.Return data and other info
  */
  static performLogOut = async body => {
    let url = APIConnections.BASE_URL + APIConnections.ENDPOINTS.LOGOUT;
    //1
    const isConnected = await NetworkUtils.isNetworkAvailable();
    if (isConnected === false) {
      return [false, t(Translations.NO_INTERNET), null];
    } else {
      const response = await NetworkManager.post(url, body);
      if (response.status === false) {
        return [false, response.message, null];
      } else {
        if (response.status === false) {
          return [false, response.message, null];
        } else {
          return [true, response.message, response.data];
        }
      }
    }
  };
}
