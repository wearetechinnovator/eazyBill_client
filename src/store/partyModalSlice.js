import { createSlice } from "@reduxjs/toolkit";

const partyModalSlice = createSlice({
  name:"partyModal",
  initialState: {show: false},
  reducers:{
    toggle:(state, action)=>{
      state.show = action.payload;
    }
  }
})



export const {toggle} = partyModalSlice.actions;
export default partyModalSlice.reducer;