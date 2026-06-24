import { createSlice } from "@reduxjs/toolkit";

const itemModalSlice = createSlice({
  name: 'itemModal',
  initialState: {show: false},
  reducers:{
    toggle:(state, action)=>{
      state.show = action.payload;
    }
  }
})



export const {toggle} = itemModalSlice.actions;
export default itemModalSlice.reducer;
