import React, { useCallback, useEffect, useState } from 'react';
import { SelectPicker, Button } from 'rsuite';
import Nav from '../../components/Nav';
import SideNav from '../../components/SideNav';
import { RiDeleteBin6Line } from "react-icons/ri";
import { MdCurrencyRupee } from "react-icons/md";
import { MdOutlinePlaylistAdd } from "react-icons/md";
import useMyToaster from '../../hooks/useMyToaster';
import useApi from '../../hooks/useApi';
import useBillPrefix from '../../hooks/useBillPrefix';
import Cookies from 'js-cookie';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import swal from 'sweetalert';
import AddPartyModal from '../../components/AddPartyModal';
import AddItemModal from '../../components/AddItemModal';
import MySelect2 from '../../components/MySelect2';
import { Icons } from '../../helper/icons';
import useFormHandle from '../../hooks/useFormHandle';
import { Constants } from '../../helper/constants';
import Loading from '../../components/Loading';




const PurchaseInvoice = ({ mode }) => {
	const token = Cookies.get("token");
	const toast = useMyToaster();
	const { id } = useParams()
	const [loading, setLoading] = useState(false);
	const getBillPrefix = useBillPrefix("purchaseInvoice");
	const { getApiData } = useApi();
	const getPartyModalState = useSelector((store) => store.partyModalSlice.show);
	const getItemModalState = useSelector((store) => store.itemModalSlice.show);
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const itemRowSet = {
		rowItem: 1, itemName: '', description: '', hsn: '', qun: '1', remainingQun: 1, itemId: '',
		unit: [], selectedUnit: "", price: '', discountPerAmount: '', discountPerPercentage: '',
		tax: '', taxAmount: '', amount: '', perDiscountType: "", //for checking purpose only
		expireDate: '', id: '', 
	}
	const additionalRowSet = {
		additionalRowsItem: 1, particular: '', amount: ''
	}
	const [ItemRows, setItemRows] = useState([itemRowSet]);
	const [additionalRows, setAdditionalRow] = useState([additionalRowSet]); //{ additionalRowsItem: 1 }
	const [formData, setFormData] = useState({
		party: '', purchaseInvoiceNumber: '', originalInvoiceNumber: '', invoiceDate: new Date().toISOString().split('T')[0],
		validDate: '', items: ItemRows, additionalCharge: additionalRows, note: '', terms: ``, discountType: '',
		discountAmount: '', discountPercentage: '', paymentStatus: false, paymentType: Constants.CASH,
		paymentAccount: '', paymentAmount: '', autoRoundOff: false, roundOffType: '0', roundOffAmount: '',
		finalAmount: ''
	})

	const [perPrice, setPerPrice] = useState(null);
	const [perTax, setPerTax] = useState(null);
	const [perDiscount, setPerDiscount] = useState(null);
	const [perQun, setPerQun] = useState(null)

	// When change discount type;
	const [discountToggler, setDiscountToggler] = useState(true);

	// Store all items without filter
	const [items, setItems] = useState([]);
	const [unit, setUnit] = useState([]);
	const [tax, setTax] = useState([]);
	const [party, setParty] = useState([]);
	const [account, setAccount] = useState([])


	// store label and value pair for dropdown
	const [itemData, setItemData] = useState([])
	const [taxData, setTaxData] = useState([]);


	// Form hook
	const {
		onItemChange, addItem, deleteItem, changeDiscountType,
		calculateFinalAmount, onPerDiscountAmountChange,
		onPerDiscountPercentageChange, calculatePerTaxAmount,
		calculatePerAmount, onDiscountAmountChange
	} = useFormHandle();




	// Get data for update mode
	useEffect(() => {
		if (id) {
			const get = async () => {
				try {
					let url;
					if (mode === 'edit' || !mode) {
						url = `${process.env.REACT_APP_API_URL}${"/purchaseinvoice/get"}`
					}
					else if (mode === "convert") {
						url = `${process.env.REACT_APP_API_URL}${"/po/get"}`
					}

					const req = await fetch(url, {
						method: "POST",
						headers: {
							"Content-Type": 'application/json'
						},
						body: JSON.stringify({ token, id: id })
					})
					const res = await req.json();
					setFormData({
						...formData, ...res.data,
						invoiceDate: res.data?.invoiceDate.split("T")[0],
						validDate: res.data?.validDate?.split("T")[0]
					});
					setAdditionalRow([...res.data.additionalCharge])

					setItemRows(res.data.items.map(item => ({
						...itemRowSet,
						...item,
						expireDate: item.expireDate?.split("T")[0] || ""
					})))


					if (res.data.discountType != "no") {
						setDiscountToggler(false);
					}
				} catch (error) {
					return toast("Something went wrong for get data", 'error')
				}
			}

			get();
		}
	}, [id])


	useEffect(() => {
		if (getBillPrefix && (mode === "convert" || !mode)) {
			setFormData(prev => {
				// Only set if field is currently empty (initial state)
				if (prev.purchaseInvoiceNumber) return prev;

				const prefix0 = getBillPrefix[0] ?? "";
				const prefix1 = getBillPrefix[1] ?? "";
				const newPrefix = prefix0 + prefix1;

				return {
					...prev,
					purchaseInvoiceNumber: newPrefix || "1"
				};
			});
		}
	}, [getBillPrefix, mode]);


	// Get all data from api
	useEffect(() => {
		const apiData = async () => {
			{
				const data = await getApiData("item");
				setItems([...data.data]);

				const newItemData = data.data.map(d => ({ label: d.title, value: d.title }));
				setItemData(newItemData);
			}
			{
				const data = await getApiData("unit");
				const unit = data.data.map(d => ({ label: d.title, value: d.title }));
				setUnit([...unit]);
			}
			{
				const data = await getApiData("tax");
				const tax = data.data.map(d => ({ label: d.title, value: d.gst }));
				setTax([...data.data]);
				setTaxData([...tax]);
			}
			{
				const data = await getApiData("party");
				const party = data.data.map(d => ({ label: d.name, value: d._id }));
				setParty([...party]);
			}
			{
				const data = await getApiData("account")
				setAccount([...data.data])
			}
		}

		apiData();

	}, [])

	// When `discount type is before` and apply discount this useEffect run;
	useEffect(() => {
		if (formData.discountType === "before" && ItemRows.length > 0) {
			setItemRows(prevItems =>
				prevItems.map(i => {
					const percentage = ((parseFloat(formData.discountAmount || 0) / parseFloat(i.price || 0) * 100)).toFixed(2);
					const amount = (parseFloat(formData.discountAmount || 0) / parseFloat(prevItems.length)).toFixed(2);
					return {
						...i,
						discountPerPercentage: percentage,
						discountPerAmount: amount,
					}
				})
			);
		}
	}, [formData.discountAmount, ItemRows.length]);


	// Return Sub-Total
	/*
	  Total Discount.
	  Total Tax.
	  Total Amount.
	*/
	const subTotal = useCallback(() => {
		const subTotal = (which) => {
			let total = 0;

			ItemRows.forEach((item, index) => {
				if (which === "discount") {
					if (item.discountPerAmount) {
						total = (parseFloat(total) + parseFloat(item.discountPerAmount)).toFixed(2)
					}
				}
				else if (which === "tax") {
					total = (parseFloat(total) + parseFloat(calculatePerTaxAmount(index, ItemRows))).toFixed(2);
				}
				else if (which === "amount") {
					total = (parseFloat(total) + parseFloat(calculatePerAmount(index, ItemRows))).toFixed(2);
				}
			})

			return !isNaN(total) ? total : 0.00;

		}
		return subTotal;
	}, [ItemRows, perPrice, perTax, perDiscount, perQun])


	useEffect(() => {
		const finalAmount = calculateFinalAmount(
			additionalRows, formData, subTotal,
			formData.autoRoundOff,
			formData.roundOffAmount,
			formData.roundOffType
		);
		setFormData((prevData) => ({
			...prevData,
			finalAmount
		}));
	}, [ItemRows, additionalRows, formData.autoRoundOff, formData.roundOffAmount, formData.roundOffType, formData.discountAmount, formData.discountType]);



	// *Save bill
	const saveBill = async () => {
		if (formData.party === "")
			return toast("Please select party", "error")
		else if (formData.purchaseInvoiceNumber === "")
			return toast("Please enter purchase invoice number", "error")
		else if (formData.invoiceDate === "")
			return toast("Please select invoice date", "error")


		for (let row of ItemRows) {
			if (row.itemName === "") {
				return toast("Please select item", "error")
			} else if (row.qun === "") {
				return toast("Please enter quantity", "error")
			} else if (row.unit === "") {
				return toast("Please select unit", "error")
			} else if (row.price === "") {
				return toast("Please enter price", "error")
			}

		}

		// Add Per Item Tax and Amound before save
		ItemRows.forEach((row, index) => {
			row.taxAmount = calculatePerTaxAmount(index, ItemRows);
			row.amount = calculatePerAmount(index, ItemRows);
		});
		setItemRows([...ItemRows]);

		try {
			setLoading(true);
			const url = process.env.REACT_APP_API_URL + "/purchaseinvoice/add";
			const token = Cookies.get("token");

			const req = await fetch(url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify(!mode || mode !== "edit" ?
					{ ...formData, items: ItemRows, token } :
					{ ...formData, items: ItemRows, token, update: true, id: id }
				)
			})
			const res = await req.json();
			if (req.status !== 200 || res.err) {
				return toast(res.err, 'error');
			}

			if (mode === "edit") {
				return toast('Invoice update successfully', 'success');
			}

			clearForm();

			toast('Invoice add successfully', 'success');
			navigate("/admin/purchase-invoice");
			return

		} catch (error) {
			return toast('Something went wrong', 'error')
		} finally {
			setLoading(false);
		}

	}


	// *Clear form values;
	const clearForm = () => {
		setItemRows([itemRowSet]);
		setAdditionalRow([additionalRowSet])
		setFormData({
			party: '', purchaseInvoiceNumber: getBillPrefix, invoiceDate: '', validDate: '', items: ItemRows,
			additionalCharge: additionalRows, note: '', terms: '', paymentStatus: '',
			discountType: '', discountAmount: '', discountPercentage: '', originalInvoiceNumber: ''
		});

	}


	return (
		<>
			<Nav title={mode == "edit" ? "Update Purchase Invoice" : "Add Purchase Invoice"} />
			<main id='main'>
				<SideNav />
				<AddPartyModal open={getPartyModalState} />
				<AddItemModal open={getItemModalState} />

				<div className='content__body'>
					<div className='content__body__main bg-white' id='addQuotationTable'>
						<div className='flex flex-col lg:flex-row items-center justify-around gap-4'>
							<div className='flex flex-col gap-2 w-full'>
								<p className='text-xs'>
									Select Party <span className='required__text'>*</span>
								</p>
								<MySelect2
									model={"party"}
									partyType={"supplier"}
									onType={(v) => {
										setFormData({ ...formData, party: v })
									}}
									value={formData.party?._id}
								/>
							</div>
							<div className='flex flex-col gap-2 w-full lg:w-1/2'>
								<p className='text-xs'>Purchase Invoice Number <span className='required__text'>*</span></p>
								<input type="text"
									onChange={(e) => setFormData({ ...formData, purchaseInvoiceNumber: e.target.value })}
									value={formData.purchaseInvoiceNumber}
								/>
							</div>
							<div className='flex flex-col gap-2 w-full lg:w-1/2'>
								<p className='text-xs'>Original Invoice Number <span className='required__text'>*</span></p>
								<input type="text"
									onChange={(e) => setFormData({ ...formData, originalInvoiceNumber: e.target.value })}
									value={formData.originalInvoiceNumber}
								/>
							</div>
							<div className='flex flex-col gap-2 w-full lg:w-1/2'>
								<p className='text-xs'>Invoice Date <span className='required__text'>*</span></p>
								<input type="date"
									className='text-xs'
									onChange={(e) => {
										setFormData({ ...formData, invoiceDate: e.target.value })
									}}
									value={formData.invoiceDate}
								/>
							</div>
							<div className='flex flex-col gap-2 w-full lg:w-1/2'>
								<p className='text-xs'>Due Date</p>
								<input type="date"
									className='text-xs'
									onChange={(e) => {
										setFormData({ ...formData, validDate: e.target.value })
									}}
									value={formData.validDate}
								/>
							</div>
						</div>

						<div className='overflow-x-auto rounded'>
							<table className='add__table min-w-full table-style'>
								<thead >
									<tr>
										<th style={{ "width": "*" }}>Item</th>
										<th style={{ "width": "5%" }}>Expiry Date</th>
										<th style={{ "width": "5%" }}>HSN/SAC</th>
										<th style={{ "width": "5%" }}>QTY</th>
										<th style={{ "width": "5%" }}>Unit</th>
										<th style={{ "width": "5%" }}>Price/Item</th>
										<th style={{ "width": "7%" }}>Discount</th>
										<th style={{ "width": "8%" }}>Tax</th>
										<th style={{ "width": "7%" }}>Amount</th>
										<th style={{ "width": "3%" }}></th>
									</tr>
								</thead>
								<tbody>
									{ItemRows.map((i, index) => (
										<tr key={i.rowItem} className='border-b'>

											{/* Item name and description */}
											<td>
												<div className='flex flex-col gap-2'>
													<MySelect2
														model={"item"}
														onType={(v) => {
															if (v === ItemRows[index].itemId) return;
															onItemChange(v, index, tax, ItemRows, setItemRows, setItems);
														}}
														value={ItemRows[index]?.itemId}
													/>
													<input type='text' className='input-style' placeholder='Description'
														onChange={(e) => {
															let item = [...ItemRows];
															item[index].description = e.target.value;
															setItemRows(item);
														}}
														value={ItemRows[index].description}
													/>
												</div>
											</td>
											<td>
												<input type="date" className=''
													onChange={(e) => {
														let date = e.target.value;
														let item = [...ItemRows];
														item[index].expireDate = date;
														setItemRows(item);
													}}
													value={ItemRows[index].expireDate}
												/>
											</td>
											<td>
												<input type='text' className=' input-style'
													onChange={(e) => {
														let item = [...ItemRows];
														item[index].hsn = e.target.value;
														setItemRows(item);
													}}
													value={ItemRows[index].hsn}
												/>
											</td>
											<td>
												<input type='text' className='input-style'
													onChange={(e) => {
														let item = [...ItemRows];
														item[index].qun = e.target.value;
														item[index].remainingQun = e.target.value;
														setItemRows(item);
														setPerQun(e.target.value);
														if (formData.discountType !== "before") {
														}
														onPerDiscountPercentageChange(formData.items[index].discountPerPercentage, index, ItemRows, setItemRows, formData);
														onPerDiscountAmountChange(formData.items[index].discountPerAmount, index, ItemRows, setItemRows, formData);
													}}
													value={ItemRows[index].qun}
												/>
											</td>
											<td>
												<select className='input-style'
													onChange={(e) => {
														let item = [...ItemRows];
														item[index].selectedUnit = e.target.value;
														setItemRows(item);
													}}
													value={ItemRows[index].selectedUnit}
												>
													{
														ItemRows[index].unit.map((u, _) => {
															return <option key={_} value={u}>{u}</option>
														})
													}
												</select>
											</td>
											<td align='center'>
												<div>
													<input type='text' className='input-style'
														onChange={(e) => {
															let item = [...ItemRows];
															item[index].price = e.target.value;
															setItemRows(item);
															setPerPrice(e.target.value);
															if (formData.discountType !== "before") {
															}
															onPerDiscountPercentageChange(formData.items[index].discountPerPercentage, index, ItemRows, setItemRows, formData);
															onPerDiscountAmountChange(formData.items[index].discountPerAmount, index, ItemRows, setItemRows, formData);
														}}
														value={ItemRows[index].price}
													/>
												</div>
											</td>
											<td> {/** Discount amount and percentage */}
												<div className={`w-full flex flex-col gap-2 items-center`} >
													<div className='add-table-discount-input'>
														<input type="text"
															className={`${formData.discountType === 'before' ? 'bg-gray-100' : ''} `}
															onChange={formData.discountType !== 'before' ? (e) => {
																let form = { ...formData };
																form.items[index].perDiscountType = 'amount';
																setFormData({ ...form });
																onPerDiscountAmountChange(e.target.value, index, ItemRows, setItemRows, formData)
															} : null}
															value={ItemRows[index].discountPerAmount}
														// value={calculatePerDiscountAmount(index)}
														/>
														<div><MdCurrencyRupee /></div>
													</div>
													<div className='add-table-discount-input' >
														<input type="text"
															className={`${formData.discountType === 'before' ? 'bg-gray-100' : ''} `}
															onChange={formData.discountType !== 'before' ? (e) => {
																let form = { ...formData };
																form.items[index].perDiscountType = 'percentage';
																setFormData({ ...form });
																onPerDiscountPercentageChange(e.target.value, index, ItemRows, setItemRows, formData)
															} : null}
															value={ItemRows[index].discountPerPercentage}
														// value={calculatePerDiscountPercentage(index)}
														/>
														<div>%</div>
													</div>
												</div>
											</td>
											<td> {/** Tax and Taxamount */}
												<div className='flex flex-col gap-2'>
													<SelectPicker
														onChange={(v) => {
															let item = [...ItemRows];
															item[index].tax = v;
															setItemRows(item);
															setPerTax('')
														}}
														value={ItemRows[index].tax}
														data={taxData}
													/>
													<input type="text"
														onChange={(e) => {
															let item = [...ItemRows];
															item[index].taxAmount = e.target.value;
															setItemRows(item);
														}}
														value={calculatePerTaxAmount(index, ItemRows)}
													/>
												</div>
											</td>
											<td align='center'>
												<div>
													<input type="text"
														value={calculatePerAmount(index, ItemRows)}
														className='bg-gray-100 custom-disabled'
														disabled
													/>
												</div>
											</td>
											<td align='center' className='w-[20px]'>
												<RiDeleteBin6Line
													className='cursor-pointer text-[16px]'
													onClick={() => ItemRows.length > 1 && deleteItem(1, index, setItemRows, setFormData, setAdditionalRow)}
												/>
											</td>
										</tr>
									))}
								</tbody>
								<tfoot>
									<tr>
										<td colSpan={9}>
											<Button color='blue' className='float-right w-full font-bold' onClick={
												() => addItem(1, itemRowSet, setItemRows, setFormData, additionalRowSet, setAdditionalRow)}>
												<MdOutlinePlaylistAdd className='text-lg mr-1' />
												Add Item
											</Button>
										</td>
									</tr>
									<tr>
										<td colSpan={5} align='right'>
											<p className='py-2 font-bold'>Sub-Total</p>
										</td>
										<td>{subTotal()('discount')}</td>
										<td>{subTotal()('tax')}</td>
										<td>{subTotal()('amount')}</td>
									</tr>
								</tfoot>
							</table>
						</div>
						{/* --------- Tax amount table ------- */}
						<div className='overflow-x-auto rounded' id='taxAmountTable'>
							<table className='table-style w-full'>
								<thead>
									<tr>
										<th className='font-bold'>Total Taxable Amount</th>
										<th className='font-bold'>Total Tax Amount</th>
										<th>
											<span className='font-bold mr-1'>Discount Type</span>
											<span>(Additional)</span>
										</th>
										<th>
											<span className='font-bold mr-1'>Discount Amount</span>
											<span>(Additional)</span>
										</th>
										<th>
											<span className='font-bold mr-1'>Discount Percentage</span>
											<span>(Additional)</span>
										</th>
										<th className='font-bold'>Total Amount</th>
									</tr>
								</thead>
								<tbody>
									<tr>
										<td className='min-w-[150px]'>
											<input type="text" name="total_taxable_amount"
												value={(subTotal()('amount') - subTotal()('tax')).toFixed(2)}
												className='bg-gray-100 custom-disabled'
												disabled
											/>
										</td>
										<td className='min-w-[150px]'>
											<input type="text" name='total_tax_amount'
												value={subTotal()('tax')}
												className='bg-gray-100 custom-disabled'
												disabled
											/>
										</td>
										<td className='min-w-[180px]'>
											<select name="discount_type" value={formData.discountType} onChange={(e) => {
												changeDiscountType(e, ItemRows, formData, setFormData, setDiscountToggler, toast)
											}}>
												<option value="no">No Discount</option>
												<option value="before">Before Tax</option>
												<option value="after">After Tax</option>
											</select>
										</td>

										<td className='min-w-[180px]'>
											<div className='add-table-discount-input' >
												<input
													id='discountAmount'
													type="text"
													className={`${discountToggler ? 'bg-gray-100 custom-disabled' : ''}`}
													disabled={discountToggler ? true : false}
													onChange={(e) => discountToggler ? null : onDiscountAmountChange(e, discountToggler, formData, setFormData, subTotal)}
													value={formData.discountAmount}
												/>
												<div><MdCurrencyRupee /></div>
											</div>
										</td>
										<td className='min-w-[200px]'>
											<div className='add-table-discount-input'>
												<input
													type="text"
													id='discountPercentage'
													className={`${discountToggler ? 'bg-gray-100 custom-disabled' : ''}`}
													disabled={discountToggler ? true : false}
													onChange={discountToggler ? null : (e) => {
														let amount = ((subTotal()('amount') / 100) * e.target.value).toFixed(2);
														setFormData({
															...formData, discountPercentage: e.target.value, discountAmount: amount,
														})

														if (formData.discountType === "before") {
															let items = [...ItemRows];
															items.forEach((i, _) => {
																// i.discountPerAmount = amount / parseFloat(items.length);
																i.discountPerPercentage = e.target.value;
															})

															setItemRows([...items]);
														}
													}}
													value={formData.discountPercentage}
												/>
												<div>%</div>
											</div>
										</td>
										<td className='min-w-[150px]'>
											<input type="text" name="total_amount"
												className='bg-gray-100 custom-disabled'
												disabled
												value={subTotal()('amount')}
											/>
										</td>
									</tr>
								</tbody>
							</table>
						</div>
						{/* ------- Note and Additional charges ------- */}
						<div className='w-full flex flex-col lg:flex-row justify-between gap-4 mt-3'>
							<div className='flex flex-col w-full gap-3'>
								<div>
									<p>Note: </p>
									<textarea
										onChange={(e) => setFormData({ ...formData, note: e.target.value })}
										value={formData.note}
									></textarea>
								</div>
								<div>
									<p>Terms & Conditions:</p>
									<textarea
										rows={10}
										onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
										value={formData.terms}
									></textarea>
								</div>
							</div>
							<div className='w-full'>
								<div className='uppercase font-bold border border-dashed p-2 rounded'>
									Additional Charges
								</div>
								<div className='overflow-x-auto rounded mt-3' id='addtionalChargeTable'>
									<table className='table-style w-full'>
										<thead className='bg-gray-100'>
											<tr>
												<th>Particular</th>
												<th>Amount</th>
												<th>Actions</th>
											</tr>
										</thead>
										<tbody>
											{
												additionalRows.map((i, index) => (
													<tr key={i.additionalRowsItem}>
														<td>
															<input type="text"
																onChange={(e) => {
																	let item = [...additionalRows];
																	item[index].particular = e.target.value;
																	setAdditionalRow(item);
																}}
																value={additionalRows[index].particular}
															/>
														</td>
														<td>
															<input type="text"
																onChange={(e) => {
																	let item = [...additionalRows];
																	item[index].amount = e.target.value;
																	setAdditionalRow(item);
																}}
																value={additionalRows[index].amount}
															/>
														</td>
														<td align='center'>
															<RiDeleteBin6Line
																className='cursor-pointer text-lg'
																onClick={() => deleteItem(2, index, setItemRows, setFormData, setAdditionalRow)}
															/>
														</td>
													</tr>
												))
											}
										</tbody>
										<tfoot>
											<tr>
												<td colSpan={3}>
													<Button color='blue' className='float-right w-full font-bold' onClick={() => addItem(2, itemRowSet, setItemRows, setFormData, additionalRowSet, setAdditionalRow)}>
														<MdOutlinePlaylistAdd className='text-lg mr-1' />
														Add Item
													</Button>
												</td>
											</tr>
										</tfoot>
									</table>
								</div>

								{/*======================[Round Off Section]============= */}
								<div className='round__off__section'>
									<div className='check__box__parent'>
										<input type="checkbox"
											onChange={(e) => setFormData({
												...formData, autoRoundOff: e.target.checked
											})}
											checked={formData.autoRoundOff}
										/>
										<p>Auto Round Off</p>
									</div>

									{!formData.autoRoundOff && (
										<div className='round__of__input__parent'>
											<button
												onClick={() => {
													setFormData({ ...formData, roundOffType: '1' })
												}}
												className={`roundoff__btn ${formData.roundOffType === "1" ? 'active' : ''}`}
											>
												Add <span>(+)</span>
											</button>
											<Icons.RUPES />
											<input type="text"
												value={formData.roundOffAmount}
												onChange={(e) => setFormData({ ...formData, roundOffAmount: e.target.value })}
											/>
											<button
												onClick={() => {
													setFormData({ ...formData, roundOffType: '0' })
												}}
												className={`roundoff__btn ${formData.roundOffType === "0" ? 'active' : ''}`}
											>
												Reduce <span>(-)</span>
											</button>
										</div>
									)}
								</div>

								{/* ======================[Payment Section]===================== */}
								<div className='bill___payment__section'>
									<div className='label__checkbox'>
										<label htmlFor="fullPayment">Mark as full paid</label>
										<input type="checkbox"
											id='fullPayment'
											onChange={(e) => {
												const checked = e.target.checked;

												setFormData(prev => ({
													...prev,
													paymentStatus: checked,
													paymentAmount: checked ? prev.finalAmount : ''
												}));
											}}
											checked={formData.paymentStatus}
										/>
									</div>
									<div className='amount__input'>
										<p>Amount Paid</p>
										<div className='amount__and__select'>
											<Icons.RUPES />
											<input type="text"
												disabled={formData.paymentStatus}
												onChange={(e) => {
													setFormData({ ...formData, paymentAmount: e.target.value })
												}}
												value={formData.paymentAmount}
											/>
											<select
												onChange={(e) => {
													setFormData({ ...formData, paymentType: e.target.value })
												}}
												value={formData.paymentType}
											>
												<option value={Constants.CASH}>Cash</option>
												<option value={Constants.UPI}>UPI</option>
												<option value={Constants.CARD}>Card</option>
												<option value={Constants.NETBENKING}>Netbenking</option>
												<option value={Constants.BANK}>Bank</option>
												<option value={Constants.CHEQUE}>Cheque</option>
											</select>
										</div>
									</div>
									{
										formData.paymentType !== Constants.CASH && (
											<div className='payment__from'>
												<p>Payment Made From</p>
												<select
													onChange={(e) => {
														setFormData({ ...formData, paymentAccount: e.target.value })
													}}
													value={formData.paymentAccount}
												>
													<option value="">Select</option>
													{
														account.map((a, _) => {
															return <option value={a._id} key={_}>{a.accountName}</option>
														})
													}
												</select>
											</div>
										)
									}
								</div>

								<p className='font-bold mt-4 mb-2'>Final Amount</p>
								<input type="text" name="final_amount"
									value={formData.finalAmount}
									className='bg-gray-100 custom-disabled w-full'
									disabled
								/>
							</div>
						</div>
					</div>{/* Content Body Main Close */}

					<div className='form-btn-bar'>
						<button
							onClick={loading ? null : saveBill}
							className='add-bill-btn'>
							{loading ? <Loading /> : <Icons.CHECK />}
							{!mode || mode === "convert" ? "Save" : "Update"}
						</button>
						<button className='reset-bill-btn' onClick={clearForm}>
							<Icons.RESET />
							Reset
						</button>
					</div>
				</div>{/* Content Body Close */}
			</main>
		</>
	)
}

export default PurchaseInvoice;
