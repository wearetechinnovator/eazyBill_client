import React from 'react';
import Nav from '../../components/Nav';
import SideNav from '../../components/SideNav';
import { Icons } from '../../helper/icons';
import { Constants } from '../../helper/constants';
import { SelectPicker } from 'rsuite';
import { getAdvanceFilterData } from '../../helper/advanceFilter';
import { useState } from 'react';
import { useEffect } from 'react';
import useMyToaster from '../../hooks/useMyToaster';
import Cookies from 'js-cookie';
import moment from 'moment';
import useExportTable from '../../hooks/useExportTable';
import { useMemo } from 'react';
import DataShimmer from '../../components/DataShimmer'



const DayBook = () => {
    let Moment = moment();
    const token = Cookies.get("token");
    const { copyTable, downloadExcel, printTable, exportPdf } = useExportTable();
    const toast = useMyToaster();
    const [data, setData] = useState([]);
    const [totalIncome, setTotalIncome] = useState(null);
    const [totalExpenses, setTotalExpenses] = useState(null);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState({
        startDate: Moment.format('YYYY-MM-DD'),
        endDate: Moment.format('YYYY-MM-DD')
    })
    const exportData = useMemo(() => {
        return data && data.map((d) => {
            return {
                "Date": d.date,
                "Voucher No.": d.voucherNo,
                "Voucher Type": d.voucher,
                "Party Name": d?.party?.name,
                "Money In": d.moneyIn,
                "Moneny Out": d.moneyOut
            }
        });
    }, [data]);




    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const URL = `${process.env.REACT_APP_API_URL}/report/daybook`;
                const req = await fetch(URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ ...filter, token })
                })
                const res = await req.json();
                if (req.status !== 200) {
                    return toast(res.err, "error");
                }


                // Without sorting
                const allData = [];
                let totalMoneyIn = 0;
                let totalMoneyOut = 0;

                // Payment in;
                res.income.payIn.forEach((p, i) => {
                    const temp = {};
                    temp.date = p.paymentInDate.split("T")[0];
                    temp.partyName = p.party.name;
                    temp.voucher = "Payment In";
                    temp.voucherNo = p.paymentInNumber;
                    temp.moneyIn = p.amount;
                    temp.invoiceNo = p.sattleInvoice.map((s)=>s.salesInvoiceNumber)

                    totalMoneyIn += Number(p.amount);
                    allData.push(temp);
                })
                // Payment out;
                res.expense.payOut.forEach((p, i) => {
                    const temp = {};
                    temp.date = p.paymentOutDate.split("T")[0];
                    temp.partyName = p.party.name;
                    temp.voucher = "Payment Out";
                    temp.voucherNo = p.paymentOutNumber;
                    temp.moneyOut = p.amount;
                    temp.invoiceNo = p.sattleInvoice.map((s)=>s.purchaseInvoiceNumber)

                    totalMoneyOut += Number(p.amount);
                    allData.push(temp);
                })
                // Transaction in;
                res.income.incomeTransation.forEach((t, i) => {
                    const temp = {};
                    temp.date = t.transactionDate.split("T")[0];
                    temp.partyName = "";
                    temp.voucher = "Other Transaction";
                    temp.voucherNo = t.transactionNumber;
                    temp.transactionCategory = t.category.categoryName;
                    temp.moneyIn = t.amount;

                    totalMoneyIn += Number(t.amount);
                    allData.push(temp);
                })
                // Transaction out;
                res.expense.expensesTransation.forEach((t, i) => {
                    const temp = {};
                    temp.date = t.transactionDate.split("T")[0];
                    temp.partyName = "";
                    temp.voucher = "Other Transaction";
                    temp.voucherNo = t.transactionNumber;
                    temp.transactionCategory = t.category.categoryName;
                    temp.moneyOut = t.amount

                    totalMoneyOut += Number(t.amount);
                    allData.push(temp);
                })

                // sort this array;
                allData.sort((a, b) => new Date(a.date) - new Date(b.date));

                setData([...allData]);
                setTotalIncome(totalMoneyIn);
                setTotalExpenses(totalMoneyOut);

            } catch (err) {
                return toast("Something went wrong.", "error");
            } finally {
                setLoading(false);
            }
        })()
    }, [filter])


    return (
        <>
            <Nav title={"Day Book"} />
            <main id='main'>
                <SideNav />
                <div className='content__body'>

                    <div className="content__body__main">
                        <div className='w-full flex items-start justify-end mb-2 gap-3 '>
                            <SelectPicker
                                placeholder="Filter Daybook"
                                searchable={false}
                                className='w-[140px]'
                                menuMaxHeight={"250px"}
                                onChange={async (v) => {
                                    if (v === Constants.CUSTOM) {
                                        return;
                                    }
                                    const { fromDate, toDate } = await getAdvanceFilterData(v);
                                    setFilter({ startDate: fromDate, endDate: toDate })

                                    if (!fromDate && !toDate) {
                                        setFilter({
                                            startDate: Moment.format('YYYY-MM-DD'),
                                            endDate: Moment.format('YYYY-MM-DD')
                                        })
                                    }
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
                                ]}
                            />

                            <button
                                onClick={() => downloadExcel(exportData, 'Daybook.xlsx')}
                                className='border rounded px-2 py-1 hover:border-[#003E32] text-gray-500'>
                                <Icons.EXCEL className='inline' /> Export Excel
                            </button>
                        </div>

                        {
                            !loading ? (
                                <div className='w-full flex items-center flex-col md:flex-row gap-1'>
                                    <div className='w-full border rounded'>
                                        <table className='w-full text-sm'>
                                            <thead>
                                                <tr className='bg-[#F6F9FF] border-b'>
                                                    <th className='text-left p-2 px-4 font-medium'>Date</th>
                                                    <th className='text-left p-2 px-4 font-medium'>Voucher Type</th>
                                                    <th className='text-left p-2 px-4 font-medium'>Voucher No.</th>
                                                    <th className='text-left p-2 px-4 font-medium'>Party Name</th>
                                                    <th className='text-left p-2 px-4 font-medium'>Invoice No</th>
                                                    <th className='text-left p-2 px-4 font-medium'>Money In</th>
                                                    <th className='text-left p-2 px-4 font-medium'>Money Out</th>
                                                </tr>
                                            </thead>
                                            <tbody className='text-[13px]'>
                                                {
                                                    data.map((d, _) => (
                                                        <tr key={_} className='odd:bg-gray-50'>
                                                            <td className='p-2 px-4 text-gray-500'>{d.date}</td>
                                                            <td className='p-2 px-4'>
                                                                {d.voucher} {d.transactionCategory && "- "+ d.transactionCategory}
                                                            </td>
                                                            <td className='p-2 px-4'>{d.voucherNo}</td>
                                                            <td className='p-2 px-4'>{d.partyName || "--"}</td>
                                                            <td className='p-2 px-4'>{d.invoiceNo?.join(",") || "--"}</td>
                                                            <td className='p-2 px-4  text-green-600'>
                                                                {d.moneyIn && <Icons.RUPES className='inline' />} {d.moneyIn || "--"}
                                                            </td>
                                                            <td className='p-2 px-4  text-red-600'>
                                                                {d.moneyOut && <Icons.RUPES className='inline' />} {d.moneyOut || "--"}
                                                            </td>
                                                        </tr>
                                                    ))
                                                }
                                            </tbody>
                                            <tfoot className='border-t'>
                                                <tr className='border-b'>
                                                    <td colSpan={5} align='right' className='text-[13px] font-semibold'>TOTAL</td>
                                                    <td left="left" className='font-semibold py-2 px-4 text-green-600'>
                                                        <Icons.RUPES className='inline' />{totalIncome}
                                                    </td>
                                                    <td align='left' className='font-semibold py-2 px-4 text-red-600'>
                                                        <Icons.RUPES className='inline' />{totalExpenses}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td colSpan={5} align='right' className='text-[13px] font-semibold'>CURRENT BALANCE</td>
                                                    <td align='left' className='font-semibold py-2 px-4'>
                                                        <span className={`font-bold ${(totalIncome - totalExpenses) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                            <Icons.RUPES className='inline' />{totalIncome - totalExpenses}
                                                        </span>
                                                    </td>

                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>
                            ) : <DataShimmer />
                        }
                    </div>



                </div>
            </main>
        </>
    )
}

export default DayBook;
