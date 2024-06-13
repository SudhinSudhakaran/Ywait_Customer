import {Platform} from 'react-native';
import RNCalendarEvents from 'react-native-calendar-events';
import moment from 'moment';

const _ = require('lodash');
const MY_CALENDAR = 'MY_CALENDAR';

//https://zheeno.medium.com/calendar-events-and-reminders-with-react-native-a2d9973c0e92
class ReminderService {
  constructor() {
    this.hasAccess = false;
    this.calendarId = null;
  }

  addEvent(data) {
    return new Promise((resolve, reject) => {
      try {
        const {
          title,
          description,
          notes,
          startDate,
          endDate,
          location,
          recurrence,
          alarmDate,
          calenderId,
        } = data;
        RNCalendarEvents.saveEvent(title, {
          title: title,
          notes: notes,
          description: description,
          skipAndroidTimezone: true,
          startDate: startDate,
          endDate: endDate,
          calendarId: calenderId,
          location: location,
          event: true,
          alarms: [{date: alarmDate}],
          recurrence: recurrence,
        })
          .then(event => {
            console.log('Event created', event);
            resolve(event);
          })
          .catch(error => {
            reject(error);
          });
      } catch (error) {
        reject(error);
      }
    });
  }

  updateEvent(data) {
    return new Promise((resolve, reject) => {
      try {
        const {
          title,
          startDate,
          endDate,
          location,
          recurrence,
          alarmDate,
          calenderId,
          eventId,
        } = data;
        RNCalendarEvents.saveEvent(title, {
          id: eventId,
          title: title,
          // notes: note,
          // description: note,
          startDate: startDate,
          endDate: endDate,
          calendarId: calenderId,
          location: location,
          event: true,
          alarms: [{date: alarmDate}],
          recurrence: recurrence,
        })
          .then(event => {
            console.log('Event created', event);
            resolve(event);
          })
          .catch(error => {
            reject(error);
          });
      } catch (error) {
        reject(error);
      }
    });
  }

  getEvents(startDate, endDate, calendarId) {
    console.log('GET EVENTS');
    return new Promise((resolve, reject) => {
      RNCalendarEvents.fetchAllEvents(startDate, endDate, [calendarId])
        .then(events => {
          resolve(
            _.orderBy(events, function (event) {
              return moment(event.startDate);
            }),
          );
        })
        .catch(error => {
          reject(error);
        });
    });
  }
}

export default ReminderService;
