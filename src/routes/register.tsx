import { useForm } from 'react-hook-form';
import {
	EVENT_ERROR_EMITTER,
	field_errors,
	field_patterns,
	modal_errors,
	toast_error_messages,
} from '../utils/constants';
import { useState } from 'react';
import { BackendError, RegisterFormSubmit } from '../utils/types';
import { login_user, register_user } from '../utils/functions/user';
import { parse_errors } from '../utils/functions/functions';
import { useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { Button, Card, Input, Link } from '@nextui-org/react';
import RevealPassIcon from '@mui/icons-material/Visibility';
import RevealPassIconOff from '@mui/icons-material/VisibilityOff';

function Register() {
	const {
		register,
		handleSubmit,
		watch,
		formState: { errors },
		setError,
	} = useForm<RegisterFormSubmit>({
		mode: 'onChange',
	});

	const [usernameErrorMessage, setUsernameErrorMessage] = useState<
		string | undefined
	>(undefined);
	const navigate = useNavigate();
	const [passwordVisible, setPasswordVisible] = useState(false);
	return (
		<main className="d-flex flex-column w-100 h-100 justify-content-center align-items-center">
			<Card className="w-100 py-5" style={{ maxWidth: '600px' }}>
				<form
					className="d-flex flex-column h-100 w-100 justify-content-center gap-1 p-4"
					onSubmit={handleSubmit(async (data: RegisterFormSubmit) => {
						try {
							await register_user({ ...data });
							const result = await login_user({
								username: data.username,
								password: data.password,
							});

							navigate('/');
						} catch (err: any) {
							const errors_obj: BackendError[] = err.errors;
							if (
								errors_obj.find(
									(error) => error.path === 'username',
								)
							)
								setError('username', {});
							else
								EVENT_ERROR_EMITTER.emit(
									'add-error',
									toast_error_messages.register_error,
								);
						}
					})}
				>
					<Input
						type="text"
						isInvalid={!!errors.name}
						label="Nome"
						errorMessage={
							field_errors.invalid_firstname_and_lastname
						}
						{...register('name', {
							pattern: field_patterns.name,
						})}
					/>
					<Input
						type="text"
						isInvalid={!!errors.username}
						label="Nome de usuário"
						errorMessage={field_errors.username_exists}
						{...register('username', {
							pattern: field_patterns.username,
						})}
					/>
					<Input
						isInvalid={!!errors.password}
						label="Senha"
						type={passwordVisible ? 'text' : 'password'}
						endContent={
							<button
								className="focus:outline-none"
								type="button"
								onClick={() =>
									setPasswordVisible(!passwordVisible)
								}
								aria-label="toggle password visibility"
							>
								{passwordVisible ? (
									<RevealPassIcon className="text-2xl text-default-400 pointer-events-none" />
								) : (
									<RevealPassIconOff className="text-2xl text-default-400 pointer-events-none" />
								)}
							</button>
						}
						errorMessage={field_errors.invalid_password}
						{...register('password', {
							pattern: field_patterns.username,
						})}
					/>
					<Input
						type={passwordVisible ? 'text' : 'password'}
						isInvalid={!!errors.confirm_password}
						label="Confirmar Senha"
						errorMessage={field_errors.password_mismatch}
						{...register('confirm_password', {
							validate: (val) => {
								if (watch('password') != val) {
									return field_errors.password_mismatch;
								}
							},
						})}
						endContent={
							<button
								className="focus:outline-none"
								type="button"
								onClick={() =>
									setPasswordVisible(!passwordVisible)
								}
								aria-label="toggle password visibility"
							>
								{passwordVisible ? (
									<RevealPassIcon className="text-2xl text-default-400 pointer-events-none" />
								) : (
									<RevealPassIconOff className="text-2xl text-default-400 pointer-events-none" />
								)}
							</button>
						}
					/>
					<Link href="/login" className="align-self-end text-[16px]">
						já possui uma conta? Entre já!
					</Link>
					<Button className="mt-3" color="primary" type="submit">
						Registrar-se
					</Button>
				</form>
			</Card>
		</main>
	);
}

export default Register;
