import React, { useEffect, useState } from 'react';
import Logo from '../assets/images/logo.png'
import { TbMenuDeep } from "react-icons/tb";
import { FaUser } from "react-icons/fa";
import { CiSettings } from "react-icons/ci";
import { FiUser } from "react-icons/fi";
import { IoIosLogOut } from "react-icons/io";
import { Avatar, Popover, Whisper } from 'rsuite';
import { Link, useNavigate } from 'react-router-dom';
import CompanyList from './CompanyList';
import { useDispatch, useSelector } from 'react-redux';
import { toggleModal } from '../store/copanyListSlice';
import useGetUserData from "../hooks/useGetUserData";
import { HiOutlineSwitchHorizontal } from "react-icons/hi";
import { CiCalculator1 } from "react-icons/ci";
import Calculator from './Calculator';
import { calcToggle } from '../store/calculatorSlice';
import Cookies from 'js-cookie';
import { Icons } from '../helper/icons';



const Nav = ({ title }) => {
    const [sideBar, setSideBar] = useState(true);
    const dispatch = useDispatch();
    const getUserData = useGetUserData(); // Get user info api call
    const [companyName, setCompanyName] = useState("");
    const userDetails = useSelector((store) => store.userDetail); //get use details from store
    const navigate = useNavigate();


    useEffect(() => {
        getUserData();
    }, [])


    const toggleSideBar = () => {
        convertToSmall();
    }

    const convertToSmall = () => {
        setSideBar((prev) => {
            const sideBar = document.querySelector("#sideBar");
            prev ? localStorage.setItem("sideBarOpenStatus", false) : localStorage.setItem("sideBarOpenStatus", true);

            sideBar.style.minWidth = prev ? "50px" : "175px";
            sideBar.querySelectorAll("li span:nth-child(2), li span:nth-child(3), h3").forEach(e => e.style.display = prev ? "none" : "");
            sideBar.querySelectorAll("li .sub-menu").forEach(e => e.style.display = prev ? "none" : "");
            sideBar.querySelectorAll("ul a, ul li").forEach(item => {
                item.setAttribute("data-tooltip-content", prev ? item.querySelector("span:nth-child(2)").innerText : "");
            });
            sideBar.querySelectorAll("li svg").forEach(e => e.style.fontSize = prev ? "18px" : "14px")

            return !prev;
        })
    }

    const logout = () => {
        Cookies.remove("token");
        document.location.href = "/admin";
    }


    return (
        <>
            <nav className='w-full text-white h-[50px] bg-white shadow-lg flex justify-between'>
                <div className="logo__area w-[175px]  h-[100%] bg-[#003628] px-3 flex justify-between items-center">
                    {/* <div className='nav__logo bg-[#003e32] w-[90px] rounded-md'> */}
                    <img src={Logo} alt="" width={70} className='shadow-lg' id='NavLogo' />
                    {/* </div> */}
                    <TbMenuDeep className='text-white text-xl cursor-pointer' onClick={toggleSideBar} />
                </div>
                <div className='flex items-center justify-between w-[calc(100%-175px)]'>
                    <h6 className='text-black ml-3'>
                        <Icons.BACK
                            className='inline mr-2 cursor-pointer'
                            onClick={() => navigate(-1)}
                        />
                        {title}
                    </h6>
                    <div className="admin__area px-4 py-2 flex items-center cursor-pointer gap-3">
                        <Whisper
                            trigger={'click'}
                            placement='bottomEnd'
                            speaker={<Popover>
                                <div className='create__drpdwn'>
                                    <a href="/admin/sales-invoice/add">Sales Invoice</a>
                                    <a href="/admin/purchase-invoice/add">Purchase Invoice</a>
                                    <a href="/admin/quotation-estimate/add">Quotation</a>
                                    <a href="/admin/proforma-invoice/add">Proforma</a>
                                    <a href="/admin/purchase-order/add">Purchase Order</a>
                                    <a href="/admin/purchase-return/add">Purchase Return</a>
                                    <a href="/admin/sales-return/add">Sales Return</a>
                                    <a href="/admin/delivery-chalan/add">Delivery Chalan</a>
                                    <a href="/admin/credit-note/add">Credit Note</a>
                                    <a href="/admin/debit-note/add">Debit Note</a>
                                </div>
                            </Popover>}
                        >
                            <button
                                className='text-[13px] flex items-center justify-between bg-[#003E32] text-white py-1
                                px-3 rounded gap-2'
                            >
                                Create
                                <Icons.DROPDOWN />
                            </button>
                        </Whisper>

                        <div className=" flex items-center justify-between bg-[#003E32] text-white py-1 px-3 rounded text-[12px]"
                            onClick={() => {
                                dispatch(toggleModal(true));
                            }}
                        >
                            <span className="text-[12px] ">
                                {companyName}
                            </span>
                            <HiOutlineSwitchHorizontal className="text-[16px] ml-2 text-white" />
                        </div>
                        <Whisper className='flex items-center overflow-hidden ' trigger={'click'} placement='bottomEnd' speaker={
                            <Popover full>
                                <Link className='menu-link' to={"/admin/site"}>
                                    <CiSettings size={"20px"} />
                                    <span>Site/Company Creation</span>
                                </Link>
                                <Link className='menu-link ' to="/admin/profile">
                                    <FiUser size={"16px"} />
                                    <span>Profile</span>
                                </Link>
                                <Link className='menu-link' onClick={() => dispatch(calcToggle(1))}>
                                    <CiCalculator1 size={"16px"} />
                                    <span>Calculator</span>
                                </Link>
                                <Link className='menu-link' onClick={logout}>
                                    <IoIosLogOut size={"16px"} />
                                    <span>Logout</span>
                                </Link>
                            </Popover>}>
                            <div className='flex items-center overflow-hidden border-l pl-3'>
                                <Avatar circle children={<FaUser />} size='sm' src={userDetails.profile} className='border' />
                                <div className='ml-2 text-gray-800 text-[13px] flex items-center gap-1'>
                                    {userDetails.name}
                                    <Icons.DROPDOWN />
                                </div>
                            </div>

                        </Whisper>
                    </div>
                </div>
            </nav>

            {/* Company list modal */}
            <CompanyList getCompanyName={(n) => {
                let name = n;
                if (name.length > 20) {
                    name = n.substring(0, 20) + "...";
                }
                setCompanyName(name);
            }} />
            <Calculator />
        </>
    )
}

export default Nav;

