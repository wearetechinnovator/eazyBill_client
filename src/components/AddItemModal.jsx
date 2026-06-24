import React from 'react'
import { Modal } from 'rsuite';
import { AddItemComponent } from '../pages/Items/ItemAdd';
import { useDispatch } from 'react-redux';
import { toggle } from '../store/itemModalSlice';


const AddItemModal = ({ open }) => {
  const dispatch = useDispatch();


  return (
    <div className='item__modal'>
      <Modal open={open} size={600} onClose={() => {
        dispatch(toggle(false))
        window.location.reload(); //this reload is important for add new party to list;
      }}>
        <Modal.Header>
          <h6 className='py-2'>Add Item</h6>
        </Modal.Header>
        <Modal.Body>
          <AddItemComponent />
        </Modal.Body>
      </Modal>
    </div>
  )
}



export default AddItemModal;