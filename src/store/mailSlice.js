import { createSlice } from "@reduxjs/toolkit";

const mailModalSlice = createSlice({
  name: "mailModal",
  initialState: { show: false },
  reducers: {
    toggle: (state, action) => {
      state.show = action.payload;
    }
  }
})



export const { toggle, setData } = mailModalSlice.actions;
export default mailModalSlice.reducer;