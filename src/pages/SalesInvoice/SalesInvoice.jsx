import React, { useEffect, useMemo, useRef, useState } from 'react';
import Nav from '../../components/Nav';
import SideNav from '../../components/SideNav';
import { useNavigate } from 'react-router-dom';
import useExportTable from '../../hooks/useExportTable';
import useMyToaster from '../../hooks/useMyToaster';
import Cookies from 'js-cookie';
import downloadPdf from '../../helper/downloadPdf';
import DataShimmer from '../../components/DataShimmer';
import { Tooltip } from 'react-tooltip';
import { Popover, SelectPicker, Whisper } from 'rsuite';
import AddNew from '../../components/AddNew';
import { Icons } from '../../helper/icons';
import Pagination from '../../components/Pagination';
import ConfirmModal from '../../components/ConfirmModal';
import { Constants } from '../../helper/constants';
import { getAdvanceFilterData } from '../../helper/advanceFilter';
import ContextMenu from '../../components/ContextMenu';
import TableNoData from '../../components/TableNoData';




const SalesInvoice = () => {
	const toast = useMyToaster();
	const { copyTable, downloadExcel, printTable, exportPdf } = useExportTable();
	const [activePage, setActivePage] = useState(1);
	const [dataLimit, setDataLimit] = useState(10);
	const [totalData, setTotalData] = useState();
	const [selected, setSelected] = useState([]);
	const navigate = useNavigate();
	const [billData, setBillData] = useState([]);
	const tableRef = useRef(null);
	const [tableStatusData, setTableStatusData] = useState('active');
	const exportData = useMemo(() => {
		return billData && billData.map((data) => {
			let paymentStatus = Constants.UNPAID;
			const paymentAmount = Number(data.paymentAmount) || 0;
			if (data.finalAmount === paymentAmount)
				paymentStatus = Constants.PAID;

			else if (paymentAmount > 0 && paymentAmount < data.finalAmount)
				paymentStatus = Constants.PARTIAL_PAID;

			return {
				"Invoice Date": data.invoiceDate?.split("T")[0],
				"Invoice Number": data.salesInvoiceNumber,
				"Party": data.party.name,
				"Due Date": data.DueDate?.split("T")[0] || "--",
				Status: paymentStatus,
				Amount: data.finalAmount
			}
		});
	}, [billData]);
	const [loading, setLoading] = useState(true);
	const [filterToggle, setFilterToggle] = useState(false);
	const [filter, setFilter] = useState({
		startDate: '', endDate: '', billNo: '', party: '',
	})
	const [ascending, setAscending] = useState(true);
	const [totalSaleAmount, setTotalSaleAmount] = useState(0);
	const [totalPaymentIn, setTotalPaymentIn] = useState(0);
	const [totalDuePayment, setTotalDuePayment] = useState(0);
	const [totalCancelAmount, setTotalCancelAmount] = useState(0);
	const [openConfirm, setOpenConfirm] = useState(false);
	const [selectedTab, setSelectedTab] = useState(Constants.TOTAL_SALE);
	const [applyFilter, setApplyFilter] = useState(null);
	const [isCustomDate, setIsCustomDate] = useState(false);
	const [totalBills, setTotalBills] = useState({
		all: 0, paid: 0, unpaid: 0, cancel: 0
	})




	// Get data;
	const getData = async () => {
		try {
			setLoading(true);
			let data = {
				token: Cookies.get("token"),
				all: tableStatusData === "all" ? true : false
			}
			if (applyFilter) {
				data = {
					...data,
					startDate: filter.startDate,
					endDate: filter.endDate,
					partyName: filter.party,
					billNo: filter.billNo,
				}
			}

			const url = `${process.env.REACT_APP_API_URL}/salesinvoice/get?page=${activePage}&limit=${dataLimit}`;
			const req = await fetch(url, {
				method: "POST",
				headers: {
					"Content-Type": 'application/json'
				},
				body: JSON.stringify(data)
			});
			const res = await req.json();

			if (req.status === 200) {
				// Total Amount
				const totalAmount = res.data.reduce((acc, i) => acc += i.finalAmount, 0);
				setTotalSaleAmount(totalAmount.toFixed(2));

				// Total Paid
				const [totalPaid, paidLen] = res.data.reduce((acc, i) => {
					if (i.paymentAmount) {
						acc[0] += i.paymentAmount;
						acc[1] += 1;
					}
					return acc;
				}, [0, 0]);
				setTotalPaymentIn(totalPaid.toFixed(2));

				// Total UnPaid
				const [totalUnpaid, unPaidLen] = res.data.reduce((acc, i) => {
					if (!i.isCancel && (!i.paymentAmount || i.paymentAmount < i.finalAmount)) {
						acc[0] += !i.paymentAmount ? i.finalAmount : i.finalAmount - i.paymentAmount;
						acc[1] += 1;
					}
					return acc;
				}, [0, 0]);
				setTotalDuePayment((totalUnpaid).toFixed(2));

				// Total Cancel Amount;
				const [totalCancel, cancelLen] = res.data.reduce((acc, i) => {
					if (i.isCancel) {
						acc[0] += i.finalAmount;
						acc[1] += 1;
					}
					return acc;
				}, [0, 0]);
				setTotalCancelAmount(totalCancel.toFixed(2));

				// ----------------------[Set Total Bill Counts]-----------------------
				setTotalBills({
					cancel: cancelLen, all: res.totalData,
					paid: paidLen, unpaid: unPaidLen
				});


				// TAB Wise Bill;
				if (selectedTab === Constants.PAID) {
					const paidInv = res.data.filter(d => d.paymentAmount);
					setBillData(paidInv);
				}
				else if (selectedTab === Constants.UNPAID) {
					const unPaidInv = res.data.filter(d => (!d.paymentAmount || d.paymentAmount < d.finalAmount) && !d.isCancel);
					setBillData(unPaidInv);
				}
				else if (selectedTab === Constants.CANCEL) {
					const paidInv = res.data.filter(d => d.isCancel);
					setBillData(paidInv);
				}
				else {
					setTotalData(res.totalData)
					setBillData([...res.data])
				}
			}

		} catch (error) {
			return toast("Sales invoice not get", "error");
		} finally {
			setLoading(false);
		}
	}
	useEffect(() => {
		getData();
	}, [tableStatusData, dataLimit, activePage, selectedTab, applyFilter])


	const sortByDate = () => {
		const sorted = [...billData].sort((a, b) => {
			const dateA = new Date(a.invoiceDate);
			const dateB = new Date(b.invoiceDate);
			return ascending ? dateA - dateB : dateB - dateA;
		});
		setBillData(sorted);
		setAscending(!ascending);
	};



	const selectAll = (e) => {
		if (e.target.checked) {
			setSelected(billData.map(data => data._id));
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
			copyTable("listQuotation"); // Pass tableid
		}
		else if (whichType === "excel") {
			downloadExcel(exportData, 'Sales-list.xlsx') // Pass data and filename
		}
		else if (whichType === "print") {
			printTable(tableRef, "Sales List"); // Pass table ref and title
		}
		else if (whichType === "pdf") {
			let document = exportPdf('Invoice List', exportData);
			downloadPdf(document)
		}
	}


	const removeData = async () => {
		if (selected.length === 0 || tableStatusData !== 'active') {
			return;
		}
		try {
			const url = process.env.REACT_APP_API_URL + "/salesinvoice/delete";
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
				setBillData((prevData) => {
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


	const clearFilterData = () => {
		setFilter({
			startDate: '', endDate: '', billNo: '', party: '',
		})
		setApplyFilter(false);
	}


	return (
		<>
			<Nav title={"Sales Invoice"} />
			<main id='main'>
				<SideNav />
				<Tooltip id='salesTooltip' />
				<ConfirmModal
					openConfirm={openConfirm}
					openStatus={(status) => { setOpenConfirm(status) }}
					title={"Are you sure you want to delete the selected invoices?"}
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
				<div className='content__body'>
					<div className={`add_new_compnent`}>
						<div className='flex justify-between items-center'>
							<div className='flex flex-col'>
								<select value={dataLimit} onChange={(e) => setDataLimit(e.target.value)}>
									<option value={10}>10</option>
									<option value={25}>25</option>
									<option value={50}>50</option>
									<option value={100}>100</option>
								</select>
							</div>
							<div className='listing__btn_grp'>
								<button
									onClick={() => {
										setFilterToggle(!filterToggle);
									}}
									className={`${filterToggle ? 'bg-gray-200' : 'bg-gray-100'} border`}>
									<Icons.FILTER className='text-xl' />
									Filter
								</button>
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
									onClick={() => navigate("/admin/sales-invoice/add")}
									className='bg-[#003E32] text-white '>
									<Icons.ADD className='text-white' size={15}/>
									Add New
								</button>
								{
									billData?.length > 0 && (
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
						{
							filterToggle && (
								<div>
									<hr />
									<div className='w-full flex items-center gap-4'>
										<div className='w-full'>
											<p>Invoice No</p>
											<input type="text"
												value={filter.billNo}
												onChange={(e) => setFilter({ ...filter, billNo: e.target.value })}
											/>
										</div>
										<div className='w-full'>
											<p>Party Name</p>
											<input type="text"
												value={filter.party}
												onChange={(e) => setFilter({ ...filter, party: e.target.value })}
											/>
										</div>
										<div className='w-full'>
											<label htmlFor="categorySelect">Search By</label>
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
													setApplyFilter(false);
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
									</div>
									<div className='w-full flex items-center gap-4 mt-4'>
										{
											isCustomDate && (
												<>
													<div className='w-full'>
														<p>Start Date</p>
														<input type="date"
															value={filter.startDate}
															onChange={(e) => setFilter({ ...filter, startDate: e.target.value })}
														/>
													</div>
													<div className='w-full'>
														<p>End Date</p>
														<input type="date"
															value={filter.endDate}
															onChange={(e) => setFilter({ ...filter, endDate: e.target.value })}
														/>
													</div>
													<div className='w-full'></div>
												</>
											)
										}
									</div>

									<div className='w-full flex justify-end gap-2 mt-2 pb-2' id='filterBtnGrp'>
										<button onClick={() => setApplyFilter(true)}>
											<Icons.SEARCH />
											Search
										</button>
										<button onClick={clearFilterData}>
											<Icons.RESET />
											Reset
										</button>
									</div>
								</div>
							)
						}
					</div>
					{
						!loading ? totalBills?.all > 0 ? <div className='content__body__main view'>
							<div className='flex flex-col md:flex-row justify-between items-center mb-5 gap-8'>
								<div onClick={() => setSelectedTab(Constants.TOTAL_SALE)}
									className={`party__data ${selectedTab === Constants.TOTAL_SALE ? 'active' : ''}`}
								>
									<div className='w-full flex items-center justify-between'>
										<h6><Icons.INVOICE /> Total Sale</h6>
										<p>{totalBills?.all}</p>
									</div>
									<p><Icons.RUPES />{totalSaleAmount}</p>
								</div>
								<div onClick={() => setSelectedTab(Constants.PAID)}
									className={`party__data ${selectedTab === Constants.PAID ? 'active' : ''}`}
								>
									<div className='w-full flex items-center justify-between'>
										<h6><Icons.TREDING_UP />Paid</h6>
										<p>{totalBills.paid}</p>
									</div>
									<p><Icons.RUPES />{totalPaymentIn}</p>
								</div>

								<div onClick={() => setSelectedTab(Constants.UNPAID)}
									className={`party__data ${selectedTab === Constants.UNPAID ? 'active' : ''}`}
								>
									<div className='w-full flex items-center justify-between'>
										<h6><Icons.TREDING_DOWN />Unpaid</h6>
										<p>{totalBills.unpaid}</p>
									</div>
									<p><Icons.RUPES /> {totalDuePayment} </p>
								</div>

								<div onClick={() => setSelectedTab(Constants.CANCEL)}
									className={`party__data ${selectedTab === Constants.CANCEL ? 'active' : ''}`}
								>
									<div className='w-full flex items-center justify-between'>
										<h6><Icons.CANCEL />Cancel</h6>
										<p>{totalBills.cancel}</p>
									</div>
									<p><Icons.RUPES /> {totalCancelAmount} </p>
								</div>
							</div>

							{/* Table start */}
							<div className='overflow-x-auto list__table'>
								<table className='min-w-full bg-white' id='listQuotation' ref={tableRef}>
									<thead className='list__table__head'>
										<tr>
											<th className='py-2 border-b' align='center'>
												<input type='checkbox'
													onChange={selectAll}
													checked={billData.length > 0 && selected.length === billData.length}
												/>
											</th>
											<th className='py-2 border-b cursor-pointer' align='left'>
												<div className='flex items-center justify-start' onClick={sortByDate}>
													Date {ascending ? <Icons.DROPDOWN /> : <Icons.DROPUP />}
												</div>
											</th>
											<th className='py-2 border-b' align='left'>Sales Invoice Number</th>
											<th className='py-2 border-b' align='left'>Party Name</th>
											<th className='py-2 border-b' align='left'>Due Date</th>
											<th className='py-2 border-b' align='left'>Status</th>
											<th className='py-2 border-b' align='left'>Amount</th>
											<th className='py-2 border-b'>Action</th>
										</tr>
									</thead>
									<tbody>
										{
											billData.length > 0 ? billData.map((data, i) => {
												let paymentStatus = Constants.UNPAID;
												const paymentAmount = Number(data.paymentAmount) || 0;

												if (data.finalAmount === paymentAmount) {
													paymentStatus = Constants.PAID;
												}
												else if (paymentAmount > 0 && paymentAmount < data.finalAmount) {
													paymentStatus = Constants.PARTIAL_PAID;
												}


												return <tr key={data._id}
													onClick={() => navigate(`/admin/bill/details/salesinvoice/${data._id}`)}>
													<td className='py-2 max-w-[10px]' align='center'>
														<input type='checkbox'
															checked={selected.includes(data._id)}
															onChange={() => handleCheckboxChange(data._id)}
															onClick={(e) => e.stopPropagation()}
														/>
													</td>
													<td align='left'>{data.invoiceDate.split("T")[0]}</td>
													<td>{data.salesInvoiceNumber}</td>
													<td align='left'>{data.party.name}</td>
													<td align='left'>
														{data.DueDate ? new Date(data.DueDate).toLocaleDateString() : "--"}
													</td>
													<td align='left'>
														{
															data.isCancel ?
																<span className='badge red-badge'>Cancelled</span>
																: <span className={`${paymentStatus === Constants.PAID ? 'green-badge' : paymentStatus === Constants.PARTIAL_PAID ? 'yellow-badge' : 'red-badge'} badge capitalize`}>
																	{paymentStatus}
																</span>
														}
													</td>
													<td align='left'>
														<Icons.RUPES className='inline' /> {data.finalAmount}
														{
															paymentStatus !== Constants.PAID && (
																<p className='text-[12px] py-1'>
																	<Icons.RUPES className='inline text-[10px]' />
																	{(data.finalAmount - paymentAmount).toFixed(2)} unpaid
																</p>
															)
														}
													</td>
													<td className='text-center'>
														<Whisper
															placement='leftStart'
															trigger={"click"}
															speaker={<Popover full className='table__list__action__parent'>
																<div
																	className='table__list__action__icon'
																	onClick={(e) => {
																		e.stopPropagation();
																		if (paymentStatus === Constants.UNPAID) {
																			navigate(`/admin/sales-invoice/edit/${data._id}`)
																		} else {
																			return toast("This voucher can't be edited, because it's linked to another entry", "error")
																		}
																	}}
																>
																	<Icons.EDIT className='text-[16px]' />
																	Edit
																</div>
																<div
																	className='table__list__action__icon'
																	onClick={(e) => {
																		e.stopPropagation();
																		navigate(`/admin/sales-invoice/add/${data._id}`)
																	}}
																>
																	<Icons.COPY className='text-[16px]' />
																	Clone
																</div>
															</Popover>}
														>
															<div className='table__list__action' onClick={(e) => e.stopPropagation()}>
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
									<p>Showing {billData.length} of {totalData} entries</p>
									<Pagination
										activePage={activePage}
										totalData={totalData}
										dataLimit={dataLimit}
										setActivePage={setActivePage}
									/>
								</div>
								{/* pagination end */}
							</div>
						</div>
							: <AddNew title={"Sales Invoice"} link={"/admin/sales-invoice/add"} />
							: <DataShimmer topBox={true} topBoxCount={4} />
					}
				</div>
			</main>
		</>
	)
}

export default SalesInvoice;

