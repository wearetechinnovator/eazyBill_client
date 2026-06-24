import { createSlice } from '@reduxjs/toolkit'


const userDetailSlice = createSlice({
  name: "userDetails",
  initialState: {},
  reducers: {
    add: (state, action) => {
      Object.assign(state, action.payload)
    },

    addCompany: (state, action) => {
      state.companies.push(action.payload);
    }
  }
})


export const { add, addCompany } = userDetailSlice.actions;
export default userDetailSlice.reducer;
