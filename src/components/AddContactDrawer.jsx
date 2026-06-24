import React, { useEffect, useState } from 'react'
import Cookies from 'js-cookie';
import { Drawer } from 'rsuite';
import Loading from './Loading';
import { Icons } from '../helper/icons';
import useMyToaster from '../hooks/useMyToaster';


const AddContactDrawer = ({ partyId, onClose, open }) => {
    const toast = useMyToaster();
    const token = Cookies.get("token");
    const [loading, setLoading] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [contactData, setContactData] = useState({
        name: '', phone: '', email: '', designation: ''
    })


    useEffect(() => {
        setDrawerOpen(open)
    }, [open])


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

            if (req.status !== 201) return toast(res.err, 'error');

            setDrawerOpen(false);
            onClose(false);
            return;
        } catch (err) {
            return toast("Something went wrong", 'error');
        } finally {
            setLoading(false)
        }

    }

    const clear = () => {
        setContactData({
            name: '', phone: '', email: '', designation: ''
        })
    }

    return (
        <>
            <Drawer
                open={drawerOpen}
                onClose={() => {
                    setDrawerOpen(false);
                    onClose(false);
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
                            onClick={loading ? null : saveContact}
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
        </>
    )
}

export default AddContactDrawer