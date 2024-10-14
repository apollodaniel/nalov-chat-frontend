import { Modal } from 'react-bootstrap';
import '../../node_modules/bootstrap/dist/css/bootstrap.min.css';
import { useState } from 'react';
import { confirmation_modals, more_actions_modal } from '../utils/constants';
import ConfirmationPopup from './confirmation_popup';
import { logout_user } from '../utils/functions/user';
import { NavigateFunction } from 'react-router-dom';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import SettingsIcon from '@mui/icons-material/Settings';
import CloseIcon from '@mui/icons-material/Close';

interface IProps {
	show: boolean;
	onCancel: () => void;
	navigate: NavigateFunction;
}

function HomeTreeDotsPopup({ show, navigate, onCancel }: IProps) {
	const [logoutPopupVisible, setLogoutPopupVisible] = useState(false);

	return (
		<div>
			<Modal show={show} size="sm">
				<Modal.Body className="d-flex flex-column align-items-center justify-content-center gap-2">
					<button
						className="btn btn-close align-self-end mb-3"
						onClick={() => onCancel()}
					></button>
					<button
						className="btn btn-secondary d-flex flex-row gap-2 align-items-center justify-content-center w-100"
						onClick={() => navigate('/config')}
					>
						{more_actions_modal.content.open_config_button}{' '}
						<SettingsIcon />
					</button>
					<button
						className="btn btn-danger d-flex flex-row gap-2 align-items-center justify-content-center w-100"
						onClick={() => {
							setLogoutPopupVisible(true);
						}}
					>
						{more_actions_modal.content.logout_button}
						<ExitToAppIcon />
					</button>
				</Modal.Body>
			</Modal>
			<ConfirmationPopup
				title={confirmation_modals.logout.title}
				content={confirmation_modals.logout.content}
				visible={logoutPopupVisible}
				onConfirm={async () => {
					setLogoutPopupVisible(false);
					await logout_user();
				}}
				onCancel={() => setLogoutPopupVisible(false)}
			/>
		</div>
	);
}

export default HomeTreeDotsPopup;
