import React, { useEffect } from 'react';
import Nav from '../../components/Nav';
import SideNav from '../../components/SideNav';
import { Icons } from '../../helper/icons';
import Profile from './Profile';
import Logs from './Logs';
import Ladger from './Ladger';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Contacts from './Contacts';
import { Constants } from '../../helper/constants';

const Details = () => {
	const { id } = useParams();
	const location = useLocation();
	const navigate = useNavigate();
	const query = new URLSearchParams(location.search);
	const tab = query.get("tab") || Constants.PROFILE;

	// Update URL when tab button is clicked
	const handleTabClick = (tabName) => {
		navigate(`?tab=${tabName.toLowerCase()}`);
	};

	const renderTabContent = () => {
		if (tab === Constants.PROFILE) {
			return <Profile />;
		} else if (tab === Constants.LADGER) {
			return <Ladger partyId={id} />;
		} else if (tab === Constants.CONTACT) {
			return <Contacts partyId={id} />;
		}
	};

	return (
		<>
			<Nav title={"Party Details"} />
			<main id='main'>
				<SideNav />
				<div className="content__body">
					<div className='party__details__header mb-1'>
						<button
							className={tab === Constants.PROFILE ? "active" : ""}
							onClick={() => handleTabClick(Constants.PROFILE)}
						>
							<Icons.USER /> Profile
						</button>
						<button
							className={tab === Constants.LADGER ? "active" : ""}
							onClick={() => handleTabClick(Constants.LADGER)}
						>
							<Icons.BOOK /> Ledger
						</button>
						<button
							className={tab === Constants.CONTACT ? "active" : ""}
							onClick={() => handleTabClick(Constants.CONTACT)}
						>
							<Icons.PARTY_CONTACT size={'20px'} /> Contacts
						</button>
					</div>

					{renderTabContent()}
				</div>
			</main>
		</>
	);
};

export default Details;
