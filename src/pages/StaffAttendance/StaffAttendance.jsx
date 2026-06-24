import { useEffect, useMemo, useRef, useState } from 'react'
import Nav from '../../components/Nav';
import SideNav from '../../components/SideNav';
import { Popover, Whisper } from 'rsuite';
import Pagination from '../../components/Pagination';
import { BiPrinter } from "react-icons/bi";
import { FaRegCopy } from "react-icons/fa";
import { FaRegFilePdf } from "react-icons/fa";
import { FaRegFileExcel } from "react-icons/fa";
import { MdDeleteOutline } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import useExportTable from '../../hooks/useExportTable';
import useMyToaster from '../../hooks/useMyToaster';
import Cookies from 'js-cookie';
import downloadPdf from '../../helper/downloadPdf';
import { Tooltip } from 'react-tooltip';
import { IoIosAdd, IoMdMore } from 'react-icons/io';
import AddNew from '../../components/AddNew';
import { Icons } from '../../helper/icons';
import AttendanceSettingModal from '../../components/AttendanceSettingModal';
import AttendanceOverTime from '../../components/AttendanceOverTimeModal';
import ConfirmModal from '../../components/ConfirmModal';
import AttendanceShimmer from '../../components/AttendanceShimmer';
import { Constants } from '../../helper/constants';
import Loading from '../../components/Loading';
import ContextMenu from '../../components/ContextMenu';





const DEBOUNCE_TIME = 300;
const StaffAttendance = () => {
    const toast = useMyToaster();
    const { copyTable, downloadExcel, printTable, exportPdf } = useExportTable();
    const [activePage, setActivePage] = useState(1);
    const [dataLimit, setDataLimit] = useState(10);
    const [totalData, setTotalData] = useState();
    const [selected, setSelected] = useState([]);
    const navigate = useNavigate();
    const [data, setdata] = useState([]);
    const tableRef = useRef(null);
    const [tableStatusData, setTableStatusData] = useState('active');
    const exportData = useMemo(() => {
        return data && data.map((d) => ({
            "Staff Name": d.staffName,
            "Mobile Number": d.mobileNumber,
            "Attendance": ""
        }));
    }, [data]);
    const [loading, setLoading] = useState(true);
    const [settingModal, setSettingModal] = useState(false);
    const [overTimeModal, setOverTimeModal] = useState(false);
    const attendanceDateRef = useRef(null)
    const [attendanceDatePickerValue, setAttendanceDatePickervalue] = useState(
        new Date().toISOString().split("T")[0]
    );
    const [attendanceSheet, setAttendanceSheet] = useState([]); // {staffId, date, attendance}
    const attendanceSaveTimer = useRef(null);
    const ATTENDANCE_SAVE_TIME = 2000; // Debounce time;
    const [currentStaffData, setCurrentStaffData] = useState(null); // Send staff id in overTime modal;
    const [attendanceDataForModal, setAttendanceDataForModal] = useState(null);
    const [allTotalData, setAllTotalData] = useState({
        present: 0, absent: 0, halfDay: 0, paidLeave: 0, weeklyOff: 0, overTime: 0
    })
    const [openConfirm, setOpenConfirm] = useState(false);
    const [searchText, setSearchText] = useState("");
    let debounceRef = useRef(null);
    // When click on attendance button loading true after response loading false;
    const [attendanceLoading, setAttendanceLoading] = useState(false);





    // Get staffs;
    useEffect(() => {
        const get = async () => {
            try {
                setLoading(true);
                const data = {
                    token: Cookies.get("token"),
                    all: tableStatusData === "all" ? true : false,
                    searchText: searchText
                }
                const url = process.env.REACT_APP_API_URL + `/staff/get?page=${activePage}&limit=${dataLimit}`;
                const req = await fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                const res = await req.json();

                setTotalData(res.totalData)
                setdata([...res.data]);
                setLoading(false);

            } catch (error) {
                console.log(error)
            }
        }
        get();
    }, [tableStatusData, dataLimit, activePage, searchText])


    // Get Attendance
    useEffect(() => {
        (async () => {
            try {
                setLoading(true)
                const URL = `${process.env.REACT_APP_API_URL}/attendance/get`;
                const token = Cookies.get("token");
                const req = await fetch(URL, {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ date: attendanceDatePickerValue, token })
                })
                const res = await req.json();

                if (res.data.length > 0) {
                    const fetchedAttendanceSheet = res.data.reduce((acc, item) => {
                        const newObj = {
                            staffId: item.staffId,
                            date: item.date,
                            attendance: item.attendance,
                            attendanceType: item.attendanceType,
                            overTimeType: item.overTimeType,
                            overTimeHour: item.overTimeHour,
                            overTimeMinute: item.overTimeMinute,
                            overTimeRate: item.overTimeRate,
                            customeOverTimeRate: item.customeOverTimeRate,
                            fixedOverTimeAmount: item.fixedOverTimeAmount
                        };
                        acc.push(newObj);

                        return acc;
                    }, []);

                    setAttendanceSheet(fetchedAttendanceSheet);

                    const total = res.data.reduce((acc, item) => {
                        if (item.attendance === "1") {
                            acc.p += 1;
                            if (item.attendanceType === "half-day") {
                                acc.hd += 1;
                            }
                            else if (item.attendanceType === "over-time") {
                                acc.ot += 1;
                            }
                        }
                        else if (item.attendance === "0") {
                            acc.a += 1;
                            if (item.attendanceType === "paid-leave") {
                                acc.pl += 1;
                            }
                            else if (item.attendanceType === "week-off") {
                                acc.wo += 1;
                            }
                        }

                        return acc;
                    }, { p: 0, a: 0, hd: 0, pl: 0, wo: 0, ot: 0 })

                    setAllTotalData({
                        present: total.p,
                        absent: total.a,
                        halfDay: total.hd,
                        paidLeave: total.pl,
                        weeklyOff: total.wo,
                        overTime: total.ot
                    })
                } else {
                    setAttendanceSheet([]);
                    setAllTotalData({
                        present: 0,
                        absent: 0,
                        halfDay: 0,
                        paidLeave: 0,
                        weeklyOff: 0,
                        overTime: 0
                    })
                }

                setLoading(false)

            } catch (error) {
                setLoading(false)
                return toast("Attendance not get", "error");
            }
        })()
    }, [attendanceDatePickerValue])


    const selectAll = (e) => {
        if (e.target.checked) {
            setSelected(data.map((e, _) => e._id));
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
            copyTable("staffTable"); // Pass tableid
        }
        else if (whichType === "excel") {
            downloadExcel(exportData, 'staff-attendance.xlsx') // Pass data and filename
        }
        else if (whichType === "print") {
            printTable(tableRef, "Attendance List"); // Pass table ref and title
        }
        else if (whichType === "pdf") {
            let document = exportPdf('Attendance List', exportData);
            downloadPdf(document)
        }
    }


    const removeData = async () => {
        if (selected.length === 0 || tableStatusData !== 'active') {
            return;
        }
        const url = process.env.REACT_APP_API_URL + "/staff/delete";
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
                setdata((prevData) => {
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


    // When click attendance button `A` | `P`
    const handleAttendance = async (userData, attendance, type = "none") => {
        setAttendanceLoading(true);
        let attSheet = [...attendanceSheet];
        attSheet = attSheet.filter((a, _) => a.staffId !== userData._id);

        let attendanceDataSet = {
            staffId: userData._id,
            date: attendanceDatePickerValue,
            attendance: attendance, // `P` | `A`
            attendanceType: type
        };

        attSheet.push(attendanceDataSet);
        localStorage.setItem("attendance", JSON.stringify(attSheet));
        localStorage.setItem("attendance_timestamp", Date.now());

        setAttendanceSheet(attSheet);
    }


    // Attendance Debounce Logic here;
    useEffect(() => {
        console.log('rr')
        if (attendanceSaveTimer.current) {
            clearTimeout(attendanceSaveTimer.current);
        }

        const timestamp = Number(localStorage.getItem("attendance_timestamp"));
        if (!timestamp) {
            return;
        };

        const elapsed = Date.now() - timestamp;
        const remaining = Math.max(ATTENDANCE_SAVE_TIME - elapsed, 0);

        attendanceSaveTimer.current = setTimeout(() => {
            const attendanceData = JSON.parse(localStorage.getItem('attendance'));

            if (!attendanceData || attendanceData.length === 0) {
                clearTimeout(attendanceSaveTimer.current);
                return;
            }

            (async () => {
                try {
                    console.log("attendanceSheet");
                    const URL = `${process.env.REACT_APP_API_URL}/attendance/add`;
                    const token = Cookies.get("token");
                    const req = await fetch(URL, {
                        method: 'POST',
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ attendanceData: attendanceSheet, token })
                    })
                    const res = await req.json();
                    if (req.status !== 200) {
                        localStorage.removeItem('attendance');
                        localStorage.removeItem("attendance_timestamp");

                        return toast(res.err, "error")
                    }

                    return toast("Staff attendance successfully", "success");

                } catch (er) {
                    return toast("Attendance failed", "error")
                }
                finally {
                    localStorage.removeItem('attendance');
                    localStorage.removeItem("attendance_timestamp");
                    setAttendanceLoading(false);
                }
            })()

        }, remaining);

        //return () => clearTimeout(attendanceSaveTimer.current);

    }, [attendanceSheet])


    // Jodi page refrash kora hoy r data thake tahole
    // Storage theke data variable a rakha hobe;
    useEffect(() => {
        const attendanceData = JSON.parse(localStorage.getItem("attendance"));

        if (attendanceData && attendanceData.length > 0) {
            setAttendanceSheet(attendanceData);
        }
    }, []);


    // Custom Date change on Attendance `Next` | `Prev` Button;
    const dateChanger = (type) => {
        const d = new Date(attendanceDatePickerValue);

        if (type === "prev") {
            d.setDate(d.getDate() - 1);
        } else if (type === "next") {
            d.setDate(d.getDate() + 1);
        }

        setAttendanceDatePickervalue(d.toISOString().split("T")[0]);
    }


    const removeAttendanceStatus = async (staffId) => {
        const allSheetData = [...attendanceSheet];
        const staffAttendance = attendanceSheet.find(att => att.staffId === staffId);
        staffAttendance.attendanceType = "";
        allSheetData.push(staffAttendance);

        localStorage.setItem("attendance", JSON.stringify(allSheetData));
        localStorage.setItem("attendance_timestamp", Date.now());
        setAttendanceSheet([...allSheetData]);
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
            <Nav title={"Staff Attendance"} />
            <AttendanceSettingModal
                open={settingModal}
                closeModal={() => setSettingModal(false)}
            />
            <AttendanceOverTime
                open={overTimeModal}
                closeModal={() => setOverTimeModal(false)}
                staffData={currentStaffData}
                attendanceData={attendanceDataForModal}
                sendData={async (d) => {
                    let allSheetData = [...attendanceSheet];

                    let getStaffAttendanceSheet = allSheetData.find((a, _) => a.staffId === d.staffId);
                    allSheetData = allSheetData.filter((a, _) => a.staffId !== d.staffId);

                    // Marge with staff's attendance data and overtime data;
                    let marge = {
                        ...getStaffAttendanceSheet,
                        attendanceType: Constants.OVER_TIME,
                        ...d
                    };

                    localStorage.setItem("attendance_timestamp", Date.now());
                    localStorage.setItem("attendance", JSON.stringify([...allSheetData, { ...marge }]));

                    setAttendanceSheet([...allSheetData, { ...marge }]);
                }}
            />
            <ConfirmModal
                openConfirm={openConfirm}
                openStatus={(status) => { setOpenConfirm(status) }}
                title={"Are you sure you want to delete the selected Staff?"}
                fun={() => {
                    removeData();
                    setOpenConfirm(false);
                }}
            />
            <ContextMenu
                print={() => exportTable('print')}
                copy={() => exportTable('copy')}
                pdf={() => exportTable('pdf')}
                excel={() => exportTable('excel')}
            />
            <main id='main'>
                <SideNav />
                <Tooltip id='unitTooltip' />
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
                                    <input type='search'
                                        placeholder='Search Staff Name or Mobile Number...'
                                        onChange={searchData}
                                        className='p-[6px] text-xs'
                                    />
                                </div>
                                <button
                                    onClick={() => {
                                        if (selected.length === 0 || tableStatusData !== 'active') return;
                                        setOpenConfirm(true);
                                    }}
                                    className={`${selected.length > 0 ? 'bg-red-400 text-white' : 'bg-gray-50'} border `}>
                                    <MdDeleteOutline className='text-[16px]' />
                                    Delete
                                </button>
                                <button
                                    onClick={() => setSettingModal(true)}
                                    className='bg-gray-50 border'
                                >
                                    <Icons.SETTING
                                        className={`text-md text-gray-500 ${settingModal ? 'rotate-90' : ''} transition-all`}
                                    />
                                    Attendance Setting
                                </button>
                                <button
                                    onClick={() => navigate("/admin/staff-attendance/add")}
                                    className='bg-[#003E32] text-white '>
                                    <Icons.ADD className='text-white' size={15}/>
                                    Add Staff
                                </button>
                                {
                                    data?.length > 0 && (
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
                        !loading ? data.length > 0 ? <div className='content__body__main view'>
                            <div className='flex flex-col-reverse justify-between items-end'>
                                <div className='w-full flex items-center justify-between gap-3 mt-4'>
                                    <div className='bg-[#E2FFED] top__details__card'>
                                        <p className='feat__card__text'>Present (P)</p>
                                        <span>{allTotalData.present}</span>
                                    </div>
                                    <div className='bg-[#FFFEEF] top__details__card'>
                                        <p className='feat__card__text'>Absent (A)</p>
                                        <span>{allTotalData.absent}</span>
                                    </div>
                                    <div className='bg-[#FEF2FF] top__details__card'>
                                        <p className='feat__card__text'>Half day (HD)</p>
                                        <span>{allTotalData.halfDay}</span>
                                    </div>
                                    <div className='bg-[#FFD9DA] top__details__card'>
                                        <p className='feat__card__text'>Paid leave (PL)</p>
                                        <span>{allTotalData.paidLeave}</span>
                                    </div>
                                    <div className='bg-[#E3EAFF] top__details__card'>
                                        <p className='feat__card__text'>Weekly off (WO)</p>
                                        <span>{allTotalData.weeklyOff}</span>
                                    </div>
                                    <div className='bg-[#E0F8FF] top__details__card'>
                                        <p className='feat__card__text'>Over Time (OT)</p>
                                        <span>{allTotalData.overTime}</span>
                                    </div>
                                </div>
                                <div className='bg-gray-50 h-[30px] border rounded p-1 flex items-center gap-2 w-[180px] justify-center'>
                                    <button onClick={(e) => dateChanger("prev")}>
                                        <Icons.PREV_PAGE_ARROW />
                                    </button>
                                    <div className="relative w-[150px] text-center">
                                        <input
                                            type="date"
                                            ref={attendanceDateRef}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            onChange={(e) => setAttendanceDatePickervalue(e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => attendanceDateRef.current.showPicker()}
                                            className="relative z-10"
                                        >
                                            {
                                                attendanceDatePickerValue &&
                                                new Date(attendanceDatePickerValue).toDateString() === new Date().toDateString() &&
                                                "TODAY: "
                                            }
                                            {attendanceDatePickerValue || "Select date"}
                                        </button>
                                    </div>
                                    <button onClick={() => dateChanger("next")} >
                                        <Icons.NEXT_PAGE_ARROW />
                                    </button>
                                </div>
                            </div>
                            {/* Table start */}
                            <div className='overflow-x-auto list__table mt-2'>
                                <table className='min-w-full bg-white' id='staffTable' ref={tableRef}>
                                    <thead className='list__table__head'>
                                        <tr>
                                            <th className='py-2' align='center'>
                                                <input type='checkbox'
                                                    onChange={selectAll}
                                                    checked={data.length > 0 && selected.length === data.length}
                                                />
                                            </th>
                                            <td>STAFF NAME</td>
                                            <td>MOBILE NUMBER</td>
                                            <td>
                                                <div className='flex items-center gap-2'>
                                                    ATTENDANCE
                                                    {attendanceLoading && <Loading />}
                                                </div>
                                            </td>
                                            <td align='center'>ACTION</td>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            data.map((data, i) => {
                                                const userAttendanceData = attendanceSheet?.find((a, _) => a.staffId === data._id);
                                                const userAttendance = userAttendanceData?.attendance;

                                                return <tr key={data._id}>
                                                    <td className='py-2' align='center'>
                                                        <input type='checkbox'
                                                            checked={selected.includes(data._id)}
                                                            onChange={() => handleCheckboxChange(data._id)}
                                                        />
                                                    </td>
                                                    <td>{data.staffName}</td>
                                                    <td>{data.mobileNumber}</td>
                                                    <td>
                                                        <div className='flex gap-2 items-center'>
                                                            <div
                                                                onClick={() => handleAttendance(data, "1")}
                                                                className={`attendance__chip__btn ${userAttendance === "1" ? 'attendance__active__present' : ''}`}
                                                            >
                                                                P
                                                            </div>
                                                            <div
                                                                onClick={() => handleAttendance(data, "0")}
                                                                className={`attendance__chip__btn ${userAttendance === "0" ? 'attendance__active__absent' : ''}`}
                                                            >
                                                                A
                                                            </div>
                                                            {
                                                                userAttendance === "0" && (
                                                                    <>
                                                                        <Whisper
                                                                            placement='leftStart'
                                                                            trigger={"click"}
                                                                            speaker={<Popover full>
                                                                                <div
                                                                                    className='table__list__action__icon'
                                                                                    onClick={() => handleAttendance(data, "0", Constants.PAID_LEAVE)}
                                                                                >
                                                                                    Paid Leave
                                                                                </div>
                                                                                <div
                                                                                    className='table__list__action__icon'
                                                                                    onClick={() => handleAttendance(data, "0", Constants.WEEK_OFF)}
                                                                                >
                                                                                    Week Off
                                                                                </div>
                                                                            </Popover>}
                                                                        >
                                                                            <div className='attendance__more__icon' >
                                                                                <Icons.MORE />
                                                                            </div>
                                                                        </Whisper>

                                                                        {userAttendanceData.attendanceType === Constants.PAID_LEAVE && (
                                                                            <div
                                                                                onClick={() => removeAttendanceStatus(data._id)}
                                                                                className={`attendance__chip__btn red`}>
                                                                                PL
                                                                            </div>
                                                                        )}

                                                                        {userAttendanceData.attendanceType === Constants.WEEK_OFF && (
                                                                            <div
                                                                                onClick={() => removeAttendanceStatus(data._id)}
                                                                                className={`attendance__chip__btn green`}>
                                                                                WO
                                                                            </div>
                                                                        )}
                                                                    </>
                                                                )
                                                            }
                                                            {
                                                                userAttendance === "1" && (
                                                                    <>
                                                                        <Whisper
                                                                            placement='leftStart'
                                                                            trigger={"click"}
                                                                            speaker={<Popover full>
                                                                                <div
                                                                                    className='table__list__action__icon'
                                                                                    onClick={async () => {
                                                                                        await handleAttendance(data, "1", Constants.HALF_DAY)
                                                                                    }}
                                                                                >
                                                                                    Half Day
                                                                                </div>
                                                                                <div
                                                                                    className='table__list__action__icon'
                                                                                    onClick={async () => {
                                                                                        //await handleAttendance(data, "1", Constants.OVER_TIME);
                                                                                        setOverTimeModal(true);

                                                                                        //Modal a data deyar jonno rakha holo
                                                                                        setCurrentStaffData(data);
                                                                                        setAttendanceDataForModal(userAttendanceData);
                                                                                    }}
                                                                                >
                                                                                    Over Time
                                                                                </div>
                                                                            </Popover>}
                                                                        >
                                                                            <div className='attendance__more__icon' >
                                                                                <Icons.MORE />
                                                                            </div>
                                                                        </Whisper>

                                                                        {userAttendanceData.attendanceType === Constants.HALF_DAY && (
                                                                            <div
                                                                                onClick={() => removeAttendanceStatus(data._id)}
                                                                                className={`attendance__chip__btn yellow`}>
                                                                                HD
                                                                            </div>
                                                                        )}

                                                                        {userAttendanceData.attendanceType === Constants.OVER_TIME && (
                                                                            <div
                                                                                onClick={() => {
                                                                                    // setOverTimeModal(true);
                                                                                    removeAttendanceStatus(data._id);

                                                                                    //Modal a data deyar jonno rakha holo
                                                                                    // setCurrentStaffData(data);
                                                                                    // setAttendanceDataForModal(userAttendanceData);
                                                                                }}
                                                                                className={`attendance__chip__btn blue`}>
                                                                                OT
                                                                            </div>
                                                                        )}
                                                                    </>
                                                                )
                                                            }
                                                        </div>
                                                    </td>
                                                    <td align='center'>
                                                        <div className='flex items-center justify-center gap-2'>
                                                            <div
                                                                onClick={() => navigate(`/admin/staff-attendance/details/${data._id}`)}
                                                                className='rounded__circle'
                                                            >
                                                                <Icons.EYE />
                                                            </div>
                                                            <div
                                                                onClick={() => navigate(`/admin/staff-attendance/edit/${data._id}`)}
                                                                className='rounded__circle'
                                                            >
                                                                <Icons.PENCIL />
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            })
                                        }
                                    </tbody>
                                </table>
                                <div className='paginate__parent'>
                                    <p>Showing {data.length} of {totalData} entries</p>
                                    <Pagination
                                        activePage={activePage}
                                        totalData={totalData}
                                        dataLimit={dataLimit}
                                        setActivePage={setActivePage}
                                    />
                                </div>
                            </div>
                        </div>
                            : <AddNew title={"Staff"} link={"/admin/staff-attendance/add"} />
                            : <AttendanceShimmer />
                    }
                </div>
            </main>
        </>
    )
}

export default StaffAttendance