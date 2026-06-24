import { useEffect, useState } from 'react';
import { Modal } from 'rsuite';
import useMyToaster from '../hooks/useMyToaster';
import Cookies from 'js-cookie';
import { Icons } from '../helper/icons';
import Loading from './Loading';


const TransactionCategoryManageModal = ({ openModal, openStatus }) => {
    const token = Cookies.get('token');
    const toast = useMyToaster();
    const [formData, setFormData] = useState({ categoryName: '' });
    const [open, setOpen] = useState(false);
    const [categoryData, setCategoryData] = useState([]);
    const [editId, setEditId] = useState(null);
    const [loading, setLoading] = useState(false);


    // Set modal open state based on prop;
    useEffect(() => {
        setOpen(openModal);
    }, [openModal])


    // Get Categories
    useEffect(() => {
        (async () => {
            try {
                const URL = `${process.env.REACT_APP_API_URL}/transaction-category/get`;
                const req = await fetch(URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ token })
                })
                const res = await req.json();

                if (req.status !== 200) {
                    return toast(res.err, 'error');
                }

                setCategoryData(res.data);

            } catch (error) {
                console.log(error)
                return toast("Something went wrong", "error");
            }
        })()
    }, [])


    const addCategory = async () => {
        if (formData.categoryName === "")
            return toast("Enter Category Name", 'error');


        try {
            setLoading(true);
            const URL = `${process.env.REACT_APP_API_URL}/transaction-category/add`;
            let data = { token, categoryName: formData.categoryName };
            if (editId) {
                data.id = editId;
                data.update = true;
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

            if (editId) {
                setCategoryData(prev => prev.map(c => {
                    if (c._id === editId) {
                        return { ...c, categoryName: formData.categoryName };
                    }
                    return c;
                }))
                setEditId(null);
                toast(res.msg, 'success');
            } else {
                setCategoryData(prev => [...prev, res]);
                toast("Category added successfully", 'success');
            }

            setFormData({ categoryName: '' });

        } catch (error) {
            return toast("Something went wrong", "error");
        } finally {
            setLoading(false);
        }
    }


    const deleteCategory = async (id) => {
        try {
            const URL = `${process.env.REACT_APP_API_URL}/transaction-category/delete`;
            const req = await fetch(URL, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ id })
            })
            const res = await req.json();
            if (req.status !== 200) {
                return toast(res.err, 'error');
            }

            setCategoryData(prev => prev.filter(c => c._id !== id));
            return toast(res.msg, 'success');

        } catch (err) {
            console.log(err);
            return toast("Something went wrong", "error");
        }
    }


    return (
        <Modal size='md' backdrop='static' open={open} onClose={() => {
            openStatus(false);
            setOpen(false);
            setFormData({ categoryName: '' });
            setEditId(null);
        }}>
            <Modal.Header className='border-b pb-2'>
                <Modal.Title>
                </Modal.Title>
                <p className='font-bold'>Add / Manage Category</p>
            </Modal.Header>
            <Modal.Body>
                <div className='w-full bg-gray-50 rounded border p-2 sticky top-0'>
                    <input type="text"
                        className='text-sm py-2'
                        placeholder='Enter Category name'
                        onChange={(e) => setFormData({ categoryName: e.target.value })}
                        value={formData.categoryName}
                    />
                    <button
                        onClick={loading ? null : addCategory}
                        className='text-xs px-2 py-1 rounded mt-1 bg-blue-400 text-white flex items-center gap-1'
                    >
                        {loading ? <Loading /> : <Icons.CHECK />}
                        {editId ? "Update" : "Add"} Category
                    </button>
                </div>


                <div className='w-full flex flex-col mt-4'>
                    {
                        categoryData.map((c, i) => {
                            return <div key={i} className='w-full flex items-center justify-between px-2 py-2 border-b hover:bg-gray-50'>
                                <p className='text-sm'>{c.categoryName}</p>
                                <div className='flex items-center gap-2'>
                                    <button
                                        onClick={() => {
                                            setFormData({ categoryName: c.categoryName });
                                            setEditId(c._id);
                                        }}
                                        className='border hover:border-blue-400 text-[17px] p-1 rounded'
                                    >
                                        <Icons.PENCIL className='text-blue-500' />
                                    </button>
                                    <button
                                        onClick={() => deleteCategory(c._id)}
                                        className='border hover:border-red-400 text-[17px] p-1 rounded'
                                    >
                                        <Icons.DELETE className=' text-red-500' />
                                    </button>
                                </div>
                            </div>
                        })
                    }
                </div>
            </Modal.Body>
        </Modal>
    )
}

export default TransactionCategoryManageModal;