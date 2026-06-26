import React, { useEffect, useMemo, useRef, useState } from 'react'
import Nav from '../../components/Nav';
import SideNav from '../../components/SideNav';
import { Popover, Whisper } from 'rsuite';
import { useNavigate } from 'react-router-dom';
import useExportTable from '../../hooks/useExportTable';
import useMyToaster from '../../hooks/useMyToaster';
import Cookies from 'js-cookie';
import downloadPdf from '../../helper/downloadPdf';
import DataShimmer from '../../components/DataShimmer';
import { Tooltip } from 'react-tooltip';
import AddNew from '../../components/AddNew';
import { Icons } from '../../helper/icons';
import Pagination from '../../components/Pagination';
import ConfirmModal from '../../components/ConfirmModal';
import ContextMenu from '../../components/ContextMenu';



const DEBOUNCE_TIME = 300;
const Category = () => {
	const token = Cookies.get("token");
	const toast = useMyToaster();
	const { copyTable, downloadExcel, printTable, exportPdf } = useExportTable();
	const [activePage, setActivePage] = useState(1);
	const [dataLimit, setDataLimit] = useState(10);
	const [totalData, setTotalData] = useState()
	const [selected, setSelected] = useState([]);
	const navigate = useNavigate();
	const [tableStatusData, setTableStatusData] = useState('active');
	const [categoryData, setCategoryData] = useState([]);
	const tableRef = useRef(null);
	const exportData = useMemo(() => {
		return categoryData && categoryData.map(({ title, hsn }, _) => ({
			Title: title,
			HSN: hsn
		}));
	}, [categoryData]);
	const [loading, setLoading] = useState(true);
	const [openConfirm, setOpenConfirm] = useState(false);
	const [searchText, setSearchText] = useState("");
	let debounceRef = useRef(null);



	// Get data;
	useEffect(() => {
		const getCategory = async () => {
			try {
				const data = {
					token,
					all: tableStatusData === "all" ? true : false,
					searchText: searchText
				}
				const url = process.env.REACT_APP_API_URL + `/category/get?page=${activePage}&limit=${dataLimit}`;
				const req = await fetch(url, {
					method: "POST",
					headers: {
						"Content-Type": 'application/json'
					},
					body: JSON.stringify(data)
				});
				const res = await req.json();
				setTotalData(res.totalData)
				setCategoryData([...res.data]);
				setLoading(false);

			} catch (error) {
				console.log(error)
				return toast("Item category not get", "error");
			}
		}
		getCategory();
	}, [tableStatusData, dataLimit, activePage, searchText])


	const searchTable = (e) => {
		const value = e.target.value.toLowerCase();
		const rows = document.querySelectorAll('.list__table tbody tr');

		rows.forEach(row => {
			const cols = row.querySelectorAll('td');
			let found = false;
			cols.forEach((col, index) => {
				if (index !== 0 && col.innerHTML.toLowerCase().includes(value)) {
					found = true;
				}
			});
			if (found) {
				row.style.display = "";
			} else {
				row.style.display = "none";
			}
		});
	}


	const selectAll = (e) => {
		if (e.target.checked) {
			setSelected(categoryData.map((category, _) => category._id));
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
			copyTable("categoryTable"); // Pass tableid
		}
		else if (whichType === "excel") {
			downloadExcel(exportData, 'category-list.xlsx') // Pass data and filename
		}
		else if (whichType === "print") {
			printTable(tableRef, "Category List"); // Pass table ref and title
		}
		else if (whichType === "pdf") {
			let document = exportPdf('Category List', exportData);
			downloadPdf(document)
		}
	}


	const removeData = async () => {
		if (selected.length === 0 || tableStatusData !== 'active') {
			return;
		}
		const url = process.env.REACT_APP_API_URL + "/category/delete";
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
				setCategoryData((prevData) => {
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


	const restoreData = async () => {
		if (selected.length === 0 || tableStatusData !== "trash") {
			return;
		}

		const url = process.env.REACT_APP_API_URL + "/category/restore";
		try {
			const req = await fetch(url, {
				method: "POST",
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
				setCategoryData((prevData) => {
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
			<Nav title={"Item Category"} />
			<main id='main'>
				<SideNav />
				<Tooltip id='categoryTooltip' />
				<ConfirmModal
					openConfirm={openConfirm}
					openStatus={(status) => { setOpenConfirm(status) }}
					title={"Are you sure you want to delete the selected Categories?"}
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
								<div className='flex w-full flex-col lg:w-[300px]'>
									<input type='text'
										placeholder='Search...'
										onChange={searchData}
										className='p-[6px]'
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
									onClick={() => navigate("/admin/item-category/add")}
									className='bg-[#003E32] text-white '>
									<Icons.ADD className='text-white' size={15}/>
									Add New
								</button>
								{
									categoryData?.length > 0 && (
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

						<div id='itemFilter'>
						</div>
					</div>

					{
						!loading > 0 ? categoryData.length > 0 ? <div className='content__body__main view'>
							{/* First Row */}

							{/* Table start */}
							<div className='overflow-x-auto list__table'>
								<table className='min-w-full bg-white' id='categoryTable' ref={tableRef}>
									<thead className='list__table__head'>
										<tr>
											<th className='py-2 px-4 border-b w-[50px]'>
												<input type='checkbox' onChange={selectAll} checked={categoryData.length > 0 && selected.length === categoryData.length} />
											</th>
											<td className='py-2 px-4 border-b'>Title</td>
											<th className='py-2 px-4 border-b'>HSN/SAC</th>
											<th className='py-2 px-4 border-b w-[100px]'>Action</th>
										</tr>
									</thead>
									<tbody>
										{
											categoryData.map((data, i) => {
												return <tr key={i} onClick={() => navigate(`/admin/item-category/details/${data._id}`)} className='cursor-pointer hover:bg-gray-100'>
													<td className='py-2 px-4 border-b max-w-[10px]'>
														<input type='checkbox'
															checked={selected.includes(data._id)}
															onChange={() => handleCheckboxChange(data._id)}
															onClick={(e) => e.stopPropagation()}
														/>
													</td>
													<td className='px-4 border-b'>{data.title}</td>
													<td className='px-4 border-b' align='center'>{data.hsn}</td>
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
																		navigate(`/admin/item-category/edit/${data._id}`)
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
											})
										}
									</tbody>
								</table>
								<div className='paginate__parent'>
									<p>Showing {categoryData.length} of {totalData} entries</p>
									{/* ----- Paginatin ----- */}
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
							: <AddNew title={"Category"} link={"/admin/item-category/add"} />
							: <DataShimmer />
					}
				</div>
			</main>
		</>
	)
}

export default Category