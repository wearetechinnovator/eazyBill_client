import React, { useEffect, useState } from 'react'
import Nav from '../../components/Nav';
import SideNav from '../../components/SideNav';
import useMyToaster from '../../hooks/useMyToaster';
import { SelectPicker } from 'rsuite';
import Cookies from 'js-cookie';
import { useNavigate, useParams } from 'react-router-dom';
import useApi from '../../hooks/useApi';
import MySelect2 from '../../components/MySelect2';
import { Icons } from '../../helper/icons';
import { Constants } from '../../helper/constants';
import Loading from '../../components/Loading'
import { checkNumber } from '../../helper/validation';



const ItemAdd = ({ mode }) => {
	return (
		<>
			<Nav title={mode ? "Update Item " : "Add Item"} />
			<main id='main'>
				<SideNav />
				<div className='content__body'>
					<AddItemComponent mode={mode} />
				</div>
			</main>
		</>
	)
}

const AddItemComponent = ({ mode, save, getRes }) => {
	const token = Cookies.get("token");
	const toast = useMyToaster();
	const { getApiData } = useApi()
	const [form, setForm] = useState({
		title: '', type: Constants.GOODS, salePrice: '', category: '', details: '', hsn: '', tax: '',
		purchasePrice: '', purchaseTaxType: '1', saleTaxType: '1', itemCode: '' //Barcode Number
	})
	const { id } = useParams();
	const [category, setCategory] = useState([])
	const [tax, setTax] = useState([]);
	const [unit, setUnit] = useState([]);
	const [fullCategory, setFullCategory] = useState([]);
	const unitRowSet = {
		unit: "", conversion: '1', opening: '', alert: ''
	}
	const [unitRow, setUnitRow] = useState([unitRowSet]);
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const [isUnitEdit, setIsUnitEdit] = useState(true);


	// Get Item Data
	useEffect(() => {
		if (mode) {
			const get = async () => {
				const url = process.env.REACT_APP_API_URL + "/item/get";
				const req = await fetch(url, {
					method: "POST",
					headers: {
						"Content-Type": 'application/json'
					},
					body: JSON.stringify({ token, id: id })
				})
				const res = await req.json();
				const data = res.data;
				setForm({
					title: data.title, type: data.type, salePrice: data.salePrice,
					category: data.category?._id, details: data.details, hsn: data.hsn,
					tax: data?.tax, purchasePrice: data.purchasePrice, purchaseTaxType: data.purchaseTaxType,
					saleTaxType: data.saleTaxType, itemCode: data.itemCode
				});
				setUnitRow([...data.unit]);
			}

			get();
		}
	}, [mode])

	// Check unit edit or not
	useEffect(() => {
		if (!id) return;
		(async () => {
			try {
				const URL = process.env.REACT_APP_API_URL + "/item/is-unit-edit";
				const req = await fetch(URL, {
					method: "POST",
					headers: {
						"Content-Type": 'application/json'
					},
					body: JSON.stringify({ token, itemId: id })
				})
				const res = await req.json();
				if (req.status !== 200) {
					return toast(res.err, 'error');
				}

				setIsUnitEdit(res.edit);
			} catch (err) {
				return toast("Unit Not check", "error")
			}
		})()
	}, [mode])

	// Get Data
	useEffect(() => {
		const get = async () => {
			// Category
			{
				const { data } = await getApiData("category");
				setCategory([...data.map(({ _id, title }, _) => ({ value: _id, label: title }))]);
				setFullCategory([...data]);
			}
			// Tax
			{
				const { data } = await getApiData("tax");
				setTax([...data.map(({ _id, title }, _) => ({ label: title, value: _id }))])
			}
			// Unit
			{
				const { data } = await getApiData("unit");
				setUnit([...data.map(({ _id, title }, _) => ({ label: title, value: _id }))])
			}
		}
		get()

	}, [])

	const saveData = async (e) => {
		if (form.title === "") {
			return toast("Item name can't be blank", "error")
		}
		else if (form.salePrice === "") {
			return toast("Sale Price can't be blank", "error")
		}

		try {
			setLoading(true);
			const data = {
				...form,token,
				...(mode && { update: true, id }),
				...(isUnitEdit && { unit: unitRow })
			};

			const URL = process.env.REACT_APP_API_URL + "/item/add";
			const req = await fetch(URL, {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify(data)
			})
			const res = await req.json();
			if (req.status !== 200 || res.err) {
				return toast(res.err, 'error');
			}

			if (!mode) clearData();

			// Send Response to MySelect2 Component for auto select item;
			if (getRes)
				getRes(res);

			toast(!mode ? "Item create success" : "Item update success", 'success');

			// for close sidebar in MySelect2
			if (save) {
				save(true)
				return
			} else {
				return navigate("/admin/item")
			}

		} catch (error) {
			return toast("Something went wrong", "error")
		} finally {
			setLoading(false);
		}

	}

	const clearData = () => {
		setForm({
			title: '', type: Constants.GOODS, salePrice: '', category: '', details: '', hsn: '', tax: '',
			purchasePrice: '', purchaseTaxType: '1', saleTaxType: '1', itemCode: '' //Barcode Number
		})
		setUnitRow([unitRowSet]);
	}


	return (
		<div className='content__body__main bg-white'>
			<div className='flex justify-between gap-5 flex-col lg:flex-row'>
				<div className='w-full'>
					<div>
						<p className='mb-1'>Item Name <span className='required__text'>*</span></p>
						<input type='text'
							onChange={(e) => setForm({ ...form, title: e.target.value })}
							value={form.title}
						/>
					</div>

					<div className='w-full flex-col md:flex-row flex items-center gap-2 mt-3'>
						<div className='w-full'>
							<p className='mb-1'>Sale Price</p>
							<input type="text"
								onChange={(e) => setForm({ ...form, salePrice: checkNumber(e.target.value) })}
								value={form.salePrice} />
						</div>
						<div className='w-full mt-[20px]'>
							<SelectPicker
								className='w-full'
								searchable={false}
								data={[
									{ label: "With Tax", value: '1' },
									{ label: "Without Tax", value: '0' }
								]}
								value={form.saleTaxType}
								onChange={(v) => {
									setForm({ ...form, saleTaxType: v })
								}}
							/>
						</div>
					</div>

					<div className='mt-3'>
						<p className='ml-1 mb-1'>GST Tax (%)</p>
						<SelectPicker className='w-full'
							data={tax}
							onChange={(v) => setForm({ ...form, tax: v })}
							value={form.tax} />
					</div>
				</div>
				{/* =================== [First Collumn End] ================ */}

				<div className='w-full'>
					<div className='w-full flex-col md:flex-row flex items-center gap-3'>
						<div className='w-full'>
							<p className='mb-1 ml-1'>Item Type</p>
							<SelectPicker
								className='w-full'
								searchable={false}
								data={[
									{ label: "Goods", value: Constants.GOODS },
									{ label: "Service", value: Constants.SERVICE }
								]}
								value={form.type}
								onChange={(v) => {
									setForm({ ...form, type: v })
								}}
							/>
						</div>
						<div className='w-full'>
							<p className='ml-1 mb-1'>Select Category</p>
							<MySelect2
								model={"category"}
								onType={(v) => {
									setForm({ ...form, category: v })
								}}
								value={form.category}
							/>
						</div>
					</div>

					<div className='w-full flex-col md:flex-row flex items-center gap-3'>
						<div className='w-full'>
							<p className='mt-2 mb-1'>Purchase Price</p>
							<input type="text"
								onChange={(e) => setForm({ ...form, purchasePrice: checkNumber(e.target.value) })}
								value={form.purchasePrice} />
						</div>
						<div className='w-full mt-[28px]'>
							<SelectPicker
								className='w-full'
								searchable={false}
								data={[
									{ label: "With Tax", value: '1' },
									{ label: "Without Tax", value: '0' }
								]}
								value={form.purchaseTaxType}
								onChange={(v) => {
									setForm({ ...form, purchaseTaxType: v })
								}}
							/>
						</div>
					</div>

					<div className='w-full flex-col md:flex-row flex items-center gap-3 mt-3'>
						<div className='w-full'>
							<p className='mb-1 ml-1'>HSN/SAC</p>
							<input type='text'
								onChange={(e) => setForm({ ...form, hsn: e.target.value })}
								value={form.hsn} />
						</div>
						<div className='w-full'>
							<div className='flex items-center justify-between'>
								<p className='mb-1'>Item Code</p>
								<button
									onClick={() => {
										const uniqueNum = Date.now() + Math.floor(Math.random() * 9000 + 1000);
										setForm({ ...form, itemCode: uniqueNum.toString() })
									}}
									className={'text-blue-500 text-xs' + (mode ? 'cursor-not-allowed opacity-50' : ' cursor-pointer')}
									disabled={mode ? true : false}
								>
									Generate Barcode
								</button>
							</div>
							<input type="text"
								className='text-xs bg-gray-100'
								disabled={true}
								placeholder='Barcode Number'
								value={form.itemCode} />
						</div>
					</div>
				</div>
			</div>

			{/* ============================= [UNIT TABLE START =========================] */}

			<div className='w-full overflow-auto mt-4 relative'>
				{!isUnitEdit && <div className='absolute w-full h-full bg-[#ffffff77] rounded cursor-not-allowed'></div>}
				<table className='w-full border'>
					<thead className='bg-gray-200'>
						<tr>
							<th className='p-1'>Unit</th>
							<th>Conversion (1 for 1st Unit)</th>
							<th>Opening</th>
							<th>Alert</th>
							<th align='center'>Action</th>
						</tr>
					</thead>
					<tbody>
						{unitRow.map((u, i) => (
							<tr key={i}>
								<td className='p-1'>
									<select onChange={(e) => {
										const newUnitRow = [...unitRow];
										newUnitRow[i].unit = e.target.value;
										setUnitRow(newUnitRow);
									}} value={u.unit}>
										<option value={""}>Select</option>
										{unit.map((u, i) => (
											<option key={i} value={u.label}>{u.label}</option>
										))}
									</select>
								</td>
								<td className='p-1'>
									<div className='flex items-center'>
										{
											i !== 0 && (
												<p className='text-gray-500 text-xs flex items-center gap-1 mr-2'>
													1 <sub>{unitRow[i - 1].unit}</sub> ✖
												</p>
											)
										}
										<input type="text"
											onChange={i === 0 ? null : (e) => {
												const newUnitRow = [...unitRow];
												newUnitRow[i].conversion = e.target.value;
												setUnitRow(newUnitRow);
											}}
											value={u.conversion}
											disabled={i === 0}
										/>
									</div>
								</td>
								<td className='p-1'>
									<input type="text" onChange={(e) => {
										const newUnitRow = [...unitRow];
										newUnitRow[i].opening = e.target.value;
										setUnitRow(newUnitRow);
									}} value={u.opening} />
								</td>
								<td className='p-1'>
									<input type="text" onChange={(e) => {
										const newUnitRow = [...unitRow];
										newUnitRow[i].alert = e.target.value;
										setUnitRow(newUnitRow);
									}} value={u.alert} />
								</td>
								<td align='center' className='p-1'>
									<div className='delete__icon'>
										<Icons.DELETE
											className='cursor-pointer text-[16px]'
											onClick={() => {
												if (i === 0) return;
												if (unitRow.length === 1) return;
												const newUnitRow = [...unitRow];
												newUnitRow.splice(i, 1);
												setUnitRow(newUnitRow);
											}}
										/>
									</div>
								</td>
							</tr>
						))}
					</tbody>
					<tfoot>
						<tr>
							<td colSpan={5} className='p-1'>
								<button
									className='w-full p-[5px] font-bold bg-gray-200 text-gray-800 flex justify-center items-center active:bg-gray-300 rounded'
									onClick={() => setUnitRow([...unitRow, unitRowSet])}>
									<Icons.ADD_LIST /> Add
								</button>
							</td>
						</tr>
					</tfoot>
				</table>
			</div>
			<div className='flex gap-4 justify-center mt-3'>
				<button onClick={loading ? null : saveData} className='add-bill-btn'>
					{loading ? <Loading /> : <Icons.CHECK />}
					{mode ? "Update" : "Save"}
				</button>
				<button onClick={clearData} className='reset-bill-btn'>
					<Icons.RESET />
					Reset
				</button>
			</div>
		</div>
	)
}


export {
	AddItemComponent
}
export default ItemAdd;