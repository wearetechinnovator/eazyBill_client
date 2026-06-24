import React, { useState } from 'react'
import Nav from '../../components/Nav';
import SideNav from '../../components/SideNav';
import { Pagination } from 'rsuite';
import { BiPrinter } from "react-icons/bi";
import { FaRegCopy } from "react-icons/fa";
import { MdEditSquare } from "react-icons/md";
import { IoInformationCircle } from "react-icons/io5";
import { FaRegFilePdf } from "react-icons/fa";
import { FaRegFileExcel } from "react-icons/fa";
import { MdAdd } from "react-icons/md";
import { MdOutlineCancel } from "react-icons/md";
import { MdOutlineRestorePage } from "react-icons/md";
import { MdDeleteOutline } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import useExportTable from '../../hooks/useExportTable';

const Role = () => {
  const copyTable = useExportTable()
  const [activePage, setActivePage] = useState(1);
  const [selected, setSelected] = useState([]);
  const navigate = useNavigate();

  const searchTable = (e) => {
    const value = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('.list__table tbody tr');

    rows.forEach(row => {
      const cols = row.querySelectorAll('td');
      let found = false;
      cols.forEach((col, index) => {
        if (index !== 0 && col.innerHTML.toLowerCase().includes(value)) {
          found = true;
        }
      });
      if (found) {
        row.style.display = "";
      } else {
        row.style.display = "none";
      }
    });
  }

  const selectAll = (e) => {
    if (e.target.checked) {
      setSelected(Array.from({ length: 10 }, (_, i) => i));
    } else {
      setSelected([]);
    }
  };

  const handleCheckboxChange = (index) => {
    setSelected((prevSelected) => {
      if (prevSelected.includes(index)) {
        return prevSelected.filter((i) => i !== index);
      } else {
        return [...prevSelected, index];
      }
    });
  };

  return (
    <>
      <Nav title={"Tax"} />
      <main id='main'>
        <SideNav />
        <div className='content__body'>
          <div className='content__body__main bg-white'>
            {/* First Row */}
            <div className='flex justify-between items-center flex-col lg:flex-row gap-4'>
              <div className='flex items-center gap-4 justify-between w-full lg:justify-start'>
                <div className='flex flex-col'>
                  <p>Show</p>
                  <select>
                    <option>10</option>
                    <option>25</option>
                    <option>50</option>
                    <option>100</option>
                  </select>
                </div>
                <div className='list__icons'>
                  <div className='list__icon' title='Print'>
                    <BiPrinter className='text-white text-[16px]' />
                  </div>
                  <div className='list__icon' title='Copy'>
                    <FaRegCopy className='text-white text-[16px]' onClick={() => {
                      copyTable("listQuotation");
                    }} />
                  </div>
                  <div className='list__icon' title='PDF'>
                    <FaRegFilePdf className='text-white text-[16px]' />
                  </div>
                  <div className='list__icon' title='Excel'>
                    <FaRegFileExcel className='text-white text-[16px]' />
                  </div>
                </div>
              </div>
              <div className='flex w-full flex-col lg:w-[300px]'>
                <p>Search</p>
                <input type='text' onChange={searchTable} />
              </div>
            </div>

            {/* Second Row */}
            <div className='list_buttons'>
              <button className='bg-teal-500 hover:bg-teal-400' onClick={() => navigate('/admin/tax/add')}>
                <MdAdd className='text-lg' />
                Add New
              </button>
              <button className='bg-orange-400 hover:bg-orange-300'>
                <MdOutlineCancel className='text-lg' />
                Trash
              </button>
              <button className='bg-green-500 hover:bg-green-400'>
                <MdOutlineRestorePage className='text-lg' />
                Restore
              </button>
              <button className='bg-red-600 hover:bg-red-500'>
                <MdDeleteOutline className='text-lg' />
                Delete
              </button>
              <select name="" id="" className='bg-blue-500 text-white'>
                <option value="">All</option>
                <option value="">Active</option>
                <option value="">Trash</option>
              </select>
            </div>

            {/* Table start */}
            <div className='overflow-x-auto mt-5 list__table'>
              <table className='min-w-full bg-white' id='listQuotation'>
                <thead className='bg-gray-100'>
                  <tr>
                    <th className='py-2 px-4 border-b w-[50px]'>
                      <input type='checkbox' onChange={selectAll} checked={selected.length === 10} />
                    </th>
                    <th className='py-2 px-4 border-b '>Name</th>
                    <th className='py-2 px-4 border-b '>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {
                    Array.from({ length: 10 }).map((_, i) => {
                      return <tr key={i}>
                        <td className='py-2 px-4 border-b max-w-[10px]'>
                          <input type='checkbox' checked={selected.includes(i)} onChange={() => handleCheckboxChange(i)} />
                        </td>
                        <td className='px-4 border-b'>Admin</td>


                        <td className='px-4 border-b min-w-[70px]'>
                          <div className='flex  justify-center flex-col md:flex-row gap-2 mr-2'>
                            <button className='bg-blue-400 text-white px-2 py-1 rounded  text-[16px] '
                              onClick={() => navigate('/admin/role/edit')}>
                              <MdEditSquare className=' flex justify-between items-center ml-2' />
                            </button>
                            <button className='bg-red-500 text-white px-2 py-1 rounded  text-lg'>
                              <IoInformationCircle className='flex justify-between items-center ml-2' />
                            </button>
                          </div>
                        </td>
                      </tr>
                    })
                  }
                </tbody>
              </table>
              <p className='py-4'>Showing 1 to 2 of 2 entries</p>
              <div className='flex justify-end'>
                <div className='bg-gray-200 p-1 rounded'>
                  <Pagination total={100} limit={5}
                    maxButtons={3}
                    activePage={activePage}
                    onChangePage={setActivePage}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

export default Role