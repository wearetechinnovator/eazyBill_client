import React, { useEffect, useMemo, useRef, useState } from 'react'
import Nav from '../../components/Nav';
import SideNav from '../../components/SideNav';
import { Popover, Whisper } from 'rsuite';
import { BiPrinter } from "react-icons/bi";
import { FaRegCopy, FaRegEdit } from "react-icons/fa";
import { FaRegFilePdf } from "react-icons/fa";
import { FaRegFileExcel } from "react-icons/fa";
import { MdDeleteOutline } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import useExportTable from '../../hooks/useExportTable';
import useMyToaster from '../../hooks/useMyToaster';
import Cookies from 'js-cookie';
import downloadPdf from '../../helper/downloadPdf';
import DataShimmer from '../../components/DataShimmer';
import { Tooltip } from 'react-tooltip';
import { IoIosAdd, IoMdMore } from 'react-icons/io';
import AddNew from '../../components/AddNew';
import { FiMoreHorizontal } from 'react-icons/fi';
import ConfirmModal from '../../components/ConfirmModal';
import Pagination from '../../components/Pagination';
import { Icons } from '../../helper/icons';



const DEBOUNCE_TIME = 300;
const Unit = () => {
    const toast = useMyToaster();
    const { copyTable, downloadExcel, printTable, exportPdf } = useExportTable();
    const [activePage, setActivePage] = useState(1);
    const [dataLimit, setDataLimit] = useState(10);
    const [totalData, setTotalData] = useState()
    const [selected, setSelected] = useState([]);
    const navigate = useNavigate();
    const [unitData, setUnitData] = useState([]);
    const tableRef = useRef(null);
    const [tableStatusData, setTableStatusData] = useState('active');
    const exportData = useMemo(() => {
        return unitData && unitData.map(({ title }) => ({
            Title: title
        }));
    }, [unitData]);
    const [loading, setLoading] = useState(true);
    const [openConfirm, setOpenConfirm] = useState(false);
    const [searchText, setSearchText] = useState("");
    let debounceRef = useRef(null);


    // Get data;
    useEffect(() => {
        const getParty = async () => {
            try {
                const data = {
                    token: Cookies.get("token"),
                    all: tableStatusData === "all" ? true : false,
                    searchText: searchText
                }
                const url = process.env.REACT_APP_API_URL + `/unit/get?page=${activePage}&limit=${dataLimit}`;
                const req = await fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                const res = await req.json();
                setTotalData(res.totalData)
                setUnitData([...res.data]);
                setLoading(false);

            } catch (error) {
                console.log(error)
            }
        }
        getParty();
    }, [tableStatusData, dataLimit, activePage, searchText])


    const searchTable = (e) => {
        const value = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('.list__table tbody tr');

        rows.forEach(row => {
            const cols = row.querySelectorAll('td');
            let found = false;
            cols.forEach((col, index) => {
                if (index !== 0 && col.innerHTML.toLowerCase().includes(value)) {
                    found = true;
                }
            });
            if (found) {
                row.style.display = "";
            } else {
                row.style.display = "none";
            }
        });
    }

    const selectAll = (e) => {
        if (e.target.checked) {
            setSelected(unitData.map((e, _) => e._id));
        } else {
            setSelected([]);
        }
    };

    const handleCheckboxChange = (id) => {
        setSelected((prevSelected) => {
            if (prevSelected.includes(id)) {
                return prevSelected.filter((prevId, _) => prevId !== id);
            } else {
                return [...prevSelected, id];
            }
        });
    };

    const exportTable = async (whichType) => {
        if (whichType === "copy") {
            copyTable("listOfTax"); // Pass tableid
        }
        else if (whichType === "excel") {
            downloadExcel(exportData, 'unit-list.xlsx') // Pass data and filename
        }
        else if (whichType === "print") {
            printTable(tableRef, "Unit List"); // Pass table ref and title
        }
        else if (whichType === "pdf") {
            let document = exportPdf('Tax List', exportData);
            downloadPdf(document)
        }
    }

    const removeData = async () => {
        if (selected.length === 0 || tableStatusData !== 'active') {
            return;
        }
        const url = process.env.REACT_APP_API_URL + "/unit/delete";
        try {
            const req = await fetch(url, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ ids: selected })
            });
            const res = await req.json();

            if (req.status !== 200 || res.err) {
                return toast(res.err, 'error');
            }

            selected.forEach((id, _) => {
                setUnitData((prevData) => {
                    return prevData.filter((data, _) => data._id !== id)
                })
            });
            setSelected([]);

            return toast(res.msg, 'success');

        } catch (error) {
            console.log(error)
            toast("Something went wrong", "error")
        }
    }

    const restoreData = async () => {
        if (selected.length === 0 || tableStatusData !== "trash") {
            return;
        }

        const url = process.env.REACT_APP_API_URL + "/unit/restore";
        try {
            const req = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ ids: selected })
            });
            const res = await req.json();

            if (req.status !== 200 || res.err) {
                return toast(res.err, 'error');
            }

            selected.forEach((id, _) => {
                setUnitData((prevData) => {
                    return prevData.filter((data, _) => data._id !== id)
                })
            });
            setSelected([]);
            return toast(res.msg, 'success');

        } catch (error) {
            console.log(error)
            toast("Something went wrong", "error")
        }
    }

    const searchData = (e) => {
        const value = e.target.value;

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            setSearchText(value);
        }, DEBOUNCE_TIME);
    };

    return (
        <>
            <Nav title={"Unit"} />
            <main id='main'>
                <SideNav />
                <Tooltip id='unitTooltip' />
                <ConfirmModal
                    openConfirm={openConfirm}
                    openStatus={(status) => { setOpenConfirm(status) }}
                    title={"Are you sure you want to delete the selected Units?"}
                    fun={() => {
                        removeData();
                        setOpenConfirm(false);
                    }}
                />
                <div className='content__body'>
                    {/* top section */}
                    <div className="add_new_compnent">
                        <div className='flex justify-between items-center'>
                            <div className='flex flex-col'>
                                <select value={dataLimit} onChange={(e) => setDataLimit(e.target.value)}>
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                            </div>
                            <div className='flex items-center gap-2'>
                                <div className='flex w-full flex-col lg:w-[300px]'>
                                    <input type='text'
                                        placeholder='Search...'
                                        onChange={searchData}
                                        className='p-[6px]'
                                    />
                                </div>
                                <button
                                    onClick={() => {
                                        if (selected.length === 0 || tableStatusData !== 'active') return;
                                        setOpenConfirm(true);
                                    }}
                                    className={`${selected.length > 0 ? 'bg-red-400 text-white' : 'bg-gray-100'} border`}>
                                    <MdDeleteOutline className='text-lg' />
                                    Delete
                                </button>
                                <button
                                    onClick={() => navigate("/admin/unit/add")}
                                    className='bg-[#003E32] text-white '>
                                    <Icons.ADD className='text-white' size={15}/>
                                    Add New
                                </button>
                                {
                                    unitData?.length > 0 && (
                                        <div className='flex justify-end'>
                                            <Whisper placement='leftStart' enterable
                                                speaker={<Popover full>
                                                    <div className='download__menu' onClick={() => exportTable('print')} >
                                                        <BiPrinter className='text-[16px]' />
                                                        Print Table
                                                    </div>
                                                    <div className='download__menu' onClick={() => exportTable('copy')}>
                                                        <FaRegCopy className='text-[16px]' />
                                                        Copy Table
                                                    </div>
                                                    <div className='download__menu' onClick={() => exportTable('pdf')}>
                                                        <FaRegFilePdf className="text-[16px]" />
                                                        Download Pdf
                                                    </div>
                                                    <div className='download__menu' onClick={() => exportTable('excel')} >
                                                        <FaRegFileExcel className='text-[16px]' />
                                                        Download Excel
                                                    </div>
                                                </Popover>}
                                            >
                                                <div className='record__download' >
                                                    <IoMdMore />
                                                </div>
                                            </Whisper>
                                        </div>
                                    )
                                }
                            </div>
                        </div>
                    </div>

                    {
                        !loading ? unitData.length > 0 ? <div className='content__body__main'>
                            {/* Table start */}
                            <div className='overflow-x-auto list__table'>
                                <table className='min-w-full bg-white' id='listQuotation' ref={tableRef}>
                                    <thead className='list__table__head'>
                                        <tr>
                                            <th className='py-2 px-4 border-b w-[50px]'>
                                                <input type='checkbox' onChange={selectAll} checked={unitData.length > 0 && selected.length === unitData.length} />
                                            </th>
                                            <th className='py-2 px-4 border-b '>Title</th>
                                            <th className='py-2 px-4 border-b w-[70px]'>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            unitData.map((data, i) => {
                                                return <tr key={i}>
                                                    <td className='py-2 px-4 border-b max-w-[10px]' align='center'>
                                                        <input type='checkbox'
                                                            checked={selected.includes(data._id)}
                                                            onChange={() => handleCheckboxChange(data._id)}
                                                        />
                                                    </td>
                                                    <td className='px-4 border-b' align='center'>{data.title}</td>

                                                    <td className='px-4 text-center'>
                                                        <Whisper
                                                            placement='leftStart'
                                                            trigger={"click"}
                                                            speaker={<Popover full>
                                                                <div
                                                                    className='table__list__action__icon'
                                                                    onClick={() => navigate(`/admin/unit/edit/${data._id}`)}
                                                                >
                                                                    <FaRegEdit className='text-[16px]' />
                                                                    Edit
                                                                </div>
                                                            </Popover>}
                                                        >
                                                            <div className='table__list__action' >
                                                                <FiMoreHorizontal />
                                                            </div>
                                                        </Whisper>
                                                    </td>
                                                </tr>
                                            })
                                        }
                                    </tbody>
                                </table>
                                <div className='paginate__parent'>
                                    <p>Showing {unitData.length} of {totalData} entries</p>
                                    <Pagination
                                        activePage={activePage}
                                        totalData={totalData}
                                        dataLimit={dataLimit}
                                        setActivePage={setActivePage}
                                    />
                                </div>
                                {/* pagination end */}
                            </div>
                        </div>
                            : <AddNew title={"Unit"} link={"/admin/unit/add"} />
                            : <DataShimmer />
                    }
                </div>
            </main>
        </>
    )
}

export default Unit