import { Modal } from 'rsuite';
import { toggleModal } from '../store/copanyListSlice';
import { useSelector, useDispatch } from 'react-redux';
import { IoIosAddCircle } from "react-icons/io";
import Cookies from 'js-cookie';
import useMyToaster from '../hooks/useMyToaster';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { IoIosCheckmarkCircle } from "react-icons/io";



const CompanyList = ({ isOpen, getCompanyName }) => {
  const toast = useMyToaster();
  const dispatch = useDispatch();
  const storeVal = useSelector((state) => state.companyListModal.show);
  const userData = useSelector((state) => state.userDetail);
  const companies = Object.keys(userData).length === 0 ? [] : userData.companies;
  const navigate = useNavigate();



  useEffect(() => {
    companies.forEach((c, _) => {
      if (c._id === userData.activeCompany) {
        getCompanyName(c.name)
      }
    });
  }, [companies])


  const switchCompany = async (id) => {
    try {
      const token = Cookies.get("token");
      const url = process.env.REACT_APP_API_URL + "/company/switch-company";
      const req = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ token, companyId: id })
      })
      const res = await req.json();

      if (req.status !== 200 || !res.msg) {
        return toast(res.err, 'error');
      }

      toast(res.msg, 'success');
      document.location = "/admin/dashboard";

    } catch (error) {
      return toast("Something went wrong", 'error')
    }

  }

  
  return (
    <div id='companyList'>
      <Modal open={storeVal} onClose={() => dispatch(toggleModal(false))} size={300} >
        <Modal.Header>
          <p className='font-bold'>Your companies</p>
        </Modal.Header>
        <Modal.Body>
          {
            companies.map((v, index) => (
              <div key={index}
                onClick={() => switchCompany(v._id)}
                className='border-b flex items-center justify-between w-full hover:bg-gray-100 p-1 rounded cursor-pointer'>
                <p className='text-[12px] p-1 w-[90%]'>{v.name}</p>
                {
                  userData.activeCompany == v._id ?
                    <IoIosCheckmarkCircle
                      className='text-orange-400 text-xl'
                    /> : ""
                }
              </div>
            ))
          }
        </Modal.Body>
        <Modal.Footer>
          <button
            onClick={() => {
              dispatch(toggleModal(false))
              navigate("/admin/company")
            }}
            className='flex items-center gap-1 w-full rounded bg-[#003628] hover:bg-[#003628d7] active:bg-blue-700 text-white justify-center p-1'>
            <IoIosAddCircle />
            Create
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default CompanyList;
