import React from 'react';
import { IoIosAdd } from "react-icons/io";
import { CiSearch } from "react-icons/ci";
import { CiViewList } from "react-icons/ci";
import noRecord from '../assets/images/norecord.svg'
import { useNavigate } from 'react-router-dom';





const AddNew = ({ title, link }) => {
  const navigate = useNavigate();

  return (
    <div className='add_new_compnent'>
      <div className='w-full bg-white rounded shadow-sm p-4 grid place-items-center'>
        <img src={noRecord} alt="" srcSet="" />
        <p className='mb-3 text-lg text-gray-400'>You don't have any {title}</p>
        <button 
          onClick={()=>{
            navigate(link)
          }}
        className='bg-[#003E32] text-white mb-2'>Add {title}</button>
      </div>
    </div>
  )
}

export default AddNew