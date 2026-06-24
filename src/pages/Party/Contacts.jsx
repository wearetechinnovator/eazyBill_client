import Cookies from 'js-cookie';
import { Drawer } from 'rsuite';
import React, { useEffect, useState } from 'react'
import { Icons } from '../../helper/icons';
import useMyToaster from '../../hooks/useMyToaster';
import Loading from '../../components/Loading';
import DataShimmer from '../../components/DataShimmer';
import ConfirmModal from '../../components/ConfirmModal';


const Contacts = ({ partyId }) => {
    const toast = useMyToaster();
    const token = Cookies.get("token");
    const [loading, setLoading] = useState(false);
    const [allContacts, setAllContacts] = useState([]);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [contactData, setContactData] = useState({
        name: '', phone: '', email: '', designation: ''
    })
    const [contactId, setContactId] = useState(null);
    const [openConfirm, setOpenConfirm] = useState(false);



    // Get All Contacts
    const getAllContact = async () => {
        try {
            setLoading(true);
            const URL = `${process.env.REACT_APP_API_URL}/party-contacts/get-all`;
            const req = await fetch(URL, {
                method: 'POST',
                headers: {
                    "Content-Type": 'application/json'
                },
                body: JSON.stringify({ partyId, token })
            })
            const res = await req.json();

            if (req.status !== 200) {
                return toast(res.err, 'error');
            }

            setAllContacts(res.data);

        } catch (err) {
            return toast("Something went wrong", "error");
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        getAllContact();
    }, [])

    // Get Editable Contact, if data is successfully get, then open drawer;
    useEffect(() => {
        if (!contactId) return;

        (async () => {
            try {
                const URL = `${process.env.REACT_APP_API_URL}/party-contacts/get`;
                const req = await fetch(URL, {
                    method: 'POST',
                    headers: {
                        "Content-Type": 'application/json'
                    },
                    body: JSON.stringify({ id: contactId, token })
                })
                const res = await req.json();

                if (req.status !== 200) {
                    return toast(res.err, 'error');
                }

                setContactData({
                    name: res.data.name,
                    designation: res.data.designation,
                    phone: res.data.phone.toString(),
                    email: res.data.email
                })

            } catch (err) {
                return toast("Something went wrong", "error");
            }
        })()
    }, [contactId])

    const saveContact = async () => {
        const validations = [
            { field: contactData.name, msg: "Contact name is required" },
            { field: contactData.email, msg: "Email is required" },
            { field: contactData.phone, msg: "Phone is required" },
        ];

        for (const item of validations) {
            if (!item.field || item.field.trim() === "") {
                return toast(item.msg, "error");
            }
        }

        try {
            setLoading(true);
            const URL = `${process.env.REACT_APP_API_URL}/party-contacts/add`;
            const req = await fetch(URL, {
                method: 'POST',
                headers: {
                    "Content-Type": 'application/json'
                },
                body: JSON.stringify({
                    partyId, token,
                    ...contactData
                })
            })
            const res = await req.json();

            if (req.status !== 201) {
                return toast(res.err, 'error');
            }

            toast(res.msg, 'success');
            setAllContacts([res.data, ...allContacts]); // Set new data
            setDrawerOpen(false); // Close Drawer
            clear(); //Clear form
            return;

        } catch (err) {
            console.log(err);
            return toast("Something went wrong", 'error');
        } finally {
            setLoading(false)
        }

    }

    const updateContact = async () => {
        const validations = [
            { field: contactData.name, msg: "Contact name is required" },
            { field: contactData.email, msg: "Email is required" },
            { field: contactData.phone, msg: "Phone is required" },
        ];

        for (const item of validations) {
            if (!item.field || item.field.trim() === "") {
                return toast(item.msg, "error");
            }
        }

        try {
            setLoading(true);
            const URL = `${process.env.REACT_APP_API_URL}/party-contacts/update`;
            const req = await fetch(URL, {
                method: 'PATCH',
                headers: {
                    "Content-Type": 'application/json'
                },
                body: JSON.stringify({
                    partyId, token, id: contactId,
                    ...contactData
                })
            })
            const res = await req.json();

            if (req.status !== 200) {
                return toast(res.err, 'error');
            }

            toast(res.msg, 'success');
            getAllContact();
            setDrawerOpen(false);
            setContactId(null);
            clear();

            return;

        } catch (err) {
            return toast("Something went wrong", 'error');
        } finally {
            setLoading(false)
        }

    }

    const deleteContact = async () => {
        try {
            const URL = `${process.env.REACT_APP_API_URL}/party-contacts/delete`;
            const req = await fetch(URL, {
                method: 'DELETE',
                headers: { "Content-Type": 'application/json' },
                body: JSON.stringify({ token, id: contactId })
            });

            const res = await req.json();

            if (req.status !== 200) {
                return toast(res.err ?? "Failed to delete contact", 'error');
            }

            setAllContacts(prev => prev.filter(p => p._id !== contactId));
            return toast(res.msg, "success")

        } catch (err) {
            toast("Something went wrong", 'error');
        }
    }

    const clear = () => {
        setContactData({
            name: '', phone: '', email: '', designation: ''
        })
    }


    return (
        <>
            <ConfirmModal
                openConfirm={openConfirm}
                openStatus={(status) => { setOpenConfirm(status) }}
                title={"Are you sure you want to delete the contact?"}
                fun={async () => {
                    setOpenConfirm(false);
                    await deleteContact();
                    setContactId(null);
                }}
            />
            <div className='content__body__main'>
                <div className='details__header'>
                    <p className='font-bold flex items-center gap-1'>
                        <Icons.PHONE_ADD size={"17px"} />
                        Contacts
                    </p>
                    {
                        allContacts.length > 0 && (
                            <button
                                onClick={() => setDrawerOpen(true)}
                                className='bg-[#003E32] hover:bg-[#032720] max-w-[150px] text-white rounded py-1 px-1.5'>
                                <Icons.PHONE_ADD className='inline mr-1' size={"15px"} />
                                Add Contacts
                            </button>
                        )
                    }
                </div>
                <hr />

                {
                    loading ? (
                        <DataShimmer />
                    ) : (
                        // =============================[Table start here]=======================
                        // ======================================================================
                        allContacts.length > 0 ? (
                            <div className="w-full overflow-x-auto mb-3 border border-gray-200 rounded overflow-hidden">
                                <table className="w-full min-w-[580px] border-collapse text-sm">
                                    <thead>
                                        <tr className="bg-[#F6F7FB]">
                                            <th className="p-3 text-left text-xs font-semibold text-gray-500 border-b border-gray-200">Name</th>
                                            <th className="p-3 text-left text-xs font-semibold text-gray-500 border-b border-gray-200">Designation</th>
                                            <th className="p-3 text-left text-xs font-semibold text-gray-500 border-b border-gray-200">Phone</th>
                                            <th className="p-3 text-left text-xs font-semibold text-gray-500 border-b border-gray-200">Email</th>
                                            <th className="p-3 text-left text-xs font-semibold text-gray-500 border-b border-gray-200">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-xs">
                                        {allContacts.map((c, i) => (
                                            <tr
                                                key={i}
                                                className="border-b border-gray-200 last:border-b-0 transition-colors duration-150 hover:bg-gray-50 cursor-default"
                                            >
                                                <td className="p-3">{c.name}</td>
                                                <td className="p-3">
                                                    <span className="bg-[#253E5F] rounded-full text-white p-[2px] px-2">
                                                        {c.designation}
                                                    </span>
                                                </td>
                                                <td className="p-3">{c.phone}</td>
                                                <td className="p-3">{c.email || '--'}</td>
                                                <td className="p-3">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setContactId(c._id);
                                                                setDrawerOpen(true);
                                                            }}
                                                            className="p-1.5 rounded-md bg-green-50 text-green-600 hover:bg-green-600 hover:text-white transition-colors duration-150">
                                                            <Icons.PENCIL />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setContactId(c._id);
                                                                setOpenConfirm(true);
                                                            }}
                                                            className="p-1.5 rounded-md bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors duration-150">
                                                            <Icons.DELETE />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            // =============================[No Data text]=======================
                            // ==================================================================
                            <div className='h-[250px] grid place-items-center'>
                                <div className='flex flex-col items-center'>
                                    <div className='w-[40px] h-[40px] rounded-lg border bg-gray-800 text-white grid place-items-center'>
                                        <Icons.PARTY_CONTACT className='inline mr-1' size={"20px"} />
                                    </div>
                                    <p className='text-lg my-[0] font-semibold'>No contacts yet</p>
                                    <div className='text-xs w-[250px] text-center'>
                                        Add your first contact to get started managing your network.
                                    </div>

                                    <button
                                        onClick={() => setDrawerOpen(true)}
                                        className='bg-[#003E32] hover:bg-[#032720] max-w-[150px] text-white rounded py-1 px-1.5 mt-3'>
                                        <Icons.PHONE_ADD className='inline mr-1' size={"20px"} />
                                        Add Contacts
                                    </button>
                                </div>
                            </div>
                        )
                    )
                }

                {/* =============================[Add Update Drawer]======================= */}
                {/* ======================================================================== */}
                <Drawer
                    open={drawerOpen}
                    onClose={() => {
                        setDrawerOpen(false);
                        clear();
                        setContactId(null);
                    }}
                >
                    <Drawer.Header>
                        <Drawer.Title>
                        </Drawer.Title>
                        <p className='text-[17px] font-semibold'>Add Contacts</p>
                    </Drawer.Header>
                    <Drawer.Body>
                        <div className='grid grid-cols-1 md:grid-cols-2 p-4 gap-4'>
                            <div>
                                <p className='mb-1'>Name <span className='required__text'>*</span></p>
                                <input type="text"
                                    onChange={(e) => setContactData({ ...contactData, name: e.target.value })}
                                    value={contactData.name}
                                />
                            </div>
                            <div>
                                <p className='mb-1'>Designation</p>
                                <input type="text"
                                    onChange={(e) => setContactData({ ...contactData, designation: e.target.value })}
                                    value={contactData.designation}
                                />
                            </div>
                            <div>
                                <p className='mb-1'>Phone <span className='required__text'>*</span></p>
                                <input type="text"
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val !== "" && !/^\d+$/.test(val)) return;
                                        if (val.length > 13) return;
                                        setContactData({ ...contactData, phone: val });
                                    }}
                                    value={contactData.phone}
                                />
                            </div>
                            <div>
                                <p className='mb-1'>Email <span className='required__text'>*</span></p>
                                <input type="text"
                                    onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                                    value={contactData.email}
                                />
                            </div>
                        </div>

                        <div className='w-full flex justify-center gap-3 my-3 mt-5 '>
                            <button
                                onClick={loading ? null : (contactId ? updateContact : saveContact)}
                                className='add-bill-btn'>
                                {loading ? <Loading /> : <Icons.CHECK />}
                                Save
                            </button>
                            <button
                                onClick={clear}
                                className='reset-bill-btn'>
                                <Icons.RESET />
                                Reset
                            </button>
                        </div>
                    </Drawer.Body>
                </Drawer>
            </div>
        </>
    )
}

export default Contacts;