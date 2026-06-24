import React, { useEffect, useState } from 'react'
import Nav from '../../components/Nav';
import SideNav from '../../components/SideNav'
import useMyToaster from '../../hooks/useMyToaster';
import { useNavigate, useParams } from 'react-router-dom';
import Cookies from 'js-cookie';
import { Icons } from '../../helper/icons';
import { Tooltip, Whisper } from 'rsuite';
import Loading from '../../components/Loading';
import { checkNumber } from '../../helper/validation'


const AddStaffAttendance = ({ mode }) => {
    const toast = useMyToaster();
    const token = Cookies.get("token");
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({
        staffName: "", mobileNumber: "", email: "", dob: "", joiningDate: "",
        salaryPayOutType: "", salary: "", salaryCycle: "", openingBalance: "",
        openingBalanceType: ""
    });
    const { id } = useParams();
    const navigate = useNavigate();



    // Get Data
    useEffect(() => {
        if (mode) {
            const get = async () => {
                const url = process.env.REACT_APP_API_URL + "/staff/get";
                const cookie = Cookies.get("token");

                const req = await fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": 'application/json'
                    },
                    body: JSON.stringify({ token: cookie, id: id })
                })
                const res = await req.json();
                setData({
                    ...data,
                    ...res.data,
                    dob: res.data?.dob?.split("T")[0]
                });
            }

            get();
        }
    }, [mode])


    const saveData = async (e) => {
        if (!data.staffName)
            return toast("staff name is required", "error");
        else if (!data.mobileNumber)
            return toast("Mobile number is required", "error");
        else if (!data.salary)
            return toast("Salary is required", "error");
        else if (!data.joiningDate)
            return toast("Joining date is required", "error");


        try {
            setLoading(true);
            const url = process.env.REACT_APP_API_URL + "/staff/add";
            const req = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(!mode ? { ...data, token } : { ...data, token, update: true, id: id })
            })
            const res = await req.json();
            if (req.status !== 200 || res.err) {
                return toast(res.err, 'error');
            }

            if (!mode) {
                resetData();
            }

            toast(!mode ? "Staff create success" : "Staff update success", 'success');
            navigate('/admin/staff-attendance');
            return;

        } catch (error) {
            return toast("Something went wrong", "error")
        } finally {
            setLoading(false);
        }

    }


    const resetData = (e) => {
        setData({
            staffName: "", mobileNumber: "", dob: "", joiningDate: "",
            salaryPayOutType: "", salary: "", salaryCycle: "", openingBalance: "",
            openingBalanceType: ""
        })
    }

    return (
        <>
            <Nav title={mode ? "Update Staff" : "Add Staff"} />
            <main id='main'>
                <SideNav />
                <div className='content__body'>
                    <div className='content__body__main'>
                        <div className='w-full flex flex-col'>
                            <div className='w-full flex flex-col lg:flex-row'>
                                <div className='w-full p-2'>
                                    <p className='pb-1'>Staff Name
                                        <span className='required__text'>*</span>
                                    </p>
                                    <input type='text'
                                        onChange={(e) => setData({ ...data, staffName: e.target.value })}
                                        value={data.staffName}
                                    />
                                </div>
                                <div className='w-full p-2'>
                                    <p className='pb-1'>Mobile Number
                                        <span className='required__text'>*</span>
                                    </p>
                                    <input type='text'
                                        onChange={(e) => setData({ ...data, mobileNumber: e.target.value })}
                                        value={data.mobileNumber}
                                    />
                                </div>
                                <div className='w-full p-2'>
                                    <p className='pb-1'>Email</p>
                                    <input type='email'
                                        onChange={(e) => setData({ ...data, email: e.target.value })}
                                        value={data.email}
                                    />
                                </div>
                            </div>

                            <div className='w-full flex flex-col lg:flex-row'>
                                <div className='w-full p-2'>
                                    <p className='pb-1'>DOB</p>
                                    <input type='date'
                                        onChange={(e) => setData({ ...data, dob: e.target.value })}
                                        value={data.dob}
                                    />
                                </div>
                                <div className='w-full p-2'>
                                    <p className='pb-1'>
                                        Joining Date
                                        <span className='required__text'>*</span>
                                    </p>
                                    <input type='date'
                                        onChange={(e) => setData({ ...data, joiningDate: e.target.value })}
                                        value={data.joiningDate}
                                    />
                                </div>
                                <div className='w-full p-2'>
                                    <p className='pb-1'>Salary Payout Type</p>
                                    <select
                                        onChange={(e) => setData({ ...data, salaryPayOutType: e.target.value })}
                                        value={data.salaryPayOutType}
                                    >
                                        <option value="">Select</option>
                                        <option value="monthly">Monthly</option>
                                        <option value="daily">Daily</option>
                                    </select>
                                </div>
                            </div>

                            {/* Second Collumn start */}
                            <div className='w-full flex flex-col lg:flex-row mt-2'>
                                <div className='w-full p-2'>
                                    <p className='pb-1'>Salary
                                        <span className='required__text'>*</span>
                                    </p>
                                    <input type='text'
                                        onChange={(e) => setData({ ...data, salary: checkNumber(e.target.value) })}
                                        value={data.salary}
                                    />
                                </div>
                                <div className='w-full p-2'>
                                    <p className='pb-1'>Salary Cycle</p>
                                    <select
                                        onChange={(e) => setData({ ...data, salaryCycle: e.target.value })}
                                        value={data.salaryCycle}
                                    >
                                        <option value="none">Select</option>
                                        {
                                            Array.from({ length: 29 }, (_, v) => {
                                                return v > 0 ? (
                                                    <option value={`${v}-${v}-month`} key={_}>
                                                        {v} to {v} Every month
                                                    </option>
                                                ) : null
                                            })
                                        }
                                    </select>
                                </div>
                                <div className='w-full p-2'>
                                    <div className='flex items-center pb-1 gap-1'>
                                        <p>Outstanding/Opening Balance</p>
                                        <Whisper
                                            placement="bottom"
                                            controlId="control-id-hover"
                                            trigger="hover"
                                            speaker={<Tooltip>
                                                The opening balance is the outstanding amount owed to the staff
                                                member at the time they are registered in the system.
                                            </Tooltip>}
                                        >
                                            <Icons.INFO_DETAILS />
                                        </Whisper>
                                    </div>
                                    <div className='flex border rounded p-[1px]'>
                                        <input
                                            type="text"
                                            className='rounded-none border-none border-r'
                                            placeholder='₹'
                                            onChange={(e) => setData({ ...data, openingBalance: e.target.value })}
                                            value={data.openingBalance}
                                        />
                                        <select
                                            onChange={(e) => setData({ ...data, openingBalanceType: e.target.value })}
                                            value={data.openingBalanceType}
                                            className='border-none bg-gray-100 rounded-none'
                                        >
                                            <option value="pay">To Pay</option>
                                            <option value="collect">To Collect</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='flex gap-4 justify-center mt-5'>
                            <button onClick={loading ? null : saveData}
                                className='add-bill-btn'
                            >
                                {loading ? <Loading /> : <Icons.CHECK />}
                                {mode ? "Update" : "Save"}
                            </button>
                            <button onClick={resetData} className='reset-bill-btn'>
                                <Icons.RESET />
                                Reset
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </>
    )
}

export default AddStaffAttendance;