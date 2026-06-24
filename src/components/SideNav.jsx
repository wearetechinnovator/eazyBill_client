import React, { act, useEffect, useState } from 'react'
import { PiComputerTowerThin } from "react-icons/pi";
import { FaUsers } from "react-icons/fa";
import { TbUsersGroup } from "react-icons/tb";
import { Link } from 'react-router-dom';
import { Tooltip } from 'react-tooltip';
import { useSelector } from 'react-redux';
import { Icons } from '../helper/icons.js'


const salesPath = [
	"/admin/quotation-estimate",
	"/admin/quotation-estimate/add",
	"/admin/quotation-estimate/edit",
	"/admin/proforma-invoice",
	"/admin/proforma-invoice/add",
	"/admin/proforma-invoice/edit",
	"/admin/sales-invoice",
	"/admin/sales-invoice/add",
	"/admin/sales-invoice/edit",
	"/admin/sales-return",
	"/admin/sales-return/add",
	"/admin/sales-return/edit",
	"/admin/payment-in",
	"/admin/payment-in/add",
	"/admin/payment-in/edit",
	"/admin/credit-note",
	"/admin/credit-note/add",
	"/admin/credit-note/edit",
	"/admin/delivery-chalan",
	"/admin/delivery-chalan/add",
	"/admin/delivery-chalan/edit",
];
const purshasePath = [
	"/admin/purchase-order",
	"/admin/purchase-order/add",
	"/admin/purchase-order/edit",
	"/admin/purchase-invoice",
	"/admin/purchase-invoice/add",
	"/admin/purchase-invoice/edit",
	"/admin/purchase-return",
	"/admin/purchase-return/add",
	"/admin/purchase-return/edit",
	"/admin/payment-out",
	"/admin/payment-out/add",
	"/admin/payment-out/edit",
	"/admin/debit-note",
	"/admin/debit-note/add",
	"/admin/debit-note/edit",
]
const links = {
	"main": [
		{ name: 'Dashboard', icon: <Icons.USER2 />, link: '/admin/dashboard', submenu: null },
		{ name: 'Party', icon: <FaUsers />, link: '/admin/party', submenu: null },
		{ name: 'Item', icon: <Icons.ITEMS />, link: '/admin/item', submenu: null },
		{ name: 'Enquiry', icon: <Icons.ENQUIRY />, link: '/admin/enquiry', submenu: null },
	],

	"sales": [
		{ name: 'Quotation / Estimate', icon: <Icons.SMAEICON />, link: '/admin/quotation-estimate', submenu: null },
		{ name: 'Proforma Invoice', icon: <Icons.SMAEICON />, link: '/admin/proforma-invoice', submenu: null },
		{ name: 'Sales Invoice', icon: <Icons.SMAEICON />, link: '/admin/sales-invoice', submenu: null },
		{ name: 'Sales Return', icon: <Icons.SMAEICON />, link: '/admin/sales-return', submenu: null },
		{ name: 'Payment In', icon: <Icons.SMAEICON />, link: '/admin/payment-in', submenu: null },
		{ name: 'Credit Note', icon: <Icons.SMAEICON />, link: '/admin/credit-note', submenu: null },
		{ name: 'Delivery Challan', icon: <Icons.SMAEICON />, link: '/admin/delivery-chalan', submenu: null },
	],
	"purchase": [
		{ name: 'Purchase Order', icon: <Icons.SMAEICON />, link: '/admin/purchase-order', submenu: null },
		{ name: 'Purchase Invoice', icon: <Icons.SMAEICON />, link: '/admin/purchase-invoice', submenu: null },
		{ name: 'Purchase Return', icon: <Icons.SMAEICON />, link: '/admin/purchase-return', submenu: null },
		{ name: 'Payment Out', icon: <Icons.SMAEICON />, link: '/admin/payment-out', submenu: null },
		{ name: 'Debit Note', icon: <Icons.SMAEICON />, link: '/admin/debit-note', submenu: null },
	],
	"accounting": [
		{ name: 'Accounts', icon: <Icons.ACCOUNT />, link: '/admin/account', submenu: null },
		{ name: 'Other Transactions', icon: <Icons.OTHERTRANSACTION />, link: '/admin/other-transaction', submenu: null },
	],
	"report": [
		{ name: 'Day Book', icon: <Icons.BOOK />, link: '/report/daybook' },
		{ name: 'Party Statement', icon: <Icons.BOOK />, link: '/report/party-statement' },
	],
	"office": [
		{ name: 'Staff Attendance', icon: <Icons.PRESENT />, link: '/admin/staff-attendance', submenu: null },
	],
	"setup": [
		{ name: 'Site/Business Settings', icon: <Icons.SETTING />, link: '/admin/site', submenu: null },
		// { name: 'User Management', icon: <TbUsersGroup />, link: '/admin/dashboard', submenu: null },
		{ name: 'Unit', icon: <Icons.UNITS />, link: '/admin/unit', submenu: null },
		{ name: 'Tax', icon: <PiComputerTowerThin />, link: '/admin/tax', submenu: null },
		{ name: 'Item Category', icon: <Icons.CATEGORY />, link: '/admin/item-category', submenu: null },
	]
};
const SideNav = () => {
	const userData = useSelector((store) => store.userDetail)
	const activePath = window.location.pathname;
	const [salesOpen, setSalesOpen] = useState(true);
	const [purchaseOpen, setPurchaseOpen] = useState(true);


	// Open Menu Dropdown;
	useEffect(() => {
		if (salesPath.includes(activePath)) {
			setSalesOpen(true);
		} else if (purshasePath.includes(activePath)) {
			setPurchaseOpen(true);
		}
	}, [activePath])


	return (
		<aside
			className='side__nav min-w-[175px] h-[calc(100vh-50px)] bg-[#003e32] text-white'
			id='sideBar'
		>
			<div className="side__nav__logo flex justify-center items-center" />

			<div className="side__nav__links pb-3">

				{/* Main Menu */}
				<div className="side__nav__link__group">
					<ul>
						{links.main.map((link, index) => (
							<Link key={index} to={link.link} data-tooltip-id="sideBarItemToolTip">
								<li className={`flex items-center ${link.link === activePath ? 'active__link' : ''}`}>
									<span className='mr-3'>{link.icon}</span>
									<span>{link.name}</span>
								</li>
							</Link>
						))}
					</ul>
				</div>

				{/* Sales */}
				<div className="side__nav__link__group">
					<h3
						onClick={() => setSalesOpen(!salesOpen)}
						className='text-[16px] my-3 flex items-center justify-between cursor-pointer'
					>
						Sales
						<span className='mr-1'>
							{salesOpen
								? <Icons.MENU_DOWN_ARROW className='text-[14px]' />
								: <Icons.MENU_UP_ARROW className='text-[14px]' />}
						</span>
					</h3>

					{salesOpen && (
						<ul className='bg-slate-700'>
							{links.sales.map((link, index) => (
								<Link key={index} to={link.link} data-tooltip-id="sideBarItemToolTip">
									<li className={`flex items-center ${activePath.includes(link.link) ? 'active__link' : ''}`}>
										<span className='mr-3'>{link.icon}</span>
										<span>{link.name}</span>
									</li>
								</Link>
							))}
						</ul>
					)}
				</div>

				{/* Purchase */}
				<div className="side__nav__link__group">
					<h3
						onClick={() => setPurchaseOpen(!purchaseOpen)}
						className='text-[16px] my-3 flex items-center justify-between cursor-pointer'
					>
						Purchase
						<span className='mr-1'>
							{purchaseOpen
								? <Icons.MENU_DOWN_ARROW className='text-[14px]' />
								: <Icons.MENU_UP_ARROW className='text-[14px]' />}
						</span>
					</h3>

					{purchaseOpen && (
						<ul className='bg-slate-700'>
							{links.purchase.map((link, index) => (
								<Link key={index} to={link.link} data-tooltip-id="sideBarItemToolTip">
									<li className={`flex items-center ${activePath.includes(link.link) ? 'active__link' : ''}`}>
										<span className='mr-3'>{link.icon}</span>
										<span>{link.name}</span>
									</li>
								</Link>
							))}
						</ul>
					)}
				</div>

				{/* Accounting */}
				<div className="side__nav__link__group">
					<h3 className='text-[16px] my-5'>Accounting</h3>

					<ul>
						{links.accounting.map((link, index) => (
							<Link key={index} to={link.link} data-tooltip-id="sideBarItemToolTip">
								<li className={`flex items-center ${activePath.includes(link.link) ? 'active__link' : ''}`}>
									<span className='mr-3'>{link.icon}</span>
									<span>{link.name}</span>
								</li>
							</Link>
						))}
					</ul>
				</div>

				{/* Office */}
				<div className="side__nav__link__group">
					<h3 className='text-[16px] my-5'>Office</h3>

					<ul>
						{links.office.map((link, index) => (
							<Link key={index} to={link.link} data-tooltip-id="sideBarItemToolTip">
								<li className={`flex items-center ${activePath.includes(link.link) ? 'active__link' : ''}`}>
									<span className='mr-3'>{link.icon}</span>
									<span>{link.name}</span>
								</li>
							</Link>
						))}
					</ul>
				</div>

				{/* Report */}
				<div className="side__nav__link__group">
					<h3 className='text-[16px] my-5'>Report</h3>

					<ul>
						{links.report.map((link, index) => (
							<Link key={index} to={link.link} data-tooltip-id="sideBarItemToolTip">
								<li className={`flex items-center ${activePath.includes(link.link) ? 'active__link' : ''}`}>
									<span className='mr-3'>{link.icon}</span>
									<span>{link.name}</span>
								</li>
							</Link>
						))}
					</ul>
				</div>

				{/* Setup */}
				<div className="side__nav__link__group">
					<h3 className='text-[16px] my-5'>Setup</h3>

					<ul>
						{links.setup.map((link, index) => (
							<Link key={index} to={link.link} data-tooltip-id="sideBarItemToolTip">
								<li className={`flex items-center ${activePath.includes(link.link) ? 'active__link' : ''}`}>
									<span className='mr-3'>{link.icon}</span>
									<span>{link.name}</span>
								</li>
							</Link>
						))}
					</ul>
				</div>

			</div>

			<Tooltip id='sideBarItemToolTip' className='z-50' />
		</aside>
	);
}

export default SideNav;