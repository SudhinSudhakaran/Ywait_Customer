import React from 'react';
import {View, Text} from 'react-native';
import {navigationRef} from './RootNavigator';
import SplashScreen from '../screens/splash/SplashScreen';
import {NavigationContainer} from '@react-navigation/native';
import MyVisitList from '../screens/myVisitList/MyVisitList';
import ScanQrScreen from '../screens/scanQrCode/ScanQrCodeScreen';
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import Toast, {BaseToast, ErrorToast} from 'react-native-toast-message';
import ServiceListScreen from '../screens/serviceList/ServiceListScreen';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import EmailLoginScreen from '../screens/login/emailLogin/emailLoginScreen';
import PhoneLoginScreen from '../screens/login/phoneLogin/phoneLoginScreen';
import FavouriteListScreen from '../screens/favourites/FavouriteListScreen';
import BookingQueueScreen from '../screens/bookingQueue/BookingQueueScreen';
import OtpValidationScreen from '../screens/login/otpValidation/OtpValidation';
import PasswordResetScreen from '../screens/passwordReset/PasswordResetScreen';
import ChangeEmailScreen from '../screens/profile/changeEmail/ChangeEmailScreen';
import UserProfileScreen from '../screens/profile/userProfile/UserProffileScreen';
import ForgotPasswordScreen from '../screens/forgotPassword/ForgotPasswordScreen';
import SpecialistListScreen from '../screens/specialistList/SpecialistListScreen';
import LanguageListScreen from '../screens/profile/languageList/LanguageListScreen';
import LoginRegisterScreen from '../screens/login/loginRegister/LoginRegisterScreen';
import GenderSelectionScreen from '../screens/genderSelection/GenderSelectionScreen';
import NotificationListScreen from '../screens/notifications/NotificationListScreen';
import FilePreviewScreen from '../screens/shared/filePreviewScreen/FilePreviewScreen';
import UpdateProfileScreen from '../screens/profile/updateProfile/UpdateProfileScreen';
import RegisterUpdateScreen from '../screens/login/registerUpdate/RegisterUpdateScreen';
import RegisterScreen from '../screens/login/loginRegister/registerScreen/RegisterScreen';
import ChangePasswordScreen from '../screens/profile/changePassword/ChangePasswordScreen';
import BusinessSelectionScreen from '../screens/businessSelection/BusinessSelectionScreen';
import PreviousAppointmentDetails from '../screens/previousDetails/PreviousAppointmentDetails';
import { Colors ,Translations,Fonts} from '../constants';
const RootStack = () => {
  const Stack = createNativeStackNavigator();


const toastConfig = {
  /*
    Overwrite 'success' type,
    by modifying the existing `BaseToast` component
  */
  success: props => (
    <BaseToast
      {...props}
      style={{borderLeftColor: Colors.GREEN_COLOR}}
      contentContainerStyle={{paddingHorizontal: 15}}
      text1Style={{
        fontSize: 12,
        marginTop: 5,
        textAlign: 'left',
      }}
      text2Style={{
        fontSize: 10,
        textAlign: 'left',
      }}
    />
  ),
  /*
    Overwrite 'error' type,
    by modifying the existing `ErrorToast` component
  */
  error: props => (
    <ErrorToast
      {...props}
      style={{borderLeftColor: Colors.ERROR_RED_COLOR}}
      contentContainerStyle={{paddingHorizontal: 15}}
      text1Style={{
        fontSize: 12,
        marginTop: 5,
        textAlign: 'left',
      }}
      text2Style={{
        fontSize: 10,
        textAlign: 'left',
      }}
    />
  ),
  /*
    Overwrite 'success' type,
    by modifying the existing `BaseToast` component
  */
  info: props => (
    <BaseToast
      {...props}
      style={{borderLeftColor: '#5ED4FF'}}
      contentContainerStyle={{paddingHorizontal: 15}}
      text1Style={{
        fontSize: 12,
        marginTop: 5,
        textAlign: 'left',
      }}
      text2Style={{
        fontSize: 10,
        textAlign: 'left',
      }}
    />
  ),

  /*
    Or create a completely new type - `tomatoToast`,
    building the layout from scratch.

    I can consume any custom `props` I want.
    They will be passed when calling the `show` method (see below)
  */
  tomatoToast: ({text1, props}) => (
    <View
      style={{
        height: 50,
        width: '80%',
        backgroundColor: 'black',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Text style={{color: 'white', textAlign: 'left'}}>{text1}</Text>
    </View>
  ),
};





  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name="SplashScreen" component={SplashScreen} />
        <Stack.Screen
          name="BusinessSelectionScreen"
          component={BusinessSelectionScreen}
        />
        <Stack.Screen name="EmailLoginScreen" component={EmailLoginScreen} />
        <Stack.Screen name="PhoneLoginScreen" component={PhoneLoginScreen} />
        <Stack.Screen
          name="OtpValidationScreen"
          component={OtpValidationScreen}
        />
        <Stack.Screen
          name="LoginRegisterScreen"
          component={LoginRegisterScreen}
        />
        <Stack.Screen name="DashboardScreen" component={DashboardScreen} />
        <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
        <Stack.Screen
          name="RegisterUpdateScreen"
          component={RegisterUpdateScreen}
        />
        <Stack.Screen name="FilePreviewScreen" component={FilePreviewScreen} />
        <Stack.Screen
          name="PasswordResetScreen"
          component={PasswordResetScreen}
        />
        <Stack.Screen name="UserProfileScreen" component={UserProfileScreen} />
        <Stack.Screen
          name="UpdateProfileScreen"
          component={UpdateProfileScreen}
        />
        <Stack.Screen
          name="ChangePasswordScreen"
          component={ChangePasswordScreen}
        />
        <Stack.Screen name="ChangeEmailScreen" component={ChangeEmailScreen} />
        <Stack.Screen
          name="ForgotPasswordScreen"
          component={ForgotPasswordScreen}
        />
        <Stack.Screen
          name="GenderSelectionScreen"
          component={GenderSelectionScreen}
        />
        <Stack.Screen
          name="SpecialistListScreen"
          component={SpecialistListScreen}
        />
        <Stack.Screen
          name="NotificationListScreen"
          component={NotificationListScreen}
        />
        <Stack.Screen name="MyVisitList" component={MyVisitList} />
        <Stack.Screen name="ServiceListScreen" component={ServiceListScreen} />
        <Stack.Screen
          name="FavouriteListScreen"
          component={FavouriteListScreen}
        />
        <Stack.Screen
          name="PreviousAppointmentDetails"
          component={PreviousAppointmentDetails}
        />
        <Stack.Screen
          name="BookingQueueScreen"
          component={BookingQueueScreen}
        />
        <Stack.Screen name="ScanQrScreen" component={ScanQrScreen} />
        <Stack.Screen
          name="LanguageListScreen"
          component={LanguageListScreen}
        />
      </Stack.Navigator>
      <Toast setRef={Toast.setRootRef} config={toastConfig} />
    </NavigationContainer>
  );
};

export default RootStack;
