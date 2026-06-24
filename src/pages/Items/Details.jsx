import React, { useEffect, useState } from 'react';
import Nav from '../../components/Nav';
import SideNav from '../../components/SideNav';
import { Icons } from '../../helper/icons';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import useApi from '../../hooks/useApi';
import { toggleBarCodeModal } from '../../store/barcodeModalSlice';
import { useDispatch } from 'react-redux';
import BarCodeModal from '../../components/BarCodeModal';


const Details = () => {
	const { id } = useParams();
	const dispatch = useDispatch();
	const [data, setData] = useState();
	const { getApiData } = useApi();
	const [tax, setTax] = useState();
	const navigate = useNavigate();
	const location = useLocation();


	useEffect(() => {
		(async () => {
			const item = await getApiData("item", id);
			const tax = await getApiData("tax", item?.data?.tax);

			setTax(tax.data.title);
			setData(item.data);
		})()
	}, [])



	return (
		<>
			<Nav title={"Item Details"} />
			<BarCodeModal data={data} />
			<main id='main'>
				<SideNav />

				<div className="content__body">
					<div className='content__body__main'>
						<div className='details__header'>
							<p><Icons.INVOICE /> General Details</p>
							<Icons.PENCIL
								onClick={() => navigate(`/admin/item/edit/${id}`)}
								className='pencil' />
						</div>
						<hr />

						<div className='flex flex-col md:flex-row gap-2 pl-4'>
							<div className='flex flex-col text-xs w-full gap-5'>
								<div>
									<p className='text-gray-600 text-sm'>Item name</p>
									<p>{data?.title}</p>
								</div>
								<div>
									<p className='text-gray-600 text-sm'>GST Tax (%)</p>
									<p>{tax}</p>
								</div>
								<div>
									<p className='text-gray-600 text-sm'>Sale Price</p>
									<p>
										{data?.salePrice || '--'}
										<sub>{data?.saleTaxType === '0' ? ' Without Tax' : ' With Tax'}</sub>
									</p>
								</div>
							</div>
							{/* First Column Close */}

							<div className='flex flex-col text-xs w-full gap-5'>
								<div>
									<p className='text-gray-600 text-sm'>Type</p>
									<p>{data?.type || "--"}</p>
								</div>
								<div>
									<p className='text-gray-600 text-sm'>HSN</p>
									<p>{data?.hsn || "--"}</p>
								</div>
								<div>
									<p className='text-gray-600 text-sm'>Purchase Price</p>
									<p>
										{data?.purchasePrice || "--"}
										<sub>{data?.purchaseTaxType === '0' ? ' Without Tax' : ' With Tax'}</sub>
									</p>
								</div>
							</div>
							{/* Second Column Close */}

							<div className='flex flex-col text-xs w-full gap-5'>
								<div>
									<p className='text-gray-600 text-sm'>Category</p>
									<p>{data?.category?.title || "--"}</p>
								</div>
								<div>
									<p className='text-gray-600 text-sm'>Item Code</p>
									<p>{data?.itemCode || "--"}</p>
								</div>
								<div>
									{data?.itemCode && <button
										className='bg-blue-500 hover:bg-blue-600 uppercase px-3 py-1 rounded-full text-white text-xs'
										onClick={() => {
											dispatch(toggleBarCodeModal(true));
										}}
									>
										View Barcode
									</button>}
								</div>
							</div>
							{/* Last Column Close */}

						</div>
					</div>

				</div>
			</main>
		</>
	)
}

export default Details;
