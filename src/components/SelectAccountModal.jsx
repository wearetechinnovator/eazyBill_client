import { useEffect, useState } from 'react';
import { Modal } from 'rsuite';
import useMyToaster from '../hooks/useMyToaster';
import Cookies from 'js-cookie';
import { Icons } from '../helper/icons';
import AddAccountModal from './AddAccountModal';

const SelectAccountModal = ({ openModal, openStatus, getAccountDetails }) => {
    const token = Cookies.get('token');
    const toast = useMyToaster();
    const [open, setOpen] = useState(false);
    const [accounts, setAccounts] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [addAccountModalOpen, setAddAccountModalOpen] = useState(false);


    // Set modal open state based on prop
    useEffect(() => {
        setOpen(openModal);
    }, [openModal])


    // Get Accounts
    const getAcccounts = async () => {
        try {
            const URL = `${process.env.REACT_APP_API_URL}/account/get`;
            const req = await fetch(URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ token, all: true })
            })
            const res = await req.json();
            if (req.status !== 200) {
                return toast(res.err, 'error');
            }
            setAccounts(res.data);

        } catch (err) {
            return toast("Error fetching accounts", 'error');
        }
    }
    useEffect(() => {
        getAcccounts();
    }, [])


    return (
        <>
            <AddAccountModal open={addAccountModalOpen} onClose={() => {
                setAddAccountModalOpen(false);
                getAcccounts();
            }} />
            <Modal size='sm' backdrop='static' open={open} onClose={() => {
                openStatus(false);
                setOpen(false);
            }}>
                <Modal.Header className='border-b pb-2'>
                    <Modal.Title>
                    </Modal.Title>
                    <p className='font-bold'>Select Account</p>
                </Modal.Header>
                <Modal.Body>
                    {
                        accounts?.map((account, i) => {
                            return (
                                <label key={i} className={`flex items-center justify-between text-xs border py-2 cursor-pointer mb-1 p-2 rounded ${selectedAccount?._id === account._id ? 'border-blue-300 bg-blue-50' : 'border-gray-200'}`}
                                    onClick={() => {
                                        setSelectedAccount(account);
                                    }}
                                >
                                    <div className='w-full'>
                                        <p>{account.accountName}</p>
                                        <p className='text-gray-500'>Acc No: {account.accountNumber}</p>
                                    </div>
                                    <div className='flex items-center w-full justify-end'>
                                        <div>
                                            <p className='text-right'>₹{account.openingBalance || 0.00}</p>
                                            <p className='text-gray-500'>IFSC: {account.ifscCode}</p>
                                        </div>
                                        <input type="radio" name='bank' id={`account-${i}`} defaultChecked={selectedAccount?._id === account._id ? true : false} />
                                    </div>
                                </label>
                            )
                        })
                    }
                    {
                        accounts.length === 0 && (
                            <div className='text-center py-10'>
                                <p className='text-gray-500'>No accounts found. Please add an account first.</p>
                                <button className='bg-[#003E32] hover:bg-[#002a22] text-white rounded py-1.5 px-3 text-xs uppercase mt-2' onClick={() => {
                                    setAddAccountModalOpen(true);
                                }}>
                                    <Icons.ADD className="inline mr-1 mb-0.5" size={15}/>
                                    Add Account
                                </button>
                            </div>
                        )
                    }
                </Modal.Body>
                {
                    accounts.length > 0 && (
                        <Modal.Footer>
                            <button
                                onClick={() => {
                                    getAccountDetails(selectedAccount);
                                    setOpen(false);
                                    openStatus(false);
                                }}
                                className='float-end bg-blue-600 text-white rounded w-[120px] py-1 uppercase text-xs'
                            >
                                Save
                            </button>
                        </Modal.Footer>
                    )
                }
            </Modal>
        </>

    )
}

export default SelectAccountModal