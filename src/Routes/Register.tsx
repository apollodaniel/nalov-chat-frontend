import { useForm } from 'react-hook-form';
import {
	AllErrors,
	EVENT_ERROR_EMITTER,
	FIELD_PATTERNS,
} from '../Utils/Constants';
import { useState } from 'react';
import { ErrorEntry, RegisterFormSubmit } from '../Utils/Types';
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
							await loginUser({
								username: data.username,
								password: data.password,
							});

							navigate('/');
						} catch (response: any) {
							const errorsObj = response.errors;

							let containsUsername = errorsObj.find(
								(e: ErrorEntry) =>
									e.field?.includes('username') ||
									e.code.toLowerCase().includes('username'),
							);
							if (containsUsername)
								setError('username', {
									message:
										AllErrors[containsUsername.code].message
											.ptBr,
								});
							else
								errorsObj.forEach((err: ErrorEntry) =>
									EVENT_ERROR_EMITTER.emit(
										'add-error',
										AllErrors[err.code].message.ptBr,
									),
								);
						}
					})}
				>
					<Input
						type="text"
						isInvalid={!!errors.name}
						label="Nome"
						errorMessage={
							errors.name && errors.name.message
								? errors.name.message
								: AllErrors['INVALID_FULLNAME'].message.ptBr
						}
						{...register('name', {
							pattern: FIELD_PATTERNS.name,
						})}
					/>
					<Input
						type="text"
						isInvalid={!!errors.username}
						label="Nome de usuário"
						errorMessage={
							errors.username && errors.username.message
								? errors.username.message
								: AllErrors['INVALID_USERNAME'].message.ptBr
						}
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
						errorMessage={
							errors.password && errors.password.message
								? errors.password.message
								: AllErrors['INVALID_PASSWORD'].message.ptBr
						}
						{...register('password', {
							pattern: FIELD_PATTERNS.password,
							onChange: () => trigger('confirmPassword'),
						})}
					/>
					<Input
						type={passwordVisible ? 'text' : 'password'}
						isInvalid={!!errors.confirmPassword}
						label="Confirmar Senha"
						errorMessage={
							errors.confirmPassword &&
							errors.confirmPassword.message
								? errors.confirmPassword.message
								: AllErrors['PASSWORD_MISMATCH'].message.ptBr
						}
						{...register('confirmPassword', {
							validate: (val) => {
								if (watch('password') != val) {
									return AllErrors['PASSWORD_MISMATCH']
										.message.ptBr;
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
