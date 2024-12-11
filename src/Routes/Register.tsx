import { useForm } from 'react-hook-form';
import {
	EVENT_ERROR_EMITTER,
	FIELD_ERRORS,
	FIELD_PATTERNS,
	MODAL_ERRORS,
	TOAST_ERROR_MESSAGES,
} from '../Utils/Constants';
import { useState } from 'react';
import { BackendError, RegisterFormSubmit } from '../Utils/Types';
import { loginUser, registerUser } from '../Utils/Functions/User';
import { useNavigate } from 'react-router-dom';
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
		trigger,
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
							await registerUser({ ...data });
							const result = await loginUser({
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
									TOAST_ERROR_MESSAGES.REGISTER_ERROR,
								);
						}
					})}
				>
					<Input
						type="text"
						isInvalid={!!errors.name}
						label="Nome"
						errorMessage={FIELD_ERRORS.INVALID_FULLNAME}
						{...register('name', {
							pattern: FIELD_PATTERNS.name,
						})}
					/>
					<Input
						type="text"
						isInvalid={!!errors.username}
						label="Nome de usuário"
						errorMessage={FIELD_ERRORS.USERNAME_ALREADY_EXISTS}
						{...register('username', {
							pattern: FIELD_PATTERNS.username,
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
						errorMessage={FIELD_ERRORS.INVALID_PASSWORD}
						{...register('password', {
							pattern: FIELD_PATTERNS.password,
							onChange: () => trigger('confirmPassword'),
						})}
					/>
					<Input
						type={passwordVisible ? 'text' : 'password'}
						isInvalid={!!errors.confirmPassword}
						label="Confirmar Senha"
						errorMessage={FIELD_ERRORS.PASSWORD_MISMATCH}
						{...register('confirmPassword', {
							validate: (val) => {
								if (watch('password') != val) {
									return FIELD_ERRORS.PASSWORD_MISMATCH;
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
