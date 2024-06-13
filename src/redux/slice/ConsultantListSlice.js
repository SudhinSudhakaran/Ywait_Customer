import {createSlice} from '@reduxjs/toolkit';
const ConsultantListSlice = createSlice({
  name: 'consultantlist',
  initialState: {
  consultantlist:{}
  },
  reducers: {
    setConsultantList:(state,actions)=> {
        state.consultantlist = actions.payload
      },
  },
});

export const {setConsultantList} = ConsultantListSlice.actions;
export default ConsultantListSlice.reducer;