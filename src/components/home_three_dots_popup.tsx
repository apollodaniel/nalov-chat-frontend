import {
	Modal,
	ModalContent,
	Button,
	ModalBody,
	ModalHeader,
} from '@nextui-org/react';
import '../../node_modules/bootstrap/dist/css/bootstrap.min.css';
import { useState } from 'react';
import { confirmation_modals, more_actions_modal } from '../utils/constants';
import ConfirmationPopup from './confirmation_popup';
import { logout_user } from '../utils/functions/user';
import { NavigateFunction } from 'react-router-dom';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import SettingsIcon from '@mui/icons-material/Settings';

interface IProps {
	show: boolean;
	onCancel: () => void;
	navigate: NavigateFunction;
}

function HomeTreeDotsPopup({ show, navigate, onCancel }: IProps) {
	const [logoutPopupVisible, setLogoutPopupVisible] = useState(false);

	return (
		<div>
			<Modal
				isOpen={show}
				backdrop="blur"
				isDismissable
				size="sm"
				onClose={onCancel}
			>
				<ModalContent>
					<ModalHeader>
						<h2>Mais opções</h2>
					</ModalHeader>
					<ModalBody className="flex flex-col items-center justify-center gap-2 ">
						<Button
							className="flex flex-row gap-2 items-center justify-center w-100"
							variant="flat"
							color="default"
							onClick={() => navigate('/config')}
						>
							{more_actions_modal.content.open_config_button}{' '}
							<SettingsIcon />
						</Button>
						<Button
							className="flex flex-row gap-2 items-center justify-center w-100"
							onClick={() => {
								setLogoutPopupVisible(true);
							}}
							variant="flat"
							color="danger"
						>
							{more_actions_modal.content.logout_button}
							<ExitToAppIcon />
						</Button>
					</ModalBody>
				</ModalContent>
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
