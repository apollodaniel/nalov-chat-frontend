import {
	Modal,
	ModalContent,
	Button,
	ModalBody,
	ModalHeader,
} from '@nextui-org/react';
import '../../node_modules/bootstrap/dist/css/bootstrap.min.css';
import { useState } from 'react';
import { CONFIRMATION_MODALS, MORE_ACTIONS_MODAL } from '../Utils/Constants';
import ConfirmationPopup from './ConfirmationPopup';
import { logoutUser } from '../Utils/Functions/User';
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
				className="dark"
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
							{MORE_ACTIONS_MODAL.content.openConfigButton}{' '}
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
							{MORE_ACTIONS_MODAL.content.logoutButton}
							<ExitToAppIcon />
						</Button>
					</ModalBody>
				</ModalContent>
			</Modal>
			<ConfirmationPopup
				title={CONFIRMATION_MODALS.logout.title}
				content={CONFIRMATION_MODALS.logout.content}
				visible={logoutPopupVisible}
				onConfirm={async () => {
					setLogoutPopupVisible(false);
					await logoutUser();
				}}
				onCancel={() => setLogoutPopupVisible(false)}
			/>
		</div>
	);
}

export default HomeTreeDotsPopup;
