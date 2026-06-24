import React, { useState } from 'react'
import Nav from '../../components/Nav';
import SideNav from '../../components/SideNav'
import { LuRefreshCcw } from "react-icons/lu";
import useMyToaster from '../../hooks/useMyToaster';
import { SelectPicker } from 'rsuite';
import { FaRegEyeSlash } from "react-icons/fa";
import { FaRegCheckCircle } from "react-icons/fa";
import checkfile from '../../helper/checkfile';
import { LuFileX2 } from "react-icons/lu";
import { MdOutlineRemoveRedEye, MdUploadFile } from "react-icons/md";

const UserProfileAdd = ({ mode }) => {
    const toast = useMyToaster();
    const [profilePasswordField, setProfilePasswordField] = useState(false);
    const [data, setData] = useState({
        name: '', email: '', profile: '', password: '', role: '', fileDirectory: '', shareRootDirectory: '', status: ''
    });


    const savebtn = (e) => {
        if (data.name === "" || data.email === "" || data.profile === "" || data.password === "" || data.role === "" ||
            data.fileDirectory === "" || data.shareRootDirectory === "" || data.status === ""
        ) {
            return toast("fill the blank", "warning");
        }
    }

    const resetbtn = (e) => {
        setData({
            name: '', email: '', profile: '', password: '', role: '', fileDirectory: '', shareRootDirectory: '', status: ''
        });

    }


    const setFile = async (e) => {
        let validfile = await checkfile(e.target.files[0]);

        if (typeof (validfile) !== 'boolean') return toast(validfile, "error");
        setData({ ...data, profile: e.target.files[0] });
    }


    return (
        <>
            <Nav title={"User Profile"} />
            <main id='main'>
                <SideNav />
                <div className='content__body'>
                    <div className='content__body__main bg-white '>
                        <div className='  flex justify-between  gap-5 flex-col lg:flex-row'>
                            <div className='w-full'>
                                <div >
                                    <p className='mb-2 '>Name</p>
                                    <input type='text'
                                        onChange={(e) => setData({ ...data, name: e.target.value })}
                                        value={data.name} />
                                </div>
                                <div>
                                    <p className='mb-2 mt-1 ml-1'>Email</p>
                                    <input type="email"
                                        onChange={(e) => setData({ ...data, email: e.target.value })}
                                        value={data.email} />
                                </div>
                                <div>
                                    <p className='ml-1'>Image</p>
                                    <div className='file__uploader__div'>
                                        <span className='file__name'>{typeof (data.profile) == 'object' ? data.profile.name : data.profile}</span>
                                        <div className="flex gap-2">
                                            <input type="file" id="invoiceLogo" className='hidden' onChange={(e) => setFile(e)} />
                                            <label htmlFor="invoiceLogo" className='file__upload' title='Upload'>
                                                <MdUploadFile />
                                            </label>
                                            <LuFileX2 className='remove__upload ' title='Remove upload' onClick={() => {
                                                setData({ ...data, profile: "" });
                                            }} />
                                        </div>
                                    </div>
                                </div>
                                <p className='mb-2 mt-1 ml-1'>Password</p>
                                <div className='relative'>
                                    <input type={profilePasswordField ? "text" : "password"} onChange={(e) => setData({ ...data, password: e.target.value })} value={data.password} />
                                    <div className='absolute right-3 top-1.5' onClick={() => setProfilePasswordField(!profilePasswordField)} >
                                        {profilePasswordField ? <MdOutlineRemoveRedEye /> : <FaRegEyeSlash />}
                                    </div>
                                </div>
                            </div>
                            <div className='w-full pt-1'>
                                <div>
                                    <p className='mb-2 mt-1 ml-1'>Role</p>
                                    <SelectPicker className='w-full'
                                        onChange={(e) => setData({ ...data, role: e.target.value })}
                                        value={data.role} />
                                </div>
                                <div>
                                    <p className='mb-2 mt-1 ml-1'>File Directory</p>
                                    <input type='text'
                                        onChange={(e) => setData({ ...data, fileDirectory: e.target.value })}
                                        value={data.fileDirectory} />
                                </div>
                                <div>
                                    <p className='mb-2 mt-1 ml-1'>Share Root Directory </p>
                                    <select onChange={(e) => setData({ ...data, shareRootDirectory: e.target.value })}
                                        value={data.shareRootDirectory} >
                                        <option value={""}>
                                            --Select--
                                        </option>
                                        <option value={"No"}>
                                            No
                                        </option>
                                        <option value={"Yes"}>
                                            Yes
                                        </option>
                                    </select>
                                </div>
                                <div>
                                    <p className='mb-2 mt-1 ml-1'>Status</p>
                                    <select onChange={(e) => setData({ ...data, status: e.target.value })}
                                        value={data.status} >
                                        <option value={""}>
                                            --Select--
                                        </option>
                                        <option value={"Inactive"}>
                                            Inactive
                                        </option>
                                        <option value={"Active"}>
                                            Active
                                        </option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className='flex justify-center pt-9 mb-6'>
                            <div className='flex rounded-sm bg-green-500 text-white'>
                                <FaRegCheckCircle className='mt-3 ml-2' />
                                <button className='p-2' onClick={savebtn}>{mode ? "Update" : "Save"}</button>
                            </div>
                            <div className='flex rounded-sm ml-4 bg-blue-500 text-white'>
                                <LuRefreshCcw className='mt-3 ml-2' />
                                <button className='p-2' onClick={resetbtn} >Reset</button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    )
}

export default UserProfileAdd