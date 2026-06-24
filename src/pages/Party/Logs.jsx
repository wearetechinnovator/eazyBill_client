import React, { useEffect, useState } from 'react'
import { Icons } from '../../helper/icons';
import useMyToaster from '../../hooks/useMyToaster';
import Cookies from 'js-cookie';


const Logs = ({ partyId }) => {
  const toast = useMyToaster();
  const [logs, setLogs] = useState([]);
  const transactionType = [
    "Sales", "Quotation", "Proforma", 'Purchase', "Creditnote", "Debitnote",
    "Deliery Chalan", "Purchase Order", "Sales Return", "Purchase Return",
    "Paymentin", "Paymentout",
  ];
  const [activePage, setActivePage] = useState(1);
  const [dataLimit, setDataLimit] = useState(10);
  const [totalData, setTotalData] = useState();



  const getLog = async (type) => {
    try {
      const url = process.env.REACT_APP_API_URL + `/party/log?page=${activePage}&limit=${dataLimit}`;
      const cookie = Cookies.get("token");

      const req = await fetch(url, {
        method: 'POST',
        headers: {
          "Content-Type": "Application/json"
        },
        body: JSON.stringify({ token: cookie, partyId })
      })
      const res = await req.json();

      if (req.status !== 200 || res.get === false) {
        return toast(res.err, 'error');
      }

      setTotalData(res.totalData);

      console.log(res.data);

      if (!type || type === "") {
        setLogs([...res.data]);
        return;
      }

      const data = res.data.filter((l, _) => l.type.toLowerCase() === type.toLowerCase());
      setLogs([...data]);


    } catch (error) {
      console.log(error)
      return toast("Something went wrong", "error")
    }
  }

  useEffect(() => {
    getLog()
  }, [dataLimit, activePage])


  return (
    <div className='content__body__main'>
      <div className='details__header'>
        <p className='font-bold flex items-center gap-1'>
          <Icons.INVOICE />
          Logs
        </p>
      </div>
      <hr />

      <div>
        <select className='w-[200px]' onChange={(e) => getLog(e.target.value)}>
          <option value="">Select Transaction Type</option>
          {
            transactionType.map((tt, _) => {
              return <option key={_} value={tt.toLowerCase()}>{tt}</option>
            })
          }
        </select>
      </div>

      <div className='table__responsive'>
        <table className='w-full mt-5 border'>
          <thead className='bg-gray-100'>
            <tr>
              <td className='p-2'>Date</td>
              <td>Transaction Type</td>
              <td>Transaction Number</td>
              <td>Amount</td>
              <td align="center">Status</td>
            </tr>
          </thead>
          <tbody className="text-xs">
            {
              logs && logs.map((l, _) => {
                return <tr className='border-b' key={_}>
                  <td className='p-2'>{new Date(l.createdAt).toLocaleDateString()}</td>
                  <td>{l.type}</td>
                  <td>{
                    l.invoiceId.quotationNumber || l.invoiceId.salesInvoiceNumber ||
                    l.invoiceId.proformaNumber || l.invoiceId.purchaseInvoiceNumber
                    || l.invoiceId.purchaseReturnNumber || l.invoiceId.poNumber ||
                    l.invoiceId.paymentInNumber
                  }</td>
                  <td>
                    <div className='flex items-center'>
                      <Icons.RUPES /> {l.amount}
                    </div>
                  </td>
                  <td align='center'>
                    <span className='text-[10px] rounded-full px-1 bg-green-900 text-white'>
                      {l.invoiceId.paymentStatus == '0' ?
                        "Not Paid" : l.invoiceId.paymentStatus == "1" ?
                          "Paid" : l.invoiceId.paymentStatus == "2" ? "Pending" : "--"}
                    </span>
                  </td>
                </tr>
              })
            }
          </tbody>
        </table>
      </div>

      <div className='flex justify-end mt-3 w-auto'>
        {
          activePage > 1 ?
            <div onClick={() => setActivePage(activePage - 1)} className='paginate__button__back'>
              <Icons.PREV_PAGE_ARROW />
            </div> : null
        }
        {
          Array.from({ length: Math.ceil((totalData / dataLimit)) }).map((_, i) => {
            return <div
              onClick={() => setActivePage(i + 1)} className='paginate__button__number'
              style={activePage === i + 1 ? { border: "1px solid blue" } : {}}
            >
              {i + 1}
            </div>
          })
        }
        {
          (totalData / dataLimit) > activePage ?
            <div onClick={() => setActivePage(activePage + 1)} className='paginate__button__next'>
              <Icons.NEXT_PAGE_ARROW />
            </div> : null
        }
      </div>
    </div>
  )
}

export default Logs