import { useEffect, useMemo, useRef, useState } from 'react';
import Nav from '../../components/Nav';
import SideNav from '../../components/SideNav';
import { useNavigate } from 'react-router-dom';
import useExportTable from '../../hooks/useExportTable';
import Cookies from 'js-cookie';
import useMyToaster from '../../hooks/useMyToaster';
import downloadPdf from '../../helper/downloadPdf';
import DataShimmer from '../../components/DataShimmer';
import { Tooltip } from 'react-tooltip';
import AddNew from '../../components/AddNew';
import { Popover, Whisper } from 'rsuite';
import { Icons } from '../../helper/icons';
import Pagination from '../../components/Pagination';
import ConfirmModal from '../../components/ConfirmModal';
import ContextMenu from '../../components/ContextMenu';
import TableNoData from '../../components/TableNoData';



const TOTAL_PARTY = 'total_party';
const TOTAL_PAY = 'total_pay';
const TOTAL_COLLECT = 'total_collect';
const CUSTOMER = 'customer';
const SUPPLIER = 'supplier';
const BOTHPARTY = 'both';
const DEBOUNCE_TIME = 300;
const Party = () => {
	const token = Cookies.get("token");
	const navigate = useNavigate();
	const toast = useMyToaster();
	const tableRef = useRef(null);
	const { copyTable, downloadExcel, printTable, exportPdf } = useExportTable();
	const [activePage, setActivePage] = useState(1);
	const [dataLimit, setDataLimit] = useState(10);
	const [totalData, setTotalData] = useState()
	const [selected, setSelected] = useState([]);
	const [partyData, setPartyData] = useState([]);
	const [tableStatusData, setTableStatusData] = useState('active');
	const [partyBalance, setPartyBalance] = useState([]);
	const exportData = useMemo(() => {
		return partyData && partyData.map((p) => {
			const balance = partyBalance?.find((pb, _) => pb.partyId.toString() === p._id.toString());
			return {
				"Name": p.name,
				"Mobile Number": p.contactNumber,
				"Party Type": p.type,
				"Balance": balance?.balance,
			}
		});
	}, [partyData, partyBalance]);
	const [loading, setLoading] = useState(true);
	const [totalCollection, setTotalCollection] = useState(null);
	const [totalPay, setTotalPay] = useState(null);
	const [openConfirm, setOpenConfirm] = useState(false);
	const [selectedTab, setSelectedTab] = useState(TOTAL_PARTY);
	const [searchText, setSearchText] = useState("");
	let debounceRef = useRef(null);



	// Get Party data;
	const getPartyData = async () => {
		try {
			const data = {
				token,
				all: tableStatusData === "all" ? true : false,
				searchText: searchText
			}
			const url = process.env.REACT_APP_API_URL + `/party/get?page=${activePage}&limit=${dataLimit}`;
			const req = await fetch(url, {
				method: "POST",
				headers: {
					"Content-Type": 'application/json'
				},
				body: JSON.stringify(data)
			});
			const res = await req.json();

			if (selectedTab === TOTAL_COLLECT) {
				const party = res.data?.reduce((acc, i) => {
					const getBalance = partyBalance.find((pb, _) => pb.partyId === i._id);
					if (getBalance?.balance > 0) {
						acc.push(i);
					}

					return acc;
				}, [])
				setPartyData([...party]);
			}
			else if (selectedTab === TOTAL_PAY) {
				const party = res.data?.reduce((acc, i) => {
					const getBalance = partyBalance.find((pb, _) => pb.partyId === i._id);
					if (getBalance?.balance < 0) {
						acc.push(i);
					}

					return acc;
				}, [])
				setPartyData([...party]);
			}
			else {
				setTotalData(res.totalData)
				setPartyData([...res.data]);
			}

		} catch (error) {
			console.log(error);
			return toast("Party data not get", "error")
		}
	}
	useEffect(() => {
		getPartyData();
	}, [tableStatusData, dataLimit, activePage, selectedTab, searchText]);


	// Get Party balance
	useEffect(() => {
		(async () => {
			try {
				setLoading(true);
				const url = process.env.REACT_APP_API_URL + `/ladger/get-all-party-balance`;
				const req = await fetch(url, {
					method: 'POST',
					headers: {
						"Content-Type": 'application/json'
					},
					body: JSON.stringify({ token })
				});
				const res = await req.json();
				if (req.status !== 200) {
					return toast("Balance not get", 'error');
				}

				const { totalCollect, totalPayment } = res.data.reduce((acc, i) => {
					if (i.balance > 0) {
						acc.totalCollect += Number(i.balance);
					}
					else if (i.balance < 0) {
						acc.totalPayment += Number(i.balance);
					}
					return acc;
				}, { totalCollect: 0, totalPayment: 0 });

				setTotalCollection((Math.abs(totalCollect)).toFixed(2));
				setTotalPay((Math.abs(totalPayment)).toFixed(2));

				setPartyBalance(res.data);
			} catch (err) {
				return toast("Party Balance not get", "error");
			} finally {
				setLoading(false);
			}
		})()
	}, [])

	const selectAll = (e) => {
		if (e.target.checked) {
			setSelected(partyData.map(party => party._id));
		} else {
			setSelected([]);
		}
	};


	const handleCheckboxChange = (id) => {
		setSelected((prevSelected) => {
			if (prevSelected.includes(id)) {
				return prevSelected.filter((previd, _) => previd !== id);
			} else {
				return [...prevSelected, id];
			}
		});
	};


	const exportTable = async (whichType) => {
		if (whichType === "copy") {
			copyTable("listOfPartys"); // Pass tableid
		}
		else if (whichType === "excel") {
			downloadExcel(exportData, 'party-list.xlsx') // Pass data and filename
		}
		else if (whichType === "print") {
			printTable(tableRef, "Party List"); // Pass table ref and title
		}
		else if (whichType === "pdf") {
			let document = exportPdf('Party List', exportData);
			downloadPdf(document)
		}
	}


	const removeData = async () => {
		if (selected.length === 0 || tableStatusData !== 'active') {
			return;
		}
		const url = process.env.REACT_APP_API_URL + "/party/delete";
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
				setPartyData((prevData) => {
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
			<Nav title={"Parties"} />
			<main id='main' >
				<SideNav />
				<Tooltip id='partyTooltip' />
				<ConfirmModal
					openConfirm={openConfirm}
					openStatus={(status) => { setOpenConfirm(status) }}
					title={"Are you sure you want to delete the selected parties?"}
					fun={() => {
						removeData();
						setOpenConfirm(false);
						getPartyData();
					}}
				/>
				<ContextMenu
					print={() => exportTable('print')}
					copy={() => exportTable('copy')}
					pdf={() => exportTable('pdf')}
					excel={() => exportTable('excel')}
				/>
				<div className="content__body">
					{/* top section */}
					<div className='add_new_compnent'>
						<div className='flex justify-between items-center'>
							<div className='flex flex-col'>
								<select value={dataLimit} onChange={(e) => setDataLimit(e.target.value)}>
									<option value={10}>10</option>
									<option value={25}>25</option>
									<option value={50}>50</option>
									<option value={100}>100</option>
								</select>
							</div>
							<div className='flex items-center gap-2 listing__btn_grp'>
								<div className='flex w-full flex-col lg:w-[300px]'>
									<input type='search'
										placeholder='Search Party Name or Mobile Number...'
										onChange={searchData}
										className='p-[6px] text-xs'
									/>
								</div>
								<button
									onClick={() => {
										if (selected.length === 0 || tableStatusData !== 'active') return;
										setOpenConfirm(true);
									}}
									className={`${selected.length > 0 ? 'bg-red-400 text-white' : 'bg-gray-100'} border`}>
									<Icons.DELETE className='text-lg' />
									Delete
								</button>
								<button
									onClick={() => navigate("/admin/party/add")}
									className='bg-[#003E32] text-white '>
									<Icons.ADD className='text-white' size={15}/>
									Add New
								</button>
								{
									partyData?.length > 0 && (
										<div className='flex justify-end'>
											<Whisper placement='leftStart' enterable
												speaker={<Popover full>
													<div className='download__menu' onClick={() => exportTable('print')} >
														<Icons.PRINTER className='text-[16px]' />
														Print Table
													</div>
													<div className='download__menu' onClick={() => exportTable('copy')}>
														<Icons.COPY className='text-[16px]' />
														Copy Table
													</div>
													<div className='download__menu' onClick={() => exportTable('pdf')}>
														<Icons.PDF className="text-[16px]" />
														Download Pdf
													</div>
													<div className='download__menu' onClick={() => exportTable('excel')} >
														<Icons.EXCEL className='text-[16px]' />
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
					</div>
					{
						!loading ? (totalData > 0) ? <div className='content__body__main view'>
							<div className='flex flex-col md:flex-row justify-between items-center mb-5 gap-8'>
								<div
									onClick={() => setSelectedTab(TOTAL_PARTY)}
									className={`party__data ${selectedTab === TOTAL_PARTY ? 'active' : ''}`}
								>
									<h6><Icons.USERS /> Total Parties</h6>
									<p>{totalData}</p>
								</div>
								<div
									onClick={() => setSelectedTab(TOTAL_PAY)}
									className={`party__data ${selectedTab === TOTAL_PAY ? 'active' : ''}`}
								>
									<h6><Icons.TREDING_DOWN /> Total Amount To Pay</h6>
									<p><Icons.RUPES />{totalPay}</p>
								</div>
								<div
									onClick={() => setSelectedTab(TOTAL_COLLECT)}
									className={`party__data ${selectedTab === TOTAL_COLLECT ? 'active' : ''}`}
								>
									<h6><Icons.TREDING_UP />Total Amount To Collect</h6>
									<p><Icons.RUPES />{totalCollection}</p>
								</div>
							</div>

							{/* Table start */}
							<div className='overflow-x-auto list__table'>
								<table className='min-w-full bg-white' id='listOfPartys' ref={tableRef}>
									<thead className='list__table__head'>
										<tr>
											<th className='py-2 w-[50px]'>
												<input
													type='checkbox'
													onChange={selectAll}
													checked={partyData.length > 0 && selected.length === partyData.length}
												/>
											</th>
											<th className='py-2' align='left'>Name</th>
											<th className='py-2' align='left'>Mobile Number</th>
											<th className='py-2' align='left'>Party Type</th>
											<th className='py-2' align='left'>Balance</th>
											<th className='py-2 w-[100px]'>Action</th>
										</tr>
									</thead>
									<tbody>
										{
											partyData.length > 0 ? partyData.map((data, i) => {
												const balance = partyBalance?.find((p, _) => p?.partyId.toString() === data._id.toString());

												return <tr key={i} onClick={() => navigate("/admin/party/details/" + data._id)} className='cursor-pointer hover:bg-gray-100'>
													<td className='py-2' align='center'>
														<input type='checkbox'
															onClick={(e) => e.stopPropagation()}
															checked={selected.includes(data._id)}
															onChange={() => handleCheckboxChange(data._id)}
														/>
													</td>
													<td>{data.name}</td>
													<td>{data.contactNumber}</td>
													<td>
														<span className='badge green-badge capitalize'>
															{data.type}
														</span>
													</td>
													<td className='px-4'>
														<Icons.RUPES className='inline' />
														{balance?.balance || 0}
													</td>
													<td className='px-4'>
														<Whisper
															onClick={(e) => e.stopPropagation()}
															placement='leftStart'
															trigger={"click"}
															speaker={<Popover full>
																<div
																	className='table__list__action__icon'
																	onClick={(e) => {
																		e.stopPropagation()
																		navigate("/admin/party/edit/" + data._id)
																	}}
																>
																	<Icons.EDIT className='text-[16px]' />
																	Edit
																</div>
															</Popover>}
														>
															<div className='table__list__action' >
																<Icons.HORIZONTAL_MORE />
															</div>
														</Whisper>
													</td>
												</tr>
											}) : (
												<TableNoData />
											)
										}
									</tbody>
								</table>
								<div className='paginate__parent'>
									<p>Showing {partyData.length} of {totalData} entries</p>
									<Pagination
										activePage={activePage}
										totalData={totalData}
										dataLimit={dataLimit}
										setActivePage={setActivePage}
									/>
									{/* pagination end */}
								</div>
							</div>
						</div>
							: <AddNew title={"Party"} link={"/admin/party/add"} />
							: <DataShimmer topBox={true} />
					}
				</div>
			</main >
		</>
	)
}

export default Party;
