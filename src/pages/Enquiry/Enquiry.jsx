import { useEffect, useMemo, useRef, useState } from 'react';
import Nav from '../../components/Nav';
import SideNav from '../../components/SideNav';
import { Popover, Whisper } from 'rsuite';
import { BiPrinter } from "react-icons/bi";
import { FaRegCopy, FaRegEdit } from "react-icons/fa";
import { FaRegFilePdf } from "react-icons/fa";
import { FaRegFileExcel } from "react-icons/fa";
import { MdDeleteOutline } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import useExportTable from '../../hooks/useExportTable';
import useMyToaster from '../../hooks/useMyToaster';
import Cookies from 'js-cookie';
import downloadPdf from '../../helper/downloadPdf';
import DataShimmer from '../../components/DataShimmer';
import { Tooltip } from 'react-tooltip';
import { IoIosAdd, IoMdMore } from 'react-icons/io';
import AddNew from '../../components/AddNew';
import { FiMoreHorizontal } from 'react-icons/fi';
import ConfirmModal from '../../components/ConfirmModal';
import Pagination from '../../components/Pagination';
import { Icons } from '../../helper/icons';
import ContextMenu from '../../components/ContextMenu';




const DEBOUNCE_TIME = 300;
const Enquiry = () => {
	const token = Cookies.get("token")
	const toast = useMyToaster();
	const { copyTable, downloadExcel, printTable, exportPdf } = useExportTable();
	const [activePage, setActivePage] = useState(1);
	const [dataLimit, setDataLimit] = useState(10);
	const [totalData, setTotalData] = useState();
	const [selected, setSelected] = useState([]);
	const navigate = useNavigate();
	const [enquiryData, setEnquiryData] = useState([]);
	const tableRef = useRef(null);
	const [tableStatusData, setTableStatusData] = useState('active');
	const exportData = useMemo(() => {
		return enquiryData && enquiryData.map((e) => ({
			"Enq No.": e.enqNo,
			"Party": e.party?.name,
			"Contact person": e.contactPerson?.name,
			"Item": e.item?.title,
			"Delivery Date": e.deliveryDate?.split("T")[0]
		}));
	}, [enquiryData]);
	const [loading, setLoading] = useState(true);
	const [openConfirm, setOpenConfirm] = useState(false);
	const [searchText, setSearchText] = useState("");
	let debounceRef = useRef(null);



	// Get data;
	useEffect(() => {
		(async () => {
			try {
				const data = {
					token,
					all: tableStatusData === "all" ? true : false,
					searchText: searchText
				}
				const URL = `${process.env.REACT_APP_API_URL}/enquiry/get-all?page=${activePage}&limit=${dataLimit}`;
				const req = await fetch(URL, {
					method: "POST",
					headers: {
						"Content-Type": 'application/json'
					},
					body: JSON.stringify(data)
				});
				const res = await req.json();
				setTotalData(res.totalData)
				setEnquiryData([...res.data]);

			} catch (error) {
				console.log(error)
			} finally {
				setLoading(false);
			}
		})()
	}, [tableStatusData, dataLimit, activePage, searchText])


	const selectAll = (e) => {
		if (e.target.checked) {
			setSelected(enquiryData.map(data => data._id));
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
			downloadExcel(exportData, 'enquiry.xlsx') // Pass data and filename
		}
		else if (whichType === "print") {
			printTable(tableRef, "Enquiry"); // Pass table ref and title
		}
		else if (whichType === "pdf") {
			let document = exportPdf('Enquiry', exportData);
			downloadPdf(document)
		}
	}

	const removeData = async () => {
		if (selected.length === 0 || tableStatusData !== 'active') {
			return;
		}
		const url = process.env.REACT_APP_API_URL + "/enquiry/delete";
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
				setEnquiryData((prevData) => {
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


	return (
		<>

			<Nav title={"Enquiry"} />
			<main id='main'>
				<SideNav />
				<Tooltip id='accoutnTooltip' />
				<ConfirmModal
					openConfirm={openConfirm}
					openStatus={(status) => { setOpenConfirm(status) }}
					title={"Are you sure you want to delete the selected Accounts?"}
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
							<div className='flex items-center gap-2'>
								<button
									onClick={() => {
										if (selected.length === 0 || tableStatusData !== 'active') return;
										setOpenConfirm(true);
									}}
									className={`${selected.length > 0 ? 'bg-red-400 text-white' : 'bg-gray-100'} border`}>
									<MdDeleteOutline className='text-lg' />
									Delete
								</button>
								<button
									onClick={() => navigate("/admin/enquiry/add")}
									className='bg-[#003E32] text-white '>
									<Icons.ADD className='text-white' size={15}/>
									Add New
								</button>
								{
									enquiryData?.length > 0 && (
										<div className='flex justify-end'>
											<Whisper placement='leftStart' enterable
												speaker={<Popover full>
													<div className='download__menu' onClick={() => exportTable('print')} >
														<BiPrinter className='text-[16px]' />
														Print Table
													</div>
													<div className='download__menu' onClick={() => exportTable('copy')}>
														<FaRegCopy className='text-[16px]' />
														Copy Table
													</div>
													<div className='download__menu' onClick={() => exportTable('pdf')}>
														<FaRegFilePdf className="text-[16px]" />
														Download Pdf
													</div>
													<div className='download__menu' onClick={() => exportTable('excel')} >
														<FaRegFileExcel className='text-[16px]' />
														Download Excel
													</div>
												</Popover>}
											>
												<div className='record__download' >
													<IoMdMore />
												</div>
											</Whisper>
										</div>
									)
								}

							</div>
						</div>
					</div>

					{
						!loading ? <div className='content__body__main view'>
							{/* Table start */}
							<div className='overflow-x-auto list__table'>
								<table className='min-w-full bg-white' id='listQuotation' ref={tableRef}>
									<thead className='list__table__head'>
										<tr>
											<th className='py-2 px-4 border-b'>
												<input type='checkbox'
													onChange={selectAll}
													checked={enquiryData.length > 0 && selected.length === enquiryData.length}
												/>
											</th>
											<th align='left'>ENQ No.</th>
											<th align='left'>Party</th>
											<th align='left'>Contact Person</th>
											<th align='left'>Item</th>
											<th align='left'>Delivery Date</th>
											<th>Action</th>
										</tr>
									</thead>
									<tbody>
										{
											enquiryData.map((data, i) => {
												return <tr key={i}>
													<td className='py-2' align='center'>
														<input type='checkbox'
															checked={selected.includes(data._id)}
															onChange={() => handleCheckboxChange(data._id)}
														/>
													</td>
													<td align='left'>{data.enqNo}</td>
													<td align='left'>{data.party?.name}</td>
													<td align='left'>{data.contactPerson?.name}</td>
													<td align='left'>{data.item?.title}</td>
													<td align='left'>{data.deliveryDate?.split("T")[0]}</td>
													<td>
														<Whisper
															placement='leftStart'
															trigger={"click"}
															speaker={<Popover full>
																<div
																	className='table__list__action__icon'
																	onClick={() => navigate(`/admin/enquiry/edit/${data._id}`)}
																>
																	<FaRegEdit className='text-[16px]' />
																	Edit
																</div>
																<div
																	className='table__list__action__icon'
																	onClick={() => navigate(`/admin/quotation-estimate/add`, {
																		state: { ...data }
																	})}
																>
																	<Icons.CONVERT className='text-[16px]' />
																	Convert to Quotation
																</div>
															</Popover>}
														>
															<div className='table__list__action' >
																<FiMoreHorizontal />
															</div>
														</Whisper>
													</td>
												</tr>
											})
										}
									</tbody>
								</table>
								<p className='py-4'>Showing {enquiryData.length} of {totalData} entries</p>
								<Pagination
									activePage={activePage}
									totalData={totalData}
									dataLimit={dataLimit}
									setActivePage={setActivePage}
								/>
								{/* pagination end */}
							</div>
						</div>
							: <DataShimmer />
					}
				</div>
			</main>

		</>
	)
}

export default Enquiry;

