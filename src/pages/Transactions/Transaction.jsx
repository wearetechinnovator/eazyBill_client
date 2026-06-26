import React, { useEffect, useMemo, useRef, useState } from 'react'
import Nav from '../../components/Nav';
import SideNav from '../../components/SideNav';
import { Popover, SelectPicker, Whisper } from 'rsuite';
import { BiPrinter } from "react-icons/bi";
import { FaRegCopy, FaRegEdit } from "react-icons/fa";
import { MdFilterList } from "react-icons/md";
import { FaRegFilePdf } from "react-icons/fa";
import { FaRegFileExcel } from "react-icons/fa";
import { MdDeleteOutline } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import useExportTable from '../../hooks/useExportTable';
import useMyToaster from '../../hooks/useMyToaster';
import downloadPdf from '../../helper/downloadPdf';
import Cookies from 'js-cookie';
import DataShimmer from '../../components/DataShimmer';
import { Tooltip } from 'react-tooltip';
import { IoIosAdd } from 'react-icons/io';
import AddNew from '../../components/AddNew';
import { FiMoreHorizontal } from 'react-icons/fi';
import Pagination from '../../components/Pagination';
import { Icons } from '../../helper/icons';
import useApi from '../../hooks/useApi';
import { Constants } from '../../helper/constants';
import { getAdvanceFilterData } from '../../helper/advanceFilter';
import ContextMenu from '../../components/ContextMenu';




const DEBOUNCE_TIME = 300;
const Transaction = () => {
    const token = Cookies.get("token");
    const { getApiData } = useApi();
    const toast = useMyToaster();
    const { copyTable, downloadExcel, printTable, exportPdf } = useExportTable();
    const [activePage, setActivePage] = useState(1);
    const [dataLimit, setDataLimit] = useState(10);
    const [totalData, setTotalData] = useState();
    const [selected, setSelected] = useState([]);
    const navigate = useNavigate();
    const [transactionData, setTransactionData] = useState([]);
    const tableRef = useRef(null);
    const [tableStatusData, setTableStatusData] = useState('active');
    const exportData = useMemo(() => {
        return transactionData && transactionData.map(({
            transactionDate, purpose, transactionNumber, transactionType,
            amount
        }) => ({
            Date: transactionDate.split("T")[0],
            Purpose: purpose,
            "Transaction Number": transactionNumber,
            "Transaction Type": transactionType,
            Amount: amount
        }));
    }, [transactionData]);
    const [loading, setLoading] = useState(true);
    const [allCategory, setAllCategory] = useState([]);
    const [filterOpen, setFilterOpen] = useState(false);
    const [filter, setFilter] = useState({
        startDate: "", endDate: "", category: ""
    })
    const [applyFilter, setApplyFilter] = useState(null);
    const [isCustomDate, setIsCustomDate] = useState(false);
    const [searchText, setSearchText] = useState("");
    let debounceRef = useRef(null);



    // Get Transaction Categories;
    useEffect(() => {
        (async () => {
            const data = await getApiData("transaction-category");
            const category = data.data.map(d => ({ label: d.categoryName, value: d._id }));
            setAllCategory([...category]);
        })()
    })

    // Get data with Filter and without filter both;
    useEffect(() => {
        const getTransaction = async () => {
            setLoading(true);
            try {
                let data = {
                    token,
                    all: tableStatusData === "all" ? true : false,
                    searchText: searchText,
                }
                if (applyFilter) {
                    data = {
                        ...data,
                        startDate: filter.startDate,
                        endDate: filter.endDate,
                        category: filter.category
                    }
                }
                const url = `${process.env.REACT_APP_API_URL}/other-transaction/get?page=${activePage}&limit=${dataLimit}`;
                const req = await fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                const res = await req.json();
                if (req.status !== 200) {
                    return toast(res.err, "error");
                }

                setTotalData(res.totalData)
                setTransactionData([...res.data]);

            } catch (error) {
                console.log(error)
                return toast("Something went wrong", "error");
            } finally {
                setLoading(false);
            }
        }
        getTransaction();
    }, [tableStatusData, dataLimit, activePage, applyFilter, searchText])




    const selectAll = (e) => {
        if (e.target.checked) {
            setSelected(transactionData.map(data => data._id));
        } else {
            setSelected([]);
        }
    };


    const handleCheckboxChange = (index) => {
        setSelected((prevSelected) => {
            if (prevSelected.includes(index)) {
                return prevSelected.filter((i) => i !== index);
            } else {
                return [...prevSelected, index];
            }
        });
    };


    const exportTable = async (whichType) => {
        if (whichType === "copy") {
            copyTable("listTransaction"); // Pass tableid
        }
        else if (whichType === "excel") {
            downloadExcel(exportData, 'transaction-list.xlsx') // Pass data and filename
        }
        else if (whichType === "print") {
            printTable(tableRef, "Transaction List"); // Pass table ref and title
        }
        else if (whichType === "pdf") {
            let document = exportPdf('Transaction List', exportData);
            downloadPdf(document)
        }
    }


    const removeData = async () => {
        if (selected.length === 0 || tableStatusData !== 'active') {
            return;
        }
        const url = process.env.REACT_APP_API_URL + "/other-transaction/delete";
        try {
            const req = await fetch(url, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ ids: selected, token })
            });
            const res = await req.json();

            if (req.status !== 200 || res.err) {
                return toast(res.err, 'error');
            }

            selected.forEach((id, _) => {
                setTransactionData((prevData) => {
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


    const resetFilter = () => {
        setFilter({
            startDate: "", endDate: "", category: ""
        })
        setApplyFilter(false);
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
            <Nav title={"Other Transaction"} />
            <main id='main'>
                <SideNav />
                <Tooltip id='transactionTooltip' />
                <ContextMenu
                    print={() => exportTable('print')}
                    copy={() => exportTable('copy')}
                    pdf={() => exportTable('pdf')}
                    excel={() => exportTable('excel')}
                />
                <div className='content__body'>
                    {/* top section */}
                    <div className={"add_new_compnent"}>
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
                                {/* <div className='flex w-full flex-col lg:w-[300px]'>
                                    <input type='search'
                                        placeholder='Search Transaction Number...'
                                        onChange={searchData}
                                        className='p-[6px] text-xs'
                                    />
                                </div> */}
                                <button
                                    onClick={() => setFilterOpen(!filterOpen)}
                                    className='bg-gray-100 border'>
                                    <MdFilterList className='text-xl' />
                                    Filter
                                </button>
                                <button
                                    onClick={() => removeData()}
                                    className={`${selected.length > 0 ? 'bg-red-400 text-white' : 'bg-gray-100'} border`}>
                                    <MdDeleteOutline className='text-lg' />
                                    Delete
                                </button>
                                <button
                                    onClick={() => navigate("/admin/other-transaction/add")}
                                    className='bg-[#003E32] text-white '>
                                    <Icons.ADD className='text-white' size={15} />
                                    Add New
                                </button>
                                {
                                    transactionData?.length > 0 && (
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
                                                    <Icons.MORE />
                                                </div>
                                            </Whisper>
                                        </div>
                                    )
                                }

                            </div>
                        </div>
                        {
                            filterOpen && (
                                <div className='w-full flex flex-col transition-all'>
                                    <hr />
                                    <div className='w-full flex items-center gap-4'>
                                        <div className='w-full'>
                                            <label htmlFor="categorySelect">Category</label>
                                            <SelectPicker
                                                className='w-full'
                                                onChange={(v) => {
                                                    setFilter({ ...filter, category: v });
                                                    setApplyFilter(false);
                                                }}
                                                data={allCategory}
                                                value={filter.category}
                                            />
                                        </div>
                                        <div className='w-full'>
                                            <label htmlFor="categorySelect">Search By</label>
                                            <SelectPicker
                                                searchable={false}
                                                className='w-full'
                                                menuMaxHeight={"250px"}
                                                onChange={async (v) => {
                                                    if (v === Constants.CUSTOM) {
                                                        setIsCustomDate(true);
                                                        return;
                                                    }
                                                    const { fromDate, toDate } = await getAdvanceFilterData(v);
                                                    setFilter({ ...filter, startDate: fromDate, endDate: toDate })
                                                    setIsCustomDate(false);
                                                    setApplyFilter(false);
                                                }}
                                                data={[
                                                    { label: "Today", value: Constants.TODAY },
                                                    { label: "Yesterday", value: Constants.YESTERDAY },
                                                    { label: "Last 7 Days", value: Constants.LAST7DAY },
                                                    { label: "Last 30 Days", value: Constants.LAST30DAY },
                                                    { label: "Last 365 Days", value: Constants.LAST365DAY },
                                                    { label: "This Week", value: Constants.THISWEEK },
                                                    { label: "Last Week", value: Constants.LASTWEEK },
                                                    { label: "This Month", value: Constants.THISMONTH },
                                                    { label: "Previous Month", value: Constants.PREVMONTH },
                                                    { label: "This Quarter", value: Constants.THISQUARTER },
                                                    { label: "Last Quarter", value: Constants.LASTQUARTER },
                                                    { label: "Current Fiscal Year", value: Constants.CURRENTFISCAL },
                                                    { label: "Last Fiscal Year", value: Constants.LASTFISCAL },
                                                    { label: "Custom Date", value: Constants.CUSTOM }
                                                ]}
                                            />
                                        </div>
                                        {
                                            isCustomDate && (
                                                <>
                                                    <div className='w-full'>
                                                        <label htmlFor="startDate">Start Date</label>
                                                        <input id='startDate'
                                                            type="date"
                                                            onChange={(e) => setFilter({ ...filter, startDate: e.target.value })}
                                                            value={filter.startDate}
                                                        />
                                                    </div>
                                                    <div className='w-full'>
                                                        <label htmlFor="endDate">End Date</label>
                                                        <input id='endDate'
                                                            type="date"
                                                            onChange={(e) => setFilter({ ...filter, endDate: e.target.value })}
                                                            value={filter.endDate}
                                                        />
                                                    </div>
                                                </>
                                            )
                                        }
                                    </div>

                                    <div className='w-full flex items-center justify-end gap-2 mt-4 pb-2'>
                                        <button
                                            onClick={() => setApplyFilter(true)}
                                            className='add-bill-btn'>
                                            <Icons.SEARCH className='inline' />
                                            Search
                                        </button>
                                        <button
                                            onClick={resetFilter}
                                            className='reset-bill-btn'>
                                            <Icons.RESET className='inline' />
                                            Reset
                                        </button>
                                    </div>
                                </div>
                            )
                        }
                    </div>
                    {
                        !loading ? transactionData.length > 0 ? <div className='content__body__main view'>
                            {/* Table start */}
                            <div className='overflow-x-auto list__table'>
                                <table className='min-w-full bg-white' id='listTransaction'>
                                    <thead className='list__table__head'>
                                        <tr>
                                            <th className='py-2 px-4 border-b'>
                                                <input type='checkbox'
                                                    onChange={selectAll}
                                                    checked={transactionData.length > 0 && selected.length === transactionData.length}
                                                />
                                            </th>
                                            <th align='left' className='w-40'>Date</th>
                                            <th align='left' className='w-40'>Transaction Number</th>
                                            <th align='left'>Category</th>
                                            <th align='left'>Type</th>
                                            <th align='left'>Amount</th>
                                            <th className='w-20'>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            transactionData.map((data, i) => {
                                                return <tr key={data._id}>
                                                    <td className='py-2 max-w-[10px]' align='center'>
                                                        <input type='checkbox' checked={selected.includes(data._id)} onChange={() => handleCheckboxChange(data._id)} />
                                                    </td>
                                                    <td>{data.transactionDate.split("T")[0]}</td>
                                                    <td>{data.transactionNumber}</td>
                                                    <td>{data.category.categoryName}</td>
                                                    <td>
                                                        <span className={`${data.transactionType === "income" ? "green-badge" : "red-badge"} badge capitalize`}>
                                                            {data.transactionType}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <Icons.RUPES className='inline' />
                                                        {Number(data.amount).toFixed(2)}
                                                    </td>
                                                    <td className='px-4 text-center'>
                                                        <Whisper
                                                            placement='leftStart'
                                                            trigger={"click"}
                                                            speaker={<Popover full>
                                                                <div
                                                                    className='table__list__action__icon'
                                                                    onClick={() => navigate(`/admin/other-transaction/edit/${data._id}`)}
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

                                                </tr >
                                            })
                                        }
                                    </tbody >
                                </table>
                                <div className='paginate__parent'>
                                    <p>Showing {transactionData.length} of {totalData} entries</p>
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
                            : <AddNew title={"Transaction"} link={'/admin/other-transaction/add'} />
                            : <DataShimmer />
                    }
                </div>
            </main>
        </>
    )
}

export default Transaction;