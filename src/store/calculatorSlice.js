import { createSlice } from "@reduxjs/toolkit";

const calculatorSlice = createSlice({
  name: 'calculator',
  initialState: {
    show: 0 //0=close, 1=open, 2=minimize
  },
  reducers: {
    calcToggle: (state, action) => {
      state.show = action.payload;
    },
 
  }
})

export const { calcToggle } = calculatorSlice.actions;
export default calculatorSlice.reducer;
