import { useEffect, useRef, useState } from 'react';
import { IoAddCircleSharp, IoClose } from "react-icons/io5";
import useMyToaster from '../hooks/useMyToaster';
import Cookies from 'js-cookie';
import { IoIosSearch } from "react-icons/io";
import { useDispatch, useSelector } from 'react-redux';
import AddPartyModal from './AddPartyModal';
import { FaArrowRight } from "react-icons/fa6";
import { Drawer } from 'rsuite';
import { PartyComponent } from '../pages/Party/AddParty';
import { AddItemComponent } from '../pages/Items/ItemAdd';
import { CategoryComponent } from '../pages/Item/CategoryAdd';
import { toggle } from '../store/partyModalSlice';
import { Constants } from '../helper/constants';



const MySelect2 = ({ model, onType, value, partyType }) => {
	const dispatch = useDispatch()
	const toast = useMyToaster();
	const [selectedValue, setSelectedValue] = useState('');
	const [selectedData, setSelectedData] = useState()
	const [showDropDown, setShowDropDown] = useState(false);
	const [searchText, setSearchText] = useState('');
	const [searchList, setSearchList] = useState([]);
	const getPartyModalState = useSelector((store) => store.partyModalSlice.show);
	const [partyDrawer, setPartyDrawer] = useState(false);
	const [itemDrawer, setItemDrawer] = useState(false);
	const [categoryDrawer, setCategoryDrawer] = useState(false);
	const debounceTime = useRef(null);
	const [loading, setLoading] = useState(false);


	useEffect(() => {
		if (selectedData) {
			setSelectedValue(selectedData.title || selectedData.name);
			setSearchText("");
			onType(selectedData._id);
		}

	}, [selectedData])



	// if alredy value define
	const get = async (value) => {
		try {
			const url = process.env.REACT_APP_API_URL + `/${model}/get`;
			const req = await fetch(url, {
				method: "POST",
				headers: {
					"Content-Type": 'application/json'
				},
				body: JSON.stringify({ token: Cookies.get("token"), id: value })
			})
			const res = await req.json();

			setSelectedData(res.data || res)

		} catch (error) {
			return toast("Something went wrong", 'error')
		}
	}

	useEffect(() => {
		if (value) {
			get(value);
		}
	}, [value])



	// Search data
	const searchData = (v) => {
		// Check debounce time
		if (debounceTime.current) {
			clearTimeout(debounceTime.current);
		}

		setLoading(true);
		debounceTime.current = setTimeout(async () => {
			try {
				const url = process.env.REACT_APP_API_URL + `/${model}/get`;
				const payload = {
					token: Cookies.get("token"),
					search: true,
					searchText: v
				};

				const req = await fetch(url, {
					method: "POST",
					headers: {
						"Content-Type": 'application/json'
					},
					body: JSON.stringify(payload)
				})
				const res = await req.json();
				setLoading(false);

				if (req.status === 200) {
					if (model === "partycategory") {
						res.length > 0 ? setSearchList([...res]) : setSearchList(["No result found"]);
						return;
					}

					res.data.length > 0 ? setSearchList([...res.data]) : setSearchList(["No result found"]);
				}
				else {
					setSearchList([])
				}

			} catch (er) {
				console.log('Someting went wrong', er);
			}

		}, 300);
	};


	const closeDrawer = (save) => {
		if (save) {
			model === "party" ?
				setPartyDrawer(false) : model === "item" ?
					setItemDrawer(false) : setCategoryDrawer(false);
		}
	}


	const getResForAutoSelect = (res) => {
		get(res._id);
	}


	return (
		<>
			<div className='relative'>
				{/* Party drawer */}
				<Drawer
					onClose={() => setPartyDrawer(false)}
					open={partyDrawer}
					size={"md"}
				>
					<Drawer.Header>
						<Drawer.Actions>
							<p className='text-lg font-bold'>Add Party</p>
						</Drawer.Actions>
					</Drawer.Header>
					<Drawer.Body>
						<PartyComponent save={closeDrawer} getRes={getResForAutoSelect} />
					</Drawer.Body>
				</Drawer>

				{/* Item Drawer */}
				<Drawer
					onClose={() => setItemDrawer(false)}
					open={itemDrawer}
					size={"md"}
				>
					<Drawer.Header>
						<Drawer.Actions>
							<p className='text-lg font-bold'>Add Item</p>
						</Drawer.Actions>
					</Drawer.Header>
					<Drawer.Body>
						<AddItemComponent save={closeDrawer} getRes={getResForAutoSelect} />
					</Drawer.Body>
				</Drawer>

				{/* Category Drawer */}
				<Drawer
					onClose={() => setCategoryDrawer(false)}
					open={categoryDrawer}
					size={"sm"}
				>
					<Drawer.Header>
						<Drawer.Actions>
							<p className='text-lg font-bold'>Add Category</p>
						</Drawer.Actions>
					</Drawer.Header>
					<Drawer.Body>
						<CategoryComponent save={closeDrawer} />
					</Drawer.Body>
				</Drawer>
				<AddPartyModal open={getPartyModalState} />

				<input
					type="text"
					className='w-full border rounded-[3px]'
					value={selectedValue ? selectedValue : searchText}
					onFocus={() => setShowDropDown(true)}
					onBlur={() => {
						setShowDropDown(false);
					}}
					onChange={(e) => {
						setSelectedValue(""); 
						setSearchText(e.target.value);
						searchData(e.target.value);
					}}
					placeholder={model === Constants.ITEM ? 'Search Item or Scan Barcode...' : 'Search...'}
				/>
				{selectedValue ?
					<IoClose
						className='absolute right-2 top-[5px] text-[16px] cursor-pointer text-gray-500'
						onClick={() => {
							setSelectedValue("")
							setSelectedData()
							setSearchText('')
							setSearchList([]);
							onType('');
						}}
					/> : <IoIosSearch className='absolute right-2 top-[5px] text-[16px] cursor-pointer' />}


				{/* List of Dropdown */}
				{showDropDown && <div
					className='w-full max-h-[250px] overflow-y-auto bg-white absolute z-[9999999] rounded mt-1'
					style={{ boxShadow: "0px 0px 5px lightgray" }}>
					<ul>
						{loading && <li className='p-2 text-center'>Searching...</li>}
						{
							searchList.map((d, i) => {
								return <li
									key={i}
									onMouseDown={() => setSelectedData(d)}
									className={`${model === "item" ? 'p-3 text-left' : 'p-1 px-2'}  cursor-pointer`}
								>
									{(d.title || d.name) || d}
								</li>
							})
						}
					</ul>
					<button
						onMouseDown={() => {
							switch (model) {
								case "party":
									setPartyDrawer(true);
									break;
								case "item":
									setItemDrawer(true);
									break;
								case "category":
									setCategoryDrawer(true);
									break;
								case "partycategory":
									dispatch(toggle(true));
									break;
							}
						}}
						className='select__add__button z-50'
					>
						<IoAddCircleSharp className='text-lg' />
						Add New
						<FaArrowRight className='text-[15px]' />
					</button>
				</div>}
			</div>
		</>
	)
}


export default MySelect2;