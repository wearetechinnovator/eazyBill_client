import React, { useEffect, useState } from 'react'
import { Modal } from 'rsuite';
import { useDispatch } from 'react-redux';
import { toggle } from '../store/partyModalSlice';
import Cookies from 'js-cookie';
import useMyToaster from '../hooks/useMyToaster';



// Add party category and update Party Category;
// ::::::::::::::::::::::::::::::::::::::::::::::

const AddPartyModal = ({ open, get, id }) => {
  const dispatch = useDispatch();
  const [data, setData] = useState({ name: '' });
  const toast = useMyToaster();



  useEffect(() => {
    const getPartyCategory = async () => {
      if (!id) return;
      const token = Cookies.get('token');
      const url = process.env.REACT_APP_API_URL + "/partycategory/get/";

      try {
        const req = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ token, id: id })
        });

        const res = await req.json();

        if (req.status !== 200) {
          toast(res.error, 'error')
          return;
        }

        setData({ name: res.name });
      } catch (error) {
        console.log(error);
        toast('Something went wrong!', 'error')
      }
    }

    if (id) {
      getPartyCategory();
    } else {
      setData({ name: '' });
    }

  }, [id])


  const savePartyCategory = async () => {
    if (!data.name) {
      toast('Please enter a category name!', 'error')
      return;
    }

    const token = Cookies.get('token');
    const url = process.env.REACT_APP_API_URL + "/partycategory/add";
    const sendData = { ...data, token };

    if (id) {
      sendData['update'] = true;
      sendData['id'] = id;
    }

    try {
      const req = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(sendData)
      });

      const res = await req.json();

      if (req.status !== 200) {
        toast(res.error, 'error')
        return;
      }

      if(get){
        id ? get(data.name) : get(res);
      }
      setData({ name: '' });
      toast('Party category added successfully!', 'success')
      dispatch(toggle(false));
      return;

    } catch (error) {
      console.log(error);
      toast('Something went wrong!', 'error')
    }
  }


  return (
    <div className='party__modal'>
      <Modal open={open} size={400} onClose={() => {
        dispatch(toggle(false))
      }}>
        <Modal.Header>
          <h6 className='py-2'>Add Party Category</h6>
        </Modal.Header>
        <Modal.Body>
          <div className='border-t pt-7 border-gray-300'>
            <p className='mb-1 text-[12px]'>Category Name</p>
            <input type="text"
              onChange={(e) => setData({ ...data, name: e.target.value })}
              value={data.name}
            />
          </div>
          <button
            onClick={savePartyCategory}
            className='px-3 py-2 mt-3 bg-blue-800 text-white rounded-md'
          >Save</button>
        </Modal.Body>
      </Modal>
    </div>
  )
}



export default AddPartyModal