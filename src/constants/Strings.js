import {BUILD_SOURCE} from '../helpers/enums/Enums';
import Globals from './Globals';
export default {
  APP_NAME: 'Ywait',
  APP_VERSION_NUMBER:
    Globals.CUSTOM_BUILD_SOURCE === BUILD_SOURCE.FIRSTRESPONSE
      ? '0.0.4'
      : Globals.CUSTOM_BUILD_SOURCE === BUILD_SOURCE.YWAITSERVICES
      ? '0.0.12'
      : '0.1.69',
  NO_INTERNET: 'No internet connection!',
  SERVER_BUSY: 'Server busy!',
  UNKNOWN_ERROR: 'The application has encountered an unknown error.',
  PAYMENT_ERROR: 'Payment info missing. Please try after some time.',
  TOKEN_NOT_FOUND: 'Authorization token not found!.',
  NOT_AUTH_TO_USE_APP: 'You are not authorized to login to the app.',
  LOGIN: 'Login',
  REGISTER: 'Register',
  EMAIL_ADDRESS: 'Email Address',
  INVALID_EMAIL_ADDRESS: 'Please enter valid email address',
  PASSWORD: 'Password',
  INVALID_PASSWORD: 'Please enter a password',
  FORGOT_PASSWORD: 'Forgot Password?',
  CONTINUE: 'Continue',
  PHONE_LOGIN_DESCRIPTION:
    'please enter your mobile number to register and proceed',
  MOBILE_NUMBER: 'Mobile Number',
  INVALID_PHONE_NUMBER: 'Please enter valid phone number',
  //PIN Verify
  ENTER_PIN: 'Enter PIN',
  PIN_VERIFY_DESCRIPTION: 'Enter your PIN number\nto use the Ywait',
  VERIFY: 'Verify',
  FORGOT_PIN: 'Forgot PIN',
  INVALID_PIN: 'Please enter valid PIN to proceed.',
  //New PIN
  NEW_PIN: 'New PIN',
  NEW_PIN_DESCRIPTION: 'Enter your New PIN',
  NEXT: 'Next',
  SKIP: 'Skip',
  //Confirm PIN
  CONFIRM_PIN: 'Confirm PIN',
  CONFIRM_PIN_DESCRIPTION: 'Confirm your New PIN',
  CONFIRM: 'Confirm',
  BACK: 'Back',
  PIN_DONT_MATCH: 'PIN do not match',
  //Forgot Password
  FORGOT_PASSWORD_TITLE: 'Forgot Password',
  FORGOT_PASSWORD_DESCRIPTION:
    'Enter your email to\nreceive the confirmation link',
  FORGOT_PASSWORD_SUCCESS:
    'An email has been sent with instructions to reset your password.',
  EMAIL_PLACEHOLDER: 'xxxxyxxxyxxxy@email.com',
  SEND: 'Send',
  CANCEL: 'Cancel',
  //Reset Password
  RESET_PASSWORD: 'Reset Password',
  RESET_PASSWORD_DESCRIPTION: 'Please enter a new password\nand confirm it.',
  CONFIRM_PASSWORD: 'Confirm Password',
  RESET_NOW: 'Reset Now',
  //Forgot Pin
  FORGOT_PIN_DESCRIPTION: 'Verify your email to\nreset PIN.',
  //Profile
  PROFILE: 'Profile',
  CHANGE_PHOTO: 'Change Photo',
  UPDATE_EMAIL: 'Update email',
  CHANGE_PASSWORD: 'Change password',
  LOGOUT: 'Log Out',
  EDIT_PERSONAL_INFO: 'Edit personal info',
  PIN_AUTH: 'Pin authentication',
  UPDATE_PIN: 'Update pin',
  PERSONAL_INFO: 'Personal Info',
  //Profile update
  TELL_US_MORE: 'Tell us more to serve you better',
  PROFILE_UPDATE: 'Profile Update',
  PROFILE_UPDATED_SUCCESS: 'Profile updated successfully',
  UPDATE: 'Update',
  //Country Popup
  SELECT_COUNTRY: 'Select Country',
  //File upload
  SELECT_AN_OPTION: 'Select an option',
  FILES: 'Files',
  GALLERY: 'Gallery',
  CAMERA: 'Camera',
  REMOVE_ATTACHMENT_CONFIRM_MESSAGE:
    'Are you sure you want to remove this attachment?',
  //Alert confirm popup
  PLEASE_CONFIRM: 'Please confirm',
  NO: 'No',
  YES: 'Yes',
  YES_IM_SURE: "Yes I'm sure",
  //BottomBar
  NEW_BOOKING: 'New Booking',
  FAVORITES: 'Favorites',
  PLEASE_ADD_VITALS: 'Please add vitals',
  //Add customer
  CREATE_CUSTOMER: 'Create Customer',
  CREATE: 'Create',
  CREATE_CUSTOMER_SUCCESS: 'Customer created successfully',
  //Add vitals
  ADD_VITALS: 'Add Vitals',
  EDIT_VITALS: 'Edit Vitals',
  SAVE: 'Save',
  VITALS_SAVED_SUCCESS: 'Vitals saved successfully',
  //Change password
  CHANGE_NOW: 'Change Now',
  CHANGE_PASSWORD_DESCRIPTION:
    'Please enter your old, new passwords\nand confirm it.',
  OLD_PASSWORD: 'Old Password',
  NEW_PASSWORD: 'New Password',
  CONFIRM_NEW_PASSWORD: 'Confirm New Password',
  //Change email
  EMAIL_UPDATE: 'Email Update',
  EMAIL_UPDATE_DESCRIPTION:
    'Enter your new email to \nreceive a password to login again.',
  EMAIL_RESET_MESSAGE:
    'An email has been sent to your email address.\nFollow the instructions to update email.',
};
