import { useEffect, useState } from 'react';
import { Modal } from 'rsuite';
import Cookies from 'js-cookie';
import useMyToaster from '../hooks/useMyToaster';
import { Icons } from '../helper/icons';
import Loading from './Loading';


const PrintPaymentInModal = ({ paymentId, open, onClose }) => {
    const token = Cookies.get("token");
    const toast = useMyToaster();
    const [loading, setLoading] = useState(false);
    const [paymentData, setPaymentData] = useState(null);
    const [companyDetails, setCompanyDetails] = useState(null);


    useEffect(() => {
        if (!open || !paymentId) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const [paymentRes, companyRes] = await Promise.all([
                    fetch(process.env.REACT_APP_API_URL + `/paymentin/get`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ token, id: paymentId })
                    }),
                    fetch(process.env.REACT_APP_API_URL + `/company/get`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ token })
                    })
                ]);

                const payment = await paymentRes.json();
                const company = await companyRes.json();

                setPaymentData(payment.data);
                setCompanyDetails(company);
            } catch (error) {
                console.log(error);
                toast("Something went wrong", "error");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [open, paymentId]);


    const printReceipt = () => {
        const style = document.createElement("style");
        style.innerHTML = `
            @media print {
                html, body {
                    margin: 0 !important;
                    padding: 0 !important;
                    height: auto !important;
                }
                body > * {
                    display: none !important;
                }
                .rs-modal-wrapper {
                    display: block !important;
                    position: absolute !important;
                    left: 0 !important;
                    top: 0 !important;
                    width: 100% !important;
                    height: auto !important;
                    overflow: visible !important;
                    transform: none !important;
                    padding: 0 !important;
                    margin: 0 !important;
                }
                .rs-modal,
                .rs-modal-dialog,
                .rs-modal-content {
                    position: static !important;
                    width: 100% !important;
                    max-width: 100% !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    overflow: visible !important;
                    transform: none !important;
                    box-shadow: none !important;
                }
                .rs-modal-body {
                    overflow: visible !important;
                    max-height: none !important;
                    padding: 0 !important;
                }
                .rs-modal-header,
                .rs-modal-backdrop {
                    display: none !important;
                }
                .no-print {
                    display: none !important;
                }
                #paymentReceipt {
                    width: 100% !important;
                    padding: 20px !important;
                    border: none !important;
                    background: white !important;
                }
            }
        `;
        document.head.appendChild(style);
        window.print();
        document.head.removeChild(style);
    };


    const handleClose = () => {
        setPaymentData(null);
        setCompanyDetails(null);
        onClose();
    };


    return (
        <Modal size='md' backdrop='static' open={open} onClose={handleClose}>
            <Modal.Header className='border-b pb-2'>
                <p className='font-bold'>Payment Receipt</p>
                <Modal.Title>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {
                    loading ? (
                        <div className='flex justify-center items-center py-10'>
                            <Loading />
                        </div>
                    ) : paymentData ? (
                        <>
                            <div className='flex justify-end gap-2 mb-3 no-print px-2'>
                                <button
                                    onClick={printReceipt}
                                    className='bg-[#003E32] text-white rounded-[5px] flex justify-center items-center px-3 py-[5px] gap-1'
                                >
                                    <Icons.PRINTER className="text-white text-[15px]" />
                                    Print
                                </button>
                            </div>

                            <div id='paymentReceipt' className='border rounded p-4'>
                                <p className='font-bold text-center uppercase text-lg'>Payment Receipt</p>

                                {/* Company Details */}
                                {
                                    companyDetails && (
                                        <div className='border mt-3'>
                                            <div className='flex border-b'>
                                                <div className='p-3 flex items-center gap-5 border-r' style={{ width: "60%" }}>
                                                    {
                                                        companyDetails.invoiceLogo && (
                                                            <img src={companyDetails.invoiceLogo} style={{ height: "80px", width: '80px' }} alt='logo' />
                                                        )
                                                    }
                                                    <div className='flex flex-col gap-1' style={{ fontSize: '12px' }}>
                                                        <p className='text-blue-700 font-bold' style={{ fontSize: '14px' }}>
                                                            {companyDetails.name}
                                                        </p>
                                                        <p>{companyDetails.address}</p>
                                                        {companyDetails.gst && (
                                                            <p><span className='font-semibold'>GSTIN</span>: {companyDetails.gst}</p>
                                                        )}
                                                        {companyDetails.phone && (
                                                            <p><span className='font-semibold'>Mobile</span>: {companyDetails.phone}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className='flex flex-col justify-center px-3' style={{ fontSize: '12px', width: '40%' }}>
                                                    <p><span className='font-semibold'>Receipt No: </span>{paymentData.paymentInNumber}</p>
                                                    <p><span className='font-semibold'>Date: </span>{new Date(paymentData.paymentInDate).toLocaleDateString()}</p>
                                                </div>
                                            </div>

                                            {/* Party Details */}
                                            <div className='p-3 border-b'>
                                                <p style={{ fontSize: '12px' }}>RECEIVED FROM</p>
                                                <p className='text-black font-semibold uppercase' style={{ fontSize: '12px' }}>
                                                    {paymentData.party?.name}
                                                </p>
                                                {paymentData.party?.billingAddress && (
                                                    <p style={{ fontSize: '12px' }}>
                                                        <span className='font-semibold'>Address:</span> {paymentData.party.billingAddress}
                                                    </p>
                                                )}
                                                {paymentData.party?.contactNumber && (
                                                    <p style={{ fontSize: '12px' }}>
                                                        <span className='font-semibold'>Mobile:</span> {paymentData.party.contactNumber}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Payment Details */}
                                            <div className='p-3 border-b'>
                                                <div className='flex gap-8' style={{ fontSize: '12px' }}>
                                                    <div>
                                                        <p className='font-semibold'>Amount</p>
                                                        <p className='text-lg font-bold'>
                                                            <Icons.RUPES className='inline' />{Number(paymentData.amount).toFixed(2)}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className='font-semibold'>Payment Mode</p>
                                                        <p className='uppercase'>{paymentData.paymentMode}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Settled Invoices */}
                                            {
                                                paymentData.sattleInvoice && paymentData.sattleInvoice.length > 0 && (
                                                    <div className='p-3'>
                                                        <p className='font-semibold mb-2' style={{ fontSize: '12px' }}>Settled Invoices</p>
                                                        <table className='w-full' style={{ fontSize: '12px' }}>
                                                            <thead className='bg-gray-100'>
                                                                <tr>
                                                                    <td className='p-2 font-semibold border'>Invoice No</td>
                                                                    <td className='p-2 font-semibold border'>Date</td>
                                                                    <td className='p-2 font-semibold border'>Invoice Amount</td>
                                                                    <td className='p-2 font-semibold border'>Amount Received</td>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {
                                                                    paymentData.sattleInvoice.map((inv, i) => (
                                                                        <tr key={i}>
                                                                            <td className='p-2 border'>{inv.salesInvoiceNumber}</td>
                                                                            <td className='p-2 border'>
                                                                                {inv.invoiceDate ? new Date(inv.invoiceDate).toLocaleDateString() : '-'}
                                                                            </td>
                                                                            <td className='p-2 border'>
                                                                                <Icons.RUPES className='inline' />{inv.finalAmount}
                                                                            </td>
                                                                            <td className='p-2 border'>
                                                                                <Icons.RUPES className='inline' />{inv.receiveAmount || 0}
                                                                            </td>
                                                                        </tr>
                                                                    ))
                                                                }
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                )
                                            }

                                            {/* Total */}
                                            <div className='p-3 bg-gray-50 flex justify-end'>
                                                <div className='text-right'>
                                                    <p className='font-semibold' style={{ fontSize: '12px' }}>Total Amount Received</p>
                                                    <p className='text-xl font-bold'>
                                                        <Icons.RUPES className='inline' />{Number(paymentData.amount).toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Signature */}
                                            <div className='p-3 border-t text-right'>
                                                {
                                                    companyDetails.signature && (
                                                        <img src={companyDetails.signature} alt="signature" className='ml-auto' style={{ height: '30px' }} />
                                                    )
                                                }
                                                <p className='mt-12' style={{ fontSize: '10px' }}>Authorised Signatory For</p>
                                                <p style={{ fontSize: '10px' }}>{companyDetails.name}</p>
                                            </div>
                                        </div>
                                    )
                                }
                            </div>
                        </>
                    ) : null
                }
            </Modal.Body>
        </Modal>
    );
};

export default PrintPaymentInModal;
