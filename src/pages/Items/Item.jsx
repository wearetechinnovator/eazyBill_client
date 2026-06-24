import React, { useEffect, useMemo, useRef, useState } from 'react'
import Nav from '../../components/Nav';
import SideNav from '../../components/SideNav';
import { useNavigate } from 'react-router-dom';
import useExportTable from '../../hooks/useExportTable';
import useMyToaster from '../../hooks/useMyToaster';
import Cookies from 'js-cookie';
import downloadPdf from '../../helper/downloadPdf';
import DataShimmer from '../../components/DataShimmer';
import { Tooltip } from 'react-tooltip';
import AddNew from '../../components/AddNew';
import { Popover, Whisper } from 'rsuite';
import { Icons } from '../../helper/icons';
import Pagination from '../../components/Pagination';
import ConfirmModal from '../../components/ConfirmModal';
import ContextMenu from '../../components/ContextMenu';
import { toggleBarCodeModal } from '../../store/barcodeModalSlice';
import { useDispatch } from 'react-redux';
import BarCodeModal from '../../components/BarCodeModal';



const DEBOUNCE_TIME = 300;
const Item = ({ mode }) => {
	const toast = useMyToaster();
	const dispatch = useDispatch();
	const { copyTable, downloadExcel, printTable, exportPdf } = useExportTable();
	const [activePage, setActivePage] = useState(1);
	const [dataLimit, setDataLimit] = useState(10);
	const [totalData, setTotalData] = useState()
	const [selected, setSelected] = useState([]);
	const navigate = useNavigate();
	const [tableStatusData, setTableStatusData] = useState('active');
	const [itemData, setItemData] = useState([]);
	const tableRef = useRef(null);
	const [loading, setLoading] = useState(true);
	const [stock, setStock] = useState([]);
	const [currentData, setCurrentData] = useState();
	const exportData = useMemo(() => {
		return itemData && itemData.map((data, i) => {
			let currentItemStock = stock?.find((s, _) => s.itemId == data._id);
			let stockKeys = Object.keys(currentItemStock.stock);
			let stockValues = Object.values(currentItemStock.stock);

			let stockStr = "";
			for (let i = 0; i < stockKeys.length; i++) {
				stockStr += `${stockValues[i]} ${stockKeys[i]} `;
			}
			return {
				"Name": data.title,
				"HSN": data.category?.hsn || data.hsn || "--",
				"Sale Price": data.salePrice,
				"STOCK": stockStr
			}
		});
	}, [itemData]);
	const [openConfirm, setOpenConfirm] = useState(false);
	const [searchText, setSearchText] = useState("");
	let debounceRef = useRef(null);




	// Get data;
	useEffect(() => {
		const getCategory = async () => {
			try {
				setLoading(true);
				const data = {
					token: Cookies.get("token"),
					all: tableStatusData === "all" ? true : false,
					searchText: searchText
				}
				const url = process.env.REACT_APP_API_URL + `/item/get?page=${activePage}&limit=${dataLimit}`;
				const req = await fetch(url, {
					method: "POST",
					headers: {
						"Content-Type": 'application/json'
					},
					body: JSON.stringify(data)
				});
				const res = await req.json();
				setTotalData(res.totalData)
				setItemData([...res.data])
				setStock([...res.stock]);

			} catch (error) {
				console.log(error);
				return toast("Item not get", "error");
			} finally {
				setLoading(false);
			}
		}
		getCategory();
	}, [tableStatusData, dataLimit, activePage, searchText])


	const selectAll = (e) => {
		if (e.target.checked) {
			setSelected(itemData.map((item, _) => item._id));
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
			copyTable("itemTable"); // Pass tableid
		}
		else if (whichType === "excel") {
			downloadExcel(exportData, 'item-list.xlsx') // Pass data and filename
		}
		else if (whichType === "print") {
			printTable(tableRef, "Item List"); // Pass table ref and title
		}
		else if (whichType === "pdf") {
			let document = exportPdf('Item List', exportData);
			downloadPdf(document)
		}
	}


	const removeData = async () => {
		if (selected.length === 0 || tableStatusData !== 'active') {
			return;
		}
		const url = process.env.REACT_APP_API_URL + "/item/delete";
		try {
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
				setItemData((prevData) => {
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
			<Nav title={"Item"} />
			<main id='main'>
				<BarCodeModal data={currentData} />
				<SideNav />
				<Tooltip id='itemTooltip' />
				<ConfirmModal
					openConfirm={openConfirm}
					openStatus={(status) => { setOpenConfirm(status) }}
					title={"Are you sure you want to delete the selected Item?"}
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
					{/* top section */}
					<div className="add_new_compnent">
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
								<div className='flex w-full flex-col lg:w-[300px]'>
									<input type='search'
										placeholder='Search Item Name or HSN Code...'
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
									onClick={() => navigate("/admin/item/add")}
									className='bg-[#003E32] text-white '>
									<Icons.ADD className='text-white' size={15}/>
									Add New
								</button>
								{
									itemData?.length > 0 && (
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
						!loading ? itemData.length > 0 ? <div className='content__body__main view'>
							{/* Table start */}
							<div className='overflow-x-auto list__table'>
								<table className='min-w-full bg-white' id='itemTable' ref={tableRef}>
									<thead className='bg-gray-100 list__table__head'>
										<tr>
											<th className='py-2 px-4 border-b w-[50px]'>
												<input type='checkbox'
													onChange={selectAll}
													checked={itemData.length > 0 && selected.length === itemData.length}
												/>
											</th>
											<th align='left'>Name</th>
											<th align='left'>HSN</th>
											<th align='left'>Sale Price</th>
											<th align='left'>STOCK</th>
											<th className='w-[100px]'>Action</th>
										</tr>
									</thead>
									<tbody>
										{
											itemData.map((data, i) => {
												let currentItemStock = stock?.find((s, _) => s.itemId == data._id);
												let stockKeys = Object.keys(currentItemStock.stock);
												let stockValues = Object.values(currentItemStock.stock);

												// Parse unit/alert configuration
												let unitConfig = data.unit || [];

												let stockStr = "";
												for (let i = 0; i < stockKeys.length; i++) {
													stockStr += `${stockValues[i]} ${stockKeys[i]} `;
												}

												let isOutOfStock = stockValues.every(val => Number(val) < 1);

												// Check if any stock is below alert threshold
												let isBelowAlert = false;
												if (Array.isArray(unitConfig) && unitConfig.length > 0) {
													isBelowAlert = unitConfig.some((config, idx) => {
														console.log(config, idx);
														const alertThreshold = Number(config.alert) || 0;
														const currentStock = Number(stockValues[idx]) || 0;
														return currentStock < alertThreshold && alertThreshold > 0;
													});
												}

												return (
													<tr
														key={i}
														onClick={() => navigate("/admin/item/details/" + data._id)}
														className={`cursor-pointer hover:bg-gray-100 ${isBelowAlert ? 'bg-orange-100 text-orange-700' : ''}`}
													>
														<td className='py-2 max-w-[10px]' align='center'>
															<input
																type='checkbox'
																checked={selected.includes(data._id)}
																onClick={(e) => e.stopPropagation()}
																onChange={() => handleCheckboxChange(data._id)}
															/>
														</td>
														<td>
															{data.title}
															{data.category && (
																<span className="text-[10px] bg-gray-100 rounded w-fit px-[2px] border ms-[5px]">
																	{data.category?.title}
																</span>
															)}
														</td>
														<td>{data.category?.hsn || data.hsn || "--"}</td>
														<td>{data.salePrice || 0.00}</td>
														<td className={`${isOutOfStock ? 'text-orange-600' : ''}`}>{stockStr}</td>

														<td className='px-4 text-center'>
															<Whisper
																placement='leftStart'
																trigger={"click"}
																onClick={(e) => e.stopPropagation()}
																speaker={<Popover full>
																	<div
																		className='table__list__action__icon'
																		onClick={(e) => {
																			e.stopPropagation()
																			navigate("/admin/item/edit/" + data._id)
																		}}
																	>
																		<Icons.EDIT className='text-[16px]' />
																		Edit
																	</div>
																	{data?.itemCode && (
																		<div
																			className='table__list__action__icon'
																			onClick={(e) => {
																				e.stopPropagation()
																				dispatch(toggleBarCodeModal(true));
																				setCurrentData(data);
																			}}
																		>
																			<Icons.BARCODE className='text-[16px]' />
																			View Barcode
																		</div>
																	)}
																</Popover>}
															>
																<div className='table__list__action' >
																	<Icons.HORIZONTAL_MORE />
																</div>
															</Whisper>
														</td>
													</tr>
												)
											})
										}
									</tbody>
								</table>
								<div className='paginate__parent'>
									<p>Showing {itemData.length} of {totalData} entries</p>
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
							: <AddNew title={"Item"} link={"/admin/item/add"} />
							: <DataShimmer />
					}
				</div>
			</main>
		</>
	)
}

export default Item