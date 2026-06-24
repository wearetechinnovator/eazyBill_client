import React, { useEffect, useState } from 'react'
import Nav from '../../components/Nav';
import SideNav from '../../components/SideNav';
import { SelectPicker } from 'rsuite';
import useMyToaster from '../../hooks/useMyToaster';
import useApi from '../../hooks/useApi';
import Cookies from 'js-cookie';
import { useNavigate, useParams } from 'react-router-dom';
import { Icons } from '../../helper/icons';
import { Constants } from '../../helper/constants';
import { checkNumber } from '../../helper/validation';
import TransactionCategoryManageModal from '../../components/TransactionCategoryManageModal';
import Loading from '../../components/Loading';



const TransactionAdd = ({ mode }) => {
	const toast = useMyToaster();
	const { id } = useParams();
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();
	const token = Cookies.get("token");
	const { getApiData } = useApi();
	const currentDate = new Date().toISOString().split("T")[0];
	const [formData, setFormData] = useState({
		transactionType: '', transactionNumber: '', transactionDate: currentDate,
		paymentMode: Constants.CASH, account: '', amount: '', note: '', category: ''
	})
	// Store account
	const [account, setAccount] = useState([]);
	const [categoryModal, setCategoryModal] = useState(false);
	const [categoryData, setCategoryData] = useState([]);




	//Set Transaction number;
	useEffect(() => {
		if (mode) return;
		(async () => {
			const url = process.env.REACT_APP_API_URL + "/other-transaction/get";
			const req = await fetch(url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({ token })
			});
			const res = await req.json();
			setFormData(p => ({ ...p, transactionNumber: res.totalData + 1 }))
		})();
	}, [])


	useEffect(() => {
		if (mode) {
			(async () => {
				const url = process.env.REACT_APP_API_URL + "/other-transaction/get";
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
					transactionDate: res.data.transactionDate.split("T")[0]
				});
			})()
		}
	}, [mode])


	// Get account data for select option
	useEffect(() => {
		const apiData = async () => {
			{
				const data = await getApiData("account");
				const account = data.data.map(d => ({ label: d.accountName, value: d._id }));
				setAccount([...account])
			}
			{
				const data = await getApiData("transaction-category");
				const category = data.data.map(d => ({ label: d.categoryName, value: d._id }));
				setCategoryData([...category])
			}
		}

		apiData();
	}, [categoryModal])


	const saveTransaction = async (e) => {
		if (formData.transactionType === "" || formData.transactionNumber === "" ||
			formData.transactionDate === "" || formData.paymentMode === "" || formData.amount === "")
			return toast("fill the required fields", "error");

		if (formData.paymentMode !== Constants.CASH && formData.account === "")
			return toast("Select the account", "error");


		try {
			setLoading(true);
			const url = `${process.env.REACT_APP_API_URL}/other-transaction/add`;
			const req = await fetch(url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify(!mode ?
					{ ...formData, token } :
					{ ...formData, token, update: true, id: id }
				)
			})
			const res = await req.json();
			if (req.status !== 200 || res.err) {
				return toast(res.err, 'error');
			}

			if (mode) {
				return toast('Transaction update successfully', 'success');
			}

			clearForm();

			toast('Transaction add successfully', 'success');
			navigate("/admin/other-transaction")
			return;

		} catch (error) {
			return toast('Something went wrong', 'error')
		} finally {
			setLoading(false);
		}

	}


	const clearForm = () => {
		setFormData({
			transactionType: '', transactionNumber: '', transactionDate: '',
			paymentMode: Constants.CASH, account: '', amount: '', note: '', category: ''
		})
	}


	return (
		<>
			<Nav title={mode ? "Edit Transactions" : "Add Transactions"} />
			<main id="main">
				<SideNav />
				<TransactionCategoryManageModal
					openModal={categoryModal}
					openStatus={() => { setCategoryModal(false) }}
				/>
				<div className='content__body '>
					<div className='content__body__main bg-white' >
						<div className='flex justify-between gap-4 flex-col lg:flex-row'>
							<div className='w-full'>
								<div>
									<p> Select Transaction Type <span className='required__text'>*</span></p>
									<select
										onChange={(e) => {
											setFormData({ ...formData, transactionType: e.target.value })
										}}
										value={formData.transactionType}
									>
										<option value="">Select</option>
										<option value="income">Income</option>
										<option value="expense">Expense</option>
									</select>
								</div>
								<div className='w-full'>
									<div className='flex items-center justify-between'>
										<p className='mt-2'>Category <span className='required__text'>*</span></p>
										<p className='text-[12px] text-white cursor-pointer bg-blue-400 px-1 rounded-sm'
											onClick={() => setCategoryModal(true)}
										>
											Add/Manage Category
										</p>
									</div>
									<SelectPicker
										className='w-full'
										onChange={(v) => setFormData({ ...formData, category: v })}
										data={categoryData}
										value={formData.category}
									/>
								</div>
								<div>
									<p className='mt-2'>Transaction Number</p>
									<input type='text'
										onChange={(e) => setFormData({ ...formData, transactionNumber: e.target.value })}
										disabled={true}
										value={formData.transactionNumber}
									/>
								</div>
								<div>
									<p className='mt-2'>Transaction Date <span className='required__text'>*</span></p>
									<input type='date' onChange={(e) => setFormData({ ...formData, transactionDate: e.target.value })}
										value={formData.transactionDate} />
								</div>
							</div>
							<div className='w-full'>
								<div className='w-full flex items-center gap-2'>
									<div className='w-full'>
										<p className='ml-1'>Payment Mode <span className='required__text'>*</span></p>
										<select
											onChange={(e) => {
												setFormData({ ...formData, paymentMode: e.target.value })
											}}
											value={formData.paymentMode}
										>
											<option value={Constants.CASH}>Cash</option>
											<option value={Constants.UPI}>UPI</option>
											<option value={Constants.CARD}>Card</option>
											<option value={Constants.NETBENKING}>Netbenking</option>
											<option value={Constants.BANK}>Bank</option>
											<option value={Constants.CHEQUE}>Cheque</option>
										</select>
									</div>
									{
										formData.paymentMode !== Constants.CASH && (
											<div className='w-full'>
												<p>Account</p>
												<SelectPicker className='w-full'
													onChange={(v) => setFormData({ ...formData, account: v })}
													data={account}
													value={formData.account}
												/>
											</div>
										)
									}
								</div>
								<div>
									<p className='mt-2'>Amount <span className='required__text'>*</span></p>
									<input type='text' onChange={(e) =>
										setFormData({ ...formData, amount: checkNumber(e.target.value) })}
										value={formData.amount} />
								</div>
								<div>
									<p className='mt-2'>Note</p>
									<textarea onChange={(e) =>
										setFormData({ ...formData, note: e.target.value })}
										value={formData.note}
									></textarea>
								</div>
							</div>
						</div>
						<div className='w-full flex justify-center gap-3 my-1 mt-5'>
							<button className='add-bill-btn'
								onClick={loading ? null : saveTransaction}
							>
								{loading ? <Loading /> : <Icons.CHECK />}
								{mode ? "Update" : "Save"}
							</button>
							<button className='reset-bill-btn' onClick={clearForm}>
								<Icons.RESET />
								Reset
							</button>
						</div>
					</div>
				</div>
			</main>
		</>
	)
}

export default TransactionAdd
