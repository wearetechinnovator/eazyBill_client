import { useNavigate, useParams } from 'react-router-dom'
import Nav from '../../components/Nav'
import useMyToaster from '../../hooks/useMyToaster';
import SideNav from '../../components/SideNav'
import { useEffect, useRef, useState } from 'react';
import Cookies from 'js-cookie';
import { Icons } from '../../helper/icons';
import AttendanceOverTime from '../../components/AttendanceOverTimeModal';
import html2pdf from "html2pdf.js";
import SalarySlip from './SalarySlip';
import { useSelector } from 'react-redux';
import { Popover, SelectPicker, Whisper } from 'rsuite';
import { Constants } from '../../helper/constants';
import { getAdvanceFilterData } from '../../helper/advanceFilter';
import StaffPaymentModal from '../../components/StaffPaymentModal';
import ConfirmModal from '../../components/ConfirmModal';
import StaffPaymentCollectModal from '../../components/StaffPaymentCollectModal';
import Loading from '../../components/Loading';




const MONTH_LIST = [
    "January", "February", "March", "April", "May", "June", "July", "August", "September",
    "October", "November", "December"
];
const ATTENDANCE_SAVE_TIME = 2000; // Debounce time;
const AttendanceDetails = () => {
    const navigate = useNavigate();
    const token = Cookies.get("token");
    const userDetails = useSelector((store) => store.userDetail); //Get user details from store
    const toast = useMyToaster();
    const { id } = useParams(); //Staff id;
    const [staffData, setStaffData] = useState({})
    const attendanceDateRef = useRef(null);
    const downloadDateRef = useRef(null);
    const attendanceSaveTimer = useRef(null);
    const salaryRef = useRef(null);
    const [attendanceDatePickerValue, setAttendanceDatePickervalue] = useState();
    const [attendancePickerLabel, setAttendancePickerLabel] = useState("");
    const [tab, setTab] = useState(0); // 0=`Attendance` | 1=`Details` | 2=`Payroll` | 3=`Transactions`
    const [datesArr, setDatesArr] = useState([]);
    const [attendanceSheet, setAttendanceSheet] = useState([]);
    const [overTimeModal, setOverTimeModal] = useState(false);
    // Use Top Card also use in Payroll calculation;
    const [allTotalData, setAllTotalData] = useState({
        present: 0, absent: 0, halfDay: 0, paidLeave: 0, weeklyOff: 0, overTime: 0
    })
    const [salarySlipAttendance, setSalarySlipAttendance] = useState({
        present: 0, absent: 0, halfDay: 0, paidLeave: 0, weeklyOff: 0, overTime: 0,
        totalBonus: 0
    })
    const [isCustomDate, setIsCustomDate] = useState(false);
    const [filter, setFilter] = useState({
        startDate: '', endDate: '', paymentType: ''
    })
    const [paymentModal, setPaymentModal] = useState(false);
    const [staffTransaction, setStaffTransaction] = useState([]);
    //Store current transactionId when edit transaction
    const [editTransactionId, setEditTransactionId] = useState(null);
    const [openConfirm, setOpenConfirm] = useState(false);
    // Store current date when click overtime modal;
    const [selectedDate, setSelectedDate] = useState(null)
    const [attendanceDataForModal, setAttendanceDataForModal] = useState(null);
    const [paymentCollectModal, setPaymentCollectModal] = useState(false);
    const currentMonthInIndex = new Date().getMonth();
    const [currentMonth, setCurrentMonth] = useState(currentMonthInIndex);
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    // When click on attendance button loading true after response loading false;
    const [attendanceLoading, setAttendanceLoading] = useState(false);
    const [oneDaySalary, setOneDaySalary] = useState(0);
    const [totalLoan, setTotalLoan] = useState(0);
    const [totalDues, setTotalDues] = useState(0);
    const [lastMonthDue, setLastMonthDue] = useState(0);
    const [OverTimeData, setOverTimeData] = useState([]) //For Payroll;
    const [currentMonthPayments, setCurrentMonthPayments] = useState([]);
    const [totalCurrentMonthPayment, setTotalCurrentMonthPayment] = useState(0);
    const [totalEarning, setTotalEarning] = useState(0);
    const [paymentDrpWn, setPaymentDrpDwn] = useState(true);
    const [earningDrpWn, setEarningDrpDwn] = useState(true);
    const [salarySlipDownloadLoading, setSalarySlipDownloadLoading] = useState(false);




    // Set Current month and year
    useEffect(() => {
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");

        setAttendanceDatePickervalue(`${year}-${month}`)
        setAttendancePickerLabel(
            new Date(d).toString().split(" ")[1] + " " + new Date(d).toString().split(" ")[3]
        )
    }, [])


    // Get Staff data
    useEffect(() => {
        (async () => {
            try {
                const url = process.env.REACT_APP_API_URL + "/staff/get";
                const req = await fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": 'application/json'
                    },
                    body: JSON.stringify({ token, id: id })
                })
                const res = await req.json();

                setStaffData({ ...staffData, ...res.data });
            } catch (error) {
                return toast("Staff data not fetch", "error");
            }
        })()
    }, [id])


    // Set PerDay Salary when DateArr or StaffData Change;
    useEffect(() => {
        const TOTAL_WORKING_DAY = Number(datesArr.length || 0);
        const TOTAL_SALARY = Number(staffData?.salary || 0)

        if (TOTAL_WORKING_DAY === 0 || TOTAL_SALARY === 0) return;

        const PER_DAY_SALARY = (TOTAL_SALARY / TOTAL_WORKING_DAY).toFixed(2)
        setOneDaySalary(PER_DAY_SALARY)
    }, [datesArr, staffData])


    // Get User Attendance;
    /**
     * User Attendance and All Payroll Data set here like bellow:~
     * Set TotalEarning Data.
     * Set Total Data used for top card like Total `present`, `absent` etc.
     * Set Salary slip attendance data.
     * Set Total Bonus as a Earning
     */
    useEffect(() => {
        (async () => {
            if (!attendanceDatePickerValue) return;

            try {
                const url = process.env.REACT_APP_API_URL + "/attendance/get-user-attendance";
                const req = await fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": 'application/json'
                    },
                    body: JSON.stringify({
                        token, staffId: id,
                        month: currentMonth + 1,
                        year: currentYear,
                    })
                })
                const res = await req.json();

                if (req.status === 200) {
                    setAttendanceSheet(res.data);

                    const overTimes = res.data.filter((f, _) => f.attendanceType === Constants.OVER_TIME);
                    setOverTimeData(overTimes);

                    const total = res.data.reduce((acc, item) => {
                        if (item.attendance === "1") {
                            acc.p += 1;
                            if (item.attendanceType === Constants.HALF_DAY) {
                                acc.hd += 1;
                            }
                            else if (item.attendanceType === Constants.OVER_TIME) {
                                acc.ot += 1;
                            }
                        }
                        else if (item.attendance === "0") {
                            acc.a += 1;
                            if (item.attendanceType === Constants.PAID_LEAVE) {
                                acc.pl += 1;
                            }
                            else if (item.attendanceType === Constants.WEEK_OFF) {
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

                    // Total amounts;
                    // TOTAL = [(present) + halfday(halfSalary) + paidLeave + weeklyOff + overTime + Bonus]
                    const ThalfDay = total.hd * (Number(oneDaySalary || 0) / 2);
                    const Tpresent = ((total.p - total.hd) * Number(oneDaySalary || 0));
                    const TpaidLeave = total.pl * Number(oneDaySalary || 0);
                    const TweeklyOff = total.wo * Number(oneDaySalary || 0);
                    const ToverTime = overTimes.reduce((acc, ov) => {
                        if (ov.overTimeType === "amount") {
                            acc += ov.fixedOverTimeAmount
                        } else {
                            acc += (Number(ov.overTimeHour) + Number(ov.overTimeMinute || 0) / 60) * Number(ov.overTimeHourlyAmount)
                        }

                        return acc;
                    }, 0)
                    const Tbonus = currentMonthPayments.reduce((acc, i) => {
                        if (i.paymentType === Constants.BONUS) {
                            acc += i.paymentAmount;
                        }
                        return acc;
                    }, 0)
                    setTotalEarning(Tpresent + ThalfDay + TpaidLeave + TweeklyOff + ToverTime + Tbonus);



                    const salaryAttendance = res.data.reduce((acc, i) => {
                        // Present
                        if (i.attendance === "1") {
                            if (i.attendanceType !== Constants.HALF_DAY) {
                                acc.p += 1;
                            } else if (i.attendanceType === Constants.HALF_DAY) {
                                acc.hd += 1;
                            } else if (i.attendanceType === Constants.OVER_TIME) {
                                acc.p += 1;
                                acc.ot += 1;
                            }
                        }
                        // Absent
                        else if (i.attendance === "0") {
                            if (i.attendanceType === Constants.PAID_LEAVE) {
                                acc.pl += 1;
                            } else if (i.attendanceType === Constants.WEEK_OFF) {
                                acc.wo += 1;
                            }
                        }

                        return acc;
                    }, { p: 0, a: 0, hd: 0, pl: 0, wo: 0, ot: 0 });

                    setSalarySlipAttendance({
                        present: salaryAttendance.p,
                        absent: salaryAttendance.a,
                        halfDay: salaryAttendance.hd,
                        paidLeave: salaryAttendance.pl,
                        weeklyOff: salaryAttendance.wo,
                        overTime: salaryAttendance.ot,
                        amounts: {
                            present: Tpresent,
                            halfDay: ThalfDay,
                            paidLeave: TpaidLeave,
                            weeklyOff: TweeklyOff,
                            overTime: ToverTime,
                            totalBonus: Tbonus,
                        }
                    })
                }
                // If Data Not Found set All 0, []
                else {
                    setAllTotalData({
                        present: 0,
                        absent: 0,
                        halfDay: 0,
                        paidLeave: 0,
                        weeklyOff: 0,
                        overTime: 0
                    })
                    setOverTimeData([]);
                    setTotalEarning(0);
                    setSalarySlipAttendance({
                        present: 0,
                        absent: 0,
                        halfDay: 0,
                        paidLeave: 0,
                        weeklyOff: 0,
                        overTime: 0,
                        amounts: {
                            present: 0,
                            halfDay: 0,
                            paidLeave: 0,
                            weeklyOff: 0,
                            overTime: 0,
                            totalBonus: 0,
                        }
                    })
                }

            } catch (error) {
                return toast("Staff attendance not fetch", "error");
            }
        })()
    }, [attendanceDatePickerValue, oneDaySalary, currentMonthPayments])


    // Get Total Loan Amounts like: `Loan` | `Loan Received` | `Total Loan`
    useEffect(() => {
        if (tab !== 2) return;
        (async () => {
            try {
                const URL = process.env.REACT_APP_API_URL + "/staff-payment/get-total-loan";
                const req = await fetch(URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": 'application/json'
                    },
                    body: JSON.stringify({ token, staffId: id })
                })
                const res = await req.json();
                if (req.status !== 200) {
                    return toast(res.err, "error");
                }

                setTotalLoan(res.totalLoan);

            } catch (err) {
                console.log(err);
                return toast("Total Loan not get", "error");
            }
        })()
    }, [tab, paymentCollectModal, paymentModal])


    // Get Total Dues;
    useEffect(() => {
        (async () => {
            try {
                const URL = process.env.REACT_APP_API_URL + "/staff-payment/get-total-due";
                const req = await fetch(URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": 'application/json'
                    },
                    body: JSON.stringify({
                        token, staffId: id,
                        currentMonth: Number(currentMonth) + 1,
                        currentYear
                    })
                })
                const res = await req.json();
                if (req.status !== 200) {
                    return toast(res.err, "error");
                }

                setTotalDues(res.due);

            } catch (err) {
                console.log(err);
                return toast("Total Loan not get", "error");
            }
        })()
    }, [tab])


    // Get Last Month Dues;
    useEffect(() => {
        if (tab !== 2) return;
        (async () => {
            try {
                const URL = process.env.REACT_APP_API_URL + "/staff-payment/get-last-month-due";
                const req = await fetch(URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": 'application/json'
                    },
                    body: JSON.stringify({
                        token, staffId: id,
                        currentMonth: Number(currentMonth) + 1,
                        currentYear
                    })
                })
                const res = await req.json();
                if (req.status !== 200) {
                    return toast(res.err, "error");
                }

                setLastMonthDue(res.dueAmount);

            } catch (err) {
                console.log(err);
                return toast("Total Loan not get", "error");
            }
        })()
    }, [tab, currentMonth, currentYear])


    // Genarate Dates Array
    useEffect(() => {
        if (!attendanceDatePickerValue) return;

        const [year, month] = attendanceDatePickerValue.split("-").map(Number);
        const date = new Date(year, month - 1, 1);
        const dates = [];

        while (date.getMonth() === month - 1) {
            dates.push(
                `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
            );
            date.setDate(date.getDate() + 1);
        }

        setDatesArr(dates);
    }, [attendanceDatePickerValue]);


    // Custom Date change on Attendance `Next` | `Prev` Button;
    const dateChanger = (type) => {
        const d = new Date(attendanceDatePickerValue);

        if (type === "prev") {
            d.setMonth(d.getMonth() - 1);
        } else if (type === "next") {
            d.setMonth(d.getMonth() + 1);
        }

        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");

        setCurrentYear(year);
        setCurrentMonth(d.getMonth());

        setAttendanceDatePickervalue(`${year}-${month}`);
        setAttendancePickerLabel(
            new Date(d).toString().split(" ")[1] + " " + new Date(d).toString().split(" ")[3]
        );
    };


    // When click attendance button `A` | `P`
    const handleAttendance = async (attendance, type = "none", date) => {
        setAttendanceLoading(true);

        let attSheet = [...attendanceSheet];
        attSheet = attSheet.filter((a, _) => a.date !== date);

        let attendanceDataSet = {
            staffId: id,
            date: date,
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
        if (attendanceSaveTimer.current) {
            clearTimeout(attendanceSaveTimer.current);
        }

        const timestamp = Number(localStorage.getItem("attendance_timestamp"));
        if (!timestamp) {
            return
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


    // Download Salary Slip by Month Year;
    const downloadSalarySlip = async (date) => {
        setSalarySlipDownloadLoading(true);
        const element = salaryRef.current;

        const url = process.env.REACT_APP_API_URL + "/attendance/get-user-attendance";
        const req = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": 'application/json'
            },
            body: JSON.stringify({
                token, staffId: id,
                year: currentYear,
                month: currentMonth + 1,
            })
        })
        const res = await req.json();
        if (req.status === 200) {
            // downloadSetAttendanceData(res.data)
        }

        const options = {
            margin: 10,
            filename: `${staffData?.staffName}-salary-slip.pdf`,
            image: { type: "jpeg", quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        };

        html2pdf().set(options).from(element).save();
        setSalarySlipDownloadLoading(false);
    }


    // Get and Set Staff Payment for Transaction Data;
    useEffect(() => {
        if (tab === 3) {
            (async () => {
                try {
                    const URL = `${process.env.REACT_APP_API_URL}/staff-payment/get`;
                    const req = await fetch(URL, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            token, staffId: id,
                            startDate: filter.startDate,
                            endDate: filter.endDate,
                            paymentType: filter.paymentType
                        })
                    })
                    const res = await req.json();
                    if (req.status !== 200) {
                        return toast(res.err, 'error');
                    }

                    setStaffTransaction(res.data)

                } catch (err) {
                    return toast("Transaction Data not get", "error");
                }
            })()
        }
    }, [tab, filter, paymentModal, paymentCollectModal])


    // Get current Month Transactions;
    useEffect(() => {
        (async () => {
            try {
                const URL = `${process.env.REACT_APP_API_URL}/staff-payment/get`;
                let { fromDate, toDate } = await getAdvanceFilterData(Constants.THISMONTH);
                
                if (new Date(fromDate).getMonth() !== currentMonth) {
                    setCurrentMonthPayments([]);
                    setTotalCurrentMonthPayment(0);
                    return;
                }

                const req = await fetch(URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        token, staffId: id,
                        startDate: fromDate,
                        endDate: toDate,
                    })
                })
                const res = await req.json();
                if (req.status !== 200) {
                    return toast(res.err, 'error');
                }

                setCurrentMonthPayments(res.data)
                const total = res.data.reduce((acc, i) => {
                    if (i.paymentType !== Constants.LOAN_RECEIVED)
                        acc += i.paymentAmount;
                    return acc;
                }, 0)
                setTotalCurrentMonthPayment(Number(total).toFixed(2));

            } catch (err) {
                return toast("Transaction Data not get", "error");
            }
        })()
    }, [tab, paymentModal, paymentCollectModal, currentMonth, currentYear])


    // Delete Staff Transaction;
    const deleteStaffTransaction = async (id) => {
        if (!id) {
            return;
        }
        const URL = process.env.REACT_APP_API_URL + "/staff-payment/delete";
        try {
            const req = await fetch(URL, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ ids: [id] })
            });
            const res = await req.json();

            if (req.status !== 200 || res.err) {
                return toast(res.err, 'error');
            }

            setStaffTransaction((pv) => {
                const filterData = pv.filter((d, _) => d._id !== id);
                return filterData;
            })
            return toast(res.msg, 'success');

        } catch (error) {
            toast("Something went wrong", "error")
        }
    }


    const removeAttendanceStatus = async (date) => {
        const allSheetData = [...attendanceSheet];
        const staffAttendance = attendanceSheet.find(att => att.date === date);
        staffAttendance.attendanceType = "";

        allSheetData.push(staffAttendance);

        console.log(staffAttendance);

        localStorage.setItem("attendance", JSON.stringify(allSheetData));
        localStorage.setItem("attendance_timestamp", Date.now());
        setAttendanceSheet([...allSheetData]);
    }



    return (
        <>
            <Nav title={"Staff Attendance Details"} />
            <div className='absolute left-[-9999px]'>
                <SalarySlip
                    ref={salaryRef}
                    staffData={staffData}
                    salaryAttendance={salarySlipAttendance}
                    userDetails={userDetails}
                    OverTimeData={OverTimeData}
                    totalDues={totalDues}
                    currentMonthPayments={currentMonthPayments}
                />
            </div>
            <AttendanceOverTime
                open={overTimeModal}
                closeModal={() => setOverTimeModal(false)}
                staffData={staffData}
                attendanceData={attendanceDataForModal}
                sendData={(d) => {
                    let allSheetData = [...attendanceSheet];

                    let getStaffAttendanceSheet = allSheetData.find((a, _) => a.staffId === d.staffId);
                    allSheetData = allSheetData.filter((a, _) => a.date !== selectedDate);

                    // Marge with staff's attendance data and overtime data;
                    let marge = {
                        ...getStaffAttendanceSheet,
                        attendanceType: Constants.OVER_TIME,
                        date: selectedDate,
                        ...d,
                    };

                    localStorage.setItem("attendance_timestamp", Date.now());
                    localStorage.setItem("attendance", JSON.stringify([...allSheetData, { ...marge }]));

                    setAttendanceSheet([...allSheetData, { ...marge }]);
                }}
            />
            <StaffPaymentModal
                openModal={paymentModal}
                openStatus={() => {
                    setPaymentModal(false);
                }}
                paymentId={editTransactionId}
                salaryData={{
                    month: currentMonth,
                    year: currentYear,
                    totalSalary: totalEarning
                }}
            />
            <StaffPaymentCollectModal
                openModal={paymentCollectModal}
                staffName={staffData?.staffName}
                openStatus={() => {
                    setPaymentCollectModal(false);
                }}
                paymentId={editTransactionId}
            />
            <ConfirmModal
                openConfirm={openConfirm}
                openStatus={(status) => { setOpenConfirm(status) }}
                title={"Are you sure you want to delete this Transaction?"}
                fun={() => {
                    deleteStaffTransaction(editTransactionId);
                    setOpenConfirm(false);
                }}
            />
            <main id='main'>
                <SideNav />
                <div className='content__body'>
                    <div className='content__body__main flex items-center justify-between mb-2'>
                        <div className='tab'>
                            <button
                                className={`tab__btn ${tab === 0 ? 'active__tab__btn' : ''}`}
                                onClick={() => setTab(0)}
                            >
                                Attendance
                            </button>
                            <button
                                className={`tab__btn ${tab === 1 ? 'active__tab__btn' : ''}`}
                                onClick={() => setTab(1)}
                            >
                                Details
                            </button>
                            <button
                                className={`tab__btn ${tab === 2 ? 'active__tab__btn' : ''}`}
                                onClick={() => setTab(2)}
                            >
                                Payroll
                            </button>
                            <button
                                className={`tab__btn ${tab === 3 ? 'active__tab__btn' : ''}`}
                                onClick={() => setTab(3)}
                            >
                                Transactions
                            </button>
                        </div>

                        <div className='flex items-center gap-2'>
                            <div className='flex items-center'>
                                <button
                                    onClick={() => setPaymentModal(true)}
                                    className='staff__make__payment'
                                >
                                    <Icons.RUPES className='inline ml-1' />
                                    Make Payment
                                </button>
                                <Whisper placement='bottomEnd' trigger={"click"}
                                    speaker={<Popover full>
                                        <div className='download__menu' onClick={() => setPaymentCollectModal(true)}>
                                            Collect Payment
                                        </div>
                                    </Popover>}
                                >
                                    <button className='staff__make__payment__drpdwn'>
                                        <Icons.MENU_DOWN_ARROW className='text-[16px]' />
                                    </button>
                                </Whisper>
                            </div>
                            <div className='relative'>
                                <button
                                    onClick={async () => await downloadSalarySlip()}
                                    className='border bg-gray-50 rounded px-2 py-1 flex items-center gap-1'
                                >
                                    {
                                        salarySlipDownloadLoading ?
                                            <Loading /> :
                                            <Icons.DOWNLOAD />
                                    }
                                    <span>Download Salary Slip</span>

                                    {/* <input
                                        type="month"
                                        ref={downloadDateRef}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        onChange={async (e) => {
                                            if (!e.target.value) return;
                                            console.log(e.target.value);

                                            await downloadSalarySlip()
                                        }}
                                    /> */}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className='content__body__main mb-2'>
                        {/* =========================[Attendance Tab]===================== */}
                        {/* ============================================================= */}
                        {
                            tab === 0 && (
                                <div className='w-full'>
                                    <div className='w-full flex items-center justify-between mb-4'>
                                        <p className='text-[15px] font-semibold '>
                                            <Icons.USER className='text-xs inline mr-1' />
                                            {staffData.staffName}
                                        </p>
                                        <div className='bg-gray-50 h-[30px] border rounded p-1 flex items-center gap-2 w-[125px] justify-center'>
                                            <button onClick={(e) => dateChanger("prev")}>
                                                <Icons.PREV_PAGE_ARROW />
                                            </button>
                                            <div className="relative w-[150px] text-center">
                                                <input
                                                    type="month"
                                                    ref={attendanceDateRef}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                    onChange={(e) => {
                                                        if (!e.target.value) return;

                                                        setAttendanceDatePickervalue(e.target.value)
                                                        setAttendancePickerLabel(
                                                            new Date(e.target.value).toString().split(" ")[1] + " " + new Date(e.target.value).toString().split(" ")[3]
                                                        )

                                                        setCurrentMonth(new Date(e.target.value).getMonth())
                                                        setCurrentYear(new Date(e.target.value).getFullYear())
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => attendanceDateRef.current.showPicker()}
                                                    className="relative z-10"
                                                >
                                                    {attendancePickerLabel || "Select Month"}
                                                </button>
                                            </div>
                                            <button onClick={() => dateChanger("next")} >
                                                <Icons.NEXT_PAGE_ARROW />
                                            </button>
                                        </div>
                                    </div>

                                    <div className='w-full flex items-center justify-between gap-3 mt-2'>
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

                                    <div className='overflow-x-auto list__table mt-3'>
                                        <table className='min-w-full bg-white' id='staffTable' >
                                            <thead className='list__table__head'>
                                                <tr>
                                                    <td className='py-2 px-4 border-b w-[30%]'>Date</td>
                                                    <td className='py-2 border-b w-[25%]'>
                                                        <div className='flex items-center gap-2'>
                                                            Attendance
                                                            {attendanceLoading && <Loading />}
                                                        </div>
                                                    </td>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {
                                                    datesArr.map((date, i) => {
                                                        const attData = attendanceSheet?.find((at, i) => at.date === date);
                                                        const attendance = attData?.attendance;

                                                        return <tr key={date}>
                                                            <td className='py-2 px-4 border-b'>{date}</td>
                                                            <td>
                                                                <div className='flex gap-2 items-center'>
                                                                    <div
                                                                        onClick={() => handleAttendance("1", "none", date)}
                                                                        className={`attendance__chip__btn ${attendance === "1" ? 'attendance__active__present' : ''}`}
                                                                    >
                                                                        P
                                                                    </div>
                                                                    <div
                                                                        onClick={() => handleAttendance("0", "none", date)}
                                                                        className={`attendance__chip__btn ${attendance === "0" ? 'attendance__active__absent' : ''}`}
                                                                    >
                                                                        A
                                                                    </div>
                                                                    {
                                                                        attendance === "0" && (
                                                                            <>
                                                                                <Whisper
                                                                                    placement='leftStart'
                                                                                    trigger={"click"}
                                                                                    speaker={<Popover full>
                                                                                        <div
                                                                                            className='table__list__action__icon'
                                                                                            onClick={() => handleAttendance("0", "paid-leave", date)}
                                                                                        >
                                                                                            Paid Leave
                                                                                        </div>
                                                                                        <div
                                                                                            className='table__list__action__icon'
                                                                                            onClick={() => handleAttendance("0", "week-off", date)}
                                                                                        >
                                                                                            Week Off
                                                                                        </div>
                                                                                    </Popover>}
                                                                                >
                                                                                    <div className='attendance__more__icon' >
                                                                                        <Icons.MORE />
                                                                                    </div>
                                                                                </Whisper>

                                                                                {attData.attendanceType === Constants.PAID_LEAVE && (
                                                                                    <div
                                                                                        onClick={() => removeAttendanceStatus(date)}
                                                                                        className={`attendance__chip__btn red`}
                                                                                    >
                                                                                        PL
                                                                                    </div>
                                                                                )}

                                                                                {attData.attendanceType === Constants.WEEK_OFF && (
                                                                                    <div
                                                                                        onClick={() => removeAttendanceStatus(date)}
                                                                                        className={`attendance__chip__btn green`}
                                                                                    >
                                                                                        WO
                                                                                    </div>
                                                                                )}
                                                                            </>
                                                                        )
                                                                    }
                                                                    {
                                                                        attendance === "1" && (
                                                                            <>
                                                                                <Whisper
                                                                                    placement='leftStart'
                                                                                    trigger={"click"}
                                                                                    speaker={<Popover full>
                                                                                        <div
                                                                                            className='table__list__action__icon'
                                                                                            onClick={async () => {
                                                                                                await handleAttendance("1", "half-day", date)
                                                                                            }}
                                                                                        >
                                                                                            Half Day
                                                                                        </div>
                                                                                        <div
                                                                                            className='table__list__action__icon'
                                                                                            onClick={async () => {
                                                                                                setOverTimeModal(true);
                                                                                                setSelectedDate(date);

                                                                                                //Modal a data deyar jonno rakha holo
                                                                                                setAttendanceDataForModal(attData);
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

                                                                                {attData.attendanceType === Constants.HALF_DAY && (
                                                                                    <div
                                                                                        onClick={() => removeAttendanceStatus(date)}
                                                                                        className={`attendance__chip__btn yellow`}
                                                                                    >
                                                                                        HD
                                                                                    </div>
                                                                                )}

                                                                                {attData.attendanceType === Constants.OVER_TIME && (
                                                                                    <div
                                                                                        onClick={() => {
                                                                                            removeAttendanceStatus(date);
                                                                                            // setOverTimeModal(true);

                                                                                            //Modal a data deyar jonno rakha holo
                                                                                            // setAttendanceDataForModal(attData);
                                                                                        }}
                                                                                        className={`attendance__chip__btn blue`}
                                                                                    >
                                                                                        OT
                                                                                    </div>
                                                                                )}
                                                                            </>
                                                                        )
                                                                    }

                                                                </div>
                                                            </td>
                                                        </tr>
                                                    })
                                                }
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )
                        }

                        {/* =======================[Staff Details Tab]====================*/}
                        {/* ============================================================= */}
                        {
                            tab === 1 && (
                                <div>
                                    <div className='flex justify-end gap-3'>
                                        <button
                                            onClick={() => navigate(`/admin/staff-attendance/edit/${id}`)}
                                            className='flex items-center justify-center gap-1 border border-green-400 hover:bg-green-400 hover:text-white rounded w-[60px] py-[4px]'>
                                            <Icons.PENCIL size={'16px'} />
                                            Edit
                                        </button>
                                        {/* <button className='flex items-center justify-center gap-1 border border-red-400 hover:bg-red-400 hover:text-white rounded w-[70px] py-[4px]'>
                                            <Icons.DELETE size={'16px'} />
                                            Delete
                                        </button> */}
                                    </div>
                                    <div className='user__details__tab'>
                                        <div className='flex flex-col gap-5 w-full pl-2'>
                                            <div>
                                                <p>Staff Name</p>
                                                <span>{staffData.staffName || "--"}</span>
                                            </div>
                                            <div>
                                                <p>DOB</p>
                                                <span>{staffData?.dob?.split("T")[0] || "--"}</span>
                                            </div>
                                            <div>
                                                <p>Salary</p>
                                                <span>{staffData.salary || "--"}</span>
                                            </div>
                                        </div>
                                        <div className='flex flex-col gap-5 w-full'>
                                            <div>
                                                <p>Mobile Number</p>
                                                <span>{staffData.mobileNumber || "--"}</span>
                                            </div>
                                            <div>
                                                <p>Joining Date</p>
                                                <span>{staffData.joiningDate || "--"}</span>
                                            </div>
                                            <div>
                                                <p>Salary Cycle</p>
                                                <span>{staffData.salaryCycle || "--"}</span>
                                            </div>
                                        </div>
                                        <div className='flex flex-col gap-5 w-full'>
                                            <div>
                                                <p>Email</p>
                                                <span>{staffData.email || "--"}</span>
                                            </div>
                                            <div>
                                                <p>Salary Payout Type</p>
                                                <span>{staffData.salaryPayOutType || "--"}</span>
                                            </div>
                                            <div>
                                                <p>Outstanding/Opening Balance</p>
                                                <span>{staffData.openingBalance || "--"}</span>
                                                {
                                                    staffData.openingBalance && <span className='bg-gray-200 rounded px-1 ml-1 text-gray-500'>
                                                        {staffData.openingBalanceType}
                                                    </span>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        }

                        {/* ===========================[Payroll Tab]======================*/}
                        {/* ============================================================= */}
                        {
                            tab === 2 && (
                                <div>
                                    <div className='w-full flex items-center justify-between'>
                                        <p className='text-[15px]'>{MONTH_LIST[currentMonth]} {currentYear}</p>

                                        <div className='bg-gray-50 h-[30px] border rounded p-1 flex items-center gap-2 w-[125px] justify-center'>
                                            <button onClick={(e) => dateChanger("prev")}>
                                                <Icons.PREV_PAGE_ARROW />
                                            </button>
                                            <div className="relative w-[150px] text-center">
                                                <input
                                                    type="month"
                                                    ref={attendanceDateRef}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                    onChange={(e) => {
                                                        if (!e.target.value) return;

                                                        setAttendanceDatePickervalue(e.target.value)
                                                        setAttendancePickerLabel(
                                                            new Date(e.target.value).toString().split(" ")[1] + " " + new Date(e.target.value).toString().split(" ")[3]
                                                        );

                                                        setCurrentMonth(new Date(e.target.value).getMonth())
                                                        setCurrentYear(new Date(e.target.value).getFullYear())
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => attendanceDateRef.current.showPicker()}
                                                    className="relative z-10"
                                                >
                                                    {attendancePickerLabel || "Select Month"}
                                                </button>
                                            </div>
                                            <button onClick={() => dateChanger("next")} >
                                                <Icons.NEXT_PAGE_ARROW />
                                            </button>
                                        </div>
                                    </div>

                                    <div className='border rounded w-full min-h-10 mt-2'>
                                        <div className='w-full flex items-center gap-6 border-b p-2'>
                                            <div>
                                                <p className='uppercase font-bold text-slate-500'>Total Dues</p>
                                                <span className='font-bold'>
                                                    <Icons.RUPES className='inline' />{(totalDues).toFixed(2)}
                                                </span>
                                            </div>
                                            <div>
                                                <p className='uppercase font-bold text-slate-500'>Last month (Due)</p>
                                                <span className='font-bold'>
                                                    <Icons.RUPES className='inline' />{(lastMonthDue).toFixed(2)}
                                                </span>
                                            </div>
                                            <div>
                                                <p className='uppercase font-bold text-slate-500'>Loan</p>
                                                <span className='font-bold'>
                                                    <Icons.RUPES className='inline' />{(totalLoan).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className='w-full flex justify-between border-b p-2 bg-gray-50'>
                                            <div className='text-gray-500'>
                                                <span className='font-bold'>{MONTH_LIST[currentMonth]} </span>
                                                ({new Date(currentYear, currentMonth, 1).getDate()} {MONTH_LIST[currentMonth].slice(0, 3)} {currentYear} - {new Date(currentYear, currentMonth + 1, 0).getDate()} {MONTH_LIST[currentMonth].slice(0, 3)} {currentYear})
                                            </div>
                                        </div>
                                        {/* Earning */}
                                        <div className='w-full flex justify-between border-b p-2' onClick={() => setEarningDrpDwn(!earningDrpWn)}>
                                            <div className='font-bold'>
                                                Earnings
                                            </div>
                                            <p className='font-bold'>
                                                <Icons.RUPES className='inline' /> {(totalEarning).toFixed(2)}
                                                {
                                                    earningDrpWn ?
                                                        <Icons.MENU_DOWN_ARROW className='inline ml-2' />
                                                        : <Icons.MENU_UP_ARROW className='inline ml-2' />
                                                }
                                            </p>
                                        </div>
                                        {/*=========================[Under Earning]=================*/}
                                        {
                                            earningDrpWn && (
                                                <div>
                                                    {
                                                        (Number(allTotalData.paidLeave || 0) * oneDaySalary) > 0 && (
                                                            <div className='w-full flex justify-between border-b p-2 pl-4 hover:bg-gray-100'>
                                                                <div className=''>Paid Leave ({allTotalData.paidLeave} Days)</div>
                                                                <p>
                                                                    <Icons.RUPES className='inline' />
                                                                    {(Number(allTotalData.paidLeave || 0) * oneDaySalary).toFixed(2)}
                                                                </p>
                                                            </div>
                                                        )
                                                    }
                                                    {
                                                        (Number(allTotalData.present || 0) * oneDaySalary) > 0 && (
                                                            <div className='w-full flex justify-between border-b p-2 pl-4 hover:bg-gray-100'>
                                                                <div className=''>Present ({Number(allTotalData.present) - Number(allTotalData.halfDay)} Days)</div>
                                                                <p>
                                                                    <Icons.RUPES className='inline' />
                                                                    {((Number(allTotalData.present || 0) - Number(allTotalData.halfDay || 0)) * oneDaySalary).toFixed(2)}
                                                                </p>
                                                            </div>
                                                        )
                                                    }
                                                    {
                                                        (Number(allTotalData.weeklyOff || 0) * oneDaySalary) > 0 && (
                                                            <div className='w-full flex justify-between border-b p-2 pl-4 hover:bg-gray-100'>
                                                                <div className=''>Weekly off ({allTotalData.weeklyOff} Days)</div>
                                                                <p>
                                                                    <Icons.RUPES className='inline' />
                                                                    {(Number(allTotalData.weeklyOff || 0) * oneDaySalary).toFixed(2)}
                                                                </p>
                                                            </div>
                                                        )
                                                    }
                                                    {
                                                        (Number(allTotalData.halfDay || 0) * (oneDaySalary / 2)) > 0 && (
                                                            <div className='w-full flex justify-between border-b p-2 pl-4 hover:bg-gray-100'>
                                                                <div className=''>Half Day ({allTotalData.halfDay} Days)</div>
                                                                <p>
                                                                    <Icons.RUPES className='inline' />
                                                                    {(Number(allTotalData.halfDay || 0) * (oneDaySalary / 2)).toFixed(2)}
                                                                </p>
                                                            </div>
                                                        )
                                                    }

                                                    {/* OverTime Loop Here */}
                                                    {
                                                        OverTimeData && OverTimeData.length > 0 && OverTimeData.map((ov, _) => {
                                                            return <div className='w-full flex justify-between border-b p-2 pl-4 hover:bg-gray-100'>
                                                                {
                                                                    ov.overTimeType === "amount" ? (
                                                                        <div className=''>Overtime ( 1 Days X ₹{ov.fixedOverTimeAmount})</div>
                                                                    ) : (
                                                                        <div className=''>Overtime ( {ov.overTimeHour}.{ov.overTimeMinute} Hrs X ₹{ov.overTimeHourlyAmount})</div>
                                                                    )
                                                                }


                                                                {/* Amount */}
                                                                {
                                                                    ov.overTimeType === "amount" ? (
                                                                        <p><Icons.RUPES className='inline' />{Number(1) * Number(ov.fixedOverTimeAmount)}</p>
                                                                    ) : (
                                                                        <p>
                                                                            <Icons.RUPES className='inline' />
                                                                            {((Number(ov.overTimeHour) + Number(ov.overTimeMinute || 0) / 60) * Number(ov.overTimeHourlyAmount)).toFixed(2)}
                                                                        </p>
                                                                    )
                                                                }
                                                            </div>
                                                        })
                                                    }

                                                    {/* Add Bonus */}
                                                    {
                                                        currentMonthPayments.filter(p => p.paymentType === Constants.BONUS).map((b, _) => {
                                                            return (
                                                                <div className='w-full flex justify-between border-b p-2 pl-4 hover:bg-gray-100' key={b._id}>
                                                                    <div>Bonus</div>
                                                                    <p>
                                                                        <Icons.RUPES className='inline' />
                                                                        {Number(b.paymentAmount).toFixed(2)}
                                                                    </p>
                                                                </div>
                                                            )
                                                        })
                                                    }
                                                </div>
                                            )
                                        }

                                        <div className='w-full flex justify-between border-b p-2' onClick={() => setPaymentDrpDwn(!paymentDrpWn)}>
                                            <div className='font-bold'>
                                                Payments
                                            </div>
                                            <p className='font-bold'>
                                                <Icons.RUPES className='inline' />{totalCurrentMonthPayment}
                                                {
                                                    paymentDrpWn ?
                                                        <Icons.MENU_DOWN_ARROW className='inline ml-2' />
                                                        : <Icons.MENU_UP_ARROW className='inline ml-2' />
                                                }
                                            </p>
                                        </div>
                                        {/*==========================[Under Payments]===================*/}
                                        {
                                            paymentDrpWn && currentMonthPayments.map((p, _) => {
                                                return (
                                                    <div className='w-full flex justify-between border-b p-2 pl-4' key={p._id}>
                                                        <div className='capitalize'>{p.paymentType.replace("_", " ")}</div>
                                                        <p>
                                                            <Icons.RUPES className='inline' />{p.paymentType === Constants.LOAN_RECEIVED && "-"}{p.paymentAmount}
                                                        </p>
                                                    </div>
                                                )
                                            })
                                        }
                                    </div>
                                </div>
                            )
                        }


                        {/* =======================[Transaction Tab]===================== */}
                        {/* ============================================================= */}
                        {
                            tab === 3 && (
                                <div className="">
                                    <div className='w-full flex items-center gap-4'>
                                        <div className='w-[200px]'>
                                            <p>Search By</p>
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
                                                    <div className='w-[200px]'>
                                                        <p>Start Date</p>
                                                        <input type="date"
                                                            value={filter.startDate}
                                                            onChange={(e) => setFilter({ ...filter, startDate: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className='w-[200px]'>
                                                        <p>End Date</p>
                                                        <input type="date"
                                                            value={filter.endDate}
                                                            onChange={(e) => setFilter({ ...filter, endDate: e.target.value })}
                                                        />
                                                    </div>
                                                </>
                                            )
                                        }
                                        <div className='w-[200px]'>
                                            <p>Types</p>
                                            <SelectPicker
                                                searchable={false}
                                                className='w-full'
                                                data={[
                                                    { label: "Salary", value: Constants.SALARY },
                                                    { label: "Bonus", value: Constants.BONUS },
                                                    { label: "Advance Payment", value: Constants.ADVANCE_PAYMENT },
                                                    { label: "Loan", value: Constants.LOAN }
                                                ]}
                                                onChange={(v) => setFilter({ ...filter, paymentType: v })}
                                                value={filter.paymentType}
                                            />
                                        </div>
                                    </div>
                                    <div className='overflow-x-auto list__table mt-5'>
                                        <table className='min-w-full'>
                                            <thead className='list__table__head without__checkbox'>
                                                <tr>
                                                    <th align='left' className='py-2'>Date of Payment</th>
                                                    <th align='left' className='w-[200px]'>Payment Type</th>
                                                    <th align='left' className='w-[200px]'>Amount</th>
                                                    <th align='left'>Remarks</th>
                                                    <th></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {
                                                    staffTransaction.length > 0 && staffTransaction.map((st, i) => {
                                                        return (
                                                            <tr key={i}>
                                                                <td className='py-2'>{st.paymentDate.split("T")[0]}</td>
                                                                <td className='capitalize'>{st.paymentType.replace("_", " ")}</td>
                                                                <td>
                                                                    {
                                                                        st.paymentType === Constants.LOAN_RECEIVED ?
                                                                            <Icons.ARROW_DOWN className='inline mr-1 text-green-500' /> :
                                                                            <Icons.ARROW_UP className='inline mr-1 text-red-600' />
                                                                    }
                                                                    <Icons.RUPES className='inline' />{st.paymentAmount}
                                                                </td>
                                                                <td>{st.paymentRemark || "--"}</td>
                                                                <td>
                                                                    <Whisper
                                                                        placement='leftStart'
                                                                        trigger={"click"}
                                                                        speaker={<Popover full className='table__list__action__parent'>
                                                                            <div className='table__list__action__icon'
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    setEditTransactionId(st._id);

                                                                                    if (st.paymentType === Constants.LOAN_RECEIVED)
                                                                                        setPaymentCollectModal(true);
                                                                                    else
                                                                                        setPaymentModal(true);
                                                                                }}
                                                                            >
                                                                                <Icons.EDIT className='text-[16px]' />
                                                                                Edit
                                                                            </div>
                                                                            <div className='table__list__action__icon'
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    setEditTransactionId(st._id)
                                                                                    setOpenConfirm(true);
                                                                                }}
                                                                            >
                                                                                <Icons.DELETE className='text-[16px]' />
                                                                                Delete
                                                                            </div>
                                                                        </Popover>}
                                                                    >
                                                                        <div className='table__list__action' onClick={(e) => e.stopPropagation()}>
                                                                            <Icons.HORIZONTAL_MORE />
                                                                        </div>
                                                                    </Whisper>
                                                                </td>
                                                            </tr>
                                                        )
                                                    })
                                                }
                                                {
                                                    staffTransaction.length === 0 && (
                                                        <tr>
                                                            <td colSpan={5} align='center' className='py-2 font-semibold text-[16px] uppercase'>
                                                                No Payment Available.
                                                            </td>
                                                        </tr>
                                                    )
                                                }
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )
                        }
                    </div>
                </div>
            </main>
        </>
    )
}

export default AttendanceDetails;
