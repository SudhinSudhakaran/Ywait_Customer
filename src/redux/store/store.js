import {configureStore} from '@reduxjs/toolkit';
import ConsultantListSlice from '../slice/ConsultantListSlice';
const store = configureStore({
  reducer: {
    consultantlist: ConsultantListSlice,
  },
});

export default store;