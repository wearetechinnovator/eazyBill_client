import { createSlice } from "@reduxjs/toolkit";

const companyListModal = createSlice({
  name: "CompanyListModal",
  initialState: { show: false },
  reducers: {
    toggleModal: (state, action) => {
      state.show = action.payload;
    },
  }
})

export const { toggleModal } = companyListModal.actions;
export default companyListModal.reducer;
