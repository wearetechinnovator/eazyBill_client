import SideNav from '../../components/SideNav'
import { SelectPicker } from 'rsuite';
import { MdUploadFile } from "react-icons/md";
import { LuFileX2 } from "react-icons/lu";
import { countryList, statesAndUTs } from '../../helper/data';
import { FaRegCheckCircle } from 'react-icons/fa';
import { BiReset } from 'react-icons/bi';
import { useState } from 'react';
import checkfile from '../../helper/checkfile'
import useMyToaster from '../../hooks/useMyToaster';
import Nav from '../../components/Nav';
import Cookies from 'js-cookie';
import { useDispatch } from 'react-redux';
import { addCompany } from '../../store/userDetailSlice';
import { Icons } from '../../helper/icons';
import Loading from '../../components/Loading';
import { checkNumber } from '../../helper/validation';


const AddCompany = () => {
	const toast = useMyToaster();
	const dispatch = useDispatch()
	const [loading, setLoading] = useState(false);
	const [companyData, setCompanyData] = useState({
		name: '', phone: '', email: '', gst: '', pan: '', invoiceLogo: '', signature: '',
		address: '', country: '', state: '', poInitial: '', invoiceInitial: '',
		proformaInitial: '', poNextCount: '', invoiceNextCount: '', proformaNextCount: '',
		salesReminder: '', purchaseReminder: '', quotationInitial: '', creditNoteInitial: '',
		deliverChalanInitial: '', salesReturnInitial: '', quotationCount: '', creditNoteCount: '',
		salesReturnCount: '', deliveryChalanCount: '', logoFileName: '', signatureFileName: "",
	})

	const fileUpload = async (e, field) => {
		const validatefile = await checkfile(e.target.files[0], ["jpg", "png", 'jpeg'], 1);
		if (typeof (validatefile) !== "boolean") {
			return toast(validatefile, 'warning');
		}

		if (field === "invoiceLogo") {
			const reader = new FileReader();
			reader.readAsDataURL(e.target.files[0]);
			reader.onload = () => {
				setCompanyData({ ...companyData, invoiceLogo: reader.result, logoFileName: e.target.files[0].name });
			}
			// setCompanyData({ ...companyData, invoiceLogo: e.target.files[0] });
		}

		else if (field === "signutre") {
			const reader = new FileReader();
			reader.readAsDataURL(e.target.files[0]);
			reader.onload = () => {
				setCompanyData({ ...companyData, signature: reader.result, signatureFileName: e.target.files[0].name });
			}
			// setCompanyData({ ...companyData, signature: e.target.files[0] });
		}
	}



	const removeUpload = (field) => {
		if (field === "logoFileName") {
			setCompanyData({ ...companyData, logoFileName: "", invoiceLogo: "" });
		} else if (field === "signatureFileName") {
			setCompanyData({ ...companyData, signatureFileName: "", signature: "" });
		}
	}


	const saveCompany = async () => {
		const validations = [
			{ field: companyData.name, msg: "Company name is required" },
			{ field: companyData.address, msg: "Address is required" },
			{ field: companyData.phone, msg: "Phone number is required" },
			{ field: companyData.email, msg: "Email is required" },
			{ field: companyData.gst, msg: "GST number is required" },
			{ field: companyData.pan, msg: "PAN number is required" },
			{ field: companyData.state, msg: "State is required" },
			{ field: companyData.country, msg: "Country is required" },
		];

		for (const item of validations) {
			if (!item.field || item.field.trim() === "") {
				return toast(item.msg, "error");
			}
		}

		try {
			setLoading(true);
			// const formData = new FormData();
			// Object.keys(companyData).forEach((elm, _) => {
			//   formData.append(elm, companyData[elm])
			// })
			// formData.append("token", Cookies.get("token"))

			const data = { ...companyData, token: Cookies.get("token") };


			const url = process.env.REACT_APP_API_URL + "/company/add";
			const req = await fetch(url, {
				method: 'POST',
				body: JSON.stringify(data),
				headers: {
					"Content-Type": 'application/json'
				}
			});
			const res = await req.json();
			if (req.status !== 200) {
				return toast(res.err, "error")
			}

			dispatch(addCompany(res));
			toast("Company create successfully", 'success')
			switchCompany(res._id);
			return;

		} catch (error) {
			console.log(error)
			return toast("something went wrong", 'error')
		} finally {
			setLoading(false);
		}

	}


	const switchCompany = async (id) => {
		try {
			const token = Cookies.get("token");
			const url = process.env.REACT_APP_API_URL + "/company/switch-company";
			const req = await fetch(url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({ token, companyId: id })
			})
			const res = await req.json();

			if (req.status !== 200 || !res.msg) {
				return toast(res.err, 'error');
			}

			toast(res.msg, 'success');
			document.location = "/admin/dashboard";

		} catch (error) {
			console.log(error);
			return toast("Something went wrong", 'error')
		}

	}



	return (
		<>
			<Nav title={"Add Company"} />
			<main id='main'>
				<SideNav />
				<div className='content__body'>
					<div className="content__body__main mb-2">
						<p className='font-bold'>Company Creation</p>
						<hr />
						<div className='flex flex-col gap-2'>
							<div className='forms grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-5'>
								{/* first col */}
								<div className='flex flex-col gap-2'>
									<div>
										<p>Company Name</p>
										<input type="text"
											onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
											value={companyData.name}
										/>
									</div>
									<div>
										<p>Company Phone</p>
										<input type="text" onChange={(e) => setCompanyData({ ...companyData, phone: e.target.value })}
											value={companyData.phone} />
									</div>
									<div>
										<p>Company Email</p>
										<input type="text" onChange={(e) => setCompanyData({ ...companyData, email: e.target.value })}
											value={companyData.email} />
									</div>
									<div>
										<p>GST</p>
										<input type="text" onChange={(e) => setCompanyData({ ...companyData, gst: e.target.value })}
											value={companyData.gst} />
									</div>
									<div>
										<p>PAN</p>
										<input type="text" onChange={(e) => setCompanyData({ ...companyData, pan: e.target.value })}
											value={companyData.pan} />
									</div>
								</div>
								{/* Second col */}
								<div className='flex flex-col gap-2'>
									<div>
										<p>
											Bill/Invoice Logo
											<span className='text-[10px] ml-2'>
												Only JPG, PNG and JPEG file supported,
											</span>
											<span className='text-[10px] ml-2'>
												Maximum file size 1MB
											</span>
										</p>
										<div className='file__uploader__div'>
											<span className='file__name'>{companyData.logoFileName}</span>
											<div className="flex gap-2">
												<input type="file" id="invoiceLogo" className='hidden' onChange={(e) => fileUpload(e, 'invoiceLogo')} />
												<label htmlFor="invoiceLogo" className='file__upload' title='Upload'>
													<MdUploadFile />
												</label>
												{
													companyData.logoFileName && <LuFileX2 className='remove__upload ' title='Remove upload'
														onClick={() => removeUpload('logoFileName')} />
												}
											</div>
										</div>
									</div>
									<div>
										<p>
											Authority Signature
											<span className='text-[10px] ml-2'>
												Only JPG, PNG and JPEG file supported,
											</span>
											<span className='text-[10px] ml-2'>
												Maximum file size 1MB
											</span>
										</p>
										<div className='file__uploader__div'>
											<span className='file__name'>{companyData.signatureFileName}</span>
											<div className="flex gap-2">
												<input type="file" id="signutre" className='hidden' onChange={(e) => fileUpload(e, 'signutre')} />
												<label htmlFor="signutre" className='file__upload' title='Upload'>
													<MdUploadFile />
												</label>
												{
													companyData.signatureFileName && <LuFileX2 className='remove__upload' title='Remove upload'
														onClick={() => removeUpload('signatureFileName')} />
												}
											</div>
										</div>
									</div>
									<div>
										<p>Company Address</p>
										<textarea rows={1}
											value={companyData.address}
											onChange={(e) => setCompanyData({ ...companyData, address: e.target.value })}
										></textarea>
									</div>
									<div>
										<p>Select Country</p>
										<SelectPicker className='w-full' data={countryList}
											value={companyData.country} onChange={(v) => setCompanyData({ ...companyData, country: v })} />
									</div>
									<div>
										<p>Select State</p>
										<SelectPicker className='w-full' data={statesAndUTs}
											value={companyData.state} onChange={(v) => setCompanyData({ ...companyData, state: v })} />
									</div>
								</div>
							</div>

							<div className='overflow-x-auto'>
								<table className='table-style w-full'>
									<thead className='bg-gray-200 h-[30px]'>
										<tr>
											<th>PO Initial</th>
											<th>Invoice Initial</th>
											<th>Proforma Initial</th>
											<th>Quotation Initial</th>
											<th>Credit Note Initial</th>
											<th>Sales Return Initial</th>
											<th>Deliver Chalan Initial</th>
										</tr>
									</thead>
									<tbody>
										<tr>
											<td className='min-w-[150px]'>
												<input type="text" onChange={(e) => setCompanyData({ ...companyData, poInitial: e.target.value })}
													value={companyData.poInitial} />
											</td>
											<td className='min-w-[150px]'>
												<input type="text" onChange={(e) => setCompanyData({ ...companyData, invoiceInitial: e.target.value })}
													value={companyData.invoiceInitial} />
											</td>
											<td className='min-w-[150px]'>
												<input type="text" onChange={(e) => setCompanyData({ ...companyData, proformaInitial: e.target.value })}
													value={companyData.proformaInitial} />
											</td>
											<td className='min-w-[150px]'>
												<input type="text" onChange={(e) => setCompanyData({ ...companyData, quotationInitial: e.target.value })}
													value={companyData.quotationInitial} />
											</td>
											<td className='min-w-[150px]'>
												<input type="text" onChange={(e) => setCompanyData({ ...companyData, creditNoteInitial: e.target.value })}
													value={companyData.creditNoteInitial} />
											</td>
											<td className='min-w-[150px]'>
												<input type="text" onChange={(e) => setCompanyData({ ...companyData, salesReturnInitial: e.target.value })}
													value={companyData.salesReturnInitial} />
											</td>
											<td className='min-w-[150px]'>
												<input type="text" onChange={(e) => setCompanyData({ ...companyData, deliverChalanInitial: e.target.value })}
													value={companyData.deliverChalanInitial} />
											</td>
										</tr>
									</tbody>
									<tfoot>
										<tr className='bg-gray-200 h-[30px]'>
											<th>Next Count</th>
											<th>Next Count</th>
											<th>Next Count</th>
											<th>Next Count</th>
											<th>Next Count</th>
											<th>Next Count</th>
											<th>Next Count</th>
										</tr>
										<tr>
											<td className='min-w-[150px]'>
												<input type="text"
													onChange={(e) => setCompanyData({ ...companyData, poNextCount: checkNumber(e.target.value) })}
													value={companyData.poNextCount}
												/>
											</td>
											<td className='min-w-[150px]'>
												<input type="text"
													onChange={(e) => setCompanyData({ ...companyData, invoiceNextCount: checkNumber(e.target.value) })}
													value={companyData.invoiceNextCount}
												/>
											</td>
											<td className='min-w-[150px]'>
												<input type="text"
													onChange={(e) => setCompanyData({ ...companyData, proformaNextCount: checkNumber(e.target.value) })}
													value={companyData.proformaNextCount}
												/>
											</td>
											<td className='min-w-[150px]'>
												<input type="text"
													onChange={(e) => setCompanyData({ ...companyData, quotationCount: checkNumber(e.target.value) })}
													value={companyData.quotationCount}
												/>
											</td>
											<td className='min-w-[150px]'>
												<input type="text"
													onChange={(e) => setCompanyData({ ...companyData, creditNoteCount: checkNumber(e.target.value) })}
													value={companyData.creditNoteCount}
												/>
											</td>
											<td className='min-w-[150px]'>
												<input type="text"
													onChange={(e) => setCompanyData({ ...companyData, salesReturnCount: checkNumber(e.target.value) })}
													value={companyData.salesReturnCount}
												/>
											</td>
											<td className='min-w-[150px]'>
												<input type="text"
													onChange={(e) => setCompanyData({ ...companyData, deliveryChalanCount: checkNumber(e.target.value) })}
													value={companyData.deliveryChalanCount}
												/>
											</td>
										</tr>
									</tfoot>
								</table>
							</div>
							{/* <div className="w-full flex flex-col lg:flex-row gap-2 lg:gap-5">
								<div className='w-full'>
									<p>Sales Invoice Reminder (Days Before)</p>
									<input type="text" onChange={(e) => setCompanyData({ ...companyData, salesReminder: e.target.value })}
										value={companyData.salesReminder} />
								</div>
								<div className='w-full'>
									<p>Purchase Invoice Reminder (Days Before)</p>
									<input type="text" onChange={(e) => setCompanyData({ ...companyData, purchaseReminder: e.target.value })}
										value={companyData.purchaseReminder} />
								</div>
							</div> */}
							<div className='w-full flex justify-center gap-3 my-3'>
								<button
									onClick={loading ? null : saveCompany}
									className='add-bill-btn'>
									{loading ? <Loading /> : <Icons.CHECK />}
									Update
								</button>
								<button className='reset-bill-btn'>
									<Icons.RESET />
									Reset
								</button>
							</div>
						</div>
					</div>
				</div>
			</main>
		</>
	)
}

export default AddCompany