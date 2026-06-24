import {createSlice} from '@reduxjs/toolkit';

const barcodeModal = createSlice({
    name: 'barcodeModal',
    initialState: {show: false},
    reducers: {
        toggleBarCodeModal:(state, action)=>{
            state.show = action.payload;
        }
    }
})

export const {toggleBarCodeModal} = barcodeModal.actions
export default barcodeModal.reducer;
