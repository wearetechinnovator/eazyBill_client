import { useEffect, useState } from 'react'
import Nav from '../../components/Nav';
import SideNav from '../../components/SideNav';
import useMyToaster from '../../hooks/useMyToaster';
import Cookies from 'js-cookie';
import { useNavigate, useParams } from 'react-router-dom';
import { checkNumber } from '../../helper/validation';
import { Toggle, SelectPicker } from 'rsuite';
import { Icons } from '../../helper/icons';
import { Constants } from '../../helper/constants';
import MySelect2 from '../../components/MySelect2';
import useApi from '../../hooks/useApi';
import AddContactDrawer from '../../components/AddContactDrawer';



const AddEnquiry = ({ mode }) => {
    return (
        <>
            <Nav title={mode ? "Update Enquiry" : "Add Enquiry"} />
            <main id='main'>
                <SideNav />
                <div className='content__body'>
                    <AddEnquiryComponent mode={mode} />
                </div>
            </main>
        </>
    )
}

const AddEnquiryComponent = ({ mode, onSave }) => {
    const token = Cookies.get("token");
    const toast = useMyToaster();
    const navigate = useNavigate();
    const { getApiData } = useApi();
    const { id } = useParams();
    const [formData, setFormData] = useState({
        party: '', contactPerson: '', item: '', deliveryDate: '', enqNo: '',
        message: '', qty: ''
    })
    const [party, setParty] = useState([]);
    const [items, setItems] = useState([]);
    const [contactPerson, setContactPerson] = useState([]);
    const [selectedParty, setSelectedParty] = useState(null);
    const [contactDrawer, setContactDrawer] = useState(false);




    // Get Party and Item
    useEffect(() => {
        (async () => {
            const partyData = await getApiData("party");
            const party = partyData.data.map(d => ({ label: d.name, value: d._id }));
            setParty([...party]);

            const itemData = await getApiData("item");
            const item = itemData.data.map(d => ({ label: d.title, value: d._id }));
            setItems([...item]);
        })()
    }, [])

    // Get Party Contacts;
    const getParyContact = async () => {
        try {
            const URL = `${process.env.REACT_APP_API_URL}/party-contacts/get-all`;
            const req = await fetch(URL, {
                method: 'POST',
                headers: {
                    "Content-Type": 'application/json'
                },
                body: JSON.stringify({ partyId: selectedParty, token })
            })
            const res = await req.json();

            if (req.status !== 200) {
                return toast(res.err, 'error');
            }

            const contacts = res.data.map(d => ({ label: d.name, value: d._id }));
            setContactPerson([...contacts]);
        } catch (err) {
            return toast("Something went wrong", "error");
        }
    }
    useEffect(() => {
        if (!selectedParty) return;
        getParyContact();
    }, [selectedParty])


    // Get Eqnuiry No.
    useEffect(() => {
        // Edit Mode a return holo karon previous data set hobe
        if (mode) return;

        (async () => {
            try {
                const URL = `${process.env.REACT_APP_API_URL}/enquiry/get-enqno`;
                const req = await fetch(URL, {
                    method: 'POST',
                    headers: {
                        "Content-Type": 'application/json'
                    },
                    body: JSON.stringify({ token })
                })
                const res = await req.json();

                if (req.status !== 200) {
                    return toast(res.err, 'error');
                }
                setFormData({ ...formData, enqNo: res.count.toString() })
            } catch (err) {
                return toast("Something went wrong", "error");
            }
        })()
    }, [])


    // Get data for update mode
    useEffect(() => {
        if (!mode) return;
        (async () => {
            try {
                const URL = process.env.REACT_APP_API_URL + "/enquiry/get";
                const req = await fetch(URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": 'application/json'
                    },
                    body: JSON.stringify({ token, id: id })
                })
                const res = await req.json();
                setFormData({
                    ...formData, ...res.data,
                    deliveryDate: res.data.deliveryDate.split("T")[0]
                });
                setSelectedParty(res.data.party);
            } catch (er) {
                return toast("Data not fetch", 'error');
            }
        })()
    }, [mode])


    const saveData = async (e) => {
        const validations = [
            { field: formData.party, msg: "Select party" },
            { field: formData.item, msg: "Select item" },
            { field: formData.enqNo, msg: "Contact personal is required" },
            { field: formData.contactPerson, msg: "Contact personal is required" },
            { field: formData.deliveryDate, msg: "Delivery date is required" },
            { field: formData.item, msg: "Email is required" },
        ];

        for (const item of validations) {
            if (!item.field || item.field.trim() === "") {
                return toast(item.msg, "error");
            }
        }

        try {
            const url = process.env.REACT_APP_API_URL + "/enquiry/add";
            const req = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ ...formData, token })
            })

            const res = await req.json();
            if (req.status !== 201 || res.err) {
                return toast(res.err, 'error');
            }

            toast(res.msg, 'success')
            navigate("/admin/enquiry")
            clearData()
            return;
        } catch (error) {
            toast("Something went wrong", "error")
        }

    }

    const updateData = async (e) => {
        const validations = [
            { field: formData.party, msg: "Select party" },
            { field: formData.item, msg: "Select item" },
            { field: formData.enqNo, msg: "Contact personal is required" },
            { field: formData.contactPerson, msg: "Contact personal is required" },
            { field: formData.deliveryDate, msg: "Delivery date is required" },
            { field: formData.item, msg: "Email is required" },
        ];

        for (const item of validations) {
            if (!item.field || item.field.trim() === "") {
                return toast(item.msg, "error");
            }
        }

        try {
            const url = process.env.REACT_APP_API_URL + "/enquiry/update";
            const req = await fetch(url, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ ...formData, token, id })
            })

            const res = await req.json();
            if (req.status !== 200 || res.err) {
                return toast(res.err, 'error');
            }

            toast(res.msg, 'success')
            navigate("/admin/enquiry")
            clearData()
            return;
        } catch (error) {
            toast("Something went wrong", "error")
        }

    }

    const clearData = (e) => {
        setFormData({
            party: '', contactPerson: '', items: '', deliveryDate: '', enqNo: '',
            message: '', qty: ''
        })
    }

    return (
        <>
            <AddContactDrawer
                partyId={selectedParty}
                open={contactDrawer}
                onClose={(v) => {
                    setContactDrawer(v);
                    getParyContact();
                }}
            />
            <div className='content__body__main bg-white '>
                <div className='justify-between grid grid-cols-1 md:grid-cols-2 gr gap-4 mt-3'>
                    <div>
                        <p>Select Party <span className='required__text'>*</span></p>
                        <SelectPicker
                            className='w-full'
                            menuMaxHeight={200}
                            data={party}
                            onChange={(v) => {
                                setFormData({ ...formData, party: v });
                                setSelectedParty(v);
                            }}
                            onClean={() => {
                                setContactPerson([]);
                                setSelectedParty(null);
                            }}
                            value={formData.party}
                        />
                    </div>
                    <div className='flex items-center gap-4'>
                        <div className='w-full'>
                            <p>Enq No. <span className='required__text'>*</span></p>
                            <input type="text"
                                onChange={(e) => {
                                    setFormData({ ...formData, enqNo: e.target.value })
                                }}
                                value={formData.enqNo}
                                disabled={true}
                            />
                        </div>
                        <div className='w-full'>
                            <p>Expected Delivery Date <span className='required__text'>*</span></p>
                            <input type="date"
                                onChange={(e) => {
                                    setFormData({ ...formData, deliveryDate: e.target.value })
                                }}
                                value={formData.deliveryDate}
                            />
                        </div>
                    </div>
                    <div>
                        <div className='w-full flex items-center justify-between mb-1'>
                            <p>Contact Person <span className='required__text'>*</span></p>
                            {
                                selectedParty && (
                                    <button
                                        onClick={() => setContactDrawer(true)}
                                        className='bg-blue-400 rounded py-[2px] text-white px-1 text-[10px]'>
                                        <Icons.ADD className='inline' /> Add Contact
                                    </button>
                                )
                            }
                        </div>
                        <SelectPicker
                            className='w-full'
                            menuMaxHeight={200}
                            data={contactPerson}
                            onChange={(v) => {
                                setFormData({ ...formData, contactPerson: v })
                            }}
                            value={formData.contactPerson}
                        />
                    </div>
                    <div className='w-full flex items-center gap-4'>
                        <div className='w-full'>
                            <p>Select Item <span className='required__text'>*</span></p>
                            <SelectPicker
                                className='w-full'
                                menuMaxHeight={200}
                                data={items}
                                onChange={(v) => {
                                    setFormData({ ...formData, item: v })
                                }}
                                value={formData.item}
                            />
                        </div>
                        <div className='w-full'>
                            <p>Quntity <span className='required__text'>*</span></p>
                            <input type="text"
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (val !== "" && !/^\d+$/.test(val)) return;
                                    setFormData({ ...formData, qty: val })
                                }}
                                value={formData.qty}
                            />
                        </div>
                    </div>
                </div>
                <div className='mt-3'>
                    <p>Message</p>
                    <textarea rows={3}
                        onChange={(e) => {
                            setFormData({ ...formData, message: e.target.value })
                        }}
                        value={formData.message}
                    ></textarea>
                </div>


                <div className='w-full flex justify-center gap-3 my-3 mt-5'>
                    <button className='add-bill-btn'
                        onClick={mode ? updateData : saveData}>
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
    AddEnquiryComponent
}
export default AddEnquiry;