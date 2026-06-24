import React, { useEffect, useState } from 'react'
import Nav from '../../components/Nav';
import SideNav from '../../components/SideNav';
import useMyToaster from '../../hooks/useMyToaster';
import { useNavigate, useParams } from 'react-router-dom';
import Cookies from 'js-cookie';
import { Icons } from '../../helper/icons';
import Loading from '../../components/Loading';




const UnitAdd = ({ mode }) => {
    const toast = useMyToaster();
    const [form, setForm] = useState({ title: '', details: '' });
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        if (mode) {
            const get = async () => {
                const url = process.env.REACT_APP_API_URL + "/unit/get";
                const cookie = Cookies.get("token");

                const req = await fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": 'application/json'
                    },
                    body: JSON.stringify({ token: cookie, id: id })
                })
                const res = await req.json();
                setForm({ ...form, ...res.data });
            }

            get();
        }
    }, [mode])

    const saveData = async (e) => {
        if (form.title === "") {
            return toast("fill the blank", "error")
        }

        try {
            setLoading(true);
            const url = process.env.REACT_APP_API_URL + "/unit/add";
            const token = Cookies.get("token");
            const req = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(!mode ? { ...form, token } : { ...form, token, update: true, id: id })
            })
            const res = await req.json();
            if (req.status !== 200 || res.err) {
                return toast(res.err, 'error');
            }

            if (!mode) {
                setForm({ title: "", details: '' });
            }

            toast(!mode ? "Unit create success" : "Unit update success", 'success');
            navigate('/admin/unit');
            return

        } catch (error) {
            return toast("Something went wrong", "error")
        } finally {
            setLoading(false);
        }

    }


    const clearData = (e) => {
        setForm({
            title: '',
        })
    }

    return (
        <>
            <Nav title={mode ? "Update Unit" : "Add Unit"} />
            <main id='main'>
                <SideNav />
                <div className='content__body'>
                    <div className='content__body__main bg-white '>
                        <div className=' flex-col lg:flex-row'>
                            <div className='w-full'>
                                <div className='p-2'>
                                    <p className='pb-1'>Title <span className='required__text'>*</span></p>
                                    <input type='text' onChange={(e) => setForm({ ...form, title: e.target.value })} value={form.title} />
                                </div>
                            </div>
                        </div>
                        <div className='w-full flex justify-center gap-3 my-3 mt-5'>
                            <button
                                onClick={loading ? null : saveData}
                                className='add-bill-btn'
                            >
                                {loading ? <Loading /> : <Icons.CHECK />}
                                {!mode ? "Save" : "Update"}
                            </button>
                            <button className='reset-bill-btn' onClick={clearData}>
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

export default UnitAdd