import { useEffect, useState } from 'react'
import Nav from '../../components/Nav';
import SideNav from '../../components/SideNav';
import useMyToaster from '../../hooks/useMyToaster';
import Cookies from 'js-cookie';
import { useNavigate, useParams } from 'react-router-dom';
import { checkNumber } from '../../helper/validation';
import { Toggle } from 'rsuite';
import { Icons } from '../../helper/icons';



const AddAccount = ({ mode }) => {
    return (
        <>
            <Nav title={mode ? "Update Account" : "Add Account"} />
            <main id='main'>
                <SideNav />
                <div className='content__body'>
                    <AddAccountComponent mode={mode} />
                </div>
            </main>
        </>
    )
}

const AddAccountComponent = ({ mode, onSave }) => {
    const token = Cookies.get("token");
    const toast = useMyToaster();
    const { id } = useParams();
    const [form, setForm] = useState({
        accountName: '', accountHolderName: '', openingBalance: '', asOfDate: '', isBankDetails: false,
        accountNumber: '', reEnterAccountNumber: '', ifscCode: '', branchName: '', upiId: ''
    })
    const navigate = useNavigate()



    // Get data for update mode
    useEffect(() => {
        if (mode) {
            const get = async () => {
                const url = process.env.REACT_APP_API_URL + "/account/get";
                const cookie = Cookies.get("token");

                const req = await fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": 'application/json'
                    },
                    body: JSON.stringify({ token: cookie, id: id })
                })
                const res = await req.json();
                setForm({
                    ...form, ...res.data,
                    reEnterAccountNumber: res.data.accountNumber,
                    asOfDate: res.data.asOfDate?.split("T")[0]
                });

            }

            get();
        }
    }, [mode])


    const saveData = async (e) => {
        if (!form.isBankDetails && !form.accountName) {
            return toast("Account name can't be blank", "error")
        }
        else if (form.isBankDetails) {
            if (!form.accountName)
                return toast("Account name can't be blank", "error");
            else if (!form.accountNumber)
                return toast("Account name can't be blank", "error");
            else if (!form.reEnterAccountNumber)
                return toast("Re-Enter your Account number", "error");
            else if (!form.ifscCode)
                return toast("IFSC Code can't be blank", "error");
            else if (!form.branchName)
                return toast("Branch name can't be blank", "error");
            else if (!form.accountHolderName)
                return toast("Account holder name can't be blank", "error")

            if (Number(form.accountNumber) !== Number(form.reEnterAccountNumber))
                return toast("Re-entered account number does not match", "error");
        }



        try {
            const url = process.env.REACT_APP_API_URL + "/account/add";
            const req = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(!mode ?
                    { ...form, token } :
                    { ...form, token, update: true, id: id }
                )
            })

            const res = await req.json();
            if (req.status !== 200 || res.err) {
                return toast(res.err, 'error');
            }

            if (mode) {
                toast("Account updated successfully", 'success')
                navigate("/admin/account");
                return
            }
            
            if(onSave) {
                onSave(true);
                return;
            }

            toast("Account created successfully", 'success')
            navigate("/admin/account")
            clearData()
            return;

        } catch (error) {
            toast("Something went wrong", "error")
        }

    }


    const clearData = (e) => {
        setForm({
            title: '', accountName: '', accountNumber: '', ifscCode: '',
            bankName: '', openingBalance: '', type: '', holderName: ''
        })
    }

    return (
        <>
            <div className='content__body__main bg-white '>
                <div className='w-full text-right border-b pb-2 flex items-center gap-2'>
                    <p>Add Bank Details</p>
                    <Toggle
                        size={'sm'}
                        checked={form.isBankDetails}
                        onChange={(v) => setForm({ ...form, isBankDetails: v })}
                        className='w-0 mt-[-20px]'
                    />

                </div>
                <div className='flex justify-between flex-col lg:flex-row gap-4 mt-3'>
                    <div className="w-full">
                        <div>
                            <p>Account Name <span className='required__text'>*</span></p>
                            <input type='text'
                                onChange={(e) => setForm({ ...form, accountName: e.target.value })}
                                value={form.accountName}
                            />
                        </div>
                    </div>
                    <div className="w-full flex items-center gap-4">
                        <div className='w-full'>
                            <p>Opening Balance</p>
                            <input type="text"
                                onChange={(e) => {
                                    setForm({ ...form, openingBalance: checkNumber(e.target.value) })
                                }}
                                value={form.openingBalance}
                            />
                        </div>
                        <div className='w-full'>
                            <p>As of Date</p>
                            <input type="date"
                                onChange={(e) => setForm({ ...form, asOfDate: e.target.value })}
                                value={form.asOfDate}
                            />
                        </div>
                    </div>
                </div>

                {/* =======================[Bank Details]=================== */}
                {/* ======================================================== */}
                {
                    form.isBankDetails && (
                        <div className='flex justify-between flex-col lg:flex-row mt-2 gap-4'>
                            <div className="w-full flex flex-col">
                                <div>
                                    <p>Bank Account Number <span className='required__text'>*</span></p>
                                    <input type='text'
                                        onChange={(e) => setForm({
                                            ...form, accountNumber: checkNumber(e.target.value)
                                        })}
                                        value={form.accountNumber}
                                    />
                                </div>
                                <div className='mt-2'>
                                    <p>IFSC Code <span className='required__text'>*</span></p>
                                    <input type='text'
                                        onChange={(e) => setForm({ ...form, ifscCode: e.target.value })}
                                        value={form.ifscCode}
                                    />
                                </div>
                                <div className='mt-2'>
                                    <p>Account Holder Name <span className='required__text'>*</span></p>
                                    <input type='text'
                                        onChange={(e) => setForm({ ...form, accountHolderName: e.target.value })}
                                        value={form.accountHolderName}
                                    />
                                </div>
                            </div>
                            <div className="w-full flex flex-col">
                                <div>
                                    <p>Re-Enter Bank Account Number <span className='required__text'>*</span></p>
                                    <input type='text'
                                        onChange={(e) => setForm({
                                            ...form, reEnterAccountNumber: checkNumber(e.target.value)
                                        })}
                                        value={form.reEnterAccountNumber}
                                    />
                                </div>
                                <div className='mt-2'>
                                    <p>Bank & Branch Name <span className='required__text'>*</span></p>
                                    <input type='text'
                                        onChange={(e) => setForm({ ...form, branchName: e.target.value })}
                                        value={form.branchName}
                                    />
                                </div>
                                <div className='mt-2'>
                                    <p>UPI ID</p>
                                    <input type='text'
                                        onChange={(e) => setForm({ ...form, upiId: e.target.value })}
                                        value={form.upiId}
                                    />
                                </div>
                            </div>
                        </div>
                    )
                }
                <div className='w-full flex justify-center gap-3 my-3 mt-5'>
                    <button className='add-bill-btn'
                        onClick={saveData}>
                        <Icons.CHECK />
                        {mode ? "Update" : "Save"}
                    </button>

                    <button className='reset-bill-btn'
                        onClick={clearData}>
                        <Icons.RESET />
                        Reset
                    </button>
                </div>
            </div>
        </>
    )
}

export {
    AddAccountComponent
}
export default AddAccount