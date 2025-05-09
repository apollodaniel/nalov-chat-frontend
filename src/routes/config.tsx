import { useEffect, useState } from 'react';
import '~bootstrap/dist/css/bootstrap.min.css';
import { delete_user, get_current_user } from '../utils/functions/user';
import ConfirmationPopup from '../components/confirmation_popup';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

function Config() {
	const [showDeleteAccountPopup, setShowDeleteAccountPopup] = useState(false);
	const navigate = useNavigate();

	return (
		<div
			className="m-3 my-4"
			style={{ maxWidth: '800px', minWidth: '500px' }}
		>
			<button
				className="btn btn-dark d-flex align-items-center justify-content-center align-self-start"
				style={{ height: '50px', width: '50px' }}
				onClick={() => navigate('/')}
			>
				<ArrowBackIcon />
			</button>
			<h3 className="my-5 text-center mx-4">Configurações</h3>
			<ul className="list-group rounded-3 mx-3">
				<li
					className="list-group-item list-group-item-action d-flex align-items-center"
					style={{ height: '60px' }}
					onClick={() => {
						navigate('/config/profile');
					}}
				>
					Configurações do perfil
				</li>
				<li
					className="list-group-item list-group-item-danger list-group-item-action d-flex align-items-center"
					style={{ height: '60px' }}
					onClick={() => setShowDeleteAccountPopup(true)}
				>
					Apagar minha conta
				</li>
			</ul>

			<ConfirmationPopup
				visible={showDeleteAccountPopup}
				title="Aviso!"
				content="Você realmente deseja apagar sua conta? :/"
				onCancel={() => setShowDeleteAccountPopup(false)}
				onConfirm={() =>
					delete_user(() => setShowDeleteAccountPopup(false))
				}
			/>
		</div>
	);
}

export default Config;
