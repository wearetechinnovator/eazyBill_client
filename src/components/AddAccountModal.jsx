import React, { useEffect, useState } from 'react'
import { Drawer, Modal } from 'rsuite';
import { useDispatch } from 'react-redux';
import { AddAccountComponent } from '../pages/Accounts/AddAccount';


const AddAccountModal = ({ open, onClose }) => {
  const [isOpen, setIsOpen] = useState(null);

  useEffect(() => {
    setIsOpen(open);
  }, [open])

  return (
    <div className='item__modal'>
      <Drawer open={isOpen} size={600} onClose={() => {
        setIsOpen(false);
        onClose(false);
      }}>
        <Drawer.Header>
          <h6 className='py-2'>Add Account</h6>
        </Drawer.Header>
        <Drawer.Body>
          <AddAccountComponent onSave={(status) => {
            setIsOpen(status);
            onClose(status);
          }} />
        </Drawer.Body>
      </Drawer>
    </div>
  )
}



export default AddAccountModal;