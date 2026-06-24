import { forwardRef, useEffect, useState } from 'react';
import { Constants } from '../../helper/constants';



const SalarySlip = forwardRef(({ staffData, salaryAttendance, userDetails, OverTimeData, totalDues, currentMonthPayments }, ref) => {
    const [companyName, setCompanyName] = useState("");
    const [companyMobile, setCompanyMobile] = useState("");
    const [companyLogo, setCompanyLogo] = useState("");
    const [attendanceAmount, setAttendanceAmount] = useState({
        present: 0, halfDay: 0, paidLeave: 0, weeklyOff: 0, overTime: 0,
        grossEarn: 0
    })
    const [totalPayment, setTotalPayment] = useState(0); //Gross payment
    const [totalEarn, setTotalEarn] = useState(0);
    const [netPayble, setNetPayble] = useState(0);



    useEffect(() => {
        if (userDetails) {
            userDetails.companies?.map((c, _) => {
                if (c._id === userDetails.activeCompany) {
                    setCompanyName(c.name);
                    setCompanyMobile(c.phone);
                    setCompanyLogo(c.invoiceLogo);
                }
            })
        }
    }, [userDetails])


    useEffect(() => {
        if (staffData.salary && salaryAttendance && salaryAttendance.amounts) {
            const halfDay = salaryAttendance.amounts.halfDay;
            const present = (salaryAttendance.amounts.present).toFixed(2);
            const weeklyOff = salaryAttendance.amounts.weeklyOff;
            const paidLeave = salaryAttendance.amounts.paidLeave;
            const overTime = salaryAttendance.amounts.overTime;
            const bonus = salaryAttendance.amounts.totalBonus;
            setAttendanceAmount({
                halfDay,
                present,
                weeklyOff,
                paidLeave,
            })
            setTotalEarn(
                Number(halfDay) +
                Number(present) +
                Number(weeklyOff) +
                Number(paidLeave) +
                Number(overTime) +
                Number(bonus)
            )
        }
    }, [staffData, salaryAttendance])


    useEffect(() => {
        if (currentMonthPayments.length > 0) {
            const total = currentMonthPayments.reduce((acc, i) => {
                if (i.paymentType !== Constants.LOAN_RECEIVED || i.paymentType !== Constants.LOAN)
                    acc += i.paymentAmount;
                return acc;
            }, 0)
            setTotalPayment(Number(total));
        } else {
            setTotalPayment(0)
        }

    }, [currentMonthPayments])


    // Set Netpayble;
    useEffect(() => {
        setNetPayble(Number(totalEarn || 0) + Number(totalDues || 0) - Number(totalPayment || 0))
    }, [totalPayment, totalEarn, totalDues])


    return (
        <div className='salary__slip' ref={ref}>
            <p className='text-gray-400 text-xs'>SALARY SLIP</p>

            <div className='w-full flex gap-5 mt-10 items-start'>
                <img src={companyLogo} className='max-h-[50px]' />
                <div>
                    <p className='font-bold text-sm'>{companyName}</p>
                    <span className='text-xs font-bold text-gray-500'>Mobile: {companyMobile}</span>
                </div>
            </div>

            <div className='flex justify-between w-full py-3 border-t mt-8 text-xs'>
                <div className='w-full flex'>
                    <div className='w-full flex flex-col'>
                        <p className='font-bold'>Staff Name</p>
                        <p className='font-bold'>Monthly Salary</p>
                    </div>
                    <div className='w-full flex flex-col'>
                        <p>: {staffData?.staffName}</p>
                        <p>: {staffData?.salary}</p>
                    </div>
                </div>
                <div className='w-full flex'>
                    <div className='w-full flex flex-col'>
                        <p className='font-bold'>Mobile Number</p>
                        <p className='font-bold'>Salary Cycle</p>
                    </div>
                    <div className='w-full flex flex-col'>
                        <p>: {staffData?.mobileNumber}</p>
                        <p>: {staffData?.salaryCycle}</p>
                    </div>
                </div>
            </div>

            {/* Table */}
            <table className='w-full salary__slip__table mt-2'>
                <thead className='bg-blue-50'>
                    <tr>
                        <td>Earning</td>
                        <td align='right'>Amount</td>
                    </tr>
                </thead>
                <tbody>
                    {
                        salaryAttendance.paidLeave > 0 && <tr>
                            <td>Paid Leave ({salaryAttendance.paidLeave} days)</td>
                            <td align='right'>
                                {attendanceAmount.paidLeave}
                            </td>
                        </tr>
                    }
                    {
                        salaryAttendance.present > 0 && <tr>
                            <td>Present ({salaryAttendance.present} days)</td>
                            <td align='right'>
                                {attendanceAmount.present}
                            </td>
                        </tr>
                    }
                    {
                        salaryAttendance.weeklyOff > 0 && <tr>
                            <td>Weekly Off ({salaryAttendance.weeklyOff} days)</td>
                            <td align='right'>
                                {attendanceAmount.weeklyOff}
                            </td>
                        </tr>
                    }
                    {
                        salaryAttendance.halfDay > 0 && <tr>
                            <td> Half Day ({salaryAttendance.halfDay} days) </td>
                            <td align='right'>
                                {attendanceAmount.halfDay}
                            </td>
                        </tr>
                    }
                    {
                        OverTimeData?.map((ov, _) => {
                            return <tr key={ov._id}>
                                <td>
                                    {
                                        ov.overTimeType === "amount" ? (
                                            <div className=''>Overtime ( 1 Days X ₹{ov.fixedOverTimeAmount})</div>
                                        ) : (
                                            <div className=''>Overtime ( {ov.overTimeHour}.{ov.overTimeMinute} Hrs X ₹{ov.overTimeHourlyAmount})</div>
                                        )
                                    }
                                </td>

                                <td align='right'>
                                    {
                                        ov.overTimeType === "amount" ? (
                                            <p>{Number(1) * Number(ov.fixedOverTimeAmount)}</p>
                                        ) : (
                                            <p>
                                                {((Number(ov.overTimeHour) + Number(ov.overTimeMinute || 0) / 60) * Number(ov.overTimeHourlyAmount)).toFixed(2)}
                                            </p>
                                        )
                                    }
                                </td>
                            </tr>
                        })
                    }
                    {Number(salaryAttendance?.amounts?.totalBonus || 0) > 0 && (
                        <tr>
                            <td>Bonus</td>
                            <td align='right'>{Number(salaryAttendance?.amounts?.totalBonus || 0)}</td>
                        </tr>
                    )}


                    <tr>
                        <td className='font-bold'>Gross Earnings</td>
                        <td align='right'>{(totalEarn).toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>

            <table className='w-full salary__slip__table mt-5'>
                <thead className='bg-blue-50'>
                    <tr>
                        <td>Payments</td>
                        <td align='right'>Amount</td>
                    </tr>
                </thead>
                <tbody>
                    {
                        currentMonthPayments?.map((p, _) => {
                            return <tr key={p._id}>
                                <td className='capitalize' valign='middle'>{p.paymentType.replace("_", " ")}</td>
                                <td align='right' valign='middle'>{p.paymentType === Constants.LOAN_RECEIVED && "-"}{p.paymentAmount}</td>
                            </tr>
                        })
                    }

                    <tr>
                        <td className='font-bold'>Gross Payment</td>
                        <td align='right' valign='middle'>{(totalPayment).toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>

            <table className='w-full salary__slip__table mt-5'>
                <tbody>
                    <tr>
                        <td>Previous Due Amounts</td>
                        <td align='right'>{Number(totalDues).toFixed(2)}</td>
                    </tr>

                    <tr>
                        <td className='font-bold'>Net Payable (Earning + Previous Balance - Payments)</td>
                        <td align='right'>{(netPayble).toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
})

export default SalarySlip;