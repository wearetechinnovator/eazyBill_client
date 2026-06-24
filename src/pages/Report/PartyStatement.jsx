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
import useApi from '../../hooks/useApi';
import TableNoData from '../../components/TableNoData';



// ***** Party Wise Ladger *****
// =============================
const voucherInv = {
    sales: {
        inv: "salesInvoiceNumber",
        title: "Sales Invoice"
    },

    purchase: {
        inv: "purchaseInvoiceNumber",
        title: "Purchase Invoice"
    },

    credit_note: {
        inv: "creditnote",
        title: "Credit Note"
    },

    debit_note: {
        inv: "debitNoteNumber",
        title: "Debit Note"
    },

    purchase_return: {
        inv: "purchaseReturnNumber",
        title: "Purchase Return"
    },

    sales_return: {
        inv: "salesReturnNumber",
        title: "Sales Return"
    },

    pay_in: {
        inv: "paymentInNumber",
        title: "Payment In"
    },

    pay_out: {
        inv: "paymentOutNumber",
        title: "Payment Out"
    },

    opening_balance: {
        inv: "openingBalance",
        title: "Opening Balance"
    }
};
const PartyStatement = () => {
    let Moment = moment();
    const { getApiData } = useApi()
    const token = Cookies.get("token");
    const { copyTable, downloadExcel, printTable, exportPdf } = useExportTable();
    const toast = useMyToaster();
    const [ladgers, setLadgers] = useState([])
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState({
        startDate: Moment.format('YYYY-MM-DD'),
        endDate: Moment.format('YYYY-MM-DD')
    })
    const exportData = useMemo(() => {
        return ladgers && ladgers.map((l) => {
            return {
                "Date": l.date.split("T")[0],
                "Voucher Type": voucherInv[l.voucher].title,
                "Voucher No.": (
                    l.voucher !== "opening_balance" ?
                        l['voucherId'][voucherInv[l.voucher].inv]
                        : "--"
                ),
                "Credit": l.credit,
                "Debit": l.debit,
            }
        });
    }, [ladgers]);
    const [partyData, setPartyData] = useState([]);
    const [partyId, setPartyId] = useState(null);
    const [partyName, setPartyName] = useState(null);






    useEffect(() => {
        (async () => {
            try {
                const partyData = await getApiData("party");
                const partySelectData = partyData.data.map(d => ({ label: d.name, value: d._id }));
                setPartyData(partySelectData);

            } catch (err) {
                return toast("Parties not fetch, Something went wrong", "error");
            }
        })()
    }, [])


    // Get party ladger details;
    useEffect(() => {
        if (!partyId) return;

        (async () => {
            try {
                setLoading(true);
                const URL = `${process.env.REACT_APP_API_URL}/ladger/get`;
                const token = Cookies.get("token");
                const req = await fetch(URL, {
                    method: 'POST',
                    headers: {
                        "Content-Type": 'application/json'
                    },
                    body: JSON.stringify({
                        ...filter, partyId,
                        token, all: true
                    })
                });
                const res = await req.json();
                setLadgers([...res.data]);
            } catch (err) {
                return toast("Something went wrong", "error")
            } finally {
                setLoading(false);
            }
        })()
    }, [partyId, filter])


    return (
        <>
            <Nav title={"Party Statement (Ledger)"} />
            <main id='main'>
                <SideNav />
                <div className='content__body'>
                    <div className="content__body__main">
                        <div className='w-full flex justify-between items-center mb-4'>
                            <p className='font-semibold text-[16px]'>{partyName}</p>
                            <div className='w-[50%] flex items-start justify-end gap-3 '>
                                <SelectPicker
                                    className='w-[120px]'
                                    menuMaxHeight={"250px"}
                                    searchable={true}
                                    placeholder={"Select Party"}
                                    data={partyData}
                                    placement='bottomEnd'
                                    onChange={(v) => {
                                        setPartyId(v);

                                        if (v) {
                                            let partyName = partyData.find((i) => i.value == v);
                                            setPartyName(partyName.label);
                                            return;
                                        }
                                        setPartyName("");
                                    }}
                                    onClean={()=>{
                                        setLadgers([]);
                                    }}
                                />
                                <SelectPicker
                                    placeholder="Filter"
                                    searchable={false}
                                    className='w-[120px]'
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
                                    onClick={() => downloadExcel(exportData, 'party-satemane.xlsx')}
                                    className='border rounded px-2 py-1 hover:border-[#003E32] text-gray-500'>
                                    <Icons.EXCEL className='inline' /> Export Excel
                                </button>
                            </div>
                        </div>
                        {
                            !loading ? (
                                <div className='w-full flex items-center flex-col md:flex-row gap-1 mb-2'>
                                    <div className='w-full border rounded'>
                                        <table className='w-full text-sm'>
                                            <thead>
                                                <tr className='bg-[#F6F9FF] border-b'>
                                                    <th className='text-left p-2 px-4 font-medium'>Date</th>
                                                    <th className='text-left p-2 px-4 font-medium'>Voucher Type</th>
                                                    <th className='text-left p-2 px-4 font-medium'>Voucher No.</th>
                                                    <th className='text-left p-2 px-4 font-medium'>Credit</th>
                                                    <th className='text-left p-2 px-4 font-medium'>Debit</th>
                                                </tr>
                                            </thead>
                                            {
                                                ladgers.length > 0 ?(
                                                    <tbody className='text-[13px]'>
                                                {
                                                    ladgers.map((l, _) => (
                                                        <tr key={_} className='odd:bg-gray-50'>
                                                            <td className='p-2 px-4 text-gray-500'>{l.date.split("T")[0]}</td>
                                                            <td className='p-2 px-4'> {voucherInv[l.voucher].title} </td>
                                                            <td className='p-2 px-4'>
                                                                {
                                                                    l.voucher !== "opening_balance" ?
                                                                        l['voucherId'][voucherInv[l.voucher].inv]
                                                                        : "--"
                                                                }
                                                            </td>
                                                            <td className='p-2 px-4'>{l.credit}</td>
                                                            <td className='p-2 px-4'>{l.debit}</td>
                                                        </tr>
                                                    ))
                                                }
                                            </tbody>
                                                ):(
                                                    <TableNoData/>
                                                )
                                            }
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

export default PartyStatement;
