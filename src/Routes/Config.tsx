import { useEffect, useState } from 'react';
import '../../node_modules/bootstrap/dist/css/bootstrap.min.css';
import { deleteUser, getCurrentUser } from '../Utils/Functions/User';
import ConfirmationPopup from '../Components/ConfirmationPopup';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Button } from '@nextui-org/react';

function Config() {
	const [showDeleteAccountPopup, setShowDeleteAccountPopup] = useState(false);
	const navigate = useNavigate();

	return (
		<div className="m-3 my-4 lg:w-[600px] lg:*:*:text-medium max-lg:*:*-text-small max-md:*:text-2xl  max-lg:w-[50%] max-sm:w-[80%]">
			<Button
				className="flex items-center justify-center self-start mb-3 max-lg:mb-15 max-md:absolute max-md:top-[5vh]"
				style={{ height: '50px', width: '50px' }}
				onClick={() => navigate('/')}
				isIconOnly
				variant="ghost"
			>
				<ArrowBackIcon />
			</Button>
			<h1 className="text-3xl text-center mb-10 max-md:mb-5 ">
				Configurações
			</h1>
			<div className="flex flex-col gap-2 ">
				<Button
					key={'profile_config'}
					className="flex items-center p-6 max-md:p-4"
					onClick={() => {
						navigate('/config/profile');
					}}
					variant="flat"
				>
					Perfil
				</Button>

				<Button
					key={'delete_account'}
					className="flex items-center p-6 max-md:p-4"
					onClick={() => setShowDeleteAccountPopup(true)}
					color="danger"
					variant="flat"
				>
					Apagar minha conta
				</Button>
			</div>

			<ConfirmationPopup
				visible={showDeleteAccountPopup}
				title="Aviso!"
				content="Você realmente deseja apagar sua conta? Essa é uma ação irreversivel e apagará todos os seus dados!"
				onCancel={() => setShowDeleteAccountPopup(false)}
				onConfirm={() =>
					deleteUser(() => setShowDeleteAccountPopup(false))
				}
			/>
		</div>
	);
}

export default Config;
