/**
 * @format
 */
import {AppRegistry, Platform, I18nManager} from 'react-native';
import 'react-native-gesture-handler';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import PushNotification, {Importance} from 'react-native-push-notification';
import Globals from './src/constants/Globals';
import App from './App';
import {name as appName} from './app.json';
import * as RootNavigation from './src/navigators/RootNavigator';

console.log(`<><><><>RTL Index  : <><><><>`, `${I18nManager.isRTL}`);

PushNotification.getChannels(function (channels) {
  console.log('getchannels gives us', channels);
});

PushNotification.createChannel(
  {
    channelId: 'fcm_fallback_notification_channel', // (required)
    channelName: 'My channel', // (required)
    channelDescription: 'A channel to categorise your notifications', // (optional) default: undefined.
    playSound: true, // (optional) default: true
    soundName: 'default', // (optional) See `soundName` parameter of `localNotification` function
    importance: Importance.HIGH, // (optional) default: Importance.HIGH. Int value of the Android notification importance
    vibrate: true, // (optional) default: true. Creates the default vibration pattern if true.
  },
  created => console.log(`createChannel returned '${created}'`), // (optional) callback returns whether the channel was created, false means it already existed.
);

// Must be outside of any component LifeCycle (such as `componentDidMount`).
PushNotification.configure({
  // (optional) Called when Token is generated (iOS and Android)
  onRegister: function (token) {
    console.log('@Index TOKEN:', token);
    if (Platform.OS === 'ios') {
      Globals.APNS_TOKEN = token.token;
    } else {
      Globals.PUSH_NOTIFICATION_TOKEN = token.token;
    }
  },

  // (required) Called when a remote is received or opened, or local notification is opened
  onNotification: function (notification) {
    try {
      console.log('NOTIFICATION:', notification);
      console.log('notification.data.notifyType:', notification.data.type);
      var _selectedNotificationId = notification.data.booking_id
        ? notification.data.booking_id.replace(/['"]+/g, '')
        : notification.data.waitlist_id.replace(/['"]+/g, ''); //removing the single quotes
      var _notificationType = notification.data.booking_id
        ? 'Booking'
        : 'Queue';
      // process the notification

      if (
        notification.data.type !== undefined &&
        notification.userInteraction === false
      ) {
        PushNotification.localNotification(notification);
      } else if (notification.userInteraction) {
        Globals.NOTIFICATION_DATA = notification;
        console.log('notification opened:', notification.data.type);
        //console.log('IS AUTHORIZED:', Globals.IS_AUTHORIZED);
        if (notification.data.type !== undefined) {
          if (notification.foreground) {
            if (
              notification.data.type === 'SCHEDULE-NEXT-VISIT-REMINDER' ||
              notification.data.type === 'NEXT-VISIT-REMINDER-BOOKING' ||
              notification.data.type === 'NEXT-VISIT-REMINDER-QUEUE'
            ) {
              console.log('navigation start');
              RootNavigation.navigate('PreviousAppointmentDetails', {
                selectedAppointment_id: _selectedNotificationId,
                selectedAppointmentType: _notificationType,
                isFrom: 'PUSH_NOTIFICATION',
              });
            } else {
              Globals.IS_NOTIFICATION_NAVIGATION_NEEDED = true;
            }
          } else {
            console.log('APP awake from background');
            Globals.IS_NOTIFICATION_NAVIGATION_NEEDED = true;
          }
        }
      }

      if (Platform.OS === 'ios') {
        // (required) Called when a remote is received or opened, or local notification is opened
        notification.finish(PushNotificationIOS.FetchResult.NoData);
      }
    } catch (e) {
      console.log('Error onNotification:', e);
    }
  },

  // (optional) Called when Registered Action is pressed and invokeApp is false, if true onNotification will be called (Android)
  onAction: function (notification) {
    console.log('ACTION:', notification.action);
    console.log('NOTIFICATION:', notification);
    // process the action
  },

  // (optional) Called when the user fails to register for remote notifications. Typically occurs when APNS is having issues, or the device is a simulator. (iOS)
  onRegistrationError: function (err) {
    console.error(err.message, err);
  },

  // IOS ONLY (optional): default: all - Permissions to register.
  permissions: {
    alert: true,
    badge: true,
    sound: true,
  },

  // Should the initial notification be popped automatically
  // default: true

  popInitialNotification: true,

  /**
   * (optional) default: true
   * - Specified if permissions (ios) and token (android and ios) will requested or not,
   * - if not, you must call PushNotificationsHandler.requestPermissions() later
   * - if you are not using remote notification or do not have Firebase installed, use this:
   *     requestPermissions: Platform.OS === 'ios'
   */

  requestPermissions: true,
});

AppRegistry.registerComponent(appName, () => App);
