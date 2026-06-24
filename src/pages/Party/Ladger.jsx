import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import useApi from '../../hooks/useApi';
import Cookies from 'js-cookie';
import Pagination from '../../components/Pagination';
import useMyToaster from '../../hooks/useMyToaster';
import DataShimmer from '../../components/DataShimmer';



const Ladger = ({ partyId }) => {
	const toast = useMyToaster()
	const token = Cookies.get("token");
	const companyData = useSelector((store) => store.userDetail);
	const companyDetails = companyData?.companies?.filter((c, _) => c._id === companyData.activeCompany)
	const [companyName, setCompanyName] = useState('');
	const [partyData, setPartyData] = useState(null);
	const { getApiData } = useApi()
	const [ladgers, setLadgers] = useState([])
	const [activePage, setActivePage] = useState(1);
	const [dataLimit, setDataLimit] = useState(50);
	const [totalData, setTotalData] = useState(0);
	const [partyBalance, setPartyBalance] = useState(0);
	const [loading, setLoading] = useState(false);
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


	// Get and setCompany Details;
	useEffect(() => {
		if (companyDetails && companyDetails?.length > 0) {
			let name = companyDetails[0]?.name || '';
			if (name.length > 20) {
				name = name.slice(0, 20) + '...';
			}
			setCompanyName(name);
		}
	}, [companyDetails]);


	// Get Party data
	useEffect(() => {
		(async () => {
			const partyData = await getApiData("party", partyId);
			setPartyData(partyData.data);
		})()
	}, [])


	// Get party ladger details;
	useEffect(() => {
		(async () => {
			try {
				setLoading(true);

				const URL = `${process.env.REACT_APP_API_URL}/ladger/get?page=${activePage}&limit=${dataLimit}`;
				const token = Cookies.get("token");
				const req = await fetch(URL, {
					method: 'POST',
					headers: {
						"Content-Type": 'application/json'
					},
					body: JSON.stringify({ partyId, token })
				});
				const res = await req.json();
				setLadgers([...res.data]);
				setTotalData(res.totalData)
			} catch (err) {
				return toast("Something went wrong", "error")
			} finally {
				setLoading(false);
			}
		})()
	}, [])


	// Get Party balance
	useEffect(() => {
		(async () => {
			const url = process.env.REACT_APP_API_URL + `/ladger/get-party-balance`;
			const req = await fetch(url, {
				method: 'POST',
				headers: {
					"Content-Type": 'application/json'
				},
				body: JSON.stringify({ partyId, token })
			});
			const res = await req.json();
			if (req.status !== 200) {
				return toast("Balance not get", 'error');
			}
			setPartyBalance(res.data[0]?.balance);
		})()
	}, [])


	return (
		<div className='content__body__main'>
			<div className='flex items-center justify-between border-b pb-2'>
				<div>
					<p className='font-bold'> {companyName} </p>
					<p className='text-xs text-gray-600'>
						Phone: {companyDetails && companyDetails[0]?.phone}
					</p>
				</div>

				<p className='font-bold text-gray-600'>Party Ladger</p>
			</div>

			<div className='flex items-center justify-between mt-2'>
				<div className='flex flex-col gap-2'>
					<p className='text-xs text-gray-600'>To,</p>
					<p className='font-bold text-xs leading-[0px]'>{partyData?.name}</p>
					<p className='text-xs text-gray-600'>Phone: {partyData?.contactNumber || "--"}</p>
				</div>
				<div className='w-[200px] h-[65px] rounded border p-2'>
					{/* <p className='text-xs text-gray-600 text-right border-b w-full pb-1'>Date - Date</p> */}
					<p className='text-xs text-gray-600 text-right'>
						Total {partyBalance < 0 ? 'Payable' : 'Receivable'}
					</p>
					<p className='font-bold text-right'>
						{partyBalance < 0 ? Math.abs(partyBalance) : partyBalance}
					</p>
				</div>
			</div>

			{
				!loading ? (
					<>
						<div className='table__responsive mb-3'>
							<table className='w-full border mt-2'>
								<thead className='bg-[#F6F7FB]'>
									<tr>
										<td className='p-2'>Date</td>
										<td>Voucher</td>
										<td>Voucher No.</td>
										<td>Credit</td>
										<td>Debit</td>
									</tr>
								</thead>
								<tbody className='text-xs'>
									{
										ladgers.map((l, _) => {
											return <tr className='border-b'>
												<td className='p-2'>{new Date(l.date).toLocaleDateString()}</td>
												<td>{voucherInv[l.voucher].title}</td>
												<td>
													{
														l.voucher !== "opening_balance" ?
															l['voucherId'][voucherInv[l.voucher].inv]
															: "--"
													}

												</td>
												<td>{l.credit}</td>
												<td>{l.debit}</td>
											</tr>
										})
									}
								</tbody>
							</table>
						</div>
						{/* table end; */}
						<Pagination
							activePage={activePage}
							dataLimit={dataLimit}
							setActivePage={setActivePage}
							totalData={totalData}
						/>
					</>
				) : (
					<DataShimmer />
				)
			}

		</div>
	)
}

export default Ladger;