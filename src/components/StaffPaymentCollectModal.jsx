import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Modal, SelectPicker } from 'rsuite';
import useMyToaster from '../hooks/useMyToaster';
import Cookies from 'js-cookie';
import { Icons } from '../helper/icons';
import { Constants } from '../helper/constants';
import useApi from '../hooks/useApi';
import { checkNumber } from '../helper/validation';
import Loading from './Loading';




const StaffPaymentCollectModal = ({ openModal, openStatus, paymentId, staffName }) => {
    const token = Cookies.get('token');
    const { getApiData } = useApi();
    const { id } = useParams();
    const toast = useMyToaster();
    const [open, setOpen] = useState(false);
    const currentDate = new Date().toISOString().split("T")[0];
    const [formData, setFormData] = useState({
        paymentType: Constants.LOAN_RECEIVED, paymentDate: currentDate, paymentMode: Constants.CASH,
        paymentAccount: '', paymentAmount: '', paymentRemark: ''
    })
    const [account, setAccount] = useState([]);
    const [loading, setLoading] = useState(false);



    // Set modal open state based on prop
    useEffect(() => {
        setOpen(openModal);
    }, [openModal])


    // Get account data for select option
    useEffect(() => {
        const apiData = async () => {
            {
                const data = await getApiData("account");
                const account = data.data.map(d => ({ label: d.accountName, value: d._id }));
                setAccount([...account])
            }
        }

        apiData();
    }, [])


    const savePayment = async () => {
        if (!formData.paymentDate)
            return toast("Date is required", "error");
        else if (!formData.paymentAmount)
            return toast("Amount is required", "error");
        else if (formData.paymentMode !== Constants.CASH && !formData.paymentAccount)
            return toast("Please select account", "error");

        try {
            setLoading(true);
            const URL = `${process.env.REACT_APP_API_URL}/staff-payment/add`;
            let data = { token, staffId: id, ...formData };
            if (paymentId) {
                data.update = true;
                data.id = paymentId;
            }

            const req = await fetch(URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            })
            const res = await req.json();
            if (req.status !== 200) {
                return toast(res.err, 'error');
            }

            !paymentId && clearData();
            return toast("Payment successfully save", "success");

        } catch (err) {
            return toast("Something went wrong", 'error');
        } finally {
            setLoading(false);
        }

    }


    // Get Staff Payment Data using paymentId
    useEffect(() => {
        if (!paymentId) return;

        (async () => {
            try {
                const URL = `${process.env.REACT_APP_API_URL}/staff-payment/get`;
                const req = await fetch(URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        token, id: paymentId,
                    })
                })
                const res = await req.json();
                if (req.status !== 200) {
                    return toast(res.err, 'error');
                }

                setFormData({
                    ...res.data,
                    paymentDate: res.data.paymentDate.split("T")[0]
                })

            } catch (err) {
                return toast("Error fetching staff Payment", 'error');
            }
        })()
    }, [paymentId])


    const clearData = () => {
        setFormData({
            paymentType: '', paymentDate: currentDate, paymentMode: Constants.CASH,
            paymentAccount: '', paymentAmount: '', paymentRemark: ''
        })
    }


    return (
        <Modal size='sm' backdrop='static' open={open} onClose={() => {
            openStatus(false);
            setOpen(false);
        }}>
            <Modal.Header className='border-b pb-2'>
                <Modal.Title>
                </Modal.Title>
                <p className='font-bold'>Collect Payment</p>
            </Modal.Header>
            <Modal.Body className='text-xs px-2'>
                <div className='w-full flex items-center gap-4'>
                    <div className='w-full'>
                        <p>Staff Name <span className='required__text'>*</span></p>
                        <input type="text"
                            value={staffName}
                            disabled={true}
                        />
                    </div>
                    <div className='w-full'>
                        <p>Date <span className='required__text'>*</span></p>
                        <input type="date"
                            onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                            value={formData.paymentDate}
                        />
                    </div>
                </div>
                <div className='mt-4 w-full flex items-center gap-4'>
                    <div className='w-[50%]'>
                        <p>Amount <span className='required__text'>*</span></p>
                        <div className='w-full border rounded flex items-center'>
                            <Icons.RUPES className='w-[30px] h-[20px]' />
                            <input type="text"
                                className='border-none'
                                onChange={(e) => {
                                    setFormData({ ...formData, paymentAmount: checkNumber(e.target.value) })
                                }}
                                value={formData.paymentAmount}
                            />
                            <select
                                className='border-none rounded-none bg-gray-50'
                                onChange={(e) => {
                                    setFormData({ ...formData, paymentMode: e.target.value })
                                }}
                                value={formData.paymentMode}
                            >
                                <option value={Constants.CASH}>Cash</option>
                                <option value={Constants.UPI}>UPI</option>
                                <option value={Constants.CARD}>Card</option>
                                <option value={Constants.NETBENKING}>Netbenking</option>
                                <option value={Constants.BANK}>Bank</option>
                                <option value={Constants.CHEQUE}>Cheque</option>
                            </select>
                        </div>
                    </div>
                    {
                        formData.paymentMode !== Constants.CASH && (
                            <div className='w-[50%]'>
                                <p>Account</p>
                                <SelectPicker className='w-full'
                                    onChange={(v) => setFormData({ ...formData, paymentAccount: v })}
                                    data={account}
                                    value={formData.paymentAccount}
                                />
                            </div>
                        )
                    }
                </div>
                <div className='w-full mt-4'>
                    <p>Remark(Optional)</p>
                    <textarea
                        placeholder='Enter Remarks'
                        onChange={(e) => setFormData({ ...formData, paymentRemark: e.target.value })}
                        value={formData.paymentRemark}
                    ></textarea>
                </div>
                <div className='bg-yellow-50 p-2 rounded mt-4'>
                    <strong>Note: </strong>
                    <span className='text-[11px]'>Loan given to the staff would be reduced on collecting payment from staff.</span>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <button
                    onClick={() => {
                        setOpen(false);
                        openStatus(false);
                    }}
                    className="border bg-gray-50 rounded w-[120px] p-1 text-xs mr-2"
                >
                    Close
                </button>
                <button
                    onClick={async () => {
                        await savePayment();

                    }}
                    disabled={
                        !formData.paymentType || !formData.paymentAmount || !formData.paymentDate
                    }
                    className={`
                        float-end text-white rounded w-[120px] py-1 uppercase text-xs flex items-center justify-center gap-2
                        ${!formData.paymentType || !formData.paymentAmount || !formData.paymentDate ? 'bg-blue-200' : 'bg-[#003e32] '}
                    `}
                >
                    {loading && <Loading />} Save
                </button>
            </Modal.Footer>
        </Modal>
    )
}

export default StaffPaymentCollectModal;