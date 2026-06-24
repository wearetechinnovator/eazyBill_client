import { useEffect, useState } from 'react';
import { Modal, SelectPicker } from 'rsuite';
import { Constants } from '../helper/constants';
import useApi from '../hooks/useApi';
import useMyToaster from '../hooks/useMyToaster';
import Cookies from 'js-cookie';
import Loading from './Loading';
import { checkNumber } from '../helper/validation';


const PaymentInModal = ({ invoice, openModal, openStatus }) => {
    const [open, setOpen] = useState(false);
    const token = Cookies.get("token");
    const { getApiData } = useApi();
    const toast = useMyToaster();
    const [account, setAccount] = useState([]);
    const currentDate = new Date().toISOString().split("T")[0]
    const [formData, setFormData] = useState({
        party: "", paymentInNumber: "", paymentInDate: currentDate, paymentMode: Constants.CASH,
        account: "", amount: "", invoiceId: '', tdsRate: ''
    });
    let [checkedInv, setCheckedInv] = useState([]);
    const [loading, setLoading] = useState(false);
    const [tdsRate, setTdsRate] = useState([]); //For DropDown;
    const [tdsData, setTdsData] = useState([]);


    // Set some invoice data into formData;
    useEffect(() => {
        if (!invoice) return;

        const amount = Number(invoice.finalAmount) - Number(invoice.paymentAmount || 0);

        setFormData(prev => ({
            ...prev,
            party: invoice.party._id,
            amount
        }));

        const inv = {
            ...invoice,
            receiveAmount: amount
        };

        setCheckedInv([inv]); // always single invoice
    }, [invoice]);


    useEffect(() => {
        setOpen(openModal);
    }, [openModal])


    //Set Paymentin number;
    useEffect(() => {
        (async () => {
            const url = process.env.REACT_APP_API_URL + "/paymentin/get";
            const req = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ token })
            });
            const res = await req.json();
            setFormData({
                ...formData,
                paymentInNumber: res.totalData + 1
            })
        })();
    }, [])


    // Get `Account` and `TDS Rate` Data
    useEffect(() => {
        (async () => {
            const data = await getApiData("account");
            const account = data?.data?.map(d => ({ label: d.accountName, value: d._id }));
            setAccount([...account]);

            // Tds
            const tdsRate = await getApiData("tds-rate");
            const tdsData = tdsRate?.map(d => ({ label: d.title, value: d._id, rate: d.rate }));
            setTdsRate([...tdsData]);
            setTdsData(tdsRate);
        })()
    }, [])


    const savePayment = async () => {
        if (formData.paymentInDate === "")
            return toast("Please select a payment date", "error");
        else if (formData.paymentMode === "")
            return toast("Please select a payment mode", "error");
        else if (formData.paymentMode !== Constants.CASH && formData.account === "")
            return toast("Please select an account", "error");

        try {
            setLoading(true);
            const url = process.env.REACT_APP_API_URL + "/paymentin/add";
            const req = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ ...formData, token, checkedInv })
            });
            const res = await req.json();
            if (req.status !== 200 || res.err) {
                return toast(res.err, 'error');
            }

            toast('Payment add successfully', 'success');
            setOpen(false);
            openStatus();
            return

        } catch (error) {
            return toast('Something went wrong', 'error')
        } finally {
            setLoading(false);
            setCheckedInv([]);
        }

    }


    return (
        <Modal size='md' backdrop='static' open={open} onClose={() => {
            openStatus();
            setOpen(false);
        }}>
            <Modal.Header className='border-b pb-2'>
                <Modal.Title>
                </Modal.Title>
                <p className='font-bold'>
                    Record Payment For Invoice #{invoice?.salesInvoiceNumber}
                </p>
            </Modal.Header>
            <Modal.Body>
                <div className='w-full flex items-start'>
                    <div className='w-[70%] pr-2'>
                        <div className='bg-gray-50 rounded p-2 border'>
                            <p>Amount Received</p>
                            <input type="text"
                                onChange={(e) => {
                                    setFormData({ ...formData, amount: checkNumber(e.target.value) });

                                    const inv = checkedInv[0];
                                    inv.receiveAmount = Number(checkNumber(e.target.value));
                                    setCheckedInv([inv]);
                                }}
                                value={formData.amount}
                            />
                        </div>
                        <div className='w-full mt-6'>
                            <SelectPicker
                                className='w-full'
                                searchable={false}
                                placeholder={"Select TDS Rate"}
                                data={tdsRate}
                                onChange={(v) => {
                                    const { rate } = tdsData.find(t => t._id === v);
                                    setFormData({ ...formData, tdsRate: rate })
                                }}
                            />
                        </div>
                        <div className='mt-4 flex gap-2 w-full'>
                            <div className='w-full'>
                                <p>Payment Date</p>
                                <input type="date"
                                    onChange={(e) => {
                                        setFormData({ ...formData, paymentInDate: e.target.value })
                                    }}
                                    value={formData.paymentInDate}
                                />
                            </div>
                            <div className='w-full'>
                                <p>Payment Mode</p>
                                <SelectPicker
                                    className='w-full'
                                    searchable={false}
                                    data={[
                                        { label: 'Cash', value: Constants.CASH },
                                        { label: 'UPI', value: Constants.UPI },
                                        { label: 'Card', value: Constants.CARD },
                                        { label: 'Netbenking', value: Constants.NETBENKING },
                                        { label: 'Bank', value: Constants.BANK },
                                        { label: 'Cheque', value: Constants.CHEQUE },
                                    ]}
                                    value={formData.paymentMode}
                                    onChange={(v) => setFormData({
                                        ...formData, paymentMode: v
                                    })}
                                    onClean={() => {
                                        setFormData({
                                            ...formData, paymentMode: Constants.CASH
                                        })
                                    }}
                                />
                            </div>
                            {
                                (formData.paymentMode !== Constants.CASH) && (
                                    <div className='w-full'>
                                        <p className='mb-[2px]'>Account</p>
                                        <SelectPicker className='w-full'
                                            data={account}
                                            onChange={(v) => setFormData({ ...formData, account: v })}
                                            value={formData.account}
                                        />
                                    </div>
                                )
                            }
                        </div>
                    </div>
                    <div className='w-[30%] px-2 pb-2 text-xs border-l'>
                        <div className='w-full rounded border p-2'>
                            <p className='font-semibold'>Invoice #{invoice?.salesInvoiceNumber}</p>
                            <div className='w-full flex justify-between items-center'>
                                <p>Invoice Amount</p>
                                <p>₹{invoice?.finalAmount}</p>
                            </div>
                            <p className='text-gray-500'>{invoice?.party.name}</p>
                            <p className='text-gray-500'>
                                Due Date: {invoice?.DueDate ? invoice.DueDate.split("T")[0] : 'None'}
                            </p>
                        </div>
                        <p className='font-bold my-2'>Record Payment Calculation</p>
                        <div className='w-full rounded border p-2 mt-2'>
                            <div className='w-full flex justify-between items-center text-red-500'>
                                <p>Invoice Pending Amt.</p>
                                <p>₹{Number(invoice?.finalAmount) - Number(invoice?.paymentAmount || 0)}</p>
                            </div>
                            <div className='w-full flex justify-between items-center'>
                                <p>Amount Received</p>
                                <p>₹{formData.amount || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='w-full border-t p-2 flex justify-end items-center gap-3 text-sm'>
                    <button
                        onClick={() => {
                            setOpen(false);
                            openStatus();
                        }}
                        className='border px-2 py-1 rounded hover:border-gray-400 hover:font-semibold'>
                        Close
                    </button>
                    <button
                        onClick={savePayment}
                        disabled={loading}
                        className='border px-2 py-1 rounded bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-1'>
                        {loading && <Loading className="text-[15px]" />} Save
                    </button>
                </div>
            </Modal.Body>
        </Modal>
    )
}

export default PaymentInModal;