export enum UploadTypes {
  file = 'File',
  camera = 'Camera',
  image = 'Image',
  none = 'None',
}

export enum BUILD_SOURCE {
  YWAIT = 'YWAIT',
  SKILLIKZ = 'SKILLIKZ',
  PRINCECOURT = 'PRINCECOURT',
  ADVENTA = 'ADVENTA',
  SPOTLESS = 'SPOTLESS',
  ASTER = 'ASTER',
  FIRSTRESPONSE = 'FIRSTRESPONSE',
  YWAITSERVICES= 'YWAITSERVICES'
}

export enum QueueStatus {
  notArrived = 'NotArrived',
  arrived = 'Arrived',
  serving = 'Serving',
  fulfilled = 'Fulfilled',
}

export enum AppointmentType {
  booking = 'booking',
  queue = 'queue',
}

export enum AddVitalType {
  beforeConsultation = 'before-consultation',
  afterConsultation = 'after-consultation',
  anyTime = 'anytime',
  optional = 'optional',
}

export enum AlertConfirmPopupSource {
  session,
  moveToFulFilled,
  removeDirectCheckIn,
  none,
}

export enum AccessModules {
  manageQueue = 'MANAGE QUEUE',
  customers = 'CUSTOMERS',
  appointments = 'APPOINTMENTS',
  notes = 'Notes',
  calendar = 'CALENDER',
  payment = 'PAYMENT',
}

export enum AccessPermissions {
  view,
  edit,
  create,
  delete,
}

export enum GuestUserAuthSource {
  dashboardUserProfile,
  favoritesList,
  notificationList,
  newBooking,
  newQueueBooking,
  scanQr,
  none,
}

export enum PaymentGateway {
  stripe,
  razorpay,
  none,
}
