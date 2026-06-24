import { useEffect, useState } from "react";
import { Modal } from "rsuite";
import { checkNumber } from '../helper/validation'


const OVER_TIME_HOURLY = "hourly";
const OVER_TIME_AMOUNT = "amount";
const OVER_TIME_RATE_CUSTOM = "custom";
const WORK_TIME_HOUR = 240;
const AttendanceOverTime = ({ open, closeModal, sendData, staffData, attendanceData }) => {
    const [modelOpen, setModelOpen] = useState(null);
    const [overTimeType, setOverTimeType] = useState(OVER_TIME_HOURLY);
    const [overTimeRate, setOverTimeRate] = useState(null);
    const [customeOverTimeRate, setCustomeOverTimeRate] = useState(null);
    const [fixedOverTimeAmount, setFixedOverTimeAmount] = useState(null);
    const [overTimeHour, setOverTimeHour] = useState(null);
    const [overTimeMinute, setOverTimeMinute] = useState(null);
    const [overTimeTotalAmount, setOverTimeTotalAmount] = useState(0);
    const [hourlyHourTimeRate, setHourlyOverTimeRate] = useState(0)


    useEffect(() => {
        setModelOpen(open);

        if (attendanceData) {
            console.log(attendanceData);
            setOverTimeType(attendanceData.overTimeType);
            setFixedOverTimeAmount(attendanceData.fixedOverTimeAmount);
            setOverTimeHour(attendanceData.overTimeHour);
            setOverTimeMinute(attendanceData.overTimeMinute);
            setOverTimeRate(attendanceData.overTimeRate);
            setCustomeOverTimeRate(attendanceData.customeOverTimeRate);
        }
    }, [open, attendanceData])


    // Set OverTime if OverTime Type is Hourly;
    useEffect(() => {
        if (
            overTimeType !== OVER_TIME_HOURLY ||
            overTimeHour === null || overTimeHour === "" ||
            overTimeMinute === null || overTimeMinute === ""
        ) return;

        let rate = overTimeRate;

        if (rate === OVER_TIME_RATE_CUSTOM && !customeOverTimeRate) return;

        const salary = Number(staffData.salary);
        const hrs = Number(overTimeHour);
        const min = Number(overTimeMinute);

        const oneHourSalary = (salary / 30) / 8;

        const appliedRate =
            rate === OVER_TIME_RATE_CUSTOM
                ? Number(customeOverTimeRate)
                : Number(rate);

        const overTimeAmountPerHour = oneHourSalary * (appliedRate || 0);
        setHourlyOverTimeRate((overTimeAmountPerHour).toFixed(2))

        const totalHours = hrs + min / 60;

        const totalAmount = totalHours * overTimeAmountPerHour;
        setOverTimeTotalAmount(totalAmount.toFixed(2));
    }, [
        overTimeType,
        overTimeHour,
        overTimeMinute,
        overTimeRate,
        customeOverTimeRate,
        staffData
    ])


    const resetData = () => {
        setOverTimeType(OVER_TIME_HOURLY);
        setOverTimeRate(null);
        setCustomeOverTimeRate(null);
        setFixedOverTimeAmount(null);
        setOverTimeHour(null);
        setOverTimeMinute(null);
        setOverTimeTotalAmount(0)
    }

    return (
        <div>
            <Modal open={modelOpen} backdrop='static' size={'xs'} onClose={() => {
                setModelOpen(false);
                closeModal(false);
            }}>
                <Modal.Header className="border-b pb-2 bg-white">
                    <p>Add Overtime</p>
                    <Modal.Title></Modal.Title>
                </Modal.Header>
                <Modal.Body className="bg-white">
                    <div className="flex items-center justify-between w-full">
                        <span className="text-left w-full text-gray-400 text-xs">Staff name</span>
                        <span className="text-left w-full text-gray-400 text-xs">Date</span>
                    </div>
                    <div className="flex items-center justify-between w-full">
                        <span className="text-left w-full text-sm">{staffData?.staffName}</span>
                        <span className="text-left w-full text-sm">{new Date().toISOString().split("T")[0]}</span>
                    </div>

                    <div className="mt-5">
                        <p className="text-left w-full text-gray-400 text-xs">Overtime Type</p>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center mt-1 w-[30%]">
                                <input
                                    type="radio"
                                    name="overtime-type"
                                    checked={overTimeType === OVER_TIME_HOURLY}
                                    onChange={(e) => setOverTimeType(OVER_TIME_HOURLY)}
                                    className="w-[20%]"
                                />
                                <span className="text-xs">Hourly rate</span>
                            </div>
                            <div className="flex items-center w-[30%]">
                                <input
                                    type="radio"
                                    name="overtime-type"
                                    checked={overTimeType === OVER_TIME_AMOUNT}
                                    onChange={(e) => setOverTimeType(OVER_TIME_AMOUNT)}
                                    className="w-[20%]"
                                />
                                <span className="text-xs">Fixed amount</span>
                            </div>
                        </div>
                    </div>
                    {
                        overTimeType === "amount" && (
                            <div className="mt-5 bg-gray-50 p-2 rounded">
                                <p className="text-xs text-gray-600">
                                    Overtime amount
                                    <span className='required__text'>*</span>
                                </p>
                                <input
                                    type="text"
                                    className="mt-2 w-[60%] p-2"
                                    value={fixedOverTimeAmount}
                                    onChange={(e) => setFixedOverTimeAmount(
                                        checkNumber(e.target.value)
                                    )}
                                />
                            </div>
                        )
                    }

                    {
                        overTimeType === OVER_TIME_HOURLY && (
                            <div className="mt-5 bg-gray-50 p-2 rounded flex items-start justify-between">
                                <div className="w-full">
                                    <p className="text-xs text-gray-600">
                                        Number of hours
                                        <span className='required__text'>*</span>
                                    </p>
                                    <div className="w-full flex items-center mt-2">
                                        <div className="w-full flex items-center gap-2">
                                            <input
                                                type="text"
                                                placeholder="Hrs"
                                                value={overTimeHour}
                                                onChange={(e) => setOverTimeHour(e.target.value)}
                                                className="w-[50px] text-xs"
                                            />
                                            <span>:</span>
                                            <select
                                                onChange={(e) => setOverTimeMinute(e.target.value)}
                                                value={overTimeMinute}
                                                className="attendace__setting__time__drp text-xs"
                                            >
                                                <option value="">Min</option>
                                                <option value={0}>00</option>
                                                <option value={30}>30</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full">
                                    <p className="text-xs text-gray-600">
                                        Overtime rate
                                        <span className='required__text'>*</span>
                                    </p>
                                    <div className="w-full flex items-center mt-2 border rounded">
                                        <select
                                            className="border-0 text-xs"
                                            value={overTimeRate}
                                            onChange={(e) => setOverTimeRate(e.target.value)}
                                        >
                                            <option value="">Select</option>
                                            <option value="1">
                                                1x Salary
                                            </option>
                                            <option value="1.5">
                                                1.5x Salary
                                            </option>
                                            <option value="2">
                                                2x Salary
                                            </option>
                                            <option value={OVER_TIME_RATE_CUSTOM}>Custom rate</option>
                                        </select>
                                        {
                                            overTimeRate === OVER_TIME_RATE_CUSTOM && (
                                                <input
                                                    type="number"
                                                    className="border-0 border-l rounded-none"
                                                    value={customeOverTimeRate}
                                                    onChange={(e) => setCustomeOverTimeRate(e.target.value)}
                                                />
                                            )
                                        }
                                    </div>
                                </div>
                            </div>
                        )
                    }

                    {
                        overTimeType === OVER_TIME_HOURLY && (
                            <div className="flex flex-col items-center justify-between w-full mt-4 border-b pb-4">
                                <span className="text-left w-full text-gray-400 text-xs">Total amount</span>
                                <span className="mt-1 text-left w-full font-semibold text-xs">
                                    {String(overTimeHour || 0).padStart(2, '0')}:
                                    {String(overTimeMinute || 0).padStart(2, '0')} x {hourlyHourTimeRate} = {overTimeTotalAmount}
                                </span>
                            </div>
                        )
                    }
                </Modal.Body>
                <Modal.Footer>
                    <div className="flex justify-end items-center gap-2">
                        <button
                            onClick={() => {
                                setModelOpen(false);
                                closeModal(false);
                            }}
                            className="border bg-gray-50 rounded w-[120px] p-1 text-xs"
                        >
                            Close
                        </button>
                        <button
                            onClick={() => {
                                sendData({
                                    overTimeType, overTimeRate,
                                    customeOverTimeRate, overTimeHour, overTimeMinute,
                                    fixedOverTimeAmount, staffId: staffData._id,
                                    overTimeHourlyAmount: hourlyHourTimeRate
                                })
                                resetData();
                                setModelOpen(false);
                                closeModal(false);
                            }}
                            className="bg-[#003e32] p-1 rounded w-[120px] text-xs text-white"
                        >
                            Save
                        </button>
                    </div>
                </Modal.Footer>
            </Modal>
        </div>
    )
}

export default AttendanceOverTime;